/**
 * VozClara worker. Two endpoints:
 *
 *   GET /api/transcript?v=ID&lang=de&to=es
 *     1. Supadata fetches the transcript (residential-IP egress around
 *        YouTube's datacenter-IP block). Cost: 1 credit per video.
 *     2. Lingva translates each segment via free public instances.
 *
 *   POST /api/insights
 *     Body: { videoId, transcript: string, sourceLang, targetLang, genre? }
 *     Returns: { genre, summary, insights[], actionPlan[] }
 *     Uses Cloudflare Workers AI (Llama 3.x) with a genre-aware system
 *     prompt selected from the detected content type.
 *
 * Edge cache 24 h on the transcript endpoint. Insights are cached
 * client-side in IndexedDB since they're user-specific.
 */

interface Env {
  SUPADATA_API_KEY?: string;
  /**
   * Optional OpenAI key for premium text-to-speech via /api/tts.
   * Set via `wrangler secret put OPENAI_API_KEY` to enable. When
   * absent, /api/tts responds 503 with code "tts_disabled" and the
   * client gracefully falls back to browser Web Speech API.
   */
  OPENAI_API_KEY?: string;
  AI: {
    run: (
      model: string,
      input: Record<string, unknown>,
    ) => Promise<{ response?: string | unknown } & Record<string, unknown>>;
  };
  /**
   * Optional Vectorize index for semantic search in /api/ask. Provision
   * with `wrangler vectorize create vozclara-knowledge --dimensions=768
   * --metric=cosine` and bind via the [[vectorize]] block in
   * wrangler.toml. When absent, /api/ask falls back to prompt-stuffing
   * the entire library (capped at ~40 packs).
   */
  VECTORIZE?: {
    upsert: (vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, string | number | boolean>;
    }>) => Promise<{ count: number; ids: string[] }>;
    query: (vector: number[], options: {
      topK?: number;
      filter?: Record<string, unknown>;
      returnValues?: boolean;
      returnMetadata?: boolean;
    }) => Promise<{
      matches: Array<{
        id: string;
        score: number;
        values?: number[];
        metadata?: Record<string, unknown>;
      }>;
    }>;
    deleteByIds: (ids: string[]) => Promise<{ count: number; ids: string[] }>;
  };
}

const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const EMBEDDING_DIM = 768;

interface SupadataSegment {
  text: string;
  offset: number;
  duration: number;
  lang: string;
}

interface SupadataResponse {
  content: SupadataSegment[];
  lang: string;
  availableLangs?: string[];
}

interface NormalisedSegment {
  start: number;
  dur: number;
  text: string;
  translated?: string;
}

interface PlayerResponse {
  captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } };
  playabilityStatus?: { status?: string; reason?: string };
  videoDetails?: { title?: string };
}

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: 'asr' | string;
  name?: { simpleText?: string };
}

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const LANG_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;
const SUPPORTED_LANGS = ['de', 'en', 'es', 'pt'] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Public Lingva instances. Free Google-Translate proxies. Rotate.
const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://translate.plausibility.cloud',
  'https://lingva.garudalinux.org',
  'https://lingva.lunar.icu',
];

// Llama 3.3 70B Fast — substantially better reasoning and prose than 3.1 8B,
// still on the free Workers AI tier (uses more neurons per call, but quality
// jump is dramatic). The 8B was readable; the 70B is editorial.
const LLM_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

// Genre detection uses the smaller, faster model — we don't need 70B
// brainpower to pick one of seven categories.
const GENRE_MODEL = '@cf/meta/llama-3.1-8b-instruct';

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(req.url);

    if (url.pathname === '/' || url.pathname === '/health') {
      return json({
        ok: true,
        service: 'vozclara',
        provider: env.SUPADATA_API_KEY ? 'supadata' : 'innertube-direct',
        translator: 'lingva',
        llm: LLM_MODEL,
      });
    }

    if (url.pathname === '/api/transcript' && req.method === 'GET') {
      return handleTranscript(url, env);
    }

    if (url.pathname === '/api/insights' && req.method === 'POST') {
      return handleInsights(req, env);
    }

    if (url.pathname === '/api/ask' && req.method === 'POST') {
      return handleAsk(req, env);
    }

    if (url.pathname === '/api/tts/health' && req.method === 'GET') {
      return json({
        available: !!env.OPENAI_API_KEY,
        provider: env.OPENAI_API_KEY ? 'openai' : null,
        model: env.OPENAI_API_KEY ? 'tts-1' : null,
      });
    }

    if (url.pathname === '/api/tts' && req.method === 'POST') {
      return handleTTS(req, env);
    }

    if (url.pathname === '/api/index/health' && req.method === 'GET') {
      return json({
        available: !!env.VECTORIZE,
        provider: env.VECTORIZE ? 'cloudflare-vectorize' : null,
        model: env.VECTORIZE ? EMBEDDING_MODEL : null,
        dimensions: env.VECTORIZE ? EMBEDDING_DIM : null,
      });
    }

    if (url.pathname === '/api/index' && req.method === 'POST') {
      return handleIndex(req, env);
    }

    if (url.pathname === '/api/index' && req.method === 'DELETE') {
      return handleIndexDelete(req, env);
    }

    if (url.pathname === '/api/og' && req.method === 'GET') {
      return handleOG(url);
    }

    return json({ error: 'not_found' }, 404);
  },
};

/* ─── /api/transcript ───────────────────────────────────────────────────── */

async function handleTranscript(url: URL, env: Env): Promise<Response> {
  const videoId = url.searchParams.get('v') ?? '';
  // `lang` is now optional. When absent, we ask Supadata / Innertube for
  // the video's native captions and trust the response to tell us which
  // language those captions are in. When present, we honour it as a
  // preferred source language hint (legacy behaviour). This fixes the
  // long-standing bug where the frontend hardcoded lang=de and any
  // non-German source returned no_captions on the first try.
  const langParam = url.searchParams.get('lang');
  const lang: string | null = langParam && langParam.length > 0 ? langParam : null;
  const to = url.searchParams.get('to');

  if (!ID_PATTERN.test(videoId)) return json({ error: 'invalid_id' }, 400);
  if ((lang && !LANG_PATTERN.test(lang)) || (to && !LANG_PATTERN.test(to))) {
    return json({ error: 'invalid_lang' }, 400);
  }

  try {
    const result = env.SUPADATA_API_KEY
      ? await fetchViaSupadata(videoId, lang, to ?? null, env.SUPADATA_API_KEY)
      : await fetchViaInnertube(videoId, lang, to ?? null);

    return json(result, 200, {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    });
  } catch (err) {
    return transcriptError(err);
  }
}

