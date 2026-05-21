/**
 * Season Pack — multi-episode cross-synthesis (MASTER.md §6.3).
 *
 * The Pro Plus killer feature: drop a YouTube playlist (or any
 * array of video IDs that belong together — a podcast season, a
 * lecture series, a creator's last 20 uploads) and get back ONE
 * pack distilling themes, contradictions, concept evolution, and
 * which episodes are best to start with.
 *
 * Pipeline ("summarise-then-synthesise" per MASTER.md):
 *
 *   1. For each episode in parallel:
 *      • Fetch transcript via the provided EpisodeFetcher
 *      • Llama 3.3 70B summarises into 800-1200 words
 *      • Yields a structured EpisodeSummary
 *
 *   2. Cross-episode synthesis pass:
 *      • Concatenate all episode summaries
 *      • Claude Sonnet 4.5 reads the corpus + emits structured
 *        JSON (themes, contradictions, conceptEvolution,
 *        bestEpisodes)
 *
 * Cost arithmetic from MASTER.md §6.3:
 *   • Naive 800k-context call to Sonnet directly: ~$3.15 per pack
 *   • Summarise-then-synthesise: ~$0.75 per pack (88% savings)
 *
 * Pro Plus quota (CLAUDE.md §1.3): 2 Season Packs / month
 * included; overage at $0.75/pack.
 *
 * UI integration is out of scope for v1 — this module is exercised
 * via the admin smoke endpoint (`/api/admin/season-smoke`) so we
 * can validate the pipeline + the synthesis prompt + the JSON
 * output shape before wiring it into GeneratorPage. Durable Object
 * resilience for long streams + per-user quota tracking are
 * follow-ups.
 */

import { callLLM, type LlmRouterEnv } from './llm-router';

export type SeasonOutputLang = 'en' | 'es' | 'pt' | 'de';

/**
 * Caller-supplied transcript-fetcher. Keeps this module decoupled
 * from worker/src/index.ts's Supadata / Innertube implementation —
 * the route handler that calls generateSeasonPack wires the
 * existing fetchViaSupadata helper through this interface.
 */
export type EpisodeFetcher = (videoId: string) => Promise<{
  /** Joined transcript text — one paragraph per segment, no markup. */
  text: string;
  /** Total duration in seconds, if known from the transcript provider. */
  durationSec?: number;
  /** Episode title from the video source, if known. */
  title?: string;
  /** Detected source language of the captions. */
  sourceLang?: string;
}>;

export interface SeasonPackOpts {
  /** Ordered list of video IDs — playlist order or chronological. */
  videoIds: string[];
  /** Output language for both the per-episode summaries + synthesis. */
  outputLang: SeasonOutputLang;
}

export interface SeasonEpisodeSummary {
  /** 1-based episode index. */
  index: number;
  videoId: string;
  title?: string;
  durationSec?: number;
  sourceLang?: string;
  /** ~800-1200 words of structured prose in the output language. */
  summary: string;
}

export interface SeasonTheme {
  title: string;
  description: string;
  /** 1-based episode indexes where this theme manifests. */
  episodeRefs: number[];
}

export interface SeasonContradiction {
  topic: string;
  episodes: Array<{ idx: number; position: string }>;
}

export interface SeasonConceptArc {
  concept: string;
  arc: string;
}

export interface SeasonBestEpisode {
  idx: number;
  why: string;
}

export interface SeasonPackResult {
  videoIds: string[];
  outputLang: SeasonOutputLang;
  totalEpisodes: number;
  totalMinutes: number;
  episodes: SeasonEpisodeSummary[];
  /** ≤24-word headline that captures the season's thesis or arc. */
  oneLineSummary: string;
  themes: SeasonTheme[];
  contradictions: SeasonContradiction[];
  conceptEvolution: SeasonConceptArc[];
  bestEpisodes: SeasonBestEpisode[];
  /** Echo of which provider served the synthesis pass. */
  synthesisProvider: 'workers-ai' | 'anthropic';
  /** Echo of the model id from the synthesis call. */
  synthesisModel: string;
  /** Total token usage across summarisation + synthesis, when known. */
  usage?: {
    summariseInputTokens?: number;
    summariseOutputTokens?: number;
    synthesisInputTokens: number;
    synthesisOutputTokens: number;
    synthesisCacheReadInputTokens: number;
    synthesisCacheCreationInputTokens: number;
  };
  /** ms-epoch when generation completed (for the future quota meter). */
  generatedAt: number;
}

