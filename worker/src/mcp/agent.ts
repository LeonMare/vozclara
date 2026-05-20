/**
 * VozClara MCP Server — Phase 1 Foundation.
 *
 * Strategy (MASTER.md §3 Phase 1 Priority #1):
 *   Distribution moat by exposing VozClara as an MCP server. Smithery
 *   listing turns it into a passive discovery channel — devs find us
 *   from Claude Desktop / Cursor / Granola search rather than us
 *   chasing every channel ourselves.
 *
 * Stack (CLAUDE.md §1.5 — LOCKED):
 *   `agents` SDK + `McpAgent` + `workers-oauth-provider`
 *   (NOT the raw @modelcontextprotocol/sdk by itself)
 *
 * Phase 1 scope (today):
 *   • One composite tool: `vozclara_generate_pack` — takes a YouTube
 *     URL, returns a Knowledge Pack summary in the target language.
 *   • Anonymous access (no OAuth) — free-tier semantics by default.
 *   • Streamable HTTP + SSE transports both exposed for client
 *     compatibility (Claude Desktop uses SSE, newer clients use HTTP).
 *
 * Phase 2 (deferred):
 *   • OAuth via `workers-oauth-provider`, magic-link bridge.
 *   • Tier gating (pro / pro_plus) on premium tools.
 *   • Additional tools: search_library, ask_across_packs, export_apkg.
 *
 * Implementation notes:
 *   • This is self-contained — we call Supadata + Workers AI directly
 *     rather than HTTP-roundtripping to /api/transcript and
 *     /api/insights. That avoids the unnecessary cold-start hop and
 *     keeps the MCP code path explicit. Future commit can factor
 *     shared helpers once we have a second tool that needs the same
 *     transcript flow.
 */

import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// Env type minimal — only what the MCP tool needs. The agent's full
// Cloudflare.Env type is broader and shared with the main worker.
type McpEnv = {
  SUPADATA_API_KEY?: string;
  AI: {
    run: (
      model: string,
      input: Record<string, unknown>,
    ) => Promise<{ response?: string | unknown } & Record<string, unknown>>;
  };
};

/** Languages the tool accepts as the `language` parameter. */
const LANG_SCHEMA = z
  .enum(['es', 'pt', 'de', 'en'])
  .describe(
    'Output language for the Knowledge Pack: es (Spanish), pt (Portuguese), de (German), en (English).',
  );

const VIDEO_URL_SCHEMA = z
  .string()
  .url()
  .describe(
    'Public YouTube video URL (youtube.com/watch?v=… or youtu.be/… short form).',
  );

const DEPTH_SCHEMA = z
  .enum(['short', 'standard', 'deep'])
  .default('standard')
  .describe(
    'Depth of the generated pack. `short` = one-paragraph summary. `standard` = summary + 3-5 key ideas. `deep` = summary + key ideas + glossary + quiz.',
  );

export class VozClaraMcpAgent extends McpAgent<McpEnv> {
  server = new McpServer({
    name: 'vozclara',
    version: '0.1.0',
  });

  async init(): Promise<void> {
    // Tool: vozclara_generate_pack
    //
    // The composite tool — single entry point that owns the full
    // transcript → AI summary pipeline. Composite > granular for MCP:
    // one tool with parameters is easier for client LLMs to call
    // correctly than 5 fine-grained tools they have to chain.
    this.server.registerTool(
      'vozclara_generate_pack',
      {
        title: 'Generate a Knowledge Pack from a YouTube video',
        description:
          'Use this when the user asks for a summary, key ideas, or study material from a YouTube video. Returns a structured Knowledge Pack: title, short summary, key ideas, and a link to the full pack on vozclara.app.',
        inputSchema: {
          url: VIDEO_URL_SCHEMA,
          language: LANG_SCHEMA,
          depth: DEPTH_SCHEMA,
        },
      },
      async ({ url, language, depth }) => {
        // 1. Extract YouTube video ID from any valid URL shape.
        const videoId = extractVideoId(url);
        if (!videoId) {
          return errorContent(
            `Invalid YouTube URL. Expected youtube.com/watch?v=… or youtu.be/… — got: ${url}`,
          );
        }

        // 2. Fetch the transcript via Supadata. Their residential-IP
        //    egress sidesteps YouTube's datacenter-IP blocks and they
        //    act as MoR for transcript licensing.
        let transcriptText: string;
        let detectedLang: string;
        try {
          const t = await fetchSupadataTranscript(videoId, this.env.SUPADATA_API_KEY);
          transcriptText = t.text;
          detectedLang = t.lang;
        } catch (err) {
          return errorContent(
            `Could not fetch transcript: ${err instanceof Error ? err.message : String(err)}`,
          );
        }

        // 3. Build the prompt, run Llama 3.3 70B for the pack.
        const prompt = buildPrompt(transcriptText, detectedLang, language, depth);
        let aiResponse: string;
        try {
          const result = await this.env.AI.run(
            '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
            {
              messages: [
                { role: 'system', content: prompt.system },
                { role: 'user', content: prompt.user },
              ],
              max_tokens: depth === 'deep' ? 2_500 : depth === 'standard' ? 1_500 : 600,
              temperature: 0.4,
            },
          );
          aiResponse =
            typeof result.response === 'string'
              ? result.response
              : JSON.stringify(result.response ?? result);
        } catch (err) {
          return errorContent(
            `AI generation failed: ${err instanceof Error ? err.message : String(err)}`,
          );
        }

        // 4. Build the public pack URL so the client can deep-link
        //    the user to the full interactive view on vozclara.app.
        const packUrl = `https://vozclara.app/new?v=${videoId}&lang=${language}&mode=${depthToMode(depth)}`;

        return {
          content: [
            {
              type: 'text',
              text: aiResponse,
            },
            {
              type: 'text',
              text: `\n\n— Pack URL (open for interactive view, flashcards, quiz): ${packUrl}\n— AI-generated by VozClara using Llama 3.3 70B. Verify before relying on this output.`,
            },
          ],
          structuredContent: {
            videoId,
            sourceLanguage: detectedLang,
            outputLanguage: language,
            depth,
            packUrl,
            provenance: {
              model: 'llama-3.3-70b-instruct',
              watermark: 'vozclara.app',
              ai_act_disclosure:
                'EU AI Act Art. 50(2) — synthetic content marked as AI-generated.',
            },
          },
        };
      },
    );
  }
}

