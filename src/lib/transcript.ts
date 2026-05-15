/**
 * Transcript fetching client.
 *
 * Calls the Cloudflare Worker (or the Vite dev proxy that points there) and
 * returns segments that already contain both the original German text and
 * the Spanish translation — the Worker fetches both in parallel from
 * Supadata in a single round trip.
 */

export interface Segment {
  start: number;       // seconds
  dur: number;         // seconds
  text: string;        // original (e.g. German)
  translated?: string; // target language (e.g. Spanish), if requested
}

export interface TranscriptResponse {
  videoId: string;
  lang: string;             // language of `text`
  translatedTo?: string;    // language of `translated` (if present)
  kind?: string;
  title?: string;
  segments: Segment[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export class TranscriptError extends Error {
  constructor(public code: 'no_captions' | 'fetch_failed' | 'invalid_id' | 'rate_limited' | 'quota_exceeded', message: string) {
    super(message);
    this.name = 'TranscriptError';
  }
}

interface FetchOptions {
  /**
   * Preferred source language code. When omitted (the new default), the
   * worker asks for the video's native captions and tells us in the
   * response which language those captions are in. Pass an explicit
   * value only when you want to force a specific source track.
   */
  lang?: string;
  /** Target language for translation (e.g. 'es'). Omit for source-only. */
  to?: string;
}

export async function fetchTranscript(
  videoId: string,
  { lang, to }: FetchOptions = {},
): Promise<TranscriptResponse> {
  const params = new URLSearchParams({ v: videoId });
  if (lang) params.set('lang', lang);
  if (to) params.set('to', to);
  const url = `${API_BASE}/api/transcript?${params}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new TranscriptError('fetch_failed', `network error: ${String(err)}`);
  }

  if (!res.ok) {
    let body: { error?: string; detail?: string } = {};
    try { body = await res.json(); } catch { /* ignore */ }
    const code = body.error;
    if (code === 'no_captions') throw new TranscriptError('no_captions', 'video has no captions');
    if (code === 'rate_limited') throw new TranscriptError('rate_limited', 'too many requests');
    if (code === 'quota_exceeded') throw new TranscriptError('quota_exceeded', 'monthly quota exceeded');
    if (res.status === 400) throw new TranscriptError('invalid_id', body.error ?? 'invalid id');
    throw new TranscriptError('fetch_failed', `HTTP ${res.status}: ${body.error ?? 'unknown'}`);
  }

  return (await res.json()) as TranscriptResponse;
}
