/**
 * Shadowing — pronunciation drill via the Web Speech API.
 *
 *   listen(target, lang)       → SpeechSynthesis speaks the sentence
 *   record(lang, signal)       → SpeechRecognition returns what the
 *                                user actually said
 *   score(target, spoken)      → 0-1 similarity, normalised across
 *                                case + punctuation + whitespace
 *
 * Browser reality
 *   • Chrome/Edge desktop + Android: full support
 *   • iOS Safari (incl. PWA): SpeechRecognition unavailable; we fall
 *     back to "listen only" mode and surface a hint
 *   • Firefox: SpeechRecognition behind a flag, treat as unsupported
 *
 * No external services — recognition runs on the device (or via the
 * browser vendor's cloud, which is invisible to us). Nothing the
 * user says ever touches a VozClara server.
 */

export interface ShadowingCapabilities {
  speak: boolean;       // SpeechSynthesis
  recognize: boolean;   // SpeechRecognition
}

export function capabilities(): ShadowingCapabilities {
  if (typeof window === 'undefined') return { speak: false, recognize: false };
  const speak = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  const Recognition = getRecognitionCtor();
  return { speak, recognize: !!Recognition };
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  // Safari / older Chrome ship webkit-prefixed only.
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionResultLikeEvent) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResultLikeEvent {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>>;
}

/* ─── TTS — listen to the target ──────────────────────────────────── */

export interface SpeakOptions {
  rate?: number;       // 0.5..1.5, default 0.9 (slightly slower for drill)
  pitch?: number;      // 0..2, default 1
}

/**
 * Speak `text` in `lang` via the browser TTS. Resolves when the
 * utterance finishes, rejects on TTS error.
 */
export function speakText(text: string, lang: string, opts: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('tts_unsupported'));
      return;
    }
    // Cancel anything currently speaking — chained calls should not stack.
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = bcp47From(lang);
    u.rate = opts.rate ?? 0.9;
    u.pitch = opts.pitch ?? 1;
    u.onend = () => resolve();
    u.onerror = (e) => reject(new Error(`tts_failed_${(e as SpeechSynthesisErrorEvent).error ?? 'unknown'}`));
    window.speechSynthesis.speak(u);
  });
}

/* ─── ASR — record what the user said ─────────────────────────────── */

export interface RecordResult {
  transcript: string;
  confidence: number;
}

export class RecognitionError extends Error {
  constructor(public code: 'unsupported' | 'no_speech' | 'aborted' | 'audio_capture' | 'not_allowed' | 'network' | 'unknown', message: string) {
    super(message);
    this.name = 'RecognitionError';
  }
}

/**
 * Record one utterance in `lang` and return what the recogniser
 * heard. The caller can pass an AbortSignal to stop early — useful
 * for a "cancel" button. Times out after `timeoutMs` of silence,
 * defaults to 8s.
 */
export function recordOnce(lang: string, signal?: AbortSignal, timeoutMs: number = 8000): Promise<RecordResult> {
  return new Promise((resolve, reject) => {
    const Recognition = getRecognitionCtor();
    if (!Recognition) {
      reject(new RecognitionError('unsupported', 'SpeechRecognition not available'));
      return;
    }

    const r = new Recognition();
    r.lang = bcp47From(lang);
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 1;

    let settled = false;
    const onAbort = () => {
      if (settled) return;
      settled = true;
      try { r.abort(); } catch { /* ignore */ }
      reject(new RecognitionError('aborted', 'aborted_by_caller'));
    };
    signal?.addEventListener('abort', onAbort);

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { r.stop(); } catch { /* ignore */ }
      reject(new RecognitionError('no_speech', 'timeout'));
    }, timeoutMs);

    r.onresult = (ev: SpeechRecognitionResultLikeEvent) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      const first = ev.results?.[0]?.[0];
      const transcript = (first?.transcript ?? '').trim();
      const confidence = first?.confidence ?? 0;
      resolve({ transcript, confidence });
    };
    r.onerror = (ev) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      const code = (ev.error ?? 'unknown') as RecognitionError['code'];
      reject(new RecognitionError(code, `recognition_${code}`));
    };
    r.onend = () => {
      if (settled) return;
      // onend can fire without onresult on some browsers when the user
      // doesn't speak; treat that as no-speech instead of leaving the
      // promise hanging.
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(new RecognitionError('no_speech', 'silent'));
    };

    try {
      r.start();
    } catch (err) {
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(new RecognitionError('unknown', String(err)));
    }
  });
}

/* ─── Similarity score ────────────────────────────────────────────── */

export interface MatchResult {
  /** 0..1 similarity after normalisation. */
  score: number;
  /** Verdict the UI surfaces. */
  verdict: 'great' | 'good' | 'try_again';
  normalisedTarget: string;
  normalisedSpoken: string;
}

const VERDICT_GREAT = 0.85;
const VERDICT_GOOD = 0.6;

/**
 * Normalise + score. Score combines word-overlap (Jaccard) with
 * character-level edit-distance — both contribute, weighted equally.
 * Punctuation, casing and duplicate spaces are stripped first.
 */
export function scoreMatch(target: string, spoken: string): MatchResult {
  const a = normalise(target);
  const b = normalise(spoken);

  if (!a || !b) {
    return { score: 0, verdict: 'try_again', normalisedTarget: a, normalisedSpoken: b };
  }
  const j = jaccardWords(a, b);
  const l = 1 - levenshteinNormalised(a, b);
  const score = Math.max(0, Math.min(1, 0.5 * j + 0.5 * l));
  const verdict: MatchResult['verdict'] =
    score >= VERDICT_GREAT ? 'great' : score >= VERDICT_GOOD ? 'good' : 'try_again';
  return { score, verdict, normalisedTarget: a, normalisedSpoken: b };
}

function normalise(s: string): string {
  return s
    .toLocaleLowerCase()
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[.,!?;:¿¡"'()\[\]{}«»…—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccardWords(a: string, b: string): number {
  const A = new Set(a.split(' ').filter(Boolean));
  const B = new Set(b.split(' ').filter(Boolean));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  const union = A.size + B.size - inter;
  return inter / union;
}

function levenshteinNormalised(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 0;
  return levenshtein(a, b) / max;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1).fill(0).map((_, i) => i);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/* ─── BCP-47 lang tag from our two-letter codes ───────────────────── */

function bcp47From(lang: string): string {
  // Prefer regional variants the browser TTS / ASR engines actually
  // ship voices for; falls back to bare 2-letter when none of these
  // match (e.g. fr → fr).
  const map: Record<string, string> = {
    de: 'de-DE',
    es: 'es-ES',
    pt: 'pt-PT',
    en: 'en-US',
    fr: 'fr-FR',
  };
  return map[lang.toLowerCase()] ?? lang;
}
