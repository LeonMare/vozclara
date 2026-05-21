# RUNBOOK — VozClara launch-week incident response

> Solo-founder operational playbook. When something breaks on
> production, this is the document Christian opens first. Every
> section follows the same shape:
> **Symptom → diagnose in 30 s → fix → verify → root-cause later.**
>
> No-one to escalate to — the on-call IS Christian. The "Who to call"
> list at the bottom is for vendors, not humans.
>
> Updated: Do 21.5.2026 — Anthropic API + AI Gateway, Paddle webhook
> auto-tier-grant, and admin-grant-tier-by-email all live. Refresh
> this when the operational surface changes.

---

## 0. Quick reference card

| Surface | URL | Use it for |
| --- | --- | --- |
| **Production frontend** | https://vozclara.app | Smoke check — does the SPA shell load? |
| **Founder counter** | https://vozclara.app/api/founder/status | `{claimed, max, available}` — fastest "is the worker alive" check |
| **OAuth discovery** | https://vozclara.app/.well-known/oauth-authorization-server | Phase-2 MCP heartbeat |
| **Admin LLM smoke** | `POST /api/admin/llm-smoke?tier=…` | Force-exercise Sonnet vs Llama paths |
| **Cloudflare dashboard** | https://dash.cloudflare.com | Worker logs, KV browser, AI Gateway, DNS, Pages |
| **Cloudflare AI Gateway** | dash → AI → AI Gateway → `vozclara-prod` | Anthropic call observability + kill-switch |
| **Anthropic console** | https://console.anthropic.com | Sonnet usage, rate limits, key management |
| **Paddle dashboard** | https://vendors.paddle.com | Sales, webhook status, refunds, customer lookup |
| **Resend dashboard** | https://resend.com/dashboard | Magic-link + refund email delivery |
| **Supadata dashboard** | https://supadata.ai/dashboard | Transcript fetch quota |
| **Sentry** | https://sentry.io | Worker-side error feed (env `SENTRY_DSN`) |
| **GitHub repo** | https://github.com/LeonMare/vozclara | Source + deploy trigger via push |
| **Smithery listing** | https://smithery.ai/server/salvador7eon/vozclara | Public MCP listing |

### Local CLI cheat sheet

```bash
cd /Users/christiang/Projects/vozclara/worker

# Live tail of worker logs (every request)
npx wrangler tail --format pretty

# Roll back to the previous deployed version
npx wrangler rollback

# Push a fresh deploy after a fix
npx wrangler deploy

# List all configured secrets (names only, never values)
npx wrangler secret list

# Read a KV value directly
npx wrangler kv key get --binding=AUTH "founder:counter"
npx wrangler kv key list --binding=AUTH --prefix="founder:"
```

---

## 1. Worker outage / 5xx storm

**Symptom:** `/api/founder/status` returns 5xx, vozclara.app shows
"Application error" or hangs, Sentry suddenly trending up.

### 30-second diagnose

1. Open `https://vozclara.app/api/founder/status` in a fresh tab.
   - 2xx + JSON → worker is up; bug is route-specific (skip to §2-§9).
   - 5xx → worker itself is failing.
   - Times out → Cloudflare zone issue (see §12).
2. Open Cloudflare dashboard → Workers → `vozclara-transcript` → Logs.
   - Last deploy timestamp recent? Suspect: bad deploy.
   - Errors clustered around a single route? Suspect: a handler bug.
   - Errors spread evenly? Suspect: a binding (KV / AI / Vectorize) is
     down — check Cloudflare status page.

### Fix

**If a recent deploy is suspect:**

```bash
cd /Users/christiang/Projects/vozclara/worker
npx wrangler rollback
```

Wrangler prompts for the version id to roll to. Pick the one from
before the bad deploy (timestamps shown). Roll-back is a fresh
deploy of an older bundle — propagates in seconds.

