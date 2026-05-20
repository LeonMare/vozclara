# HANDOFF — Do 21.5. Morgen → Fr 22.5.

> Read this first when picking up the session on a different machine.
> Updated: Do 21.5.2026 mid-morning (end of PC quick-cleanup sprint).

---

## What shipped today (Do 21.5. morning, PC session)

**8 commits. Pure cleanup + distribution-multiplier sprint.**

### Cleanup wins

1. **✅ FINAL_QA.md Stripe→Paddle sweep** (commit `00306eb`)
   - Setup block: Stripe-test-mode toggle → Paddle env check + Paddle dashboard tab
   - Block G (Founder Deal): "new-tab Stripe Checkout" → "embedded Paddle.js overlay in-page" with VAT breakdown notes
   - Block K (Sentry): reframed as worker-side only (browser SDK dropped Mi 20.5.)
   - Go/No-Go list: Paddle smoke + webhook-or-manual gate + MCP server smoke + Smithery score check

2. **✅ Paddle `transaction.completed` webhook** (commit `57e1c44`)
   - `worker/src/founder.ts handleFounderWebhook(req, env)` — full HMAC-SHA256 verification, ±5min replay window, AUTH KV idempotency dedupe with 7d TTL, only counts `transaction.completed` events with our Founder price-id
   - Wired in `worker/src/index.ts` at `POST /api/founder/webhook`
   - Production-tested end-to-end with Paddle's "Send test event" simulator → `Response 200 {"ok":true,"ignored":"not_founder_price"}` (test payload had non-Founder price, correctly ignored, counter stayed 0)
   - All 5 negative tests pass (no_signature / bad_signature_format / stale_signature / bad_signature / counter_unchanged)
   - PADDLE_WEBHOOK_SECRET set in production via `wrangler secret put`
   - Paddle dashboard: Notifications → Webhook destination `https://vozclara.app/api/founder/webhook`, events = `transaction.completed` only, usage = `Both` (production + simulation)

3. **✅ Smithery dev-focused description override**
   - Long-form Markdown description with tools table, install snippet, stack table, pricing, compliance
   - Replaces auto-pulled README lead paragraph
   - 4h Smithery CDN cache propagation — fully live by end of Mi 21.5. evening

4. **✅ Resend key leak scrub** (commit `6d4f7a5`)
   - LAUNCH_PLAN.md line 527 had a leaked-in-chat Resend key from the early PC handover
   - Verified on Resend dashboard: key not in account (already revoked / never landed)
   - Replaced "rotate this — KRITISCH" with "✅ DONE, verified inactive" note
   - One occurrence remains in git history (commit `00d1ed2`) — harmless because the key it references is dead
   - History rewrite considered + skipped (force-push risk > payoff once key is revoked)

### Distribution multiplier wins

5. **✅ Repo public** + GitHub Topics set
   - Settings → Danger Zone → Change visibility → Public
   - About panel → ⚙️ → Topics: `mcp mcp-server model-context-protocol youtube ai language-learning multilingual smithery cloudflare-workers study-tools`
   - Description + Website filled
   - GitHub-search now discoverable via `topic:mcp-server`; Glama / PulseMCP auto-scrapers will pick us up within 6-24h

6. **✅ MCP icon reverted to simpler VC monogram** (commit `a1d469c`)
   - User preference: Georgia + single 6 px gold frame + V and C at same size, 30% overlap (commit 6487853 snapshot)
   - Reverted from the Cambria + double-rule + size-hierarchy iteration (more polished but read as fussier at small sizes)
   - Same mark across all surfaces (Smithery, mcp.so, vozclara.app/mcp-icon.png) for brand consistency

7. **✅ `mcp.json` Open Plugins manifest** (commit `a82941e`)
   - At repo root, minimal `servers` block with two entries:
     - `vozclara` → `/api/mcp` (anonymous, free-tier)
     - `vozclara-pro` → `/api/mcp/pro` (OAuth, library:read+write+profile)
   - Originally included full metadata (name/description/icon/tags/etc.) but cursor.directory's parser walked every top-level key and produced 13 garbage components — stripped to just `servers` so the parser produces the expected 1-2 server components
   - Future use: any IDE/tool that follows Open Plugins or the MCP standard can copy-paste this config

8. **✅ Submitted to mcp.so + cursor.directory**
   - **mcp.so**: salvador7eon/vozclara, full metadata (avatar, github repo, server config, tags, Markdown content), status `created` → in moderation (1-7 days typical)
   - **cursor.directory**: vozclara plugin with 1 MCP Server component, in moderation (1-3 days typical)

### Production smoke-test (Do 21.5. ~mid-morning)

