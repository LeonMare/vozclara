/**
 * Server-TTS client.
 *
 * Talks to the worker's /api/tts endpoint. When the worker is
 * configured with an OPENAI_API_KEY it returns premium MP3 audio;
 * otherwise it returns 503 and the consumer should fall back to the
 * browser's Web Speech API (existing PackAudioPlayer).
 *
 * No client-side caching across reloads — that's a future optimisation
 * (IndexedDB blob store keyed by sha256 of text+lang+voice).
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export type ServerVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface TTSHealth {
  available: boolean;
  provider: string | null;
  model: string | null;
}

let healthCache: TTSHealth | null = null;
let healthPromise: Promise<TTSHealth> | null = null;

/**
 * Probe whether the worker has server TTS enabled. Cached for the
 * lifetime of the page — the answer doesn't change between requests
 * within a single session.
 */
export async function checkTTSAvailability(): Promise<TTSHealth> {
  if (healthCache) return healthCache;
  if (healthPromise) return healthPromise;

  healthPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tts/health`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) {
        const fallback: TTSHealth = { available: false, provider: null, model: null };
        healthCache = fallback;
        return fallback;
      }
      const data = (await res.json()) as TTSHealth;
      healthCache = data;
      return data;
    } catch {
      const fallback: TTSHealth = { available: false, provider: null, model: null };
      healthCache = fallback;
      return fallback;
    }
  })();

  return healthPromise;
}

export interface SpeakOptions {
  text: string;
  lang: string;
  voice?: ServerVoice;
  speed?: number;
  signal?: AbortSignal;
}

/**
 * Generate audio for a piece of text. Returns a Blob URL the caller
 * should set as the src on an <audio> element. The Blob URL stays
 * valid for the page lifetime; revoke it when no longer needed.
 *
 * Throws when:
 *   • the worker returns 503 (TTS not configured) → upstream caller
 *     should re-check availability and fall through to browser TTS
 *   • the OpenAI call upstream fails (rate limit, network)
 *   • the request is aborted (user navigated, skipped to next segment)
 */
export async function speakViaServer(opts: SpeakOptions): Promise<string> {
  const res = await fetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: opts.text,
      lang: opts.lang,
      voice: opts.voice ?? 'alloy',
      speed: opts.speed ?? 1.0,
    }),
    signal: opts.signal,
  });

  if (res.status === 503) {
    // Reset the cached health so a manual retry can re-probe.
    healthCache = null;
    throw new Error('tts_disabled');
  }
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = (body as { detail?: string }).detail ?? '';
    } catch { /* ignore */ }
    throw new Error(`tts_http_${res.status}: ${detail}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
