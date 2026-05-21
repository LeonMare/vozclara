/**
 * LLM router — tier-aware dispatch between Workers AI (Llama 3.3 70B)
 * and Anthropic Sonnet 4.5 (via Cloudflare AI Gateway).
 *
 * This is the single source of truth for "which model gets called for
 * which user tier" (CLAUDE.md §1.3 — tier routing is LOCKED). Every
 * generation path that wants tier-aware behaviour goes through here
 * rather than hardcoding the model id, so when we add a fourth tier
 * or swap the underlying model we change one file.
 *
 * Routing table:
 *
 *   free / pro    →  @cf/meta/llama-3.3-70b-instruct-fp8-fast
 *                   (Workers AI, 128k context, cheap, fast)
 *
 *   pro_plus      →  claude-sonnet-4-5
 *                   (Anthropic via Cloudflare AI Gateway, BYOK)
 *
 * Why route at this layer instead of inside each handler?
 *   • Handlers stay tier-agnostic — `handleInsights` doesn't have to
 *     know that Pro Plus means "use Anthropic"; it just calls
 *     `callLLM({ tier, ... }, env)` and gets text back.
 *   • The Sonnet 4.5 Lens prompt caching (1h TTL, 70% cost reduction)
 *     is configured in one place rather than duplicated per route.
 *   • Streaming will land in a follow-up commit. When it does, the
 *     same router will return a normalised SSE stream regardless of
 *     provider, so frontend code stays one path.
 *
 * Out of scope for this commit:
 *   • Streaming (the underlying clients support it; the router
 *     normalisation layer hasn't been written yet — see TODO at the
 *     bottom).
 *   • Per-tier quota enforcement — that already lives in the route
 *     handlers (`if (user.tier === 'free' && quota >= 3) return 429`).
 *   • Lens system-prompt selection — callers pass the system prompt
 *     in directly; lens routing lives one layer up.
 */

import { callAnthropic, AnthropicError } from './anthropic';
import type { AnthropicEnv, CacheTtl } from './anthropic';
import { workersAiToAnthropicSSE } from './workers-ai-stream';

/** User tiers — CLAUDE.md §1.3 LOCKED. */
export type Tier = 'free' | 'pro' | 'pro_plus';

/**
 * Workers AI binding shape — minimal subset we use. Mirrors the
 * declaration in worker/src/index.ts so the router can be imported
 * without dragging the whole Env type along.
 */
export interface WorkersAiBinding {
  run: (
    model: string,
    input: Record<string, unknown>,
  ) => Promise<{ response?: string | unknown } & Record<string, unknown>>;
}

/** Env requirements for the router — composition of Workers AI + Anthropic. */
export interface LlmRouterEnv extends AnthropicEnv {
  AI: WorkersAiBinding;
}

/** Free/Pro tier model — same string the rest of the worker uses. */
export const LLAMA_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

/** Pro Plus tier model — canonical alias, Anthropic resolves to latest sub-version. */
export const SONNET_MODEL = 'claude-sonnet-4-5';

export interface LlmCallOptions {
  /** User's tier — drives provider selection. Defaults to 'free'. */
  tier?: Tier;
  /** System prompt — Lens text or any other framing. */
  systemPrompt?: string;
  /** User-side content (transcript, question, etc.). */
  userContent: string;
  /**
   * Output token cap. Required and unbounded-by-default is prohibited
   * by CLAUDE.md §3.3 — pass an explicit budget at every call site.
   */
  maxTokens: number;
  /** Sampling temperature — defaults to 0.4 (editorial register). */
  temperature?: number;
  /**
   * Marks the system prompt as cache-eligible. Only takes effect on
   * the Anthropic path (Workers AI doesn't expose prompt-caching).
   * For Pro Plus Lens calls this should be true.
   */
  cacheSystemPrompt?: boolean;
  /** Cache TTL when caching is enabled. Default '5m', use '1h' for Lens prompts. */
  cacheTTL?: CacheTtl;
  /** Optional AbortSignal — forwarded to the underlying provider. */
  signal?: AbortSignal;
}

