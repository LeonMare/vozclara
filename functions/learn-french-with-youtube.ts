/**
 * Cloudflare Pages Function — /learn-french-with-youtube
 * Same Pages Function pattern as the other /learn-X landings.
 */

interface FunctionContext {
  request: Request;
  next: () => Promise<Response>;
}

const META = {
  ogTitle: 'Learn French with the YouTube videos you already watch · VozClara',
  ogDescription:
    'Paste a French YouTube link — France 24, TV5 Monde, Cyrus North, Konbini — and get vocabulary at your CEFR level, a summary in your language, timestamped quotes, and an Anki deck.',
  twitterDescription:
    'French YouTube video → CEFR-tuned vocabulary + native-language summary + Anki deck. Built for real-input learners.',
} as const;

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const { request, next } = context;
  const upstream = await next();
  const contentType = upstream.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) return upstream;
  const html = await upstream.text();
  const origin = new URL(request.url).origin;
  const ogImage = `${origin}/anki-moment.png`;
  const canonical = `${origin}/learn-french-with-youtube`;
  const escAttr = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const rewritten = html
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escAttr(META.ogTitle)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escAttr(META.ogDescription)}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escAttr(ogImage)}" />`)
    .replace(/<meta property="og:image:alt" content="[^"]*"\s*\/>/, `<meta property="og:image:alt" content="${escAttr('Five Anki flashcards on cordovan leather, French vocabulary pairs.')}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${escAttr(canonical)}" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escAttr(META.ogTitle)} · A LEON MARÉ product</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escAttr(META.ogDescription)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escAttr(META.ogTitle)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escAttr(META.twitterDescription)}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${escAttr(ogImage)}" />`)
    .replace(/<meta name="twitter:image:alt" content="[^"]*"\s*\/>/, `<meta name="twitter:image:alt" content="${escAttr('Anki flashcards with French vocabulary pairs.')}" />`);
  const headers = new Headers(upstream.headers);
  headers.delete('Content-Length');
  return new Response(rewritten, { status: upstream.status, headers });
}

export const onRequestHead = onRequestGet;
