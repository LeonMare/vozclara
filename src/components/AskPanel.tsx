import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { askKnowledge, condensePack, AskError, type AskResult } from '../lib/ask';
import type { KnowledgePack } from '../lib/pack';
import {
  incrementAskHitCount,
  getAskHitCount,
  THRESHOLDS,
  TRIGGERS,
} from '../lib/conversionTriggers';
import { ConversionChip } from './ConversionChip';

interface Props {
  packs: KnowledgePack[];
  /**
   * Controlled question value. When provided, the consumer manages the
   * input state externally — useful for the landing demo where clicking
   * an example chip writes into the field. When omitted, AskPanel
   * manages its own state, which is the right pattern for /library.
   */
  question?: string;
  onQuestionChange?: (q: string) => void;
  /**
   * Which scope the panel is asking against. Affects the labels only —
   * the underlying /api/ask call shape is identical.
   *   • 'library' (default) — "Ask anything across your library"
   *   • 'single-pack' — "Ask about this pack" (used inside PackPage)
   */
  scope?: 'library' | 'single-pack';
}

/**
 * Cross-library Q&A entry point — sits at the top of /library.
 *
 * Render contract:
 *  • Compact "Ask anything across your library." prompt by default
 *  • A single text input + submit, with a tiny loading bar while
 *    the worker call runs (~10–20 s for a small library)
 *  • Answer card with editorial typography + citation chips beneath
 *    that link back to the source packs
 *  • Friendly hint about citations and that the answer is grounded
 *    only in the user's saved content
 *
 * Excluded from the call: transcripts, vocabulary, quiz, chapters —
 * those would blow the token budget without improving answer quality.
 * The condensed shape (title + summary + key ideas) is enough for
 * most questions a user is likely to ask about their library.
 */
