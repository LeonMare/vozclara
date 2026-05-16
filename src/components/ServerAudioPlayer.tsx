import { useEffect, useRef, useState } from 'react';
import { useLocale, type Locale, SUPPORTED_LOCALES } from '../lib/i18n';
import type { KnowledgePack, Segment } from '../lib/pack';
import { speakViaServer } from '../lib/ttsServer';

interface Props {
  pack: KnowledgePack;
  segments: Segment[];
  onSegmentChange?: (idx: number) => void;
}

/**
 * Server-TTS audio companion. Mounted by PackPage instead of the
 * Web-Speech-API PackAudioPlayer when the worker reports that
 * /api/tts is configured.
 *
 * Engine: native <audio> element. For each segment we generate the
 * MP3 via /api/tts on demand and play it. On `ended`, advance to the
 * next segment. Prefetches one segment ahead so the wait between
 * tracks is invisible. Aborts in-flight prefetches when the user
 * skips so we don't leak bandwidth.
 *
 * UI parity with PackAudioPlayer: same controls (play/pause/skip,
 * speed picker, progress bar, current-segment text) so users don't
 * notice they've been routed to a different engine — they just hear
 * a much better voice. The "BETA · Browser voice" label is replaced
 * with "Studio voice · OpenAI" so the upgrade is legible.
 */