function transcriptError(err: unknown): Response {
  const message = err instanceof Error ? err.message : String(err);
  const code =
    message === 'no_captions' || message === 'caption_empty' ? 'no_captions' :
    message === 'rate_limited' ? 'rate_limited' :
    message === 'quota_exceeded' ? 'quota_exceeded' :
    'fetch_failed';
  const status =
    code === 'no_captions' ? 404 :
    code === 'rate_limited' ? 429 :
    code === 'quota_exceeded' ? 402 :
    502;
  return json({ error: code, detail: message }, status);
}

/* ─── /api/insights ─────────────────────────────────────────────────────── */

interface InsightsRequest {
  videoId: string;
  transcript: string;
  sourceLang: string;
  targetLang: string;
  genre?: Genre;
  mode?: Mode;
}

type Genre =
  | 'news'           // Tagesschau, news broadcasts
  | 'business'       // business analysis, corporate news
  | 'coaching'       // personal development, life coaching
  | 'education'      // tutorials, lectures, explainers
  | 'interview'      // expert interviews, podcasts
  | 'creator'        // vlogs, lifestyle, opinion
  | 'general';       // unclassified

async function handleInsights(req: Request, env: Env): Promise<Response> {
  let body: InsightsRequest;
  try {
    body = (await req.json()) as InsightsRequest;
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const { transcript, sourceLang, targetLang } = body;
  if (!transcript || transcript.length < 50) {
    return json({ error: 'transcript_too_short' }, 400);
  }
  if (!SUPPORTED_LANGS.includes(targetLang as SupportedLang)) {
    return json({ error: 'unsupported_target_lang' }, 400);
  }
  const mode: Mode = body.mode === 'learn' || body.mode === 'business' || body.mode === 'creator' ? body.mode : 'business';

  try {
    const genre = body.genre ?? (await detectGenre(transcript, env));
    const insights = await generateInsights(transcript, sourceLang, targetLang, genre, mode, env);
    return json({ genre, mode, ...insights }, 200, {
      'Cache-Control': 'public, max-age=86400',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: 'ai_failed', detail: message.slice(0, 200) }, 502);
  }
}

async function detectGenre(transcript: string, env: Env): Promise<Genre> {
  const excerpt = transcript.slice(0, 1500);
  const prompt = `Classify the following video transcript excerpt into exactly one of these categories. Respond with only the single word category, lowercase, nothing else.

Categories: news, business, coaching, education, interview, creator, general

Definitions:
- news: news broadcasts, current affairs, journalism
- business: corporate analysis, finance, economics, market commentary
- coaching: personal development, motivation, life advice, self-improvement
- education: tutorials, lectures, instructional content, explainers
- interview: conversations with experts, podcasts with guests, Q&A formats
- creator: vlogs, opinion content, lifestyle, entertainment commentary
- general: anything that doesn't fit cleanly

Transcript:
${excerpt}

Category:`;

  const out = await env.AI.run(GENRE_MODEL, {
    messages: [
      { role: 'system', content: 'You are a precise classifier. Output exactly one word.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 12,
    temperature: 0,
  });
  const responseStr = typeof out.response === 'string' ? out.response : '';
  const raw = responseStr.trim().toLowerCase().replace(/[^a-z]/g, '');
  if ((['news', 'business', 'coaching', 'education', 'interview', 'creator', 'general'] as const).includes(raw as Genre)) {
    return raw as Genre;
  }
  return 'general';
}

interface InsightOutput {
  title: string;
  body: string;
}

interface VocabularyOutput {
  word: string;
  translation: string;
  context: string;
  partOfSpeech?: string;
}

interface QuizQuestionOutput {
  question: string;
  answer: string;
  explanation?: string;
}

interface SocialAngleOutput {
  hook: string;
  caption: string;
}

interface ChapterOutput {
  startSec: number;
  title: string;
  summary: string;
}

interface KeyQuoteOutput {
  text: string;
  original?: string;
  speaker?: string;
  timestampSec: number;
}

interface InsightsOutput {
  summary: { short: string; long: string };
  insights: InsightOutput[];
  actionPlan: string[];
  vocabulary: VocabularyOutput[];
  quiz: QuizQuestionOutput[];
  socialAngles: SocialAngleOutput[];
  chapters: ChapterOutput[];
  keyQuotes: KeyQuoteOutput[];
  tags: string[];
}

type Mode = 'learn' | 'business' | 'creator';

const LANG_NAME: Record<string, string> = {
  de: 'German',
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
};

function modePromptVoice(mode: Mode, targetLang: string): string {
  const lang = LANG_NAME[targetLang] ?? 'English';
  const base = `Write in clear, well-formed ${lang}. No exclamation marks, no superlatives, no emoji.`;

  switch (mode) {
    case 'learn':
      return `You are a patient, precise teacher. Your reader is using this video to learn. Output clear explanations that scaffold from concrete to abstract. Identify what concepts depend on which, and what the learner should be able to do after watching. ${base}`;
    case 'business':
      return `You write executive briefings. Your reader is a decision-maker scanning for strategic implications, market signals, and second-order consequences. Be specific, not generic. ${base}`;
    case 'creator':
      return `You repurpose long-form content for short-form distribution. Your reader is a content creator looking for hooks, angles and captions that work on social platforms. Be concrete and quotable. ${base}`;
  }
}

function structuredInstruction(targetLang: string, mode: Mode): string {
  const lang = LANG_NAME[targetLang] ?? 'English';

  const baseSchema = `{
  "summary": {
    "short": "1-2 sentences in ${lang}. The single-line answer to 'what is this video about'. Punchy, not bland.",
    "long": "5-8 sentences in ${lang}, single paragraph. The reader should be able to brief a colleague after reading this and feel they actually know the video."
  },
  "insights": [
    { "title": "Short editorial headline in ${lang}, 4-10 words, no period", "body": "2-4 sentences in ${lang} that elaborate with real substance: state the claim, give the reasoning or evidence the video offered, surface implications the viewer might miss." },
    ...
  ],
  "actionPlan": ["concrete action 1 in ${lang}, verb-first, specific, ideally with a timeframe", ...],
  "vocabulary": [
    { "word": "important_term_in_source_language", "translation": "translation in ${lang}", "context": "the sentence from the video that uses the term", "partOfSpeech": "noun/verb/adjective/etc" },
    ...
  ],
  "quiz": [
    { "question": "question in ${lang}", "answer": "the answer in ${lang}", "explanation": "2-3 sentences explaining why and connecting to other concepts in the video" },
    ...
  ],
  "socialAngles": [
    { "hook": "scroll-stopping first line in ${lang}, ≤90 chars, with bite", "caption": "the rest of a social post in ${lang}, 3-5 sentences, ends with a question or claim that invites reply" },
    ...
  ],
  "chapters": [
    { "startSec": 0, "title": "chapter title in ${lang}, 3-8 words", "summary": "1-2 sentences in ${lang}" },
    ...
  ],
  "keyQuotes": [
    { "text": "memorable line translated to ${lang}", "original": "original line in source language", "speaker": "speaker name if known, otherwise null", "timestampSec": 0 },
    ...
  ],
  "tags": ["3-5 single-word or two-word tags in ${lang}, lowercase. Use the topic / domain / proper nouns / industry — not generic words like 'video' or 'idea'.", ...]
}`;

  const modeRules = {
    learn: `LEARN-MODE — the reader is studying with this video:
- "insights": 5-8 items. Focus on concepts, frameworks, mental models, and the order of dependencies between ideas.
- "vocabulary": 10-18 items. Pick terms useful beyond this video — domain vocabulary, idioms, technical or culturally-loaded terms. Skip everyday words.
- "quiz": 6-10 questions. Mix comprehension, application, and connection-to-other-concepts.
- "chapters": 5-10 items. Each titled descriptively (not just "Section 1").
- "actionPlan": 0-4 items (only if content actually proposes practice or experiments).
- "keyQuotes": 0-3 items (only memorable lines that crystallise concepts).
- "socialAngles": [] (not relevant in Learn mode).`,
    business: `BUSINESS-MODE — the reader is a decision-maker scanning for signal:
- "insights": 5-8 items. Strategic implications, market signals, second-order consequences, structural shifts. Each must add value the bare transcript doesn't.
- "actionPlan": 4-6 concrete actions a business reader could take this week. Verb-first, specific.
- "keyQuotes": 4-6 items. Statements of position, fact, commitment, or contradiction. Include speaker.
- "chapters": 4-8 items.
- "vocabulary": 0-6 items (only domain-specific terms a non-specialist might miss).
- "quiz": [] (not relevant in Business mode).
- "socialAngles": [] (not relevant in Business mode).`,
    creator: `CREATOR-MODE — the reader is a content creator repurposing this video:
- "insights": 4-6 items. Focus on hooks, angles, contrarian-but-defendable points, structural moves the speaker uses.
- "socialAngles": 6-10 items. Each "hook" is a scroll-stopper (question, claim, or surprising stat). Each "caption" is a 3-5 sentence post body that ends with an invitation to reply.
- "keyQuotes": 6-12 items. Maximise quotable moments — anything punchy, self-contained, screenshot-worthy.
- "chapters": 3-6 items.
- "vocabulary": [] (not relevant in Creator mode).
- "actionPlan": 2-4 items focused on content strategy (which platform, which format, which audience).
- "quiz": [] (not relevant in Creator mode).`,
  }[mode];

  return `Output ONLY a single JSON object matching this schema. No preamble, no markdown fences, no prose outside the JSON.

${baseSchema}

${modeRules}

Quality bar — non-negotiable:
- Write like an editor at a serious publication. Specific, declarative, no hedging.
- Every sentence must add information the previous one didn't.
- No platitudes ("communication is important", "data is valuable"). Capture WHAT THIS SPECIFIC VIDEO said.
- For news content: surface what changed, what's at stake, who is affected, what to watch next.
- For arguments: surface the strongest version of the speaker's case AND any contradictions they themselves raise.

Universal rules:
- All field VALUES in ${lang}. Field NAMES stay in English.
- "vocabulary[].word" stays in the source language (it's the term being learned).
- "keyQuotes[].original" stays in the source language; "text" is the translation.
- Strict JSON. No trailing commas. No code fences. Arrays that don't fit the mode return [].`;
}

async function generateInsights(
  transcript: string,
  sourceLang: string,
  targetLang: string,
  genre: Genre,
  mode: Mode,
  env: Env,
): Promise<InsightsOutput> {
  const bounded = transcript.length > 12000
    ? transcript.slice(0, 6000) + '\n\n[…truncated…]\n\n' + transcript.slice(-3000)
    : transcript;

  const systemPrompt = modePromptVoice(mode, targetLang) + '\n\n' + structuredInstruction(targetLang, mode);
  const userPrompt = `Source language: ${LANG_NAME[sourceLang] ?? sourceLang}. Detected genre: ${genre}. Mode: ${mode}.

Transcript:
${bounded}`;

  const out = await env.AI.run(LLM_MODEL, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    // 70B + expanded schema = larger output. 5000 tokens covers Learn
    // mode (heaviest: 18 vocab + 10 quiz + 8 insights + ...). Costs more
    // neurons but delivers editorial-grade volume.
    max_tokens: 5000,
    temperature: 0.35,
  });

  // Defensive coercion: 70B model sometimes returns a non-string response
  // depending on output_schema. Stringify whatever it gives us.
  let raw: string;
  if (typeof out === 'string') raw = out;
  else if (out && typeof out.response === 'string') raw = out.response;
  else if (out && out.response != null) raw = JSON.stringify(out.response);
  else raw = JSON.stringify(out);

  return parseInsightsJson(raw.trim());
}

function parseInsightsJson(raw: string): InsightsOutput {
  let text = raw;
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) text = fenced[1];

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) text = text.slice(first, last + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return emptyInsightsOutput(raw.slice(0, 500));
  }

  const p = parsed as Record<string, unknown>;

  // Summary: tolerate both the new {short, long} shape and the legacy
  // plain-string shape.
  let summary: InsightsOutput['summary'];
  if (p.summary && typeof p.summary === 'object' && !Array.isArray(p.summary)) {
    const s = p.summary as Record<string, unknown>;
    summary = {
      short: typeof s.short === 'string' ? s.short : '',
      long: typeof s.long === 'string' ? s.long : (typeof s.short === 'string' ? s.short : ''),
    };
  } else if (typeof p.summary === 'string') {
    const text = p.summary;
    const firstSentence = text.match(/^.{20,200}?[.!?](?=\s|$)/)?.[0] ?? text.slice(0, 160);
    summary = { short: firstSentence, long: text };
  } else {
    summary = { short: '', long: '' };
  }

  const insights = normaliseInsightArray(p.insights);
  const actionPlan = stringArray(p.actionPlan);
  const vocabulary = normaliseVocabArray(p.vocabulary);
  const quiz = normaliseQuizArray(p.quiz);
  const socialAngles = normaliseSocialAngles(p.socialAngles);
  const chapters = normaliseChapterArray(p.chapters);
  const keyQuotes = normaliseKeyQuoteArray(p.keyQuotes);
  const tags = normaliseTags(p.tags);

  return { summary, insights, actionPlan, vocabulary, quiz, socialAngles, chapters, keyQuotes, tags };
}

