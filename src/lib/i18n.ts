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
  modes: Record<'learn' | 'business' | 'creator', ModeStrings>;

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

    heroEyebrow: 'NUBE DE CONOCIMIENTO · VÍDEO · IA',
    heroHeadline: 'Tu nube multilingüe de conocimiento para vídeos.',
    heroSub: 'Guarda cualquier vídeo, extrae las ideas clave, tradúcelas a tu idioma y construye una biblioteca de aprendizaje a partir de todo lo que ves.',
    heroPlaceholder: 'https://www.youtube.com/watch?v=…',
    primaryCTA: 'Empieza tu nube de conocimiento',
    seeHowCTA: 'Ver cómo funciona',
    invalidUrl: 'No se reconoce el enlace de YouTube.',
    trySamplePack: 'Ver un Knowledge Pack de ejemplo',

    problemTitle: 'Consumes horas de vídeo. Recuerdas apenas nada.',
    problemBody: 'Cada día vemos YouTube, podcasts y cursos. Las ideas más valiosas desaparecen en una semana. Y lo peor: no se pueden buscar. El conocimiento queda atrapado dentro del vídeo.',

    solutionTitle: 'Vídeo entra. Conocimiento estructurado sale.',
    solutionBody: 'VozClara convierte cualquier vídeo en un Knowledge Pack — un registro estructurado, buscable y multilingüe de lo que se dijo y de lo que importa. Guárdalo, organízalo, búscalo, hazle preguntas.',

    howTitle: 'Cómo funciona',
    howSteps: ['Pega un enlace', 'Elige idioma y modo', 'Genera un Knowledge Pack', 'Guárdalo en tu biblioteca', 'Pregúntale más tarde'],
    howDescriptions: [
      'Cualquier vídeo de YouTube en inglés, español o alemán.',
      'Tres modos: Learn, Business y Creator. Cada uno con su propia voz.',
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
    askSub: 'Habla con tu propio archivo de conocimiento:',
    askExamples: [
      '¿Qué dijeron mis vídeos guardados sobre ventas?',
      'Resume todo lo que guardé sobre IA, en español.',
      'Crea un plan de aprendizaje de 7 días con mis vídeos.',
    ],

    langTitle: 'Tres idiomas hoy. Cinco pronto.',
    langActive: 'Activos: Inglés · Español · Alemán',
    langSoon: 'Pronto: Portugués · Francés',

    pricingTitle: 'Empieza gratis. Crece cuando lo necesites.',
    pricingSub: 'Sin tarjeta para empezar.',
    tiers: [
      { name: 'Free', price: '0 €', period: '', blurb: 'Para probar VozClara.', features: ['3 Knowledge Packs al mes', 'Biblioteca local en tu dispositivo', 'Todos los modos', 'Exportar como texto'], cta: 'Empezar' },
      { name: 'Pro', price: '9 €', period: '/ mes', blurb: 'Para uso personal regular.', features: ['50 Knowledge Packs al mes', 'Sincronización entre dispositivos', 'Etiquetas y colecciones', 'Ask My Knowledge'], cta: 'Elegir Pro' },
      { name: 'Power Learner', price: '19 €', period: '/ mes', blurb: 'Para quien aprende a fondo.', features: ['Packs ilimitados', 'Generador de planes de aprendizaje', 'Repaso espaciado de vocabulario', 'Exportar a PDF y Notion'], cta: 'Elegir Power' },
      { name: 'Creator / Business', price: '49 €', period: '/ mes', blurb: 'Para creadores y equipos.', features: ['Todo lo anterior', 'Quote-cards con tu marca', 'Workspace para equipos', 'Prompts personalizables'], cta: 'Elegir Creator' },
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
      business: {
        name: 'Business',
        tagline: 'Para decisiones rápidas.',
        description: 'Resumen ejecutivo, implicaciones estratégicas, plan de acción y citas clave para llevar.',
        bullets: ['Resumen ejecutivo', 'Ideas clave estratégicas', 'Plan de acción concreto', 'Citas memorables'],
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

    heroEyebrow: 'NUVEM DE CONHECIMENTO · VÍDEO · IA',
    heroHeadline: 'A sua nuvem multilingue de conhecimento para vídeos.',
    heroSub: 'Guarde qualquer vídeo, extraia as ideias-chave, traduza-as para o seu idioma e construa uma biblioteca de aprendizagem a partir de tudo o que vê.',
    heroPlaceholder: 'https://www.youtube.com/watch?v=…',
    primaryCTA: 'Comece a sua nuvem de conhecimento',
    seeHowCTA: 'Ver como funciona',
    invalidUrl: 'Link do YouTube não reconhecido.',
    trySamplePack: 'Ver um Knowledge Pack de exemplo',

    problemTitle: 'Consome horas de vídeo. Lembra-se de quase nada.',
    problemBody: 'Vemos YouTube, podcasts e cursos todos os dias. As ideias mais valiosas desaparecem numa semana. Pior: não se podem pesquisar. O conhecimento fica preso dentro do vídeo.',

    solutionTitle: 'Vídeo entra. Conhecimento estruturado sai.',
    solutionBody: 'A VozClara transforma qualquer vídeo num Knowledge Pack — um registo estruturado, pesquisável e multilingue do que foi dito e do que importa. Guarde-o, organize-o, pesquise-o, faça-lhe perguntas.',

    howTitle: 'Como funciona',
    howSteps: ['Cole um link', 'Escolha idioma e modo', 'Gere um Knowledge Pack', 'Guarde na sua biblioteca', 'Pergunte mais tarde'],
    howDescriptions: [
      'Qualquer vídeo do YouTube em inglês, espanhol ou alemão.',
      'Três modos: Learn, Business e Creator. Cada um com a sua voz.',
      'Resumo, ideias, plano de ação, vocabulário e mais — adaptado ao seu modo.',
      'Etiquetado, organizado e pesquisável. Fica no seu dispositivo.',
      'Faça perguntas sobre tudo o que guardou.',
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
      { label: 'Quiz', example: 'Perguntas para verificar a sua compreensão.' },
      { label: 'Transcrição', example: 'Texto completo com sincronização de vídeo.' },
      { label: 'Etiquetas', example: 'Categorias para organizar a sua biblioteca.' },
    ],

    libraryTitle: 'A sua biblioteca, não a do YouTube',
    librarySub: 'Tudo o que guarda, organizado. Filtros por idioma, modo, categoria e data.',

    askEyebrow: 'PERGUNTAS · BIBLIOTECA · IA',
    askTitle: 'Pergunte à sua biblioteca.',
    askSub: 'Fale com o seu próprio arquivo de conhecimento:',
    askExamples: [
      'O que disseram os meus vídeos guardados sobre vendas?',
      'Resume tudo o que guardei sobre IA, em português.',
      'Cria um plano de aprendizagem de 7 dias com os meus vídeos.',
    ],

    langTitle: 'Três idiomas hoje. Cinco em breve.',
    langActive: 'Ativos: Inglês · Espanhol · Alemão',
    langSoon: 'Em breve: Português · Francês',

    pricingTitle: 'Comece grátis. Cresça quando precisar.',
    pricingSub: 'Sem cartão para começar.',
    tiers: [
      { name: 'Free', price: '0 €', period: '', blurb: 'Para experimentar.', features: ['3 Knowledge Packs por mês', 'Biblioteca local', 'Todos os modos', 'Exportar como texto'], cta: 'Começar' },
      { name: 'Pro', price: '9 €', period: '/ mês', blurb: 'Para uso pessoal regular.', features: ['50 packs por mês', 'Sincronização entre dispositivos', 'Etiquetas e coleções', 'Ask My Knowledge'], cta: 'Escolher Pro' },
      { name: 'Power Learner', price: '19 €', period: '/ mês', blurb: 'Para quem aprende a fundo.', features: ['Packs ilimitados', 'Planos de aprendizagem', 'Revisão espaçada', 'Exportar para PDF e Notion'], cta: 'Escolher Power' },
      { name: 'Creator / Business', price: '49 €', period: '/ mês', blurb: 'Para criadores e equipas.', features: ['Tudo o anterior', 'Quote-cards com a sua marca', 'Workspace para equipas', 'Prompts personalizáveis'], cta: 'Escolher Creator' },
    ],

    finalTitle: 'Comece a guardar o conhecimento por detrás de cada vídeo.',
    finalSub: 'O seu primeiro Knowledge Pack em menos de um minuto.',
    finalCTA: 'Começar agora',

    newPageTitle: 'Novo Knowledge Pack',
    stepUrl: 'Link',
    stepMode: 'Modo',
    stepLanguage: 'Idioma',
    stepGenerate: 'Gerar',
    chooseModeTitle: 'Escolha como quer ler este vídeo',
    chooseModeSub: 'O modo determina o que é extraído e como é apresentado.',
    modeRecommended: 'Recomendado',
    outputLangLabel: 'Idioma do Knowledge Pack',
    generateBtn: 'Gerar Knowledge Pack',
    progressPhrases: ['A ler a fonte.', 'A identificar temas.', 'A destilar ideias-chave.', 'A compor o resumo.'],

    modes: {
      learn: {
        name: 'Learn',
        tagline: 'Para estudar a fundo.',
        description: 'Explicações claras, vocabulário em contexto e um quiz para verificar a sua compreensão.',
        bullets: ['Resumo executivo', 'Capítulos temáticos', 'Vocabulário em contexto', 'Quiz de compreensão'],
      },
      business: {
        name: 'Business',
        tagline: 'Para decisões rápidas.',
        description: 'Resumo executivo, implicações estratégicas, plano de ação e citações-chave.',
        bullets: ['Resumo executivo', 'Ideias estratégicas', 'Plano de ação concreto', 'Citações memoráveis'],
      },
      creator: {
        name: 'Creator',
        tagline: 'Para distribuir conteúdo.',
        description: 'Hooks, ângulos para redes sociais, captions prontas e citações mais virais.',
        bullets: ['Resumo de conteúdo', 'Hooks para redes', 'Captions traduzidas', 'Citações virais'],
      },
    },

    packBackToLibrary: '← Biblioteca',
    packSavedToLibrary: 'Guardado na sua biblioteca',
    packDelete: 'Eliminar',
    packTabs: {
      summary: 'Resumo', chapters: 'Capítulos', insights: 'Ideias-chave',
      actionPlan: 'Plano de ação', vocabulary: 'Vocabulário', quiz: 'Quiz',
      quotes: 'Citações', socialAngles: 'Redes', transcript: 'Transcrição',
    },

    libraryEmptyTitle: 'A sua biblioteca está vazia.',
    libraryEmptyBody: 'Crie o seu primeiro Knowledge Pack a partir de qualquer vídeo do YouTube.',
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

    pulsaReproducir: 'Carregue em reproduzir.',
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

    heroEyebrow: 'WISSENS-CLOUD · VIDEO · KI',
    heroHeadline: 'Ihre mehrsprachige Wissens-Cloud für Videos.',
    heroSub: 'Speichern Sie jedes Video, extrahieren Sie die Kernideen, übersetzen Sie sie in Ihre Sprache und bauen Sie eine durchsuchbare Lernbibliothek aus allem auf, was Sie sehen.',
    heroPlaceholder: 'https://www.youtube.com/watch?v=…',
    primaryCTA: 'Wissens-Cloud starten',
    seeHowCTA: 'So funktioniert es',
    invalidUrl: 'YouTube-Link nicht erkannt.',
    trySamplePack: 'Beispiel-Pack ansehen',

    problemTitle: 'Sie konsumieren Stunden an Videos. Sie behalten kaum etwas.',
    problemBody: 'Wir sehen täglich YouTube, Podcasts und Kurse. Die wertvollsten Ideen verschwinden innerhalb einer Woche. Schlimmer: sie sind nicht durchsuchbar. Das Wissen bleibt im Video gefangen.',

    solutionTitle: 'Video rein. Strukturiertes Wissen raus.',
    solutionBody: 'VozClara verwandelt jedes Video in einen Knowledge Pack — einen strukturierten, durchsuchbaren, mehrsprachigen Datensatz dessen was gesagt wurde und was zählt. Speichern, organisieren, suchen, befragen.',

    howTitle: 'So funktioniert es',
    howSteps: ['Link einfügen', 'Sprache und Modus wählen', 'Knowledge Pack erzeugen', 'In Bibliothek speichern', 'Später Fragen stellen'],
    howDescriptions: [
      'Jedes YouTube-Video auf Englisch, Spanisch oder Deutsch.',
      'Drei Modi: Learn, Business, Creator. Jeder mit eigener Stimme.',
      'Zusammenfassung, Ideen, Aktionsplan, Vokabular und mehr.',
      'Mit Tags, organisiert, durchsuchbar. Bleibt auf Ihrem Gerät.',
      'Stellen Sie Fragen zu allem was Sie gespeichert haben.',
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
      { label: 'Quiz', example: 'Fragen zur Überprüfung Ihres Verständnisses.' },
      { label: 'Transkription', example: 'Vollständiger Text mit Video-Sync.' },
      { label: 'Tags', example: 'Kategorien zur Organisation Ihrer Bibliothek.' },
    ],

    libraryTitle: 'Ihre Bibliothek, nicht die von YouTube',
    librarySub: 'Alles was Sie speichern, organisiert. Filter nach Sprache, Modus, Kategorie und Datum.',

    askEyebrow: 'FRAGEN · BIBLIOTHEK · KI',
    askTitle: 'Fragen Sie Ihre Bibliothek.',
    askSub: 'Sprechen Sie mit Ihrem eigenen Wissensarchiv:',
    askExamples: [
      'Was haben meine gespeicherten Videos über Vertrieb gesagt?',
      'Fasse alles zusammen was ich über KI gespeichert habe, auf Deutsch.',
      'Erstelle einen 7-Tage-Lernplan aus meinen Videos.',
    ],

    langTitle: 'Drei Sprachen heute. Fünf bald.',
    langActive: 'Aktiv: Englisch · Spanisch · Deutsch',
    langSoon: 'Bald: Portugiesisch · Französisch',

    pricingTitle: 'Kostenlos starten. Wachsen wenn nötig.',
    pricingSub: 'Keine Kreditkarte zum Start.',
    tiers: [
      { name: 'Free', price: '0 €', period: '', blurb: 'Zum Ausprobieren.', features: ['3 Packs / Monat', 'Lokale Bibliothek', 'Alle Modi', 'Text-Export'], cta: 'Starten' },
      { name: 'Pro', price: '9 €', period: '/ Monat', blurb: 'Für regelmäßigen Gebrauch.', features: ['50 Packs / Monat', 'Geräte-Sync', 'Tags & Sammlungen', 'Ask My Knowledge'], cta: 'Pro wählen' },
      { name: 'Power Learner', price: '19 €', period: '/ Monat', blurb: 'Für tiefes Lernen.', features: ['Unbegrenzte Packs', 'Lernpläne', 'Spaced Repetition', 'Export nach PDF und Notion'], cta: 'Power wählen' },
      { name: 'Creator / Business', price: '49 €', period: '/ Monat', blurb: 'Für Creators und Teams.', features: ['Alles vorherige', 'Quote-Cards mit Branding', 'Team-Workspace', 'Eigene Prompts'], cta: 'Creator wählen' },
    ],

    finalTitle: 'Beginnen Sie das Wissen hinter jedem Video zu speichern.',
    finalSub: 'Ihr erster Knowledge Pack in unter einer Minute.',
    finalCTA: 'Jetzt starten',

    newPageTitle: 'Neuer Knowledge Pack',
    stepUrl: 'Link',
    stepMode: 'Modus',
    stepLanguage: 'Sprache',
    stepGenerate: 'Erzeugen',
    chooseModeTitle: 'Wählen Sie wie Sie dieses Video lesen wollen',
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
      business: {
        name: 'Business',
        tagline: 'Für schnelle Entscheidungen.',
        description: 'Executive Summary, strategische Implikationen, Action Plan und Schlüssel-Zitate.',
        bullets: ['Executive Summary', 'Strategische Ideen', 'Konkreter Action Plan', 'Prägnante Zitate'],
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

    libraryEmptyTitle: 'Ihre Bibliothek ist leer.',
    libraryEmptyBody: 'Erstellen Sie Ihren ersten Knowledge Pack aus einem YouTube-Video.',
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

    pulsaReproducir: 'Drücken Sie Wiedergabe.',
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

    heroEyebrow: 'KNOWLEDGE CLOUD · VIDEO · AI',
    heroHeadline: 'Your multilingual knowledge cloud for videos.',
    heroSub: 'Save any video, extract the key ideas, translate them into your language, and build a searchable learning library from everything you watch.',
    heroPlaceholder: 'https://www.youtube.com/watch?v=…',
    primaryCTA: 'Start building your knowledge cloud',
    seeHowCTA: 'See how it works',
    invalidUrl: 'YouTube link not recognised.',
    trySamplePack: 'See a sample Knowledge Pack',

    problemTitle: 'You consume hours of video. You remember almost none of it.',
    problemBody: 'Every day we watch YouTube, podcasts and courses. The most valuable ideas disappear within a week. Worse — you cannot search what you watched. The knowledge stays locked inside the video.',

    solutionTitle: 'Video in. Structured knowledge out.',
    solutionBody: 'VozClara turns any video into a Knowledge Pack — a structured, searchable, multilingual record of what was said and what matters. Save it, organise it, search it, ask it questions.',

    howTitle: 'How it works',
    howSteps: ['Paste a link', 'Choose language and mode', 'Generate a Knowledge Pack', 'Save it to your library', 'Ask questions later'],
    howDescriptions: [
      'Any YouTube video in English, Spanish or German.',
      'Three modes: Learn, Business, Creator. Each with its own voice.',
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
    askSub: 'Talk to your own knowledge archive:',
    askExamples: [
      'What did my saved videos say about sales?',
      'Summarise everything I saved about AI, in English.',
      'Build a 7-day learning plan from my videos.',
    ],

    langTitle: 'Three languages today. Five soon.',
    langActive: 'Active: English · Spanish · German',
    langSoon: 'Coming soon: Portuguese · French',

    pricingTitle: 'Start free. Grow when you need it.',
    pricingSub: 'No card required to start.',
    tiers: [
      { name: 'Free', price: '€0', period: '', blurb: 'To try VozClara.', features: ['3 Knowledge Packs / month', 'Local library on device', 'All modes', 'Export as text'], cta: 'Start' },
      { name: 'Pro', price: '€9', period: '/ month', blurb: 'For regular personal use.', features: ['50 packs / month', 'Sync across devices', 'Tags and collections', 'Ask My Knowledge'], cta: 'Choose Pro' },
      { name: 'Power Learner', price: '€19', period: '/ month', blurb: 'For deep learners.', features: ['Unlimited packs', 'Learning-plan generator', 'Spaced repetition for vocabulary', 'PDF and Notion export'], cta: 'Choose Power' },
      { name: 'Creator / Business', price: '€49', period: '/ month', blurb: 'For creators and teams.', features: ['Everything above', 'Quote-cards with your branding', 'Team workspace', 'Custom prompts'], cta: 'Choose Creator' },
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
      business: {
        name: 'Business',
        tagline: 'For fast decisions.',
        description: 'Executive summary, strategic implications, action plan and key quotes to take with you.',
        bullets: ['Executive summary', 'Strategic insights', 'Concrete action plan', 'Memorable quotes'],
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
