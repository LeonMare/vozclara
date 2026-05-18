/**
 * Client wrapper for /api/curated — featured Knowledge Packs surfaced
 * on /library. Items reference existing /pack/:id routes; for v1
 * those are the sample-pack ids the client already ships, but the
 * server can swap in fresh entries as new content is curated without
 * any client-side change.
 *
 * Two-tier cache:
 *   1. In-memory promise dedupe so concurrent callers share one fetch
 *   2. SessionStorage so a hard nav doesn't pay the round trip again
 *      within the same tab
 */

import { API_BASE } from './apiBase';

const CACHE_KEY = 'vozclara:curated:v1';
const CACHE_TTL_MS = 30 * 60 * 1000;  // 30 min

export interface CuratedItem {
  id: string;
  title: string;
  sourceLang: 'de' | 'es' | 'en' | 'pt' | 'fr';
  packLangs: string[];
  mode: 'learn' | 'brief' | 'study' | 'creator';
  publishedAt: number;
  source: string;
  excerpt: string;
  /**
   * Optional YouTube video id — present on entries that the daily cron
   * auto-generated from a feed. When set, the card links to /new with
   * the URL pre-filled instead of /pack/:id, so the visitor produces
   * their own copy in their preferred locale + mode.
   */
  videoId?: string;
}

interface CachedResponse {
  items: CuratedItem[];
  fetchedAt: number;
}

let inflight: Promise<CuratedItem[]> | null = null;

export async function getCurated(): Promise<CuratedItem[]> {
  // 1. Session cache first
  if (typeof sessionStorage !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as CachedResponse;
        if (Date.now() - cached.fetchedAt < CACHE_TTL_MS && Array.isArray(cached.items)) {
          return cached.items;
        }
      }
    } catch {
      /* fall through */
    }
  }

  // 2. Dedupe in-flight callers
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/curated`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error('bad_status');
      const data = (await res.json()) as { items?: CuratedItem[] };
      const items = Array.isArray(data.items) ? data.items : [];
      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ items, fetchedAt: Date.now() }),
          );
        } catch {
          /* quota / private mode — ignore */
        }
      }
      return items;
    } catch {
      return [];
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
