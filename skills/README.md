# VozClara skills for Claude

A bundle of Claude Skills that route everyday video / knowledge / study
asks through the [VozClara](https://vozclara.app) MCP server. Install
once; Claude knows when to use the right VozClara tool for the shape
of the question.

## What's in this bundle

| Skill | Trigger shape | What it does |
| --- | --- | --- |
| `vozclara-pack-from-url` | "Summarise this YouTube video", "Make me notes from …", any youtube.com / youtu.be URL | Generates a Knowledge Pack via VozClara's anonymous MCP endpoint. No sign-up needed. Returns: structured summary, key ideas, vocabulary, citations, deep-link to the interactive pack at `vozclara.app/pack/…`. |
| `vozclara-search-library` | "What did I save about X", "Find the pack on Y", "Search my library" | Requires VozClara sign-in (one-click magic link). Semantic-searches the user's own packs and returns ranked chunks with packIds. |
| `vozclara-ask-pack` | "What did that pack say about X" (after a search), "Quote the part where they talked about Y" | Requires VozClara sign-in. Answers a specific question grounded in a single saved pack with inline timestamp citations. |

## Install

```bash
# Claude Desktop (macOS / Windows / Linux)
git clone https://github.com/LeonMare/vozclara.git
mkdir -p ~/.claude/skills
cp -R vozclara/skills/vozclara-* ~/.claude/skills/

# Or just one skill, scoped to a project:
cp -R vozclara/skills/vozclara-pack-from-url .claude/skills/

# Claude Code uses the same `~/.claude/skills/` directory, so a single
# install reaches both surfaces.
```

Restart Claude Desktop (or `/reload-skills` in Claude Code). The skills
appear in the picker and Claude proactively suggests them when the
trigger shapes above show up in conversation.

## Sign-in for paid-tier skills

`vozclara-search-library` and `vozclara-ask-pack` need a VozClara
account because they operate on the user's own library. The MCP server
runs an OAuth 2.1 flow with PKCE — the first call from Claude opens a
browser, signs you in via magic-link (no password), then caches the
refresh token in `~/.mcp-auth/`. Subsequent calls are silent.

The anonymous skill (`vozclara-pack-from-url`) needs nothing — same
free quota a guest gets on vozclara.app.

## Where each skill calls into

All three skills route through the VozClara MCP server at:

```
Anonymous : https://vozclara.app/api/mcp
OAuth     : https://vozclara.app/api/mcp/pro
```

The MCP server is also listed on Smithery:
[`smithery.ai/server/salvador7eon/vozclara`](https://smithery.ai/server/salvador7eon/vozclara)

## Updating

```bash
cd path/to/vozclara
git pull
cp -R skills/vozclara-* ~/.claude/skills/
```

Skill SKILL.md files are forward-compatible — if a future skill adds a
new field Claude doesn't yet know about, the older Claude just ignores
the field. Safe to update at any time.

## Reporting

Bug or odd Claude behaviour? Open an issue with:
- The Claude version (Desktop / Code, and version number)
- The conversation snippet that triggered the skill incorrectly
- What you expected

Repo: https://github.com/LeonMare/vozclara