/**
 * Build a Season Pack from an array of video IDs.
 *
 * Caller is responsible for:
 *   • Tier-gating (Pro Plus only — verify before calling)
 *   • Quota enforcement (2/mo Pro Plus, overage at $0.75)
 *   • Persisting the result to KV / IndexedDB
 *
 * The fetcher is injected so this module stays import-light and
 * testable. Errors from individual episode fetches propagate up
 * (Promise.all semantics) — the v1 doesn't fall back to partial
 * synthesis on transcript-fetch failure because that would emit
 * a pack that's silently incomplete. Future v2 can add a
 * `tolerateMissing: number` option for season packs of >20
 * episodes where the occasional missing transcript is acceptable.
 */
export async function generateSeasonPack(
  opts: SeasonPackOpts,
  fetchEpisode: EpisodeFetcher,
  env: LlmRouterEnv,
): Promise<SeasonPackResult> {
  if (opts.videoIds.length === 0) {
    throw new Error('season_pack: empty videoIds');
  }
  if (opts.videoIds.length > 50) {
    throw new Error('season_pack: too many episodes (max 50 in v1)');
  }

  // 1. Fetch + summarise episodes in parallel. Promise.all is
  //    intentional — Workers AI Llama 3.3 calls are cheap and the
  //    Supadata transcript fetcher is rate-limited per-key so a
  //    concurrent fan-out completes in ~one-episode time rather
  //    than N × one-episode time.
  const episodes: SeasonEpisodeSummary[] = await Promise.all(
    opts.videoIds.map(async (videoId, i) => {
      const raw = await fetchEpisode(videoId);
      const summary = await summariseEpisode(raw.text, opts.outputLang, env);
      return {
        index: i + 1,
        videoId,
        title: raw.title,
        durationSec: raw.durationSec,
        sourceLang: raw.sourceLang,
        summary,
      };
    }),
  );

  // 2. Cross-episode synthesis. Sonnet 4.5 reads all summaries +
  //    emits the structured pack. Prompt cached at 1h TTL so a
  //    second season pack in the same hour hits the cache for the
  //    synthesis-instructions portion of the system message.
  const synthesis = await synthesiseSeason(
    episodes,
    opts.outputLang,
    env,
  );

  return {
    videoIds: opts.videoIds,
    outputLang: opts.outputLang,
    totalEpisodes: episodes.length,
    totalMinutes: Math.round(
      episodes.reduce((sum, e) => sum + (e.durationSec ?? 0), 0) / 60,
    ),
    episodes,
    oneLineSummary: synthesis.oneLineSummary,
    themes: synthesis.themes,
    contradictions: synthesis.contradictions,
    conceptEvolution: synthesis.conceptEvolution,
    bestEpisodes: synthesis.bestEpisodes,
    synthesisProvider: synthesis.provider,
    synthesisModel: synthesis.model,
    usage: synthesis.usage,
    generatedAt: Date.now(),
  };
}

/* ─── internals ──────────────────────────────────────────────────── */

async function summariseEpisode(
  text: string,
  outputLang: SeasonOutputLang,
  env: LlmRouterEnv,
): Promise<string> {
  // Bound the per-episode transcript at ~12k chars so the Llama
  // input stays comfortable (Llama 3.3 70B handles 128k tokens
  // natively but the worker AI binding has its own per-call cap,
  // and the synthesis pass only needs the highlights anyway).
  const bounded =
    text.length > 12000
      ? text.slice(0, 6000) + '\n\n[…middle truncated…]\n\n' + text.slice(-3000)
      : text;

  const result = await callLLM(
    {
      // Per-episode summarisation uses Llama explicitly. Sonnet
      // 4.5's value is in the cross-episode synthesis, not in
      // condensing one transcript at a time — Llama at 70B is
      // editorial-quality for one-episode passes at a fraction
      // of the per-call cost.
      tier: 'free',
      systemPrompt: episodeSummaryPrompt(outputLang),
      userContent: bounded,
      // 1200-word output (~1600 tokens) plus headroom for the
      // model occasionally over-running the spec.
      maxTokens: 1800,
      temperature: 0.3,
    },
    env,
  );
  return result.text.trim();
}

