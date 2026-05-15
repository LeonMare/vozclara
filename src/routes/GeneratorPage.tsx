import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { extractVideoId } from '../lib/youtube';
import { useLocale } from '../lib/i18n';
import { ModePicker } from '../components/ModePicker';
import { GenerationProgress } from '../components/GenerationProgress';
import { fetchTranscript } from '../lib/transcript';
import { fetchInsights, joinForLLM } from '../lib/insights';
import { savePack, saveTranscript, getBrainId, type Mode, type Language, type KnowledgePack, type Genre } from '../lib/pack';
import { nanoid } from '../lib/nanoid';

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
  // Honor ?lang= and ?mode= pre-selectors. Used by the Pack-view's
  // "Translate to..." switcher so the user lands on Generate with one
  // click left to confirm — no silent re-generation, no surprise pack.
  const initialLang = (searchParams.get('lang') as Language | null);
  const initialMode = (searchParams.get('mode') as Mode | null);

  const [videoId, setVideoId] = useState(initialVideoId);
  const [pasteValue, setPasteValue] = useState(initialVideoId ? `https://www.youtube.com/watch?v=${initialVideoId}` : '');
  const [pasteError, setPasteError] = useState<string | null>(null);

  const [outputLang, setOutputLang] = useState<Language>(
    initialLang && ['es', 'en', 'de', 'pt'].includes(initialLang) ? initialLang : (locale as Language),
  );
  const [mode, setMode] = useState<Mode>(
    initialMode && ['learn', 'business', 'creator'].includes(initialMode) ? initialMode : 'business',
  );
  const [recommended, setRecommended] = useState<Mode | undefined>();

  const [generating, setGenerating] = useState(false);
  const [progressMeta, setProgressMeta] = useState<{ videoMinutes?: number; sentences?: number; insights?: number; targetLang?: string }>({});
  const [error, setError] = useState<string | null>(null);

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
      // 1. Transcript + translation in target language. We no longer
      //    hint at the source language — the worker auto-detects it
      //    from whatever native captions YouTube has on the video.
      //    `transcript.lang` is the truth-source for `sourceLang`.
      const transcript = await fetchTranscript(videoId, {
        to: outputLang,
      });
      const sourceLang = normaliseLang(transcript.lang);

      // Surface concrete numbers to the loading screen.
      const lastSeg = transcript.segments[transcript.segments.length - 1];
      const videoMinutes = lastSeg ? Math.max(1, Math.round((lastSeg.start + lastSeg.dur) / 60)) : undefined;
      setProgressMeta((m) => ({ ...m, videoMinutes, sentences: transcript.segments.length }));

      // 2. Insights (mode-aware).
      const joined = joinForLLM(transcript.segments);
      const result = await fetchInsights({
        videoId,
        transcript: joined,
        sourceLang,
        targetLang: outputLang,
        mode,
      });
      setProgressMeta((m) => ({ ...m, insights: result.insights.length }));
      if (!recommended) setRecommended(modeForGenre(result.genre));

      // 3. Assemble + persist the pack.
      const id = nanoid(12);
      const brainId = getBrainId();
      const transcriptKey = await saveTranscript(id, transcript.segments);
      const title = transcript.title ?? `Video ${videoId}`;
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
        mode,
        genre: result.genre,
        status: 'ready',
        summary: result.summary,
        keyIdeas: result.insights,
        chapters: result.chapters,
        actionPlan: result.actionPlan,
        vocabulary: result.vocabulary,
        keyQuotes: result.keyQuotes,
        socialAngles: result.socialAngles,
        quiz: result.quiz,
        tags: [],
        category: result.genre,
        isPublic: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        transcriptKey,
      };
      await savePack(pack);

      navigate(`/pack/${id}`);
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setError(m);
      setGenerating(false);
    }
  }

  return (
    <main className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-8 font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
          § {t.newPageTitle}
        </div>

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
              {pasteError && <p role="alert" className="mt-2 font-sans text-sm text-red-700">{pasteError}</p>}
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
              <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/55">
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
              <p role="alert" className="mt-4 font-sans text-sm text-red-700">{error}</p>
            )}
          </section>
        )}

        {generating && <GenerationProgress active meta={progressMeta} />}
      </div>
    </main>
  );
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

/* Smart-default genre → mode mapping. */
function modeForGenre(genre: Genre): Mode {
  switch (genre) {
    case 'news':
    case 'business':
    case 'interview': return 'business';
    case 'coaching':
    case 'education': return 'learn';
    case 'creator': return 'creator';
    default: return 'business';
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
