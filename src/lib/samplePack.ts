import type { KnowledgePack, PackTranslation } from './pack';

/**
 * Pre-baked sample Knowledge Packs — one per mode. Used by:
 *   • the landing page hero (live interactive preview)
 *   • the "Ver un Knowledge Pack de ejemplo" tertiary link
 *   • direct deep-links: /pack/sample, /pack/sample-learn, /pack/sample-creator
 *
 * Real-feeling content condensed from actual videos. Same source video
 * for all three so the user sees the SAME content through three different
 * editorial lenses — that's the demonstration of mode value.
 *
 * v2 shape: per-mode content is held in named PackTranslation constants
 * (businessES / learnES / creatorES) and assembled into the pack's
 * `translations` map. Today every sample ships in Spanish only; when
 * we add the on-demand translation flow, additional languages will
 * appear under the same pack id as extra keys in `translations`.
 */

const COMMON = {
  brainId: 'sample',
  source: {
    type: 'youtube' as const,
    url: 'https://www.youtube.com/watch?v=rFpH_LArf34',
    videoId: 'rFpH_LArf34',
    durationSec: 900,
    thumbnailUrl: 'https://i.ytimg.com/vi/rFpH_LArf34/hqdefault.jpg',
    channel: 'tagesschau',
  },
  title: 'Tagesschau 20:00 Uhr · 03.05.2026',
  sourceLang: 'de' as const,
  outputLang: 'es' as const,
  outputLanguages: ['es' as const],
  genre: 'news' as const,
  status: 'ready' as const,
  category: 'news',
  isPublic: true,
  createdAt: Date.parse('2026-05-03T20:00:00Z'),
  updatedAt: Date.parse('2026-05-03T20:00:00Z'),
  tags: ['política', 'alemania', 'coalición'],
};

/* ─── Business mode — Spanish translation ─────────────────────────────── */