export function AskPanel({
  packs,
  question: questionProp,
  onQuestionChange,
  scope = 'library',
}: Props) {
  const { locale } = useLocale();
  const [internalQ, setInternalQ] = useState('');
  const question = questionProp !== undefined ? questionProp : internalQ;
  const setQuestion = (v: string) => {
    if (onQuestionChange) onQuestionChange(v);
    else setInternalQ(v);
  };
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labels = askLabels(locale, scope);
  const disabled = loading || question.trim().length < 3;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled || packs.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const condensed = packs.map(condensePack);
      // brainId scopes vector retrieval to this user's index — without
      // it the worker's vector path can't filter to the right library
      // (samples have brainId 'sample', real packs have the user's id).
      const brainId = packs[0]?.brainId;
      const res = await askKnowledge(question.trim(), condensed, locale, brainId);
      setResult(res);
      // T3 trigger — count this successful Ask. The chip below
      // surfaces once the running total crosses 3, signalling the
      // user is leaning on the cross-library Q&A enough that
      // Sonnet-grade answers would land harder than Llama-grade.
      // Increment AFTER setResult so a failure path never inflates
      // the counter.
      incrementAskHitCount();
    } catch (err) {
      if (err instanceof AskError) {
        setError(labels.errors[err.code] ?? err.message);
      } else {
        setError(String(err));
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // Find cited pack objects from the citation IDs for rendering chips.
  const citedPacks = result?.citations
    .map((id) => packs.find((p) => p.id === id))
    .filter((p): p is KnowledgePack => !!p) ?? [];

  return (
    <section
      className="rounded-card border border-navy/10 bg-white/55 px-5 py-5 sm:px-6 sm:py-6"
      aria-label="Ask My Knowledge"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="font-sans text-[10px] uppercase tracking-[0.35em] text-gold-deep">
            {labels.eyebrow}
          </div>
          <h2 className="mt-1 font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.heading}
          </h2>
        </div>
        {scope === 'library' && (
          <span className="hidden text-[11px] tabular-nums text-graphit/65 sm:inline">
            {packs.length}{' '}
            {packs.length === 1 ? labels.packsSingular : labels.packsPlural}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={labels.placeholder}
          maxLength={500}
          disabled={loading}
          className="flex-1 rounded-card border border-navy/15 bg-white px-4 py-3 font-sans text-base text-graphit placeholder-graphit/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled}
          className={[
            'rounded-card px-5 py-3 font-sans text-sm font-medium transition',
            disabled
              ? 'cursor-not-allowed bg-navy/40 text-creme/70'
              : 'bg-navy text-creme hover:bg-navy/90',
          ].join(' ')}
        >
          {loading ? labels.loading : labels.submit}
        </button>
      </form>

      {/* Subtle progress + privacy note */}
      <p className="mt-2.5 font-sans text-[11px] italic text-graphit/65">
        {loading
          ? labels.runningNote
          : labels.privacyNote}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-card border-l-2 border-red-700/50 bg-red-50/60 px-3 py-2 font-sans text-sm text-red-800">
          {error}
        </p>
      )}

      {result && !error && (
        <article className="mt-5 border-t border-navy/10 pt-5">
          <AnswerBody answer={result.answer} />
          {scope === 'library' && citedPacks.length > 0 && (
            <div className="mt-5">
              <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/65">
                {labels.citations}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {citedPacks.map((p) => (
                  <Link
                    key={p.id}
                    to={`/pack/${p.id}`}
                    className="inline-flex items-baseline gap-1.5 rounded-card border border-navy/15 bg-white px-2.5 py-1 font-sans text-xs text-navy transition hover:border-gold"
                  >
                    <span className="text-gold">·</span>
                    <span className="line-clamp-1 max-w-[18ch] sm:max-w-[32ch]">{p.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {/* T3 conversion chip — only on the library scope (PackPage's
              single-pack Ask is shorter usage), only past the 3-hit
              threshold. Re-reads the counter each render so it appears
              naturally as the user crosses the threshold mid-session. */}
          {scope === 'library' && getAskHitCount() >= THRESHOLDS.ASK_MY_KNOWLEDGE_MIN_HITS && (
            <div className="mt-5">
              <ConversionChip
                triggerId={TRIGGERS.ASK_MY_KNOWLEDGE_HIT}
                locale={locale}
                analyticsProps={{ ask_hit_count: getAskHitCount() }}
              />
            </div>
          )}
        </article>
      )}
    </section>
  );
}

/**
 * Render the LLM answer, replacing inline `[pack:xxx]` citation markers
 * with small superscript chips so the prose reads cleanly. Each chip is
 * just visual — the actual link chips live below the answer.
 */
function AnswerBody({ answer }: { answer: string }) {
  const parts = answer.split(/(\[pack:[A-Za-z0-9_-]+\])/g);
  return (
    <div className="font-serif text-[16px] leading-relaxed text-navy sm:text-lg">
      {parts.map((part, i) => {
        const cite = part.match(/^\[pack:([A-Za-z0-9_-]+)\]$/);
        if (cite) {
          return (
            <sup
              key={i}
              className="ml-0.5 rounded-full bg-gold/15 px-1.5 py-0.5 font-sans text-[10px] font-medium text-navy"
              title={cite[1]}
            >
              {/* Render an anchor symbol; the real label lives in the citation chip list below */}
              ·
            </sup>
          );
        }
        return (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
            {part}
          </span>
        );
      })}
    </div>
  );
}

/* ─── Localised strings ────────────────────────────────────────────────── */

function askLabels(locale: string, scope: 'library' | 'single-pack' = 'library') {
  const lib = scope === 'library';
  if (locale.startsWith('es')) return {
    eyebrow: lib ? 'Pregunta a tu biblioteca' : 'Pregunta sobre este pack',
    heading: lib ? '¿Qué quieres saber?' : '¿Qué quieres profundizar?',
    placeholder: lib ? '¿Qué dijo el video sobre…?' : '¿Por qué dijo…?',
    submit: 'Preguntar',
    loading: 'Buscando…',
    packsSingular: 'pack',
    packsPlural: 'packs',
    runningNote: lib ? 'Buscando entre tu biblioteca…' : 'Analizando este pack…',
    privacyNote: lib
      ? 'La pregunta y un resumen de tus packs viajan a la IA. El resto se queda en este dispositivo.'
      : 'La pregunta y el contenido de este pack viajan a la IA. Nada más.',
    citations: 'Packs citados',
    errors: {
      empty_library: 'Tu biblioteca está vacía. Crea un Knowledge Pack primero.',
      question_too_short: 'La pregunta es demasiado corta — añade más contexto.',
      question_too_long: 'La pregunta es demasiado larga. Resúmela.',
      ai_failed: 'La IA no pudo responder en este momento. Inténtalo de nuevo en un momento.',
      network: 'No se pudo conectar. ¿Hay internet?',
    },
  };
  if (locale.startsWith('pt')) return {
    eyebrow: lib ? 'Pergunta à tua biblioteca' : 'Pergunta sobre este pack',
    heading: lib ? 'O que queres saber?' : 'O que queres aprofundar?',
    placeholder: lib ? 'O que disse o vídeo sobre…?' : 'Porque é que disse…?',
    submit: 'Perguntar',
    loading: 'A procurar…',
    packsSingular: 'pack',
    packsPlural: 'packs',
    runningNote: lib ? 'A procurar na tua biblioteca…' : 'A analisar este pack…',
    privacyNote: lib
      ? 'A pergunta e um resumo dos teus packs viajam para a IA. O resto fica neste dispositivo.'
      : 'A pergunta e o conteúdo deste pack viajam para a IA. Nada mais.',
    citations: 'Packs citados',
    errors: {
      empty_library: 'A tua biblioteca está vazia. Cria primeiro um Knowledge Pack.',
      question_too_short: 'A pergunta é demasiado curta — adiciona mais contexto.',
      question_too_long: 'A pergunta é demasiado longa. Resume-a.',
      ai_failed: 'A IA não conseguiu responder neste momento. Tenta novamente daqui a um pouco.',
      network: 'Sem ligação. Há internet?',
    },
  };
  if (locale.startsWith('de')) return {
    eyebrow: lib ? 'Frag deine Bibliothek' : 'Frag zu diesem Pack',
    heading: lib ? 'Was möchtest du wissen?' : 'Was möchtest du vertiefen?',
    placeholder: lib ? 'Was sagte das Video über…?' : 'Warum hieß es…?',
    submit: 'Fragen',
    loading: 'Suche…',
    packsSingular: 'Pack',
    packsPlural: 'Packs',
    runningNote: lib ? 'Durchsuche deine Bibliothek…' : 'Analysiere diesen Pack…',
    privacyNote: lib
      ? 'Die Frage und eine Zusammenfassung deiner Packs gehen an die KI. Der Rest bleibt auf diesem Gerät.'
      : 'Die Frage und der Inhalt dieses Packs gehen an die KI. Nichts weiter.',
    citations: 'Zitierte Packs',
    errors: {
      empty_library: 'Deine Bibliothek ist leer. Erstelle erst einen Knowledge Pack.',
      question_too_short: 'Die Frage ist zu kurz — ergänze etwas Kontext.',
      question_too_long: 'Die Frage ist zu lang. Fasse sie zusammen.',
      ai_failed: 'Die KI konnte gerade nicht antworten. Versuche es in einem Moment erneut.',
      network: 'Keine Verbindung. Ist Internet da?',
    },
  };
  return {
    eyebrow: lib ? 'Ask your library' : 'Ask about this pack',
    heading: lib ? 'What do you want to know?' : 'What do you want to dig into?',
    placeholder: lib ? 'What did the video say about…?' : 'Why did they say…?',
    submit: 'Ask',
    loading: 'Searching…',
    packsSingular: 'pack',
    packsPlural: 'packs',
    runningNote: lib ? 'Searching across your library…' : 'Analysing this pack…',
    privacyNote: lib
      ? 'The question and a summary of your packs go to the AI. Everything else stays on this device.'
      : 'The question and this pack’s content go to the AI. Nothing more.',
    citations: 'Cited packs',
    errors: {
      empty_library: 'Your library is empty. Create a Knowledge Pack first.',
      question_too_short: 'Question is too short — add a bit more context.',
      question_too_long: 'Question is too long. Trim it.',
      ai_failed: 'The AI could not answer just now. Try again in a moment.',
      network: 'Cannot reach the server. Internet OK?',
    },
  };
}
