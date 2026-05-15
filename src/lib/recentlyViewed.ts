/**
 * Recently-viewed pack tracking.
 *
 * Keeps a short, ordered list of pack IDs the user has opened, with
 * the most recent at the front. Persisted in localStorage so it
 * survives page reloads. Capped at 8 entries — the library only
 * surfaces the top 4-5 of these anyway, but the buffer lets us
 * recover gracefully if a user deletes a recently-viewed pack.
 *
 * Tracks sample packs too — clicking through to /pack/sample and
 * returning to /library should put the sample on the recent row,
 * because that's where the user expects to find it again.
 *
 * No analytics, no network — pure local-first behavioural memory.
 */

const KEY = 'vozclara:recentlyViewed';
const MAX = 8;

interface RecentEntry {
  id: string;
  ts: number;
}

function readList(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    return list
      .filter((e): e is RecentEntry =>
        !!e && typeof e === 'object' && typeof (e as RecentEntry).id === 'string',
      )
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function writeList(list: RecentEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Quota exceeded or privacy mode — silently ignore.
  }
}

/**
 * Record a pack view. Moves the pack to the front if already present,
 * otherwise prepends a new entry. The list is trimmed to MAX on every
 * write so we never accumulate more than the cap.
 */
export function recordView(packId: string): void {
  if (!packId) return;
  const list = readList().filter((e) => e.id !== packId);
  list.unshift({ id: packId, ts: Date.now() });
  writeList(list);
}

/**
 * Return the pack IDs in most-recent-first order.
 */
export function getRecentlyViewed(): string[] {
  return readList().map((e) => e.id);
}

/**
 * Remove a single pack from the recent list. Called when a user
 * deletes a pack so the recent row doesn't show a 404 chip.
 */
export function forgetView(packId: string): void {
  const list = readList().filter((e) => e.id !== packId);
  writeList(list);
}

/**
 * Clear the entire recent list. Not currently exposed in the UI but
 * useful for the future "Clear all data" path.
 */
export function clearRecentlyViewed(): void {
  writeList([]);
}