**If a binding is down:** Cloudflare status page should be checked
(<https://www.cloudflarestatus.com>). KV outages are usually
region-localised; Vectorize outages are platform-wide. Nothing to do
client-side except wait + post a banner on /founder if it drags past
30 minutes.

**If unknown cause:** push a fresh deploy of `main` to clear any
edge-cache weirdness:

```bash
npx wrangler deploy
```

### Verify

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://vozclara.app/api/founder/status
curl -s -o /dev/null -w "%{http_code}\n" https://vozclara.app/.well-known/oauth-authorization-server
```

Both 200 → green. Run `wrangler tail` for 60 seconds to confirm
inbound requests are succeeding live.

---

## 2. Paddle webhook outage — sales come in but counter doesn't bump

**Symptom:** Paddle dashboard shows a completed transaction but
`/api/founder/status` claimed-count didn't move. User emails:
"I paid but the page still says I'm not a founder."

### 30-second diagnose

1. Paddle dashboard → Developer Tools → Notifications → destination
   for vozclara.app → Logs.
   - Recent deliveries with non-2xx response? Read the response
     body — our worker returns `{"error":"..."}` JSON with the
     exact reason.
   - Common reasons:
     - `webhook_disabled` → `PADDLE_WEBHOOK_SECRET` secret missing
       on the worker.
     - `bad_signature` / `stale_signature` → wrong secret
       configured (worker secret ≠ Paddle dashboard secret) OR
       clock skew on Paddle side.
     - `not_founder_price` → the transaction was for a different
       price-id (e.g. Pro subscription once we add it) — counter
       intentionally only tracks Founder Deal sales.
   - Deliveries succeeded (2xx) but counter still stale? Read the
     response body — `tier_granted: null` means email-match step
     skipped (Paddle didn't include customer.email on the webhook,
     see §3).

### Fix

**A — Restore the webhook** (signature failure):

```bash
cd /Users/christiang/Projects/vozclara/worker
# Copy the Secret key value from Paddle dashboard:
#   Developer Tools → Notifications → destination → Secret key
# Then push it as the worker secret (interactive prompt):
npx wrangler secret put PADDLE_WEBHOOK_SECRET
```

**B — Manual counter bump** (one-off, while the webhook is broken):

```bash
# Use the ADMIN_TOKEN from the password manager
read -rs ADMIN_TOKEN
curl -s -X POST 'https://vozclara.app/api/founder/admin/increment' \
  -H "X-Admin-Token: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":"manual:paddle_email"}'
```

Returns `{ok:true, claimed: N, max: 100, available: N<100}`.

**C — Manual tier grant on the user's account** (the actual product
fix — without this, they paid but get free-tier output):

```bash
# Same shell, ADMIN_TOKEN already loaded
curl -s -X POST 'https://vozclara.app/api/founder/admin/grant-tier' \
  -H "X-Admin-Token: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@email.com","tier":"pro_plus"}'
```

Returns `{ok:true, userId, oldTier:"free", newTier:"pro_plus"}` or
`{error:"user_not_found"}` (then ask the customer which email they
used to sign up; it may differ from the Paddle email — see §3).

### Verify

`curl -s https://vozclara.app/api/founder/status` shows the bumped
count. Customer logs in, generates a pack — the attribution line
shows "Claude Sonnet 4.5" instead of Llama (this is the smoke
signal that tier actually flipped).

---

## 3. Paddle email ≠ VozClara account email

**Symptom:** Webhook fires, counter bumps, but `tier_granted: null`
in the response. Customer paid with `foo+work@gmail.com`, signed up
with `foo@gmail.com`. Auto-grant skipped.

### Fix

Ask the customer which email they used to sign up. Then run the
`/api/founder/admin/grant-tier` curl from §2C with that email.

This is by design — we never want to silently promote a different
account than the one they intend. The 404 from grant-tier is fine:
it just means the customer should sign up first, then we re-run
with their actual VozClara email.

### Prevention

Long-term fix: surface a "your email used at checkout was X, your
account is Y, click to link them" UI on `/founder?welcome=1`. Not
launch-day work — sub-launch task in `IDEAS.md`.

---

## 4. Anthropic / Sonnet 4.5 outage

**Symptom:** Pro Plus users generating packs see Llama-quality output
instead of Sonnet. `/api/admin/llm-smoke?tier=pro_plus` returns
`provider: "workers-ai"` instead of `provider: "anthropic"`.

### Why this happens automatically

`callLLM` in `worker/src/llm-router.ts` has soft-fallback: when
`AnthropicError.code` is `gateway_misconfigured` or `overloaded`,
the call drops to Llama silently rather than throwing a 500. The
user gets a working response; the provider field tells us what
served it.

### 30-second diagnose