const businessES: PackTranslation = {
  summary: {
    short: 'Un año en el cargo, Merz se enfrenta a una coalición tensa, reformas estancadas y la AfD ganando terreno en el este.',
    long: 'El canciller alemán Friedrich Merz cumple un año en el cargo en un momento delicado. Su coalición negro-roja prometía un arranque rápido, pero los proyectos de reforma en pensiones y fiscalidad se han atascado. La relación entre Unión y SPD se ha vuelto cada vez más tensa, y Merz ha reconocido públicamente un creciente descontento dentro de su propio partido por los compromisos alcanzados con el socio de coalición. Mientras tanto, la Alternativa para Alemania sigue ganando apoyo en los Estados del Este, donde el rechazo a la política migratoria de la Unión es alto. Voces dentro de la propia Unión piden un endurecimiento de la política de extranjería.',
  },
  chapters: [
    { startSec: 0, title: 'Apertura', summary: 'Saludo y resumen de titulares.' },
    { startSec: 23, title: 'Merz un año en el cargo', summary: 'Balance político tras doce meses.' },
    { startSec: 180, title: 'Reformas atascadas', summary: 'Pensiones y fiscalidad en punto muerto.' },
    { startSec: 360, title: 'AfD en el Este', summary: 'Avance del partido en los Länder orientales.' },
    { startSec: 540, title: 'Migración como punto de fricción', summary: 'Voces internas piden mano dura.' },
  ],
  keyIdeas: [
    {
      title: 'La coalición negro-roja se desgasta',
      body: 'La relación entre Unión y SPD se ha tensado al punto de bloquear las reformas que ambos partidos defendieron en campaña. La falta de acuerdo en pensiones y fiscalidad mina la credibilidad del gobierno antes de su segundo año.',
    },
    {
      title: 'Merz reconoce el malestar interno',
      body: 'En su entrevista con Caren Miosga, el canciller admitió que crece la inquietud dentro de su propio partido por los compromisos con el socio de coalición. La declaración pública es inusual y debilita su posición negociadora.',
    },
    {
      title: 'La AfD se asienta en el Este',
      body: 'El partido sigue consolidándose en los Estados orientales, alimentado por el rechazo a la política migratoria de la Unión. Cualquier endurecimiento de la posición de Merz le obligaría a competir directamente en el terreno de la AfD.',
    },
    {
      title: 'La política migratoria como línea de ruptura',
      body: 'Voces internas piden un giro más restrictivo, lo que abriría un frente con el SPD y con los socios europeos. La decisión definirá la identidad del gobierno en su segunda mitad de mandato.',
    },
    {
      title: 'El reloj presupuestario aprieta',
      body: 'El próximo presupuesto federal se negocia en otoño, y los ministerios de Finanzas y Trabajo parten con posiciones incompatibles. Sin acuerdo sobre la senda fiscal, la coalición arrastrará la incertidumbre hasta 2027 — algo que ni Merz ni Klingbeil pueden permitirse en términos electorales.',
    },
  ],
  actionPlan: [
    'Vigilar las próximas votaciones en el Bundestag sobre el paquete de pensiones — son el termómetro de la coalición.',
    'Monitorizar las encuestas regionales en Sajonia y Turingia: la AfD podría superar el 30 % en próximos sondeos.',
    'Identificar a los diputados de la Unión que públicamente piden endurecer la política migratoria — futuras voces clave.',
    'Seguir los próximos datos económicos del segundo trimestre — un mal Q2 añadiría presión decisiva sobre la reforma fiscal.',
    'Observar el lenguaje de Lars Klingbeil (SPD) en sus próximas intervenciones: su tono marcará si el SPD se prepara para una salida ordenada o para un enfrentamiento abierto.',
    'Estudiar a la CSU bávara por separado de la Unión: un realineamiento de Markus Söder podría redefinir la coalición desde dentro antes que cualquier ruptura formal.',
  ],
  keyQuotes: [
    { text: 'Hay en las propias filas un creciente descontento con los compromisos asumidos con el socio de coalición.', original: 'Es gebe in den eigenen Reihen einen größer werdenden Unmut über Kompromisse.', speaker: 'Friedrich Merz', timestampSec: 44 },
    { text: 'Los proyectos de reforma en pensiones y fiscalidad se vuelven difíciles.', original: 'Reformprojekte bei Rente und Steuer gestalten sich schwierig.', speaker: 'Susanne Daubner', timestampSec: 34 },
    { text: 'Políticamente, Merz está bajo presión un año después de asumir el cargo.', original: 'Politisch steht Merz ein Jahr nach Amtsantritt unter Druck.', speaker: 'Susanne Daubner', timestampSec: 58 },
    { text: 'En el Este de Alemania la AfD sigue ganando terreno.', original: 'Im Osten Deutschlands legt die AfD weiter zu.', speaker: 'Susanne Daubner', timestampSec: 372 },
    { text: 'Voces dentro de la propia Unión exigen un enfoque más duro contra la migración.', original: 'Stimmen aus den eigenen Reihen, die ein härteres Vorgehen gegen die Migration fordern.', speaker: 'Susanne Daubner', timestampSec: 554 },
  ],
  vocabulary: [],
  socialAngles: [],
  quiz: [],
};

/* ─── Learn mode — Spanish translation ────────────────────────────────── */

