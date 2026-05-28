import { useLocale } from '../lib/i18n';
import {
  LanguageLearningSeoPage,
  type LanguageLearningSeoConfig,
} from '../components/seo/LanguageLearningSeoPage';

/** /learn-portuguese-with-youtube — closes the four-locale square (BR + EU PT). */
export function LearnPortugueseWithYouTubePage() {
  const { locale } = useLocale();
  return <LanguageLearningSeoPage config={learnPortugueseConfig(locale)} />;
}

function learnPortugueseConfig(locale: string): LanguageLearningSeoConfig {
  if (locale.startsWith('es')) return {
    trackSource: 'learn-portuguese-with-youtube',
    eyebrow: 'APRENDE PORTUGUÉS · VÍDEOS REALES',
    h1: 'Aprende portugués con los vídeos de YouTube que ya ves.',
    sub: 'Pega un enlace en portugués (Globo News, RTP, Easy Portuguese, Manual do Mundo). VozClara extrae vocabulario en contexto a tu nivel MCER, te lo entrega en español, y exporta un mazo Anki listo para repasar mañana.',
    cta: 'Crear mi pack',
    placeholder: 'Pega un enlace de YouTube en portugués',
    trustNote: 'Gratis durante la beta. Sin registro. Listo al instante.',
    storyEyebrow: '§ Por qué existe esta página',
    storyTitle: 'Portugués y español son primos hermanos — úsalo.',
    storyBody:
      'Si hablas español, el portugués ya está a medio camino desde el primer día. Lo que falta es vocabulario activo, oído entrenado, y la confianza para sostener conversaciones largas. VozClara convierte vídeos brasileños o de Portugal — Globo News, Manual do Mundo, RTP — en packs de estudio con vocabulario en contexto y cartones Anki. Funciona igual para BR-PT como para EU-PT — eliges el origen, eliges la variante.',
    imageAlt: 'Cinco tarjetas Anki sobre cuero burdeos con pares de vocabulario portugués-español-inglés-alemán.',
    howEyebrow: '§ Cómo funciona',
    howTitle: 'Tres pasos. Cero fricción.',
    howSteps: [
      { title: 'Pega un vídeo en portugués', body: 'Globo News, Manual do Mundo, Easy Portuguese, RTP Notícias — Brasil o Portugal, cualquier vídeo público.' },
      { title: 'Elige tu nivel', body: 'A1 hasta C1 (MCER). El vocabulario se ajusta a tu nivel real.' },
      { title: 'Recibe tu pack', body: 'Resumen en español, vocabulario en contexto, citas con timestamp, mazo Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canales para empezar',
    channelsTitle: 'Cuatro canales por donde abrir la primera sesión.',
    channels: [
      { name: 'Easy Portuguese', level: 'A2 → B2', genre: 'entrevistas calle', note: 'Conversaciones reales con subtítulos. Brasil + Portugal.' },
      { name: 'Globo News', level: 'B1 → C2', genre: 'noticias BR', note: 'Periodismo brasileño estándar. Lo que ven en Río y São Paulo.' },
      { name: 'RTP Notícias', level: 'B1 → C1', genre: 'noticias PT', note: 'Portugués europeo estándar. Más cerrado, más rítmico.' },
      { name: 'Manual do Mundo', level: 'B1 → B2', genre: 'ciencia + curiosidad', note: 'Divulgación científica en portugués brasileño accesible.' },
    ],
    sampleCta: 'Ver un pack de muestra primero →',
    ankiCta: '¿Cómo es el mazo Anki que recibo?',
    backCta: 'Volver a VozClara',
  };
  if (locale.startsWith('pt')) return {
    trackSource: 'learn-portuguese-with-youtube',
    eyebrow: 'APRENDE PORTUGUÊS · VÍDEOS REAIS',
    h1: 'Aprende português com os vídeos do YouTube que já vês.',
    sub: 'Cola um link em português (Globo News, RTP, Easy Portuguese, Manual do Mundo). VozClara extrai vocabulário em contexto ao teu nível QECR, entrega-o na tua língua, e exporta um deck Anki pronto para rever amanhã.',
    cta: 'Criar o meu pack',
    placeholder: 'Cola um link de YouTube em português',
    trustNote: 'Grátis durante a beta. Sem registo. Pronto num instante.',
    storyEyebrow: '§ Porque existe esta página',
    storyTitle: 'Mesmo motor. Direção PT — BR ou EU, escolhes tu.',
    storyBody:
      'VozClara foi construído para aprendizagem multilingue desde o primeiro dia. Português é uma das quatro línguas suportadas tanto como origem como como saída. Quem estuda PT-BR para entrar no mercado brasileiro, ou PT-EU para integração em Lisboa, ou simplesmente quem quer ler Saramago em vídeo — a mesma engine extrai vocabulário no nível QECR e gera um deck Anki, com timestamps que voltam ao segundo exato do vídeo.',
    imageAlt: 'Cinco cartões Anki sobre cabedal cor-de-vinho com pares de vocabulário português-espanhol-inglês-alemão.',
    howEyebrow: '§ Como funciona',
    howTitle: 'Três passos. Zero atrito.',
    howSteps: [
      { title: 'Cola um vídeo em português', body: 'Globo News, Manual do Mundo, Easy Portuguese, RTP Notícias — Brasil ou Portugal, qualquer vídeo público.' },
      { title: 'Escolhe o teu nível', body: 'A1 até C1 (QECR). O vocabulário ajusta-se ao teu nível real.' },
      { title: 'Recebe o teu pack', body: 'Resumo na tua língua, vocabulário em contexto, citações com timestamp, deck Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canais para começar',
    channelsTitle: 'Quatro canais por onde abrir a primeira sessão.',
    channels: [
      { name: 'Easy Portuguese', level: 'A2 → B2', genre: 'entrevistas de rua', note: 'Conversas reais com legendas. Brasil + Portugal.' },
      { name: 'Globo News', level: 'B1 → C2', genre: 'notícias BR', note: 'Jornalismo brasileiro padrão. O que se vê no Rio e em São Paulo.' },
      { name: 'RTP Notícias', level: 'B1 → C1', genre: 'notícias PT', note: 'Português europeu padrão. Mais fechado, mais rítmico.' },
      { name: 'Manual do Mundo', level: 'B1 → B2', genre: 'ciência + curiosidade', note: 'Divulgação científica em português brasileiro acessível.' },
    ],
    sampleCta: 'Ver um pack de exemplo primeiro →',
    ankiCta: 'Como é o deck Anki que recebo?',
    backCta: 'Voltar à VozClara',
  };
  if (locale.startsWith('de')) return {
    trackSource: 'learn-portuguese-with-youtube',
    eyebrow: 'PORTUGIESISCH LERNEN · ECHTE VIDEOS',
    h1: 'Lern Portugiesisch mit den YouTube-Videos die du eh schaust.',
    sub: 'Portugiesischen Link einfügen (Globo News, RTP, Easy Portuguese, Manual do Mundo). VozClara extrahiert Vokabular im Kontext auf deinem GER-Niveau, übersetzt es ins Deutsche, und exportiert ein Anki-Deck bereit zum Wiederholen.',
    cta: 'Meinen Pack erstellen',
    placeholder: 'Portugiesischen YouTube-Link einfügen',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Sofort startklar.',
    storyEyebrow: '§ Warum diese Seite existiert',
    storyTitle: 'BR oder EU? VozClara unterscheidet beides.',
    storyBody:
      'Portugiesisch ist nicht eine Sprache, sondern zwei kulturelle Welten — Brasilianisch und das engere europäische Portugiesisch. VozClara behandelt das von Tag eins richtig. Du wählst die Quelle (Globo aus Rio, RTP aus Lissabon), das Niveau, und bekommst Vokabular im Satzkontext, Zitate mit Timestamp, und ein Anki-Deck. Selbe Engine wie für Deutsch, Spanisch oder Englisch — direction-agnostic vom ersten Build.',
    imageAlt: 'Fünf Anki-Karten auf cordovanfarbenem Leder mit Vokabel-Paaren Portugiesisch-Deutsch-Englisch-Spanisch.',
    howEyebrow: '§ Wie es funktioniert',
    howTitle: 'Drei Schritte. Null Reibung.',
    howSteps: [
      { title: 'Portugiesisches Video einfügen', body: 'Globo News, Manual do Mundo, Easy Portuguese, RTP Notícias — Brasilien oder Portugal.' },
      { title: 'Niveau wählen', body: 'A1 bis C1 (GER). Das Vokabular passt sich an dein echtes Niveau an.' },
      { title: 'Pack bekommen', body: 'Zusammenfassung auf Deutsch, Vokabular im Kontext, Zitate mit Timestamp, .apkg-Anki-Deck.' },
    ],
    channelsEyebrow: '§ Kanäle zum Anfangen',
    channelsTitle: 'Vier Kanäle für die erste Session.',
    channels: [
      { name: 'Easy Portuguese', level: 'A2 → B2', genre: 'Straßen-Interviews', note: 'Echte Gespräche mit Untertiteln. Brasilien + Portugal.' },
      { name: 'Globo News', level: 'B1 → C2', genre: 'Nachrichten BR', note: 'Brasilianischer Standard-Journalismus.' },
      { name: 'RTP Notícias', level: 'B1 → C1', genre: 'Nachrichten PT', note: 'Europäisches Portugiesisch. Geschlossener, rhythmischer.' },
      { name: 'Manual do Mundo', level: 'B1 → B2', genre: 'Wissenschaft + Neugier', note: 'Wissens-Erklärung auf zugänglichem Brasilianisch-Portugiesisch.' },
    ],
    sampleCta: 'Erst ein Sample-Pack anschauen →',
    ankiCta: 'Wie sieht das Anki-Deck aus?',
    backCta: 'Zurück zu VozClara',
  };
  return {
    trackSource: 'learn-portuguese-with-youtube',
    eyebrow: 'LEARN PORTUGUESE · REAL VIDEOS',
    h1: 'Learn Portuguese with the YouTube videos you already watch.',
    sub: 'Paste a Portuguese link (Globo News, RTP, Easy Portuguese, Manual do Mundo). VozClara extracts vocabulary in context at your CEFR level, delivers it in your language, and exports an Anki deck ready to review tomorrow.',
    cta: 'Create my pack',
    placeholder: 'Paste a Portuguese YouTube link',
    trustNote: 'Free during beta. No signup. Start instantly.',
    storyEyebrow: '§ Why this page exists',
    storyTitle: 'Brazilian or European? VozClara handles both.',
    storyBody:
      'Portuguese is not one language but two cultural worlds — Brazilian and the tighter European variety. VozClara handles this right from day one. Pick the source (Globo from Rio, RTP from Lisbon), the level, and get vocabulary in sentence context, timestamped quotes, and an Anki deck. Same engine as German, Spanish, English — direction-agnostic since build one.',
    imageAlt: 'Five Anki flashcards on cordovan leather, Portuguese-English / Portuguese-Spanish / Portuguese-German vocabulary pairs.',
    howEyebrow: '§ How it works',
    howTitle: 'Three steps. Zero friction.',
    howSteps: [
      { title: 'Paste a Portuguese video', body: 'Globo News, Manual do Mundo, Easy Portuguese, RTP Notícias — Brazil or Portugal, any public video.' },
      { title: 'Pick your level', body: 'A1 through C1 (CEFR). Vocabulary adjusts to what you can actually retain.' },
      { title: 'Receive your pack', body: 'Summary in your language, vocabulary in context, timestamped quotes, .apkg Anki deck.' },
    ],
    channelsEyebrow: '§ Channels to start with',
    channelsTitle: 'Four channels for your first session.',
    channels: [
      { name: 'Easy Portuguese', level: 'A2 → B2', genre: 'street interviews', note: 'Real conversations with subtitles. Brazil + Portugal.' },
      { name: 'Globo News', level: 'B1 → C2', genre: 'Brazilian news', note: 'Standard Brazilian journalism. What Rio and São Paulo watch.' },
      { name: 'RTP Notícias', level: 'B1 → C1', genre: 'Portugal news', note: 'Standard European Portuguese. Tighter, more rhythmic.' },
      { name: 'Manual do Mundo', level: 'B1 → B2', genre: 'science + curiosity', note: 'Accessible Brazilian-Portuguese science explainers.' },
    ],
    sampleCta: 'See a sample pack first →',
    ankiCta: 'What does the Anki deck look like?',
    backCta: 'Back to VozClara',
  };
}