/* ─── helpers ────────────────────────────────────────────────────────────── */

function errorContent(message: string) {
  return {
    content: [{ type: 'text' as const, text: `Error: ${message}` }],
    isError: true,
  };
}

/**
 * Map the MCP depth parameter to the web app's mode for pack URL
 * construction. Keeps the deep-link experience coherent: a `short`
 * MCP request opens in `brief` mode on the web, `deep` opens in
 * `learn` mode where the glossary + quiz live.
 */
function depthToMode(depth: 'short' | 'standard' | 'deep'): string {
  if (depth === 'short') return 'brief';
  if (depth === 'deep') return 'learn';
  return 'brief';
}

/**
 * Parse a YouTube URL into the 11-character video ID. Accepts:
 *   - youtube.com/watch?v=ID
 *   - youtu.be/ID
 *   - youtube.com/embed/ID
 *   - youtube.com/shorts/ID
 */
function extractVideoId(input: string): string | null {
  try {
    const u = new URL(input);
    if (u.hostname === 'youtu.be') {
      return validateId(u.pathname.slice(1).split('/')[0] ?? '');
    }
    if (u.hostname.endsWith('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return validateId(v);
      // /embed/ID or /shorts/ID
      const m = u.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

function validateId(s: string): string | null {
  return /^[A-Za-z0-9_-]{11}$/.test(s) ? s : null;
}

/**
 * Minimal Supadata fetcher for the MCP path. Concatenates segments
 * into a plain text body — the Pack's segment-level timestamps are
 * available on the web view (Pack URL in the response), but the MCP
 * tool returns the textual pack only.
 */
async function fetchSupadataTranscript(
  videoId: string,
  apiKey: string | undefined,
): Promise<{ text: string; lang: string }> {
  if (!apiKey) {
    throw new Error('SUPADATA_API_KEY not configured');
  }
  const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      Accept: 'application/json',
    },
  });
  if (res.status === 404) throw new Error('no_captions');
  if (res.status === 429) throw new Error('rate_limited');
  if (res.status === 402) throw new Error('quota_exceeded');
  if (!res.ok) {
    throw new Error(`supadata_http_${res.status}`);
  }
  const data = (await res.json()) as {
    content?: string | Array<{ text: string }>;
    lang?: string;
  };
  const text =
    typeof data.content === 'string'
      ? data.content
      : Array.isArray(data.content)
        ? data.content.map((s) => s.text).join(' ')
        : '';
  if (!text || text.length < 50) throw new Error('transcript_too_short');
  return { text, lang: data.lang ?? 'unknown' };
}

/**
 * Build the system + user prompt for the Knowledge Pack generation.
 * Depth controls structure: short = one paragraph, standard = summary
 * + key ideas, deep = full pack with glossary and quiz.
 */
function buildPrompt(
  transcript: string,
  sourceLang: string,
  targetLang: 'es' | 'pt' | 'de' | 'en',
  depth: 'short' | 'standard' | 'deep',
): { system: string; user: string } {
  const langName: Record<'es' | 'pt' | 'de' | 'en', string> = {
    es: 'Spanish',
    pt: 'Portuguese',
    de: 'German',
    en: 'English',
  };

  const structure =
    depth === 'short'
      ? 'A single-paragraph executive summary, 60-90 words. No bullets, no headings.'
      : depth === 'deep'
        ? 'A 4-section pack: (1) ## Summary — 2 paragraphs. (2) ## Key Ideas — 5-7 numbered points, each one or two sentences. (3) ## Glossary — 6-10 important terms with concise definitions. (4) ## Quiz — 5 question/answer pairs.'
        : 'A 2-section pack: (1) ## Summary — 1-2 paragraphs. (2) ## Key Ideas — 3-5 numbered points, each one sentence.';

  const system = `You are VozClara — a multilingual AI study tool. You take a YouTube video transcript and produce a structured Knowledge Pack in the user's chosen language.

Output language: ${langName[targetLang]}. Translate as you write — do not include the source-language transcript verbatim.

Structure:
${structure}

Style rules:
- Be precise. No filler. No "in this video the speaker says…".
- No emojis. No marketing language.
- If the transcript is too thin or off-topic, say so plainly in one sentence and stop.
- Do not include closing remarks or sign-offs.
- Output is rendered as Markdown.`;

  const user = `Source language (detected): ${sourceLang}
Target language: ${langName[targetLang]}

Transcript:
"""
${transcript.slice(0, 24_000)}
"""

Produce the Knowledge Pack now.`;

  return { system, user };
}
