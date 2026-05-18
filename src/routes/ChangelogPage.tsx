import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { BrandMark } from '../components/BrandMark';
import { usePageHead } from '../hooks/usePageHead';
import {
  ENTRIES,
  COMING_SOON,
  formatEntryDate,
  localeKey,
  type ChangelogEntry,
} from '../lib/changelog';

/**
 * /changelog — the public update surface.
 *
 * For non-Founder visitors (the 99.x% of traffic that hasn't signed
 * up): a place to see "what's new" without joining Discord or
 * waiting for a marketing email. Critical for HN/Reddit visitors who
 * scroll to "about" to gauge whether the project is alive.
 *
 * Editorial layout mirrors AboutPage / PrivacyPage so it doesn't
 * read like a corporate-changelog dashboard. Each entry is a card
 * with a big date on the left, heading + bullets on the right.
 * Newest at the top.
 *
 * The "Coming soon" block at the foot is conservatively short — only
 * features the worker / lib code already references as in-progress.
 * Better to underclaim than over-promise.
 */
export function ChangelogPage() {
  const { locale } = useLocale();
  const labels = changelogLabels(locale);
  const lk = localeKey(locale);

  usePageHead({ title: labels.headTitle, description: labels.headDescription });

  const sorted = [...ENTRIES].sort((a, b) => b.date.localeCompare(a.date));

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
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
          § {labels.eyebrow}
        </div>
        <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
          {labels.heroTitle}
        </h1>
        <div className="mt-6 h-px w-16 bg-gold" aria-hidden />
        <p className="mt-6 font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
          {labels.heroLead}
        </p>
      </section>

      {/* Entries — newest first */}
      <section className="bg-white/70 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <ol className="space-y-10 sm:space-y-12">
            {sorted.map((entry) => (
              <EntryCard key={entry.date} entry={entry} locale={locale} lk={lk} />
            ))}
          </ol>
        </div>
      </section>

      {/* Coming soon — conservative, well-marked */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
            § {labels.comingSoonEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl">
            {labels.comingSoonHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-5 font-serif italic text-graphit/70 sm:text-lg">
            {labels.comingSoonLead}
          </p>
          <ul className="mt-7 space-y-3 font-serif text-base leading-relaxed text-graphit/80 sm:text-lg">
            {COMING_SOON[lk].map((item, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="text-gold">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quiet closing — brand seal + nudge to Discover/Founder for
          the people who arrived here from a marketing channel */}
      <section className="border-t border-navy/10 bg-creme py-14 text-center sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <BrandMark variant="monogram" size="lg" tone="gold" decorative />
          <p className="mx-auto mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-graphit/75 sm:text-xl">
            {labels.closingLead}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/new"
              className="rounded-card bg-navy px-6 py-3 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
            >
              {labels.ctaPrimary}
            </Link>
            <Link
              to="/founder"
              className="font-sans text-sm italic text-graphit/60 underline-offset-4 transition hover:text-gold hover:underline"
            >
              {labels.ctaSecondary} →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─── Entry card ─────────────────────────────────────────────────── */

function EntryCard({
  entry,
  locale,
  lk,
}: {
  entry: ChangelogEntry;
  locale: string;
  lk: 'es' | 'pt' | 'de' | 'en';
}) {
  const data = entry.i18n[lk];
  const isLaunch = entry.kind === 'launch';
  return (
    <li
      className={[
        'grid gap-4 sm:grid-cols-[180px_1fr] sm:gap-8',
        isLaunch ? 'rounded-card border border-gold/40 bg-white p-5 sm:p-7' : '',
      ].join(' ')}
    >
      <div className="sm:pt-1">
        {entry.versionLabel && (
          <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
            {entry.versionLabel}
          </div>
        )}
        <div className="mt-1 font-serif text-base text-navy sm:text-lg">
          {formatEntryDate(entry.date, locale)}
        </div>
      </div>
      <div>
        <h3 className="font-serif text-xl leading-tight text-navy sm:text-2xl">
          {data.heading}
        </h3>
        <ul className="mt-4 space-y-2.5 font-serif text-base leading-relaxed text-graphit/80 sm:text-lg">
          {data.items.map((item, i) => (
            <li key={i} className="flex items-baseline gap-3">
              <span className="text-gold">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/* ─── Localised page chrome ──────────────────────────────────────── */

function changelogLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: 'Cambios — VozClara',
    headDescription: 'Lo que es nuevo en VozClara. Lo que llega pronto. Lista honesta, sin marketing inflado.',
    backHome: 'Volver',
    eyebrow: 'Cambios',
    heroTitle: 'Lo que es nuevo. Lo que llega.',
    heroLead: 'Cada cosa que aterriza en vozclara.app aparece aquí — corto, fechado, sin entradas internas. Lo más nuevo arriba.',
    comingSoonEyebrow: 'Próximamente',
    comingSoonHeading: 'En obras.',
    comingSoonLead: 'Lo que está en el repo como rama o lib sin terminar — no prometemos fechas, pero estos son los siguientes en la cola.',
    closingLead: 'Si llegaste aquí desde un enlace de prensa o un hilo de Reddit: el camino corto es crear tu primer Pack. El Founder Deal cubre los primeros cien que entren.',
    ctaPrimary: 'Crear mi primer Pack',
    ctaSecondary: 'Founder Deal · €99',
  };
  if (locale.startsWith('pt')) return {
    headTitle: 'Alterações — VozClara',
    headDescription: 'O que há de novo na VozClara. O que vem a seguir. Lista honesta, sem marketing inflado.',
    backHome: 'Voltar',
    eyebrow: 'Alterações',
    heroTitle: 'O que há de novo. O que vem.',
    heroLead: 'Cada coisa que aterra em vozclara.app aparece aqui — curto, datado, sem entradas internas. O mais recente em cima.',
    comingSoonEyebrow: 'Em breve',
    comingSoonHeading: 'Em obras.',
    comingSoonLead: 'O que está no repo como ramo ou lib por terminar — não prometemos datas, mas estes são os próximos na fila.',
    closingLead: 'Se chegaste aqui via um link de imprensa ou um thread no Reddit: o caminho curto é criar o teu primeiro Pack. O Founder Deal cobre os primeiros cem que entrarem.',
    ctaPrimary: 'Criar o meu primeiro Pack',
    ctaSecondary: 'Founder Deal · €99',
  };
  if (locale.startsWith('de')) return {
    headTitle: 'Changelog — VozClara',
    headDescription: 'Was neu ist auf VozClara. Was bald kommt. Ehrliche Liste, ohne Marketing-Aufblähung.',
    backHome: 'Zurück',
    eyebrow: 'Changelog',
    heroTitle: 'Was neu ist. Was kommt.',
    heroLead: 'Alles was auf vozclara.app landet, taucht hier auf — kurz, datiert, ohne interne Tickets. Das Neueste oben.',
    comingSoonEyebrow: 'Bald',
    comingSoonHeading: 'In Arbeit.',
    comingSoonLead: 'Was im Repo schon als Branch oder unvollendete Lib steht — keine Datums-Versprechen, aber das sind die nächsten in der Schlange.',
    closingLead: 'Wenn du über einen Presse-Link oder einen Reddit-Thread hier gelandet bist: der kurze Weg ist deinen ersten Pack zu erstellen. Der Founder Deal deckt die ersten Hundert ab.',
    ctaPrimary: 'Meinen ersten Pack erstellen',
    ctaSecondary: 'Founder Deal · €99',
  };
  return {
    headTitle: 'Changelog — VozClara',
    headDescription: "What's new on VozClara. What's coming next. Honest list, no marketing inflation.",
    backHome: 'Back',
    eyebrow: 'Changelog',
    heroTitle: "What's new. What's next.",
    heroLead: 'Everything that lands on vozclara.app shows up here — short, dated, no internal-ticket noise. Newest at the top.',
    comingSoonEyebrow: 'Coming soon',
    comingSoonHeading: 'In the works.',
    comingSoonLead: "What's sitting in the repo as a branch or unfinished lib — no date promises, but these are the next ones in the queue.",
    closingLead: 'If you arrived here from a press link or a Reddit thread: the short path is creating your first Pack. The Founder Deal covers the first hundred to step in.',
    ctaPrimary: 'Create my first Pack',
    ctaSecondary: 'Founder Deal · €99',
  };
}
