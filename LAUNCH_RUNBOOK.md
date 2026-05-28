# LAUNCH_RUNBOOK.md — Pre-launch Christian-actions

> Five action items only Christian can complete. Each lists the exact
> steps, expected outcome, and rollback if something goes sideways.
> Ordered by what unblocks the most downstream work.

---

## 1. Plausible Analytics activation · ~20 min

**Why:** Without it, every commit shipped today launches blind. No way
to measure conversion, no funnel data, no signal on which SEO landing
actually pulls traffic.

**Steps:**

1. Open https://plausible.io/register → sign up. The cheapest plan
   (Growth, ~9 €/month) is enough for our pre-launch volume.
2. After signup → "Add a site" → enter `vozclara.app` (apex domain,
   not www.).
3. Plausible shows a snippet to install. **Skip the snippet step** —
   the client code is already wired in `src/lib/analytics.ts`. You
   just need the dashboard side to exist.
4. In Plausible dashboard → Site Settings → Goals → "+ Add goal" →
   Custom event. Add these eight goals one by one, with the exact
   event names from `src/lib/analytics.ts:Events`:
   - `paste_url`
   - `pack_generation_started`
   - `pack_generated`
   - `pack_generation_failed`
   - `viewed_pricing`
   - `viewed_founder`
   - `founder_checkout_opened`
   - `founder_checkout_dismissed`
5. Open `.env.production` locally, uncomment line 12:
   ```
   VITE_PLAUSIBLE_DOMAIN=vozclara.app
   ```
6. `npm run deploy` (or just push if Cloudflare Pages auto-deploys
   on `.env.production` changes — check the dashboard).
7. Verify: visit vozclara.app, open browser devtools → Network tab,
   filter `plausible.io` → should see a request to
   `plausible.io/api/event` on page load.

**If it goes wrong:** comment the env var back out and redeploy.
No code change needed — the client gracefully no-ops when the env
var is unset.

---

## 2. Glama Servers listing — manual Sync · ~2 min

**Why:** The listing still shows F rating + "license — not found" even
though we pushed `LICENSE.md` (FSL-1.1-Apache-2.0) this morning. Glama
has not re-crawled the repo since. Manual sync fixes it.

**Steps:**

1. Open https://glama.ai/mcp/servers/LeonMare/vozclara/admin/repository
   (you should still be logged in from this morning).
2. Top of the right column → click the big **"Sync Server"** button.
3. Wait ~30 seconds, refresh, check the Score tab.

**Expected outcome:** license check turns green, score jumps from F
to A or B. Maintenance score might still be C until we have more
commits on the public repo — that lifts naturally.

---

## 3. MX records for vozclara.app (optional but recommended) · ~5 min

**Why:** Right now any email to `hello@vozclara.app`, `support@vozclara.
app`, `christian@vozclara.app` etc. bounces. The launch posts will
mostly point at `vozclara@leonmare.de` (which works perfectly — Google
Workspace MX is configured on leonmare.de). But people will guess
`hello@vozclara.app` or copy the URL into their address book. Catch
those with Cloudflare Email Routing — free, 5 minutes, no Google
Workspace cost.

**Steps:**

1. Open https://dash.cloudflare.com → vozclara.app zone →
   Email → Email Routing.
2. Enable Email Routing. Cloudflare adds the right MX records
   automatically and walks you through verification.
3. Create a Custom Address rule:
   - From: `hello@vozclara.app`
   - To: `vozclara@leonmare.de` (your existing Google inbox)
   - Repeat for `support@vozclara.app`, `christian@vozclara.app`,
     or set a catch-all rule (`*@vozclara.app → vozclara@leonmare.de`).
4. Cloudflare auto-creates the MX records:
   ```
   route1.mx.cloudflare.net
   route2.mx.cloudflare.net
   route3.mx.cloudflare.net
   ```
5. Verify: send a test email from a different account to
   `hello@vozclara.app`. Should land in your leonmare.de inbox
   within seconds.

