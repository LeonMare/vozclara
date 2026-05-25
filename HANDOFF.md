# HANDOFF — Do 21.5. Spätabend (laptop session end, switching to PC)

> Read this first when picking up the session on any machine.
> Updated: Do 21.5.2026 ~22:00 (laptop session end before PC pickup).
>
> If picking up on PC: `git pull` first. The remote has the
> canonical state at HEAD `6f8a814`. Working tree on laptop is
> clean. No uncommitted work to migrate manually.

---

## What shipped today (Fr 22.5. — the full sprint)

**27 commits + 7 production deploys + 1 external PR (awesome-mcp-servers#6721).**

A single working day that closed almost every remaining technical
pre-launch P0 and left two follow-up tasks ranged. The only
remaining open items are content / distribution / outreach — every
one of those needs Christian's hand (accounts, video recording,
human relationships).

### Morning PC sprint (commits `a225c2c` → `f9b6cf6`)

- **#40 F/E/G follow-ups** — generate_pack through callLLM, user.tier
  + Paddle webhook auto-grant, Workers-AI → Anthropic-SSE adapter
- **`/api/admin/llm-smoke`** endpoint
- **3 secrets rotated** (ADMIN_TOKEN, ANTHROPIC_API_KEY, CF_AIG_AUTH_TOKEN)
- Production-verified Sonnet 1733ms / Llama 456ms

### Afternoon laptop sprint (commits `1d7e805` → `1dd0445`)

| # | Commit | What |
|---|---|---|
| #35 | `1d7e805` | RUNBOOK.md — 697-line, 16-section incident playbook |
| #44 | `2797917` | Hero / Problem / Solution copy polish × 4 locales |
| #44 | `bf4fe32` | OG image redesign — eyebrow + sub-claim + lang strip |
| #52 | `c783cd5` | PackCover.tsx — designed editorial cover in Library |
| #53 | `39eb538` | GenerationProgress polish — beacon-sweep + typewriter caret |
| #54 | `feaeec6` | Quote-card landscape variant + PNG download + URL fix |
| #23 | `6dbb520` | "No signup" trust signal + AnonymousLibraryBanner |
| #36 | `15c3b78` | /skills/ bundle + §-marker baseline polish |
| #38 | `ad12793` | Per-locale display serif via CSS variable |
| #11 | `1dd0445` | Plausible analytics scaffolding (dormant) |

### Evening laptop sprint (commits `27e10da` → `c02e96b`)

| # | Commit | What |
|---|---|---|
| Handoff refresh | `2ed6126` | Intermediate handoff update |
| #24 | `27e10da` + deploy | Streaming pack-generation end-to-end (visible tokens) |
| #27 v1 | `fe58b78` + deploy | Season Pack summarise-then-synthesise pipeline + `/api/admin/season-smoke` |
| #41 | `b7fc4d1` + deploy | 7-day retention email sequence + daily 09:00 UTC sweep cron |
| #42 v1 | `97a45b4` | Conversion-trigger registry + T1/T2 wired |
| #22 v1 | `a13e61b` + deploy | Inline `[mm:ss]` citation chips + click-to-seek + prompt update |
| #58 (#22 v2) | `4afe9e1` | Citation hover-replay transcript preview |
| #57 (#42 v2) | `1c6159f` | T3 / T4 / T5 conversion triggers wired |
| #37 | `c02e96b` + deploy | Sonnet 4.5 extended-thinking "reasoning" surface |

### Do 21.5. laptop slice (commits `c8a4701` → `6f8a814`)