function emptyInsightsOutput(fallbackSummary = ''): InsightsOutput {
  return {
    summary: { short: '', long: fallbackSummary },
    insights: [],
    actionPlan: [],
    vocabulary: [],
    quiz: [],
    socialAngles: [],
    chapters: [],
    keyQuotes: [],
    tags: [],
  };
}

/**
 * Clean LLM-generated tag list: lowercase, trim, drop empties, dedupe,
 * cap at 6 to keep card-display tidy. Filters out generic noise words
 * the model sometimes emits despite the prompt instructions.
 */
function normaliseTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const stop = new Set(['video', 'idea', 'topic', 'content', 'pack', 'youtube']);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of v) {
    if (typeof raw !== 'string') continue;
    const tag = raw.trim().toLowerCase().slice(0, 32);
    if (!tag || tag.length < 2 || stop.has(tag)) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= 6) break;
  }
  return out;
}

function stringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function normaliseInsightArray(v: unknown): InsightOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): InsightOutput | null => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        const splitAt = trimmed.search(/[.:;—]/);
        if (splitAt > 0 && splitAt < 80) {
          return { title: trimmed.slice(0, splitAt).trim(), body: trimmed.slice(splitAt + 1).trim() || trimmed };
        }
        return { title: trimmed.slice(0, 80), body: trimmed };
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const title = typeof obj.title === 'string' ? obj.title.trim() : '';
        const body = typeof obj.body === 'string' ? obj.body.trim() : '';
        if (!title && !body) return null;
        return { title: title || body.slice(0, 60), body: body || title };
      }
      return null;
    })
    .filter((x): x is InsightOutput => x !== null);
}

