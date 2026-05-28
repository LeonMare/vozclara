import { useLocale } from '../lib/i18n';
import {
  LanguageLearningSeoPage,
  type LanguageLearningSeoConfig,
} from '../components/seo/LanguageLearningSeoPage';

/**
 * /learn-german-with-youtube — most founder-story-tight intent
 * landing. Thin shell over LanguageLearningSeoPage; all the
 * variation lives in learnGermanConfig(locale) below.
 */
export function LearnGermanWithYouTubePage() {
  const { locale } = useLocale();
  return <LanguageLearningSeoPage config={learnGermanConfig(locale)} />;
}

function learnGermanConfig(locale: string): LanguageLearningSeoConfig {
  if (locale.startsWith('es')) return {
    trackSource: 'learn-german-with-youtube',
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
    imageAlt:
      'Cinco tarjetas Anki sobre cuero burdeos con pares de vocabulario alemán-inglés y alemán-español: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
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
    trackSource: 'learn-german-with-youtube',
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
    imageAlt:
      'Cinco cartões Anki sobre cabedal cor-de-vinho com pares de vocabulário alemão-inglês e alemão-português: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
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
    trackSource: 'learn-german-with-youtube',
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
    imageAlt:
      'Fünf Anki-Karten auf cordovanfarbenem Leder mit Vokabel-Paaren Deutsch-Englisch und Deutsch-Spanisch: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
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
    trackSource: 'learn-german-with-youtube',
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
    imageAlt:
      'Five Anki flashcards arranged on cordovan leather, vocabulary pairs in German-English and German-Spanish: das Wissen, die Weisheit, la sabiduría, o conhecimento, aprendizaje.',
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
