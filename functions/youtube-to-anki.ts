/**
 * Cloudflare Pages Function — /youtube-to-anki
 *
 * SEO landing page for the killer-feature intent cluster. Crawlers
 * see a topic-specific preview (anki-moment.png + Anki-focused title
 * and description) instead of the site-wide default — important for
 * Reddit r/Anki shares, X / LinkedIn launch posts, and Google's
 * social-share-rich snippets.
 *
 * Mirrors the pattern in functions/founder.ts and functions/pack/
 * [id].ts. Body content untouched — React-side i18n + form still
 * render normally for real visitors.
 */

interface FunctionContext {
  request: Request;
  next: () => Promise<Response>;
}

const META = {
  ogTitle: 'YouTube → Anki, one click · VozClara',
  ogDescription:
    'Turn any YouTube video into a standard Anki deck — sentence-context cards, source-timestamp links, CEFR-tuned vocabulary. Spanish, Portuguese, German, English. Free during beta.',
  twitterDescription:
    'Paste a YouTube URL, pick your language, download a .apkg deck. Sentence-context cards, source-timestamp links, AnkiDesktop / Mobile / Droid compatible. Free during beta.',
} as const;

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const { request, next } = context;

  const upstream = await next();
  const contentType = upstream.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) return upstream;

  const html = await upstream.text();

  const origin = new URL(request.url).origin;
  const ogImage = `${origin}/anki-moment.png`;
  const canonical = `${origin}/youtube-to-anki`;

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
      `<meta property="og:image:alt" content="${escAttr('Five Anki flashcards arranged on cordovan leather, each pairing a vocabulary word with its English translation. Above them, an interface tile reading Paste video URL.')}" />`,
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
      `<meta name="twitter:image:alt" content="${escAttr('Five Anki flashcards on cordovan leather showing vocabulary pairs in DE / ES / PT / EN.')}" />`,
    );

  const headers = new Headers(upstream.headers);
  headers.delete('Content-Length');
  return new Response(rewritten, {
    status: upstream.status,
    headers,
  });
}

export const onRequestHead = onRequestGet;