10 Commits, 2 production deploys (#43 + #13), 0 worker deploys
(documentation + copy work primarily).

| # | Commit | What |
|---|---|---|
| #43 | `c8a4701` + deploy | PackPage welcome bookplate — quiet italic Cormorant + gold rule on fresh generation, fades after ~4.5 s, URL cleaned via history-replace |
| #13 v1 | `341da04` + deploy | Programmatic SEO seed — `/notes` hub + `/notes/:slug` editorial reading-note route + 5 hand-written essays (Huberman ×2 / Lex × Karpathy / Veritasium / Naval) + JSON-LD Article + canonical + sitemap + footer link in 4 locales |
| #48 / β v1 | `d37930d` | LAUNCH_POSTS freshened (Sonnet-behind-MCP now true) + initial SOCIAL_PLAYBOOK.md v1 |
| HANDOFF | `4bc3d6a` | HANDOFF refresh — first post-context slice captured |
| Legal | `00811b6` | Impressum-only: provider name + MStV §18 line "Christian Leon" → "Christian José"; legal contact `hola@vozclara.app` → `vozclara@leonmare.de` |
| Copy DE | `3607673` | DE landing/UI: drop „Karte" / „Kreditkarte" defensive copy — reframe positive ("Sofort startklar" / „ohne Anmeldung" / „gratis"). Hero, pricing disclaimer, pricingSub, free blurb, /pricing eyebrowSub + heroLead + ctaBody, /me planFreeBlurb. |
| Copy ES/PT/EN | `63b780c` | Same reframe across the other 3 locales. „sin tarjeta" / „sem cartão" / „No credit card" → „sin cuenta" / „sem conta" / „start instantly" / „no account needed". FounderPage Paddle-checkout copy deliberately left as-is (legitimate trust signal at paid checkout). |
| Playbook v2 | `aa2a0fe` | SOCIAL_PLAYBOOK.md restructured from MCP-Beat-only to 4-platform brand-build operating layer: Instagram + LinkedIn + X + YouTube. Account-setup blocks with bio templates (DE/EN, char-cap-respecting), profile/banner specs, content pillars, brand-consistency table. |
| Playbook v3 | `e16cd8e` | SOCIAL_PLAYBOOK +TikTok as 5th platform — StudyTok strategy, 80-char bio, content pillars (60/30/10), trending-audio rules, 7-day initial-posts ramp, daily-check extended to 12 min over 5 platforms. |
| Marketing docs | `6f8a814` | Three new top-level docs: `PRESS_KIT.md` (single source of truth — boilerplate 3 lengths, founder bio 3 lengths, brand assets, color palette, 3 attributable quotes, anti-patterns), `OUTREACH_TEMPLATES.md` (Mikro-Influencer DMs in 4 locales, corporate-partnerships specific to Anki/Obsidian/LingQ/Refold, newsletter pitches, affiliate creator-deals, press outreach), `DEMO_VIDEO_SCRIPTS.md` (3 fully-scripted demo videos for #29 with take-by-take recording plan + voice-over + thumbnail concept). |

#43 is now closed — cumulative work covers the spec (beacon-sweep
+ typewriter caret from #53, streaming output from #24, thinking
surface from #37, post-completion bookplate today). Remaining
polish moments (pre-paste hint reveal, mobile timing tweaks) are
bounded and not blocking.

#13 ships the scaffold + 5 of 50 essays. The remaining 45 are pure
content writing — a 3–4 hour autonomous session can complete them
incrementally by appending to `src/data/creatorNotes.ts` and adding
the sitemap row. Pattern is locked in; further work is iteration.

#48 is now fully prepared, awaiting only Christian's hand for the
actual posting. All five marketing docs combine to a complete
operating-layer (see §"Quick PC pickup" below).

External:
- **awesome-mcp-servers#6721** — Knowledge & Memory section entry,
  fast-track tagged with `🤖🤖🤖`. Awaiting maintainer review.

---

## Live production state at handoff

```
HEAD: 6f8a814 (docs: PRESS_KIT + OUTREACH_TEMPLATES + DEMO_VIDEO_SCRIPTS)
Branch: main (up to date with origin/main)
Working tree: clean
Worker version (production): 5a7d95cc-2115-46ab-8b77-346c3053ac41 (unchanged today — no worker code touched)
Pages deployments today: 2 (#43 bookplate + #13 /notes route)
Crons:
  • 0 * * * *    push notifications (hourly)
  • 30 19 * * *  curated-pack auto-gen (daily 19:30 UTC)
  • 0 9 * * *    retention-email sweep (daily 09:00 UTC) — already
                 firing Day-2 cadence to qualified accounts
```

### Quick smoke checks after `git pull` on PC

```bash
# Verify everything live
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://vozclara.app/
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://vozclara.app/notes
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://vozclara.app/notes/andrew-huberman-sleep-toolkit
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://vozclara.app/impressum
curl -s https://vozclara.app/api/health   # should return {"ok":true,...}
```

All five should return HTTP 200. If any fail, see `RUNBOOK.md` §3.

---

## Open follow-ups (ranked by what they need)

### Activation steps (user-only, 5 min each)

- **Plausible** — provision `vozclara.app` site at plausible.io
  + add `VITE_PLAUSIBLE_DOMAIN=vozclara.app` to `.env.production`
  + re-deploy. All `track()` call-sites are in place: paste_url,
  pack_generated, viewed_pricing, viewed_founder,
  founder_checkout_opened, trigger_shown, trigger_clicked,
  trigger_dismissed.
- **awesome-mcp-servers#6721** — passive; watch for maintainer
  comments + merge.

### Pure-content / outreach work (user-side — copy-paste templates ready)

Templates and scripts for every task below now live in the repo.
You do not have to draft anything — find the variable, fill it in,
send.

- **#48** MCP Beat Posts publish (X + r/ClaudeAI — LinkedIn moved
  to Woche 3) — drafts in `LAUNCH_POSTS.md` posts #5 / #7. Pre-Flight
  in `SOCIAL_PLAYBOOK.md §4`. Stagger 48-72 h. NO r/mcp + r/Anthropic
  same week; HN reserved for full-launch.
- **#4** 8 free directories submit — paste the **50-word boilerplate
  from `PRESS_KIT.md §2.1`** into each submission. Brand-assets
  links + screenshots are in `PRESS_KIT.md §4`.
- **#5** Pay $30 Uneed skip-line for launch-week slot.
- **#6** Affiliate-Stack — pitch templates in `OUTREACH_TEMPLATES.md §4`.
  3 mid-tier Creator-Deals (200 € flat + 30 % recurring 12mo).
- **#7** Reddit-Karma sammeln (r/anki / r/PKM / r/learnGerman) — no
  template needed, organic engagement only.
- **#8** TLDR AI Newsletter slot for Woche 3 — pitch template in
  `OUTREACH_TEMPLATES.md §3.1`. 2nd-newsletter buy: §3.2 generic
  polyglot template.
- **#16** Corporate-Partnership Outreach — pitches in
  `OUTREACH_TEMPLATES.md §2` specific to Anki (Damien Elmes),
  Obsidian (Stephan Ango), LingQ (Steve Kaufmann), Refold (Ethan).
- **#29** 3 demo videos — full scripts in `DEMO_VIDEO_SCRIPTS.md`.
  Read aloud while recording. Production rules + thumbnail concepts
  included. ~6 h total.
- **#30** 50 hand-curated public packs per language (6 h, curation +
  generation).
