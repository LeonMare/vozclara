/**
 * Landing-page sections — Problem, Solution, KnowledgePackPreview,
 * LibraryPreview, AskMyKnowledge, LanguageSection, Pricing.
 *
 * Each section follows the same editorial rhythm: § cipher + section
 * number, classical serif heading, gold rule, body. Variations in
 * background (creme vs white vs navy) create chapter breaks without
 * decorative noise.
 */

import { Link } from 'react-router-dom';
import { useLocale } from '../../lib/i18n';
import { BrandMark } from '../BrandMark';
import { LandingAskDemo } from './LandingAskDemo';

/* ─── 02 · Problem ─────────────────────────────────────────────────────── */

export function Problem() {
  const { t } = useLocale();
  return (
    <section className="bg-creme paper py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionEyebrow number="02" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-5xl">
          {t.problemTitle}
        </h2>
        <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-6 max-w-3xl font-serif text-lg leading-relaxed text-graphit/80 sm:text-xl">
          {t.problemBody}
        </p>
      </div>
    </section>
  );
}

/* ─── 03 · Solution ────────────────────────────────────────────────────── */

export function Solution() {
  const { t } = useLocale();
  return (
    <section className="bg-white/70 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionEyebrow number="03" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-5xl">
          {t.solutionTitle}
        </h2>
        <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-6 max-w-3xl font-serif text-lg leading-relaxed text-graphit/80 sm:text-xl">
          {t.solutionBody}
        </p>
      </div>
    </section>
  );
}

/* ─── 05 · Knowledge Pack Preview ──────────────────────────────────────── */

