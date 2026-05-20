/**
 * VozClara worker. Two endpoints:
 *
 *   GET /api/transcript?v=ID&lang=de&to=es
 *     1. Supadata fetches the transcript (residential-IP egress around
 *        YouTube's datacenter-IP block). Cost: 1 credit per video.
 *     2. Lingva translates each segment via free public instances.
 *
 *   POST /api/insights
 *     Body: { videoId, transcript: string, sourceLang, targetLang, genre? }
 *     Returns: { genre, summary, insights[], actionPlan[] }
 *     Uses Cloudflare Workers AI (Llama 3.x) with a genre-aware system
 *     prompt selected from the detected content type.
 *
 * Edge cache 24 h on the transcript endpoint. Insights are cached
 * client-side in IndexedDB since they're user-specific.
 */

import { OAuthProvider, type OAuthHelpers } from '@cloudflare/workers-oauth-provider';
import { sendPush, type PushSubscriptionData } from './webpush';
import { captureWorkerError } from './sentry';
import {
  handleAuthRequest,
  handleAuthVerify,
  handleAuthMe,
  handleAuthLogout,
  handleAuthAttachBrain,
  handleAuthProfile,
  handleAuthDelete,
} from './auth';
import {
  handleRatingPost,
  handleRatingGet,
  handleRatingMe,
  handleRatingTop,
  handleRatingBulk,
  handleRatingReviews,
} from './rating';
import {
  handleFounderStatus,
  handleFounderIncrement,
  handleFounderSet,
  handleFounderWebhook,
} from './founder';
import { VozClaraMcpAgent } from './mcp/agent';
import oauthConsentApp from './oauth/handler';

// Re-export the MCP agent class so wrangler picks it up as a Durable
// Object class. The DO binding is declared in wrangler.toml and the
// `agents` SDK uses it to persist McpAgent state across SSE/HTTP
// transport sessions. Without this re-export the migration would fail
// at deploy time with "Class VozClaraMcpAgent not found".
export { VozClaraMcpAgent };

interface Env {
  SUPADATA_API_KEY?: string;
  /**
   * Optional OpenAI key for premium text-to-speech via /api/tts.
   * Set via `wrangler secret put OPENAI_API_KEY` to enable. When
   * absent, /api/tts responds 503 with code "tts_disabled" and the
   * client gracefully falls back to browser Web Speech API.
   */
  OPENAI_API_KEY?: string;
  AI: {
    run: (
      model: string,
      input: Record<string, unknown>,
    ) => Promise<{ response?: string | unknown } & Record<string, unknown>>;
  };
  /**
   * Optional Vectorize index for semantic search in /api/ask. Provision
   * with `wrangler vectorize create vozclara-knowledge --dimensions=768
   * --metric=cosine` and bind via the [[vectorize]] block in
   * wrangler.toml. When absent, /api/ask falls back to prompt-stuffing
   * the entire library (capped at ~40 packs).
   */
  VECTORIZE?: {
    upsert: (vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, string | number | boolean>;
    }>) => Promise<{ count: number; ids: string[] }>;
    query: (vector: number[], options: {
      topK?: number;
      filter?: Record<string, unknown>;
      returnValues?: boolean;
      returnMetadata?: boolean;
    }) => Promise<{
      matches: Array<{
        id: string;
        score: number;
        values?: number[];
        metadata?: Record<string, unknown>;
      }>;
    }>;
    deleteByIds: (ids: string[]) => Promise<{ count: number; ids: string[] }>;
  };
  /**
   * KV namespace storing one entry per brainId — the user's push
   * subscription, locale, preferred reminder hour, current
   * next-due-at timestamp from the client's SRS, and bookkeeping.
   *
   * Absence of this binding disables /api/push/* and the scheduled
   * cron handler short-circuits with a single log line.
   */
  PUSH_SUBS?: KVNamespace;
  /** VAPID secrets — required for any /api/push/* call to function. */
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  /**
   * Shared secret for admin-only endpoints (currently
   * /api/curated/refresh). Set via `wrangler secret put ADMIN_TOKEN`.
   * Absent = those endpoints respond 503 and stay unreachable.
   */
  ADMIN_TOKEN?: string;
  /**
   * Paddle webhook signing secret. Used by /api/founder/webhook to
   * verify the HMAC-SHA256 signature on incoming Paddle Billing v2
   * notifications. Generated in the Paddle dashboard under
   * Developer Tools → Notifications → destination → Secret key.
   * Set via `wrangler secret put PADDLE_WEBHOOK_SECRET`. Absent =
   * the webhook endpoint responds 503 webhook_disabled and we fall
   * back to manual counter increments.
   */
  PADDLE_WEBHOOK_SECRET?: string;
  /**
   * Sentry DSN for worker-side error capture. Same project as the
   * frontend; events get tagged environment=worker so the two
   * sources are filterable in the dashboard.
   */
  SENTRY_DSN?: string;
  /**
   * KV namespace for the magic-link auth layer. Stores user records,
   * sessions, magic tokens, and the email→id lookup index. Absent
   * binding → /api/auth/* respond 503 and the app stays in
   * anonymous-first mode.
   */
  AUTH?: KVNamespace;
  /** Resend HTTP-API key for sending magic-link emails. Absent →
   *  auth still works in dev (link is logged to console). */
  RESEND_API_KEY?: string;
  /** Verified Resend sender for outgoing mails. */
  AUTH_FROM_ADDRESS?: string;
  /** Public site origin, used to construct verify-link URLs. */
  SITE_URL?: string;
  /**
   * Durable Object binding for the MCP agent. The class is exported
   * from this file (line 52) and the binding is declared in
   * wrangler.toml `[[durable_objects.bindings]]`. The `agents` SDK
   * uses this DO namespace to persist per-session MCP state.
   */
  MCP_AGENT?: DurableObjectNamespace;
  /**
   * Injected by `@cloudflare/workers-oauth-provider` when this worker
   * is wrapped as its `defaultHandler`. Gives the consent UI access
   * to `parseAuthRequest()` and `completeAuthorization()` without
   * importing the OAuthProvider instance directly.
   */
  OAUTH_PROVIDER?: OAuthHelpers;
  /**
   * Plain-text Cloudflare AI Gateway routing identifiers used to
   * build the Anthropic baseURL for the Pro Plus tier. Defined in
   * `wrangler.toml [vars]` — non-secret, but worker code reads them
   * the same way it reads secrets.
   */
  CF_ACCOUNT_ID?: string;
  CF_AI_GATEWAY_ID?: string;
}

const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const EMBEDDING_DIM = 768;

interface SupadataSegment {
  text: string;
  offset: number;
  duration: number;
  lang: string;
}

interface SupadataResponse {
  content: SupadataSegment[];
  lang: string;
  availableLangs?: string[];
}

interface NormalisedSegment {
  start: number;
  dur: number;
  text: string;
  translated?: string;
}

interface PlayerResponse {
  captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } };
  playabilityStatus?: { status?: string; reason?: string };
  videoDetails?: { title?: string };
}

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: 'asr' | string;
  name?: { simpleText?: string };
}

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const LANG_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;
const SUPPORTED_LANGS = ['de', 'en', 'es', 'pt'] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Public Lingva instances. Free Google-Translate proxies. Rotate.
const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://translate.plausibility.cloud',
  'https://lingva.garudalinux.org',
  'https://lingva.lunar.icu',
];

// Llama 3.3 70B Fast — substantially better reasoning and prose than 3.1 8B,
// still on the free Workers AI tier (uses more neurons per call, but quality
// jump is dramatic). The 8B was readable; the 70B is editorial.
const LLM_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

// Genre detection uses the smaller, faster model — we don't need 70B
// brainpower to pick one of seven categories.
const GENRE_MODEL = '@cf/meta/llama-3.1-8b-instruct';

/**
 * The "default" worker behaviour, wrapped below by `OAuthProvider`.
 *
 * This handler owns:
 *   • all /api/* routes (auth, transcript, insights, founder, rating, …)
 *   • /api/mcp + /api/sse — anonymous Phase 1 MCP transports (Smithery
 *     listing keeps working; OAuth is opt-in via /api/mcp/pro instead)
 *   • /oauth/authorize — delegated to the Hono consent UI in
 *     worker/src/oauth/handler.ts which uses env.OAUTH_PROVIDER
 *     (injected by the wrapping OAuthProvider below) to validate the
 *     auth request and complete the grant after user consent.
 *
 * It does NOT own:
 *   • /oauth/token, /oauth/register, /.well-known/oauth-*  →
 *     handled by OAuthProvider directly.
 *   • /api/mcp/pro + /api/sse/pro → routed by OAuthProvider as
 *     protected `apiHandlers` (require valid Bearer token).
 */
const apiWorker: ExportedHandler<Env> = {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // /oauth/authorize is the only route OAuthProvider explicitly
    // delegates back to the host worker. Anything starting with
    // /oauth/authorize (the bare path or any sub-path) goes to the
    // Hono consent app, which renders the screen on GET and calls
    // env.OAUTH_PROVIDER.completeAuthorization() on POST.
    const earlyUrl = new URL(req.url);
    if (
      earlyUrl.pathname === '/oauth/authorize' ||
      earlyUrl.pathname.startsWith('/oauth/authorize/')
    ) {
      return oauthConsentApp.fetch(req, env, ctx);
    }

    try {
      return await routeRequest(req, env, ctx);
    } catch (err) {
      // Capture every uncaught handler error in Sentry tagged
      // environment=worker. Fire-and-forget via waitUntil so the
      // 500 response goes out without waiting on telemetry.
      const url = new URL(req.url);
      ctx.waitUntil(
        captureWorkerError(env, err, {
          url: req.url,
          method: req.method,
          ip: req.headers.get('CF-Connecting-IP') ?? undefined,
          tags: { endpoint: url.pathname },
        }),
      );
      console.error('worker_uncaught:', err);
      return json({ error: 'internal_error' }, 500);
    }
  },

  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // Two crons fire this handler. Dispatch by the cron expression so
    // each tick only runs its job:
    //   "0 * * * *"     → push notifications (hourly)
    //   "30 19 * * *"   → curated-pack auto-generation (daily 19:30 UTC)
    try {
      if (event.cron === '30 19 * * *') {
        ctx.waitUntil(runDailyCurated(env));
      } else {
        ctx.waitUntil(runPushCron(env));
      }
    } catch (err) {
      ctx.waitUntil(
        captureWorkerError(env, err, { tags: { cron: event.cron } }),
      );
      console.error('cron_uncaught:', err);
    }
  },
};

/**
 * CORS bundle shared between Phase 1 (anonymous) and Phase 2 (OAuth)
 * MCP transports. The `agents` SDK serve() wraps responses but does
 * not set CORS headers by default — without these, browser-based
 * clients (MCP Inspector, web playgrounds) get blocked even though
 * the worker replied. Mcp-Session-Id + Last-Event-ID + Authorization
 * are required headers per the MCP spec for session continuity, SSE
 * resumability, and bearer-token transport.
 */
const MCP_CORS = {
  origin: '*',
  methods: 'GET, POST, OPTIONS',
  headers: 'Content-Type, Mcp-Session-Id, Last-Event-ID, Authorization',
  exposeHeaders: 'Mcp-Session-Id',
};

/**
 * Pre-build the Phase 2 protected handlers ONCE at module load so
 * they keep stable identity across requests. Each call to
 * `.serve()` / `.serveSSE()` returns a fresh ExportedHandler; if we
 * construct them inside the OAuthProvider config object we leak a
 * new object every cold start, and TS infers them as `any`.
 *
 * Routes:
 *   • /api/mcp/pro  → Streamable HTTP, OAuth-required
 *   • /api/sse/pro  → SSE, OAuth-required
 *
 * The same VozClaraMcpAgent class backs both Phase 1 and Phase 2 —
 * the tools themselves consult `this.props` to decide whether the
 * caller is authenticated and what brainId / tier they hold. Phase 1
 * anonymous routes mount the agent without OAuth (this.props is
 * undefined), Phase 2 routes mount it under OAuthProvider (this.props
 * is populated from the grant).
 */
const mcpProHandler = VozClaraMcpAgent.serve('/api/mcp/pro', {
  binding: 'MCP_AGENT',
  corsOptions: MCP_CORS,
});
const ssePromHandler = VozClaraMcpAgent.serveSSE('/api/sse/pro', {
  binding: 'MCP_AGENT',
  corsOptions: MCP_CORS,
});

/**
 * `OAuthProvider` instance — wraps `apiWorker` and adds the OAuth
 * dance on top:
 *
 *   • GET /.well-known/oauth-authorization-server     → metadata
 *   • GET /.well-known/oauth-protected-resource       → resource hint
 *   • POST /oauth/token                                → issue tokens
 *   • POST /oauth/register                             → RFC-7591 DCR
 *   • /api/mcp/pro, /api/sse/pro                       → Bearer-token
 *                                                         required, then
 *                                                         dispatched
 *
 * Anything else falls through to `apiWorker`, including the original
 * anonymous /api/mcp + /api/sse Phase-1 transports.
 *
 * Note on the `Cloudflare.Env` cast: OAuthProvider's generics default
 * to that global type, but our `Env` interface above is the source of
 * truth for this worker. The cast lets us reuse `apiWorker` directly
 * without duplicating the env definition.
 */
