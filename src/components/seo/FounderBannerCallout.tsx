import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../lib/i18n';
import { fetchFounderStatus, type FounderStatus } from '../../lib/founder';

/**
 * Shared Founder-Deal callout. Used on every SEO landing page.
 * Fetches /api/founder/status to render the live "X of 100
 * remaining" scarcity counter. Auto-hides when the deal closes
 * (available === false), so post-launch the callout disappears
 * everywhere without page-by-page edits.
 */
export function FounderBannerCallout() {
  const { locale } = useLocale();
  const labels = founderBannerLabels(locale);

  const [status, setStatus] = useState<FounderStatus | null>(null);
  useEffect(() => {
    void fetchFounderStatus().then(setStatus);
  }, []);

  const remaining =
    status && status.claimed !== null
      ? Math.max(0, status.max - status.claimed)
      : null;
  const available = status?.available !== false;
  if (!available) return null;

  return (
    <Link
      to="/founder"
      className="group mt-16 block rounded-card border border-gold/50 bg-creme p-5 shadow-card transition hover:border-gold hover:shadow-lg sm:mt-20 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
              {labels.eyebrow}
            </span>
            {remaining !== null && (
              <span className="font-sans text-[11px] text-graphit/60">
                {labels.remaining(remaining)}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.headline}
          </h3>
          <p className="mt-1 font-serif italic text-sm text-graphit/70 sm:text-base">
            {labels.sub}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-card bg-navy px-5 py-2.5 font-sans text-sm font-medium text-creme transition group-hover:bg-navy/90">
          {labels.cta} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

function founderBannerLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'Founder Deal · Limitado',
    headline: '€99 una vez. Pro Plus de por vida.',
    sub: 'Hasta que 100 founders firmen. Después, nunca más.',
    cta: 'Reservar plaza founder',
    remaining: (n: number) => `Quedan ${n} de 100`,
  };
  if (locale.startsWith('pt')) return {
    eyebrow: 'Founder Deal · Limitado',
    headline: '€99 uma vez. Pro Plus para sempre.',
    sub: 'Até que 100 founders se inscrevam. Depois, nunca mais.',
    cta: 'Reservar lugar founder',
    remaining: (n: number) => `Restam ${n} de 100`,
  };
  if (locale.startsWith('de')) return {
    eyebrow: 'Founder Deal · Limitiert',
    headline: '€99 einmal. Pro Plus lebenslang.',
    sub: 'Bis 100 Founders eingetragen sind. Danach nie wieder.',
    cta: 'Founder-Platz sichern',
    remaining: (n: number) => `${n} von 100 verfügbar`,
  };
  return {
    eyebrow: 'Founder Deal · Limited',
    headline: '€99 once. Lifetime Pro Plus.',
    sub: 'Until 100 founders sign up. Then never offered again.',
    cta: 'Claim a founder seat',
    remaining: (n: number) => `${n} of 100 remaining`,
  };
}