async function synthesiseSeason(
  episodes: SeasonEpisodeSummary[],
  outputLang: SeasonOutputLang,
  env: LlmRouterEnv,
): Promise<{
  oneLineSummary: string;
  themes: SeasonTheme[];
  contradictions: SeasonContradiction[];
  conceptEvolution: SeasonConceptArc[];
  bestEpisodes: SeasonBestEpisode[];
  provider: 'workers-ai' | 'anthropic';
  model: string;
  usage?: SeasonPackResult['usage'];
}> {
  // Concatenate episode summaries with 1-based index headers so
  // the synthesis model can cite back accurately. Each summary
  // is ~1200 words → 1.2k tokens. 40 episodes → ~50k input tokens,
  // well within Sonnet's context budget with cache headroom.
  const corpus = episodes
    .map((e) => {
      const header = e.title
        ? `### Episode ${e.index}: ${e.title}`
        : `### Episode ${e.index}`;
      return `${header}\n\n${e.summary}`;
    })
    .join('\n\n');

  const result = await callLLM(
    {
      tier: 'pro_plus',
      systemPrompt: synthesisPrompt(outputLang, episodes.length),
      userContent: corpus,
      maxTokens: 5000,
      temperature: 0.35,
      // The synthesis system prompt is deterministic per
      // (outputLang, episodes.length) — small enough to fit
      // entirely above Anthropic's 1024-token cache threshold,
      // so a same-day rerun (e.g. user adds a new episode + re-
      // generates) hits the cache for the instructions portion.
      cacheSystemPrompt: true,
      cacheTTL: '1h',
    },
    env,
  );

  const parsed = parseSynthesisJson(result.text);
  return {
    ...parsed,
    provider: result.provider,
    model: result.model,
    usage: result.usage
      ? {
          synthesisInputTokens: result.usage.inputTokens,
          synthesisOutputTokens: result.usage.outputTokens,
          synthesisCacheReadInputTokens: result.usage.cacheReadInputTokens,
          synthesisCacheCreationInputTokens:
            result.usage.cacheCreationInputTokens,
        }
      : undefined,
  };
}

/* ─── Prompts ─────────────────────────────────────────────────────── */

const LANG_NAMES: Record<SeasonOutputLang, string> = {
  en: 'English',
  es: 'Spanish (castellano)',
  pt: 'Portuguese (português europeu)',
  de: 'German (Deutsch)',
};

function episodeSummaryPrompt(outputLang: SeasonOutputLang): string {
  const lang = LANG_NAMES[outputLang];
  return `You are summarising a single episode that belongs to a multi-episode series (podcast season, video course, lecture series, or curated playlist). A second pass will later read your summary alongside the other episodes' summaries and produce a cross-episode synthesis — themes, contradictions, concept evolution.

Your job is to make THAT downstream synthesis possible by producing the densest, most-faithful per-episode summary you can.

Output 800-1200 words in ${lang}, organised as:

1. **Headline** — one sentence (≤22 words) that captures the episode's overall claim or arc.
2. **Main ideas (3-5)** — each with: the claim itself + 1-2 sentences of supporting context from the episode.
3. **Key concepts introduced** — terms the speaker defines or relies on heavily.
4. **Notable claims or contradictions** — anything the speaker asserts that would be worth checking against other episodes (factual claims, predictions, opinions stated with high confidence).
5. **Memorable quotes (1-3)** — verbatim where possible, with a rough timestamp if it's obvious from the transcript context.

Quality bar:
- Write like a serious editor at The Atlantic / Granta — specific, declarative, no hedging.
- Capture WHAT THIS EPISODE SAID, not what episodes-on-this-topic generally say.
- No platitudes ("communication matters"). Surface the actual claim.
- Plain prose with section headers. No bullet-point list spam, no markdown emphasis.
- Output ENTIRELY in ${lang}. Vocabulary terms can stay in their source language inside parentheses if they're load-bearing.`;
}

function synthesisPrompt(outputLang: SeasonOutputLang, episodeCount: number): string {
  const lang = LANG_NAMES[outputLang];
  return `You are reading the summaries of ${episodeCount} episodes from a multi-episode series. The summaries you receive are each ~1000 words of structured prose distilled by a per-episode pass. Your job is to find the THROUGHLINE — what spans episodes, what contradicts, what evolves.

Output STRICT JSON in ${lang} with this exact shape. NO markdown. NO code fences. NO trailing commas. NO prose before or after the JSON object.

{
  "oneLineSummary": "≤24 words capturing the season's overall thesis or arc — what someone walks away knowing after listening to all of it",
  "themes": [
    {
      "title": "5-8 word theme name",
      "description": "2-4 sentences explaining the theme + how it manifests across episodes. Cite specific claims.",
      "episodeRefs": [1, 4, 7]
    }
  ],
  "contradictions": [
    {
      "topic": "What the contradiction is about",
      "episodes": [
        { "idx": 1, "position": "Position taken in episode 1, paraphrased faithfully" },
        { "idx": 5, "position": "Different position taken in episode 5, paraphrased faithfully" }
      ]
    }
  ],
  "conceptEvolution": [
    {
      "concept": "Name of the concept the speaker(s) returned to",
      "arc": "How the framing of this concept changed across episodes — episode N said X, episode M reframed it as Y"
    }
  ],
  "bestEpisodes": [
    { "idx": 1, "why": "One-sentence reason this is among the best entry points or standout episodes" }
  ]
}

Quality bar:
- 3 to 7 themes maximum. Depth over breadth. A theme that only shows up in one episode isn't a theme.
- 0 to 3 contradictions. Only the genuinely interesting ones (the speaker disagrees with themselves; two guests took opposite positions). Most seasons have 0-1 real contradictions; don't manufacture them.
- 0 to 5 concept evolutions. A "concept" here means a load-bearing idea the speaker(s) returned to and shifted on.
- 1 to 5 bestEpisodes. Rank-ordered or not, but each "why" must be a specific reason, not "great episode".
- Episode indexes are 1-based and must match the ### Episode N: headers in the input corpus.
- Output entirely in ${lang}. The synthesis is a finished editorial artefact, not a Markdown skeleton.`;
}