```bash
read -rs ADMIN_TOKEN; echo
curl -s -X POST 'https://vozclara.app/api/admin/llm-smoke?tier=pro_plus' \
  -H "X-Admin-Token: $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"userContent":"say hello","maxTokens":20}' | jq
```

- `provider: "anthropic"` + `latency_ms < 5000` → Sonnet is fine,
  whatever the user saw was a transient.
- `provider: "workers-ai"` → fallback fired. Check the worker logs
  via `wrangler tail` and look for the `AnthropicError` that
  triggered the fallback. The `code` field tells you which root
  cause.

### Fix by AnthropicError code

| code | Root cause | Fix |
| --- | --- | --- |
| `gateway_misconfigured` | `CF_ACCOUNT_ID` / `CF_AI_GATEWAY_ID` / `CF_AIG_AUTH_TOKEN` missing or wrong | Check wrangler.toml [vars] for account id + gateway id; rotate CF_AIG_AUTH_TOKEN via dashboard → AI → AI Gateway → vozclara-prod → Authentication. |
| `auth_failed` | `ANTHROPIC_API_KEY` invalid / revoked | Rotate at console.anthropic.com → Workspace `VozClara` → Keys, push via `wrangler secret put ANTHROPIC_API_KEY`. |
| `overloaded` | Anthropic capacity event | No action — fallback already shipped the user a Llama response. Monitor anthropic status page (<https://status.anthropic.com>). |
| `rate_limited` | Hit Sonnet 4.5 RPM/TPM ceiling | Same — fallback fires. Pull rate limit numbers from Anthropic console, request a raise if it's a launch-day pattern. |
| `network_error` | Cloudflare → Anthropic edge issue | Likely transient; if persistent, check Cloudflare Network status + Anthropic status simultaneously. |

### Verify

Re-run the smoke curl. `provider: "anthropic"` is the return-to-green
signal.

---

## 5. Workers AI / Llama 3.3 outage

**Symptom:** Both `/api/admin/llm-smoke?tier=free` AND `tier=pro_plus`
return 5xx (Sonnet falls back to Llama which is also down). Pack
generation broken across all tiers.

### 30-second diagnose

1. Check Cloudflare status: <https://www.cloudflarestatus.com> —
   Workers AI has its own status row, usually flagged within
   minutes of a real outage.
2. Run `wrangler tail` and look for `env.AI.run` throws.

### Fix

Nothing client-side. Workers AI is a Cloudflare-managed service —
when it's down it's down. Post a banner on `/founder` saying
"AI generation is temporarily unavailable while Cloudflare resolves
an upstream issue." (Banner mechanism: edit `src/routes/FounderPage.tsx`
section near `<FounderCounter>`, push, Cloudflare Pages auto-deploys
in ~2 min.)

If launch traffic is hitting it: this is the only known scenario
where we'd consider toggling `/founder` to a "coming back soon"
static page. Not a real risk before launch; flag in post-launch
RUNBOOK if a real outage hits.

---

## 6. Supadata transcript fetch failure

**Symptom:** Pack generation fails with "Could not fetch transcript".
User reports: "I pasted a YouTube URL, got an error."

### 30-second diagnose

1. Supadata dashboard → Usage. Quota hit?
2. The failed video accessible via Supadata's curl example with our
   API key? Test from terminal:

```bash
curl -s "https://api.supadata.ai/v1/youtube/transcript?url=<URL>" \
  -H "x-api-key: $SUPADATA_API_KEY"
```

(Load the SUPADATA_API_KEY from password manager — never echo.)

### Fix

**Quota exhausted:** upgrade plan at supadata.ai/billing, or wait
until daily reset.

**Single-video issue:** likely the video has no transcript (live
stream, age-gated, private). Document the URL in Sentry for trend
analysis. User-facing message already handles this: "transcript
unavailable for this video."

**Service outage:** there's no fallback (we removed yt-dlp /
youtube-transcript-api per CLAUDE.md §1.5 Forbidden Patterns). Post
banner on /new: "Video transcript provider temporarily unavailable —
please retry in a few minutes."

---

## 7. Magic-link sign-in not arriving

**Symptom:** User says "I never got my login email."

### 30-second diagnose

1. Resend dashboard → Logs → filter by recipient email.
   - Delivered? → check spam folder with the user.
   - Bounced? → check the bounce reason in Resend; permanent
     bounces (invalid recipient) are unrecoverable without a
     different email.
   - Not even attempted? → worker side issue.
