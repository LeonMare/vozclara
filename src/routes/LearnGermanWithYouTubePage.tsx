import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractVideoId } from '../lib/youtube';
import { useLocale } from '../lib/i18n';
import { useMagneticHover } from '../hooks/useMagneticHover';
import { track, Events } from '../lib/analytics';
import { fetchFounderStatus, type FounderStatus } from '../lib/founder';

/**
 * /learn-german-with-youtube — the most founder-story-aligned SEO
 * landing page. VozClara exists because Christian's Spanish-speaking
 * partner wanted to consume German news without spending years
 * learning the language first. This page targets exactly that
 * audience: Spanish speakers in Germany (and adjacent markets) who
 * want German vocabulary from the videos they're already watching.
 *
 * Intent cluster:
 *   "learn german with youtube"
 *   "deutsch lernen mit youtube"
 *   "aprender alemán con youtube"
 *   "german learning youtube channels"
 *   "youtube german vocabulary"
 *
 * Conversion funnel: paste-URL → /new (same as homepage hero).
 * Plausible event source: 'learn-german-with-youtube'.
 */
export function LearnGermanWithYouTubePage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);
  const labels = learnGermanLabels(locale);
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
    track(Events.PASTE_URL, { locale, source: 'learn-german-with-youtube' });
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

        {/* Founder-story block — the unique angle this page leans on */}
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

        {/* Visual proof — reuse the anki-moment image since it
            already shows German vocab pairs (das Wissen / die Weisheit)
            in the card stack */}
        <figure className="mt-12 overflow-hidden rounded-card border border-navy/10 shadow-card sm:mt-16">
          <img
            src="/anki-moment.png"
            alt={labels.imageAlt}
            loading="lazy"
            className="block h-auto w-full"
          />
        </figure>

        {/* How it works — language-learning-specific framing */}
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

        {/* Suggested channels — concrete starting points */}
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

function learnGermanLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'APRENDE ALEMÁN · VÍDEOS REALES',
    h1: 'Aprende alemán con los vídeos de YouTube que ya ves.',
    sub: 'Pega un enlace alemán (Tagesschau, podcasts, documentales). VozClara extrae vocabulario en contexto a tu nivel MCER, te lo entrega en español, y exporta un mazo Anki listo para repasar mañana.',
    cta: 'Crear mi pack',
    placeholder: 'Pega un enlace de YouTube en alemán',
    trustNote: 'Gratis durante la beta. Sin registro. Listo al instante.',
    storyEyebrow: '§ Por qué existe esta página',
    storyTitle: 'Construido por un alemán para su pareja española.',
    storyBody:
      'Mi pareja es hispanohablante, vivimos en Frankfurt. Quería entender la Tagesschau, podcasts de Wirtschaft, documentales históricos — sin esperar años para hablar alemán bien. Lo que existía era o demasiado tonto (resúmenes copy-paste sin estructura) o demasiado genérico (ChatGPT olvida el hilo en cinco minutos). Construí VozClara para ella. Ahora la abrimos a otros que viven entre alemán y español.',
    imageAlt: 'Cinco tarjetas Anki sobre cuero burdeos con pares de vocabulario alemán-inglés y alemán-español: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
    howEyebrow: '§ Cómo funciona',
    howTitle: 'Tres pasos. Cero fricción.',
    howSteps: [
      { title: 'Pega un vídeo alemán', body: 'Tagesschau, ZDF, Easy German, Doktor Whatson, MrWissen2go — cualquier vídeo público de YouTube en alemán.' },
      { title: 'Elige tu nivel', body: 'A1 hasta C1 (MCER). El vocabulario se ajusta a lo que realmente puedes asimilar, no a lo que el LLM cree que es interesante.' },
      { title: 'Recibe tu pack', body: 'Resumen en español, vocabulario en contexto, citas con timestamp, y un mazo Anki .apkg para repasar.' },
    ],
    channelsEyebrow: '§ Canales para empezar',
    channelsTitle: 'Cuatro canales por donde abrir la primera sesión.',
    channels: [
      { name: 'Tagesschau', level: 'B1 → C1', genre: 'noticias', note: 'Noticias diarias en alemán claro. El estándar de pronunciación.' },
      { name: 'Doktor Whatson', level: 'B2 → C1', genre: 'ciencia', note: 'Divulgación científica con vocabulario académico moderno.' },
      { name: 'Easy German', level: 'A2 → B2', genre: 'entrevistas calle', note: 'Conversaciones reales transcritas. Diseñado para extranjeros.' },
      { name: 'MrWissen2go', level: 'B1 → C1', genre: 'historia + política', note: 'Explicaciones rápidas. Vocabulario muy frecuente en prensa.' },
    ],
    sampleCta: 'Ver un pack alemán de muestra →',
    ankiCta: '¿Cómo es el mazo Anki que recibo?',
    backCta: 'Volver a VozClara',
  };

  if (locale.startsWith('pt')) return {
    eyebrow: 'APRENDE ALEMÃO · VÍDEOS REAIS',
    h1: 'Aprende alemão com os vídeos do YouTube que já vês.',
    sub: 'Cola um link alemão (Tagesschau, podcasts, documentários). VozClara extrai vocabulário em contexto ao teu nível QECR, entrega-o em português, e exporta um deck Anki pronto para rever amanhã.',
    cta: 'Criar o meu pack',
    placeholder: 'Cola um link de YouTube em alemão',
    trustNote: 'Grátis durante a beta. Sem registo. Pronto num instante.',
    storyEyebrow: '§ Porque existe esta página',
    storyTitle: 'Construído por um alemão para a sua parceira espanhola.',
    storyBody:
      'A minha companheira é hispanófona, vivemos em Frankfurt. Queria perceber a Tagesschau, podcasts económicos, documentários históricos — sem esperar anos por fluência em alemão. O que existia era demasiado simplista (resumos copy-paste sem estrutura) ou demasiado genérico (ChatGPT esquece o fio em cinco minutos). Construí VozClara para ela. Agora abrimo-la a outros que vivem entre alemão e a sua língua-mãe.',
    imageAlt: 'Cinco cartões Anki sobre cabedal cor-de-vinho com pares de vocabulário alemão-inglês e alemão-português: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
    howEyebrow: '§ Como funciona',
    howTitle: 'Três passos. Zero atrito.',
    howSteps: [
      { title: 'Cola um vídeo alemão', body: 'Tagesschau, ZDF, Easy German, Doktor Whatson, MrWissen2go — qualquer vídeo público do YouTube em alemão.' },
      { title: 'Escolhe o teu nível', body: 'A1 até C1 (QECR). O vocabulário ajusta-se ao que realmente consegues absorver.' },
      { title: 'Recebe o teu pack', body: 'Resumo em português, vocabulário em contexto, citações com timestamp, e um deck Anki .apkg para rever.' },
    ],
    channelsEyebrow: '§ Canais para começar',
    channelsTitle: 'Quatro canais por onde abrir a primeira sessão.',
    channels: [
      { name: 'Tagesschau', level: 'B1 → C1', genre: 'notícias', note: 'Notícias diárias em alemão claro. Padrão de pronúncia.' },
      { name: 'Doktor Whatson', level: 'B2 → C1', genre: 'ciência', note: 'Divulgação científica com vocabulário académico moderno.' },
      { name: 'Easy German', level: 'A2 → B2', genre: 'entrevistas de rua', note: 'Conversas reais com legendas. Pensado para estrangeiros.' },
      { name: 'MrWissen2go', level: 'B1 → C1', genre: 'história + política', note: 'Explicações rápidas. Vocabulário muito frequente na imprensa.' },
    ],
    sampleCta: 'Ver um pack alemão de exemplo →',
    ankiCta: 'Como é o deck Anki que recebo?',
    backCta: 'Voltar à VozClara',
  };

  if (locale.startsWith('de')) return {
    eyebrow: 'DEUTSCH LERNEN · ECHTE VIDEOS',
    h1: 'Lern Deutsch mit den YouTube-Videos die du eh schaust.',
    sub: 'Füg einen deutschen Link ein (Tagesschau, Podcasts, Doku). VozClara extrahiert Vokabular im Kontext auf deinem GER-Niveau, übersetzt es in deine Sprache, und exportiert ein Anki-Deck bereit zum Wiederholen.',
    cta: 'Meinen Pack erstellen',
    placeholder: 'Deutschen YouTube-Link einfügen',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Sofort startklar.',
    storyEyebrow: '§ Warum diese Seite existiert',
    storyTitle: 'Gebaut von einem Deutschen für seine spanische Partnerin.',
    storyBody:
      'Meine Partnerin ist Spanisch-Muttersprachlerin, wir leben in Frankfurt. Sie wollte die Tagesschau verstehen, Wirtschaftspodcasts, historische Dokus — ohne erst jahrelang Deutsch zu lernen. Was es gab war entweder zu schlicht (Copy-paste-Zusammenfassungen ohne Struktur) oder zu generisch (ChatGPT vergisst den Faden nach fünf Minuten). Ich hab VozClara für sie gebaut. Jetzt öffnen wir es für andere die zwischen Deutsch und ihrer Muttersprache leben.',
    imageAlt: 'Fünf Anki-Karten auf cordovanfarbenem Leder mit Vokabel-Paaren Deutsch-Englisch und Deutsch-Spanisch: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
    howEyebrow: '§ Wie es funktioniert',
    howTitle: 'Drei Schritte. Null Reibung.',
    howSteps: [
      { title: 'Deutsches Video einfügen', body: 'Tagesschau, ZDF, Easy German, Doktor Whatson, MrWissen2go — jedes öffentliche deutsche YouTube-Video.' },
      { title: 'Niveau wählen', body: 'A1 bis C1 (GER). Das Vokabular passt sich an was du realistisch behalten kannst.' },
      { title: 'Pack bekommen', body: 'Zusammenfassung in deiner Sprache, Vokabular im Kontext, Zitate mit Timestamp, und ein .apkg-Anki-Deck.' },
    ],
    channelsEyebrow: '§ Kanäle zum Anfangen',
    channelsTitle: 'Vier Kanäle für die erste Session.',
    channels: [
      { name: 'Tagesschau', level: 'B1 → C1', genre: 'Nachrichten', note: 'Tägliche Nachrichten in klarem Deutsch. Aussprache-Standard.' },
      { name: 'Doktor Whatson', level: 'B2 → C1', genre: 'Wissenschaft', note: 'Wissenschafts-Erklärung mit modernem Akademie-Vokabular.' },
      { name: 'Easy German', level: 'A2 → B2', genre: 'Straßen-Interviews', note: 'Echte Gespräche mit Untertiteln. Für Ausländer konzipiert.' },
      { name: 'MrWissen2go', level: 'B1 → C1', genre: 'Geschichte + Politik', note: 'Schnelle Erklärungen. Vokabular sehr häufig in Medien.' },
    ],
    sampleCta: 'Erst ein deutsches Sample-Pack anschauen →',
    ankiCta: 'Wie sieht das Anki-Deck aus das ich bekomme?',
    backCta: 'Zurück zu VozClara',
  };

  return {
    eyebrow: 'LEARN GERMAN · REAL VIDEOS',
    h1: 'Learn German with the YouTube videos you already watch.',
    sub: 'Paste a German link (Tagesschau, podcasts, documentaries). VozClara extracts vocabulary in context at your CEFR level, delivers it in your language, and exports an Anki deck ready to review tomorrow.',
    cta: 'Create my pack',
    placeholder: 'Paste a German YouTube link',
    trustNote: 'Free during beta. No signup. Start instantly.',
    storyEyebrow: '§ Why this page exists',
    storyTitle: 'Built by a German for his Spanish partner.',
    storyBody:
      'My partner is a Spanish speaker, we live in Frankfurt. She wanted to follow the Tagesschau, German economics podcasts, history documentaries — without spending years learning the language first. What existed was either too simple (copy-paste summaries with no structure) or too generic (ChatGPT forgets the thread within five minutes). I built VozClara for her. We are opening it now to others who live between German and their mother tongue.',
    imageAlt: 'Five Anki flashcards arranged on cordovan leather, vocabulary pairs in German-English and German-Spanish: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
    howEyebrow: '§ How it works',
    howTitle: 'Three steps. Zero friction.',
    howSteps: [
      { title: 'Paste a German video', body: 'Tagesschau, ZDF, Easy German, Doktor Whatson, MrWissen2go — any public German YouTube video.' },
      { title: 'Pick your level', body: 'A1 through C1 (CEFR). Vocabulary adjusts to what you can realistically retain.' },
      { title: 'Receive your pack', body: 'Summary in your language, vocabulary in context, timestamped quotes, and an .apkg Anki deck.' },
    ],
    channelsEyebrow: '§ Channels to start with',
    channelsTitle: 'Four channels for your first session.',
    channels: [
      { name: 'Tagesschau', level: 'B1 → C1', genre: 'news', note: 'Daily news in clear German. The pronunciation standard.' },
      { name: 'Doktor Whatson', level: 'B2 → C1', genre: 'science', note: 'Science explainers with modern academic vocabulary.' },
      { name: 'Easy German', level: 'A2 → B2', genre: 'street interviews', note: 'Real conversations with subtitles. Designed for foreigners.' },
      { name: 'MrWissen2go', level: 'B1 → C1', genre: 'history + politics', note: 'Quick explainers. Vocabulary very frequent in the press.' },
    ],
    sampleCta: 'See a German sample pack first →',
    ankiCta: 'What does the Anki deck I receive look like?',
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
