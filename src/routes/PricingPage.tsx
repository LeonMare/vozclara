import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { PricingPreview, TrustSection } from '../components/landing/sections';
import { usePageHead } from '../hooks/usePageHead';
import { track, Events } from '../lib/analytics';

/**
 * /pricing — standalone pricing page for external linking.
 *
 * Reuses PricingPreview + TrustSection from the landing so the
 * source-of-truth for plan content stays single. Adds a small
 * back-to-home affordance + a closing CTA so visitors arriving from
 * an external link (newsletter, social, search) have a clear next
 * step beyond just reading the table.
 *
 * Landing-page visitors still see the inline #pricing section when
 * they scroll naturally — both entry points coexist intentionally.
 */
export function PricingPage() {
  const { locale } = useLocale();
  const labels = pricingPageLabels(locale);

  usePageHead({
    title: pricingHeadTitle(locale),
    description: pricingHeadDescription(locale),
  });

  // Funnel: /pricing route mounted — mid-funnel interest signal
  // between the value moment (pack_generated) and the close-to-
  // conversion click (founder_checkout_opened). Cookieless, no
  // user identifier.
  useEffect(() => {
    track(Events.VIEWED_PRICING, { locale });
  }, [locale]);

  return (
    <main id="main" className="bg-creme paper">
      {/* Back link */}
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 sm:pt-8">
        <Link
          to="/"
          className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
        >
          ← {labels.backHome}
        </Link>
      </div>

      {/* H1 — was missing, the route had only h2s from PricingPreview
          inside. Screen readers and SEO crawlers expect one h1 per
          page; this surfaces the page intent before the grid. */}
      <section className="mx-auto max-w-6xl px-5 pb-2 pt-8 sm:px-8 sm:pt-12">
        <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
          § {labels.eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
          {labels.heroTitle}
        </h1>
        <div className="mt-5 h-px w-16 bg-gold" aria-hidden />
        <p className="mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-graphit/75 sm:text-xl">
          {labels.heroLead}
        </p>
      </section>

      {/* Founder Deal banner — sits above the Free/Pro grid until the
          100 seats sell out. Editorial tone, not a popup, not a
          modal. Routes to /founder where the full pitch lives. */}
      <FounderBanner locale={locale} />

      {/* The plans grid + disclaimer copy */}
      <PricingPreview />

      {/* Privacy / trust section keeps the editorial tone going beyond
          the pure pricing table. */}
      <TrustSection />

      {/* Closing CTA — visitors from external links convert here */}
      <section className="border-t border-navy/10 bg-creme paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.ctaHeading}
          </h2>
          <div className="mx-auto mt-4 h-px w-10 bg-gold" aria-hidden />
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-graphit/70">
            {labels.ctaBody}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/new"
              className="rounded-card bg-navy px-6 py-3 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
            >
              {labels.primaryCta}
            </Link>
            <Link
              to="/pack/sample"
              className="font-sans text-sm italic text-graphit/60 underline-offset-4 transition hover:text-gold hover:underline"
            >
              {labels.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function pricingHeadTitle(locale: string): string {
  if (locale.startsWith('es')) return 'Planes y precios';
  if (locale.startsWith('pt')) return 'Planos e preços';
  if (locale.startsWith('de')) return 'Preise';
  return 'Pricing';
}

function pricingHeadDescription(locale: string): string {
  if (locale.startsWith('es')) return 'Empieza gratis. Planes para usuarios avanzados y creadores cuando los necesites — sin tarjeta hasta entonces.';
  if (locale.startsWith('pt')) return 'Começa grátis. Planos para utilizadores avançados e criadores quando precisares — sem cartão até lá.';
  if (locale.startsWith('de')) return 'Kostenlos starten. Pläne für Power-User und Creator wenn du sie brauchst — bis dahin alles ohne Anmeldung.';
  return 'Start free. Plans for power users and creators when you need them — no card required until then.';
}

function pricingPageLabels(locale: string) {
  if (locale.startsWith('es')) return {
    backHome: 'Volver a la página principal',
    eyebrow: 'PRECIOS',
    heroTitle: 'Empieza gratis. Sube de plan cuando lo necesites.',
    heroLead: 'Todo lo que ya funciona es gratuito. Los planes de pago llegan cuando la app esté madura y haya demanda real — hasta entonces, sin tarjeta.',
    ctaHeading: 'Empieza con el plan gratuito.',
    ctaBody: 'Sin tarjeta de crédito. Crea tu primer Knowledge Pack y decide después si te interesa subir de plan.',
    primaryCta: 'Empezar gratis',
    secondaryCta: 'Ver un pack de ejemplo',
  };
  if (locale.startsWith('pt')) return {
    backHome: 'Voltar à página principal',
    eyebrow: 'PREÇOS',
    heroTitle: 'Começa grátis. Sobe de plano quando precisares.',
    heroLead: 'Tudo o que já funciona é gratuito. Os planos pagos chegam quando a app estiver madura e houver procura real — até lá, sem cartão.',
    ctaHeading: 'Começa com o plano gratuito.',
    ctaBody: 'Sem cartão de crédito. Cria o teu primeiro Knowledge Pack e decide depois se queres mudar de plano.',
    primaryCta: 'Começar grátis',
    secondaryCta: 'Ver um pack de exemplo',
  };
  if (locale.startsWith('de')) return {
    backHome: 'Zurück zur Startseite',
    eyebrow: 'PREISE',
    heroTitle: 'Kostenlos starten. Plan wechseln wenn nötig.',
    heroLead: 'Alles was schon funktioniert ist gratis. Bezahlpläne kommen, wenn die App reif ist und echte Nachfrage besteht — bis dahin alles ohne Anmeldung.',
    ctaHeading: 'Starte mit dem kostenlosen Plan.',
    ctaBody: 'Sofort starten. Erstelle deinen ersten Knowledge Pack und entscheide dann, ob du auf einen größeren Plan wechseln willst.',
    primaryCta: 'Kostenlos starten',
    secondaryCta: 'Beispiel-Pack ansehen',
  };
  return {
    backHome: 'Back to home',
    eyebrow: 'PRICING',
    heroTitle: 'Start free. Upgrade when you need it.',
    heroLead: 'Everything that already works is free. Paid plans arrive once the app is mature and real demand shows up — until then, no card.',
    ctaHeading: 'Start on the free plan.',
    ctaBody: 'No credit card. Create your first Knowledge Pack, then decide later if you want to move up.',
    primaryCta: 'Start free',
    secondaryCta: 'See a sample pack',
  };
}

/* ─── Founder Deal banner ────────────────────────────────────────── *
 *
 * Sits above the Free/Pro pricing grid until the 100 seats sell out.
 * Reads the live counter via /api/founder/status so the urgency is
 * truthful. Routes to /founder for the full pitch + Stripe checkout.
 */

import { useState } from 'react';
import { fetchFounderStatus, type FounderStatus } from '../lib/founder';

function FounderBanner({ locale }: { locale: string }) {
  const [status, setStatus] = useState<FounderStatus | null>(null);
  useEffect(() => {
    let cancelled = false;
    void fetchFounderStatus().then((s) => {
      if (!cancelled) setStatus(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide entirely once sold out — the slot becomes free for the next
  // launch hook without us having to remove this banner manually.
  if (status && !status.available) return null;

  const labels = founderBannerLabels(locale);
  const remaining = status?.claimed != null ? status.max - status.claimed : null;

  return (
    <section className="mx-auto mt-10 max-w-6xl px-5 sm:px-8">
      <Link
        to="/founder"
        className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-card border border-gold/50 bg-white p-6 transition hover:border-gold sm:flex-row sm:items-center sm:gap-8 sm:p-8"
      >
        {/* Big counter, left side */}
        <div className="flex shrink-0 items-baseline gap-2">
          <span className="font-serif text-4xl text-navy tabular-nums sm:text-5xl">
            {status?.claimed ?? '—'}
          </span>
          <span className="font-serif text-xl text-graphit/65 tabular-nums sm:text-2xl">
            / 100
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.eyebrow}
          </div>
          <h2 className="mt-2 font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.heading}
          </h2>
          <p className="mt-2 font-serif italic text-graphit/70 sm:text-lg">
            {remaining != null && remaining > 0
              ? labels.remainingFn(remaining)
              : labels.tagline}
          </p>
        </div>

        <span className="font-sans text-sm text-graphit/65 transition group-hover:text-navy sm:self-center">
          {labels.cta} →
        </span>
      </Link>
    </section>
  );
}

function founderBannerLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'Founder Deal · €99 · solo 100',
    heading: 'Pro de por vida por €99 — para los primeros cien.',
    tagline: 'Disponible solo en el lanzamiento.',
    remainingFn: (n: number) => (n === 1 ? 'Última plaza disponible.' : `${n} plazas disponibles.`),
    cta: 'Ver el Founder Deal',
  };
  if (locale.startsWith('pt')) return {
    eyebrow: 'Founder Deal · €99 · só 100',
    heading: 'Pro vitalício por €99 — para os primeiros cem.',
    tagline: 'Disponível só no lançamento.',
    remainingFn: (n: number) => (n === 1 ? 'Último lugar disponível.' : `${n} lugares disponíveis.`),
    cta: 'Ver o Founder Deal',
  };
  if (locale.startsWith('de')) return {
    eyebrow: 'Founder Deal · €99 · nur 100',
    heading: 'Pro auf Lebenszeit für €99 — für die ersten hundert.',
    tagline: 'Nur zum Launch verfügbar.',
    remainingFn: (n: number) => (n === 1 ? 'Letzter Platz verfügbar.' : `${n} Plätze verfügbar.`),
    cta: 'Zum Founder Deal',
  };
  return {
    eyebrow: 'Founder Deal · €99 · only 100',
    heading: 'Pro for life at €99 — for the first hundred.',
    tagline: 'Available only at launch.',
    remainingFn: (n: number) => (n === 1 ? 'Last seat available.' : `${n} seats available.`),
    cta: 'See the Founder Deal',
  };
}
