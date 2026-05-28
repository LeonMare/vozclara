import { useLocale } from '../lib/i18n';
import {
  LanguageLearningSeoPage,
  type LanguageLearningSeoConfig,
} from '../components/seo/LanguageLearningSeoPage';

/**
 * /learn-french-with-youtube — first SEO landing built on top of
 * the refactored LanguageLearningSeoPage template. Three minutes of
 * config-typing vs three hours of copy-paste under the pre-refactor
 * pattern. Tests that the abstraction holds for a new language.
 *
 * Intent cluster:
 *   "learn french with youtube"
 *   "französisch lernen mit youtube"
 *   "aprender francés con youtube"
 *   "aprender francês com youtube"
 *   "french learning youtube channels"
 */
export function LearnFrenchWithYouTubePage() {
  const { locale } = useLocale();
  return <LanguageLearningSeoPage config={learnFrenchConfig(locale)} />;
}

function learnFrenchConfig(locale: string): LanguageLearningSeoConfig {
  if (locale.startsWith('es')) return {
    trackSource: 'learn-french-with-youtube',
    eyebrow: 'APRENDE FRANCÉS · VÍDEOS REALES',
    h1: 'Aprende francés con los vídeos de YouTube que ya ves.',
    sub: 'Pega un enlace en francés (France 24, TV5 Monde, Easy French, Cyrus North). VozClara extrae vocabulario en contexto a tu nivel MCER, te lo entrega en español, y exporta un mazo Anki listo para repasar mañana.',
    cta: 'Crear mi pack',
    placeholder: 'Pega un enlace de YouTube en francés',
    trustNote: 'Gratis durante la beta. Sin registro. Listo al instante.',
    storyEyebrow: '§ Por qué existe esta página',
    storyTitle: 'Francés con contenido que vale la pena.',
    storyBody:
      'El francés no se aprende con frases sueltas, se aprende con argumentación. Las charlas de filosofía de Cyrus North, los documentales de France 24, las entrevistas de Konbini — material denso, hablantes claros, vocabulario que sirve para conversaciones reales. VozClara convierte cada vídeo en un pack con vocabulario contextualizado, citas con timestamp, y mazos Anki para fijar lo aprendido.',
    imageAlt: 'Cinco tarjetas Anki sobre cuero burdeos con pares de vocabulario francés-español-inglés-alemán.',
    howEyebrow: '§ Cómo funciona',
    howTitle: 'Tres pasos. Cero fricción.',
    howSteps: [
      { title: 'Pega un vídeo francés', body: 'France 24, TV5 Monde, Cyrus North, Konbini — cualquier vídeo público en francés.' },
      { title: 'Elige tu nivel', body: 'A1 hasta C1 (MCER). El vocabulario se ajusta a tu nivel real.' },
      { title: 'Recibe tu pack', body: 'Resumen en español, vocabulario en contexto, citas con timestamp, mazo Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canales para empezar',
    channelsTitle: 'Cuatro canales por donde abrir la primera sesión.',
    channels: [
      { name: 'France 24', level: 'B1 → C2', genre: 'noticias internacionales', note: 'Francés estándar de medios. Locutores claros, ritmo profesional.' },
      { name: 'Easy French', level: 'A2 → B2', genre: 'entrevistas calle', note: 'Conversaciones reales en París con subtítulos. Diseñado para extranjeros.' },
      { name: 'Cyrus North', level: 'B2 → C1', genre: 'filosofía + ciencia', note: 'Divulgación cultural densa. Vocabulario académico moderno.' },
      { name: 'Konbini', level: 'B2 → C1', genre: 'entrevistas culturales', note: 'Entrevistas a artistas franceses + internacionales. Francés vivo.' },
    ],
    sampleCta: 'Ver un pack de muestra primero →',
    ankiCta: '¿Cómo es el mazo Anki que recibo?',
    backCta: 'Volver a VozClara',
  };
  if (locale.startsWith('pt')) return {
    trackSource: 'learn-french-with-youtube',
    eyebrow: 'APRENDE FRANCÊS · VÍDEOS REAIS',
    h1: 'Aprende francês com os vídeos do YouTube que já vês.',
    sub: 'Cola um link em francês (France 24, TV5 Monde, Easy French, Cyrus North). VozClara extrai vocabulário em contexto ao teu nível QECR, entrega-o em português, e exporta um deck Anki pronto para rever amanhã.',
    cta: 'Criar o meu pack',
    placeholder: 'Cola um link de YouTube em francês',
    trustNote: 'Grátis durante a beta. Sem registo. Pronto num instante.',
    storyEyebrow: '§ Porque existe esta página',
    storyTitle: 'Francês com conteúdo que vale a pena.',
    storyBody:
      'Francês não se aprende com frases soltas, aprende-se com argumentação. Palestras de filosofia do Cyrus North, documentários da France 24, entrevistas do Konbini — material denso, oradores claros, vocabulário que serve para conversas reais. VozClara converte cada vídeo num pack com vocabulário em contexto, citações com timestamp, e decks Anki.',
    imageAlt: 'Cinco cartões Anki sobre cabedal cor-de-vinho com pares de vocabulário francês-português-inglês-alemão.',
    howEyebrow: '§ Como funciona',
    howTitle: 'Três passos. Zero atrito.',
    howSteps: [
      { title: 'Cola um vídeo em francês', body: 'France 24, TV5 Monde, Cyrus North, Konbini — qualquer vídeo público em francês.' },
      { title: 'Escolhe o teu nível', body: 'A1 até C1 (QECR). O vocabulário ajusta-se ao teu nível real.' },
      { title: 'Recebe o teu pack', body: 'Resumo em português, vocabulário em contexto, citações com timestamp, deck Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canais para começar',
    channelsTitle: 'Quatro canais por onde abrir a primeira sessão.',
    channels: [
      { name: 'France 24', level: 'B1 → C2', genre: 'notícias internacionais', note: 'Francês padrão dos media. Locutores claros, ritmo profissional.' },
      { name: 'Easy French', level: 'A2 → B2', genre: 'entrevistas de rua', note: 'Conversas reais em Paris com legendas. Pensado para estrangeiros.' },
      { name: 'Cyrus North', level: 'B2 → C1', genre: 'filosofia + ciência', note: 'Divulgação cultural densa. Vocabulário académico moderno.' },
      { name: 'Konbini', level: 'B2 → C1', genre: 'entrevistas culturais', note: 'Entrevistas a artistas franceses + internacionais. Francês vivo.' },
    ],
    sampleCta: 'Ver um pack de exemplo primeiro →',
    ankiCta: 'Como é o deck Anki que recebo?',
    backCta: 'Voltar à VozClara',
  };
  if (locale.startsWith('de')) return {
    trackSource: 'learn-french-with-youtube',
    eyebrow: 'FRANZÖSISCH LERNEN · ECHTE VIDEOS',
    h1: 'Lern Französisch mit den YouTube-Videos die du eh schaust.',
    sub: 'Französischen Link einfügen (France 24, TV5 Monde, Easy French, Cyrus North). VozClara extrahiert Vokabular im Kontext auf deinem GER-Niveau, übersetzt es ins Deutsche, und exportiert ein Anki-Deck bereit zum Wiederholen.',
    cta: 'Meinen Pack erstellen',
    placeholder: 'Französischen YouTube-Link einfügen',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Sofort startklar.',
    storyEyebrow: '§ Warum diese Seite existiert',
    storyTitle: 'Französisch mit Inhalten die der Mühe wert sind.',
    storyBody:
      'Französisch lernt man nicht mit Phrasensätzen, sondern mit Argumentation. Philosophie-Vorträge von Cyrus North, Dokus von France 24, Interviews von Konbini — dichtes Material, klare Sprecher, Vokabular das für echte Gespräche taugt. VozClara verwandelt jedes Video in einen Lernpack mit Vokabular im Satzkontext, Zitaten mit Timestamp, und einem Anki-Deck.',
    imageAlt: 'Fünf Anki-Karten auf cordovanfarbenem Leder mit Vokabel-Paaren Französisch-Deutsch-Englisch-Spanisch.',
    howEyebrow: '§ Wie es funktioniert',
    howTitle: 'Drei Schritte. Null Reibung.',
    howSteps: [
      { title: 'Französisches Video einfügen', body: 'France 24, TV5 Monde, Cyrus North, Konbini — jedes öffentliche französische YouTube-Video.' },
      { title: 'Niveau wählen', body: 'A1 bis C1 (GER). Das Vokabular passt sich an dein echtes Niveau an.' },
      { title: 'Pack bekommen', body: 'Zusammenfassung auf Deutsch, Vokabular im Kontext, Zitate mit Timestamp, .apkg-Anki-Deck.' },
    ],
    channelsEyebrow: '§ Kanäle zum Anfangen',
    channelsTitle: 'Vier Kanäle für die erste Session.',
    channels: [
      { name: 'France 24', level: 'B1 → C2', genre: 'internationale Nachrichten', note: 'Französischer Medien-Standard. Klare Sprecher, professionelles Tempo.' },
      { name: 'Easy French', level: 'A2 → B2', genre: 'Straßen-Interviews', note: 'Echte Gespräche in Paris mit Untertiteln. Für Ausländer konzipiert.' },
      { name: 'Cyrus North', level: 'B2 → C1', genre: 'Philosophie + Wissenschaft', note: 'Dichte kulturelle Erklärung. Modernes Akademie-Vokabular.' },
      { name: 'Konbini', level: 'B2 → C1', genre: 'Kultur-Interviews', note: 'Interviews mit französischen + internationalen Künstlern. Lebendiges Französisch.' },
    ],
    sampleCta: 'Erst ein Sample-Pack anschauen →',
    ankiCta: 'Wie sieht das Anki-Deck aus?',
    backCta: 'Zurück zu VozClara',
  };
  return {
    trackSource: 'learn-french-with-youtube',
    eyebrow: 'LEARN FRENCH · REAL VIDEOS',
    h1: 'Learn French with the YouTube videos you already watch.',
    sub: 'Paste a French link (France 24, TV5 Monde, Easy French, Cyrus North). VozClara extracts vocabulary in context at your CEFR level, delivers it in your language, and exports an Anki deck ready to review tomorrow.',
    cta: 'Create my pack',
    placeholder: 'Paste a French YouTube link',
    trustNote: 'Free during beta. No signup. Start instantly.',
    storyEyebrow: '§ Why this page exists',
    storyTitle: 'French with content worth the effort.',
    storyBody:
      'French is not learned with phrasebook lines, it is learned with argumentation. Cyrus North on philosophy, France 24 documentaries, Konbini interviews — dense material, clear speakers, vocabulary that pays off in real conversations. VozClara turns each video into a study pack with sentence-context vocabulary, timestamped quotes, and an Anki deck.',
    imageAlt: 'Five Anki flashcards on cordovan leather, French-English / French-Spanish / French-German vocabulary pairs.',
    howEyebrow: '§ How it works',
    howTitle: 'Three steps. Zero friction.',
    howSteps: [
      { title: 'Paste a French video', body: 'France 24, TV5 Monde, Cyrus North, Konbini — any public French YouTube video.' },
      { title: 'Pick your level', body: 'A1 through C1 (CEFR). Vocabulary adjusts to what you can realistically retain.' },
      { title: 'Receive your pack', body: 'Summary in your language, vocabulary in context, timestamped quotes, .apkg Anki deck.' },
    ],
    channelsEyebrow: '§ Channels to start with',
    channelsTitle: 'Four channels for your first session.',
    channels: [
      { name: 'France 24', level: 'B1 → C2', genre: 'international news', note: 'Standard French media. Clear speakers, professional pace.' },
      { name: 'Easy French', level: 'A2 → B2', genre: 'street interviews', note: 'Real conversations in Paris with subtitles. Designed for foreigners.' },
      { name: 'Cyrus North', level: 'B2 → C1', genre: 'philosophy + science', note: 'Dense cultural explainers. Modern academic vocabulary.' },
      { name: 'Konbini', level: 'B2 → C1', genre: 'culture interviews', note: 'Interviews with French + international artists. Living French.' },
    ],
    sampleCta: 'See a sample pack first →',
    ankiCta: 'What does the Anki deck look like?',
    backCta: 'Back to VozClara',
  };
}