const oauthProvider = new OAuthProvider({
  apiHandlers: {
    '/api/mcp/pro': mcpProHandler,
    '/api/sse/pro': ssePromHandler,
  },
  defaultHandler: apiWorker as unknown as ExportedHandler<Cloudflare.Env>,
  authorizeEndpoint: '/oauth/authorize',
  tokenEndpoint: '/oauth/token',
  clientRegistrationEndpoint: '/oauth/register',
  // OAuth 2.1 best practices — no implicit flow, S256-only PKCE.
  allowImplicitFlow: false,
  allowPlainPKCE: false,
  // Scopes advertised in metadata. Tools consult `this.props.tier`
  // at invocation time for actual gating; scopes are coarse hints
  // for the consent screen + client capability declaration.
  scopesSupported: ['library:read', 'library:write', 'profile'],
  // 1h access tokens, 30-day refresh tokens — matches Granola /
  // Linear MCP server norms. Short access + long refresh keeps the
  // blast radius of a leaked access token small while avoiding the
  // re-consent prompt every hour.
  accessTokenTTL: 3600,
  refreshTokenTTL: 60 * 60 * 24 * 30,
});

/**
 * Worker entrypoint. `OAuthProvider` only ships a `fetch` handler;
 * we wrap it in a thin object so the existing `scheduled` cron flow
 * stays intact. All HTTP traffic goes through OAuth routing first;
 * everything that isn't an OAuth endpoint or a protected API route
 * falls through to `apiWorker`.
 */
export default {
  fetch: (req: Request, env: Env, ctx: ExecutionContext): Promise<Response> =>
    oauthProvider.fetch(req, env as unknown as Cloudflare.Env, ctx),
  scheduled: apiWorker.scheduled!,
} satisfies ExportedHandler<Env>;

async function routeRequest(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    // Phase 1 MCP transports — anonymous, free-tier-only.
    // /api/mcp/pro + /api/sse/pro are routed by OAuthProvider above
    // before we ever get here, so we can't accidentally double-serve
    // them. `MCP_CORS` lives at module scope so both tiers share it.
    //
    // `binding: 'MCP_AGENT'` is required — the agents SDK defaults to
    // looking for a DO binding named MCP_OBJECT; ours is MCP_AGENT
    // per wrangler.toml. Without this we get a 500 with
    // "Could not find McpAgent binding for MCP_OBJECT" at request time.
    if (url.pathname === '/api/mcp' || url.pathname.startsWith('/api/mcp/')) {
      return VozClaraMcpAgent.serve('/api/mcp', {
        binding: 'MCP_AGENT',
        corsOptions: MCP_CORS,
      }).fetch(req, env, ctx);
    }
    if (url.pathname === '/api/sse' || url.pathname.startsWith('/api/sse/')) {
      return VozClaraMcpAgent.serveSSE('/api/sse', {
        binding: 'MCP_AGENT',
        corsOptions: MCP_CORS,
      }).fetch(req, env, ctx);
    }

    if (url.pathname === '/' || url.pathname === '/health') {
      return json({
        ok: true,
        service: 'vozclara',
        provider: env.SUPADATA_API_KEY ? 'supadata' : 'innertube-direct',
        translator: 'lingva',
        llm: LLM_MODEL,
      });
    }

    if (url.pathname === '/api/transcript' && req.method === 'GET') {
      return handleTranscript(url, env);
    }

    if (url.pathname === '/api/insights' && req.method === 'POST') {
      const limit = await rateLimit(env, req, 'insights', 5);
      if (limit) return limit;
      return handleInsights(req, env);
    }

    if (url.pathname === '/api/ask' && req.method === 'POST') {
      const limit = await rateLimit(env, req, 'ask', 10);
      if (limit) return limit;
      return handleAsk(req, env);
    }

    if (url.pathname === '/api/chat' && req.method === 'POST') {
      const limit = await rateLimit(env, req, 'chat', 20);
      if (limit) return limit;
      return handleChat(req, env);
    }

    if (url.pathname === '/api/tts/health' && req.method === 'GET') {
      return json({
        available: !!env.OPENAI_API_KEY,
        provider: env.OPENAI_API_KEY ? 'openai' : null,
        model: env.OPENAI_API_KEY ? 'tts-1' : null,
      });
    }

    if (url.pathname === '/api/tts' && req.method === 'POST') {
      return handleTTS(req, env);
    }

    if (url.pathname === '/api/index/health' && req.method === 'GET') {
      return json({
        available: !!env.VECTORIZE,
        provider: env.VECTORIZE ? 'cloudflare-vectorize' : null,
        model: env.VECTORIZE ? EMBEDDING_MODEL : null,
        dimensions: env.VECTORIZE ? EMBEDDING_DIM : null,
      });
    }

    if (url.pathname === '/api/index' && req.method === 'POST') {
      return handleIndex(req, env);
    }

    if (url.pathname === '/api/index' && req.method === 'DELETE') {
      return handleIndexDelete(req, env);
    }

    if (url.pathname === '/api/og' && req.method === 'GET') {
      return handleOG(url);
    }

    if (url.pathname === '/api/quote-card' && req.method === 'GET') {
      return handleQuoteCard(url);
    }

    if (url.pathname === '/api/curated' && req.method === 'GET') {
      return handleCurated(env);
    }

    if (url.pathname === '/api/subscribe' && req.method === 'POST') {
      // Rate-limited per IP so a script can't flood the waitlist KV
      // with garbage e-mails.
      const limit = await rateLimit(env, req, 'subscribe', 5);
      if (limit) return limit;
      return handleSubscribe(req, env);
    }

    if (url.pathname === '/api/curated/refresh' && req.method === 'POST') {
      // Admin-only manual trigger for the daily-curated cron. Used to
      // verify the YouTube RSS → KV pipeline without waiting for
      // 19:30 UTC. Gated by an X-Refresh-Token header that must match
      // the ADMIN_TOKEN wrangler secret. Absent secret = 503.
      if (!env.ADMIN_TOKEN) return json({ error: 'admin_disabled' }, 503);
      if (req.headers.get('X-Refresh-Token') !== env.ADMIN_TOKEN) {
        return json({ error: 'unauthorized' }, 401);
      }
      await runDailyCurated(env);
      return json({ ok: true });
    }

    if (url.pathname === '/api/push/config' && req.method === 'GET') {
      return json({
        available: !!(env.PUSH_SUBS && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
        publicKey: env.VAPID_PUBLIC_KEY ?? null,
      });
    }

    if (url.pathname === '/api/push/subscribe' && req.method === 'POST') {
      return handlePushSubscribe(req, env);
    }

    if (url.pathname === '/api/push/state' && req.method === 'POST') {
      return handlePushState(req, env);
    }

    if (url.pathname === '/api/push/unsubscribe' && req.method === 'POST') {
      return handlePushUnsubscribe(req, env);
    }

    if (url.pathname === '/api/push/test' && req.method === 'POST') {
      // Authenticated only by knowledge of the brainId. Sends a single
      // push to the caller's subscription so they can verify the round
      // trip works before relying on the cron.
      return handlePushTest(req, env);
    }

    /* ─── /api/auth/* — magic-link sign-in ──────────────────────────── *
     *
     * Anonymous-first product, so these routes only activate when the
     * AUTH KV binding is provisioned. Until then they 503 and the
     * frontend stays in IndexedDB-only mode. See worker/src/auth.ts.
     */
    if (url.pathname === '/api/auth/request' && req.method === 'POST') {
      const limit = await rateLimit(env, req, 'auth_request', 5);
      if (limit) return limit;
      return handleAuthRequest(req, env);
    }

    if (url.pathname === '/api/auth/verify' && req.method === 'GET') {
      return handleAuthVerify(req, env);
    }

    if (url.pathname === '/api/auth/me' && req.method === 'GET') {
      return handleAuthMe(req, env);
    }

    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      return handleAuthLogout(req, env);
    }

    if (url.pathname === '/api/auth/attach-brain' && req.method === 'POST') {
      return handleAuthAttachBrain(req, env);
    }

    if (url.pathname === '/api/auth/profile' && req.method === 'PATCH') {
      const limit = await rateLimit(env, req, 'auth_profile', 30);
      if (limit) return limit;
      return handleAuthProfile(req, env);
    }

    if (url.pathname === '/api/auth/account' && req.method === 'DELETE') {
      const limit = await rateLimit(env, req, 'auth_delete', 3);
      if (limit) return limit;
      return handleAuthDelete(req, env);
    }

    /* ─── /api/rating/* — Michelin Rating ───────────────────────────── *
     *
     * 👍/👎 + 4 1-tap signals anonymously, ⭐ + text review with an
     * account. Aggregated per videoId. See worker/src/rating.ts.
     */
    if (url.pathname === '/api/rating' && req.method === 'POST') {
      const limit = await rateLimit(env, req, 'rating_post', 20);
      if (limit) return limit;
      return handleRatingPost(req, env);
    }

    if (url.pathname === '/api/rating' && req.method === 'GET') {
      return handleRatingGet(url, env);
    }

    if (url.pathname === '/api/rating/me' && req.method === 'GET') {
      return handleRatingMe(req, env);
    }

    if (url.pathname === '/api/rating/top' && req.method === 'GET') {
      return handleRatingTop(url, env);
    }

    if (url.pathname === '/api/rating/bulk' && req.method === 'POST') {
      return handleRatingBulk(req, env);
    }

    if (url.pathname === '/api/rating/reviews' && req.method === 'GET') {
      return handleRatingReviews(url, env);
    }

    /* ─── /api/founder/* — Founder Deal counter (launch cashflow) ────── *
     *
     * Public read of how many of the 100 seats remain; admin-only
     * write to bump the counter when a sale comes in. See
     * worker/src/founder.ts.
     */
    if (url.pathname === '/api/founder/status' && req.method === 'GET') {
      return handleFounderStatus(req, env);
    }
    if (url.pathname === '/api/founder/admin/increment' && req.method === 'POST') {
      return handleFounderIncrement(req, env);
    }
    if (url.pathname === '/api/founder/admin/set' && req.method === 'POST') {
      return handleFounderSet(req, env);
    }
    if (url.pathname === '/api/founder/webhook' && req.method === 'POST') {
      // Paddle pushes transaction.completed here. Signature-verified
      // inside the handler — no rate-limit because Paddle's own retry
      // policy is the rate-control and we 401 fast on bad signatures.
      return handleFounderWebhook(req, env);
    }

    return json({ error: 'not_found' }, 404);
}

/* ─── /api/transcript ───────────────────────────────────────────────────── */

async function handleTranscript(url: URL, env: Env): Promise<Response> {
  const videoId = url.searchParams.get('v') ?? '';
  // `lang` is now optional. When absent, we ask Supadata / Innertube for
  // the video's native captions and trust the response to tell us which
  // language those captions are in. When present, we honour it as a
  // preferred source language hint (legacy behaviour). This fixes the
  // long-standing bug where the frontend hardcoded lang=de and any
  // non-German source returned no_captions on the first try.
  const langParam = url.searchParams.get('lang');
  const lang: string | null = langParam && langParam.length > 0 ? langParam : null;
  const to = url.searchParams.get('to');

  if (!ID_PATTERN.test(videoId)) return json({ error: 'invalid_id' }, 400);
  if ((lang && !LANG_PATTERN.test(lang)) || (to && !LANG_PATTERN.test(to))) {
    return json({ error: 'invalid_lang' }, 400);
  }

  try {
    const result = env.SUPADATA_API_KEY
      ? await fetchViaSupadata(videoId, lang, to ?? null, env.SUPADATA_API_KEY)
      : await fetchViaInnertube(videoId, lang, to ?? null);

    return json(result, 200, {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    });
  } catch (err) {
    return transcriptError(err);
  }
}

function transcriptError(err: unknown): Response {
  const message = err instanceof Error ? err.message : String(err);
  const code =
    message === 'no_captions' || message === 'caption_empty' ? 'no_captions' :
    message === 'rate_limited' ? 'rate_limited' :
    message === 'quota_exceeded' ? 'quota_exceeded' :
    'fetch_failed';
  const status =
    code === 'no_captions' ? 404 :
    code === 'rate_limited' ? 429 :
    code === 'quota_exceeded' ? 402 :
    502;
  return json({ error: code, detail: message }, status);
}

/* ─── /api/insights ─────────────────────────────────────────────────────── */

interface InsightsRequest {
  videoId: string;
  transcript: string;
  sourceLang: string;
  targetLang: string;
  genre?: Genre;
  mode?: Mode;
}

type Genre =
  | 'news'           // Tagesschau, news broadcasts
  | 'business'       // business analysis, corporate news
  | 'coaching'       // personal development, life coaching
  | 'education'      // tutorials, lectures, explainers
  | 'interview'      // expert interviews, podcasts
  | 'creator'        // vlogs, lifestyle, opinion
  | 'general';       // unclassified