const learnES: PackTranslation = {
  summary: {
    short: 'Un año del gobierno de Merz: aprende qué es una coalición negro-roja, por qué las reformas se atascan y qué dice este caso sobre la política alemana.',
    long: 'Este vídeo de la Tagesschau analiza el primer año del canciller Friedrich Merz. La pieza ilustra varios conceptos clave de la política alemana: la dinámica de las coaliciones de gobierno (Unión + SPD, "schwarz-rot"), los puntos de fricción habituales entre socios de coalición (pensiones, fiscalidad, migración), y el papel de la AfD como tercera fuerza emergente sobre todo en los Estados del Este. Es un buen ejemplo para entender cómo funciona el sistema parlamentario alemán bajo presión.',
  },
  chapters: [
    { startSec: 0, title: 'Apertura informativa', summary: 'Estructura típica del telediario alemán.' },
    { startSec: 23, title: 'El concepto de coalición negro-roja', summary: 'Qué significa la combinación Unión + SPD.' },
    { startSec: 180, title: 'Reformas estructurales', summary: 'Pensiones y fiscalidad como temas clásicos de tensión.' },
    { startSec: 360, title: 'El sistema federal alemán', summary: 'Diferencias entre Länder del Este y del Oeste.' },
    { startSec: 540, title: 'La AfD como nuevo actor político', summary: 'Por qué crece y dónde.' },
  ],
  keyIdeas: [
    {
      title: 'Las coaliciones alemanas se llaman por sus colores',
      body: 'Negro = Unión (CDU/CSU, conservadores). Rojo = SPD (socialdemócratas). "Schwarz-Rot" es la gran coalición histórica de Alemania, que combina los dos partidos tradicionales. Otras combinaciones tienen sus propios nombres: "Ampel" (semáforo, SPD + verdes + liberales), "Jamaika" (CDU + verdes + liberales), etc.',
    },
    {
      title: 'Los puntos de fricción son siempre los mismos',
      body: 'Pensiones, fiscalidad y migración son los tres temas donde las coaliciones alemanas suelen atascarse. Cada partido tiene posiciones difíciles de conciliar. Cuando un canciller habla de "compromisos difíciles", normalmente se refiere a uno de estos tres ámbitos.',
    },
    {
      title: 'Alemania del Este y del Oeste votan distinto',
      body: 'Más de 30 años después de la reunificación, los Estados orientales (Sajonia, Turingia, Brandeburgo) siguen mostrando patrones de voto distintos a los occidentales. La AfD obtiene resultados muy superiores en el Este, donde el descontento con la política migratoria es más fuerte.',
    },
    {
      title: 'El lenguaje político alemán es muy preciso',
      body: 'En alemán cada actor político tiene su nombre exacto: "Bundeskanzler" (canciller federal), "Bundestag" (parlamento federal), "Bundesländer" (estados federados), "Koalitionspartner" (socio de coalición). No hay sinónimos sueltos: si entiendes los términos, entiendes el sistema. Por eso aprender este vocabulario abre la lectura de cualquier periódico alemán (FAZ, SZ, Zeit, taz) en una semana.',
    },
  ],
  vocabulary: [
    { word: 'die Koalition', translation: 'la coalición', context: 'Seine schwarz-rote Koalition wollte einen schnellen Aufbruch.', partOfSpeech: 'sustantivo (f)' },
    { word: 'der Bundeskanzler', translation: 'el canciller federal', context: 'Bundeskanzler Merz ist ein Jahr im Amt.', partOfSpeech: 'sustantivo (m)' },
    { word: 'die Rente', translation: 'la pensión', context: 'Reformprojekte bei Rente und Steuer gestalten sich schwierig.', partOfSpeech: 'sustantivo (f)' },
    { word: 'die Steuer', translation: 'el impuesto / la fiscalidad', context: 'Reformprojekte bei Rente und Steuer.', partOfSpeech: 'sustantivo (f)' },
    { word: 'der Unmut', translation: 'el descontento, el malestar', context: 'Einen größer werdenden Unmut über Kompromisse.', partOfSpeech: 'sustantivo (m)' },
    { word: 'der Kompromiss', translation: 'el compromiso (acuerdo)', context: 'Über Kompromisse, die eingegangen werden.', partOfSpeech: 'sustantivo (m)' },
    { word: 'der Jahrestag', translation: 'el aniversario', context: 'Kurz vor dem Jahrestag steckt sie im Stimmungstief.', partOfSpeech: 'sustantivo (m)' },
    { word: 'zerstritten', translation: 'enfrentado, desavenido', context: 'Union und SPD wirken zunehmend zerstritten.', partOfSpeech: 'adjetivo' },
    { word: 'zulegen', translation: 'ganar terreno, aumentar', context: 'Im Osten Deutschlands legt die AfD weiter zu.', partOfSpeech: 'verbo' },
    { word: 'die Migration', translation: 'la migración', context: 'Stimmen die ein härteres Vorgehen gegen die Migration fordern.', partOfSpeech: 'sustantivo (f)' },
  ],
  quiz: [
    { question: '¿Qué significa "schwarz-rote Koalition"?', answer: 'Coalición negro-roja: la alianza entre la Unión (CDU/CSU, conservadores, negro) y el SPD (socialdemócratas, rojo).', explanation: 'En Alemania las coaliciones se nombran por los colores de los partidos: negro = Unión, rojo = SPD, verde = Die Grünen, amarillo = FDP.' },
    { question: '¿Cuáles son los tres ámbitos donde la coalición de Merz se está atascando, según el vídeo?', answer: 'Pensiones (Rente), fiscalidad (Steuer) y migración.', explanation: 'Son los tres temas clásicos de fricción en las grandes coaliciones alemanas.' },
    { question: '¿En qué parte de Alemania la AfD está ganando más terreno?', answer: 'En el Este (Sajonia, Turingia, Brandeburgo).', explanation: 'El descontento con la política migratoria es más fuerte allí.' },
    { question: '¿Qué hizo Merz en la entrevista con Caren Miosga que fue políticamente inusual?', answer: 'Reconoció públicamente el malestar dentro de su propio partido por los compromisos con el SPD.', explanation: 'Un canciller raramente admite divisiones internas en público — debilita su posición negociadora.' },
    { question: '¿Qué quiere decir "den Jahrestag" en este contexto?', answer: 'El aniversario — específicamente, el primer año de Merz como canciller.', explanation: '"Tag" = día; "Jahr" = año; "Jahrestag" = el día anual, el aniversario.' },
    { question: 'En alemán, ¿qué diferencia hay entre "der Bundestag" y "die Bundesländer"?', answer: '"Der Bundestag" es el parlamento federal (una sola cámara nacional). "Die Bundesländer" son los 16 estados federados de Alemania.', explanation: '"Bund" = federación. "Tag" en este contexto significa "asamblea, junta". "Land" = país / estado. Plural: "Länder".' },
    { question: '¿Qué quiere decir que dos socios de coalición están "zerstritten"?', answer: 'Que están enfrentados, en disputa, desavenidos. La palabra describe un nivel grave de conflicto, no una simple discrepancia.', explanation: 'Verbo base: "streiten" (discutir, pelear). El prefijo "zer-" intensifica y sugiere ruptura. "Zerstritten" es más fuerte que "uneinig" (no estar de acuerdo).' },
  ],
  actionPlan: [
    'Practica las palabras-clave del vocabulario (Koalition, Bundeskanzler, Unmut, Kompromiss) construyendo dos frases propias para cada una durante esta semana.',
    'Escucha la próxima edición de la Tagesschau (20:00, ARD) e identifica al menos tres términos políticos del vocabulario en contexto real.',
    'Anota tres ejemplos de uso de "zerstritten" o "zulegen" que encuentres esta semana en periódicos alemanes (FAZ, Süddeutsche Zeitung, Die Zeit).',
    'Resume en alemán, en cinco frases, la situación política descrita en el vídeo. Si conoces a un hablante nativo, pídele revisión.',
    'Repasa el cuestionario en siete días — la memoria activa retiene mucho mejor con repetición espaciada.',
  ],
  keyQuotes: [],
  socialAngles: [],
};

