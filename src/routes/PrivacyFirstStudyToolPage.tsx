import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractVideoId } from '../lib/youtube';
import { useLocale } from '../lib/i18n';
import { useMagneticHover } from '../hooks/useMagneticHover';
import { track, Events } from '../lib/analytics';

/**
 * /privacy-first-ai-study-tool — positioning page for the EU-tech +
 * privacy-conscious audience. Different from intent-volume landings:
 * this one ranks lower but converts the segment that cares about
 * tracking, EU hosting, GDPR, and the new EU AI Act.
 *
 * Intent cluster:
 *   "privacy first ai study tool"
 *   "no tracking ai learning"
 *   "gdpr ai study"
 *   "cookieless ai summarizer"
 *   "datenschutz lern-app"
 *
 * Conversion funnel: paste-URL → /new. Plausible source:
 * 'privacy-first'.
 */
export function PrivacyFirstStudyToolPage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);
  const labels = privacyLabels(locale);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = extractVideoId(value);
    if (!id) {
      if (!value.trim()) {
        navigate('/new');
        return;
      }
      setError(t.invalidUrl);
      return;
    }
    track(Events.PASTE_URL, { locale, source: 'privacy-first' });
    navigate(`/new?v=${id}`);
  }

  return (
    <main id="main" className="relative overflow-hidden bg-creme paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(201,162,75,0.16), transparent 55%), radial-gradient(ellipse at bottom left, rgba(10,26,58,0.06), transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
        <header>
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.eyebrow}
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
            {labels.h1}
          </h1>
          <div className="mt-5 h-px w-16 bg-gold draw-rule" aria-hidden />
          <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-graphit/80 sm:text-lg">
            {labels.sub}
          </p>

          <form onSubmit={handleSubmit} className="mt-7">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                aria-label={t.heroUrlInputLabel}
                placeholder={t.heroPlaceholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 rounded-card border border-navy/15 bg-white px-4 py-3.5 font-sans text-base text-graphit placeholder-graphit/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
              <button
                ref={ctaRef}
                type="submit"
                className="group relative rounded-card bg-navy px-6 py-3.5 font-sans text-base font-medium text-creme will-change-transform hover:bg-navy/90"
                style={{ transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease' }}
              >
                <span className="relative z-10">{labels.cta}</span>
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 font-sans text-sm text-red-700">{error}</p>
            )}
            <p className="mt-2.5 font-sans text-[12px] text-graphit/65">
              {labels.trustNote}
            </p>
          </form>
        </header>

        {/* Five privacy promises */}
        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.promisesEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.promisesTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {labels.promises.map((p, i) => (
              <li
                key={i}
                className="rounded-card border border-navy/10 bg-white p-5 sm:p-6"
              >
                <h3 className="font-serif text-lg text-navy">{p.name}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-graphit/75">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Vs the competition (without naming them) */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.compareEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.compareTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <div className="mt-6 overflow-hidden rounded-card border border-navy/15">
            <div className="grid grid-cols-3 gap-4 border-b border-navy/10 bg-creme/60 px-5 py-3 font-sans text-[11px] uppercase tracking-widest text-graphit/60 sm:px-6">
              <div></div>
              <div>{labels.dimTypical}</div>
              <div className="text-gold-deep">VozClara</div>
            </div>
            {labels.compareRows.map((row, i, arr) => (
              <div
                key={i}
                className={[
                  'grid grid-cols-3 gap-4 px-5 py-3 sm:px-6',
                  i < arr.length - 1 ? 'border-b border-navy/10' : '',
                ].join(' ')}
              >
                <div className="font-sans text-sm font-medium text-navy">{row.k}</div>
                <div className="font-sans text-sm text-graphit/65">{row.typical}</div>
                <div className="font-serif text-sm text-navy">{row.us}</div>
              </div>
            ))}
          </div>
        </section>

        {/* EU AI Act + subprocessors */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.complianceEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.complianceTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-3 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
            {labels.complianceSub}
          </p>
          <ul className="mt-6 space-y-3 font-sans text-sm leading-relaxed text-graphit/75">
            {labels.complianceItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-[7px] inline-block h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
                <span>
                  <span className="font-medium text-navy">{item.k}.</span> {item.v}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer CTAs */}
        <div className="mt-16 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm text-graphit/65 sm:mt-20">
          <Link
            to="/privacy"
            className="italic underline-offset-4 transition hover:text-gold hover:underline"
          >
            {labels.privacyCta}
          </Link>
          <Link
            to="/knowledge-packs"
            className="underline-offset-4 transition hover:text-navy hover:underline"
          >
            {labels.kpCta}
          </Link>
          <Link
            to="/"
            className="underline-offset-4 transition hover:text-navy hover:underline"
          >
            {labels.backCta}
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ─── Localised copy ──────────────────────────────────────────────── */

function privacyLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'PRIVACY-FIRST · SIN COOKIES · SIN TRACKING',
    h1: 'La herramienta de estudio que no te vende.',
    sub: 'Tu biblioteca de Knowledge Packs vive en tu navegador hasta que decidas crear cuenta. Sin cookies. Sin píxeles de tracking. Sin entrenamiento de modelos públicos con tu contenido. Construido en la UE bajo GDPR + EU AI Act.',
    cta: 'Probar anónimamente',
    trustNote: 'Gratis durante la beta. Sin registro. Sin cookies. Sin huella en servidores externos.',
    promisesEyebrow: '§ Cinco promesas',
    promisesTitle: 'Lo que esto significa concretamente.',
    promises: [
      { name: 'Biblioteca local-first', body: 'Tus packs se guardan en IndexedDB del navegador. Solo salen si tú creas cuenta y los sincronizas. Sin cuenta = los datos no salen nunca de tu dispositivo.' },
      { name: 'Cero cookies', body: 'No usamos cookies, ni propias ni de terceros. La autenticación es magic-link (sesión token, no cookie). El consentimiento de cookies no existe porque no hay cookies para consentir.' },
      { name: 'Analítica sin huella', body: 'Cloudflare Web Analytics + Plausible — ambos cookieless, sin fingerprinting, sin agregación cross-site. No sabemos quién eres entre visitas.' },
      { name: 'No entrenamos modelos públicos con tu contenido', body: 'Los packs que generas no se usan para entrenar Llama, Claude, ni ningún modelo accesible al público. Solo la inferencia de tu pack pasa por el LLM, no se persiste fuera de tu pack.' },
      { name: 'Borrado real, no soft delete', body: 'GDPR Art. 17 implementado de verdad. Borrar cuenta significa borrar sesiones, votos, reseñas, packs sincronizados — todo. Documentado en /privacy.' },
    ],
    compareEyebrow: '§ Comparación',
    compareTitle: 'Lo que típicamente hacen las apps tipo summarizer.',
    dimTypical: 'AI summarizer típica',
    compareRows: [
      { k: 'Cookies', typical: 'Banner de consentimiento obligatorio', us: 'Sin cookies, sin banner' },
      { k: 'Tracking', typical: 'Google Analytics + pixels + ad-tech', us: 'Solo analítica cookieless' },
      { k: 'Hosting', typical: 'Mayoría US-based', us: 'Cloudflare EU regions' },
      { k: 'Training data', typical: 'Términos vagos sobre uso', us: 'Tus packs no entrenan modelos públicos' },
      { k: 'Biblioteca', typical: 'Server-side desde día 1', us: 'IndexedDB local hasta que tú firmes' },
      { k: 'Borrado', typical: 'Soft delete, datos quedan', us: 'GDPR Art. 17 — borrado real' },
    ],
    complianceEyebrow: '§ Cumplimiento',
    complianceTitle: 'GDPR + EU AI Act, no marketing-compliance.',
    complianceSub: 'Cumplir GDPR y AI Act no es checkbox. Aquí los puntos concretos que VozClara implementa, con artículos referenciados.',
    complianceItems: [
      { k: 'GDPR Art. 13', v: 'Toda la información sobre el procesamiento de datos vive en /privacy. Subprocesadores listados explícitamente (Anthropic, Cloudflare, Supadata, Paddle, Resend).' },
      { k: 'GDPR Art. 17', v: 'Borrado de cuenta sweep elimina sesiones + votos + reseñas + packs sincronizados. Documentado en worker/src/auth.ts.' },
      { k: 'EU AI Act Art. 50(1)', v: 'Banner de transparencia se muestra en la primera generación de pack — el usuario sabe que está interactuando con AI.' },
      { k: 'EU AI Act Art. 50(2)', v: 'Cada export (.apkg, PDF, Markdown) lleva watermark "Generated by VozClara — vozclara.app" para distinguir contenido AI-generado.' },
      { k: 'Cookieless by design', v: 'Cloudflare Web Analytics + Plausible. Sin banner de cookies porque no usamos cookies.' },
    ],
    privacyCta: 'Política de privacidad completa →',
    kpCta: '¿Qué es un Knowledge Pack?',
    backCta: 'Volver a VozClara',
  };

  if (locale.startsWith('pt')) return {
    eyebrow: 'PRIVACY-FIRST · SEM COOKIES · SEM TRACKING',
    h1: 'A ferramenta de estudo que não te vende.',
    sub: 'A tua biblioteca de Knowledge Packs vive no teu navegador até decidires criar conta. Sem cookies. Sem píxeis de tracking. Sem treino de modelos públicos com o teu conteúdo. Construído na UE sob RGPD + EU AI Act.',
    cta: 'Experimentar anonimamente',
    trustNote: 'Grátis durante a beta. Sem registo. Sem cookies. Sem pegada em servidores externos.',
    promisesEyebrow: '§ Cinco promessas',
    promisesTitle: 'O que isto significa concretamente.',
    promises: [
      { name: 'Biblioteca local-first', body: 'Os teus packs guardam-se na IndexedDB do navegador. Só saem se criares conta e os sincronizares. Sem conta = os dados nunca saem do teu dispositivo.' },
      { name: 'Zero cookies', body: 'Não usamos cookies, nem próprias nem de terceiros. A autenticação é magic-link (token de sessão, não cookie). Não existe consentimento de cookies porque não há cookies.' },
      { name: 'Analítica sem pegada', body: 'Cloudflare Web Analytics + Plausible — ambos sem cookies, sem fingerprinting, sem agregação cross-site. Não sabemos quem és entre visitas.' },
      { name: 'Não treinamos modelos públicos com o teu conteúdo', body: 'Os packs que geras não são usados para treinar Llama, Claude, nem qualquer modelo acessível ao público. Só a inferência do teu pack passa pelo LLM, não fica persistida fora do teu pack.' },
      { name: 'Eliminação real, não soft delete', body: 'RGPD Art. 17 implementado a sério. Apagar conta significa apagar sessões, votos, comentários, packs sincronizados — tudo. Documentado em /privacy.' },
    ],
    compareEyebrow: '§ Comparação',
    compareTitle: 'O que as apps tipo summarizer normalmente fazem.',
    dimTypical: 'AI summarizer típica',
    compareRows: [
      { k: 'Cookies', typical: 'Banner de consentimento obrigatório', us: 'Sem cookies, sem banner' },
      { k: 'Tracking', typical: 'Google Analytics + pixels + ad-tech', us: 'Apenas analítica sem cookies' },
      { k: 'Hosting', typical: 'Maioria nos EUA', us: 'Cloudflare regiões UE' },
      { k: 'Training data', typical: 'Termos vagos sobre o uso', us: 'Os teus packs não treinam modelos públicos' },
      { k: 'Biblioteca', typical: 'Server-side desde o dia 1', us: 'IndexedDB local até assinares' },
      { k: 'Eliminação', typical: 'Soft delete, dados ficam', us: 'RGPD Art. 17 — eliminação real' },
    ],
    complianceEyebrow: '§ Conformidade',
    complianceTitle: 'RGPD + EU AI Act, não marketing-compliance.',
    complianceSub: 'Cumprir RGPD e AI Act não é checkbox. Aqui os pontos concretos que VozClara implementa, com artigos referenciados.',
    complianceItems: [
      { k: 'RGPD Art. 13', v: 'Toda a informação sobre processamento de dados vive em /privacy. Subprocessadores listados explicitamente (Anthropic, Cloudflare, Supadata, Paddle, Resend).' },
      { k: 'RGPD Art. 17', v: 'A eliminação de conta varre sessões + votos + comentários + packs sincronizados. Documentado em worker/src/auth.ts.' },
      { k: 'EU AI Act Art. 50(1)', v: 'O banner de transparência aparece na primeira geração de pack — o utilizador sabe que está a interagir com AI.' },
      { k: 'EU AI Act Art. 50(2)', v: 'Cada export (.apkg, PDF, Markdown) tem watermark "Generated by VozClara — vozclara.app" para distinguir conteúdo gerado por AI.' },
      { k: 'Cookieless by design', v: 'Cloudflare Web Analytics + Plausible. Sem banner de cookies porque não usamos cookies.' },
    ],
    privacyCta: 'Política de privacidade completa →',
    kpCta: 'O que é um Knowledge Pack?',
    backCta: 'Voltar à VozClara',
  };

  if (locale.startsWith('de')) return {
    eyebrow: 'PRIVACY-FIRST · OHNE COOKIES · OHNE TRACKING',
    h1: 'Das Lern-Tool das dich nicht verkauft.',
    sub: 'Deine Knowledge-Pack-Bibliothek lebt in deinem Browser bis du dich entscheidest, ein Konto zu erstellen. Keine Cookies. Keine Tracking-Pixel. Kein Training öffentlicher Modelle mit deinem Content. In der EU gebaut, unter DSGVO + EU AI Act.',
    cta: 'Anonym ausprobieren',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Ohne Cookies. Ohne Fußabdruck auf externen Servern.',
    promisesEyebrow: '§ Fünf Versprechen',
    promisesTitle: 'Was das konkret heißt.',
    promises: [
      { name: 'Bibliothek local-first', body: 'Deine Packs werden in der IndexedDB deines Browsers gespeichert. Sie verlassen das Gerät nur, wenn du dich entscheidest, ein Konto zu erstellen und zu synchronisieren. Ohne Konto = die Daten verlassen dein Gerät nie.' },
      { name: 'Null Cookies', body: 'Wir verwenden keine Cookies, weder eigene noch Drittanbieter. Die Authentifizierung erfolgt über Magic-Link (Session-Token, kein Cookie). Es gibt keine Cookie-Einwilligung, weil es keine Cookies gibt.' },
      { name: 'Analytics ohne Fußabdruck', body: 'Cloudflare Web Analytics + Plausible — beide cookieless, ohne Fingerprinting, ohne Cross-Site-Aggregation. Wir wissen zwischen Besuchen nicht, wer du bist.' },
      { name: 'Wir trainieren keine öffentlichen Modelle mit deinem Content', body: 'Die Packs die du generierst werden nicht zum Training von Llama, Claude oder irgendeinem öffentlich zugänglichen Modell verwendet. Nur die Inferenz für deinen Pack läuft durch das LLM, sie wird nicht außerhalb deines Packs persistiert.' },
      { name: 'Echte Löschung, kein Soft-Delete', body: 'DSGVO Art. 17 ernsthaft implementiert. Konto löschen heißt Sessions, Votes, Reviews, synchronisierte Packs — alles. Dokumentiert in /privacy.' },
    ],
    compareEyebrow: '§ Vergleich',
    compareTitle: 'Was typische Summarizer-Apps üblicherweise tun.',
    dimTypical: 'Typische AI-Summarizer',
    compareRows: [
      { k: 'Cookies', typical: 'Pflicht-Consent-Banner', us: 'Keine Cookies, kein Banner' },
      { k: 'Tracking', typical: 'Google Analytics + Pixel + Ad-Tech', us: 'Nur cookieless Analytics' },
      { k: 'Hosting', typical: 'Größtenteils US-basiert', us: 'Cloudflare EU-Regionen' },
      { k: 'Training-Daten', typical: 'Vage Nutzungsbedingungen', us: 'Deine Packs trainieren keine öffentlichen Modelle' },
      { k: 'Bibliothek', typical: 'Server-side ab Tag 1', us: 'IndexedDB lokal bis du signst' },
      { k: 'Löschung', typical: 'Soft-Delete, Daten bleiben', us: 'DSGVO Art. 17 — echte Löschung' },
    ],
    complianceEyebrow: '§ Compliance',
    complianceTitle: 'DSGVO + EU AI Act, kein Marketing-Compliance.',
    complianceSub: 'DSGVO und AI Act zu erfüllen ist keine Checkbox. Hier die konkreten Punkte die VozClara implementiert, mit referenzierten Artikeln.',
    complianceItems: [
      { k: 'DSGVO Art. 13', v: 'Alle Informationen zur Datenverarbeitung leben in /privacy. Subprozessoren explizit aufgelistet (Anthropic, Cloudflare, Supadata, Paddle, Resend).' },
      { k: 'DSGVO Art. 17', v: 'Konto-Löschung kehrt Sessions + Votes + Reviews + synchronisierte Packs aus. Dokumentiert in worker/src/auth.ts.' },
      { k: 'EU AI Act Art. 50(1)', v: 'Transparenz-Banner wird bei der ersten Pack-Generierung gezeigt — der Nutzer weiß, dass er mit AI interagiert.' },
      { k: 'EU AI Act Art. 50(2)', v: 'Jeder Export (.apkg, PDF, Markdown) trägt das Watermark "Generated by VozClara — vozclara.app" um AI-generierten Content zu kennzeichnen.' },
      { k: 'Cookieless by design', v: 'Cloudflare Web Analytics + Plausible. Kein Cookie-Banner weil keine Cookies.' },
    ],
    privacyCta: 'Vollständige Datenschutzerklärung →',
    kpCta: 'Was ist ein Knowledge Pack?',
    backCta: 'Zurück zu VozClara',
  };

  return {
    eyebrow: 'PRIVACY-FIRST · NO COOKIES · NO TRACKING',
    h1: 'The study tool that does not sell you.',
    sub: 'Your Knowledge Pack library lives in your browser until you decide to create an account. No cookies. No tracking pixels. No training of public models on your content. Built in the EU under GDPR + EU AI Act.',
    cta: 'Try anonymously',
    trustNote: 'Free during beta. No signup. No cookies. No footprint on external servers.',
    promisesEyebrow: '§ Five promises',
    promisesTitle: 'What this means concretely.',
    promises: [
      { name: 'Local-first library', body: "Your packs are saved in your browser's IndexedDB. They only leave the device if you choose to create an account and sync. No account = the data never leaves your device." },
      { name: 'Zero cookies', body: 'We use no cookies, first-party or third-party. Auth is magic-link (session token, not cookie). There is no cookie consent because there are no cookies.' },
      { name: 'Footprint-free analytics', body: 'Cloudflare Web Analytics + Plausible — both cookieless, no fingerprinting, no cross-site aggregation. We do not know who you are between visits.' },
      { name: 'We do not train public models on your content', body: 'The packs you generate are not used to train Llama, Claude, or any publicly accessible model. Only the inference for your pack runs through the LLM, and it is not persisted outside your pack.' },
      { name: 'Real deletion, not soft delete', body: 'GDPR Art. 17 implemented for real. Delete account means delete sessions, votes, reviews, synced packs — everything. Documented in /privacy.' },
    ],
    compareEyebrow: '§ Comparison',
    compareTitle: 'What typical summarizer apps usually do.',
    dimTypical: 'Typical AI summarizer',
    compareRows: [
      { k: 'Cookies', typical: 'Mandatory consent banner', us: 'No cookies, no banner' },
      { k: 'Tracking', typical: 'Google Analytics + pixels + ad-tech', us: 'Cookieless analytics only' },
      { k: 'Hosting', typical: 'Mostly US-based', us: 'Cloudflare EU regions' },
      { k: 'Training data', typical: 'Vague terms about usage', us: 'Your packs do not train public models' },
      { k: 'Library', typical: 'Server-side from day one', us: 'IndexedDB local until you sign up' },
      { k: 'Deletion', typical: 'Soft delete, data stays', us: 'GDPR Art. 17 — real deletion' },
    ],
    complianceEyebrow: '§ Compliance',
    complianceTitle: 'GDPR + EU AI Act, not marketing-compliance.',
    complianceSub: 'Complying with GDPR and the AI Act is not a checkbox. Here are the concrete points VozClara implements, with article references.',
    complianceItems: [
      { k: 'GDPR Art. 13', v: 'All information about data processing lives in /privacy. Subprocessors listed explicitly (Anthropic, Cloudflare, Supadata, Paddle, Resend).' },
      { k: 'GDPR Art. 17', v: 'Account deletion sweeps sessions + votes + reviews + synced packs. Documented in worker/src/auth.ts.' },
      { k: 'EU AI Act Art. 50(1)', v: 'Transparency banner shows on first pack generation — user knows they are interacting with AI.' },
      { k: 'EU AI Act Art. 50(2)', v: 'Every export (.apkg, PDF, Markdown) carries the watermark "Generated by VozClara — vozclara.app" to distinguish AI-generated content.' },
      { k: 'Cookieless by design', v: 'Cloudflare Web Analytics + Plausible. No cookie banner because no cookies.' },
    ],
    privacyCta: 'Full privacy policy →',
    kpCta: 'What is a Knowledge Pack?',
    backCta: 'Back to VozClara',
  };
}