export function ServerAudioPlayer({ pack, segments, onSegmentChange }: Props) {
  const { locale } = useLocale();
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const prefetchRef = useRef<{ idx: number; url: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const audioLocale: Locale = SUPPORTED_LOCALES.includes(pack.outputLang as Locale)
    ? (pack.outputLang as Locale)
    : 'en';

  // Only segments with non-stage-direction content are spoken.
  const speakable = segments.filter((s) => {
    const text = s.translated ?? s.text;
    return text && !/^\s*[*♪♫][\s\S]*[*♪♫]\s*$/.test(text) && !/^\s*\[.+\]\s*$/.test(text);
  });

  // Clean up the previous blob URL whenever we swap to a new segment.
  function revokeCurrent() {
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }
  }
  function revokePrefetch() {
    if (prefetchRef.current) {
      URL.revokeObjectURL(prefetchRef.current.url);
      prefetchRef.current = null;
    }
  }

  // Component-level cleanup.
  useEffect(() => {
    return () => {
      revokeCurrent();
      revokePrefetch();
      abortRef.current?.abort();
      audioRef.current?.pause();
    };
  }, []);

  async function fetchSegmentAudio(i: number): Promise<string | null> {
    const seg = speakable[i];
    if (!seg) return null;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const url = await speakViaServer({
        text: seg.translated ?? seg.text,
        lang: audioLocale,
        signal: abortRef.current.signal,
      });
      return url;
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return null;
      setError(audioLabel(locale, 'error'));
      return null;
    }
  }

  async function playSegment(i: number) {
    if (i < 0 || i >= speakable.length) {
      setPlaying(false);
      return;
    }
    setIndex(i);
    onSegmentChange?.(i);
    setError(null);

    // Use prefetched URL if it matches; otherwise fetch fresh.
    let url: string | null = null;
    if (prefetchRef.current?.idx === i) {
      url = prefetchRef.current.url;
      prefetchRef.current = null;
    } else {
      revokePrefetch();
      setLoading(true);
      url = await fetchSegmentAudio(i);
      setLoading(false);
      if (!url) return;
    }

    revokeCurrent();
    currentUrlRef.current = url;
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = url;
    audio.playbackRate = rate;
    try {
      await audio.play();
      setPlaying(true);
      // Prefetch the next segment so the gap is invisible.
      prefetchNext(i + 1);
    } catch {
      setPlaying(false);
    }
  }

  async function prefetchNext(i: number) {
    if (i >= speakable.length) return;
    revokePrefetch();
    const url = await fetchSegmentAudio(i);
    if (url) prefetchRef.current = { idx: i, url };
  }

  function handlePlay() {
    if (speakable.length === 0) return;
    playSegment(index);
  }

  function handlePause() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function handleSkip(delta: number) {
    const target = Math.max(0, Math.min(speakable.length - 1, index + delta));
    if (playing) {
      playSegment(target);
    } else {
      setIndex(target);
      onSegmentChange?.(target);
    }
  }

  function handleRate(r: number) {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }

  function handleEnded() {
    // Auto-advance only when we were playing.
    if (playing) playSegment(index + 1);
  }

  if (speakable.length === 0) return null;

  const currentText = speakable[index]?.translated ?? speakable[index]?.text ?? '';
  const percent = speakable.length === 0
    ? 0
    : Math.round(((index + (playing ? 1 : 0)) / speakable.length) * 100);

  const status: 'idle' | 'playing' | 'paused' | 'loading' | 'error' =
    error ? 'error' : loading ? 'loading' : playing ? 'playing' : index > 0 ? 'paused' : 'idle';

  return (
    <div className="border-y border-navy/10 bg-creme/60">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onError={() => { setPlaying(false); setError(audioLabel(locale, 'error')); }}
        preload="auto"
      />
      <div className="mx-auto max-w-3xl px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 font-sans text-[10px] uppercase tracking-widest text-graphit/55">
          <div className="flex items-center gap-2">
            <span className="text-gold">{audioLabel(locale, 'kicker')}</span>
            <span className="text-graphit/40">·</span>
            <span>{audioLabel(locale, 'studioVoice')}</span>
            <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] text-navy">
              STUDIO
            </span>
          </div>
          <div className="tabular-nums">
            {audioLocale.toUpperCase()} · {index + 1} / {speakable.length}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={playing ? handlePause : handlePlay}
            disabled={loading}
            aria-label={playing ? 'Pause' : 'Play'}
            className={[
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
              loading ? 'cursor-wait bg-navy/40 text-creme/70' : 'bg-navy text-gold hover:bg-navy/90',
            ].join(' ')}
          >
            {loading ? (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="animate-spin">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeDasharray="20 10" />
              </svg>
            ) : playing ? (
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

          <div className="min-w-0 flex-1">
            <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/45">
              {audioLabel(locale, status)}
            </div>
            <p className="truncate font-serif text-sm italic text-navy sm:text-base">
              {currentText || audioLabel(locale, 'press_play')}
            </p>
          </div>

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

        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-navy/10">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Pack source attribution — keeps utility unchanged */}
        {error && (
          <p role="alert" className="mt-2 font-sans text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );

  // Reference used to silence the unused-pack lint — we keep `pack`
  // in the prop signature for parity with PackAudioPlayer and for
  // future use (per-pack voice override, etc).
  void pack;
}

type StateKey =
  | 'idle' | 'playing' | 'paused' | 'loading' | 'error'
  | 'press_play' | 'kicker' | 'studioVoice';

function audioLabel(locale: string, key: StateKey): string {
  const dict: Record<string, Record<StateKey, string>> = {
    es: {
      kicker: 'Lectura en voz alta',
      studioVoice: 'Voz IA estudio',
      idle: 'Listo',
      playing: 'Leyendo',
      paused: 'Pausado',
      loading: 'Generando…',
      error: 'Voz no disponible',
      press_play: 'Pulsa play para escuchar el pack',
    },
    pt: {
      kicker: 'Leitura em voz alta',
      studioVoice: 'Voz IA estúdio',
      idle: 'Pronto',
      playing: 'A ler',
      paused: 'Em pausa',
      loading: 'A gerar…',
      error: 'Voz indisponível',
      press_play: 'Carregue em play para ouvir o pack',
    },
    de: {
      kicker: 'Vorlese-Modus',
      studioVoice: 'KI-Studio-Stimme',
      idle: 'Bereit',
      playing: 'Vorlesen',
      paused: 'Pausiert',
      loading: 'Erzeuge…',
      error: 'Stimme nicht verfügbar',
      press_play: 'Play drücken um den Pack vorzulesen',
    },
    en: {
      kicker: 'Read-aloud',
      studioVoice: 'AI studio voice',
      idle: 'Ready',
      playing: 'Reading',
      paused: 'Paused',
      loading: 'Generating…',
      error: 'Voice unavailable',
      press_play: 'Press play to hear the pack',
    },
  };
  return dict[locale]?.[key] ?? dict.en[key];
}
