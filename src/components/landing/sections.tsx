/**
 * Landing-page sections — Problem, Solution, KnowledgePackPreview,
 * LibraryPreview, AskMyKnowledge, LanguageSection, Pricing.
 *
 * Each section follows the same editorial rhythm: § cipher + section
 * number, classical serif heading, gold rule, body. Variations in
 * background (creme vs white vs navy) create chapter breaks without
 * decorative noise.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../lib/i18n';
import { BrandMark } from '../BrandMark';
import { LandingAskDemo } from './LandingAskDemo';
import { WaitlistButton } from '../WaitlistButton';
import { type Audience, getAudience, setAudience } from '../../lib/audience';

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
              <div className="font-sans text-[10px] uppercase tracking-widest text-gold-deep tabular-nums">
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
                <span className="text-graphit/65 tabular-nums">{m.lang}</span>
              </div>
              <h3 className="mt-3 font-serif text-lg leading-snug text-navy">{m.title}</h3>
              <div className="mt-3 h-px w-6 bg-gold/50" aria-hidden />
              <div className="mt-3 inline-flex items-baseline gap-1.5 font-sans text-[11px]">
                <span className="text-graphit/65">·</span>
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
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
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
        <div className="mt-5 font-sans text-sm tracking-widest text-graphit/65">
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

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
          {t.tiers.map((tier, i) => {
            const isFeatured = i === 1; // Pro tier highlighted
            const isFree = i === 0;
            // Honest CTA copy: Free works today; the Pro tier is on a
            // waitlist because the cross-device sync + Stripe billing
            // it requires haven't shipped yet.
            const ctaCopy = isFree ? ctaLabels.startFree : ctaLabels.waitlist;
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
                <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/65">
                  {tier.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-4xl text-navy">{tier.price}</span>
                  <span className="font-sans text-xs text-graphit/65">{tier.period}</span>
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
                  <WaitlistButton
                    ctaCopy={ctaCopy}
                    source={`pricing-${tier.name.split(' ')[0].toLowerCase()}`}
                    variant={isFeatured ? 'featured' : 'default'}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Honest tag — say it out loud */}
        <p className="mt-8 text-center font-serif italic text-sm text-graphit/65">
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
/* ─── 07·b · Language-learner toolkit (Anki / SRS / Shadow / Chat) ──── */