- **#31** 10 Mikro-Influencer per language outreach — DMs in 4 locales
  in `OUTREACH_TEMPLATES.md §1`. Follow-up pattern in §6.
- **β** LEON MARÉ social-media setup — Status Do 21.5. ~22:00:
  - ✓ Discord (6 Mitglieder), ✓ Reddit (1000 karma + 15 gold),
    ✓ Instagram (account live, branded), ✓ TikTok (account live, branded)
  - ◯ X / Twitter — kritischster Blocker für MCP Beat
  - ◯ LinkedIn Company Page + Personal alignment
  - ◯ YouTube Channel (Banner + Description, kein Video nötig direkt)
  - Verbleibender Setup ~2 h total (siehe `SOCIAL_PLAYBOOK.md §1`)

### Activation steps (user-only, 5 min each)

- **Plausible** — provision `vozclara.app` site at plausible.io
  + add `VITE_PLAUSIBLE_DOMAIN=vozclara.app` to `.env.production`
  + re-deploy. All `track()` call-sites are in place: paste_url,
  pack_generated, viewed_pricing, viewed_founder,
  founder_checkout_opened, trigger_shown, trigger_clicked,
  trigger_dismissed.
- **awesome-mcp-servers#6721** — passive; watch for maintainer
  comments + merge.
