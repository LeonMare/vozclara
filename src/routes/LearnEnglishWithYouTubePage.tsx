import { useLocale } from '../lib/i18n';
import {
  LanguageLearningSeoPage,
  type LanguageLearningSeoConfig,
} from '../components/seo/LanguageLearningSeoPage';

/** /learn-english-with-youtube — broadest-market intent landing. */
export function LearnEnglishWithYouTubePage() {
  const { locale } = useLocale();
  return <LanguageLearningSeoPage config={learnEnglishConfig(locale)} />;
}

function learnEnglishConfig(locale: string): LanguageLearningSeoConfig {
  if (locale.startsWith('es')) return {
    trackSource: 'learn-english-with-youtube',
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
    trackSource: 'learn-english-with-youtube',
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
    trackSource: 'learn-english-with-youtube',
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
    trackSource: 'learn-english-with-youtube',
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
