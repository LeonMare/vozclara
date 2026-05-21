/**
 * Anthropic Messages API client — via Cloudflare AI Gateway (BYOK).
 *
 * Why a Gateway in front of Anthropic?
 *   • Observability — every call shows up in the Cloudflare AI Gateway
 *     dashboard with token counts, latency, and cache-hit ratios. We
 *     can't get the same view by hitting api.anthropic.com directly.
 *   • Cost guardrails — Gateway lets us enforce per-day caps and rate
 *     limits at the edge. We rely on this to keep Pro Plus margins
 *     predictable (CLAUDE.md §1.3 "Pro Plus capped 40 packs/mo").
 *   • Caching — Gateway's response cache layers on top of Anthropic's
 *     own prompt-caching, giving us a second hit-rate dial.
 *
 * Endpoint pattern (wrangler.toml [vars] hold the components):
 *   https://gateway.ai.cloudflare.com/v1/${CF_ACCOUNT_ID}/${CF_AI_GATEWAY_ID}/anthropic/v1/messages
 *
 * Auth model: BYOK. The Gateway passes through our `x-api-key` header
 * to Anthropic without inspecting it. ANTHROPIC_API_KEY is stored as
 * a Worker secret (set via `wrangler secret put ANTHROPIC_API_KEY`).
 *
 * Invariants this module enforces (CLAUDE.md §3.3 + §7):
 *   • `max_tokens` is always set — never default-to-unbounded
 *   • System prompts are cached with 1h TTL when `cacheSystemPrompt:true`
 *   • No client-side retry — the Gateway handles upstream retries
 *
 * Phase 1 scope (this file): non-streaming and streaming both work;
 * tool use, citations, vision, and message-history-conv are explicitly
 * out of scope. We add those when the first feature actually needs
 * them. See `anthropic-stream.ts` for the SSE pass-through helper.
 */

export interface AnthropicEnv {
  /** Cloudflare account UUID — needed to build the AI Gateway URL. */
  CF_ACCOUNT_ID?: string;
  /** AI Gateway slug under the account (we use "vozclara-prod"). */
  CF_AI_GATEWAY_ID?: string;
  /** Anthropic API key — BYOK passthrough via Gateway. Set via secret. */
  ANTHROPIC_API_KEY?: string;
  /**
   * Cloudflare AI Gateway authentication token. Required when the
   * Gateway is configured as "Authenticated" (defense-in-depth on top
   * of BYOK — even if ANTHROPIC_API_KEY leaks, the Gateway also blocks
   * requests without this token).
   *
   * Generated in: Cloudflare Dashboard → AI Gateway → vozclara-prod
   *               → Settings → "Create authentication token"
   *               with permission Account / AI Gateway / Run.
   *
   * Set via: `wrangler secret put CF_AIG_AUTH_TOKEN`
   *
   * When absent, requests still build but the Gateway returns
   * HTTP 401 with internal code 2009 (AiGatewayError "Unauthorized").
   */
  CF_AIG_AUTH_TOKEN?: string;
}

/** Cache TTL values Anthropic supports on `cache_control`. */
export type CacheTtl = '5m' | '1h';

/** Subset of Anthropic models we use; widen as we add more. */
export type AnthropicModel = 'claude-sonnet-4-5' | (string & {});

export interface AnthropicCallOptions {
  /** Model id — defaults to claude-sonnet-4-5 (Pro Plus tier). */
  model: AnthropicModel;
  /**
   * Hard cap on output tokens. ALWAYS set — defaulting to unbounded
   * is a runaway cost vector and CLAUDE.md §3.3 prohibits it.
   */
  maxTokens: number;
  /**
   * System prompt text. Cached at 1h TTL when `cacheSystemPrompt` is
   * true (cost reduction up to ~70% on Lens calls per CLAUDE.md §1.5).
   */
  systemPrompt?: string;
  /**
   * The user message body. Either a plain string (single-turn) or an
   * array of pre-shaped messages for multi-turn flows. Plain strings
   * are wrapped into `[{ role: 'user', content }]`.
   */
  userContent: string | AnthropicMessage[];
  /**
   * Marks the system prompt as cache-eligible. The Lens architecture
   * relies on this for 70% cost reduction across repeated calls with
   * the same lens id (CLAUDE.md §1.5 + §7 call pattern).
   */
  cacheSystemPrompt?: boolean;
  /** Cache TTL when caching is enabled. Default is '5m', use '1h' for Lens prompts. */
  cacheTTL?: CacheTtl;
  /** Sampling temperature; defaults to 0.4 — editorial register, low randomness. */
  temperature?: number;
  /**
   * Stream the response as Anthropic's SSE event stream. Returns a
   * ReadableStream<Uint8Array> the caller is expected to re-stream
   * (see anthropic-stream.ts for the spec-compliant wrapper).
   */
  stream?: boolean;
  /**
   * Optional AbortSignal — passed through to fetch so the caller can
   * cancel a long-running generation when the downstream client
   * disconnects.
   */
  signal?: AbortSignal;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
}