async function handleInsights(req: Request, env: Env): Promise<Response> {
  let body: InsightsRequest;
  try {
    body = (await req.json()) as InsightsRequest;
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const { transcript, sourceLang, targetLang } = body;
  if (!transcript || transcript.length < 50) {
    return json({ error: 'transcript_too_short' }, 400);
  }
  if (!SUPPORTED_LANGS.includes(targetLang as SupportedLang)) {
    return json({ error: 'unsupported_target_lang' }, 400);
  }
  const mode: Mode = normaliseMode(body.mode);

  try {
    const genre = body.genre ?? (await detectGenre(transcript, env));
    const insights = await generateInsights(transcript, sourceLang, targetLang, genre, mode, env);
    return json({ genre, mode, ...insights }, 200, {
      'Cache-Control': 'public, max-age=86400',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: 'ai_failed', detail: message.slice(0, 200) }, 502);
  }
}

async function detectGenre(transcript: string, env: Env): Promise<Genre> {
  const excerpt = transcript.slice(0, 1500);
  const prompt = `Classify the following video transcript excerpt into exactly one of these categories. Respond with only the single word category, lowercase, nothing else.

Categories: news, business, coaching, education, interview, creator, general

Definitions:
- news: news broadcasts, current affairs, journalism
- business: corporate analysis, finance, economics, market commentary
- coaching: personal development, motivation, life advice, self-improvement
- education: tutorials, lectures, instructional content, explainers
- interview: conversations with experts, podcasts with guests, Q&A formats
- creator: vlogs, opinion content, lifestyle, entertainment commentary
- general: anything that doesn't fit cleanly

Transcript:
${excerpt}

Category:`;

  const out = await env.AI.run(GENRE_MODEL, {
    messages: [
      { role: 'system', content: 'You are a precise classifier. Output exactly one word.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 12,
    temperature: 0,
  });
  const responseStr = typeof out.response === 'string' ? out.response : '';
  const raw = responseStr.trim().toLowerCase().replace(/[^a-z]/g, '');
  if ((['news', 'business', 'coaching', 'education', 'interview', 'creator', 'general'] as const).includes(raw as Genre)) {
    return raw as Genre;
  }
  return 'general';
}

interface InsightOutput {
  title: string;
  body: string;
}

interface VocabularyOutput {
  word: string;
  translation: string;
  context: string;
  partOfSpeech?: string;
}

interface QuizQuestionOutput {
  question: string;
  answer: string;
  explanation?: string;
}

interface SocialAngleOutput {
  hook: string;
  caption: string;
}

interface ChapterOutput {
  startSec: number;
  title: string;
  summary: string;
}

interface KeyQuoteOutput {
  text: string;
  original?: string;
  speaker?: string;
  timestampSec: number;
}

interface InsightsOutput {
  summary: { short: string; long: string };
  tldr?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  insights: InsightOutput[];
  actionPlan: string[];
  vocabulary: VocabularyOutput[];
  quiz: QuizQuestionOutput[];
  socialAngles: SocialAngleOutput[];
  chapters: ChapterOutput[];
  keyQuotes: KeyQuoteOutput[];
  tags: string[];
}

/** Tier the pack output by video length (proxy: transcript char count).
 *  Rough mapping: ~12.5 chars per second of spoken transcript.
 *    < 2.5k   → < 3 min   → micro
 *    2.5k–10k → 3–13 min  → standard
 *    10k–30k  → 13–40 min → deep
 *    > 30k    → > 40 min  → comprehensive
 *  The tier name flows into the prompt so the LLM scales item counts. */
type LengthTier = 'micro' | 'standard' | 'deep' | 'comprehensive';
function deriveLengthTier(transcriptChars: number): LengthTier {
  if (transcriptChars < 2500) return 'micro';
  if (transcriptChars < 10000) return 'standard';
  if (transcriptChars < 30000) return 'deep';
  return 'comprehensive';
}

/**
 * Four production modes — mirrored from src/lib/pack.ts. The legacy
 * key `business` migrates to `brief` here too (handlers normalise
 * incoming payloads via normaliseMode below).
 */
type Mode = 'learn' | 'brief' | 'study' | 'creator';

function normaliseMode(raw: unknown): Mode {
  if (typeof raw !== 'string') return 'brief';
  if (raw === 'learn' || raw === 'brief' || raw === 'study' || raw === 'creator') {
    return raw;
  }
  if (raw === 'business') return 'brief';
  return 'brief';
}

const LANG_NAME: Record<string, string> = {
  de: 'German',
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
};

function modePromptVoice(mode: Mode, targetLang: string): string {
  const lang = LANG_NAME[targetLang] ?? 'English';
  const base = `Write in clear, well-formed ${lang}. No exclamation marks, no superlatives, no emoji.`;

  switch (mode) {
    case 'learn':
      return `You are a patient, precise teacher. Your reader is using this video to learn. Output clear explanations that scaffold from concrete to abstract. Identify what concepts depend on which, and what the learner should be able to do after watching. ${base}`;
    case 'brief':
      return `You write executive briefings. Your reader is a decision-maker scanning for strategic implications, market signals, and second-order consequences. Be specific, not generic. ${base}`;
    case 'study':
      return `You are an academic study-companion. Your reader is a student turning a lecture or explainer video into study material. Output structured chapter summaries that mirror the source's pedagogy, surface the testable concepts, and produce comprehension questions that check real understanding — not trivia. Cite timestamps so the student can rewind to the source moment. ${base}`;
    case 'creator':
      return `You repurpose long-form content for short-form distribution. Your reader is a content creator looking for hooks, angles and captions that work on social platforms. Be concrete and quotable. ${base}`;
  }
}

function structuredInstruction(targetLang: string, mode: Mode, tier: LengthTier): string {
  const lang = LANG_NAME[targetLang] ?? 'English';

  const baseSchema = `{
  "tldr": "ONE single sentence in ${lang}, max 22 words. The headline answer — what changes for the viewer after watching. Punchy and concrete, no hedging.",
  "difficulty": "Single CEFR level (A1|A2|B1|B2|C1|C2) reflecting the language level required to follow the SOURCE audio without subtitles. Consider pace, vocabulary range, idiom density.",
  "summary": {
    "short": "1-2 sentences in ${lang}. Slightly longer than tldr — sets context. Punchy, not bland.",
    "long": "5-8 sentences in ${lang}, single paragraph. The reader should be able to brief a colleague after reading this and feel they actually know the video."
  },
  "insights": [
    { "title": "Short editorial headline in ${lang}, 4-10 words, no period", "body": "2-4 sentences in ${lang} that elaborate with real substance: state the claim, give the reasoning or evidence the video offered, surface implications the viewer might miss." },
    ...
  ],
  "actionPlan": ["concrete action 1 in ${lang}, verb-first, specific, ideally with a timeframe", ...],
  "vocabulary": [
    { "word": "important_term_in_source_language", "translation": "translation in ${lang}", "context": "the sentence from the video that uses the term", "partOfSpeech": "noun/verb/adjective/etc" },
    ...
  ],
  "quiz": [
    { "question": "question in ${lang}", "answer": "the answer in ${lang}", "explanation": "2-3 sentences explaining why and connecting to other concepts in the video" },
    ...
  ],
  "socialAngles": [
    { "hook": "scroll-stopping first line in ${lang}, ≤90 chars, with bite", "caption": "the rest of a social post in ${lang}, 3-5 sentences, ends with a question or claim that invites reply" },
    ...
  ],
  "chapters": [
    { "startSec": 0, "title": "chapter title in ${lang}, 3-8 words", "summary": "1-2 sentences in ${lang}" },
    ...
  ],
  "keyQuotes": [
    { "text": "memorable line translated to ${lang}", "original": "original line in source language", "speaker": "speaker name if known, otherwise null", "timestampSec": 0 },
    ...
  ],
  "tags": ["3-5 single-word or two-word tags in ${lang}, lowercase. Use the topic / domain / proper nouns / industry — not generic words like 'video' or 'idea'.", ...]
}`;

  /* Tier multipliers: a 90-min talk should produce more chapters and more
     vocab than a 3-min clip. Counts below are scaled from the standard
     baseline by the tier factor. Tier comes from transcript length. */
  const tierFactor: Record<LengthTier, number> = {
    micro: 0.4,
    standard: 1.0,
    deep: 1.5,
    comprehensive: 2.0,
  };
  const f = tierFactor[tier];
  const range = (lo: number, hi: number) => {
    const newLo = Math.max(1, Math.round(lo * f));
    const newHi = Math.max(newLo + 1, Math.round(hi * f));
    return `${newLo}-${newHi}`;
  };
  /* Insights, quotes, and quiz counts cap regardless of tier — past a
     point more items just dilute quality. */
  const cap = (lo: number, hi: number, ceiling: number) => {
    const newLo = Math.max(1, Math.round(lo * f));
    const newHi = Math.min(ceiling, Math.max(newLo + 1, Math.round(hi * f)));
    return `${newLo}-${newHi}`;
  };

  const tierNote = `VIDEO LENGTH TIER: ${tier.toUpperCase()} — scale item counts so the Pack feels right for the source length. A 2-min clip should NOT produce 18 vocabulary items; a 90-min talk SHOULD produce more than 8.`;

  const modeRules = {
    learn: `LEARN-MODE — the reader is studying with this video:
- "insights": ${cap(5, 8, 12)} items. Focus on concepts, frameworks, mental models, and the order of dependencies between ideas.
- "vocabulary": ${range(10, 18)} items. Pick terms useful beyond this video — domain vocabulary, idioms, technical or culturally-loaded terms. Skip everyday words.
- "quiz": ${cap(6, 10, 14)} questions. Mix comprehension, application, and connection-to-other-concepts.
- "chapters": ${range(5, 10)} items. Each titled descriptively (not just "Section 1").
- "actionPlan": 0-4 items (only if content actually proposes practice or experiments).
- "keyQuotes": ${cap(0, 3, 6)} items (only memorable lines that crystallise concepts).
- "socialAngles": [] (not relevant in Learn mode).`,
    brief: `BRIEF-MODE — the reader is a decision-maker scanning for signal:
- "insights": ${cap(5, 8, 12)} items. Strategic implications, market signals, second-order consequences, structural shifts. Each must add value the bare transcript doesn't.
- "actionPlan": ${cap(4, 6, 10)} concrete actions a brief-reader could take this week. Verb-first, specific.
- "keyQuotes": ${cap(4, 6, 12)} items. Statements of position, fact, commitment, or contradiction. Include speaker.
- "chapters": ${range(4, 8)} items.
- "vocabulary": ${cap(0, 6, 12)} items (only domain-specific terms a non-specialist might miss).
- "quiz": [] (not relevant in Brief mode).
- "socialAngles": [] (not relevant in Brief mode).`,
    study: `STUDY-MODE — the reader is a student turning this lecture / explainer into study material:
- "insights": ${cap(6, 10, 14)} items. Each is a testable concept: state the claim, give the reasoning the video offered, note what it depends on or implies. Order them by pedagogical dependency (foundational → advanced).
- "chapters": ${range(6, 12)} items. Each summary is 2-3 sentences and acts as a chapter-grade revision note — the student should be able to rebuild the lecture's argument from the summaries alone. Use accurate startSec timestamps so the student can rewind.
- "quiz": ${cap(8, 12, 18)} questions. Mix recall, comprehension, application and synthesis. Each explanation is 2-3 sentences and connects to other concepts in the video. Always include timestampSec pointing to where the answer is established in the source.
- "vocabulary": ${range(8, 14)} items. Domain terminology, key technical vocabulary, terms-of-art the lecturer assumes the student already knows or introduces explicitly.
- "actionPlan": ${cap(3, 5, 8)} items framed as study tasks (re-read X, attempt problem Y, test yourself on Z).
- "keyQuotes": ${cap(3, 6, 10)} items. Pick the lecturer's definitional statements, the precise framings worth memorising verbatim. Include timestampSec.
- "socialAngles": [] (not relevant in Study mode).`,
    creator: `CREATOR-MODE — the reader is a content creator repurposing this video:
- "insights": ${cap(4, 6, 10)} items. Focus on hooks, angles, contrarian-but-defendable points, structural moves the speaker uses.
- "socialAngles": ${cap(6, 10, 16)} items. Each "hook" is a scroll-stopper (question, claim, or surprising stat). Each "caption" is a 3-5 sentence post body that ends with an invitation to reply.
- "keyQuotes": ${cap(6, 12, 20)} items. Maximise quotable moments — anything punchy, self-contained, screenshot-worthy.
- "chapters": ${range(3, 6)} items.
- "vocabulary": [] (not relevant in Creator mode).
- "actionPlan": ${cap(2, 4, 8)} items focused on content strategy (which platform, which format, which audience).
- "quiz": [] (not relevant in Creator mode).`,
  }[mode];

  return `Output ONLY a single JSON object matching this schema. No preamble, no markdown fences, no prose outside the JSON.

${baseSchema}

${tierNote}

${modeRules}

Quality bar — non-negotiable:
- Write like an editor at a serious publication. Specific, declarative, no hedging.
- Every sentence must add information the previous one didn't.
- No platitudes ("communication is important", "data is valuable"). Capture WHAT THIS SPECIFIC VIDEO said.
- For news content: surface what changed, what's at stake, who is affected, what to watch next.
- For arguments: surface the strongest version of the speaker's case AND any contradictions they themselves raise.

Universal rules:
- All field VALUES in ${lang}. Field NAMES stay in English.
- "vocabulary[].word" stays in the source language (it's the term being learned).
- "keyQuotes[].original" stays in the source language; "text" is the translation.
- Strict JSON. No trailing commas. No code fences. Arrays that don't fit the mode return [].`;
}

async function generateInsights(
  transcript: string,
  sourceLang: string,
  targetLang: string,
  genre: Genre,
  mode: Mode,
  env: Env,
): Promise<InsightsOutput> {
  /* Tier from the FULL transcript length, before truncation — we want
     the LLM to scale its output for the original video, not for the
     bounded slice we feed it. */
  const tier = deriveLengthTier(transcript.length);

  const bounded = transcript.length > 12000
    ? transcript.slice(0, 6000) + '\n\n[…truncated…]\n\n' + transcript.slice(-3000)
    : transcript;

  const systemPrompt = modePromptVoice(mode, targetLang) + '\n\n' + structuredInstruction(targetLang, mode, tier);
  const userPrompt = `Source language: ${LANG_NAME[sourceLang] ?? sourceLang}. Detected genre: ${genre}. Mode: ${mode}. Length tier: ${tier}.

Transcript:
${bounded}`;

  const out = await env.AI.run(LLM_MODEL, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    // 70B + expanded schema = larger output. 5000 tokens covers Learn
    // mode (heaviest: 18 vocab + 10 quiz + 8 insights + ...). Costs more
    // neurons but delivers editorial-grade volume.
    max_tokens: 5000,
    temperature: 0.35,
  });

  // Defensive coercion: 70B model sometimes returns a non-string response
  // depending on output_schema. Stringify whatever it gives us.
  let raw: string;
  if (typeof out === 'string') raw = out;
  else if (out && typeof out.response === 'string') raw = out.response;
  else if (out && out.response != null) raw = JSON.stringify(out.response);
  else raw = JSON.stringify(out);

  return parseInsightsJson(raw.trim());
}

function parseInsightsJson(raw: string): InsightsOutput {
  let text = raw;
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) text = fenced[1];

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) text = text.slice(first, last + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return emptyInsightsOutput(raw.slice(0, 500));
  }

  const p = parsed as Record<string, unknown>;

  // Summary: tolerate both the new {short, long} shape and the legacy
  // plain-string shape.
  let summary: InsightsOutput['summary'];
  if (p.summary && typeof p.summary === 'object' && !Array.isArray(p.summary)) {
    const s = p.summary as Record<string, unknown>;
    summary = {
      short: typeof s.short === 'string' ? s.short : '',
      long: typeof s.long === 'string' ? s.long : (typeof s.short === 'string' ? s.short : ''),
    };
  } else if (typeof p.summary === 'string') {
    const text = p.summary;
    const firstSentence = text.match(/^.{20,200}?[.!?](?=\s|$)/)?.[0] ?? text.slice(0, 160);
    summary = { short: firstSentence, long: text };
  } else {
    summary = { short: '', long: '' };
  }

  const insights = normaliseInsightArray(p.insights);
  const actionPlan = stringArray(p.actionPlan);
  const vocabulary = normaliseVocabArray(p.vocabulary);
  const quiz = normaliseQuizArray(p.quiz);
  const socialAngles = normaliseSocialAngles(p.socialAngles);
  const chapters = normaliseChapterArray(p.chapters);
  const keyQuotes = normaliseKeyQuoteArray(p.keyQuotes);
  const tags = normaliseTags(p.tags);
  /* TL;DR — accept either the dedicated field or fall back to summary.short
     trimmed to a single sentence. Models sometimes drop the field; this
     keeps the UI consistent. */
  const tldr = normaliseTldr(p.tldr, summary.short);
  const difficulty = normaliseDifficulty(p.difficulty);

  return { summary, tldr, difficulty, insights, actionPlan, vocabulary, quiz, socialAngles, chapters, keyQuotes, tags };
}

