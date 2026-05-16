/**
 * Native Spaced Repetition System for Pack vocabulary.
 *
 * The retention engine. Without this, VozClara is a smart YouTube
 * summarizer; with it, VozClara is a daily ritual. Users come back
 * because there are cards waiting, not because they remember to.
 *
 * Algorithm: SuperMemo 2 with the standard "again / hard / good /
 * easy" four-rating mapping. Each card carries an ease factor E
 * (default 2.5, floor 1.3) and an interval in days. The next due
 * date is today + interval.
 *
 * Storage: one IndexedDB row per brainId holding all cards. Solo PWA
 * with no concurrent writers, so the trade-off favours read speed
 * (one fetch lists every card across the user's library) over
 * write-shard atomicity.
 *
 *   srs:v1:<brainId> →  {
 *     cards: { [cardId]: ReviewCard },
 *     streak: { current, longest, lastReviewedYmd },
 *   }
 *
 * Card IDs are deterministic: `${packId}::${word}::${translation}`,
 * so re-generating a pack with the same vocabulary preserves review
 * progress.
 */

import { get, set } from 'idb-keyval';
import { activeView, getBrainId, listPacks, type KnowledgePack, type VocabularyItem } from './pack';

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewCard {
  /** Stable hash of packId + word + translation. */
  id: string;
  packId: string;
  packTitle: string;
  word: string;
  translation: string;
  context: string;
  partOfSpeech?: string;
  /** Pack's source language (the word's language). */
  sourceLang: string;
  /** User's chosen pack language (the translation's language). */
  outputLang: string;

  /** SuperMemo 2 ease factor, ≥ 1.3. */
  ease: number;
  /** Days until next review when last graded ≥ Good. */
  interval: number;
  /** Successful review count (graded Good or Easy in a row). */
  reps: number;
  /** Times the user pressed "Again". */
  lapses: number;
  /** Next due timestamp (ms epoch). */
  due: number;
  /** When the card was last reviewed (ms epoch); null for new. */
  lastReviewedAt: number | null;
  /** When the card entered the library (ms epoch). */
  createdAt: number;
}

export interface StreakState {
  current: number;
  longest: number;
  /** ISO yyyy-mm-dd of the last day with at least one review. */
  lastReviewedYmd: string | null;
}

interface SrsStore {
  cards: Record<string, ReviewCard>;
  streak: StreakState;
}

const SCHEMA = 'srs:v1';
const storeKey = (brainId: string) => `${SCHEMA}:${brainId}`;

const EMPTY_STREAK: StreakState = { current: 0, longest: 0, lastReviewedYmd: null };

/** Daily cap on freshly introduced cards. Anki's default. */
export const NEW_CARDS_PER_DAY_DEFAULT = 10;

/* ─── Persistence ─────────────────────────────────────────────────── */

async function loadStore(brainId: string): Promise<SrsStore> {
  const raw = await get<SrsStore>(storeKey(brainId));
  if (!raw || typeof raw !== 'object') {
    return { cards: {}, streak: { ...EMPTY_STREAK } };
  }
  return {
    cards: raw.cards ?? {},
    streak: { ...EMPTY_STREAK, ...(raw.streak ?? {}) },
  };
}

async function saveStore(brainId: string, store: SrsStore): Promise<void> {
  await set(storeKey(brainId), store);
}

/* ─── Card ID & creation ──────────────────────────────────────────── */

/**
 * Cheap deterministic hash so the same vocab item from the same pack
 * always maps to the same card. FNV-1a × 2 gives 64 bits, plenty of
 * collision-resistance for a personal library.
 */
function makeCardId(packId: string, word: string, translation: string): string {
  const seed = `${packId}::${word}::${translation}`;
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca77);
  }
  return ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).padStart(16, '0');
}

