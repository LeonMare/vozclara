import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { extractVideoId } from '../lib/youtube';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import { friendlyError, type FriendlyError } from '../lib/errorMessages';
import { ErrorCard } from '../components/ErrorCard';
import { ModePicker } from '../components/ModePicker';
import { GenerationProgress } from '../components/GenerationProgress';
import { fetchTranscript } from '../lib/transcript';
import { fetchInsights, streamInsights, joinForLLM, type InsightsResult } from '../lib/insights';
import { savePack, saveTranscript, getPack, getTranscript, getBrainId, type Mode, type Language, type KnowledgePack, type PackTranslation, type Genre } from '../lib/pack';
import { track, Events } from '../lib/analytics';
import { nanoid } from '../lib/nanoid';
import { indexPack } from '../lib/packIndex';
import { audienceDefaultMode } from '../lib/audience';
import { AIDisclosureBanner } from '../components/AIDisclosureBanner';

/**
 * /new — the generator flow.
 *
 * Three-step view:
 *   1. URL input (skipped if ?v=… provided)
 *   2. Mode picker + output language
 *   3. Generation progress → redirect to /pack/:id
 *
 * Smart default: once the transcript fetch reveals a genre, we
 * preselect the mode that fits (news → business, coaching → learn, etc.).
 */
