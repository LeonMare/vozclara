/**
 * i18n — frozen string tables for ES (primary), PT, DE, EN.
 * Components subscribe via useLocale(). Locale persists in localStorage,
 * falls back to navigator.language, falls back to 'es'.
 */

import { useSyncExternalStore } from 'react';

export type Locale = 'es' | 'pt' | 'de' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['es', 'pt', 'de', 'en'];

export const LOCALE_LABEL: Record<Locale, string> = {
  es: 'Castellano',
  pt: 'Português',
  de: 'Deutsch',
  en: 'English',
};

export const LOCALE_SHORT: Record<Locale, string> = {
  es: 'ES',
  pt: 'PT',
  de: 'DE',
  en: 'EN',
};

export interface ModeStrings {
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
}

export interface Strings {
  // ─ Brand chrome ──────────────────────────────────────────
  navLibrary: string;
  navNew: string;
  navPricing: string;
  cambiarVideo: string;

  // ─ Hero ──────────────────────────────────────────────────
  heroEyebrow: string;
  heroHeadline: string;
  heroSub: string;
  heroPlaceholder: string;
  /** Screen-reader label for the URL input. WCAG 3.3.2 requires labels
   *  or instructions; the visual placeholder disappears on type. */
  heroUrlInputLabel: string;
  primaryCTA: string;
  seeHowCTA: string;
  invalidUrl: string;
  trySamplePack: string;

  // ─ Problem ───────────────────────────────────────────────
  problemTitle: string;
  problemBody: string;

  // ─ Solution ──────────────────────────────────────────────
  solutionTitle: string;
  solutionBody: string;

  // ─ How it works ──────────────────────────────────────────
  howTitle: string;
  howSteps: [string, string, string, string, string];
  howDescriptions: [string, string, string, string, string];

  // ─ Knowledge Pack Preview ────────────────────────────────
  kpTitle: string;
  kpSub: string;
  kpSections: { label: string; example: string }[];

  // ─ Library Preview ───────────────────────────────────────
  libraryTitle: string;
  librarySub: string;

  // ─ Ask My Knowledge ──────────────────────────────────────
  askEyebrow: string;
  askTitle: string;
  askSub: string;
  askExamples: string[];

  // ─ Languages ─────────────────────────────────────────────
  langTitle: string;
  langActive: string;
  langSoon: string;

  // ─ Pricing ───────────────────────────────────────────────
  pricingTitle: string;
  pricingSub: string;
  tiers: {
    name: string;
    price: string;
    period: string;
    blurb: string;
    features: string[];
    cta: string;
  }[];

  // ─ Final CTA ─────────────────────────────────────────────
  finalTitle: string;
  finalSub: string;
  finalCTA: string;

  // ─ Generator ─────────────────────────────────────────────
  newPageTitle: string;
  stepUrl: string;
  stepMode: string;
  stepLanguage: string;
  stepGenerate: string;
  chooseModeTitle: string;
  chooseModeSub: string;
  modeRecommended: string;
  outputLangLabel: string;
  generateBtn: string;
  progressPhrases: string[];

  // ─ Modes ────────────────────────────────────────────────
  modes: Record<'learn' | 'brief' | 'study' | 'creator', ModeStrings>;

  // ─ Pack view ────────────────────────────────────────────
  packBackToLibrary: string;
  packSavedToLibrary: string;
  packDelete: string;
  packTabs: {
    summary: string;
    chapters: string;
    insights: string;
    actionPlan: string;
    vocabulary: string;
    quiz: string;
    quotes: string;
    socialAngles: string;
    transcript: string;
  };

  // ─ Library page ─────────────────────────────────────────
  libraryEmptyTitle: string;
  libraryEmptyBody: string;
  libraryEmptyCTA: string;
  libraryStats: (n: { packs: number; ideas: number; langs: number; thisWeek: number }) => string;
  searchPlaceholder: string;
  filterAll: string;
  filterMode: string;
  filterLang: string;
  filterDate: string;
  filterDate7: string;
  filterDate30: string;
  filterDateAll: string;

  // ─ Existing playback strings ────────────────────────────
  pulsaReproducir: string;
  iniciarVoz: string;
  vozActivada: string;
  mostrarOriginal: string;
  texto: string;
  preparingSubs: string;
  insightsLoading: string;
  insightsRetry: string;
  insightsEmpty: string;
  insightsActionEmpty: string;
  genreLabel: string;
  genreNames: Record<string, string>;

  // ─ Footer ───────────────────────────────────────────────
  footerTagline: string;
  footerBuiltBy: string;
}

