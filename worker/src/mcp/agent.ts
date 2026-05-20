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

// Env type minimal — only what the MCP tools need. The agent's full
// Cloudflare.Env type is broader and shared with the main worker.
// Phase 2 (OAuth) tools need VECTORIZE for brainId-scoped search +
// per-pack RAG. The library lookup is intentionally server-side via
// Vectorize (which already indexes every pack's chunks) rather than
// reaching into IndexedDB, which lives in the user's browser only.
type McpEnv = {
  SUPADATA_API_KEY?: string;
  AI: {
    run: (
      model: string,
      input: Record<string, unknown>,
    ) => Promise<{ response?: string | unknown } & Record<string, unknown>>;
  };
  VECTORIZE?: {
    query: (
      vector: number[],
      options: {
        topK?: number;
        filter?: Record<string, unknown>;
        returnMetadata?: boolean;
      },
    ) => Promise<{
      matches: Array<{
        id: string;
        score: number;
        metadata?: Record<string, unknown>;
      }>;
    }>;
  };
};

/**
 * Props injected by `@cloudflare/workers-oauth-provider` when the
 * client hits an OAuth-protected route (`/api/mcp/pro` or
 * `/api/sse/pro`). The Hono consent handler builds this object via
 * `completeAuthorization({ props })`. Anonymous Phase-1 calls leave
 * `this.props` undefined; tools that need it (i.e. all three new
 * Phase-2 tools) refuse to register in that case.
 *
 *   userId   the magic-link account id
 *   email    used only for audit log lines on the worker side
 *   brainId  the canonical scope for Vectorize lookups — null for
 *            users who have signed in but never produced a pack
 *   tier     'free' until Paddle webhook lands and persists a per-
 *            user subscription tier
 */
export type McpProps = {
  userId: string;
  email: string;
  brainId: string | null;
  tier: 'free' | 'pro' | 'pro_plus';
};

/** Embedding model — same one /api/index uses, so Vectorize hits
 *  match the existing indexed corpus exactly. */
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';

/** LLM for the `vozclara_ask_video` RAG path. Free/Pro tier on Llama;
 *  Pro Plus will route through anthropic-stream.ts in a later commit. */
const RAG_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

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

export class VozClaraMcpAgent extends McpAgent<McpEnv, undefined, McpProps> {
  server = new McpServer({
    name: 'vozclara',
    version: '0.2.0',
  });

  async init(): Promise<void> {
    // Phase 1 tool — always registered, works for both the anonymous
    // /api/mcp transport AND the OAuth-protected /api/mcp/pro one.
    this.registerGeneratePack();

    // Phase 2 tools — only register when the OAuth provider has
    // populated `this.props` for this session. Free-tier MCP clients
    // (no Bearer token) never see these in `tools/list`, so they don't
    // get tempted to call something they'd get a 401 on. The brainId
    // check additionally filters out signed-in users who haven't
    // produced a pack yet — there's nothing to search.
    if (this.props?.brainId) {
      this.registerSearchMyLibrary();
      this.registerAskVideo();
      this.registerExportAnki();
    }
  }

