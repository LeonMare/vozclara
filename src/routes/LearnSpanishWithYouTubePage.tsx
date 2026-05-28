import { useLocale } from '../lib/i18n';
import {
  LanguageLearningSeoPage,
  type LanguageLearningSeoConfig,
} from '../components/seo/LanguageLearningSeoPage';

/** /learn-spanish-with-youtube — 4th-most-spoken-language market. */
export function LearnSpanishWithYouTubePage() {
  const { locale } = useLocale();
  return <LanguageLearningSeoPage config={learnSpanishConfig(locale)} />;
}

function learnSpanishConfig(locale: string): LanguageLearningSeoConfig {
  if (locale.startsWith('es')) return {
    trackSource: 'learn-spanish-with-youtube',
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
    channelsTitle: 'Cuatro canales por donde abrir la primera sesión.',
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
    trackSource: 'learn-spanish-with-youtube',
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
    trackSource: 'learn-spanish-with-youtube',
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
    trackSource: 'learn-spanish-with-youtube',
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
