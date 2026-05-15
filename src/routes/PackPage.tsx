import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { BrandMark } from '../components/BrandMark';
import { getPack, getTranscript, deletePack, savePack, activeView, type KnowledgePack, type PackTranslation, type Segment, type Language } from '../lib/pack';
import { getSamplePack } from '../lib/samplePack';
import { PackAudioPlayer } from '../components/PackAudioPlayer';
import { VideoPanel } from '../components/VideoPanel';
import { PackFeedback } from '../components/PackFeedback';
import { PackExport } from '../components/PackExport';
import { PackShare } from '../components/PackShare';

type TabKey = 'summary' | 'chapters' | 'insights' | 'actionPlan' | 'vocabulary' | 'quiz' | 'quotes' | 'socialAngles' | 'transcript';

const TRANSLATABLE_LANGS: Language[] = ['es', 'en', 'de', 'pt'];

/**
 * /pack/:id — view a generated Knowledge Pack.
 *
 * Header surfaces the three things the user needs to know at a glance:
 *   • mode (Learn / Business / Creator)
 *   • source language → output language
 *   • content genre
 *   • creation date
 *
 * Language switcher:
 *   Packs carry a Record<Language, PackTranslation> map. The chips in
 *   the header switch the active view instantly between materialised
 *   translations. To add a NEW language the user hops to /new with
 *   ?packId=... — the Generator merges the result into this pack as
 *   an additional translation rather than creating a separate pack.
 *
 * Tabs are mode-aware. The audio player sits between the header and
 * the tab strip — no longer sticky so it doesn't cover the content.
 */
