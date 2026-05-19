# VozClara — Build Roadmap

> Fahrplan. Polish-First. Kein fixes Launch-Datum.
> Wir launchen wenn alles perfekt ist, nicht am 25.5.
>
> Dies ist der **operative Plan**. Strategie steht in VISION.md.
> Features-Backlog steht in IDEAS.md. Tactical Marketing in LAUNCH_PLAN.md.

---

## Phase 0 — Decisions LOCKED (Stand Di 19.5.2026)

| Decision | Lock |
|---|---|
| Pro Tier €9/mo + €99 Lifetime Founder (cap 100) | ✅ |
| Pro Plus €19/mo (Custom Lenses + Season Pack + Premium AI) | ✅ |
| Free Tier: 3 Videos/Woche, Summary + Transcript only | ✅ |
| Pro Gate: SRS+Anki, Lenses, alle Modes, Multi-Lang, Streaming | ✅ |
| Pro Plus Gate: Custom Lenses, Season Pack, Anthropic Sonnet 4.7, Voice-Modes | ✅ |
| Primary LLM (Free/Pro): Llama 3.3 70B via Workers AI | ✅ |
| Premium LLM (Pro Plus): Claude Sonnet 4.7 via Anthropic API | ✅ |
| Transcript Provider: Supadata (legally clean) | ✅ |
| Payments: TBD Polar.sh ODER Stripe + Tax | ⏳ Mi |
| Launch-Date: WHEN-READY, nicht fixed 25.5. | ✅ |
| Polish > Speed | ✅ |

---

## Phase 1 — Foundation Polish (Woche 1, ~5 Tage)

**Ziel:** Alles legal-clean, alles wow-ready, alles polished. Kein Feature kommt rein ohne Polish.

