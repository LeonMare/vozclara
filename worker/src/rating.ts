/**
 * Pack rating — the "Michelin Guide for YouTube" launch pitch.
 *
 * Aggregated at the **video** level (not the pack level) because a
 * single source video can yield multiple Packs across modes and
 * languages, but the quality signal belongs to the video itself.
 *
 * Two-tier voting:
 *
 *   • Anonymous (no account):     👍 / 👎 + four 1-tap signals.
 *     Identified by brainId. Re-votes from the same brainId overwrite
 *     the previous vote (no double-counting).
 *
 *   • Signed-in (account):        same as anonymous + 1-5 ⭐ stars
 *     and an optional short text review. Identified by userId.
 *
 * Storage layout (KV namespace AUTH — reused so we don't have to
 * provision another KV; ratings are tiny so the shared budget is
 * comfortable):
 *
 *   rating:<videoId>              aggregated counters per video
 *     {
 *       videoId, videoTitle?,
 *       up, down,
 *       starSum, starCount,        signed-in stars only
 *       signals: { mindBlowing, confusing, misleading, tooLong },
 *       firstRatedAt, lastRatedAt
 *     }
 *
 *   rvote:<videoId>:<voterId>     individual vote (subject to update)
 *     {
 *       voterId, voterType: 'user' | 'brain',
 *       thumb: 'up' | 'down' | null,
 *       stars: 1..5 | null,
 *       signals: { mindBlowing, confusing, misleading, tooLong },
 *       review?: string,
 *       updatedAt
 *     }
 *
 * On every vote we read both keys, diff the new vote against the
 * previous one, and write the aggregate atomically (well, KV is
 * eventually-consistent so it's best-effort — but Cloudflare's
 * single-writer semantics within a request keep collisions rare).
 */

import { getCurrentUser, type AuthEnv } from './auth';

const MAX_REVIEW_LEN = 600;
const VOTER_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const VALID_THUMB = new Set(['up', 'down', null]);
const VALID_SIGNALS = ['mindBlowing', 'confusing', 'misleading', 'tooLong'] as const;
type SignalKey = (typeof VALID_SIGNALS)[number];

interface SignalCounts {
  mindBlowing: number;
  confusing: number;
  misleading: number;
  tooLong: number;
}

function emptySignals(): SignalCounts {
  return { mindBlowing: 0, confusing: 0, misleading: 0, tooLong: 0 };
}

interface RatingAggregate {
  videoId: string;
  videoTitle?: string;
  up: number;
  down: number;
  starSum: number;
  starCount: number;
  signals: SignalCounts;
  firstRatedAt: number;
  lastRatedAt: number;
}

interface VoteRecord {
  voterId: string;
  voterType: 'user' | 'brain';
  thumb: 'up' | 'down' | null;
  stars: number | null;
  signals: SignalCounts;
  review?: string;
  updatedAt: number;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function emptyAggregate(videoId: string): RatingAggregate {
  return {
    videoId,
    up: 0,
    down: 0,
    starSum: 0,
    starCount: 0,
    signals: emptySignals(),
    firstRatedAt: 0,
    lastRatedAt: 0,
  };
}

function sanitizeVoterId(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  return VOTER_ID_RE.test(input) ? input : null;
}

function sanitizeVideoId(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  if (input.length === 0 || input.length > 64) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(input)) return null;
  return input;
}

function sanitizeThumb(input: unknown): 'up' | 'down' | null {
  if (input === 'up' || input === 'down') return input;
  if (input === null) return null;
  return null;
}

function sanitizeStars(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'number') return null;
  if (!Number.isFinite(input)) return null;
  const n = Math.round(input);
  if (n < 1 || n > 5) return null;
  return n;
}

