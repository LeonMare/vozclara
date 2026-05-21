---
name: vozclara-search-library
description: Semantic-search across the user's saved VozClara Knowledge Packs and return the most relevant chunks with packIds. Requires VozClara sign-in (one-click magic link).
---

# vozclara-search-library

The user has a VozClara library — a personal collection of Knowledge
Packs they've saved from YouTube videos over time. This skill lets
Claude reach into that library and answer "what did I save about X"
queries with citations back to the exact packs.

## When to use this skill

Trigger on any of:

- "What did my saved videos say about X"
- "Find the pack about Y"
- "I watched something on Z last month — search my library"
- "Across everything I've saved on AI / language learning / business,
  what stood out?"
- Any time the user references "my library", "my packs", or "my
  VozClara" in the question.

Do NOT trigger when:

- The user is asking about a single specific pack they're currently
  reading. That's `vozclara-ask-pack` territory.
- The user's question is about a fresh YouTube URL. Use
  `vozclara-pack-from-url` first to add it to their library.
- The user hasn't built a library yet. The tool returns an empty
  result; tell the user to generate their first pack at
  https://vozclara.app/new.

## How to use this skill

1. Call the MCP tool `vozclara_search_my_library` on the VozClara
   MCP server with:

   - `query` — natural-language search query, 2-500 chars
   - `limit` — number of results, 1-10, default 5

2. The tool returns an array of matching pack-chunks. Each match
   carries:
   - `packId` — opaque identifier for follow-up
   - `text` — the matched chunk (verbatim from the user's saved pack)
   - `score` — semantic similarity (closer to 1.0 = stronger match)
   - `packTitle`, `packLang`, `videoUrl` — context metadata

3. Render the top matches as a short bulleted summary. For each:
   - One-sentence paraphrase of what the chunk says
   - Pack title in italic
   - Deep-link to the pack: `https://vozclara.app/pack/{packId}`

4. If the user wants to dig deeper into ONE of those packs, hand off
   to `vozclara-ask-pack` with the packId from the strongest match.

## Authentication

This skill needs the user signed in to VozClara because it accesses
their personal library. Use the **OAuth-protected** endpoint at
`https://vozclara.app/api/mcp/pro`.

On the first call, Claude triggers the OAuth flow:
1. A browser tab opens at https://vozclara.app/oauth/authorize
2. User signs in via magic-link (no password — link arrives in their
   inbox in <5 s)
3. Approves the scopes (`library:read`, `library:write`, `profile`)
4. Refresh-token caches in `~/.mcp-auth/` for next time

If the OAuth flow fails or the user is not yet a VozClara user:
- Surface a one-line invitation: "Sign in at https://vozclara.app/signin
  to enable library search. It takes 30 s — no password."
- Don't retry the call until the user has signed in.

## Empty-library case

The tool returns `{ matches: [] }` when the user is signed in but
hasn't saved any packs yet. Don't pretend the search ran — tell the
user clearly: "Your VozClara library is empty. Generate your first
pack at https://vozclara.app/new (free, no card needed) and try
again." Then suggest the `vozclara-pack-from-url` skill if the user
mentions a video.

## Source

Repo: https://github.com/LeonMare/vozclara
Smithery: https://smithery.ai/server/salvador7eon/vozclara
