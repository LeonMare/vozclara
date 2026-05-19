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