**If it goes wrong:** disable Email Routing in the same dashboard. MX
records get removed automatically. No downstream impact.

---

## 4. Paddle live test purchase · ~10 min

**Why:** The Paddle webhook signature verification + idempotency
guard + Founder counter increment have all been written but never
fired against a real production transaction. A €99 test purchase
will confirm the full chain works.

**Steps:**

1. Open https://vozclara.app/founder in an incognito window.
2. Counter should read "0/100 sold" (no purchases yet).
3. Click "Become a Founder" / "Founder werden" → embedded Paddle
   overlay opens in-page.
4. Pay €99 with a real card. (Use your own — you can refund yourself
   afterwards via Paddle dashboard for the price of two minutes of
   admin.)
5. After payment, you should:
   - Land on `/founder?welcome=1` with welcome banner + Discord
     invite link visible.
   - Receive Paddle's receipt email at the address you used.
   - Receive the VozClara welcome email (Resend → your inbox).
6. Reload /founder in a normal tab — counter should now read
   "1/100 sold" (the webhook fired and `handleFounderWebhook`
   incremented `AUTH` KV).
7. Verify in Paddle dashboard → Transactions: the transaction
   appears with status "completed" and the price-id matches
   `pri_01ks30tgbj097qbtjhebzqyf2z`.
8. **Refund yourself** in Paddle dashboard → click the transaction
   → "Refund" → full amount. Counter should remain at 1 (we don't
   currently decrement on refunds — that's a documented post-
   launch fix).

**If it goes wrong:** the Paddle transaction is real money but
fully refundable in their dashboard. If the webhook doesn't fire,
the counter doesn't increment — `worker/src/founder.ts:handleFounder
Webhook` has the signature-verification logic and idempotency check
that needs the actual webhook signature secret on the Cloudflare
side. Set `PADDLE_WEBHOOK_SECRET` via `wrangler secret put` if it's
missing.

---

## 5. DPMA trademark filing · ~1-2 h

**Why:** The voz-clara.com namesconflict surfaced in today's audit.
Coexistence strategy is the right call (products are different
enough), but the defensive move is to file the trademark before
they or anyone else does. DPMA self-filing covers Germany at €290.

**Steps:** see `BRAND.md` section 4 — full checklist already
written. Summary:

1. Pull `/public/voz-clara-mark.svg` (lighthouse seal) for the
   figurative element.
2. Open dpma.de → Marken → Online-Anmeldung.
3. File in classes 9 (software), 41 (education), 42 (SaaS).
4. Pay €290. Save the application number.
5. Set a calendar reminder for 90 days to check examination status.

Optional follow-up: EUIPO filing 6 months later via Madrid Protocol
for full EU coverage. Defer until first DPMA application clears.

---

## 6. Reddit launch posts execution · 1 h per post, gestaffelt

**Why:** Eight drafted posts in `LAUNCH_POSTS.md` ready to publish.
You have 6,666 karma — no posting restrictions anywhere.

**Sequencing (the schedule in LAUNCH_POSTS.md):**

- Day 1 ~14:00 UTC Tue: Hacker News (Post 1)
- Day 2 ~17:00 UTC Wed: r/languagelearning (Post 2)
- Day 3 ~18:00 UTC Thu: **r/Anki (Post 3 — highest conversion fit)**
- Day 4 ~18:00 UTC Fri: r/productivity (Post 4)
- Day 6 ~19:00 UTC Sun: r/getstudying (Post 5)
- MCP beat — staggered separately:
  - X / Twitter thread (Post 6)
  - LinkedIn long-form (Post 7)
  - r/ClaudeAI (Post 8)

Each post is reviewed-and-ready. Just polish the timing to your
own energy levels — the dates in LAUNCH_POSTS.md are recommendations,
not deadlines.

---

## Final QA before flipping the switch

`FINAL_QA.md` is the 189-item manual walkthrough sheet. Blocks A
through L. Aim for one complete run before any external promotion.

The five items above are launch-blocking; the FINAL_QA walkthrough
is launch-validating. Different role, same week.
