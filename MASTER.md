# VozClara — MASTER PLAN

> **The single source of truth.** Read this before any build session.
> Updated: Di 19.5.2026, 21:00 — Final synthesis after 6 research sweeps.

---

## 📌 The One-Sentence Pitch

> **VozClara is the Granola of Learning** — we turn YouTube, where humanity already watches 1 billion hours per day, into structured, multilingual, retained knowledge.

**North Star Metric:** Monthly Active Pro Users who created a pack in the last 7 days.

---

## 0. The Core Truth

We are building a **$100M-trajectory SaaS** as a solo founder, bootstrapped by Leon Maré Catering. We win not by speed but by **strategic depth**:

1. **A defensible moat across 5 pillars** (Data / Integration / Brand / i18n / Network)
2. **An AI-agent-distributed product via MCP** (zero-CAC into Claude/Cursor/ChatGPT)
3. **An interpretive lens system** nobody else has (Marxist/Buddhist/Stoic readings)
4. **Native multilingual generation** (not translation — generation in each language)
5. **A creator-revenue-share model** that compounds via word-of-mouth

Polish > Speed. No fixed launch date. Launch when 0 P0 bugs + Lighthouse 90+ + green FINAL_QA.

---

## 1. Decisions LOCKED

### 1.1 Pricing (final, not negotiable until 1k paying users)

| Tier | Price | Gate |
|---|---|---|
| **Free** | €0 | 3 videos/week · Summary + Transcript only |
| **Pro** | €9/mo (€72/yr = €6/mo effective) | Unlimited videos · all 4 Reading Modes · SRS + Anki Export · Multi-Lang Pack · Streaming · 8 Format-Lenses · Inline Citations |
| **Pro Plus** | €19/mo | Above + 10 Interpretive Lenses + Custom Lens Editor + Season Pack (2/mo) + Claude Sonnet 4.5 + Voice-Modes + API access (basic) |
| **Founder Deal** | €99 lifetime (cap 100, launch-only) | Pro Plus features for life |

**Quotas (Pro Plus margin protection):**
- 40 standard packs/month included
- 2 Season Packs/month included
- Overage: $0.10/pack
- Hard cap: never charge beyond €19/mo without explicit overage opt-in

### 1.2 Tech Stack (final)

| Layer | Choice |
|---|---|
| **Hosting** | Cloudflare Pages (frontend) + Workers (backend) |
| **Storage** | KV (sessions/cache) + D1 (relational) + Vectorize (embeddings) |
| **LLM Free/Pro** | Llama 3.3 70B via Workers AI (cheap, fast, 128k context) |
| **LLM Pro Plus** | `claude-sonnet-4-5` via Cloudflare AI Gateway → Anthropic |
| **Season Pack** | Summarize-then-Synthesize: Llama per episode → Sonnet 4.5 for cross-synthesis (saves 88% vs raw 800k context) |
| **TTS** | OpenAI `tts-1` (current) |
| **Transcripts** | Supadata (Merchant-of-Record, legally clean) |
| **MCP Stack** | Cloudflare `agents` SDK + `McpAgent` + `workers-oauth-provider` |
| **Payments** | Paddle (Merchant-of-Record for EU VAT, US sales tax, fraud + chargebacks). Pivoted Mi 20.5. after Polar's auto-review rejected the YouTube-adjacent use case. Paddle: 5% + €0.50 all-in (no international surcharge), most mature tax infrastructure. Approved Mi 20.5. ~17:15, embedded Paddle.js checkout overlay live since Mi 20.5. abends. Stripe Founder Payment Link archived. `transaction.completed` webhook still to be wired sub-launch; counter increment manual via admin endpoint until then. |
| **Email** | Resend (from `noreply@leonmare.de` due to domain verification) |
| **Auth** | Magic-link via Resend |
| **Analytics** | Cloudflare Web Analytics (cookieless, no banner needed) |
| **Sentry** | Worker-side only (NO browser SDK — avoids cookie banner) |
| **Frontend** | Vite + React 18 + TS + Tailwind + React Router 7 |
| **Fonts** | Per-locale typographic identity (Reforma ES, Adelle Sans PT, Inter DE, Tiempos EN) |
| **SRS** | FSRS (post-launch migration from SM-2 in Week 1 v1.1) |

### 1.3 Launch Philosophy (final)