/* ─── Creator mode — Spanish translation ──────────────────────────────── */

const creatorES: PackTranslation = {
  summary: {
    short: 'Tres ángulos virales del primer aniversario de Merz: la grieta interna, el ascenso de la AfD en el Este, y por qué las reformas alemanas se atascan.',
    long: 'El primer aniversario del canciller Merz ofrece material rico para contenido en redes. Tres ángulos destacan: la admisión pública del propio Merz sobre el malestar interno en su partido (genera engagement por el "drama"), el avance imparable de la AfD en el Este (controversia + relevancia internacional), y el patrón clásico de las coaliciones alemanas atascadas en pensiones-fiscalidad-migración (educativo + transferible a otros países).',
  },
  chapters: [
    { startSec: 0, title: 'Apertura del telediario', summary: 'Hook visual fuerte — la presentadora institucional como anclaje de credibilidad.' },
    { startSec: 23, title: 'El balance del año', summary: 'Mucho material editorial aquí — frases lapidarias, contraste expectativa-realidad.' },
    { startSec: 180, title: 'La grieta interna como momento viral', summary: 'Merz admitiendo en cámara que su partido está dividido — clip de 15 segundos para Reels y TikTok.' },
    { startSec: 360, title: 'Material para el ángulo Este vs Oeste', summary: 'Mapas, gráficos y cifras — perfecto para carruseles informativos en Instagram.' },
    { startSec: 540, title: 'La AfD como elephant in the room', summary: 'Tema viral por excelencia — combinar con contexto histórico para evitar superficialidad.' },
  ],
  keyIdeas: [
    {
      title: 'El canciller que admite que su partido está dividido',
      body: 'La declaración de Merz reconociendo el malestar interno es excepcional. Para contenido: el ángulo no es la política, es la admisión humana. Funciona en cualquier audiencia.',
    },
    {
      title: 'El Este alemán como historia recurrente',
      body: 'Cada subida de la AfD es noticia. Pero la historia real es estructural: 35 años después de la reunificación, los patrones de voto siguen divididos. Eso da para una serie, no para un post.',
    },
    {
      title: 'Pensiones-fiscalidad-migración: el triángulo eterno',
      body: 'Los mismos tres temas atascan las coaliciones alemanas década tras década. Material excelente para un explainer educativo en redes (TikTok, Reels): "Por qué los gobiernos alemanes siempre se rompen por las mismas tres cosas".',
    },
  ],
  socialAngles: [
    { hook: 'Un canciller alemán acaba de admitir en TV nacional que su propio partido está harto de sus compromisos.', caption: 'Friedrich Merz cumple un año en el cargo y dijo lo que ningún canciller dice: que dentro de la Unión hay "creciente descontento" con los acuerdos del SPD. En política alemana eso es casi un anuncio de fractura.' },
    { hook: 'La AfD podría superar el 30 % en Sajonia. ¿Cuándo deja de ser anomalía y empieza a ser sistema?', caption: 'Llevamos tres elecciones diciendo que es un pico. El Este alemán vota distinto desde hace décadas, y nadie en Berlín ha encontrado la respuesta. Hilo abajo.' },
    { hook: 'Pensiones. Fiscalidad. Migración. Tres palabras que rompen toda coalición alemana desde 1949.', caption: 'Cambia el canciller, cambia la combinación de partidos, cambia la década — los tres temas son los mismos. Si entiendes esto, entiendes la política alemana.' },
    { hook: 'En Alemania las coaliciones tienen nombres de banderas. La de Merz se llama "negro-rojo".', caption: 'Aquí lo decodifico en 60 segundos: schwarz-rot, Ampel, Jamaika, Kenia, Deutschland — cada combinación de partidos tiene su nombre. Educación política express.' },
    { hook: 'Susanne Daubner es la cara más reconocible de la tele alemana. Y hoy abrió con esto.', caption: 'La presentadora de la Tagesschau lleva décadas como referencia institucional en Alemania. Su tono mide el peso de cada historia. Hoy abrió en serio.' },
  ],
  keyQuotes: [
    { text: '"Hay en las propias filas un creciente descontento con los compromisos."', original: 'Es gebe in den eigenen Reihen einen größer werdenden Unmut über Kompromisse.', speaker: 'Friedrich Merz', timestampSec: 44 },
    { text: '"Sus proyectos de reforma se vuelven difíciles."', original: 'Reformprojekte gestalten sich schwierig.', speaker: 'Susanne Daubner', timestampSec: 34 },
    { text: '"Políticamente, Merz está bajo presión un año después de asumir."', original: 'Politisch steht Merz ein Jahr nach Amtsantritt unter Druck.', speaker: 'Susanne Daubner', timestampSec: 58 },
    { text: '"En el Este de Alemania la AfD sigue ganando terreno."', original: 'Im Osten Deutschlands legt die AfD weiter zu.', speaker: 'Susanne Daubner', timestampSec: 372 },
  ],
  actionPlan: [
    'Convertir la admisión de Merz en un Reel de 30 segundos con texto en pantalla.',
    'Hilo de Twitter sobre la lógica de nombres de coaliciones alemanas — alto valor educativo.',
    'Carrusel de Instagram sobre el patrón pensiones-fiscalidad-migración: una historia de 70 años.',
  ],
  vocabulary: [],
  quiz: [],
};

/* ─── Pack assembly ───────────────────────────────────────────────────── */

export const samplePackBusiness: KnowledgePack = {
  ...COMMON,
  id: 'sample',
  mode: 'business',
  translations: { es: businessES },
};

export const samplePackLearn: KnowledgePack = {
  ...COMMON,
  id: 'sample-learn',
  mode: 'learn',
  translations: { es: learnES },
};

export const samplePackCreator: KnowledgePack = {
  ...COMMON,
  id: 'sample-creator',
  mode: 'creator',
  translations: { es: creatorES },
};

/** Lookup by id — used by PackPage when ?id is sample / sample-learn / sample-creator. */
export function getSamplePack(id: string): KnowledgePack | null {
  if (id === 'sample' || id === 'sample-business') return samplePackBusiness;
  if (id === 'sample-learn') return samplePackLearn;
  if (id === 'sample-creator') return samplePackCreator;
  return null;
}

/** Default alias for backwards compat with /pack/sample link. */
export const samplePack = samplePackBusiness;
