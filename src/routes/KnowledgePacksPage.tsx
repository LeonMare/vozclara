import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractVideoId } from '../lib/youtube';
import { useLocale } from '../lib/i18n';
import { useMagneticHover } from '../hooks/useMagneticHover';
import { track, Events } from '../lib/analytics';

/**
 * /knowledge-packs — foundational concept page.
 *
 * What is a Knowledge Pack? The other SEO landings reference the term
 * heavily, the homepage AudienceTiles use it, the MCP tool name is
 * literally vozclara_generate_pack — but no page actually defines
 * the term. This is the canonical reference.
 *
 * Intent cluster:
 *   "what is a knowledge pack"
 *   "youtube knowledge pack"
 *   "ai knowledge pack"
 *   "vozclara knowledge pack"
 *   "wissens-pack"
 *
 * Conversion funnel: paste-URL → /new. Plausible source:
 * 'knowledge-packs'.
 */
export function KnowledgePacksPage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);
  const labels = knowledgePacksLabels(locale);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = extractVideoId(value);
    if (!id) {
      if (!value.trim()) {
        navigate('/new');
        return;
      }
      setError(t.invalidUrl);
      return;
    }
    track(Events.PASTE_URL, { locale, source: 'knowledge-packs' });
    navigate(`/new?v=${id}`);
  }

  return (
    <main id="main" className="relative overflow-hidden bg-creme paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(201,162,75,0.16), transparent 55%), radial-gradient(ellipse at bottom left, rgba(10,26,58,0.06), transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
        <header>
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.eyebrow}
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
            {labels.h1}
          </h1>
          <div className="mt-5 h-px w-16 bg-gold draw-rule" aria-hidden />
          <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-graphit/80 sm:text-lg">
            {labels.sub}
          </p>

          <form onSubmit={handleSubmit} className="mt-7">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                aria-label={t.heroUrlInputLabel}
                placeholder={t.heroPlaceholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 rounded-card border border-navy/15 bg-white px-4 py-3.5 font-sans text-base text-graphit placeholder-graphit/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
              <button
                ref={ctaRef}
                type="submit"
                className="group relative rounded-card bg-navy px-6 py-3.5 font-sans text-base font-medium text-creme will-change-transform hover:bg-navy/90"
                style={{ transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease' }}
              >
                <span className="relative z-10">{labels.cta}</span>
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 font-sans text-sm text-red-700">{error}</p>
            )}
            <p className="mt-2.5 font-sans text-[12px] text-graphit/65">
              {labels.trustNote}
            </p>
          </form>
        </header>

        {/* Visual proof */}
        <figure className="mt-12 overflow-hidden rounded-card border border-navy/10 shadow-card sm:mt-16">
          <img
            src="/anki-moment.png"
            alt={labels.imageAlt}
            loading="lazy"
            className="block h-auto w-full"
          />
        </figure>

        {/* The eight components */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.componentsEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.componentsTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-3 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
            {labels.componentsSub}
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2">
            {labels.components.map((c, i) => (
              <li
                key={i}
                className="rounded-card border border-navy/10 bg-white p-5 sm:p-6"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl leading-none text-gold/40 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-lg text-navy">{c.name}</h3>
                </div>
                <p className="mt-2 font-sans text-sm leading-relaxed text-graphit/75">
                  {c.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Vs a transcript / vs a summary */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.differenceEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.differenceTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <div className="mt-6 overflow-hidden rounded-card border border-navy/15">
            <div className="grid grid-cols-3 gap-4 border-b border-navy/10 bg-creme/60 px-5 py-3 font-sans text-[11px] uppercase tracking-widest text-graphit/60 sm:px-6">
              <div></div>
              <div>{labels.dimSummary}</div>
              <div className="text-gold-deep">{labels.dimPack}</div>
            </div>
            {labels.differenceRows.map((row, i, arr) => (
              <div
                key={i}
                className={[
                  'grid grid-cols-3 gap-4 px-5 py-3 sm:px-6',
                  i < arr.length - 1 ? 'border-b border-navy/10' : '',
                ].join(' ')}
              >
                <div className="font-sans text-sm font-medium text-navy">{row.k}</div>
                <div className="font-sans text-sm text-graphit/65">{row.summary}</div>
                <div className="font-serif text-sm text-navy">{row.pack}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample packs */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.samplesEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.samplesTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-3 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
            {labels.samplesSub}
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { path: '/pack/sample', name: labels.sampleBrief, mode: 'BRIEFING · ES + EN' },
              { path: '/pack/sample-learn', name: labels.sampleLearn, mode: 'LEARN · DE → ES' },
              { path: '/pack/sample-creator', name: labels.sampleCreator, mode: 'CREATOR · ES + EN' },
              { path: '/pack/sample-study', name: labels.sampleStudy, mode: 'STUDY · EN + ES' },
            ].map((s, i) => (
              <li key={i}>
                <Link
                  to={s.path}
                  className="block rounded-card border border-navy/10 bg-white px-5 py-4 transition hover:border-gold hover:shadow-card"
                >
                  <div className="font-sans text-[10px] uppercase tracking-widest text-gold-deep">
                    {s.mode}
                  </div>
                  <div className="mt-1.5 font-serif text-base text-navy">{s.name}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer CTAs */}
        <div className="mt-16 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm text-graphit/65 sm:mt-20">
          <Link
            to="/youtube-to-anki"
            className="italic underline-offset-4 transition hover:text-gold hover:underline"
          >
            {labels.ankiCta}
          </Link>
          <Link
            to="/mcp"
            className="underline-offset-4 transition hover:text-navy hover:underline"
          >
            {labels.mcpCta}
          </Link>
          <Link
            to="/"
            className="underline-offset-4 transition hover:text-navy hover:underline"
          >
            {labels.backCta}
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ─── Localised copy ──────────────────────────────────────────────── */

function knowledgePacksLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'KNOWLEDGE PACKS · LA UNIDAD',
    h1: 'Un Knowledge Pack es un vídeo que ya leíste, listo para volver a abrir.',
    sub: 'Una unidad estructurada que VozClara extrae de cada vídeo de YouTube: ocho componentes, en tu idioma, con timestamps que regresan al segundo exacto. La unidad sobre la que el resto del producto está construido.',
    cta: 'Crear mi primer pack',
    trustNote: 'Gratis durante la beta. Sin registro. Listo al instante.',
    imageAlt: 'Cinco tarjetas Anki sobre cuero burdeos representando los componentes de vocabulario de un Knowledge Pack.',
    componentsEyebrow: '§ Componentes',
    componentsTitle: 'Ocho componentes. Ningún archivo opcional.',
    componentsSub: 'Cada Pack — sin importar el modo (Learn / Briefing / Study / Creator) — contiene las ocho secciones siguientes, generadas en el idioma que elijas.',
    components: [
      { name: 'Resumen', body: 'Corto + largo. El "TL;DR" en 3 frases más una versión narrativa de 200-400 palabras.' },
      { name: 'Ideas clave', body: '5-8 puntos centrales que sustentan el argumento del vídeo, no copy-paste del transcript.' },
      { name: 'Capítulos', body: 'Segmentación temporal del vídeo con un título descriptivo por capítulo + el timestamp de inicio.' },
      { name: 'Plan de acción', body: 'Pasos concretos que un espectador puede hacer la próxima semana basado en lo que vio.' },
      { name: 'Vocabulario', body: 'Vocabulario tuneado a tu nivel MCER, con frase en contexto y traducción. Base del mazo Anki.' },
      { name: 'Citas clave', body: 'Citas verbatim con speaker + timestamp + traducción. La materia prima de los Quote-Cards.' },
      { name: 'Ángulos sociales', body: 'Solo en modo Creator. 3-5 ángulos para Twitter / LinkedIn / TikTok desde el contenido del vídeo.' },
      { name: 'Quiz', body: 'Preguntas de comprensión + aplicación. Mezcla recall y transfer. Útil para SRS o autoevaluación.' },
    ],
    differenceEyebrow: '§ Diferencia',
    differenceTitle: 'Knowledge Pack ≠ resumen ≠ transcripción.',
    dimSummary: 'Resumen genérico',
    dimPack: 'Knowledge Pack',
    differenceRows: [
      { k: 'Estructura', summary: '3-5 viñetas', pack: '8 secciones tipadas' },
      { k: 'Idioma', summary: 'Mismo idioma que el vídeo', pack: 'Tu idioma de destino' },
      { k: 'Timestamps', summary: 'Ninguno', pack: '[mm:ss] en cada cita + capítulo' },
      { k: 'Estudio', summary: 'No exportable', pack: 'Mazo Anki .apkg en un clic' },
      { k: 'Persistencia', summary: 'Conversación que se olvida', pack: 'Pack guardado, buscable durante años' },
      { k: 'Niveles', summary: 'Un nivel para todos', pack: 'A1 → C1 MCER ajustado' },
    ],
    samplesEyebrow: '§ Ejemplos',
    samplesTitle: 'Cuatro packs reales para abrir sin signup.',
    samplesSub: 'Cada modo (Learn / Briefing / Study / Creator) optimiza para una intención diferente. Los cuatro packs muestran cómo cambia la salida.',
    sampleBrief: 'Tagesschau · Coalición Merz un año después',
    sampleLearn: 'Tagesschau · aprender alemán con noticias',
    sampleCreator: 'Tagesschau · ángulos sociales',
    sampleStudy: 'Veritasium · entropía y la flecha del tiempo',
    ankiCta: '¿Cómo es el mazo Anki que recibo? →',
    mcpCta: 'Generar packs vía MCP (Claude / Cursor)',
    backCta: 'Volver a VozClara',
  };

  if (locale.startsWith('pt')) return {
    eyebrow: 'KNOWLEDGE PACKS · A UNIDADE',
    h1: 'Um Knowledge Pack é um vídeo que já leste, pronto para reabrir.',
    sub: 'Uma unidade estruturada que VozClara extrai de cada vídeo do YouTube: oito componentes, na tua língua, com timestamps que regressam ao segundo exato. A unidade sobre a qual o resto do produto está construído.',
    cta: 'Criar o meu primeiro pack',
    trustNote: 'Grátis durante a beta. Sem registo. Pronto num instante.',
    imageAlt: 'Cinco cartões Anki sobre cabedal cor-de-vinho representando os componentes de vocabulário de um Knowledge Pack.',
    componentsEyebrow: '§ Componentes',
    componentsTitle: 'Oito componentes. Nenhum ficheiro opcional.',
    componentsSub: 'Cada Pack — independentemente do modo (Learn / Briefing / Study / Creator) — contém as oito secções seguintes, geradas na língua que escolheres.',
    components: [
      { name: 'Resumo', body: 'Curto + longo. O "TL;DR" em 3 frases mais uma versão narrativa de 200-400 palavras.' },
      { name: 'Ideias-chave', body: '5-8 pontos centrais que sustentam o argumento do vídeo, não copy-paste do transcript.' },
      { name: 'Capítulos', body: 'Segmentação temporal do vídeo com um título descritivo por capítulo + o timestamp de início.' },
      { name: 'Plano de ação', body: 'Passos concretos que um espectador pode dar na próxima semana baseado no que viu.' },
      { name: 'Vocabulário', body: 'Vocabulário ajustado ao teu nível QECR, com frase em contexto e tradução. Base do deck Anki.' },
      { name: 'Citações-chave', body: 'Citações verbatim com falante + timestamp + tradução. A matéria-prima dos Quote-Cards.' },
      { name: 'Ângulos sociais', body: 'Apenas no modo Creator. 3-5 ângulos para Twitter / LinkedIn / TikTok a partir do conteúdo do vídeo.' },
      { name: 'Quiz', body: 'Perguntas de compreensão + aplicação. Mistura recall e transferência. Útil para SRS ou autoavaliação.' },
    ],
    differenceEyebrow: '§ Diferença',
    differenceTitle: 'Knowledge Pack ≠ resumo ≠ transcrição.',
    dimSummary: 'Resumo genérico',
    dimPack: 'Knowledge Pack',
    differenceRows: [
      { k: 'Estrutura', summary: '3-5 marcadores', pack: '8 secções tipadas' },
      { k: 'Língua', summary: 'Mesma língua que o vídeo', pack: 'A tua língua-destino' },
      { k: 'Timestamps', summary: 'Nenhum', pack: '[mm:ss] em cada citação + capítulo' },
      { k: 'Estudo', summary: 'Não exportável', pack: 'Deck Anki .apkg num clique' },
      { k: 'Persistência', summary: 'Conversa que se esquece', pack: 'Pack guardado, pesquisável durante anos' },
      { k: 'Níveis', summary: 'Um nível para todos', pack: 'A1 → C1 QECR ajustado' },
    ],
    samplesEyebrow: '§ Exemplos',
    samplesTitle: 'Quatro packs reais para abrir sem signup.',
    samplesSub: 'Cada modo (Learn / Briefing / Study / Creator) otimiza para uma intenção diferente. Os quatro packs mostram como muda a saída.',
    sampleBrief: 'Tagesschau · Coligação Merz um ano depois',
    sampleLearn: 'Tagesschau · aprender alemão com notícias',
    sampleCreator: 'Tagesschau · ângulos sociais',
    sampleStudy: 'Veritasium · entropia e a flecha do tempo',
    ankiCta: 'Como é o deck Anki que recebo? →',
    mcpCta: 'Gerar packs via MCP (Claude / Cursor)',
    backCta: 'Voltar à VozClara',
  };

  if (locale.startsWith('de')) return {
    eyebrow: 'KNOWLEDGE PACKS · DIE EINHEIT',
    h1: 'Ein Knowledge Pack ist ein Video das du schon gelesen hast, bereit zum erneut Öffnen.',
    sub: 'Eine strukturierte Einheit die VozClara aus jedem YouTube-Video extrahiert: acht Komponenten, in deiner Sprache, mit Timestamps die zur exakten Sekunde zurückspringen. Die Einheit auf der der Rest des Produkts gebaut ist.',
    cta: 'Meinen ersten Pack erstellen',
    trustNote: 'Kostenlos in der Beta. Ohne Anmeldung. Sofort startklar.',
    imageAlt: 'Fünf Anki-Karten auf cordovanfarbenem Leder die Vokabular-Komponenten eines Knowledge Packs darstellen.',
    componentsEyebrow: '§ Komponenten',
    componentsTitle: 'Acht Komponenten. Keine optionalen Dateien.',
    componentsSub: 'Jeder Pack — egal welcher Modus (Learn / Briefing / Study / Creator) — enthält die folgenden acht Sektionen, generiert in der Sprache die du wählst.',
    components: [
      { name: 'Zusammenfassung', body: 'Kurz + lang. Das "TL;DR" in 3 Sätzen plus eine narrative Version mit 200-400 Wörtern.' },
      { name: 'Kerngedanken', body: '5-8 zentrale Punkte die das Argument des Videos tragen, kein Copy-paste vom Transcript.' },
      { name: 'Kapitel', body: 'Zeitliche Segmentierung des Videos mit beschreibendem Titel pro Kapitel + Start-Timestamp.' },
      { name: 'Aktionsplan', body: 'Konkrete Schritte die ein Zuschauer nächste Woche umsetzen kann basierend auf dem was er gesehen hat.' },
      { name: 'Vokabular', body: 'Vokabular angepasst an dein GER-Niveau, mit Satz im Kontext und Übersetzung. Basis des Anki-Decks.' },
      { name: 'Zitate', body: 'Verbatim-Zitate mit Sprecher + Timestamp + Übersetzung. Rohmaterial für die Quote-Cards.' },
      { name: 'Social Angles', body: 'Nur im Creator-Modus. 3-5 Aufhänger für Twitter / LinkedIn / TikTok aus dem Video-Inhalt.' },
      { name: 'Quiz', body: 'Verständnis- + Anwendungsfragen. Mischt Recall und Transfer. Nützlich für SRS oder Selbstprüfung.' },
    ],
    differenceEyebrow: '§ Unterschied',
    differenceTitle: 'Knowledge Pack ≠ Zusammenfassung ≠ Transkript.',
    dimSummary: 'Generische Zusammenfassung',
    dimPack: 'Knowledge Pack',
    differenceRows: [
      { k: 'Struktur', summary: '3-5 Bulletpoints', pack: '8 typisierte Sektionen' },
      { k: 'Sprache', summary: 'Selbe Sprache wie Video', pack: 'Deine Zielsprache' },
      { k: 'Timestamps', summary: 'Keine', pack: '[mm:ss] auf jedem Zitat + Kapitel' },
      { k: 'Studium', summary: 'Nicht exportierbar', pack: 'Anki .apkg in einem Klick' },
      { k: 'Persistenz', summary: 'Gespräch das vergessen wird', pack: 'Pack gespeichert, jahrelang durchsuchbar' },
      { k: 'Niveaus', summary: 'Ein Niveau für alle', pack: 'A1 → C1 GER angepasst' },
    ],
    samplesEyebrow: '§ Beispiele',
    samplesTitle: 'Vier echte Packs zum Anschauen ohne Signup.',
    samplesSub: 'Jeder Modus (Learn / Briefing / Study / Creator) optimiert für eine andere Intention. Die vier Packs zeigen wie sich der Output ändert.',
    sampleBrief: 'Tagesschau · Koalition Merz ein Jahr später',
    sampleLearn: 'Tagesschau · Deutsch lernen mit Nachrichten',
    sampleCreator: 'Tagesschau · Social Angles',
    sampleStudy: 'Veritasium · Entropie und der Pfeil der Zeit',
    ankiCta: 'Wie sieht das Anki-Deck aus das ich bekomme? →',
    mcpCta: 'Packs via MCP generieren (Claude / Cursor)',
    backCta: 'Zurück zu VozClara',
  };

  return {
    eyebrow: 'KNOWLEDGE PACKS · THE UNIT',
    h1: 'A Knowledge Pack is a video you have already read, ready to reopen.',
    sub: 'A structured unit VozClara extracts from every YouTube video: eight components, in your language, with timestamps that jump back to the exact second. The unit the rest of the product is built around.',
    cta: 'Create my first pack',
    trustNote: 'Free during beta. No signup. Start instantly.',
    imageAlt: 'Five Anki flashcards on cordovan leather representing the vocabulary component of a Knowledge Pack.',
    componentsEyebrow: '§ Components',
    componentsTitle: 'Eight components. No optional files.',
    componentsSub: 'Every Pack — regardless of mode (Learn / Briefing / Study / Creator) — contains the following eight sections, generated in the language you pick.',
    components: [
      { name: 'Summary', body: 'Short + long. The "TL;DR" in three sentences plus a narrative version of 200-400 words.' },
      { name: 'Key Ideas', body: '5-8 central points that carry the video\'s argument, not copy-paste from the transcript.' },
      { name: 'Chapters', body: 'Temporal segmentation of the video with a descriptive title per chapter + the start timestamp.' },
      { name: 'Action Plan', body: 'Concrete steps a viewer can take next week based on what they watched.' },
      { name: 'Vocabulary', body: 'Vocabulary tuned to your CEFR level, with sentence context and translation. The base of the Anki deck.' },
      { name: 'Key Quotes', body: 'Verbatim quotes with speaker + timestamp + translation. Raw material for the Quote-Cards.' },
      { name: 'Social Angles', body: 'Creator mode only. 3-5 angles for Twitter / LinkedIn / TikTok pulled from the video\'s content.' },
      { name: 'Quiz', body: 'Comprehension + application questions. Mixes recall and transfer. Useful for SRS or self-testing.' },
    ],
    differenceEyebrow: '§ Difference',
    differenceTitle: 'Knowledge Pack ≠ summary ≠ transcript.',
    dimSummary: 'Generic summary',
    dimPack: 'Knowledge Pack',
    differenceRows: [
      { k: 'Structure', summary: '3-5 bullets', pack: '8 typed sections' },
      { k: 'Language', summary: 'Same language as video', pack: 'Your target language' },
      { k: 'Timestamps', summary: 'None', pack: '[mm:ss] on every quote + chapter' },
      { k: 'Study', summary: 'Not exportable', pack: 'Anki .apkg in one click' },
      { k: 'Persistence', summary: 'Conversation that is forgotten', pack: 'Pack saved, searchable for years' },
      { k: 'Levels', summary: 'One level for all', pack: 'A1 → C1 CEFR tuned' },
    ],
    samplesEyebrow: '§ Examples',
    samplesTitle: 'Four real packs to open without signup.',
    samplesSub: 'Each mode (Learn / Briefing / Study / Creator) optimises for a different intent. The four packs show how the output changes.',
    sampleBrief: 'Tagesschau · Merz coalition one year on',
    sampleLearn: 'Tagesschau · learn German from the news',
    sampleCreator: 'Tagesschau · social angles',
    sampleStudy: 'Veritasium · entropy and the arrow of time',
    ankiCta: 'What does the Anki deck I receive look like? →',
    mcpCta: 'Generate packs via MCP (Claude / Cursor)',
    backCta: 'Back to VozClara',
  };
}