function normaliseVocabArray(v: unknown): VocabularyOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): VocabularyOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const word = typeof o.word === 'string' ? o.word.trim() : '';
      const translation = typeof o.translation === 'string' ? o.translation.trim() : '';
      if (!word || !translation) return null;
      return {
        word,
        translation,
        context: typeof o.context === 'string' ? o.context : '',
        partOfSpeech: typeof o.partOfSpeech === 'string' ? o.partOfSpeech : undefined,
      };
    })
    .filter((x): x is VocabularyOutput => x !== null);
}

function normaliseQuizArray(v: unknown): QuizQuestionOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): QuizQuestionOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const question = typeof o.question === 'string' ? o.question.trim() : '';
      const answer = typeof o.answer === 'string' ? o.answer.trim() : '';
      if (!question || !answer) return null;
      return {
        question,
        answer,
        explanation: typeof o.explanation === 'string' ? o.explanation : undefined,
      };
    })
    .filter((x): x is QuizQuestionOutput => x !== null);
}

function normaliseSocialAngles(v: unknown): SocialAngleOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): SocialAngleOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const hook = typeof o.hook === 'string' ? o.hook.trim() : '';
      const caption = typeof o.caption === 'string' ? o.caption.trim() : '';
      if (!hook && !caption) return null;
      return { hook: hook || caption.slice(0, 80), caption: caption || hook };
    })
    .filter((x): x is SocialAngleOutput => x !== null);
}

function normaliseChapterArray(v: unknown): ChapterOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): ChapterOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const title = typeof o.title === 'string' ? o.title.trim() : '';
      if (!title) return null;
      return {
        startSec: typeof o.startSec === 'number' ? o.startSec : 0,
        title,
        summary: typeof o.summary === 'string' ? o.summary : '',
      };
    })
    .filter((x): x is ChapterOutput => x !== null);
}

function normaliseKeyQuoteArray(v: unknown): KeyQuoteOutput[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item): KeyQuoteOutput | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const text = typeof o.text === 'string' ? o.text.trim() : '';
      if (!text) return null;
      return {
        text,
        original: typeof o.original === 'string' ? o.original : undefined,
        speaker: typeof o.speaker === 'string' ? o.speaker : undefined,
        timestampSec: typeof o.timestampSec === 'number' ? o.timestampSec : 0,
      };
    })
    .filter((x): x is KeyQuoteOutput => x !== null);
}

/* ─── Supadata ─────────────────────────────────────────────────────────── */

async function fetchViaSupadata(
  videoId: string,
  lang: string | null,
  to: string | null,
  apiKey: string,
) {
  const orig = await supadataCall('/v1/youtube/transcript', videoId, lang, apiKey);
  if (!orig.content || orig.content.length === 0) throw new Error('no_captions');

  let segments: NormalisedSegment[] = orig.content
    .map((s) => ({
      start: s.offset / 1000,
      dur: s.duration / 1000,
      text: cleanText(s.text),
    }))
    .filter((s) => s.text.length > 0);

  if (to && to !== orig.lang) {
    segments = await attachTranslations(segments, orig.lang, to);
  } else if (to === orig.lang) {
    // Source already matches target — just mirror text into translated.
    segments = segments.map((s) => ({ ...s, translated: s.text }));
  }

  return {
    videoId,
    lang: orig.lang,
    translatedTo: to ?? undefined,
    kind: 'manual',
    segments,
  };
}

