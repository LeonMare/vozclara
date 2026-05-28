import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractVideoId } from '../lib/youtube';
import { useLocale } from '../lib/i18n';
import { useMagneticHover } from '../hooks/useMagneticHover';
import { track, Events } from '../lib/analytics';
import { fetchFounderStatus, type FounderStatus } from '../lib/founder';

/**
 * /youtube-to-anki — the SEO landing page for the killer-feature
 * angle. Ranks for "YouTube to Anki", "convert YouTube to Anki deck",
 * "YouTube Anki export" intent queries. Conversion-funnel is the same
 * as the homepage hero (paste-URL → /new) but the page itself sells
 * exactly one promise — the .apkg generator — instead of the full
 * product surface area.
 *
 * Page composition:
 *   - hero with H1 matching the intent query
 *   - real product image (anki-moment.png) as visual proof
 *   - three-step how-it-works
 *   - card-format spec block (front/back/tags) so Anki users can
 *     evaluate fit without leaving the page
 *   - Founder Deal callout with live remaining-seats counter
 *   - secondary CTA to the sample Learn pack
 */
export function YouTubeToAnkiPage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);
  const labels = ankiLandingLabels(locale);
  const founderLabels = founderBannerLabels(locale);

  const [founderStatus, setFounderStatus] = useState<FounderStatus | null>(null);
  useEffect(() => {
    void fetchFounderStatus().then(setFounderStatus);
  }, []);
  const remaining =
    founderStatus && founderStatus.claimed !== null
      ? Math.max(0, founderStatus.max - founderStatus.claimed)
      : null;
  const founderAvailable = founderStatus?.available !== false;

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
    track(Events.PASTE_URL, { locale, source: 'youtube-to-anki' });
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
        {/* Hero */}
        <header>
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.eyebrow}
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
            {labels.h1}
          </h1>
          <div className="mt-5 h-px w-16 bg-gold draw-rule" aria-hidden />
          <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-graphit/80 sm:text-lg">
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

        {/* Visual proof */}
        <figure className="mt-12 overflow-hidden rounded-card border border-navy/10 shadow-card sm:mt-16">
          <img
            src="/anki-moment.png"
            alt={labels.imageAlt}
            loading="lazy"
            className="block h-auto w-full"
          />
        </figure>

        {/* How it works */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.howEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.howTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {labels.howSteps.map((step, i) => (
              <li
                key={i}
                className="rounded-card border border-navy/10 bg-white p-5 sm:p-6"
              >
                <span className="font-serif text-3xl leading-none text-gold/40 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-serif text-lg text-navy">{step.title}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-graphit/70">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Card format spec */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.specEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.specTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-3 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
            {labels.specSub}
          </p>
          <div className="mt-6 overflow-hidden rounded-card border border-navy/15">
            {labels.specRows.map((row, i) => (
              <div
                key={i}
                className={[
                  'grid grid-cols-[120px_1fr] gap-4 px-5 py-4 sm:px-6',
                  i < labels.specRows.length - 1 ? 'border-b border-navy/10' : '',
                ].join(' ')}
              >
                <div className="font-sans text-[11px] uppercase tracking-widest text-gold-deep">
                  {row.k}
                </div>
                <div className="font-serif text-sm leading-relaxed text-navy sm:text-base">
                  {row.v}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Founder Deal callout */}
        {founderAvailable && (
          <Link
            to="/founder"
            className="group mt-16 block rounded-card border border-gold/50 bg-creme p-5 shadow-card transition hover:border-gold hover:shadow-lg sm:mt-20 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
                    {founderLabels.eyebrow}
                  </span>
                  {remaining !== null && (
                    <span className="font-sans text-[11px] text-graphit/60">
                      {founderLabels.remaining(remaining)}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-serif text-2xl leading-tight text-navy sm:text-3xl">
                  {founderLabels.headline}
                </h3>
                <p className="mt-1 font-serif italic text-sm text-graphit/70 sm:text-base">
                  {founderLabels.sub}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-card bg-navy px-5 py-2.5 font-sans text-sm font-medium text-creme transition group-hover:bg-navy/90">
                {founderLabels.cta} <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        )}

        {/* Secondary CTAs */}
        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm text-graphit/65 sm:mt-16">
          <Link
            to="/pack/sample-learn"
            className="italic underline-offset-4 transition hover:text-gold hover:underline"
          >
            {labels.sampleCta}
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

function ankiLandingLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'YOUTUBE → ANKI · UN CLIC',
    h1: 'Convierte cualquier vídeo de YouTube en un mazo Anki.',
    sub: 'Pega un enlace, elige tu idioma. VozClara extrae vocabulario en contexto, lo empareja con tu traducción y exporta un archivo .apkg listo para AnkiDesktop, AnkiMobile o AnkiDroid.',
    cta: 'Crear mi mazo',
    trustNote: 'Gratis durante la beta. Sin registro. Listo al instante.',
    imageAlt: 'Cinco tarjetas Anki dispuestas sobre cuero color burdeos: das Wissen, la sabiduría, o conhecimento, die Weisheit, aprendizaje — cada una con su traducción al inglés.',
    howEyebrow: '§ Proceso',
    howTitle: 'Tres pasos. Cero fricción.',
    howSteps: [
      { title: 'Pega el enlace', body: 'Cualquier vídeo público de YouTube. Charlas, podcasts, noticias, vlogs.' },
      { title: 'Elige los idiomas', body: 'Idioma de origen y destino. ES · PT · DE · EN. Nivel MCER opcional.' },
      { title: 'Descarga el .apkg', body: 'Mazo Anki estándar con tarjetas en contexto y enlaces al segundo exacto.' },
    ],
    specEyebrow: '§ Formato de las tarjetas',
    specTitle: 'Tarjetas con contexto, no listas de palabras.',
    specSub: 'Cada tarjeta del mazo lleva la frase de origen, la traducción, el timestamp del vídeo y un enlace que regresa al momento exacto.',
    specRows: [
      { k: 'Anverso', v: 'Palabra de destino dentro de la frase de origen.' },
      { k: 'Reverso', v: 'Traducción a tu idioma + frase con timestamp + enlace de vuelta al segundo exacto.' },
      { k: 'Mazo', v: 'VozClara::<título-del-vídeo> (jerárquico).' },
      { k: 'Etiquetas', v: 'idioma-origen, idioma-destino, nivel-MCER, id-vídeo.' },
      { k: 'Compatibilidad', v: 'AnkiDesktop · AnkiMobile · AnkiDroid (probado con Anki 23.x).' },
    ],
    sampleCta: 'Mira un pack de muestra primero →',
    backCta: 'Volver a VozClara',
  };

  if (locale.startsWith('pt')) return {
    eyebrow: 'YOUTUBE → ANKI · UM CLIQUE',
    h1: 'Converte qualquer vídeo do YouTube num deck Anki.',
    sub: 'Cola um link, escolhe a tua língua. VozClara extrai vocabulário em contexto, emparelha-o com a tradução e exporta um ficheiro .apkg pronto para AnkiDesktop, AnkiMobile ou AnkiDroid.',
    cta: 'Criar o meu deck',
    trustNote: 'Grátis durante a beta. Sem registo. Pronto num instante.',
    imageAlt: 'Cinco cartões Anki sobre cabedal cor-de-vinho: das Wissen, la sabiduría, o conhecimento, die Weisheit, aprendizaje — cada um com a sua tradução para inglês.',
    howEyebrow: '§ Processo',
    howTitle: 'Três passos. Zero atrito.',
    howSteps: [
      { title: 'Cola o link', body: 'Qualquer vídeo público do YouTube. Palestras, podcasts, notícias, vlogs.' },
      { title: 'Escolhe as línguas', body: 'Língua de origem e destino. ES · PT · DE · EN. Nível QECR opcional.' },
      { title: 'Descarrega o .apkg', body: 'Deck Anki standard com cartões em contexto e ligações ao segundo exato.' },
    ],
    specEyebrow: '§ Formato dos cartões',
    specTitle: 'Cartões com contexto, não listas de palavras.',
    specSub: 'Cada cartão do deck traz a frase de origem, a tradução, o timestamp do vídeo e uma ligação que regressa ao momento exato.',
    specRows: [
      { k: 'Frente', v: 'Palavra-alvo dentro da frase de origem.' },
      { k: 'Verso', v: 'Tradução para a tua língua + frase com timestamp + ligação de volta ao segundo exato.' },
      { k: 'Deck', v: 'VozClara::<título-do-vídeo> (hierárquico).' },
      { k: 'Etiquetas', v: 'língua-origem, língua-destino, nível-QECR, id-vídeo.' },
      { k: 'Compatibilidade', v: 'AnkiDesktop · AnkiMobile · AnkiDroid (testado com Anki 23.x).' },
    ],
    sampleCta: 'Vê um pack de exemplo primeiro →',
    backCta: 'Voltar à VozClara',
  };

  if (locale.startsWith('de')) return {
    eyebrow: 'YOUTUBE → ANKI · EIN KLICK',
    h1: 'Verwandle jedes YouTube-Video in ein Anki-Deck.',
    sub: 'Link einfügen, Sprache wählen. VozClara extrahiert Vokabular im Satzkontext, paart es mit deiner Übersetzung und exportiert eine .apkg-Datei für AnkiDesktop, AnkiMobile oder AnkiDroid.',
    cta: 'Mein Deck erstellen',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Sofort startklar.',
    imageAlt: 'Fünf Anki-Karten auf cordovanfarbenem Leder: das Wissen, la sabiduría, o conhecimento, die Weisheit, aprendizaje — jede mit ihrer englischen Übersetzung.',
    howEyebrow: '§ Ablauf',
    howTitle: 'Drei Schritte. Null Reibung.',
    howSteps: [
      { title: 'Link einfügen', body: 'Jedes öffentliche YouTube-Video. Vorträge, Podcasts, Nachrichten, Vlogs.' },
      { title: 'Sprachen wählen', body: 'Quell- und Zielsprache. ES · PT · DE · EN. GER-Niveau optional.' },
      { title: '.apkg herunterladen', body: 'Standard-Anki-Deck mit Karten im Kontext und Links zur exakten Sekunde.' },
    ],
    specEyebrow: '§ Kartenformat',
    specTitle: 'Karten mit Kontext, keine Wortlisten.',
    specSub: 'Jede Karte trägt den Quellsatz, die Übersetzung, den Video-Timestamp und einen Link, der zurück zur exakten Sekunde springt.',
    specRows: [
      { k: 'Vorderseite', v: 'Zielwort im Satzkontext der Quelle.' },
      { k: 'Rückseite', v: 'Übersetzung in deiner Sprache + Satz mit Timestamp + Link zur exakten Sekunde.' },
      { k: 'Deck', v: 'VozClara::<Video-Titel> (hierarchisch).' },
      { k: 'Tags', v: 'Quellsprache, Zielsprache, GER-Niveau, Video-ID.' },
      { k: 'Kompatibel', v: 'AnkiDesktop · AnkiMobile · AnkiDroid (getestet mit Anki 23.x).' },
    ],
    sampleCta: 'Erst ein Sample-Pack anschauen →',
    backCta: 'Zurück zu VozClara',
  };

  return {
    eyebrow: 'YOUTUBE → ANKI · ONE CLICK',
    h1: 'Turn any YouTube video into an Anki deck.',
    sub: 'Paste a link, choose your language. VozClara extracts vocabulary in sentence context, pairs it with your translation, and exports a standard .apkg file ready for AnkiDesktop, AnkiMobile, or AnkiDroid.',
    cta: 'Generate my deck',
    trustNote: 'Free during beta. No signup. Start instantly.',
    imageAlt: 'Five Anki flashcards arranged on cordovan leather: das Wissen, la sabiduría, o conhecimento, die Weisheit, aprendizaje — each with its English translation.',
    howEyebrow: '§ Process',
    howTitle: 'Three steps. Zero friction.',
    howSteps: [
      { title: 'Paste the link', body: 'Any public YouTube video. Talks, podcasts, news, vlogs.' },
      { title: 'Pick the languages', body: 'Source and target. ES · PT · DE · EN. CEFR level optional.' },
      { title: 'Download the .apkg', body: 'Standard Anki deck with sentence-context cards and source-timestamp links.' },
    ],
    specEyebrow: '§ Card format',
    specTitle: 'Cards with context, not word lists.',
    specSub: 'Every card in the deck carries the source sentence, the translation, the video timestamp, and a link that jumps back to the exact second.',
    specRows: [
      { k: 'Front', v: 'Target word inside the source sentence.' },
      { k: 'Back', v: 'Translation in your language + sentence with timestamp + link back to the exact second.' },
      { k: 'Deck', v: 'VozClara::<video-title> (hierarchical).' },
      { k: 'Tags', v: 'source-language, target-language, CEFR-level, video-id.' },
      { k: 'Compatibility', v: 'AnkiDesktop · AnkiMobile · AnkiDroid (tested with Anki 23.x).' },
    ],
    sampleCta: 'Try a sample pack first →',
    backCta: 'Back to VozClara',
  };
}

/* Founder banner copy — duplicated from sections.tsx so this SEO
   landing can stand alone without importing the entire landing tree. */
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
