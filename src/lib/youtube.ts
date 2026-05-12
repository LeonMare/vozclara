/**
 * YouTube URL parsing.
 *
 * Accepts every common YouTube share URL form a phone might paste:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://m.youtube.com/watch?v=ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/embed/ID
 *   bare 11-character video ID
 */

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare ID
  if (ID_PATTERN.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return ID_PATTERN.test(id) ? id : null;
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    // /watch?v=ID
    const v = url.searchParams.get('v');
    if (v && ID_PATTERN.test(v)) return v;

    // /embed/ID  /shorts/ID  /v/ID  /live/ID
    const m = url.pathname.match(/^\/(?:embed|shorts|v|live)\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }

  return null;
}