export const STRINGS: Record<Locale, Strings> = {
  /* ════════════════════════════════════════════════════════
     CASTELLANO — primary
  ════════════════════════════════════════════════════════ */
  es: {
    navLibrary: 'Biblioteca',
    navNew: 'Nuevo pack',
    navPricing: 'Planes',
    cambiarVideo: 'Cambiar vídeo',

    heroEyebrow: 'CONOCIMIENTO MULTILINGÜE DESDE VÍDEO',
    heroHeadline: 'Deja de perder lo que ves.',
    heroSub: 'Guarda cualquier vídeo. Recibe las ideas, el vocabulario, las citas — en tu idioma.',
    heroUrlInputLabel: 'Enlace de YouTube',
    heroPlaceholder: 'https://www.youtube.com/watch?v=…',
    primaryCTA: 'Crear mi primer Pack',
    seeHowCTA: 'Ver cómo funciona',
    invalidUrl: 'No se reconoce el enlace de YouTube.',
    trySamplePack: 'Ver un Knowledge Pack de ejemplo',

    problemTitle: 'Consumes horas de vídeo. Recuerdas apenas nada.',
    problemBody: 'Vemos horas de YouTube, podcasts y cursos. En una semana, las ideas más fuertes se han ido. Y no puedes buscar lo que viste — el conocimiento queda encerrado dentro del vídeo.',

    solutionTitle: 'Del vídeo, un registro al que vuelves.',
    solutionBody: 'VozClara convierte cualquier vídeo en un Knowledge Pack — un registro estructurado, buscable y multilingüe de lo que se dijo y de lo que importa. Guárdalo, organízalo, búscalo, hazle preguntas.',

    howTitle: 'Cómo funciona',
    howSteps: ['Pega un enlace', 'Elige idioma y modo', 'Genera un Knowledge Pack', 'Guárdalo en tu biblioteca', 'Pregúntale más tarde'],
    howDescriptions: [
      'Cualquier vídeo de YouTube en inglés, español o alemán.',
      'Cuatro modos: Learn, Briefing, Estudio y Creator. Cada uno con su propia voz.',
      'Resumen, ideas, plan de acción, vocabulario y más — adaptados a tu modo.',
      'Etiquetado, organizado y buscable. Permanece en tu dispositivo.',
      'Haz preguntas sobre todo lo que has guardado.',
    ],

    kpTitle: 'Anatomía de un Knowledge Pack',
    kpSub: 'Cada vídeo se convierte en esto:',
    kpSections: [
      { label: 'Resumen breve', example: 'Una o dos frases con lo esencial.' },
      { label: 'Resumen extenso', example: 'Tres a cinco frases que sitúan el contexto.' },
      { label: 'Capítulos', example: 'El vídeo dividido por temas, con marcas de tiempo.' },
      { label: 'Ideas clave', example: 'Las afirmaciones que merecen recordarse.' },
      { label: 'Plan de acción', example: 'Pasos concretos que puedes aplicar esta semana.' },
      { label: 'Vocabulario', example: 'Términos importantes con contexto y traducción.' },
      { label: 'Citas', example: 'Frases memorables con timestamp y hablante.' },
      { label: 'Quiz', example: 'Preguntas para comprobar tu comprensión.' },
      { label: 'Transcripción', example: 'Texto completo con sincronización de vídeo.' },
      { label: 'Etiquetas', example: 'Categorías para organizar tu biblioteca.' },
    ],

    libraryTitle: 'Tu biblioteca, no la de YouTube',
    librarySub: 'Todo lo que guardas, organizado. Filtros por idioma, modo, categoría y fecha.',

    askEyebrow: 'PREGUNTAS · BIBLIOTECA · IA',
    askTitle: 'Pregúntale a tu biblioteca.',
    askSub: 'A través de cientos de vídeos guardados, en tu idioma, con citas a timestamps exactos:',
    askExamples: [
      '¿Qué dijeron mis vídeos guardados sobre ventas?',
      'Resume todo lo que guardé sobre IA, en español.',
      'Crea un plan de aprendizaje de 7 días con mis vídeos.',
    ],

    langTitle: 'Tres idiomas hoy. Cinco pronto.',
    langActive: 'Activos: Inglés · Español · Alemán',
    langSoon: 'Pronto: Portugués · Francés',

    pricingTitle: 'Empieza gratis. Crece cuando lo necesites.',
    pricingSub: 'Al instante y gratis.',
    tiers: [
      { name: 'Free · disponible hoy', price: '0 €', period: '', blurb: 'Todo lo que ya funciona — disponible, sin cuenta.', features: ['Knowledge Packs ilimitados', 'Los cuatro modos: Learn · Briefing · Estudio · Creator', 'Cuatro idiomas: ES · PT · DE · EN', 'Repetición espaciada con racha diaria', 'Shadowing con puntuación de pronunciación', 'Tutor IA por Pack', 'Exportación a Anki (.apkg)', 'Ask My Knowledge — Q&A sobre tu biblioteca', 'Biblioteca local en tu navegador'], cta: 'Empezar' },
      { name: 'Pro · próximamente', price: '9 €', period: '/ mes', blurb: 'Cuando llegue: lo que el plan gratuito no puede dar.', features: ['Sincronización entre dispositivos', 'Voz premium para texto-a-voz', 'Exportación a PDF y Notion', 'Quote-cards con tu marca', 'Soporte prioritario'], cta: 'Apúntate' },
    ],

    finalTitle: 'Empieza a guardar el conocimiento detrás de cada vídeo.',
    finalSub: 'Tu primer Knowledge Pack en menos de un minuto.',
    finalCTA: 'Empezar ahora',

    newPageTitle: 'Nuevo Knowledge Pack',
    stepUrl: 'Enlace',
    stepMode: 'Modo',
    stepLanguage: 'Idioma',
    stepGenerate: 'Generar',
    chooseModeTitle: 'Elige cómo quieres leer este vídeo',
    chooseModeSub: 'El modo determina qué se extrae y cómo se presenta.',
    modeRecommended: 'Recomendado',
    outputLangLabel: 'Idioma del Knowledge Pack',
    generateBtn: 'Generar Knowledge Pack',
    progressPhrases: [
      'Leyendo la fuente.',
      'Identificando temas.',
      'Destilando ideas clave.',
      'Componiendo el resumen.',
    ],

    modes: {
      learn: {
        name: 'Learn',
        tagline: 'Para estudiar a fondo.',
        description: 'Explicaciones claras, vocabulario con contexto y un quiz para comprobar tu comprensión.',
        bullets: ['Resumen ejecutivo', 'Capítulos temáticos', 'Vocabulario con contexto', 'Quiz de comprensión'],
      },
      brief: {
        name: 'Briefing',
        tagline: 'Para decisiones rápidas.',
        description: 'Resumen ejecutivo, implicaciones estratégicas, plan de acción y citas clave para llevar.',
        bullets: ['Resumen ejecutivo', 'Ideas clave estratégicas', 'Plan de acción concreto', 'Citas memorables'],
      },
      study: {
        name: 'Estudio',
        tagline: 'Para preparar el examen.',
        description: 'Resúmenes de capítulo, vocabulario técnico, cuestionario de comprensión y citas con marca de tiempo.',
        bullets: ['Capítulos detallados', 'Vocabulario académico', 'Cuestionario profundo', 'Citas con timestamp'],
      },
      creator: {
        name: 'Creator',
        tagline: 'Para distribuir contenido.',
        description: 'Hooks, ángulos de redes sociales, captions listas y citas más virales.',
        bullets: ['Resumen de contenido', 'Hooks para redes', 'Captions traducidas', 'Citas más virales'],
      },
    },

    packBackToLibrary: '← Biblioteca',
    packSavedToLibrary: 'Guardado en tu biblioteca',
    packDelete: 'Eliminar',
    packTabs: {
      summary: 'Resumen',
      chapters: 'Capítulos',
      insights: 'Ideas clave',
      actionPlan: 'Plan de acción',
      vocabulary: 'Vocabulario',
      quiz: 'Quiz',
      quotes: 'Citas',
      socialAngles: 'Redes',
      transcript: 'Transcripción',
    },

    libraryEmptyTitle: 'Tu biblioteca está vacía.',
    libraryEmptyBody: 'Crea tu primer Knowledge Pack a partir de cualquier vídeo de YouTube.',
    libraryEmptyCTA: 'Nuevo Knowledge Pack',
    libraryStats: ({ packs, ideas, langs, thisWeek }) =>
      `${packs} ${packs === 1 ? 'pack' : 'packs'} · ${ideas} ideas clave · ${langs} ${langs === 1 ? 'idioma' : 'idiomas'} · esta semana: ${thisWeek}`,
    searchPlaceholder: 'Buscar en tu biblioteca…',
    filterAll: 'Todos',
    filterMode: 'Modo',
    filterLang: 'Idioma',
    filterDate: 'Fecha',
    filterDate7: '7 días',
    filterDate30: '30 días',
    filterDateAll: 'Siempre',

    pulsaReproducir: 'Pulsa reproducir.',
    iniciarVoz: 'Iniciar voz',
    vozActivada: 'Voz activada',
    mostrarOriginal: 'Mostrar original',
    texto: 'Texto',
    preparingSubs: 'Preparando subtítulos…',
    insightsLoading: 'Analizando con IA…',
    insightsRetry: 'Reintentar análisis',
    insightsEmpty: 'No hay ideas extraídas.',
    insightsActionEmpty: 'Este vídeo no propone acciones concretas.',
    genreLabel: 'Tipo de contenido',
    genreNames: {
      news: 'Noticias', business: 'Empresarial', coaching: 'Coaching',
      education: 'Educativo', interview: 'Entrevista', creator: 'Creador',
      general: 'General',
    },

    footerTagline: 'Frankfurt · Donostia · Porto',
    footerBuiltBy: 'Built by LEON MARÉ',
  },

  /* ════════════════════════════════════════════════════════
     PORTUGUÊS
  ════════════════════════════════════════════════════════ */
  pt: {
    navLibrary: 'Biblioteca',
    navNew: 'Novo pack',
    navPricing: 'Planos',
    cambiarVideo: 'Mudar de vídeo',

    heroEyebrow: 'CONHECIMENTO MULTILINGUE A PARTIR DE VÍDEO',
    heroHeadline: 'Para de perder o que vês.',
    heroSub: 'Guarda qualquer vídeo. Recebe as ideias, o vocabulário, as citações — na tua língua.',
    heroUrlInputLabel: 'Link do YouTube',
    heroPlaceholder: 'https://www.youtube.com/watch?v=…',
    primaryCTA: 'Criar o meu primeiro Pack',
    seeHowCTA: 'Ver como funciona',
    invalidUrl: 'Link do YouTube não reconhecido.',
    trySamplePack: 'Ver um Knowledge Pack de exemplo',

    problemTitle: 'Consomes horas de vídeo. Lembras-te de quase nada.',
    problemBody: 'Vemos horas de YouTube, podcasts e cursos. Numa semana, as ideias mais fortes desaparecem. E não podemos pesquisar o que vimos — o conhecimento fica preso dentro do vídeo.',

    solutionTitle: 'Do vídeo, um registo ao qual voltas.',
    solutionBody: 'A VozClara transforma qualquer vídeo num Knowledge Pack — um registo estruturado, pesquisável e multilingue do que foi dito e do que importa. Guarda-o, organiza-o, pesquisa-o, faz-lhe perguntas.',

    howTitle: 'Como funciona',
    howSteps: ['Cola um link', 'Escolhe idioma e modo', 'Gera um Knowledge Pack', 'Guarda na tua biblioteca', 'Pergunta mais tarde'],
    howDescriptions: [
      'Qualquer vídeo do YouTube em inglês, espanhol ou alemão.',
      'Quatro modos: Learn, Briefing, Estudo e Creator. Cada um com voz própria.',
      'Resumo, ideias, plano de ação, vocabulário e mais — adaptado ao teu modo.',
      'Etiquetado, organizado e pesquisável. Fica no teu dispositivo.',
      'Faz perguntas sobre tudo o que guardaste.',
    ],

    kpTitle: 'Anatomia de um Knowledge Pack',
    kpSub: 'Cada vídeo torna-se nisto:',
    kpSections: [
      { label: 'Resumo curto', example: 'Uma ou duas frases com o essencial.' },
      { label: 'Resumo extenso', example: 'Três a cinco frases que situam o contexto.' },
      { label: 'Capítulos', example: 'O vídeo dividido por temas, com marcas de tempo.' },
      { label: 'Ideias-chave', example: 'As afirmações que merecem ser lembradas.' },
      { label: 'Plano de ação', example: 'Passos concretos para aplicar esta semana.' },
      { label: 'Vocabulário', example: 'Termos importantes com contexto e tradução.' },
      { label: 'Citações', example: 'Frases memoráveis com timestamp e orador.' },
      { label: 'Quiz', example: 'Perguntas para verificar a tua compreensão.' },
      { label: 'Transcrição', example: 'Texto completo com sincronização de vídeo.' },
      { label: 'Etiquetas', example: 'Categorias para organizar a tua biblioteca.' },
    ],

    libraryTitle: 'A tua biblioteca, não a do YouTube',
    librarySub: 'Tudo o que guardas, organizado. Filtros por idioma, modo, categoria e data.',

    askEyebrow: 'PERGUNTAS · BIBLIOTECA · IA',
    askTitle: 'Pergunta à tua biblioteca.',
    askSub: 'Através de centenas de vídeos guardados, na tua língua, com citações a timestamps exatos:',
    askExamples: [
      'O que disseram os meus vídeos guardados sobre vendas?',
      'Resume tudo o que guardei sobre IA, em português.',
      'Cria um plano de aprendizagem de 7 dias com os meus vídeos.',
    ],

    langTitle: 'Três idiomas hoje. Cinco em breve.',
    langActive: 'Ativos: Inglês · Espanhol · Alemão',
    langSoon: 'Em breve: Português · Francês',

    pricingTitle: 'Começa grátis. Cresce quando precisares.',
    pricingSub: 'Num instante e grátis.',
    tiers: [
      { name: 'Free · disponível hoje', price: '0 €', period: '', blurb: 'Tudo o que já funciona — disponível, sem conta.', features: ['Knowledge Packs ilimitados', 'Os quatro modos: Learn · Briefing · Estudo · Creator', 'Quatro idiomas: ES · PT · DE · EN', 'Repetição espaçada com sequência diária', 'Shadowing com pontuação de pronúncia', 'Tutor IA por Pack', 'Exportação para Anki (.apkg)', 'Ask My Knowledge — Q&A sobre a tua biblioteca', 'Biblioteca local no teu navegador'], cta: 'Começar' },
      { name: 'Pro · em breve', price: '9 €', period: '/ mês', blurb: 'Quando chegar: o que o plano gratuito não pode dar.', features: ['Sincronização entre dispositivos', 'Voz premium para texto-a-voz', 'Exportação para PDF e Notion', 'Quote-cards com a tua marca', 'Suporte prioritário'], cta: 'Inscreve-te' },
    ],

    finalTitle: 'Começa a guardar o conhecimento por detrás de cada vídeo.',
    finalSub: 'O teu primeiro Knowledge Pack em menos de um minuto.',
    finalCTA: 'Começar agora',

    newPageTitle: 'Novo Knowledge Pack',
    stepUrl: 'Link',
    stepMode: 'Modo',
    stepLanguage: 'Idioma',
    stepGenerate: 'Gerar',
    chooseModeTitle: 'Escolhe como queres ler este vídeo',
    chooseModeSub: 'O modo determina o que é extraído e como é apresentado.',
    modeRecommended: 'Recomendado',
    outputLangLabel: 'Idioma do Knowledge Pack',
    generateBtn: 'Gerar Knowledge Pack',
    progressPhrases: ['A ler a fonte.', 'A identificar temas.', 'A destilar ideias-chave.', 'A compor o resumo.'],

    modes: {
      learn: {
        name: 'Learn',
        tagline: 'Para estudar a fundo.',
        description: 'Explicações claras, vocabulário em contexto e um quiz para verificar a tua compreensão.',
        bullets: ['Resumo executivo', 'Capítulos temáticos', 'Vocabulário em contexto', 'Quiz de compreensão'],
      },
      brief: {
        name: 'Briefing',
        tagline: 'Para decisões rápidas.',
        description: 'Resumo executivo, implicações estratégicas, plano de ação e citações-chave.',
        bullets: ['Resumo executivo', 'Ideias estratégicas', 'Plano de ação concreto', 'Citações memoráveis'],
      },
      study: {
        name: 'Estudo',
        tagline: 'Para preparar o exame.',
        description: 'Resumos de capítulo, vocabulário técnico, questionário de compreensão e citações com timestamp.',
        bullets: ['Capítulos detalhados', 'Vocabulário académico', 'Questionário profundo', 'Citações com timestamp'],
      },
      creator: {
        name: 'Creator',
        tagline: 'Para distribuir conteúdo.',
        description: 'Hooks, ângulos para redes sociais, captions prontas e citações mais virais.',
        bullets: ['Resumo de conteúdo', 'Hooks para redes', 'Captions traduzidas', 'Citações virais'],
      },
    },

    packBackToLibrary: '← Biblioteca',
    packSavedToLibrary: 'Guardado na tua biblioteca',
    packDelete: 'Eliminar',
    packTabs: {
      summary: 'Resumo', chapters: 'Capítulos', insights: 'Ideias-chave',
      actionPlan: 'Plano de ação', vocabulary: 'Vocabulário', quiz: 'Quiz',
      quotes: 'Citações', socialAngles: 'Redes', transcript: 'Transcrição',
    },

    libraryEmptyTitle: 'A tua biblioteca está vazia.',
    libraryEmptyBody: 'Cria o teu primeiro Knowledge Pack a partir de qualquer vídeo do YouTube.',
    libraryEmptyCTA: 'Novo Knowledge Pack',
    libraryStats: ({ packs, ideas, langs, thisWeek }) =>
      `${packs} ${packs === 1 ? 'pack' : 'packs'} · ${ideas} ideias-chave · ${langs} ${langs === 1 ? 'idioma' : 'idiomas'} · esta semana: ${thisWeek}`,
    searchPlaceholder: 'Pesquisar na biblioteca…',
    filterAll: 'Todos',
    filterMode: 'Modo',
    filterLang: 'Idioma',
    filterDate: 'Data',
    filterDate7: '7 dias',
    filterDate30: '30 dias',
    filterDateAll: 'Sempre',

    pulsaReproducir: 'Carrega em reproduzir.',
    iniciarVoz: 'Iniciar voz',
    vozActivada: 'Voz ativada',
    mostrarOriginal: 'Mostrar original',
    texto: 'Texto',
    preparingSubs: 'A preparar legendas…',
    insightsLoading: 'Análise com IA…',
    insightsRetry: 'Repetir análise',
    insightsEmpty: 'Não há ideias extraídas.',
    insightsActionEmpty: 'Este vídeo não propõe ações concretas.',
    genreLabel: 'Tipo de conteúdo',
    genreNames: {
      news: 'Notícias', business: 'Empresarial', coaching: 'Coaching',
      education: 'Educativo', interview: 'Entrevista', creator: 'Criador',
      general: 'Geral',
    },

    footerTagline: 'Frankfurt · Donostia · Porto',
    footerBuiltBy: 'Built by LEON MARÉ',
  },

  /* ════════════════════════════════════════════════════════
     DEUTSCH
  ════════════════════════════════════════════════════════ */
  de: {
    navLibrary: 'Bibliothek',
    navNew: 'Neuer Pack',
    navPricing: 'Preise',
    cambiarVideo: 'Video wechseln',

    heroEyebrow: 'MEHRSPRACHIGES WISSEN AUS VIDEO',
    heroHeadline: 'Verlier nie wieder, was du schaust.',
    heroSub: 'Speichere jedes Video. Bekomm die Ideen, das Vokabular, die Zitate zurück — in deiner Sprache.',
    heroUrlInputLabel: 'YouTube-Link',
    heroPlaceholder: 'https://www.youtube.com/watch?v=…',
    primaryCTA: 'Mein erstes Pack erstellen',
    seeHowCTA: 'So funktioniert es',
    invalidUrl: 'YouTube-Link nicht erkannt.',
    trySamplePack: 'Beispiel-Pack ansehen',

    problemTitle: 'Du konsumierst Stunden an Videos. Du behältst kaum etwas.',
    problemBody: 'Wir schauen Stunden YouTube, Podcasts, Kurse. Innerhalb einer Woche sind die stärksten Ideen weg. Und wir können nicht durchsuchen, was wir gesehen haben — das Wissen bleibt im Video gefangen.',

    solutionTitle: 'Aus dem Video wird etwas, zu dem du zurückkehrst.',
    solutionBody: 'VozClara verwandelt jedes Video in einen Knowledge Pack — einen strukturierten, durchsuchbaren, mehrsprachigen Datensatz dessen was gesagt wurde und was zählt. Speichern, organisieren, suchen, befragen.',

    howTitle: 'So funktioniert es',
    howSteps: ['Link einfügen', 'Sprache und Modus wählen', 'Knowledge Pack erzeugen', 'In Bibliothek speichern', 'Später Fragen stellen'],
    howDescriptions: [
      'Jedes YouTube-Video auf Englisch, Spanisch oder Deutsch.',
      'Vier Modi: Learn, Briefing, Studieren, Creator. Jeder mit eigener Stimme.',
      'Zusammenfassung, Ideen, Aktionsplan, Vokabular und mehr.',
      'Mit Tags, organisiert, durchsuchbar. Bleibt auf deinem Gerät.',
      'Stell Fragen zu allem was du gespeichert hast.',
    ],

    kpTitle: 'Anatomie eines Knowledge Packs',
    kpSub: 'Jedes Video wird zu diesem:',
    kpSections: [
      { label: 'Kurzzusammenfassung', example: 'Ein bis zwei Sätze mit dem Wesentlichen.' },
      { label: 'Lange Zusammenfassung', example: 'Drei bis fünf Sätze für den Kontext.' },
      { label: 'Kapitel', example: 'Das Video nach Themen, mit Zeitmarken.' },
      { label: 'Kernideen', example: 'Die Aussagen die es wert sind erinnert zu werden.' },
      { label: 'Action Plan', example: 'Konkrete Schritte für diese Woche.' },
      { label: 'Vokabular', example: 'Wichtige Begriffe mit Kontext und Übersetzung.' },
      { label: 'Zitate', example: 'Prägnante Sätze mit Zeitstempel und Sprecher.' },
      { label: 'Quiz', example: 'Fragen zur Überprüfung deines Verständnisses.' },
      { label: 'Transkription', example: 'Vollständiger Text mit Video-Sync.' },
      { label: 'Tags', example: 'Kategorien zur Organisation deiner Bibliothek.' },
    ],

    libraryTitle: 'Deine Bibliothek, nicht die von YouTube',
    librarySub: 'Alles was du speicherst, organisiert. Filter nach Sprache, Modus, Kategorie und Datum.',

    askEyebrow: 'FRAGEN · BIBLIOTHEK · KI',
    askTitle: 'Frag deine Bibliothek.',
    askSub: 'Über hunderte gespeicherte Videos, in deiner Sprache, mit Zitaten auf exakte Timestamps:',
    askExamples: [
      'Was haben meine gespeicherten Videos über Vertrieb gesagt?',
      'Fasse alles zusammen was ich über KI gespeichert habe, auf Deutsch.',
      'Erstelle einen 7-Tage-Lernplan aus meinen Videos.',
    ],

    langTitle: 'Drei Sprachen heute. Fünf bald.',
    langActive: 'Aktiv: Englisch · Spanisch · Deutsch',
    langSoon: 'Bald: Portugiesisch · Französisch',

    pricingTitle: 'Kostenlos starten. Wachsen wenn nötig.',
    pricingSub: 'Sofort und gratis.',
    tiers: [
      { name: 'Free · heute verfügbar', price: '0 €', period: '', blurb: 'Alles was schon funktioniert — frei nutzbar, ohne Konto.', features: ['Unbegrenzte Knowledge Packs', 'Alle vier Modi: Learn · Briefing · Studieren · Creator', 'Vier Sprachen: ES · PT · DE · EN', 'Spaced Repetition mit Tages-Streak', 'Shadowing mit Aussprache-Bewertung', 'KI-Tutor pro Pack', 'Anki-Export (.apkg)', 'Ask My Knowledge — Q&A über deine Bibliothek', 'Lokale Bibliothek im Browser'], cta: 'Starten' },
      { name: 'Pro · in Kürze', price: '9 €', period: '/ Monat', blurb: 'Wenn es kommt: was der Free-Plan nicht leisten kann.', features: ['Geräte-Sync', 'Premium-Stimme für Text-to-Speech', 'Export nach PDF und Notion', 'Quote-Cards mit deinem Branding', 'Priority-Support'], cta: 'Auf Warteliste' },
    ],

    finalTitle: 'Fang an, das Wissen hinter jedem Video zu speichern.',
    finalSub: 'Dein erster Knowledge Pack in unter einer Minute.',
    finalCTA: 'Jetzt starten',

    newPageTitle: 'Neuer Knowledge Pack',
    stepUrl: 'Link',
    stepMode: 'Modus',
    stepLanguage: 'Sprache',
    stepGenerate: 'Erzeugen',
    chooseModeTitle: 'Wähl wie du dieses Video lesen willst',
    chooseModeSub: 'Der Modus bestimmt was extrahiert und wie es präsentiert wird.',
    modeRecommended: 'Empfohlen',
    outputLangLabel: 'Sprache des Knowledge Packs',
    generateBtn: 'Knowledge Pack erzeugen',
    progressPhrases: ['Lese die Quelle.', 'Identifiziere Themen.', 'Destilliere Kernideen.', 'Verfasse die Zusammenfassung.'],

    modes: {
      learn: {
        name: 'Learn',
        tagline: 'Zum vertieften Studium.',
        description: 'Klare Erklärungen, Vokabular im Kontext und ein Quiz zur Überprüfung.',
        bullets: ['Executive Summary', 'Thematische Kapitel', 'Vokabular mit Kontext', 'Verständnis-Quiz'],
      },
      brief: {
        name: 'Briefing',
        tagline: 'Für schnelle Entscheidungen.',
        description: 'Executive Summary, strategische Implikationen, Action Plan und Schlüssel-Zitate.',
        bullets: ['Executive Summary', 'Strategische Ideen', 'Konkreter Action Plan', 'Prägnante Zitate'],
      },
      study: {
        name: 'Studieren',
        tagline: 'Für die Prüfungsvorbereitung.',
        description: 'Kapitel-Zusammenfassungen, Fachvokabular, Verständnis-Quiz und Zitate mit Timestamps.',
        bullets: ['Tiefe Kapitel-Summary', 'Akademisches Vokabular', 'Verständnis-Quiz', 'Zitate mit Timestamp'],
      },
      creator: {
        name: 'Creator',
        tagline: 'Für Content-Distribution.',
        description: 'Hooks, Social-Media-Angles, fertige Captions und die viralsten Zitate.',
        bullets: ['Content-Summary', 'Hooks für Social', 'Übersetzte Captions', 'Virale Zitate'],
      },
    },

    packBackToLibrary: '← Bibliothek',
    packSavedToLibrary: 'In Bibliothek gespeichert',
    packDelete: 'Löschen',
    packTabs: {
      summary: 'Zusammenfassung', chapters: 'Kapitel', insights: 'Kernideen',
      actionPlan: 'Action Plan', vocabulary: 'Vokabular', quiz: 'Quiz',
      quotes: 'Zitate', socialAngles: 'Social', transcript: 'Transkription',
    },

    libraryEmptyTitle: 'Deine Bibliothek ist leer.',
    libraryEmptyBody: 'Erstell deinen ersten Knowledge Pack aus einem YouTube-Video.',
    libraryEmptyCTA: 'Neuer Knowledge Pack',
    libraryStats: ({ packs, ideas, langs, thisWeek }) =>
      `${packs} ${packs === 1 ? 'Pack' : 'Packs'} · ${ideas} Kernideen · ${langs} ${langs === 1 ? 'Sprache' : 'Sprachen'} · diese Woche: ${thisWeek}`,
    searchPlaceholder: 'In Bibliothek suchen…',
    filterAll: 'Alle',
    filterMode: 'Modus',
    filterLang: 'Sprache',
    filterDate: 'Datum',
    filterDate7: '7 Tage',
    filterDate30: '30 Tage',
    filterDateAll: 'Immer',

    pulsaReproducir: 'Drück Wiedergabe.',
    iniciarVoz: 'Stimme starten',
    vozActivada: 'Stimme aktiv',
    mostrarOriginal: 'Original anzeigen',
    texto: 'Text',
    preparingSubs: 'Untertitel werden vorbereitet…',
    insightsLoading: 'KI analysiert…',
    insightsRetry: 'Analyse wiederholen',
    insightsEmpty: 'Keine Ideen extrahiert.',
    insightsActionEmpty: 'Dieses Video schlägt keine konkreten Aktionen vor.',
    genreLabel: 'Inhaltstyp',
    genreNames: {
      news: 'Nachrichten', business: 'Business', coaching: 'Coaching',
      education: 'Bildung', interview: 'Interview', creator: 'Creator',
      general: 'Allgemein',
    },

    footerTagline: 'Frankfurt · Donostia · Porto',
    footerBuiltBy: 'Built by LEON MARÉ',
  },

  /* ════════════════════════════════════════════════════════
     ENGLISH
  ════════════════════════════════════════════════════════ */
  en: {
    navLibrary: 'Library',
    navNew: 'New pack',
    navPricing: 'Pricing',
    cambiarVideo: 'Change video',

    heroEyebrow: 'MULTILINGUAL KNOWLEDGE FROM VIDEO',
    heroHeadline: 'Stop losing what you watch.',
    heroSub: 'Save any video. Get back the ideas, the vocabulary, the citations — in your language.',
    heroUrlInputLabel: 'YouTube link',
    heroPlaceholder: 'https://www.youtube.com/watch?v=…',
    primaryCTA: 'Make my first Pack',
    seeHowCTA: 'See how it works',
    invalidUrl: 'YouTube link not recognised.',
    trySamplePack: 'See a sample Knowledge Pack',

    problemTitle: 'You consume hours of video. You remember almost none of it.',
    problemBody: 'We watch hours of YouTube, podcasts, and courses. Within a week, the strongest ideas are gone. And we cannot search what we watched — the knowledge stays locked inside the video.',

    solutionTitle: 'From video, a record you can return to.',
    solutionBody: 'VozClara turns any video into a Knowledge Pack — a structured, searchable, multilingual record of what was said and what matters. Save it, organise it, search it, ask it questions.',

    howTitle: 'How it works',
    howSteps: ['Paste a link', 'Choose language and mode', 'Generate a Knowledge Pack', 'Save it to your library', 'Ask questions later'],
    howDescriptions: [
      'Any YouTube video in English, Spanish or German.',
      'Four modes: Learn, Briefing, Study, Creator. Each with its own voice.',
      'Summary, ideas, action plan, vocabulary and more — adapted to your mode.',
      'Tagged, organised, searchable. Stays on your device.',
      'Ask questions across everything you saved.',
    ],

    kpTitle: 'Anatomy of a Knowledge Pack',
    kpSub: 'Every video becomes this:',
    kpSections: [
      { label: 'Short summary', example: 'One or two sentences with the essential.' },
      { label: 'Long summary', example: 'Three to five sentences setting context.' },
      { label: 'Chapters', example: 'The video by theme, with timestamps.' },
      { label: 'Key ideas', example: 'The claims worth remembering.' },
      { label: 'Action plan', example: 'Concrete steps you can take this week.' },
      { label: 'Vocabulary', example: 'Important terms with context and translation.' },
      { label: 'Quotes', example: 'Memorable lines with timestamp and speaker.' },
      { label: 'Quiz', example: 'Questions to verify your understanding.' },
      { label: 'Transcript', example: 'Full text with video sync.' },
      { label: 'Tags', example: 'Categories to organise your library.' },
    ],

    libraryTitle: 'Your library, not YouTube’s',
    librarySub: 'Everything you save, organised. Filters by language, mode, category and date.',

    askEyebrow: 'QUESTIONS · LIBRARY · AI',
    askTitle: 'Ask your library.',
    askSub: 'Across hundreds of saved videos, in your language, with citations to exact timestamps:',
    askExamples: [
      'What did my saved videos say about sales?',
      'Summarise everything I saved about AI, in English.',
      'Build a 7-day learning plan from my videos.',
    ],

    langTitle: 'Three languages today. Five soon.',
    langActive: 'Active: English · Spanish · German',
    langSoon: 'Coming soon: Portuguese · French',

    pricingTitle: 'Start free. Grow when you need it.',
    pricingSub: 'Instant and free.',
    tiers: [
      { name: 'Free · available today', price: '€0', period: '', blurb: 'Everything that already works — no card, no account.', features: ['Unlimited Knowledge Packs', 'All four modes: Learn · Briefing · Study · Creator', 'Four languages: ES · PT · DE · EN', 'Spaced repetition with daily streak', 'Voice shadowing with pronunciation score', 'AI tutor per Pack', 'Anki deck export (.apkg)', 'Ask My Knowledge — library Q&A', 'Library local in your browser'], cta: 'Start' },
      { name: 'Pro · coming soon', price: '€9', period: '/ month', blurb: 'When it ships: what the free plan can\'t offer.', features: ['Sync across devices', 'Premium voice for text-to-speech', 'PDF and Notion export', 'Brand-customised quote-cards', 'Priority support'], cta: 'Join waitlist' },
    ],

    finalTitle: 'Start saving the knowledge behind every video.',
    finalSub: 'Your first Knowledge Pack in under a minute.',
    finalCTA: 'Start now',

    newPageTitle: 'New Knowledge Pack',
    stepUrl: 'Link',
    stepMode: 'Mode',
    stepLanguage: 'Language',
    stepGenerate: 'Generate',
    chooseModeTitle: 'Choose how you want to read this video',
    chooseModeSub: 'The mode shapes what is extracted and how it is presented.',
    modeRecommended: 'Recommended',
    outputLangLabel: 'Knowledge Pack language',
    generateBtn: 'Generate Knowledge Pack',
    progressPhrases: ['Reading the source.', 'Identifying themes.', 'Distilling key ideas.', 'Composing the summary.'],

    modes: {
      learn: {
        name: 'Learn',
        tagline: 'For deep study.',
        description: 'Clear explanations, vocabulary in context, and a quiz to verify your understanding.',
        bullets: ['Executive summary', 'Thematic chapters', 'Vocabulary in context', 'Comprehension quiz'],
      },
      brief: {
        name: 'Briefing',
        tagline: 'For fast decisions.',
        description: 'Executive summary, strategic implications, action plan and key quotes to take with you.',
        bullets: ['Executive summary', 'Strategic insights', 'Concrete action plan', 'Memorable quotes'],
      },
      study: {
        name: 'Study',
        tagline: 'For exam prep.',
        description: 'Chapter-grade summaries, academic vocabulary, comprehension quiz and timestamped quotes.',
        bullets: ['Deep chapter summaries', 'Academic vocabulary', 'Comprehension quiz', 'Timestamped quotes'],
      },
      creator: {
        name: 'Creator',
        tagline: 'For distribution.',
        description: 'Hooks, social-media angles, ready captions and the most viral quotes.',
        bullets: ['Content summary', 'Hooks for socials', 'Translated captions', 'Viral quotes'],
      },
    },

    packBackToLibrary: '← Library',
    packSavedToLibrary: 'Saved to your library',
    packDelete: 'Delete',
    packTabs: {
      summary: 'Summary', chapters: 'Chapters', insights: 'Key ideas',
      actionPlan: 'Action plan', vocabulary: 'Vocabulary', quiz: 'Quiz',
      quotes: 'Quotes', socialAngles: 'Social', transcript: 'Transcript',
    },

    libraryEmptyTitle: 'Your library is empty.',
    libraryEmptyBody: 'Create your first Knowledge Pack from any YouTube video.',
    libraryEmptyCTA: 'New Knowledge Pack',
    libraryStats: ({ packs, ideas, langs, thisWeek }) =>
      `${packs} ${packs === 1 ? 'pack' : 'packs'} · ${ideas} key ideas · ${langs} ${langs === 1 ? 'language' : 'languages'} · this week: ${thisWeek}`,
    searchPlaceholder: 'Search your library…',
    filterAll: 'All',
    filterMode: 'Mode',
    filterLang: 'Language',
    filterDate: 'Date',
    filterDate7: '7 days',
    filterDate30: '30 days',
    filterDateAll: 'All time',

    pulsaReproducir: 'Press play.',
    iniciarVoz: 'Start voice',
    vozActivada: 'Voice on',
    mostrarOriginal: 'Show original',
    texto: 'Text',
    preparingSubs: 'Preparing subtitles…',
    insightsLoading: 'AI is analysing…',
    insightsRetry: 'Retry analysis',
    insightsEmpty: 'No insights extracted.',
    insightsActionEmpty: 'This video proposes no concrete actions.',
    genreLabel: 'Content type',
    genreNames: {
      news: 'News', business: 'Business', coaching: 'Coaching',
      education: 'Educational', interview: 'Interview', creator: 'Creator',
      general: 'General',
    },

    footerTagline: 'Frankfurt · Donostia · Porto',
    footerBuiltBy: 'Built by LEON MARÉ',
  },
};

/* ─── Tiny store ─────────────────────────────────────────────────────── */

const STORAGE_KEY = 'vozclara:locale';

function initialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
    const nav = navigator.language?.slice(0, 2).toLowerCase();
    if (SUPPORTED_LOCALES.includes(nav as Locale)) return nav as Locale;
  }
  return 'es';
}

let currentLocale: Locale = initialLocale();
// Keep <html lang> in sync with the auto-detected locale on first
// load so screen readers + SEO crawlers see the actual rendered
// language instead of the static "es-ES" baked into index.html.
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLocale;
}
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(l: Locale): void {
  if (currentLocale === l || !SUPPORTED_LOCALES.includes(l)) return;
  currentLocale = l;
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch { /* ignore */ }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = l;
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useLocale(): { locale: Locale; t: Strings; setLocale: (l: Locale) => void } {
  const locale = useSyncExternalStore(subscribe, () => currentLocale, () => currentLocale);
  return { locale, t: STRINGS[locale], setLocale };
}
