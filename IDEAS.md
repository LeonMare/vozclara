# VozClara — Feature-Brainstorm & Product-Roadmap-Long

> Stand: Di 19.5.2026, 17:30 — Solo-Founder-Brainstorm-Session
> Dieses Dokument ist die langfristige Feature-Pipeline. VISION.md ist Strategie (Monate/Jahre), LAUNCH_PLAN.md ist Tactical (Tage/Wochen), IDEAS.md ist die Backlog-Bibliothek.

> **Wichtigster Punkt aus User-Feedback:** Konkurrenz kann mit Claude Code / Cursor / AI-Agents schnell aufholen. Wir müssen Features die SCHWER ZU KOPIEREN sind PROAKTIV bauen, nicht reagierend. Selbst ein 25-Mann-Team soll 6+ Monate brauchen um VozClara nachzubauen.

---

## 0. Die 5 Moat-Säulen — was wirklich unkopierbar ist

| Moat-Typ | Warum unkopierbar | Was wir bauen |
|---|---|---|
| 📊 Data Network Effect | Pack-Korpus + Embeddings brauchen Zeit + User | Knowledge Graph, Adaptive AI, Personal Retention Curves |
| 🔗 Integration-Stack | Anki+Obsidian+Notion+Chrome+iOS = Wartungslast | Multi-Tool-Pipeline mit Switching-Cost |
| 🎨 Brand Taste | Editorial Design + Consistency = nicht reproduzierbar | LEON MARÉ Identity in jeder UI-Decision |
| 🌍 Native Multilingual | Cross-Lingual Generation, nicht Translation | Sprach-spezifische Tunings + Cultural Context |
| 👥 Network Effects | User-erzeugte Packs + Reviews = Wachstum braucht Zeit | Pack-Remix-Marketplace + Community-Layer |

---

## 1. Die 5 KILLER-Features die ALLES verändern

Jeder einzelne baut einen unkopierbaren Moat über 6-12 Monate auf.

### 🕸 1. VozClara Brain — Personal Knowledge Graph (Moat: 10/10)

**Was:** Alle Packs werden Knoten in einem persönlichen Graph. Konzept-Linking automatisch via Embeddings. User sieht „dein Verständnis von Information Theory entwickelt sich", nicht „Pack 47".

**Why unkopierbar:**
- Eigene Embeddings (fine-tuned auf Lernkontext)
- Pack-Korpus 10k+ Packs nötig für sinnvolles Linking
- Graph-DB + UX-Design + AI alle nötig
- **Time-to-copy für 25-Mann-Team: 6-9 Monate**

**Implementation MVP:** Cloudflare Vectorize (haben wir) + D1 Graph-Tabelle + D3.js/visx Force-Directed-Graph-UI. **MVP in 2 Wochen.**

**Investor-Story:** „Wir sind nicht ein Tool. Wir sind dein second brain für YouTube."

### 💬 2. VozClara Companion — Conversational AI die ALLE Packs kennt (Moat: 9/10)

**Was:** Chat-Sidebar in jedem Pack, aber Companion hat Context über die GANZE Library. „Erkläre Entropie nochmal" → referenziert Pack #12 + deine Quiz-Antworten dazu + wo dein Wissen Lücken hat.

