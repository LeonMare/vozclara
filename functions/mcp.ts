/**
 * Cloudflare Pages Function — /mcp
 *
 * Developer-facing landing for the Model Context Protocol server.
 * Crawler-side rewrites the og:image / og:title / og:description so
 * social-share previews on Twitter / LinkedIn / Discord / Hacker News
 * read as a technical page (MCP terminology, tool names) rather than
 * the site-wide consumer card.
 */

interface FunctionContext {
  request: Request;
  next: () => Promise<Response>;
}

const META = {
  ogTitle: 'VozClara on MCP — Knowledge Pack engine for Claude / Cursor / Continue',
  ogDescription:
    'Open-source MCP server. Four tools (vozclara_generate_pack anonymous; vozclara_search_my_library, vozclara_ask_video, vozclara_export_anki OAuth-gated). Streamable HTTP + SSE transports. Listed on Smithery, Glama, awesome-mcp-servers.',
  twitterDescription:
    'MCP server exposing YouTube → Knowledge Pack as a tool. Four tools, OAuth 2.1 with PKCE, Llama 3.3 free, Sonnet 4.5 on Pro Plus. Install from Smithery in one line.',
} as const;

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const { request, next } = context;

  const upstream = await next();
  const contentType = upstream.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) return upstream;

  const html = await upstream.text();

  const origin = new URL(request.url).origin;
  // Reuse /og-image.png for now — when the MCP page warrants its own
  // share card, swap in /og-mcp.png. The MCP-icon (VC monogram) used
  // on Smithery is a square 512×512 asset, not the 1200×630 ratio
  // needed for share previews, so we don't reuse that directly.
  const ogImage = `${origin}/og-image.png`;
  const canonical = `${origin}/mcp`;

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
