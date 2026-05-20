# VozClara — Build Roadmap

> Fahrplan. Polish-First. Kein fixes Launch-Datum.
> Wir launchen wenn alles perfekt ist, nicht am 25.5.
>
> Dies ist der **operative Plan**. Strategie steht in VISION.md.
> Features-Backlog steht in IDEAS.md. Tactical Marketing in LAUNCH_PLAN.md.

---

## Session Handoff — Mi 20.5.2026 12:30 (PC → Laptop)

**Pause am PC. Laptop nimmt nach Pause auf.**

### Heute Vormittag fertig (PC-Session Mi 20.5.)
- ✅ Paddle MoR submitted (~14:30 Di 19.5. → ich glaub das war Mi morgens, ~22h in 24-72h Window). Email-Watch läuft.
- ✅ `/refund` Route + Footer-Link + Sitemap-Entry (4 Locales). Refund-Policy tightened (kein EU-Art-16(m)-Waiver mehr, "substantial use" caveat, `finance@leonmare.de` Kontakt).
- ✅ Polar → Paddle Doc-Pivot across CLAUDE/MASTER/ROADMAP/IDEAS.
- ✅ Compliance Bundle: /privacy Subprocessor-Block (4 Locales), AI-Disclosure-Banner auf /new (EU AI Act Art. 50(1)), AI-Watermark in Markdown/Text/Anki Exports (Art. 50(2)).
- ✅ **MCP Server Phase 1 LIVE** — `worker/src/mcp/agent.ts` mit `vozclara_generate_pack` tool. Endpoints `vozclara.app/api/mcp` (Streamable HTTP) + `vozclara.app/api/sse` (SSE). End-to-end verified mit echtem YouTube-Video (RickRoll, English → German).
- ✅ **Smithery published** — `salvador7eon/vozclara` Public, Score 84/100, VC-Monogram-Icon (navy + gold, Cambria, double-rule frame), Description + Homepage + Repo gesetzt.
- ✅ Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`) hat `vozclara` MCP server eingetragen, working.
- ✅ README rewrite mit Smithery-Badge + MCP-Integration-Sektion + aktuellem Stack.

### Pending Items (sortiert nach Priorität)

1. ✅ **Paddle approval** — DONE Mi 20.5. ~17:15. Product `pro_01ks30gafe4te11a1ptf28pxka` + Price `pri_01ks30tgbj097qbtjhebzqyf2z` (€99 one-time, Active). Embedded Paddle.js overlay live an /founder mit `successUrl: https://vozclara.app/founder?welcome=1`. `VITE_PADDLE_CLIENT_TOKEN` + `VITE_PADDLE_FOUNDER_PRICE_ID` in `.env.production`. Stripe Founder Link archiviert. `worker/src/founder.ts` Kommentare refreshed (commit `fbdf6d5`). Open: `transaction.completed` webhook wiring → sub-launch task.
2. **Build-in-Public-Post** — draft 3 Tonalitäten (X/LinkedIn/Reddit) für den ersten richtigen Launch-Beat. Inhalt: "VozClara now MCP-callable, one-click install via Smithery". Erst-Veröffentlichung wenn Paddle approved oder Paddle-rejection-resolved.
3. **Source-language fix in MCP** — Supadata gibt aktuell oft `de` als sourceLanguage zurück auch bei englischen Videos (defaults zur Worker-Location). Funktional egal weil Llama Cross-Lingual macht, aber für Pack-Schema-Korrektheit fixen. Edit in `worker/src/mcp/agent.ts` `fetchSupadataTranscript()`.
4. **Browser-Sentry SDK drop** — Cookie-Banner-Compliance final-check. ~30 min.
5. **Phase 2 MCP Tools** — `vozclara_search_my_library`, `vozclara_ask_video`, `vozclara_export_anki`. Brauchen OAuth via `workers-oauth-provider` weil sie brainId benötigen. ~3-4h sprint.
6. **Per-pack provenance field** auf KnowledgePack-Schema (CLAUDE.md §1.1) — `{ model, lens_id, watermark }`. Sub-launch nice-to-have.
7. **Reddit Karma**: r/Notion oder r/PersonalKnowledgeMgmt (Mi-Do), r/learnGerman (Do).