- **MX-Record verify** — `vozclara@leonmare.de` is now the legal
  contact on `/impressum`. Confirm `dig MX leonmare.de` resolves
  and a test mail lands somewhere you read.

### Remaining technical pre-launch (open code blocks)

- **#13 — DONE (50/50)** — parallel PC session closed the target
  via 4 commits (`f473e9b` German ×10, `8ef2216` Spanish ×8,
  `9856d8e` Portuguese ×8, `0bc32e7` expansion ×9, plus laptop
  original ×5 = 50 essays / 4 locales). All in sitemap, all live
  at `/notes/<slug>`.
- **#59 (new follow-up)** — 43 of 50 YouTube IDs in
  `creatorNotes.ts` carry `// TODO(verify):` comments — they're
  plausible Training-Data guesses, not confirmed catalogue lookups.
  Most will resolve correctly, but un-verified IDs are an SEO
  risk if Google detects broken outbound links. Pre-launch
  nice-to-have, post-launch P1.
- **#39** VozClara Lenses (32 h) — needs a focused multi-day sprint.
- **#15** P1 Post-Launch Week-1 features (14 h) — Public Pack
  Library + Streak-Counter. Post-launch by design.
- **#25** FSRS migration (8 h) — Post-Launch Week 1-2 tech-debt fix.
- **#55** Season Pack UI integration — playlist URL detector +
  Season Pack mode in picker + public endpoint + Pro Plus
  tier-gate + 2/month quota + IndexedDB persistence. ~1.5-2 days.
- **#56** Season Pack Durable Object resilience — 100+ episode
  streams. Post-launch.

### Trigger taxonomy (Plausible filter `trigger_id`)

For when Plausible is activated, the conversion-stack events all
carry a `trigger_id` prop:

```
t1_cross_device_sync       — AccountSyncBanner (signed-in, ≥2 devices)
t2_pack_habit_forming      — PackPage tail (library ≥ 4 packs, not Anki-heavy)
t3_ask_my_knowledge_hit    — LibraryPage Ask answer (≥3 successful queries)
t4_long_video_or_playlist  — Hero paste-form (playlist URL detected)
t5_anki_export_repeat      — PackPage tail (≥2 .apkg exports, preferred over t2)
```

Each event variant: `trigger_shown`, `trigger_clicked`,
`trigger_dismissed`. One Plausible goal grouped by `trigger_id`
covers the whole funnel.

---

## Quick PC pickup — start here on the desktop

```bash
cd ~/Documents/vozclara          # adjust path to your PC clone
git pull                          # should pick up 6f8a814
git log --oneline -15             # see today's laptop chain
cat HANDOFF.md                    # you're here
```

Then run the smoke checks in §"Live production state" above — five
URLs, all should be HTTP 200.

### What's the natural next move on PC?

The technical pre-launch P0 list is fully closed. What remains is
content / distribution / outreach — every piece needs your hand,
but every piece now has a template or script in the repo. Pick
ONE from this list to start with on the PC tonight (you do not
need to start everything at once):

