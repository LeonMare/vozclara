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

/* ─── Study mode — Veritasium "The Most Misunderstood Concept in Physics"
   ─────────────────────────────────────────────────────────────────────────
   Real 24-minute Veritasium video on entropy. Picked specifically as the
   `study` sample because it has everything a student needs: clear chapter
   structure, layered concept-build (intuition → math → philosophy), high-
   density vocabulary (entropy, microstates, statistical mechanics …), and
   genuine ambiguity worth quizzing on. Source-language is English; ships
   in ES + EN translations so visitors see both directions live.
─────────────────────────────────────────────────────────────────────────── */

const STUDY_COMMON = {
  brainId: 'sample',
  source: {
    type: 'youtube' as const,
    url: 'https://www.youtube.com/watch?v=DxL2HoqLbyA',
    videoId: 'DxL2HoqLbyA',
    durationSec: 1465,
    thumbnailUrl: 'https://i.ytimg.com/vi/DxL2HoqLbyA/hqdefault.jpg',
    channel: 'Veritasium',
  },
  title: 'The Most Misunderstood Concept in Physics',
  sourceLang: 'en' as const,
  outputLang: 'es' as const,
  outputLanguages: ['es' as const, 'en' as const],
  genre: 'education' as const,
  status: 'ready' as const,
  category: 'science',
  isPublic: true,
  createdAt: Date.parse('2026-04-12T10:00:00Z'),
  updatedAt: Date.parse('2026-04-12T10:00:00Z'),
  tags: ['física', 'entropía', 'termodinámica', 'tiempo'],
  difficulty: 'B2' as const,
};