### Files mit lokalem State (NICHT auf Laptop synced via Git)
- `worker/.dev.vars` — enthält `SUPADATA_API_KEY=sd_...`. Auf Laptop wahlweise neu anlegen ODER weiter direkt gegen production curlen.
- `node_modules/` — Standard, `npm install` auf Laptop nötig.

### Letzte 10 Commits (alle pushed)
```
b044a15  docs: rewrite README — current stack, Smithery badge, MCP integration
cd1286c  brand: polish VC monogram icon (Cambria + double-rule frame)
6487853  brand: switch MCP icon to VC monogram (V creme + C gold interlocked)
7ca9f5c  brand: add MCP server icon (512x512 navy/gold serif V)
e4bfa78  mcp: fix CORS + binding for production MCP transports
56a73b6  mcp: scaffold MCP server with generate_pack composite tool (Phase 1)
682a12b  compliance: AI-generated watermark in Markdown/Text/Anki exports
0763acb  compliance: AI disclosure banner on /new (EU AI Act Art. 50 prep)
d979f35  compliance: add Subprocessors + Paid-Tier section to /privacy (4 locales)
f7b2bca  docs: pivot Polar -> Paddle across CLAUDE/MASTER/ROADMAP/IDEAS
```

### Laptop-First-Move
```bash
cd ~/Documents/vozclara   # or wherever the repo lives on the laptop
git pull
npm install               # in case package-lock.json moved
npm --prefix worker install
# Optional if want to test MCP locally: create worker/.dev.vars with SUPADATA_API_KEY
```

Dann CLAUDE.md + MASTER.md + ROADMAP.md (= dieser Block) lesen, ein Kaffee, los geht's.

---

## Phase 0 — Decisions LOCKED (Stand Di 19.5.2026)

| Decision | Lock |
|---|---|
| Pro Tier €9/mo + €99 Lifetime Founder (cap 100) | ✅ |
| Pro Plus €19/mo (Custom Lenses + Season Pack + Premium AI) | ✅ |
| Free Tier: 3 Videos/Woche, Summary + Transcript only | ✅ |
| Pro Gate: SRS+Anki, Lenses, alle Modes, Multi-Lang, Streaming | ✅ |
| Pro Plus Gate: Custom Lenses, Season Pack, Anthropic Sonnet 4.5, Voice-Modes | ✅ |
| Primary LLM (Free/Pro): Llama 3.3 70B via Workers AI | ✅ |
| Premium LLM (Pro Plus): **Claude Sonnet 4.5** via Cloudflare AI Gateway → Anthropic (NOT 4.7) | ✅ |
| Season Pack: **Summarize-then-Synthesize** Pattern (Llama → Sonnet), nicht raw 800k context | ✅ |
| Prompt Caching: 1h TTL auf Lens System-Prompts (mandatory, 70% cost reduction) | ✅ |
| Quotas: Pro Plus capped 40 standard + 2 Season Packs/mo, overage $0.10/pack | ✅ |
| MCP Stack: Cloudflare `agents` SDK + `McpAgent` + `workers-oauth-provider` | ✅ |
| Transcript Provider: Supadata (legally clean) | ✅ |
| Payments: **Paddle** (Merchant-of-Record). Pivot Mi 20.5. nach Polar-Rejection ("YouTube content-processing-adjacent"). Paddle: 5% + €0.50 all-in (no international surcharge), most mature tax infrastructure (Stripe-acquired Lemon Squeezy ruled out for post-acquisition uncertainty). MoR trägt EU-VAT-Audit-Risiko, spart Steuerberater (~€500-2k/Jahr) + 0 Min monatliches Filing. Approved Mi 20.5. ~17:15. Embedded Paddle.js checkout overlay live an /founder. Stripe Founder Payment Link archived. | ✅ live |
| Launch-Date: WHEN-READY, nicht fixed 25.5. | ✅ |
| Polish > Speed | ✅ |

