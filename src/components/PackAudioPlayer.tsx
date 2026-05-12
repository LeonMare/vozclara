import { useEffect, useRef, useState } from 'react';
import { useLocale, type Locale, SUPPORTED_LOCALES } from '../lib/i18n';
import type { KnowledgePack, Segment } from '../lib/pack';
import {
  speak,
  stopSpeaking,
  unlockTTS,
  ttsAvailable,
  listVoicesFor,
} from '../lib/tts';

interface Props {
  pack: KnowledgePack;
  segments: Segment[];
  onSegmentChange?: (idx: number) => void;
}

/**
 * Audio companion for a Knowledge Pack — second iteration.
 *
 * Changes vs. the previous sticky version:
 *
 *  • No longer sticky. It now lives in the document flow above the Pack
 *    body, so it never blocks tabs or text while the user reads.
 *  • Honest labelling: "Browser-Voice · Beta" is shown explicitly, so we
 *    never imply we have studio TTS or live dubbing.
 *  • Explicit player states: idle / playing / paused / error.
 *  • The output language is shown plainly next to play controls.
 *  • The current segment number is in tabular numerals.
 *  • Speed picker collapses into a small inline group, not a popover.
 *
 * The TTS engine is the browser's Web Speech API. Voice quality varies
 * by OS — Safari on macOS/iOS is usually the best. We do not pretend
 * it is a studio voice; we present it as a reading-aloud helper.
 */