**Why unkopierbar:**
- RAG-Infrastructure über deine Library
- State-Management („was wusstest du vor 3 Wochen vs heute")
- UX-Subtlety
- **Time-to-copy: 4-6 Monate**

**Implementation MVP:** Vectorize-Query + Claude Sonnet + Streaming-Response. Pro-Gated. **MVP in 10 Tagen.**

### 🔀 3. Pack-Remix-Marketplace — Wikipedia meets Anki (Moat: 9/10)

**Was:** User A erstellt Pack. User B remixed für andere Sprache/Niveau. User C fügt Quiz hinzu. Original-Creator bekommt Credits oder Revenue-Share. Pack-Genealogie sichtbar wie git history.

**Why unkopierbar:**
- Network-Effect: 1k Originals → 5k Remixes → 25k Forks
- Creator-Incentive-System
- Moderation + Quality-Control
- **Time-to-copy: 9-12 Monate**

**Implementation:** Pack-Forking + Diff-Viewer + Credit-Attribution. **Phase 2 (Monat 2-3).**

### 🌐 4. Cross-Lingual Pack Generation (Moat: 8/10)

**Was:** Spanisches Video → Deutsche Flashcards mit kulturell angepassten Beispielen (nicht 1:1 übersetzt).

**Why unkopierbar:**
- 16 Sprach-Pairs müssen separat getuned werden (4×4)
- Kultureller Context (Spanische Sokratik vs Deutsche Direktheit)
- **Niemand macht das.** NotebookLM EN-only.
- **Time-to-copy: 6-9 Monate**

**Implementation:** Claude Sonnet + Cross-Lingual-System-Prompt + Pair-Tuning. **MVP in 2 Wochen.**

### 🔌 5. The Integration Stack (Moat: 9/10)

**Anki + Obsidian + Notion + Chrome + iOS + Raycast + Zapier**. 6+ Integrationen × ständige API-Anpassungen = riesige Wartungslast für Konkurrenz.

**Time-to-copy: 4-6 Monate** mit dediziertem Team.

**Sequence:** Anki (Monat 2) → Chrome-Ext (Monat 1) → Obsidian (Monat 3) → iOS Share-Sheet (Monat 2) → Notion (Monat 4) → Zapier (Monat 5) → Raycast (Monat 4).

---

## 2. Pre-Launch P0/P0b Features (revidiert)

Was JETZT noch reinkommt vor Mo 25.5. — Total ~24h Arbeit:

| Prio | Feature | Why | Aufwand |
|---|---|---|---|
| 🔥 P0a | Pack-Share-URL mit OG-Preview | Viral Loop Day 1 | 6h |
| 🔥 P0a | /pricing Page mit NotebookLM/Eightify-Vergleich | Conversion-Booster | 4h |
| 🔥 P0a | Onboarding-Tour 3-Step | Activation-Rate | 4h |
| 🆕 P0b | Chrome-Extension MVP | Integration-Moat von Tag 1 | 6-8h |
| 🆕 P0b | Pack-Generation aus URL-Schema (vozclara.app/y/[videoId]) | Deep-Linking | 1h |
| 🆕 P0b | Open-Source Pack-Format JSON-Export | Trust + Anti-Lock-In | 1h |
| 🆕 P0b | Pack-Generation-Animation polish | Wow-Effekt | 2h |

---

## 3. Full Feature-Backlog (kategorisiert nach Moat-Wert + Aufwand)

### A. AI-Features (schwer zu kopieren)

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| A1 | Multi-Agent Pack-Generation (Summarizer + Quiz + Citation-Verifier parallel) | 8 | 1 Woche | Pre-Launch wenn Zeit |
| A2 | Adaptive Difficulty Quiz | 8 | 2 Wochen | Monat 1 |
| A3 | Multi-Speaker Detection (Lex Fridman Pattern) | 7 | 1 Woche | Monat 1 |
| A4 | Image-OCR aus Video (Whiteboards, Folien) | 8 | 1 Woche | Monat 1 |
| A5 | Equation-Recognition (Mathe → LaTeX) | 7 | 1 Woche | Monat 2 |
| A6 | Conversational Pack-Creation (Chat statt URL) | 9 | 2 Wochen | Monat 2 |
| A7 | Auto-Categorize uploaded Library | 7 | 1 Woche | Monat 2 |
| A8 | AI-Generated Video-Summary (90s Reel social-shareable) | 6 | 2 Wochen | Monat 3 |
| A9 | Voice-Cloning für Pack-Audio | 5 | 2 Wochen | Monat 4 |
| A10 | Mock-Conversation-Mode (übe Sprache mit AI-Speaker) | 8 | 3 Wochen | Monat 3 |
| A11 | Sentiment-Aware Summaries | 6 | 1 Woche | Monat 4 |
| A12 | Comparative Pack-Analysis (3 Videos → Gemeinsamkeiten/Widersprüche) | 8 | 2 Wochen | Monat 3 |

### B. Engineering-Differenziatoren

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| B1 | Offline-First PWA (Service Worker) | 6 | 1 Woche | Monat 1 |
| B2 | WebGPU lokales Inferencing | 7 | 3 Wochen | Monat 6 |
| B3 | Real-Time Pack-Updates | 5 | 1 Woche | Monat 4 |
| B4 | Sub-second Vector + Full-Text Search | 7 | 1 Woche | Monat 1 |
| B5 | Pack-Version-Control (git-like history) | 6 | 2 Wochen | Monat 3 |
| B6 | Pack-Branching (Github-style Forks) | 7 | 2 Wochen | Monat 3 |
| B7 | Self-Hostable Worker | 8 | 4 Wochen | Monat 9 |
| B8 | API-as-Product | 8 | 3 Wochen | Monat 5 |
| B9 | URL-Schema /y/[videoId] | 4 | 1 Tag | Pre-Launch |

### C. Social/Community/Network-Effect

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| C1 | Pack-Sharing-URL mit OG-Preview | 5 | 1 Tag | Pre-Launch (P0) |
| C2 | Public Pack Library opt-in | 6 | 3 Tage | Woche 1 post |
| C3 | Pack-Comments mit Timestamp-Referenz | 6 | 1 Woche | Monat 1 |
| C4 | Pack-Remixing + Genealogy | 9 | 4 Wochen | Monat 2-3 |
| C5 | Pack-Collections (kuratierte Listen) | 5 | 1 Woche | Monat 1 |
| C6 | Following / Profile-Pages | 6 | 2 Wochen | Monat 2 |
| C7 | Study Groups (5 User, shared Pack-Set) | 7 | 3 Wochen | Monat 3 |
| C8 | Pack-Bounties Marketplace | 8 | 4 Wochen | Monat 5 |
| C9 | Tutor-Marketplace | 9 | 8 Wochen | Monat 8 |
| C10 | Leaderboards | 4 | 1 Woche | Monat 2 |

### D. Brand / Editorial (LEON MARÉ-DNA)

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| D1 | Pack-of-the-Day kuratiert | 5 | 1 Woche | Monat 1 |
| D2 | Editorial Reviews (Team-Meta-Reviews wie Michelin) | 6 | ongoing | Monat 2 |
| D3 | VozClara Originals (lizenzierter Creator-Content) | 8 | ongoing | Monat 6+ |
| D4 | Beautiful PDF-Export für Print-on-Demand | 5 | 1 Woche | Monat 3 |
| D5 | "Weekly Pack" Newsletter | 5 | 1 Woche setup | Monat 1 |
| D6 | Year-End-Recap (Spotify-Wrapped-Pattern) | 7 | 2 Wochen | Dezember |
| D7 | Podcast „VozClara Conversations" | 6 | ongoing | Monat 3+ |
| D8 | Beautiful Empty-States mit Editorial Voice | 4 | 2 Tage | Pre-Launch |
| D9 | Easter Eggs (Linear-Pattern) | 3 | ongoing | beliebig |

### E. Mode-Plugins (neue Use-Cases)

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| E1 | Podcast-Companion (Spotify/Apple) | 7 | 2 Wochen | Monat 4 |
| E2 | Audio-Book-Companion (Audible) | 6 | 2 Wochen | Monat 5 |
| E3 | Video-Course-Companion (Coursera/Udemy) | 8 | 3 Wochen | Monat 4 |
| E4 | Documentary-Mode (mit Fact-Check) | 7 | 2 Wochen | Monat 5 |
| E5 | TED-Talk-Library kuratiert | 5 | 1 Woche | Monat 3 |
| E6 | Academic-Mode (LaTeX-Math, Notation) | 7 | 2 Wochen | Monat 4 |
| E7 | Code-Tutorial-Mode (Code ausführbar) | 7 | 3 Wochen | Monat 6 |
| E8 | Recipe-Mode | 4 | 1 Woche | Monat 8 |
| E9 | Travel-Mode | 5 | 2 Wochen | Monat 8 |
| E10 | Investing-Mode | 5 | 2 Wochen | Monat 9 |
| E11 | Meeting/Conference-Notes (Granola-Territory) | 8 | 4 Wochen | Monat 12 |

### F. Integration-Stack

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| F1 | Anki Add-on | 9 | 2 Wochen | Monat 2 |
| F2 | Obsidian Community Plugin | 8 | 2 Wochen | Monat 3 |
| F3 | Chrome-Extension | 8 | 1 Woche | Pre-Launch P0b |
| F4 | iOS Share-Sheet | 7 | 1 Woche | Monat 2 |
| F5 | Notion-Integration | 7 | 2 Wochen | Monat 4 |
| F6 | Zapier-Connector | 6 | 1 Woche | Monat 5 |
| F7 | Raycast Plugin | 5 | 3 Tage | Monat 4 |
| F8 | Alfred Workflow | 4 | 2 Tage | Monat 6 |

### G. Privacy / Trust

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| G1 | Open-Source Pack-Format JSON-Export | 6 | 1 Tag | Pre-Launch P0b |
| G2 | "No Training on Your Data" Statement | 4 | Marketing | Pre-Launch |
| G3 | End-to-End-Encrypted Personal Packs | 7 | 4 Wochen | Monat 9 |
| G4 | Audit-Log für Education-Tier | 5 | 2 Wochen | Monat 6 |
| G5 | DSGVO-Native Marketing | 3 | Marketing | Pre-Launch |

### H. Business-Model-Innovationen

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| H1 | Creator-Revenue-Share (Top-Creator 20% Cut) | 8 | 4 Wochen + Verhandlung | Monat 6 |
| H2 | Pay-with-Time (Reviews → Pro-Credits) | 6 | 2 Wochen | Monat 4 |
| H3 | Pack-Bounties Marketplace (siehe C8) | 8 | 4 Wochen | Monat 5 |
| H4 | Affiliate-Network | 5 | 2 Wochen | Monat 3 |
| H5 | Whitelabel für Education-Plattformen | 8 | 6 Wochen | Monat 9 |
| H6 | Pro Plus €19/mo Tier | 6 | gated existing | Monat 4 |
| H7 | Team-Tier €29/user/mo | 7 | 4 Wochen | Monat 6 |
| H8 | Education-Tier €99-499/mo | 8 | 6 Wochen | Monat 7 |

### I. UX-Liebe

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| I1 | CMD+K Search über alle Packs (Linear-Pattern) | 5 | 3 Tage | Monat 1 |
| I2 | Streak-Counter im Dashboard | 6 | 1 Tag | Woche 1 post |
| I3 | Haptic Feedback Mobile | 3 | 1 Tag | Monat 2 |
| I4 | Pack-Generation-Animation polish | 4 | 2 Tage | Pre-Launch |
| I5 | Daily-Pack-Reminder Push | 5 | 1 Tag | Woche 2 post |
| I6 | Customizable Dashboard-Layout | 3 | 1 Woche | Monat 6 |
| I7 | Print-friendly Pack-Mode | 4 | 2 Tage | Monat 3 |
| I8 | Skill-Tree-Visualization | 7 | 2 Wochen | Monat 4 |
| I9 | "Recommended Next Pack" (Spotify-Pattern) | 6 | 1 Woche | Monat 3 |
| I10 | iOS Share-Sheet Widget | 7 | 1 Woche | Monat 2 |

### J. Enterprise / B2B / Education

| # | Feature | Moat | Aufwand | Wann |
|---|---|---|---|---|
| J1 | SSO/SAML für Universities | 7 | 3 Wochen | Monat 7 |
| J2 | Admin-Dashboard (Class-Manager) | 7 | 4 Wochen | Monat 7 |
| J3 | Bulk-Pack-Generation (Schul-Curriculum) | 6 | 2 Wochen | Monat 8 |
| J4 | Custom Branding für Schools | 5 | 1 Woche | Monat 8 |
| J5 | Compliance-Reports | 6 | 2 Wochen | Monat 8 |

---

## 4. Was wir BEWUSST NICHT bauen (Negative Space)

| Feature | Warum NICHT |
|---|---|
| Pack-as-NFT | Brand-Schaden, Crypto-Hype tot |
| TikTok-Style For-You-Feed | Wir sind Editorial, nicht Algorithm-Doomscroll |
| Voice-Cloning für jeden | Deepfake-Risk |
| AI-Influencer-Avatar | Cringe, Brand-Schaden |
| "AI Friend" Conversational Persona | Character-AI Territory |
| In-App-Werbung für Free-User | killt Brand |
| Voice-Activated Assistant Standalone | Alexa/Siri Battle |
| AR/VR Pack-Visualization | zu früh, Monat 24+ frühestens |
| Crypto-Token-Payment | unnötige Komplexität |
| NFT-Sammlerstücke | siehe oben |

---

## 5. Die 3 Big Moonshots für $100M-Story

### Moonshot 1: VozClara Brain als „API of Understanding"
User connects Brain mit Anki/Obsidian/Notion/Coursera. Brain wird zentrale Source-of-Truth für was du gelernt hast. Andere Tools können Brain via API abfragen. **Plattform-Play = 10× Multiple bei Bewertung.**

### Moonshot 2: VozClara wird „Granola für Schools"
100 Universitäten × 10.000 Studenten × €5/Student/Monat = €5M MRR allein Education-Tier. Enterprise-SaaS-Multiple (12-15× ARR) vs Consumer (5-8× ARR) = **Bewertung verdoppelt sich**.

### Moonshot 3: Creator-Revenue-Share macht VozClara unkopierbar
Veritasium/Lex/Huberman bekommen 20% Pro-Revenue wenn sie VozClara empfehlen. Konkurrenz kann's nicht nachmachen weil sie keine paid user base haben um Revenue-Share zu starten. **"We own the creator-relationship-layer."**

---

## 6. Priority-Order (welches Feature wann)

### Pre-Launch (diese Woche)
- Alle P0a + P0b (siehe oben)
- ~24h Arbeit

### Launch-Woche
- Marketing, nicht Features

### Monat 1
- 💬 Killer #2: Companion (RAG MVP)
- 🕸 Killer #1: Brain MVP (Graph-Visualisation)
- 🌐 Killer #4: Cross-Lingual MVP
- F1 Anki Add-on Start
- C2 Public Pack Library, I2 Streak, B4 Search, A4 Image-OCR

### Monat 2
- 🔀 Killer #3: Pack-Remix-Foundation
- F2 Obsidian Plugin
- F4 iOS Share-Sheet
- C3 Pack-Comments, C5 Collections
- A6 Conversational Creation

### Monat 3
- 🔀 Killer #3: Pack-Remix-Marketplace Full
- F5 Notion-Integration
- C7 Study-Groups
- A12 Comparative Analysis
- B5/B6 Version-Control + Branching

### Monat 4-6
- H6 Pro Plus €19 Tier
- A10 Mock-Conversations
- I8 Skill-Tree
- E1-E6 Mode-Plugins (selective)
- B8 API-as-Product
- H1 Creator-Revenue-Share Negotiation

### Monat 7-12
- H7/H8 Team + Education Tiers
- J1-J5 Enterprise-Features
- B7 Self-Hostable
- G3 E2E-Encryption
- B2 WebGPU lokales Inferencing
- Mobile Native App Sprint

---

## 7. Decision Heuristics für zukünftige Features

Wenn ein neues Feature evaluiert wird, frag:

1. **Welchen Moat füttert es?** (Data/Integration/Brand/i18n/Network)
2. **Wie lange braucht 25-Mann-Team um es zu kopieren?** (Zielwert: 4+ Monate)
3. **Ist es Plattform-Play oder Tool-Play?** (Plattform = 10× Multiple)
4. **Wird es Pro-Conversion erhöhen oder Retention?** (beides ist gut)
5. **Passt es zum LEON MARÉ Editorial Brand?** (Hard No bei TikTok-Style Doomscroll)

---

**Last updated:** Di 19.5.2026, 17:30
**Total Features im Backlog:** 87
**Killer-Features:** 5
**Moonshots:** 3
**Bewusst nicht gebaut:** 10

---

## 8. UPDATE Di 19.5. 18:00 — 2026 Viral-AI-App Research Findings

Research-Agent durch 2026's viral AI landscape geschickt (Granola, Perplexity,
Lovable, Cluely, Wispr Flow, Linear, Notion, Claude Artifacts, ElevenLabs,
HeyGen, NoteGPT, YouLearn, Mochi, Spotify Wrapped, Duolingo). 5 game-changing
Insights die das P0 verändern:

### 8.1 🔥 VozClara Lenses (Granola Recipes Pattern) — NEUER KILLER

Same Video, multiple Output-Lenses via Dropdown:
- Anki-Deck (.apkg direkt)
- Cornell-Notes (für Studenten)
- German B2 Worksheet (CEFR-spezifisch)
- 60s TikTok-Hook (Creator-Mode)
- Executive Briefing
- Spaced-Repetition-Plan mit Schedule
- Comparison-Pack (vs anderes Video)

**Moat:** 7/10 (Brand + Differenzierung)
**Effort:** 2-3 Tage (Prompt-Templates + UI-Selector)
**Why critical:** Eightify/NoteGPT/YouLearn haben das nicht. Höchster ROI-Feature.

### 8.2 ⚡ Inline Timestamp-Citations (Perplexity Pattern)

Jedes Statement im Pack hat klickbare Timestamp. Klick → öffnet YouTube bei 04:23.
Wir haben die Daten schon. Konkurrenz nicht.

**Moat:** 6/10 (Demo-Wow)
**Effort:** 8h
**Why P0:** 10× Leap über Eightify in Demo-Eindruck.

### 8.3 🚨 FSRS statt SuperMemo-2 — KRITISCHE STACK-KORREKTUR

Anki + RemNote sind 2025-26 von SM-2 zu FSRS migriert (ML-personalized scheduling).
Unsere Docs sagen SM-2 = bereits legacy. Ts-fsrs Open-Source-Library integrieren.