export function GeneratorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, locale } = useLocale();

  const initialVideoId = searchParams.get('v') ?? '';
  // Honour ?lang= and ?mode= pre-selectors. Used by the Pack-view's
  // language switcher so the user lands on Generate with one click
  // left to confirm — no silent re-generation, no surprise pack.
  const initialLang = (searchParams.get('lang') as Language | null);
  // Read as plain string so we can still match the legacy `?mode=business`
  // URL param and migrate it to `brief` without TS narrowing it away.
  const initialMode = searchParams.get('mode');
  // ?packId=… means "merge the resulting translation into THIS existing
  // pack as an additional language" rather than creating a new pack.
  // Drives the multi-locale workflow from the Pack-view + chip.
  const mergeIntoPackId = searchParams.get('packId');

  const [videoId, setVideoId] = useState(initialVideoId);
  const [pasteValue, setPasteValue] = useState(initialVideoId ? `https://www.youtube.com/watch?v=${initialVideoId}` : '');
  const [pasteError, setPasteError] = useState<string | null>(null);

  const [outputLang, setOutputLang] = useState<Language>(
    initialLang && ['es', 'en', 'de', 'pt'].includes(initialLang) ? initialLang : (locale as Language),
  );
  const [mode, setMode] = useState<Mode>(() => {
    // 1. URL param wins — somebody linked here with intent.
    if (
      initialMode === 'learn' ||
      initialMode === 'brief' ||
      initialMode === 'study' ||
      initialMode === 'creator'
    ) {
      return initialMode;
    }
    // 2. AudienceTiles choice from the landing — sets the default
    //    that matches the user's onboarding picked persona.
    const aud = audienceDefaultMode();
    if (aud) return aud;
    // 3. Cold start — `brief` is the safest neutral default.
    //    Legacy ?mode=business URLs also fall through here.
    return 'brief';
  });
  const [recommended, setRecommended] = useState<Mode | undefined>();

  const [generating, setGenerating] = useState(false);
  const [progressMeta, setProgressMeta] = useState<{ videoMinutes?: number; sentences?: number; insights?: number; targetLang?: string }>({});
  const [error, setError] = useState<FriendlyError | null>(null);
  // Live stream of the model's output as the pack is being composed.
  // Surfaced under the editorial narration phases via
  // GenerationProgress' `streamingText` prop. Cleared on every new
  // generation so the typewriter view starts blank.
  const [streamedText, setStreamedText] = useState<string>('');
  // Live trace of the model's extended thinking (Sonnet 4.5 only,
  // when the Pro Plus tier is detected server-side). Yielded by
  // streamInsights as `{ kind: 'thinking', accumulated }` events
  // separate from the text-delta stream. Rendered above the
  // streaming output in GenerationProgress so the user sees "the AI
  // is reasoning" before the pack itself starts composing.
  const [thinkingText, setThinkingText] = useState<string>('');

  usePageHead({
    title: generatorTitle(locale),
    description: generatorDescription(locale),
  });

  // Smart default — detect genre lightly via transcript title or genre hint.
  // We don't fetch insights here; we'll let the user choose and then run
  // the full pipeline. Recommendation is best-effort.
  useEffect(() => {
    if (!videoId) return;
    // No-op for now; recommendation comes after transcript fetch in the
    // generation step. Kept as a hook for a future light pre-fetch.
  }, [videoId]);

  function handlePasteSubmit(e: FormEvent) {
    e.preventDefault();
    const id = extractVideoId(pasteValue);
    if (!id) {
      setPasteError(t.invalidUrl);
      return;
    }
    setPasteError(null);
    setVideoId(id);
  }

  async function handleGenerate() {
    if (!videoId) return;
    setError(null);
    setGenerating(true);
    setProgressMeta({ targetLang: outputLang });

    try {
      // 1. Acquire the transcript. Two paths:
      //    • Merge mode (?packId=…) → try cached transcript from IDB.
      //      Skips Supadata entirely, saving a credit and ~10s per
      //      added language. The cached segments hold the original-
      //      language text we need to feed the LLM.
      //    • Otherwise → fetch fresh from /api/transcript. The worker
      //      also handles Lingva translation into the target lang,
      //      which we save as part of the new pack.

      let existingPack: KnowledgePack | undefined;
      if (mergeIntoPackId) {
        existingPack = await getPack(mergeIntoPackId);
        if (!existingPack) throw new Error('pack_not_found_for_merge');
      }

      const cachedSegments = existingPack?.transcriptKey
        ? (await getTranscript(existingPack.transcriptKey))?.segments
        : undefined;

      let sourceLang: Language;
      let title: string;
      let joinedTranscript: string;
      // freshSegments is only populated when we actually called Supadata;
      // we need it later to persist as the new pack's transcript. For
      // the cached-merge path we reuse the existing transcriptKey and
      // never create a new one.
      let freshSegments: import('../lib/pack').Segment[] | undefined;

      if (existingPack && cachedSegments && cachedSegments.length > 0) {
        // FAST PATH: cached transcript for merge.
        sourceLang = existingPack.sourceLang;
        title = existingPack.title;

        // Force the source-language text by stripping the `translated`
        // field — joinForLLM falls back to `text` when there's no
        // translation. Passing the original text yields cleaner LLM
        // output than chaining old-target → new-target translations.
        joinedTranscript = joinForLLM(cachedSegments.map((s) => ({ text: s.text })));

        const lastSeg = cachedSegments[cachedSegments.length - 1];
        const videoMinutes = lastSeg ? Math.max(1, Math.round((lastSeg.start + lastSeg.dur) / 60)) : undefined;
        setProgressMeta((m) => ({ ...m, videoMinutes, sentences: cachedSegments.length }));
      } else {
        // FRESH (or fallback) PATH: hit /api/transcript.
        const transcript = await fetchTranscript(videoId, { to: outputLang });
        sourceLang = normaliseLang(transcript.lang);
        title = transcript.title ?? (existingPack?.title ?? `Video ${videoId}`);
        freshSegments = transcript.segments;
        joinedTranscript = joinForLLM(transcript.segments);

        const lastSeg = transcript.segments[transcript.segments.length - 1];
        const videoMinutes = lastSeg ? Math.max(1, Math.round((lastSeg.start + lastSeg.dur) / 60)) : undefined;
        setProgressMeta((m) => ({ ...m, videoMinutes, sentences: transcript.segments.length }));
      }

      // 2. Insights (mode-aware) — streaming variant. Yields text
      //    deltas as the LLM composes so the user sees the pack
      //    coming together in real time (Manus / Granola pattern).
      //    Falls back to the non-streaming endpoint if the stream
      //    itself errors out (network drop, parse failure) so the
      //    visible-tokens UX never costs us reliability.
      setStreamedText('');
      setThinkingText('');
      let result: InsightsResult | undefined;
      let streamFailed: string | null = null;
      try {
        for await (const evt of streamInsights({
          videoId,
          transcript: joinedTranscript,
          sourceLang,
          targetLang: outputLang,
          mode,
        })) {
          if (evt.kind === 'delta') {
            setStreamedText(evt.accumulated);
          } else if (evt.kind === 'thinking') {
            // Sonnet 4.5 extended-thinking deltas. Only the Pro Plus
            // tier produces these (worker enables `thinking` for
            // userTier === 'pro_plus' in handleInsightsStream). The
            // free + pro tiers stream straight through with empty
            // thinkingText so the panel stays hidden for them.
            setThinkingText(evt.accumulated);
          } else if (evt.kind === 'done') {
            result = evt.result;
          } else if (evt.kind === 'error') {
            streamFailed = evt.message;
            break;
          }
          // 'meta' events are swallowed for v1 — provider + model are
          // already echoed onto the saved pack's `provenance.model`,
          // and the streaming UX doesn't need a separate badge yet.
        }
      } catch (err) {
        streamFailed = err instanceof Error ? err.message : String(err);
      }
      if (!result) {
        // Streaming path lost connection or returned an error event —
        // retry once on the non-streaming endpoint so the user still
        // gets their pack rather than a failed-generation card.
        // eslint-disable-next-line no-console
        console.warn('streamInsights fallback:', streamFailed);
        result = await fetchInsights({
          videoId,
          transcript: joinedTranscript,
          sourceLang,
          targetLang: outputLang,
          mode,
        });
      }
      setProgressMeta((m) => ({ ...m, insights: result!.insights.length }));
      if (!recommended) setRecommended(modeForGenre(result.genre));

      // 3. Build the per-language translation slice from the worker
      //    response. Same shape for both "create new pack" and "merge
      //    into existing pack" paths — only the wrapping differs.
      const translation: PackTranslation = {
        summary: result.summary,
        tldr: result.tldr,
        keyIdeas: result.insights,
        chapters: result.chapters,
        actionPlan: result.actionPlan,
        vocabulary: result.vocabulary,
        keyQuotes: result.keyQuotes,
        socialAngles: result.socialAngles,
        quiz: result.quiz,
      };

      let targetPackId: string;

      if (existingPack) {
        // Merge path — append this translation to the existing pack and
        // promote it as the active view. The transcript is shared
        // across languages so we don't write a new one (and in the
        // fast path we didn't even fetch one).
        //
        // Tags: union of whatever the pack already had + whatever the
        // LLM extracted on this run. That way packs that pre-date the
        // auto-tagging feature gain tags the first time the user adds
        // another translation, without losing the old set.
        const mergedTags = Array.from(new Set([...existingPack.tags, ...result.tags]));
        const merged: KnowledgePack = {
          ...existingPack,
          outputLang,
          outputLanguages: Array.from(new Set([...existingPack.outputLanguages, outputLang])),
          translations: { ...existingPack.translations, [outputLang]: translation },
          tags: mergedTags,
          /* Backfill difficulty on packs generated before this field existed.
             Only overwrite when missing — otherwise the first reading wins. */
          difficulty: existingPack.difficulty ?? result.difficulty,
          updatedAt: Date.now(),
        };
        await savePack(merged);
        // Re-index — the new translation adds fresh chunks the vector
        // store should know about. Fire-and-forget; no-op if Vectorize
        // isn't bound on the worker.
        void indexPack(merged);
        targetPackId = existingPack.id;
      } else {
        // Fresh-pack path — assemble a new KnowledgePack carrying one
        // translation, save the transcript under its own key, and
        // route the user to the new pack view.
        if (!freshSegments) throw new Error('missing_transcript_for_new_pack');
        const id = nanoid(12);
        const brainId = getBrainId();
        const transcriptKey = await saveTranscript(id, freshSegments);
        const pack: KnowledgePack = {
          id,
          brainId,
          source: {
            type: 'youtube',
            url: `https://www.youtube.com/watch?v=${videoId}`,
            videoId,
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          },
          title,
          sourceLang,
          outputLang,
          outputLanguages: [outputLang],
          translations: { [outputLang]: translation },
          mode,
          genre: result.genre,
          status: 'ready',
          tags: result.tags,
          category: result.genre,
          isPublic: false,
          difficulty: result.difficulty,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          transcriptKey,
          // EU AI Act Art. 50(2) — stamp every fresh pack with its
          // generator's identity so exports, MCP responses and any
          // future lens-aware UI can attribute the output.
          // The model string mirrors the worker constant; lensId stays
          // undefined until the 18-Lens system ships (CLAUDE.md §1.2).
          provenance: {
            model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
            watermark: 'vozclara.app',
            generatedAt: Date.now(),
          },
        };
        await savePack(pack);
        void indexPack(pack);
        targetPackId = id;
        // Funnel: pack persisted to IndexedDB → the visitor has
        // crossed the value moment. Includes mode + output language
        // + genre as low-cardinality dimensions for Plausible's
        // filter sidebar (avoids any user identifier).
        track(Events.PACK_GENERATED, {
          locale,
          mode,
          language: outputLang,
          genre: pack.genre,
        });
      }

      // Append ?welcome=1 so PackPage can briefly surface an editorial
      // "saved to your library" bookplate. The URL is cleaned (history
      // replace) once the moment fades, so refresh / share never
      // re-triggers it.
      navigate(`/pack/${targetPackId}?welcome=1`);
    } catch (err) {
      // Translate the typed worker / network error into a friendly card.
      // friendlyError() reads .code if the err is a typed instance
      // (TranscriptError / InsightsError), otherwise falls back through
      // .message or the raw string.
      setError(friendlyError(err, locale));
      setGenerating(false);
    }
  }

  return (
    <main id="main" className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-8 font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
          § {t.newPageTitle}
        </div>

        <AIDisclosureBanner />

        {!videoId && (
          <section>
            <h1 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
              {t.stepUrl}
            </h1>
            <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
            <form onSubmit={handlePasteSubmit} className="mt-6">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={t.heroUrlInputLabel}
                  placeholder={t.heroPlaceholder}
                  value={pasteValue}
                  onChange={(e) => setPasteValue(e.target.value)}
                  className="flex-1 rounded-card border border-navy/15 bg-white px-4 py-3.5 font-sans text-base text-graphit placeholder-graphit/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
                <button
                  type="submit"
                  className="rounded-card bg-navy px-6 py-3.5 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
                >
                  →
                </button>
              </div>
              {pasteError && (
                <ErrorCard error={friendlyError('invalid_id', locale)} />
              )}
            </form>
          </section>
        )}

        {videoId && !generating && (
          <section>
            <h1 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
              {t.chooseModeTitle}
            </h1>
            <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
            <p className="mt-3 font-serif italic text-graphit/70 sm:text-lg">
              {t.chooseModeSub}
            </p>

            <div className="mt-8">
              <ModePicker value={mode} onChange={setMode} recommended={recommended} />
            </div>

            <div className="mt-10">
              <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/65">
                {t.outputLangLabel}
              </div>
              <div className="mt-2">
                <LangSelect value={outputLang} onChange={setOutputLang} />
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => { setVideoId(''); setPasteValue(''); }}
                className="font-sans text-sm text-graphit/60 underline-offset-4 hover:text-navy hover:underline"
              >
                ← {t.stepUrl}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-card bg-navy px-6 py-3.5 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
              >
                {t.generateBtn}
              </button>
            </div>

            {error && (
              <ErrorCard
                error={error}
                actionLabel={tryAnotherLabel(locale)}
                onAction={() => {
                  setError(null);
                  setVideoId('');
                  setPasteValue('');
                }}
              />
            )}
          </section>
        )}

        {generating && (
          <GenerationProgress
            active
            meta={progressMeta}
            mergeMode={!!mergeIntoPackId}
            streamingText={streamedText}
            thinkingText={thinkingText}
          />
        )}
      </div>
    </main>
  );
}

function tryAnotherLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Probar otro vídeo';
  if (locale.startsWith('pt')) return 'Tentar outro vídeo';
  if (locale.startsWith('de')) return 'Anderes Video';
  return 'Try another video';
}

function generatorTitle(locale: string): string {
  if (locale.startsWith('es')) return 'Crear Knowledge Pack';
  if (locale.startsWith('pt')) return 'Criar Knowledge Pack';
  if (locale.startsWith('de')) return 'Knowledge Pack erstellen';
  return 'Create a Knowledge Pack';
}

function generatorDescription(locale: string): string {
  if (locale.startsWith('es')) return 'Pega un enlace de YouTube y obtén un Knowledge Pack estructurado en tu idioma — resumen, ideas clave, vocabulario, quiz, citas.';
  if (locale.startsWith('pt')) return 'Cola um link do YouTube e recebe um Knowledge Pack estruturado na tua língua — resumo, ideias-chave, vocabulário, quiz, citações.';
  if (locale.startsWith('de')) return 'YouTube-Link einfügen und einen strukturierten Knowledge Pack in deiner Sprache bekommen — Summary, Kernideen, Vokabeln, Quiz, Zitate.';
  return 'Paste a YouTube link, get a structured Knowledge Pack in your language — summary, key ideas, vocabulary, quiz, quotes.';
}