function newCardFromVocab(
  pack: KnowledgePack,
  v: VocabularyItem,
  now: number,
): ReviewCard {
  const word = (v.word ?? '').trim();
  const translation = (v.translation ?? '').trim();
  return {
    id: makeCardId(pack.id, word, translation),
    packId: pack.id,
    packTitle: pack.title,
    word,
    translation,
    context: (v.context ?? '').trim(),
    partOfSpeech: v.partOfSpeech?.trim() || undefined,
    sourceLang: pack.sourceLang,
    outputLang: pack.outputLang,
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: now, // new cards are immediately "due"
    lastReviewedAt: null,
    createdAt: now,
  };
}

/* ─── Sync library → SRS store ────────────────────────────────────── */

/**
 * Walk the user's library and ensure every vocab item has a card.
 * Cheap idempotent operation — only adds, never touches existing
 * progress. Returns the count of newly added cards.
 */
export async function syncCardsFromLibrary(brainId?: string): Promise<number> {
  const id = brainId ?? getBrainId();
  if (id === 'server') return 0;
  const [store, packs] = await Promise.all([loadStore(id), listPacks(id)]);
  const now = Date.now();
  let added = 0;
  for (const pack of packs) {
    const view = activeView(pack);
    for (const v of view.vocabulary) {
      const word = (v.word ?? '').trim();
      const translation = (v.translation ?? '').trim();
      if (!word || !translation) continue;
      const cardId = makeCardId(pack.id, word, translation);
      if (!store.cards[cardId]) {
        store.cards[cardId] = newCardFromVocab(pack, v, now);
        added += 1;
      }
    }
  }
  if (added > 0) await saveStore(id, store);
  return added;
}

/* ─── Due-cards query ─────────────────────────────────────────────── */

export interface DueSummary {
  /** Cards that have been reviewed before and are due today. */
  due: number;
  /** Cards that have never been reviewed. */
  fresh: number;
  /** Future-due cards (informational). */
  upcoming: number;
}

export async function dueSummary(brainId?: string): Promise<DueSummary> {
  const id = brainId ?? getBrainId();
  if (id === 'server') return { due: 0, fresh: 0, upcoming: 0 };
  const store = await loadStore(id);
  return summarize(store.cards);
}

function summarize(cards: Record<string, ReviewCard>): DueSummary {
  const now = Date.now();
  let due = 0;
  let fresh = 0;
  let upcoming = 0;
  for (const c of Object.values(cards)) {
    if (c.reps === 0 && c.lastReviewedAt === null) {
      fresh += 1;
      continue;
    }
    if (c.due <= now) due += 1;
    else upcoming += 1;
  }
  return { due, fresh, upcoming };
}

/* ─── Building a review session ───────────────────────────────────── */

export interface ReviewQueue {
  /** Cards to review in order. Sorted: due-first, then fresh. */
  cards: ReviewCard[];
  summary: DueSummary;
  /** Streak state at session start (for end-of-session display). */
  streak: StreakState;
}

/**
 * Build a queue for an immediate review session. Caps the number of
 * fresh (new) cards introduced to `newCardsLimit` so the user can't
 * accidentally load 200 untrained cards in one sitting.
 */
export async function buildReviewQueue(
  brainId?: string,
  newCardsLimit: number = NEW_CARDS_PER_DAY_DEFAULT,
): Promise<ReviewQueue> {
  const id = brainId ?? getBrainId();
  if (id === 'server') {
    return { cards: [], summary: { due: 0, fresh: 0, upcoming: 0 }, streak: { ...EMPTY_STREAK } };
  }
  const store = await loadStore(id);
  const now = Date.now();

  const dueCards: ReviewCard[] = [];
  const freshCards: ReviewCard[] = [];
  for (const c of Object.values(store.cards)) {
    if (c.reps === 0 && c.lastReviewedAt === null) freshCards.push(c);
    else if (c.due <= now) dueCards.push(c);
  }

  // Due cards first (oldest-due first), then up to N fresh cards in
  // insertion order so the user meets new vocabulary in pack order.
  dueCards.sort((a, b) => a.due - b.due);
  freshCards.sort((a, b) => a.createdAt - b.createdAt);

  const cards = [...dueCards, ...freshCards.slice(0, newCardsLimit)];
  return { cards, summary: summarize(store.cards), streak: store.streak };
}