export function LanguageLearnerToolkit() {
  const { locale } = useLocale();
  const heading = toolkitHeading(locale);
  const features = toolkitFeatures(locale);

  return (
    <section className="border-t border-navy/10 bg-creme paper py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionEyebrow number="07·b" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {heading.title}
        </h2>
        <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-3 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
          {heading.sub}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-card border border-navy/15 bg-white px-5 py-5"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-sm text-gold tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="font-serif text-lg text-navy">{f.title}</div>
              </div>
              <p className="mt-2 ml-8 font-sans text-sm leading-relaxed text-graphit/70">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function toolkitHeading(locale: string): { title: string; sub: string } {
  if (locale.startsWith('es')) return {
    title: 'Hecho para quienes aprenden idiomas.',
    sub: 'No solo resúmenes. Cada Pack es material crudo de práctica — Anki, repetición espaciada, shadowing, conversación con un tutor.',
  };
  if (locale.startsWith('pt')) return {
    title: 'Feito para quem aprende idiomas.',
    sub: 'Não apenas resumos. Cada Pack é matéria-prima para prática — Anki, repetição espaçada, shadowing, conversa com um tutor.',
  };
  if (locale.startsWith('de')) return {
    title: 'Für Sprachen-Lerner gebaut.',
    sub: 'Nicht nur Zusammenfassungen. Jeder Pack ist Übungsmaterial — Anki, Spaced Repetition, Nachsprechen, Gespräch mit einem Tutor.',
  };
  return {
    title: 'Built for language learners.',
    sub: 'Not just summaries. Every Pack is practice material — Anki, spaced repetition, shadowing, conversation with a tutor.',
  };
}

interface ToolkitFeature { title: string; body: string }
function toolkitFeatures(locale: string): ToolkitFeature[] {
  if (locale.startsWith('es')) return [
    { title: 'Exporta a Anki', body: 'Cada lista de vocabulario se descarga como mazo .apkg con un clic. Tarjetas bilaterales, contexto y fuente incluidos. Ningún otro lector de YouTube exporta directo a Anki.' },
    { title: 'Repetición espaciada nativa', body: 'Las tarjetas vencen, las repasas, el algoritmo SM-2 calcula el próximo intervalo. Racha visible. Sin salir de la app.' },
    { title: 'Shadowing con voz', body: 'Escucha la frase, repítela en voz alta, recibe una puntuación de pronunciación. Web Speech API — la grabación nunca sale del dispositivo.' },
    { title: 'Tutor IA sobre tu Pack', body: 'Habla con un compañero nativo sobre el vídeo que acabas de ver — corrige con suavidad, hace preguntas, usa el vocabulario del Pack.' },
  ];
  if (locale.startsWith('pt')) return [
    { title: 'Exporta para Anki', body: 'Cada lista de vocabulário descarrega como baralho .apkg num clique. Cartões bilaterais, contexto e fonte incluídos. Nenhum outro leitor de YouTube exporta direto para Anki.' },
    { title: 'Repetição espaçada nativa', body: 'Os cartões vencem, tu revês, o algoritmo SM-2 calcula o próximo intervalo. Sequência visível. Sem sair da app.' },
    { title: 'Shadowing com voz', body: 'Ouve a frase, repete em voz alta, recebe uma pontuação de pronúncia. Web Speech API — a gravação nunca sai do dispositivo.' },
    { title: 'Tutor IA sobre o teu Pack', body: 'Conversa com um parceiro nativo sobre o vídeo que acabaste de ver — corrige com suavidade, faz perguntas, usa o vocabulário do Pack.' },
  ];
  if (locale.startsWith('de')) return [
    { title: 'Anki-Export in einem Klick', body: 'Jede Vokabel-Liste lädt sich als .apkg-Deck herunter. Beidseitige Karten, Kontext und Quelle inklusive. Kein anderes YouTube-Tool exportiert direkt nach Anki.' },
    { title: 'Native Spaced Repetition', body: 'Karten werden fällig, du wiederholst, der SM-2-Algorithmus berechnet das nächste Intervall. Sichtbarer Streak. Ohne die App zu verlassen.' },
    { title: 'Shadowing mit Stimme', body: 'Hör den Satz, sprich ihn nach, bekomm einen Aussprache-Score. Web Speech API — die Aufnahme verlässt nie dein Gerät.' },
    { title: 'KI-Tutor zu deinem Pack', body: 'Sprich mit einem Native-Speaker-Tutor über das Video das du gerade gesehen hast — sanfte Korrekturen, Rückfragen, nutzt das Pack-Vokabular.' },
  ];
  return [
    { title: 'Export to Anki in one click', body: 'Every vocabulary list downloads as a real .apkg deck. Two-sided cards, context and source included. No other YouTube tool exports directly to Anki.' },
    { title: 'Native spaced repetition', body: 'Cards come due, you review, the SM-2 algorithm sets the next interval. Visible streak. Without leaving the app.' },
    { title: 'Voice shadowing', body: 'Hear the sentence, repeat it out loud, get a pronunciation score. Web Speech API — the recording never leaves your device.' },
    { title: 'AI tutor on your Pack', body: 'Talk to a native-speaker tutor about the video you just watched — gentle corrections, follow-up questions, uses the Pack vocabulary.' },
  ];
}

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
    title: 'A tua biblioteca, sob o teu controlo.',
    sub: 'A VozClara não é uma rede social. Não é um feed público. É o seu arquivo privado de conhecimento — e fica assim.',
  };
  if (lang.startsWith('de')) return {
    title: 'Deine Bibliothek, unter deiner Kontrolle.',
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
    { title: 'Biblioteca privada', body: 'Os teus packs vivem no teu dispositivo. Não os vemos, não os indexamos, não os partilhamos.' },
    { title: 'A fonte fica visível', body: 'Cada pack tem link para o vídeo original. A atribuição nunca se perde.' },
    { title: 'Sem publicidade', body: 'Sem anúncios. Sem trackers de terceiros. Sem perfis comerciais.' },
    { title: 'Sem feed público', body: 'O que guardas não é publicado em lado nenhum. Tu decides o que partilhar.' },
    { title: 'Tu controlas os teus packs', body: 'Editar, exportar, eliminar — sempre a um clique.' },
    { title: 'Só a IA sai do navegador', body: 'A análise por IA viaja ao modelo. Nada mais. O transcript e a biblioteca ficam locais.' },
  ];
  if (lang.startsWith('de')) return [
    { title: 'Private Bibliothek', body: 'Deine Packs leben auf deinem Gerät. Wir sehen sie nicht, indizieren sie nicht, teilen sie nicht.' },
    { title: 'Die Quelle bleibt sichtbar', body: 'Jeder Pack verlinkt zum Original-Video. Die Attribution geht nie verloren.' },
    { title: 'Keine Werbung', body: 'Keine Anzeigen. Keine Third-Party-Tracker. Kein Profiling.' },
    { title: 'Kein öffentlicher Feed', body: 'Was du speicherst wird nirgends veröffentlicht. Du entscheidest was du teilst.' },
    { title: 'Du kontrollierst deine Packs', body: 'Bearbeiten, exportieren, löschen — immer einen Klick entfernt.' },
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
        'mb-3 font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep',
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
        <p className="mt-5 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
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
    pt: 'A tua biblioteca permanece no teu dispositivo. Sem rastreio. Sem anúncios. Apenas a análise por IA sai do teu navegador.',
    de: 'Deine Bibliothek bleibt auf deinem Gerät. Kein Tracking. Keine Werbung. Nur die KI-Analyse verlässt deinen Browser.',
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
              <div className="font-sans text-[10px] uppercase tracking-widest text-gold-deep">
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

        <div className="mt-10 flex flex-col items-baseline justify-between gap-3 border-t border-navy/8 pt-6 font-sans text-[11px] tracking-wide text-graphit/65 sm:flex-row">
          <div className="italic">{t.footerBuiltBy}</div>
          <div className="wordmark text-[10px]">{t.footerTagline}</div>
        </div>
      </div>
    </footer>
  );
}

