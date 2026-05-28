# HANDOFF — Do 28.5.2026 (PC session end, laptop pickup)

> Read this first when picking up the session on the laptop.
> Updated: Do 28.5.2026 spätabends, after the largest single-day
> sprint of the project so far.
>
> Last commit on `main`: **`ef85370`** (LAUNCH_RUNBOOK.md). Working
> tree clean after the laptop checkout. `git pull` first on the
> laptop to sync — there are 27 commits ahead of whatever you last
> pulled on that machine.

---

## TL;DR — what changed today (Do 28.5.)

**27 commits. Code-side launch readiness: COMPLETE.**

Today was the SEO + visual + brand + structural-data sprint. The
backlog of launch-critical code work is now empty. Everything
remaining is Christian-actions (accounts, real-world testing,
trademark filing) — none of which I can complete for you.

The full bilanz, in three lines:

- **9 SEO landing pages shipped** across two audiences (consumer +
  developer) and four locales (ES / PT / DE / EN). One DRY refactor
  later, adding a tenth landing page is a 150-line config file.
- **5 brand-aligned visual assets** committed (og-image, og-founder,
  hero-loop video, anki-moment image + animation v1, mcp-icon)
  plus six Higgsfield generations on the workspace. Two of those
  generations silent-failed but did not block anything — the static
  fallbacks stand.
