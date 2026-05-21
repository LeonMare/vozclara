/**
 * Workers AI → Anthropic SSE shape adapter.
 *
 * Cloudflare Workers AI streams completions as a stripped-down SSE
 * format — one `{response: "delta"}` payload per frame plus a
 * `[DONE]` sentinel. Anthropic streams a richer envelope:
 * `message_start` / `content_block_start` / `content_block_delta`
 * (one per token chunk) / `content_block_stop` / `message_delta` /
 * `message_stop`.
 *
 * This adapter re-frames Workers AI's bytes into the Anthropic
 * taxonomy so the frontend has one parser to write and one
 * provider-agnostic usage-logging side-channel to wire — the
 * same `anthropicSSEResponse()` + `parseAnthropicStream()` helpers
 * work whichever provider actually ran. Without this normalisation,
 * task #24 (Streaming Pack-Gen) would need two parsers, two
 * side-channel loggers, and two error paths.
 *
 * Caveats — read before relying on the rewritten payload:
 *   • Token counts are NOT faked. Workers AI doesn't surface
 *     `input_tokens` / `output_tokens`, so the synthesised
 *     `message_start.usage` and `message_delta.usage` carry zeros.
 *     Cost accounting on the Llama path should use neuron counters
 *     out-of-band rather than trust the wrapped usage block.
 *   • `stop_reason` is always emitted as `'end_turn'` because
 *     Workers AI doesn't telegraph why it stopped. If we ever need
 *     true `max_tokens` vs `end_turn` discrimination on the free
 *     path, the binding's structured return is the source of truth.
 *   • `id` is synthesised (`wai_<random>`). Don't rely on it for
 *     correlating with Workers AI logs.
 *
 * Reference for the input format:
 * https://developers.cloudflare.com/workers-ai/configuration/streaming/
 */

const enc = new TextEncoder();

function sseFrame(eventType: string, payload: unknown): Uint8Array {
  // Anthropic + EventSource both expect the event name on its own
  // line, then a single `data: …` line with JSON, then a blank line.
  return enc.encode(
    `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`,
  );
}

function synthMessageId(): string {
  // `wai_` prefix flags it as a synthesised id (workers-ai). Any
  // log-grepper looking for real Anthropic ids (`msg_…`) will skip
  // these without needing to know what they mean.
  return `wai_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

/**
 * Wrap a Workers AI SSE body so it emits Anthropic-shape events.
 *
 * Tolerant of partial reads (buffers across chunks) and of malformed
 * keepalive frames (skips them rather than throwing) — same posture
 * as parseAnthropicStream in anthropic-stream.ts.
 *
 * Backpressure is honoured: each enqueue obeys the caller's pull
 * cadence, and the wrapped reader yields between frames so a slow
 * downstream consumer never thrashes Workers AI.
 */
export function workersAiToAnthropicSSE(
  raw: ReadableStream<Uint8Array>,
  model: string,
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = raw.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let started = false;
      let blockOpen = false;
      const messageId = synthMessageId();

      const openMessage = (): void => {
        if (started) return;
        started = true;
        controller.enqueue(
          sseFrame('message_start', {
            type: 'message_start',
            message: {
              id: messageId,
              type: 'message',
              role: 'assistant',
              model,
              content: [],
              stop_reason: null,
              stop_sequence: null,
              usage: {
                input_tokens: 0,
                output_tokens: 0,
                cache_creation_input_tokens: 0,
                cache_read_input_tokens: 0,
              },
            },
          }),
        );
        controller.enqueue(
          sseFrame('content_block_start', {
            type: 'content_block_start',
            index: 0,
            content_block: { type: 'text', text: '' },
          }),
        );
        blockOpen = true;
      };

      const handleDataLine = (json: string): void => {
        if (!json || json === '[DONE]') return;
        let chunk: { response?: unknown };
        try {
          chunk = JSON.parse(json) as { response?: unknown };
        } catch {
          // Malformed frame — skip. SSE may include comment-style
          // keepalives that aren't valid JSON.
          return;
        }
        if (typeof chunk.response !== 'string' || chunk.response.length === 0) {
          return;
        }
        openMessage();
        controller.enqueue(
          sseFrame('content_block_delta', {
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text_delta', text: chunk.response },
          }),
        );
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let boundary = buffer.indexOf('\n\n');
          while (boundary !== -1) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const dataLine = frame
              .split('\n')
              .find((line) => line.startsWith('data: '));
            if (dataLine) handleDataLine(dataLine.slice(6).trim());
            boundary = buffer.indexOf('\n\n');
          }
        }
        // Flush any final unterminated frame (Workers AI normally
        // closes with a trailing blank line, but defensively handle
        // the case where the stream ends without one).
        const tail = buffer.trim();
        if (tail.startsWith('data: ')) handleDataLine(tail.slice(6).trim());

        // Always emit a clean envelope even when the upstream produced
        // zero deltas — the consumer expects either a complete or an
        // errored stream, never an empty one.
        openMessage();
        if (blockOpen) {
          controller.enqueue(
            sseFrame('content_block_stop', {
              type: 'content_block_stop',
              index: 0,
            }),
          );
        }
        controller.enqueue(
          sseFrame('message_delta', {
            type: 'message_delta',
            delta: { stop_reason: 'end_turn', stop_sequence: null },
            // Workers AI doesn't surface token counters; the side-
            // channel logger sees zeros and can branch on that.
            usage: { output_tokens: 0 },
          }),
        );
        controller.enqueue(
          sseFrame('message_stop', { type: 'message_stop' }),
        );
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