async function supadataCall(
  path: string,
  videoId: string,
  lang: string | null,
  apiKey: string,
): Promise<SupadataResponse> {
  // Only append &lang= when a preferred source language was given;
  // otherwise let Supadata return the video's native captions.
  const langPart = lang ? `&lang=${lang}` : '';
  const url = `https://api.supadata.ai${path}?videoId=${videoId}${langPart}&text=false`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (res.status === 429) throw new Error('rate_limited');
  if (res.status === 402) throw new Error('quota_exceeded');
  if (res.status === 401 || res.status === 403) throw new Error(`auth_failed_${res.status}`);
  if (res.status === 404) throw new Error('no_captions');
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`supadata_http_${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as SupadataResponse;
}

/* ─── Translation via Lingva ────────────────────────────────────────────── */

function isStageDirection(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return (
    /^[*♪♫][\s\S]*[*♪♫]$/.test(t) ||
    /^\(.+\)$/.test(t) ||
    /^\[.+\]$/.test(t)
  );
}

async function lingvaTranslate(text: string, from: string, to: string): Promise<string | null> {
  const order = [...LINGVA_INSTANCES].sort(() => Math.random() - 0.5);
  for (const base of order) {
    try {
      const url = `${base}/api/v1/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = (await res.json()) as { translation?: string };
      if (data.translation && data.translation.trim().length > 0) return data.translation;
    } catch {
      // Try next instance.
    }
  }
  return null;
}

async function attachTranslations(
  segments: NormalisedSegment[],
  from: string,
  to: string,
): Promise<NormalisedSegment[]> {
  const CONCURRENCY = 4;
  const out = segments.map((s) => ({ ...s }));
  let next = 0;

  async function worker() {
    while (next < out.length) {
      const i = next++;
      const original = out[i].text;
      if (isStageDirection(original)) {
        out[i].translated = original;
        continue;
      }
      const translated = await lingvaTranslate(original, from, to);
      if (translated) out[i].translated = translated;
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return out;
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/* ─── Innertube fallback (local dev only) ───────────────────────────────── */

interface ClientProfile {
  name: string;
  key: string;
  userAgent: string;
  context: Record<string, unknown>;
}

const CLIENTS: ClientProfile[] = [
  {
    name: 'IOS',
    key: 'AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc',
    userAgent: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)',
    context: {
      client: {
        clientName: 'IOS',
        clientVersion: '20.10.4',
        deviceMake: 'Apple',
        deviceModel: 'iPhone16,2',
        osName: 'iPhone',
        osVersion: '18.3.2.22D82',
        hl: 'de',
        gl: 'DE',
      },
    },
  },
  {
    name: 'ANDROID',
    key: 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w',
    userAgent: 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip',
    context: {
      client: {
        clientName: 'ANDROID',
        clientVersion: '20.10.38',
        androidSdkVersion: 30,
        hl: 'de',
        gl: 'DE',
      },
    },
  },
];

async function fetchViaInnertube(videoId: string, lang: string | null, to: string | null) {
  let lastReason = 'no_clients_tried';
  let videoTitle: string | undefined;
  let tracks: CaptionTrack[] | null = null;

  for (const client of CLIENTS) {
    try {
      const player = await innertubePlayer(videoId, client);
      videoTitle ??= player.videoDetails?.title;
      const candidate = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
      if (candidate.length > 0) {
        tracks = candidate;
        break;
      }
      lastReason = player.playabilityStatus?.reason ?? player.playabilityStatus?.status ?? 'no_captions';
    } catch (err) {
      lastReason = err instanceof Error ? err.message : String(err);
    }
  }

  if (!tracks || tracks.length === 0) {
    if (lastReason === 'no_captions' || lastReason === 'OK') throw new Error('no_captions');
    throw new Error(`innertube_failed: ${lastReason}`);
  }

  // When a preferred lang was given we sort by score(); without one we just
  // prefer manual captions over auto-generated and take the first track —
  // YouTube tends to list the native track first.
  const sorted = lang
    ? [...tracks].sort((a, b) => score(b, lang) - score(a, lang))
    : [...tracks].sort((a, b) => (b.kind === 'asr' ? 0 : 10) - (a.kind === 'asr' ? 0 : 10));
  const track = sorted[0];

  const captionRes = await fetch(track.baseUrl + '&fmt=srv3', {
    headers: { 'User-Agent': CLIENTS[0].userAgent },
  });
  if (!captionRes.ok) throw new Error(`caption_http_${captionRes.status}`);
  const xml = await captionRes.text();
  if (!xml.trim()) throw new Error('caption_empty');

  let segments = parseTimedText(xml);
  if (segments.length === 0) throw new Error('caption_parse_empty');

  // Translation source language is whatever Innertube actually gave us,
  // not the (possibly null) caller hint.
  if (to) segments = await attachTranslations(segments, track.languageCode, to);

  return {
    videoId,
    lang: track.languageCode,
    translatedTo: to ?? undefined,
    kind: track.kind ?? 'manual',
    title: videoTitle,
    segments,
  };
}

async function innertubePlayer(videoId: string, client: ClientProfile): Promise<PlayerResponse> {
  const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${client.key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': client.userAgent,
      'Accept-Language': 'de-DE,de;q=0.9',
    },
    body: JSON.stringify({ context: client.context, videoId }),
  });
  if (!res.ok) throw new Error(`player_http_${res.status}`);
  return (await res.json()) as PlayerResponse;
}

function score(t: CaptionTrack, want: string): number {
  let s = 0;
  if (t.languageCode === want) s += 100;
  if (t.languageCode.startsWith(want)) s += 50;
  if (t.kind !== 'asr') s += 10;
  return s;
}

function parseTimedText(xml: string): NormalisedSegment[] {
  const out: NormalisedSegment[] = [];
  const pRegex = /<p\s+([^>]*?)>([\s\S]*?)<\/p>/g;
  let match: RegExpExecArray | null;
  while ((match = pRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const inner = match[2];
    const tMatch = /\bt="(\d+)"/.exec(attrs);
    if (!tMatch) continue;
    const dMatch = /\bd="(\d+)"/.exec(attrs);
    const start = Number(tMatch[1]) / 1000;
    const dur = dMatch ? Number(dMatch[1]) / 1000 : 0;
    const text = decodeEntities(inner.replace(/<[^>]+>/g, ''))
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) out.push({ start, dur, text });
  }
  return out;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)));
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

