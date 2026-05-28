/**
 * Cloudflare Pages Function — /learn-german-with-youtube
 *
 * SEO landing page that's the most founder-story-aligned of the
 * intent-cluster pages. Crawlers see a German-learning-focused
 * preview (anki-moment.png + Tagesschau / Easy German / Doktor
 * Whatson channel ladder) instead of the site-wide default.
 *
 * Mirrors the pattern in functions/youtube-to-anki.ts and
 * functions/founder.ts.
 */

interface FunctionContext {
  request: Request;
  next: () => Promise<Response>;
}

const META = {
  ogTitle: 'Learn German with the YouTube videos you already watch · VozClara',
  ogDescription:
    'Paste a German YouTube link — Tagesschau, Easy German, Doktor Whatson — and get vocabulary at your CEFR level, a summary in your language, timestamped quotes, and an Anki deck. Built by a German for his Spanish partner.',
  twitterDescription:
    'Paste a German YouTube video, pick your CEFR level, get a Spanish / Portuguese / English summary plus an Anki deck. Built by a German for his Spanish partner in Frankfurt.',
} as const;

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const { request, next } = context;

  const upstream = await next();
  const contentType = upstream.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) return upstream;

  const html = await upstream.text();

  const origin = new URL(request.url).origin;
  const ogImage = `${origin}/anki-moment.png`;
  const canonical = `${origin}/learn-german-with-youtube`;

  const escAttr = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  const rewritten = html
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escAttr(META.ogTitle)}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escAttr(META.ogDescription)}" />`,
    )
    .replace(
      /<meta property="og:image" content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${escAttr(ogImage)}" />`,
    )
    .replace(
      /<meta property="og:image:alt" content="[^"]*"\s*\/>/,
      `<meta property="og:image:alt" content="${escAttr('Five Anki flashcards arranged on cordovan leather, German-English and German-Spanish vocabulary pairs.')}" />`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${escAttr(canonical)}" />`,
    )
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${escAttr(META.ogTitle)} · A LEON MARÉ product</title>`,
    )
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escAttr(META.ogDescription)}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${escAttr(META.ogTitle)}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${escAttr(META.twitterDescription)}" />`,
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${escAttr(ogImage)}" />`,
    )
    .replace(
      /<meta name="twitter:image:alt" content="[^"]*"\s*\/>/,
      `<meta name="twitter:image:alt" content="${escAttr('Anki flashcards on cordovan leather with German vocabulary pairs.')}" />`,
    );

  const headers = new Headers(upstream.headers);
  headers.delete('Content-Length');
  return new Response(rewritten, {
    status: upstream.status,
    headers,
  });
}

export const onRequestHead = onRequestGet;