const studyES: PackTranslation = {
  tldr: 'La entropía no es desorden — es el número de formas posibles en que un sistema puede existir, y eso explica por qué el tiempo solo fluye hacia adelante.',
  summary: {
    short: 'Veritasium desmonta la idea de que la entropía es "desorden" y la replantea como una medida estadística que explica la flecha del tiempo.',
    long: 'Veritasium dedica el vídeo a corregir uno de los conceptos peor entendidos de la física: la entropía. La intuición popular dice que es "desorden", pero la definición correcta —la de Boltzmann— es el logaritmo del número de microestados compatibles con un macroestado dado. Desde ahí el vídeo construye varias consecuencias profundas: por qué el calor fluye en una sola dirección, qué es realmente la segunda ley de la termodinámica, cómo el demonio de Maxwell parece violarla (y por qué no lo hace), la conexión con la teoría de la información de Shannon, y por último por qué la entropía explica la flecha del tiempo y el destino del universo. La pieza es un ejemplo magistral de cómo construir un concepto en capas: cada minuto añade una pieza nueva sin saltarse fundamentos.',
  },
  chapters: [
    { startSec: 0, title: 'Por qué nadie entiende la entropía', summary: 'El error común: "entropía = desorden". Veritasium plantea el problema antes de resolverlo.' },
    { startSec: 165, title: 'Boltzmann y los microestados', summary: 'La definición precisa: S = k log W. Cada macroestado puede realizarse de muchas formas microscópicas.' },
    { startSec: 420, title: 'La segunda ley reformulada', summary: 'La entropía aumenta porque los estados de alta multiplicidad son abrumadoramente más probables.' },
    { startSec: 660, title: 'El demonio de Maxwell', summary: 'El experimento mental que parecía romper la segunda ley — y por qué Landauer lo cerró un siglo después.' },
    { startSec: 925, title: 'Shannon y la información', summary: 'La entropía de información de Shannon es matemáticamente idéntica a la termodinámica. No es coincidencia.' },
    { startSec: 1165, title: 'La flecha del tiempo', summary: 'Por qué recordamos el pasado pero no el futuro: la asimetría temporal proviene del bajo estado inicial del universo.' },
    { startSec: 1340, title: 'Muerte térmica y final del universo', summary: 'Si la entropía solo crece, el universo se dirige a un equilibrio sin estructura. Una idea inquietante.' },
  ],
  keyIdeas: [
    {
      title: '"Desorden" es una mala metáfora',
      body: 'Decir que la entropía es desorden funciona para algunas intuiciones pero falla en otras. Un cristal organizado puede tener más entropía que un gas si su número de estados accesibles es mayor. La definición rigurosa es estadística, no estética.',
    },
    {
      title: 'S = k log W es la idea central',
      body: 'La fórmula de Boltzmann conecta dos escalas: el macroestado observable (presión, temperatura, volumen) y los microestados invisibles (las configuraciones de partículas que lo producen). W es el conteo de esos microestados; k es una constante de proporcionalidad; log convierte multiplicación en suma.',
    },
    {
      title: 'La segunda ley es estadística, no absoluta',
      body: 'No es imposible que un huevo se desfría — solo improbabilísimo. La segunda ley funciona porque los estados de baja entropía son numéricamente irrisorios comparados con los de alta entropía. No es una prohibición, es una abrumadora ventaja combinatoria.',
    },
    {
      title: 'El demonio de Maxwell se desmontó con Landauer',
      body: 'Durante 100 años el experimento mental parecía permitir disminuir entropía sin coste. Rolf Landauer demostró en 1961 que borrar información en la memoria del demonio cuesta energía. La segunda ley se mantiene, pero ahora unifica termodinámica con información.',
    },
    {
      title: 'La entropía termodinámica y la de Shannon son la misma',
      body: 'Shannon midió la incertidumbre de un mensaje con la misma fórmula matemática que Boltzmann usó para los gases. No es analogía: es identidad. La información y el calor son aspectos de lo mismo — un cambio profundo en cómo entendemos la física.',
    },
    {
      title: 'El tiempo fluye porque el universo empezó ordenado',
      body: 'Las leyes de la física son simétricas en el tiempo, pero nuestra experiencia no. La asimetría no proviene de las leyes sino de las condiciones iniciales: el Big Bang fue extraordinariamente improbable, de baja entropía. Todo lo que sigue es relajación hacia equilibrio.',
    },
    {
      title: 'La muerte térmica es la consecuencia más radical',
      body: 'Si nada detiene el aumento de entropía, el universo terminará en un estado uniforme y tibio donde nada interesante puede ocurrir. No es una predicción cómoda, pero se deriva directamente de la segunda ley aplicada al cosmos.',
    },
  ],
  vocabulary: [
    { word: 'entropy', translation: 'la entropía', context: 'Entropy is often described as disorder, but that is misleading.', partOfSpeech: 'sustantivo' },
    { word: 'microstate', translation: 'el microestado', context: 'Each microstate is a specific arrangement of particles.', partOfSpeech: 'sustantivo' },
    { word: 'macrostate', translation: 'el macroestado', context: 'Pressure and temperature define the macrostate.', partOfSpeech: 'sustantivo' },
    { word: 'thermodynamics', translation: 'la termodinámica', context: 'The second law of thermodynamics says entropy never decreases.', partOfSpeech: 'sustantivo' },
    { word: 'statistical mechanics', translation: 'la mecánica estadística', context: 'Boltzmann founded statistical mechanics.', partOfSpeech: 'sustantivo' },
    { word: 'irreversible', translation: 'irreversible', context: 'Most everyday processes are irreversible.', partOfSpeech: 'adjetivo' },
    { word: 'arrow of time', translation: 'la flecha del tiempo', context: 'Entropy gives us the arrow of time.', partOfSpeech: 'sustantivo' },
    { word: 'equilibrium', translation: 'el equilibrio', context: 'A closed system tends toward equilibrium.', partOfSpeech: 'sustantivo' },
    { word: 'heat death', translation: 'la muerte térmica', context: 'The heat death of the universe is the ultimate equilibrium.', partOfSpeech: 'sustantivo' },
    { word: 'information theory', translation: 'la teoría de la información', context: 'Shannon’s information theory uses the same math as thermodynamics.', partOfSpeech: 'sustantivo' },
    { word: 'Boltzmann constant', translation: 'la constante de Boltzmann', context: 'k is the Boltzmann constant, about 1.38 × 10⁻²³ J/K.', partOfSpeech: 'sustantivo' },
    { word: 'dispersal', translation: 'la dispersión', context: 'Entropy can be intuited as energy dispersal.', partOfSpeech: 'sustantivo' },
    { word: 'closed system', translation: 'el sistema cerrado', context: 'In a closed system, entropy can only increase.', partOfSpeech: 'sustantivo' },
    { word: 'demon', translation: 'el demonio', context: 'Maxwell’s demon was a thought experiment about violating the second law.', partOfSpeech: 'sustantivo' },
    { word: 'erase', translation: 'borrar', context: 'Erasing information costs energy — Landauer’s principle.', partOfSpeech: 'verbo' },
  ],
  quiz: [
    { question: '¿Por qué Veritasium dice que "entropía = desorden" es una mala definición?', answer: 'Porque el desorden es subjetivo y estético, mientras que la entropía se define matemáticamente como el logaritmo del número de microestados compatibles con un macroestado. Hay casos —como cristales con mayor multiplicidad que gases— donde la intuición de desorden falla.', explanation: 'La metáfora del desorden ayuda al principio pero rompe en los casos límite. La definición de Boltzmann es la única que funciona universalmente.' },
    { question: 'Escribe la fórmula de Boltzmann y explica cada término.', answer: 'S = k log W. S es la entropía, k es la constante de Boltzmann (≈ 1.38 × 10⁻²³ J/K), W es el número de microestados compatibles con el macroestado, y log convierte el conteo multiplicativo en una escala aditiva.', explanation: 'Esta fórmula está grabada en la tumba de Boltzmann en Viena. Es la traducción rigurosa de "entropía" en lenguaje estadístico.' },
    { question: '¿Por qué la segunda ley de la termodinámica no es una prohibición absoluta?', answer: 'Porque es estadística. Los estados de baja entropía no son imposibles, solo astronómicamente improbables. En sistemas con muchas partículas la diferencia de probabilidad es tan extrema que el comportamiento parece determinista.', explanation: 'Un huevo podría desfreirse — pero la probabilidad es del orden de 10⁻¹⁰²³. En la práctica, eso significa "nunca".' },
    { question: '¿Qué propuso Maxwell con su demonio y por qué fallaba?', answer: 'Maxwell imaginó una criatura microscópica que separaría moléculas rápidas y lentas, disminuyendo entropía sin trabajo. Falla porque Landauer demostró que borrar la información que el demonio acumula sobre las moléculas cuesta energía, y ese coste compensa exactamente la ganancia.', explanation: 'El demonio de Maxwell unió por primera vez termodinámica e información — un siglo antes de que existiera la teoría de Shannon.' },
    { question: '¿Cómo se conecta la entropía de Shannon con la termodinámica?', answer: 'Shannon definió la entropía de un mensaje con una fórmula matemáticamente idéntica a la de Boltzmann: la suma de probabilidades por sus logaritmos. La equivalencia no es analogía: la información y el calor son aspectos de lo mismo.', explanation: 'Hoy esta unificación es la base de campos como la teoría de la computación física y la termodinámica cuántica.' },
    { question: '¿Por qué la flecha del tiempo es una pregunta abierta en física?', answer: 'Porque las leyes fundamentales (Newton, Maxwell, Einstein, Schrödinger) son simétricas bajo inversión temporal. La asimetría que percibimos no proviene de las leyes, sino de las condiciones iniciales del universo: un Big Bang de muy baja entropía.', explanation: 'La pregunta "¿por qué el tiempo solo fluye hacia adelante?" se traduce en "¿por qué el universo empezó tan ordenado?" — una pregunta cosmológica, no termodinámica.' },
    { question: '¿Qué predice la segunda ley sobre el futuro del universo?', answer: 'Que el universo evolucionará hacia un estado de máxima entropía: equilibrio térmico uniforme sin estructura ni gradientes. Es la llamada "muerte térmica": no se podrá realizar ningún proceso interesante.', explanation: 'No es una predicción cómoda, pero es la consecuencia directa de aplicar la segunda ley al cosmos como sistema cerrado.' },
    { question: 'Da un ejemplo cotidiano de proceso irreversible y explica por qué lo es.', answer: 'Un cubo de hielo derritiéndose en un vaso de agua tibia. Es irreversible porque el estado "hielo + agua tibia" tiene mucha menor multiplicidad que "agua templada uniforme" — el sistema evoluciona hacia el estado más probable y no regresa espontáneamente.', explanation: 'Cualquier ejemplo donde el sistema avanza hacia equilibrio sirve: una taza de café que se enfría, perfume que se dispersa, una pila de cartas barajada.' },
  ],
  actionPlan: [
    'Resume en tres frases —en tus propias palabras— la diferencia entre microestado y macroestado.',
    'Busca en YouTube el episodio de PBS Space Time sobre el demonio de Maxwell y compara las dos explicaciones.',
    'Calcula a mano: si tienes 4 monedas, ¿cuántos microestados son compatibles con el macroestado "2 caras"? ¿Y con "todas caras"? Comprueba que el más probable tiene mayor entropía.',
    'Lee la entrada de Wikipedia sobre el principio de Landauer y escribe en cinco frases por qué cierra el demonio de Maxwell.',
    'Repasa el cuestionario en 24 horas y luego en 7 días — la repetición espaciada consolida conceptos abstractos como pocos otros métodos.',
  ],
  keyQuotes: [
    { text: 'La entropía no es desorden. Es el número de formas en que las partes pueden ordenarse para producir el mismo todo.', original: 'Entropy is not disorder. It is the number of ways the parts can be arranged to produce the same whole.', speaker: 'Derek Muller', timestampSec: 178 },
    { text: 'La segunda ley no dice que la entropía no pueda disminuir — dice que casi nunca lo hará.', original: 'The second law does not say entropy cannot decrease — it says it almost never will.', speaker: 'Derek Muller', timestampSec: 510 },
    { text: 'Borrar un bit de información cuesta energía. Punto final.', original: 'Erasing a bit of information costs energy. Full stop.', speaker: 'Derek Muller', timestampSec: 820 },
    { text: 'Las leyes de la física son simétricas en el tiempo. Nuestra experiencia no lo es. Esa contradicción es la flecha del tiempo.', original: 'The laws of physics are time-symmetric. Our experience is not. That contradiction is the arrow of time.', speaker: 'Derek Muller', timestampSec: 1205 },
    { text: 'El universo no empezó frío y oscuro. Empezó increíblemente ordenado — y todo lo demás se sigue de ahí.', original: 'The universe didn’t start cold and dark. It started incredibly ordered — and everything else follows from that.', speaker: 'Derek Muller', timestampSec: 1290 },
  ],
  socialAngles: [],
};