/* ─── SM-2 grading ────────────────────────────────────────────────── */

/**
 * Apply a rating to a card and persist the result. Updates the
 * streak on the first rating of the day. Returns the new state so
 * the UI can show "next: 5 days" feedback.
 */
export async function rateCard(
  cardId: string,
  rating: Rating,
  brainId?: string,
): Promise<{ card: ReviewCard; streak: StreakState }> {
  const id = brainId ?? getBrainId();
  const store = await loadStore(id);
  const existing = store.cards[cardId];
  if (!existing) throw new Error(`card_not_found: ${cardId}`);

  const now = Date.now();
  const updated = applySm2(existing, rating, now);
  store.cards[cardId] = updated;
  store.streak = advanceStreak(store.streak, ymd(now));

  await saveStore(id, store);
  return { card: updated, streak: store.streak };
}

/**
 * SuperMemo 2 transition. Maps the four user ratings to numeric
 * grades and updates ease + interval. Pure function — no I/O.
 */
export function applySm2(card: ReviewCard, rating: Rating, now: number): ReviewCard {
  const next: ReviewCard = { ...card, lastReviewedAt: now };

  if (rating === 'again') {
    // Lapse: reset interval, drop ease, leave reps as a lapse counter.
    next.lapses += 1;
    next.reps = 0;
    next.interval = 1;
    next.ease = Math.max(1.3, card.ease - 0.2);
  } else {
    next.reps += 1;
    if (rating === 'hard') {
      // Slight delay vs forgetting, keep ease close.
      next.interval = card.reps === 0 ? 1 : Math.max(1, Math.round(card.interval * 1.2));
      next.ease = Math.max(1.3, card.ease - 0.15);
    } else if (rating === 'good') {
      if (card.reps === 0) next.interval = 1;
      else if (card.reps === 1) next.interval = 6;
      else next.interval = Math.max(1, Math.round(card.interval * card.ease));
      // Ease unchanged for "good" — the baseline.
    } else /* easy */ {
      if (card.reps === 0) next.interval = 4;
      else if (card.reps === 1) next.interval = 10;
      else next.interval = Math.max(1, Math.round(card.interval * card.ease * 1.3));
      next.ease = card.ease + 0.15;
    }
  }

  next.due = now + next.interval * 24 * 60 * 60 * 1000;
  return next;
}

/* ─── Streak ──────────────────────────────────────────────────────── */

/** Local-date yyyy-mm-dd for streak comparison. */
function ymd(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function advanceStreak(prev: StreakState, today: string): StreakState {
  if (prev.lastReviewedYmd === today) return prev;
  // Compute yesterday's ymd to detect break vs continuation.
  const todayMs = new Date(`${today}T00:00:00`).getTime();
  const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;
  const yesterday = ymd(yesterdayMs);
  const next: StreakState =
    prev.lastReviewedYmd === yesterday
      ? { ...prev, current: prev.current + 1, lastReviewedYmd: today }
      : { ...prev, current: 1, lastReviewedYmd: today };
  next.longest = Math.max(next.longest, next.current);
  return next;
}

export async function getStreak(brainId?: string): Promise<StreakState> {
  const id = brainId ?? getBrainId();
  if (id === 'server') return { ...EMPTY_STREAK };
  const store = await loadStore(id);
  return store.streak;
}

/**
 * Earliest due-time across all cards in the store. Returns Date.now()
 * when there are fresh cards waiting (so push fires immediately on
 * the user's next reminder hour). Returns Infinity when the library
 * is empty — caller can interpret that as "nothing to push about".
 */
export async function getNextDueAt(brainId?: string): Promise<number> {
  const id = brainId ?? getBrainId();
  if (id === 'server') return Infinity;
  const store = await loadStore(id);
  let earliest = Infinity;
  for (const c of Object.values(store.cards)) {
    if (c.reps === 0 && c.lastReviewedAt === null) {
      return Date.now();
    }
    if (c.due < earliest) earliest = c.due;
  }
  return earliest;
}