function normaliseTldr(v: unknown, fallback: string): string | undefined {
  if (typeof v === 'string' && v.trim().length > 0) {
    return v.trim().slice(0, 280);
  }
  if (fallback) {
    const firstSentence = fallback.match(/^.{10,200}?[.!?](?=\s|$)/)?.[0] ?? fallback.slice(0, 200);
    return firstSentence;
  }
  return undefined;
}

function normaliseDifficulty(v: unknown): InsightsOutput['difficulty'] {
  if (typeof v !== 'string') return undefined;
  const upper = v.trim().toUpperCase();
  if (upper === 'A1' || upper === 'A2' || upper === 'B1' || upper === 'B2' || upper === 'C1' || upper === 'C2') {
    return upper;
  }
  return undefined;
}

function emptyInsightsOutput(fallbackSummary = ''): InsightsOutput {
  return {
    summary: { short: '', long: fallbackSummary },
    insights: [],
    actionPlan: [],
    vocabulary: [],
    quiz: [],
    socialAngles: [],
    chapters: [],
    keyQuotes: [],
    tags: [],
  };
}

/**
 * Clean LLM-generated tag list: lowercase, trim, drop empties, dedupe,
 * cap at 6 to keep card-display tidy. Filters out generic noise words
 * the model sometimes emits despite the prompt instructions.
 */
function normaliseTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const stop = new Set(['video', 'idea', 'topic', 'content', 'pack', 'youtube']);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of v) {
    if (typeof raw !== 'string') continue;
    const tag = raw.trim().toLowerCase().slice(0, 32);
    if (!tag || tag.length < 2 || stop.has(tag)) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= 6) break;
  }
  return out;
}

function stringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function normaliseInsightArray(v: unknown): InsightOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): InsightOutput | null => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        const splitAt = trimmed.search(/[.:;—]/);
        if (splitAt > 0 && splitAt < 80) {
          return { title: trimmed.slice(0, splitAt).trim(), body: trimmed.slice(splitAt + 1).trim() || trimmed };
        }
        return { title: trimmed.slice(0, 80), body: trimmed };
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const title = typeof obj.title === 'string' ? obj.title.trim() : '';
        const body = typeof obj.body === 'string' ? obj.body.trim() : '';
        if (!title && !body) return null;
        return { title: title || body.slice(0, 60), body: body || title };
      }
      return null;
    })
    .filter((x): x is InsightOutput => x !== null);
}

function normaliseVocabArray(v: unknown): VocabularyOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): VocabularyOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const word = typeof o.word === 'string' ? o.word.trim() : '';
      const translation = typeof o.translation === 'string' ? o.translation.trim() : '';
      if (!word || !translation) return null;
      return {
        word,
        translation,
        context: typeof o.context === 'string' ? o.context : '',
        partOfSpeech: typeof o.partOfSpeech === 'string' ? o.partOfSpeech : undefined,
      };
    })
    .filter((x): x is VocabularyOutput => x !== null);
}

function normaliseQuizArray(v: unknown): QuizQuestionOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): QuizQuestionOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const question = typeof o.question === 'string' ? o.question.trim() : '';
      const answer = typeof o.answer === 'string' ? o.answer.trim() : '';
      if (!question || !answer) return null;
      return {
        question,
        answer,
        explanation: typeof o.explanation === 'string' ? o.explanation : undefined,
      };
    })
    .filter((x): x is QuizQuestionOutput => x !== null);
}

function normaliseSocialAngles(v: unknown): SocialAngleOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): SocialAngleOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const hook = typeof o.hook === 'string' ? o.hook.trim() : '';
      const caption = typeof o.caption === 'string' ? o.caption.trim() : '';
      if (!hook && !caption) return null;
      return { hook: hook || caption.slice(0, 80), caption: caption || hook };
    })
    .filter((x): x is SocialAngleOutput => x !== null);
}

function normaliseChapterArray(v: unknown): ChapterOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): ChapterOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const title = typeof o.title === 'string' ? o.title.trim() : '';
      if (!title) return null;
      return {
        startSec: typeof o.startSec === 'number' ? o.startSec : 0,
        title,
        summary: typeof o.summary === 'string' ? o.summary : '',
      };
    })
    .filter((x): x is ChapterOutput => x !== null);
}

function normaliseKeyQuoteArray(v: unknown): KeyQuoteOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): KeyQuoteOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const text = typeof o.text === 'string' ? o.text.trim() : '';
      if (!text) return null;
      return {
        text,
        original: typeof o.original === 'string' ? o.original : undefined,
        speaker: typeof o.speaker === 'string' ? o.speaker : undefined,
        timestampSec: typeof o.timestampSec === 'number' ? o.timestampSec : 0,
      };
    })
    .filter((x): x is KeyQuoteOutput => x !== null);
}

/* ─── Supadata ─────────────────────────────────────────────────────────── */

async function fetchViaSupadata(
  videoId: string,
  lang: string | null,
  to: string | null,
  apiKey: string,
) {
  const orig = await supadataCall('/v1/youtube/transcript', videoId, lang, apiKey);
  if (!orig.content || orig.content.length === 0) throw new Error('no_captions');

  let segments: NormalisedSegment[] = orig.content
    .map((s) => ({
      start: s.offset / 1000,
      dur: s.duration / 1000,
      text: cleanText(s.text),
    }))
    .filter((s) => s.text.length > 0);

  if (to && to !== orig.lang) {
    segments = await attachTranslations(segments, orig.lang, to);
  } else if (to === orig.lang) {
    // Source already matches target — just mirror text into translated.
    segments = segments.map((s) => ({ ...s, translated: s.text }));
  }

  return {
    videoId,
    lang: orig.lang,
    translatedTo: to ?? undefined,
    kind: 'manual',
    segments,
  };
}

async function supadataCall(
  path: string,
  videoId: string,
  lang: string | null,
  apiKey: string,
): Promise<SupadataResponse> {
  // Only append &lang= when a preferred source language was given;
  // otherwise let Supadata return the video's native captions.
  const langPart = lang ? `&lang=${lang}` : '';
  const url = `https://api.supadata.ai${path}?videoId=${videoId}${langPart}&text=false`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (res.status === 429) throw new Error('rate_limited');
  if (res.status === 402) throw new Error('quota_exceeded');
  if (res.status === 401 || res.status === 403) throw new Error(`auth_failed_${res.status}`);
  if (res.status === 404) throw new Error('no_captions');
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`supadata_http_${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as SupadataResponse;
}

/* ─── Translation via Lingva ────────────────────────────────────────────── */

function isStageDirection(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return (
    /^[*♪♫][\s\S]*[*♪♫]$/.test(t) ||
    /^\(.+\)$/.test(t) ||
    /^\[.+\]$/.test(t)
  );
}

async function lingvaTranslate(text: string, from: string, to: string): Promise<string | null> {
  const order = [...LINGVA_INSTANCES].sort(() => Math.random() - 0.5);
  for (const base of order) {
    try {
      const url = `${base}/api/v1/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = (await res.json()) as { translation?: string };
      if (data.translation && data.translation.trim().length > 0) return data.translation;
    } catch {
      // Try next instance.
    }
  }
  return null;
}

async function attachTranslations(
  segments: NormalisedSegment[],
  from: string,
  to: string,
): Promise<NormalisedSegment[]> {
  const CONCURRENCY = 4;
  const out = segments.map((s) => ({ ...s }));
  let next = 0;

  async function worker() {
    while (next < out.length) {
      const i = next++;
      const original = out[i].text;
      if (isStageDirection(original)) {
        out[i].translated = original;
        continue;
      }
      const translated = await lingvaTranslate(original, from, to);
      if (translated) out[i].translated = translated;
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return out;
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/* ─── Innertube fallback (local dev only) ───────────────────────────────── */

interface ClientProfile {
  name: string;
  key: string;
  userAgent: string;
  context: Record<string, unknown>;
}

const CLIENTS: ClientProfile[] = [
  {
    name: 'IOS',
    key: 'AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc',
    userAgent: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)',
    context: {
      client: {
        clientName: 'IOS',
        clientVersion: '20.10.4',
        deviceMake: 'Apple',
        deviceModel: 'iPhone16,2',
        osName: 'iPhone',
        osVersion: '18.3.2.22D82',
        hl: 'de',
        gl: 'DE',
      },
    },
  },
  {
    name: 'ANDROID',
    key: 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w',
    userAgent: 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip',
    context: {
      client: {
        clientName: 'ANDROID',
        clientVersion: '20.10.38',
        androidSdkVersion: 30,
        hl: 'de',
        gl: 'DE',
      },
    },
  },
];

async function fetchViaInnertube(videoId: string, lang: string | null, to: string | null) {
  let lastReason = 'no_clients_tried';
  let videoTitle: string | undefined;
  let tracks: CaptionTrack[] | null = null;

  for (const client of CLIENTS) {
    try {
      const player = await innertubePlayer(videoId, client);
      videoTitle ??= player.videoDetails?.title;
      const candidate = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
      if (candidate.length > 0) {
        tracks = candidate;
        break;
      }
      lastReason = player.playabilityStatus?.reason ?? player.playabilityStatus?.status ?? 'no_captions';
    } catch (err) {
      lastReason = err instanceof Error ? err.message : String(err);
    }
  }

  if (!tracks || tracks.length === 0) {
    if (lastReason === 'no_captions' || lastReason === 'OK') throw new Error('no_captions');
    throw new Error(`innertube_failed: ${lastReason}`);
  }

  // When a preferred lang was given we sort by score(); without one we just
  // prefer manual captions over auto-generated and take the first track —
  // YouTube tends to list the native track first.
  const sorted = lang
    ? [...tracks].sort((a, b) => score(b, lang) - score(a, lang))
    : [...tracks].sort((a, b) => (b.kind === 'asr' ? 0 : 10) - (a.kind === 'asr' ? 0 : 10));
  const track = sorted[0];

  const captionRes = await fetch(track.baseUrl + '&fmt=srv3', {
    headers: { 'User-Agent': CLIENTS[0].userAgent },
  });
  if (!captionRes.ok) throw new Error(`caption_http_${captionRes.status}`);
  const xml = await captionRes.text();
  if (!xml.trim()) throw new Error('caption_empty');

  let segments = parseTimedText(xml);
  if (segments.length === 0) throw new Error('caption_parse_empty');

  // Translation source language is whatever Innertube actually gave us,
  // not the (possibly null) caller hint.
  if (to) segments = await attachTranslations(segments, track.languageCode, to);

  return {
    videoId,
    lang: track.languageCode,
    translatedTo: to ?? undefined,
    kind: track.kind ?? 'manual',
    title: videoTitle,
    segments,
  };
}

async function innertubePlayer(videoId: string, client: ClientProfile): Promise<PlayerResponse> {
  const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${client.key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': client.userAgent,
      'Accept-Language': 'de-DE,de;q=0.9',
    },
    body: JSON.stringify({ context: client.context, videoId }),
  });
  if (!res.ok) throw new Error(`player_http_${res.status}`);
  return (await res.json()) as PlayerResponse;
}

