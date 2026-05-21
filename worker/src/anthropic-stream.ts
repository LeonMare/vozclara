/**
 * SSE re-streaming helpers for Anthropic Messages API.
 *
 * The wire format Anthropic returns on `stream: true` is a sequence of
 * Server-Sent Events. The events we care about for token-level UX and
 * usage accounting are:
 *
 *   event: message_start              → full message envelope, contains
 *                                       usage.input_tokens + the partial
 *                                       usage.output_tokens (always 1)
 *
 *   event: content_block_delta        → token-stream payload. delta.type
 *                                       is "text_delta" for the prose
 *                                       blocks we render; thinking +
 *                                       tool_use blocks have their own
 *                                       delta types we ignore for now.
 *
 *   event: message_delta              → end-of-stream marker with
 *                                       stop_reason + the final
 *                                       output_tokens count.
 *
 *   event: message_stop               → terminator, no useful payload.
 *
 *   event: ping                       → keep-alive, ignore.
 *
 *   event: error                      → Anthropic mid-stream failure;
 *                                       contains error.type + message.
 *
 * Two helpers exposed here:
 *
 *   • anthropicSSEResponse(source, options?)  — wraps the Anthropic
 *     ReadableStream in a Response with the spec-correct headers and
 *     (optionally) tees a parsed-events side-channel so the caller can
 *     log usage via `ctx.waitUntil(...)` without buffering the body.
 *
 *   • parseAnthropicStream(source)            — async generator that
 *     yields { type, data } objects for code paths that need direct
 *     event access (e.g. an MCP tool that wants to surface only the
 *     final text rather than relay tokens).
 *
 * Both helpers are explicit about back-pressure: the side-channel
 * parser reads from a `tee()`d branch, so a slow downstream consumer
 * never stalls Anthropic's stream — the parser side just buffers
 * lightly and discards events it has no use for.
 */

import type { AnthropicUsage } from './anthropic';

/** End-of-stream summary the side-channel parser produces. */
export interface AnthropicStreamSummary {
  /** Concatenated text from all text_delta events. */
  text: string;
  /** Echo of Anthropic's final usage block (input + output + cache fields). */
  usage: AnthropicUsage;
  /** Stop condition from message_delta — same vocab as non-streaming. */
  stopReason: string;
  /** Anthropic message id, captured from message_start. */
  id: string;
  /** Echo of the model that actually served the request. */
  model: string;
  /** True iff the stream ended cleanly (saw message_stop). */
  completed: boolean;
  /** Set if Anthropic emitted an `error` event mid-stream. */
  error?: { type: string; message: string };
}

/** Discriminated union for parsed events. The data shape mirrors Anthropic's payloads loosely. */
export type AnthropicStreamEvent =
  | { type: 'message_start'; data: { message?: RawMessageStart } }
  | { type: 'content_block_start'; data: { index: number; content_block?: { type: string } } }
  | { type: 'content_block_delta'; data: { index: number; delta?: { type: string; text?: string } } }
  | { type: 'content_block_stop'; data: { index: number } }
  | { type: 'message_delta'; data: { delta?: { stop_reason?: string }; usage?: { output_tokens?: number } } }
  | { type: 'message_stop'; data: Record<string, unknown> }
  | { type: 'ping'; data: Record<string, unknown> }
  | { type: 'error'; data: { error?: { type: string; message: string } } }
  | { type: string; data: unknown };

interface RawMessageStart {
  id?: string;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

/**
 * SSE response headers — match what every other streaming worker on
 * Cloudflare expects. CORS mirrors the rest of our routes (open in
 * dev, the production routes block already restricts by host).
 */
const SSE_HEADERS: Record<string, string> = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  // Anthropic's stream uses `X-Accel-Buffering: no` to disable nginx
  // buffering; we surface the same hint so any intermediate proxy
  // (e.g. a self-hosted reverse-proxy in front of vozclara.app) keeps
  // chunks flowing.
  'X-Accel-Buffering': 'no',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Expose-Headers': 'Content-Type',
};

export interface AnthropicSSEResponseOptions {
  /**
   * Side-channel observer fired exactly once when the parser side has
   * consumed the whole stream. Receives the accumulated summary so the
   * caller can write a usage row to KV / D1 via `ctx.waitUntil(...)`
   * without holding up the client.
   *
   * The promise this returns (if any) is awaited inside the tee, so
   * the caller's `ctx.waitUntil` semantics carry through.
   */
  onSummary?: (summary: AnthropicStreamSummary) => void | Promise<void>;
  /** Extra response headers to merge in (e.g. custom CORS for OAuth flows). */
  extraHeaders?: Record<string, string>;
}

/**
 * Wrap Anthropic's ReadableStream in a Response object the worker can
 * return directly to the browser. If `onSummary` is given, the stream
 * is tee'd and the side branch is parsed in the background — the main
 * branch reaches the client with no extra hop.
 */