function sanitizeSignals(input: unknown): SignalCounts {
  const out = emptySignals();
  if (!input || typeof input !== 'object') return out;
  for (const key of VALID_SIGNALS) {
    const v = (input as Record<string, unknown>)[key];
    if (v === true) out[key] = 1;
    else if (typeof v === 'number') out[key] = v > 0 ? 1 : 0;
  }
  return out;
}

function sanitizeReview(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined;
  const trimmed = input.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.slice(0, MAX_REVIEW_LEN);
}

async function getAggregate(env: AuthEnv, videoId: string): Promise<RatingAggregate> {
  if (!env.AUTH) return emptyAggregate(videoId);
  const raw = await env.AUTH.get(`rating:${videoId}`);
  if (!raw) return emptyAggregate(videoId);
  try {
    const parsed = JSON.parse(raw) as Partial<RatingAggregate>;
    return {
      videoId,
      videoTitle: parsed.videoTitle,
      up: parsed.up ?? 0,
      down: parsed.down ?? 0,
      starSum: parsed.starSum ?? 0,
      starCount: parsed.starCount ?? 0,
      signals: { ...emptySignals(), ...(parsed.signals ?? {}) },
      firstRatedAt: parsed.firstRatedAt ?? 0,
      lastRatedAt: parsed.lastRatedAt ?? 0,
    };
  } catch {
    return emptyAggregate(videoId);
  }
}

async function putAggregate(env: AuthEnv, agg: RatingAggregate): Promise<void> {
  if (!env.AUTH) return;
  await env.AUTH.put(`rating:${agg.videoId}`, JSON.stringify(agg));
}