export function PackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLocale();

  const [pack, setPack] = useState<KnowledgePack | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [tab, setTab] = useState<TabKey>('summary');
  const [notFound, setNotFound] = useState(false);

  // Mobile accordion state. Sections start closed except Summary —
  // the user can expand others on demand. Independent from `tab`
  // (which still drives the desktop tabs view).
  const [openSections, setOpenSections] = useState<Set<TabKey>>(
    () => new Set<TabKey>(['summary']),
  );

  function toggleSection(key: TabKey) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  useEffect(() => {
    if (!id) return;
    const sample = getSamplePack(id);
    if (sample) {
      setPack(sample);
      setSegments([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const p = await getPack(id);
      if (cancelled) return;
      if (!p) {
        setNotFound(true);
        return;
      }
      setPack(p);
      if (p.transcriptKey) {
        const data = await getTranscript(p.transcriptKey);
        if (!cancelled && data) setSegments(data.segments);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (notFound) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <BrandMark variant="monogram" size="lg" tone="gold" decorative />
          <p className="mt-6 font-serif italic text-graphit/70 sm:text-lg">
            Pack no encontrado.
          </p>
          <Link to="/library" className="mt-4 inline-block font-sans text-sm text-navy underline-offset-4 hover:underline">
            {t.packBackToLibrary}
          </Link>
        </div>
      </main>
    );
  }

  if (!pack) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <BrandMark variant="monogram" size="lg" tone="gold" decorative />
        </div>
      </main>
    );
  }

  const view = activeView(pack);
  const tabs: TabKey[] = tabsForMode(pack, view);
  const isSample = pack.id.startsWith('sample');
  const titleClean = displayTitle(pack);

  async function handleSwitchLanguage(lang: Language) {
    // Re-narrow inside the async closure — TS widens `pack` back to
    // `KnowledgePack | null` across the await boundary.
    const current = pack;
    if (!current) return;
    if (lang === current.outputLang) return;
    if (!current.translations[lang]) return; // not yet generated
    if (isSample) {
      // Samples are read-only — switch the local copy without persisting.
      setPack({ ...current, outputLang: lang });
      return;
    }
    const updated: KnowledgePack = { ...current, outputLang: lang };
    await savePack(updated);
    setPack(updated);
  }

  async function handleDelete() {
    if (!pack || isSample) return;
    if (!confirm(deleteConfirmLabel(locale))) return;
    await deletePack(pack.id);
    navigate('/library');
  }

  return (
    <main className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
        {/* Back / actions row — Export available on every pack, Delete
            only on real packs (samples are read-only demos). */}
        <div className="flex items-center justify-between gap-3">
          <Link to="/library" className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline">
            {t.packBackToLibrary}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <PackShare pack={pack} />
            <PackExport pack={pack} />
            {!isSample && (
              <button
                type="button"
                onClick={handleDelete}
                className="font-sans text-xs text-graphit/45 underline-offset-4 hover:text-red-700 hover:underline"
              >
                {t.packDelete}
              </button>
            )}
          </div>
        </div>

        {/* Pack metadata pills — three things the reader needs to see */}
        <div className="mt-6 flex flex-wrap items-center gap-2 font-sans text-[10px] uppercase tracking-widest">
          <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-gold">
            <span className="text-creme/50">●</span> {t.modes[pack.mode].name}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/8 px-2.5 py-1 text-graphit/70">
            <span className="text-graphit/50">{pack.sourceLang.toUpperCase()}</span>
            <span className="text-gold/70">→</span>
            <span className="font-medium text-navy">{pack.outputLang.toUpperCase()}</span>
          </span>
          <span className="rounded-full bg-navy/8 px-2.5 py-1 text-graphit/70">
            {t.genreNames[pack.genre] ?? pack.genre}
          </span>
          <span className="tabular-nums text-graphit/55">
            {new Date(pack.createdAt).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <h1 className="mt-4 font-serif text-2xl leading-tight text-navy sm:text-3xl">
          {titleClean}
        </h1>
        <div className="mt-3 h-px w-12 bg-gold" aria-hidden />

        {/* Original video — collapsible YouTube embed.
            The card has an "Open on YouTube" link built in, so the
            separate source-link is no longer needed below the title. */}
        <VideoPanel source={pack.source} />

        {/* Language switcher — chips show every materialised translation
            on this pack; clicking switches the view instantly. Missing
            languages are surfaced as dashed "+ DE" CTAs that route to
            /new?packId=… so the Generator merges the new translation
            back into this pack. Sample packs are read-only so they
            hide the add-CTAs but keep the switcher. */}
        <LanguageSwitcher
          pack={pack}
          onSwitch={handleSwitchLanguage}
          hideAddCta={isSample}
        />
      </div>

      {/* Audio companion — non-sticky, in document flow. */}
      {segments.length > 0 && (
        <PackAudioPlayer pack={pack} segments={segments} />
      )}

      <div className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        {/* Desktop: horizontal tabs nav + single content section.
            Hidden on mobile in favour of the accordion below. */}
        <div className="hidden sm:block">
          <nav className="sticky top-[60px] z-10 -mx-8 overflow-x-auto border-b border-navy/15 bg-creme/95 px-8 backdrop-blur">
            <div className="flex min-w-max gap-1">
              {tabs.map((k) => {
                const isActive = k === tab;
                const count = countForTab(view, k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTab(k)}
                    className={[
                      'relative whitespace-nowrap px-3 py-3.5 font-sans transition-colors',
                      isActive ? 'text-navy' : 'text-graphit/55 hover:text-navy',
                    ].join(' ')}
                  >
                    <span className={[
                      'text-[15px]',
                      isActive ? 'font-medium' : '',
                    ].join(' ')}>{t.packTabs[k]}</span>
                    {count > 0 && (
                      <span className="ml-1.5 text-[11px] tabular-nums text-graphit/45">
                        {count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-px h-[2px] bg-gold" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <section className="mt-8 pb-16">
            {renderTabContent(tab, view, segments, t)}
          </section>
        </div>

        {/* Mobile: accordion. Each section is its own row, click to expand.
            Multiple sections can be open simultaneously so the reader can
            keep Summary and Insights both visible while scrolling. */}
        <div className="sm:hidden mt-6 divide-y divide-navy/10 border-y border-navy/10">
          {tabs.map((k) => {
            const isOpen = openSections.has(k);
            const count = countForTab(view, k);
            return (
              <div key={k}>
                <button
                  type="button"
                  onClick={() => toggleSection(k)}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${k}`}
                  className="flex w-full items-center justify-between gap-3 px-1 py-4 text-left transition hover:bg-white/40"
                >
                  <span className="flex items-baseline gap-2.5">
                    <span className={[
                      'font-serif text-base',
                      isOpen ? 'text-navy' : 'text-navy/85',
                    ].join(' ')}>
                      {t.packTabs[k]}
                    </span>
                    {count > 0 && (
                      <span className="font-sans text-[11px] tabular-nums text-graphit/55">
                        {count}
                      </span>
                    )}
                  </span>
                  <span className={[
                    'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200',
                    isOpen ? 'bg-gold/15 text-gold rotate-180' : 'text-graphit/45',
                  ].join(' ')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                      <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div id={`panel-${k}`} className="pb-6 pt-2">
                    {renderTabContent(k, view, segments, t)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback panel — only on real user packs, not samples.
            Lives at the tail of the content so the prompt arrives after
            the reader has actually engaged with the pack. */}
        {!isSample && <PackFeedback pack={pack} />}
      </div>
    </main>
  );
}

/* ─── Language switcher ─────────────────────────────────────────────────
 * Two roles in one panel:
 *   1. Inline switch between already-materialised translations of this
 *      pack — clicking an available language code re-renders the Pack
 *      view in that language instantly (no worker round-trip).
 *   2. "Add a language" — clicking a language not yet in the pack
 *      hops to /new?v=…&lang=…&mode=…&packId=… so the Generator can
 *      merge the new translation into THIS pack instead of creating
 *      a new one. (Sample packs hide this CTA — they're read-only.)
 */

function LanguageSwitcher({
  pack,
  onSwitch,
  hideAddCta,
}: {
  pack: KnowledgePack;
  onSwitch: (lang: Language) => void;
  hideAddCta: boolean;
}) {
  const { locale } = useLocale();
  const available = pack.outputLanguages;
  const missing = TRANSLATABLE_LANGS.filter((l) => !available.includes(l));

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-card border border-navy/10 bg-white/70 px-4 py-2.5">
      {/* Already-materialised translations — instant switch */}
      <span className="font-sans text-[10px] uppercase tracking-widest text-graphit/55">
        {viewInLabel(locale)}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {available.map((l) => {
          const isActive = l === pack.outputLang;
          return (
            <button
              key={l}
              type="button"
              onClick={() => onSwitch(l)}
              aria-pressed={isActive}
              className={[
                'rounded-card border px-2.5 py-1 font-sans text-xs uppercase tracking-widest transition',
                isActive
                  ? 'border-navy bg-navy text-creme'
                  : 'border-navy/15 bg-white text-graphit/70 hover:border-gold hover:text-navy',
              ].join(' ')}
            >
              {l.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* "Add a language" CTAs — generate a new translation that merges
          back into THIS pack via the Generator's packId param. */}
      {!hideAddCta && missing.length > 0 && (
        <>
          <span className="hidden text-navy/20 sm:inline">·</span>
          <span className="font-sans text-[10px] uppercase tracking-widest text-graphit/55">
            {addLanguageLabel(locale)}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((l) => (
              <Link
                key={l}
                to={`/new?v=${pack.source.videoId}&lang=${l}&mode=${pack.mode}&packId=${pack.id}`}
                className="rounded-card border border-dashed border-navy/20 bg-white px-2.5 py-1 font-sans text-xs uppercase tracking-widest text-graphit/55 transition hover:border-gold hover:text-navy"
                title={addLanguageTooltip(locale, l)}
              >
                + {l.toUpperCase()}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function tabsForMode(pack: KnowledgePack, view: PackTranslation): TabKey[] {
  const base: TabKey[] = ['summary'];
  if (view.chapters.length > 0) base.push('chapters');
  base.push('insights');

  if (pack.mode === 'learn') {
    if (view.vocabulary.length > 0) base.push('vocabulary');
    if (view.quiz.length > 0) base.push('quiz');
    if (view.actionPlan.length > 0) base.push('actionPlan');
  }
  if (pack.mode === 'business') {
    if (view.actionPlan.length > 0) base.push('actionPlan');
    if (view.keyQuotes.length > 0) base.push('quotes');
  }
  if (pack.mode === 'creator') {
    if (view.socialAngles.length > 0) base.push('socialAngles');
    if (view.keyQuotes.length > 0) base.push('quotes');
  }

  base.push('transcript');
  return base;
}

function countForTab(view: PackTranslation, k: TabKey): number {
  switch (k) {
    case 'insights': return view.keyIdeas.length;
    case 'actionPlan': return view.actionPlan.length;
    case 'chapters': return view.chapters.length;
    case 'vocabulary': return view.vocabulary.length;
    case 'quiz': return view.quiz.length;
    case 'quotes': return view.keyQuotes.length;
    case 'socialAngles': return view.socialAngles.length;
    default: return 0;
  }
}

/**
 * Surface a real title if one exists; otherwise prefer "Unnamed video"
 * over the leaky "Video <id>" debug-string the worker fallbacks to.
 */
function displayTitle(pack: KnowledgePack): string {
  if (!pack.title) return unnamedLabel('es');
  // Strip the legacy "Video <id>" fallback from the worker.
  if (/^Video [A-Za-z0-9_-]{6,}$/.test(pack.title)) {
    return unnamedLabel('es');
  }
  return pack.title;
}

function unnamedLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Vídeo sin título';
  if (locale.startsWith('pt')) return 'Vídeo sem título';
  if (locale.startsWith('de')) return 'Unbenanntes Video';
  return 'Untitled video';
}

function viewInLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Idioma';
  if (locale.startsWith('pt')) return 'Idioma';
  if (locale.startsWith('de')) return 'Sprache';
  return 'Language';
}

function addLanguageLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Añadir';
  if (locale.startsWith('pt')) return 'Adicionar';
  if (locale.startsWith('de')) return 'Hinzufügen';
  return 'Add';
}

function addLanguageTooltip(locale: string, lang: Language): string {
  if (locale.startsWith('es')) return `Generar traducción al ${lang.toUpperCase()} y añadirla a este Pack`;
  if (locale.startsWith('pt')) return `Gerar tradução para ${lang.toUpperCase()} e adicionar a este Pack`;
  if (locale.startsWith('de')) return `${lang.toUpperCase()}-Übersetzung erzeugen und zu diesem Pack hinzufügen`;
  return `Generate a ${lang.toUpperCase()} translation and add it to this Pack`;
}

function deleteConfirmLabel(locale: string): string {
  if (locale.startsWith('es')) return '¿Eliminar este pack?';
  if (locale.startsWith('pt')) return 'Eliminar este pack?';
  if (locale.startsWith('de')) return 'Diesen Pack löschen?';
  return 'Delete this pack?';
}

/**
 * Pure dispatch for tab content. Shared between the desktop tab view and
 * the mobile accordion so both stay in lockstep — adding a new tab here
 * means it shows up in both layouts without further wiring.
 */
function renderTabContent(
  key: TabKey,
  view: PackTranslation,
  segments: Segment[],
  t: ReturnType<typeof useLocale>['t'],
): React.ReactNode {
  switch (key) {
    case 'summary':
      return <SummaryTab view={view} />;
    case 'chapters':
      return <ListTab items={view.chapters.map((c) => `${formatTime(c.startSec)} · ${c.title}: ${c.summary}`)} />;
    case 'insights':
      return <InsightsTab view={view} />;
    case 'actionPlan':
      return <ListTab items={view.actionPlan} numbered />;
    case 'vocabulary':
      return <VocabularyTab view={view} />;
    case 'quiz':
      return <QuizTab view={view} />;
    case 'quotes':
      return <QuotesTab view={view} />;
    case 'socialAngles':
      return <SocialAnglesTab view={view} />;
    case 'transcript':
      return <TranscriptTab segments={segments} />;
    default:
      void t;
      return null;
  }
}

/* ─── Tabs ────────────────────────────────────────────────────────────── */

function SummaryTab({ view }: { view: PackTranslation }) {
  return (
    <div>
      {view.summary.short && (
        <p className="font-serif text-xl leading-snug text-navy sm:text-2xl">
          {view.summary.short}
        </p>
      )}
      {view.summary.long && (
        <>
          <div className="my-6 h-px w-8 bg-gold/50" aria-hidden />
          <p className="font-sans text-base leading-relaxed text-graphit/85 sm:text-lg">
            {view.summary.long}
          </p>
        </>
      )}
    </div>
  );
}

function InsightsTab({ view }: { view: PackTranslation }) {
  if (view.keyIdeas.length === 0) return <Empty />;
  return (
    <div className="space-y-6">
      {view.keyIdeas.map((idea, i) => (
        <article key={i} className="rounded-card border-l-2 border-gold/50 bg-white p-5 transition-all hover:border-gold hover:shadow-card sm:p-6">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-lg text-gold/55 tabular-nums" aria-hidden>
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="font-serif text-xl leading-tight text-navy sm:text-2xl">{idea.title}</h3>
          </div>
          <p className="mt-3 pl-8 font-sans text-[15px] leading-relaxed text-graphit/85">{idea.body}</p>
        </article>
      ))}
    </div>
  );
}

function ListTab({ items, numbered = false }: { title?: string; items: string[]; numbered?: boolean }) {
  if (items.length === 0) return <Empty />;
  return (
    <ul className="space-y-3">
      {items.map((s, i) => (
        <li key={i} className="flex gap-3 rounded-card border-l-2 border-gold/50 bg-white p-4 sm:p-5">
          {numbered && (
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold font-sans text-[11px] text-gold">
              {i + 1}
            </span>
          )}
          <p className="font-serif text-base leading-snug text-navy sm:text-lg">{s}</p>
        </li>
      ))}
    </ul>
  );
}

function VocabularyTab({ view }: { view: PackTranslation }) {
  if (view.vocabulary.length === 0) return <Empty />;
  return (
    <div className="space-y-4">
      {view.vocabulary.map((v, i) => (
        <div key={i} className="rounded-card border border-navy/10 bg-white p-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-serif text-xl text-navy">{v.word}</span>
            {v.partOfSpeech && (
              <span className="font-sans text-[10px] uppercase tracking-widest text-graphit/45">
                {v.partOfSpeech}
              </span>
            )}
            <span className="text-gold/55">→</span>
            <span className="font-serif italic text-lg text-graphit/85">{v.translation}</span>
          </div>
          {v.context && (
            <p className="mt-2 font-sans text-sm leading-snug text-graphit/65">
              <span className="italic">“{v.context}”</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function QuizTab({ view }: { view: PackTranslation }) {
  if (view.quiz.length === 0) return <Empty />;
  return (
    <ol className="space-y-5">
      {view.quiz.map((q, i) => (
        <QuizItem key={i} q={q} index={i} />
      ))}
    </ol>
  );
}

function QuizItem({ q, index }: { q: PackTranslation['quiz'][number]; index: number }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <li className="rounded-card border-l-2 border-gold/50 bg-white p-5 sm:p-6">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-lg text-gold/55 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
        <p className="font-serif text-lg leading-snug text-navy sm:text-xl">{q.question}</p>
      </div>
      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-4 ml-8 font-sans text-sm text-gold underline-offset-4 hover:underline"
        >
          Ver respuesta →
        </button>
      ) : (
        <div className="mt-4 ml-8 border-l border-gold/40 pl-4">
          <p className="font-serif text-base leading-snug text-navy">{q.answer}</p>
          {q.explanation && (
            <p className="mt-2 font-sans text-sm italic text-graphit/65">{q.explanation}</p>
          )}
        </div>
      )}
    </li>
  );
}

function QuotesTab({ view }: { view: PackTranslation }) {
  if (view.keyQuotes.length === 0) return <Empty />;
  return (
    <div className="space-y-5">
      {view.keyQuotes.map((q, i) => (
        <blockquote key={i} className="border-l-2 border-gold/50 pl-5 sm:pl-6">
          <p className="font-serif text-xl italic leading-snug text-navy sm:text-2xl">“{q.text}”</p>
          {(q.speaker || q.timestampSec) && (
            <footer className="mt-2 font-sans text-[11px] uppercase tracking-widest text-graphit/55">
              {q.speaker && <span>{q.speaker}</span>}
              {q.speaker && q.timestampSec ? ' · ' : ''}
              {q.timestampSec ? <span className="tabular-nums">{formatTime(q.timestampSec)}</span> : null}
            </footer>
          )}
          {q.original && q.original !== q.text && (
            <p className="mt-2 font-sans text-sm italic text-graphit/55">{q.original}</p>
          )}
        </blockquote>
      ))}
    </div>
  );
}

function SocialAnglesTab({ view }: { view: PackTranslation }) {
  if (view.socialAngles.length === 0) return <Empty />;
  return (
    <div className="space-y-5">
      {view.socialAngles.map((s, i) => (
        <div key={i} className="rounded-card border border-navy/10 bg-white p-5 sm:p-6">
          <p className="font-serif text-xl font-medium leading-snug text-navy">“{s.hook}”</p>
          <div className="mt-3 h-px w-6 bg-gold/50" aria-hidden />
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-graphit/80">{s.caption}</p>
        </div>
      ))}
    </div>
  );
}

function TranscriptTab({ segments }: { segments: Segment[] }) {
  if (segments.length === 0) {
    return <p className="font-serif italic text-graphit/55">— —</p>;
  }
  return (
    <div className="space-y-2.5">
      {segments.map((s, i) => (
        <div key={i} className="rounded-card border-l-2 border-navy/15 bg-white/55 px-4 py-3">
          <div className="font-sans text-[10px] uppercase tracking-widest tabular-nums text-graphit/45">
            {formatTime(s.start)}
          </div>
          <p className="mt-1 font-serif text-base leading-snug text-navy">{s.translated ?? s.text}</p>
          {s.translated && s.translated !== s.text && (
            <p className="mt-1 font-sans text-xs leading-snug text-graphit/55">{s.text}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <p className="font-serif italic text-graphit/55">— —</p>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