function score(t: CaptionTrack, want: string): number {
  let s = 0;
  if (t.languageCode === want) s += 100;
  if (t.languageCode.startsWith(want)) s += 50;
  if (t.kind !== 'asr') s += 10;
  return s;
}

function parseTimedText(xml: string): NormalisedSegment[] {
  const out: NormalisedSegment[] = [];
  const pRegex = /<p\s+([^>]*?)>([\s\S]*?)<\/p>/g;
  let match: RegExpExecArray | null;
  while ((match = pRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const inner = match[2];
    const tMatch = /\bt="(\d+)"/.exec(attrs);
    if (!tMatch) continue;
    const dMatch = /\bd="(\d+)"/.exec(attrs);
    const start = Number(tMatch[1]) / 1000;
    const dur = dMatch ? Number(dMatch[1]) / 1000 : 0;
    const text = decodeEntities(inner.replace(/<[^>]+>/g, ''))
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) out.push({ start, dur, text });
  }
  return out;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)));
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

/* ─── /api/ask ──────────────────────────────────────────────────────────── *
 *
 * Cross-pack Q&A for the user's local library. The client condenses each
 * pack down to title + summary + key ideas and sends them with the user's
 * question. The LLM answers strictly from that material, citing packs
 * inline with [pack:<id>] markers. The handler extracts the citations,
 * de-duplicates them, and returns them alongside the raw answer so the
 * UI can render pack-chip footnotes.
 *
 * No caching — every (question, library) combination is unique.
 */

interface AskCondensedPack {
  id: string;
  title: string;
  summary: { short: string; long: string };
  keyIdeas: Array<{ title: string; body: string }>;
}

interface AskBody {
  question: string;
  packs: AskCondensedPack[];
  locale?: string;
  /** Anonymous owner id — used to scope vector retrieval to this user. */
  brainId?: string;
}

const ASK_LANG_NAME: Record<string, string> = {
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
  en: 'English',
  fr: 'French',
};

async function handleAsk(req: Request, env: Env): Promise<Response> {
  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const question = (body.question ?? '').toString().trim();
  const packs = Array.isArray(body.packs) ? body.packs : [];
  const locale = (body.locale ?? 'es').toString().slice(0, 2).toLowerCase();
  const brainId = typeof body.brainId === 'string' ? body.brainId : null;

  if (question.length < 3) return json({ error: 'question_too_short' }, 400);
  if (packs.length === 0) return json({ error: 'empty_library' }, 400);
  if (question.length > 500) return json({ error: 'question_too_long' }, 400);

  const langName = ASK_LANG_NAME[locale] ?? 'English';

  // Two retrieval paths:
  //   • Vector path (preferred): embed the question, query Vectorize for
  //     the top-K most relevant chunks across this brainId's indexed
  //     packs. Pass only those to the LLM. Scales to thousands of packs.
  //   • Stuff path (fallback): condense every pack in the request to
  //     title + summary + key ideas and pass the whole library. Caps at
  //     40 packs because the 8K context budget runs out beyond that.

  let library: string;
  let strategy: 'vector' | 'stuff';
  if (env.VECTORIZE && brainId) {
    try {
      library = await retrieveViaVectorize(question, brainId, env);
      strategy = 'vector';
    } catch {
      library = packs.slice(0, 40).map(renderPackForAsk).join('\n\n');
      strategy = 'stuff';
    }
  } else {
    library = packs.slice(0, 40).map(renderPackForAsk).join('\n\n');
    strategy = 'stuff';
  }

  const systemPrompt =
    `You are a research assistant helping a user search their personal Knowledge Pack library. ` +
    `Each pack is a video summary they have saved. ` +
    `Answer the user's question strictly from the library content below — do not invent facts. ` +
    `When you draw on a pack, cite it inline using the marker [pack:<id>] (use the exact id shown in the LIBRARY block). ` +
    `If the library does not contain enough information to answer, say so plainly. ` +
    `Respond in ${langName}. Keep the answer focused and editorial — two to four short paragraphs.`;

  const userPrompt = `LIBRARY:\n${library}\n\nQUESTION:\n${question}`;

  let out: Awaited<ReturnType<Env['AI']['run']>>;
  try {
    out = await env.AI.run(LLM_MODEL, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.3,
    });
  } catch (err) {
    return json({ error: 'ai_failed', detail: String(err) }, 502);
  }

  // Defensive coercion — Llama 3.3 70B occasionally returns the
  // response wrapped in an object instead of a string.
  let raw: string;
  if (typeof out === 'string') raw = out;
  else if (out && typeof out.response === 'string') raw = out.response;
  else if (out && out.response != null) raw = JSON.stringify(out.response);
  else raw = JSON.stringify(out);

  // Extract citation markers. Pack ids are nanoid(12) or 'sample*'.
  const citations: string[] = [];
  const seen = new Set<string>();
  const citationRegex = /\[pack:([A-Za-z0-9_-]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = citationRegex.exec(raw)) !== null) {
    const id = match[1];
    if (!seen.has(id) && packs.some((p) => p.id === id)) {
      seen.add(id);
      citations.push(id);
    }
  }

  return json({ answer: raw.trim(), citations, strategy }, 200);
}

function renderPackForAsk(p: AskCondensedPack): string {
  const title = (p.title ?? '').toString().slice(0, 200);
  const short = p.summary?.short?.toString().slice(0, 400) ?? '';
  const long = p.summary?.long?.toString().slice(0, 1200) ?? '';
  const ideas = (p.keyIdeas ?? [])
    .slice(0, 6)
    .map((k) => `- ${k.title}: ${k.body}`.slice(0, 350))
    .join('\n');
  return `[pack:${p.id}]\nTITLE: ${title}\nSUMMARY: ${short}\n${long ? `DETAIL: ${long}\n` : ''}KEY IDEAS:\n${ideas}`;
}

/* ─── Vector retrieval ────────────────────────────────────────────────── *
 *
 * Given a question, embed it via Workers AI and query the user's
 * vectorised pack library for the top-K most semantically relevant
 * chunks. Returns the same `[pack:<id>]` blocks the prompt-stuff path
 * produces, so the rest of the /api/ask pipeline (LLM prompt,
 * citation extraction) is identical.
 */
async function retrieveViaVectorize(
  question: string,
  brainId: string,
  env: Env,
): Promise<string> {
  if (!env.VECTORIZE) throw new Error('vectorize_unbound');
  const qVec = await embedText(question, env);
  const result = await env.VECTORIZE.query(qVec, {
    topK: 12,
    filter: { brainId },
    returnMetadata: true,
  });
  if (!result.matches.length) return '';

  // Group chunks by pack so the LLM sees coherent context per source.
  const byPack = new Map<string, Array<{ kind: string; text: string; title: string }>>();
  for (const m of result.matches) {
    const meta = (m.metadata ?? {}) as Record<string, string>;
    const packId = meta.packId ?? 'unknown';
    if (!byPack.has(packId)) byPack.set(packId, []);
    byPack.get(packId)!.push({
      kind: meta.kind ?? 'chunk',
      title: meta.packTitle ?? '',
      text: meta.text ?? '',
    });
  }

  const blocks: string[] = [];
  for (const [packId, chunks] of byPack.entries()) {
    const title = chunks[0]?.title ?? '';
    const body = chunks
      .map((c) => `- (${c.kind}) ${c.text}`)
      .join('\n');
    blocks.push(`[pack:${packId}]\nTITLE: ${title}\nRELEVANT:\n${body}`);
  }
  return blocks.join('\n\n');
}

async function embedText(text: string, env: Env): Promise<number[]> {
  const trimmed = text.slice(0, 2000);
  const out = await env.AI.run(EMBEDDING_MODEL, { text: [trimmed] });
  // Workers AI shape: { data: number[][], shape: [n, dim] }
  const data = (out as { data?: number[][] }).data;
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('embedding_unexpected_shape');
  }
  return data[0];
}

/* ─── /api/index ──────────────────────────────────────────────────────── *
 *
 * Index a pack's content into Vectorize for later semantic retrieval.
 * The client breaks a pack into chunks (summary, key ideas, action
 * plan items, quotes, social angles, etc.) and posts them here. Each
 * chunk is embedded via Workers AI and upserted into the vector
 * index, keyed by a deterministic id derived from packId + chunk
 * kind + index. Re-indexing a pack overwrites the old vectors.
 */

interface IndexChunk {
  kind: string;          // 'summary' | 'idea' | 'quote' | 'action' | …
  text: string;
  title?: string;
}

interface IndexBody {
  packId: string;
  brainId: string;
  packTitle: string;
  lang: string;
  mode: string;
  chunks: IndexChunk[];
}

async function handleIndex(req: Request, env: Env): Promise<Response> {
  if (!env.VECTORIZE) {
    return json(
      {
        error: 'index_disabled',
        detail: 'Vectorize is not bound. Provision with `wrangler vectorize create vozclara-knowledge --dimensions=768 --metric=cosine` and add the binding to wrangler.toml.',
      },
      503,
    );
  }

  let body: IndexBody;
  try {
    body = (await req.json()) as IndexBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const { packId, brainId, packTitle, lang, mode } = body;
  const chunks = Array.isArray(body.chunks) ? body.chunks : [];

  if (!packId || !brainId) return json({ error: 'missing_ids' }, 400);
  if (chunks.length === 0) return json({ error: 'empty_chunks' }, 400);
  if (chunks.length > 60) return json({ error: 'too_many_chunks' }, 400);

  try {
    // Embed in parallel — Workers AI handles a small batch well.
    const vectors = await Promise.all(
      chunks.map(async (c, i) => {
        const values = await embedText(c.text, env);
        return {
          id: `${packId}::${c.kind}::${i}`,
          values,
          metadata: {
            packId,
            brainId,
            packTitle: packTitle.slice(0, 200),
            lang,
            mode,
            kind: c.kind,
            title: (c.title ?? '').slice(0, 200),
            text: c.text.slice(0, 800),
          },
        };
      }),
    );
    await env.VECTORIZE.upsert(vectors);
    return json({ indexed: vectors.length, packId }, 200);
  } catch (err) {
    return json({ error: 'index_failed', detail: String(err) }, 502);
  }
}

async function handleIndexDelete(req: Request, env: Env): Promise<Response> {
  if (!env.VECTORIZE) {
    return json({ error: 'index_disabled' }, 503);
  }
  const url = new URL(req.url);
  const packId = url.searchParams.get('packId') ?? '';
  if (!packId) return json({ error: 'missing_packId' }, 400);

  try {
    // Delete by id-prefix isn't directly supported; we delete a known
    // range of suffix indices. 60 covers our maximum chunk count.
    const ids: string[] = [];
    const kinds = ['summary', 'summaryLong', 'idea', 'chapter', 'action', 'quote', 'angle', 'vocab', 'quiz'];
    for (const kind of kinds) {
      for (let i = 0; i < 60; i++) ids.push(`${packId}::${kind}::${i}`);
    }
    const res = await env.VECTORIZE.deleteByIds(ids);
    return json({ deleted: res.count, packId }, 200);
  } catch (err) {
    return json({ error: 'delete_failed', detail: String(err) }, 502);
  }
}

/* ─── /api/tts ──────────────────────────────────────────────────────────── *
 *
 * Server-side text-to-speech. Currently wired to OpenAI's `tts-1` model
 * because it's the cheapest multilingual option per character ($15/M)
 * with quality far above the browser Web Speech API. Returns raw audio
 * MP3 bytes with a long Cache-Control so repeated plays of the same
 * segment hit the Cloudflare edge cache for free.
 *
 * Voice selection: `alloy` as default — neutral, slightly warm, handles
 * ES / PT / DE / EN well without an accent shift. Client can override
 * via the `voice` field.
 *
 * No fallback to Cloudflare Workers AI: their melotts model is English-
 * only, which would silently break for our other three languages.
 * Better to return 503 and let the client use Web Speech API.
 */

interface TTSBody {
  text: string;
  lang?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 – 4.0
}

async function handleTTS(req: Request, env: Env): Promise<Response> {
  if (!env.OPENAI_API_KEY) {
    return json(
      {
        error: 'tts_disabled',
        detail: 'Server TTS is not configured. Set OPENAI_API_KEY via `wrangler secret put OPENAI_API_KEY` to enable.',
      },
      503,
    );
  }

  let body: TTSBody;
  try {
    body = (await req.json()) as TTSBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const text = (body.text ?? '').toString().trim();
  if (!text) return json({ error: 'empty_text' }, 400);
  if (text.length > 4096) return json({ error: 'text_too_long' }, 400);

  const voice = body.voice && ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(body.voice)
    ? body.voice
    : 'alloy';
  const speed = body.speed && body.speed >= 0.25 && body.speed <= 4.0 ? body.speed : 1.0;

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        speed,
        input: text,
        response_format: 'mp3',
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return json(
        { error: 'tts_failed', status: res.status, detail: errText.slice(0, 400) },
        502,
      );
    }

    // Pipe the MP3 through with cache headers. Cloudflare's edge cache
    // doesn't cache POST responses by default, but we set the headers
    // anyway so a future GET-with-hash variant can short-circuit.
    const audio = await res.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audio.byteLength.toString(),
        'Cache-Control': 'public, max-age=2592000, immutable',
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    return json({ error: 'tts_fetch_failed', detail: String(err) }, 502);
  }
}