- **Three strategic docs landed**: BRAND.md (voz-clara.com conflict +
  trademark filing plan), LAUNCH_RUNBOOK.md (Christian-actions exact
  steps), FINAL_QA.md (extended with today's new surfaces).

---

## What is in main, in order, today

```
27. ef85370 docs: LAUNCH_RUNBOOK.md — Christian-actions executable steps
26. f95fc9f feat: /learn-french + /learn-italian SEO landings (template-first)
25. d2a3f6f refactor: extract shared SEO components — DRY pass on 4 sister pages
24. 6bab79b seo: JSON-LD structured data + drop stale About roadmap bullet
23. 48c64c4 frontend: link today's 7 new SEO pages from the landing footer
22. f855776 feat: /privacy-first-ai-study-tool — closes ChatGPT SEO list
21. 24e254a feat: /knowledge-packs — foundational concept page
20. 917b9b5 feat: /mcp — developer-facing page for the MCP server
19. 8de593d docs: FINAL_QA.md — add today's new surfaces to launch checklist
18. bcc7616 feat: /learn-english-with-youtube — broadest-market SEO landing
17. 3a81cd7 brand: og:image + twitter:image absolute URLs on the homepage
16. e37f22b feat: /learn-spanish-with-youtube — 4th SEO landing for ES learners
15. df4733e feat: /learn-portuguese-with-youtube — closes the 4-locale SEO square
14. a6057df feat: /youtube-to-anki — SEO landing for the killer-feature intent
13. 7d2b1da feat: /learn-german-with-youtube — founder-story-aligned SEO landing
12. bb82891 brand: per-route OG metadata for /founder via Pages Function
11. e72f24c content: add r/Anki launch post + beta-frame two stale free claims
10. 59fd5d5 brand: anki-moment.png v2 — correct translations + readable cards
 9. 4fc3553 brand: add /anki-moment.png — YouTube → Anki visual asset
 8. 6ad8bae copy: surface YouTube → Anki as the killer-feature differentiator
 7. 3c17882 brand: BRAND.md + og:site_name disambiguation for voz-clara.com
 6. e6d5eb3 copy: resolve free-vs-paid contradiction — frame Free as beta tier
 5. f2f891a meta: document Plausible activation path in .env files
 4. 26a6e14 frontend: surface Founder Deal on PricingPreview — banner above tiers
 3. 6c56af8 meta: correct legal name in LICENSE + package.json author
 2. 20d0146 brand: add /og-founder.png — launch-specific share card
 1. 9295487 frontend: add ambient hero video — gold-line loop behind landing Hero
```

Plus a tail commit cleaning up local-machine noise (.tsbuildinfo
gitignore + Windows lockfile drift discard) right before this
HANDOFF push.

---

## SEO landing map — production state

All nine new landings are live on vozclara.app and verified via the
Twitterbot User-Agent crawl. Each has its own Pages Function under
`functions/` rewriting og: / twitter: metadata crawler-side.

| Path | Audience | Page lines | Built on |
|---|---|---|---|
| `/youtube-to-anki` | Anki community | ~340 | direct |
| `/learn-german-with-youtube` | DE learners (ES/EN/PT) | 153 | template ✓ |
| `/learn-spanish-with-youtube` | ES learners (DE/EN/PT) | 142 | template ✓ |
| `/learn-english-with-youtube` | EN learners (DE/ES/PT, broadest) | 142 | template ✓ |
| `/learn-portuguese-with-youtube` | PT learners (BR + EU) | 142 | template ✓ |
| `/learn-french-with-youtube` | FR learners | 150 | template ✓ NEW |
| `/learn-italian-with-youtube` | IT learners | 150 | template ✓ NEW |
| `/mcp` | AI engineers | ~430 | direct |
| `/knowledge-packs` | concept reference | ~380 | direct |
| `/privacy-first-ai-study-tool` | EU privacy segment | ~360 | direct |

DRY refactor extracted three shared SEO components into
`src/components/seo/`:
- `SeoHero` — paste-URL hero with form + magnetic CTA + analytics fire
- `FounderBannerCallout` — founder-deal callout with live counter
- `LanguageLearningSeoPage` — full template for the four /learn-X pages

Adding a tenth landing (Dutch, Polish, Japanese, Korean, Mandarin,
Greek, Russian, etc.) is now: one ~150-line config file, one route
entry, one sitemap entry, one Pages Function. Twenty minutes.

---

## In-flight / status-limbo items at session end

**PR awesome-mcp-servers/6721:**
```
state: open | merged: false | mergeable_state: clean
last updated: 2026-05-27 08:04 UTC
comments: 3
```
Sitting in Frank's queue cold for 30+ hours. Action: wait, or send
a gentle "any questions before merge?" follow-up comment if 48+ hours
cold by tomorrow.

**Glama Servers listing (LeonMare/vozclara):**
Still showing F + "license — not found" despite the FSL-1.1 LICENSE
commit this morning. Glama has not auto-resynced. One-click fix in
the admin panel — see `LAUNCH_RUNBOOK.md` item 2.

**Higgsfield silent-failed jobs:**
- `7a348c52` (Anki Moment v2 animation) — not in completed list 2h
  after submit. Failed silently. **Not blocking** — the static v2
  image is what is committed and used.
- `3632502d` (architectural diagram mood video) — submitted morning,
  no completion 8h+ later. Failed silently. **Not blocking** — was
  never integrated into the site.

**Higgsfield Brand Kit fetch (`35b832d1`):**
Status unknown — would need a separate `show_marketing_studio` load
to poll. Not launch-blocking. Christian can check via the assets
page if interested.

---

## What is genuinely PENDING (Christian-actions only)

All listed with exact steps in `LAUNCH_RUNBOOK.md`. In order of
unblock-most-downstream:

1. **Plausible Analytics activation** (~20 min) — without it the
   whole launch ships blind.
2. **Glama Servers manual sync** (~2 min, ONE BUTTON) — flips the F
   to A and the listing back to discoverable.
3. **Cloudflare Email Routing for vozclara.app** (~5 min, optional)
   — leonmare.de MX is fine; only matters if you want hello@vozclara.app
   not to bounce.
4. **Paddle live test purchase** (~10 min) — confirms the entire
   webhook + idempotency + counter-increment chain works against a
   real transaction. Refund yourself after.
5. **DPMA trademark filing** (~1–2 h) — defensive move against the
   voz-clara.com conflict (see BRAND.md §4).
6. **Reddit launch posts execution** (1h per post, gestaffelt over
   week — 8 drafts ready in LAUNCH_POSTS.md).

Plus: `FINAL_QA.md` 189-item manual walkthrough as the launch-day
validation pass.

---

## How to pick up cleanly on the laptop

```bash
cd path/to/vozclara
git pull origin main
# Should pull all 27 commits + the tail cleanup.

# If the working tree shows package-lock.json or *.tsbuildinfo as
# dirty: those are local-machine noise. The repo now gitignores
# *.tsbuildinfo. For package-lock drift on a fresh laptop, run
# `npx -y npm@10 install` to regenerate cleanly.

# Sanity-check the build still passes on the laptop:
npm install
npm run build
# Should print "✓ built in ~3s" and bundle sizes around 416 kB / 132 kB gzip.

# If you want to read the current state of the SEO surface:
ls src/routes/Learn*.tsx
ls functions/*.ts | sort

# If you want to read the strategic docs:
cat BRAND.md           # voz-clara.com conflict + trademark plan
cat LAUNCH_RUNBOOK.md  # Christian-action steps
cat FINAL_QA.md        # 189-item launch checklist
```

---

## Strategic context that does not fit elsewhere

**voz-clara.com is real.** Surfaced in this morning's audit, full
analysis lives in BRAND.md. We are coexisting + filing trademark
(DPMA classes 9 / 41 / 42, €290 self-filed). Not a rename.

**ChatGPT's SEO recommendation list is closed.** Every page on the
list it laid out yesterday has a route, a Pages Function, a sitemap
entry, and four-locale copy. The "should we build a privacy-first
positioning page?" debate is over — it shipped.

**Free vs paid framing is honest now.** PricingPreview reads "Free
in beta — beta users keep extended access after launch" across all
four locales. The roadmap-implied 3/week future state is no longer
contradicted by site copy.

**Hero ambient video is live.** /hero-loop.mp4 plays as a
mix-blend-screen background layer on the homepage Hero. The
HeroPackPreview interactive component on the right is unchanged —
the video is mood, the preview is conversion.

**Pricing page now surfaces the Founder Deal.** Banner above the
Free / Pro tier cards with live `X / 100 remaining` counter pulled
from `/api/founder/status`. Auto-hides post-launch when the deal
closes.

**The 4-locale crawl-graph is closed.** Every SEO page is reachable
in ≤ 2 clicks from any other page via the expanded footer (5
columns lg+: brand + Produkt + Mit YouTube lernen + Über + Legal).

---

## Reminders for next session

- Glama Sync is a literal one-button fix. **Do it first** when you
  open the laptop — the F rating is the biggest visible defect right
  now and it goes away in 30 seconds.
- The Anki Moment v2 animation `7a348c52` is dead. Do not wait for
  it. If you want an Anki-specific animated hero, re-submit a fresh
  generation (~36 credits).
- Frank's PR is on his queue. Patience first, gentle nudge tomorrow
  if still cold.

---

Everything is committed and pushed. Working tree clean after the
laptop pickup. The build is healthy. The arsenal is ready.

Sleep well. Tomorrow: open the laptop, do the Glama Sync, set up
Plausible, then everything else gets easier because you can see
what is actually happening.

— PC session end. Do 28.5.2026.