/* ─── /api/ask ──────────────────────────────────────────────────────────── *
 *
 * Cross-pack Q&A for the user's local library. The client condenses each
 * pack down to title + summary + key ideas and sends them with the user's
 * question. The LLM answers strictly from that material, citing packs
 * inline with [pack:<id>] markers. The handler extracts the citations,
 * de-duplicates them, and returns them alongside the raw answer so the
 * UI can render pack-chip footnotes.
 *
 * No caching — every (question, library) combination is unique.
 */

interface AskCondensedPack {
  id: string;
  title: string;
  summary: { short: string; long: string };
  keyIdeas: Array<{ title: string; body: string }>;
}

interface AskBody {
  question: string;
  packs: AskCondensedPack[];
  locale?: string;
  /** Anonymous owner id — used to scope vector retrieval to this user. */
  brainId?: string;
}

const ASK_LANG_NAME: Record<string, string> = {
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
  en: 'English',
  fr: 'French',
};

async function handleAsk(req: Request, env: Env): Promise<Response> {
  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const question = (body.question ?? '').toString().trim();
  const packs = Array.isArray(body.packs) ? body.packs : [];
  const locale = (body.locale ?? 'es').toString().slice(0, 2).toLowerCase();
  const brainId = typeof body.brainId === 'string' ? body.brainId : null;

  if (question.length < 3) return json({ error: 'question_too_short' }, 400);
  if (packs.length === 0) return json({ error: 'empty_library' }, 400);
  if (question.length > 500) return json({ error: 'question_too_long' }, 400);

  const langName = ASK_LANG_NAME[locale] ?? 'English';

  // Two retrieval paths:
  //   • Vector path (preferred): embed the question, query Vectorize for
  //     the top-K most relevant chunks across this brainId's indexed
  //     packs. Pass only those to the LLM. Scales to thousands of packs.
  //   • Stuff path (fallback): condense every pack in the request to
  //     title + summary + key ideas and pass the whole library. Caps at
  //     40 packs because the 8K context budget runs out beyond that.

  let library: string;
  let strategy: 'vector' | 'stuff';
  if (env.VECTORIZE && brainId) {
    try {
      library = await retrieveViaVectorize(question, brainId, env);
      strategy = 'vector';
    } catch {
      library = packs.slice(0, 40).map(renderPackForAsk).join('\n\n');
      strategy = 'stuff';
    }
  } else {
    library = packs.slice(0, 40).map(renderPackForAsk).join('\n\n');
    strategy = 'stuff';
  }

  const systemPrompt =
    `You are a research assistant helping a user search their personal Knowledge Pack library. ` +
    `Each pack is a video summary they have saved. ` +
    `Answer the user's question strictly from the library content below — do not invent facts. ` +
    `When you draw on a pack, cite it inline using the marker [pack:<id>] (use the exact id shown in the LIBRARY block). ` +
    `If the library does not contain enough information to answer, say so plainly. ` +
    `Respond in ${langName}. Keep the answer focused and editorial — two to four short paragraphs.`;

  const userPrompt = `LIBRARY:\n${library}\n\nQUESTION:\n${question}`;

  let out: Awaited<ReturnType<Env['AI']['run']>>;
  try {
    out = await env.AI.run(LLM_MODEL, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.3,
    });
  } catch (err) {
    return json({ error: 'ai_failed', detail: String(err) }, 502);
  }

  // Defensive coercion — Llama 3.3 70B occasionally returns the
  // response wrapped in an object instead of a string.
  let raw: string;
  if (typeof out === 'string') raw = out;
  else if (out && typeof out.response === 'string') raw = out.response;
  else if (out && out.response != null) raw = JSON.stringify(out.response);
  else raw = JSON.stringify(out);

  // Extract citation markers. Pack ids are nanoid(12) or 'sample*'.
  const citations: string[] = [];
  const seen = new Set<string>();
  const citationRegex = /\[pack:([A-Za-z0-9_-]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = citationRegex.exec(raw)) !== null) {
    const id = match[1];
    if (!seen.has(id) && packs.some((p) => p.id === id)) {
      seen.add(id);
      citations.push(id);
    }
  }

  return json({ answer: raw.trim(), citations, strategy }, 200);
}

function renderPackForAsk(p: AskCondensedPack): string {
  const title = (p.title ?? '').toString().slice(0, 200);
  const short = p.summary?.short?.toString().slice(0, 400) ?? '';
  const long = p.summary?.long?.toString().slice(0, 1200) ?? '';
  const ideas = (p.keyIdeas ?? [])
    .slice(0, 6)
    .map((k) => `- ${k.title}: ${k.body}`.slice(0, 350))
    .join('\n');
  return `[pack:${p.id}]\nTITLE: ${title}\nSUMMARY: ${short}\n${long ? `DETAIL: ${long}\n` : ''}KEY IDEAS:\n${ideas}`;
}

/* ─── Vector retrieval ────────────────────────────────────────────────── *
 *
 * Given a question, embed it via Workers AI and query the user's
 * vectorised pack library for the top-K most semantically relevant
 * chunks. Returns the same `[pack:<id>]` blocks the prompt-stuff path
 * produces, so the rest of the /api/ask pipeline (LLM prompt,
 * citation extraction) is identical.
 */
async function retrieveViaVectorize(
  question: string,
  brainId: string,
  env: Env,
): Promise<string> {
  if (!env.VECTORIZE) throw new Error('vectorize_unbound');
  const qVec = await embedText(question, env);
  const result = await env.VECTORIZE.query(qVec, {
    topK: 12,
    filter: { brainId },
    returnMetadata: true,
  });
  if (!result.matches.length) return '';

  // Group chunks by pack so the LLM sees coherent context per source.
  const byPack = new Map<string, Array<{ kind: string; text: string; title: string }>>();
  for (const m of result.matches) {
    const meta = (m.metadata ?? {}) as Record<string, string>;
    const packId = meta.packId ?? 'unknown';
    if (!byPack.has(packId)) byPack.set(packId, []);
    byPack.get(packId)!.push({
      kind: meta.kind ?? 'chunk',
      title: meta.packTitle ?? '',
      text: meta.text ?? '',
    });
  }

  const blocks: string[] = [];
  for (const [packId, chunks] of byPack.entries()) {
    const title = chunks[0]?.title ?? '';
    const body = chunks
      .map((c) => `- (${c.kind}) ${c.text}`)
      .join('\n');
    blocks.push(`[pack:${packId}]\nTITLE: ${title}\nRELEVANT:\n${body}`);
  }
  return blocks.join('\n\n');
}