const studyEN: PackTranslation = {
  tldr: 'Entropy is not disorder — it is the count of possible arrangements of a system, and that is why time only flows forward.',
  summary: {
    short: 'Veritasium dismantles the "entropy equals disorder" intuition and reframes it as a statistical measure that explains the arrow of time.',
    long: 'Veritasium spends the video correcting one of the most poorly understood concepts in physics: entropy. Popular intuition says it is "disorder", but the precise definition — Boltzmann’s — is the logarithm of the number of microstates compatible with a given macrostate. From there the video builds several profound consequences: why heat flows one way, what the second law of thermodynamics really says, how Maxwell’s demon seems to violate it (and why it does not), the connection to Shannon’s information theory, and finally why entropy explains the arrow of time and the fate of the universe. It is a masterclass in building a concept in layers — every minute adds a new piece without skipping foundations.',
  },
  chapters: [
    { startSec: 0, title: 'Why nobody understands entropy', summary: 'The common error: "entropy = disorder". Veritasium frames the problem before solving it.' },
    { startSec: 165, title: 'Boltzmann and microstates', summary: 'The precise definition: S = k log W. Every macrostate can be realised in many microscopic ways.' },
    { startSec: 420, title: 'The second law reframed', summary: 'Entropy increases because high-multiplicity states are overwhelmingly more probable.' },
    { startSec: 660, title: 'Maxwell’s demon', summary: 'The thought experiment that seemed to break the second law — and how Landauer closed it a century later.' },
    { startSec: 925, title: 'Shannon and information', summary: 'Shannon’s information entropy is mathematically identical to thermodynamic entropy. Not coincidence.' },
    { startSec: 1165, title: 'The arrow of time', summary: 'Why we remember the past but not the future: temporal asymmetry comes from the universe’s low-entropy initial state.' },
    { startSec: 1340, title: 'Heat death and the end of the universe', summary: 'If entropy only grows, the universe heads toward structureless equilibrium. A disquieting idea.' },
  ],
  keyIdeas: [
    {
      title: '"Disorder" is a bad metaphor',
      body: 'Saying entropy is disorder works for some intuitions but fails for others. An organised crystal can have higher entropy than a gas if its number of accessible states is larger. The rigorous definition is statistical, not aesthetic.',
    },
    {
      title: 'S = k log W is the central idea',
      body: 'Boltzmann’s formula connects two scales: the observable macrostate (pressure, temperature, volume) and the invisible microstates (the configurations of particles that produce it). W counts those microstates; k is a proportionality constant; the logarithm converts multiplication into addition.',
    },
    {
      title: 'The second law is statistical, not absolute',
      body: 'It is not impossible for an egg to un-fry itself — only ludicrously improbable. The second law works because low-entropy states are numerically negligible compared to high-entropy ones. It is not a prohibition, it is an overwhelming combinatorial advantage.',
    },
    {
      title: 'Maxwell’s demon was closed by Landauer',
      body: 'For 100 years the thought experiment seemed to allow lowering entropy at no cost. Rolf Landauer showed in 1961 that erasing information in the demon’s memory costs energy. The second law holds — and now unifies thermodynamics with information.',
    },
    {
      title: 'Thermodynamic and Shannon entropy are the same',
      body: 'Shannon measured the uncertainty of a message with the same formula Boltzmann used for gases. Not analogy: identity. Information and heat are aspects of the same thing — a deep shift in how we understand physics.',
    },
    {
      title: 'Time flows because the universe started ordered',
      body: 'The laws of physics are symmetric in time, but our experience is not. The asymmetry does not come from the laws but from the initial conditions: the Big Bang was extraordinarily improbable, of low entropy. Everything since is relaxation toward equilibrium.',
    },
    {
      title: 'Heat death is the most radical consequence',
      body: 'If nothing stops the entropy increase, the universe will end in a uniform lukewarm state where nothing interesting can happen. Not a comfortable prediction, but it follows directly from applying the second law to the cosmos.',
    },
  ],
  vocabulary: [
    { word: 'entropy', translation: 'entropy (a measure of disorder, more precisely: the count of microstates)', context: 'Entropy is often described as disorder, but that is misleading.', partOfSpeech: 'noun' },
    { word: 'microstate', translation: 'microstate', context: 'Each microstate is a specific arrangement of particles.', partOfSpeech: 'noun' },
    { word: 'macrostate', translation: 'macrostate', context: 'Pressure and temperature define the macrostate.', partOfSpeech: 'noun' },
    { word: 'thermodynamics', translation: 'thermodynamics', context: 'The second law of thermodynamics says entropy never decreases.', partOfSpeech: 'noun' },
    { word: 'statistical mechanics', translation: 'statistical mechanics', context: 'Boltzmann founded statistical mechanics.', partOfSpeech: 'noun' },
    { word: 'irreversible', translation: 'irreversible (cannot be undone spontaneously)', context: 'Most everyday processes are irreversible.', partOfSpeech: 'adjective' },
    { word: 'arrow of time', translation: 'arrow of time', context: 'Entropy gives us the arrow of time.', partOfSpeech: 'noun' },
    { word: 'equilibrium', translation: 'equilibrium', context: 'A closed system tends toward equilibrium.', partOfSpeech: 'noun' },
    { word: 'heat death', translation: 'heat death', context: 'The heat death of the universe is the ultimate equilibrium.', partOfSpeech: 'noun' },
    { word: 'information theory', translation: 'information theory', context: 'Shannon’s information theory uses the same math as thermodynamics.', partOfSpeech: 'noun' },
    { word: 'Boltzmann constant', translation: 'Boltzmann constant', context: 'k is the Boltzmann constant, about 1.38 × 10⁻²³ J/K.', partOfSpeech: 'noun' },
    { word: 'dispersal', translation: 'dispersal (spreading-out of energy)', context: 'Entropy can be intuited as energy dispersal.', partOfSpeech: 'noun' },
    { word: 'closed system', translation: 'closed system', context: 'In a closed system, entropy can only increase.', partOfSpeech: 'noun' },
    { word: 'demon', translation: 'demon (here: a thought-experiment agent)', context: 'Maxwell’s demon was a thought experiment about violating the second law.', partOfSpeech: 'noun' },
    { word: 'erase', translation: 'to erase (delete information)', context: 'Erasing information costs energy — Landauer’s principle.', partOfSpeech: 'verb' },
  ],
  quiz: [
    { question: 'Why does Veritasium say that "entropy = disorder" is a bad definition?', answer: 'Because disorder is subjective and aesthetic, while entropy is mathematically defined as the logarithm of the number of microstates compatible with a macrostate. There are cases — such as crystals with higher multiplicity than gases — where the disorder intuition breaks.', explanation: 'The disorder metaphor helps initially but fails at the edge cases. Boltzmann’s definition is the only one that works universally.' },
    { question: 'Write Boltzmann’s formula and explain each term.', answer: 'S = k log W. S is the entropy, k is the Boltzmann constant (≈ 1.38 × 10⁻²³ J/K), W is the number of microstates compatible with the macrostate, and the logarithm converts the multiplicative count into an additive scale.', explanation: 'This formula is engraved on Boltzmann’s tomb in Vienna. It is the rigorous translation of "entropy" into statistical language.' },
    { question: 'Why is the second law of thermodynamics not an absolute prohibition?', answer: 'Because it is statistical. Low-entropy states are not impossible, only astronomically improbable. In systems with many particles the probability gap is so extreme that the behaviour looks deterministic.', explanation: 'An egg could un-fry itself — but with probability around 10⁻¹⁰²³. In practice that means "never".' },
    { question: 'What did Maxwell propose with his demon and why did it fail?', answer: 'Maxwell imagined a microscopic creature that would sort fast and slow molecules, lowering entropy without work. It fails because Landauer showed that erasing the information the demon accumulates about the molecules costs energy, and that cost exactly cancels the gain.', explanation: 'Maxwell’s demon first connected thermodynamics with information — a century before Shannon’s theory existed.' },
    { question: 'How does Shannon entropy connect to thermodynamics?', answer: 'Shannon defined the entropy of a message with a formula mathematically identical to Boltzmann’s: the sum of probabilities times their logarithms. The equivalence is not analogy: information and heat are aspects of the same thing.', explanation: 'This unification today underpins fields like the theory of physical computation and quantum thermodynamics.' },
    { question: 'Why is the arrow of time an open question in physics?', answer: 'Because the fundamental laws (Newton, Maxwell, Einstein, Schrödinger) are symmetric under time reversal. The asymmetry we perceive does not come from the laws but from the universe’s initial conditions: a very low-entropy Big Bang.', explanation: 'The question "why does time only flow forward?" translates into "why did the universe start so ordered?" — a cosmological question, not a thermodynamic one.' },
    { question: 'What does the second law predict about the future of the universe?', answer: 'That the universe will evolve toward a state of maximum entropy: uniform thermal equilibrium with no structure or gradients. This is called the "heat death": no interesting process will be possible.', explanation: 'Not a comfortable prediction, but it is the direct consequence of applying the second law to the cosmos as a closed system.' },
    { question: 'Give an everyday example of an irreversible process and explain why it is one.', answer: 'An ice cube melting in a glass of warm water. It is irreversible because the state "ice + warm water" has much lower multiplicity than "tepid uniform water" — the system evolves toward the most probable state and does not spontaneously return.', explanation: 'Any example where a system advances toward equilibrium works: a cooling coffee, perfume dispersing, a shuffled deck of cards.' },
  ],
  actionPlan: [
    'Summarise in three sentences — in your own words — the difference between microstate and macrostate.',
    'Search YouTube for the PBS Space Time episode on Maxwell’s demon and compare the two explanations.',
    'Calculate by hand: with 4 coins, how many microstates are compatible with the macrostate "2 heads"? With "all heads"? Verify that the most probable one has higher entropy.',
    'Read the Wikipedia entry on Landauer’s principle and write five sentences explaining why it closes Maxwell’s demon.',
    'Revisit the quiz in 24 hours and again in 7 days — spaced repetition consolidates abstract concepts like few other methods.',
  ],
  keyQuotes: [
    { text: 'Entropy is not disorder. It is the number of ways the parts can be arranged to produce the same whole.', speaker: 'Derek Muller', timestampSec: 178 },
    { text: 'The second law does not say entropy cannot decrease — it says it almost never will.', speaker: 'Derek Muller', timestampSec: 510 },
    { text: 'Erasing a bit of information costs energy. Full stop.', speaker: 'Derek Muller', timestampSec: 820 },
    { text: 'The laws of physics are time-symmetric. Our experience is not. That contradiction is the arrow of time.', speaker: 'Derek Muller', timestampSec: 1205 },
    { text: 'The universe didn’t start cold and dark. It started incredibly ordered — and everything else follows from that.', speaker: 'Derek Muller', timestampSec: 1290 },
  ],
  socialAngles: [],
};

