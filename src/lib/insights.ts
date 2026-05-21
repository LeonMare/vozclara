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
  /** Single-sentence headline answer (≤22 words). Falls back to summary.short. */
  tldr?: string;
  /** CEFR level required to follow the source audio without subtitles. */
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
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

/* ─── Streaming variant ──────────────────────────────────────────────── */

/**
 * Streaming-side companion to `fetchInsights`. Calls the worker's
 * `/api/insights/stream` endpoint which returns an Anthropic-shape
 * SSE stream (workers-ai-stream.ts normalises the Llama branch into
 * the same envelope, so the wire format is uniform regardless of
 * which tier served the request).
 *
 * Yields events progressively so the GeneratorPage can render tokens
 * as they arrive (Manus / Granola pattern):
 *
 *   { kind: 'delta', delta, accumulated }   — fires per text_delta
 *   { kind: 'meta', provider, model, genre } — fires once at start
 *   { kind: 'done', result }                — fires after message_stop
 *                                              with the parsed
 *                                              InsightsResult; same
 *                                              shape fetchInsights
 *                                              returns
 *   { kind: 'error', code, message }         — on parse / network
 *                                              / upstream failure
 *
 * On any error, the generator yields a single 'error' event and
 * returns. Callers should `for await` and switch on `evt.kind`.
 */
export type StreamInsightsEvent =
  | { kind: 'meta'; provider?: string; model?: string; genre?: Genre }
  /** A token delta from the prose output (text_delta event). */
  | { kind: 'delta'; delta: string; accumulated: string }
  /** A token delta from the model's reasoning trace
   *  (thinking_delta event — only fires on the Pro Plus / Sonnet
   *  path when extended thinking is enabled server-side). Yielded
   *  separately from text-deltas so the UI can render it in a
   *  distinct region above the prose output (Manus pattern). */
  | { kind: 'thinking'; delta: string; accumulated: string }
  | { kind: 'done'; result: InsightsResult }
  | {
      kind: 'error';
      code: InsightsError['code'] | 'parse_failed';
      message: string;
    };