async function embedText(text: string, env: Env): Promise<number[]> {
  const trimmed = text.slice(0, 2000);
  const out = await env.AI.run(EMBEDDING_MODEL, { text: [trimmed] });
  // Workers AI shape: { data: number[][], shape: [n, dim] }
  const data = (out as { data?: number[][] }).data;
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('embedding_unexpected_shape');
  }
  return data[0];
}

/* ─── /api/index ──────────────────────────────────────────────────────── *
 *
 * Index a pack's content into Vectorize for later semantic retrieval.
 * The client breaks a pack into chunks (summary, key ideas, action
 * plan items, quotes, social angles, etc.) and posts them here. Each
 * chunk is embedded via Workers AI and upserted into the vector
 * index, keyed by a deterministic id derived from packId + chunk
 * kind + index. Re-indexing a pack overwrites the old vectors.
 */

interface IndexChunk {
  kind: string;          // 'summary' | 'idea' | 'quote' | 'action' | …
  text: string;
  title?: string;
}

interface IndexBody {
  packId: string;
  brainId: string;
  packTitle: string;
  lang: string;
  mode: string;
  chunks: IndexChunk[];
}

async function handleIndex(req: Request, env: Env): Promise<Response> {
  if (!env.VECTORIZE) {
    return json(
      {
        error: 'index_disabled',
        detail: 'Vectorize is not bound. Provision with `wrangler vectorize create vozclara-knowledge --dimensions=768 --metric=cosine` and add the binding to wrangler.toml.',
      },
      503,
    );
  }

  let body: IndexBody;
  try {
    body = (await req.json()) as IndexBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const { packId, brainId, packTitle, lang, mode } = body;
  const chunks = Array.isArray(body.chunks) ? body.chunks : [];

  if (!packId || !brainId) return json({ error: 'missing_ids' }, 400);
  if (chunks.length === 0) return json({ error: 'empty_chunks' }, 400);
  if (chunks.length > 60) return json({ error: 'too_many_chunks' }, 400);

  try {
    // Embed in parallel — Workers AI handles a small batch well.
    const vectors = await Promise.all(
      chunks.map(async (c, i) => {
        const values = await embedText(c.text, env);
        return {
          id: `${packId}::${c.kind}::${i}`,
          values,
          metadata: {
            packId,
            brainId,
            packTitle: packTitle.slice(0, 200),
            lang,
            mode,
            kind: c.kind,
            title: (c.title ?? '').slice(0, 200),
            text: c.text.slice(0, 800),
          },
        };
      }),
    );
    await env.VECTORIZE.upsert(vectors);
    return json({ indexed: vectors.length, packId }, 200);
  } catch (err) {
    return json({ error: 'index_failed', detail: String(err) }, 502);
  }
}

async function handleIndexDelete(req: Request, env: Env): Promise<Response> {
  if (!env.VECTORIZE) {
    return json({ error: 'index_disabled' }, 503);
  }
  const url = new URL(req.url);
  const packId = url.searchParams.get('packId') ?? '';
  if (!packId) return json({ error: 'missing_packId' }, 400);

  try {
    // Delete by id-prefix isn't directly supported; we delete a known
    // range of suffix indices. 60 covers our maximum chunk count.
    const ids: string[] = [];
    const kinds = ['summary', 'summaryLong', 'idea', 'chapter', 'action', 'quote', 'angle', 'vocab', 'quiz'];
    for (const kind of kinds) {
      for (let i = 0; i < 60; i++) ids.push(`${packId}::${kind}::${i}`);
    }
    const res = await env.VECTORIZE.deleteByIds(ids);
    return json({ deleted: res.count, packId }, 200);
  } catch (err) {
    return json({ error: 'delete_failed', detail: String(err) }, 502);
  }
}

/* ─── /api/tts ──────────────────────────────────────────────────────────── *
 *
 * Server-side text-to-speech. Currently wired to OpenAI's `tts-1` model
 * because it's the cheapest multilingual option per character ($15/M)
 * with quality far above the browser Web Speech API. Returns raw audio
 * MP3 bytes with a long Cache-Control so repeated plays of the same
 * segment hit the Cloudflare edge cache for free.
 *
 * Voice selection: `alloy` as default — neutral, slightly warm, handles
 * ES / PT / DE / EN well without an accent shift. Client can override
 * via the `voice` field.
 *
 * No fallback to Cloudflare Workers AI: their melotts model is English-
 * only, which would silently break for our other three languages.
 * Better to return 503 and let the client use Web Speech API.
 */

interface TTSBody {
  text: string;
  lang?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 – 4.0
}

async function handleTTS(req: Request, env: Env): Promise<Response> {
  if (!env.OPENAI_API_KEY) {
    return json(
      {
        error: 'tts_disabled',
        detail: 'Server TTS is not configured. Set OPENAI_API_KEY via `wrangler secret put OPENAI_API_KEY` to enable.',
      },
      503,
    );
  }

  let body: TTSBody;
  try {
    body = (await req.json()) as TTSBody;
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const text = (body.text ?? '').toString().trim();
  if (!text) return json({ error: 'empty_text' }, 400);
  if (text.length > 4096) return json({ error: 'text_too_long' }, 400);

  const voice = body.voice && ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(body.voice)
    ? body.voice
    : 'alloy';
  const speed = body.speed && body.speed >= 0.25 && body.speed <= 4.0 ? body.speed : 1.0;

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        speed,
        input: text,
        response_format: 'mp3',
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return json(
        { error: 'tts_failed', status: res.status, detail: errText.slice(0, 400) },
        502,
      );
    }

    // Pipe the MP3 through with cache headers. Cloudflare's edge cache
    // doesn't cache POST responses by default, but we set the headers
    // anyway so a future GET-with-hash variant can short-circuit.
    const audio = await res.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audio.byteLength.toString(),
        'Cache-Control': 'public, max-age=2592000, immutable',
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    return json({ error: 'tts_fetch_failed', detail: String(err) }, 502);
  }
}