/* ─── Brief mode — Lex Fridman × Yann LeCun ────────────────────────────
   The second new sample. Picked specifically as the `brief`/news sample
   because it represents what knowledge-workers actually want VozClara
   for: condense a 3-hour podcast they’d never finish into the few real
   insights and quotable lines. Yann LeCun’s episode is high-quotability
   territory ("LLMs are an off-ramp") and lands on AI/Reddit literacy.
─────────────────────────────────────────────────────────────────────── */

const NEWS_COMMON = {
  brainId: 'sample',
  source: {
    type: 'youtube' as const,
    url: 'https://www.youtube.com/watch?v=5t1vTLU7s40',
    videoId: '5t1vTLU7s40',
    durationSec: 10800,
    thumbnailUrl: 'https://i.ytimg.com/vi/5t1vTLU7s40/hqdefault.jpg',
    channel: 'Lex Fridman',
  },
  title: 'Yann LeCun: Meta AI, Open Source, Limits of LLMs, AGI & the Future of AI',
  sourceLang: 'en' as const,
  outputLang: 'es' as const,
  outputLanguages: ['es' as const, 'en' as const],
  genre: 'interview' as const,
  status: 'ready' as const,
  category: 'ai',
  isPublic: true,
  createdAt: Date.parse('2026-03-07T15:00:00Z'),
  updatedAt: Date.parse('2026-03-07T15:00:00Z'),
  tags: ['ia', 'llm', 'agi', 'open source', 'meta'],
  difficulty: 'C1' as const,
};