export async function* streamInsights(
  args: FetchInsightsArgs,
): AsyncGenerator<StreamInsightsEvent> {
  const { videoId, transcript, sourceLang, targetLang, mode } = args;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/insights/stream`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, transcript, sourceLang, targetLang, mode }),
    });
  } catch (err) {
    yield { kind: 'error', code: 'network', message: `network error: ${String(err)}` };
    return;
  }

  if (!res.ok) {
    let body: { error?: string; detail?: string } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      /* non-JSON error body — fall through to status-based handling */
    }
    if (body.error === 'transcript_too_short') {
      yield { kind: 'error', code: 'transcript_too_short', message: 'transcript too short' };
      return;
    }
    if (body.error === 'unsupported_target_lang') {
      yield { kind: 'error', code: 'unsupported_lang', message: 'unsupported language' };
      return;
    }
    yield {
      kind: 'error',
      code: 'ai_failed',
      message: body.detail ?? body.error ?? `HTTP ${res.status}`,
    };
    return;
  }

  if (!res.body) {
    yield { kind: 'error', code: 'ai_failed', message: 'empty_stream' };
    return;
  }

  // Surface provider / model / detected genre from response headers
  // before the first SSE event arrives. Lets the UI render
  // "Sonnet 4.5 · Coaching" attribution alongside the streaming text.
  const provider = res.headers.get('X-LLM-Provider') ?? undefined;
  const model = res.headers.get('X-LLM-Model') ?? undefined;
  const detectedGenre = (res.headers.get('X-Genre') as Genre | null) ?? undefined;
  yield { kind: 'meta', provider, model, genre: detectedGenre };

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let accumulated = '';
  let thinkingAccumulated = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by blank lines. Drain everything we
      // can per read.
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const rawEvent = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');

        const dataLine = rawEvent
          .split('\n')
          .find((l) => l.startsWith('data: '));
        if (!dataLine) continue;
        const json = dataLine.slice(6).trim();
        if (!json || json === '[DONE]') continue;

        try {
          const event = JSON.parse(json) as {
            type: string;
            delta?: { type: string; text?: string; thinking?: string };
          };
          if (event.type === 'content_block_delta' && event.delta) {
            if (
              event.delta.type === 'text_delta' &&
              typeof event.delta.text === 'string' &&
              event.delta.text.length > 0
            ) {
              accumulated += event.delta.text;
              yield { kind: 'delta', delta: event.delta.text, accumulated };
            } else if (
              event.delta.type === 'thinking_delta' &&
              typeof event.delta.thinking === 'string' &&
              event.delta.thinking.length > 0
            ) {
              // Sonnet 4.5 extended-thinking trace. Only arrives on
              // the Pro Plus path. Surfaced as a separate `thinking`
              // event so the UI can render it in its own region
              // (Manus pattern — see GenerationProgress.tsx).
              thinkingAccumulated += event.delta.thinking;
              yield {
                kind: 'thinking',
                delta: event.delta.thinking,
                accumulated: thinkingAccumulated,
              };
            }
          }
          // message_delta + message_stop carry the stop reason +
          // usage but we don't surface them yet — the v1 UI doesn't
          // need them. Add a 'usage' event variant if we ever want
          // to render token counts on the loading screen.
        } catch {
          // Malformed SSE frame — skip rather than abort. Anthropic
          // occasionally interleaves comment-style keepalives.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Stream complete. Parse the accumulated JSON.
  try {
    const parsed = parseStreamedInsights(accumulated.trim());
    yield { kind: 'done', result: normalise(parsed) };
  } catch (err) {
    yield {
      kind: 'error',
      code: 'parse_failed',
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Parser tolerant of fenced code blocks + leading / trailing prose,
 * mirroring the worker-side parseInsightsJson. Streaming models
 * occasionally hedge with a sentence before the JSON object; we
 * trim from the first `{` to the last `}` so the JSON.parse call
 * sees a clean payload.
 */
function parseStreamedInsights(raw: string): Record<string, unknown> {
  let text = raw;
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) text = fenced[1];
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) text = text.slice(first, last + 1);
  return JSON.parse(text) as Record<string, unknown>;
}

/* ─── End streaming variant ──────────────────────────────────────────── */

/** Build the input transcript joined as one paragraph for the LLM. */
export function joinForLLM(segments: Array<{ text: string; translated?: string }>): string {
  return segments
    .map((s) => s.translated ?? s.text)
    .filter((t) => t && !/^\s*[*♪♫][\s\S]*[*♪♫]\s*$/.test(t) && !/^\s*\[.+\]\s*$/.test(t))
    .join(' ');
}

function normalise(raw: Record<string, unknown>): InsightsResult {
  const genre = (typeof raw.genre === 'string' ? raw.genre : 'general') as Genre;
  // Worker may still echo "business" on cached responses from before
  // the §4 mode rename — coerce to the new key.
  const rawMode = typeof raw.mode === 'string' ? raw.mode : 'brief';
  const mode: Mode =
    rawMode === 'learn' || rawMode === 'brief' || rawMode === 'study' || rawMode === 'creator'
      ? rawMode
      : rawMode === 'business'
        ? 'brief'
        : 'brief';

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
    tldr: typeof raw.tldr === 'string' && raw.tldr.trim() ? raw.tldr.trim().slice(0, 280) : undefined,
    difficulty: normaliseDifficulty(raw.difficulty),
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

function normaliseDifficulty(v: unknown): InsightsResult['difficulty'] {
  if (typeof v !== 'string') return undefined;
  const upper = v.trim().toUpperCase();
  if (upper === 'A1' || upper === 'A2' || upper === 'B1' || upper === 'B2' || upper === 'C1' || upper === 'C2') {
    return upper;
  }
  return undefined;
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