/* ─── /api/og ────────────────────────────────────────────────────────────
 *
 * Per-pack Open Graph image generator. Returns a brand-styled 1200×630
 * SVG image which Twitter / LinkedIn / Discord / Slack render directly
 * as the share-card preview when a /pack/<id> URL is posted.
 *
 * SVG over PNG: keeps the worker bundle tiny (no satori, no resvg-wasm)
 * at the cost of platform coverage — Meta-family crawlers (FB,
 * WhatsApp) silently fall back to the static /og-image.png that's
 * still listed as the default og:image in index.html. Acceptable
 * trade-off for v1; we can swap in satori later if WhatsApp/FB
 * previews become a real channel.
 *
 * Query params (all optional, sensible defaults):
 *   title  — main headline (1-200 chars)
 *   mode   — learn | business | creator
 *   lang   — output language code (es / en / de / pt)
 *   genre  — content genre label (politics, education, …)
 *   author — small attribution line (e.g. channel name)
 *
 * Cached aggressively (immutable + 1 year) — the URL fully encodes
 * the image contents, so two different packs get two different
 * cache keys, and a re-share of the same pack hits the edge.
 */

interface OGParams {
  title: string;
  mode: string;
  lang: string;
  genre: string;
  author?: string;
}

function handleOG(url: URL): Response {
  const p = url.searchParams;
  const params: OGParams = {
    title: (p.get('title') ?? 'Knowledge Pack').slice(0, 200),
    mode: (p.get('mode') ?? 'business').slice(0, 20),
    lang: (p.get('lang') ?? 'es').slice(0, 5).toLowerCase(),
    genre: (p.get('genre') ?? 'general').slice(0, 30),
    author: p.get('author')?.slice(0, 60) ?? undefined,
  };

  const svg = renderOGSVG(params);
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...CORS_HEADERS,
    },
  });
}

function renderOGSVG({ title, mode, lang, genre, author }: OGParams): string {
  // XML-safe text escape — prevents the SVG from being broken by quotes
  // or angle brackets in the pack title.
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Wrap title to two lines manually — SVG <text> doesn't auto-wrap.
  // Aim for ~24 chars per line; cut at word boundaries.
  const wrapped = wrapTitle(title, 24, 3);

  const modeLabel = mode === 'learn' ? 'LEARN' : mode === 'creator' ? 'CREATOR' : 'BUSINESS';
  const langLabel = lang.toUpperCase();
  const genreLabel = genre.toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A1A3A"/>
      <stop offset="100%" stop-color="#091532"/>
    </linearGradient>
    <radialGradient id="aura" cx="20%" cy="25%" r="55%">
      <stop offset="0%" stop-color="#C9A24B" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#C9A24B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8D29A"/>
      <stop offset="50%" stop-color="#C9A24B"/>
      <stop offset="100%" stop-color="#8C6A2A"/>
    </linearGradient>
  </defs>

  <!-- Navy background with a soft gold aura top-left -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#aura)"/>

  <!-- Voz Clara lighthouse mark, top-left, scaled to fit -->
  <g transform="translate(80 75) scale(1.0)" fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="44" stroke-width="2.6"/>
    <circle cx="50" cy="50" r="40.7" stroke-width="2.0"/>
    <path d="M50 16V26" stroke-width="2.0"/>
    <path d="M33 25l10 6" stroke-width="1.8"/>
    <path d="M67 25l-10 6" stroke-width="1.8"/>
    <path d="M31 36l12-3" stroke-width="1.8"/>
    <path d="M69 36l-12-3" stroke-width="1.8"/>
    <path d="M46.5 30h7" stroke-width="1.8"/>
    <path d="M44.4 31.2l5.6-4.1 5.6 4.1" stroke-width="2.0"/>
    <path d="M45.6 31.4h8.8v5.7h-8.8z" stroke-width="1.7"/>
    <path d="M47.3 31.4v5.7M50 31.4v5.7M52.7 31.4v5.7" stroke-width="1.3"/>
    <path d="M43.8 37.1h12.4" stroke-width="2.0"/>
    <path d="M44.7 39h10.6" stroke-width="1.4"/>
    <path d="M45.3 39.1 42.3 73.7M54.7 39.1 57.7 73.7" stroke-width="1.9"/>
    <path d="M46.8 48h6.4" stroke-width="1.5"/>
    <rect x="48.6" y="50.2" width="2.8" height="5.5" rx="0.2" stroke-width="1.6"/>
    <path d="M41.2 73.8h17.6" stroke-width="2.0"/>
    <path d="M24.6 79.4C33.7 73.8 43 72.2 50 72.2s16.3 1.6 25.4 7.2" stroke-width="2.1"/>
  </g>

  <!-- "VOZ · CLARA" wordmark inline with the mark -->
  <text x="220" y="135" font-family="Georgia, 'Times New Roman', serif" font-size="40" letter-spacing="9" fill="#F7F3EC" font-weight="500">
    VOZ · CLARA
  </text>

  <!-- Mode + Lang + Genre pill row, top-right -->
  <g transform="translate(1120 130)" text-anchor="end" font-family="Inter, -apple-system, system-ui, sans-serif" font-size="18" letter-spacing="3">
    <text fill="#C9A24B" font-weight="600">${esc(modeLabel)}</text>
    <text y="32" fill="#F7F3ECB3">${esc(langLabel)} · ${esc(genreLabel)}</text>
  </g>

  <!-- Gold hairline divider -->
  <rect x="80" y="280" width="80" height="2" fill="url(#gold)"/>

  <!-- Title — two-or-three line wrap -->
  ${wrapped
    .map(
      (line, i) =>
        `<text x="80" y="${360 + i * 78}" font-family="Georgia, 'Times New Roman', serif" font-size="68" font-weight="500" fill="#F7F3EC">${esc(line)}</text>`,
    )
    .join('\n  ')}

  <!-- Bottom-row attribution + brand footer -->
  ${author ? `<text x="80" y="560" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#F7F3EC99" font-style="italic">${esc(author)}</text>` : ''}
  <text x="1120" y="560" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="20" fill="#F7F3EC99" letter-spacing="3">
    SAVE THE KNOWLEDGE
  </text>
  <text x="1120" y="588" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#C9A24B" letter-spacing="2">
    VOZCLARA.PAGES.DEV
  </text>
</svg>`;
}

function wrapTitle(title: string, maxChars: number, maxLines: number): string[] {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current ? current + ' ' : '') + word;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  // If we truncated, append an ellipsis to the last line.
  const consumed = lines.join(' ').split(/\s+/).length;
  if (consumed < words.length && lines.length > 0) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\W+$/, '') + '…';
  }
  return lines;
}
