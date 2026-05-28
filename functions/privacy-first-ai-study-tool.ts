/**
 * Cloudflare Pages Function — /privacy-first-ai-study-tool
 *
 * Positioning page for the EU-tech + privacy-conscious segment.
 * Rewrites og: + twitter: meta so social-share previews emphasise
 * the no-cookies / no-tracking / GDPR-Art.17 / AI-Act compliance
 * angle rather than the generic homepage card.
 */

interface FunctionContext {
  request: Request;
  next: () => Promise<Response>;
}

const META = {
  ogTitle: 'The privacy-first AI study tool · VozClara',
  ogDescription:
    'No cookies. No tracking pixels. Local-first library in your browser. We do not train public models on your content. GDPR Art. 13 + 17 + EU AI Act Art. 50 compliant. Built in the EU.',
  twitterDescription:
    'AI study tool with no cookies, no tracking, no model-training on your content. GDPR + EU AI Act compliant from day one. Built in the EU.',
} as const;

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const { request, next } = context;

  const upstream = await next();
  const contentType = upstream.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) return upstream;

  const html = await upstream.text();

  const origin = new URL(request.url).origin;
  const ogImage = `${origin}/og-image.png`;
  const canonical = `${origin}/privacy-first-ai-study-tool`;

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
    );

  const headers = new Headers(upstream.headers);
  headers.delete('Content-Length');
  return new Response(rewritten, {
    status: upstream.status,
    headers,
  });
}

export const onRequestHead = onRequestGet;
