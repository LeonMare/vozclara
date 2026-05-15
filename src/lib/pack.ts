/**
 * Knowledge Pack — the core domain object.
 *
 * v2 (multi-locale): a single pack now carries translations for multiple
 * output languages. The user can switch between them inline in the Pack
 * view, and on-demand generation merges new translations into the same
 * pack record rather than creating a new pack.
 *
 * Field layout
 *   • `translations: Record<Language, PackTranslation>` — the actual
 *     per-language content (summary, keyIdeas, chapters, …)
 *   • `outputLanguages: Language[]` — convenience list of available
 *     translations, kept in sync with `Object.keys(translations)`.
 *     Persisted so library filters don't have to inspect the nested
 *     map.
 *   • `outputLang: Language` — currently active view. Mutates when the
 *     user picks a different language in the Pack header.
 *
 * Migration
 *   Existing packs stored with the v1 flat shape (summary/keyIdeas/…
 *   at the top level) are transformed on read by migrateStoredPack().
 *   No write-time migration is forced — the next save() naturally
 *   persists the new shape.
 *
 * Mode-specific tabs
 *   Learn:    vocabulary, quiz, chapters (educational pacing)
 *   Business: actionPlan, keyQuotes (decision-maker focus)
 *   Creator:  socialAngles, captionIdeas (repurposing)
 *
 * All packs always carry: summary (short + long), keyIdeas, transcript.
 */

import { get, set, del, keys } from 'idb-keyval';
import { nanoid } from './nanoid';

export type Mode = 'learn' | 'business' | 'creator';
export type Language = 'en' | 'es' | 'de' | 'pt' | 'fr';
export type PackStatus = 'generating' | 'ready' | 'failed';
export type Genre =
  | 'news' | 'business' | 'coaching' | 'education'
  | 'interview' | 'creator' | 'general';

export interface VideoSource {
  type: 'youtube';
  url: string;
  videoId: string;
  durationSec?: number;
  thumbnailUrl?: string;
  channel?: string;
}

export interface Chapter {
  startSec: number;
  title: string;
  summary: string;
}

export interface KeyIdea {
  title: string;
  body: string;
  timestampSec?: number;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  context: string;
  partOfSpeech?: string;
}

export interface KeyQuote {
  text: string;
  original?: string;
  timestampSec: number;
  speaker?: string;
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  timestampSec?: number;
}

export interface SocialAngle {
  hook: string;
  caption: string;
  platform?: 'twitter' | 'linkedin' | 'instagram' | 'tiktok';
}

export interface Segment {
  start: number;
  dur: number;
  text: string;
  translated?: string;
}

/**
 * Per-language content. Everything that gets translated lives here;
 * everything that is metadata (mode, genre, dates, source) stays on
 * the parent pack and is shared across translations.
 */
export interface PackTranslation {
  summary: {
    short: string;
    long: string;
  };
  keyIdeas: KeyIdea[];
  chapters: Chapter[];
  actionPlan: string[];
  vocabulary: VocabularyItem[];
  keyQuotes: KeyQuote[];
  socialAngles: SocialAngle[];
  quiz: QuizQuestion[];
}

export interface KnowledgePack {
  id: string;                       // nanoid(12), used in URLs
  brainId: string;                  // anonymous owner identifier
  source: VideoSource;

  /** Title from the source video — kept in source language. */
  title: string;

  /** Detected language of the source captions. */
  sourceLang: Language;

  /** Currently active output language for this Pack view. */
  outputLang: Language;

  /** All output languages currently materialised in `translations`. */
  outputLanguages: Language[];

  /** Per-language content. Keys are members of `outputLanguages`. */
  translations: Partial<Record<Language, PackTranslation>>;

  mode: Mode;
  genre: Genre;
  status: PackStatus;

  tags: string[];
  category: string;
  isPublic: boolean;                // future: shareable URL toggle

  createdAt: number;
  updatedAt: number;

  /** Transcript stored separately under its own key to keep listings light. */
  transcriptKey?: string;
}

/**
 * Read-time accessor for the active translation. Falls back to the
 * first available translation if the active language is somehow not
 * materialised (shouldn't happen, but lets the UI degrade gracefully).
 */
