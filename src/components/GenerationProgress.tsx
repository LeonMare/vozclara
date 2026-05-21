import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../lib/i18n';
import { BrandMark } from './BrandMark';
import { CountUp } from './CountUp';

interface ProgressMeta {
  /** Minutes of source video, once known. */
  videoMinutes?: number;
  /** Number of transcript sentences, once parsed. */
  sentences?: number;
  /** Target language code. */
  targetLang?: string;
  /** How many insights extracted, once the LLM finishes. */
  insights?: number;
}

interface Props {
  active: boolean;
  meta?: ProgressMeta;
  /**
   * Adjusts the loading narration when we're adding a translation to an
   * existing Pack rather than creating one from scratch. The user already
   * knows the video — they're waiting for a new language to land — so
   * the copy stops talking about minutes of footage and centres on the
   * translation itself.
   */
  mergeMode?: boolean;
  /**
   * Live model output as the pack is being composed — passed in by
   * GeneratorPage when `streamInsights` is yielding deltas. When
   * present, a fixed-height typewriter scroller appears below the
   * narration phases. Empty string / undefined → scroller hidden.
   *
   * The text is the raw model output (JSON-shaped during a normal
   * /api/insights/stream run) — by design. The Manus / Granola UX
   * insight: seeing the model "type" is the proof-of-work moment
   * that converts loading anxiety into anticipation. Showing the
   * structural braces + field names alongside the prose is part of
   * that signal, not a bug to hide.
   */
  streamingText?: string;
}

/**
 * Editorial loading state. Narrates the actual work happening.
 *
 * Two modes:
 *  • Default (creating a new pack):
 *      "Reading 14 minutes of footage."
 *      "247 sentences identified."
 *      "Translating to Spanish."
 *      "Distilling 4 key ideas."
 *      "Composing the Knowledge Pack."
 *
 *  • mergeMode (adding a language to an existing pack):
 *      "Re-reading the source captions."
 *      "Translating to English."
 *      "Distilling key ideas in English."
 *      "Adding English to your Pack."
 *
 * Specifics come from the live work (transcript fetch returns
 * sentence count; LLM call returns insight count). Numbers fade
 * in as they become known. Falls back to generic phrases until
 * the data arrives.
 */
