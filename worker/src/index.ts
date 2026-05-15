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
  AI: {
    run: (
      model: string,
      input: Record<string, unknown>,
    ) => Promise<{ response?: string | unknown } & Record<string, unknown>>;
  };
}

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
  ]
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

  return { summary, insights, actionPlan, vocabulary, quiz, socialAngles, chapters, keyQuotes };
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
  };
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