function footerColumns(locale: string) {
  if (locale.startsWith('es')) return {
    tagline: 'Guarda las ideas de cada vídeo — buscable, multilingüe, tuyo.',
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
          { label: 'Sobre VozClara', href: '/about' },
          { label: 'Founder Deal · €99', href: '/founder' },
          { label: 'Planes y precios', href: '/pricing' },
          { label: 'Cambios', href: '/changelog' },
          { label: 'LEON MARÉ', href: 'https://leonmare.de' },
        ],
      },
      {
        heading: 'Legal',
        items: [
          { label: 'Privacidad', href: '/privacy' },
          { label: 'Términos', href: '/terms' },
          { label: 'Aviso legal', href: '/impressum' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
  };
  if (locale.startsWith('pt')) return {
    tagline: 'Guarda as ideias de cada vídeo — pesquisável, multilingue, teu.',
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
          { label: 'Sobre a VozClara', href: '/about' },
          { label: 'Founder Deal · €99', href: '/founder' },
          { label: 'Planos e preços', href: '/pricing' },
          { label: 'Alterações', href: '/changelog' },
          { label: 'LEON MARÉ', href: 'https://leonmare.de' },
        ],
      },
      {
        heading: 'Legal',
        items: [
          { label: 'Privacidade', href: '/privacy' },
          { label: 'Termos', href: '/terms' },
          { label: 'Informações legais', href: '/impressum' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
  };
  if (locale.startsWith('de')) return {
    tagline: 'Speicher die Ideen aus jedem Video — durchsuchbar, mehrsprachig, deins.',
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
          { label: 'Über VozClara', href: '/about' },
          { label: 'Founder Deal · €99', href: '/founder' },
          { label: 'Preise', href: '/pricing' },
          { label: 'Changelog', href: '/changelog' },
          { label: 'LEON MARÉ', href: 'https://leonmare.de' },
        ],
      },
      {
        heading: 'Rechtliches',
        items: [
          { label: 'Datenschutz', href: '/privacy' },
          { label: 'Nutzungsbedingungen', href: '/terms' },
          { label: 'Impressum', href: '/impressum' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
  };
  return {
    tagline: 'Save the ideas from every video — searchable, multilingual, yours.',
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
          { label: 'About VozClara', href: '/about' },
          { label: 'Founder Deal · €99', href: '/founder' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Changelog', href: '/changelog' },
          { label: 'LEON MARÉ', href: 'https://leonmare.de' },
        ],
      },
      {
        heading: 'Legal',
        items: [
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
          { label: 'Imprint', href: '/impressum' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
  };
}

/* ─── § 01·c · Audience Tiles ─────────────────────────────────────────────
   Three doors into the same product. The Hero stays universal
   ("Stop losing what you watch"); this section is where each visitor
   self-selects into the value prop that matches them. Keeping it
   close to the Hero so the framing lands before the abstract pitch.
─────────────────────────────────────────────────────────────────────────── */
export function AudienceTiles() {
  const { locale } = useLocale();
  const heading = audienceHeading(locale);
  const tiles = audienceTiles(locale);
  const labels = audienceCtaLabels(locale);

  // The picker lives in client-only state. On first render after
  // hydration it reads localStorage so the visitor's previous choice
  // re-highlights when they come back. `mounted` gates the read so
  // SSR / pre-hydration paint stays consistent across runs.
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<Audience | null>(null);
  useEffect(() => {
    setMounted(true);
    setSelected(getAudience());
  }, []);

  function pick(a: Audience) {
    setAudience(a);
    setSelected(a);
  }

  return (
    <section className="border-t border-navy/10 bg-creme paper py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionEyebrow number="01·c" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {heading.title}
        </h2>
        <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-3 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
          {heading.sub}
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {tiles.map((t, i) => {
            const isSelected = mounted && selected === t.audience;
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(t.audience)}
                aria-pressed={isSelected}
                className={[
                  'group flex flex-col rounded-card border bg-white px-5 py-6 text-left transition sm:px-6 sm:py-7',
                  isSelected
                    ? 'border-gold ring-2 ring-gold/30 shadow-card -translate-y-0.5'
                    : 'border-navy/15 hover:border-gold/60 hover:-translate-y-0.5',
                ].join(' ')}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-base text-gold tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-xl leading-tight text-navy">
                    {t.title}
                  </h3>
                  {isSelected && (
                    <span className="ml-auto rounded-full bg-gold/15 px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest text-gold-deep">
                      {labels.selectedBadge}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-sans text-sm leading-relaxed text-graphit/75">
                  {t.body}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {t.bullets.map((b, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 font-sans text-sm leading-relaxed text-graphit/65"
                    >
                      <span className="mt-[7px] inline-block h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
                <span
                  className={[
                    'mt-5 font-sans text-xs underline-offset-4 transition',
                    isSelected ? 'text-gold' : 'text-graphit/65 group-hover:text-navy group-hover:underline',
                  ].join(' ')}
                >
                  {isSelected ? labels.confirmed : labels.pickCta}
                </span>
              </button>
            );
          })}
        </div>

        {/* Once an audience is picked, surface a quiet line that
            explains what just happened — sets expectation that the
            Generator will now default to a matching mode. */}
        {mounted && selected && (
          <p className="mt-6 font-sans text-sm italic text-graphit/65">
            {labels.confirmedTail}
          </p>
        )}
      </div>
    </section>
  );
}

interface AudienceTile { audience: Audience; title: string; body: string; bullets: string[] }
function audienceHeading(locale: string): { title: string; sub: string } {
  if (locale.startsWith('es')) return {
    title: 'Tres formas de usar VozClara.',
    sub: 'Un mismo producto. Tres puertas de entrada según para qué lo necesites.',
  };
  if (locale.startsWith('pt')) return {
    title: 'Três formas de usar VozClara.',
    sub: 'O mesmo produto. Três portas de entrada consoante para o que precisas.',
  };
  if (locale.startsWith('de')) return {
    title: 'Drei Wege, VozClara zu nutzen.',
    sub: 'Ein Produkt. Drei Eingangstüren — je nachdem wofür du es brauchst.',
  };
  return {
    title: 'Three ways to use VozClara.',
    sub: 'One product. Three doors in — depending on what you need it for.',
  };
}
function audienceTiles(locale: string): AudienceTile[] {
  if (locale.startsWith('es')) return [
    {
      audience: 'language',
      title: 'Aprende un idioma con vídeo real.',
      body: 'Guarda noticias en alemán, podcasts en inglés, vlogs en portugués. Recibe vocabulario adaptado a tu nivel, citas clave y material de práctica.',
      bullets: ['Vocabulario por nivel MCER (A1–C1)', 'Shadowing y pronunciación', 'Exportación a Anki en un clic'],
    },
    {
      audience: 'news',
      title: 'No vuelvas a perder una idea.',
      body: 'Guarda charlas, podcasts, grabaciones de conferencias. Busca a través de toda tu biblioteca. Cita con timestamps que vuelven al segundo exacto.',
      bullets: ['Búsqueda en toda tu biblioteca', 'Citas con marca de tiempo', 'Exportación a Notion/Markdown (pronto)'],
    },
    {
      audience: 'study',
      title: 'Estudia desde las clases que ya ves.',
      body: 'Convierte una clase de dos horas en notas estructuradas. Repásalo con repetición espaciada. Cita cualquier afirmación en segundos.',
      bullets: ['Resumen por capítulos', 'Modo quiz (pronto)', 'Citas en formato APA/MLA'],
    },
  ];
  if (locale.startsWith('pt')) return [
    {
      audience: 'language',
      title: 'Aprende um idioma com vídeo real.',
      body: 'Guarda notícias em alemão, podcasts em inglês, vlogs em espanhol. Recebe vocabulário adaptado ao teu nível, citações-chave e material de prática.',
      bullets: ['Vocabulário por nível QECR (A1–C1)', 'Shadowing e pronúncia', 'Exportação para Anki num clique'],
    },
    {
      audience: 'news',
      title: 'Nunca mais percas uma ideia.',
      body: 'Guarda palestras, podcasts, gravações de conferências. Pesquisa em toda a tua biblioteca. Cita com timestamps que voltam ao segundo exato.',
      bullets: ['Pesquisa em toda a biblioteca', 'Citações com marca temporal', 'Exportação para Notion/Markdown (em breve)'],
    },
    {
      audience: 'study',
      title: 'Estuda a partir das aulas que já vês.',
      body: 'Transforma uma aula de duas horas em notas estruturadas. Revê com repetição espaçada. Cita qualquer afirmação em segundos.',
      bullets: ['Resumo por capítulos', 'Modo quiz (em breve)', 'Citações em formato APA/MLA'],
    },
  ];
  if (locale.startsWith('de')) return [
    {
      audience: 'language',
      title: 'Lern eine Sprache mit echtem Video.',
      body: 'Speichere Tagesschau, spanische Podcasts, englische YouTuber. Bekomm Vokabular auf deinem Niveau, Schlüssel-Zitate und Übungs-Material.',
      bullets: ['Vokabular nach GER-Niveau (A1–C1)', 'Shadowing & Aussprache', 'Anki-Export in einem Klick'],
    },
    {
      audience: 'news',
      title: 'Verlier nie wieder einen Gedanken.',
      body: 'Speichere Vorträge, Podcasts, Konferenz-Aufnahmen. Suche durch deine ganze Bibliothek. Zitiere mit Timestamps die zum genauen Moment springen.',
      bullets: ['Suche über deine ganze Bibliothek', 'Zitate mit Timestamp', 'Export nach Notion/Markdown (bald)'],
    },
    {
      audience: 'study',
      title: 'Studier aus den Vorlesungen die du eh schaust.',
      body: 'Verwandle 2-Stunden-Vorlesungen in strukturierte Notizen. Wiederhol sie mit Spaced Repetition. Zitiere jede Aussage in Sekunden.',
      bullets: ['Kapitelweise Zusammenfassungen', 'Quiz-Modus (bald)', 'Zitate im APA-/MLA-Format'],
    },
  ];
  return [
    {
      audience: 'language',
      title: 'Learn a language from real video.',
      body: 'Save German news, Spanish podcasts, French YouTubers. Get vocabulary tuned to your level, key quotes, and practice material.',
      bullets: ['Vocabulary by CEFR level (A1–C1)', 'Shadowing & pronunciation', 'Anki export in one click'],
    },
    {
      audience: 'news',
      title: 'Never lose an idea again.',
      body: 'Save talks, podcasts, conference recordings. Search across your entire library. Quote with timestamps that jump back to the exact second.',
      bullets: ['Searchable across your library', 'Citations with timestamps', 'Export to Notion / Markdown (soon)'],
    },
    {
      audience: 'study',
      title: 'Study from the lectures you already watch.',
      body: 'Turn a 2-hour lecture into structured notes. Review with spaced repetition. Cite anything in seconds.',
      bullets: ['Chapter-by-chapter summaries', 'Quiz mode (soon)', 'APA / MLA citation format'],
    },
  ];
}

/* ─── § 08·b · Why not just ChatGPT? ──────────────────────────────────────
   The objection lives in every visitor's head. Better to name it
   explicitly than let them close the tab. Surfaces VozClara's actual
   moats: persistence, search, multilingual tuning, practice modes.
─────────────────────────────────────────────────────────────────────────── */
/**
 * Pick / Selected / Selected-badge copy for the AudienceTiles
 * interactive state. Separate function from audienceTiles() so the
 * static content stays small and grep-able.
 */
function audienceCtaLabels(locale: string) {
  if (locale.startsWith('es')) return {
    pickCta: 'Esto es lo mío →',
    confirmed: 'Tu elección activa',
    selectedBadge: 'Activo',
    confirmedTail: 'Listo. El generador se abrirá con el modo recomendado preseleccionado.',
  };
  if (locale.startsWith('pt')) return {
    pickCta: 'Isto é para mim →',
    confirmed: 'A tua escolha activa',
    selectedBadge: 'Ativo',
    confirmedTail: 'Pronto. O gerador vai abrir com o modo recomendado pré-selecionado.',
  };
  if (locale.startsWith('de')) return {
    pickCta: 'Das ist meins →',
    confirmed: 'Deine aktive Wahl',
    selectedBadge: 'Aktiv',
    confirmedTail: 'Erledigt. Der Generator öffnet sich mit dem passenden Modus vorausgewählt.',
  };
  return {
    pickCta: 'This is me →',
    confirmed: 'Your active choice',
    selectedBadge: 'Active',
    confirmedTail: "Done. The Generator opens with the matching mode preselected.",
  };
}

export function WhyNotChatGPT() {
  const { locale } = useLocale();
  const heading = whyNotHeading(locale);
  const rows = whyNotRows(locale);

  return (
    <section className="border-t border-navy/10 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionEyebrow number="08·b" />
        <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {heading.title}
        </h2>
        <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-3 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
          {heading.sub}
        </p>

        <div className="mt-10 overflow-hidden rounded-card border border-navy/15">
          <div className="grid grid-cols-[1fr_1fr] border-b border-navy/10 bg-creme/60">
            <div className="px-4 py-3 font-sans text-[11px] uppercase tracking-[0.25em] text-graphit/60 sm:px-6">
              {heading.colChatGPT}
            </div>
            <div className="border-l border-navy/10 px-4 py-3 font-sans text-[11px] uppercase tracking-[0.25em] text-gold sm:px-6">
              {heading.colVozClara}
            </div>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className={[
                'grid grid-cols-[1fr_1fr]',
                i < rows.length - 1 ? 'border-b border-navy/10' : '',
              ].join(' ')}
            >
              <div className="px-4 py-4 font-sans text-sm leading-relaxed text-graphit/65 sm:px-6 sm:py-5">
                {row.chatgpt}
              </div>
              <div className="border-l border-navy/10 px-4 py-4 font-serif text-sm leading-relaxed text-navy sm:px-6 sm:py-5">
                {row.vozclara}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-2xl font-sans text-sm leading-relaxed text-graphit/60">
          {heading.footnote}
        </p>
      </div>
    </section>
  );
}

interface WhyNotRow { chatgpt: string; vozclara: string }
function whyNotHeading(locale: string): {
  title: string; sub: string; colChatGPT: string; colVozClara: string; footnote: string;
} {
  if (locale.startsWith('es')) return {
    title: 'ChatGPT olvida. VozClara recuerda.',
    sub: 'Sí, puedes pegar un enlace de YouTube en ChatGPT. Pero hay tres cosas que ChatGPT no hace — y que aquí son el núcleo del producto.',
    colChatGPT: 'ChatGPT',
    colVozClara: 'VozClara',
    footnote: 'No es una crítica a ChatGPT — es una herramienta general. VozClara es la capa de conocimiento sobre todo lo que ves: persistente, buscable, multilingüe, tuya.',
  };
  if (locale.startsWith('pt')) return {
    title: 'O ChatGPT esquece. VozClara lembra.',
    sub: 'Sim, podes colar um link do YouTube no ChatGPT. Mas há três coisas que o ChatGPT não faz — e que aqui são o núcleo do produto.',
    colChatGPT: 'ChatGPT',
    colVozClara: 'VozClara',
    footnote: 'Não é uma crítica ao ChatGPT — é uma ferramenta geral. VozClara é a camada de conhecimento sobre tudo o que vês: persistente, pesquisável, multilingue, tua.',
  };
  if (locale.startsWith('de')) return {
    title: 'ChatGPT vergisst. VozClara erinnert sich.',
    sub: 'Klar, du kannst einen YouTube-Link in ChatGPT einfügen. Aber drei Dinge macht ChatGPT nicht — und genau das ist hier der Kern.',
    colChatGPT: 'ChatGPT',
    colVozClara: 'VozClara',
    footnote: 'Keine Kritik an ChatGPT — es ist ein Allzweck-Werkzeug. VozClara ist die Wissens-Schicht über allem was du schaust: persistent, durchsuchbar, mehrsprachig, deins.',
  };
  return {
    title: 'ChatGPT forgets. VozClara remembers.',
    sub: 'Sure, you can paste a YouTube link into ChatGPT. But there are three things ChatGPT doesn’t do — and that’s exactly what VozClara is built for.',
    colChatGPT: 'ChatGPT',
    colVozClara: 'VozClara',
    footnote: 'Not a knock on ChatGPT — it’s a general tool. VozClara is the knowledge layer over everything you watch: persistent, searchable, multilingual, yours.',
  };
}
function whyNotRows(locale: string): WhyNotRow[] {
  if (locale.startsWith('es')) return [
    { chatgpt: 'Una conversación, después desaparece.', vozclara: 'Biblioteca persistente, buscable durante años.' },
    { chatgpt: 'Pegas el mismo enlace una y otra vez.', vozclara: 'Un enlace = un Pack, guardado para siempre.' },
    { chatgpt: 'Resúmenes genéricos.', vozclara: 'Ajustado a tu idioma, tu nivel, tu objetivo.' },
    { chatgpt: 'Sin práctica, sin SRS, sin shadowing.', vozclara: 'Anki, repetición espaciada, voz, conversación con tutor — todo dentro.' },
  ];
  if (locale.startsWith('pt')) return [
    { chatgpt: 'Uma conversa, depois desaparece.', vozclara: 'Biblioteca persistente, pesquisável durante anos.' },
    { chatgpt: 'Colas o mesmo link vezes sem conta.', vozclara: 'Um link = um Pack, guardado para sempre.' },
    { chatgpt: 'Resumos genéricos.', vozclara: 'Ajustado à tua língua, ao teu nível, ao teu objetivo.' },
    { chatgpt: 'Sem prática, sem SRS, sem shadowing.', vozclara: 'Anki, repetição espaçada, voz, conversa com tutor — tudo dentro.' },
  ];
  if (locale.startsWith('de')) return [
    { chatgpt: 'Ein Gespräch, dann ist es weg.', vozclara: 'Persistente Bibliothek, jahrelang durchsuchbar.' },
    { chatgpt: 'Du fügst denselben Link immer wieder ein.', vozclara: 'Ein Link = ein Pack, für immer gespeichert.' },
    { chatgpt: 'Generische Zusammenfassungen.', vozclara: 'Zugeschnitten auf deine Sprache, dein Niveau, dein Ziel.' },
    { chatgpt: 'Keine Praxis, kein SRS, kein Shadowing.', vozclara: 'Anki, Spaced Repetition, Stimme, Tutor-Gespräch — alles drin.' },
  ];
  return [
    { chatgpt: 'One conversation, then it’s gone.', vozclara: 'Persistent library, searchable for years.' },
    { chatgpt: 'You paste the same link over and over.', vozclara: 'One link = one Pack, saved forever.' },
    { chatgpt: 'Generic summaries.', vozclara: 'Tuned to your language, your level, your goal.' },
    { chatgpt: 'No practice, no SRS, no shadowing.', vozclara: 'Anki, spaced repetition, voice, tutor chat — all in.' },
  ];
}