const newsES: PackTranslation = {
  tldr: 'LeCun sostiene que los LLM son una rampa de salida hacia la AGI, no el camino — y que solo los modelos abiertos garantizan que el futuro de la IA no quede en pocas manos.',
  summary: {
    short: 'En tres horas con Lex Fridman, Yann LeCun defiende tres tesis: los LLM no llevan a AGI, los modelos abiertos son la única vía sana, y el catastrofismo actual es exagerado.',
    long: 'Lex Fridman entrevista durante tres horas al jefe de IA de Meta y Premio Turing. LeCun condensa una posición que llevará a la próxima década de debate: los grandes modelos de lenguaje son útiles pero insuficientes para alcanzar inteligencia general — les falta planificación, modelo del mundo y memoria persistente. Defiende además los modelos abiertos (Llama, Mistral) como la única forma de evitar la concentración de poder en pocas empresas. Y rechaza el "doomerism" reciente: la IA no es una amenaza existencial, sino una infraestructura que requiere regulación pragmática, no pánico. La conversación cubre también JEPA (su propuesta arquitectónica alternativa a los Transformers), la rivalidad Meta–OpenAI, y por qué LeCun cree que la AGI llegará "en una década o dos" pero no por la ruta actual.',
  },
  chapters: [
    { startSec: 0, title: 'Introducción y contexto', summary: 'Lex sitúa la entrevista: LeCun como Premio Turing, jefe de IA de Meta, voz disidente del consenso LLM.' },
    { startSec: 420, title: '¿Por qué los LLM no llegarán a AGI?', summary: 'LeCun explica las cuatro carencias estructurales: razonamiento, planificación, memoria, modelo del mundo.' },
    { startSec: 2340, title: 'JEPA y arquitecturas alternativas', summary: 'La propuesta de LeCun: Joint Embedding Predictive Architecture. Aprender el mundo, no predecir tokens.' },
    { startSec: 4080, title: 'Open source vs cerrado', summary: 'Por qué Meta libera Llama. El caso a favor de modelos abiertos como base de la economía digital.' },
    { startSec: 5640, title: 'Riesgos y doomerism', summary: 'LeCun rechaza la narrativa apocalíptica. Compara la regulación necesaria con la del software, no con armas nucleares.' },
    { startSec: 7200, title: 'AGI en una década o dos', summary: 'Su predicción temporal. Por qué no es ni inminente ni imposible.' },
    { startSec: 8760, title: 'Educación, ciencia y el futuro', summary: 'Cómo la IA cambiará la investigación científica. Por qué los nuevos doctorados deberían apuntar a otros caminos que los LLM.' },
    { startSec: 10080, title: 'Cierre', summary: 'Reflexión final sobre por qué la diversidad de aproximaciones —no la convergencia— es la clave del próximo salto.' },
  ],
  keyIdeas: [
    {
      title: 'Los LLM son un off-ramp, no el camino',
      body: 'LeCun usa la metáfora literal: los modelos autorregresivos son una rampa de salida útil pero terminan en un callejón. Predicen el siguiente token, no construyen un modelo del mundo. Sin un modelo del mundo no hay planificación verdadera, y sin planificación no hay inteligencia general.',
    },
    {
      title: 'Las cuatro carencias estructurales',
      body: 'Razonamiento (los LLM aproximan, no deducen), planificación (no simulan futuros alternativos antes de actuar), memoria persistente (cada conversación empieza de cero), y comprensión física (no entienden que el agua moja). Todas son limitaciones de arquitectura, no de escala — y por eso "más parámetros" no las resolverá.',
    },
    {
      title: 'JEPA: aprender el mundo, no los tokens',
      body: 'Joint Embedding Predictive Architecture es la apuesta de LeCun: en lugar de predecir el siguiente token de texto, predecir la siguiente representación abstracta del mundo. Suena técnico pero el cambio conceptual es enorme: del lenguaje al modelo causal.',
    },
    {
      title: 'Open source no es una opción ideológica, es infraestructura',
      body: 'LeCun argumenta que la IA será la infraestructura del próximo siglo —como Linux, como TCP/IP— y que dejarla en manos de tres empresas privadas estadounidenses sería un error histórico. Llama no es marketing de Meta: es una apuesta de plataforma.',
    },
    {
      title: 'El doomerism es un error de categoría',
      body: 'LeCun separa preocupaciones legítimas (sesgo, desinformación, concentración económica) de la narrativa de "IA como riesgo existencial". La segunda, dice, mezcla ciencia ficción con activismo y nubla la regulación que sí hace falta. Su comparación: la IA está más cerca de la imprenta que de la bomba atómica.',
    },
    {
      title: 'AGI en 10–20 años, pero no por aquí',
      body: 'LeCun no es escéptico del futuro: cree firmemente en AGI dentro de su vida. Lo que rechaza es la ruta: convencido de que las arquitecturas actuales se estancarán antes de llegar. El próximo gran salto vendrá de un cambio cualitativo, no cuantitativo.',
    },
    {
      title: 'Recomendación para investigadores jóvenes',
      body: 'En un momento del podcast Lex le pregunta qué debería estudiar hoy un doctorando. LeCun responde sin dudar: "Lo que no estamos haciendo ahora mismo". Critica la convergencia de toda la comunidad ML hacia los Transformers; el próximo Karpathy vendrá de otro paradigma.',
    },
  ],
  actionPlan: [
    'Lee el paper de JEPA de LeCun (2022, "A Path Towards Autonomous Machine Intelligence") y resume en una página por qué su autor lo considera la siguiente arquitectura.',
    'Compara la posición de LeCun con la de Geoffrey Hinton (escéptico ahora) y la de Ilya Sutskever (más optimista con LLMs): un mapa del debate AGI de 2024-2026.',
    'Monitoriza durante un mes las publicaciones de Meta AI Research vs OpenAI: ¿se ven las tesis de LeCun reflejadas en las direcciones de investigación?',
    'Si trabajas en un equipo técnico, plantea un análisis interno sobre "¿estamos demasiado dependientes de un solo proveedor de modelos?" — la respuesta de LeCun sobre infraestructura abierta tiene implicaciones prácticas.',
    'Apunta tres ejemplos concretos en tu sector donde la limitación de "no hay modelo del mundo" se manifieste — ayudan a calibrar las expectativas reales de los productos basados en LLM.',
    'Sigue a yann_lecun en X y los podcasts de Lex Fridman como par: el siguiente debate (con Ilya, con Demis Hassabis) probablemente refinará estas posiciones.',
  ],
  keyQuotes: [
    { text: 'Los grandes modelos de lenguaje son una rampa de salida en el camino hacia la inteligencia humana — no el camino.', original: 'Large language models are an off-ramp on the road to human-level intelligence — not the path.', speaker: 'Yann LeCun', timestampSec: 1820 },
    { text: 'Si quieres que tu sistema razone, no puedes simplemente entrenarlo para predecir el siguiente token.', original: 'If you want your system to reason, you cannot just train it to predict the next token.', speaker: 'Yann LeCun', timestampSec: 2240 },
    { text: 'Open source no es una opinión política. Es la única forma de tener una IA en la que el mundo pueda confiar.', original: 'Open source is not a political opinion. It is the only way to have AI the world can trust.', speaker: 'Yann LeCun', timestampSec: 4380 },
    { text: 'El miedo a la IA está más cerca del Frankenstein de Mary Shelley que de cualquier documento técnico.', original: 'The fear of AI is closer to Mary Shelley’s Frankenstein than to any technical document.', speaker: 'Yann LeCun', timestampSec: 6320 },
    { text: 'Llegará una IA al nivel humano. Pero no se parecerá a un LLM más grande.', original: 'Human-level AI will come. But it will not look like a bigger LLM.', speaker: 'Yann LeCun', timestampSec: 7480 },
    { text: 'Si eres doctorando hoy, lo peor que puedes hacer es trabajar en lo que ya está funcionando.', original: 'If you are a PhD student today, the worst thing you can do is work on what is already working.', speaker: 'Yann LeCun', timestampSec: 9120 },
  ],
  vocabulary: [
    { word: 'autoregressive', translation: 'autorregresivo (que predice el siguiente elemento dado el anterior)', context: 'LLMs are autoregressive models — they predict the next token.', partOfSpeech: 'adjetivo' },
    { word: 'world model', translation: 'modelo del mundo (representación interna del entorno)', context: 'A system without a world model cannot truly plan.', partOfSpeech: 'sustantivo' },
    { word: 'doomerism', translation: 'doomerism / catastrofismo (visión pesimista sobre el futuro tecnológico)', context: 'I think the AI doomerism narrative is overblown.', partOfSpeech: 'sustantivo' },
    { word: 'inference', translation: 'inferencia (deducir conclusiones a partir de premisas)', context: 'LLMs approximate inference but don’t actually reason.', partOfSpeech: 'sustantivo' },
    { word: 'embedding', translation: 'embedding (representación vectorial de un concepto)', context: 'JEPA predicts in embedding space, not token space.', partOfSpeech: 'sustantivo' },
  ],
  quiz: [],
  socialAngles: [],
};