/* ─── /api/og ────────────────────────────────────────────────────────────
 *
 * Per-pack Open Graph image generator. Returns a brand-styled 1200×630
 * SVG image which Twitter / LinkedIn / Discord / Slack render directly
 * as the share-card preview when a /pack/<id> URL is posted.
 *
 * SVG over PNG: keeps the worker bundle tiny (no satori, no resvg-wasm)
 * at the cost of platform coverage — Meta-family crawlers (FB,
 * WhatsApp) silently fall back to the static /og-image.png that's
 * still listed as the default og:image in index.html. Acceptable
 * trade-off for v1; we can swap in satori later if WhatsApp/FB
 * previews become a real channel.
 *
 * Query params (all optional, sensible defaults):
 *   title  — main headline (1-200 chars)
 *   mode   — learn | business | creator
 *   lang   — output language code (es / en / de / pt)
 *   genre  — content genre label (politics, education, …)
 *   author — small attribution line (e.g. channel name)
 *
 * Cached aggressively (immutable + 1 year) — the URL fully encodes
 * the image contents, so two different packs get two different
 * cache keys, and a re-share of the same pack hits the edge.
 */

interface OGParams {
  title: string;
  mode: string;
  lang: string;
  genre: string;
  author?: string;
}

function handleOG(url: URL): Response {
  const p = url.searchParams;
  const params: OGParams = {
    title: (p.get('title') ?? 'Knowledge Pack').slice(0, 200),
    mode: (p.get('mode') ?? 'brief').slice(0, 20),
    lang: (p.get('lang') ?? 'es').slice(0, 5).toLowerCase(),
    genre: (p.get('genre') ?? 'general').slice(0, 30),
    author: p.get('author')?.slice(0, 60) ?? undefined,
  };

  const svg = renderOGSVG(params);
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...CORS_HEADERS,
    },
  });
}

function renderOGSVG({ title, mode, lang, genre, author }: OGParams): string {
  // XML-safe text escape — prevents the SVG from being broken by quotes
  // or angle brackets in the pack title.
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Wrap title to two lines manually — SVG <text> doesn't auto-wrap.
  // Aim for ~24 chars per line; cut at word boundaries.
  const wrapped = wrapTitle(title, 24, 3);

  // Mode label used as a small pill on the OG card. `business` is
  // tolerated for OG URLs that may still be cached/shared from before
  // the rename — render as the new "BRIEF" label.
  const modeLabel =
    mode === 'learn'
      ? 'LEARN'
      : mode === 'study'
        ? 'STUDY'
        : mode === 'creator'
          ? 'CREATOR'
          : 'BRIEF';
  const langLabel = lang.toUpperCase();
  const genreLabel = genre.toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A1A3A"/>
      <stop offset="100%" stop-color="#091532"/>
    </linearGradient>
    <radialGradient id="aura" cx="20%" cy="25%" r="55%">
      <stop offset="0%" stop-color="#C9A24B" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#C9A24B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8D29A"/>
      <stop offset="50%" stop-color="#C9A24B"/>
      <stop offset="100%" stop-color="#8C6A2A"/>
    </linearGradient>
  </defs>

  <!-- Navy background with a soft gold aura top-left -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#aura)"/>

  <!-- VozClara lighthouse mark, top-left, scaled to fit -->
  <g transform="translate(80 75) scale(1.0)" fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="44" stroke-width="2.6"/>
    <circle cx="50" cy="50" r="40.7" stroke-width="2.0"/>
    <path d="M50 16V26" stroke-width="2.0"/>
    <path d="M33 25l10 6" stroke-width="1.8"/>
    <path d="M67 25l-10 6" stroke-width="1.8"/>
    <path d="M31 36l12-3" stroke-width="1.8"/>
    <path d="M69 36l-12-3" stroke-width="1.8"/>
    <path d="M46.5 30h7" stroke-width="1.8"/>
    <path d="M44.4 31.2l5.6-4.1 5.6 4.1" stroke-width="2.0"/>
    <path d="M45.6 31.4h8.8v5.7h-8.8z" stroke-width="1.7"/>
    <path d="M47.3 31.4v5.7M50 31.4v5.7M52.7 31.4v5.7" stroke-width="1.3"/>
    <path d="M43.8 37.1h12.4" stroke-width="2.0"/>
    <path d="M44.7 39h10.6" stroke-width="1.4"/>
    <path d="M45.3 39.1 42.3 73.7M54.7 39.1 57.7 73.7" stroke-width="1.9"/>
    <path d="M46.8 48h6.4" stroke-width="1.5"/>
    <rect x="48.6" y="50.2" width="2.8" height="5.5" rx="0.2" stroke-width="1.6"/>
    <path d="M41.2 73.8h17.6" stroke-width="2.0"/>
    <path d="M24.6 79.4C33.7 73.8 43 72.2 50 72.2s16.3 1.6 25.4 7.2" stroke-width="2.1"/>
  </g>

  <!-- "VOZ · CLARA" wordmark inline with the mark -->
  <text x="220" y="135" font-family="Georgia, 'Times New Roman', serif" font-size="40" letter-spacing="9" fill="#F7F3EC" font-weight="500">
    VOZ · CLARA
  </text>

  <!-- Mode + Lang + Genre pill row, top-right -->
  <g transform="translate(1120 130)" text-anchor="end" font-family="Inter, -apple-system, system-ui, sans-serif" font-size="18" letter-spacing="3">
    <text fill="#C9A24B" font-weight="600">${esc(modeLabel)}</text>
    <text y="32" fill="#F7F3ECB3">${esc(langLabel)} · ${esc(genreLabel)}</text>
  </g>

  <!-- Gold hairline divider -->
  <rect x="80" y="280" width="80" height="2" fill="url(#gold)"/>

  <!-- Title — two-or-three line wrap -->
  ${wrapped
    .map(
      (line, i) =>
        `<text x="80" y="${360 + i * 78}" font-family="Georgia, 'Times New Roman', serif" font-size="68" font-weight="500" fill="#F7F3EC">${esc(line)}</text>`,
    )
    .join('\n  ')}

  <!-- Bottom-row attribution + brand footer -->
  ${author ? `<text x="80" y="560" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#F7F3EC99" font-style="italic">${esc(author)}</text>` : ''}
  <text x="1120" y="560" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="20" fill="#F7F3EC99" letter-spacing="3">
    SAVE THE KNOWLEDGE
  </text>
  <text x="1120" y="588" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#C9A24B" letter-spacing="2">
    VOZCLARA.PAGES.DEV
  </text>
</svg>`;
}

function wrapTitle(title: string, maxChars: number, maxLines: number): string[] {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current ? current + ' ' : '') + word;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  // If we truncated, append an ellipsis to the last line.
  const consumed = lines.join(' ').split(/\s+/).length;
  if (consumed < words.length && lines.length > 0) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\W+$/, '') + '…';
  }
  return lines;
}

/* ─── /api/quote-card ───────────────────────────────────────────────────
 *
 * Sharable 1080×1080 SVG card for a single key quote. Same brand
 * language as /api/og but laid out for Instagram / square share
 * surfaces: a large pull-quote in editorial serif, speaker + timestamp
 * underneath, optional original-language line beneath the translated
 * one, VozClara seal + brand strip in the corner.
 *
 * The QuotesTab in the Pack view links each quote's "share" button at
 * this URL with the quote's params encoded in the querystring, so a
 * user can open / right-click-save / share with one click. No
 * server-side data needed — the URL fully describes the card.
 *
 * Cached at the edge for a year (immutable per URL).
 */

interface QuoteCardParams {
  text: string;
  speaker?: string;
  time?: string;
  original?: string;
  packTitle?: string;
}

function handleQuoteCard(url: URL): Response {
  const p = url.searchParams;
  const params: QuoteCardParams = {
    text: (p.get('text') ?? '').slice(0, 400),
    speaker: p.get('speaker')?.slice(0, 80) ?? undefined,
    time: p.get('time')?.slice(0, 12) ?? undefined,
    original: p.get('original')?.slice(0, 400) ?? undefined,
    packTitle: p.get('packTitle')?.slice(0, 120) ?? undefined,
  };

  if (!params.text) {
    return json({ error: 'missing_text' }, 400);
  }

  const svg = renderQuoteCardSVG(params);
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...CORS_HEADERS,
    },
  });
}

function renderQuoteCardSVG({ text, speaker, time, original, packTitle }: QuoteCardParams): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Quote text wrapping — longer quotes get smaller font.
  const cleanText = text.replace(/^["“„]+|["”„]+$/g, '');
  const len = cleanText.length;
  const fontSize = len < 80 ? 56 : len < 160 ? 48 : len < 240 ? 40 : 34;
  const charsPerLine = len < 80 ? 24 : len < 160 ? 28 : 32;
  const maxLines = len < 80 ? 4 : len < 160 ? 6 : 8;
  const wrapped = wrapTitle(cleanText, charsPerLine, maxLines);
  const lineHeight = Math.round(fontSize * 1.25);
  // Vertically centre the quote block in the available 1080-ish area.
  const blockHeight = wrapped.length * lineHeight;
  const topY = 320 + (480 - blockHeight) / 2;

  // Optional original-language line beneath the translated quote.
  const showOriginal = original && original !== text && original.length < 200;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A1A3A"/>
      <stop offset="100%" stop-color="#091532"/>
    </linearGradient>
    <radialGradient id="aura" cx="20%" cy="22%" r="60%">
      <stop offset="0%" stop-color="#C9A24B" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#C9A24B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8D29A"/>
      <stop offset="50%" stop-color="#C9A24B"/>
      <stop offset="100%" stop-color="#8C6A2A"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect width="1080" height="1080" fill="url(#aura)"/>

  <!-- Brand seal corner: lighthouse mark + wordmark -->
  <g transform="translate(70 80) scale(0.78)" fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="44" stroke-width="2.6"/>
    <circle cx="50" cy="50" r="40.7" stroke-width="2.0"/>
    <path d="M50 16V26" stroke-width="2.0"/>
    <path d="M33 25l10 6" stroke-width="1.8"/>
    <path d="M67 25l-10 6" stroke-width="1.8"/>
    <path d="M31 36l12-3" stroke-width="1.8"/>
    <path d="M69 36l-12-3" stroke-width="1.8"/>
    <path d="M46.5 30h7" stroke-width="1.8"/>
    <path d="M44.4 31.2l5.6-4.1 5.6 4.1" stroke-width="2.0"/>
    <path d="M45.6 31.4h8.8v5.7h-8.8z" stroke-width="1.7"/>
    <path d="M47.3 31.4v5.7M50 31.4v5.7M52.7 31.4v5.7" stroke-width="1.3"/>
    <path d="M43.8 37.1h12.4" stroke-width="2.0"/>
    <path d="M44.7 39h10.6" stroke-width="1.4"/>
    <path d="M45.3 39.1 42.3 73.7M54.7 39.1 57.7 73.7" stroke-width="1.9"/>
    <path d="M46.8 48h6.4" stroke-width="1.5"/>
    <rect x="48.6" y="50.2" width="2.8" height="5.5" rx="0.2" stroke-width="1.6"/>
    <path d="M41.2 73.8h17.6" stroke-width="2.0"/>
    <path d="M24.6 79.4C33.7 73.8 43 72.2 50 72.2s16.3 1.6 25.4 7.2" stroke-width="2.1"/>
  </g>

  <text x="190" y="135" font-family="Georgia, 'Times New Roman', serif" font-size="34" letter-spacing="8" fill="#F7F3EC" font-weight="500">
    VOZ · CLARA
  </text>

  <!-- Oversized opening quotation mark, decorative -->
  <text x="80" y="370" font-family="Georgia, 'Times New Roman', serif" font-size="160" fill="#C9A24B" opacity="0.45">
    “
  </text>

  <!-- The pull quote, multi-line, editorial serif -->
  ${wrapped
    .map(
      (line, i) =>
        `<text x="540" y="${topY + lineHeight + i * lineHeight}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="${fontSize}" font-weight="500" fill="#F7F3EC">${esc(line)}</text>`,
    )
    .join('\n  ')}

  <!-- Gold divider -->
  <rect x="490" y="${topY + blockHeight + 60}" width="100" height="2" fill="url(#gold)"/>

  <!-- Speaker + timestamp underneath -->
  ${speaker || time ? `<text x="540" y="${topY + blockHeight + 120}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="22" letter-spacing="6" fill="#C9A24B" font-weight="500">${esc((speaker ?? '').toUpperCase())}${speaker && time ? '  ·  ' : ''}${time ? esc(time) : ''}</text>` : ''}

  <!-- Optional original-language line (e.g. German source line) -->
  ${showOriginal ? `<text x="540" y="${topY + blockHeight + 170}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-style="italic" fill="#F7F3EC80">${esc(original!)}</text>` : ''}

  <!-- Pack-title attribution at the bottom -->
  ${packTitle ? `<text x="540" y="970" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="20" fill="#F7F3EC99" font-style="italic">${esc(packTitle)}</text>` : ''}
  <text x="540" y="1010" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="18" letter-spacing="4" fill="#C9A24B">
    VOZCLARA.PAGES.DEV
  </text>