- **NO fixed launch date.** We launch when ready.
- **Polish > Speed.** Granola, Lovable, Cursor won on polish + narrative, not on shipping fast.
- **Sustainable solo-sprint** (6h deep + 2-3h shallow daily, 5 build days + 1 marketing + 1 off per week).
- **Hard stop at 20:00 daily.** Sleep beats 3 extra evening hours.
- **Day 13 mandatory deload.** Not optional.
- **Daily build-in-public post.** Loneliness antidote + launch audience.
- **0 P0 bugs from FINAL_QA before launch.**

---

## 2. The 5 Moat Pillars

| # | Pillar | Implementation | Time-to-Copy (25-eng team) |
|---|---|---|---|
| 1 | 📊 **Data Network Effect** | Pack-corpus + Vectorize embeddings + Knowledge Graph + Adaptive AI | 6-9 months |
| 2 | 🔗 **Integration Stack** | MCP Server (Week 1) → Anki Add-on → Obsidian Plugin → Chrome Ext → iOS Share-Sheet → Notion → Zapier | 4-6 months |
| 3 | 🎨 **Brand Taste** | Per-language Typography + LEON MARÉ editorial DNA + AI-Watermark + Editorial Reviews | Structurally unreproducible |
| 4 | 🌍 **Native Multilingual** | ES/PT/DE/EN generation (not translation) + Cross-Lingual Pack Generation | 6-9 months |
| 5 | 👥 **Network Effects** | Public Pack Library + Pack-Remix + Lens-Marketplace + Reviews/Ratings + Creator-Revenue-Share | 9-12 months (network can't be bought) |

---

## 3. The Killer Features (in build order)

### Phase 1 — Foundation (Week 1)
1. ✅ **MCP Server** (Smithery-published) — distribution moat. Phase 1 LIVE Mi 20.5. mittags (anonymous `vozclara_generate_pack`). Phase 2 LIVE Mi 20.5. nachmittags — `search_my_library` / `ask_video` / `export_anki` via OAuth (`workers-oauth-provider`, PKCE S256, scopes `library:read` / `library:write` / `profile`). Smithery listing public as `salvador7eon/vozclara` (Score 84/100, VC monogram icon).
2. ✅ **Compliance Bundle** (Mi 20.5.) — /privacy Subprocessor-Liste (Anthropic / CF / Supadata / Paddle / Resend / OpenAI), AI-Disclosure-Banner auf /new (EU AI Act Art 50(1)), AI-Watermark in Markdown/Text/Anki Exports (EU AI Act Art 50(2)), /refund Page mit 14-Tage-Garantie. Browser-Sentry-SDK gedroppt Mi 20.5. — cookieless-by-design final.
3. ✅ **Paddle Merchant-of-Record** — approved Mi 20.5. ~17:15. Embedded Paddle.js checkout overlay live an /founder, MoR handles EU VAT + US sales tax + chargebacks. Stripe Founder Payment Link archived. Webhook `transaction.completed` wiring ist sub-launch task; bis dahin counter manuell via `POST /api/founder/admin/increment` nach jeder Paddle sale email.
4. ⚡ **Inline Timestamp-Citations** — 10× leap over Eightify
5. 🚨 **Account-less First Pack** — Lovable growth-hack
6. 🔥 **Streaming Pack-Gen + Agent-Thinking-Stream** — Manus + Granola pattern
7. 🛠 **/pricing Page** with vs NotebookLM/Eightify table

### Phase 2 — Wow Features (Week 2)
8. 🔍 **VozClara Lenses** (18 total: 8 format + 10 interpretive) — genuine uniqueness
9. 🌐 **Long-Context Season Pack** (Sonnet 4.5 + summarize-then-synthesize)
10. 🎨 **Per-Language Typography** (4 typefaces)
11. 🧠 **Claude Skills Bundle** (2nd discovery channel)

### Phase 3 — Quality (Week 3)
12. 📹 3 demo videos (30s + 90s + 4min)
13. 📦 200 seed packs (50 × 4 languages)
14. 📣 40 micro-influencer outreach
15. ♿ WCAG 2.1 AA + Lighthouse 90+
16. 📔 RUNBOOK.md for launch-week incidents
17. 🟢 status.vozclara.app (Instatus/BetterStack)

### Phase 4 — Soft Launch (Week 4)
- Discord beta + bug-fix sprint
- Cross-browser + mobile QA

### Phase 5 — REAL Launch (Week 5)
- Show HN + Product Hunt + Uneed + Twitter + LinkedIn
- Reddit drip Day 2-7
- Micro-influencer activations Day 3-7

### Phase 6 — Post-Launch v1.1 Waves (Weeks 6-12)
- **Wave 1:** Chrome Ext, Cmd+K, Onboarding, FSRS migration, Mind-Map output
- **Wave 2:** VozClara Brain, Cross-Lingual Pack-Gen, Image-OCR, Public Library, Streak-Counter
- **Wave 3:** Pack-Remix Marketplace, Anki Add-on, iOS Share-Sheet, Companion (RAG, re-introduced)
- **Wave 4:** Obsidian Plugin, Notion Integration, Skill-Tree, Year-End-Recap

### Phase 7 — Investor (Month 6-12)
- 10k paying users, €1.08M ARR
- Seed Round $1-3M from Earnest Capital / Calm Company / TinySeed

---

## 4. The 18 Lenses (locked spec)

### Format Lenses (8) — Output-Shape

| # | Lens | Output | Best For |
|---|---|---|---|
| 1 | 📇 Anki Deck | Direct .apkg export | SRS learners |
| 2 | 📓 Cornell Notes | Q/A column + Cue + Summary | Students |
| 3 | 🇪🇸 CEFR Worksheet (A1-C2) | Vocab + Grammar + Cloze + Shadow | Language learners |
| 4 | 💼 Executive Briefing | 3 bullets + 5 actions + 1 contrarian | Decision-makers |
| 5 | 📱 TikTok Hook (60s) | Script + Beats + B-roll cues | Creators |
| 6 | 📅 SRS Schedule Plan | Cards with FSRS-tuned dates | Long-term learners |
| 7 | 📚 Academic Notes | LaTeX-Math + Citations + Bib | Academics |
| 8 | 💻 Code Tutorial | Snippets + runnable + annotations | Developers |

### Interpretive Lenses (10) — UNIQUE MAGIC (no competitor has these)

| # | Lens | What it does |
|---|---|---|
| 9 | 🧠 Skeptic Lens | Finds every claim + asks "where's the evidence?" |
| 10 | 🌱 Beginner ELI5 | Simplifies to 10-year-old level, no jargon |
| 11 | 🎩 Devil's Advocate | Argues AGAINST every claim |
| 12 | 🧘 Buddhist Lens | Reads through impermanence/compassion |
| 13 | ⚔️ Stoic Lens | Extracts only stoic-compatible wisdom |
| 14 | 🔴 Marxist Lens | Class-struggle reading |
| 15 | 🦊 Steel-Man Lens | Strongest possible version of arguments |
| 16 | 🎯 Counter-Argument Lens | What would the opponent say? |
| 17 | 🧬 First-Principles Lens | Feynman-style reduction to base axioms |
| 18 | 🔬 Researcher Lens | Extracts papers, studies, citations |

**Pro Tier:** 8 Format Lenses
**Pro Plus Tier:** All 18 + Custom Lens Editor + Lens Chaining

**Viral moment:** "Just ran Joe Rogan #2200 through the Marxist Lens 🔥" — nobody else can produce this.

---

## 5. Cost Model & Hard Caps

### Per-Pack Costs (May 2026)

| Pack Type | Model | Input | Output | Per-Pack Cost |
|---|---|---|---|---|
| Standard (Free/Pro) | Llama 3.3 70B | 30k | 5k | $0.01 |
| Premium (Pro Plus, cached) | Sonnet 4.5 | 30k (28k cached) | 5k | **$0.089** |
| Season Pack (Pro Plus, summarize-then-synthesize) | Llama → Sonnet 4.5 | 200k synthesized | 50k | **$0.75** |

### Pro Plus Unit Economics

| Metric | Value |
|---|---|
| Revenue/user/month | €19 (~$20.50) |
| COGS at quota cap (40 standard + 2 Season) | ~$3.29 |
| Stripe fees (2.9%) | $0.59 |
| Infra fixed | $0.20 |
| **Net margin/user** | **~$16.42** |

### Scaling Forecast

| Users | Monthly Anthropic Bill | Revenue | Gross Margin |
|---|---|---|---|
| 1k Pro Plus | $3,290 | €19,000 | 84% |
| 10k Pro Plus | $32,900 | €190,000 | 84% |
| 100k Pro Plus | $329,000 | €1,900,000 | 84% |

**Caching is mandatory.** Without prompt caching, costs 2.3× higher. Cache all 18 Lens system prompts as single block, TTL 1h.

---

## 6. Tech Implementation Specifics

### 6.1 MCP Server (Phase 1 priority)

**Stack:** `agents` SDK + `McpAgent` + `workers-oauth-provider` (NOT raw `@modelcontextprotocol/sdk`).

**File structure:**
```
worker/src/
  mcp/
    agent.ts            # VozClaraMCP extends McpAgent
    tools/
      generate-pack.ts
      get-pack.ts
      search-library.ts
    schemas.ts          # zod schemas
  auth/
    handler.ts          # Hono OAuth /authorize UI
    bearer.ts           # PAT validator
```

**3 composite tools (not 5):**
1. `vozclara.generate_pack(url, language, depth)` — depth: quick/standard/deep
2. `vozclara.get_pack(pack_id, section?)` — section: summary/flashcards/quiz/all
3. `vozclara.search_my_library(query, limit?)`

**Output shape (critical):**
- 200-token summary in `content[].text` (LLM sees immediately)
- Detail via `resource` with URI `vozclara://pack/<id>`
- `structuredContent: { packId, url, summary, ... }` for native client parsing
- Canonical web URL for humans

**Publish:**
```bash
smithery mcp publish https://vozclara.app/mcp \
  -n vozclara/vozclara \
  --config-schema ./smithery-config.json
```

Tags: `youtube`, `notes`, `summarization`, `study`, `flashcards`, `transcription`.

### 6.2 Anthropic API Integration

**Use Cloudflare AI Gateway**, not raw Anthropic endpoint:
```
gateway URL = https://gateway.ai.cloudflare.com/v1/${ACCT}/${GW}/anthropic/v1/messages
```

**New files:**
```
worker/src/
  anthropic.ts          # callAnthropic + withRetry
  anthropic-stream.ts   # ReadableStream re-streaming
  llm-router.ts         # tier-aware: Free/Pro → Llama, Pro Plus → Sonnet 4.5
```

**Prompt caching** (mandatory):
```typescript
system: [{
  type: 'text',
  text: lensSystemPrompt,
  cache_control: { type: 'ephemeral', ttl: '1h' }
}]
```

### 6.3 Season Pack Implementation

**NOT** naive 800k-context call. Use **summarize-then-synthesize**:
1. For each episode (40 total), call Llama 3.3 to generate 5k-token summary
2. Combine 40 × 5k = 200k summaries
3. Call Sonnet 4.5 with all summaries + synthesis prompt
4. Output: cross-episode pack with themes, contradictions, concept evolution

**Cost: $0.75/pack (vs $3.15 naive). 88% savings.**

Long-running streams → Durable Object for client reconnect resilience.

---

## 7. Quality Bar

### Must-haves Before Launch

- **Lighthouse Mobile 90+** across Performance / Accessibility / SEO / Best Practices
- **Core Web Vitals:** LCP <2.5s, CLS <0.1, INP <200ms
- **WCAG 2.1 AA:** keyboard nav, focus visible, alt text everywhere, contrast 4.5:1, `aria-label` on icon buttons
- **0 cookie banner** (Cloudflare Web Analytics cookieless + no browser Sentry)
- **AI disclosure** banner on first pack-generate (EU AI Act Art 50 prep)
- **AI watermark** on all exports (Anki .apkg + PDF + Markdown)
- **3 hand-crafted error/empty states** per locale (not 30 lazy ones)
- **404 + 500** pages with brand voice
- **status.vozclara.app** live (Instatus/BetterStack free tier)
- **Crisp.chat** support widget (free tier)
- **0 P0 bugs** from FINAL_QA.md re-run

### Retention-Targets (Phase-1 nach Launch — Success-Definition)

| Metric | App-Median | Prosumer-AI Top-Quartile | **VozClara Phase-1-Ziel** |
|---|---|---|---|
| D1 Retention | 26% | 40% | **35%** |
| D7 Retention | 13% | 22% | **18%** |
| D30 Retention | 7% | 12% | **10%** |

**Signal:** D30 ≥ 15% = PMF erreicht. D7 < 12% = wow-moment sticks nicht → debug Phase 4 Soft-Launch.

### Brand-Voice Forbidden Patterns (siehe CLAUDE.md §5 + IDEAS §11.6)

NIEMALS einbauen — wir sind editorial, nicht algorithm-doomscroll:
- ❌ Confetti / Animated Celebration auf Actions
- ❌ Passive-aggressive Notifications (Duolingo Owl)
- ❌ Fake Social Proof Numbers
- ❌ Pre-Wow Paywall (CC vor First Pack)
- ❌ Asymmetric Cancel Flow (EU DSA-Verstoß)

### Signature Micro-Interaction (siehe IDEAS §11.1)

**Citation Hover-Replay:** Hover/Tap auf `[12:34]` Citation → 6s Inline-Video-Clip an exakter Stelle, muted, captioned, navy-gerahmte Card schwebend. Das ist DAS Brand-defining Moment das Leute screenshoten.

Implementation in Task #22 (Citations) erweitert um 1.5 Tage.

---

## 8. Risk Register

| Risk | Probability | Mitigation |
|---|---|---|
| **NotebookLM adds YouTube + multilingual + SRS** | Medium | Integration moat (Anki/Obsidian/Notion/MCP) makes switching cost real. Brand-moat. Time-to-market lead with Lenses + Season Pack. |
| **YouTube TOS change blocks transcripts** | Low-Medium | Supadata is MoR (they take risk). Diversify input: Vimeo, Spotify Podcasts, MP3/MP4 upload (already in roadmap). |
| **Bootstrap cash runs out before Seed** | Medium | Catering revenue + Founder Deal Lifetime cash + AppSumo 1-year-Pro Month 4 ($9.8k injection). |
| **Anthropic rate-limit at launch** | Medium | AI Gateway automatic fallback to Workers AI Llama on Anthropic outage. |
| **Solo-Founder Burnout** | **HIGH** | 6h deep + 2-3h shallow max. Day 13 deload mandatory. Hire #1 Month 6: Senior Engineer. |
| **Scope creep** | **HIGH** | Lock 18 Lens API contracts by Day 5 in CLAUDE.md. No net adds after Day 3 — cut 1 for every 1 added. |
| **AI making contradictory decisions in Week 3-4** | High | CLAUDE.md as contract, reviewed every Monday. "Do not touch" zones explicit. |

---

## 9. The Sustainable Sprint Schedule

**Based on:** Tony Dinh / Marc Lou / Pieter Levels / Boris Cherny actual patterns + UK Biobank sleep data + Sifted burnout survey.

### Daily structure (8.5h productive, 10-11h "on", hard stop 20:00)

| Slot | Activity |
|---|---|
| 9:00-10:00 | Morning anchor: walk + previous-day review |
| 10:00-13:00 | **Deep Block 1** (3h) — hardest build work, Claude Code plan-mode |
| 13:00-14:00 | Lunch + walk OFF SCREEN |
| 14:00-17:00 | **Deep Block 2** (3h) — second-hardest work, debugging, polish |
| 17:00-19:00 | Shallow block: outreach, content, support, **catering business batch** |
| 19:00-20:00 | Reddit/Discord check + build-in-public post + sunset |
| 20:00 | **HARD STOP.** No code after dinner. |
| 22:30+ | Bed. 7h sleep minimum. |

### Weekly structure

| Day | Type |
|---|---|
| Mon-Fri | 5 build days (8.5h productive each) |
| Sat | 1 marketing/content day (demo videos, seed packs, influencer outreach) |
| Sun | **1 FULL day OFF.** Non-negotiable. |

### 4-Week Sprint Map (realistic, not 25-day-15h fantasy)

**Week 1 — Foundation (Mi 20.5. - Di 26.5.)**
- Compliance Bundle + MCP Server + Paddle approval-watch (Stripe Founder Link as Plan B)
- Citations + Account-less + Streaming + Agent-Thinking
- /pricing Page + AI Watermark

**Week 2 — Wow Features (Mi 27.5. - Di 2.6.)**
- VozClara Lenses (18) — 3 days
- Season Pack + Anthropic integration — 2 days
- Per-Language Typography — half day

**Week 3 — Quality (Mi 3.6. - Di 9.6.)**
- 3 demo videos + 200 seed packs + 40 influencer outreach
- Lighthouse + WCAG audit
- RUNBOOK.md + status page + Crisp

**🛑 DAY 13 (So 1.6. or moved): MANDATORY DELOAD** — full day off, walk, no laptop.

**Week 4 — Soft Launch (Mi 10.6. - Di 16.6.)**
- Discord beta opens, bug-fix sprint
- Cross-browser + mobile final QA

**Week 5 — REAL Launch (Mi 17.6. - Di 23.6.)**
- Mon: Show HN + Product Hunt + Uneed
- Tue-Sun: Sustained drip (Reddit + influencer activations)

**Post-launch Week 1:** Drop to **4h deep work/day**. The rest is support + community. Founders who keep building during launch week crash by Day 30.

---

## 10. Investor Phases

| Phase | Month | Users | MRR | ARR | Round | Valuation |
|---|---|---|---|---|---|---|
| **Bootstrap** | 0-6 | 1k | €9k | €108k | Founder Cash + Catering + Founder Deal | — |
| **Seed** | 6-12 | 10k | €90k | €1.08M | $1-3M | $10-20M |
| **Series A** | 12-24 | 100k | €900k | €10.8M | $20-40M | $80-150M |
| **Series B** | 24-30 | 300k+ | €3M | €36M | $50-100M | $400-800M |
| **Series C** | 36-48 | 1M+ | €10M+ | €120M+ | $100-200M | **$1-2B** |

**Funding Targets (Seed):** Earnest Capital, Calm Company Fund, TinySeed
**NOT:** a16z, YC, Atomico (too early)
**Plus Angels:** Adam Wathan, Pieter Levels, Damon Chen, Tony Dinh

---

## 11. Day-1 Sprint Kick-off (Mi 20.5.2026)

Apply the realistic schedule from Section 9:

| Slot | Action |
|---|---|
| 9:00-10:00 | Morning anchor: walk + read MASTER.md aloud + CLAUDE.md review |
| 10:00-13:00 | **Deep Block 1:** Wrangler secret list verification + Anthropic account setup + Cloudflare AI Gateway config + first MCP scaffolding (`mcp/agent.ts` + first tool `generate_pack`) |
| 13:00-14:00 | Lunch + walk OFF screen |
| 14:00-17:00 | **Deep Block 2:** Compliance Bundle (AI Disclosure Banner + Watermark on .apkg export + Sentry browser-side drop + /privacy update) |
| 17:00-18:00 | Catering admin (batched window) |
| 18:00-19:00 | Polar.sh account creation + evaluation + Build-in-Public post |
| 19:00-20:00 | Reddit r/anki Karma-comment + Discord check |
| 20:00 | HARD STOP. |

---

## 12. Document Index

| File | Purpose |
|---|---|
| **MASTER.md** | This file. Single source of truth. |
| **CLAUDE.md** | AI-pair-programming contract. Invariants, conventions, "do not touch" zones. |
| **ROADMAP.md** | Chronological 4-week build plan with daily structure. |
| **VISION.md** | Long-form strategy, $100M-raise pathway, investor narratives. |
| **IDEAS.md** | 87-feature backlog with moat-ranking. |
| **LAUNCH_PLAN.md** | Tactical marketing: reach channels, directories, Reddit, influencers. |
| **LAUNCH_POSTS.md** | Drafts for HN/Reddit/X. |
| **FINAL_QA.md** | 185-item pre-launch quality checklist. |
| **DISCORD_SETUP.md** | Community infrastructure. |
| **RUNBOOK.md** | (To create) Launch-week incident response. |

---

## 13. Decision Principles (when new situations arise)

1. **Polish > New Feature.** When in doubt, polish what exists.
2. **Moat > Feature.** Build what 25-eng teams can't copy in 6 months.
3. **Composite > Atomic.** One tool with parameters beats 5 tools.
4. **Cached > Uncached.** Every Anthropic call must have system-prompt caching.
5. **Streamed > Batched.** Visible token output is 2026 table stake.
6. **Native > Translated.** Generate in target language, don't translate.
7. **Lock > Iterate** (for APIs/Schemas). Lens API + Pack schema = locked, no mid-sprint changes.
8. **Build-in-Public > Stealth.** Daily post on Twitter/Discord during sprint.
9. **Health > Output.** Sleep + walk + day off non-negotiable.
10. **Honest > Spin.** When Reddit/HN flags an issue, admit + fix.

---

**Status:** LOCKED Di 19.5.2026, 21:00. Build mode active Mi 20.5. 9:00.

**The one thing to internalize:** A rested founder shipping 30h/week beats a burned-out founder shipping 80h/week. Plan the sprint so the version of you on Day 30 — who answers Reddit threads, fixes production bugs, closes the first 10 customers — actually exists.