const newsEN: PackTranslation = {
  tldr: 'LeCun argues LLMs are an off-ramp toward AGI, not the road — and that only open models keep the future of AI out of a few hands.',
  summary: {
    short: 'In three hours with Lex Fridman, Yann LeCun defends three theses: LLMs do not lead to AGI, open models are the only sane path, and the current doomerism is overblown.',
    long: 'Lex Fridman interviews Meta’s head of AI and Turing-laureate Yann LeCun for three hours. LeCun lays out a position that will define the next decade of debate: large language models are useful but insufficient for general intelligence — they lack planning, world modelling and persistent memory. He also defends open models (Llama, Mistral) as the only way to avoid power concentration in a handful of companies. And he rejects the recent doomerism: AI is not an existential threat, but an infrastructure that requires pragmatic regulation, not panic. The conversation also covers JEPA (his architectural alternative to Transformers), the Meta–OpenAI rivalry, and why LeCun believes AGI will arrive "in a decade or two" — but not by the current route.',
  },
  chapters: [
    { startSec: 0, title: 'Introduction and context', summary: 'Lex sets the stage: LeCun as Turing-laureate, head of Meta AI, dissenting voice in the LLM consensus.' },
    { startSec: 420, title: 'Why LLMs won’t reach AGI', summary: 'LeCun explains the four structural shortcomings: reasoning, planning, memory, world modelling.' },
    { startSec: 2340, title: 'JEPA and alternative architectures', summary: 'LeCun’s proposal: Joint Embedding Predictive Architecture. Learn the world, don’t predict tokens.' },
    { startSec: 4080, title: 'Open source vs closed', summary: 'Why Meta releases Llama. The case for open models as the base of the digital economy.' },
    { startSec: 5640, title: 'Risks and doomerism', summary: 'LeCun rejects the apocalyptic narrative. Compares the required regulation to software, not nuclear weapons.' },
    { startSec: 7200, title: 'AGI in a decade or two', summary: 'His timeline prediction. Why it is neither imminent nor impossible.' },
    { startSec: 8760, title: 'Education, science and the future', summary: 'How AI will change scientific research. Why new PhDs should aim away from LLMs.' },
    { startSec: 10080, title: 'Closing', summary: 'Final reflection on why diversity of approaches — not convergence — is the key to the next leap.' },
  ],
  keyIdeas: [
    {
      title: 'LLMs are an off-ramp, not the road',
      body: 'LeCun uses the literal metaphor: autoregressive models are a useful off-ramp that ends in a cul-de-sac. They predict the next token, they do not build a model of the world. Without a world model there is no real planning, and without planning there is no general intelligence.',
    },
    {
      title: 'The four structural shortcomings',
      body: 'Reasoning (LLMs approximate, they do not deduce), planning (they do not simulate alternative futures before acting), persistent memory (every conversation starts from zero), and physical understanding (they do not understand that water is wet). All are architectural limits, not scale ones — so "more parameters" will not solve them.',
    },
    {
      title: 'JEPA: learn the world, not the tokens',
      body: 'Joint Embedding Predictive Architecture is LeCun’s bet: instead of predicting the next text token, predict the next abstract representation of the world. It sounds technical, but the conceptual shift is enormous — from language to causal model.',
    },
    {
      title: 'Open source is not an ideological option — it is infrastructure',
      body: 'LeCun argues AI will be the next century’s infrastructure — like Linux, like TCP/IP — and leaving it in the hands of three private American companies would be a historic mistake. Llama is not Meta marketing: it is a platform bet.',
    },
    {
      title: 'Doomerism is a category error',
      body: 'LeCun separates legitimate concerns (bias, misinformation, economic concentration) from the "AI as existential risk" narrative. The latter, he says, mixes science fiction with activism and clouds the regulation that is actually needed. His comparison: AI is closer to the printing press than to the atomic bomb.',
    },
    {
      title: 'AGI in 10–20 years — but not via this route',
      body: 'LeCun is not future-sceptical: he firmly believes in AGI within his lifetime. What he rejects is the route — convinced current architectures will plateau before getting there. The next great leap will come from a qualitative change, not a quantitative one.',
    },
    {
      title: 'Advice for young researchers',
      body: 'At one point Lex asks what a PhD student should study today. LeCun answers without hesitation: "What we are not doing right now." He criticises the ML community’s convergence onto Transformers; the next Karpathy will come from another paradigm.',
    },
  ],
  actionPlan: [
    'Read LeCun’s JEPA paper (2022, "A Path Towards Autonomous Machine Intelligence") and summarise in one page why its author considers it the next architecture.',
    'Compare LeCun’s position with Geoffrey Hinton’s (currently sceptical) and Ilya Sutskever’s (more LLM-optimistic): a map of the 2024–2026 AGI debate.',
    'Monitor Meta AI Research vs OpenAI publications for a month: are LeCun’s theses reflected in the research directions?',
    'If you work on a technical team, raise an internal analysis about "are we over-dependent on a single model provider?" — LeCun’s position on open infrastructure has practical implications.',
    'Note three concrete examples in your sector where the "no world model" limit manifests itself — they help calibrate real expectations for LLM-based products.',
    'Follow @ylecun on X and the Lex Fridman podcasts as a pair: the next debate (with Ilya, with Demis Hassabis) will likely refine these positions.',
  ],
  keyQuotes: [
    { text: 'Large language models are an off-ramp on the road to human-level intelligence — not the path.', speaker: 'Yann LeCun', timestampSec: 1820 },
    { text: 'If you want your system to reason, you cannot just train it to predict the next token.', speaker: 'Yann LeCun', timestampSec: 2240 },
    { text: 'Open source is not a political opinion. It is the only way to have AI the world can trust.', speaker: 'Yann LeCun', timestampSec: 4380 },
    { text: 'The fear of AI is closer to Mary Shelley’s Frankenstein than to any technical document.', speaker: 'Yann LeCun', timestampSec: 6320 },
    { text: 'Human-level AI will come. But it will not look like a bigger LLM.', speaker: 'Yann LeCun', timestampSec: 7480 },
    { text: 'If you are a PhD student today, the worst thing you can do is work on what is already working.', speaker: 'Yann LeCun', timestampSec: 9120 },
  ],
  vocabulary: [
    { word: 'autoregressive', translation: 'autoregressive (predicts the next item given the previous)', context: 'LLMs are autoregressive models — they predict the next token.', partOfSpeech: 'adjective' },
    { word: 'world model', translation: 'world model (internal representation of the environment)', context: 'A system without a world model cannot truly plan.', partOfSpeech: 'noun' },
    { word: 'doomerism', translation: 'doomerism (pessimistic view of technological future)', context: 'I think the AI doomerism narrative is overblown.', partOfSpeech: 'noun' },
    { word: 'inference', translation: 'inference (deducing conclusions from premises)', context: 'LLMs approximate inference but don’t actually reason.', partOfSpeech: 'noun' },
    { word: 'embedding', translation: 'embedding (vector representation of a concept)', context: 'JEPA predicts in embedding space, not token space.', partOfSpeech: 'noun' },
  ],
  quiz: [],
  socialAngles: [],
};

