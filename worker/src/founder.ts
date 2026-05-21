/**
 * Founder Deal — the launch cashflow hook.
 *
 * §7 of LAUNCH_PLAN: €99 one-time, limited to the first 100 founding
 * members. Paddle (Merchant of Record, approved 20 May 2026) handles
 * the actual transaction via the embedded checkout overlay rendered
 * on /founder by src/lib/founder.ts; this module only persists how
 * many seats have been claimed so the landing page can show live
 * urgency ("23 of 100 claimed").
 *
 * Storage layout (AUTH KV — shared with the rest of the account
 * state, keeps namespace count down on the Cloudflare plan):
 *
 *   founder:counter                       → integer, 0..100
 *   founder:claims                        → JSON array of { ts, source? }
 *   founder:webhook:processed:${eventId}  → "1" with 7d TTL (idempotency)
 *
 * Three counter-write paths:
 *   1. handleFounderWebhook   — Paddle pushes `transaction.completed`
 *      with our Founder price-id. Signature-verified, replay-protected,
 *      idempotent per Paddle event_id. **Primary path post-Mi-21.5.**
 *   2. handleFounderIncrement — manual admin bump (ADMIN_TOKEN gated).
 *      Fallback if the webhook is misconfigured or the secret is rotated.
 *   3. handleFounderSet       — admin set-exact for backfills + tests.
 *
 * The webhook endpoint requires PADDLE_WEBHOOK_SECRET to be set via
 *   wrangler secret put PADDLE_WEBHOOK_SECRET
 * The secret is generated in the Paddle dashboard under
 *   Developer Tools → Notifications → (your destination) → Secret key.
 * Without it, /api/founder/webhook returns 503 webhook_disabled so we
 * fail loud rather than silently swallowing real sales.
 */

import { setUserTierByEmail, type AuthEnv } from './auth';

interface FounderEnv extends AuthEnv {
  /** Shared admin token gating the manual increment + set endpoints. */
  ADMIN_TOKEN?: string;
  /**
   * Paddle webhook signing secret (Developer Tools → Notifications →
   * destination → Secret key). HMAC-SHA256 over `${ts}:${rawBody}`.
   * When absent, /api/founder/webhook returns 503 webhook_disabled.
   */
  PADDLE_WEBHOOK_SECRET?: string;
}

const FOUNDER_MAX = 100;
const COUNTER_KEY = 'founder:counter';
const CLAIMS_KEY = 'founder:claims';

/**
 * Our Founder Deal price-id in Paddle. The webhook ignores transactions
 * that don't include this price so an unrelated product purchase never
 * bumps the seat counter. Update via wrangler.toml [vars] if we ever
 * mint a new price (e.g. price-tier change post-launch).
 */
const FOUNDER_PRICE_ID = 'pri_01ks30tgbj097qbtjhebzqyf2z';

/** Idempotency dedupe window — Paddle rarely retries past 24h, 7d is a comfortable buffer. */
const WEBHOOK_DEDUPE_TTL = 60 * 60 * 24 * 7;

/** Replay-protection window. Paddle docs recommend ≤ 5 minutes. */
const SIGNATURE_MAX_AGE_SEC = 300;

interface ClaimEntry {
  ts: number;
  source?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store',
    },
  });
}

async function readCounter(env: FounderEnv): Promise<number> {
  if (!env.AUTH) return 0;
  const raw = await env.AUTH.get(COUNTER_KEY);
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, FOUNDER_MAX) : 0;
}

async function writeCounter(env: FounderEnv, n: number): Promise<void> {
  if (!env.AUTH) return;
  await env.AUTH.put(COUNTER_KEY, String(Math.max(0, Math.min(n, FOUNDER_MAX))));
}

async function appendClaim(env: FounderEnv, entry: ClaimEntry): Promise<void> {
  if (!env.AUTH) return;
  const raw = await env.AUTH.get(CLAIMS_KEY);
  const list: ClaimEntry[] = raw ? (JSON.parse(raw) as ClaimEntry[]) : [];
  list.push(entry);
  // Cap at 200 entries — past 100 claims it's just audit padding,
  // we don't want unbounded growth in a KV value.
  await env.AUTH.put(CLAIMS_KEY, JSON.stringify(list.slice(-200)));
}

