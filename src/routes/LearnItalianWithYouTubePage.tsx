import { useLocale } from '../lib/i18n';
import {
  LanguageLearningSeoPage,
  type LanguageLearningSeoConfig,
} from '../components/seo/LanguageLearningSeoPage';

/**
 * /learn-italian-with-youtube — second new landing built on the
 * refactored template. Italian is a strong third-language pick for
 * Anglophone + Germanophone audiences and a close cousin for ES/PT
 * speakers. ~60M native + ~15M L2 learners worldwide.
 */
export function LearnItalianWithYouTubePage() {
  const { locale } = useLocale();
  return <LanguageLearningSeoPage config={learnItalianConfig(locale)} />;
}

function learnItalianConfig(locale: string): LanguageLearningSeoConfig {
  if (locale.startsWith('es')) return {
    trackSource: 'learn-italian-with-youtube',
    eyebrow: 'APRENDE ITALIANO · VÍDEOS REALES',
    h1: 'Aprende italiano con los vídeos de YouTube que ya ves.',
    sub: 'Pega un enlace en italiano (Rai News, Easy Italian, Marco Montemagno, Tech Princess). VozClara extrae vocabulario en contexto a tu nivel MCER, te lo entrega en español, y exporta un mazo Anki listo para repasar mañana.',
    cta: 'Crear mi pack',
    placeholder: 'Pega un enlace de YouTube en italiano',
    trustNote: 'Gratis durante la beta. Sin registro. Listo al instante.',
    storyEyebrow: '§ Por qué existe esta página',
    storyTitle: 'Italiano: el primo más expresivo del español.',
    storyBody:
      'Para un hispanohablante, el italiano es la lengua más alcanzable del mundo — gramática parecida, vocabulario lleno de cognados, pronunciación clara. Lo que separa al A2 del C1 es exposición a italiano real: la entonación, el ritmo, las muletillas. VozClara convierte cualquier vídeo italiano que veas en un pack con vocabulario contextualizado y mazos Anki para fijar lo que escuchas.',
    imageAlt: 'Cinco tarjetas Anki sobre cuero burdeos con pares de vocabulario italiano-español-inglés-alemán.',
    howEyebrow: '§ Cómo funciona',
    howTitle: 'Tres pasos. Cero fricción.',
    howSteps: [
      { title: 'Pega un vídeo italiano', body: 'Rai News, Easy Italian, Marco Montemagno, Tech Princess — cualquier vídeo público en italiano.' },
      { title: 'Elige tu nivel', body: 'A1 hasta C1 (MCER). El vocabulario se ajusta a tu nivel real.' },
      { title: 'Recibe tu pack', body: 'Resumen en español, vocabulario en contexto, citas con timestamp, mazo Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canales para empezar',
    channelsTitle: 'Cuatro canales por donde abrir la primera sesión.',
    channels: [
      { name: 'Rai News', level: 'B1 → C2', genre: 'noticias', note: 'Italiano estándar de medios. Locutores claros, ritmo profesional.' },
      { name: 'Easy Italian', level: 'A2 → B2', genre: 'entrevistas calle', note: 'Conversaciones reales en Milán + Roma con subtítulos.' },
      { name: 'Marco Montemagno', level: 'B2 → C1', genre: 'negocios + tecnología', note: 'Entrevistas con emprendedores italianos. Vocabulario profesional moderno.' },
      { name: 'Tech Princess', level: 'B1 → C1', genre: 'tech + reseñas', note: 'Italiano técnico accesible. Anglicismos integrados naturalmente.' },
    ],
    sampleCta: 'Ver un pack de muestra primero →',
    ankiCta: '¿Cómo es el mazo Anki que recibo?',
    backCta: 'Volver a VozClara',
  };
  if (locale.startsWith('pt')) return {
    trackSource: 'learn-italian-with-youtube',
    eyebrow: 'APRENDE ITALIANO · VÍDEOS REAIS',
    h1: 'Aprende italiano com os vídeos do YouTube que já vês.',
    sub: 'Cola um link em italiano (Rai News, Easy Italian, Marco Montemagno, Tech Princess). VozClara extrai vocabulário em contexto ao teu nível QECR, entrega-o em português, e exporta um deck Anki pronto para rever amanhã.',
    cta: 'Criar o meu pack',
    placeholder: 'Cola um link de YouTube em italiano',
    trustNote: 'Grátis durante a beta. Sem registo. Pronto num instante.',
    storyEyebrow: '§ Porque existe esta página',
    storyTitle: 'Italiano: o primo mais expressivo do português.',
    storyBody:
      'Para um falante de português, o italiano é uma das línguas mais alcançáveis do mundo — gramática semelhante, vocabulário cheio de cognatos, pronúncia clara. O que separa o A2 do C1 é exposição a italiano real: a entoação, o ritmo, as muletas. VozClara converte qualquer vídeo italiano num pack com vocabulário em contexto e decks Anki.',
    imageAlt: 'Cinco cartões Anki sobre cabedal cor-de-vinho com pares de vocabulário italiano-português-inglês-alemão.',
    howEyebrow: '§ Como funciona',
    howTitle: 'Três passos. Zero atrito.',
    howSteps: [
      { title: 'Cola um vídeo italiano', body: 'Rai News, Easy Italian, Marco Montemagno, Tech Princess — qualquer vídeo público em italiano.' },
      { title: 'Escolhe o teu nível', body: 'A1 até C1 (QECR). O vocabulário ajusta-se ao teu nível real.' },
      { title: 'Recebe o teu pack', body: 'Resumo em português, vocabulário em contexto, citações com timestamp, deck Anki .apkg.' },
    ],
    channelsEyebrow: '§ Canais para começar',
    channelsTitle: 'Quatro canais por onde abrir a primeira sessão.',
    channels: [
      { name: 'Rai News', level: 'B1 → C2', genre: 'notícias', note: 'Italiano padrão dos media. Locutores claros, ritmo profissional.' },
      { name: 'Easy Italian', level: 'A2 → B2', genre: 'entrevistas de rua', note: 'Conversas reais em Milão + Roma com legendas.' },
      { name: 'Marco Montemagno', level: 'B2 → C1', genre: 'negócios + tecnologia', note: 'Entrevistas com empreendedores italianos. Vocabulário profissional moderno.' },
      { name: 'Tech Princess', level: 'B1 → C1', genre: 'tech + reviews', note: 'Italiano técnico acessível. Anglicismos integrados naturalmente.' },
    ],
    sampleCta: 'Ver um pack de exemplo primeiro →',
    ankiCta: 'Como é o deck Anki que recebo?',
    backCta: 'Voltar à VozClara',
  };
  if (locale.startsWith('de')) return {
    trackSource: 'learn-italian-with-youtube',
    eyebrow: 'ITALIENISCH LERNEN · ECHTE VIDEOS',
    h1: 'Lern Italienisch mit den YouTube-Videos die du eh schaust.',
    sub: 'Italienischen Link einfügen (Rai News, Easy Italian, Marco Montemagno, Tech Princess). VozClara extrahiert Vokabular im Kontext auf deinem GER-Niveau, übersetzt es ins Deutsche, und exportiert ein Anki-Deck bereit zum Wiederholen.',
    cta: 'Meinen Pack erstellen',
    placeholder: 'Italienischen YouTube-Link einfügen',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Sofort startklar.',
    storyEyebrow: '§ Warum diese Seite existiert',
    storyTitle: 'Italienisch: die ausdrucksstärkste Sprache der Toskana.',
    storyBody:
      'Italienisch ist für Deutsche die Sprache, die man hören WILL. Mailand, Rom, der ganze süditalienische Lebensrhythmus — alles erschließt sich erst durch echtes Italienisch, nicht durch Lehrbuch-Phrasen. VozClara verwandelt jedes italienische YouTube-Video in einen Lernpack mit Vokabular im Satzkontext und einem Anki-Deck. Selbe Engine wie für Deutsch, Spanisch, Englisch, Portugiesisch — direction-agnostic vom ersten Build.',
    imageAlt: 'Fünf Anki-Karten auf cordovanfarbenem Leder mit Vokabel-Paaren Italienisch-Deutsch-Englisch-Spanisch.',
    howEyebrow: '§ Wie es funktioniert',
    howTitle: 'Drei Schritte. Null Reibung.',
    howSteps: [
      { title: 'Italienisches Video einfügen', body: 'Rai News, Easy Italian, Marco Montemagno, Tech Princess — jedes öffentliche italienische YouTube-Video.' },
      { title: 'Niveau wählen', body: 'A1 bis C1 (GER). Das Vokabular passt sich an dein echtes Niveau an.' },
      { title: 'Pack bekommen', body: 'Zusammenfassung auf Deutsch, Vokabular im Kontext, Zitate mit Timestamp, .apkg-Anki-Deck.' },
    ],
    channelsEyebrow: '§ Kanäle zum Anfangen',
    channelsTitle: 'Vier Kanäle für die erste Session.',
    channels: [
      { name: 'Rai News', level: 'B1 → C2', genre: 'Nachrichten', note: 'Italienischer Medien-Standard. Klare Sprecher, professionelles Tempo.' },
      { name: 'Easy Italian', level: 'A2 → B2', genre: 'Straßen-Interviews', note: 'Echte Gespräche in Mailand + Rom mit Untertiteln.' },
      { name: 'Marco Montemagno', level: 'B2 → C1', genre: 'Business + Tech', note: 'Interviews mit italienischen Unternehmern. Modernes Berufs-Vokabular.' },
      { name: 'Tech Princess', level: 'B1 → C1', genre: 'Tech + Reviews', note: 'Zugängliches technisches Italienisch. Natürlich integrierte Anglizismen.' },
    ],
    sampleCta: 'Erst ein Sample-Pack anschauen →',
    ankiCta: 'Wie sieht das Anki-Deck aus?',
    backCta: 'Zurück zu VozClara',
  };
  return {
    trackSource: 'learn-italian-with-youtube',
    eyebrow: 'LEARN ITALIAN · REAL VIDEOS',
    h1: 'Learn Italian with the YouTube videos you already watch.',
    sub: 'Paste an Italian link (Rai News, Easy Italian, Marco Montemagno, Tech Princess). VozClara extracts vocabulary in context at your CEFR level, delivers it in your language, and exports an Anki deck ready to review tomorrow.',
    cta: 'Create my pack',
    placeholder: 'Paste an Italian YouTube link',
    trustNote: 'Free during beta. No signup. Start instantly.',
    storyEyebrow: '§ Why this page exists',
    storyTitle: 'Italian: the most expressive language of the Mediterranean.',
    storyBody:
      'Italian is the language people want to learn even when they do not need to — the rhythm of Florence, the directness of Milan, the lyricism of Naples. What separates A2 from C1 is exposure to real Italian: intonation, fillers, idiom. VozClara turns each Italian YouTube video into a study pack with sentence-context vocabulary, timestamped quotes, and an Anki deck.',
    imageAlt: 'Five Anki flashcards on cordovan leather, Italian-English / Italian-Spanish / Italian-German vocabulary pairs.',
    howEyebrow: '§ How it works',
    howTitle: 'Three steps. Zero friction.',
    howSteps: [
      { title: 'Paste an Italian video', body: 'Rai News, Easy Italian, Marco Montemagno, Tech Princess — any public Italian YouTube video.' },
      { title: 'Pick your level', body: 'A1 through C1 (CEFR). Vocabulary adjusts to what you can realistically retain.' },
      { title: 'Receive your pack', body: 'Summary in your language, vocabulary in context, timestamped quotes, .apkg Anki deck.' },
    ],
    channelsEyebrow: '§ Channels to start with',
    channelsTitle: 'Four channels for your first session.',
    channels: [
      { name: 'Rai News', level: 'B1 → C2', genre: 'news', note: 'Standard Italian media. Clear speakers, professional pace.' },
      { name: 'Easy Italian', level: 'A2 → B2', genre: 'street interviews', note: 'Real conversations in Milan + Rome with subtitles.' },
      { name: 'Marco Montemagno', level: 'B2 → C1', genre: 'business + tech', note: 'Interviews with Italian entrepreneurs. Modern professional vocabulary.' },
      { name: 'Tech Princess', level: 'B1 → C1', genre: 'tech + reviews', note: 'Accessible technical Italian. Anglicisms naturally integrated.' },
    ],
    sampleCta: 'See a sample pack first →',
    ankiCta: 'What does the Anki deck look like?',
    backCta: 'Back to VozClara',
  };
}