async function getVote(env: AuthEnv, videoId: string, voterId: string): Promise<VoteRecord | null> {
  if (!env.AUTH) return null;
  const raw = await env.AUTH.get(`rvote:${videoId}:${voterId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VoteRecord;
  } catch {
    return null;
  }
}

async function putVote(env: AuthEnv, videoId: string, record: VoteRecord): Promise<void> {
  if (!env.AUTH) return;
  await env.AUTH.put(`rvote:${videoId}:${record.voterId}`, JSON.stringify(record));
}

/**
 * Apply a new vote on top of an existing aggregate. Returns the new
 * aggregate. Diffs both `previous` and `next` so re-voting only
 * shifts the delta — never double-counts.
 */
function applyVoteDiff(
  agg: RatingAggregate,
  previous: VoteRecord | null,
  next: VoteRecord,
): RatingAggregate {
  const out: RatingAggregate = {
    ...agg,
    signals: { ...agg.signals },
  };

  // Thumb delta
  if (previous?.thumb === 'up') out.up = Math.max(0, out.up - 1);
  if (previous?.thumb === 'down') out.down = Math.max(0, out.down - 1);
  if (next.thumb === 'up') out.up += 1;
  if (next.thumb === 'down') out.down += 1;

  // Stars delta (only signed-in users actually have stars)
  if (previous?.stars !== null && previous?.stars !== undefined) {
    out.starSum = Math.max(0, out.starSum - previous.stars);
    out.starCount = Math.max(0, out.starCount - 1);
  }
  if (next.stars !== null && next.stars !== undefined) {
    out.starSum += next.stars;
    out.starCount += 1;
  }

  // Signal deltas (each signal is 0 or 1 per voter)
  for (const key of VALID_SIGNALS) {
    const prev = previous?.signals?.[key] ?? 0;
    const nxt = next.signals[key];
    out.signals[key] = Math.max(0, out.signals[key] - prev + nxt);
  }

  const now = Date.now();
  out.lastRatedAt = now;
  if (out.firstRatedAt === 0) out.firstRatedAt = now;
  return out;
}

/* ─── Endpoints ──────────────────────────────────────────────────── */

/**
 * POST /api/rating
 *
 * Body: {
 *   videoId, brainId?,            (brainId required if not signed-in)
 *   videoTitle?,                   stored on the aggregate for /discover
 *   thumb?: 'up' | 'down' | null,
 *   stars?: 1..5 | null,           (signed-in only — anon stars rejected)
 *   signals?: { mindBlowing, confusing, misleading, tooLong },
 *   review?: string                (signed-in only)
 * }
 *
 * Returns: { ok, aggregate, vote }
 */
export async function handleRatingPost(req: Request, env: AuthEnv): Promise<Response> {
  if (!env.AUTH) return json({ error: 'rating_disabled' }, 503);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const videoId = sanitizeVideoId(body.videoId);
  if (!videoId) return json({ error: 'invalid_video_id' }, 400);

  const user = await getCurrentUser(req, env);

  let voterId: string;
  let voterType: 'user' | 'brain';
  if (user) {
    voterId = user.id;
    voterType = 'user';
  } else {
    const brainId = sanitizeVoterId(body.brainId);
    if (!brainId) return json({ error: 'missing_voter_id' }, 400);
    voterId = brainId;
    voterType = 'brain';
  }

  // Stars + reviews are account-only — silently drop them on anonymous
  // submissions so a hand-rolled request can't game the average.
  const stars = voterType === 'user' ? sanitizeStars(body.stars) : null;
  const review = voterType === 'user' ? sanitizeReview(body.review) : undefined;

  const next: VoteRecord = {
    voterId,
    voterType,
    thumb: sanitizeThumb(body.thumb),
    stars,
    signals: sanitizeSignals(body.signals),
    review,
    updatedAt: Date.now(),
  };

  const previous = await getVote(env, videoId, voterId);
  const aggBefore = await getAggregate(env, videoId);
  const aggAfter = applyVoteDiff(aggBefore, previous, next);

  // Stash the title on first vote — useful for the discovery page.
  if (typeof body.videoTitle === 'string' && body.videoTitle.length > 0) {
    aggAfter.videoTitle = body.videoTitle.slice(0, 200);
  }

  await Promise.all([
    putVote(env, videoId, next),
    putAggregate(env, aggAfter),
  ]);

  return json({ ok: true, aggregate: aggAfter, vote: next });
}

/**
 * GET /api/rating?videoId=<id>
 * Public — anyone can read aggregate.
 */
export async function handleRatingGet(url: URL, env: AuthEnv): Promise<Response> {
  if (!env.AUTH) return json({ error: 'rating_disabled' }, 503);
  const videoId = sanitizeVideoId(url.searchParams.get('videoId'));
  if (!videoId) return json({ error: 'invalid_video_id' }, 400);
  const agg = await getAggregate(env, videoId);
  return json({ aggregate: agg });
}

/**
 * GET /api/rating/me?videoId=<id>&brainId=<id>
 *
 * Returns the caller's own vote (so the UI can pre-fill the panel
 * with what they've already chosen). Signed-in users are matched
 * by userId; anonymous callers must pass their brainId.
 */
export async function handleRatingMe(req: Request, env: AuthEnv): Promise<Response> {
  if (!env.AUTH) return json({ error: 'rating_disabled' }, 503);
  const url = new URL(req.url);
  const videoId = sanitizeVideoId(url.searchParams.get('videoId'));
  if (!videoId) return json({ error: 'invalid_video_id' }, 400);

  const user = await getCurrentUser(req, env);
  let voterId: string | null;
  if (user) {
    voterId = user.id;
  } else {
    voterId = sanitizeVoterId(url.searchParams.get('brainId'));
  }
  if (!voterId) return json({ vote: null });

  const vote = await getVote(env, videoId, voterId);
  return json({ vote });
}

/**
 * POST /api/rating/bulk   body: { videoIds: string[] }
 *
 * Library renders N pack cards on every visit; a per-card fetch
 * would cost N round trips. This endpoint takes up to 64 ids in one
 * request and returns a map { [videoId]: aggregate }. Missing ids
 * (never rated) are omitted from the map so the client can branch
 * on `aggregate ?? null` cleanly. Public — same trust model as the
 * single-id GET.
 */
export async function handleRatingBulk(req: Request, env: AuthEnv): Promise<Response> {
  if (!env.AUTH) return json({ error: 'rating_disabled' }, 503);

  let body: { videoIds?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (!Array.isArray(body.videoIds)) return json({ error: 'missing_ids' }, 400);

  const ids = body.videoIds
    .map((v) => sanitizeVideoId(v))
    .filter((v): v is string => v !== null)
    .slice(0, 64);

  if (ids.length === 0) return json({ aggregates: {} });

  const entries = await Promise.all(
    ids.map(async (id) => {
      const raw = await env.AUTH!.get(`rating:${id}`);
      if (!raw) return null;
      try {
        return [id, JSON.parse(raw) as RatingAggregate] as const;
      } catch {
        return null;
      }
    }),
  );

  const aggregates: Record<string, RatingAggregate> = {};
  for (const e of entries) if (e) aggregates[e[0]] = e[1];
  return json({ aggregates });
}

/**
 * GET /api/rating/top?limit=20&since=all|week|month
 *
 * Lists the highest-quality videos by Wilson-score lower bound. KV
 * list-prefix is cheap (no scan beyond the matched keys) and we cap
 * at 200 candidates per request. Sorting happens in-memory.
 *
 * Wilson lower bound gives a confidence-aware ranking — a video
 * with 4/4 👍 ranks BELOW one with 95/100 👍 even though the raw
 * ratio is higher, because the small sample is less trustworthy.
 * That's the right behaviour for a /discover page: hide flukes,
 * surface durable quality.
 *
 * The `since` window narrows candidates by lastRatedAt — "this week"
 * means at least one fresh vote in the last 7 days, not "got its
 * first vote in the last 7 days". That matches user expectation:
 * trending = active. The Wilson ranking then still uses the full
 * vote history so a long-respected video with one fresh vote ranks
 * above a single-thumb fluke.
 */
export async function handleRatingTop(url: URL, env: AuthEnv): Promise<Response> {
  if (!env.AUTH) return json({ error: 'rating_disabled' }, 503);
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') ?? 20)));
  const sinceRaw = url.searchParams.get('since') ?? 'all';
  const since: 'all' | 'week' | 'month' =
    sinceRaw === 'week' ? 'week' : sinceRaw === 'month' ? 'month' : 'all';
  const sinceCutoff =
    since === 'week' ? Date.now() - 7 * 24 * 3600 * 1000 :
    since === 'month' ? Date.now() - 30 * 24 * 3600 * 1000 :
    0;

  const candidates: RatingAggregate[] = [];
  let cursor: string | undefined;
  let scanned = 0;
  do {
    const page = await env.AUTH.list({ prefix: 'rating:', cursor, limit: 100 });
    for (const k of page.keys) {
      const raw = await env.AUTH.get(k.name);
      if (!raw) continue;
      try {
        const agg = JSON.parse(raw) as RatingAggregate;
        // Need at least 3 thumbs to qualify — single 👍 shouldn't
        // ride into the top list as "best of all time".
        if (agg.up + agg.down < 3) continue;
        if (sinceCutoff > 0 && agg.lastRatedAt < sinceCutoff) continue;
        candidates.push(agg);
      } catch { /* skip malformed */ }
      scanned += 1;
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && scanned < 200);

  const scored = candidates
    .map((a) => ({ a, score: wilsonLowerBound(a.up, a.down) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(({ a, score }) => ({ ...a, score }));

  return json({ items: scored, since });
}

/**
 * Wilson score interval lower bound at 95% confidence.
 * https://www.evanmiller.org/how-not-to-sort-by-average-rating.html
 */
function wilsonLowerBound(up: number, down: number): number {
  const n = up + down;
  if (n === 0) return 0;
  const z = 1.96;
  const p = up / n;
  const denom = 1 + (z * z) / n;
  const center = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  return (center - margin) / denom;
}
