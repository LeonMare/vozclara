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

/* ─── Business mode — English translation ─────────────────────────────── */

const businessEN: PackTranslation = {
  summary: {
    short: 'One year in office, Merz faces a strained coalition, stalled reforms, and the AfD gaining ground in the east.',
    long: 'German chancellor Friedrich Merz marks his first year in office at a delicate moment. His black-red coalition promised a quick start, but reform projects on pensions and taxation have stalled. The relationship between the Union and the SPD has become increasingly tense, and Merz has publicly acknowledged growing dissatisfaction within his own party over compromises reached with the coalition partner. Meanwhile, the Alternative for Germany continues to gain support in the eastern states, where rejection of the Union’s migration policy is high. Voices within the Union itself are calling for a tightening of immigration policy.',
  },
  chapters: [
    { startSec: 0, title: 'Opening', summary: 'Greeting and headline summary.' },
    { startSec: 23, title: 'Merz one year in office', summary: 'Political assessment after twelve months.' },
    { startSec: 180, title: 'Stalled reforms', summary: 'Pensions and taxation at a standstill.' },
    { startSec: 360, title: 'AfD in the East', summary: 'The party advances in the eastern Länder.' },
    { startSec: 540, title: 'Migration as a friction point', summary: 'Internal voices call for a harder line.' },
  ],
  keyIdeas: [
    {
      title: 'The black-red coalition is eroding',
      body: 'The relationship between the Union and the SPD has tensed to the point of blocking the reforms both parties championed during the campaign. The lack of agreement on pensions and taxation undermines the government’s credibility before its second year.',
    },
    {
      title: 'Merz acknowledges internal unease',
      body: 'In his interview with Caren Miosga, the chancellor admitted that disquiet is growing within his own party over compromises with the coalition partner. The public statement is unusual and weakens his negotiating position.',
    },
    {
      title: 'The AfD settles in the East',
      body: 'The party continues consolidating in the eastern states, fuelled by rejection of the Union’s migration policy. Any hardening of Merz’s position would force him to compete directly on the AfD’s home turf.',
    },
    {
      title: 'Migration policy as a fracture line',
      body: 'Internal voices demand a more restrictive turn, which would open a front with the SPD and with European partners. The decision will define the government’s identity in the second half of its mandate.',
    },
    {
      title: 'The budget clock is tightening',
      body: 'The next federal budget is negotiated in autumn, and the Finance and Labour ministries start from incompatible positions. Without agreement on the fiscal path, the coalition will drag uncertainty into 2027 — something neither Merz nor Klingbeil can afford electorally.',
    },
  ],
  actionPlan: [
    'Track the upcoming Bundestag votes on the pension package — they are the coalition’s thermometer.',
    'Watch regional polls in Saxony and Thuringia: the AfD could clear 30 % in upcoming surveys.',
    'Identify Union MPs publicly calling to tighten migration policy — these are the future key voices.',
    'Follow the next Q2 economic data — a weak quarter would add decisive pressure on the tax reform.',
    'Listen to Lars Klingbeil’s (SPD) language in his next speeches: his tone signals whether the SPD is preparing for an orderly exit or open confrontation.',
    'Study the Bavarian CSU separately from the Union — a realignment by Markus Söder could redefine the coalition from within before any formal rupture.',
  ],
  keyQuotes: [
    { text: 'There is growing dissatisfaction in our own ranks with the compromises made with the coalition partner.', original: 'Es gebe in den eigenen Reihen einen größer werdenden Unmut über Kompromisse.', speaker: 'Friedrich Merz', timestampSec: 44 },
    { text: 'The reform projects on pensions and taxation are becoming difficult.', original: 'Reformprojekte bei Rente und Steuer gestalten sich schwierig.', speaker: 'Susanne Daubner', timestampSec: 34 },
    { text: 'Politically, Merz is under pressure one year after taking office.', original: 'Politisch steht Merz ein Jahr nach Amtsantritt unter Druck.', speaker: 'Susanne Daubner', timestampSec: 58 },
    { text: 'In eastern Germany, the AfD continues to gain ground.', original: 'Im Osten Deutschlands legt die AfD weiter zu.', speaker: 'Susanne Daubner', timestampSec: 372 },
    { text: 'Voices within the Union itself are demanding a tougher approach to migration.', original: 'Stimmen aus den eigenen Reihen, die ein härteres Vorgehen gegen die Migration fordern.', speaker: 'Susanne Daubner', timestampSec: 554 },
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

/* ─── Learn mode — English translation ────────────────────────────────── */

const learnEN: PackTranslation = {
  summary: {
    short: 'One year of the Merz government: learn what a black-red coalition is, why the reforms are stalling, and what this case says about German politics.',
    long: 'This Tagesschau report analyses the first year of chancellor Friedrich Merz. The piece illustrates several key concepts of German politics: the dynamics of governing coalitions (Union + SPD, "schwarz-rot"), the usual friction points between coalition partners (pensions, taxation, migration), and the role of the AfD as a third emergent force, particularly in the eastern states. A good example for understanding how the German parliamentary system operates under pressure.',
  },
  chapters: [
    { startSec: 0, title: 'News opening', summary: 'The typical structure of the German evening news.' },
    { startSec: 23, title: 'The black-red coalition concept', summary: 'What the Union + SPD combination means.' },
    { startSec: 180, title: 'Structural reforms', summary: 'Pensions and taxation as classic friction topics.' },
    { startSec: 360, title: 'The German federal system', summary: 'Differences between eastern and western Länder.' },
    { startSec: 540, title: 'The AfD as a new political actor', summary: 'Why it grows, and where.' },
  ],
  keyIdeas: [
    {
      title: 'German coalitions are named by colour',
      body: 'Black = Union (CDU/CSU, conservatives). Red = SPD (social democrats). "Schwarz-Rot" is Germany’s historic grand coalition, combining the two traditional parties. Other combinations have their own names: "Ampel" (traffic light: SPD + Greens + Liberals), "Jamaika" (CDU + Greens + Liberals), and so on.',
    },
    {
      title: 'The friction points are always the same',
      body: 'Pensions, taxation and migration are the three topics where German coalitions tend to stall. Each party holds positions that are hard to reconcile. When a chancellor talks about "difficult compromises", they are usually referring to one of these three areas.',
    },
    {
      title: 'East and West Germany still vote differently',
      body: 'More than 30 years after reunification, the eastern states (Saxony, Thuringia, Brandenburg) still show voting patterns distinct from the western ones. The AfD gets much stronger results in the East, where dissatisfaction with migration policy runs deeper.',
    },
    {
      title: 'German political vocabulary is precise',
      body: 'In German every political actor has an exact name: "Bundeskanzler" (federal chancellor), "Bundestag" (federal parliament), "Bundesländer" (federal states), "Koalitionspartner" (coalition partner). No loose synonyms — if you understand the terms, you understand the system. That is why learning this vocabulary unlocks reading any German newspaper (FAZ, SZ, Zeit, taz) within a week.',
    },
  ],
  vocabulary: [
    { word: 'die Koalition', translation: 'the coalition', context: 'Seine schwarz-rote Koalition wollte einen schnellen Aufbruch.', partOfSpeech: 'noun (f)' },
    { word: 'der Bundeskanzler', translation: 'the federal chancellor', context: 'Bundeskanzler Merz ist ein Jahr im Amt.', partOfSpeech: 'noun (m)' },
    { word: 'die Rente', translation: 'the pension', context: 'Reformprojekte bei Rente und Steuer gestalten sich schwierig.', partOfSpeech: 'noun (f)' },
    { word: 'die Steuer', translation: 'the tax / taxation', context: 'Reformprojekte bei Rente und Steuer.', partOfSpeech: 'noun (f)' },
    { word: 'der Unmut', translation: 'dissatisfaction, unease', context: 'Einen größer werdenden Unmut über Kompromisse.', partOfSpeech: 'noun (m)' },
    { word: 'der Kompromiss', translation: 'the compromise', context: 'Über Kompromisse, die eingegangen werden.', partOfSpeech: 'noun (m)' },
    { word: 'der Jahrestag', translation: 'the anniversary', context: 'Kurz vor dem Jahrestag steckt sie im Stimmungstief.', partOfSpeech: 'noun (m)' },
    { word: 'zerstritten', translation: 'at loggerheads, in dispute', context: 'Union und SPD wirken zunehmend zerstritten.', partOfSpeech: 'adjective' },
    { word: 'zulegen', translation: 'to gain ground, to grow', context: 'Im Osten Deutschlands legt die AfD weiter zu.', partOfSpeech: 'verb' },
    { word: 'die Migration', translation: 'migration', context: 'Stimmen die ein härteres Vorgehen gegen die Migration fordern.', partOfSpeech: 'noun (f)' },
  ],
  quiz: [
    { question: 'What does "schwarz-rote Koalition" mean?', answer: 'Black-red coalition: the alliance between the Union (CDU/CSU, conservatives, black) and the SPD (social democrats, red).', explanation: 'In Germany coalitions are named by the parties’ colours: black = Union, red = SPD, green = Die Grünen, yellow = FDP.' },
    { question: 'According to the video, which three areas is Merz’s coalition getting stuck on?', answer: 'Pensions (Rente), taxation (Steuer) and migration.', explanation: 'These are the three classic friction topics in large German coalitions.' },
    { question: 'Where in Germany is the AfD gaining the most ground?', answer: 'In the East (Saxony, Thuringia, Brandenburg).', explanation: 'Dissatisfaction with migration policy runs deeper there.' },
    { question: 'What did Merz do in his interview with Caren Miosga that was politically unusual?', answer: 'He publicly acknowledged the unease inside his own party about the compromises with the SPD.', explanation: 'A chancellor rarely admits internal divisions in public — it weakens his negotiating position.' },
    { question: 'What does "den Jahrestag" mean in this context?', answer: 'The anniversary — specifically, Merz’s first year as chancellor.', explanation: '"Tag" = day; "Jahr" = year; "Jahrestag" = the yearly day, i.e. anniversary.' },
    { question: 'In German, what is the difference between "der Bundestag" and "die Bundesländer"?', answer: '"Der Bundestag" is the federal parliament (a single national chamber). "Die Bundesländer" are Germany’s 16 federal states.', explanation: '"Bund" = federation. "Tag" here means "assembly, council". "Land" = country / state. Plural: "Länder".' },
    { question: 'What does it mean for two coalition partners to be "zerstritten"?', answer: 'It means they are in serious dispute, at loggerheads. The word describes a deep level of conflict, not a mere disagreement.', explanation: 'Base verb: "streiten" (to argue, to fight). The prefix "zer-" intensifies and suggests breakage. "Zerstritten" is stronger than "uneinig" (not in agreement).' },
  ],
  actionPlan: [
    'Practise the vocabulary keywords (Koalition, Bundeskanzler, Unmut, Kompromiss) by building two of your own sentences for each one this week.',
    'Watch the next Tagesschau edition (20:00, ARD) and spot at least three political vocabulary terms from this pack in real context.',
    'Note three uses of "zerstritten" or "zulegen" you find this week in German newspapers (FAZ, Süddeutsche Zeitung, Die Zeit).',
    'In German, summarise the political situation described in the video in five sentences. If you know a native speaker, ask them to review.',
    'Revisit the quiz in seven days — active recall with spaced repetition retains far better than cramming.',
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

/* ─── Creator mode — English translation ──────────────────────────────── */

const creatorEN: PackTranslation = {
  summary: {
    short: 'Three viral angles from Merz’s first anniversary: the internal fracture, the AfD’s rise in the East, and why German reforms keep stalling.',
    long: 'Chancellor Merz’s first anniversary offers rich material for social content. Three angles stand out: Merz’s own public admission of internal party unease (drives engagement through the "drama"), the AfD’s unstoppable advance in the East (controversy plus international relevance), and the classic pattern of German coalitions getting stuck on pensions-taxation-migration (educational plus transferable to other countries).',
  },
  chapters: [
    { startSec: 0, title: 'News opening', summary: 'Strong visual hook — the institutional anchor as a credibility anchor.' },
    { startSec: 23, title: 'The one-year balance', summary: 'Plenty of editorial material here — clipped phrases, expectation-vs-reality contrast.' },
    { startSec: 180, title: 'The internal fracture as a viral moment', summary: 'Merz admitting on camera that his party is divided — a 15-second clip for Reels and TikTok.' },
    { startSec: 360, title: 'Material for the East-vs-West angle', summary: 'Maps, graphs and figures — perfect for informational carousels on Instagram.' },
    { startSec: 540, title: 'The AfD as the elephant in the room', summary: 'A viral topic by definition — pair with historical context to avoid superficiality.' },
  ],
  keyIdeas: [
    {
      title: 'The chancellor admitting his party is divided',
      body: 'Merz acknowledging the internal unease is exceptional. For content: the angle isn’t the politics — it’s the human admission. It plays to any audience.',
    },
    {
      title: 'The German East as a recurring story',
      body: 'Every AfD surge is news. But the real story is structural: 35 years after reunification, voting patterns remain split. That’s a series, not a single post.',
    },
    {
      title: 'Pensions-taxation-migration: the eternal triangle',
      body: 'The same three topics get German coalitions stuck decade after decade. Excellent material for an educational explainer (TikTok, Reels): "Why German governments always break on the same three things".',
    },
  ],
  socialAngles: [
    { hook: 'A German chancellor just admitted on national TV that his own party is fed up with his compromises.', caption: 'Friedrich Merz hits his one-year mark and said what no chancellor says: there is "growing dissatisfaction" inside the Union with the SPD deals. In German politics, that is practically an announcement of a fracture.' },
    { hook: 'The AfD could clear 30 % in Saxony. When does it stop being an anomaly and start being the system?', caption: 'Three elections in we’ve been calling it a peak. The German East has voted differently for decades, and nobody in Berlin has found the answer. Thread below.' },
    { hook: 'Pensions. Taxation. Migration. Three words that break every German coalition since 1949.', caption: 'The chancellor changes, the party combination changes, the decade changes — the three topics stay the same. Understand this, and you understand German politics.' },
    { hook: 'In Germany, coalitions are named after flags. Merz’s one is called "black-red".', caption: 'Here’s the 60-second decode: schwarz-rot, Ampel, Jamaika, Kenia, Deutschland — every party combination has its name. Express-course political literacy.' },
    { hook: 'Susanne Daubner is the most recognisable face on German television. And tonight she led with this.', caption: 'The Tagesschau anchor has been an institutional reference in Germany for decades. Her tone calibrates the weight of every story. Tonight she led in earnest.' },
  ],
  keyQuotes: [
    { text: '"There is growing dissatisfaction in our own ranks with the compromises."', original: 'Es gebe in den eigenen Reihen einen größer werdenden Unmut über Kompromisse.', speaker: 'Friedrich Merz', timestampSec: 44 },
    { text: '"His reform projects are becoming difficult."', original: 'Reformprojekte gestalten sich schwierig.', speaker: 'Susanne Daubner', timestampSec: 34 },
    { text: '"Politically, Merz is under pressure one year after taking office."', original: 'Politisch steht Merz ein Jahr nach Amtsantritt unter Druck.', speaker: 'Susanne Daubner', timestampSec: 58 },
    { text: '"In eastern Germany the AfD continues to gain ground."', original: 'Im Osten Deutschlands legt die AfD weiter zu.', speaker: 'Susanne Daubner', timestampSec: 372 },
  ],
  actionPlan: [
    'Turn Merz’s admission into a 30-second Reel with on-screen text.',
    'A Twitter/X thread on the logic behind German coalition naming — high educational value.',
    'An Instagram carousel on the pensions-taxation-migration pattern: a 70-year story in five frames.',
  ],
  vocabulary: [],
  quiz: [],
};

/* ─── Pack assembly ───────────────────────────────────────────────────── */

export const samplePackBusiness: KnowledgePack = {
  ...COMMON,
  id: 'sample',
  mode: 'business',
  // Business sample ships in both Spanish and English so visitors can
  // see the language-switcher in action on /pack/sample without
  // having to generate anything themselves.
  outputLanguages: ['es', 'en'],
  translations: { es: businessES, en: businessEN },
};

export const samplePackLearn: KnowledgePack = {
  ...COMMON,
  id: 'sample-learn',
  mode: 'learn',
  outputLanguages: ['es', 'en'],
  translations: { es: learnES, en: learnEN },
};

export const samplePackCreator: KnowledgePack = {
  ...COMMON,
  id: 'sample-creator',
  mode: 'creator',
  outputLanguages: ['es', 'en'],
  translations: { es: creatorES, en: creatorEN },
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