**Effort:** 4-8h
**Why P0:** Anti-Legacy-Signaling für die SRS-Hardcore-Community (r/anki, r/spacedrepetition).
**Action:** Korrektur in VISION.md + worker/src/rating.ts/srs.ts (wenn vorhanden) + Marketing-Copy.

### 8.4 🤔 CONTRARIAN: SKIP AI-Tutor-Chat für Launch

Companion (Killer-Feature #2) war für Monat 1 geplant. **Push auf Monat 2-3.**

Reason: „Everyone in 2026 thinks you need 'chat with the video' (YouLearn, NoteGPT,
Recall all have it). Chat-Retention ist TERRIBLE — most users open once. It dilutes
the hero. Lead with the artifact. Conversation can come in week 6."

**Strategy:** Differenzierung über *artifact quality* (Lenses + Citations + Cross-Lingual),
NICHT über *chat fluency*. Konkurrenten zu kopieren = uns angleichen statt transcenden.

### 8.5 🎁 Account-less First Pack (Lovable Growth-Hack)

User darf ERSTEN Pack ohne Signup. Wall erst bei Pack #2. **Lovable's Growth war zu 60%
darauf zurückzuführen.**

**Effort:** 8h
**Why P0:** Aktiviert Free→Paid-Funnel massiv. Direkter Conversion-Hebel.

### 8.6 Weitere Erkenntnisse (Tier-B / Tier-C)

**ELL-Voice-Share via ElevenLabs** (60s Audio-Recap für WhatsApp/iMessage):
- Audio Shares beat Text Shares 3:1 in LatAm + India + Indonesia
- Perfect für unsere ES/PT-Audience-Expansion
- **Effort:** 3 Tage. Tier B (Woche 1-2).

**Mascot-Pattern (Duolingo Owl):**
- „Voz" als Parrot-Mascot
- Trauert wenn Streak bricht (Loss-Aversion-Meme)
- Linear-Pattern für Brand-Personality
- Wrapped 2025 hatte 200M user day-one wegen multiplayer comparison feature

**NoteGPT Multi-Output (markmap.js Mind-Map):**
- Notes + Mind-Map + Slides + Podcast
- Wir haben Notes + Flashcards
- Mind-Map via markmap.js (free) = 2 Tage
- Tier B (Woche 1-2)

**Mochi Keyboard-First Flashcard-Editor:**
- `**bold**`, `{{cloze}}`, `[image]`, Tab → next field, ⌘↵ save
- Don't ship clunky form
- 2 Tage
- Tier B

**No Video-Length-Cap Free:**
- Eightify cappt bei 30min Free
- Wir machen 90min Free (chunked processing)
- r/anki + r/learnGerman Talking Point
- Config-Change, kein Code

**Speed als Marketing-Hook:**
- „60-min Huberman summary in 12 Sekunden" = shareable Stat
- Pack-Generation muss <15s sein für 60-min Video
- Streaming first paragraph in <2s
- Effort: Optimization-Sprint, 1-2 Tage

### 8.7 REVIDIERTE P0-LISTE — Final für 6-Tage-Sprint

**Tier S (30h core — MUST):**
1. Inline Timestamp-Citations (8h)
2. FSRS-Migration (4h)
3. Pack-Share-URL + OG-Preview (6h)
4. Account-less First Pack (4h)
5. Streaming-Generation visible (4h)
6. /pricing Page (4h)

**Tier A (36h — sollten, Cut-Optionen wenn Zeit knapp):**
7. **VozClara Lenses (16h)** — Borderline für Launch, Sa+So-Sprint möglich
8. Chrome-Extension MVP (8h)
9. Onboarding-Tour (4h)
10. Cmd+K Palette (8h)

**Tier B (post-Launch Woche 1-2):**
- Public Pack Library (8h)
- Streak-Counter (6h)
- JSON-Export (1h)
- URL-Schema (1h)
- Mind-Map Output markmap.js (12h)
- Mochi-Style Keyboard Flashcard-Editor (16h)
- Animation Polish (2h)
- 60s Voice-Share via ElevenLabs (24h)

**Tier C (Monat 1-2 — Killer-Features, UPDATE):**
- VozClara Brain (unchanged, Monat 1)
- Cross-Lingual Generation (unchanged, Monat 1)
- Pack-Remix-Marketplace (unchanged, Monat 2-3)
- F1 Anki Add-on (unchanged, Monat 2)
- 💬 **Companion (RAG)** — **MOVED to Monat 2-3** (was Monat 1)

### 8.8 Decision-Heuristic-Update

Zum bestehenden 5-Punkte-Heuristic-Set (siehe §7) wird hinzugefügt:

6. **Macht das Feature Konkurrenz redundant oder kopiert es sie?** Wenn kopieren → lieber lassen. Wenn redundant machen → bauen.
7. **Ist es Demo-Wow oder Daily-Use?** Demo-Wow gehört auf /pricing + Landing. Daily-Use gehört in App-Core.
8. **Welches Word-of-Mouth-Meme entsteht daraus?** (Lenses = „guck mal wie das gleiche Video 7 unterschiedliche Outputs wird"; Mascot = „Voz hat geweint")

---

## 9. UPDATE Di 19.5. 18:30 — 4. Research-Sweep „Mining 2026's Wow Patterns"

Research-Agent durch alle relevanten 2026er-Apps die wir NOCH NICHT abgedeckt hatten (Snipd, Talkpal, Speak, Heptabase, Tana, Mem.ai, Manus, Dia, Comet, Atlas, Polar.sh, Lovable's Remix, Finch, plus alle Engineering/Brand-Patterns). Der Agent hat 3 Dinge ALLES verändert:

### 9.1 🔥 Manus-Style „Agent Thinking" Stream — NEUER P0 (1 Tag, WOW 8/10)

Während Pack generiert: Live-Sidebar mit Agent-Gedanken:
- „Watching minute 04:30..."
- „Detecting key concept: information theory..."
- „Cross-referencing with your previous packs..."

Manus ging März 2025 viral wegen sichtbarem Denken — Theatrical Transparency = Trust. Granola-Pattern in lite. Niemand bei Eightify/NoteGPT/YouLearn macht das. Pure perception-Win.

**Implementation:** Server-Sent Events parallel zu Pack-Generation, Sidebar-Component zeigt zeitversetzt die „Thoughts". Cosmetic-Theater + echte Status-Updates gemischt.

### 9.2 🌐 Long-Context „Season Pack" — KILLER #6 (3 Tage, WOW 10/10)

DAS Killer-Feature, das niemand kopieren kann ohne Re-Architecting.

User dropt YouTube-Playlist (z.B. 40 Lex-Fridman-Episoden). Bekommt EINEN synthesisierten Pack über die ganze Season — Themes, Widersprüche, Concept-Evolution.

**Warum unkopierbar:** Wir laufen schon auf Claude Sonnet 4.7 mit 1M Context. Konkurrenz auf GPT-4o-mini 128k kann nicht ohne kompletten Re-Architect. Strukturell defensible für 6-12 Monate mindestens.

**Tweet-Worthy Demo:** „Drop a 40-episode podcast season. Get one pack. 4 minutes."

**Implementation:** Playlist-URL-Detection → batch fetch transcripts → single Claude call mit 800k-Token-Context → output: Multi-Episode-Pack mit Episode-Cross-References.

### 9.3 🎨 Per-Language Typographic Identity — UNIQUE BRAND-MOVE (3h, WOW 7/10)

Statt EINE Schrift in 4 Sprachen: **4 sorgfältig gepaarte Schriftpaare**:
- **ES:** Reforma (TypeTogether, Buenos Aires-designed) — warm, lateinisch
- **PT:** Adelle Sans (TypeTogether, Portuguese-designed) — humanistisch
- **DE:** Inter / FF Mark — engineered, präzise (haben wir schon!)
- **EN:** Tiempos Text / aktuelle Cormorant — editorial

Beim Sprachwechsel verändert sich gesamte App-Typografie subtil.

**Marketing-Line:** „VozClara speaks every language — in its own voice."

**Bear + iA Writer** haben Cult-Followings auf Typography allein gebaut. Niemand im AI-Learning-Space hat das gemacht.

**Implementation:** CSS-Variablen mit `:lang(es)`, `:lang(pt)`, `:lang(de)`, `:lang(en)` switchen Font-Family. 3h + ~€500 Font-Lizenzen.

**Fallback wenn Lizenz-Time knapp:** IBM Plex hat Language-Variants (Plex Sans + Plex Serif kombiniert per Locale), 100% free, ähnlicher Effekt.

### 9.4 🚨 BRUTAL CUT — Chrome-Extension + Cmd+K aus P0 raus

Agent's Pushback (richtig): „A Chrome extension shipped in week 2 with announcement is better than a rushed one at launch."

**Beide gehen in v1.1 Woche 1-2 post-Launch** mit dedizierter PR-Ankündigung. Erzeugt mehr Hebel als beigemischt in Launch-Lärm.

### 9.5 ⭐ DAS WICHTIGSTE — Polish > Quantity

Agent's ehrlichster Pushback: „You should probably add ZERO features and instead spend the 6 days on:
1. Polish existing P0s to Linear-level fit-and-finish
2. Pre-record 3 launch demo videos (30s TikTok + 90s Twitter + 4min YouTube)
3. Seed 50 hand-curated public packs per language (200 total)
4. Line up 10 micro-influencers per language (40 total) for days 3-7"

**Granola hat mit WENIGER gewonnen weil sie EXTREM poliert haben.**

Drei neue Pre-Launch-Tasks unten (siehe Task #26-#28).

### 9.6 Architecture-Bets festlegen

**Bet 1: Claude Sonnet 4.7 als Primary** (NICHT GPT-4o-mini wegen Cost-Optimization)
- 1M Context Window ist unser Moat für Season Pack
- OpenRouter/LiteLLM als Abstraction für Swap-Fähigkeit
- Prompts müssen für Long-Context designed sein
- Check: ist worker/src bereits Claude-primary? Wenn nicht → migrate vor Launch

**Bet 2: PWA-First + Capacitor für Native (KEIN React Native)**
- Capacitor wrapt PWA für iOS/Android-Store wenn Native-App nötig
- 90% Native UX bei 10% Aufwand
- React Native = 6-Monate-Tax den Solo-Founder nicht braucht
- Lovable/Cluely/Granola haben alle Web-First gemacht

**Anti-Bet:** KEIN Vision Pro, KEIN Friend/Limitless. <100k Devices = Distraktion.

### 9.7 Tier-B Additions (Post-Launch Woche 1-3)

Aus dem Sweep für Backlog persistiert:

| Pattern | Quelle | Effort | Wann |
|---|---|---|---|
| Snipd „Moment Cards" (auto-decomposed 30-90s Segmente Swipe-Carousel) | Snipd 1M+ User | 2-3 Tage | Woche 1-2 |
| TikTok-Mode Swipe-Deck (vertikal, autoplay Video hinter Card) | Brilliant/Duo/NoteGPT | 2-3 Tage | Woche 2-3 |
| WebGPU On-Device-Transcription (Privacy-Flagship für DE/EU) | transformers.js + MLC | 4-5 Tage | Monat 1 |
| Speak/Talkpal Roleplay-Mode (Voice-Practice mit Pack-Vocab) | Speak $1B Valuation | 3 Tage | **Monat 2 (DEDIZIERTER Launch!)** |
| Heptabase Pack-Canvas (Drag Cards Whiteboard, draw connections) | Heptabase $2M ARR | 5+ Tage | Monat 3 |
| Finch „Knowledge Garden" (Plant grows, wilkt bei Skip) | Finch #1 Wellness | 4 Tage | Monat 4 |
| Dia „Skill Recipes" (User-saved Lens+Citation+Format-Combos sharable URLs) | Dia Browser | 2 Tage | Monat 2 |
| Polar.sh vs Stripe Evaluation (Merchant-of-Record removes EU VAT pain) | Polar.sh seed funded | 1 Tag Eval | **Diese Woche** |
| PostHog Session-Replay (Day 1 activate) | PostHog | 30min | **Pre-Launch** |
| Cal.com „Founder Office Hours" Embed (free, signals founder-led) | Cal.com | 30min | Pre-Launch |
| Resend für transactional Email (haben wir bereits) | Resend | done | done |

### 9.8 FINALER P0-Lock für Pre-Launch

Nach 4 Research-Sweeps locke ich die Pre-Launch-Liste:

**Tier S (MUST, ~30h):**
1. Inline Timestamp-Citations (8h) — Perplexity-Pattern, 10× Leap
2. FSRS Marketing-Copy ✅ DONE
3. Pack-Share-URL + OG-Preview (6h)
4. Account-less First Pack (4h) — Lovable Growth-Hack
5. Streaming + Agent-Thinking-Sidebar (5h) — Manus-Pattern + Visible Tokens
6. /pricing Page mit Vergleichs-Tabelle (4h)
7. Per-Language Typography (3h) — Brand-Move

**Tier A (16h, sollten wenn Zeit):**
8. VozClara Lenses (16h) — Granola Recipes
9. Long-Context Season Pack (24h) — KILLER Demo

**Pre-Launch-WORK (nicht Features, sondern Launch-Vorbereitung — 16h):**
10. 3 Demo-Videos vorab aufnehmen (6h)
11. 50 hand-curated Public Packs pro Sprache (6h)
12. 10 Mikro-Influencer pro Sprache ansprechen (4h)

**Deferred zu v1.1 (Woche 1-2):**
- Chrome-Extension MVP
- Cmd+K Palette
- Onboarding-Tour
- JSON-Export
- URL-Schema /y/[videoId]
- Animation polish

### 9.9 Final Decision-Heuristic-Addition

9. **Wird das Feature beim Launch-Demo viral?** Wenn nein → v1.1.
10. **Können wir es ohne Re-Architecting auf 1M Context skalieren?** Wenn nein → architectural decision JETZT lösen, nicht später.
11. **Wenn ich 6 Tage Zeit hätte: Polish ein bestehendes Feature oder bauen ein neues?** Polish > New feature (Granola-Lesson).

---

## 10. UPDATE Di 19.5. 19:00 — 5. Research-Sweep „Compliance + MCP + Future-Proof"

Worker-Code-Check + Final Research-Agent durch Legal/Compliance + AI Agent-Distribution. Drei game-changing Findings die das Launch verändern.

### 10.1 💎 MCP-Server = das Distribution-Killer-Feature

**Pattern:** Granola launchte Feb 2026 ihren MCP-Server. Seitdem nativ aufrufbar aus Claude, ChatGPT, Cursor, Lovable, v0, Bolt.new, Replit, Manus, Figma Make.

Smithery („npm für MCP") hat 7.000+ Server. Offizielle Registry `registry.modelcontextprotocol.io` existiert.

**Adapt für VozClara:** MCP Server auf `vozclara.app/mcp` mit 5 Tools:
- `vozclara.generate_pack(url, language)`
- `vozclara.list_packs()`
- `vozclara.get_pack(id)`
- `vozclara.search_packs(query)`
- `vozclara.export_anki(pack_id)`

Auth via OAuth 2.1 (Smithery handles UI) oder Bearer-Token aus User-Dashboard.

**Publish-Targets:** Smithery, Glama, PulseMCP, official registry, LobeHub, MCPbundles.

**Effort:** 1.5-2 Tage realistisch. SINGLE höchster Distribution-Hebel.

**Why critical:** KEINER unserer Konkurrenten (Eightify, NoteGPT, YouLearn, Recall, Mindgrasp) hat MCP. Erst-Mover-Vorteil im YouTube-Knowledge-Space.

**Bonus: Claude Skills** — eine `vozclara` Skill (kleines Markdown-Bundle) bringt uns zusätzlich in Anthropic's Skill-Marketplace. 2h Aufwand.

### 10.2 ✅ Supadata bereits integriert — Legal Risk minimal

worker/src/index.ts zeigt: Supadata ist primary, `innertube-direct` Fallback.

Action: `wrangler secret list` verifizieren ob SUPADATA_API_KEY produktiv gesetzt. Optional Innertube-Fallback in production guards.

YouTube ToS-Risiko: Eightify et al wurden 2024-25 DMCA'd wegen direktem Scraping. Mit Supadata als Merchant-of-Record für Transcripts sind wir clean.

### 10.3 ⚖️ EU AI Act Article 50 — pre-Launch einbauen (Pflicht ab Aug 2026)

Drei konkrete Items:

**AI-Disclosure-Banner First-Run (1h):**
„VozClara nutzt AI zur Generierung von Summaries und Flashcards" — 1-mal beim ersten Pack-Generate.

**Watermark auf jedem Export (1h):**
- Anki .apkg: Footer-Line in jeder Card „Generated by VozClara — vozclara.app"
- PDF Exports: Bottom-Watermark
- Markdown Exports: Front-Matter-Block

**Dual-Use:** legally mandated PLUS Growth-Loop. Eightify hat Watermark removed nach Power-User-Pressure, Virality verloren, nie erholt. Hard-code es, mach das geteilte Anki-Deck zum Acquisition-Channel.

**/privacy Update (30min):** Subprocessors explizit nennen (Anthropic, Cloudflare, Supadata), „No Training on Your Data" Statement, DPAs als PDFs in Privacy-Folder.

### 10.4 💰 Polar.sh vs Stripe Tax — Entscheidung

Stripe ohne Tax = 27 EU-Länder VAT MOSS-Filings. Mit Solo-Founder absurd.

**Polar.sh:** 4% + €0.40, Merchant-of-Record (sie filen VAT), Developer-first API, Stripe-backed seed funded.

**Lemon Squeezy:** war MoR, Stripe acquired 2024, Quality slipped 2026 (Screen Studio Mass-Cancellation-Incident). VERMEIDEN.

**Decision-Tree:**
- Wenn Stripe-Integration nicht zu tief → switch zu Polar pre-launch (3-4h)
- Wenn zu tief → launch mit Stripe + Stripe Tax, migrate zu Polar Monat 2

### 10.5 🔒 Drop browser Sentry SDK — Cookie-Banner-Vermeidung

Sentry browser SDK setzt Cookies → DSGVO-Banner pflicht.

Cloudflare Web Analytics ist cookieless → kein Banner nötig.

**Action:** Drop Sentry browser SDK (1h), behalte Sentry Worker-side (server-only, kein Cookie). Spart komplette Cookie-Banner-Implementation.

### 10.6 📔 RUNBOOK.md — Incident Response (90 min)

Pre-write für Launch-Woche-Panik:
1. Wie Workers AI Rate-Limits bumpen
2. Supadata Escalation-Contact
3. Stripe Dispute-Response-Template
4. Tweet-Template für Outages: „We're getting hammered, fixes incoming"
5. Sentry Alert-Triage
6. Cloudflare Workers CPU-Time-Spike Handling

Granola + Cluely hatten das. Lovable nicht — ihre Week-1 war rough.

### 10.7 🚫 Honest Push-Back: NICHT delayen

Research-Agent's Verdict: SHIP 25 May.

Begründung:
1. Lovable shipped in 4 Tagen → Unicorn-Trajectory
2. Cluely launchte April 2025 mit Polish ABER Narrative war Moat, nicht Feature-Count
3. Cursor launchte iterativ → 18 Monate weekly improvements bevor Mainstream
4. Granola war Stealth jahrelang ABER Launch war lean

**Pattern:** Launch-Polish korreliert NICHT mit Success. Was korreliert: **Narrative-Klarheit** + **EINE undeniable Demo**.

Tighter Scope > Delay. Drop Lenses + Typography + Agent-Thinking-Stream, add MCP + Supadata-verify + Watermark + Polar-Decision. Net-Effort ~zero, Defensibility deutlich höher.

### 10.8 FINALER P0-LOCK nach 5 Research-Sweeps

**Total ~90h verteilt auf 6 Tage = 15h/Tag fokussiert.**

NEW P0 (ergänzt zu existing Liste):
- MCP Server (1.5-2 Tage) — DISTRIBUTION-MOAT
- Supadata-Key verifizieren (5 min)
- AI-Watermark Exports (2h)
- AI-Disclosure-Banner (1h)
- Drop browser Sentry (1h)
- /privacy DSGVO-Update (30min)
- Claude Skills Bundle (2h)
- Polar.sh ODER Stripe Tax (3-4h)
- RUNBOOK.md (90min)

DROPPED aus P0:
- Per-Language Typography (3h) — cosmetic
- Manus Agent-Thinking-Stream — cosmetic
- VozClara Lenses (16h) — borderline, Sa/So-Entscheidung

### 10.9 Decision-Heuristic-Final-Update

12. **Existiert in Konkurrenz-Stack?** Wenn ja → kein Moat. Wenn nein → priorisieren.
13. **Compliance-Risk wenn nicht gebaut?** AI Act + DSGVO → hard requirements ab Aug 2026, jetzt einbauen ist günstiger.
14. **Dual-Use-Feature?** (Watermark = legal + growth-loop, MCP = distribution + future-proof)
15. **Wenn der CEO eines 25-Mann-Teams das fragt: würde sein CTO ja sagen?** Wenn nein → nicht bauen pre-Launch.

---

## 11. UPDATE Di 19.5. 22:00 — 6. Research-Sweep: User-Retention + First-60-Seconds + Stickiness

Final Research-Sweep durch erfolgreichen 2026er Apps für User-Retention-Patterns die wir noch nicht systematisch abgedeckt hatten.

### 11.1 💎 Signature Micro-Interaction: Citation Hover-Replay

DAS Brand-defining Pattern das niemand sonst macht.

Hover/Tap auf Timestamp-Citation `[12:34]` → **6-Sekunden Inline-Video-Clip** spielt an exakter Stelle, muted, captioned, in navy-gerahmter rounded Card schwebend über Text. Release → Card bleibt 2s, dismisses.

**Why unique:** Eightify zeigt static text. NoteGPT links extern raus. NIEMAND macht inline-Replay.

**Why viral:** Frozen-State (navy + gold + creme) = perfect Social-Asset für Screenshots.

**Effort:** 1.5 Tage (YouTube iframe mit start=/end= + hidden controls + caption track aus existing transcript).

**Integration:** Add to Task #22 (Inline Timestamp-Citations) — elevates Citations from feature to SIGNATURE.

### 11.2 First-60-Seconds Choreographie (frame-by-frame)

T=0s: Navy headline + paste input. NO nav, NO pricing above-fold.
T=2s: Paste & Enter, NO signup gate, generation startet sofort auf `/p/draft-{uuid}`.
T=3s: Video-Thumbnail + Title slim navy strip. "Pulling transcript..." → "Found 14:32 of ES audio."
T=5-8s: Thinking-Stream monospace creme on navy. Sentence-per-second pace.
T=8-25s: Streaming Reveal — Lenses 3-spalten Grid. **Citations rendern VOR text completes (Perplexity anchoring, no reflow).**
T=25s: Erste Lens fertig — subtle Gold-Pulse 200ms ease-out. NO sound default, NO confetti.
T=30s: "Made in 27 seconds from a 14-minute video" (Linear-style specific number).
T=35s: Email-Gate slides UP (NICHT modal): "Where should we send your pack?"
T=45s: URL-bar Focus, placeholder: "Try another video — second pack is on us"
T=60s: Streak silently primed (kein celebration, editorial restraint).

**Pattern-Sources:** Lovable (pre-auth build), Granola (invisible during action), Linear (success state polish), Perplexity (anchored citations), Manus (thinking stream).

### 11.3 7-Day Retention Playbook (exact cadence)

| Tag | Email | In-App |
|---|---|---|
| 0 | "Your first pack is saved" (immediate, 1 link, NO CTA-stack) | Completion chime wenn enabled |
| 1 | NONE (Duolingo over-mails) | Banner wenn return: "Yesterday's pack is still here. 17 flashcards waiting" |
| 2 | Wenn dormant: "What did [Video Author] get wrong?" | — |
| 3 | Wenn dormant: "A 2-pack streak ended yesterday" (loss-aversion stated, nicht pleaded) | Streak-Counter erscheint zum ersten Mal — Gold chip |
| 5 | Wenn dormant: "Pack #2 is the hardest" + curated Public Pack | Trending Pack in language surfaced |
| 7 | Engaged: "What's in Pro" (3 features max, NO urgency). Dormant: "Should we close your VozClara?" | Soft upgrade-wall wenn quota approach |

**Tone:** editorial friend, NICHT coach. Brand-voice: declarative, observant, NEVER excited.

### 11.4 Free → Pro Conversion Stack (5 triggers in order)

1. **Pack #2** — Lock-Card unter Pro-Lens "Counter-Arguments is a Pro lens. Try it once free."
2. **Pack #3-5** — Navy chip "3 of 5 packs this month" (NO red, NO urgency)
3. **15-min Cap hit** — "This video is 23 min. Free packs cap at 15. Pro removes the cap — €9/mo"
4. **Cmd+K 5× used** — "You've used the palette 5 times. Pro unlocks API access" (identity-flatter, NICHT pressure)
5. **Tag 14, Pro-Trial** — "Pay once, keep forever. €99 Lifetime — 47 spots left" (Pieter Levels honesty pattern)

### 11.5 Top-20 Stickiness Patterns (ranked impact-to-effort)

| Pattern | Source | Effort | Impact |
|---|---|---|---|
| Account-less first pack | Lovable, Granola | 4h | High |
| Streaming pack + anchored citations | Perplexity, Claude | 8h | High |
| Public Pack Link (no-login view) | Granola Note-Link | 6h | High |
| Empty-state-as-onboarding | Linear, Notion | 2h | High |
| Streak counter (light touch) | Duolingo (loss-aversion) | 4h | High |
| Behavioral upgrade trigger after pack #3 | Cursor (soft wall) | 4h | High |
| Cmd+K command palette | Linear, Raycast, Notion | 12h | High |
| Watermark-as-growth | Eightify (lesson learned) | 3h | High |
| Thinking-stream during generation | Manus, Claude Artifacts | 8h | High |
| Win-back: "your last pack was X" | Duolingo | 4h | High |
| Share-as-WhatsApp-card OG | Spotify Wrapped, Granola | 6h | High |
| Sound design via near-silence | Granola (whisper) | 3h | Medium |
| Templates/Saved Recipes | Cursor commands | 6h | Medium |
| Founder presence (light, NO face) | Marc Lou | 1h | Medium |
| PWA add-to-home (delayed Pack #2) | iOS 16.4+ Safari | 4h | Medium |
| Web Push opt-in via earned moment | Reteno pattern | 3h | Medium |
| Live-activity static number (NOT feed) | Cursor "trusted by" | 2h | Medium |
| API access for Pro Plus | Granola dev mode | 8h | Medium |
| Brand-voice error messages | Linear, Marc Lou (joke+fix) | 4h | Medium |
| Per-language typography | RESTORED — Task #38 | 3h | Medium |

### 11.6 ❌ 5 Forbidden Patterns (NIEMALS einbauen)

1. **Roach Motel** — asymmetric cancel-flow. EU DSA verbietet's. Cancel MUSS one-click.
2. **Confetti Cult** — animated celebration auf jeder Action. Bricht LEON MARÉ.
3. **Notification Owl Death-Spiral** — Duolingo's passive-aggressive Pattern funktioniert für deren Meme-Brand, NICHT für Editorial. Max 5 Emails/7 Tage, alle declarative.
4. **Phantom Social Proof** — fake numbers ("12.000 users upgraded this hour" wenn 12). Use real or none.
5. **Pre-Wow Paywall** — CC vor First Pack. ChartMogul 2026: konvertiert höher per-signup, ABER kills Top-of-Funnel 6-8×.

### 11.7 Retention-Targets (Success-Definition)

| Metric | App-Median | Prosumer-AI Top-Quartile | VozClara Phase-1-Ziel |
|---|---|---|---|
| D1 Retention | 26% | 40% | **35%** |
| D7 Retention | 13% | 22% | **18%** |
| D30 Retention | 7% | 12% | **10%** |

**D30 ≥ 15% = PMF Signal. D7 < 12% = wow-moment sticks nicht — debug Phase 4 Soft-Launch.**

### 11.8 Agent's Honest Pushback gegen unsere Annahmen

1. "More notifications = better retention" → WRONG für LEON MARÉ. Editorial brands earn retention by being missed, NOT by demanding attention. Spotify low-friction trust beats Duolingo high-friction urgency.

2. "Social proof live-activity feed" (Lovable pattern) → NOT für VozClara. Lovable's live builds funktionieren weil visually exciting. Scrolling Pack-Titles ist Noise. ONE static honest number (nightly refresh) statt Websocket-Layer.

### 11.9 Pattern-Sources (für Build-Sessions referenzieren)

- **Granola** — invisible interface, note-link viral, near-silence sound, signature note-while-talking
- **Lovable** — pre-auth build, visual edit, gate-after-wow
- **Linear** — empty-state-illustration + CTA, brand-voice errors, specific-number-precision ("Made in 27 seconds")
- **Cursor** — soft quota wall, identity-flatter upgrade prompts, real Fortune-500 logos
- **Perplexity** — anchored citations rendering before text completes
- **Manus** — narrate-the-work thinking stream
- **Notion** — drag-block onboarding, /AI slash command
- **Duolingo** — streak loss-aversion (light touch only — Owl behavior NOT for us)
- **Raycast** — Cmd+K palette, power-user-identity
- **Pieter Levels (Nomads)** — honest specific numbers (47 spots left, NOT "limited time")
- **Marc Lou** — joke+fix error pattern, 1-message-reply guarantee footer




