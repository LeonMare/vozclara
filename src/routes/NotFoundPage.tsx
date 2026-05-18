import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { BrandMark } from '../components/BrandMark';
import { usePageHead } from '../hooks/usePageHead';

/**
 * /* — 404 catch-all.
 *
 * Replaces the previous silent `<Navigate to="/" replace />` which
 * had two real problems:
 *   1. SEO crawlers got a 200 instead of a clear "not found"; mistyped
 *      URLs were indexed as duplicates of the home page.
 *   2. A visitor following a stale share link landed back on the
 *      marketing surface with no context for what just happened.
 *
 * This page surfaces the brand seal, names the missing path, and
 * offers three exits — Library / new Pack / Discover — so the visitor
 * leaves with a Pack-shaped intent instead of dead-ending. Same
 * editorial chrome as AboutPage / PrivacyPage so it doesn't feel
 * like a generic error template.
 *
 * Status code: SPA fallbacks always serve 200 from the static host,
 * which is why crawlers were getting confused. Cloudflare Pages
 * `_routes.json` (or the equivalent `_redirects`) is the right
 * place to ship the proper 404 status long-term — out of scope for
 * this commit, but the page itself is what the user sees either way.
 */
export function NotFoundPage() {
  const { locale } = useLocale();
  const labels = notFoundLabels(locale);
  const location = useLocation();

  usePageHead({ title: labels.headTitle, description: labels.headDescription });

  return (
    <main id="main" className="bg-creme paper min-h-screen">
      <section className="mx-auto max-w-xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
        <BrandMark variant="monogram" size="lg" tone="gold" decorative />
        <div className="mt-6 font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
          § {labels.eyebrow}
        </div>
        <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
          {labels.heroTitle}
        </h1>
        <div className="mx-auto mt-6 h-px w-12 bg-gold" aria-hidden />

        <p className="mt-7 font-serif text-lg leading-relaxed text-graphit/75 sm:text-xl">
          {labels.heroBody}
        </p>

        <p className="mt-4 font-mono text-[12px] leading-tight text-graphit/45 break-all">
          {location.pathname}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/library"
            className="rounded-card bg-navy px-5 py-2.5 font-sans text-sm font-medium text-creme transition hover:bg-navy/90"
          >
            {labels.libraryCta}
          </Link>
          <Link
            to="/new"
            className="rounded-card border border-navy/20 bg-white px-5 py-2.5 font-sans text-sm text-navy transition hover:border-gold"
          >
            {labels.newCta}
          </Link>
          <Link
            to="/discover"
            className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
          >
            {labels.discoverCta} →
          </Link>
        </div>
      </section>
    </main>
  );
}

function notFoundLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: '404 — Voz Clara',
    headDescription: 'La página que buscas no existe.',
    eyebrow: 'Cuatro · Cero · Cuatro',
    heroTitle: 'No encontramos esa página.',
    heroBody: 'El enlace puede haberse roto o el Pack haber sido eliminado. Tu biblioteca local sigue intacta.',
    libraryCta: 'Ir a mi biblioteca',
    newCta: 'Crear un Pack',
    discoverCta: 'Ver lo mejor valorado',
  };
  if (locale.startsWith('pt')) return {
    headTitle: '404 — Voz Clara',
    headDescription: 'A página que procuras não existe.',
    eyebrow: 'Quatro · Zero · Quatro',
    heroTitle: 'Não encontramos essa página.',
    heroBody: 'O link pode ter-se partido ou o Pack ter sido eliminado. A tua biblioteca local continua intacta.',
    libraryCta: 'Ir à minha biblioteca',
    newCta: 'Criar um Pack',
    discoverCta: 'Ver os melhor avaliados',
  };
  if (locale.startsWith('de')) return {
    headTitle: '404 — Voz Clara',
    headDescription: 'Die gesuchte Seite existiert nicht.',
    eyebrow: 'Vier · Null · Vier',
    heroTitle: 'Diese Seite gibt es nicht.',
    heroBody: 'Der Link kann veraltet sein oder der Pack wurde gelöscht. Deine lokale Bibliothek ist unberührt.',
    libraryCta: 'Zur Bibliothek',
    newCta: 'Neuen Pack erstellen',
    discoverCta: 'Top bewertete sehen',
  };
  return {
    headTitle: '404 — Voz Clara',
    headDescription: "The page you're looking for doesn't exist.",
    eyebrow: 'Four · Zero · Four',
    heroTitle: "We couldn't find that page.",
    heroBody: "The link may have broken or the Pack may have been deleted. Your local library is untouched.",
    libraryCta: 'Go to my library',
    newCta: 'Create a Pack',
    discoverCta: 'See top rated',
  };
}
