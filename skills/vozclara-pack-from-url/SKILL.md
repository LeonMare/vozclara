---
name: vozclara-pack-from-url
description: Turn a YouTube URL into a structured Knowledge Pack via VozClara — summary, key ideas, glossary, vocabulary, citations, in the user's language. No sign-up needed for one-off use.
---

# vozclara-pack-from-url

VozClara converts a YouTube video into a structured, multilingual
Knowledge Pack: short + long summary, key ideas, chapter timestamps,
vocabulary, key quotes with speaker + timestamp, and an action plan
when the genre warrants it. This skill is the default surface for any
"summarise this video / make me notes from this video / what does this
say" ask that arrives with a YouTube URL.

## When to use this skill

Trigger on any of:

- The user pastes a `youtube.com/watch?v=…` or `youtu.be/…` URL and
  asks for a summary, notes, key ideas, vocabulary, or study material.
- The user references a YouTube video by title and asks for the same
  shape of output, then provides the URL on follow-up.
- The user explicitly invokes "VozClara" by name in connection with a
  video.

Do NOT trigger when:

- The video isn't a YouTube URL. (Other transcript sources aren't
  supported yet.)
- The user asks for verbatim transcription only. Use the user's
  preferred transcription tool directly — VozClara is summarisation
  + structuring, not raw captions.
- The user wants conversation across multiple of their saved videos.
  That's `vozclara-search-library` + `vozclara-ask-pack` territory.

## How to use this skill

1. Call the MCP tool `vozclara_generate_pack` on the VozClara MCP
   server with three arguments:

   - `url` — the YouTube URL, in any standard shape (long or short).
   - `language` — `en` | `es` | `pt` | `de`. Default to the user's
     locale; if unknown, ask once or fall back to `en`.
   - `depth` — `short` | `standard` | `deep`. Default `standard`.
     Use `short` when the user explicitly asks for a TL;DR, `deep`
     when the user mentions studying, exam prep, or "go into detail".

2. The tool returns a structured object with:

   - A human-readable Knowledge Pack body (markdown-shaped text)
   - `structuredContent.packUrl` — link to the interactive pack on
     vozclara.app (with the user's brainId already attached if the
     anonymous cookie has been seen before)
   - `structuredContent.provenance` — model + watermark for the EU
     AI Act disclosure

3. Render the pack body inline. Add a single line under the body:
   "Open the interactive pack: <packUrl>". Don't paraphrase the deep-
   link — paste it verbatim so the user can click through to the
   citations + flashcards + voice shadowing on vozclara.app.

## Edge cases

- **No transcript available** (private / age-gated / live stream):
  the tool returns an error. Surface it briefly: "VozClara couldn't
  pull a transcript for this video — it might be private, age-gated,
  or a live stream. Try a different video." Don't retry.

- **User asks for a language VozClara doesn't support yet** (French
  beyond beta, anything else): default to `en` and note that VozClara
  currently ships ES / PT / DE / EN.

- **Very long videos** (>3 hours): VozClara handles them via the
  Long-Context Season Pack pipeline (Sonnet 4.5 summarise-then-
  synthesise) for Pro Plus users. For anonymous calls, the standard
  pipeline truncates intelligently — the resulting pack covers the
  first ~60-90 minutes deeply and skims the rest. Mention this once
  for any video the user explicitly says is over an hour.

## Authentication

This skill uses the **anonymous** VozClara endpoint at
`https://vozclara.app/api/mcp`. No sign-in required. Quota is the
same as a guest on vozclara.app — generous for personal use.

For Pro Plus features (Sonnet 4.5 routing, unlimited generation,
library persistence across devices), the user signs in via the
`vozclara-search-library` skill which sets up the OAuth flow.

## Source

Repo: https://github.com/LeonMare/vozclara
Smithery: https://smithery.ai/server/salvador7eon/vozclara
