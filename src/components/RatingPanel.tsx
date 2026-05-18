import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { useAuth } from '../hooks/useAuth';
import { getBrainId } from '../lib/pack';
import {
  fetchAggregate,
  fetchMyVote,
  submitRating,
  averageStars,
  approvalPercent,
  type RatingAggregate,
  type MyVote,
  type RatingSignals,
} from '../lib/rating';

/**
 * RatingPanel — the Michelin-Rating UI on a Pack page.
 *
 * Anonymous-first by design:
 *   • 👍 / 👎 + four 1-tap signals work without an account
 *   • ⭐ stars + text review are gated to signed-in users with a
 *     quiet "sign in to rate" link below
 *
 * Loads the aggregate + the caller's own existing vote on mount so
 * the panel always opens reflecting current state (not blank, not
 * with a fresh "no votes" line). All mutations optimistically update
 * the local aggregate via the worker's response payload so the user
 * sees their vote land instantly.
 *
 * Identification: signed-in users vote as their userId, anonymous
 * users vote as their brainId. Same brainId can't double-vote — the
 * worker overwrites the previous record and diffs the aggregate.
 */
export function RatingPanel({
  videoId,
  videoTitle,
}: {
  videoId: string;
  videoTitle?: string;
}) {
  const { locale } = useLocale();
  const labels = ratingLabels(locale);
  const { user } = useAuth();
  const brainId = getBrainId();

  const [agg, setAgg] = useState<RatingAggregate | null>(null);
  const [myVote, setMyVote] = useState<MyVote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState('');

  // Load aggregate + caller's existing vote on mount. We hit both in
  // parallel — the aggregate is the heavier read but neither blocks
  // the other in the UI.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [a, v] = await Promise.all([
        fetchAggregate(videoId).catch(() => null),
        fetchMyVote({ videoId, brainId }),
      ]);
      if (cancelled) return;
      if (a) setAgg(a);
      if (v) {
        setMyVote(v);
        setReviewText(v.review ?? '');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoId, brainId]);

  // Vote helpers — submit shares a single network round-trip pattern.
  // `partial` lets each control type only mutate the field it owns
  // (e.g. clicking thumb shouldn't reset the stars).
  async function commit(partial: {
    thumb?: 'up' | 'down' | null;
    stars?: number | null;
    signals?: Partial<RatingSignals>;
    review?: string;
  }) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const merged = {
        videoId,
        brainId,
        videoTitle,
        thumb: partial.thumb ?? myVote?.thumb ?? null,
        stars: user ? (partial.stars ?? myVote?.stars ?? null) : null,
        signals: {
          mindBlowing: false,
          confusing: false,
          misleading: false,
          tooLong: false,
          ...(myVote?.signals ?? {}),
          ...(partial.signals ?? {}),
        },
        review: user ? (partial.review ?? myVote?.review) : undefined,
      };
      const { aggregate, vote } = await submitRating(merged);
      setAgg(aggregate);
      setMyVote(vote);
    } catch {
      setError(labels.errSubmit);
    } finally {
      setSubmitting(false);
    }
  }

  // Toggle thumb — clicking the active thumb clears the vote (null).
  function onThumb(target: 'up' | 'down') {
    void commit({ thumb: myVote?.thumb === target ? null : target });
  }

  function onSignal(key: keyof RatingSignals) {
    const next = !(myVote?.signals?.[key]);
    void commit({ signals: { [key]: next } });
  }

  function onStars(value: number) {
    if (!user) return;
    void commit({ stars: myVote?.stars === value ? null : value });
  }

  function onSaveReview() {
    if (!user) return;
    void commit({ review: reviewText.trim() });
    setShowReview(false);
  }

  // Display values — fall back to 0/no-stars while loading.
  const up = agg?.up ?? 0;
  const down = agg?.down ?? 0;
  const total = up + down;
  const approval = agg ? approvalPercent(agg) : null;
  const stars = agg ? averageStars(agg) : null;

  return (
    <section className="mt-6 rounded-card border border-navy/10 bg-white p-5 sm:p-6">
      {/* Eyebrow + summary line */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
          § {labels.eyebrow}
        </div>
        <div className="font-sans text-[12px] text-graphit/65">
          {total === 0 ? (
            <span className="italic text-graphit/50">{labels.beTheFirst}</span>
          ) : (
            <>
              <span className="font-medium text-navy">{total}</span>{' '}
              {total === 1 ? labels.voteSingular : labels.votePlural}
              {approval !== null && (
                <>
                  {' · '}
                  <span className="font-medium text-navy">{approval}%</span> {labels.approvalSuffix}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="mt-3 h-px w-12 bg-gold/60" aria-hidden />

      {/* Thumbs row */}
      <div className="mt-5 flex gap-3">
        <ThumbButton
          active={myVote?.thumb === 'up'}
          count={up}
          onClick={() => onThumb('up')}
          disabled={submitting}
          glyph="up"
          label={labels.thumbUp}
        />
        <ThumbButton
          active={myVote?.thumb === 'down'}
          count={down}
          onClick={() => onThumb('down')}
          disabled={submitting}
          glyph="down"
          label={labels.thumbDown}
        />
      </div>

      {/* Signals — 4 quick-tap chips */}
      <div className="mt-5">
        <div className="font-sans text-[11px] uppercase tracking-widest text-graphit/55">
          {labels.signalsHeading}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <SignalChip
            active={!!myVote?.signals?.mindBlowing}
            glyph="💡"
            label={labels.signalMindBlowing}
            count={agg?.signals?.mindBlowing ?? 0}
            onClick={() => onSignal('mindBlowing')}
            disabled={submitting}
          />
          <SignalChip
            active={!!myVote?.signals?.confusing}
            glyph="🤔"
            label={labels.signalConfusing}
            count={agg?.signals?.confusing ?? 0}
            onClick={() => onSignal('confusing')}
            disabled={submitting}
          />
          <SignalChip
            active={!!myVote?.signals?.misleading}
            glyph="🚫"
            label={labels.signalMisleading}
            count={agg?.signals?.misleading ?? 0}
            onClick={() => onSignal('misleading')}
            disabled={submitting}
          />
          <SignalChip
            active={!!myVote?.signals?.tooLong}
            glyph="⏱"
            label={labels.signalTooLong}
            count={agg?.signals?.tooLong ?? 0}
            onClick={() => onSignal('tooLong')}
            disabled={submitting}
          />
        </div>
      </div>

      {/* Stars — signed-in only. Anonymous visitors see a quiet sign-in
          nudge with no pressure, no modal hijack. */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="font-sans text-[11px] uppercase tracking-widest text-graphit/55">
            {labels.starsHeading}
          </div>
          {stars !== null && (
            <div className="font-serif text-sm text-navy">
              <span className="text-gold">★</span> {stars.toFixed(1)}{' '}
              <span className="font-sans text-[11px] text-graphit/55">
                · {agg!.starCount} {agg!.starCount === 1 ? labels.starsCountSingular : labels.starsCountPlural}
              </span>
            </div>
          )}
        </div>
        {user ? (
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = (myVote?.stars ?? 0) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onStars(n)}
                  disabled={submitting}
                  aria-label={`${n} ${n === 1 ? labels.starsCountSingular : labels.starsCountPlural}`}
                  className={[
                    'text-2xl leading-none transition',
                    filled ? 'text-gold' : 'text-navy/20 hover:text-gold/60',
                  ].join(' ')}
                >
                  ★
                </button>
              );
            })}
            {myVote?.stars && (
              <button
                type="button"
                onClick={() => onStars(myVote.stars!)}
                disabled={submitting}
                className="ml-2 self-center font-sans text-[11px] text-graphit/55 underline-offset-4 hover:text-navy hover:underline"
              >
                {labels.starsClear}
              </button>
            )}
          </div>
        ) : (
          <p className="mt-2 font-sans text-sm leading-relaxed text-graphit/65">
            <Link
              to={`/signin?next=${encodeURIComponent(window.location.pathname)}`}
              className="text-navy underline-offset-4 hover:underline"
            >
              {labels.signInToStar}
            </Link>{' '}
            {labels.signInToStarSuffix}
          </p>
        )}
      </div>

      {/* Text review — collapsed by default. Signed-in only. */}
      {user && (
        <div className="mt-5 border-t border-navy/8 pt-4">
          {showReview ? (
            <>
              <label htmlFor="rating-review" className="sr-only">
                {labels.reviewLabel}
              </label>
              <textarea
                id="rating-review"
                rows={3}
                maxLength={600}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={labels.reviewPlaceholder}
                className="w-full rounded-card border border-navy/15 bg-white px-3 py-2 font-serif text-sm text-graphit placeholder:text-graphit/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <div className="mt-2 flex items-baseline justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReview(false);
                    setReviewText(myVote?.review ?? '');
                  }}
                  className="font-sans text-xs text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
                >
                  {labels.reviewCancel}
                </button>
                <button
                  type="button"
                  onClick={onSaveReview}
                  disabled={submitting}
                  className="rounded-card bg-navy px-4 py-1.5 font-sans text-xs text-creme transition hover:bg-navy/90 disabled:opacity-60"
                >
                  {labels.reviewSave}
                </button>
              </div>
            </>
          ) : myVote?.review ? (
            <div>
              <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
                {labels.yourReview}
              </div>
              <p className="mt-1.5 font-serif italic leading-relaxed text-graphit/80">
                «{myVote.review}»
              </p>
              <button
                type="button"
                onClick={() => setShowReview(true)}
                className="mt-2 font-sans text-xs text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
              >
                {labels.reviewEdit}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="font-sans text-xs text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
            >
              + {labels.reviewAdd}
            </button>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 font-sans text-[12px] italic text-rose-700"
        >
          {error}
        </p>
      )}
    </section>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function ThumbButton({
  active,
  count,
  onClick,
  disabled,
  glyph,
  label,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  disabled: boolean;
  glyph: 'up' | 'down';
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      className={[
        'group flex flex-1 items-center justify-center gap-2.5 rounded-card border px-4 py-2.5 font-sans text-sm transition',
        active
          ? 'border-gold bg-gold/15 text-navy'
          : 'border-navy/15 bg-white text-graphit/70 hover:border-gold/60 hover:text-navy',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      <ThumbGlyph dir={glyph} active={active} />
      <span className="font-medium tabular-nums">{count}</span>
    </button>
  );
}

function ThumbGlyph({ dir, active }: { dir: 'up' | 'down'; active: boolean }) {
  // Editorial hand-drawn thumbs — flips for down via transform.
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      style={{ transform: dir === 'down' ? 'rotate(180deg)' : undefined }}
      aria-hidden
    >
      <path
        d="M5 8 L5 14 L4 14 L4 8 Z M6 8 L6 14 L13 14 C13.5 14 14 13.5 14 13 L14.8 9 C14.9 8.4 14.4 8 13.8 8 L10 8 L10.6 5.4 C10.7 4.7 10.2 4 9.5 4 L8.8 4 L6 7.5 Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SignalChip({
  active,
  glyph,
  label,
  count,
  onClick,
  disabled,
}: {
  active: boolean;
  glyph: string;
  label: string;
  count: number;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[12px] transition',
        active
          ? 'border-gold bg-gold/12 text-navy'
          : 'border-navy/15 bg-white text-graphit/70 hover:border-gold/60 hover:text-navy',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      <span className="text-[14px] leading-none">{glyph}</span>
      <span>{label}</span>
      {count > 0 && (
        <span className="ml-0.5 text-graphit/45 tabular-nums">· {count}</span>
      )}
    </button>
  );
}

/* ─── Localised labels ───────────────────────────────────────────── */

function ratingLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'Valoración',
    beTheFirst: 'Sé el primero en valorarlo.',
    voteSingular: 'voto',
    votePlural: 'votos',
    approvalSuffix: 'lo recomiendan',
    thumbUp: 'Me gusta',
    thumbDown: 'No me gusta',
    signalsHeading: 'En una sola palabra',
    signalMindBlowing: 'Brillante',
    signalConfusing: 'Confuso',
    signalMisleading: 'Engañoso',
    signalTooLong: 'Demasiado largo',
    starsHeading: 'Tu valoración',
    starsCountSingular: 'estrella',
    starsCountPlural: 'estrellas',
    starsClear: 'Quitar',
    signInToStar: 'Inicia sesión',
    signInToStarSuffix: 'para valorar con estrellas y dejar reseña.',
    reviewLabel: 'Tu reseña',
    reviewPlaceholder: 'Una frase honesta — qué te llevas de este vídeo.',
    reviewAdd: 'Añadir reseña',
    reviewEdit: 'Editar',
    reviewCancel: 'Cancelar',
    reviewSave: 'Guardar',
    yourReview: 'Tu reseña',
    errSubmit: 'No se pudo enviar la valoración. Reintenta.',
  };
  if (locale.startsWith('pt')) return {
    eyebrow: 'Avaliação',
    beTheFirst: 'Sê o primeiro a avaliar.',
    voteSingular: 'voto',
    votePlural: 'votos',
    approvalSuffix: 'recomendam',
    thumbUp: 'Gosto',
    thumbDown: 'Não gosto',
    signalsHeading: 'Numa palavra',
    signalMindBlowing: 'Brilhante',
    signalConfusing: 'Confuso',
    signalMisleading: 'Enganador',
    signalTooLong: 'Demasiado longo',
    starsHeading: 'A tua avaliação',
    starsCountSingular: 'estrela',
    starsCountPlural: 'estrelas',
    starsClear: 'Tirar',
    signInToStar: 'Inicia sessão',
    signInToStarSuffix: 'para avaliar com estrelas e deixar reseña.',
    reviewLabel: 'A tua reseña',
    reviewPlaceholder: 'Uma frase honesta — o que levas deste vídeo.',
    reviewAdd: 'Adicionar reseña',
    reviewEdit: 'Editar',
    reviewCancel: 'Cancelar',
    reviewSave: 'Guardar',
    yourReview: 'A tua reseña',
    errSubmit: 'Não foi possível enviar a avaliação. Tenta novamente.',
  };
  if (locale.startsWith('de')) return {
    eyebrow: 'Bewertung',
    beTheFirst: 'Sei der Erste, der bewertet.',
    voteSingular: 'Stimme',
    votePlural: 'Stimmen',
    approvalSuffix: 'positiv',
    thumbUp: 'Gefällt mir',
    thumbDown: 'Gefällt mir nicht',
    signalsHeading: 'In einem Wort',
    signalMindBlowing: 'Brillant',
    signalConfusing: 'Verwirrend',
    signalMisleading: 'Irreführend',
    signalTooLong: 'Zu lang',
    starsHeading: 'Deine Bewertung',
    starsCountSingular: 'Stern',
    starsCountPlural: 'Sterne',
    starsClear: 'Entfernen',
    signInToStar: 'Anmelden',
    signInToStarSuffix: 'um Sterne zu vergeben und eine Rezension zu hinterlassen.',
    reviewLabel: 'Deine Rezension',
    reviewPlaceholder: 'Ein ehrlicher Satz — was du aus diesem Video mitnimmst.',
    reviewAdd: 'Rezension hinzufügen',
    reviewEdit: 'Bearbeiten',
    reviewCancel: 'Abbrechen',
    reviewSave: 'Speichern',
    yourReview: 'Deine Rezension',
    errSubmit: 'Bewertung konnte nicht gesendet werden. Versuch es erneut.',
  };
  return {
    eyebrow: 'Rating',
    beTheFirst: 'Be the first to rate.',
    voteSingular: 'vote',
    votePlural: 'votes',
    approvalSuffix: 'liked it',
    thumbUp: 'Like',
    thumbDown: 'Dislike',
    signalsHeading: 'In one word',
    signalMindBlowing: 'Brilliant',
    signalConfusing: 'Confusing',
    signalMisleading: 'Misleading',
    signalTooLong: 'Too long',
    starsHeading: 'Your rating',
    starsCountSingular: 'star',
    starsCountPlural: 'stars',
    starsClear: 'Clear',
    signInToStar: 'Sign in',
    signInToStarSuffix: 'to rate with stars and leave a review.',
    reviewLabel: 'Your review',
    reviewPlaceholder: 'One honest sentence — what you take from this video.',
    reviewAdd: 'Add review',
    reviewEdit: 'Edit',
    reviewCancel: 'Cancel',
    reviewSave: 'Save',
    yourReview: 'Your review',
    errSubmit: "Couldn't submit your rating. Try again.",
  };
}