export interface LlmResult {
  /** Generated text. Always present even on partial completions. */
  text: string;
  /** Which provider served the request. */
  provider: 'workers-ai' | 'anthropic';
  /** The actual model id that was called — useful for provenance. */
  model: string;
  /** Token usage. Workers AI doesn't report tokens; only Anthropic does. */
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens: number;
    cacheReadInputTokens: number;
  };
  /** Stop condition — 'end_turn' | 'max_tokens' | provider-specific. */
  stopReason?: string;
}

export interface LlmStreamResult {
  /**
   * Anthropic-shape SSE bytes — message_start / content_block_start /
   * content_block_delta(*) / content_block_stop / message_delta /
   * message_stop framed events. Works regardless of which provider
   * actually ran; the Workers AI branch is normalised through
   * workers-ai-stream.ts:workersAiToAnthropicSSE so the wire format
   * stays identical across tiers.
   *
   * Pipe straight into anthropicSSEResponse() from anthropic-stream.ts
   * to ship to the client. Feed into parseAnthropicStream() for the
   * provider-agnostic usage-logging side-channel.
   */
  stream: ReadableStream<Uint8Array>;
  /** Which provider actually served the request. */
  provider: 'workers-ai' | 'anthropic';
  /** Model id — Sonnet 4.5 alias on the Anthropic path, the canonical
   *  Llama string on the Workers AI path. */
  model: string;
}

/**
 * Route an LLM call to the correct provider for the user's tier.
 *
 * Pro Plus users go to Anthropic Sonnet 4.5 via Cloudflare AI Gateway
 * with prompt caching honoured. Everyone else goes to Workers AI's
 * Llama 3.3 70B. The function never throws on provider availability:
 *   • If Anthropic is misconfigured for a Pro Plus request, we fall
 *     back to Llama and tag the result with `provider: 'workers-ai'`
 *     so the caller can decide whether to surface a degraded notice.
 *   • If Workers AI itself is unavailable, the underlying binding
 *     throws and we let it propagate.
 */
export async function callLLM(
  options: LlmCallOptions,
  env: LlmRouterEnv,
): Promise<LlmResult> {
  const tier: Tier = options.tier ?? 'free';

  if (tier === 'pro_plus') {
    try {
      const res = await callAnthropic(
        {
          model: SONNET_MODEL,
          maxTokens: options.maxTokens,
          systemPrompt: options.systemPrompt,
          userContent: options.userContent,
          cacheSystemPrompt: options.cacheSystemPrompt,
          cacheTTL: options.cacheTTL,
          temperature: options.temperature,
          signal: options.signal,
        },
        env,
      );
      return {
        text: res.text,
        provider: 'anthropic',
        model: res.model,
        usage: res.usage,
        stopReason: res.stopReason,
      };
    } catch (err) {
      // Soft-fallback for misconfiguration and overload. Auth/quota
      // failures still bubble up so we notice in Sentry. The user gets
      // a Llama-quality answer rather than a 500.
      if (
        err instanceof AnthropicError &&
        (err.code === 'gateway_misconfigured' || err.code === 'overloaded')
      ) {
        return callViaLlama(options, env);
      }
      throw err;
    }
  }

  return callViaLlama(options, env);
}

/* ─── internals ────────────────────────────────────────────────────────── */

/**
 * Workers AI / Llama 3.3 70B branch.
 *
 * The binding accepts a `messages` array (chat shape) and returns
 * either `{ response: string }` (non-streaming) or a ReadableStream
 * (streaming). For now we always go non-streaming; streaming lands in
 * the follow-up commit alongside the router-level normalisation.
 */
async function callViaLlama(
  options: LlmCallOptions,
  env: LlmRouterEnv,
): Promise<LlmResult> {
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: options.userContent });

  const raw = (await env.AI.run(LLAMA_MODEL, {
    messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature ?? 0.4,
  })) as unknown;

  // Defensive coercion. The 70B model is known to return
  //   • { response: '...' }                — common path
  //   • { response: { ...structured... } } — when an output_schema is
  //                                          attached upstream
  //   • a bare string                      — older binding versions
  // We stringify so JSON-parsing callers (parseInsightsJson and
  // friends) always see a parseable surface, and plain-text callers
  // never get a "[object Object]" surprise from String(obj).
  let text: string;
  if (typeof raw === 'string') {
    text = raw;
  } else if (raw && typeof raw === 'object') {
    const r = (raw as { response?: unknown }).response;
    if (typeof r === 'string') text = r;
    else if (r != null) text = JSON.stringify(r);
    else text = JSON.stringify(raw);
  } else {
    text = String(raw ?? '');
  }

  return {
    text,
    provider: 'workers-ai',
    model: LLAMA_MODEL,
    // Workers AI doesn't surface a token-count payload (yet). Leave
    // usage undefined so callers can branch on its presence.
    stopReason: 'end_turn',
  };
}

