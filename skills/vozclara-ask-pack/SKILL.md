---
name: vozclara-ask-pack
description: Answer a specific question grounded in a single saved VozClara Knowledge Pack, with inline timestamp citations. Requires VozClara sign-in. Use after vozclara-search-library has narrowed the user to one pack.
---

# vozclara-ask-pack

This is the "deep-read" companion to `vozclara-search-library`. Once
the user has narrowed in on a single pack (either via library search,
or by referencing one they're currently reading), this skill answers
specific questions grounded ONLY in that pack's transcript, with
inline citations back to the original video timestamps.

## When to use this skill

Trigger on any of:

- After `vozclara-search-library` returned a packId the user wants to
  dig into.
- "Tell me more about the X part of [pack title]"
- "Quote the section where they talked about Y"
- "At what timestamp does the speaker mention Z"
- "What's the chapter on [topic] in [pack title]"

Do NOT trigger when:

- The user wants info across multiple packs. Use
  `vozclara-search-library` first; if multiple packs share the answer,
  loop this skill once per packId, then summarise.
- The user is asking about a video they haven't generated a pack for.
  Use `vozclara-pack-from-url` first to create the pack.

## How to use this skill

1. Make sure you have a `packId` in context. If the user named a
   pack by title but no packId is in scope, call
   `vozclara-search-library` first with the title as the query and
   pick the top match.

2. Call the MCP tool `vozclara_ask_video` with:

   - `pack_id` — the packId from search or context
   - `question` — natural-language question, 3-500 chars

3. The tool returns:
   - `answer` — a grounded paragraph, sentences ending in citation
     markers like `[12:34]` that link to the timestamp in the source
     video
   - `confidence` — how strongly the pack's transcript supports the
     answer (low confidence → say so, don't hallucinate)
   - `relevantChunks` — the snippets the answer was grounded in

4. Render the answer verbatim. Keep the `[mm:ss]` markers intact —
   they're the citation contract VozClara users expect. If the user
   asks for a richer view, paste the pack URL:
   `https://vozclara.app/pack/{packId}` — the interactive view shows
   the citations as click-to-jump timestamps inside the embedded
   player.

## Authentication

Uses the same **OAuth-protected** endpoint as
`vozclara-search-library`. If the user hasn't signed in yet, defer to
the sign-in flow described there.

## Low-confidence handling

VozClara returns `confidence: 'low'` when the question can't be
fully answered from the pack's transcript. When that happens:

- Don't paper over it. Say plainly: "This isn't covered in detail in
  the pack — the closest passage is [quote chunk verbatim]."
- Offer the next step: "The full video might cover this — open
  https://vozclara.app/pack/{packId} to scrub through the original."
- Do NOT invent a fluent answer that goes beyond the source. That's
  the kind of hallucination VozClara is built to make impossible.

## Source

Repo: https://github.com/LeonMare/vozclara
Smithery: https://smithery.ai/server/salvador7eon/vozclara
