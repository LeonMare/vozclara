import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import {
  fetchTopRated,
  averageStars,
  approvalPercent,
  type RatingAggregate,
  type TopSince,
} from '../lib/rating';
import { BrandMark } from '../components/BrandMark';

/**
 * /discover — the Michelin Guide page.
 *
 * Surfaces the highest-quality videos by Wilson-score lower bound,
 * which is what makes this page meaningfully different from "all
 * recently rated": a 4/4 👍 doesn't beat a 95/100 👍 because the
 * small sample is less trustworthy. That ranking is the editorial
 * promise — we don't surface flukes.
 *
 * Each row links to the Generator pre-filled so the visitor can
 * produce a Pack in their own mode + locale on the spot. That's the
 * activation hook: come for the rating, leave with a Pack.
 */
export function DiscoverPage() {
  const { locale } = useLocale();
  const labels = discoverLabels(locale);
  const [since, setSince] = useState<TopSince>('all');
  const [items, setItems] = useState<RatingAggregate[] | null>(null);

  usePageHead({ title: labels.headTitle, description: labels.headDescription });

  // Re-fetch whenever the time-window pill changes. The list resets
  // to null first so the skeleton re-appears — better than flashing
  // stale content from the previous window for a beat.
  useEffect(() => {
    let cancelled = false;
    setItems(null);
    void fetchTopRated(30, since).then((list) => {
      if (!cancelled) setItems(list);
    });
    return () => {
      cancelled = true;
    };
  }, [since]);

  return (
    <main id="main" className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8 sm:pt-8">
        <Link
          to="/"
          className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
        >
          ← {labels.backHome}
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14">
        <div className="text-center sm:text-left">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.eyebrow}
          </div>
          <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
            {labels.heroTitle}
          </h1>
          <div className="mt-6 h-px w-16 bg-gold" aria-hidden />
          <p className="mt-6 font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
            {labels.heroLead}
          </p>
        </div>
      </section>

      {/* Time-window pills + list */}
      <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-8 sm:pb-28">
        <SincePills value={since} onChange={setSince} locale={locale} />

        {items === null ? (
          <DiscoverSkeleton />
        ) : items.length === 0 ? (
          <EmptyState labels={labels} since={since} />
        ) : (
          <ol className="space-y-3">
            {items.map((agg, i) => (
              <DiscoverRow key={agg.videoId} rank={i + 1} agg={agg} labels={labels} />
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

/* ─── Row ────────────────────────────────────────────────────────── */

function DiscoverRow({
  rank,
  agg,
  labels,
}: {
  rank: number;
  agg: RatingAggregate;
  labels: ReturnType<typeof discoverLabels>;
}) {
  const stars = averageStars(agg);
  const approval = approvalPercent(agg);
  const total = agg.up + agg.down;
  const title = agg.videoTitle ?? labels.untitled;

  // Top signal helps the row tell a story at a glance — surfaces the
  // one signal voters tapped most.
  const topSignal = pickTopSignal(agg);

  return (
    <li>
      <Link
        to={`/new?v=${encodeURIComponent(agg.videoId)}`}
        className="group flex flex-col gap-3 rounded-card border border-navy/10 bg-white p-4 transition hover:border-gold sm:flex-row sm:items-start sm:gap-5 sm:p-5"
      >
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl text-gold tabular-nums">
            {String(rank).padStart(2, '0')}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-lg leading-snug text-navy sm:text-xl">
            {title}
          </h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-sans text-[12px] text-graphit/65">
            {approval !== null && (
              <span>
                <span className="font-medium text-navy">{approval}%</span> {labels.approvalSuffix}
              </span>
            )}
            <span>
              {total} {total === 1 ? labels.voteSingular : labels.votePlural}
            </span>
            {stars !== null && (
              <span>
                <span className="text-gold">★</span> {stars.toFixed(1)}{' '}
                <span className="text-graphit/65">· {agg.starCount}</span>
              </span>
            )}
            {topSignal && (
              <span className="italic text-graphit/60">
                · {topSignal.emoji} {labels.signalLabel(topSignal.key)} ×{topSignal.count}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center font-sans text-xs text-graphit/65 transition group-hover:text-navy sm:self-center">
          {labels.openCta} →
        </div>
      </Link>
    </li>
  );
}

function pickTopSignal(agg: RatingAggregate): { key: keyof RatingAggregate['signals']; emoji: string; count: number } | null {
  const entries: Array<{ key: keyof RatingAggregate['signals']; emoji: string; count: number }> = [
    { key: 'mindBlowing', emoji: '💡', count: agg.signals.mindBlowing },
    { key: 'confusing', emoji: '🤔', count: agg.signals.confusing },
    { key: 'misleading', emoji: '🚫', count: agg.signals.misleading },
    { key: 'tooLong', emoji: '⏱', count: agg.signals.tooLong },
  ];
  const top = entries.sort((a, b) => b.count - a.count)[0];
  return top.count > 0 ? top : null;
}

/* ─── Time-window pills ──────────────────────────────────────────── */

function SincePills({
  value,
  onChange,
  locale,
}: {
  value: TopSince;
  onChange: (next: TopSince) => void;
  locale: string;
}) {
  const labels = sinceLabels(locale);
  const options: Array<{ key: TopSince; label: string }> = [
    { key: 'week', label: labels.week },
    { key: 'month', label: labels.month },
    { key: 'all', label: labels.all },
  ];
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            className={[
              'rounded-full border px-3.5 py-1.5 font-sans text-[12px] uppercase tracking-widest transition',
              active
                ? 'border-gold bg-gold/15 text-navy'
                : 'border-navy/15 bg-white text-graphit/70 hover:border-gold/60 hover:text-navy',
            ].join(' ')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function sinceLabels(locale: string) {
  if (locale.startsWith('es')) return { week: 'Esta semana', month: 'Este mes', all: 'Todos los tiempos' };
  if (locale.startsWith('pt')) return { week: 'Esta semana', month: 'Este mês', all: 'Todos os tempos' };
  if (locale.startsWith('de')) return { week: 'Diese Woche', month: 'Diesen Monat', all: 'Allzeit' };
  return { week: 'This week', month: 'This month', all: 'All time' };
}

/* ─── States ─────────────────────────────────────────────────────── */

function DiscoverSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-card border border-navy/8 bg-white/60"
        />
      ))}
    </div>
  );
}

function EmptyState({
  labels,
  since,
}: {
  labels: ReturnType<typeof discoverLabels>;
  since: TopSince;
}) {
  // The empty-state copy adapts to the active window — "no top-rated
  // videos this week" reads differently than "no top-rated videos
  // yet". The all-time variant gets the activation nudge.
  const heading = since === 'all' ? labels.emptyTitle : labels.emptyTitleWindow;
  const body = since === 'all' ? labels.emptyBody : labels.emptyBodyWindow;

  return (
    <div className="rounded-card border border-navy/10 bg-white p-10 text-center sm:p-14">
      <BrandMark variant="monogram" size="lg" tone="gold" decorative />
      <h2 className="mt-6 font-serif text-2xl text-navy sm:text-3xl">{heading}</h2>
      <div className="mx-auto mt-4 h-px w-12 bg-gold" aria-hidden />
      <p className="mx-auto mt-5 max-w-md font-serif text-lg leading-relaxed text-graphit/75">
        {body}
      </p>
      {since === 'all' && (
        <Link
          to="/new"
          className="mt-7 inline-block rounded-card bg-navy px-5 py-2.5 font-sans text-sm font-medium text-creme transition hover:bg-navy/90"
        >
          {labels.emptyCta}
        </Link>
      )}
    </div>
  );
}

/* ─── Localised copy ─────────────────────────────────────────────── */

function discoverLabels(locale: string) {
  const signalLabel = (key: keyof RatingAggregate['signals']): string => {
    if (locale.startsWith('es')) {
      return { mindBlowing: 'Brillante', confusing: 'Confuso', misleading: 'Engañoso', tooLong: 'Largo' }[key];
    }
    if (locale.startsWith('pt')) {
      return { mindBlowing: 'Brilhante', confusing: 'Confuso', misleading: 'Enganador', tooLong: 'Longo' }[key];
    }
    if (locale.startsWith('de')) {
      return { mindBlowing: 'Brillant', confusing: 'Verwirrend', misleading: 'Irreführend', tooLong: 'Zu lang' }[key];
    }
    return { mindBlowing: 'Brilliant', confusing: 'Confusing', misleading: 'Misleading', tooLong: 'Long' }[key];
  };

  if (locale.startsWith('es')) return {
    headTitle: 'Descubrir · Voz Clara',
    headDescription: 'Los vídeos mejor valorados por nuestra comunidad. Calidad antes que viralidad.',
    backHome: 'Volver',
    eyebrow: 'Descubrir',
    heroTitle: 'Vídeos que vale la pena ver.',
    heroLead: 'La selección no es por popularidad sino por calidad sostenida — al estilo Michelin. Toca una entrada para generar tu Pack.',
    approvalSuffix: 'lo recomiendan',
    voteSingular: 'voto',
    votePlural: 'votos',
    untitled: 'Vídeo sin título',
    openCta: 'Crear pack',
    emptyTitle: 'Aún sin valoraciones suficientes.',
    emptyBody: 'Sé tú quien empiece. Genera tu primer Pack y valora — la siguiente persona te lo agradecerá.',
    emptyTitleWindow: 'Nada destacable en este periodo.',
    emptyBodyWindow: 'No hay vídeos suficientemente valorados en este intervalo. Prueba "Todos los tiempos".',
    emptyCta: 'Crear mi primer Pack',
    signalLabel,
  };
  if (locale.startsWith('pt')) return {
    headTitle: 'Descobrir · Voz Clara',
    headDescription: 'Os vídeos mais bem avaliados pela nossa comunidade. Qualidade antes de viralidade.',
    backHome: 'Voltar',
    eyebrow: 'Descobrir',
    heroTitle: 'Vídeos que valem a pena.',
    heroLead: 'A seleção não é por popularidade mas por qualidade sustentada — ao estilo Michelin. Toca numa entrada para gerar o teu Pack.',
    approvalSuffix: 'recomendam',
    voteSingular: 'voto',
    votePlural: 'votos',
    untitled: 'Vídeo sem título',
    openCta: 'Criar pack',
    emptyTitle: 'Ainda sem avaliações suficientes.',
    emptyBody: 'Sê tu a começar. Gera o teu primeiro Pack e avalia — a próxima pessoa vai agradecer.',
    emptyTitleWindow: 'Nada notável neste período.',
    emptyBodyWindow: 'Não há vídeos suficientemente avaliados neste intervalo. Experimenta "Todos os tempos".',
    emptyCta: 'Criar o meu primeiro Pack',
    signalLabel,
  };
  if (locale.startsWith('de')) return {
    headTitle: 'Entdecken · Voz Clara',
    headDescription: 'Die am besten bewerteten Videos der Voz-Clara-Community. Qualität vor Viralität.',
    backHome: 'Zurück',
    eyebrow: 'Entdecken',
    heroTitle: 'Videos die sich lohnen.',
    heroLead: 'Die Auswahl folgt nicht Popularität sondern nachhaltiger Qualität — im Michelin-Stil. Tipp einen Eintrag an und erzeug deinen eigenen Pack.',
    approvalSuffix: 'positiv',
    voteSingular: 'Stimme',
    votePlural: 'Stimmen',
    untitled: 'Video ohne Titel',
    openCta: 'Pack erstellen',
    emptyTitle: 'Noch zu wenig Bewertungen.',
    emptyBody: 'Sei der Erste. Erstell deinen ersten Pack und bewerte — die nächste Person dankt es dir.',
    emptyTitleWindow: 'Nichts Erwähnenswertes in diesem Zeitraum.',
    emptyBodyWindow: 'In diesem Intervall gibt es noch zu wenig hochbewertete Videos. Probier „Allzeit".',
    emptyCta: 'Meinen ersten Pack erstellen',
    signalLabel,
  };
  return {
    headTitle: 'Discover · Voz Clara',
    headDescription: "The highest-rated videos in the Voz Clara community. Quality before virality.",
    backHome: 'Back',
    eyebrow: 'Discover',
    heroTitle: 'Videos worth your time.',
    heroLead: 'The list ranks by sustained quality, not popularity — Michelin-style. Tap a row to generate your Pack on the spot.',
    approvalSuffix: 'liked it',
    voteSingular: 'vote',
    votePlural: 'votes',
    untitled: 'Untitled video',
    openCta: 'Create pack',
    emptyTitle: 'Not enough ratings yet.',
    emptyBody: 'Be the first. Generate your first Pack and rate — the next visitor will thank you.',
    emptyTitleWindow: 'Nothing notable in this window.',
    emptyBodyWindow: 'No video has crossed the quality bar in this interval. Try "All time".',
    emptyCta: 'Create my first Pack',
    signalLabel,
  };
}