export interface AnthropicResult {
  /** Concatenated text from all text blocks in the response. */
  text: string;
  /** Token counts from the API response. */
  usage: AnthropicUsage;
  /** End condition: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | 'pause_turn' | 'refusal'. */
  stopReason: string;
  /** Echo of the actual served model — useful for audit / provenance. */
  model: string;
  /** Anthropic message id (e.g. "msg_01abc…") for debugging. */
  id: string;
}

/**
 * Streaming overload signature. We keep the two return types apart so
 * callers don't have to type-narrow at every call site.
 */
export type AnthropicStreamResult = ReadableStream<Uint8Array>;

/** Typed error with a coarse classification useful to the caller. */
export class AnthropicError extends Error {
  constructor(
    message: string,
    public code:
      | 'rate_limited'
      | 'overloaded'
      | 'auth_failed'
      | 'invalid_request'
      | 'gateway_misconfigured'
      | 'http_error'
      | 'network_error',
    public status?: number,
    public detail?: string,
  ) {
    super(message);
    this.name = 'AnthropicError';
  }
}

/**
 * Call Anthropic Messages API via Cloudflare AI Gateway. Two return
 * shapes depending on whether streaming is requested:
 *   • stream:false → resolved AnthropicResult with concatenated text + usage
 *   • stream:true  → ReadableStream<Uint8Array> with raw SSE events
 *
 * Throws AnthropicError on any non-2xx. The error's `code` field
 * lets callers branch on transient vs terminal failures.
 */
export async function callAnthropic(
  options: AnthropicCallOptions & { stream: true },
  env: AnthropicEnv,
): Promise<AnthropicStreamResult>;
export async function callAnthropic(
  options: AnthropicCallOptions & { stream?: false },
  env: AnthropicEnv,
): Promise<AnthropicResult>;
export async function callAnthropic(
  options: AnthropicCallOptions,
  env: AnthropicEnv,
): Promise<AnthropicResult | AnthropicStreamResult> {
  // Sanity-check the env up front. The error class makes it easy for
  // routes to translate "missing secret" into a 503 rather than a 500.
  if (!env.CF_ACCOUNT_ID || !env.CF_AI_GATEWAY_ID) {
    throw new AnthropicError(
      'Gateway not configured — CF_ACCOUNT_ID / CF_AI_GATEWAY_ID missing in [vars].',
      'gateway_misconfigured',
    );
  }
  if (!env.ANTHROPIC_API_KEY) {
    throw new AnthropicError(
      'ANTHROPIC_API_KEY secret not set (run `wrangler secret put ANTHROPIC_API_KEY`).',
      'auth_failed',
    );
  }
  if (!options.maxTokens || options.maxTokens <= 0) {
    throw new AnthropicError(
      'maxTokens is required and must be > 0 (CLAUDE.md §3.3 — no default-unbounded).',
      'invalid_request',
    );
  }

  const url = `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/anthropic/v1/messages`;

  const body = buildRequestBody(options);

  // Build headers. The Gateway authentication token is layered on
  // top of the Anthropic BYOK key — both must validate for the
  // request to reach Anthropic. The token is only sent when present;
  // when absent and the Gateway is in Authenticated mode, the request
  // still goes out and Cloudflare returns HTTP 401 internalCode 2009
  // (handled by classifyHttpError as auth_failed).
  const headers: Record<string, string> = {
    'x-api-key': env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
    // Tells the Gateway + Anthropic to stream when set; harmless
    // when stream=false because we still POST JSON.
    Accept: options.stream ? 'text/event-stream' : 'application/json',
  };
  if (env.CF_AIG_AUTH_TOKEN) {
    headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_AUTH_TOKEN}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: options.signal,
    });
  } catch (err) {
    // Network-level failure before we even saw a response.
    throw new AnthropicError(
      `Network error reaching Cloudflare AI Gateway: ${err instanceof Error ? err.message : String(err)}`,
      'network_error',
    );
  }

  if (!res.ok) {
    // Read body for error detail without consuming a streaming pipe.
    // For streaming requests, Anthropic still returns a normal JSON
    // body on error (no SSE yet because the request hasn't started).
    const detail = await res.text().catch(() => '');
    throw classifyHttpError(res.status, detail);
  }

  if (options.stream) {
    if (!res.body) {
      throw new AnthropicError(
        'Streaming request returned empty body — Gateway likely misconfigured.',
        'gateway_misconfigured',
      );
    }
    return res.body;
  }

  // Non-streaming path: decode + reshape.
  const json = (await res.json()) as RawMessagesResponse;
  return reshapeResponse(json);
}

