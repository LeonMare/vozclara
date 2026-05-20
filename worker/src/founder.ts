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
 *   founder:counter  → integer, 0..100
 *   founder:claims   → JSON array of { ts, source? } — audit trail
 *
 * No Paddle webhook yet — by design. LAUNCH_PLAN §17: "nur Payment-
 * Link für Founder Deal jetzt" (originally Stripe, replaced by
 * Paddle 20 May 2026 after Polar's auto-review rejected our YouTube-
 * adjacent use case). When a sale arrives, Paddle emails Christian;
 * he triggers the admin increment manually until we wire the
 * `transaction.completed` webhook through here post-launch.
 *
 * The admin endpoint requires the existing ADMIN_TOKEN secret —
 * same one already used by /api/curated/refresh, so no new secrets
 * to provision.
 */

import type { AuthEnv } from './auth';

interface FounderEnv extends AuthEnv {
  /** Shared admin token gating the increment endpoint. */
  ADMIN_TOKEN?: string;
}

const FOUNDER_MAX = 100;
const COUNTER_KEY = 'founder:counter';
const CLAIMS_KEY = 'founder:claims';

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
