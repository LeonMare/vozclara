/**
 * Cloudflare Pages Function — /pack/<id>
 *
 * Intercepts every request to a pack URL and rewrites the SPA's
 * <meta property="og:..."> tags so that social-card crawlers see
 * pack-specific previews instead of the site-wide default.
 *
 * For KNOWN sample pack ids (sample, sample-business, sample-learn,
 * sample-creator), we have the metadata baked in here and can write
 * a rich, dynamic og:image URL pointing at the worker's /api/og
 * endpoint. The crawler fetches that and renders the brand-styled
 * SVG card with the pack title, mode, lang and genre.
 *
 * For USER pack ids (random nanoid(12) values), there is no server-
 * accessible data — the pack lives in the user's IndexedDB. We pass
 * through unchanged, so the SPA renders normally and the crawler
 * sees the default site-wide og tags.
 *
 * Browsers visiting the page in a real session still get the full
 * SPA experience — the function doesn't change body content, only
 * the OG/Twitter meta tags.
 */

const WORKER_BASE = 'https://vozclara-transcript.salvador7eon.workers.dev';

interface SamplePackMeta {
  title: string;
  ogTitle: string;
  ogDescription: string;
  mode: string;
  lang: string;
  genre: string;
  author: string;
}

const SAMPLES: Record<string, SamplePackMeta> = {
  sample: {
    title: 'Tagesschau 20:00 Uhr · 03.05.2026',
    ogTitle: 'Tagesschau — Merz, ein Jahr im Amt · Voz Clara',
    ogDescription:
      'Knowledge Pack: ein Jahr Bundeskanzler Merz, atmende Koalition, AfD im Osten. Business-Modus, ES + EN.',
    mode: 'business',
    lang: 'es',
    genre: 'news',
    author: 'tagesschau',
  },
  'sample-business': {
    title: 'Tagesschau 20:00 Uhr · 03.05.2026',
    ogTitle: 'Tagesschau — Merz, ein Jahr im Amt · Voz Clara',
    ogDescription:
      'Knowledge Pack: ein Jahr Bundeskanzler Merz, atmende Koalition, AfD im Osten. Business-Modus, ES + EN.',
    mode: 'business',
    lang: 'es',
    genre: 'news',
    author: 'tagesschau',
  },
  'sample-learn': {
    title: 'Tagesschau · 03.05.2026',
    ogTitle: 'Lerne deutsche Politik mit der Tagesschau · Voz Clara',
    ogDescription:
      'Knowledge Pack im Lernen-Modus: Vokabeln, Quiz und Erklärungen rund um die deutsche Koalitionspolitik. ES + EN.',
    mode: 'learn',
    lang: 'es',
    genre: 'education',
    author: 'tagesschau',
  },
  'sample-creator': {
    title: 'Tagesschau · 03.05.2026',
    ogTitle: 'Drei virale Angles aus der Tagesschau · Voz Clara',
    ogDescription:
      'Knowledge Pack im Creator-Modus: Hooks, Captions, Social-Angles aus dem Tagesschau-Bericht. ES + EN.',
    mode: 'creator',
    lang: 'es',
    genre: 'creator',
    author: 'tagesschau',
  },
};

interface FunctionContext {
  request: Request;
  params: { id: string };
  next: () => Promise<Response>;
}

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const { request, params, next } = context;
  const packId = params.id;
  const sample = SAMPLES[packId];

  // Unknown id → user pack or sample we don't have metadata for.
  // Pass through to the SPA with default OG tags.
  if (!sample) return next();

  // Fetch the static SPA HTML the Pages build produces.
  const upstream = await next();
  const contentType = upstream.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) return upstream;

  const html = await upstream.text();

  const ogImage =
    `${WORKER_BASE}/api/og` +
    `?title=${encodeURIComponent(sample.title)}` +
    `&mode=${encodeURIComponent(sample.mode)}` +
    `&lang=${encodeURIComponent(sample.lang)}` +
    `&genre=${encodeURIComponent(sample.genre)}` +
    `&author=${encodeURIComponent(sample.author)}`;

  const canonical = `https://vozclara.pages.dev/pack/${packId}`;

  const escAttr = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  // Rewrite the existing OG tags (which all sit between og: prefix
  // attributes in index.html) to the pack-specific values.
  const rewritten = html
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escAttr(sample.ogTitle)}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escAttr(sample.ogDescription)}" />`,
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
      `<title>${escAttr(sample.ogTitle)}</title>`,
    )
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escAttr(sample.ogDescription)}" />`,
    );

  // Add Twitter card tags if not present — extends the Pages default
  // <meta name="twitter:card"> block.
  const twitterBlock = `
    <meta name="twitter:title" content="${escAttr(sample.ogTitle)}" />
    <meta name="twitter:description" content="${escAttr(sample.ogDescription)}" />
    <meta name="twitter:image" content="${escAttr(ogImage)}" />`;
  const withTwitter = rewritten.replace(
    /<meta name="twitter:card" content="summary_large_image"\s*\/>/,
    (m) => `${m}${twitterBlock}`,
  );

  // Preserve every header except Content-Length (changes after rewrite).
  const headers = new Headers(upstream.headers);
  headers.delete('Content-Length');
  return new Response(withTwitter, {
    status: upstream.status,
    headers,
  });
}

// Same handler for HEAD requests crawlers occasionally send.
export const onRequestHead = onRequestGet;
