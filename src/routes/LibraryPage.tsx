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
  deletePack,
  type KnowledgePack,
  type Mode,
  type Language,
  type LibraryStats,
} from '../lib/pack';
import { getRecentlyViewed, forgetView } from '../lib/recentlyViewed';
import { deindexPack, ensureLibraryIndexed } from '../lib/packIndex';
import { dueSummary, syncCardsFromLibrary, type DueSummary } from '../lib/srs';
import { getCurated, type CuratedItem } from '../lib/curated';
import { CuratedSection } from '../components/CuratedSection';
import { getSamplePack } from '../lib/samplePack';
import { usePageHead } from '../hooks/usePageHead';
import { useAuth } from '../hooks/useAuth';
import { fetchAggregatesBulk, averageStars, approvalPercent, type RatingAggregate } from '../lib/rating';

/**
 * /library — your saved Knowledge Packs.
 *
 * Stats line on top: total packs, total ideas, languages, this week.
 * Search + three filters (Mode, Language, Date). Grid of pack cards.
 * Empty state with single CTA.
 */
export function LibraryPage() {
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packs, setPacks] = useState<KnowledgePack[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  /** videoId → aggregate. Populated in a single bulk request after
   *  pack list loads so cards can show a Michelin-rating badge. */
  const [ratings, setRatings] = useState<Record<string, RatingAggregate>>({});

  usePageHead({
    title: libraryTitle(locale),
    description: libraryDescription(locale),
  });

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode | 'all'>('all');
  const [language, setLanguage] = useState<Language | 'all'>('all');
  const [sinceDays, setSinceDays] = useState<number | undefined>(undefined);
  /** Sort order — recent (default) or by Michelin rating quality. */
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  const [activeTags, setActiveTags] = useState<Set<string>>(() => new Set());
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [due, setDue] = useState<DueSummary | null>(null);
  const [curated, setCurated] = useState<CuratedItem[]>([]);

  // Bulk-select mode: toggled by the "Select" button in the stats row.
  // selectedIds tracks which packs the user has ticked while in mode.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }
  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(bulkDeleteConfirm(locale, selectedIds.size))) return;
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => deletePack(id)));
    ids.forEach((id) => forgetView(id));
    ids.forEach((id) => { void deindexPack(id); });
    // Refresh local state without round-tripping a listPacks again.
    setPacks((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setRecentIds((prev) => prev.filter((id) => !selectedIds.has(id)));
    exitSelectMode();
  }

  useEffect(() => {
    const brainId = getBrainId();
    Promise.all([listPacks(brainId), libraryStats(brainId)]).then(([p, s]) => {
      setPacks(p);
      setStats(s);
      // Bulk-fetch rating aggregates for every pack so cards can show
      // a Michelin-rating badge without N round trips. Best-effort:
      // a failure leaves the map empty and cards render without badge.
      const ids = Array.from(new Set(p.map((pk) => pk.source.videoId).filter(Boolean)));
      void fetchAggregatesBulk(ids).then(setRatings);
    });
    setRecentIds(getRecentlyViewed());
    // Background back-fill: any pack saved before Vectorize was available
    // gets indexed now so it becomes findable via Ask My Knowledge.
    void ensureLibraryIndexed(brainId);
    // Sync vocabulary → SRS cards, then count what's due today.
    void (async () => {
      await syncCardsFromLibrary(brainId);
      setDue(await dueSummary(brainId));
    })();
    // Fetch curated packs (cached) to render the Featured section.
    void (async () => {
      setCurated(await getCurated());
    })();
  }, []);

  // Resolve recently-viewed pack IDs against the user's library + the
  // built-in samples. Order is preserved (most recent first). Drop
  // entries we can't resolve any more (deleted packs).
  const recentPacks = useMemo<KnowledgePack[]>(() => {
    if (recentIds.length === 0) return [];
    return recentIds
      .map((rid) => packs.find((p) => p.id === rid) ?? getSamplePack(rid))
      .filter((p): p is KnowledgePack => !!p)
      .slice(0, 5);
  }, [recentIds, packs]);

  // Aggregate the top tags across the user's library. Show up to 10
  // chips so the filter row stays compact.
  const tags = useMemo(() => tagCounts(packs).slice(0, 10), [packs]);

  const filtered = useMemo(
    () => {
      const base = filterPacks(packs, { query, mode, language, sinceDays, tags: activeTags });
      if (sortBy !== 'rating') return base;
      // Sort by rating quality (Wilson-style approximation: approval%
      // weighted by trust threshold). Unrated packs sink to the end
      // but keep their createdAt order so the list is still readable.
      return [...base].sort((a, b) => {
        const ar = ratings[a.source.videoId];
        const br = ratings[b.source.videoId];
        const aScore = scoreForSort(ar);
        const bScore = scoreForSort(br);
        if (aScore !== bScore) return bScore - aScore;
        return b.createdAt - a.createdAt;
      });
    },
    [packs, ratings, query, mode, language, sinceDays, activeTags, sortBy],
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
      <main id="main" className="bg-creme paper">
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

          {curated.length > 0 && (
            <CuratedSection items={curated} locale={locale} variant="empty" />
          )}
        </div>
      </main>
    );
  }

  const reviewBannerCount = (due?.due ?? 0) + (due?.fresh ?? 0);

  return (
    <main className="bg-creme paper">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {curated.length > 0 && !selectMode && (
          <CuratedSection items={curated} locale={locale} variant="header" />
        )}

        {/* Account-link banner — surfaces the user's sign-in state
            without pressuring anonymous visitors. Two flavours:
              • signed-in with one device: quiet "connected" badge
              • signed-in with multiple devices: same chip + soft
                "cross-device sync arrives with Pro" hint */}
        {user && !selectMode && (
          <AccountSyncBanner email={user.email} brainIds={user.brainIds} locale={locale} />
        )}

        {/* Review banner — surfaces SRS due-today count and routes to
            the daily review session. Hidden when nothing is due. */}
        {!selectMode && reviewBannerCount > 0 && (
          <Link
            to="/review"
            className="mb-6 flex items-center justify-between gap-3 rounded-card border border-gold/40 bg-gold/10 px-5 py-4 text-navy transition hover:bg-gold/20"
          >
            <span className="flex items-baseline gap-3">
              <span className="font-serif text-2xl">{reviewBannerCount}</span>
              <span className="font-sans text-sm">{reviewBannerLabel(locale, due!)}</span>
            </span>
            <span className="font-sans text-sm font-medium text-navy">
              {reviewStartLabel(locale)} →
            </span>
          </Link>
        )}

        {/* Stats line — switches to a "X selected" summary when bulk-
            select mode is active. */}
        {stats && stats.totalPacks > 0 && (
          <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-navy/10 pb-4">
            {selectMode ? (
              <p className="font-serif italic text-graphit/70 sm:text-lg">
                {selectedSummary(locale, selectedIds.size)}
              </p>
            ) : (
              <p className="font-serif italic text-graphit/70 sm:text-lg">
                {t.libraryStats(
                  { packs: stats.totalPacks, ideas: stats.totalIdeas, langs: stats.totalLangs, thisWeek: stats.thisWeek },
                )}
              </p>
            )}
            <div className="flex shrink-0 items-center gap-2">
              {!selectMode && (
                <Link
                  to="/progress"
                  className="rounded-card border border-navy/20 bg-white px-3 py-2 font-sans text-xs text-graphit/65 transition hover:border-gold hover:text-navy"
                >
                  {progressLinkLabel(locale)}
                </Link>
              )}
              {!selectMode && (
                <button
                  type="button"
                  onClick={() => setSelectMode(true)}
                  className="rounded-card border border-navy/20 bg-white px-3 py-2 font-sans text-xs text-graphit/65 transition hover:border-gold hover:text-navy"
                >
                  {selectModeLabel(locale)}
                </button>
              )}
              {selectMode ? (
                <button
                  type="button"
                  onClick={exitSelectMode}
                  className="rounded-card border border-navy/20 bg-white px-3 py-2 font-sans text-xs text-graphit/65 transition hover:border-gold hover:text-navy"
                >
                  {cancelLabel(locale)}
                </button>
              ) : (
                <Link
                  to="/new"
                  className="rounded-card border border-navy/20 bg-white px-4 py-2 font-sans text-sm text-navy transition hover:border-gold"
                >
                  + {t.navNew}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Recently viewed — horizontal compact-card row. Hidden when
            the user has never opened a pack. Each card is a quick way
            back into what they were just reading. */}
        {recentPacks.length > 1 && (
          <div className="mb-6">
            <div className="mb-2 font-sans text-[10px] uppercase tracking-widest text-graphit/55">
              {recentlyViewedLabel(locale)}
            </div>
            <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-1">
              {recentPacks.map((p) => (
                <Link
                  key={p.id}
                  to={`/pack/${p.id}`}
                  className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-card border border-navy/10 bg-white transition hover:border-gold sm:w-52"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-navy">
                    {p.source.thumbnailUrl && (
                      <img
                        src={p.source.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                      />
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-navy/90 px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-widest text-gold backdrop-blur-sm">
                      {t.modes[p.mode]?.name ?? p.mode}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 font-serif text-[13px] leading-snug text-navy sm:text-sm">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
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
          <FilterPill label={t.filterMode} options={[['all', t.filterAll], ['learn', 'Learn'], ['brief', 'Briefing'], ['study', 'Study'], ['creator', 'Creator']]} value={mode} onChange={(v) => setMode(v as Mode | 'all')} />
          <FilterPill label={t.filterLang} options={[['all', t.filterAll], ['es', 'ES'], ['en', 'EN'], ['de', 'DE'], ['pt', 'PT']]} value={language} onChange={(v) => setLanguage(v as Language | 'all')} />
          <FilterPill label={t.filterDate} options={[['', t.filterDateAll], ['7', t.filterDate7], ['30', t.filterDate30]]} value={sinceDays?.toString() ?? ''} onChange={(v) => setSinceDays(v ? Number(v) : undefined)} />
          <FilterPill
            label={sortLabel(locale)}
            options={[['recent', sortOption(locale, 'recent')], ['rating', sortOption(locale, 'rating')]]}
            value={sortBy}
            onChange={(v) => setSortBy(v as 'recent' | 'rating')}
          />
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
              const selected = selectedIds.has(p.id);
              return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (selectMode) toggleSelected(p.id);
                  else navigate(`/pack/${p.id}`);
                }}
                aria-pressed={selectMode ? selected : undefined}
                className={[
                  'card-hover group flex flex-col overflow-hidden rounded-card border bg-white text-left transition',
                  selected ? 'border-gold ring-2 ring-gold/40' : 'border-navy/10',
                ].join(' ')}
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
                    {t.modes[p.mode]?.name ?? p.mode}
                  </span>
                  {/* Difficulty badge — only when the pack carries one */}
                  {p.difficulty && (
                    <span
                      className="absolute left-3 bottom-3 rounded-full bg-creme/95 px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest tabular-nums text-gold backdrop-blur-sm"
                      title={`CEFR ${p.difficulty}`}
                    >
                      {p.difficulty}
                    </span>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-creme/90 px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest tabular-nums text-graphit/70 backdrop-blur-sm">
                    {p.outputLanguages.length > 1
                      ? `${p.outputLang.toUpperCase()} +${p.outputLanguages.length - 1}`
                      : p.outputLang.toUpperCase()}
                  </span>
                  {/* Select-mode checkbox overlay */}
                  {selectMode && (
                    <span
                      aria-hidden
                      className={[
                        'absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 backdrop-blur-sm transition',
                        selected
                          ? 'border-gold bg-gold text-navy'
                          : 'border-creme/80 bg-navy/40 text-creme/80',
                      ].join(' ')}
                    >
                      {selected ? (
                        <svg width="14" height="14" viewBox="0 0 14 14">
                          <path d="M3 7.5 L6 10 L11 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-base leading-snug text-navy sm:text-lg">
                    {p.title}
                  </h3>
                  {(view.tldr || view.summary.short) && (
                    <p className="mt-2 font-sans text-[13px] leading-snug text-graphit/65 line-clamp-2">
                      {view.tldr ?? view.summary.short}
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

                  {/* Rating badge — only renders past the 3-vote trust
                      threshold so a single 👍 doesn't make every freshly-
                      generated card show "100 %". */}
                  <RatingBadge agg={ratings[p.source.videoId]} />
                </div>
              </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed bottom action bar — only mounted when bulk-select mode
          is active. Lifts above the page on mobile + desktop alike. */}
      {selectMode && (
        <div
          role="region"
          aria-label={bulkActionsLabel(locale)}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-navy/15 bg-creme/95 px-5 pt-3 backdrop-blur sm:px-8"
          style={{
            boxShadow: '0 -8px 24px rgba(10, 26, 58, 0.10)',
            paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
          }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <p className="font-serif italic text-graphit/70 sm:text-base">
              {selectedSummary(locale, selectedIds.size)}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exitSelectMode}
                className="rounded-card border border-navy/15 bg-white px-3 py-2 font-sans text-sm text-graphit/65 transition hover:border-gold hover:text-navy"
              >
                {cancelLabel(locale)}
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className={[
                  'rounded-card px-4 py-2 font-sans text-sm font-medium transition',
                  selectedIds.size === 0
                    ? 'cursor-not-allowed bg-navy/40 text-creme/70'
                    : 'bg-red-700 text-creme hover:bg-red-800',
                ].join(' ')}
              >
                {deleteLabel(locale, selectedIds.size)}
              </button>
            </div>
          </div>
        </div>
      )}
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

function recentlyViewedLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Vistos recientemente';
  if (locale.startsWith('pt')) return 'Vistos recentemente';
  if (locale.startsWith('de')) return 'Zuletzt angesehen';
  return 'Recently viewed';
}

function libraryTitle(locale: string): string {
  if (locale.startsWith('es')) return 'Tu biblioteca';
  if (locale.startsWith('pt')) return 'A tua biblioteca';
  if (locale.startsWith('de')) return 'Deine Bibliothek';
  return 'Your library';
}

function libraryDescription(locale: string): string {
  if (locale.startsWith('es')) return 'Tu nube privada de conocimiento. Pregunta, filtra y exporta los Knowledge Packs que has guardado.';
  if (locale.startsWith('pt')) return 'A tua nuvem privada de conhecimento. Pergunta, filtra e exporta os Knowledge Packs que guardaste.';
  if (locale.startsWith('de')) return 'Deine private Wissens-Cloud. Frage, filtere und exportiere die Knowledge Packs die du gespeichert hast.';
  return 'Your private knowledge cloud. Ask, filter, and export the Knowledge Packs you have saved.';
}

function selectModeLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Seleccionar';
  if (locale.startsWith('pt')) return 'Selecionar';
  if (locale.startsWith('de')) return 'Auswählen';
  return 'Select';
}

function cancelLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Cancelar';
  if (locale.startsWith('pt')) return 'Cancelar';
  if (locale.startsWith('de')) return 'Abbrechen';
  return 'Cancel';
}

function bulkActionsLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Acciones en lote';
  if (locale.startsWith('pt')) return 'Ações em lote';
  if (locale.startsWith('de')) return 'Bulk-Aktionen';
  return 'Bulk actions';
}

function selectedSummary(locale: string, n: number): string {
  if (locale.startsWith('es')) return n === 0 ? 'Ningún pack seleccionado' : n === 1 ? '1 pack seleccionado' : `${n} packs seleccionados`;
  if (locale.startsWith('pt')) return n === 0 ? 'Nenhum pack selecionado' : n === 1 ? '1 pack selecionado' : `${n} packs selecionados`;
  if (locale.startsWith('de')) return n === 0 ? 'Kein Pack ausgewählt' : n === 1 ? '1 Pack ausgewählt' : `${n} Packs ausgewählt`;
  return n === 0 ? 'No packs selected' : n === 1 ? '1 pack selected' : `${n} packs selected`;
}

function deleteLabel(locale: string, n: number): string {
  if (locale.startsWith('es')) return n > 0 ? `Eliminar ${n}` : 'Eliminar';
  if (locale.startsWith('pt')) return n > 0 ? `Eliminar ${n}` : 'Eliminar';
  if (locale.startsWith('de')) return n > 0 ? `${n} löschen` : 'Löschen';
  return n > 0 ? `Delete ${n}` : 'Delete';
}

function bulkDeleteConfirm(locale: string, n: number): string {
  if (locale.startsWith('es')) return `¿Eliminar ${n} pack${n === 1 ? '' : 's'}? No se puede deshacer.`;
  if (locale.startsWith('pt')) return `Eliminar ${n} pack${n === 1 ? '' : 's'}? Não se pode desfazer.`;
  if (locale.startsWith('de')) return `${n} Pack${n === 1 ? '' : 's'} löschen? Kann nicht rückgängig gemacht werden.`;
  return `Delete ${n} pack${n === 1 ? '' : 's'}? This cannot be undone.`;
}

function clearTagsLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Limpiar';
  if (locale.startsWith('pt')) return 'Limpar';
  if (locale.startsWith('de')) return 'Zurücksetzen';
  return 'Clear';
}

/**
 * Subtitle for the review banner. The big number on the left already
 * shows the total — this line breaks it down by type without
 * duplicating the count, except when there are both types in the
 * queue (then we show the split so the user knows it's a mix).
 */
function reviewBannerLabel(locale: string, due: DueSummary): string {
  const mix = due.due > 0 && due.fresh > 0;
  if (locale.startsWith('es')) {
    if (mix) return `${due.due} para repasar · ${due.fresh} ${due.fresh === 1 ? 'palabra nueva' : 'nuevas'}`;
    if (due.due > 0) return due.due === 1 ? 'tarjeta para repasar' : 'tarjetas para repasar';
    if (due.fresh > 0) return due.fresh === 1 ? 'palabra nueva por aprender' : 'palabras nuevas por aprender';
    return 'nada pendiente';
  }
  if (locale.startsWith('pt')) {
    if (mix) return `${due.due} para rever · ${due.fresh} ${due.fresh === 1 ? 'palavra nova' : 'novas'}`;
    if (due.due > 0) return due.due === 1 ? 'cartão para rever' : 'cartões para rever';
    if (due.fresh > 0) return due.fresh === 1 ? 'palavra nova para aprender' : 'palavras novas para aprender';
    return 'nada pendente';
  }
  if (locale.startsWith('de')) {
    if (mix) return `${due.due} zu wiederholen · ${due.fresh} ${due.fresh === 1 ? 'neues Wort' : 'neue'}`;
    if (due.due > 0) return due.due === 1 ? 'Karte zu wiederholen' : 'Karten zu wiederholen';
    if (due.fresh > 0) return due.fresh === 1 ? 'neues Wort zu lernen' : 'neue Wörter zu lernen';
    return 'nichts offen';
  }
  if (mix) return `${due.due} due · ${due.fresh} new`;
  if (due.due > 0) return due.due === 1 ? 'card due for review' : 'cards due for review';
  if (due.fresh > 0) return due.fresh === 1 ? 'new word to learn' : 'new words to learn';
  return 'nothing due';
}

function reviewStartLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Empezar repaso';
  if (locale.startsWith('pt')) return 'Começar revisão';
  if (locale.startsWith('de')) return 'Wiederholung starten';
  return 'Start review';
}

function progressLinkLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Progreso';
  if (locale.startsWith('pt')) return 'Progresso';
  if (locale.startsWith('de')) return 'Fortschritt';
  return 'Progress';
}

/**
 * Sort-quality score for a Pack's video. Approximates Wilson-score
 * sort order without the cost of computing it client-side for every
 * comparison — uses approval × log(1 + total votes) so a 95/100 ranks
 * above a 5/5 (small-N inflation suppressed), and packs the server
 * hasn't rated yet sink to -1 (sorted to bottom).
 */
function scoreForSort(agg: RatingAggregate | undefined): number {
  if (!agg) return -1;
  const total = agg.up + agg.down;
  if (total < 1) return -1;
  const approval = agg.up / total;
  return approval * Math.log(1 + total);
}

function sortLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Orden';
  if (locale.startsWith('pt')) return 'Ordem';
  if (locale.startsWith('de')) return 'Sortierung';
  return 'Sort';
}

function sortOption(locale: string, key: 'recent' | 'rating'): string {
  if (locale.startsWith('es')) return key === 'recent' ? 'Recientes' : 'Valoración';
  if (locale.startsWith('pt')) return key === 'recent' ? 'Recentes' : 'Avaliação';
  if (locale.startsWith('de')) return key === 'recent' ? 'Neueste' : 'Bewertung';
  return key === 'recent' ? 'Recent' : 'Rating';
}

/* ─── Pack-card rating badge ─────────────────────────────────────── *
 *
 * Sub-component on the library card. Renders only when the
 * aggregate exists AND has ≥3 thumb votes — single-vote items
 * shouldn't ride into the card list as "100 % approved".
 *
 * Layout: gold dot + approval percent + thumbs total · ★ + avg + count
 * The dot doubles as a discrete "community-rated" marker — the user
 * recognises rated packs without needing to read the row.
 */

function RatingBadge({ agg }: { agg: RatingAggregate | undefined }) {
  if (!agg) return null;
  const approval = approvalPercent(agg);
  if (approval === null) return null;
  const stars = averageStars(agg);
  const total = agg.up + agg.down;

  return (
    <div className="mt-3 flex items-baseline gap-3 border-t border-navy/8 pt-3 font-sans text-[11px] text-graphit/65">
      <span className="inline-flex items-baseline gap-1.5">
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="font-medium text-navy tabular-nums">{approval}%</span>
        <span className="text-graphit/40 tabular-nums">· {total}</span>
      </span>
      {stars !== null && (
        <span className="inline-flex items-baseline gap-1 tabular-nums">
          <span className="text-gold">★</span>
          <span className="text-navy">{stars.toFixed(1)}</span>
          <span className="text-graphit/40">· {agg.starCount}</span>
        </span>
      )}
    </div>
  );
}

/* ─── Account sync status banner ─────────────────────────────────── *
 *
 * Sits at the top of the library when the user is signed-in. Quiet
 * by design — no exclamation marks, no upsell pressure. Two states:
 *
 *   1 device known  → "Connected as <email>" + dot
 *   2+ devices      → same chip + a soft secondary line indicating
 *                     that cross-device library sync is a Pro feature
 *                     coming later. We don't promise a date because
 *                     LAUNCH_PLAN §7 deliberately keeps that one in
 *                     the Pro tier and we don't want to over-commit.
 */

function AccountSyncBanner({
  email,
  brainIds,
  locale,
}: {
  email: string;
  brainIds: string[];
  locale: string;
}) {
  const labels = syncBannerLabels(locale);
  const multiDevice = brainIds.length > 1;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-card border border-navy/10 bg-white px-4 py-3 sm:px-5">
      <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[13px] leading-snug text-navy">
          {labels.connectedAs}{' '}
          <span className="font-medium break-all">{email}</span>
        </p>
        {multiDevice && (
          <p className="mt-0.5 font-sans text-[12px] leading-snug italic text-graphit/60">
            {labels.multiDeviceHint(brainIds.length)}
          </p>
        )}
      </div>
    </div>
  );
}

function syncBannerLabels(locale: string) {
  if (locale.startsWith('es')) return {
    connectedAs: 'Conectado como',
    multiDeviceHint: (n: number) =>
      `${n} dispositivos vinculados. La biblioteca de este dispositivo es local — la sincronización entre dispositivos llega con Pro.`,
  };
  if (locale.startsWith('pt')) return {
    connectedAs: 'Ligado como',
    multiDeviceHint: (n: number) =>
      `${n} dispositivos vinculados. A biblioteca deste dispositivo é local — a sincronização entre dispositivos chega com o Pro.`,
  };
  if (locale.startsWith('de')) return {
    connectedAs: 'Angemeldet als',
    multiDeviceHint: (n: number) =>
      `${n} Geräte verknüpft. Die Bibliothek dieses Geräts liegt lokal — geräteübergreifende Synchronisation kommt mit Pro.`,
  };
  return {
    connectedAs: 'Connected as',
    multiDeviceHint: (n: number) =>
      `${n} devices linked. This device's library lives locally — cross-device sync arrives with Pro.`,
  };
}