2. If not attempted: `wrangler tail` while the user clicks
   "send link again" — look for the auth-request log line.

### Fix

**Resend bounce / blocked:** ask the user for a different email.
The 2-touch UX flag (gmail typo etc.) is on the IDEAS.md backlog
but not launch-day work.

**Resend API key invalid:** rotate via resend.com/dashboard/api-keys,
push:

```bash
npx wrangler secret put RESEND_API_KEY
```

**`AUTH_FROM_ADDRESS` domain verification dropped:** Resend dashboard
→ Domains → check `leonmare.de` (we send from `noreply@leonmare.de`,
NOT a vozclara.app domain — Resend rejected vozclara.app
verification per LAUNCH_PLAN §17). If status flipped to unverified,
re-verify the DNS records.

### Verify

Sign-in flow end-to-end with a test email you control. Magic link
arrives within ~5 s in normal operation.

---

## 8. Founder counter discrepancy

**Symptom:** `/api/founder/status` says `claimed: 12` but Paddle
dashboard shows 15 completed Founder sales.

### Diagnose

```bash
# Read the raw counter
npx wrangler kv key get --binding=AUTH "founder:counter"
# Read the audit trail (most recent 200 entries)
npx wrangler kv key get --binding=AUTH "founder:claims"
```

Compare claim-count audit entries to Paddle's transaction list.
Three patterns:

- **Counter too low** → webhook missed some sales (see §2). Use
  manual /admin/increment to backfill, OR set exact via:

```bash
curl -s -X POST 'https://vozclara.app/api/founder/admin/set' \
  -H "X-Admin-Token: $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"claimed":15}'
```

- **Counter too high** → unlikely with our idempotency
  (`founder:webhook:processed:${eventId}` dedupe key), but if
  someone double-fired the manual increment, set via the same
  /admin/set endpoint.

- **Counter mismatch but audit trail matches Paddle** → the
  counter and audit got out of sync by some unforeseen path. Trust
  the audit trail length and `/admin/set` to that.

### Prevention

The dedupe key has a 7-day TTL — that's the only window where
double-billing protection is automatic. After 7 days, Paddle
shouldn't retry anyway, but if you do see a same-event_id repeat
past that window, the audit trail is your source of truth.

---

## 9. DSGVO account deletion request

**Symptom:** User emails: "Please delete my account and all data."

### Procedure

1. Verify the request is from the email on file (reply to their
   message; if they don't reply, do not act on a forwarded /
   spoofed claim).
2. User has a built-in self-serve flow at /account → Delete
   Account → confirms via re-typed email. Point them at it first;
   it's faster than going through us.
3. If they want us to do it: open `wrangler tail`, then call the
   delete endpoint with their session cookie OR — since we don't
   have their session — execute manually:

```bash
# Find the user id by email
USER_ID=$(npx wrangler kv key get --binding=AUTH "email:foo@example.com")

# List everything tied to that user_id (visual sanity check)
npx wrangler kv key list --binding=AUTH --prefix="user:$USER_ID"
npx wrangler kv key list --binding=AUTH --prefix="session:" | head

# Delete the user record + email index + every session
npx wrangler kv key delete --binding=AUTH "user:$USER_ID"
npx wrangler kv key delete --binding=AUTH "email:foo@example.com"
# Sessions: enumerate + delete each (the prod handler does this
# in one transaction; manual path is acceptable for solo founder
# scale).
```

4. Email the user confirming deletion within 48 h (DSGVO Art 17
   requires "without undue delay" — 30 days is the absolute
   ceiling).

### Audit

Note in a private log:
- Date of request
- Email
- User id deleted
- Confirmation reply timestamp

Retain for 3 years (DSGVO accountability requirement).

---

## 10. Secret rotation (proactive or post-leak)