/* ─── internals ────────────────────────────────────────────────────────── */

interface RawMessagesResponse {
  id: string;
  model: string;
  stop_reason: string;
  content: Array<{ type: string; text?: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

function buildRequestBody(options: AnthropicCallOptions): Record<string, unknown> {
  const messages: AnthropicMessage[] = Array.isArray(options.userContent)
    ? options.userContent
    : [{ role: 'user', content: options.userContent }];

  // System prompt — sent as an array of typed blocks so we can attach
  // cache_control to the prompt itself. Anthropic accepts both string
  // and array shapes; we use the array form whenever a system prompt
  // is present so the cache-control branch is uniform.
  let systemBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral'; ttl?: CacheTtl } }> | undefined;
  if (options.systemPrompt) {
    const block: { type: 'text'; text: string; cache_control?: { type: 'ephemeral'; ttl?: CacheTtl } } = {
      type: 'text',
      text: options.systemPrompt,
    };
    if (options.cacheSystemPrompt) {
      block.cache_control = {
        type: 'ephemeral',
        // Default to '5m' if cacheSystemPrompt is true but no TTL given.
        // Lens prompts should pass '1h' for the 70% cost reduction.
        ttl: options.cacheTTL ?? '5m',
      };
    }
    systemBlocks = [block];
  }

  const payload: Record<string, unknown> = {
    model: options.model,
    max_tokens: options.maxTokens,
    messages,
    temperature: options.temperature ?? 0.4,
  };
  if (systemBlocks) payload.system = systemBlocks;
  if (options.stream) payload.stream = true;

  return payload;
}

function reshapeResponse(json: RawMessagesResponse): AnthropicResult {
  // Concatenate all text blocks. Anthropic occasionally splits long
  // responses into multiple text blocks; collapsing them mirrors the
  // shape callers expect from Workers AI (single string output).
  const text = json.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text!)
    .join('');

  return {
    text,
    usage: {
      inputTokens: json.usage.input_tokens,
      outputTokens: json.usage.output_tokens,
      cacheCreationInputTokens: json.usage.cache_creation_input_tokens ?? 0,
      cacheReadInputTokens: json.usage.cache_read_input_tokens ?? 0,
    },
    stopReason: json.stop_reason,
    model: json.model,
    id: json.id,
  };
}

function classifyHttpError(status: number, detail: string): AnthropicError {
  // Trim to keep error logs sane while still leaving enough context to
  // debug auth / quota issues from Sentry without paginating.
  const trimmed = detail.slice(0, 500);
  if (status === 401 || status === 403) {
    return new AnthropicError(
      `Anthropic auth failed (HTTP ${status}). Check ANTHROPIC_API_KEY validity in Cloudflare secrets.`,
      'auth_failed',
      status,
      trimmed,
    );
  }
  if (status === 400 || status === 404) {
    return new AnthropicError(
      `Invalid request to Anthropic (HTTP ${status}): ${trimmed}`,
      'invalid_request',
      status,
      trimmed,
    );
  }
  if (status === 429) {
    return new AnthropicError(
      `Rate-limited by Anthropic (HTTP 429). The Gateway is responsible for upstream retries; do not double-retry from the caller.`,
      'rate_limited',
      status,
      trimmed,
    );
  }
  if (status === 529 || status === 503) {
    return new AnthropicError(
      `Anthropic overloaded (HTTP ${status}). Surface a "model busy" message to the user; retry policy is the Gateway's.`,
      'overloaded',
      status,
      trimmed,
    );
  }
  return new AnthropicError(
    `Anthropic call failed (HTTP ${status}): ${trimmed}`,
    'http_error',
    status,
    trimmed,
  );
}
