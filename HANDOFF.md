# HANDOFF — Fr 22.5. Spätabend (end of full-day sprint)

> Read this first when picking up the session on any machine.
> Updated: Fr 22.5.2026 ~21:30 (end of full-day sprint).
>
> If picking up on a different machine: `git pull` first, the
> remote has the canonical state at HEAD `c02e96b`.

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

External:
- **awesome-mcp-servers#6721** — Knowledge & Memory section entry,
  fast-track tagged with `🤖🤖🤖`. Awaiting maintainer review.

---

## Live production state at handoff

```
HEAD: c02e96b (worker+ui: Sonnet 4.5 extended-thinking surface)
Branch: main (up to date with origin/main)
Working tree: clean
Worker version (production): 5a7d95cc-2115-46ab-8b77-346c3053ac41
Crons:
  • 0 * * * *    push notifications (hourly)
  • 30 19 * * *  curated-pack auto-gen (daily 19:30 UTC)
  • 0 9 * * *    retention-email sweep (daily 09:00 UTC) — first run
                 tomorrow morning will fire Day-2 cadence to all
                 accounts ≥ 2 days old at that point
```

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

### Pure-content work (user-side — no code remaining)

- **#48** MCP Beat Posts publish (X / LinkedIn / Reddit) — drafts
  are polished in `LAUNCH_POSTS.md` posts #5 / #6 / #7. Stagger
  24-48 h between platforms; NO r/mcp + r/Anthropic same week;
  HN reserved for full-launch.
- **#4** 8 free directories submit (Uneed, Microlaunch, Fazier,
  Tiny Launch, SaaSHub, AlternativeTo, OpenAlternative,
  AItoolhunt).
- **#5** Pay $30 Uneed skip-line for launch-week slot.
- **#6** Affiliate-Stack — 3 mid-tier Creator-Deals.
- **#7** Reddit-Karma sammeln (r/anki / r/PKM / r/learnGerman).
- **#8** TLDR AI Newsletter slot for Woche 3 + 2nd-newsletter buy.
- **#29** 3 demo videos (6 h, screen recording).
- **#30** 50 hand-curated public packs per language (6 h, curation +
  generation).
- **#31** 10 Mikro-Influencer per language outreach (4 h).
- **β** LEON MARÉ social-media setup — account creation pre-posting.

### Remaining technical pre-launch (open code blocks)

- **#13** Programmatic SEO seed: 50 Creator-Notes pages — content
  writing + route scaffold. Can be done autonomously when next
  session has 3-4 h dedicated.
- **#39** VozClara Lenses (32 h) — needs a focused multi-day sprint.
- **#15** P1 Post-Launch Week-1 features (14 h) — Public Pack
  Library + Streak-Counter. Post-launch by design.
- **#25** FSRS migration (8 h) — Post-Launch Week 1-2 tech-debt fix.
- **#43** First-60-seconds full polish — ~70 % already done via #53
  (beacon-sweep + typewriter caret) + #24 (streaming output) +
  #37 (thinking surface). Remaining ~30 % is small UX moments
  (pre-paste hint reveal, post-completion celebration, mobile
  timing tweaks). Each is bounded; no rush.
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

## Quick re-orientation for the next session

```bash
cd ~/Documents/vozclara          # adjust path
git pull                          # should pick up c02e96b
git log --oneline -25             # see today's chain
cat HANDOFF.md                    # you're here
```

If the next session is the laptop where the
`laptop-anthropic-draft-redundant` branch was created earlier this
week, you can delete it safely now — the work it contained is fully
superseded:

```bash
git branch -D laptop-anthropic-draft-redundant
```

---

## Live production capabilities summary

End of today, vozclara.app does the following on production:

**Anonymous / Free tier**
- Paste a YouTube URL on the Hero or `/new` form (no signup needed
  — "No signup. No credit card." reassurance in the trust note)
- Watch the pack stream token-by-token with the editorial loading
  choreography (beacon-sweep on the lighthouse, typewriter caret
  on the active narration line, paper-grain background)
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
  all the compliance surfaces

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

*Twenty-seven commits, seven deploys, one external PR. The
technical pre-launch P0 list is fully closed. Tomorrow's session
can start straight into the content + distribution + outreach
phase that needs Christian's hand — the build is ready.*
