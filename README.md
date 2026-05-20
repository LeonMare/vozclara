# VozClara

[![Smithery badge](https://smithery.ai/badge/salvador7eon/vozclara)](https://smithery.ai/server/salvador7eon/vozclara)

Multilingual AI study tool. Paste any public video URL → get a structured
Knowledge Pack (summary, key ideas, glossary, quiz, transcript with
timestamps) in your native language: Spanish, Portuguese, German, English.

Live: [**vozclara.app**](https://vozclara.app)
MCP Server: [**smithery.ai/server/salvador7eon/vozclara**](https://smithery.ai/server/salvador7eon/vozclara)

> *Klassisch in der Haltung, modern im Werkzeug.*

---

## MCP integration

VozClara exposes a Model Context Protocol (MCP) server so AI agents
(Claude Desktop, Cursor, Claude Code, Continue, VS Code with Copilot
Chat, etc.) can call it directly.

**One-click install** via Smithery → choose your client → done.

**Manual config** for Claude Desktop (`%APPDATA%\Claude\claude_desktop_config.json` on Windows,
`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "vozclara": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://vozclara.app/api/mcp"]
    }
  }
}
```

Restart Claude Desktop and ask:
> *"Use vozclara to summarise this video in German: https://www.youtube.com/watch?v=…"*

### Available tools

The anonymous endpoint (`/api/mcp`) exposes one tool that works without
sign-in. The OAuth-protected endpoint (`/api/mcp/pro`) adds three tools
that operate on the user's own VozClara library.

| Tool | Endpoint | Inputs | Output |
| --- | --- | --- | --- |
| `vozclara_generate_pack` | `/api/mcp` (anonymous) | `url`, `language` (`es`/`pt`/`de`/`en`), `depth` (`short`/`standard`/`deep`) | Knowledge Pack text + structured metadata + deep-link to the interactive pack on vozclara.app |
| `vozclara_search_my_library` | `/api/mcp/pro` (OAuth) | `query`, optional `limit` (1-10) | Semantic-search hits across the authenticated user's packs, each linked to vozclara.app |
| `vozclara_ask_video` | `/api/mcp/pro` (OAuth) | `pack_id`, `question` | RAG-grounded answer with inline citations, strictly from that one pack |
| `vozclara_export_anki` | `/api/mcp/pro` (OAuth) | `pack_id` | Deep-link URL the user opens to download the `.apkg` deck |

**Authenticated config** (Claude Desktop, paid-tier tools — adds the three
library-scoped tools above):

```json
{
  "mcpServers": {
    "vozclara-pro": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://vozclara.app/api/mcp/pro"]
    }
  }
}
```

On first call `mcp-remote` opens the browser, you sign in with the
magic-link, approve the scopes (`library:read`, `library:write`,
`profile`), and the refresh-token is cached locally — same flow as
GitHub's MCP server.

---

## Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Vite + React 18 + TypeScript + Tailwind on Cloudflare Pages |
| **Worker** | Cloudflare Workers + Durable Objects + KV + D1 + Vectorize |
| **LLM (free / Pro)** | Workers AI · `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| **LLM (Pro Plus)** | Anthropic Claude Sonnet 4.5 via Cloudflare AI Gateway |
| **Transcripts** | Supadata (Merchant-of-Record, licensed) |
| **Embeddings** | `@cf/baai/bge-base-en-v1.5` for semantic search |
| **TTS** | OpenAI `tts-1` (optional, premium narration) |
| **Auth** | Magic-link via Resend, no passwords |
| **Payments** | Paddle (Merchant-of-Record, EU VAT + US sales tax handled) |
| **MCP** | `agents` SDK + `McpAgent` + (Phase 2) `workers-oauth-provider` |
| **Analytics** | Cloudflare Web Analytics (cookieless, no consent banner) |

---

## Local development

Prerequisites: Node 20+, Git.

```sh
# Install
npm install
npm --prefix worker install

# Two terminals — Vite dev server + Wrangler dev
# Terminal A: Vite on :5173
npm run dev
# Terminal B: Wrangler on :8787
npm run worker:dev
```

Vite proxies `/api/*` to `:8787`, so `http://localhost:5173` works
end-to-end.

For the worker to call Supadata locally, drop a `.dev.vars` file inside
`worker/`:

```env
SUPADATA_API_KEY=sd_…
# Optional — enables OpenAI TTS path
OPENAI_API_KEY=sk-…
# Optional — enables Sonnet 4.5 for Pro Plus tier
ANTHROPIC_API_KEY=sk-ant-…
```

The file is git-ignored. Production secrets go through
`wrangler secret put <NAME>` instead.

---

## Deployment

### Frontend → Cloudflare Pages

```sh
npm run build
# Push to GitHub; Cloudflare Pages builds dist/ automatically.
# Custom domain: vozclara.app
```

### Worker → Cloudflare Workers

```sh
cd worker
npx wrangler deploy
```

This deploys the API + MCP server to `vozclara.app/api/*` and the
matching Smithery URL at `https://vozclara--salvador7eon.run.tools`.

---

## Compliance

- **DSGVO Art. 13** — full subprocessor list at [`/privacy`](https://vozclara.app/privacy)
- **DSGVO Art. 17** — server-side account deletion sweeps email + sessions + votes + reviews
- **EU AI Act Art. 50(1)** — AI disclosure banner shown on first generator visit
- **EU AI Act Art. 50(2)** — every exported pack carries an AI-generated watermark
- **Refund policy** — 14-day money-back guarantee at [`/refund`](https://vozclara.app/refund)

---

## Brand

LEON MARÉ Editorial:

- **Colors** — Navy `#0A1A3A`, Gold `#C9A24B`, Creme `#F7F3EC`, Graphit `#1A1A1A`
- **Typography** — Per-locale: Reforma (ES), Adelle Sans (PT), Inter (DE), Tiempos (EN)
- **Tonalität** — classical, declarative, no exclamation marks, no emoji, no superlatives

---

*VozClara · A LEON MARÉ product · Frankfurt am Main · Donostia · Porto*
