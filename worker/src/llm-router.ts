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

  const raw = await env.AI.run(LLAMA_MODEL, {
    messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature ?? 0.4,
  });

  const text = typeof raw.response === 'string' ? raw.response : String(raw.response ?? '');

  return {
    text,
    provider: 'workers-ai',
    model: LLAMA_MODEL,
    // Workers AI doesn't surface a token-count payload (yet). Leave
    // usage undefined so callers can branch on its presence.
    stopReason: 'end_turn',
  };
}

/* ─── TODO: streaming variant ──────────────────────────────────────────────
 *
 * `callLLMStream` will mirror `callLLM` but return a normalised
 * ReadableStream<Uint8Array> in Anthropic SSE shape regardless of
 * provider. Two pieces to add:
 *
 *   1. Anthropic path is already SSE-shaped — we forward as-is via
 *      anthropic-stream.ts helpers.
 *   2. Workers AI emits its own chunk format; we need a TransformStream
 *      that wraps each chunk into a `content_block_delta` event so the
 *      frontend sees one consistent wire format.
 *
 * That work lands in the next commit alongside #24 Streaming Pack-Gen.
 * Until then, handlers that want streaming should call the underlying
 * clients directly (callAnthropic for Pro Plus, env.AI.run with
 * stream:true for free/pro) and accept that the on-wire format
 * differs between tiers.
 */
