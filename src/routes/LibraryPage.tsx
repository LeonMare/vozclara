import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { BrandMark } from '../components/BrandMark';
import { AskPanel } from '../components/AskPanel';
import {
  listPacks,
  libraryStats,
  filterPacks,
  tagCounts,
  getBrainId,
  activeView,
  type KnowledgePack,
  type Mode,
  type Language,
  type LibraryStats,
} from '../lib/pack';

/**
 * /library — your saved Knowledge Packs.
 *
 * Stats line on top: total packs, total ideas, languages, this week.
 * Search + three filters (Mode, Language, Date). Grid of pack cards.
 * Empty state with single CTA.
 */
export function LibraryPage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [packs, setPacks] = useState<KnowledgePack[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode | 'all'>('all');
  const [language, setLanguage] = useState<Language | 'all'>('all');
  const [sinceDays, setSinceDays] = useState<number | undefined>(undefined);
  const [activeTags, setActiveTags] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const brainId = getBrainId();
    Promise.all([listPacks(brainId), libraryStats(brainId)]).then(([p, s]) => {
      setPacks(p);
      setStats(s);
    });
  }, []);

  // Aggregate the top tags across the user's library. Show up to 10
  // chips so the filter row stays compact.
  const tags = useMemo(() => tagCounts(packs).slice(0, 10), [packs]);

  const filtered = useMemo(
    () => filterPacks(packs, { query, mode, language, sinceDays, tags: activeTags }),
    [packs, query, mode, language, sinceDays, activeTags],
  );

  function toggleTag(t: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  if (packs.length === 0 && stats) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-24">
          <BrandMark variant="monogram" size="xl" tone="gold" decorative />
          <h1 className="mt-8 font-serif text-3xl text-navy sm:text-4xl">
            {t.libraryEmptyTitle}
          </h1>
          <div className="mx-auto mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-graphit/75">
            {t.libraryEmptyBody}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/new"
              className="rounded-card bg-navy px-6 py-3.5 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
            >
              {t.libraryEmptyCTA}
            </Link>
            <Link
              to="/pack/sample"
              className="font-sans text-sm italic text-graphit/60 underline-offset-4 transition hover:text-gold hover:underline"
            >
              {t.trySamplePack}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-creme paper">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Stats line */}
        {stats && stats.totalPacks > 0 && (
          <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-navy/10 pb-4">
            <p className="font-serif italic text-graphit/70 sm:text-lg">
              {t.libraryStats(
                { packs: stats.totalPacks, ideas: stats.totalIdeas, langs: stats.totalLangs, thisWeek: stats.thisWeek },
              )}
            </p>
            <Link
              to="/new"
              className="shrink-0 rounded-card border border-navy/20 bg-white px-4 py-2 font-sans text-sm text-navy transition hover:border-gold"
            >
              + {t.navNew}
            </Link>
          </div>
        )}

        {/* Ask My Knowledge — cross-pack Q&A. Sits above search/filter
            so the user sees the headline capability first. */}
        {packs.length > 0 && (
          <div className="mb-8">
            <AskPanel packs={packs} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="search"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-card border border-navy/15 bg-white px-4 py-2.5 font-sans text-sm text-graphit placeholder-graphit/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
          <FilterPill label={t.filterMode} options={[['all', t.filterAll], ['learn', 'Learn'], ['business', 'Business'], ['creator', 'Creator']]} value={mode} onChange={(v) => setMode(v as Mode | 'all')} />
          <FilterPill label={t.filterLang} options={[['all', t.filterAll], ['es', 'ES'], ['en', 'EN'], ['de', 'DE'], ['pt', 'PT']]} value={language} onChange={(v) => setLanguage(v as Language | 'all')} />
          <FilterPill label={t.filterDate} options={[['', t.filterDateAll], ['7', t.filterDate7], ['30', t.filterDate30]]} value={sinceDays?.toString() ?? ''} onChange={(v) => setSinceDays(v ? Number(v) : undefined)} />
        </div>

        {/* Tag filter chips — derived from pack.tags across the library.
            Multi-select with OR semantics: clicking more tags broadens
            the result. Click the same chip again to remove it. Only
            shown when the library has at least one tagged pack. */}
        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-sans text-[10px] uppercase tracking-widest text-graphit/55">
              {tagFilterLabel(locale)}
            </span>
            {tags.map(({ tag, count }) => {
              const active = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  className={[
                    'inline-flex items-baseline gap-1.5 rounded-card border px-2.5 py-1 font-sans text-xs transition',
                    active
                      ? 'border-gold bg-gold/15 text-navy'
                      : 'border-navy/15 bg-white text-graphit/65 hover:border-gold hover:text-navy',
                  ].join(' ')}
                >
                  <span>{tag}</span>
                  <span className="text-[10px] tabular-nums text-graphit/45">{count}</span>
                </button>
              );
            })}
            {activeTags.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveTags(new Set())}
                className="ml-2 font-sans text-[11px] text-graphit/55 underline-offset-4 hover:text-navy hover:underline"
              >
                {clearTagsLabel(locale)}
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center font-serif italic text-graphit/55">— —</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const view = activeView(p);
              return (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(`/pack/${p.id}`)}
                className="card-hover group flex flex-col overflow-hidden rounded-card border border-navy/10 bg-white text-left transition"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-navy">
                  {p.source.thumbnailUrl && (
                    <img
                      src={p.source.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />
                  )}
                  {/* Mode badge overlay */}
                  <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest text-gold backdrop-blur-sm">
                    {t.modes[p.mode].name}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-creme/90 px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest tabular-nums text-graphit/70 backdrop-blur-sm">
                    {p.outputLanguages.length > 1
                      ? `${p.outputLang.toUpperCase()} +${p.outputLanguages.length - 1}`
                      : p.outputLang.toUpperCase()}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-base leading-snug text-navy sm:text-lg">
                    {p.title}
                  </h3>
                  {view.summary.short && (
                    <p className="mt-2 font-sans text-[13px] leading-snug text-graphit/65 line-clamp-2">
                      {view.summary.short}
                    </p>
                  )}

                  <div className="mt-3 h-px w-6 bg-gold/50" aria-hidden />

                  {/* Meta row: idea count + date + genre */}
                  <div className="mt-3 flex items-baseline justify-between gap-2 font-sans text-[11px] text-graphit/55">
                    <span className="inline-flex items-baseline gap-1 tabular-nums">
                      <span className="font-medium text-navy">{view.keyIdeas.length}</span>
                      <span className="text-graphit/45">·</span>
                      <span className="italic">{t.genreNames[p.genre] ?? p.genre}</span>
                    </span>
                    <span className="tabular-nums text-graphit/45">
                      {new Date(p.createdAt).toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterPill({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<[string, string]>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-card border border-navy/15 bg-white px-3 py-2 font-sans text-xs text-graphit/70">
      <span className="uppercase tracking-widest text-[10px] text-graphit/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-sans text-sm text-navy outline-none"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

function tagFilterLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Etiquetas';
  if (locale.startsWith('pt')) return 'Etiquetas';
  if (locale.startsWith('de')) return 'Tags';
  return 'Tags';
}

function clearTagsLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Limpiar';
  if (locale.startsWith('pt')) return 'Limpar';
  if (locale.startsWith('de')) return 'Zurücksetzen';
  return 'Clear';
}