export function activeView(pack: KnowledgePack): PackTranslation {
  return (
    pack.translations[pack.outputLang] ??
    Object.values(pack.translations)[0] ??
    EMPTY_TRANSLATION
  );
}

const EMPTY_TRANSLATION: PackTranslation = {
  summary: { short: '', long: '' },
  keyIdeas: [],
  chapters: [],
  actionPlan: [],
  vocabulary: [],
  keyQuotes: [],
  socialAngles: [],
  quiz: [],
};

/* ─── Brain ID — anonymous owner identifier ─────────────────────────────── */

const BRAIN_ID_KEY = 'vozclara:brainId';

export function getBrainId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(BRAIN_ID_KEY);
  if (!id) {
    id = nanoid(12);
    localStorage.setItem(BRAIN_ID_KEY, id);
  }
  return id;
}

/* ─── IndexedDB store (schema v1 of the Pack model) ─────────────────────── */

const SCHEMA = 'pack:v1';

const packKey = (id: string) => `${SCHEMA}:${id}`;
const transcriptKey = (id: string) => `${SCHEMA}:transcript:${id}`;
const indexKey = (brainId: string) => `${SCHEMA}:index:${brainId}`;

interface PackIndex {
  ids: string[]; // newest first
}

export async function getPack(id: string): Promise<KnowledgePack | undefined> {
  const raw = await get<unknown>(packKey(id));
  if (!raw || typeof raw !== 'object') return undefined;
  return migrateStoredPack(raw as Record<string, unknown>) ?? undefined;
}

export async function getTranscript(transcriptKeyValue: string): Promise<{ segments: Segment[] } | undefined> {
  return get(transcriptKeyValue);
}

export async function savePack(pack: KnowledgePack): Promise<void> {
  await set(packKey(pack.id), { ...pack, updatedAt: Date.now() });
  await touchIndex(pack.brainId, pack.id);
}

export async function saveTranscript(packId: string, segments: Segment[]): Promise<string> {
  const k = transcriptKey(packId);
  await set(k, { segments });
  return k;
}

export async function deletePack(id: string): Promise<void> {
  const pack = await getPack(id);
  await del(packKey(id));
  if (pack?.transcriptKey) await del(pack.transcriptKey);
  if (pack) await removeFromIndex(pack.brainId, id);
}

async function touchIndex(brainId: string, packId: string): Promise<void> {
  const idx = (await get<PackIndex>(indexKey(brainId))) ?? { ids: [] };
  const filtered = idx.ids.filter((id) => id !== packId);
  filtered.unshift(packId);
  await set(indexKey(brainId), { ids: filtered });
}

async function removeFromIndex(brainId: string, packId: string): Promise<void> {
  const idx = (await get<PackIndex>(indexKey(brainId))) ?? { ids: [] };
  await set(indexKey(brainId), { ids: idx.ids.filter((id) => id !== packId) });
}

export async function listPacks(brainId: string): Promise<KnowledgePack[]> {
  const idx = (await get<PackIndex>(indexKey(brainId))) ?? { ids: [] };
  const raws = await Promise.all(idx.ids.map((id) => get<unknown>(packKey(id))));
  return raws
    .map((r) => (r && typeof r === 'object' ? migrateStoredPack(r as Record<string, unknown>) : null))
    .filter((p): p is KnowledgePack => !!p);
}

/* ─── Migration ─────────────────────────────────────────────────────────── */

/**
 * Read-time migration from the v1 flat shape to the v2 multi-locale shape.
 * Returns null if the data is genuinely unparseable. v2-shaped packs pass
 * through unchanged (idempotent — re-migrating costs nothing).
 */