**When to rotate immediately:**
- Token was committed to git (even if it's still private repo)
- Token was screenshotted + screenshot left this Mac
- Token was pasted into any third-party tool (Slack, Notion, etc.)
- Token shown on stream / shared screen

### Procedure (for any single secret)

```bash
cd /Users/christiang/Projects/vozclara/worker

# 1. Generate a new value
NEW=$(openssl rand -hex 32)

# 2. Store it in the password manager IMMEDIATELY (do not echo to
#    chat / screenshot). Open password manager, paste, save.
echo "$NEW"  # paste-and-go, no scroll-back left

# 3. Push to Cloudflare
npx wrangler secret put ADMIN_TOKEN      # or ANTHROPIC_API_KEY etc.

# 4. Wrangler prompts; paste $NEW, Enter.

# 5. Verify the old token is dead
curl -s -X POST 'https://vozclara.app/api/founder/admin/increment' \
  -H "X-Admin-Token: <old_token>" \
  -H "Content-Type: application/json" -d '{}'
# Should return {"error":"unauthorized"}

# 6. Verify the new token works
curl -s -X POST 'https://vozclara.app/api/founder/admin/increment' \
  -H "X-Admin-Token: $NEW" \
  -H "Content-Type: application/json" -d '{}'
# Should bump the counter — IMMEDIATELY follow with /admin/set
# to undo if this was just a verification.
```

### Per-secret notes

| Secret | Rotation location | Side effect |
| --- | --- | --- |
| `ADMIN_TOKEN` | `wrangler secret put` | Old admin curls stop; no user-facing impact. |
| `ANTHROPIC_API_KEY` | console.anthropic.com → Keys + wrangler | Old key may have spend already billed; new key starts fresh. |
| `CF_AIG_AUTH_TOKEN` | CF dashboard → AI → Gateway → Authentication + wrangler | Until rotated everywhere, Anthropic calls 401 → soft-fallback to Llama. |
| `PADDLE_WEBHOOK_SECRET` | Paddle → Developer Tools → Notifications → Secret key + wrangler | MUST match dashboard exactly; otherwise webhooks 401. Test with Paddle dashboard's "Send test event" button. |
| `RESEND_API_KEY` | resend.com/dashboard/api-keys + wrangler | Magic-link emails stop until new key is deployed. |
| `SUPADATA_API_KEY` | supadata.ai/dashboard + wrangler | Pack generation stops until new key is deployed. |
| `SENTRY_DSN` | sentry.io project settings + wrangler | Worker errors stop being logged; never a user-facing issue. |

---

## 11. Deploy rollback

**When:** A deploy ships a bug. Revert is faster than fixing-forward.

```bash
cd /Users/christiang/Projects/vozclara/worker

# List recent versions (timestamp + id)
npx wrangler deployments list

# Roll back to the previous version
npx wrangler rollback

# Follow the prompts — pick the version id from before the bad deploy.
# Rollback IS a deploy: takes ~10 s, propagates in seconds.
```

After rollback, the bad commit is still on `main`. Either fix-forward
with a new commit, OR `git revert <bad-sha>` + push.

### Frontend rollback (Cloudflare Pages)

Cloudflare Pages keeps per-commit deploys. Roll back via dashboard:

1. dash.cloudflare.com → Workers & Pages → `vozclara` (Pages project)
2. Deployments tab → find the last good deploy → "Rollback to this
   deployment" button.

Both rollback paths are independent — worker and frontend can be on
different versions if one rollback was needed but not the other.

---

## 12. DNS / Cloudflare zone issue

**Symptom:** vozclara.app is completely unreachable. The
`api.vozclara.app` zone status in CF dashboard shows red.

### 30-second diagnose

1. `nslookup vozclara.app 1.1.1.1` — DNS resolving?
2. CF dashboard → Websites → vozclara.app → Overview — zone status?
3. `https://www.cloudflarestatus.com` — region-wide?

### Fix

There's almost nothing client-side we can do for a real Cloudflare
zone outage. The relevant emergency lever is:

- If the issue is specifically our DNS records being broken (someone
  fat-fingered them in the dashboard), restore from the records
  list (CF keeps a change history per zone).
- If the issue is Cloudflare regional / platform-wide, the only
  user-impact mitigation is patience + status updates on whatever
  external channel we have (Twitter / Discord).

DO NOT panic-migrate DNS to a different provider mid-incident. Most
Cloudflare zone incidents resolve within 30 minutes.

---

## 13. Cron failures

Two crons configured in `worker/wrangler.toml`:

- `0 * * * *` (hourly) → push notification dispatch when due reviews
  hit a user's local-hour preference.
- `30 19 * * *` (daily 19:30 UTC) → curated-pack auto-generation
  from configured YouTube channels.

### 30-second diagnose

```bash
# Cron logs are part of the worker's logs.
npx wrangler tail --format pretty
# Filter manually for "scheduled" lines — they fire at the cron
# trigger times.
```

### Fix

Cron handlers live in `worker/src/index.ts` under the `scheduled()`
handler. A bug there does NOT affect normal `fetch()` traffic — only
the scheduled jobs themselves. Fix-forward with a commit; rollback
is safe because cron handlers are idempotent (push dedupes by ymd
key; curated-pack writes are upsert-shaped).

If push notifications go silent for >24 h: check
- VAPID secret bindings (VAPID_PRIVATE_KEY / VAPID_PUBLIC_KEY /
  VAPID_SUBJECT) still set
- `wrangler tail` shows the hourly tick happening at all

---

## 14. Sentry alerting + escalation

**Where worker errors go:** the `SENTRY_DSN` worker secret points to
our Sentry project. `worker/src/sentry.ts:captureWorkerError` is
called from inside `try`/`catch` in handlers; the captures are
fire-and-forget so a Sentry outage never blocks request handling.

**Where frontend errors go:** they don't — browser Sentry was
deliberately dropped Mi 20.5. (cookieless-by-design). The
ErrorBoundary in `src/components/ErrorBoundary.tsx` keeps a
`__VOZCLARA_ERROR_HOOK` future-use seam if we ever wire something
non-cookied (e.g. Sentry session replay with consent prompt).

**Alert thresholds to set (post-launch):**

- New issue → email immediately (default)
- Issue with >10 events/min → email + push (set in Sentry alert
  rules)
- Anything tagged `level:fatal` → bypass quiet-hours

Not configured yet — set in Sentry web UI when the first real
non-noise event hits.

---

## 15. Cloudflare AI Gateway — kill switch

**When useful:** If Anthropic spend is running away unexpectedly
(prompt-cache misses, runaway loop, abuse), we can throttle or kill
the gateway without rotating keys.

1. CF dashboard → AI → AI Gateway → `vozclara-prod` → Settings.
2. Either:
   - Set a request budget (e.g. "max 1000 Anthropic requests / hour")
   - Toggle the Gateway off entirely — all Anthropic calls return
     a Gateway error, and our `callLLM` soft-fallback diverts to
     Llama transparently.

This is the nuclear option — Pro Plus tier degrades to Llama for
everyone until the Gateway is re-enabled. But it stops the bleed
in <30 s without redeploying anything.

---

## 16. Who to call (vendors only — there's no second human)

**Christian IS on-call.** No escalation chain past this RUNBOOK.
The vendor support channels are for when their service is the
incident, not when ours is:

| Vendor | Support | When to use |
| --- | --- | --- |
| **Cloudflare** | support.cloudflare.com (Workers Paid plan = chat) | Worker/Pages/KV/DO/Vectorize outages we can't diagnose ourselves |
| **Anthropic** | support@anthropic.com | Sonnet outage, rate-limit escalation, billing issues |
| **Paddle** | sellers@paddle.com or in-dashboard chat | Webhook delivery failures, refund issues, customer disputes |
| **Resend** | support@resend.com | Magic-link email bounces, domain reverification |
| **Supadata** | hello@supadata.ai | Transcript fetch errors specific to their service |

### When the on-call (Christian) is unavailable

There is no backup right now. If Christian is in a 6-hour flight
+ launch traffic is hitting:

- `/founder` page should already have a "coming-soon" mode toggle
  (see IDEAS.md backlog — not yet implemented; flag this for the
  pre-launch checklist).
- Until that ships, the worker keeps serving and degrading
  gracefully is the plan. Sonnet outage → Llama. Webhook outage
  → counter freezes (no user-visible break). Worker outage →
  Cloudflare's static error page (acceptable).
- DO NOT give anyone else admin token access for "emergency"
  scenarios. The acceptable degradation is "site is up, paying
  customers get free-tier output, counter is stale" — all of
  which are reversible after the on-call returns.

---

## Drill cadence

- **Pre-launch:** run the §1 (worker outage) and §10 (secret
  rotation) drills before going public. Confirm rollback works
  end-to-end.
- **Weekly during launch week:** read §0–§4 and verify every
  command in those sections still runs cleanly. Catches drift
  from any new commits.
- **Monthly post-launch:** full RUNBOOK read-through + update.
  Anything in the actual incident log that's not in here gets
  added.

---

*This runbook is a living document. Every real incident should
add a section (or expand one) before the post-mortem closes.*