/**
 * Normalise whatever the worker reports as the source language into one
 * of our supported Language codes. YouTube returns BCP-47 tags like
 * 'de-DE', 'en-GB', 'es-419' etc. — we strip the region. If the base
 * code is outside our supported set (Italian, Japanese, etc.) we fall
 * back to 'en' so the pack metadata stays consistent even when the
 * detected language is one we don't ship a UI for yet.
 */
function normaliseLang(raw: string): Language {
  const base = (raw || '').toLowerCase().split('-')[0] as Language;
  const supported: Language[] = ['en', 'es', 'de', 'pt', 'fr'];
  return supported.includes(base) ? base : 'en';
}

/**
 * Smart-default genre → mode mapping (LAUNCH_PLAN §4).
 *
 *   news / business / interview / coaching / general  → brief
 *   education                                         → study
 *   creator                                           → creator
 *
 * Note that `learn` is intentionally NOT the auto-pick for any genre.
 * It's only chosen when the visitor explicitly opts in (onboarding
 * picks "I want to learn the language") — otherwise an education video
 * would default to language-learner pacing for everyone, which is wrong
 * for the much larger student / knowledge-worker audience.
 */
function modeForGenre(genre: Genre): Mode {
  switch (genre) {
    case 'education': return 'study';
    case 'creator':   return 'creator';
    // news, business, interview, coaching, general → brief
    default:          return 'brief';
  }
}

function LangSelect({ value, onChange }: { value: Language; onChange: (l: Language) => void }) {
  const langs: Array<{ code: Language; label: string }> = [
    { code: 'es', label: 'Castellano' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
  ];
  return (
    <div role="group" className="inline-flex items-center gap-1 rounded-card border border-navy/15 bg-white p-1">
      {langs.map((l) => {
        const active = l.code === value;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            aria-pressed={active}
            className={[
              'rounded-card px-4 py-2 font-sans text-sm transition',
              active ? 'bg-navy text-creme' : 'text-graphit/70 hover:text-navy',
            ].join(' ')}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
