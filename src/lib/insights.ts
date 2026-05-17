/**
 * Insights client — calls /api/insights with mode + lang + transcript,
 * gets back the full mode-aware Knowledge Pack content.
 */

import type {
  KeyIdea,
  VocabularyItem,
  KeyQuote,
  SocialAngle,
  QuizQuestion,
  Chapter,
  Mode,
  Genre,
} from './pack';

export type { Genre, Mode } from './pack';

export interface InsightsResult {
  genre: Genre;
  mode: Mode;
  summary: { short: string; long: string };
  insights: KeyIdea[];
  actionPlan: string[];
  vocabulary: VocabularyItem[];
  quiz: QuizQuestion[];
  socialAngles: SocialAngle[];
  chapters: Chapter[];
  keyQuotes: KeyQuote[];
  tags: string[];
}

import { API_BASE } from './apiBase';

export class InsightsError extends Error {
  constructor(public code: 'ai_failed' | 'transcript_too_short' | 'unsupported_lang' | 'network', message: string) {
    super(message);
    this.name = 'InsightsError';
  }
}

export interface FetchInsightsArgs {
  videoId: string;
  transcript: string;
  sourceLang: string;
  targetLang: string;
  mode: Mode;
}

export async function fetchInsights({
  videoId,
  transcript,
  sourceLang,
  targetLang,
  mode,
}: FetchInsightsArgs): Promise<InsightsResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, transcript, sourceLang, targetLang, mode }),
    });
  } catch (err) {
    throw new InsightsError('network', `network error: ${String(err)}`);
  }

  if (!res.ok) {
    let body: { error?: string } = {};
    try { body = await res.json(); } catch { /* ignore */ }
    if (body.error === 'transcript_too_short') throw new InsightsError('transcript_too_short', 'transcript too short');
    if (body.error === 'unsupported_target_lang') throw new InsightsError('unsupported_lang', 'unsupported language');
    throw new InsightsError('ai_failed', body.error ?? `HTTP ${res.status}`);
  }

  const raw = (await res.json()) as Record<string, unknown>;
  return normalise(raw);
}

/** Build the input transcript joined as one paragraph for the LLM. */
export function joinForLLM(segments: Array<{ text: string; translated?: string }>): string {
  return segments
    .map((s) => s.translated ?? s.text)
    .filter((t) => t && !/^\s*[*♪♫][\s\S]*[*♪♫]\s*$/.test(t) && !/^\s*\[.+\]\s*$/.test(t))
    .join(' ');
}

function normalise(raw: Record<string, unknown>): InsightsResult {
  const genre = (typeof raw.genre === 'string' ? raw.genre : 'general') as Genre;
  const mode = (typeof raw.mode === 'string' ? raw.mode : 'business') as Mode;

  let summary = { short: '', long: '' };
  if (raw.summary && typeof raw.summary === 'object') {
    const s = raw.summary as Record<string, unknown>;
    summary = {
      short: typeof s.short === 'string' ? s.short : '',
      long: typeof s.long === 'string' ? s.long : '',
    };
  } else if (typeof raw.summary === 'string') {
    summary = { short: raw.summary.slice(0, 160), long: raw.summary };
  }

  return {
    genre,
    mode,
    summary,
    insights: normaliseKeyIdeas(raw.insights),
    actionPlan: stringArray(raw.actionPlan),
    vocabulary: normaliseVocab(raw.vocabulary),
    quiz: normaliseQuiz(raw.quiz),
    socialAngles: normaliseSocialAngles(raw.socialAngles),
    chapters: normaliseChapters(raw.chapters),
    keyQuotes: normaliseKeyQuotes(raw.keyQuotes),
    tags: normaliseTags(raw.tags),
  };
}

/**
 * Mirror of the worker-side tag cleaner. Strips noise, dedupes, caps
 * at 6 so cards stay tidy. Lowercase + trim only — the worker should
 * already do most of this; the client repeats it defensively in case
 * a cached pack or third-party API returns differently-shaped data.
 */
function normaliseTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const stop = new Set(['video', 'idea', 'topic', 'content', 'pack', 'youtube']);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of v) {
    if (typeof raw !== 'string') continue;
    const t = raw.trim().toLowerCase().slice(0, 32);
    if (!t || t.length < 2 || stop.has(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= 6) break;
  }
  return out;
}

function stringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function normaliseKeyIdeas(v: unknown): KeyIdea[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): KeyIdea | null => {
      if (typeof item === 'string') {
        return { title: item.slice(0, 80), body: item };
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const title = typeof o.title === 'string' ? o.title.trim() : '';
        const body = typeof o.body === 'string' ? o.body.trim() : '';
        if (!title && !body) return null;
        return {
          title: title || body.slice(0, 60),
          body: body || title,
          timestampSec: typeof o.timestampSec === 'number' ? o.timestampSec : undefined,
        };
      }
      return null;
    })
    .filter((x): x is KeyIdea => x !== null);
}

function normaliseVocab(v: unknown): VocabularyItem[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const o = item as Record<string, unknown>;
    const word = typeof o.word === 'string' ? o.word.trim() : '';
    const translation = typeof o.translation === 'string' ? o.translation.trim() : '';
    if (!word || !translation) return [];
    return [{
      word,
      translation,
      context: typeof o.context === 'string' ? o.context : '',
      partOfSpeech: typeof o.partOfSpeech === 'string' ? o.partOfSpeech : undefined,
    }];
  });
}

function normaliseQuiz(v: unknown): QuizQuestion[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const o = item as Record<string, unknown>;
    const question = typeof o.question === 'string' ? o.question.trim() : '';
    const answer = typeof o.answer === 'string' ? o.answer.trim() : '';
    if (!question || !answer) return [];
    return [{
      question,
      answer,
      explanation: typeof o.explanation === 'string' ? o.explanation : undefined,
      timestampSec: typeof o.timestampSec === 'number' ? o.timestampSec : undefined,
    }];
  });
}

function normaliseSocialAngles(v: unknown): SocialAngle[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const o = item as Record<string, unknown>;
    const hook = typeof o.hook === 'string' ? o.hook.trim() : '';
    const caption = typeof o.caption === 'string' ? o.caption.trim() : '';
    if (!hook && !caption) return [];
    return [{ hook: hook || caption.slice(0, 80), caption: caption || hook }];
  });
}

function normaliseChapters(v: unknown): Chapter[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const o = item as Record<string, unknown>;
    const title = typeof o.title === 'string' ? o.title.trim() : '';
    if (!title) return [];
    return [{
      startSec: typeof o.startSec === 'number' ? o.startSec : 0,
      title,
      summary: typeof o.summary === 'string' ? o.summary : '',
    }];
  });
}

function normaliseKeyQuotes(v: unknown): KeyQuote[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const o = item as Record<string, unknown>;
    const text = typeof o.text === 'string' ? o.text.trim() : '';
    if (!text) return [];
    return [{
      text,
      original: typeof o.original === 'string' ? o.original : undefined,
      speaker: typeof o.speaker === 'string' ? o.speaker : undefined,
      timestampSec: typeof o.timestampSec === 'number' ? o.timestampSec : 0,
    }];
  });
}
