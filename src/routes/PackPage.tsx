import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { BrandMark } from '../components/BrandMark';
import { getPack, getTranscript, deletePack, type KnowledgePack, type Segment, type Language } from '../lib/pack';
import { getSamplePack } from '../lib/samplePack';
import { PackAudioPlayer } from '../components/PackAudioPlayer';

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
 * Translate-switcher:
 *   The pack carries exactly one output language. If the user wants
 *   another language, the switcher links to /new with the same video
 *   pre-selected and the new target language + mode pre-filled. The
 *   user confirms with a single click; a new pack is created and
 *   stored in the library alongside the original. No silent re-runs,
 *   no half-translated states.
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

  const tabs: TabKey[] = tabsForMode(pack);
  const isSample = pack.id.startsWith('sample');
  const titleClean = displayTitle(pack);

  async function handleDelete() {
    if (!pack || isSample) return;
    if (!confirm(deleteConfirmLabel(locale))) return;
    await deletePack(pack.id);
    navigate('/library');
  }

  return (
    <main className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
        {/* Back / Delete row */}
        <div className="flex items-baseline justify-between gap-3">
          <Link to="/library" className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline">
            {t.packBackToLibrary}
          </Link>
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

        {/* Source link */}
        <a
          href={pack.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 font-sans text-[12px] text-graphit/55 underline-offset-4 hover:text-navy hover:underline"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          {sourceLinkLabel(locale)} ↗
        </a>

        {/* Translate-to switcher — pragmatic: links to /new with the same video
            pre-selected and the new target language + mode pre-filled. The
            original pack stays untouched in the library. */}
        {!isSample && (
          <TranslateSwitcher pack={pack} />
        )}
      </div>

      {/* Audio companion — non-sticky, in document flow. */}
      {segments.length > 0 && (
        <PackAudioPlayer pack={pack} segments={segments} />
      )}

      <div className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        {/* Tabs — bigger hit area, active state visibly underlined in gold */}
        <nav className="sticky top-[60px] z-10 -mx-5 mt-6 overflow-x-auto border-b border-navy/15 bg-creme/95 px-5 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex min-w-max gap-1">
            {tabs.map((k) => {
              const isActive = k === tab;
              const count = countForTab(pack, k);
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

        {/* Tab content */}
        <section className="mt-8 pb-16">
          {tab === 'summary' && <SummaryTab pack={pack} />}
          {tab === 'chapters' && <ListTab title={t.packTabs.chapters} items={pack.chapters.map((c) => `${formatTime(c.startSec)} · ${c.title}: ${c.summary}`)} />}
          {tab === 'insights' && <InsightsTab pack={pack} />}
          {tab === 'actionPlan' && <ListTab title={t.packTabs.actionPlan} items={pack.actionPlan} numbered />}
          {tab === 'vocabulary' && <VocabularyTab pack={pack} />}
          {tab === 'quiz' && <QuizTab pack={pack} />}
          {tab === 'quotes' && <QuotesTab pack={pack} />}
          {tab === 'socialAngles' && <SocialAnglesTab pack={pack} />}
          {tab === 'transcript' && <TranscriptTab segments={segments} />}
        </section>
      </div>
    </main>
  );
}

/* ─── Translate switcher ───────────────────────────────────────────────── */

function TranslateSwitcher({ pack }: { pack: KnowledgePack }) {
  const { locale } = useLocale();
  const others = TRANSLATABLE_LANGS.filter((l) => l !== pack.outputLang);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 rounded-card border border-navy/10 bg-white/70 px-4 py-2.5">
      <span className="font-sans text-[10px] uppercase tracking-widest text-graphit/55">
        {translateLabel(locale)}
      </span>
      {others.map((l) => (
        <Link
          key={l}
          to={`/new?v=${pack.source.videoId}&lang=${l}&mode=${pack.mode}`}
          className="rounded-card border border-navy/15 bg-white px-2.5 py-1 font-sans text-xs uppercase tracking-widest text-graphit/65 transition hover:border-gold hover:text-navy"
          title={translateTooltip(locale, l)}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

function tabsForMode(pack: KnowledgePack): TabKey[] {
  const base: TabKey[] = ['summary'];
  if (pack.chapters.length > 0) base.push('chapters');
  base.push('insights');

  if (pack.mode === 'learn') {
    if (pack.vocabulary.length > 0) base.push('vocabulary');
    if (pack.quiz.length > 0) base.push('quiz');
    if (pack.actionPlan.length > 0) base.push('actionPlan');
  }
  if (pack.mode === 'business') {
    if (pack.actionPlan.length > 0) base.push('actionPlan');
    if (pack.keyQuotes.length > 0) base.push('quotes');
  }
  if (pack.mode === 'creator') {
    if (pack.socialAngles.length > 0) base.push('socialAngles');
    if (pack.keyQuotes.length > 0) base.push('quotes');
  }

  base.push('transcript');
  return base;
}

function countForTab(pack: KnowledgePack, k: TabKey): number {
  switch (k) {
    case 'insights': return pack.keyIdeas.length;
    case 'actionPlan': return pack.actionPlan.length;
    case 'chapters': return pack.chapters.length;
    case 'vocabulary': return pack.vocabulary.length;
    case 'quiz': return pack.quiz.length;
    case 'quotes': return pack.keyQuotes.length;
    case 'socialAngles': return pack.socialAngles.length;
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

function sourceLinkLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Ver fuente original';
  if (locale.startsWith('pt')) return 'Ver fonte original';
  if (locale.startsWith('de')) return 'Originalquelle ansehen';
  return 'View original source';
}

function translateLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Traducir a';
  if (locale.startsWith('pt')) return 'Traduzir para';
  if (locale.startsWith('de')) return 'Übersetzen nach';
  return 'Translate to';
}

function translateTooltip(locale: string, lang: Language): string {
  if (locale.startsWith('es')) return `Generar Knowledge Pack en ${lang.toUpperCase()} (crea un pack nuevo)`;
  if (locale.startsWith('pt')) return `Gerar Knowledge Pack em ${lang.toUpperCase()} (cria um pack novo)`;
  if (locale.startsWith('de')) return `Knowledge Pack auf ${lang.toUpperCase()} erzeugen (erstellt einen neuen Pack)`;
  return `Generate Knowledge Pack in ${lang.toUpperCase()} (creates a new pack)`;
}

function deleteConfirmLabel(locale: string): string {
  if (locale.startsWith('es')) return '¿Eliminar este pack?';
  if (locale.startsWith('pt')) return 'Eliminar este pack?';
  if (locale.startsWith('de')) return 'Diesen Pack löschen?';
  return 'Delete this pack?';
}

/* ─── Tabs ────────────────────────────────────────────────────────────── */

function SummaryTab({ pack }: { pack: KnowledgePack }) {
  return (
    <div>
      {pack.summary.short && (
        <p className="font-serif text-xl leading-snug text-navy sm:text-2xl">
          {pack.summary.short}
        </p>
      )}
      {pack.summary.long && (
        <>
          <div className="my-6 h-px w-8 bg-gold/50" aria-hidden />
          <p className="font-sans text-base leading-relaxed text-graphit/85 sm:text-lg">
            {pack.summary.long}
          </p>
        </>
      )}
    </div>
  );
}

function InsightsTab({ pack }: { pack: KnowledgePack }) {
  if (pack.keyIdeas.length === 0) return <Empty />;
  return (
    <div className="space-y-6">
      {pack.keyIdeas.map((idea, i) => (
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

function VocabularyTab({ pack }: { pack: KnowledgePack }) {
  if (pack.vocabulary.length === 0) return <Empty />;
  return (
    <div className="space-y-4">
      {pack.vocabulary.map((v, i) => (
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

function QuizTab({ pack }: { pack: KnowledgePack }) {
  if (pack.quiz.length === 0) return <Empty />;
  return (
    <ol className="space-y-5">
      {pack.quiz.map((q, i) => (
        <QuizItem key={i} q={q} index={i} />
      ))}
    </ol>
  );
}

function QuizItem({ q, index }: { q: KnowledgePack['quiz'][number]; index: number }) {
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

function QuotesTab({ pack }: { pack: KnowledgePack }) {
  if (pack.keyQuotes.length === 0) return <Empty />;
  return (
    <div className="space-y-5">
      {pack.keyQuotes.map((q, i) => (
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

function SocialAnglesTab({ pack }: { pack: KnowledgePack }) {
  if (pack.socialAngles.length === 0) return <Empty />;
  return (
    <div className="space-y-5">
      {pack.socialAngles.map((s, i) => (
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