export function KnowledgePackPreview() {
  const { t } = useLocale();
  return (
    <section className="bg-creme paper py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionEyebrow number="05" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {t.kpTitle}
        </h2>
        <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-3 font-serif italic text-graphit/70 sm:text-lg">{t.kpSub}</p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {t.kpSections.map((s, i) => (
            <div
              key={i}
              className="gold-corners relative bg-white p-5 sm:p-6"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="corner-tr" /><span className="corner-bl" />
              <div className="font-sans text-[10px] uppercase tracking-widest text-gold tabular-nums">
                · {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-2 font-serif text-xl text-navy">{s.label}</h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-graphit/70">
                {s.example}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 06 · Library Preview ─────────────────────────────────────────────── */

export function LibraryPreview() {
  const { t } = useLocale();
  // Six visually distinct mock cards.
  const mocks = [
    { mode: 'Business', lang: 'ES', title: 'Tagesschau · 03.05.2026', tag: 'Politik' },
    { mode: 'Learn', lang: 'ES', title: 'Cómo funciona la inteligencia artificial', tag: 'Educación' },
    { mode: 'Creator', lang: 'EN', title: 'How to monetize a newsletter in 2026', tag: 'Marketing' },
    { mode: 'Business', lang: 'DE', title: 'BCG Insights: AI in finance', tag: 'Finanzen' },
    { mode: 'Learn', lang: 'EN', title: 'Spanish subjunctive made simple', tag: 'Idiomas' },
    { mode: 'Business', lang: 'PT', title: 'Investing in DACH startups', tag: 'Investment' },
  ];

  return (
    <section className="bg-white/70 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionEyebrow number="06" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {t.libraryTitle}
        </h2>
        <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-3 font-serif italic text-graphit/70 sm:text-lg">{t.librarySub}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mocks.map((m, i) => (
            <div key={i} className="card-hover rounded-card border border-navy/10 bg-creme p-5 sm:p-6">
              <div className="flex items-center justify-between font-sans text-[10px] uppercase tracking-widest">
                <span className="rounded-full bg-navy/8 px-2 py-0.5 text-graphit/65">{m.mode}</span>
                <span className="text-graphit/45 tabular-nums">{m.lang}</span>
              </div>
              <h3 className="mt-3 font-serif text-lg leading-snug text-navy">{m.title}</h3>
              <div className="mt-3 h-px w-6 bg-gold/50" aria-hidden />
              <div className="mt-3 inline-flex items-baseline gap-1.5 font-sans text-[11px]">
                <span className="text-graphit/40">·</span>
                <span className="italic text-graphit/65">{m.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 07 · Ask My Knowledge ────────────────────────────────────────────── */

export function AskMyKnowledge() {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-creme sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(201,162,75,0.30), transparent 55%), radial-gradient(ellipse at bottom right, rgba(232,210,154,0.10), transparent 60%)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
          § 07  ·  {t.askEyebrow}
        </div>
        <h2 className="mt-5 font-serif text-3xl leading-tight text-creme sm:text-5xl">
          {t.askTitle}
        </h2>
        <div className="mx-auto mt-6 h-px w-16 bg-gold" aria-hidden />
        <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed text-creme/80 sm:text-lg">
          {t.askSub}
        </p>

        {/* Interactive demo — the visitor can ask the sample library
            of three Tagesschau packs and get a real LLM answer with
            citations linking back to the sample pages. The strongest
            single proof on the landing that the product works. */}
        <div className="mt-10">
          <LandingAskDemo />
        </div>
      </div>
    </section>
  );
}

/* ─── 08 · Languages ───────────────────────────────────────────────────── */

export function LanguageSection() {
  const { t } = useLocale();
  return (
    <section className="bg-creme paper py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <SectionEyebrow number="08" center />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {t.langTitle}
        </h2>
        <div className="mx-auto mt-5 h-px w-12 bg-gold" aria-hidden />

        <div className="mt-8 font-inscriptional text-2xl tracking-[0.25em] text-navy sm:text-4xl">
          {t.langActive}
        </div>
        <div className="mt-5 font-sans text-sm tracking-widest text-graphit/55">
          {t.langSoon}
        </div>
      </div>
    </section>
  );
}

/* ─── 09 · Pricing ─────────────────────────────────────────────────────── */

export function PricingPreview() {
  const { t, locale } = useLocale();
  const ctaLabels = pricingCtaLabels(locale);

  return (
    <section id="pricing" className="bg-white/70 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionEyebrow number="09" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {t.pricingTitle}
        </h2>
        <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-3 font-serif italic text-graphit/70 sm:text-lg">{t.pricingSub}</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.tiers.map((tier, i) => {
            const isFeatured = i === 1; // Pro tier highlighted
            const isFree = i === 0;
            // Honest CTA copy: Free is "Start free", paid tiers are
            // "Join waitlist" / "Request access" until payment is wired up.
            const ctaCopy = isFree
              ? ctaLabels.startFree
              : i === 3
                ? ctaLabels.requestAccess
                : ctaLabels.waitlist;
            return (
              <div
                key={tier.name}
                className={[
                  'flex flex-col rounded-card p-6 transition-all duration-300',
                  isFeatured
                    ? 'border-l-4 border-gold bg-creme shadow-card -translate-y-1'
                    : 'border border-navy/10 bg-creme hover:border-gold/50',
                ].join(' ')}
              >
                <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/55">
                  {tier.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-4xl text-navy">{tier.price}</span>
                  <span className="font-sans text-xs text-graphit/55">{tier.period}</span>
                </div>
                <p className="mt-2 font-serif italic text-sm text-graphit/65">{tier.blurb}</p>
                <div className="mt-4 h-px w-8 bg-gold/50" aria-hidden />
                <ul className="mt-4 flex-1 space-y-2 font-sans text-[13px] text-graphit/75">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-baseline gap-2">
                      <span className="text-gold/70">·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isFree ? (
                  <Link
                    to="/new"
                    className={[
                      'mt-6 inline-block rounded-card py-2.5 text-center font-sans text-sm font-medium transition',
                      isFeatured
                        ? 'bg-navy text-creme hover:bg-navy/90'
                        : 'border border-navy/20 bg-white text-navy hover:border-gold',
                    ].join(' ')}
                  >
                    {ctaCopy}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert(ctaLabels.waitlistConfirm)}
                    className={[
                      'mt-6 rounded-card py-2.5 font-sans text-sm font-medium transition',
                      isFeatured
                        ? 'bg-navy text-creme hover:bg-navy/90'
                        : 'border border-navy/20 bg-white text-navy hover:border-gold',
                    ].join(' ')}
                  >
                    {ctaCopy}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Honest tag — say it out loud */}
        <p className="mt-8 text-center font-serif italic text-sm text-graphit/55">
          {ctaLabels.disclaimer}
        </p>
      </div>
    </section>
  );
}

function pricingCtaLabels(locale: string) {
  const lang = locale;
  if (lang.startsWith('es')) {
    return {
      startFree: 'Empezar gratis',
      waitlist: 'Apuntarme a la lista',
      requestAccess: 'Solicitar acceso',
      waitlistConfirm: '¡Gracias! Apuntado. Te avisaremos cuando esté disponible.',
      disclaimer: 'Los planes de pago llegarán cuando la app esté madura. Hasta entonces, todo es gratis sin tarjeta.',
    };
  }
  if (lang.startsWith('pt')) {
    return {
      startFree: 'Começar grátis',
      waitlist: 'Inscrever-me na lista',
      requestAccess: 'Solicitar acesso',
      waitlistConfirm: 'Obrigado! Inscrito. Avisamos quando estiver disponível.',
      disclaimer: 'Os planos pagos chegam quando a app estiver madura. Até lá, tudo grátis sem cartão.',
    };
  }
  if (lang.startsWith('de')) {
    return {
      startFree: 'Kostenlos starten',
      waitlist: 'Auf Warteliste eintragen',
      requestAccess: 'Zugang anfragen',
      waitlistConfirm: 'Danke! Eingetragen. Wir melden uns wenn es verfügbar ist.',
      disclaimer: 'Bezahlte Pläne kommen wenn die App reif ist. Bis dahin alles kostenlos ohne Karte.',
    };
  }
  return {
    startFree: 'Start free',
    waitlist: 'Join waitlist',
    requestAccess: 'Request access',
    waitlistConfirm: 'Thanks! You\'re on the list. We\'ll let you know when it ships.',
    disclaimer: 'Paid tiers arrive when the app is mature. Until then, everything is free without a card.',
  };
}

/* ─── 09b · Trust / Privacy ────────────────────────────────────────────── */

/**
 * A short, dignified trust block before the final CTA. Six promises in
 * a 2×3 grid, each one a single line. No badges, no security-vendor
 * logos — those would shift the visual register out of editorial.
 *
 * Aim: the visitor reaches Final CTA already convinced that:
 *  • their data stays put
 *  • there is no surveillance angle
 *  • they remain in control
 */
export function TrustSection() {
  const { locale } = useLocale();
  const promises = trustPromises(locale);
  const heading = trustHeading(locale);

  return (
    <section className="border-t border-navy/10 bg-creme paper py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionEyebrow number="09·b" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {heading.title}
        </h2>
        <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-3 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
          {heading.sub}
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {promises.map((p, i) => (
            <div key={i} className="flex items-baseline gap-3">
              <span className="font-serif text-sm text-gold tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="font-serif text-lg text-navy">{p.title}</div>
                <p className="mt-1 font-sans text-sm leading-relaxed text-graphit/70">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function trustHeading(locale: string): { title: string; sub: string } {
  const lang = locale;
  if (lang.startsWith('es')) return {
    title: 'Tu biblioteca, bajo tu control.',
    sub: 'VozClara no es una red social. No es un feed público. Es tu archivo privado de conocimiento — y se queda así.',
  };
  if (lang.startsWith('pt')) return {
    title: 'A sua biblioteca, sob o seu controlo.',
    sub: 'A VozClara não é uma rede social. Não é um feed público. É o seu arquivo privado de conhecimento — e fica assim.',
  };
  if (lang.startsWith('de')) return {
    title: 'Ihre Bibliothek, unter Ihrer Kontrolle.',
    sub: 'VozClara ist kein soziales Netzwerk. Kein öffentlicher Feed. Ihr privates Wissensarchiv — und das bleibt so.',
  };
  return {
    title: 'Your library, under your control.',
    sub: 'VozClara is not a social network. Not a public feed. Your private knowledge archive — and it stays that way.',
  };
}

function trustPromises(locale: string): { title: string; body: string }[] {
  const lang = locale;
  if (lang.startsWith('es')) return [
    { title: 'Biblioteca privada', body: 'Tus packs viven en tu dispositivo. No los vemos, no los indexamos, no los compartimos.' },
    { title: 'La fuente queda visible', body: 'Cada pack enlaza al vídeo original. La atribución nunca se pierde.' },
    { title: 'Sin publicidad', body: 'Sin anuncios. Sin trackers de terceros. Sin perfilado.' },
    { title: 'Sin feed público', body: 'Lo que guardas no se publica en ningún sitio. Tú decides si lo compartes.' },
    { title: 'Tú controlas tus packs', body: 'Editar, exportar, eliminar — siempre con un solo clic.' },
    { title: 'Solo la IA sale del navegador', body: 'El análisis con IA viaja al modelo. Nada más. El transcript y la biblioteca quedan en local.' },
  ];
  if (lang.startsWith('pt')) return [
    { title: 'Biblioteca privada', body: 'Os seus packs vivem no seu dispositivo. Não os vemos, não os indexamos, não os partilhamos.' },
    { title: 'A fonte fica visível', body: 'Cada pack tem link para o vídeo original. A atribuição nunca se perde.' },
    { title: 'Sem publicidade', body: 'Sem anúncios. Sem trackers de terceiros. Sem perfis comerciais.' },
    { title: 'Sem feed público', body: 'O que guarda não é publicado em lado nenhum. Você decide o que partilhar.' },
    { title: 'Você controla os seus packs', body: 'Editar, exportar, eliminar — sempre a um clique.' },
    { title: 'Só a IA sai do navegador', body: 'A análise por IA viaja ao modelo. Nada mais. O transcript e a biblioteca ficam locais.' },
  ];
  if (lang.startsWith('de')) return [
    { title: 'Private Bibliothek', body: 'Ihre Packs leben auf Ihrem Gerät. Wir sehen sie nicht, indizieren sie nicht, teilen sie nicht.' },
    { title: 'Die Quelle bleibt sichtbar', body: 'Jeder Pack verlinkt zum Original-Video. Die Attribution geht nie verloren.' },
    { title: 'Keine Werbung', body: 'Keine Anzeigen. Keine Third-Party-Tracker. Kein Profiling.' },
    { title: 'Kein öffentlicher Feed', body: 'Was Sie speichern wird nirgends veröffentlicht. Sie entscheiden was Sie teilen.' },
    { title: 'Sie kontrollieren Ihre Packs', body: 'Bearbeiten, exportieren, löschen — immer einen Klick entfernt.' },
    { title: 'Nur KI verlässt den Browser', body: 'Die KI-Analyse geht zum Modell. Mehr nicht. Transkript und Bibliothek bleiben lokal.' },
  ];
  return [
    { title: 'Private library', body: 'Your packs live on your device. We don\'t see them, index them, or share them.' },
    { title: 'Source stays visible', body: 'Every pack links back to the original video. Attribution is never lost.' },
    { title: 'No advertising', body: 'No ads. No third-party trackers. No commercial profiling.' },
    { title: 'No public feed', body: 'Nothing you save is published anywhere. You decide what to share.' },
    { title: 'You control your packs', body: 'Edit, export, delete — always one click away.' },
    { title: 'Only AI leaves the browser', body: 'The AI call goes to the model. Nothing else. Transcript and library stay local.' },
  ];
}

/* ─── helpers ──────────────────────────────────────────────────────────── */

function SectionEyebrow({ number, center = false }: { number: string; center?: boolean }) {
  return (
    <div
      className={[
        'mb-3 font-sans text-[10px] uppercase tracking-[0.4em] text-gold',
        center ? 'mx-auto' : '',
      ].join(' ')}
    >
      § {number}
    </div>
  );
}

/* ─── Founder note — small, authentic, brand-conform ──────────────────── */

export function FounderNote() {
  const { locale } = useLocale();

  const note: Record<typeof locale, string> = {
    es: 'VozClara existe porque mi compañera, hispanohablante, quería acceder al conocimiento alemán en su idioma — sin tener que estudiar alemán durante años antes. Empezó como herramienta interna. Ahora la abrimos a otros que viven entre lenguas.',
    pt: 'A VozClara existe porque a minha companheira, lusófona, queria aceder ao conhecimento alemão na sua língua — sem ter de estudar alemão durante anos primeiro. Começou como ferramenta interna. Agora abrimo-la a outros que vivem entre idiomas.',
    de: 'VozClara existiert weil meine Partnerin, Spanisch-Muttersprachlerin, deutsches Wissen in ihrer Sprache verstehen wollte — ohne erst Jahre Deutsch zu lernen. Es begann als internes Werkzeug. Jetzt öffnen wir es für andere die zwischen Sprachen leben.',
    en: 'VozClara exists because my partner, a native Spanish speaker, wanted access to German knowledge in her own language — without spending years learning German first. It started as an internal tool. We are opening it now to others who live between languages.',
  };

  const heading: Record<typeof locale, string> = {
    es: '¿Por qué VozClara?',
    pt: 'Porquê a VozClara?',
    de: 'Warum VozClara?',
    en: 'Why VozClara?',
  };

  return (
    <section className="border-t border-navy/10 bg-creme paper py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <BrandMark variant="monogram" size="md" tone="gold" decorative />
        <h2 className="mt-6 font-serif text-2xl text-navy sm:text-3xl">
          {heading[locale]}
        </h2>
        <div className="mx-auto mt-4 h-px w-10 bg-gold" aria-hidden />
        <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
          {note[locale]}
        </p>
        <p className="mt-5 font-sans text-[11px] uppercase tracking-widest text-graphit/45">
          — Christian Leon · LEON MARÉ · Frankfurt
        </p>
      </div>
    </section>
  );
}

/* ─── Trust footer with privacy promise ───────────────────────────────── */

export function LandingFooter() {
  const { t, locale } = useLocale();
  const cols = footerColumns(locale);

  const trust: Record<typeof locale, string> = {
    es: 'Tu biblioteca permanece en tu dispositivo. Sin rastreo. Sin anuncios. Solo el análisis con IA sale de tu navegador.',
    pt: 'A sua biblioteca permanece no seu dispositivo. Sem rastreio. Sem anúncios. Apenas a análise por IA sai do seu navegador.',
    de: 'Ihre Bibliothek bleibt auf Ihrem Gerät. Kein Tracking. Keine Werbung. Nur die KI-Analyse verlässt Ihren Browser.',
    en: 'Your library stays on your device. No tracking. No ads. Only the AI analysis call leaves your browser.',
  };

  return (
    <footer className="border-t border-navy/10 bg-creme">
      {/* Privacy promise — brand foundation Kap. 04 "Lealtad: Wir schützen, was uns anvertraut wird." */}
      <div className="border-b border-navy/5 bg-white/40 py-5">
        <p className="mx-auto max-w-3xl px-5 text-center font-serif text-[15px] italic leading-snug text-graphit/65 sm:px-8 sm:text-base">
          {trust[locale]}
        </p>
      </div>

      {/* Site-nav columns — three groups so the footer reads like a
          proper colophon rather than a single closing line. */}
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark variant="monogram" size="md" tone="navy" decorative />
              <span className="wordmark text-lg text-navy" style={{ letterSpacing: '0.18em' }}>
                VOZ&nbsp;·&nbsp;CLARA
              </span>
            </div>
            <p className="mt-5 max-w-sm font-serif italic leading-relaxed text-graphit/65 sm:text-lg">
              {cols.tagline}
            </p>
          </div>

          {cols.groups.map((g, gi) => (
            <div key={gi}>
              <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
                {g.heading}
              </div>
              <ul className="mt-4 space-y-2.5 font-sans text-sm text-graphit/75">
                {g.items.map((it, i) => (
                  <li key={i}>
                    {it.href.startsWith('http') ? (
                      <a
                        href={it.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition hover:text-navy hover:underline underline-offset-4"
                      >
                        {it.label} ↗
                      </a>
                    ) : it.href.startsWith('#') ? (
                      <a href={it.href} className="transition hover:text-navy">
                        {it.label}
                      </a>
                    ) : (
                      <Link to={it.href} className="transition hover:text-navy">
                        {it.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-baseline justify-between gap-3 border-t border-navy/8 pt-6 font-sans text-[11px] tracking-wide text-graphit/55 sm:flex-row">
          <div className="italic">{t.footerBuiltBy}</div>
          <div className="wordmark text-[10px]">{t.footerTagline}</div>
        </div>
      </div>
    </footer>
  );
}

function footerColumns(locale: string) {
  if (locale.startsWith('es')) return {
    tagline: 'Nube multilingüe de conocimiento para vídeos. Guarda el conocimiento, no solo el vídeo.',
    groups: [
      {
        heading: 'Producto',
        items: [
          { label: 'Crear Knowledge Pack', href: '/new' },
          { label: 'Mi biblioteca', href: '/library' },
          { label: 'Pack de ejemplo', href: '/pack/sample' },
          { label: 'Cómo funciona', href: '/#how' },
        ],
      },
      {
        heading: 'Sobre',
        items: [
          { label: 'Sobre Voz Clara', href: '/about' },
          { label: 'Planes y precios', href: '/pricing' },
          { label: 'LEON MARÉ', href: 'https://leonmare.de' },
        ],
      },
      {
        heading: 'Legal',
        items: [
          { label: 'Privacidad', href: '/privacy' },
          { label: 'Términos', href: '/terms' },
          { label: 'GitHub', href: 'https://github.com/LeonMare/vozclara' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
  };
  if (locale.startsWith('pt')) return {
    tagline: 'Nuvem multilingue de conhecimento para vídeos. Guarda o conhecimento, não apenas o vídeo.',
    groups: [
      {
        heading: 'Produto',
        items: [
          { label: 'Criar Knowledge Pack', href: '/new' },
          { label: 'A minha biblioteca', href: '/library' },
          { label: 'Pack de exemplo', href: '/pack/sample' },
          { label: 'Como funciona', href: '/#how' },
        ],
      },
      {
        heading: 'Sobre',
        items: [
          { label: 'Sobre a Voz Clara', href: '/about' },
          { label: 'Planos e preços', href: '/pricing' },
          { label: 'LEON MARÉ', href: 'https://leonmare.de' },
        ],
      },
      {
        heading: 'Legal',
        items: [
          { label: 'Privacidade', href: '/privacy' },
          { label: 'Termos', href: '/terms' },
          { label: 'GitHub', href: 'https://github.com/LeonMare/vozclara' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
  };
  if (locale.startsWith('de')) return {
    tagline: 'Mehrsprachige Wissens-Cloud für Videos. Speichere das Wissen, nicht nur das Video.',
    groups: [
      {
        heading: 'Produkt',
        items: [
          { label: 'Knowledge Pack erstellen', href: '/new' },
          { label: 'Meine Bibliothek', href: '/library' },
          { label: 'Beispiel-Pack', href: '/pack/sample' },
          { label: 'So funktioniert es', href: '/#how' },
        ],
      },
      {
        heading: 'Über',
        items: [
          { label: 'Über Voz Clara', href: '/about' },
          { label: 'Preise', href: '/pricing' },
          { label: 'LEON MARÉ', href: 'https://leonmare.de' },
        ],
      },
      {
        heading: 'Rechtliches',
        items: [
          { label: 'Datenschutz', href: '/privacy' },
          { label: 'Nutzungsbedingungen', href: '/terms' },
          { label: 'GitHub', href: 'https://github.com/LeonMare/vozclara' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
  };
  return {
    tagline: 'Multilingual knowledge cloud for videos. Save the knowledge, not just the video.',
    groups: [
      {
        heading: 'Product',
        items: [
          { label: 'Create Knowledge Pack', href: '/new' },
          { label: 'My library', href: '/library' },
          { label: 'Sample pack', href: '/pack/sample' },
          { label: 'How it works', href: '/#how' },
        ],
      },
      {
        heading: 'About',
        items: [
          { label: 'About Voz Clara', href: '/about' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'LEON MARÉ', href: 'https://leonmare.de' },
        ],
      },
      {
        heading: 'Legal',
        items: [
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
          { label: 'GitHub', href: 'https://github.com/LeonMare/vozclara' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
  };
}