</svg>`;
}

/* ─── /api/push/* ──────────────────────────────────────────────────── *
 *
 * Daily-reminder push notifications. Anonymous: the user's brainId
 * is the only identifier on the server. We store
 *
 *   sub:<brainId> → {
 *     subscription,         // PushSubscription JSON from the browser
 *     locale,               // 'es' | 'pt' | 'de' | 'en' for the body
 *     reminderHour,         // 0-23, local time
 *     tzOffsetMinutes,      // local time offset vs UTC, browser-reported
 *     nextDueAt,            // ms epoch of the next due card, from client SRS
 *     lastNotifiedYmd,      // local-date yyyy-mm-dd; dedup so we don't
 *                           // re-notify within the same calendar day
 *     createdAt, updatedAt,
 *   }
 *
 * Cron tick runs hourly. For each entry, we check whether the user's
 * current local hour equals reminderHour AND nextDueAt ≤ now AND
 * lastNotifiedYmd is not today. If so → send push, record ymd.
 */

interface PushSub {
  subscription: PushSubscriptionData;
  locale: 'es' | 'pt' | 'de' | 'en';
  reminderHour: number;
  tzOffsetMinutes: number;
  nextDueAt: number;
  lastNotifiedYmd: string | null;
  createdAt: number;
  updatedAt: number;
}

interface SubscribeBody {
  brainId: string;
  subscription: PushSubscriptionData;
  locale: string;
  reminderHour: number;
  tzOffsetMinutes: number;
  nextDueAt: number;
}

function vapidConfigured(env: Env): boolean {
  return !!(env.PUSH_SUBS && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT);
}

async function handlePushSubscribe(req: Request, env: Env): Promise<Response> {
  if (!vapidConfigured(env)) return json({ error: 'push_disabled' }, 503);

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const brainId = (body.brainId ?? '').toString().trim();
  if (!brainId || brainId.length > 64) return json({ error: 'invalid_brain_id' }, 400);
  if (!body.subscription?.endpoint || !body.subscription?.keys?.p256dh || !body.subscription?.keys?.auth) {
    return json({ error: 'invalid_subscription' }, 400);
  }
  const locale = ['es', 'pt', 'de', 'en'].includes(body.locale) ? body.locale as PushSub['locale'] : 'en';
  const hour = Number.isInteger(body.reminderHour) ? Math.max(0, Math.min(23, body.reminderHour)) : 9;
  const tz = Number.isInteger(body.tzOffsetMinutes) ? body.tzOffsetMinutes : 0;
  const nextDueAt = Number.isFinite(body.nextDueAt) ? body.nextDueAt : Date.now();

  const now = Date.now();
  const sub: PushSub = {
    subscription: body.subscription,
    locale,
    reminderHour: hour,
    tzOffsetMinutes: tz,
    nextDueAt,
    lastNotifiedYmd: null,
    createdAt: now,
    updatedAt: now,
  };
  await env.PUSH_SUBS!.put(`sub:${brainId}`, JSON.stringify(sub));
  return json({ ok: true });
}

interface StateBody {
  brainId: string;
  nextDueAt: number;
}

async function handlePushState(req: Request, env: Env): Promise<Response> {
  if (!vapidConfigured(env)) return json({ error: 'push_disabled' }, 503);

  let body: StateBody;
  try {
    body = (await req.json()) as StateBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const brainId = (body.brainId ?? '').toString().trim();
  if (!brainId || brainId.length > 64) return json({ error: 'invalid_brain_id' }, 400);
  if (!Number.isFinite(body.nextDueAt)) return json({ error: 'invalid_next_due_at' }, 400);

  const raw = await env.PUSH_SUBS!.get(`sub:${brainId}`);
  if (!raw) return json({ error: 'not_subscribed' }, 404);
  const sub = JSON.parse(raw) as PushSub;
  sub.nextDueAt = body.nextDueAt;
  sub.updatedAt = Date.now();
  await env.PUSH_SUBS!.put(`sub:${brainId}`, JSON.stringify(sub));
  return json({ ok: true });
}

async function handlePushUnsubscribe(req: Request, env: Env): Promise<Response> {
  if (!vapidConfigured(env)) return json({ error: 'push_disabled' }, 503);
  let body: { brainId?: string };
  try {
    body = (await req.json()) as { brainId?: string };
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const brainId = (body.brainId ?? '').toString().trim();
  if (!brainId || brainId.length > 64) return json({ error: 'invalid_brain_id' }, 400);
  await env.PUSH_SUBS!.delete(`sub:${brainId}`);
  return json({ ok: true });
}

async function handlePushTest(req: Request, env: Env): Promise<Response> {
  if (!vapidConfigured(env)) return json({ error: 'push_disabled' }, 503);
  let body: { brainId?: string };
  try {
    body = (await req.json()) as { brainId?: string };
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const brainId = (body.brainId ?? '').toString().trim();
  if (!brainId) return json({ error: 'invalid_brain_id' }, 400);
  const raw = await env.PUSH_SUBS!.get(`sub:${brainId}`);
  if (!raw) return json({ error: 'not_subscribed' }, 404);
  const sub = JSON.parse(raw) as PushSub;

  const result = await sendPush({
    subscription: sub.subscription,
    payload: notificationPayload(sub.locale, 0, 0, true),
    vapid: {
      publicKey: env.VAPID_PUBLIC_KEY!,
      privateKey: env.VAPID_PRIVATE_KEY!,
      subject: env.VAPID_SUBJECT!,
    },
    ttl: 60,
    urgency: 'normal',
    topic: 'vozclara-test',
  });

  if (result.gone) {
    await env.PUSH_SUBS!.delete(`sub:${brainId}`);
  }
  return json({ status: result.status, gone: result.gone });
}

/* ─── Cron tick ────────────────────────────────────────────────────── */

async function runPushCron(env: Env): Promise<void> {
  if (!vapidConfigured(env)) {
    console.log('push_cron_skip: vapid_or_kv_unbound');
    return;
  }

  const nowMs = Date.now();
  let cursor: string | undefined;
  let totalSeen = 0;
  let totalSent = 0;
  let totalGone = 0;

  do {
    const page = await env.PUSH_SUBS!.list({ prefix: 'sub:', cursor });
    for (const k of page.keys) {
      totalSeen += 1;
      const raw = await env.PUSH_SUBS!.get(k.name);
      if (!raw) continue;
      const sub = JSON.parse(raw) as PushSub;

      // Local-time hour for the user; tzOffsetMinutes is the value
      // returned by `new Date().getTimezoneOffset()` from the browser
      // (positive west of UTC, so subtract).
      const localMs = nowMs - sub.tzOffsetMinutes * 60 * 1000;
      const localDate = new Date(localMs);
      const localHour = localDate.getUTCHours();
      const localYmd = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, '0')}-${String(localDate.getUTCDate()).padStart(2, '0')}`;

      // Three conditions: it's the user's reminder hour, they have cards
      // due now, and we haven't already buzzed them today.
      if (localHour !== sub.reminderHour) continue;
      if (sub.nextDueAt > nowMs) continue;
      if (sub.lastNotifiedYmd === localYmd) continue;

      const result = await sendPush({
        subscription: sub.subscription,
        payload: notificationPayload(sub.locale, 0, 0, false),
        vapid: {
          publicKey: env.VAPID_PUBLIC_KEY!,
          privateKey: env.VAPID_PRIVATE_KEY!,
          subject: env.VAPID_SUBJECT!,
        },
        ttl: 24 * 60 * 60,
        urgency: 'normal',
        topic: 'vozclara-daily',
      });

      if (result.gone) {
        await env.PUSH_SUBS!.delete(k.name);
        totalGone += 1;
        continue;
      }

      sub.lastNotifiedYmd = localYmd;
      sub.updatedAt = nowMs;
      await env.PUSH_SUBS!.put(k.name, JSON.stringify(sub));
      totalSent += 1;
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  console.log(`push_cron: seen=${totalSeen} sent=${totalSent} gone=${totalGone}`);
}

/**
 * Notification body text. Counts are intentionally omitted from the
 * payload — the worker only knows there is *something* due, not how
 * much, because exact counts live in the user's IndexedDB. The SW
 * fills them in client-side when it displays the notification.
 */
function notificationPayload(
  locale: PushSub['locale'],
  _due: number,
  _fresh: number,
  test: boolean,
): object {
  const title: Record<PushSub['locale'], string> = {
    es: 'VozClara · Toca para repasar',
    pt: 'VozClara · Toca para rever',
    de: 'VozClara · Zeit zum Wiederholen',
    en: 'VozClara · Time to review',
  };
  const body: Record<PushSub['locale'], string> = {
    es: 'Tienes tarjetas esperando en tu biblioteca.',
    pt: 'Tens cartões à espera na tua biblioteca.',
    de: 'In deiner Bibliothek warten Karten auf dich.',
    en: 'Your library has cards waiting for review.',
  };
  return {
    title: title[locale],
    body: body[locale],
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: test ? 'vozclara-test' : 'vozclara-daily',
    url: '/review?source=push',
  };
}

/* ─── /api/curated ────────────────────────────────────────────────── *
 *
 * Featured Knowledge Packs surfaced on the Library home. The list is
 * read from KV under "curated:index"; when KV is empty (first-deploy
 * state or push KV not bound) we fall back to a static set of the
 * sample packs so new users always see something there.
 *
 * Items reference existing /pack/:id routes — for now, the sample
 * pack ids the client ships. A follow-up sprint will add automated
 * daily generation (cron + YouTube RSS + the existing /api/insights
 * pipeline) writing fresh entries into the same KV index.
 */

interface CuratedItem {
  id: string;              // identifier; static-fallback IDs map to /pack/:id
  title: string;           // video title
  sourceLang: 'de' | 'es' | 'en' | 'pt' | 'fr';
  packLangs: string[];     // languages the pack is generated in
  mode: 'learn' | 'brief' | 'study' | 'creator';
  publishedAt: number;     // ms epoch — source video publication date
  source: string;          // channel name, e.g. "Tagesschau"
  excerpt: string;         // one-line teaser shown on the card
  /**
   * Present on auto-generated entries — the YouTube video id the daily
   * cron picked. Cards with a videoId open the Generator pre-filled so
   * the visitor can produce their own Pack in their own locale + mode.
   * Static fallback items (sample-* packs) omit this and link directly
   * to /pack/:id.
   */
  videoId?: string;
}

const FALLBACK_CURATED: CuratedItem[] = [
  {
    id: 'sample',
    title: 'Tagesschau 20:00 Uhr · 03.05.2026',
    sourceLang: 'de',
    packLangs: ['es', 'en'],
    mode: 'brief',
    publishedAt: Date.UTC(2026, 4, 3),
    source: 'Tagesschau',
    excerpt: 'Ein Jahr Kanzler Merz, atmende Koalition, AfD im Osten.',
  },
  {
    id: 'sample-learn',
    title: 'Tagesschau · Politik lernen',
    sourceLang: 'de',
    packLangs: ['es', 'en'],
    mode: 'learn',
    publishedAt: Date.UTC(2026, 4, 3),
    source: 'Tagesschau',
    excerpt: 'Vokabular, Quiz und Erklärungen rund um deutsche Koalitionspolitik.',
  },
  {
    id: 'sample-creator',
    title: 'Tagesschau · Drei virale Angles',
    sourceLang: 'de',
    packLangs: ['es', 'en'],
    mode: 'creator',
    publishedAt: Date.UTC(2026, 4, 3),
    source: 'Tagesschau',
    excerpt: 'Hooks, Captions und Social-Angles aus dem Tagesschau-Bericht.',
  },
];

async function handleCurated(env: Env): Promise<Response> {
  const headers = { 'Cache-Control': 'public, max-age=300' };
  if (!env.PUSH_SUBS) return json({ items: FALLBACK_CURATED }, 200, headers);
  try {
    const raw = await env.PUSH_SUBS.get('curated:index');
    if (!raw) return json({ items: FALLBACK_CURATED }, 200, headers);
    const parsed = JSON.parse(raw) as { items?: CuratedItem[] };
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
      return json({ items: FALLBACK_CURATED }, 200, headers);
    }
    /* Migrate legacy `mode: 'business'` entries on read. The next daily
       cron run will overwrite the KV with normalised values, but until
       then we sanitise so the landing/library doesn't show the old
       mode label in the curated row. */
    const items = parsed.items.map((it) => ({
      ...it,
      // @ts-expect-error — `it.mode` is typed as the new union; legacy data may still carry 'business'.
      mode: it.mode === 'business' ? 'brief' : it.mode,
    }));
    return json({ items }, 200, headers);
  } catch {
    return json({ items: FALLBACK_CURATED }, 200, headers);
  }
}

/* ─── /api/chat ───────────────────────────────────────────────────── *
 *
 * Multi-turn conversation about a specific pack. The user is learning
 * the pack's output language — the model plays a patient, native-speaker
 * tutor inside that language, drawing on the pack's title, summary,
 * key ideas, vocabulary and key quotes as the conversation topic.
 *
 * No server-side state: the client sends the full message history each
 * turn (capped). Storage of chat history is the client's responsibility
 * — local-first, like everything else in VozClara.
 */