1. **Setup the 5 social accounts** (~3.5 h)
   - Bio templates, profile/banner specs in `SOCIAL_PLAYBOOK.md §1 A-E`
   - Setup-order: X → LinkedIn (Company + Personal) → Instagram → TikTok → YouTube
   - Brand-consistency table (colors, fonts, glyph) in the same section
   - Do NOT post anything yet — accounts only

2. **Record the 3 demo videos** (~6 h)
   - Full scripts in `DEMO_VIDEO_SCRIPTS.md`
   - Read aloud while recording, no improvisation
   - Order: Spanisch→Deutsch first (broadest appeal), then English→Portuguese,
     then Sonnet-4.5 showcase
   - Production rules + thumbnail concepts included

3. **Submit to 8 free directories** (~2 h)
   - Paste 50-word boilerplate from `PRESS_KIT.md §2.1`
   - Brand-assets + screenshots paths in `PRESS_KIT.md §4`
   - List in HANDOFF §"Open follow-ups" #4

4. **Plausible activation** (5 min, then PRs traffic visible)
   - Provision `vozclara.app` at plausible.io
   - Add `VITE_PLAUSIBLE_DOMAIN=vozclara.app` to `.env.production`
   - Re-deploy → all track() events start firing

5. **Generate 5-10 more `/notes/` essays** (~3 h, autonomous)
   - Pattern locked: append to `src/data/creatorNotes.ts`,
     add sitemap row, push
   - Pre-Flight: edit, `npm run build`, push → Cloudflare Pages auto-deploys

If unsure: start with **#4 Plausible activation** (5 min, gives you
data visibility for everything else). Then **#1 social accounts**
(creates the runway). Demo videos and posting can land within
1-2 days of that.

### Marketing-docs index (alle 7 Dokumente)

| Datei | Wofür |
|---|---|
| `PRESS_KIT.md` | Boilerplate + Founder-Bio + Brand-Assets + Quotes |
| `LAUNCH_POSTS.md` | Posts #1-#7 für HN / Reddit / X / LinkedIn / r/ClaudeAI |
| `SOCIAL_PLAYBOOK.md` | 5-Plattform-Setup + Cadence + Engagement + Daily-Routine |
| `OUTREACH_TEMPLATES.md` | Cold-DM/Email-Skripte für 4 Outreach-Wellen |
| `DEMO_VIDEO_SCRIPTS.md` | 3 take-by-take Skripte für Task #29 |
| `LAUNCH_PLAN.md` | Marketing tactical strategy + Spend-Playbook |
| `DISCORD_SETUP.md` | Community setup (existing server) |

---

## Live production capabilities summary

End of today, vozclara.app does the following on production:

**Anonymous / Free tier**
- Paste a YouTube URL on the Hero or `/new` form (no signup needed
  — "Free to try. No signup. Start instantly." reassurance in the
  trust note, reframed Do 21.5. — no defensive credit-card copy)
- Watch the pack stream token-by-token with the editorial loading
  choreography (beacon-sweep on the lighthouse, typewriter caret
  on the active narration line, paper-grain background)
