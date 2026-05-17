import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';

/**
 * /impressum — Legal notice mandated by § 5 Telemediengesetz (TMG)
 * for any commercial-flavoured website operated from Germany. We
 * surface it on the LandingFooter and accept that EN/ES/PT users
 * never need it — but a German visitor (or, more importantly, a
 * Wettbewerber-Anwalt) clicking the footer needs to land here.
 *
 * The placeholders bracketed with [TODO …] need real values before
 * we accept any payment or run paid ads to .de visitors. Without
 * them the page is incomplete and the page itself is technically
 * non-compliant.
 */
export function ImpressumPage() {
  const { locale } = useLocale();
  const labels = impressumLabels(locale);

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

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

      <section className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14">
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
          § {labels.sectionLabel}
        </div>
        <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
          {labels.heroTitle}
        </h1>
        <div className="mt-6 h-px w-16 bg-gold" aria-hidden />
        <p className="mt-6 font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
          {labels.heroLead}
        </p>
      </section>

      <section className="bg-white/70 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.providerHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <div className="mt-6 space-y-2 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            <p>Christian Leon</p>
            <p>LEON MARÉ</p>
            <p>[TODO: Straße + Hausnummer]</p>
            <p>[TODO: PLZ] Frankfurt am Main</p>
            <p>{labels.country}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.contactHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <div className="mt-6 space-y-2 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            <p>
              {labels.emailLabel}:{' '}
              <a href="mailto:hola@vozclara.app" className="underline underline-offset-4 hover:text-gold">
                hola@vozclara.app
              </a>
            </p>
            <p className="text-base text-graphit/65">{labels.contactNote}</p>
          </div>
        </div>
      </section>

      <section className="bg-white/70 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.responsibilityHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-6 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            {labels.responsibilityBody}
          </p>
          <p className="mt-4 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            Christian Leon · [TODO: Straße] · [TODO: PLZ] Frankfurt am Main
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.disputeHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-6 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            {labels.disputeBody}
          </p>
          <p className="mt-4 font-sans text-sm text-graphit/65">
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-gold"
            >
              ec.europa.eu/consumers/odr
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

function impressumLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: 'Aviso legal — Voz Clara',
    headDescription: 'Aviso legal según § 5 TMG.',
    backHome: 'Volver a la página principal',
    sectionLabel: 'Aviso legal',
    heroTitle: 'Aviso legal.',
    heroLead: 'Información obligatoria según § 5 de la Ley alemana de Telemedios (TMG).',
    providerHeading: 'Responsable del sitio',
    country: 'Alemania',
    contactHeading: 'Contacto',
    emailLabel: 'Correo electrónico',
    contactNote: 'Respondemos a consultas legales y de privacidad. Las preguntas sobre el producto van más rápido a través del propio sitio.',
    responsibilityHeading: 'Responsable de contenido según § 18 MStV',
    responsibilityBody: 'El responsable del contenido editorial de este sitio según § 18 del Medienstaatsvertrag (MStV) es:',
    disputeHeading: 'Resolución de disputas en línea',
    disputeBody: 'La Comisión Europea ofrece una plataforma de resolución de disputas en línea (ODR). No estamos obligados ni dispuestos a participar en procedimientos de resolución de disputas ante una junta arbitral de consumidores.',
  };
  if (locale.startsWith('pt')) return {
    headTitle: 'Informações legais — Voz Clara',
    headDescription: 'Informações legais segundo § 5 TMG.',
    backHome: 'Voltar à página principal',
    sectionLabel: 'Informações legais',
    heroTitle: 'Informações legais.',
    heroLead: 'Informações obrigatórias segundo § 5 da Lei alemã de Telemédia (TMG).',
    providerHeading: 'Responsável pelo site',
    country: 'Alemanha',
    contactHeading: 'Contacto',
    emailLabel: 'E-mail',
    contactNote: 'Respondemos a questões legais e de privacidade. Perguntas sobre o produto vão mais rápido através do próprio site.',
    responsibilityHeading: 'Responsável pelo conteúdo segundo § 18 MStV',
    responsibilityBody: 'O responsável pelo conteúdo editorial deste site segundo § 18 do Medienstaatsvertrag (MStV) é:',
    disputeHeading: 'Resolução de litígios em linha',
    disputeBody: 'A Comissão Europeia disponibiliza uma plataforma de resolução de litígios em linha (ODR). Não somos obrigados nem estamos dispostos a participar em procedimentos de resolução de litígios perante uma comissão arbitral de consumidores.',
  };
  if (locale.startsWith('de')) return {
    headTitle: 'Impressum — Voz Clara',
    headDescription: 'Anbieterkennung gemäß § 5 TMG.',
    backHome: 'Zur Startseite',
    sectionLabel: 'Impressum',
    heroTitle: 'Impressum.',
    heroLead: 'Anbieterkennzeichnung gemäß § 5 Telemediengesetz (TMG).',
    providerHeading: 'Anbieter',
    country: 'Deutschland',
    contactHeading: 'Kontakt',
    emailLabel: 'E-Mail',
    contactNote: 'Wir antworten auf rechtliche Anfragen und Datenschutz-Themen. Produkt-Fragen gehen schneller über die App selbst.',
    responsibilityHeading: 'Inhaltlich verantwortlich gemäß § 18 MStV',
    responsibilityBody: 'Verantwortlich für den redaktionellen Inhalt dieser Seite gemäß § 18 Medienstaatsvertrag (MStV):',
    disputeHeading: 'Online-Streitbeilegung',
    disputeBody: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
  };
  return {
    headTitle: 'Legal notice — Voz Clara',
    headDescription: 'Legal notice (Impressum) per § 5 of the German Telemedia Act.',
    backHome: 'Back to home',
    sectionLabel: 'Legal notice',
    heroTitle: 'Legal notice.',
    heroLead: 'Mandatory disclosure under § 5 of the German Telemediengesetz (TMG).',
    providerHeading: 'Site operator',
    country: 'Germany',
    contactHeading: 'Contact',
    emailLabel: 'Email',
    contactNote: 'We answer legal and privacy questions here. Product questions go faster through the app itself.',
    responsibilityHeading: 'Editorially responsible under § 18 MStV',
    responsibilityBody: 'Responsible for the editorial content of this site under § 18 of the German Medienstaatsvertrag (MStV):',
    disputeHeading: 'Online dispute resolution',
    disputeBody: 'The European Commission provides an online dispute resolution platform (ODR). We are neither required nor willing to participate in dispute-resolution proceedings before a consumer arbitration body.',
  };
}
