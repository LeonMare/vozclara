import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractVideoId } from '../lib/youtube';
import { useLocale } from '../lib/i18n';
import { useMagneticHover } from '../hooks/useMagneticHover';
import { track, Events } from '../lib/analytics';
import { fetchFounderStatus, type FounderStatus } from '../lib/founder';

/**
 * /learn-english-with-youtube — the broadest-market SEO landing.
 * Native German / Spanish / Portuguese speakers (and anyone else
 * who wants their native-language summary of English content) form
 * the largest target audience by far. Same engine as /learn-german
 * but the direction is reversed: source = English, output =
 * learner's native.
 *
 * Intent cluster:
 *   "learn english with youtube"
 *   "englisch lernen mit youtube"
 *   "aprender inglés con youtube"
 *   "aprender inglês com youtube"
 *   "english learning youtube channels"
 *
 * Conversion funnel: paste-URL → /new (same as homepage hero).
 * Plausible event source: 'learn-english-with-youtube'.
 */
export function LearnEnglishWithYouTubePage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);
  const labels = learnEnglishLabels(locale);
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
    track(Events.PASTE_URL, { locale, source: 'learn-english-with-youtube' });
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

        {/* Founder-story-adapted block — same authenticity beat as the
            German page but framed so it lands for English-learning
            visitors too. */}
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

function learnEnglishLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'APRENDE INGLÉS · VÍDEOS REALES',
    h1: 'Aprende inglés con los vídeos de YouTube que ya ves.',
    sub: 'Pega un enlace en inglés (TED, Vox, BBC, Veritasium). VozClara extrae vocabulario en contexto a tu nivel MCER, te lo entrega en español, y exporta un mazo Anki listo para repasar mañana.',
    cta: 'Crear mi pack',
    placeholder: 'Pega un enlace de YouTube en inglés',
    trustNote: 'Gratis durante la beta. Sin registro. Listo al instante.',
    storyEyebrow: '§ Por qué existe esta página',
    storyTitle: 'Construido para gente que vive entre dos idiomas.',
    storyBody:
      'VozClara nació porque mi pareja, hispanohablante, quería entender contenido alemán sin esperar años para hablar alemán bien. Después notamos que mucha más gente quería lo mismo en otras direcciones — alemanes que ven TED, españoles que siguen Vox, portugueses que escuchan podcasts de la BBC. Mismo motor, misma promesa: el contenido que ya ves, en tu idioma, con vocabulario que se queda.',
    imageAlt: 'Cinco tarjetas Anki sobre cuero burdeos con pares de vocabulario inglés-español-portugués-alemán: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
    howEyebrow: '§ Cómo funciona',
    howTitle: 'Tres pasos. Cero fricción.',
    howSteps: [
      { title: 'Pega un vídeo en inglés', body: 'TED Talk, Vox explainer, BBC News, Veritasium — cualquier vídeo público de YouTube en inglés.' },
      { title: 'Elige tu nivel', body: 'A1 hasta C1 (MCER). El vocabulario se ajusta a lo que realmente puedes asimilar.' },
      { title: 'Recibe tu pack', body: 'Resumen en español, vocabulario en contexto, citas con timestamp, y un mazo Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canales para empezar',
    channelsTitle: 'Cuatro canales por donde abrir la primera sesión.',
    channels: [
      { name: 'TED Talks', level: 'B1 → C1', genre: 'charlas curadas', note: 'Charlas de 15 minutos. Hablantes claros, inglés estándar.' },
      { name: 'Vox', level: 'B2 → C1', genre: 'explainers', note: 'Periodismo explicativo moderno. Vocabulario rico, ritmo razonable.' },
      { name: 'BBC News', level: 'B1 → C2', genre: 'noticias', note: 'Inglés británico estándar. La referencia para escuchar prensa.' },
      { name: 'Veritasium', level: 'B2 → C1', genre: 'ciencia', note: 'Ciencia explicada con inglés accesible. Vocabulario técnico útil.' },
    ],
    sampleCta: 'Ver un pack de muestra primero →',
    ankiCta: '¿Cómo es el mazo Anki que recibo?',
    backCta: 'Volver a VozClara',
  };

  if (locale.startsWith('pt')) return {
    eyebrow: 'APRENDE INGLÊS · VÍDEOS REAIS',
    h1: 'Aprende inglês com os vídeos do YouTube que já vês.',
    sub: 'Cola um link em inglês (TED, Vox, BBC, Veritasium). VozClara extrai vocabulário em contexto ao teu nível QECR, entrega-o em português, e exporta um deck Anki pronto para rever amanhã.',
    cta: 'Criar o meu pack',
    placeholder: 'Cola um link de YouTube em inglês',
    trustNote: 'Grátis durante a beta. Sem registo. Pronto num instante.',
    storyEyebrow: '§ Porque existe esta página',
    storyTitle: 'Construído para quem vive entre duas línguas.',
    storyBody:
      'VozClara nasceu porque a minha companheira, lusófona-em-Espanha, queria perceber conteúdo alemão sem esperar anos por fluência. Depois reparámos que muito mais gente queria o mesmo noutras direções — alemães que vêem TED, espanhóis que seguem Vox, portugueses que ouvem podcasts da BBC. O mesmo motor, a mesma promessa: o conteúdo que já vês, na tua língua, com vocabulário que fica.',
    imageAlt: 'Cinco cartões Anki sobre cabedal cor-de-vinho com pares de vocabulário inglês-português-espanhol-alemão.',
    howEyebrow: '§ Como funciona',
    howTitle: 'Três passos. Zero atrito.',
    howSteps: [
      { title: 'Cola um vídeo em inglês', body: 'TED Talk, Vox explainer, BBC News, Veritasium — qualquer vídeo público em inglês.' },
      { title: 'Escolhe o teu nível', body: 'A1 até C1 (QECR). O vocabulário ajusta-se ao que realmente consegues absorver.' },
      { title: 'Recebe o teu pack', body: 'Resumo em português, vocabulário em contexto, citações com timestamp, e um deck Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canais para começar',
    channelsTitle: 'Quatro canais por onde abrir a primeira sessão.',
    channels: [
      { name: 'TED Talks', level: 'B1 → C1', genre: 'palestras curadas', note: 'Palestras de 15 minutos. Oradores claros, inglês padrão.' },
      { name: 'Vox', level: 'B2 → C1', genre: 'explainers', note: 'Jornalismo explicativo moderno. Vocabulário rico.' },
      { name: 'BBC News', level: 'B1 → C2', genre: 'notícias', note: 'Inglês britânico padrão. A referência para imprensa falada.' },
      { name: 'Veritasium', level: 'B2 → C1', genre: 'ciência', note: 'Ciência explicada em inglês acessível. Vocabulário técnico útil.' },
    ],
    sampleCta: 'Ver um pack de exemplo primeiro →',
    ankiCta: 'Como é o deck Anki que recebo?',
    backCta: 'Voltar à VozClara',
  };

  if (locale.startsWith('de')) return {
    eyebrow: 'ENGLISCH LERNEN · ECHTE VIDEOS',
    h1: 'Lern Englisch mit den YouTube-Videos die du eh schaust.',
    sub: 'Englischen Link einfügen (TED, Vox, BBC, Veritasium). VozClara extrahiert Vokabular im Kontext auf deinem GER-Niveau, übersetzt es ins Deutsche, und exportiert ein Anki-Deck bereit zum Wiederholen.',
    cta: 'Meinen Pack erstellen',
    placeholder: 'Englischen YouTube-Link einfügen',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Sofort startklar.',
    storyEyebrow: '§ Warum diese Seite existiert',
    storyTitle: 'Gebaut für Leute die zwischen zwei Sprachen leben.',
    storyBody:
      'VozClara entstand weil meine Partnerin, Spanisch-Muttersprachlerin, deutsches Inhalt verstehen wollte ohne erst jahrelang Deutsch zu lernen. Dann merkten wir dass viel mehr Leute das gleiche in anderen Richtungen wollen — Deutsche die TED schauen, Spanier die Vox folgen, Portugiesen die BBC-Podcasts hören. Selbe Engine, selbes Versprechen: der Content den du eh schaust, in deiner Sprache, mit Vokabular das bleibt.',
    imageAlt: 'Fünf Anki-Karten auf cordovanfarbenem Leder mit Vokabel-Paaren Englisch-Deutsch-Spanisch-Portugiesisch.',
    howEyebrow: '§ Wie es funktioniert',
    howTitle: 'Drei Schritte. Null Reibung.',
    howSteps: [
      { title: 'Englisches Video einfügen', body: 'TED Talk, Vox-Erklärung, BBC News, Veritasium — jedes öffentliche englische YouTube-Video.' },
      { title: 'Niveau wählen', body: 'A1 bis C1 (GER). Das Vokabular passt sich an was du realistisch behalten kannst.' },
      { title: 'Pack bekommen', body: 'Zusammenfassung auf Deutsch, Vokabular im Kontext, Zitate mit Timestamp, und ein .apkg-Anki-Deck.' },
    ],
    channelsEyebrow: '§ Kanäle zum Anfangen',
    channelsTitle: 'Vier Kanäle für die erste Session.',
    channels: [
      { name: 'TED Talks', level: 'B1 → C1', genre: 'kuratierte Vorträge', note: '15-Minuten-Vorträge. Klare Sprecher, Standard-Englisch.' },
      { name: 'Vox', level: 'B2 → C1', genre: 'Erklärungen', note: 'Modernes erklärendes Journalismus. Reichhaltiges Vokabular.' },
      { name: 'BBC News', level: 'B1 → C2', genre: 'Nachrichten', note: 'Britisches Standard-Englisch. Referenz für gesprochene Presse.' },
      { name: 'Veritasium', level: 'B2 → C1', genre: 'Wissenschaft', note: 'Wissenschaft erklärt in zugänglichem Englisch.' },
    ],
    sampleCta: 'Erst ein Sample-Pack anschauen →',
    ankiCta: 'Wie sieht das Anki-Deck aus?',
    backCta: 'Zurück zu VozClara',
  };

  return {
    eyebrow: 'LEARN ENGLISH · REAL VIDEOS',
    h1: 'Learn English with the YouTube videos you already watch.',
    sub: 'Paste an English link (TED, Vox, BBC, Veritasium). VozClara extracts vocabulary in context at your CEFR level, delivers it in your language, and exports an Anki deck ready to review tomorrow.',
    cta: 'Create my pack',
    placeholder: 'Paste an English YouTube link',
    trustNote: 'Free during beta. No signup. Start instantly.',
    storyEyebrow: '§ Why this page exists',
    storyTitle: 'Built for people who live between two languages.',
    storyBody:
      'VozClara started because my partner, a Spanish speaker, wanted to follow German content without spending years to fluency. Then we noticed plenty of other people wanted the same in other directions — Germans watching TED, Spaniards following Vox, Portuguese listening to BBC podcasts. Same engine, same promise: the content you already watch, in your language, with vocabulary that sticks.',
    imageAlt: 'Five Anki flashcards arranged on cordovan leather, vocabulary pairs in English / Spanish / Portuguese / German.',
    howEyebrow: '§ How it works',
    howTitle: 'Three steps. Zero friction.',
    howSteps: [
      { title: 'Paste an English video', body: 'TED Talk, Vox explainer, BBC News, Veritasium — any public English YouTube video.' },
      { title: 'Pick your level', body: 'A1 through C1 (CEFR). Vocabulary adjusts to what you can realistically retain.' },
      { title: 'Receive your pack', body: 'Summary in your language, vocabulary in context, timestamped quotes, and an .apkg Anki deck.' },
    ],
    channelsEyebrow: '§ Channels to start with',
    channelsTitle: 'Four channels for your first session.',
    channels: [
      { name: 'TED Talks', level: 'B1 → C1', genre: 'curated talks', note: 'Fifteen-minute talks. Clear speakers, standard English.' },
      { name: 'Vox', level: 'B2 → C1', genre: 'explainers', note: 'Modern explanatory journalism. Rich vocabulary, sane pace.' },
      { name: 'BBC News', level: 'B1 → C2', genre: 'news', note: 'British standard English. The reference for spoken press.' },
      { name: 'Veritasium', level: 'B2 → C1', genre: 'science', note: 'Science explained in accessible English. Useful technical vocabulary.' },
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