function migrateStoredPack(raw: Record<string, unknown>): KnowledgePack | null {
  if (!raw.id || !raw.brainId) return null;

  // Already v2 if it has a translations map.
  if (
    raw.translations &&
    typeof raw.translations === 'object' &&
    !Array.isArray(raw.translations)
  ) {
    const pack = raw as unknown as KnowledgePack;
    // Defensive: re-derive outputLanguages from translations keys so
    // the list stays in sync even if older code wrote stale state.
    return {
      ...pack,
      outputLanguages: Object.keys(pack.translations).filter((k) =>
        ['en', 'es', 'de', 'pt', 'fr'].includes(k),
      ) as Language[],
    };
  }

  // v1 → v2: lift summary/keyIdeas/etc onto translations[outputLang]
  const outputLang = (raw.outputLang as Language) ?? 'es';
  const translation: PackTranslation = {
    summary: (raw.summary as PackTranslation['summary']) ?? { short: '', long: '' },
    keyIdeas: (raw.keyIdeas as KeyIdea[]) ?? [],
    chapters: (raw.chapters as Chapter[]) ?? [],
    actionPlan: (raw.actionPlan as string[]) ?? [],
    vocabulary: (raw.vocabulary as VocabularyItem[]) ?? [],
    keyQuotes: (raw.keyQuotes as KeyQuote[]) ?? [],
    socialAngles: (raw.socialAngles as SocialAngle[]) ?? [],
    quiz: (raw.quiz as QuizQuestion[]) ?? [],
  };

  return {
    id: raw.id as string,
    brainId: raw.brainId as string,
    source: raw.source as VideoSource,
    title: (raw.title as string) ?? '',
    sourceLang: (raw.sourceLang as Language) ?? 'en',
    outputLang,
    outputLanguages: [outputLang],
    translations: { [outputLang]: translation },
    mode: (raw.mode as Mode) ?? 'business',
    genre: (raw.genre as Genre) ?? 'general',
    status: (raw.status as PackStatus) ?? 'ready',
    tags: (raw.tags as string[]) ?? [],
    category: (raw.category as string) ?? 'general',
    isPublic: (raw.isPublic as boolean) ?? false,
    createdAt: (raw.createdAt as number) ?? Date.now(),
    updatedAt: (raw.updatedAt as number) ?? Date.now(),
    transcriptKey: raw.transcriptKey as string | undefined,
  };
}

/* ─── Library statistics ────────────────────────────────────────────────── */

export interface LibraryStats {
  totalPacks: number;
  totalIdeas: number;
  totalLangs: number;
  thisWeek: number;
}

export async function libraryStats(brainId: string): Promise<LibraryStats> {
  const packs = await listPacks(brainId);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const langs = new Set<Language>();
  let ideas = 0;
  let thisWeek = 0;
  for (const p of packs) {
    for (const lang of p.outputLanguages) langs.add(lang);
    ideas += activeView(p).keyIdeas.length;
    if (p.createdAt >= weekAgo) thisWeek += 1;
  }
  return {
    totalPacks: packs.length,
    totalIdeas: ideas,
    totalLangs: langs.size,
    thisWeek,
  };
}

/* ─── Library search & filter ───────────────────────────────────────────── */

export interface LibraryFilters {
  query?: string;
  mode?: Mode | 'all';
  language?: Language | 'all';
  sinceDays?: number;
}

export function filterPacks(packs: KnowledgePack[], f: LibraryFilters): KnowledgePack[] {
  const q = f.query?.trim().toLowerCase() ?? '';
  const cutoff = f.sinceDays != null ? Date.now() - f.sinceDays * 24 * 60 * 60 * 1000 : 0;
  return packs.filter((p) => {
    if (f.mode && f.mode !== 'all' && p.mode !== f.mode) return false;
    if (f.language && f.language !== 'all' && !p.outputLanguages.includes(f.language)) return false;
    if (cutoff > 0 && p.createdAt < cutoff) return false;
    if (q) {
      const view = activeView(p);
      const haystack = [
        p.title,
        view.summary.short,
        view.summary.long,
        p.tags.join(' '),
        view.keyIdeas.map((k) => k.title + ' ' + k.body).join(' '),
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/* ─── Discover all stored keys (for migrations) ─────────────────────────── */

export async function listAllPackKeys(): Promise<string[]> {
  const all = await keys();
  return all.filter((k): k is string => typeof k === 'string' && k.startsWith(`${SCHEMA}:`) && !k.includes(':transcript:') && !k.includes(':index:'));
}
