import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractVideoId } from '../lib/youtube';
import { useLocale } from '../lib/i18n';
import { useMagneticHover } from '../hooks/useMagneticHover';
import { track, Events } from '../lib/analytics';
import { fetchFounderStatus, type FounderStatus } from '../lib/founder';

/**
 * /learn-spanish-with-youtube — Spanish is the 4th most-spoken
 * language and a huge learning market across Anglophone /
 * Germanophone / Lusophone audiences. Same pattern as the other
 * `/learn-X-with-youtube` SEO landings.
 *
 * Intent cluster:
 *   "learn spanish with youtube"
 *   "spanisch lernen mit youtube"
 *   "aprender espanhol com youtube"
 *   "learn spanish from youtube videos"
 *   "spanish youtube channels for learners"
 *
 * Conversion funnel: paste-URL → /new. Plausible source:
 * 'learn-spanish-with-youtube'.
 */
export function LearnSpanishWithYouTubePage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);
  const labels = learnSpanishLabels(locale);
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
    track(Events.PASTE_URL, { locale, source: 'learn-spanish-with-youtube' });
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
                placeholder={labels.placeholder}
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

        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.storyEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.storyTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-graphit/85">
            {labels.storyBody}
          </p>
          <p className="mt-4 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
            — Christian Leon · LEON MARÉ · Frankfurt
          </p>
        </section>

        <figure className="mt-12 overflow-hidden rounded-card border border-navy/10 shadow-card sm:mt-16">
          <img
            src="/anki-moment.png"
            alt={labels.imageAlt}
            loading="lazy"
            className="block h-auto w-full"
          />
        </figure>

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

        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.channelsEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.channelsTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {labels.channels.map((c, i) => (
              <li
                key={i}
                className="rounded-card border border-navy/10 bg-white px-5 py-4"
              >
                <div className="font-serif text-base text-navy">{c.name}</div>
                <div className="mt-1 font-sans text-[12px] text-graphit/65">{c.level} · {c.genre}</div>
                <p className="mt-2 font-sans text-sm text-graphit/75">{c.note}</p>
              </li>
            ))}
          </ul>
        </section>

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

        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm text-graphit/65 sm:mt-16">
          <Link
            to="/pack/sample-learn"
            className="italic underline-offset-4 transition hover:text-gold hover:underline"
          >
            {labels.sampleCta}
          </Link>
          <Link
            to="/youtube-to-anki"
            className="underline-offset-4 transition hover:text-navy hover:underline"
          >
            {labels.ankiCta}
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

function learnSpanishLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'APRENDE ESPAÑOL · VÍDEOS REALES',
    h1: 'Aprende español con los vídeos de YouTube que ya ves.',
    sub: 'Pega un enlace en español (RTVE, BBC Mundo, Easy Spanish, Dreaming Spanish). VozClara extrae vocabulario en contexto a tu nivel MCER, te lo entrega traducido, y exporta un mazo Anki listo para repasar mañana.',
    cta: 'Crear mi pack',
    placeholder: 'Pega un enlace de YouTube en español',
    trustNote: 'Gratis durante la beta. Sin registro. Listo al instante.',
    storyEyebrow: '§ Por qué existe esta página',
    storyTitle: 'El método natural, con el contenido que ya consumes.',
    storyBody:
      'Estamos diseñados para aprender idiomas con material real — no con apps gamificadas que olvidamos en una semana. VozClara convierte cualquier vídeo de YouTube en español en un pack de estudio personalizado: vocabulario en contexto, citas con timestamp, mazos Anki para repasar. La misma motor que mi pareja hispanohablante usa para alemán, ahora en sentido contrario para quienes aprenden español.',
    imageAlt: 'Cinco tarjetas Anki sobre cuero burdeos con pares de vocabulario español-inglés-alemán-portugués.',
    howEyebrow: '§ Cómo funciona',
    howTitle: 'Tres pasos. Cero fricción.',
    howSteps: [
      { title: 'Pega un vídeo en español', body: 'RTVE, BBC Mundo, Dreaming Spanish, Easy Spanish — cualquier vídeo público en español, de España o América Latina.' },
      { title: 'Elige tu nivel', body: 'A1 hasta C1 (MCER). El vocabulario se ajusta a tu nivel real.' },
      { title: 'Recibe tu pack', body: 'Resumen en tu idioma, vocabulario en contexto, citas con timestamp, mazo Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canales para empezar',
    channelsTitle: 'Cuatro canales por donde abrir la primera sessión.',
    channels: [
      { name: 'Dreaming Spanish', level: 'A1 → C1', genre: 'método natural', note: 'Comprehensible input. El canon para aprender por inmersión.' },
      { name: 'Easy Spanish', level: 'A2 → B2', genre: 'entrevistas calle', note: 'Conversaciones reales con subtítulos. Castellano + Latinoamérica.' },
      { name: 'BBC Mundo', level: 'B1 → C2', genre: 'noticias', note: 'Periodismo en español neutro. Vocabulario rico, ritmo profesional.' },
      { name: 'RTVE Noticias', level: 'B1 → C1', genre: 'noticias', note: 'Castellano peninsular estándar. La referencia para España.' },
    ],
    sampleCta: 'Ver un pack de muestra primero →',
    ankiCta: '¿Cómo es el mazo Anki que recibo?',
    backCta: 'Volver a VozClara',
  };

  if (locale.startsWith('pt')) return {
    eyebrow: 'APRENDE ESPANHOL · VÍDEOS REAIS',
    h1: 'Aprende espanhol com os vídeos do YouTube que já vês.',
    sub: 'Cola um link em espanhol (RTVE, BBC Mundo, Easy Spanish, Dreaming Spanish). VozClara extrai vocabulário em contexto ao teu nível QECR, entrega-o em português, e exporta um deck Anki pronto para rever amanhã.',
    cta: 'Criar o meu pack',
    placeholder: 'Cola um link de YouTube em espanhol',
    trustNote: 'Grátis durante a beta. Sem registo. Pronto num instante.',
    storyEyebrow: '§ Porque existe esta página',
    storyTitle: 'Espanhol e português são primos próximos — usemos isso a favor.',
    storyBody:
      'Para um falante de português, o espanhol está a meio caminho da fluência desde o primeiro dia. O que falta é vocabulário ativo, escuta refinada, e a confiança para sustentar conversas longas. VozClara transforma vídeos espanhóis que já vês — notícias da BBC Mundo, Easy Spanish, Dreaming Spanish — em packs de estudo personalizados com vocabulário em contexto e cartões Anki que cabem na semana real.',
    imageAlt: 'Cinco cartões Anki sobre cabedal cor-de-vinho com pares de vocabulário espanhol-português-inglês-alemão.',
    howEyebrow: '§ Como funciona',
    howTitle: 'Três passos. Zero atrito.',
    howSteps: [
      { title: 'Cola um vídeo em espanhol', body: 'RTVE, BBC Mundo, Dreaming Spanish, Easy Spanish — qualquer vídeo em espanhol, de Espanha ou da América Latina.' },
      { title: 'Escolhe o teu nível', body: 'A1 até C1 (QECR). O vocabulário ajusta-se ao teu nível real.' },
      { title: 'Recebe o teu pack', body: 'Resumo em português, vocabulário em contexto, citações com timestamp, deck Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canais para começar',
    channelsTitle: 'Quatro canais por onde abrir a primeira sessão.',
    channels: [
      { name: 'Dreaming Spanish', level: 'A1 → C1', genre: 'método natural', note: 'Comprehensible input. O cânone para aprender por imersão.' },
      { name: 'Easy Spanish', level: 'A2 → B2', genre: 'entrevistas de rua', note: 'Conversas reais com legendas. Espanha + América Latina.' },
      { name: 'BBC Mundo', level: 'B1 → C2', genre: 'notícias', note: 'Jornalismo em espanhol neutro. Vocabulário rico.' },
      { name: 'RTVE Notícias', level: 'B1 → C1', genre: 'notícias', note: 'Castelhano peninsular padrão. Referência para Espanha.' },
    ],
    sampleCta: 'Ver um pack de exemplo primeiro →',
    ankiCta: 'Como é o deck Anki que recebo?',
    backCta: 'Voltar à VozClara',
  };

  if (locale.startsWith('de')) return {
    eyebrow: 'SPANISCH LERNEN · ECHTE VIDEOS',
    h1: 'Lern Spanisch mit den YouTube-Videos die du eh schaust.',
    sub: 'Spanischen Link einfügen (RTVE, BBC Mundo, Easy Spanish, Dreaming Spanish). VozClara extrahiert Vokabular im Kontext auf deinem GER-Niveau, übersetzt es ins Deutsche, und exportiert ein Anki-Deck bereit zum Wiederholen.',
    cta: 'Meinen Pack erstellen',
    placeholder: 'Spanischen YouTube-Link einfügen',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Sofort startklar.',
    storyEyebrow: '§ Warum diese Seite existiert',
    storyTitle: 'Echtes Spanisch lernt man mit echtem Input.',
    storyBody:
      'Apps mit kleinen Lektionen bringen dich auf A1. Echtes Spanisch — die Sprache mit der du auf Mallorca verhandeln, in Barcelona dinieren, Pablo Iglesias verstehen kannst — braucht echten Input. VozClara verwandelt jedes spanische YouTube-Video, das du sowieso schauen würdest, in einen Lernpack mit Vokabular im Kontext, Zitaten mit Timestamp und einem Anki-Deck. Selbe Engine, die meine spanische Partnerin für Deutsch nutzt, jetzt in die andere Richtung.',
    imageAlt: 'Fünf Anki-Karten auf cordovanfarbenem Leder mit Vokabel-Paaren Spanisch-Deutsch-Englisch-Portugiesisch.',
    howEyebrow: '§ Wie es funktioniert',
    howTitle: 'Drei Schritte. Null Reibung.',
    howSteps: [
      { title: 'Spanisches Video einfügen', body: 'RTVE, BBC Mundo, Dreaming Spanish, Easy Spanish — jedes öffentliche spanische YouTube-Video, aus Spanien oder Lateinamerika.' },
      { title: 'Niveau wählen', body: 'A1 bis C1 (GER). Das Vokabular passt sich an dein echtes Niveau an.' },
      { title: 'Pack bekommen', body: 'Zusammenfassung auf Deutsch, Vokabular im Kontext, Zitate mit Timestamp, und ein .apkg-Anki-Deck.' },
    ],
    channelsEyebrow: '§ Kanäle zum Anfangen',
    channelsTitle: 'Vier Kanäle für die erste Session.',
    channels: [
      { name: 'Dreaming Spanish', level: 'A1 → C1', genre: 'natürliche Methode', note: 'Comprehensible input. Der Kanon für Immersions-Lernen.' },
      { name: 'Easy Spanish', level: 'A2 → B2', genre: 'Straßen-Interviews', note: 'Echte Gespräche mit Untertiteln. Spanien + Lateinamerika.' },
      { name: 'BBC Mundo', level: 'B1 → C2', genre: 'Nachrichten', note: 'Journalismus auf neutralem Spanisch. Reiches Vokabular.' },
      { name: 'RTVE Noticias', level: 'B1 → C1', genre: 'Nachrichten', note: 'Standard-Kastilianisch. Referenz für Spanien.' },
    ],
    sampleCta: 'Erst ein Sample-Pack anschauen →',
    ankiCta: 'Wie sieht das Anki-Deck aus?',
    backCta: 'Zurück zu VozClara',
  };

  return {
    eyebrow: 'LEARN SPANISH · REAL VIDEOS',
    h1: 'Learn Spanish with the YouTube videos you already watch.',
    sub: 'Paste a Spanish link (RTVE, BBC Mundo, Easy Spanish, Dreaming Spanish). VozClara extracts vocabulary in context at your CEFR level, delivers it in your language, and exports an Anki deck ready to review tomorrow.',
    cta: 'Create my pack',
    placeholder: 'Paste a Spanish YouTube link',
    trustNote: 'Free during beta. No signup. Start instantly.',
    storyEyebrow: '§ Why this page exists',
    storyTitle: 'You learn real Spanish from real Spanish.',
    storyBody:
      'App lessons get you to A1. Real Spanish — the language you negotiate with in Madrid, dine in across Barcelona, follow on RTVE — needs real input. VozClara turns any Spanish YouTube video you would have watched anyway into a study pack with vocabulary in context, timestamped quotes, and an Anki deck. Same engine my Spanish partner uses for German, now running in the other direction.',
    imageAlt: 'Five Anki flashcards on cordovan leather, Spanish-English / Spanish-German / Spanish-Portuguese vocabulary pairs.',
    howEyebrow: '§ How it works',
    howTitle: 'Three steps. Zero friction.',
    howSteps: [
      { title: 'Paste a Spanish video', body: 'RTVE, BBC Mundo, Dreaming Spanish, Easy Spanish — any public Spanish YouTube video, from Spain or Latin America.' },
      { title: 'Pick your level', body: 'A1 through C1 (CEFR). Vocabulary adjusts to what you can actually retain.' },
      { title: 'Receive your pack', body: 'Summary in your language, vocabulary in context, timestamped quotes, and an .apkg Anki deck.' },
    ],
    channelsEyebrow: '§ Channels to start with',
    channelsTitle: 'Four channels for your first session.',
    channels: [
      { name: 'Dreaming Spanish', level: 'A1 → C1', genre: 'natural method', note: 'Comprehensible input. The canon for immersion learning.' },
      { name: 'Easy Spanish', level: 'A2 → B2', genre: 'street interviews', note: 'Real conversations with subtitles. Spain + Latin America.' },
      { name: 'BBC Mundo', level: 'B1 → C2', genre: 'news', note: 'Journalism in neutral Spanish. Rich vocabulary.' },
      { name: 'RTVE Noticias', level: 'B1 → C1', genre: 'news', note: 'Standard Castilian Spanish. The Spain reference.' },
    ],
    sampleCta: 'See a sample pack first →',
    ankiCta: 'What does the Anki deck look like?',
    backCta: 'Back to VozClara',
  };
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