  private registerGeneratePack(): void {
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

  /* ─── Phase 2 tools — OAuth-required, scoped to this.props.brainId ──── */

  /**
   * vozclara_search_my_library — semantic search over the user's
   * own packs via Vectorize. Returns ranked chunks with packId
   * references so the caller can deep-link to the full pack page.
   *
   * Free-tier-OK once the user has a brainId; we don't gate this by
   * `tier` because library search is core value. A paid tier could
   * later increase `topK` or add cross-brainId search.
   */
  private registerSearchMyLibrary(): void {
    this.server.registerTool(
      'vozclara_search_my_library',
      {
        title: 'Search the user\'s VozClara library',
        description:
          'Use this when the user asks something like "what did I save about X" or "find the pack on Y". Returns matching Knowledge Pack chunks ranked by semantic relevance, each linked to the full pack on vozclara.app. Only searches the authenticated user\'s own library.',
        inputSchema: {
          query: z
            .string()
            .min(2)
            .max(500)
            .describe('Natural-language search query.'),
          limit: z
            .number()
            .int()
            .min(1)
            .max(10)
            .default(5)
            .describe('Maximum number of results to return (1-10, default 5).'),
        },
      },
      async ({ query, limit }) => {
        const brainId = this.props?.brainId;
        if (!brainId) return errorContent('No library attached to this account yet.');
        if (!this.env.VECTORIZE) return errorContent('Vector search backend unavailable.');

        // Embed the query with the same model /api/index uses, so
        // distances are comparable to the indexed corpus.
        let queryVector: number[];
        try {
          const emb = await this.env.AI.run(EMBEDDING_MODEL, { text: [query] });
          // Workers AI returns either { data: number[][] } or a flat
          // array depending on model version. Coerce to a single
          // 768-dim vector.
          const raw = (emb as { data?: number[][] }).data ?? (emb as { vectors?: number[][] }).vectors;
          if (!raw || !Array.isArray(raw) || raw.length === 0) {
            throw new Error('embed_empty_response');
          }
          queryVector = raw[0];
        } catch {
          return errorContent('Failed to embed query.');
        }

        let matches: Array<{ id: string; score: number; metadata?: Record<string, unknown> }>;
        try {
          const res = await this.env.VECTORIZE.query(queryVector, {
            topK: limit,
            filter: { brainId },
            returnMetadata: true,
          });
          matches = res.matches;
        } catch {
          return errorContent('Vector search failed.');
        }

        if (matches.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'No matches in your library yet. Try a different query, or generate a pack first.',
              },
            ],
          };
        }

        // Dedupe by packId — multiple chunks of the same pack often
        // all match. We surface the strongest chunk per pack so the
        // LLM gets one row per source, not a cluster.
        const seen = new Set<string>();
        const rows: string[] = [];
        const structured: Array<{
          packId: string;
          packTitle: string;
          score: number;
          chunkKind: string;
          chunkPreview: string;
          packUrl: string;
        }> = [];
        for (const m of matches) {
          const meta = m.metadata ?? {};
          const packId = String(meta.packId ?? '');
          if (!packId || seen.has(packId)) continue;
          seen.add(packId);
          const title = String(meta.packTitle ?? meta.title ?? 'Untitled pack');
          const kind = String(meta.kind ?? 'chunk');
          const text = String(meta.text ?? '');
          const url = `https://vozclara.app/pack/${packId}`;
          rows.push(
            `• **${title}** _(${kind}, score ${m.score.toFixed(2)})_\n  ${text.slice(0, 220)}${text.length > 220 ? '…' : ''}\n  → ${url}`,
          );
          structured.push({
            packId,
            packTitle: title,
            score: m.score,
            chunkKind: kind,
            chunkPreview: text.slice(0, 280),
            packUrl: url,
          });
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `Top ${rows.length} match${rows.length === 1 ? '' : 'es'} in your VozClara library:\n\n${rows.join('\n\n')}`,
            },
          ],
          structuredContent: { results: structured, brainId },
        };
      },
    );
  }

  /**
   * vozclara_ask_video — RAG over a single pack's transcript +
   * structured chunks. The user asks a question, we pull the most
   * relevant chunks for that specific packId from Vectorize, then
   * pass them to Llama with a citation-aware prompt.
   *
   * Limited to one pack per call by design — cross-pack synthesis
   * lives behind `vozclara_search_my_library` (find packs first) +
   * a second `ask_video` call (drill in). Forces the caller to be
   * explicit about scope, which keeps the answer grounded.
   */
  private registerAskVideo(): void {
    this.server.registerTool(
      'vozclara_ask_video',
      {
        title: 'Ask a question about a specific saved pack',
        description:
          'Use this once you know which pack the user means — typically after a `vozclara_search_my_library` call returned a packId. Provides RAG-grounded answers strictly from that pack\'s indexed content with inline citations.',
        inputSchema: {
          pack_id: z
            .string()
            .min(4)
            .max(40)
            .describe('The packId from the user\'s library (returned by vozclara_search_my_library).'),
          question: z
            .string()
            .min(3)
            .max(500)
            .describe('Natural-language question to answer from the pack.'),
        },
      },
      async ({ pack_id, question }) => {
        const brainId = this.props?.brainId;
        if (!brainId) return errorContent('No library attached to this account yet.');
        if (!this.env.VECTORIZE) return errorContent('Vector search backend unavailable.');

        // Embed the question, then query Vectorize scoped to this
        // exact pack. brainId is doubled up in the filter so a leaked
        // packId can't be used to query another user's pack.
        let queryVector: number[];
        try {
          const emb = await this.env.AI.run(EMBEDDING_MODEL, { text: [question] });
          const raw = (emb as { data?: number[][] }).data ?? (emb as { vectors?: number[][] }).vectors;
          if (!raw || !Array.isArray(raw) || raw.length === 0) {
            throw new Error('embed_empty_response');
          }
          queryVector = raw[0];
        } catch {
          return errorContent('Failed to embed question.');
        }

        let matches: Array<{ id: string; score: number; metadata?: Record<string, unknown> }>;
        try {
          const res = await this.env.VECTORIZE.query(queryVector, {
            topK: 6,
            filter: { brainId, packId: pack_id },
            returnMetadata: true,
          });
          matches = res.matches;
        } catch {
          return errorContent('Vector search failed.');
        }

        if (matches.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Couldn't find indexed content for pack \`${pack_id}\`. The pack may not be indexed yet — open it on vozclara.app once to trigger indexing.`,
              },
            ],
            isError: true,
          };
        }

        // Build a compact context block for the LLM. Each chunk shows
        // its kind (summary/key_idea/quote/etc) so the model can pick
        // an appropriately specific citation.
        const contextBlock = matches
          .map((m, i) => {
            const meta = m.metadata ?? {};
            const kind = String(meta.kind ?? 'chunk');
            const text = String(meta.text ?? '').slice(0, 600);
            return `[${i + 1}] (${kind}) ${text}`;
          })
          .join('\n\n');

        const packTitle = String(matches[0]?.metadata?.packTitle ?? matches[0]?.metadata?.title ?? 'this pack');
        const systemPrompt =
          `You are answering a question about a single Knowledge Pack the user has saved. ` +
          `Answer strictly from the CONTEXT below — do not invent facts. ` +
          `Cite chunks inline using their [n] numbers. ` +
          `If the context doesn't contain the answer, say so plainly. ` +
          `Keep the answer under three paragraphs.`;
        const userPrompt = `PACK: ${packTitle}\n\nCONTEXT:\n${contextBlock}\n\nQUESTION:\n${question}`;

        let answer: string;
        try {
          const out = await this.env.AI.run(RAG_MODEL, {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 800,
            temperature: 0.3,
          });
          answer =
            typeof out.response === 'string'
              ? out.response
              : JSON.stringify(out.response ?? out);
        } catch {
          return errorContent('LLM generation failed.');
        }

        const packUrl = `https://vozclara.app/pack/${pack_id}`;
        return {
          content: [
            { type: 'text' as const, text: answer },
            {
              type: 'text' as const,
              text: `\n\n— Source: pack "${packTitle}" → ${packUrl}\n— AI-generated by VozClara using Llama 3.3 70B. Verify against the original.`,
            },
          ],
          structuredContent: {
            packId: pack_id,
            packTitle,
            packUrl,
            chunksUsed: matches.length,
            provenance: {
              model: 'llama-3.3-70b-instruct',
              watermark: 'vozclara.app',
            },
          },
        };
      },
    );
  }

  /**
   * vozclara_export_anki — return a deep-link the user opens in their
   * browser to download a .apkg of the named pack. The actual .apkg
   * assembly happens client-side (the pack lives in IndexedDB), so
   * this tool can't ship the bytes itself; it composes the URL +
   * tells the LLM how to surface it.
   *
   * Why not server-side: pack data is intentionally local-first
   * (CLAUDE.md §1.1 — packs persist in IndexedDB, Vectorize holds
   * only chunk indexes, not the full pack record). A future commit
   * could add a per-user pack sync layer; until then the deep-link
   * is the honest path.
   */
  private registerExportAnki(): void {
    this.server.registerTool(
      'vozclara_export_anki',
      {
        title: 'Build an Anki export link for a saved pack',
        description:
          'Use this when the user wants the flashcards from a saved pack as an Anki deck. Returns a deep-link URL the user opens in the browser to download the .apkg file — the actual assembly happens client-side from their local library.',
        inputSchema: {
          pack_id: z
            .string()
            .min(4)
            .max(40)
            .describe('The packId from the user\'s library (returned by vozclara_search_my_library).'),
        },
      },
      async ({ pack_id }) => {
        if (!this.props?.brainId) {
          return errorContent('No library attached to this account yet.');
        }
        // Cheap server-side existence check: if Vectorize has at
        // least one chunk for (brainId, packId), the pack exists in
        // this user's library. We can't validate the IndexedDB copy,
        // but this catches typos.
        if (this.env.VECTORIZE) {
          try {
            const probe = await this.env.VECTORIZE.query(new Array(768).fill(0), {
              topK: 1,
              filter: { brainId: this.props.brainId, packId: pack_id },
              returnMetadata: true,
            });
            if (probe.matches.length === 0) {
              return errorContent(
                `No pack with id \`${pack_id}\` in your library, or it hasn't been indexed yet.`,
              );
            }
          } catch {
            // Don't fail the export on a search hiccup — fall through
            // and let the client decide whether the pack exists.
          }
        }

        const exportUrl = `https://vozclara.app/pack/${pack_id}?export=anki`;
        return {
          content: [
            {
              type: 'text' as const,
              text:
                `Anki export ready. Open this link in your browser to download the .apkg file:\n\n${exportUrl}\n\n` +
                `The deck assembly happens client-side from your local VozClara library — make sure you're signed in on the same browser where you generated the pack.`,
            },
          ],
          structuredContent: {
            packId: pack_id,
            exportUrl,
            format: 'apkg',
            note:
              'Client-side export. User must open the URL in the same browser session that holds the pack.',
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
  // Supadata's `data.lang` is unreliable — it sometimes reflects their
  // server-side default (EU → `de`) instead of the actual audio
  // language. We trust our own common-word heuristic on the transcript
  // first and only fall back to Supadata's hint when our detector
  // can't reach a confident verdict. Functionally not critical (the
  // Llama prompt is cross-lingual either way) but it keeps the
  // sourceLanguage field on the Pack schema honest.
  const detected = detectLanguageFromText(text);
  return { text, lang: detected ?? data.lang ?? 'unknown' };
}

/**
 * Lightweight 4-language detector based on stop-word frequency in the
 * first ~1k chars. Returns null when no language wins by a meaningful
 * margin so the caller can fall back to whatever the source provided.
 * No external dep — single pass, deterministic, ~µs to run.
 */
function detectLanguageFromText(text: string): string | null {
  const sample = ` ${text.toLowerCase().slice(0, 1000)} `;
  const markers: Record<string, string[]> = {
    // High-frequency stop words with leading + trailing spaces so we
    // don't match substrings inside larger words.
    en: [' the ', ' and ', ' is ', ' of ', ' to ', ' a ', ' in ', ' that ', ' it ', ' for '],
    de: [' der ', ' die ', ' und ', ' ist ', ' ein ', ' nicht ', ' das ', ' den ', ' wir ', ' auch '],
    es: [' el ', ' la ', ' que ', ' de ', ' en ', ' es ', ' un ', ' los ', ' por ', ' con '],
    pt: [' o ', ' a ', ' que ', ' de ', ' não ', ' um ', ' é ', ' uma ', ' para ', ' com '],
  };
  const scores: Record<string, number> = {};
  for (const [lang, words] of Object.entries(markers)) {
    let n = 0;
    for (const w of words) n += sample.split(w).length - 1;
    scores[lang] = n;
  }
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [first, second] = ranked;
  // Require an absolute hit count and a comfortable margin over the
  // runner-up; otherwise treat as ambiguous and let the caller decide.
  if (first[1] >= 3 && first[1] >= second[1] * 1.5) return first[0];
  return null;
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