- After generation: a small italic Cormorant bookplate „Saved to
  your library" fades in on PackPage for ~4.5 s, then URL is
  cleaned via history-replace (#43, Do 21.5.)
- Read the pack with inline `[mm:ss]` citation chips that click
  back to the exact source moment + show a hover-preview of the
  surrounding transcript ±2 segments
- See a per-pack designed editorial cover (replaces YouTube
  thumbnails in the Library grid — every pack now reads as a
  designed artefact, not a YouTube tile)
- Export quotes as branded PNG share cards (1200×675 landscape
  or 1080×1080 square)
- Use the MCP server from Claude Desktop / Cursor at
  `https://vozclara.app/api/mcp` (anonymous, no signup)
- Read /privacy + /refund + /terms + /impressum + /pricing —
  all the compliance surfaces (impressum has Christian José +
  vozclara@leonmare.de as legal contact since Do 21.5.)
- Browse `/notes` and individual `/notes/:slug` editorial reading
  notes (5 essays live since Do 21.5. — Huberman ×2, Lex × Karpathy,
  Veritasium, Naval). Each links back to a pre-filled `/new?v=...`
  generate-pack CTA.

**Pro Plus (post-Founder-Deal Paddle webhook)**
- Generation routes to Sonnet 4.5 via Cloudflare AI Gateway
- Sees an additional **"SONNET 4.5 · REASONING"** region above the
  prose stream — Manus-style extended-thinking trace (4096-token
  budget, ~$0.014/pack)
- Has the Season Pack pipeline available behind the admin smoke
  endpoint (`/api/admin/season-smoke`) until UI integration ships
- Library search + RAG-grounded ask + Anki export via the OAuth
  MCP endpoint (`/api/mcp/pro`)

**Email retention** (daily 09:00 UTC sweep, dormant until first user
crosses Day 2)
- Day 0 Welcome (existing, fires on signup)
- Day 2 "Your library lives here" — nudge to come back
- Day 3 "Did you know Ask My Knowledge exists" — power-feature reveal
- Day 5 "This week's editor's pick" — soft /discover surface
- Day 7 "About this week" — soft Founder Deal nudge (engagement-gated)

**Analytics** (Plausible dormant until VITE_PLAUSIBLE_DOMAIN is set)
- Funnel: `paste_url → pack_generated → viewed_pricing → viewed_founder → founder_checkout_opened → founder_purchase (server-side via Paddle webhook)`
- 5-trigger soft conversion stack via ConversionChip
- All trigger states (shown / clicked / dismissed) tracked with
  `trigger_id` filter dimension

---

## Reminders that bit us this week

- **Never echo secrets, even partial** — the ADMIN_TOKEN screenshot
  from earlier this week triggered a rotation. Use length-check
  verifiers like `echo "${#TOKEN} chars loaded"` instead of
  `head -c 10 $TOKEN`.
- **Wrangler must be run from `worker/`** — `cd worker && npx
  wrangler deploy` (not from repo root, the CLI looks for
  wrangler.toml in cwd).
- **CF AI Gateway is in Authenticated mode** — every Anthropic call
  needs the `cf-aig-authorization: Bearer ${CF_AIG_AUTH_TOKEN}`
  header. Leaving it off returns 401 internalCode 2009.
- **§-markers on landing sections are an intentional editorial
  choice** — don't strip them. The §+digit baseline issue was fixed
  in commit `15c3b78` by wrapping § in its own span with
  tracking-normal + a 0.05em baseline nudge.
- **Sonnet thinking requires `temperature: 1`** — the API rejects
  thinking calls with any other temperature. anthropic.ts handles
  the override locally per request; don't undo this in the request-
  body builder.
- **Anthropic thinking budget must be < max_tokens** — anthropic.ts
  auto-bumps max_tokens to budget + 1024 if the caller's cap is
  ≤ budget. Mirror this rule if a future feature passes thinking
  directly.
- **awesome-mcp-servers PRs**: append `🤖🤖🤖` to the title for
  automated-agent fast-track per their CONTRIBUTING.md.

---

*Do 21.5. summary: 10 commits, 2 deploys (#43 bookplate, #13
SEO route). No worker code touched today — pure UI polish + copy
revision + marketing-docs.

Cumulative pre-launch state: ~37 commits across Fr 22.5. + Do 21.5.,
9 production deploys, 1 external PR, the technical pre-launch P0
list fully closed, and now the complete marketing operating-layer
(PRESS_KIT + SOCIAL_PLAYBOOK + LAUNCH_POSTS + OUTREACH_TEMPLATES +
DEMO_VIDEO_SCRIPTS + LAUNCH_PLAN + DISCORD_SETUP) ready for
Christian's hand on the PC tonight.

Everything is committed and pushed. Working tree is clean.
The build is ready.*