/* ─── streaming variant ─────────────────────────────────────────────────── */

/**
 * Streaming sibling of `callLLM`. Same tier-aware routing, same
 * soft-fallback on Anthropic misconfig / overload, but returns an
 * Anthropic-shape SSE `ReadableStream<Uint8Array>` instead of a
 * resolved text result.
 *
 * Pro Plus → Sonnet 4.5 native SSE forwarded as-is (Anthropic's
 * own message_start / content_block_delta / message_stop envelope).
 *
 * Free + Pro → Llama 3.3 70B via Workers AI, normalised through
 * `workersAiToAnthropicSSE` so the frontend sees the exact same
 * event taxonomy regardless of which model ran. Token-count
 * fields are zero on the Workers AI path — see the file header of
 * `worker/src/workers-ai-stream.ts` for the caveats.
 *
 * The Anthropic path's failure modes match `callLLM`:
 *   • `gateway_misconfigured` (missing secret / vars) → falls back to
 *     Llama streaming so the user doesn't see a 500.
 *   • `overloaded` (Anthropic capacity event) → same fallback.
 *   • Anything else (rate_limited, auth_failed, invalid_request,
 *     http_error, network_error) → re-thrown for the caller to log
 *     and surface as a 5xx / 4xx Response.
 *
 * The Workers AI branch never falls back further — if `env.AI.run`
 * throws, the error propagates. There's no third LLM behind Llama.
 */
export async function callLLMStream(
  options: LlmCallOptions,
  env: LlmRouterEnv,
): Promise<LlmStreamResult> {
  const tier: Tier = options.tier ?? 'free';

  if (tier === 'pro_plus') {
    try {
      const stream = await callAnthropic(
        {
          model: SONNET_MODEL,
          maxTokens: options.maxTokens,
          systemPrompt: options.systemPrompt,
          userContent: options.userContent,
          cacheSystemPrompt: options.cacheSystemPrompt,
          cacheTTL: options.cacheTTL,
          temperature: options.temperature,
          signal: options.signal,
          stream: true,
        },
        env,
      );
      return {
        stream,
        provider: 'anthropic',
        model: SONNET_MODEL,
      };
    } catch (err) {
      if (
        err instanceof AnthropicError &&
        (err.code === 'gateway_misconfigured' || err.code === 'overloaded')
      ) {
        return streamViaLlama(options, env);
      }
      throw err;
    }
  }

  return streamViaLlama(options, env);
}

/**
 * Workers AI streaming branch. Wraps the binding's raw SSE body in
 * the Anthropic-shape envelope so callers handle one event format.
 *
 * The cast through `unknown` is unfortunate but necessary: the
 * `WorkersAiBinding` signature here is conservative (it only
 * declares the non-streaming `{ response }` shape), while at
 * runtime `env.AI.run(model, { stream: true, ... })` returns
 * `ReadableStream<Uint8Array>`. Widening the binding type would
 * leak the union into every existing non-streaming call-site
 * (CLAUDE.md §4.5 — never one-shot rewrite); the localised cast
 * stays as the contract until we eventually swap the binding
 * declaration to the official `@cloudflare/workers-types` Ai
 * interface.
 */
async function streamViaLlama(
  options: LlmCallOptions,
  env: LlmRouterEnv,
): Promise<LlmStreamResult> {
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: options.userContent });

  const raw = (await env.AI.run(LLAMA_MODEL, {
    messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature ?? 0.4,
    stream: true,
  })) as unknown as ReadableStream<Uint8Array>;

  return {
    stream: workersAiToAnthropicSSE(raw, LLAMA_MODEL),
    provider: 'workers-ai',
    model: LLAMA_MODEL,
  };
}