export function anthropicSSEResponse(
  source: ReadableStream<Uint8Array>,
  options: AnthropicSSEResponseOptions = {},
): Response {
  let clientStream: ReadableStream<Uint8Array> = source;

  if (options.onSummary) {
    const [forClient, forParse] = source.tee();
    clientStream = forClient;

    // Fire-and-forget side-parse. We deliberately do not await it
    // inside this function — the Response should reach the client as
    // soon as the first byte is available. Callers that want to keep
    // the request alive until the parse completes should call
    // `ctx.waitUntil(...)` on the promise we expose via onSummary.
    void consumeForSummary(forParse, options.onSummary).catch(() => {
      // Side-channel failures are best-effort; we never want to
      // tear down the client stream because our usage log broke.
    });
  }

  return new Response(clientStream, {
    status: 200,
    headers: { ...SSE_HEADERS, ...(options.extraHeaders ?? {}) },
  });
}

/**
 * Async generator that yields parsed events from the source stream.
 * Useful when the caller wants to fully consume the response server-
 * side (e.g. an MCP tool returning a single composed text). Does not
 * tee — the caller takes the whole stream.
 */
export async function* parseAnthropicStream(
  source: ReadableStream<Uint8Array>,
): AsyncGenerator<AnthropicStreamEvent, void, void> {
  const reader = source.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by a blank line. Split on the boundary
      // and process every fully-formed event, keeping the trailing tail
      // (a possibly-partial next event) in the buffer for the next iter.
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const rawEvent = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const parsed = parseEvent(rawEvent);
        if (parsed) yield parsed;
        boundary = buffer.indexOf('\n\n');
      }
    }

    // Flush any final event the upstream did not terminate with a
    // trailing blank line — Anthropic always does, but other servers
    // might not, and we don't want to silently drop it.
    if (buffer.trim().length > 0) {
      const parsed = parseEvent(buffer);
      if (parsed) yield parsed;
    }
  } finally {
    reader.releaseLock();
  }
}

/* ─── internals ────────────────────────────────────────────────────────── */

/** Parse a single "event: …\ndata: …" SSE frame into our typed shape. */
function parseEvent(raw: string): AnthropicStreamEvent | null {
  let eventType = '';
  const dataLines: string[] = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) {
      eventType = line.slice('event:'.length).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim());
    }
    // Comment lines (`: …`) and empty lines inside an event are skipped.
  }
  if (!eventType && dataLines.length === 0) return null;
  const dataStr = dataLines.join('\n');
  let data: unknown = {};
  if (dataStr) {
    try {
      data = JSON.parse(dataStr);
    } catch {
      // Malformed JSON inside an event — keep the raw string so the
      // caller can still see what came through.
      data = { raw: dataStr };
    }
  }
  return { type: eventType, data } as AnthropicStreamEvent;
}

/**
 * Consume the side-branch fully, accumulate the summary, and invoke
 * the caller's onSummary callback once at end. Errors are swallowed —
 * a broken usage log must never block the client.
 */
async function consumeForSummary(
  source: ReadableStream<Uint8Array>,
  onSummary: (summary: AnthropicStreamSummary) => void | Promise<void>,
): Promise<void> {
  const acc: AnthropicStreamSummary = {
    text: '',
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
    },
    stopReason: '',
    id: '',
    model: '',
    completed: false,
  };

  for await (const ev of parseAnthropicStream(source)) {
    switch (ev.type) {
      case 'message_start': {
        const data = ev.data as { message?: RawMessageStart };
        const m = data.message;
        if (m) {
          if (m.id) acc.id = m.id;
          if (m.model) acc.model = m.model;
          if (m.usage) {
            acc.usage.inputTokens = m.usage.input_tokens ?? 0;
            acc.usage.outputTokens = m.usage.output_tokens ?? 0;
            acc.usage.cacheCreationInputTokens = m.usage.cache_creation_input_tokens ?? 0;
            acc.usage.cacheReadInputTokens = m.usage.cache_read_input_tokens ?? 0;
          }
        }
        break;
      }
      case 'content_block_delta': {
        const data = ev.data as { delta?: { type: string; text?: string } };
        const d = data.delta;
        if (d && d.type === 'text_delta' && typeof d.text === 'string') {
          acc.text += d.text;
        }
        break;
      }
      case 'message_delta': {
        const data = ev.data as {
          delta?: { stop_reason?: string };
          usage?: { output_tokens?: number };
        };
        if (data.delta?.stop_reason) acc.stopReason = data.delta.stop_reason;
        if (typeof data.usage?.output_tokens === 'number') {
          acc.usage.outputTokens = data.usage.output_tokens;
        }
        break;
      }
      case 'message_stop': {
        acc.completed = true;
        break;
      }
      case 'error': {
        const data = ev.data as { error?: { type: string; message: string } };
        if (data.error) acc.error = data.error;
        break;
      }
      // ping / unknown — ignored.
    }
  }

  try {
    await onSummary(acc);
  } catch {
    // Caller's logger blew up — swallow, the client doesn't care.
  }
}