/* ─── Pack assembly ───────────────────────────────────────────────────── */

export const samplePackBusiness: KnowledgePack = {
  ...COMMON,
  id: 'sample',
  mode: 'brief',
  // Brief sample ships in both Spanish and English so visitors can
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

/** Study mode sample — Veritasium "The Most Misunderstood Concept in Physics".
 *  Different source video from the brief/learn/creator triad on purpose:
 *  the value of `study` mode shows best on a real concept-deep lecture. */
export const samplePackStudy: KnowledgePack = {
  ...STUDY_COMMON,
  id: 'sample-study',
  mode: 'study',
  translations: { es: studyES, en: studyEN },
};

/** News/Brief mode sample — Lex Fridman × Yann LeCun on AI.
 *  Distinct from the Tagesschau brief sample so visitors who click it
 *  see how the same `brief` mode handles a long-form interview rather
 *  than a tight news bulletin. */
export const samplePackNews: KnowledgePack = {
  ...NEWS_COMMON,
  id: 'sample-news',
  mode: 'brief',
  translations: { es: newsES, en: newsEN },
};

/** Lookup by id — used by PackPage when ?id is sample / sample-learn / sample-creator / sample-study / sample-news. */
export function getSamplePack(id: string): KnowledgePack | null {
  if (id === 'sample' || id === 'sample-business') return samplePackBusiness;
  if (id === 'sample-learn') return samplePackLearn;
  if (id === 'sample-creator') return samplePackCreator;
  if (id === 'sample-study') return samplePackStudy;
  if (id === 'sample-news') return samplePackNews;
  return null;
}

/** Default alias for backwards compat with /pack/sample link. */
export const samplePack = samplePackBusiness;
