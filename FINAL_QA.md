# Final QA — Launch Walkthrough

> Systematic click-through before launch. ~45 min to do all blocks.
> Run on the day of launch (or the evening before). Use a fresh
> Incognito browser so cookies + IndexedDB are clean for the
> first-time-visitor flow.
>
> Mark each box `[x]` as you go. If anything fails, file under
> **Defects** at the bottom and decide blocker vs. ship-anyway.

---

## Setup

- [ ] Incognito / Private window open
- [ ] Paddle environment = **production** (not sandbox) — verify `VITE_PADDLE_ENV` in `.env.production` (or absent = defaults to production)
- [ ] Tab open on https://vozclara.app
- [ ] Resend dashboard open (to confirm magic-link mail arrives)
- [ ] Sentry **worker** dashboard open (browser SDK removed Mi 20.5. — server-side only)
- [ ] Cloudflare Analytics open
- [ ] Paddle dashboard open (transactions tab) — to confirm test sale appears

---

## Block A · First-Time Visitor (anonymous)

- [ ] Landing loads under 2 s on a normal connection
- [ ] Hero headline reads correctly in your locale (DE/ES/PT/EN)
- [ ] AudienceTiles: click one (e.g. „Sprachen lernen") → active state
      shows „Aktiv"-Badge + green dot
- [ ] WhyNotChatGPT-section renders the 4-row comparison cleanly
- [ ] PricingPreview shows the Founder-Banner between hero and Free/Pro
- [ ] FounderNote feels human, not corporate
- [ ] Footer columns are aligned, all links resolve (Impressum, Privacy,
      Terms, GitHub, Sitemap)
- [ ] Language switcher (top-right) changes locale of the whole landing

## Block B · Generator + First Pack

- [ ] Click „Neuer Pack" (or hero CTA „Wissens-Cloud starten")
- [ ] Paste a YouTube URL — short test video (3–5 min works fastest)
- [ ] Source language auto-detected correctly
- [ ] Default mode is the audience you picked in Block A
- [ ] Generate → progress phrases cycle, no Sentry errors
- [ ] After ~30 s: PackPage opens with title + thumbnail
- [ ] Pack-Header shows: mode badge, sourceLang→outputLang, genre,
      CEFR-difficulty (if emitted), date
- [ ] TL;DR-Box renders at top of SummaryTab
- [ ] All tabs work (Summary · Insights · Chapters · Action Plan ·
      Vocabulary · Quotes · Quiz · Social · Transcript — depends on mode)

## Block C · Auth Flow

- [ ] Click „Anmelden" (top-right) → /signin page renders
- [ ] Enter your real email + locale dropdown set to your locale
- [ ] Click „Link senden" → success message shows
- [ ] Resend dashboard: confirm mail event landed
- [ ] Inbox: brand-conform email arrives within 15 s
- [ ] Click magic link → bounces to /library (or wherever next= was)
- [ ] Top-right shows avatar (your initial in gold on navy disc)
- [ ] Click avatar → dropdown shows: Mein Konto · Bibliothek · Heute
      wiederholen · Founder Deal · Logout
