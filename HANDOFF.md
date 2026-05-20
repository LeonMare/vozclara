# HANDOFF — Laptop → PC

> Read this first when picking up the session on a different machine.
> Updated: Mi 20.5.2026, 21:30 (end of laptop session).

---

## What today (Mi 20.5.) shipped

**6 completed tasks + 3 sub-fixes + 1 migration. Solid Mittwoch.**

### Tier-1 wins

1. **✅ Paddle Merchant-of-Record live** (#46)
   - Approval came in ~17:15.
   - Embedded Paddle.js overlay live at `/founder`, EU VAT + US sales tax handled.
   - Stripe Founder Payment Link archived.
   - Product `pro_01ks30gafe4te11a1ptf28pxka`, Price `pri_01ks30tgbj097qbtjhebzqyf2z` (€99 one-time, Active).
   - Token + price-id in `.env.production`; `worker/src/founder.ts` comments refreshed.
   - **Smoke-tested end-to-end**: overlay opens, payment page renders (PayPal + Card), MoR disclosure correct, €99 inkl. 15.81 € MwSt. breakdown clean. No actual payment processed.

2. **✅ Phase 2 MCP — OAuth + 3 new tools live** (#45)
   - `vozclara_search_my_library`, `vozclara_ask_video`, `vozclara_export_anki`
   - Endpoint: `https://vozclara.app/api/mcp/pro` + `/api/sse/pro`
   - OAuth via `workers-oauth-provider`, PKCE S256, scopes `library:read` / `library:write` / `profile`
   - Server-side verified: discovery 200, 401-challenge correct (WWW-Authenticate Bearer with resource_metadata).

3. **✅ Compliance Bundle final piece** (#33) — Browser Sentry SDK dropped, cookieless-by-design final. `@sentry/browser` + `@sentry/react` removed from `package.json`; `src/lib/sentry.ts` deleted; `src/main.tsx` no longer imports/calls `initSentry`; `ErrorBoundary` kept with `__VOZCLARA_ERROR_HOOK` future-use seam.

### Tier-2 wins

4. **✅ MCP source-language bug fix** — `worker/src/mcp/agent.ts` `detectLanguageFromText()` heuristic (stop-word frequency, confidence margin 1.5x, min hits 3) overrides Supadata when it falsely defaults to `de`.

5. **✅ Per-pack provenance field** — `src/lib/pack.ts` `PackProvenance { model, lensId?, watermark, generatedAt }`; `GeneratorPage.tsx` populates on creation. Compliance Invariant §1.1 satisfied for all newly-generated packs.

6. **✅ Smithery listing republished** (#47) — README.md updated to Phase 1 + 2 tools (commit `fc5412a`). Smithery auto-rescraped within 2-12h. Listing description still pulls from README lead paragraph (which stays accurate). Tool count remains 1 by design (OAuth tools aren't auto-discoverable).

7. **✅ MCP Beat posts drafted** (#48 partial) — X-thread + LinkedIn long-form + Reddit r/ClaudeAI in `LAUNCH_POSTS.md` posts 5/6/7. **Not yet published** — scheduled for tomorrow.

8. **✅ Docs consistency sweep** — CLAUDE.md §1.5, MASTER.md, ROADMAP.md, LAUNCH_POSTS.md, worker/src/founder.ts all refreshed from Stripe/in-review → Paddle/live.

### Production smoke-test (Mi 20.5. 21:00)

All 16 endpoints green: pages (10/10), static assets (4/4), OAuth/MCP (3/3 incl. 401-challenge), Founder API (KV bound, fresh).

---

## Where to pick up on PC

### Tomorrow Donnerstag 21.5. — recommended order

1. **09:00 — X-Thread polish + post** (~30min). Draft in `LAUNCH_POSTS.md` Post 5. US East waking up, good MCP-dev window.
2. **09:30 — LinkedIn long-form post** (~30min). Draft in `LAUNCH_POSTS.md` Post 6.
3. **10:00–14:00 — #40 Anthropic API + AI Gateway Integration deep-work block.**
   - Write `worker/src/anthropic.ts` (API client via Cloudflare AI Gateway endpoint `gateway.ai.cloudflare.com/v1/$ACCT/$GW/anthropic/v1/messages`).
   - Write `worker/src/anthropic-stream.ts` (ReadableStream re-streaming).
   - Write `worker/src/llm-router.ts` (tier-aware: Llama for free/pro, Sonnet 4.5 for pro_plus).
   - CLAUDE.md §7 has the call-pattern (must set `max_tokens`, cache Lens system prompts with `ttl: '1h'`).
   - Unblocks #24 Streaming Pack-Generation + #27 Long-Context Season Pack.
4. **14:00 — Reddit r/ClaudeAI post** (~45min). Reddit engagement window — be at the keyboard first 4h.

### After tomorrow — open Tier-S pre-launch tasks (priority order)

- **#22** Inline Timestamp-Citations + Citation Hover-Replay (signature, 8h + 1.5d)
- **#23** Account-less First Pack — Lovable growth-hack (4h)
- **#27** Long-Context Season Pack (Sonnet 4.5 summarize-then-synthesize, 3d) — depends on #40
- **#29** 3 Demo videos (6h, content)
- **#30** 50 hand-curated public packs per language (6h, content)
- **#31** 10 Mikro-Influencer outreach per language (4h)
- **#35** RUNBOOK.md (90min)

Full task list via `TaskList`.

---

## Known open follow-ups (sub-launch, not blocking)

- **Paddle webhook `transaction.completed`** — currently counter is bumped manually via `POST /api/founder/admin/increment` after each Paddle sale email. Webhook wiring is sub-launch task; needs signature verification + idempotency.
- **FINAL_QA.md still references Stripe** in the QA checklist (lines 16, 109-118, 145, 175). The actual flow it describes is correct in shape but needs a Paddle-pass before the pre-launch QA dry-run.
- **Smithery dashboard manual description override** — optional, only useful if the auto-pulled README lead paragraph ever drifts from the actual elevator pitch. Not needed now.

---

## Git state at handoff

```
HEAD: <will be set after handoff commit>
Branch: main (up to date with origin/main)
Working tree: clean
```

Today's commit chain (oldest → newest):
```
bf134cf docs: add MCP Beat drafts — X / LinkedIn / Reddit r/ClaudeAI
4e7ca31 mcp: wire OAuthProvider — protected /api/mcp/pro + /api/sse/pro routes
36db799 mcp: add three OAuth-required tools (search / ask / export)
88ff1b1 mcp: route /oauth/* and /.well-known/* to the worker
0ffaf6c ci: regenerate package-lock.json — fix Node 26 vs Node 22 lock drift
db2b0b9 ci: regenerate package-lock.json with npm 10 to match CI runner
fbdf6d5 founder: migrate Stripe Payment Link to embedded Paddle overlay
5304b9d founder: paste live Paddle client-token into .env.production
d954048 ci: regenerate package-lock.json with npm 10 (post paddle install)
546c384 founder: strip trailing =N copy-paste artefact from Paddle token
fc5412a docs: README MCP section updated to Phase 1 + 2
<handoff-commit>: docs: laptop→PC handoff — refresh stale Stripe/Phase-2 refs + HANDOFF.md
```

---

## Reminders that bit us today

- **Node 26 + npm 11 produces lockfiles incompatible with CI Node 22 + npm 10.** Always regenerate `package-lock.json` via `npx -y npm@10 install` after dependency changes. CI failed twice today on this exact thing.
- **Paddle "Something went wrong" with status 400 on `transaction-checkout`** — root cause was the **Default Payment Link** in Paddle's Checkout Settings being unset. Set it to `https://vozclara.app/founder` and the overlay starts working immediately. (Token length was a red herring; Paddle's live tokens can be shorter than expected.)
- **Safari DevTools Console is in the menubar `Entwickler` menu**, NOT in Settings → Developer (that's just the toggle to *show* the menu).
