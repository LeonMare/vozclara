import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import {
  getFeedback,
  saveFeedback,
  type FeedbackVote,
  type FeedbackReason,
  type PackFeedback,
} from '../lib/feedback';
import type { KnowledgePack } from '../lib/pack';

interface Props {
  pack: KnowledgePack;
}

const REASON_LIST: FeedbackReason[] = [
  'too_shallow',
  'inaccurate',
  'wrong_language',
  'wrong_genre',
  'wrong_mode',
];

/**
 * Compact feedback panel at the tail of a Pack view.
 *
 * Two-state UX:
 *  • Default — plain question + 👍 / 👎 toggle
 *  • If 👎 — reason chips (multi-select) + optional note + Regenerate
 *
 * State persists in IndexedDB per pack so the user can revisit and
 * edit. No network traffic — feedback is private to the device until
 * we wire a real backend.
 *
 * Regenerate is just a link to /new with the same source / mode /
 * output language pre-filled — same pattern as the TranslateSwitcher.
 * The user confirms the re-run with one click; no surprise re-charges.
 */
export function PackFeedback({ pack }: Props) {
  const { locale } = useLocale();
  const [feedback, setFeedback] = useState<PackFeedback | null>(null);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFeedback(pack.id).then((f) => {
      if (cancelled || !f) return;
      setFeedback(f);
      setNote(f.note ?? '');
    });
    return () => { cancelled = true; };
  }, [pack.id]);

  async function handleVote(next: FeedbackVote) {
    // Clicking the same vote twice clears it.
    const target: FeedbackVote | null = feedback?.vote === next ? null : next;
    const updated = await saveFeedback(pack.id, { vote: target });
    setFeedback(updated);
    if (target !== 'not_useful') {
      // Hide note-saved indicator when leaving the not-useful flow.
      setNoteSaved(false);
    }
  }

  async function toggleReason(r: FeedbackReason) {
    const current = feedback?.reasons ?? [];
    const next = current.includes(r) ? current.filter((x) => x !== r) : [...current, r];
    const updated = await saveFeedback(pack.id, { reasons: next });
    setFeedback(updated);
  }

  async function commitNote() {
    const updated = await saveFeedback(pack.id, { note });
    setFeedback(updated);
    setNoteSaved(true);
  }

  const labels = feedbackLabels(locale);
  const vote = feedback?.vote ?? null;
  const reasons = feedback?.reasons ?? [];

  return (
    <section className="mt-14 rounded-card border border-navy/10 bg-white/55 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif text-lg leading-tight text-navy sm:text-xl">
          {labels.heading}
        </h3>
        <div className="flex gap-2">
          <VoteButton
            active={vote === 'useful'}
            onClick={() => handleVote('useful')}
            label={labels.useful}
            icon="up"
            tone="positive"
          />
          <VoteButton
            active={vote === 'not_useful'}
            onClick={() => handleVote('not_useful')}
            label={labels.notUseful}
            icon="down"
            tone="negative"
          />
        </div>
      </div>

      {vote === 'useful' && (
        <p className="mt-4 font-serif italic text-sm text-graphit/65">
          {labels.thanksUseful}
        </p>
      )}

      {vote === 'not_useful' && (
        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-2 font-sans text-[10px] uppercase tracking-widest text-graphit/55">
              {labels.reasonsLabel}
            </div>
            <div className="flex flex-wrap gap-2">
              {REASON_LIST.map((r) => {
                const active = reasons.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleReason(r)}
                    aria-pressed={active}
                    className={[
                      'rounded-card border px-2.5 py-1 font-sans text-xs transition',
                      active
                        ? 'border-navy bg-navy text-creme'
                        : 'border-navy/15 bg-white text-graphit/70 hover:border-gold',
                    ].join(' ')}
                  >
                    {labels.reasons[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="feedback-note"
              className="mb-2 block font-sans text-[10px] uppercase tracking-widest text-graphit/55"
            >
              {labels.noteLabel}
            </label>
            <textarea
              id="feedback-note"
              value={note}
              onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }}
              onBlur={() => { if (note !== (feedback?.note ?? '')) commitNote(); }}
              placeholder={labels.notePlaceholder}
              rows={2}
              className="w-full rounded-card border border-navy/15 bg-white px-3 py-2 font-sans text-sm text-graphit outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
            {noteSaved && (
              <p className="mt-1 font-sans text-[11px] italic text-graphit/55">
                {labels.noteSaved}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/8 pt-4">
            <p className="font-serif italic text-sm text-graphit/65">
              {labels.regenerateHint}
            </p>
            <Link
              to={`/new?v=${pack.source.videoId}&lang=${pack.outputLang}&mode=${pack.mode}`}
              className="rounded-card border border-navy/20 bg-white px-3 py-1.5 font-sans text-sm text-navy transition hover:border-gold hover:text-navy"
            >
              {labels.regenerate}
            </Link>
          </div>
        </div>
      )}

      <p className="mt-5 border-t border-navy/8 pt-3 font-sans text-[11px] italic text-graphit/45">
        {labels.privacyNote}
      </p>
    </section>
  );
}

/* ─── Vote button ──────────────────────────────────────────────────────── */

function VoteButton({
  active,
  onClick,
  label,
  icon,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: 'up' | 'down';
  tone: 'positive' | 'negative';
}) {
  const activeClass = tone === 'positive'
    ? 'border-gold bg-gold/15 text-navy'
    : 'border-navy/35 bg-navy/8 text-navy';
  const idleClass = tone === 'positive'
    ? 'border-navy/15 bg-white text-graphit/65 hover:border-gold'
    : 'border-navy/15 bg-white text-graphit/65 hover:border-navy/40';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'inline-flex items-center gap-2 rounded-card border px-3 py-1.5 font-sans text-sm transition',
        active ? activeClass : idleClass,
      ].join(' ')}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        {icon === 'up' ? (
          // Editorial thumb-up — a stylised pointing chevron, not the emoji.
          <path
            d="M3 14 V8 L8 2 L9 2.5 V6 L13 6 L12.5 14 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M3 2 V8 L8 14 L9 13.5 V10 L13 10 L12.5 2 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {label}
    </button>
  );
}

/* ─── Localised strings ────────────────────────────────────────────────── */

function feedbackLabels(locale: string) {
  if (locale.startsWith('es')) return {
    heading: '¿Te ha resultado útil este Knowledge Pack?',
    useful: 'Sí',
    notUseful: 'No tanto',
    thanksUseful: 'Gracias por la señal. Tu valoración se guarda localmente en este dispositivo.',
    reasonsLabel: 'Qué falló',
    noteLabel: 'Comentario',
    notePlaceholder: 'Lo que mejorarías en una frase…',
    noteSaved: 'Guardado.',
    regenerateHint: '¿Regenerar el Pack con los mismos parámetros?',
    regenerate: 'Regenerar →',
    privacyNote: 'Tu feedback se guarda en tu navegador. Nada se envía a un servidor.',
    reasons: {
      too_shallow: 'Demasiado superficial',
      inaccurate: 'Información imprecisa',
      wrong_language: 'Idioma incorrecto',
      wrong_genre: 'Género mal detectado',
      wrong_mode: 'Modo poco adecuado',
    } satisfies Record<FeedbackReason, string>,
  };
  if (locale.startsWith('pt')) return {
    heading: 'Este Knowledge Pack foi-lhe útil?',
    useful: 'Sim',
    notUseful: 'Nem por isso',
    thanksUseful: 'Obrigado pelo sinal. A sua avaliação fica guardada localmente neste dispositivo.',
    reasonsLabel: 'O que falhou',
    noteLabel: 'Comentário',
    notePlaceholder: 'O que melhoraria numa frase…',
    noteSaved: 'Guardado.',
    regenerateHint: 'Regenerar o Pack com os mesmos parâmetros?',
    regenerate: 'Regenerar →',
    privacyNote: 'O seu feedback fica guardado no navegador. Nada vai para um servidor.',
    reasons: {
      too_shallow: 'Demasiado superficial',
      inaccurate: 'Informação imprecisa',
      wrong_language: 'Idioma errado',
      wrong_genre: 'Género mal detetado',
      wrong_mode: 'Modo pouco adequado',
    } satisfies Record<FeedbackReason, string>,
  };
  if (locale.startsWith('de')) return {
    heading: 'War dieser Knowledge Pack hilfreich?',
    useful: 'Ja',
    notUseful: 'Nicht wirklich',
    thanksUseful: 'Danke für die Rückmeldung. Deine Bewertung wird lokal auf diesem Gerät gespeichert.',
    reasonsLabel: 'Was war das Problem',
    noteLabel: 'Kommentar',
    notePlaceholder: 'Was würdest du verbessern, in einem Satz…',
    noteSaved: 'Gespeichert.',
    regenerateHint: 'Pack mit gleichen Parametern neu erzeugen?',
    regenerate: 'Neu erzeugen →',
    privacyNote: 'Dein Feedback bleibt im Browser. Nichts wird an einen Server gesendet.',
    reasons: {
      too_shallow: 'Zu oberflächlich',
      inaccurate: 'Inhaltlich ungenau',
      wrong_language: 'Falsche Sprache',
      wrong_genre: 'Genre falsch erkannt',
      wrong_mode: 'Modus passt nicht',
    } satisfies Record<FeedbackReason, string>,
  };
  return {
    heading: 'Was this Knowledge Pack useful?',
    useful: 'Yes',
    notUseful: 'Not really',
    thanksUseful: 'Thanks for the signal. Your rating is stored locally on this device.',
    reasonsLabel: 'What went wrong',
    noteLabel: 'Comment',
    notePlaceholder: 'One sentence on what you would improve…',
    noteSaved: 'Saved.',
    regenerateHint: 'Regenerate the Pack with the same parameters?',
    regenerate: 'Regenerate →',
    privacyNote: 'Your feedback stays in your browser. Nothing is sent to a server.',
    reasons: {
      too_shallow: 'Too shallow',
      inaccurate: 'Inaccurate',
      wrong_language: 'Wrong language',
      wrong_genre: 'Wrong genre detected',
      wrong_mode: 'Wrong mode for content',
    } satisfies Record<FeedbackReason, string>,
  };
}
