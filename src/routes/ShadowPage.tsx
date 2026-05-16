import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import {
  activeView,
  getPack,
  getTranscript,
  type KnowledgePack,
  type Segment,
} from '../lib/pack';
import { getSamplePack } from '../lib/samplePack';
import {
  capabilities,
  recordOnce,
  RecognitionError,
  scoreMatch,
  speakText,
  type MatchResult,
} from '../lib/shadowing';

/**
 * /pack/:id/shadow — guided pronunciation drill.
 *
 *   1. Pick a "sentence" from the pack — transcript when available,
 *      otherwise vocabulary contexts (always present, even for samples).
 *   2. Listen: TTS plays the source-language sentence.
 *   3. Speak: SpeechRecognition records the user's attempt.
 *   4. Score: word + edit distance, mapped to great / good / try-again.
 *   5. Next sentence, with a running tally at the top.
 *
 * Everything is on-device. Nothing the user says ever leaves their
 * browser — Web Speech runs locally or via the browser's own vendor
 * cloud, not through any VozClara endpoint.
 */
export function ShadowPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { locale } = useLocale();
  const labels = useMemo(() => shadowLabels(locale), [locale]);

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

  const [pack, setPack] = useState<KnowledgePack | null>(null);
  const [sentences, setSentences] = useState<ShadowSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [spoken, setSpoken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<MatchResult['verdict']>>([]);
  const abortRef = useRef<AbortController | null>(null);

  const caps = useMemo(() => capabilities(), []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const p = (await getPack(id)) ?? getSamplePack(id) ?? null;
      if (cancel || !p) {
        setLoading(false);
        return;
      }
      let transcriptSegments: Segment[] | undefined;
      if (p.transcriptKey) {
        const data = await getTranscript(p.transcriptKey);
        transcriptSegments = data?.segments;
      }
      const list = extractShadowSentences(p, transcriptSegments);
      if (cancel) return;
      setPack(p);
      setSentences(list);
      setLoading(false);
    })();
    return () => {
      cancel = true;
      abortRef.current?.abort();
    };
  }, [id]);

  const current = sentences[idx];

  const handleListen = useCallback(async () => {
    if (!current || !pack || !caps.speak) return;
    setError(null);
    setPhase('listening');
    try {
      await speakText(current.text, pack.sourceLang, { rate: 0.9 });
    } catch {
      setError(labels.errorTts);
    } finally {
      setPhase('idle');
    }
  }, [current, pack, caps.speak, labels.errorTts]);

  const handleSpeak = useCallback(async () => {
    if (!current || !pack || !caps.recognize) return;
    setError(null);
    setMatch(null);
    setSpoken(null);
    setPhase('recording');

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const result = await recordOnce(pack.sourceLang, ctrl.signal, 8000);
      const m = scoreMatch(current.text, result.transcript);
      setSpoken(result.transcript);
      setMatch(m);
      setResults((prev) => [...prev, m.verdict]);
      setPhase('scored');
    } catch (err) {
      if (err instanceof RecognitionError) {
        if (err.code === 'aborted') {
          setPhase('idle');
          return;
        }
        if (err.code === 'no_speech') setError(labels.errorNoSpeech);
        else if (err.code === 'not_allowed') setError(labels.errorPermission);
        else if (err.code === 'audio_capture') setError(labels.errorMic);
        else setError(labels.errorRecognize);
      } else {
        setError(labels.errorRecognize);
      }
      setPhase('idle');
    }
  }, [current, pack, caps.recognize, labels]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setPhase('idle');
  }, []);

  const handleNext = useCallback(() => {
    setMatch(null);
    setSpoken(null);
    setError(null);
    setPhase('idle');
    setIdx((i) => i + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setMatch(null);
    setSpoken(null);
    setError(null);
    setPhase('idle');
  }, []);

  /* ─── Render ────────────────────────────────────────────────── */

  if (loading) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 sm:px-8">
          <p className="font-sans text-sm text-graphit/60">{labels.loading}</p>
        </div>
      </main>
    );
  }

  if (!pack) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:px-8">
          <h1 className="font-serif text-3xl text-navy">{labels.packNotFound}</h1>
          <Link
            to="/library"
            className="mt-6 inline-block rounded-card border border-navy/15 bg-white px-5 py-2.5 font-sans text-sm text-navy transition hover:border-gold"
          >
            {labels.backToLibrary}
          </Link>
        </div>
      </main>
    );
  }

  if (!caps.speak && !caps.recognize) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:px-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
            {labels.eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-3xl text-navy sm:text-4xl">
            {labels.unsupportedTitle}
          </h1>
          <p className="mt-4 font-sans text-base text-graphit/70">{labels.unsupportedBody}</p>
          <Link
            to={`/pack/${id}`}
            className="mt-8 inline-block rounded-card border border-navy/15 bg-white px-5 py-2.5 font-sans text-sm text-navy transition hover:border-gold"
          >
            {labels.backToPack}
          </Link>
        </div>
      </main>
    );
  }

  if (sentences.length === 0) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:px-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
            {labels.eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-3xl text-navy sm:text-4xl">
            {labels.emptyTitle}
          </h1>
          <p className="mt-4 font-sans text-base text-graphit/70">{labels.emptyBody}</p>
          <Link
            to={`/pack/${id}`}
            className="mt-8 inline-block rounded-card border border-navy/15 bg-white px-5 py-2.5 font-sans text-sm text-navy transition hover:border-gold"
          >
            {labels.backToPack}
          </Link>
        </div>
      </main>
    );
  }

  // End screen — all sentences completed.
  if (idx >= sentences.length) {
    const great = results.filter((v) => v === 'great').length;
    const good = results.filter((v) => v === 'good').length;
    const tryAgain = results.filter((v) => v === 'try_again').length;
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:px-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
            {labels.eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-3xl text-navy sm:text-4xl">
            {labels.doneTitle}
          </h1>
          <p className="mt-4 font-sans text-base text-graphit/70">
            {labels.doneBody(results.length)}
          </p>

          <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
            <SummaryStat value={great} label={labels.great} tone="emerald" />
            <SummaryStat value={good} label={labels.good} tone="navy" />
            <SummaryStat value={tryAgain} label={labels.tryAgain} tone="amber" />
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              to={`/pack/${id}`}
              className="rounded-card border border-navy/15 bg-white px-5 py-2.5 font-sans text-sm text-navy transition hover:border-gold"
            >
              {labels.backToPack}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const progress = `${idx + 1} / ${sentences.length}`;

  return (
    <main className="bg-creme paper">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
        <div className="flex items-center justify-between font-sans text-[11px] uppercase tracking-widest text-graphit/55">
          <span>{labels.eyebrow}</span>
          <span>{progress}</span>
        </div>

        {/* Sentence card */}
        <div className="mt-6 rounded-card border border-navy/15 bg-white px-6 py-10 text-center shadow-card sm:px-10 sm:py-14">
          <p className="font-sans text-[10px] uppercase tracking-widest text-graphit/40">
            {pack.sourceLang.toUpperCase()}
          </p>
          <p className="mt-4 font-serif text-2xl leading-snug text-navy sm:text-3xl">
            {current.text}
          </p>
          {current.translated && (
            <>
              <hr className="mx-auto my-6 w-12 border-t border-gold" />
              <p className="font-sans text-[10px] uppercase tracking-widest text-graphit/40">
                {pack.outputLang.toUpperCase()}
              </p>
              <p className="mt-2 font-sans text-base italic text-graphit/70">
                {current.translated}
              </p>
            </>
          )}
        </div>

        {/* Score panel */}
        {match && spoken !== null && (
          <div
            className={
              'mt-4 rounded-card border px-5 py-4 text-left ' +
              (match.verdict === 'great'
                ? 'border-emerald-300/50 bg-emerald-50/50'
                : match.verdict === 'good'
                ? 'border-navy/15 bg-white'
                : 'border-amber-300/50 bg-amber-50/40')
            }
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-sans text-sm font-medium text-navy">
                {match.verdict === 'great'
                  ? labels.verdictGreat
                  : match.verdict === 'good'
                  ? labels.verdictGood
                  : labels.verdictTryAgain}
              </p>
              <p className="font-sans text-xs text-graphit/55">
                {Math.round(match.score * 100)} %
              </p>
            </div>
            <p className="mt-2 font-sans text-xs uppercase tracking-widest text-graphit/45">
              {labels.youSaid}
            </p>
            <p className="mt-1 font-serif italic text-graphit/80">{spoken || '—'}</p>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-3 font-sans text-sm text-amber-700">
            {error}
          </p>
        )}

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {phase === 'recording' ? (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-card border border-amber-300 bg-amber-50/40 px-5 py-3 font-sans text-sm text-amber-700 transition hover:border-amber-500"
            >
              {labels.recording} · {labels.cancel}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleListen}
                disabled={phase !== 'idle' || !caps.speak}
                className="rounded-card border border-navy/15 bg-white px-5 py-3 font-sans text-sm text-navy transition hover:border-gold disabled:opacity-50"
              >
                {phase === 'listening' ? `🔊 ${labels.listening}…` : `🔊 ${labels.listen}`}
              </button>

              <button
                type="button"
                onClick={handleSpeak}
                disabled={phase !== 'idle' || !caps.recognize}
                className="rounded-card bg-navy px-5 py-3 font-sans text-sm text-creme transition hover:bg-graphit disabled:opacity-50"
              >
                🎙 {match ? labels.tryAgain : labels.speak}
              </button>

              {match && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-card border border-emerald-300/60 bg-emerald-50/40 px-5 py-3 font-sans text-sm text-emerald-700 transition hover:border-emerald-500"
                >
                  {labels.next} →
                </button>
              )}
            </>
          )}
        </div>

        {!caps.recognize && (
          <p className="mt-4 text-center font-sans text-xs text-graphit/55">
            {labels.recognizeHint}
          </p>
        )}

        <div className="mt-8 flex justify-between font-sans text-xs">
          <Link
            to={`/pack/${id}`}
            className="text-graphit/60 transition hover:text-navy"
          >
            ← {labels.backToPack}
          </Link>
          {match && (
            <button
              type="button"
              onClick={handleRetry}
              className="text-graphit/60 transition hover:text-navy"
            >
              {labels.retry}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

type Phase = 'idle' | 'listening' | 'recording' | 'scored';

interface ShadowSentence {
  text: string;
  translated: string;
  start?: number;
}

function extractShadowSentences(pack: KnowledgePack, segs: Segment[] | undefined): ShadowSentence[] {
  if (segs && segs.length > 0) {
    return segs
      .map((s) => ({ text: (s.text ?? '').trim(), translated: (s.translated ?? '').trim(), start: s.start }))
      .filter((s) => s.text.length > 0)
      .slice(0, 30);  // cap for one session
  }
  const view = activeView(pack);
  return view.vocabulary
    .map((v) => ({ text: (v.context ?? '').trim(), translated: '' }))
    .filter((s) => s.text.length > 0)
    .slice(0, 30);
}

function SummaryStat({ value, label, tone }: { value: number; label: string; tone: 'emerald' | 'navy' | 'amber' }) {
  const toneClass = {
    emerald: 'text-emerald-700',
    navy: 'text-navy',
    amber: 'text-amber-700',
  }[tone];
  return (
    <div className="rounded-card border border-navy/15 bg-white px-3 py-4">
      <p className={`font-serif text-3xl leading-none ${toneClass}`}>{value}</p>
      <p className="mt-2 font-sans text-[10px] uppercase tracking-widest text-graphit/55">{label}</p>
    </div>
  );
}

/* ─── i18n ────────────────────────────────────────────────────────── */

function shadowLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: 'Shadowing — Voz Clara',
    headDescription: 'Repite frases del Pack en voz alta y recibe una puntuación de pronunciación.',
    eyebrow: 'SHADOWING',
    loading: 'Cargando…',
    packNotFound: 'Pack no encontrado.',
    backToLibrary: 'Volver a la biblioteca',
    backToPack: 'Volver al Pack',
    unsupportedTitle: 'Tu navegador no soporta voz.',
    unsupportedBody: 'Shadowing requiere reconocimiento de voz del navegador. Prueba en Chrome o Edge en escritorio, o Chrome en Android.',
    emptyTitle: 'Nada para repetir aquí.',
    emptyBody: 'Este Pack no tiene transcripción ni ejemplos de vocabulario.',
    doneTitle: 'Sesión terminada.',
    doneBody: (n: number) => `Has practicado ${n} ${n === 1 ? 'frase' : 'frases'}. Vuelve mañana.`,
    listen: 'Escuchar',
    listening: 'Reproduciendo',
    speak: 'Hablar',
    recording: 'Grabando',
    cancel: 'Cancelar',
    next: 'Siguiente',
    tryAgain: 'Otra vez',
    retry: 'Repetir esta frase',
    great: 'Excelente',
    good: 'Bien',
    youSaid: 'Lo que dijiste',
    verdictGreat: '¡Excelente!',
    verdictGood: 'Casi perfecto.',
    verdictTryAgain: 'Inténtalo otra vez.',
    errorTts: 'No se pudo reproducir el audio.',
    errorNoSpeech: 'No te he oído. Inténtalo otra vez.',
    errorPermission: 'Permiso de micrófono denegado.',
    errorMic: 'No se pudo acceder al micrófono.',
    errorRecognize: 'No se pudo reconocer la voz.',
    recognizeHint: 'Tu navegador no soporta reconocimiento de voz. Puedes escuchar pero no recibir puntuación.',
  };
  if (locale.startsWith('pt')) return {
    headTitle: 'Shadowing — Voz Clara',
    headDescription: 'Repete frases do Pack em voz alta e recebe uma pontuação de pronúncia.',
    eyebrow: 'SHADOWING',
    loading: 'A carregar…',
    packNotFound: 'Pack não encontrado.',
    backToLibrary: 'Voltar à biblioteca',
    backToPack: 'Voltar ao Pack',
    unsupportedTitle: 'O teu navegador não suporta voz.',
    unsupportedBody: 'Shadowing requer reconhecimento de voz. Tenta no Chrome ou Edge no computador, ou no Chrome no Android.',
    emptyTitle: 'Nada para repetir aqui.',
    emptyBody: 'Este Pack não tem transcrição nem exemplos de vocabulário.',
    doneTitle: 'Sessão terminada.',
    doneBody: (n: number) => `Praticaste ${n} ${n === 1 ? 'frase' : 'frases'}. Volta amanhã.`,
    listen: 'Ouvir',
    listening: 'A reproduzir',
    speak: 'Falar',
    recording: 'A gravar',
    cancel: 'Cancelar',
    next: 'Próxima',
    tryAgain: 'Outra vez',
    retry: 'Repetir esta frase',
    great: 'Excelente',
    good: 'Bom',
    youSaid: 'O que disseste',
    verdictGreat: 'Excelente!',
    verdictGood: 'Quase perfeito.',
    verdictTryAgain: 'Tenta de novo.',
    errorTts: 'Não foi possível reproduzir o áudio.',
    errorNoSpeech: 'Não te ouvi. Tenta de novo.',
    errorPermission: 'Permissão do microfone negada.',
    errorMic: 'Não foi possível aceder ao microfone.',
    errorRecognize: 'Não foi possível reconhecer a voz.',
    recognizeHint: 'O teu navegador não suporta reconhecimento de voz. Podes ouvir mas não receber pontuação.',
  };
  if (locale.startsWith('de')) return {
    headTitle: 'Shadowing — Voz Clara',
    headDescription: 'Sprich Sätze aus dem Pack nach und erhalte eine Aussprache-Bewertung.',
    eyebrow: 'SHADOWING',
    loading: 'Lädt…',
    packNotFound: 'Pack nicht gefunden.',
    backToLibrary: 'Zur Bibliothek',
    backToPack: 'Zurück zum Pack',
    unsupportedTitle: 'Dein Browser unterstützt keine Spracherkennung.',
    unsupportedBody: 'Shadowing braucht die Web-Speech-API. Probier es in Chrome oder Edge auf dem Desktop, oder Chrome auf Android.',
    emptyTitle: 'Hier gibt es nichts zum Nachsprechen.',
    emptyBody: 'Dieser Pack hat keine Transkription und keine Vokabel-Beispielsätze.',
    doneTitle: 'Sitzung beendet.',
    doneBody: (n: number) => `Du hast ${n} ${n === 1 ? 'Satz' : 'Sätze'} geübt. Komm morgen wieder.`,
    listen: 'Anhören',
    listening: 'Spielt ab',
    speak: 'Sprechen',
    recording: 'Aufnahme',
    cancel: 'Abbrechen',
    next: 'Weiter',
    tryAgain: 'Nochmal',
    retry: 'Diesen Satz wiederholen',
    great: 'Sehr gut',
    good: 'Gut',
    youSaid: 'Was du gesagt hast',
    verdictGreat: 'Hervorragend!',
    verdictGood: 'Beinahe perfekt.',
    verdictTryAgain: 'Probier es nochmal.',
    errorTts: 'Audio konnte nicht abgespielt werden.',
    errorNoSpeech: 'Ich habe dich nicht gehört. Versuch es nochmal.',
    errorPermission: 'Mikrofon-Berechtigung verweigert.',
    errorMic: 'Mikrofon nicht erreichbar.',
    errorRecognize: 'Sprache konnte nicht erkannt werden.',
    recognizeHint: 'Dein Browser unterstützt keine Spracherkennung. Du kannst zuhören, aber keine Bewertung bekommen.',
  };
  return {
    headTitle: 'Shadowing — Voz Clara',
    headDescription: 'Repeat sentences from the Pack out loud and get a pronunciation score.',
    eyebrow: 'SHADOWING',
    loading: 'Loading…',
    packNotFound: 'Pack not found.',
    backToLibrary: 'Back to library',
    backToPack: 'Back to Pack',
    unsupportedTitle: 'Your browser does not support voice.',
    unsupportedBody: 'Shadowing requires the Web Speech API. Try Chrome or Edge on desktop, or Chrome on Android.',
    emptyTitle: 'Nothing here to repeat.',
    emptyBody: 'This Pack has no transcript and no vocabulary example sentences.',
    doneTitle: 'Session complete.',
    doneBody: (n: number) => `You practiced ${n} ${n === 1 ? 'sentence' : 'sentences'}. Come back tomorrow.`,
    listen: 'Listen',
    listening: 'Playing',
    speak: 'Speak',
    recording: 'Recording',
    cancel: 'Cancel',
    next: 'Next',
    tryAgain: 'Try again',
    retry: 'Retry this sentence',
    great: 'Great',
    good: 'Good',
    youSaid: 'What you said',
    verdictGreat: 'Excellent!',
    verdictGood: 'Nearly perfect.',
    verdictTryAgain: 'Try again.',
    errorTts: 'Could not play audio.',
    errorNoSpeech: 'I did not hear you. Try again.',
    errorPermission: 'Microphone permission denied.',
    errorMic: 'Could not access the microphone.',
    errorRecognize: 'Could not recognize speech.',
    recognizeHint: 'Your browser does not support speech recognition. You can listen but not get a score.',
  };
}