/**
 * GET /api/founder/status
 *
 * Public — anyone can read how many seats are taken so the landing
 * page can render urgency. Response: { claimed, max, available }.
 * Cache-Control: no-store so the counter is always fresh.
 */
export async function handleFounderStatus(_req: Request, env: FounderEnv): Promise<Response> {
  if (!env.AUTH) {
    // KV not bound — frontend should fall back to a static "limited"
    // message rather than failing. Return 200 with available:false
    // and claimed:null so the UI treats it as "unknown but not gone".
    return json({ claimed: null, max: FOUNDER_MAX, available: true });
  }
  const claimed = await readCounter(env);
  return json({
    claimed,
    max: FOUNDER_MAX,
    available: claimed < FOUNDER_MAX,
  });
}

/**
 * POST /api/founder/admin/increment   header: X-Admin-Token: <token>
 *
 * Manual sale-confirmation. Called by Christian when a Paddle sale
 * email lands (until the `transaction.completed` webhook is wired,
 * sub-launch task — see file-header docblock). Idempotency is on
 * the caller — if you click twice, the counter ticks twice. Trade-
 * off accepted; tooling around this is a post-launch concern.
 *
 * Body (optional): { source?: "paddle_email" | "discord" | ... }
 * Returns the new state so the curl invocation surfaces it.
 */