---

## ⚠️ SUSTAINABILITY-PRINCIPLE (added Di 19.5. 21:00)

Daily-Schedule basierend auf realer 2025-26 Solo-Founder-Data:
**6h Deep Work + 2-3h Shallow** = max productive ceiling.
Hard stop 20:00. 5 build days + 1 marketing/admin day + 1 FULL day off per week.
**Day 13 mandatory deload.** Siehe MASTER.md §9 für Details.

15h/Tag-Pattern = burnout (Sifted 2025: 54% solo founders burned out).
Tony Dinh shipped $1M MRR mit 20-30h/WOCHE. Marc Lou: 4h/day deep. Pieter Levels: "I was working all the time because I was lonely."

---

## Phase 1 — Foundation Polish (Woche 1: Mi-Di, 5 Build-Tage)

**Ziel:** Alles legal-clean, alles wow-ready, MCP-Server live. Sustainable Tempo: 6h Deep + 3h Shallow täglich, hard stop 20:00.

### Daily Structure (gilt für alle Build-Tage)

| Slot | Block | Type |
|---|---|---|
| 9:00-10:00 | Morning anchor: walk + previous-day review | shallow |
| 10:00-13:00 | **Deep Block 1** (3h) — hardest build work | **DEEP** |
| 13:00-14:00 | Lunch + walk OFF SCREEN | break |
| 14:00-17:00 | **Deep Block 2** (3h) — second-hardest work | **DEEP** |
| 17:00-19:00 | Shallow: outreach, content, support, catering admin | shallow |
| 19:00-20:00 | Reddit/Discord + build-in-public post | shallow |
| 20:00 | **HARD STOP** | — |

### Mi 20.5. — Foundation Day (~9h productive)

