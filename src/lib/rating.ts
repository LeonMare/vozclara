/**
 * Client wrapper for /api/rating — the Michelin Rating endpoints.
 *
 * Two-tier voting model the UI components consume:
 *
 *   • Anonymous (no account):     thumb (👍/👎) + signals
 *   • Signed-in (account):        thumb + signals + stars + review
 *
 * The worker enforces the signed-in-only fields server-side, so even
 * if a client sends stars without a session those fields are dropped
 * silently — no bypass via DevTools.
 *
 * Aggregates are read-public: any visitor can see the up/down/stars
 * counts on a Pack page, which is the point of a rating system.
 */

import { API_BASE } from './apiBase';

export interface RatingSignals {
  mindBlowing: boolean;
  confusing: boolean;
  misleading: boolean;
  tooLong: boolean;
}

export interface RatingAggregate {
  videoId: string;
  videoTitle?: string;
  up: number;
  down: number;
  /** Sum of all ⭐ values cast by signed-in voters. */
  starSum: number;
  /** Number of signed-in voters who cast stars. */
  starCount: number;
  /** Tap-count per signal across all voters. */
  signals: { mindBlowing: number; confusing: number; misleading: number; tooLong: number };
  firstRatedAt: number;
  lastRatedAt: number;
  /** Only present on /api/rating/top responses. */
  score?: number;
}

export interface MyVote {
  voterId: string;
  voterType: 'user' | 'brain';
  thumb: 'up' | 'down' | null;
  stars: number | null;
  signals: RatingSignals;
  review?: string;
  updatedAt: number;
}

export class RatingError extends Error {
  constructor(public code: 'disabled' | 'invalid' | 'network', message: string) {
    super(message);
    this.name = 'RatingError';
  }
}

/* ─── Reads ─────────────────────────────────────────────────────── */

export async function fetchAggregate(videoId: string): Promise<RatingAggregate> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/rating?videoId=${encodeURIComponent(videoId)}`, {
      credentials: 'include',
    });
  } catch (err) {
    throw new RatingError('network', String(err));
  }
  if (res.status === 503) throw new RatingError('disabled', 'rating disabled');
  if (!res.ok) throw new RatingError('network', `HTTP ${res.status}`);
  const body = (await res.json()) as { aggregate: RatingAggregate };
  return body.aggregate;
}

export async function fetchMyVote(args: { videoId: string; brainId?: string }): Promise<MyVote | null> {
  const params = new URLSearchParams({ videoId: args.videoId });
  if (args.brainId) params.set('brainId', args.brainId);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/rating/me?${params.toString()}`, {
      credentials: 'include',
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const body = (await res.json()) as { vote: MyVote | null };
  return body.vote;
}

/**
 * Bulk-fetch aggregates for up to 64 video ids in one round trip.
 * Returns a map keyed by videoId — missing entries are omitted, so
 * the consumer can `map[id] ?? null` and treat absence as "never
 * rated". Used by /library to decorate pack cards without making
 * N requests.
 */
export async function fetchAggregatesBulk(videoIds: string[]): Promise<Record<string, RatingAggregate>> {
  if (videoIds.length === 0) return {};
  try {
    const res = await fetch(`${API_BASE}/api/rating/bulk`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoIds }),
    });
    if (!res.ok) return {};
    const body = (await res.json()) as { aggregates: Record<string, RatingAggregate> };
    return body.aggregates;
  } catch {
    return {};
  }
}

export type TopSince = 'all' | 'week' | 'month';

export async function fetchTopRated(limit = 20, since: TopSince = 'all'): Promise<RatingAggregate[]> {
  try {
    const params = new URLSearchParams({ limit: String(limit), since });
    const res = await fetch(`${API_BASE}/api/rating/top?${params.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { items: RatingAggregate[] };
    return body.items;
  } catch {
    return [];
  }
}

/* ─── Writes ────────────────────────────────────────────────────── */

export interface SubmitRatingArgs {
  videoId: string;
  /** Required when not signed-in — the worker uses it as voterId. */
  brainId?: string;
  /** Stored on first vote, helps the /discover page render titles. */
  videoTitle?: string;
  thumb?: 'up' | 'down' | null;
  /** Stars are silently dropped on anonymous submissions. */
  stars?: number | null;
  signals?: Partial<RatingSignals>;
  /** Text review — signed-in only, dropped otherwise. */
  review?: string;
}

export async function submitRating(args: SubmitRatingArgs): Promise<{ aggregate: RatingAggregate; vote: MyVote }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/rating`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: args.videoId,
        brainId: args.brainId,
        videoTitle: args.videoTitle,
        thumb: args.thumb ?? null,
        stars: args.stars ?? null,
        signals: args.signals ?? {},
        review: args.review,
      }),
    });
  } catch (err) {
    throw new RatingError('network', String(err));
  }
  if (res.status === 503) throw new RatingError('disabled', 'rating disabled');
  if (res.status === 400) throw new RatingError('invalid', 'invalid rating payload');
  if (!res.ok) throw new RatingError('network', `HTTP ${res.status}`);
  return (await res.json()) as { aggregate: RatingAggregate; vote: MyVote };
}

/* ─── Derived display helpers ───────────────────────────────────── */

/**
 * Average star value rounded to one decimal, or null when no signed-in
 * voter has rated yet. Components use this to decide whether to render
 * the star block at all.
 */
export function averageStars(agg: RatingAggregate): number | null {
  if (agg.starCount === 0) return null;
  return Math.round((agg.starSum / agg.starCount) * 10) / 10;
}

/**
 * Net-thumb count — positive = mostly liked, negative = mostly
 * disliked, 0 = unrated or tied.
 */
export function netThumbs(agg: RatingAggregate): number {
  return agg.up - agg.down;
}

/**
 * Crude approval percent (up / total thumbs). Returns null below
 * the trust threshold so single-vote items don't display 100 %.
 */
export function approvalPercent(agg: RatingAggregate, minVotes = 3): number | null {
  const total = agg.up + agg.down;
  if (total < minVotes) return null;
  return Math.round((agg.up / total) * 100);
}

/* ─── Reviews — per-video list of signed-in text reviews ────────── */

export interface ReviewItem {
  /** 8-char opaque slice of the original voterId. Stable per reviewer,
   *  reveals nothing about identity. Used for per-row avatar colour. */
  voterId: string;
  voterType: 'user' | 'brain';
  stars: number | null;
  review: string;
  updatedAt: number;
}

/**
 * Fetch the most recent text reviews on a video. Returns an empty array
 * for unrated videos, never throws — review-display is non-critical UI
 * and should degrade silently if the worker is unreachable.
 */
export async function fetchReviews(videoId: string, limit = 20): Promise<ReviewItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/rating/reviews?videoId=${encodeURIComponent(videoId)}&limit=${limit}`,
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { items?: ReviewItem[] };
    return Array.isArray(body.items) ? body.items : [];
  } catch {
    return [];
  }
}
