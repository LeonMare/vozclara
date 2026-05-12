/**
 * Knowledge Pack — the core domain object.
 *
 * Each video becomes a Knowledge Pack: a structured, searchable,
 * multilingual record of what was said and what matters. Packs live in
 * IndexedDB for the MVP and sync to Cloudflare D1 when accounts arrive.
 *
 * Mode-specific fields:
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

export interface KnowledgePack {
  id: string;                       // nanoid(12), used in URLs
  brainId: string;                  // anonymous owner identifier
  source: VideoSource;
  title: string;
  sourceLang: Language;
  outputLang: Language;
  mode: Mode;
  genre: Genre;
  status: PackStatus;

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

  tags: string[];
  category: string;
  isPublic: boolean;                // future: shareable URL toggle

  createdAt: number;
  updatedAt: number;

  /** Transcript stored separately under its own key to keep listings light. */
  transcriptKey?: string;
}

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
  return get<KnowledgePack>(packKey(id));
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
  const packs = await Promise.all(idx.ids.map((id) => get<KnowledgePack>(packKey(id))));
  return packs.filter((p): p is KnowledgePack => !!p);
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
    langs.add(p.outputLang);
    ideas += p.keyIdeas.length;
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
    if (f.language && f.language !== 'all' && p.outputLang !== f.language) return false;
    if (cutoff > 0 && p.createdAt < cutoff) return false;
    if (q) {
      const haystack = [
        p.title,
        p.summary.short,
        p.summary.long,
        p.tags.join(' '),
        p.keyIdeas.map((k) => k.title + ' ' + k.body).join(' '),
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
