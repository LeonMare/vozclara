# HANDOFF — Fr 22.5. Mittag (PC → Laptop)

> Read this first when picking up the session on a different machine.
> Updated: Fr 22.5.2026 ~12:30 (end of PC #40-validation sprint).

---

## What shipped today (Fr 22.5. morning PC session)

**8 commits + 3 secret rotations + 1 production deploy. Tight half-day sprint.**

### Tier-1 wins

1. **✅ #40 Anthropic API + AI Gateway end-to-end live** (commits `a225c2c`, `454e415`, `b8d79be`, `f7b6d07`)
   - `worker/src/anthropic.ts` — typed client, BYOK via `x-api-key`, classified errors
   - `worker/src/anthropic-stream.ts` — SSE pass-through + tee'd parser for usage logging
   - `worker/src/llm-router.ts` — tier-aware: `free`/`pro` → Llama, `pro_plus` → Sonnet 4.5
   - `worker/src/index.ts` — handleInsights now calls `callLLM({ tier: 'free' })` (first consumer)
   - `cf-aig-authorization: Bearer ${CF_AIG_AUTH_TOKEN}` header sent — required because the `vozclara-prod` Gateway is configured as **Authenticated** (defense-in-depth on top of BYOK)
   - **Production-verified end-to-end**:
       - Test 1 (tier=free): Llama 3.3 70B, 2.6s, German Compound Interest output
       - Test 2 (tier=pro_plus): `claude-sonnet-4-5-20250929`, 2.8s, 28in/57out tokens
       - All four hops green: Worker → Gateway (auth'd) → Anthropic → Sonnet 4.5
   - Cache-hit test inconclusive — our 13-token smoke prompt is below Anthropic's 1024-token cache threshold; real Lens prompts (2-5k tokens) will hit the cache path

2. **✅ `/api/admin/llm-smoke` endpoint** (commit `b8d79be`)
   - Admin-gated POST, takes `?tier=free|pro|pro_plus` query
   - Returns `{ ok, provider, model, text, usage, stop_reason, latency_ms }`
   - Permanent diagnostic tool for future key rotations, Gateway changes, tier-routing debugging
   - Auth gates on `ADMIN_TOKEN` (same secret as `/api/founder/admin/*`)

3. **✅ 3 secrets rotated this morning** (all in password manager):
   - `ADMIN_TOKEN` — rotated twice (initial gen was leaked in screenshot; final value is the one in the password manager)
   - `ANTHROPIC_API_KEY` — new key `vozclara-worker-prod-2026-05-22` (old `sk-ant-api03-i1v...QQAA` rotated because the worker had a mismatched value with "Never used" status on the console)
   - `CF_AIG_AUTH_TOKEN` — new authentication token `vozclara-worker-prod-2026-05-22` from the AI Gateway (first attempt copied the curl example snippet by mistake; second attempt got the bare 40-char token)

### Tier-2 wins

4. **✅ LAUNCH_POSTS.md polished** (commit `db5cc64`)
   - Fixed `@salvador7eon` → `salvador7eon` typo in Smithery URL (4 occurrences)
   - Rewrote tweet 4 + LinkedIn closer + Reddit "What I deferred" to reflect Phase 2 OAuth shipped status instead of "next sprint"
   - Posts 5/6/7 ready to publish from LEON MARÉ social accounts (created afternoon Fr 22.5.)

### Production smoke-test (Fr 22.5. ~12:00)

```
GET  /api/founder/status              → 0/100 ✅
POST /api/mcp (initialize)            → MCP server v0.2.0, tools.listChanged ✅
POST /api/admin/llm-smoke?tier=free   → Llama 3.3 70B, 2.6s ✅
POST /api/admin/llm-smoke?tier=pro_plus → Sonnet 4.5, 2.8s ✅
Worker version deployed: 2556b5f4-85a6-4650-af58-e1ba34b93b30
```

---

## Where to pick up on Laptop

### Recommended Fr 22.5. afternoon order

1. **~14:00 — LEON MARÉ social media setup** (~2h block, see prior chat for the matrix)
   - Tier 1: LinkedIn personal (Christian Leon) + Company Page (LEON MARÉ) — 45 min
   - Tier 1: Instagram `@leonmare` — 30 min
   - Tier 2 (claim, don't activate): X / Twitter, TikTok, Bluesky, YouTube — 35 min total
   - **Do NOT publish first posts yet** — wait for leonmare.de website to finish (separate session this week)
2. **Watch Paddle inbox + cursor.directory + mcp.so approval emails** — both still in moderation queue
3. **Optional: post Reddit r/ClaudeAI** when karma ≥ 50 (otherwise content lands in megathread)

### Open follow-ups (sub-launch, sized)

- **F** — MCP-agent `vozclara_generate_pack` through `callLLM` (~20 min). Phase 2 OAuth already populates `this.props?.tier`, so Pro Plus MCP users get Sonnet 4.5 instantly once wired.
- **E** — Tier extraction in `handleInsights` (~45 min). Read auth cookie → user → `user.tier`. Currently hardcoded `tier: 'free'` — that's the gating step before Pro Plus users actually get Sonnet on the web path.
- **G** — Streaming layer (~60 min). Normalise Workers-AI chunks into Anthropic-SSE-shape events so frontend code is provider-agnostic. Unblocks #24 Streaming Pack-Gen and #27 Long-Context Season Pack.
- **Awesome MCP Servers PR** to github.com/punkpeye/awesome-mcp-servers — ~15 min when in PR-writing mood.
- **#22 Inline Timestamp-Citations** (signature, 8h + 1.5d)
- **#29 3 demo videos** (6h content)
- **#30 50 hand-curated public packs per language** (6h content)
- **#35 RUNBOOK.md** (90min — launch-week incident response)

---

## Live secrets inventory (production worker)

`npx wrangler secret list` shows these in `vozclara-transcript`:

```
ADMIN_TOKEN              — admin endpoints (founder/* + llm-smoke)
ANTHROPIC_API_KEY        — BYOK passthrough to Anthropic via Gateway
AUTH_FROM_ADDRESS        — Resend "from" header
CF_AIG_AUTH_TOKEN        — Authenticated Gateway entry token (NEW)
PADDLE_WEBHOOK_SECRET    — HMAC verification for transaction.completed
RESEND_API_KEY           — Resend API key (magic-link sign-in + refunds)
SENTRY_DSN               — worker-side Sentry
SITE_URL                 — non-secret legacy, still present
SUPADATA_API_KEY         — transcript provider
VAPID_PRIVATE_KEY        — web push
VAPID_PUBLIC_KEY         — web push
VAPID_SUBJECT            — web push
```

All three rotated-today secrets are stored in the user's password manager. No temp files are left on disk (the `*-temp.txt` files were deleted after the smoke completed).

---

## Git state at handoff

```
HEAD: f7b6d07
Branch: main (up to date with origin/main)
Working tree: clean
Production worker version: 2556b5f4-85a6-4650-af58-e1ba34b93b30
```

Today's commit chain (oldest → newest, 5 code commits + this handoff):
```
db5cc64  docs: polish MCP-beat posts 5/6/7 for posting today
a225c2c  worker: add Anthropic API client + SSE stream helper + LLM router
454e415  worker: route generateInsights through callLLM (first router consumer)
b8d79be  worker: add /api/admin/llm-smoke for tier-aware router validation
f7b6d07  worker: add cf-aig-authorization header for Authenticated AI Gateway
```

---

## Reminders that bit us today (and how the next session avoids them)

- **Never echo secrets, even partial.** Asked the user to `head -c 10 $TOKEN` to verify load — that printed 10 chars of the real ADMIN_TOKEN into the screenshot. Better verifier: `[ -n "$TOKEN" ] && echo "$(echo -n "$TOKEN" | wc -c) chars loaded"` (length only, no content).
- **CF Dashboard "Create Token" dialog shows a usage example next to the bare token.** First copy attempt grabbed the entire `curl -H "Authorization: Bearer ..."` snippet (148 bytes), not just the token (40-53 chars). Diagnostic to catch this: `wc -c` on the file + check for spaces / quotes / "cur" prefix before pushing.
- **`vozclara-prod` AI Gateway is Authenticated.** Default BYOK request from the Worker returns 401 internalCode 2009 without the `cf-aig-authorization: Bearer ${CF_AIG_AUTH_TOKEN}` header. This is intentional — defense-in-depth — so leave it on.
- **"Last used: Nie" on a CF/Anthropic key while the worker secret exists** means the worker has a DIFFERENT key value than the one shown in the dashboard (typo / wrong key on `wrangler secret put`). Always rotate when this happens rather than guessing.

---

## Quick re-orientation for the laptop session

```bash
cd ~/Documents/vozclara          # adjust path
git pull                          # should pick up f7b6d07
# everything compiles + bundles cleanly; no install needed
# production worker is already at version 2556b5f4 — no redeploy needed
```

Read CLAUDE.md §1.5 (Tech Stack invariants) + MASTER.md §1.2 (Payments + MCP rows) before any architecture-touching change. Today's invariant additions:
  - LLM router (`worker/src/llm-router.ts`) is now the single source of truth for tier-aware model selection — handlers should not call `env.AI.run` directly for tier-routed code paths
  - `CF_AIG_AUTH_TOKEN` is mandatory in production; absent it, Anthropic path returns 401