/* ─── Output parser ──────────────────────────────────────────────── */

function parseSynthesisJson(raw: string): {
  oneLineSummary: string;
  themes: SeasonTheme[];
  contradictions: SeasonContradiction[];
  conceptEvolution: SeasonConceptArc[];
  bestEpisodes: SeasonBestEpisode[];
} {
  // Tolerant parser — strips code fences + leading/trailing prose
  // around the JSON object. Mirrors insights.ts parseInsightsJson.
  let text = raw;
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) text = fenced[1];
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) text = text.slice(first, last + 1);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch (err) {
    throw new Error(
      `season_pack: synthesis JSON parse failed — ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const themes = Array.isArray(parsed.themes)
    ? (parsed.themes as unknown[]).flatMap((t): SeasonTheme[] => {
        if (!t || typeof t !== 'object') return [];
        const o = t as Record<string, unknown>;
        const title = typeof o.title === 'string' ? o.title.trim() : '';
        const description = typeof o.description === 'string' ? o.description.trim() : '';
        if (!title || !description) return [];
        const refs = Array.isArray(o.episodeRefs)
          ? (o.episodeRefs as unknown[]).filter((n): n is number => typeof n === 'number')
          : [];
        return [{ title, description, episodeRefs: refs }];
      })
    : [];

  const contradictions = Array.isArray(parsed.contradictions)
    ? (parsed.contradictions as unknown[]).flatMap((c): SeasonContradiction[] => {
        if (!c || typeof c !== 'object') return [];
        const o = c as Record<string, unknown>;
        const topic = typeof o.topic === 'string' ? o.topic.trim() : '';
        if (!topic) return [];
        const episodes = Array.isArray(o.episodes)
          ? (o.episodes as unknown[]).flatMap((e): SeasonContradiction['episodes'] => {
              if (!e || typeof e !== 'object') return [];
              const eo = e as Record<string, unknown>;
              const idx = typeof eo.idx === 'number' ? eo.idx : NaN;
              const position = typeof eo.position === 'string' ? eo.position.trim() : '';
              if (!Number.isFinite(idx) || !position) return [];
              return [{ idx, position }];
            })
          : [];
        if (episodes.length === 0) return [];
        return [{ topic, episodes }];
      })
    : [];

  const conceptEvolution = Array.isArray(parsed.conceptEvolution)
    ? (parsed.conceptEvolution as unknown[]).flatMap((c): SeasonConceptArc[] => {
        if (!c || typeof c !== 'object') return [];
        const o = c as Record<string, unknown>;
        const concept = typeof o.concept === 'string' ? o.concept.trim() : '';
        const arc = typeof o.arc === 'string' ? o.arc.trim() : '';
        if (!concept || !arc) return [];
        return [{ concept, arc }];
      })
    : [];

  const bestEpisodes = Array.isArray(parsed.bestEpisodes)
    ? (parsed.bestEpisodes as unknown[]).flatMap((b): SeasonBestEpisode[] => {
        if (!b || typeof b !== 'object') return [];
        const o = b as Record<string, unknown>;
        const idx = typeof o.idx === 'number' ? o.idx : NaN;
        const why = typeof o.why === 'string' ? o.why.trim() : '';
        if (!Number.isFinite(idx) || !why) return [];
        return [{ idx, why }];
      })
    : [];

  return {
    oneLineSummary:
      typeof parsed.oneLineSummary === 'string' ? parsed.oneLineSummary.trim() : '',
    themes,
    contradictions,
    conceptEvolution,
    bestEpisodes,
  };
}
