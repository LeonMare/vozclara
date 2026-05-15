/**
 * Per-Pack feedback storage — local-first, IndexedDB-backed.
 *
 * MVP design: feedback never leaves the browser. We store it under
 * its own keyspace next to the pack itself so the user can change
 * their vote, the reasons, and the optional note at any time, and
 * the state persists across reloads.
 *
 * Schema is intentionally small so when we wire a real backend later
 * (Cloudflare D1, or just an /api/feedback endpoint), we can ship
 * batches of these records without further migration.
 */

import { get, set } from 'idb-keyval';

export type FeedbackVote = 'useful' | 'not_useful';

export type FeedbackReason =
  | 'too_shallow'
  | 'wrong_language'
  | 'inaccurate'
  | 'wrong_genre'
  | 'wrong_mode';

export interface PackFeedback {
  packId: string;
  vote: FeedbackVote | null;
  reasons: FeedbackReason[];
  note?: string;
  createdAt: number;
  updatedAt: number;
}

const SCHEMA = 'pack:v1:feedback';
const feedbackKey = (packId: string) => `${SCHEMA}:${packId}`;

export async function getFeedback(packId: string): Promise<PackFeedback | undefined> {
  return get<PackFeedback>(feedbackKey(packId));
}

/**
 * Merge-save: callers pass only the field(s) they want to change. The
 * previous state of all other fields is preserved. createdAt is set
 * once on the first save; updatedAt advances on every write.
 */
export async function saveFeedback(
  packId: string,
  patch: Partial<Pick<PackFeedback, 'vote' | 'reasons' | 'note'>>,
): Promise<PackFeedback> {
  const existing = await getFeedback(packId);
  const now = Date.now();
  const merged: PackFeedback = {
    packId,
    vote: patch.vote !== undefined ? patch.vote : existing?.vote ?? null,
    reasons: patch.reasons !== undefined ? patch.reasons : existing?.reasons ?? [],
    note: patch.note !== undefined ? patch.note : existing?.note,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await set(feedbackKey(packId), merged);
  return merged;
}
