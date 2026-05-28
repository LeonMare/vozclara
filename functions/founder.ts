/**
 * Cloudflare Pages Function — /founder
 *
 * Intercepts requests to the Founder Deal landing page and rewrites
 * the SPA's <meta property="og:..."> tags so that social-card crawlers
 * (Twitter, LinkedIn, Discord, iMessage, Slack, Telegram, etc.) see a
 * founder-deal-specific preview card instead of the site-wide default.
 *
 * Mirrors the pattern in functions/pack/[id].ts. The body content
 * stays untouched — browsers visiting the page in a real session still
 * get the full SPA experience and the React-side i18n / Paddle
 * checkout flow. Only the OG / Twitter meta tags are rewritten.
 *
 * The og:image is the static /og-founder.png asset generated 28.5.2026
 * via Higgsfield nano_banana_pro (commit 20d0146) — same editorial
 * brass-on-navy register as the site-wide /og-image.png but with the
 * "First 100 Founders pay €99 once" + "Lifetime Pro Plus access" copy
 * baked in.
 */

interface FunctionContext {
  request: Request;
  next: () => Promise<Response>;
}

// English-by-default because crawlers don't run JavaScript and the
// SPA's locale picker hasn't executed yet. Locale-aware variants
// would require either (a) per-locale URLs like /es/founder or
// (b) Accept-Language detection inside this function — both are
// post-launch work, not pre-launch blockers.
const META = {
  ogTitle: 'VozClara — First 100 founders pay €99 once',
  ogDescription:
    'Lifetime Pro Plus access for the first 100 founders. Then never offered again. Multilingual YouTube → Knowledge Pack engine. By LEON MARÉ.',
  twitterDescription:
    'Lifetime Pro Plus for the first 100 founders. €99 once, then never offered again. Paste any YouTube video, get a structured Knowledge Pack — summary, flashcards, quiz, transcript — in Spanish, Portuguese, German, or English.',
} as const;

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const { request, next } = context;

  // Fetch the static SPA HTML the Pages build produces.
  const upstream = await next();
  const contentType = upstream.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) return upstream;

  const html = await upstream.text();

  // Absolute URLs so they survive being re-quoted by social-card
  // crawlers that strip relative paths.
  const origin = new URL(request.url).origin;
  const ogImage = `${origin}/og-founder.png`;
  const canonical = `${origin}/founder`;

  const escAttr = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  // Rewrite the existing OG tags (all six surfaces — title, description,
  // image, url, the <title> tag, and the <meta name="description">) so a
  // crawler-fetched snapshot reads as founder-deal-specific from the
  // first byte.
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
      `<meta property="og:image:alt" content="${escAttr('VozClara Founder Deal — First 100 founders pay 99 euros once for lifetime Pro Plus access.')}" />`,
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
      `<meta name="twitter:image:alt" content="${escAttr('VozClara Founder Deal — 99 euros once for lifetime Pro Plus, capped at 100 seats.')}" />`,
    );

  // Preserve every header except Content-Length (which changes after
  // the rewrite). Cache headers from the static asset still apply.
  const headers = new Headers(upstream.headers);
  headers.delete('Content-Length');
  return new Response(rewritten, {
    status: upstream.status,
    headers,
  });
}

// Same handler for HEAD — Twitter / Slack crawlers occasionally probe
// with HEAD before the actual GET to check Content-Type.
export const onRequestHead = onRequestGet;