export async function handleFounderIncrement(req: Request, env: FounderEnv): Promise<Response> {
  if (!env.ADMIN_TOKEN) return json({ error: 'admin_disabled' }, 503);
  const token = req.headers.get('X-Admin-Token') ?? '';
  if (token !== env.ADMIN_TOKEN) return json({ error: 'unauthorized' }, 401);

  let body: { source?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch { /* empty body fine */ }

  const before = await readCounter(env);
  if (before >= FOUNDER_MAX) {
    return json({ error: 'sold_out', claimed: before, max: FOUNDER_MAX }, 409);
  }
  const after = before + 1;
  await Promise.all([
    writeCounter(env, after),
    appendClaim(env, { ts: Date.now(), source: body.source }),
  ]);
  return json({ ok: true, claimed: after, max: FOUNDER_MAX, available: after < FOUNDER_MAX });
}

/**
 * POST /api/founder/admin/set   header: X-Admin-Token: <token>
 *                                body: { claimed }
 *
 * Sets the counter to an exact value — useful for backfills (e.g.
 * "we sold 12 outside the system, line them up") and for resetting
 * to zero during testing.
 */
export async function handleFounderSet(req: Request, env: FounderEnv): Promise<Response> {
  if (!env.ADMIN_TOKEN) return json({ error: 'admin_disabled' }, 503);
  const token = req.headers.get('X-Admin-Token') ?? '';
  if (token !== env.ADMIN_TOKEN) return json({ error: 'unauthorized' }, 401);

  let body: { claimed?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const n = typeof body.claimed === 'number' ? Math.round(body.claimed) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > FOUNDER_MAX) {
    return json({ error: 'invalid_claimed' }, 400);
  }
  await writeCounter(env, n);
  return json({ ok: true, claimed: n, max: FOUNDER_MAX, available: n < FOUNDER_MAX });
}

/* ─── Paddle webhook ────────────────────────────────────────────────────── */

/** Minimal shape of a Paddle Billing v2 webhook event we care about. */
interface PaddleWebhookEvent {
  event_id?: string;
  event_type?: string;
  occurred_at?: string;
  data?: {
    id?: string;
    items?: Array<{
      price?: { id?: string };
    }>;
    /**
     * Customer block — only present when the Paddle dashboard's
     * webhook destination has "Include customer" / extended data
     * toggled on (Developer Tools → Notifications → destination →
     * advanced settings). When the field is absent we still bump
     * the counter and Christian uses
     * /api/founder/admin/grant-tier as the manual backup to
     * upgrade the user. The Paddle field is `customer.email`; if
     * Paddle ever switches to `customer.email_address` we'll need
     * to add an alias here.
     */
    customer?: {
      email?: string;
    };
  };
}

/**
 * POST /api/founder/webhook   header: Paddle-Signature: ts=…;h1=…
 *
 * Receives Paddle Billing v2 notifications. We only act on
 * `transaction.completed` events that contain our Founder price-id;
 * everything else is acknowledged with 200 + ignored=<reason> so Paddle
 * does not retry indefinitely.
 *
 * Verification chain (any failure → 401, no state mutation):
 *   1. PADDLE_WEBHOOK_SECRET configured (else 503 webhook_disabled)
 *   2. Paddle-Signature header present + parseable as ts=…;h1=…
 *   3. Timestamp within ±SIGNATURE_MAX_AGE_SEC (replay protection)
 *   4. HMAC-SHA256(`${ts}:${rawBody}`, secret) === h1 (constant-time)
 *
 * Idempotency: dedupe by `event_id` in AUTH KV with a 7-day TTL.
 * Paddle retries failed deliveries with the same event_id; without
 * dedupe, a slow downstream call could double-bump the counter.
 */
export async function handleFounderWebhook(req: Request, env: FounderEnv): Promise<Response> {
  if (!env.PADDLE_WEBHOOK_SECRET) {
    return json({ error: 'webhook_disabled' }, 503);
  }

  const sigHeader = req.headers.get('Paddle-Signature') ?? '';
  if (!sigHeader) return json({ error: 'no_signature' }, 401);

  // Parse "ts=1234567890;h1=hexhmac". Tolerate spaces around the
  // separators because some intermediaries normalise the header.
  const sigParts: Record<string, string> = {};
  for (const segment of sigHeader.split(';')) {
    const [k, v] = segment.split('=');
    if (k && v) sigParts[k.trim()] = v.trim();
  }
  const ts = sigParts.ts;
  const h1 = sigParts.h1;
  if (!ts || !h1) return json({ error: 'bad_signature_format' }, 401);

  const nowSec = Math.floor(Date.now() / 1000);
  const tsNum = parseInt(ts, 10);
  if (!Number.isFinite(tsNum) || Math.abs(nowSec - tsNum) > SIGNATURE_MAX_AGE_SEC) {
    return json({ error: 'stale_signature' }, 401);
  }

  // Read raw body BEFORE parsing — HMAC must be computed over the
  // exact bytes Paddle signed, not a re-serialised JSON object.
  const rawBody = await req.text();

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(env.PADDLE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(`${ts}:${rawBody}`));
  const computed = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (!timingSafeEqualHex(computed, h1)) {
    return json({ error: 'bad_signature' }, 401);
  }

  let event: PaddleWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaddleWebhookEvent;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  // Acknowledge non-target events with 200 so Paddle stops retrying.
  // We subscribe to transaction.completed only, but Paddle dashboards
  // sometimes broadcast extras during testing.
  if (event.event_type !== 'transaction.completed') {
    return json({ ok: true, ignored: event.event_type ?? 'unknown_event' });
  }

  const eventId = event.event_id;
  if (!eventId) return json({ error: 'no_event_id' }, 400);

  // Only count transactions that include our Founder price. Anything
  // else (Pro/Pro Plus subs once we wire them, gift purchases, refunds)
  // is acknowledged-and-ignored.
  const isFounderTx = event.data?.items?.some(
    (it) => it.price?.id === FOUNDER_PRICE_ID,
  );
  if (!isFounderTx) {
    return json({ ok: true, ignored: 'not_founder_price' });
  }

  // Idempotency check. Paddle retries failed deliveries with the same
  // event_id, so we must not bump the counter twice for one sale.
  const dedupKey = `founder:webhook:processed:${eventId}`;
  if (env.AUTH) {
    const seen = await env.AUTH.get(dedupKey);
    if (seen) {
      return json({ ok: true, idempotent: true, event_id: eventId });
    }
  }

  const before = await readCounter(env);
  if (before >= FOUNDER_MAX) {
    // Mark processed so Paddle doesn't retry, but flag the overflow.
    // (In practice Paddle's inventory cap should prevent the 101st
    // sale; this is a safety net for race conditions.)
    if (env.AUTH) {
      await env.AUTH.put(dedupKey, '1', { expirationTtl: WEBHOOK_DEDUPE_TTL });
    }
    return json({ ok: true, sold_out: true, claimed: before, event_id: eventId });
  }

  const after = before + 1;
  await Promise.all([
    writeCounter(env, after),
    appendClaim(env, {
      ts: Date.now(),
      source: `paddle_webhook:${event.data?.id ?? 'unknown'}`,
    }),
    env.AUTH
      ? env.AUTH.put(dedupKey, '1', { expirationTtl: WEBHOOK_DEDUPE_TTL })
      : Promise.resolve(),
  ]);

  // Tier upgrade — best-effort. If the Paddle dashboard's webhook
  // destination has "Include customer" enabled, the email rides
  // along on the event and we can auto-promote the user to
  // pro_plus. If the email is missing OR doesn't match a VozClara
  // account, the counter still bumps and Christian uses
  // POST /api/founder/admin/grant-tier as the manual backup.
  const customerEmail = event.data?.customer?.email;
  const tierGranted = customerEmail
    ? await setUserTierByEmail(env, customerEmail, 'pro_plus')
    : null;

  return json({
    ok: true,
    claimed: after,
    max: FOUNDER_MAX,
    available: after < FOUNDER_MAX,
    event_id: eventId,
    tier_granted: tierGranted,
  });
}

/**
 * Constant-time comparison of two hex strings. Standard timing-safe
 * compare; we cannot use Node's crypto.timingSafeEqual in a Worker.
 */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * POST /api/founder/admin/grant-tier   header: X-Admin-Token: <token>
 *                                       body: { email, tier }
 *
 * Manual tier upgrade — the backup path for the Paddle webhook's
 * auto-promotion. Use when:
 *   • The Paddle webhook destination doesn't include customer data
 *     (so `tier_granted: null` in the webhook response).
 *   • The Paddle email doesn't match the VozClara account email
 *     (user paid with foo+work@gmail.com but signed up with
 *     foo@gmail.com).
 *   • Backfilling pre-launch friends-and-family Pro Plus grants.
 *
 * Body shape:
 *   { email: string, tier: 'free' | 'pro' | 'pro_plus' }
 *
 * Returns:
 *   200 { ok: true, userId, oldTier, newTier }   on success
 *   404 { error: 'user_not_found', email }       when no match
 *   400 { error: 'invalid_*' }                   on bad input
 *   401 { error: 'unauthorized' }                missing admin token
 *   503 { error: 'admin_disabled' }              ADMIN_TOKEN not set
 *
 * Curl shape:
 *   curl -X POST 'https://vozclara.app/api/founder/admin/grant-tier' \
 *     -H 'X-Admin-Token: …' \
 *     -H 'Content-Type: application/json' \
 *     -d '{"email":"foo@example.com","tier":"pro_plus"}'
 */
export async function handleFounderGrantTier(
  req: Request,
  env: FounderEnv,
): Promise<Response> {
  if (!env.ADMIN_TOKEN) return json({ error: 'admin_disabled' }, 503);
  const token = req.headers.get('X-Admin-Token') ?? '';
  if (token !== env.ADMIN_TOKEN) return json({ error: 'unauthorized' }, 401);

  let body: { email?: unknown; tier?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return json({ error: 'invalid_email' }, 400);
  }

  const tier = body.tier;
  if (tier !== 'free' && tier !== 'pro' && tier !== 'pro_plus') {
    return json(
      {
        error: 'invalid_tier',
        detail: "tier must be 'free' | 'pro' | 'pro_plus'",
      },
      400,
    );
  }

  const result = await setUserTierByEmail(env, email, tier);
  if (!result) {
    return json({ error: 'user_not_found', email }, 404);
  }
  return json({
    ok: true,
    userId: result.userId,
    oldTier: result.oldTier,
    newTier: tier,
  });
}