interface ChatPackContext {
  title: string;
  outputLang: 'es' | 'pt' | 'de' | 'en' | 'fr';
  sourceLang: string;
  mode: string;
  summary: { short: string; long: string };
  keyIdeas: Array<{ title: string; body: string }>;
  vocabulary: Array<{ word: string; translation: string; context?: string }>;
  keyQuotes: Array<{ text: string; speaker?: string }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBody {
  pack: ChatPackContext;
  history: ChatMessage[];
  message: string;
}

interface ChatResult {
  reply: string;
  model: string;
}

const CHAT_LANG_NAME: Record<string, string> = {
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
  en: 'English',
  fr: 'French',
};

async function handleChat(req: Request, env: Env): Promise<Response> {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const message = (body.message ?? '').toString().trim();
  if (message.length < 1) return json({ error: 'message_empty' }, 400);
  if (message.length > 1000) return json({ error: 'message_too_long' }, 400);

  const pack = body.pack;
  if (!pack?.title || !pack?.outputLang) return json({ error: 'invalid_pack' }, 400);
  const targetLang = pack.outputLang;
  const langName = CHAT_LANG_NAME[targetLang] ?? 'English';

  // Cap history to last 10 turns to keep context bounded and latency low.
  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

  const systemPrompt = buildChatSystemPrompt(pack, langName);

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...history
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) })),
    { role: 'user', content: message.slice(0, 1000) },
  ];

  let out: Awaited<ReturnType<Env['AI']['run']>>;
  try {
    out = await env.AI.run(LLM_MODEL, {
      messages,
      max_tokens: 600,
      temperature: 0.6,
    });
  } catch (err) {
    return json({ error: 'ai_failed', detail: String(err).slice(0, 200) }, 502);
  }

  let raw: string;
  if (typeof out === 'string') raw = out;
  else if (out && typeof out.response === 'string') raw = out.response;
  else if (out && out.response != null) raw = JSON.stringify(out.response);
  else raw = JSON.stringify(out);

  const result: ChatResult = { reply: raw.trim(), model: LLM_MODEL };
  return json(result);
}

function buildChatSystemPrompt(pack: ChatPackContext, langName: string): string {
  const ideas = pack.keyIdeas
    .slice(0, 6)
    .map((k, i) => `${i + 1}. ${k.title}: ${k.body}`)
    .join('\n');
  const vocab = pack.vocabulary
    .slice(0, 12)
    .map((v) => `- ${v.word} (${v.translation})${v.context ? ` — "${v.context}"` : ''}`)
    .join('\n');
  const quotes = pack.keyQuotes
    .slice(0, 4)
    .map((q) => (q.speaker ? `"${q.text}" — ${q.speaker}` : `"${q.text}"`))
    .join('\n');

  return [
    `You are a patient, encouraging native-${langName} tutor having a real conversation about a video the learner just watched.`,
    `Speak in ${langName} only. Match the learner's level — if they make small mistakes, respond naturally first, then add one short gentle correction in a separate sentence. If they ask for an explanation, give it in plain ${langName}.`,
    ``,
    `Keep replies short (1-3 sentences usually). Ask a follow-up question often — you are a conversation partner, not a lecturer. Do not summarise the video unless the learner explicitly asks; they have the pack already.`,
    ``,
    `TOPIC — the video the learner watched:`,
    `Title: ${pack.title}`,
    `Source language: ${pack.sourceLang}. Pack mode: ${pack.mode}.`,
    ``,
    `Short summary: ${pack.summary.short}`,
    pack.summary.long ? `\nLonger summary: ${pack.summary.long}` : '',
    ideas ? `\nKey ideas:\n${ideas}` : '',
    vocab ? `\nUseful vocabulary (try to weave some of these in):\n${vocab}` : '',
    quotes ? `\nKey quotes:\n${quotes}` : '',
    ``,
    `Stay anchored to this topic. If the learner drifts onto something unrelated, redirect gently with a question that brings them back. Never break character to mention you are an AI.`,
  ]
    .filter(Boolean)
    .join('\n');
}

/* ─── Curated daily cron ──────────────────────────────────────────── *
 *
 * Pulls the latest matching video from each configured YouTube channel
 * once a day and writes a CuratedItem into KV. The /api/curated
 * endpoint returns the freshest entries first, falling back to the
 * static seed when KV is empty.
 *
 * v1 stores metadata only — title, video URL, published date, etc.
 * Click → /new?v=<videoId> opens the Generator pre-filled, the user
 * generates the actual Pack themselves locally. v2 will move pack
 * generation server-side so every visitor gets the same shared pack
 * with one click; for now, lightweight is good enough to ship the
 * marketing flywheel.
 *
 * YouTube RSS is free, no API key, no quotas — the canonical feed
 * URL is https://www.youtube.com/feeds/videos.xml?channel_id=<id>.
 */

interface CuratedFeed {
  id: string;                         // 'de-news', etc.
  source: string;                     // 'Tagesschau' — shown on the card
  channelId: string;                  // YouTube channel id
  titleMatch?: string;                // regex (string form) to filter the feed entries
  sourceLang: 'de' | 'es' | 'en' | 'pt' | 'fr';
  packLangs: Array<'es' | 'pt' | 'de' | 'en' | 'fr'>;
  mode: 'learn' | 'brief' | 'study' | 'creator';
  excerpt?: string;                   // optional one-line description for cards
}

const CURATED_FEEDS: CuratedFeed[] = [
  // Tagesschau 20:00 Uhr — the German daily news broadcast. Channel id
  // resolved via "View Page Source" on https://www.youtube.com/@tagesschau
  // → "browseId":"UC5NOEUbkLheQcaaRldYW5GA". The previous id was wrong
  // and the RSS feed returned 404 silently every day.
  {
    id: 'de-news',
    source: 'Tagesschau',
    channelId: 'UC5NOEUbkLheQcaaRldYW5GA',
    titleMatch: 'tagesschau 20:00 uhr',
    sourceLang: 'de',
    packLangs: ['es', 'en'],
    mode: 'brief',
    excerpt: 'Die Nachrichten des Tages aus Deutschland — Originalton, übersetzt.',
  },
];

interface VideoRef {
  id: string;       // 11-char YouTube id
  title: string;
  publishedAt: number;
}

async function runDailyCurated(env: Env): Promise<void> {
  if (!env.PUSH_SUBS) {
    console.log('curated_cron_skip: kv_unbound');
    return;
  }
  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const feed of CURATED_FEEDS) {
    try {
      const video = await fetchLatestVideo(feed);
      if (!video) {
        skipped += 1;
        continue;
      }
      const today = ymdLocal(Date.now());
      const packId = `curated-${feed.id}-${today}`;

      // Dedupe — if we already stored today's entry, leave it.
      const existing = await env.PUSH_SUBS.get(`curated:meta:${packId}`);
      if (existing) {
        skipped += 1;
        continue;
      }

      const item: PersistedCuratedItem = {
        id: packId,
        videoId: video.id,
        title: video.title,
        sourceLang: feed.sourceLang,
        packLangs: feed.packLangs,
        mode: feed.mode,
        publishedAt: video.publishedAt,
        source: feed.source,
        excerpt: feed.excerpt ?? '',
      };
      await env.PUSH_SUBS.put(`curated:meta:${packId}`, JSON.stringify(item));

      // Update the index — newest first, capped at 14 days.
      const indexRaw = await env.PUSH_SUBS.get('curated:index');
      let index: { items: PersistedCuratedItem[] } = { items: [] };
      try {
        if (indexRaw) index = JSON.parse(indexRaw);
      } catch { /* corrupt, start fresh */ }
      index.items = index.items.filter((x) => x.id !== packId);
      index.items.unshift(item);
      index.items = index.items.slice(0, 14);
      await env.PUSH_SUBS.put('curated:index', JSON.stringify(index));

      added += 1;
    } catch (err) {
      console.log(`curated_failed ${feed.id}: ${String(err).slice(0, 200)}`);
      failed += 1;
    }
  }
  console.log(`curated_cron: added=${added} skipped=${skipped} failed=${failed}`);
}

interface PersistedCuratedItem {
  id: string;
  videoId: string;
  title: string;
  sourceLang: string;
  packLangs: string[];
  mode: string;
  publishedAt: number;
  source: string;
  excerpt: string;
}

/**
 * Pull the YouTube channel RSS feed and return the most recent entry
 * whose title matches the optional regex. Regex matching is case-
 * insensitive. Returns null when the feed is unreachable or no entry
 * matches.
 */
async function fetchLatestVideo(feed: CuratedFeed): Promise<VideoRef | null> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(feed.channelId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'VozClara curator/1.0 (+https://vozclara.app)' },
      cf: { cacheTtl: 600 } as RequestInit['cf'],
    });
  } catch (err) {
    console.log(`rss_fetch_failed ${feed.id}: ${err}`);
    return null;
  }
  if (!res.ok) {
    console.log(`rss_http ${feed.id}: ${res.status}`);
    return null;
  }
  const xml = await res.text();
  const matcher = feed.titleMatch ? new RegExp(feed.titleMatch, 'i') : null;

  // Workers don't ship a DOM parser; cheap regex scan over <entry>
  // blocks is fine for YouTube's well-formed feed.
  const entries = xml.split(/<entry>/).slice(1);
  for (const raw of entries) {
    const id = (raw.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) ?? [])[1];
    const title = unescapeXml((raw.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '');
    const publishedRaw = (raw.match(/<published>([^<]+)<\/published>/) ?? [])[1];
    if (!id || !title) continue;
    if (matcher && !matcher.test(title)) continue;
    const publishedAt = publishedRaw ? Date.parse(publishedRaw) : Date.now();
    return { id, title, publishedAt };
  }
  return null;
}

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function ymdLocal(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/* ─── Rate limiting ───────────────────────────────────────────────── *
 *
 * Cheap per-IP-per-minute counter backed by the PUSH_SUBS KV
 * namespace under a separate `rl:` prefix. Not as precise as a proper
 * Durable-Object sliding-window limiter — KV writes are eventually
 * consistent, the counter can underreport by 1-2 calls during a
 * burst — but more than enough to stop the cheap-abuse case where
 * someone scripts 1000 /api/insights calls and burns through the
 * Workers AI free-tier neuron budget.
 *
 * Returns null when the request is allowed; returns a 429 Response
 * with Retry-After when the bucket overflows. KV-unbound deploys
 * pass through (better to serve than crash).
 */
async function rateLimit(
  env: Env,
  req: Request,
  endpoint: string,
  perMinute: number,
): Promise<Response | null> {
  if (!env.PUSH_SUBS) return null;
  const ip =
    req.headers.get('CF-Connecting-IP') ??
    req.headers.get('X-Real-IP') ??
    '0.0.0.0';
  const minute = Math.floor(Date.now() / 60_000);
  const key = `rl:${endpoint}:${ip}:${minute}`;

  let count = 0;
  try {
    const raw = await env.PUSH_SUBS.get(key);
    count = raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return null;  // KV down — fail open
  }

  if (count >= perMinute) {
    return json(
      {
        error: 'rate_limited',
        detail: `${perMinute} requests / minute / IP for ${endpoint}. Try again shortly.`,
      },
      429,
      { 'Retry-After': '60' },
    );
  }

  // Best-effort write; 2-minute TTL lets the bucket roll over naturally.
  try {
    await env.PUSH_SUBS.put(key, String(count + 1), { expirationTtl: 120 });
  } catch {
    /* ignore — write failure shouldn't block the user */
  }
  return null;
}

/* ─── /api/subscribe — Pro-tier waitlist ──────────────────────────── *
 *
 * Stores the e-mail under a `waitlist:<sha256>` key in KV with a
 * timestamp + source + locale payload. Re-submissions of the same
 * address just refresh the entry. The /pricing Pro-tier CTA writes
 * here; the alert("waitlist confirm") elsewhere is being replaced
 * with a real form that posts to this endpoint.
 *
 * No marketing list, no double-opt-in flow yet — that's wired up
 * once the list has a handful of real signups and an actual launch
 * to mail people about.
 */

interface EmailSubscribeBody {
  email?: string;
  locale?: string;
  source?: string;
}

async function handleSubscribe(req: Request, env: Env): Promise<Response> {
  if (!env.PUSH_SUBS) return json({ error: 'storage_disabled' }, 503);

  let body: EmailSubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const email = (body.email ?? '').toString().trim().toLowerCase();
  if (!email || !isValidEmail(email) || email.length > 200) {
    return json({ error: 'invalid_email' }, 400);
  }

  const locale = ['es', 'pt', 'de', 'en'].includes((body.locale ?? '').toLowerCase())
    ? (body.locale as string).toLowerCase()
    : 'en';
  const source = (body.source ?? 'unknown').toString().slice(0, 64);

  const hash = await sha256Hex(email);
  const key = `waitlist:${hash}`;
  await env.PUSH_SUBS.put(
    key,
    JSON.stringify({
      email,
      locale,
      source,
      createdAt: Date.now(),
      ip: req.headers.get('CF-Connecting-IP') ?? null,
    }),
  );
  return json({ ok: true });
}

function isValidEmail(s: string): boolean {
  // Liberal RFC 5322-ish check — good enough to reject obvious junk
  // without false-rejecting legitimate addresses with + tags.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}
