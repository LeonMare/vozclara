import { useState } from 'react';
import type { Mode } from '../lib/pack';
import { useLocale } from '../lib/i18n';

interface Props {
  value: Mode;
  onChange: (m: Mode) => void;
  recommended?: Mode;
}

/**
 * Three editorial mode cards plus a live preview panel underneath.
 *
 * The preview shows two concrete example snippets in the user's UI
 * language for whichever mode they're currently hovering — or, when
 * no card is hovered, for the currently selected mode. This lets the
 * visitor see what the chosen mode actually produces before they
 * commit to generation. Cuts the "wait, which one is right for me?"
 * hesitation that a name-only selector causes.
 *
 * On touch devices there's no hover; the preview just tracks the
 * selected mode and updates whenever the user taps a different card.
 *
 * The recommended mode (based on detected genre) gets a discrete
 * "Recomendado" badge.
 */
export function ModePicker({ value, onChange, recommended }: Props) {
  const { t } = useLocale();
  // Four modes — `brief` replaces the old `business` key (same intent,
  // sharper name) and `study` is new. Order is intentional: language
  // learner → briefing reader → student → creator, roughly from
  // longest-tail audience to shortest-tail.
  const modes: Mode[] = ['learn', 'brief', 'study', 'creator'];
  const [hovered, setHovered] = useState<Mode | null>(null);
  const previewMode = hovered ?? value;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {modes.map((m) => {
          const selected = m === value;
          const isRecommended = m === recommended;
          const meta = t.modes[m];
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              onMouseEnter={() => setHovered(m)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(m)}
              onBlur={() => setHovered(null)}
              aria-pressed={selected}
              className={[
                'group relative flex flex-col rounded-card border bg-white p-5 text-left transition-all duration-300 sm:p-6',
                selected
                  ? 'border-gold shadow-card -translate-y-0.5'
                  : 'border-navy/15 hover:border-gold/60 hover:-translate-y-0.5',
              ].join(' ')}
            >
              {isRecommended && (
                <span className="absolute right-4 top-4 rounded-full bg-navy px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest text-gold">
                  {t.modeRecommended}
                </span>
              )}

              <div className={selected ? 'text-gold' : 'text-graphit/55 group-hover:text-gold'}>
                <ModeCipher mode={m} />
              </div>

              <h3 className="mt-4 font-serif text-2xl text-navy">{meta.name}</h3>
              <p className="mt-1 font-serif italic text-graphit/70">{meta.tagline}</p>
              <div className="mt-3 h-px w-8 bg-gold/50" aria-hidden />
              <p className="mt-3 font-sans text-sm leading-relaxed text-graphit/75">{meta.description}</p>

              <ul className="mt-4 space-y-1.5 font-sans text-[13px] text-graphit/70">
                {meta.bullets.map((b, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="text-gold/70">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <ModePreview mode={previewMode} isHover={hovered !== null} />
    </div>
  );
}

/* ─── Live preview panel ──────────────────────────────────────────────── */

/**
 * Two-column preview of concrete snippets the chosen mode produces.
 * The `key={mode}` on the wrapper forces a re-mount on every mode
 * change so the fade-in animation re-triggers — it gives the panel
 * a "swapping in fresh content" feel rather than silently mutating.
 */
function ModePreview({ mode, isHover }: { mode: Mode; isHover: boolean }) {
  const { locale } = useLocale();
  const examples = previewExamples(locale, mode);
  const labels = previewLabels(locale);

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-baseline justify-between gap-3 font-sans text-[10px] uppercase tracking-widest">
        <span className="text-gold">
          {isHover ? labels.headingHover : labels.headingActive}
        </span>
        <span className="text-graphit/40">
          {labels.modeLabel}: <span className="text-graphit/70">{labels.modes[mode]}</span>
        </span>
      </div>
      <div
        key={mode}
        className="animate-fade-in rounded-card border border-navy/10 bg-white/55 p-4 sm:p-5"
        style={{ animationDuration: '350ms' }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {examples.map((ex, i) => (
            <div key={i} className="border-l-2 border-gold/40 pl-3.5">
              <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/55">
                {ex.label}
              </div>
              <p className="mt-1.5 font-serif text-[14px] leading-snug text-navy sm:text-[15px]">
                {ex.body}
              </p>
              {ex.sub && (
                <p className="mt-1 font-sans text-[12px] leading-snug text-graphit/65">
                  {ex.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PreviewExample {
  label: string;
  body: string;
  sub?: string;
}

function previewLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headingActive: 'Así se ve este modo',
    headingHover: 'Vista previa',
    modeLabel: 'Modo',
    modes: { learn: 'Aprender', brief: 'Briefing', study: 'Estudio', creator: 'Creador' } satisfies Record<Mode, string>,
  };
  if (locale.startsWith('pt')) return {
    headingActive: 'É assim que este modo se vê',
    headingHover: 'Pré-visualização',
    modeLabel: 'Modo',
    modes: { learn: 'Aprender', brief: 'Briefing', study: 'Estudo', creator: 'Criador' } satisfies Record<Mode, string>,
  };
  if (locale.startsWith('de')) return {
    headingActive: 'So sieht dieser Modus aus',
    headingHover: 'Vorschau',
    modeLabel: 'Modus',
    modes: { learn: 'Lernen', brief: 'Briefing', study: 'Studieren', creator: 'Creator' } satisfies Record<Mode, string>,
  };
  return {
    headingActive: 'What this mode looks like',
    headingHover: 'Preview',
    modeLabel: 'Mode',
    modes: { learn: 'Learn', brief: 'Briefing', study: 'Study', creator: 'Creator' } satisfies Record<Mode, string>,
  };
}

/**
 * Two concrete preview snippets per mode, in the user's UI language.
 * Pulled in the spirit of the existing sample packs so the visitor
 * sees real-looking output, not lorem ipsum.
 */
function previewExamples(locale: string, mode: Mode): PreviewExample[] {
  if (locale.startsWith('es')) {
    if (mode === 'learn') return [
      { label: 'Vocabulario', body: 'die Koalition', sub: '→ la coalición · sustantivo (f)' },
      { label: 'Cuestionario', body: '¿Qué significa "schwarz-rote Koalition"?', sub: 'Coalición negro-roja: la alianza Unión + SPD.' },
    ];
    if (mode === 'brief') return [
      { label: 'Acción 01', body: 'Monitorizar las encuestas regionales en Sajonia y Turingia.', sub: 'La AfD podría superar el 30 % en próximos sondeos.' },
      { label: 'Cita clave', body: '"Hay un creciente descontento con los compromisos asumidos."', sub: '— Friedrich Merz · 0:44' },
    ];
    if (mode === 'study') return [
      { label: 'Capítulo 03', body: 'La estructura de la coalición negro-roja: dependencia + ruptura.', sub: 'startSec 4:12 · 2 frases · Resumen tipo apuntes' },
      { label: 'Pregunta 04', body: '¿Por qué Merz menciona el descontento *interno* y no el externo?', sub: 'Respuesta + 2 frases de explicación · timestampSec 6:30' },
    ];
    return [
      { label: 'Hook', body: '"Un canciller alemán acaba de admitir que su propio partido está harto de sus compromisos."', sub: 'Apertura para Reel / TikTok' },
      { label: 'Caption', body: 'Friedrich Merz cumple un año y dijo lo que ningún canciller dice…', sub: 'Carrusel Instagram, 3-5 frases' },
    ];
  }

  if (locale.startsWith('pt')) {
    if (mode === 'learn') return [
      { label: 'Vocabulário', body: 'die Koalition', sub: '→ a coligação · substantivo (f)' },
      { label: 'Questionário', body: 'O que significa "schwarz-rote Koalition"?', sub: 'Coligação negro-vermelha: aliança União + SPD.' },
    ];
    if (mode === 'brief') return [
      { label: 'Ação 01', body: 'Monitorizar as sondagens regionais na Saxónia e na Turíngia.', sub: 'A AfD pode ultrapassar os 30 % nas próximas sondagens.' },
      { label: 'Citação-chave', body: '"Há um descontentamento crescente com os compromissos assumidos."', sub: '— Friedrich Merz · 0:44' },
    ];
    if (mode === 'study') return [
      { label: 'Capítulo 03', body: 'A estrutura da coligação negro-vermelha: dependência + rutura.', sub: 'startSec 4:12 · 2 frases · Resumo tipo apontamentos' },
      { label: 'Pergunta 04', body: 'Porque é que Merz menciona o descontentamento *interno* e não o externo?', sub: 'Resposta + 2 frases de explicação · timestampSec 6:30' },
    ];
    return [
      { label: 'Hook', body: '"Um chanceler alemão acaba de admitir que o próprio partido está farto dos seus compromissos."', sub: 'Abertura para Reel / TikTok' },
      { label: 'Caption', body: 'Friedrich Merz cumpre um ano e disse o que nenhum chanceler diz…', sub: 'Carrossel Instagram, 3-5 frases' },
    ];
  }

  if (locale.startsWith('de')) {
    if (mode === 'learn') return [
      { label: 'Vokabel', body: 'die Koalition', sub: '→ la coalición · Substantiv (f)' },
      { label: 'Quizfrage', body: 'Was bedeutet "schwarz-rote Koalition"?', sub: 'Die historische Großkoalition aus Union (schwarz) und SPD (rot).' },
    ];
    if (mode === 'brief') return [
      { label: 'Aktion 01', body: 'Die regionalen Umfragen in Sachsen und Thüringen genau beobachten.', sub: 'Die AfD könnte in den nächsten Wochen 30 % überschreiten.' },
      { label: 'Schlüsselzitat', body: '„Es gibt einen wachsenden Unmut über die Kompromisse."', sub: '— Friedrich Merz · 0:44' },
    ];
    if (mode === 'study') return [
      { label: 'Kapitel 03', body: 'Die Struktur der schwarz-roten Koalition: Abhängigkeit und Bruch.', sub: 'startSec 4:12 · 2 Sätze · Kapitelweise Lernzusammenfassung' },
      { label: 'Quizfrage 04', body: 'Warum nennt Merz den *innerparteilichen* Unmut, nicht den äußeren?', sub: 'Antwort + 2 Sätze Erklärung · timestampSec 6:30' },
    ];
    return [
      { label: 'Hook', body: '„Ein Bundeskanzler hat eben zugegeben dass seine eigene Partei mit ihm fertig ist."', sub: 'Eröffnung für Reel / TikTok' },
      { label: 'Caption', body: 'Friedrich Merz ist ein Jahr im Amt und sagte was sonst kein Kanzler sagt…', sub: 'Instagram-Carousel, 3-5 Sätze' },
    ];
  }

  // English
  if (mode === 'learn') return [
    { label: 'Vocabulary', body: 'die Koalition', sub: '→ the coalition · noun (f)' },
    { label: 'Quiz', body: 'What does "schwarz-rote Koalition" mean?', sub: 'The historic grand coalition of CDU/CSU (black) and SPD (red).' },
  ];
  if (mode === 'brief') return [
    { label: 'Action 01', body: 'Track the regional polls in Saxony and Thuringia.', sub: 'AfD could clear 30 % in upcoming surveys.' },
    { label: 'Key quote', body: '"There is growing dissatisfaction inside the party with the compromises."', sub: '— Friedrich Merz · 0:44' },
  ];
  if (mode === 'study') return [
    { label: 'Chapter 03', body: 'The structure of the black-red coalition: dependency and rupture.', sub: 'startSec 4:12 · 2 sentences · Revision-grade summary' },
    { label: 'Question 04', body: 'Why does Merz highlight *internal* dissatisfaction, not external?', sub: 'Answer + 2-sentence explanation · timestampSec 6:30' },
  ];
  return [
    { label: 'Hook', body: '"A German chancellor just admitted on national TV that his own party is done with his compromises."', sub: 'Opening line for a Reel / TikTok' },
    { label: 'Caption', body: 'Merz is one year in office and said what no chancellor usually says…', sub: 'Instagram carousel, 3-5 sentences' },
  ];
}

/* ─── Bespoke ornamental ciphers ──────────────────────────────────────── */

function ModeCipher({ mode }: { mode: Mode }) {
  const stroke = { stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const size = 32;

  if (mode === 'learn') {
    // Open book — classical educational cipher.
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <path d="M4 8c4-1 8-1 12 2v17c-4-3-8-3-12-2V8z" {...stroke} />
        <path d="M28 8c-4-1-8-1-12 2v17c4-3 8-3 12-2V8z" {...stroke} />
        <path d="M16 10v17" {...stroke} />
        <path d="M7 12h5M7 15h5M7 18h5M20 12h5M20 15h5M20 18h5" {...stroke} strokeWidth={0.9} />
      </svg>
    );
  }

  if (mode === 'brief') {
    // Compass rose — strategic-briefing cipher.
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="11" {...stroke} />
        <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
        <path d="M16 5l-2.2 11L16 18l2.2-2L16 5z" {...stroke} fill="currentColor" fillOpacity="0.85" />
        <path d="M16 27l-2.2-11L16 14l2.2 2L16 27z" {...stroke} />
        <path d="M5 16l11 2.2L14 16l2-2.2L5 16z" {...stroke} />
        <path d="M27 16l-11 2.2L18 16l-2-2.2L27 16z" {...stroke} fill="currentColor" fillOpacity="0.5" />
      </svg>
    );
  }

  if (mode === 'study') {
    // Notebook with a marked page edge and a bookmark — study cipher.
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        {/* Notebook cover + spine */}
        <rect x="6" y="4" width="18" height="24" rx="1" {...stroke} />
        <path d="M6 4v24" {...stroke} />
        <path d="M9 4v24" {...stroke} strokeWidth={0.85} />
        {/* Three horizontal ruled lines on the page */}
        <path d="M12 10h9M12 14h9M12 18h6" {...stroke} strokeWidth={0.9} />
        {/* Bookmark ribbon hanging from the top */}
        <path d="M18 4v8l1.6-1.4L21.2 12V4" {...stroke} fill="currentColor" fillOpacity="0.5" />
      </svg>
    );
  }

  // Creator — quill with ink drop.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M26 4c-4 1-9 4-13 8L8 17l3 3 5-5c4-4 7-9 8-13z" {...stroke} fill="currentColor" fillOpacity="0.15" />
      <path d="M11 20l-4 4 1 1 4-4" {...stroke} />
      <path d="M8 24l-2 4" {...stroke} />
      <circle cx="22" cy="9" r="1" fill="currentColor" stroke="none" />
      <path d="M18 24c-1 2-1 4 1 5 2-1 2-3 1-5" {...stroke} fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}