### Mi 20.5. — Foundation Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-10 | Wrangler-Secret-Check (SUPADATA_API_KEY, RESEND_API_KEY, STRIPE_*) | 30min |
| 10-11 | Anthropic API Account + Billing + Key in Workers Secret | 1h |
| 11-13 | **Compliance Bundle** (Task #33): AI-Disclosure-Banner + /privacy Update + Sentry browser drop | 3h |
| 14-17 | **MCP Server** Anfang: Tools definition + handler scaffolding | 3h |
| 17-19 | **MCP Server** Tools 1-3: generate_pack, list_packs, get_pack | 2h |

### Do 21.5. — MCP + Citations Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-12 | **MCP Server** Tools 4-5 + Auth + Smithery Publish | 3h |
| 12-13 | **Claude Skills Bundle** (Task #36) | 1h |
| 14-16 | **Inline Timestamp-Citations** (Task #22) Prompt-Engineering + Render-Layer | 4h |
| 16-19 | **Inline Timestamp-Citations** Continue + Test mit Lex Fridman Pack | 3h |

### Fr 22.5. — Account-less + Streaming Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-13 | **Account-less First Pack** (Task #23): anonymous endpoint + migration on signup | 4h |
| 14-17 | **Streaming Pack-Gen** + **Agent-Thinking-Sidebar** (Task #24 + #37) | 3h |
| 17-19 | **AI-Watermark on Exports** (.apkg + PDF + Markdown footers) | 2h |

### Sa 23.5. — Pricing + Polar Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-13 | **/pricing-Page** mit Vergleichs-Tabelle vs NotebookLM/Eightify | 4h |
| 14-18 | **Polar.sh Migration** ODER **Stripe Tax Setup** (Task #34) | 4h |
| 18-19 | **Pack-Share-URL + OG-Preview** (mit Watermark) | 1h |

### So 24.5. — Pack-Share + RUNBOOK Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-14 | **Pack-Share-URL** continued + OG dynamic generation per locale | 5h |
| 14-16 | **RUNBOOK.md** schreiben (Task #35) | 90min |
| 16-19 | **/pricing-Page** polish + Founder-Deal-Banner re-design | 3h |

**Woche 1 Output:**
- ✅ MCP Server live + published auf Smithery
- ✅ Claude Skills Bundle in Anthropic Marketplace
- ✅ Citations sentence-level mit YouTube-Deep-Links
- ✅ Account-less First Pack funktioniert
- ✅ Streaming + Agent-Thinking-Stream demoable
- ✅ AI-Watermark auf allen Exports
- ✅ Compliance-Bundle EU AI Act + DSGVO ready
- ✅ Polar.sh ODER Stripe Tax aktiv
- ✅ /pricing-Page production-ready
- ✅ RUNBOOK.md für Launch-Woche

---

## Phase 2 — Wow Features (Woche 2, ~7 Tage)

**Ziel:** Die echte Magic einbauen. Lenses + Season Pack + Brand sind die viralen Differenziatoren.

### Mo 26.5. - Mi 28.5. — Lenses Sprint (3 Tage)

| Tag | Block | Aufwand |
|---|---|---|
| Mo | **8 Format-Lenses** (Anki/Cornell/CEFR/Briefing/TikTok/SRS-Plan/Academic/Code) Prompt-Templates | 8h |
| Di Vormittag | **10 Interpretive Lenses** (Skeptic/ELI5/Devil/Buddhist/Stoic/Marxist/Steel-Man/Counter/First-Principles/Researcher) | 4h |
| Di Nachmittag | **Lens-UI**: Dropdown-Selector + Hover-Preview + Context-Aware-Filter | 4h |
| Mi | **Lens-Generation-Pipeline** integriert ins Pack-Workflow | 6h |
| Mi PM | Lens-Testing mit echten Sample-Videos | 2h |

### Do 29.5. - Fr 30.5. — Season Pack + Anthropic Sprint (2 Tage)

| Tag | Block | Aufwand |
|---|---|---|
| Do AM | **Anthropic API Integration** in Worker (parallel zu Workers AI) | 3h |
| Do PM | **Long-Context Season Pack** Endpoint (Task #27) + Playlist-URL-Detection | 5h |
| Fr AM | **Season Pack** Output-Synthesis (Themes / Contradictions / Concept-Evolution) | 4h |
| Fr PM | **Season Pack** UI + Pro-Plus-Gate + Quota-Limiting (5/Monat) | 4h |

### Sa 31.5. — Typography + Polish Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-12 | **Per-Language Typography** (Task #38) — Font-Lizenzen, CSS-Variables, :lang() switching | 3h |
| 13-17 | **Pack-Generation-Animation Polish** + Empty-States + Loading-States | 4h |
| 17-19 | **404 + 500 + Error-States** mit Brand-Voice | 2h |

**Woche 2 Output:**
- ✅ 18 Lenses live (8 Format + 10 Interpretive)
- ✅ Lens-Marketplace-Foundation gelegt (für Monat 1 post-launch)
- ✅ Season Pack live (Pro Plus Tier-Feature)
- ✅ Anthropic API parallel zu Workers AI
- ✅ Per-Language Typography (4 Sprach-Identitäten)
- ✅ Alle Empty-/Error-/Loading-States mit Brand-Voice

---

## Phase 3 — Quality + Launch-Prep (Woche 3, ~5 Tage)

**Ziel:** Production-Quality. Demos vorab. Seed-Content. Influencer-Outreach.

### Mo 2.6. — Demo-Videos + Seed-Content Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-13 | **3 Demo-Videos** (Task #29): 30s TikTok + 90s Twitter + 4min YouTube | 4h |
| 14-19 | **50 Public Packs** in EN seed (Lex/Huberman/Veritasium/3B1B) | 5h |

### Di 3.6. — Seed-Content Continue Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-13 | **50 Public Packs** in DE (Tilo Jung/maiLab/Mr Wissen2Go/Kurzgesagt-DE) | 4h |
| 14-19 | **50 Public Packs** in ES (Marc Vidal/Dot CSV/Veritasium-ES) | 5h |

### Mi 4.6. — Seed-Content Final + QA Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-13 | **50 Public Packs** in PT (Joana Marques/Nerdologia/Manual do Mundo) | 4h |
| 14-17 | **Lighthouse-Audit** alle Pages — Target Mobile 90+ Performance/A11y/SEO/BP | 3h |
| 17-19 | **WCAG 2.1 AA Audit** — Tab-Navigation, Focus-Rings, Alt-Text, Contrast | 2h |

### Do 5.6. — Mikro-Influencer + Status-Page Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-13 | **40 Mikro-Influencer Outreach** (Task #31): 10 pro Sprache mit Founder-Codes | 4h |
| 14-15 | **status.vozclara.app** via Instatus oder BetterStack | 1h |
| 15-17 | **Crisp.chat Support-Widget** auf landing + dashboard | 2h |
| 17-19 | **FINAL_QA.md Re-Run** alle 185 Items durchklicken | 2h |

### Fr 6.6. — Polish Day

| Slot | Block | Aufwand |
|---|---|---|
| 9-19 | **Bug-Fix-Day**: alles was im Lighthouse + WCAG + FINAL_QA aufgekommen ist | 10h |

**Woche 3 Output:**
- ✅ 3 polierte Demo-Videos ready
- ✅ 200 hand-curated Public Packs (50 × 4 Sprachen)
- ✅ 40 Mikro-Influencer angesprochen (für Day 3-7 Drip)
- ✅ Lighthouse 90+ alle Kategorien
- ✅ WCAG 2.1 AA compliant
- ✅ Status-Page + Support-Widget live
- ✅ FINAL_QA grünt durchgelaufen

---

## Phase 4 — Soft-Launch + Bug-Fix (Woche 4, ~5 Tage)

**Ziel:** Beta-Testing mit Friends & Family + Discord. Real launch wenn 0 P0-Bugs.

### Mo 9.6. — Discord Beta Opens

- Invite Discord-Community + Founder-Wartelist zum „Soft-Launch"
- Sammeln Feedback in #beta-feedback Channel
- Monitoring: Sentry-Alerts, Cloudflare-Analytics, User-Signups

### Di 10.6. - Do 12.6. — Bug-Fix-Sprint

- Tägliche Bugs aus Beta-Feedback fixen
- Performance-Optimierung wenn nötig
- UX-Friction-Points aus Feedback ironen out

### Fr 13.6. — Pre-Launch QA Final

- Komplette FINAL_QA Re-Run
- Lighthouse alle Pages
- Mobile-Test auf 3 Devices (iPhone, Android, iPad)
- Cross-Browser (Safari, Chrome, Firefox, Edge)

**Phase 4 Output:**
- ✅ ~50-100 Beta-User getestet
- ✅ Top Bugs gefixt
- ✅ Performance baseline gelock
- ✅ Production-Ready

---

## Phase 5 — REAL LAUNCH (Woche 5)

### Mo 16.6. — Launch Day

| Slot | Action |
|---|---|
| 06:00 | Final Smoke-Test + Deploy-Check + Sentry-Dashboard live |
| 09:00 PST = 18:00 CET | **Show HN** Post (Twitter-Founder bereits aktiv) |
| 09:01 PST | **Product Hunt** Launch (Hunter triggered, Maker-Comments ready) |
| 09:30 PST | **Uneed Skip-Line** Slot aktiv |
| 10:00 PST | **Twitter/X Thread** posted |
| 14:00 CET | Reddit Status-Check — keine Posts heute |
| Abends | LinkedIn Founder-Post |

### Di 17.6. - So 22.6. — Sustained Drip

- Tag 2: r/languagelearning Build-Story (1× Chance, gut burning)
- Tag 3: r/Anki Subreddit Pitch
- Tag 4: r/PKM + r/Notion + r/getstudying
- Tag 5: 40 Mikro-Influencer Day-1-Posts startet
- Tag 6: HN Show HN Follow-Up
- Tag 7: Polyglot Discord-Drops

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

## Daily-Operations-Template (während Sprint)

| Slot | Was | Why |
|---|---|---|
| 9-12 | Deep-Work Code-Block #1 | Frischer Brain, harte Probleme |
| 12-13 | Break + Walk | Body-Mind-Reset |
| 13-14 | Lunch | nicht skipen |
| 14-17 | Deep-Work Code-Block #2 | Bug-Fix oder Feature-Polish |
| 17-18 | Break + Reddit/Discord-Check | Community-Pulse |
| 18-19 | Light-Work: Marketing-Copy, Outreach-DMs, Demo-Aufnahmen | Variation |
| 19-20 | Dinner + Reset | Recharge |
| 20-22 | Optional: Reading / Inspiration / leichte Tasks | Don't push |
| 22+ | Hartstopp | Sleep ist Code-Quality |

---

**Total Build-Time bis Real-Launch:** ~25 Tage focused Solo-Founder-Work
**Total Features im Launch:** ~45 von 87 IDEAS.md-Items
**Investment:** ~€500 Font-Lizenzen + Anthropic-Credit $20-50 + Polar/Stripe Account + Claude Max $199 + Founder-Time

**Last updated:** Di 19.5.2026, 20:00
**Status:** LOCKED. Build mode aktiv ab Mi früh.
