import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import {
  buildReviewQueue,
  rateCard,
  syncCardsFromLibrary,
  type ReviewCard,
  type ReviewQueue,
  type Rating,
  type StreakState,
} from '../lib/srs';

/**
 * /review — the daily spaced-repetition session.
 *
 * On mount: sync new vocab from the library, then build a queue of
 * due + fresh cards (default 10 new/day). One card at a time, two
 * stages — "see word" → "see answer + rate". The rating advances
 * SM-2 (see lib/srs.ts) and writes the next due date.
 *
 * No timers, no animations beyond a soft fade — the engine is the
 * algorithm, not the chrome.
 */
export function ReviewPage() {
  const { locale } = useLocale();
  const navigate = useNavigate();
  const labels = useMemo(() => reviewLabels(locale), [locale]);

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<ReviewQueue | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    let cancel = false;
    (async () => {
      // Seed cards for any vocab the user has saved but never reviewed.
      await syncCardsFromLibrary();
      const q = await buildReviewQueue();
      if (cancel) return;
      setQueue(q);
      setStreak(q.streak);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const current: ReviewCard | undefined = queue?.cards[index];
  const done = !!queue && index >= queue.cards.length;

  const rate = useCallback(
    async (rating: Rating) => {
      if (!current) return;
      const { streak: nextStreak } = await rateCard(current.id, rating);
      setStreak(nextStreak);
      setReviewed((n) => n + 1);
      setRevealed(false);
      setIndex((i) => i + 1);
    },
    [current],
  );

  // Keyboard shortcuts — Anki muscle memory.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!revealed) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setRevealed(true);
        }
        return;
      }
      if (e.key === '1') void rate('again');
      else if (e.key === '2') void rate('hard');
      else if (e.key === '3') void rate('good');
      else if (e.key === '4') void rate('easy');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, revealed, rate]);

  if (loading) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 sm:px-8">
          <p className="font-sans text-sm text-graphit/60">{labels.loading}</p>
        </div>
      </main>
    );
  }

  if (!queue || queue.cards.length === 0) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:px-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
            {labels.eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-3xl text-navy sm:text-4xl">{labels.emptyTitle}</h1>
          <p className="mt-4 font-sans text-base text-graphit/70">{labels.emptyBody}</p>
          <Link
            to="/library"
            className="mt-8 inline-block rounded-card bg-navy px-5 py-2.5 font-sans text-sm text-creme transition hover:bg-graphit"
          >
            {labels.backToLibrary}
          </Link>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:px-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
            {labels.eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-3xl text-navy sm:text-4xl">{labels.doneTitle}</h1>
          <p className="mt-4 font-sans text-base text-graphit/70">
            {labels.doneBody(reviewed)}
          </p>

          {streak && (
            <div className="mx-auto mt-10 max-w-sm rounded-card border border-navy/15 bg-white px-6 py-5">
              <p className="font-sans text-[10px] uppercase tracking-widest text-graphit/55">
                {labels.streakLabel}
              </p>
              <p className="mt-2 font-serif text-3xl text-navy">{streak.current}</p>
              <p className="mt-1 font-sans text-xs text-graphit/55">
                {labels.streakSub(streak.longest)}
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="rounded-card border border-navy/15 bg-white px-5 py-2.5 font-sans text-sm text-navy transition hover:border-gold"
            >
              {labels.backToLibrary}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Active review — one card.
  const card = current!;
  const progress = `${index + 1} / ${queue.cards.length}`;

  return (
    <main className="bg-creme paper">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
        <div className="flex items-center justify-between font-sans text-[11px] uppercase tracking-widest text-graphit/55">
          <span>{labels.eyebrow}</span>
          <span>{progress}</span>
        </div>

        {/* Card */}
        <div className="mt-6 rounded-card border border-navy/15 bg-white px-6 py-10 text-center shadow-card sm:px-10 sm:py-14">
          <p className="font-sans text-[10px] uppercase tracking-widest text-graphit/40">
            {card.sourceLang.toUpperCase()}
          </p>
          <h1 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">{card.word}</h1>
          {card.partOfSpeech && (
            <p className="mt-2 font-sans text-xs uppercase tracking-widest text-graphit/55">
              {card.partOfSpeech}
            </p>
          )}

          {revealed && (
            <>
              <hr className="mx-auto my-7 w-12 border-t border-gold" />
              <p className="font-sans text-[10px] uppercase tracking-widest text-graphit/40">
                {card.outputLang.toUpperCase()}
              </p>
              <p className="mt-2 font-serif text-2xl text-navy sm:text-3xl">{card.translation}</p>
              {card.context && (
                <p className="mt-5 font-serif italic leading-relaxed text-graphit/70 sm:text-lg">
                  {card.context}
                </p>
              )}
              <p className="mt-6 font-sans text-[10px] uppercase tracking-widest text-graphit/40">
                {labels.fromPack}: {card.packTitle}
              </p>
            </>
          )}
        </div>

        {/* Controls */}
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-6 w-full rounded-card bg-navy px-5 py-3 font-sans text-sm text-creme transition hover:bg-graphit"
          >
            {labels.showAnswer} <span className="opacity-60">· {labels.space}</span>
          </button>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <RatingButton tone="again" hint="1" onClick={() => rate('again')}>
              {labels.again}
            </RatingButton>
            <RatingButton tone="hard" hint="2" onClick={() => rate('hard')}>
              {labels.hard}
            </RatingButton>
            <RatingButton tone="good" hint="3" onClick={() => rate('good')}>
              {labels.good}
            </RatingButton>
            <RatingButton tone="easy" hint="4" onClick={() => rate('easy')}>
              {labels.easy}
            </RatingButton>
          </div>
        )}

        {streak && streak.current > 0 && (
          <p className="mt-6 text-center font-sans text-xs text-graphit/55">
            {labels.streakLine(streak.current)}
          </p>
        )}
      </div>
    </main>
  );
}

function RatingButton({
  tone,
  hint,
  onClick,
  children,
}: {
  tone: 'again' | 'hard' | 'good' | 'easy';
  hint: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const toneClass = {
    again: 'border-red-300/50 bg-white text-red-700 hover:border-red-500',
    hard: 'border-orange-300/50 bg-white text-orange-700 hover:border-orange-500',
    good: 'border-navy/15 bg-white text-navy hover:border-gold',
    easy: 'border-emerald-300/50 bg-white text-emerald-700 hover:border-emerald-500',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-card border px-3 py-3 font-sans text-sm transition ${toneClass}`}
    >
      <span>{children}</span>
      <span className="ml-1.5 text-[10px] opacity-50">{hint}</span>
    </button>
  );
}

/* ─── i18n ────────────────────────────────────────────────────────── */

function reviewLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: 'Repaso — Voz Clara',
    headDescription: 'Repaso espaciado del vocabulario de tu biblioteca.',
    eyebrow: 'REPASO',
    loading: 'Cargando…',
    emptyTitle: 'Nada que repasar hoy.',
    emptyBody: 'Cuando guardes Knowledge Packs con vocabulario, las palabras aparecerán aquí en intervalos crecientes.',
    backToLibrary: 'Volver a la biblioteca',
    doneTitle: 'Sesión terminada.',
    doneBody: (n: number) => `Has repasado ${n} ${n === 1 ? 'tarjeta' : 'tarjetas'}. Vuelve mañana para reforzar lo aprendido.`,
    streakLabel: 'Racha',
    streakSub: (longest: number) => `Récord: ${longest} ${longest === 1 ? 'día' : 'días'}`,
    streakLine: (n: number) => `Racha actual: ${n} ${n === 1 ? 'día' : 'días'}.`,
    fromPack: 'De',
    showAnswer: 'Mostrar respuesta',
    space: 'Espacio',
    again: 'De nuevo',
    hard: 'Difícil',
    good: 'Bien',
    easy: 'Fácil',
  };
  if (locale.startsWith('pt')) return {
    headTitle: 'Revisão — Voz Clara',
    headDescription: 'Revisão espaçada do vocabulário da tua biblioteca.',
    eyebrow: 'REVISÃO',
    loading: 'A carregar…',
    emptyTitle: 'Nada para rever hoje.',
    emptyBody: 'Quando guardares Knowledge Packs com vocabulário, as palavras aparecerão aqui em intervalos crescentes.',
    backToLibrary: 'Voltar à biblioteca',
    doneTitle: 'Sessão terminada.',
    doneBody: (n: number) => `Reviste ${n} ${n === 1 ? 'cartão' : 'cartões'}. Volta amanhã para reforçar o que aprendeste.`,
    streakLabel: 'Sequência',
    streakSub: (longest: number) => `Recorde: ${longest} ${longest === 1 ? 'dia' : 'dias'}`,
    streakLine: (n: number) => `Sequência atual: ${n} ${n === 1 ? 'dia' : 'dias'}.`,
    fromPack: 'De',
    showAnswer: 'Mostrar resposta',
    space: 'Espaço',
    again: 'De novo',
    hard: 'Difícil',
    good: 'Bom',
    easy: 'Fácil',
  };
  if (locale.startsWith('de')) return {
    headTitle: 'Wiederholung — Voz Clara',
    headDescription: 'Spaced Repetition für das Vokabular deiner Bibliothek.',
    eyebrow: 'WIEDERHOLUNG',
    loading: 'Lädt…',
    emptyTitle: 'Heute nichts zu wiederholen.',
    emptyBody: 'Sobald du Knowledge Packs mit Vokabular speicherst, erscheinen die Wörter hier in zunehmenden Intervallen.',
    backToLibrary: 'Zurück zur Bibliothek',
    doneTitle: 'Sitzung beendet.',
    doneBody: (n: number) => `Du hast ${n} ${n === 1 ? 'Karte' : 'Karten'} wiederholt. Komm morgen wieder, um das Gelernte zu festigen.`,
    streakLabel: 'Streak',
    streakSub: (longest: number) => `Rekord: ${longest} ${longest === 1 ? 'Tag' : 'Tage'}`,
    streakLine: (n: number) => `Aktueller Streak: ${n} ${n === 1 ? 'Tag' : 'Tage'}.`,
    fromPack: 'Aus',
    showAnswer: 'Antwort zeigen',
    space: 'Leertaste',
    again: 'Nochmal',
    hard: 'Schwer',
    good: 'Gut',
    easy: 'Leicht',
  };
  return {
    headTitle: 'Review — Voz Clara',
    headDescription: 'Spaced repetition for your library vocabulary.',
    eyebrow: 'REVIEW',
    loading: 'Loading…',
    emptyTitle: 'Nothing to review today.',
    emptyBody: 'Once you save Knowledge Packs with vocabulary, those words will appear here on rising intervals.',
    backToLibrary: 'Back to library',
    doneTitle: 'Session complete.',
    doneBody: (n: number) => `You reviewed ${n} ${n === 1 ? 'card' : 'cards'}. Come back tomorrow to lock it in.`,
    streakLabel: 'Streak',
    streakSub: (longest: number) => `Best: ${longest} ${longest === 1 ? 'day' : 'days'}`,
    streakLine: (n: number) => `Current streak: ${n} ${n === 1 ? 'day' : 'days'}.`,
    fromPack: 'From',
    showAnswer: 'Show answer',
    space: 'Space',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
  };
}