export function PackAudioPlayer({ pack, segments, onSegmentChange }: Props) {
  const { locale } = useLocale();
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [voice, setVoice] = useState<string | undefined>(undefined);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const idxRef = useRef(0);
  const rateRef = useRef(rate);
  const voiceRef = useRef(voice);
  const playingRef = useRef(false);
  idxRef.current = index;
  rateRef.current = rate;
  voiceRef.current = voice;
  playingRef.current = playing;

  // Audio renders only for languages we have UI locales for — French is
  // a brand-foundation language but not yet a UI locale.
  const audioLocale: Locale = SUPPORTED_LOCALES.includes(pack.outputLang as Locale)
    ? (pack.outputLang as Locale)
    : 'en';

  // Voice list refresh — voices load async on some browsers.
  useEffect(() => {
    if (!ttsAvailable()) return;
    const refresh = () => {
      const list = listVoicesFor(audioLocale);
      setAvailableVoices(list);
    };
    refresh();
    const id = window.setInterval(refresh, 1000);
    window.setTimeout(() => window.clearInterval(id), 5000);
    return () => window.clearInterval(id);
  }, [audioLocale]);

  useEffect(() => () => stopSpeaking(), []);

  // Build the speech-ready transcript: segments with non-stage-direction
  // content. Stage directions sound robotic when read aloud.
  const speakable = segments.filter((s) => {
    const text = s.translated ?? s.text;
    return text && !/^\s*[*♪♫][\s\S]*[*♪♫]\s*$/.test(text) && !/^\s*\[.+\]\s*$/.test(text);
  });

  function jumpTo(i: number) {
    if (i < 0 || i >= speakable.length) {
      setPlaying(false);
      playingRef.current = false;
      return;
    }
    setIndex(i);
    idxRef.current = i;
    onSegmentChange?.(i);

    const seg = speakable[i];
    const text = seg.translated ?? seg.text;
    setError(null);
    speak({
      text,
      locale: audioLocale,
      voice: voiceRef.current,
      rate: rateRef.current,
      onEnd: () => {
        if (playingRef.current) {
          jumpTo(idxRef.current + 1);
        }
      },
      onError: () => {
        setPlaying(false);
        playingRef.current = false;
        setError(audioLabel(locale, 'error'));
      },
    });
  }

  function handlePlay() {
    if (!ttsAvailable() || speakable.length === 0) return;
    unlockTTS();
    setPlaying(true);
    playingRef.current = true;
    jumpTo(idxRef.current);
  }

  function handlePause() {
    setPlaying(false);
    playingRef.current = false;
    stopSpeaking();
  }

  function handleSkip(delta: number) {
    const target = Math.max(0, Math.min(speakable.length - 1, idxRef.current + delta));
    if (playingRef.current) {
      jumpTo(target);
    } else {
      setIndex(target);
      idxRef.current = target;
      onSegmentChange?.(target);
    }
  }

  function handleRate(r: number) {
    setRate(r);
    rateRef.current = r;
    if (playingRef.current) {
      stopSpeaking();
      window.setTimeout(() => jumpTo(idxRef.current), 60);
    }
  }

  function handleVoice(v: string | undefined) {
    setVoice(v);
    voiceRef.current = v;
    if (playingRef.current) {
      stopSpeaking();
      window.setTimeout(() => jumpTo(idxRef.current), 60);
    }
  }

  // No TTS available → render nothing rather than a broken stub.
  if (!ttsAvailable() || speakable.length === 0) return null;

  const currentText = speakable[index]?.translated ?? speakable[index]?.text ?? '';
  const percent = speakable.length === 0
    ? 0
    : Math.round(((index + (playing ? 1 : 0)) / speakable.length) * 100);

  const status: 'idle' | 'playing' | 'paused' | 'error' =
    error ? 'error' : playing ? 'playing' : index > 0 ? 'paused' : 'idle';

  return (
    <div className="border-y border-navy/10 bg-creme/60">
      <div className="mx-auto max-w-3xl px-5 py-4 sm:px-8 sm:py-5">
        {/* Top row — context: what is this, in which language */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 font-sans text-[10px] uppercase tracking-widest text-graphit/55">
          <div className="flex items-center gap-2">
            <span className="text-gold">{audioLabel(locale, 'kicker')}</span>
            <span className="text-graphit/40">·</span>
            <span>{audioLabel(locale, 'browserVoice')}</span>
            <span className="rounded-full bg-graphit/8 px-1.5 py-0.5 text-[9px] text-graphit/65">
              BETA
            </span>
          </div>
          <div className="tabular-nums">
            {audioLocale.toUpperCase()} · {index + 1} / {speakable.length}
          </div>
        </div>

        {/* Main controls row */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={playing ? handlePause : handlePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-gold transition hover:bg-navy/90"
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <rect x="3" y="2" width="3" height="10" fill="currentColor" />
                <rect x="8" y="2" width="3" height="10" fill="currentColor" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSkip(-1)}
            aria-label="Skip back"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-graphit/55 transition hover:text-navy sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M9 2L4 7l5 5V2z" fill="currentColor" />
              <rect x="2" y="2" width="1.5" height="10" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleSkip(1)}
            aria-label="Skip forward"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-graphit/55 transition hover:text-navy sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M5 2l5 5-5 5V2z" fill="currentColor" />
              <rect x="10.5" y="2" width="1.5" height="10" fill="currentColor" />
            </svg>
          </button>

          {/* Now reading … */}
          <div className="min-w-0 flex-1">
            <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/45">
              {audioLabel(locale, status)}
            </div>
            <p className="truncate font-serif text-sm italic text-navy sm:text-base">
              {currentText || audioLabel(locale, 'press_play')}
            </p>
          </div>

          {/* Speed picker — inline, no popover */}
          <div className="hidden items-center gap-1 sm:flex">
            {[0.85, 1.0, 1.2, 1.5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRate(r)}
                aria-pressed={rate === r}
                className={[
                  'rounded-card px-2 py-1 font-sans text-[11px] tabular-nums transition',
                  rate === r ? 'bg-navy text-creme' : 'text-graphit/60 hover:text-navy',
                ].join(' ')}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-navy/10">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Voice picker — only when multiple voices */}
        {availableVoices.length > 1 && (
          <div className="mt-3 flex items-center gap-2 font-sans text-xs text-graphit/65">
            <span className="uppercase tracking-widest text-[10px] text-graphit/45">
              {audioLabel(locale, 'voice')}
            </span>
            <select
              value={voice ?? ''}
              onChange={(e) => handleVoice(e.target.value || undefined)}
              className="rounded-card border border-navy/15 bg-white px-2 py-1 font-sans text-xs text-navy outline-none focus:border-gold"
            >
              <option value="">Auto</option>
              {availableVoices.slice(0, 6).map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-2 font-sans text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

type StateKey =
  | 'idle' | 'playing' | 'paused' | 'error'
  | 'press_play' | 'kicker' | 'browserVoice' | 'voice';

function audioLabel(locale: string, key: StateKey): string {
  const dict: Record<string, Record<StateKey, string>> = {
    es: {
      kicker: 'Lectura en voz alta',
      browserVoice: 'Voz del navegador',
      idle: 'Listo',
      playing: 'Leyendo',
      paused: 'Pausado',
      error: 'Voz no disponible',
      press_play: 'Pulsa play para escuchar el pack',
      voice: 'Voz',
    },
    pt: {
      kicker: 'Leitura em voz alta',
      browserVoice: 'Voz do navegador',
      idle: 'Pronto',
      playing: 'A ler',
      paused: 'Em pausa',
      error: 'Voz indisponível',
      press_play: 'Carregue em play para ouvir o pack',
      voice: 'Voz',
    },
    de: {
      kicker: 'Vorlese-Modus',
      browserVoice: 'Browser-Stimme',
      idle: 'Bereit',
      playing: 'Vorlesen',
      paused: 'Pausiert',
      error: 'Stimme nicht verfügbar',
      press_play: 'Play drücken um den Pack vorzulesen',
      voice: 'Stimme',
    },
    en: {
      kicker: 'Read-aloud',
      browserVoice: 'Browser voice',
      idle: 'Ready',
      playing: 'Reading',
      paused: 'Paused',
      error: 'Voice unavailable',
      press_play: 'Press play to hear the pack',
      voice: 'Voice',
    },
  };
  return dict[locale]?.[key] ?? dict.en[key];
}