**Deep Block 1 (10-13):** Compliance Bundle (Task #33)
- Wrangler-Secret-Check + Anthropic Account/Billing setup
- AI-Disclosure-Banner First-Run
- /privacy Update mit Subprocessors (Anthropic/Cloudflare/Supadata)
- Drop browser Sentry SDK
- AI-Watermark Plumbing in Export-Pipeline

**Deep Block 2 (14-17):** MCP Server Foundation (Task #32)
- Install `agents` SDK + `workers-oauth-provider`
- Create `worker/src/mcp/agent.ts` scaffold
- First composite tool: `vozclara.generate_pack(url, language, depth)`
- Smithery account erstellen

**Shallow (17-19):** Polar.sh evaluation + Anthropic API key in Workers Secret + r/anki Karma Comment

### Do 21.5. — MCP + Citations Day

**Deep Block 1 (10-13):** MCP Server complete
- Tools 2-3: `get_pack`, `search_my_library`
- OAuth handler + Smithery publish

**Deep Block 2 (14-17):** Inline Timestamp-Citations (Task #22)
- Prompt-Engineering für `[MM:SS]`-Pattern Output
- Render-Layer: parsed `[04:23]` → klickbare YouTube-Deep-Links

**Shallow (17-19):** Claude Skills Bundle (Task #36) + Polar.sh Decision

### Fr 22.5. — Account-less + Streaming Day

**Deep Block 1 (10-13):** Account-less First Pack (Task #23)
- Anonymous endpoint mit IP-rate-limit
- KV `anonymous-{nonce}` storage
- Migration-on-signup flow

**Deep Block 2 (14-17):** Streaming + Agent-Thinking-Stream (Tasks #24 + #37)
- SSE in Worker
- Sidebar component für Live-"Thoughts"
- Mix echte Status + cosmetic Filler

**Shallow (17-19):** /pricing-Page Skeleton + Vergleichstabelle Outline

### Sa 23.5. — Pricing + Pack-Share Day

**Deep Block 1 (10-13):** /pricing-Page complete
- Vergleichs-Tabelle vs NotebookLM/Eightify/NoteGPT
- 3-Tier-Layout (Free/Pro/Pro Plus)
- Founder-Deal-Banner mit Cap-Counter

**Deep Block 2 (14-17):** Pack-Share-URL + OG-Preview
- `vozclara.app/p/{id}` öffentliche Pack-Pages
- OG-Image dynamisch generiert per Locale
- Watermark eingebaut

**Shallow (17-19):** RUNBOOK.md schreiben (Task #35)

### So 24.5. — MARKETING DAY (kein Code, leichter Tag)

- Demo-Video Konzept-Outline (für Tasks #29)
- Influencer-Spreadsheet anlegen mit 40 Targets (Task #31)
- Discord post + Twitter build-in-public
- Lighthouse-Baseline-Audit (informational)

### Mo 25.5. — FULL DAY OFF (non-negotiable)

Recharge. Walk. Movie. Family. Kein Laptop. Marc Lou's Pattern.

**Woche 1 Output:**
- ✅ MCP Server live + published auf Smithery
- ✅ Compliance Bundle (AI Disclosure + Watermark + Sentry-Drop + /privacy)
- ✅ Inline Citations mit YouTube-Deep-Links
- ✅ Account-less First Pack funktioniert
- ✅ Streaming + Agent-Thinking-Sidebar demoable
- ✅ /pricing-Page production-ready
- ✅ Pack-Share-URL + OG-Preview
- ✅ Claude Skills Bundle in Marketplace
- ✅ RUNBOOK.md baseline ready

---

## Phase 2 — Wow Features (Woche 2: Di-Mo, 5 Build-Tage)

**Ziel:** 18 Lenses + Season Pack + Per-Language Typography + Anthropic Integration. Die echte Magic.

### Di 26.5. (Build Day 1) — Anthropic Integration

**Deep Block 1 (10-13):** Cloudflare AI Gateway Setup
- Account-Setup in CF Dashboard, gateway `vozclara-prod`
- `worker/src/anthropic.ts` schreiben: callAnthropic + withRetry
- ANTHROPIC_API_KEY via wrangler secret

**Deep Block 2 (14-17):** Streaming Implementation
- `worker/src/anthropic-stream.ts`: ReadableStream re-streaming
- `worker/src/llm-router.ts`: tier-aware Llama/Sonnet routing
- Usage tracking via ctx.waitUntil()

**Shallow (17-19):** D1 Migration `user_usage` Table + Discord build-in-public

### Mi 27.5. (Build Day 2) — 8 Format Lenses

**Deep Block 1 (10-13):** Prompt-Templates für Format Lenses 1-4
- Anki Deck Lens
- Cornell Notes Lens
- CEFR Worksheet (A1-C2)
- Executive Briefing

**Deep Block 2 (14-17):** Prompt-Templates für Format Lenses 5-8
- TikTok Hook 60s
- SRS Schedule Plan
- Academic Notes (LaTeX)
- Code Tutorial Mode

**Shallow (17-19):** Lens Selector UI mockup + r/PKM Karma Comment

### Do 28.5. (Build Day 3) — 10 Interpretive Lenses

**Deep Block 1 (10-13):** Interpretive Lenses 9-13 (Skeptic, ELI5, Devil's, Buddhist, Stoic)
- Each gets dedicated system-prompt mit Voice + Tone calibration
- Anti-preachy guardrails

**Deep Block 2 (14-17):** Interpretive Lenses 14-18 (Marxist, Steel-Man, Counter, First-Principles, Researcher)
- Same prompt engineering depth
- Test mit Lex Fridman Sample-Pack

**Shallow (17-19):** Lens Hover-Preview System mit Beispiel-Outputs

### Fr 29.5. (Build Day 4) — Lens UI + Generation Pipeline

**Deep Block 1 (10-13):** Lens Dropdown + Context-Aware Filter
- React Component für Lens-Selector
- Context-aware (Cornell zeigt nicht bei Cooking-Video)
- Pro Plus Gate für Interpretive Lenses

**Deep Block 2 (14-17):** Pack-Generation Pipeline Integration
- Lens-Choice flows through Worker → Anthropic call
- Cache Lens system-prompts mit 1h TTL
- Quota check at endpoint level

**Shallow (17-19):** Lens Marketplace-Foundation Data-Model + Pack-Storage updates

### Sa 30.5. (MARKETING DAY) — Seed-Packs ES + Demo-Recording Start

- 50 ES Public Packs aus 4-5 Top-Channels (Marc Vidal, Dot CSV, La Hiperactina, Veritasium-ES)
- Demo-Video 30s TikTok roughcut
- Twitter build-in-public update
- Reddit r/getstudying participation

### So 31.5. — FULL DAY OFF

Non-negotiable. Walk. Movie. Family. Kein Laptop.

### Mo 1.6. (Build Day 5) — Season Pack + Per-Lang Typography

**🛑 Day 13 of sprint — wenn Energy below baseline, statt Code: zusätzlicher Off-Day.**

**Deep Block 1 (10-13):** Season Pack Endpoint (Task #27)
- Summarize-then-Synthesize Pipeline
- Step 1: Each episode → Llama 3.3 (5k summary)
- Step 2: Combined 200k summaries → Sonnet 4.5 synthesis
- Quota: 2/month Pro Plus

**Deep Block 2 (14-17):** Per-Language Typography (Task #38)
- Font-Lizenzen ordern (Reforma + Adelle Sans wenn budget, sonst Plex)
- CSS-Variables mit `:lang()` switching
- Heading-Hierarchy pro Sprache

**Shallow (17-19):** Empty-States + Error-States Brand-Voice in 4 Sprachen

**Woche 2 Output:**
- ✅ Anthropic API + AI Gateway integriert
- ✅ Streaming + tier-aware LLM-Router
- ✅ 18 Lenses live (8 Format + 10 Interpretive)
- ✅ Lens Dropdown UI + Context-Aware Filter
- ✅ Season Pack via Summarize-then-Synthesize ($0.75/pack)
- ✅ Per-Language Typography
- ✅ 50 ES Seed Packs done

---

## Phase 3 — Quality + Launch-Prep (Woche 3: Di-Mo, 5 Build-Tage)

**Ziel:** Production-Quality. Demos polished. Seed-Content komplett. Influencer-Outreach raus. Lighthouse 90+. FINAL_QA grün.

### Di 2.6. (Build Day 1) — Demo-Videos

**Deep Block 1 (10-13):** 30s TikTok Vertical + 90s Twitter Horizontal aufnehmen
- Setup: Loom oder Descript für Capture + Edit
- Hook: "Stop losing what you watch"
- Hero-Demo: Season Pack 40-Episode Synthesis

**Deep Block 2 (14-17):** 4min YouTube/PH Long-Form Demo
- Full Tour mit Founder-Story
- Lenses-Demo (Marxist Lens auf Joe Rogan = viral money shot)
- Founder Deal pitch

**Shallow (17-19):** Demo-Videos export + caption-tracks in 4 Sprachen

### Mi 3.6. (Build Day 2) — Seed-Packs EN + DE

**Deep Block 1 (10-13):** 50 EN Public Packs
- Lex Fridman (10), Huberman Lab (10), Veritasium (10), 3Blue1Brown (10), MKBHD/Naval (10)
- Generated via VozClara selbst, hand-curated for quality

**Deep Block 2 (14-17):** 50 DE Public Packs
- Tilo Jung (10), maiLab (10), Mr Wissen2Go (10), Doktor Whatson (10), Kurzgesagt-DE (10)

**Shallow (17-19):** Lighthouse Baseline-Audit + erste Findings dokumentieren

### Do 4.6. (Build Day 3) — Seed-Packs PT + Lighthouse-Fix

**Deep Block 1 (10-13):** 50 PT Public Packs
- Joana Marques (10), Nerdologia (10), Manual do Mundo (10), Schwarza (10), Portuguese with Leo (10)

**Deep Block 2 (14-17):** Lighthouse-Fixes
- Performance: LCP <2.5s, CLS <0.1, INP <200ms
- Image-Optimization, code-splitting wenn nötig
- Target: Mobile 90+ alle 4 Categories

**Shallow (17-19):** WCAG 2.1 AA Audit beginnen — Tab-Navigation, Focus-Rings

### Fr 5.6. (Build Day 4) — Mikro-Influencer Outreach + WCAG Continue

**Deep Block 1 (10-13):** 40 Mikro-Influencer Outreach (Task #31)
- Spreadsheet: 10 pro Sprache mit Channel-URL + Pitch-Status
- DMs via Twitter/Instagram + Email wenn findable
- Pitch: Founder-Deal-Code + Free-Pro-Year wenn 1× organisch erwähnt

**Deep Block 2 (14-17):** WCAG 2.1 AA komplett
- Alt-Text everywhere, Contrast 4.5:1, `aria-label` icon buttons
- Keyboard-Nav Test komplett

**Shallow (17-19):** status.vozclara.app via Instatus + Crisp.chat Support-Widget

### Sa 6.6. (MARKETING DAY) — FINAL_QA Re-Run + Polish

- FINAL_QA.md 185 Items durchklicken
- Bugs sammeln (in TaskList als #41-#XX)
- Cross-Browser-Test: Safari, Chrome, Firefox, Edge
- Mobile-Test: iPhone, Android, iPad

### So 7.6. — FULL DAY OFF

Recharge. Walk. Family.

### Mo 8.6. (Build Day 5) — Bug-Fix-Day

**Deep Block 1+2 (10-17):** P0 Bugs aus FINAL_QA + Lighthouse + WCAG fixen
- Priorisiert nach Severity
- Wenn P0 zu groß: defer P1 zu Phase 4

**Shallow (17-19):** Founder-Deal-Page Copy final, Pre-Launch Discord-Beta-Invite drafted

**Woche 3 Output:**
- ✅ 3 polierte Demo-Videos in 4 Sprachen
- ✅ 200 hand-curated Public Packs (50 × 4 Sprachen)
- ✅ 40 Mikro-Influencer angesprochen
- ✅ Lighthouse 90+ alle Kategorien
- ✅ WCAG 2.1 AA compliant
- ✅ Status-Page + Crisp Support live
- ✅ FINAL_QA grünt durchgelaufen
- ✅ 0 P0 Bugs

---

## Phase 4 — Soft-Launch + Bug-Fix (Woche 4: Di-Mo, 5 Build-Tage)

**Ziel:** Discord Beta. Real-User-Feedback. Performance unter Last. 0 P0 Bugs vor Real-Launch.

### Di 9.6. — Discord Beta Opens

**Deep Block 1 (10-13):** Beta-Invite an Discord + Founder-Wartelist
- 50-100 hand-selected Beta-User
- #beta-feedback Channel dedicated
- Sentry-Alerts auf Real-Time Slack/Email

**Deep Block 2 (14-17):** Monitoring-Setup für Beta-Phase
- Sentry-Triage-Rules: P0/P1/P2
- Cloudflare Analytics dashboards
- User-Signup-Stream

**Shallow (17-19):** Beta-Feedback erstes Triage + Reddit r/anki engagement

### Mi 10.6. - Fr 12.6. — Bug-Fix-Sprint (3 Build-Tage)

Same sustainable schedule. Daily:
- Deep Block 1: P0/P1 Bugs aus Beta-Feedback fixen
- Deep Block 2: Performance-Optimization + UX-Friction-Fixes
- Shallow: Direct-User-DMs für Pain-Point-Verständnis

Target: every reported P0 fixed within 24h. P1 within 72h. P2 batched.

### Sa 13.6. (MARKETING DAY) — Pre-Launch Final QA + Press-Kit

- Komplette FINAL_QA.md Re-Run
- Lighthouse alle Pages re-audit
- Cross-Browser final (Safari, Chrome, Firefox, Edge)
- Mobile final auf 3 Devices
- Press-Kit zusammenstellen: Logo-Varianten, Screenshots, Founder-Photo, Brand-Colors, Tone-of-Voice-Snippets

### So 14.6. — FULL DAY OFF

Pre-Launch-Rest. Walk. Family. Last-Minute-Decisions vermeiden.

### Mo 15.6. — Pre-Launch Final Day

**Deep Block 1 (10-13):** Last P0 Bugs + Polish-Last-Mile
- Final Lighthouse Targets validieren
- Paddle Live-Mode-Test (post-approval) + Stripe Founder Link verification

**Deep Block 2 (14-17):** Launch-Day Pre-Production
- HN/PH/Uneed-Posts draften (final copy)
- Twitter Thread aufsetzen
- Discord Launch-Post draften
- LinkedIn Founder-Post draften

**Shallow (17-19):** Beta-Closure-Email + Thank-You-Note an alle Beta-Tester

**Phase 4 Output:**
- ✅ ~50-100 Beta-User getestet
- ✅ 0 P0 Bugs
- ✅ Performance baseline locked
- ✅ Press-Kit ready
- ✅ Launch-Posts pre-drafted in 4 Sprachen

---

## Phase 5 — REAL LAUNCH (Woche 5)

### Di 16.6. — LAUNCH DAY

**Morning (German Time):**
- 06:00 Final Smoke-Test + Deploy-Check + Sentry-Dashboard offen
- 07:00 RUNBOOK.md griffbereit
- 08:00 Discord-Community erste Mention

**US Morning = Launch Window:**
- 09:00 PST (= 18:00 CET): **Show HN** posted
- 09:01 PST: **Product Hunt** Launch geht live (Hunter pre-triggered)
- 09:30 PST: **Uneed Skip-Line** Slot aktiv
- 10:00 PST: **Twitter/X Thread** posted
- 11:00 PST: **LinkedIn Founder-Post**

**Evening (CET):**
- 14:00-20:00: HN/PH-Comment-Beantwortung (drop to 4h focused work, rest is community)
- 22:00 hard stop, sleep

**Wichtig:** Pre-launch RUNBOOK.md hat Tweet-Templates für outage, Cloudflare-Rate-Limit-Bump-Path, Sentry-Triage-Order.

### Mi 17.6. - Mo 22.6. — Sustained Drip (Post-Launch Week 1)

**Drop to 4h deep work/day.** Rest is support + community.

- Mi: r/languagelearning Build-Story (1× Chance, well-crafted)
- Do: r/Anki Subreddit Pitch
- Fr: r/PKM + r/Notion + r/getstudying
- Sa: 40 Mikro-Influencer Day-3-Activations starten
- So: REST DAY (mandatory!)
- Mo: HN Show HN Follow-Up + Polyglot Discord-Drops

**Anti-pattern warning:** Founders die in Launch-Woche weiterbauen crashen by Day 30. Ship → Talk. Lovable/Cluely lesson.

---

## Phase 6 — Post-Launch v1.1 (Woche 6-8)

**Wave 1 — Quick Wins (Woche 1-2 post):**
- Chrome Extension MVP
- Cmd+K Palette
- Onboarding-Tour 3-Step
- JSON Pack-Format Export (Open-Source-Trust)
- URL-Schema /y/[videoId]
- Pack-Generation-Animation Final Polish
- FSRS-Migration (Task #25)
- Mind-Map Output via markmap.js
- 60s Voice-Share via ElevenLabs

**Wave 2 — Killer Features (Monat 1):**
- VozClara Brain MVP (Knowledge Graph)
- Cross-Lingual Pack-Generation
- Image-OCR aus Video (Whiteboards/Folien)
- Public Pack Library opt-in
- Streak-Counter
- Snipd Moment Cards
- Lens-Marketplace UI

**Wave 3 — Marketplace + Integrations (Monat 2):**
- Pack-Remix-Marketplace
- Anki Add-on
- iOS Share-Sheet
- Mock-Conversation Voice-Mode (Speak-Killer)
- VozClara Companion RAG-Chat (re-introduced)
- Custom Lens-Editor (Pro Plus)

**Wave 4 — Brand + Distribution (Monat 3):**
- Obsidian Community Plugin
- Notion-Integration
- Skill-Tree Visualization
- VozClara Year-End-Recap-Generator (saisonal Dec)
- Podcast „VozClara Conversations"
- Lens-Chaining UI (Pro Plus)

**Wave 5 — Enterprise + Investor-Ready (Monat 4-6):**
- Education-Tier (SSO, Admin-Dashboard)
- Team-Tier €29/user/mo
- AppSumo 1-Year-Pro Deal pitch
- Universitäts-Pilots (10 schools)
- Creator-Revenue-Share Programm
- Whitelabel für Education-Plattformen

---

## Phase 7 — Investor Story (Monat 6-12)

**Ziel: Seed Round $1-3M von Earnest Capital / Calm Company / TinySeed**

- 10.000 paying users = €90k MRR = €1.08M ARR
- Anki Add-on liefert 30% Signups bei $0 CAC
- 3 Corporate-Partnership LOIs (Anki, Obsidian, Refold)
- API als eigenes Produkt (Developer-Tier launched)
- Mobile App ready (PWA + Capacitor)

---

## Daily Operations Template (SUSTAINABLE — based on 2025-26 real founder data)

| Slot | Was | Block Type |
|---|---|---|
| 9:00-10:00 | Morning anchor: walk + previous-day review | shallow |
| 10:00-13:00 | **Deep Block 1** (3h) — hardest build work, Claude Code plan-mode | **DEEP** |
| 13:00-14:00 | Lunch + walk OFF SCREEN | break |
| 14:00-17:00 | **Deep Block 2** (3h) — second-hardest work, debugging, polish | **DEEP** |
| 17:00-19:00 | Shallow: outreach, content, support, **catering admin batch** | shallow |
| 19:00-20:00 | Reddit/Discord + build-in-public post | shallow |
| 20:00 | **HARD STOP** — no code after dinner | — |
| 22:30+ | Bed. 7h sleep minimum. | sleep |

**Why this is the only sustainable pattern (2025-26 data):**
- Tony Dinh ($1M MRR): 20-30h/WEEK, not 100h
- Marc Lou (€46k/mo): 4h/day deep, more = crash
- Boris Cherny (Claude Code creator): higher density per hour via parallel worktrees, NOT longer hours
- Sifted Survey 2025: 54% solo founders burnout, 75% anxiety, 83% high stress when ignoring this

**Weekly Rhythm:**
- 5 Build Days (Mi-So) à 8.5h productive
- 1 Marketing/Content Day (Sa) à 6-8h lighter work
- 1 FULL Day OFF (So) — non-negotiable

**Day 13 Deload:** Mid-sprint reset, full off-day, walk, no laptop. Falls Energy below baseline → cancel build, take extra rest.

---

## Sprint Summary

**Total Build-Time bis Real-Launch:** ~4 Wochen (5 Build + 1 Marketing + 1 Off per week)
**Total effective deep-work hours:** ~125-150h
**Total Features im Launch:** ~45 von 87 IDEAS.md-Items
**Investment:** 
- ~€500 Font-Lizenzen (optional, sonst free Plex)
- Anthropic API credit $50-200 (Pro Plus features) 
- Paddle/Stripe Account setup
- **Claude Max $199** (Sprint duration)
- Founder-Time + Catering-Revenue als Backup

**Anti-Crutch-Reminder:** Wenn Claude in Week 3-4 anfängt Decisions zu treffen die contradict earlier ones → CLAUDE.md re-reading + tighter scope. Karpathy Jan 2026: "AI starts making decisions that contradict earlier decisions" around heavy use → Mitigation in CLAUDE.md §1 Invariants.

**Last updated:** Di 19.5.2026, 21:30 — Final sustainable schedule after research sweep #6.
**Status:** LOCKED. Build mode aktiv ab Mi 20.5. 9:00.

**The one thing to internalize:** Eine ausgeruhte Foundering-Person die 30h/Woche shipped beats eine ausgebrannte Person die 80h/Woche shipped. Plane den Sprint so dass die Version von dir auf Day 30 — die Reddit beantwortet, Production-Bugs fixt, erste 10 Customers closed — tatsächlich existiert.