- [ ] BrainId-Sync banner appears in Library („Deine Bibliothek ist
      mit deinem Konto verknüpft")

## Block D · /me Dashboard

- [ ] /me loads with Hero (Avatar + Hi-Greeting + email)
- [ ] Plan-Badge „PLAN GRATUITO / KOSTENLOSER PLAN" visible
- [ ] Member-since date + device count chips
- [ ] Streak-Chip (🔥 N Tage) shown only if current > 0
- [ ] 3 Stat-Cards: Packs / Languages / Due — clickable to relevant
      routes
- [ ] Streak-Section with 7-day calendar strip (today ringed in gold)
- [ ] Recent-Activity section shows last 3 viewed packs with thumbnails
      (if any; hidden otherwise)
- [ ] Plan & Billing card with „Founder Deal" CTA → leads to /founder
- [ ] Account fields show email, name (italic „nicht festgelegt" if
      unset), language, user-ID monospace
- [ ] Devices section: lists brainIds with „Aktuell"-badge on this one
- [ ] Privacy & Data section: Export + Delete cards (mailto links open
      correctly)
- [ ] Sign-Out button at bottom — clicking returns to landing

## Block E · Michelin Rating

- [ ] Open a pack (yours or sample) → § BEWERTUNG section visible
- [ ] Click 👍 → counter goes 0 → 1 (anonymous, no login required)
- [ ] Click again to undo → counter back to 0
- [ ] Click „Brillant" 1-tap chip → chip shows active state
- [ ] If signed in: 5-star rating + „Rezension hinzufügen" works
- [ ] Library card on that pack shows the rating badge
- [ ] /discover/top-rated → at least the pack you just rated appears

## Block F · Sample Packs (anonymous-friendly)

- [ ] /pack/sample → loads Tagesschau pack (BRIEFING · ES + EN)
- [ ] /pack/sample-learn → Tagesschau learn-mode with German vocab
- [ ] /pack/sample-creator → Tagesschau creator with social angles
- [ ] /pack/sample-study → ⭐ Veritasium entropy, full study suite
      (8 quiz questions visible)
- [ ] /pack/sample-news → ⭐ Lex × LeCun #416, 6 quotes incl.
      „LLMs are an off-ramp"
- [ ] Each sample switches between ES + EN via the language pill

## Block G · Founder Deal Flow

- [ ] /founder loads — Counter shows correct n/100 (matches Paddle dashboard)
- [ ] Click „Founder werden" / „Become a Founder" → **embedded Paddle.js overlay opens in-page** (no new tab — overlay since Mi 20.5.)
- [ ] Paddle overlay shows:
  - [ ] Merchant of Record: **Paddle.com Market Ltd** (footer disclosure)
  - [ ] Seller: **VozClara** (LEON MARÉ)
  - [ ] Product: „VozClara Founder · Lifetime Pro"
  - [ ] Price: **99,00 €** with VAT breakdown (e.g. „inkl. 15,81 € MwSt." for DE addresses)
  - [ ] Payment methods: PayPal, Card (Apple Pay/Google Pay surface on mobile)
  - [ ] Country/VAT selector updates the breakdown live
  - [ ] Success URL on completion: `/founder?welcome=1` (configured in `worker/src/founder.ts`)
- [ ] DO NOT actually pay — close the Paddle overlay (X top-right) and verify the page is unchanged
- [ ] After the dry-run: verify nothing landed in Paddle dashboard → Transactions (otherwise idempotency on the webhook needs fixing)

## Block H · Citation Copy

- [ ] On any pack with quotes → Quotes/Citas/Zitate tab
- [ ] Hover over a quote on desktop → Copy-Citation button appears
      top-right; on touch, always visible
- [ ] Click → toast „Kopiert"
- [ ] Paste into a text editor → formatted as
      `"Quote text" — Speaker · Time · Pack title · URL`
- [ ] Click the second button (Quote-Card image) → opens
      `/api/quote-card?...` with navy-gradient brand card

## Block I · 404 + Mobile

- [ ] /foobar → editorial 404 with Leuchtturm, „Diese Seite gibt es
      nicht.", three CTAs (Library / New Pack / Top rated)
- [ ] Resize to 375×812 (iPhone): Landing, /founder, /discover, /me,
      /pack/sample-study all readable
- [ ] PackPage on mobile: tabs collapse to accordion sections
- [ ] Header on mobile: hamburger menu opens drawer with all auth + nav

## Block J · Cross-Browser (5 min)

- [ ] Safari (latest macOS) — Landing + Auth + one Pack open
- [ ] Chrome — same
- [ ] Firefox — same (often the source of edge-case bugs)
- [ ] Mobile Safari on real iPhone — Founder Paddle overlay opens in-page (no Safari pop-up blocker prompt)
- [ ] Mobile Chrome on real Android — same; check Paddle overlay scrolls within viewport

## Block K · Sentry Smoke (worker-side only)

- [ ] During the whole walkthrough, **worker** Sentry stays mostly quiet (browser SDK removed Mi 20.5. — there are no browser events to expect)
- [ ] If new worker events surface → triage:
  - [ ] Real bug → fix before launch
  - [ ] User error → suppress filter

## Block L · Performance (Lighthouse, optional)

- [ ] Run Lighthouse on `/` (Desktop) → Performance ≥ 85
- [ ] Run on `/pack/sample-study` (Mobile) → Performance ≥ 70
- [ ] Accessibility ≥ 95 ideally on both

---

## Defects (fill as you find)

| Severity | Block | Description | Decision |
|---|---|---|---|
|  |  |  |  |

---

## Go / No-Go decision

- [ ] All blocker-severity defects resolved
- [ ] Resend mail delivery confirmed in last 24 h
- [ ] Paddle checkout overlay opens, displays correct VAT, success URL fires (do not actually pay during the dry-run)
- [ ] Paddle `transaction.completed` webhook either wired and signature-verified, OR documented manual-counter procedure for first 100 sales
- [ ] No Sentry **worker** P1 in last 24 h (browser SDK removed)
- [ ] Domain DNS healthy (vozclara.app resolves, valid TLS)
- [ ] MCP server smoke: `curl -sI https://vozclara.app/api/mcp` returns 200/method-allowed; `/api/mcp/pro` returns 401 with WWW-Authenticate Bearer + resource_metadata
- [ ] Smithery listing still public + Score ≥ 80 (https://smithery.ai/server/salvador7eon/vozclara)
- [ ] LAUNCH_POSTS.md final read-through done

**→ Go signal:** all green = ship.
**→ No-Go signal:** any blocker red = postpone by 24 h, fix, re-run.

---

— Final-QA-Sheet, Di 19.5.2026.
