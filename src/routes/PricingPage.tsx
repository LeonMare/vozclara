import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { PricingPreview, TrustSection } from '../components/landing/sections';

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

  return (
    <main className="bg-creme paper">
      {/* Back link */}
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 sm:pt-8">
        <Link
          to="/"
          className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
        >
          ← {labels.backHome}
        </Link>
      </div>

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

function pricingPageLabels(locale: string) {
  if (locale.startsWith('es')) return {
    backHome: 'Volver a la página principal',
    ctaHeading: 'Empieza con el plan gratuito.',
    ctaBody: 'Sin tarjeta de crédito. Crea tu primer Knowledge Pack y decide después si te interesa subir de plan.',
    primaryCta: 'Empezar gratis',
    secondaryCta: 'Ver un pack de ejemplo',
  };
  if (locale.startsWith('pt')) return {
    backHome: 'Voltar à página principal',
    ctaHeading: 'Comece com o plano gratuito.',
    ctaBody: 'Sem cartão de crédito. Crie o seu primeiro Knowledge Pack e decida depois se quer mudar de plano.',
    primaryCta: 'Começar grátis',
    secondaryCta: 'Ver um pack de exemplo',
  };
  if (locale.startsWith('de')) return {
    backHome: 'Zurück zur Startseite',
    ctaHeading: 'Starte mit dem kostenlosen Plan.',
    ctaBody: 'Keine Kreditkarte. Erstelle deinen ersten Knowledge Pack und entscheide dann, ob du auf einen größeren Plan wechseln willst.',
    primaryCta: 'Kostenlos starten',
    secondaryCta: 'Beispiel-Pack ansehen',
  };
  return {
    backHome: 'Back to home',
    ctaHeading: 'Start on the free plan.',
    ctaBody: 'No credit card. Create your first Knowledge Pack, then decide later if you want to move up.',
    primaryCta: 'Start free',
    secondaryCta: 'See a sample pack',
  };
}