export function GenerationProgress({ active, meta, mergeMode, streamingText }: Props) {
  const { locale } = useLocale();
  const [tick, setTick] = useState(0);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((p) => p + 1), 1800);
    return () => clearInterval(id);
  }, [active]);

  // Auto-scroll the streaming-text scroller to the bottom every time
  // a new delta arrives. Plain `scrollTop = scrollHeight` works
  // because we want hard-jump-to-bottom (typewriter feel), not
  // smooth-scroll (would lag behind fast deltas).
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamingText]);

  if (!active) return null;

  const lines = mergeMode
    ? buildMergeLines(locale, meta)
    : buildLines(locale, meta);
  const visibleUpTo = Math.min(lines.length, tick + 1);

  return (
    <div
      role="status"
      aria-live="polite"
      className="paper flex min-h-[45vh] flex-col items-center justify-center px-5 py-12 text-center sm:px-8"
    >
      {/* Lighthouse mark with two ambient effects stacked:
            • slow-glow  — opacity pulse (was already shipping)
            • beacon-sweep — rotating gold-light conic gradient that
              looks like the lighthouse beam actually sweeping
          The pair makes the loading state feel alive without ever
          crossing into "spinner" territory. */}
      <span className="beacon-sweep inline-block">
        <span className="slow-glow relative z-10 inline-block">
          <BrandMark variant="monogram" size="xl" tone="gold" decorative />
        </span>
      </span>

      <div className="mt-10 flex min-h-[160px] flex-col items-center gap-3">
        {lines.slice(0, visibleUpTo).map((line, i) => {
          const isCurrent = i === visibleUpTo - 1;
          return (
            <p
              key={i}
              className={[
                'font-serif italic leading-tight transition-all duration-700',
                isCurrent
                  ? 'text-navy text-xl sm:text-2xl opacity-100'
                  : 'text-graphit/65 text-base opacity-60 sm:text-lg',
              ].join(' ')}
              style={{
                animation: 'fade-in-up 700ms cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              {renderLineWithCountUp(line, isCurrent)}
              {/* Typewriter caret on the active line — blinks at a
                  mechanical step rate so the loading state feels like
                  a typesetter is actively composing, not a generic
                  spinner. Decorative only; aria-hidden. */}
              {isCurrent && (
                <span
                  aria-hidden
                  className="cursor-blink ml-1.5 inline-block h-[0.9em] w-[2px] translate-y-[0.06em] bg-gold/75 align-baseline"
                />
              )}
            </p>
          );
        })}
      </div>

      <div className="mt-8 flex gap-1.5" aria-hidden>
        {lines.map((_, idx) => (
          <span
            key={idx}
            className={[
              'h-0.5 transition-all duration-500',
              idx < visibleUpTo - 1
                ? 'w-5 bg-gold/50'
                : idx === visibleUpTo - 1
                  ? 'w-10 bg-gold'
                  : 'w-5 bg-navy/15',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Streaming typewriter view — visible only when the
          GeneratorPage feeds in live deltas from streamInsights.
          Fixed height with auto-scroll to bottom on every update
          so the user sees the tail of the output (most recent
          tokens) without the scroll position fighting them. Mono-
          space font intentionally — the model is composing JSON,
          and the monospace + low-contrast styling makes that read
          as "the AI is working" rather than "weird unformatted
          text". Decorative only; aria-hidden so screen readers
          announce the narration phases above, not the raw stream. */}
      {streamingText && streamingText.length > 0 && (
        <div
          ref={streamRef}
          aria-hidden
          className="mt-8 w-full max-w-2xl overflow-y-auto rounded-card border border-navy/10 bg-creme/40 px-4 py-3 text-left font-mono text-[11px] leading-relaxed text-graphit/55 sm:text-xs"
          style={{ maxHeight: '8.5rem', fontFamily: '"SF Mono", ui-monospace, "Cascadia Code", Consolas, monospace' }}
        >
          {streamingText}
          {/* Trailing block-cursor that blinks at the end of the
              latest delta — same animation as the editorial caret
              on the active narration line. Reinforces the "live
              typing" signal at the bottom edge of the scroller. */}
          <span
            className="cursor-blink ml-0.5 inline-block h-[0.85em] w-[0.45em] translate-y-[0.08em] bg-gold/55 align-baseline"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Replace plain numbers in a phrase with animated CountUps. Phrases match
 * a "{N}" placeholder pattern — see buildLines below.
 */
function renderLineWithCountUp(line: string, isCurrent: boolean): React.ReactNode {
  const parts = line.split(/\{(\d+)\}/);
  if (parts.length === 1) return line;
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const n = Number(part);
      return isCurrent ? <CountUp key={i} to={n} /> : <span key={i} className="tabular-nums">{n}</span>;
    }
    return part;
  });
}

function buildLines(
  locale: ReturnType<typeof useLocale>['locale'],
  meta?: ProgressMeta,
): string[] {
  const langName: Record<string, Record<typeof locale, string>> = {
    es: { es: 'castellano', pt: 'castelhano', de: 'Spanisch', en: 'Spanish' },
    pt: { es: 'portugués', pt: 'português', de: 'Portugiesisch', en: 'Portuguese' },
    de: { es: 'alemán', pt: 'alemão', de: 'Deutsch', en: 'German' },
    en: { es: 'inglés', pt: 'inglês', de: 'Englisch', en: 'English' },
  };

  const target = meta?.targetLang ?? locale;
  const targetName = langName[target]?.[locale] ?? target;

  // {N} placeholders get replaced by animated CountUp values when rendered.
  if (locale === 'es') {
    return [
      meta?.videoMinutes ? `Leyendo {${meta.videoMinutes}} minutos de vídeo.` : 'Leyendo la fuente.',
      meta?.sentences ? `{${meta.sentences}} frases identificadas.` : 'Identificando frases y temas.',
      `Traduciendo al ${targetName}.`,
      meta?.insights ? `Destilando {${meta.insights}} ideas clave.` : 'Destilando ideas clave.',
      'Componiendo el Knowledge Pack.',
    ];
  }
  if (locale === 'pt') {
    return [
      meta?.videoMinutes ? `A ler {${meta.videoMinutes}} minutos de vídeo.` : 'A ler a fonte.',
      meta?.sentences ? `{${meta.sentences}} frases identificadas.` : 'A identificar frases e temas.',
      `A traduzir para ${targetName}.`,
      meta?.insights ? `A destilar {${meta.insights}} ideias-chave.` : 'A destilar ideias-chave.',
      'A compor o Knowledge Pack.',
    ];
  }
  if (locale === 'de') {
    return [
      meta?.videoMinutes ? `Lese {${meta.videoMinutes}} Minuten Video.` : 'Lese die Quelle.',
      meta?.sentences ? `{${meta.sentences}} Sätze identifiziert.` : 'Identifiziere Sätze und Themen.',
      `Übersetze nach ${targetName}.`,
      meta?.insights ? `Destilliere {${meta.insights}} Kernideen.` : 'Destilliere Kernideen.',
      'Komponiere den Knowledge Pack.',
    ];
  }
  // en
  return [
    meta?.videoMinutes ? `Reading {${meta.videoMinutes}} minutes of footage.` : 'Reading the source.',
    meta?.sentences ? `{${meta.sentences}} sentences identified.` : 'Identifying sentences and themes.',
    `Translating to ${targetName}.`,
    meta?.insights ? `Distilling {${meta.insights}} key ideas.` : 'Distilling key ideas.',
    'Composing the Knowledge Pack.',
  ];
}

/**
 * Merge-mode copy — the user has an existing pack and just clicked
 * "+ EN" / "+ DE" / "+ PT". They don't need to hear about minutes of
 * footage; they want to know "is the translation done yet?". Lines
 * focus on translating + adding, and reference the target language
 * by name on every step so the wait feels concrete.
 */
function buildMergeLines(
  locale: ReturnType<typeof useLocale>['locale'],
  meta?: ProgressMeta,
): string[] {
  const langName: Record<string, Record<typeof locale, string>> = {
    es: { es: 'castellano', pt: 'castelhano', de: 'Spanisch', en: 'Spanish' },
    pt: { es: 'portugués', pt: 'português', de: 'Portugiesisch', en: 'Portuguese' },
    de: { es: 'alemán', pt: 'alemão', de: 'Deutsch', en: 'German' },
    en: { es: 'inglés', pt: 'inglês', de: 'Englisch', en: 'English' },
    fr: { es: 'francés', pt: 'francês', de: 'Französisch', en: 'French' },
  };
  const target = meta?.targetLang ?? locale;
  const targetName = langName[target]?.[locale] ?? target;

  if (locale === 'es') {
    return [
      'Cargando los subtítulos guardados.',
      `Traduciendo al ${targetName}.`,
      meta?.insights
        ? `Destilando {${meta.insights}} ideas clave en ${targetName}.`
        : `Destilando ideas clave en ${targetName}.`,
      `Añadiendo ${targetName} a tu Pack.`,
    ];
  }
  if (locale === 'pt') {
    return [
      'A carregar as legendas guardadas.',
      `A traduzir para ${targetName}.`,
      meta?.insights
        ? `A destilar {${meta.insights}} ideias-chave em ${targetName}.`
        : `A destilar ideias-chave em ${targetName}.`,
      `A adicionar ${targetName} ao seu Pack.`,
    ];
  }
  if (locale === 'de') {
    return [
      'Lade die gespeicherten Untertitel.',
      `Übersetze nach ${targetName}.`,
      meta?.insights
        ? `Destilliere {${meta.insights}} Kernideen auf ${targetName}.`
        : `Destilliere Kernideen auf ${targetName}.`,
      `Füge ${targetName} zu deinem Pack hinzu.`,
    ];
  }
  return [
    'Loading the saved captions.',
    `Translating to ${targetName}.`,
    meta?.insights
      ? `Distilling {${meta.insights}} key ideas in ${targetName}.`
      : `Distilling key ideas in ${targetName}.`,
    `Adding ${targetName} to your Pack.`,
  ];
}