- `/api/founder/status` → 0/100 (counter unchanged after webhook simulator)
- `/api/founder/webhook` → 401 on every negative path (no sig / bad format / stale / wrong HMAC), 200 on Paddle's real test event
- `/api/mcp` initialize → 200 with `tools.listChanged: true` + `serverInfo.name: "vozclara"`
- `/api/mcp/pro` → 401 with WWW-Authenticate Bearer challenge (Phase 2 OAuth working)

---

## Where to pick up Fr 22.5.

### Recommended morning order

1. **09:00 — Check Paddle inbox** for `transaction.completed` from the very first real Founder sale (if any happened overnight). Counter on `/api/founder/status` will auto-bump now thanks to webhook; admin endpoint stays as fallback.
2. **09:15 — Check approval emails** from cursor.directory and mcp.so. Both submissions are in moderation queue. If approved → directory pages exist + can be linked from Marketing posts.
3. **09:30 — Marketing posts polishing + post** (~90min). Drafts in `LAUNCH_POSTS.md` posts 5 (X-thread) / 6 (LinkedIn long-form) / 7 (Reddit r/ClaudeAI). Post sequence:
   - X-thread first (US East waking, MCP-dev window)
   - LinkedIn 30 min later
   - Reddit at 14:00 local (Reddit engagement window)
4. **10:30–14:30 — DEEP: #40 Anthropic API + AI Gateway** (4h)
   - Write `worker/src/anthropic.ts` (API client via `gateway.ai.cloudflare.com/v1/$ACCT/$GW/anthropic/v1/messages`)
   - Write `worker/src/anthropic-stream.ts` (ReadableStream re-streaming)
   - Write `worker/src/llm-router.ts` (tier-aware: Llama for free/pro, Sonnet 4.5 for pro_plus)
   - CLAUDE.md §7 has the canonical call-pattern (must set `max_tokens`, cache Lens system prompts with `ttl: '1h'`)
   - Unblocks #24 Streaming Pack-Generation + #27 Long-Context Season Pack

### Stretch / lower-priority

- **F**: OAuth-flow end-to-end test from Claude Desktop against `/api/mcp/pro` — Phase 2 smoke. ~30-60 min.
- **#22** Inline Timestamp-Citations + Citation Hover-Replay (signature feature, 8h + 1.5d)
- **#23** Account-less First Pack — Lovable growth-hack (4h)
- **#29** 3 demo videos (6h)
- **#30** 50 hand-curated public packs per language (6h, content sprint)
- **#35** RUNBOOK.md launch-week incident response (90min)

---

## Open follow-ups (sub-launch, not blocking)

- **Awesome MCP Servers PR** to https://github.com/punkpeye/awesome-mcp-servers — manual PR, ~15 min. Easy win when Marketing-mood strikes.
- **Official MCP Registry** (registry.modelcontextprotocol.io) — requires npm package publishing first. Phase 3 only.
- **PulseMCP / Glama.ai auto-discovery** — should pick us up within 6-24h of repo going public + having topics. Verify Fr morning.
- **Smithery icon cache** — the polished Cambria icon was uploaded earlier, then we reverted to the simpler Georgia version. Smithery's CDN may or may not re-fetch automatically; if their display still shows an older variant, re-upload via Settings.

---

## Git state at handoff

```
HEAD: a82941e
Branch: main (up to date with origin/main)
Working tree: clean
```

Today's commit chain (oldest → newest, 8 commits):
```
00306eb  qa: sweep FINAL_QA.md Stripe references → Paddle reality
57e1c44  founder: wire Paddle transaction.completed webhook (signature + idempotency)
6d4f7a5  docs: scrub historical Resend key from LAUNCH_PLAN.md ahead of public-repo switch
(no commit) Smithery description override (done via dashboard, not in repo)
(no commit) Repo public + GitHub Topics (done via GitHub UI, not in repo)
a1d469c  brand: revert MCP icon to the simpler VC monogram (Georgia, single frame)
2424826  plugin: add mcp.json so cursor.directory / Open Plugins auto-detect picks us up
a82941e  plugin: minimise mcp.json to just the servers block
```

---

## Reminders that bit us today

- **cursor.directory parser** walks every top-level key in `mcp.json` as a separate "component". Keep `mcp.json` minimal (just `servers`) — metadata that has to live somewhere goes in README + the GitHub About panel (cursor.directory pulls those).
- **GitHub raw cache TTL** is ~2-5 min — after pushing a change to `mcp.json` (or any file Cursor / Smithery / mcp.so scrapes), wait 2 min before Re-scan.
- **Lockfile drift** (Windows npm 10 vs Linux npm 10) — stripped `libc: ["glibc"]` fields from optional deps. Just `git checkout -- worker/package-lock.json` to revert local noise; if CI ever fails, regenerate with `npx -y npm@10 install` from a Linux/CI-equivalent env.
- **Repo private was a silent distribution blocker** — auto-scrapers (Glama, PulseMCP) needed Public visibility before they'd index us. Public-switch was safe after a security sweep (only one historical Resend key in git history, already dead in the live account).
