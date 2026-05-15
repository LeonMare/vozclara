import { useEffect, useState } from 'react';
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
export function GenerationProgress({ active, meta, mergeMode }: Props) {
  const { locale } = useLocale();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((p) => p + 1), 1800);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const lines = mergeMode
    ? buildMergeLines(locale, meta)
    : buildLines(locale, meta);
  const visibleUpTo = Math.min(lines.length, tick + 1);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[45vh] flex-col items-center justify-center px-5 py-12 text-center sm:px-8"
    >
      <span className="slow-glow inline-block">
        <BrandMark variant="monogram" size="xl" tone="gold" decorative />
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
                  : 'text-graphit/45 text-base opacity-60 sm:text-lg',
              ].join(' ')}
              style={{
                animation: 'fade-in-up 700ms cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              {renderLineWithCountUp(line, isCurrent)}
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
