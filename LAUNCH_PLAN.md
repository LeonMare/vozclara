# VozClara — Launch-Plan & Strategie

> Lebt-Dokument. Erfasst die strategischen Entscheidungen, den Sprint-Plan
> und alle offenen Fragen vor dem Reddit/HN-Launch.
>
> Stand: Sa 17.5.2026 nach der Pre-Launch-Beratung mit Claude.
> Letzter Commit dieses Dokuments: siehe `git log LAUNCH_PLAN.md`.

---

## 1 · Launch-Datum

**Ziel: Mo 26.5.2026 oder Di 27.5.2026** (je nach Tempo).
Heute Sa 17.5.2026 → 9–10 Tage konzentrierter Sprint.

Verschoben von ursprünglich Di 20.5.2026, weil wir den Funktionsumfang
deutlich erweitert haben (Auth, Pack-Rating, Blog, Folders, Public URLs).

---

## 2 · Positionierung — die große Wende

VozClara ist **nicht** „YouTube Summarizer für Sprachlerner". Das ist zu eng.

VozClara ist die **Knowledge-Layer über allem was du schaust** — für drei
Personae, ein Produkt, drei Eingangstüren:

| Persona | Pain | Pull |
|---|---|---|
| **Sprachlerner** | YouTube ist Gold, aber nichts bleibt hängen | Vocab+SRS+Shadowing aus echtem Video |
| **Knowledge Worker / News-Junkies** | Talks, Podcasts, KI-News verschwinden | Persistente, durchsuchbare Library + Cross-Pack-Synthese |
| **Studenten** | Vorlesungen + Lehrvideos zu Studienmaterial machen | Kapitel-Summaries + Quiz + Citations |

**Launch-Pitch:** „The Michelin Guide for YouTube" — über das Pack-Rating-
System (siehe §6) positionieren wir uns als der erste *Qualitäts*-Index für
Bildungsvideos. Niemand hat das. YouTube hat Likes (Vanity). Wir haben
Qualitäts-Signale.

---

## 3 · Was schon live ist (Stand 17.5.)

Committed bis `561385c` und auf `vozclara.app` + Worker deployed:

- **Hero neu** (4 Locales): „Stop losing what you watch." + Parallel-Übersetzungen
- **§ 01·c AudienceTiles** — 3 Audience-Karten direkt nach Hero
- **§ 08·b WhyNotChatGPT** — 4-Zeilen-Vergleichstabelle vor Pricing
- **Pack-Tiering nach Länge** — Worker derived Micro/Standard/Deep/Comprehensive
- **TL;DR-Box** in Pack-SummaryTab + Library-Card-Preview
- **CEFR-Difficulty-Badge** (A1–C2) auf Library + PackPage
- **PT komplett auf „tu"** statt „você"
- **DE komplett auf „du"** statt „Sie"
- **ES/EN/PT/DE Hero-Subs auf gleicher Länge** (14–16 Wörter)
- Cloudflare Web Analytics + Sentry (DE-Region) aktiv
- 31/31 Unit-Tests grün, tsc clean, CI grün
- PWA mit korrigierten VozClara-Splash-Screens

---

## 4 · Die 4 Modi (Refactor — Tag 1)

**Vorher:** `learn` / `business` / `creator`
**Nachher:** `learn` / `brief` / `study` / `creator`

| Key | Sichtbarer Name | Persona | Was sich ändert |
|---|---|---|---|
| `learn` | Lernen (Sprache) | Sprachlerner | unverändert |
| `brief` *(war `business`)* | Recherchieren / Briefing | News, Podcasts, Exec | gleicher Prompt, neuer Name |
| `study` ⭐ NEU | Studieren | Studenten | neuer Prompt: Kapitel-tief, Quiz, Citations |
| `creator` | Erstellen | Content-Creator | unverändert |

**Auto-Pick-Map erweitern:**
- `news`, `business`, `interview`, `coaching`, `general` → `brief`
- `education` → `study`
- `creator` → `creator`
- Sprache-Lerner-Default ist `learn` *nur* wenn User im Onboarding „Sprache lernen" gewählt

**Mode-Picker entfällt** im Generator — User pastet Link, Mode wird automatisch gewählt, Override-Toggle erscheint nach Generierung in PackPage.

---

## 5 · Pack-Rating-System („Michelin for YouTube") ⭐ BREAKOUT-FEATURE

Das **wird** der Reddit-Launch-Pitch.

**Mechanik:**
- Anonyme 👍/👎 (kein Account nötig — verhindert Reibung)
- 5-Sterne-Rating + Text-Review nur mit Account (verhindert Spam)
- 4 zusätzliche 1-Tap-Signale: 💡 mind-blowing / 🤔 verwirrend / 🚫 irreführend / ⏱️ zu lang
- Aggregiert pro **Video** (nicht pro Pack), da ein Video mehrere Packs haben kann

**Wo sichtbar:**
- Auf jedem Pack (oben rechts neben dem Mode-Badge)
- Library-Card: kleines Stern-Aggregat
- `/discover/top-rated` — Top-bewertete Packs/Videos der Woche/Monats/all-time
- Sortierung in `/discover` nach Rating + Recency

**Spätere B2B-Erweiterung (Woche 3+):**
- `/creator/@channelhandle` — YouTuber claimen ihren Kanal
- Sehen anonymisierte Rating-Trends + Feedback-Reasons
- Pro-Pfad: kostenpflichtige Analytics für Creator

**Aufwand vor Launch:** ~2 Tage (Basis + Discover-Page)

---

## 6 · Auth-System

**Stack:** Workers + KV + JWT-Cookies. Eigener Auth-Endpoint im bestehenden Worker. Keine externe Auth-as-a-Service.

**Login-Methoden (Launch):**
1. **Magic Link Email** (passwortlos — primär)
2. **Google OAuth** (für 80% der User der schnellste Weg)

**Post-Launch:**
- Apple OAuth (für späteren App Store)
- Passkeys (WebAuthn)

**Anonymous-First-Flow:**
1. User kann sofort Pack erzeugen (anonyme Brain-ID, IndexedDB lokal)
2. Nach dem 3. Pack: dezenter Upgrade-Prompt „Sync auf alle Geräte"
3. Bei Account-Anlage: anonyme Brain-ID wird zum Account migriert (alle Packs erhalten)

**Profile-Page `/me`:**
- Avatar (Gravatar fallback), Display-Name, Bio
- Lieblings-Sprachen, Streak, Public-Profile-Toggle
- Account-Settings: Email ändern, DSGVO-Daten-Export, Account löschen
- Security: Session-Liste, „Log out everywhere"

**Aufwand:** 2.5–3 Tage. Größter Single-Block im Sprint.

---

## 7 · Free vs Pro vs Founder Deal

### Free (Akquise)
- 5 Packs / Monat
- Videos bis 20 Min
- Standard-LLM (Workers AI Llama)
- **Vollständig:** SRS, Shadowing, Anki-Export, Progress, AI-Conversation
- 1 Lernsprache aktiv
- Basis-Vokabeln (10 / Pack)

### Pro (€9/Mo oder €72/Jahr)
- Unlimited Packs
- Videos bis 3h
- Premium-LLM (Claude Sonnet 4.5 / GPT-5)
- **Watch Mode** (Woche 2)
- **Cross-Pack-Synthese** (Woche 3)
- **Long-form Article Generator** (Woche 3)
- **Grammar Spotlight + Cultural Notes + Discussion Prompts**
- **Comprehension Quiz**
- **Channel-Subscriptions**
- Mehrere Lernsprachen parallel
- Priority Queue
- Highlights & Annotations
- Notion / Markdown / Obsidian Export
- PDF-Export
- Daily Curated History
- MP3/MP4-Uploads (eigene Audio/Video-Files)

### Founder Deal (Launch-Hook)
**€99 Lifetime, limitiert auf erste 100 User.**
- Alle Pro-Features für immer
- „Founding Member"-Badge im Profil
- Direkter Discord-Zugang zu mir
- Stimmrecht für nächste Features
- Frühzeitiger Zugang zu Beta-Features

Cashflow-Potenzial: 100 × €99 = €9.900 sofort. Reddit-Hook: „Erste 100 Founder bekommen Pro Lifetime für €99 — hilft mir das ohne VC zu bauen."

### Team Plan (Woche 4+)
**€15/Seat/Monat**
- Shared Library, Permissions, Org-Search, Comments
- Erst manuell aktiviert für 5 Pilot-Teams
- Outreach zu Sprachschulen, Unis, Studienkreisen

### Pro+ (später)
**€19/Mo — Bring-Your-Own-Model**
- Eigenen OpenAI/Anthropic-Key einkleben
- Custom Prompts
- API Access

### Student/Teacher Discount
**50% off mit .edu-Email-Verifikation**

### Affiliate Program
**30% Provision pro paid referral** (Sprachlehrer, YouTuber, Educators)

---

## 8 · Video-Quellen — was rein kommt, was nicht

**Launch-Day:**
- ✅ YouTube (öffentliche Videos)
- ✅ Eigene MP3/MP4-Uploads (Whisper-Pipeline) — Pro-Feature

**Woche 2 nach Launch:**
- ✅ Podcast-RSS-URLs (öffentliche Podcasts)

**Bewusst NICHT (siehe Strategie-Beratung):**
- ❌ TikTok — API-Lockdown, rechtlich grau, zu kurze Videos, keine Wissensdichte
- ❌ Instagram — Reels zu kurz, Scraping-Verbot
- ✋ Vimeo / Loom / Wistia — Nische, irrelevant für Launch

---

## 9 · Blog — Option A (VozClara-authored, statisch)

**Setup:** `/blog`-Route mit MDX, statisch generiert, kein DB.

**Launch-Posts (10, im Sprint geschrieben):**
1. „Introducing the Michelin Guide for YouTube" — der Launch-Pitch
2. „How to learn German B2 with YouTube in 30 days"
3. „Best AI YouTube channels in 2026 — rated by VozClara users"
4. „From 90-minute lecture to study notes in 60 seconds"
5. „Knowledge Pack of the Week: [topical pick]"
6. „Why your second brain should live outside ChatGPT"
7. „Building VozClara in public — Week 1"
8. „A founder's case for the lifetime deal"
9. „The 7-day VozClara workflow for researchers"
10. „Roadmap: what's coming in the next 30 days"

**Workflow:** Claude drafted, du machst Final-Edit + persönliche Stimme rein.

**User-Generated-Content (Option B) NICHT** vor Q3, weil leere Community = tot wirkt + Solo-Founder kann Moderation nicht stemmen.

---

## 10 · Sprint-Plan — Tag für Tag

**Heute Sa 17.5. — Pause + Strategie-Update**
- ✅ Hero-Repositionierung deployed
- ✅ Pack-Tiering + TL;DR + Difficulty deployed
- ⏳ Nach Pause: Mode-Rebrand + Auto-Pick (2h)

**So 18.5. — Auth Foundation**
- Auth-System Teil 1: Worker-Endpoints + KV-Schema + Magic-Link
- Email-Provider auswählen (Resend / Loops / MailerLite)

**Mo 19.5. — Auth Complete**
- Auth Teil 2: Google-OAuth + Login/Signup/Profile-Pages
- Anonyme-Daten-Migration zum Account

**Di 20.5. — Michelin Rating ⭐**
- Pack-Rating-System (👍/👎 + 5-Sterne + 4 1-Tap-Signale)
- `/discover/top-rated`
- Library-Card-Stern-Aggregate

**Mi 21.5. — Polish + Distribution**
- Folders + Bulk Actions in Library
- Public Pack URLs (Toggle pro Pack)
- Pack-Generation-Fortschritts-Stepper + ETA + Tips

**Do 22.5. — Pro-Pipeline**
- Email-to-Pack (`save@vozclara.app`)
- MP3/MP4-Uploads (Whisper)
- Founder Deal: `/founder` Landing + Stripe Payment Link

**Fr 23.5. — Activation Layer**
- Onboarding-Wizard (4 Audience-Schritte)
- 5 manuell *herausragend* polierte Sample-Packs
- Recent-Packs Live-Feed (Social Proof)
- Quality-Feedback-Loop (👍/👎 mit Grund)
- Citation-Mode + Copy-Quote-Button

**Sa 24.5. — Content + Tracking**
- Blog mit 10 Launch-Posts (Claude drafted, du editest)
- `/roadmap` + `/changelog` + `/help`
- PostHog Event-Tracking
- Email-Sequenz (4 Welcome-Mails)
- `support@vozclara.app` Email-Forward (Cloudflare Email Routing)

**So 25.5. — Polish**
- Mobile-First-Polish-Pass (iPhone 14 viewport, alles fixen)
- 404 + Error-Page
- Status-Page (`status.vozclara.app`)
- SEO: sitemap, robots, structured data, OG-Images
- Final QA in allen 4 Locales

**Mo 26.5. ODER Di 27.5. — LAUNCH**
- Reddit-Posts (r/languagelearning, r/learnGerman, r/Spanish, r/productivity, r/getstudying, r/de)
- HN-Submission („Show HN: VozClara — Michelin Guide for YouTube")
- X/Twitter-Thread
- Discord-Community öffnen
- Founder-Deal aktivieren

---

## 11 · Post-Launch-Roadmap (4 Wochen)

| Woche | Hauptthema | Reddit/HN-Re-Pitch-Story |
|---|---|---|
| Launch | Founder Deal + Michelin Rating + Sample Packs | „I built VozClara — first 100 founders get lifetime" |
| Woche 2 | **Watch Mode** + **Browser Extension** + **Highlights & Annotations** + Audio Mode | „Now with synced video translation + Chrome extension + Readwise-style highlights" |
| Woche 3 | **Cross-Pack-Synthese** + **Long-form Article Generator** + Mind-Map View + Notion Export | „Ask questions across ALL your saved videos — turn your library into a research assistant" |
| Woche 4 | **Team Workspaces** Beta + Comprehension Quiz + Cultural/Grammar Spotlight + YouTuber-Claim-Pages | „Turn any video into an interactive study session + Teams for orgs and schools" |

---

## 12 · Channel-Subscriptions (Pro-Feature, Woche 2)

Für News-Junkies / Kanal-Sammler:

- Settings-Seite: User pastet YouTube-Channel-URL
- Worker-Cron prüft täglich auf neue Videos
- Auto-Pack-Generierung in User-Library
- Personal Daily Digest Email
- `/discover/channels` mit kuratierten Channel-Listen pro Thema (AI/Tech, Politik DE, Business, Sprachen)
- „Folge diesem Kanal automatisch?" CTA in Pack-Footer

---

## 13 · Onboarding-Personalisierung

Beim Signup: „Wofür nutzt du VozClara?" → 4 Optionen, prägt:
- Default-Mode bei neuen Packs
- Welche 3 Sample-Packs auf dem Home-Dashboard
- Welche Tooltips erscheinen
- Welche Email-Onboarding-Sequenz

---

## 14 · Welcome-Email-Sequenz

- **Day 0:** „Willkommen, hier ist dein erstes Sample-Pack zum Probieren"
- **Day 1:** „Drei Wege, deinen ersten Pack zu nutzen"
- **Day 3:** „Du hast 0 / X Packs erstellt — brauchst du Hilfe?"
- **Day 7:** „Diese Features wirst du gut finden"

---

## 15 · KI-Strategie (ehrlich)

**VozClara hat keine eigene KI** — keiner baut eigene Modelle, nicht mal Notion oder Granola.

**Was VozClara stark macht:**
1. Prompt-Engineering pro Sprache + CEFR-Level
2. Pipeline-Komposition (Transcript → Chunking → Vocab → Translation → Embedding → Summary)
3. Caching (gleiches Video = null Re-Kosten)
4. **Hybrid-Modell-Strategie:**
   - **Free:** Workers AI Llama 3.3 70B (~€0.001/Pack, fast gratis)
   - **Pro:** Claude Sonnet 4.5 oder GPT-5
   - **Pro+:** User klebt eigenen API-Key rein (BYOM)

**Was wir dem Markt sagen:** Nicht „beste KI". Sondern „Beste Pipeline für Video-Wissen". Niemand kauft KI — alle kaufen Workflows.

---

## 16 · Der Moat — warum keiner es einfach nachbaut

Ehrlich: technisch *könnte* ein Entwickler die Basis in 2 Wochen mit Claude nachbauen. Das ist nicht der Schutz.

Der echte Moat ist **Compound Advantage:**

1. **Editorial Polish-Decke** — LEON MARÉ Design, Cormorant + Cinzel, redaktioneller Ton. Kostet Monate. Hält 95% der Klone ab.
2. **Daten-Compound** — Prompts, CEFR-Mapping, Channel-Directory, Curated Daily Picks, Frequenz-Listen werden wöchentlich besser.
3. **Multi-Sprachen-Pipeline** — 4 Locales konsistentes „Du" + DSGVO + DE-Hosting. Wochen pro Locale.
4. **Cross-Pack-Intelligence** — Vectorize + Embeddings + Synthese + UI ist 2–3 Wochen für Solo-Dev. Ohne User-Daten lohnt sich Aufwand nicht.
5. **Geschwindigkeit + Brand** — du bist Dienstag/Montag live. Bis jemand nachbaut hast du Reddit, Signups, Cases.
6. **Pack-Rating-Daten** — wird nach 6 Monaten zur unique Quality-Datenbank für YouTube-Bildungsinhalte. Niemand sonst hat das.

---

## 17 · Was wir explizit NICHT bauen (jetzt)

- **TikTok / Instagram-Integration** — API-Lockdown + zu kurze Videos + rechtlich grau
- **Autonome KI-Agenten** — falscher Abstraktionslevel, teuer + riskant. Tools statt Agenten.
- **User-Generated-Blog** — Solo-Founder kann Moderation nicht stemmen
- **Eigenes LLM-Modell** — irrational, Off-the-shelf reicht
- **Native iOS App** — TWA reicht erstmal, App Store kommt bei 200+ WAU
- **Stripe-Subscriptions** — nur Payment-Link für Founder Deal jetzt. Subscriptions erst bei 30+ Signups
- **Apple App Store + Google Play** — bei 200+ / 50+ WAU
- **Worker-Code-Split** — defer bis post-launch (2611-Zeilen-Monolith ist ok für jetzt)

---

## 18 · Quality-Sicherheitsnetz

**Vor jeder Pack-Anzeige:**
1. Quality Auto-Eval (Score 0–1): hat TL;DR? hat N Sections? hat Vocab mit Translations?
2. Wenn Score <0.7 → automatisch regenerieren
3. Bei zweitem Fail → Pack mit Warnung anzeigen + Feedback-Prompt

**User-Feedback-Loop:**
- 👍/👎 unten an jedem Pack
- Bei 👎: Grund-Picker („Übersetzung falsch / Vokabeln zu einfach / Summary unklar / KI hat halluziniert")
- Daten in KV, wöchentlicher Claude-Job analysiert + schlägt Prompt-Verbesserungen vor

**Quality-Regression-Alert:**
- Wenn >20% Packs in 24h Negative-Feedback bekommen → Email an Christian

---

## 19 · Reddit-Launch-Strategie

**Subreddits (in Reihenfolge der Reihenfolge):**
1. **r/languagelearning** (1.4M) — primärer Sub, Sprachlerner-Pitch
2. **r/learnGerman / r/Spanish** (je 200k+) — Sprache-spezifisch
3. **r/productivity** (3M) — Knowledge Worker Pitch
4. **r/getstudying** (700k) — Studenten-Pitch
5. **r/de** (1M) — DE-Markt
6. **HackerNews** — „Show HN: VozClara — Michelin Guide for YouTube"

**Title-Templates (je Subreddit angepasst):**
- r/languagelearning: „I built a tool that turns YouTube into structured language-learning material (with Anki export + SRS)"
- r/productivity: „I built a 'Michelin Guide' for YouTube — rate the quality of educational videos"
- HN: „Show HN: VozClara — knowledge layer over everything you watch"

**Wichtig:**
- Nicht alle gleichzeitig — Mo Reddit + Di HN + Mi X/Twitter
- Echte Antworten auf Comments (nicht Marketing-Sprech)
- Founder-Deal-Limit als „Soft Urgency" — *nicht* hyped, *nicht* aggressiv

---

## 20 · Offene Entscheidungen (zu klären beim PC-Start)

1. **Auth-Provider:** Magic-Link + Google → ja. Apple/Passkey später → ja (oder bei Launch?)
2. **Rating-Mechanik:** Anonyme 👍/👎 + Account-Pflicht für 5-Sterne → ja oder nein?
3. **Launch-Tag final:** Mo 26.5. oder Di 27.5.?
4. **Blog-Drafting:** Claude drafted, Christian editet → ja oder anders?
5. **Founder-Deal-Preis:** €99 für erste 100? Oder €79 (erste 50) + €99 (nächste 50) gestaffelt?
6. **Pro-Preis:** €9/Mo (Default) oder €8 oder €10?
7. **Welcome-Email-Provider:** Resend (€20/Mo, dev-friendly) / Loops (€49/Mo, polished) / MailerLite (€10/Mo, ältere UI)?
8. **Pack-Rating: nur public Packs oder alle?** Mein Vote: nur public, sonst Privacy-Issues.

---

## 21 · Tech-Stack (Referenz)

- **Frontend:** Vite + React 18 + TS + Tailwind + React Router 7
- **Worker:** Cloudflare Workers + KV + Vectorize + Workers AI
- **AI-Modelle:** Llama 3.3 70B (Free) / Claude Sonnet 4.5 oder GPT-5 (Pro)
- **Auth:** Workers + KV + JWT-Cookies + Magic-Link + Google-OAuth
- **Email:** Resend/Loops/MailerLite (zu entscheiden)
- **Analytics:** Cloudflare Web Analytics + PostHog
- **Errors:** Sentry (DE-Region)
- **Payments:** Stripe Payment Links (Founder Deal), Subscriptions später
- **PWA:** Service Worker + Manifest + Splash Screens
- **CI:** GitHub Actions
- **Hosting:** Cloudflare Pages + Workers + Vectorize
- **Domain:** vozclara.app (Cloudflare Registrar)

---

## 22 · Repo-Layout (Referenz)

```
/src                    # React frontend
  /components/landing  # Landing page sections
  /routes              # Pages (PackPage, LibraryPage, etc.)
  /lib                 # Domain libs (pack, srs, anki, shadowing, etc.)
  /hooks               # React hooks
/worker                # Cloudflare Worker (monolith, 2611 LOC)
  /src/index.ts        # All endpoints
  /src/webpush.ts      # Web Push protocol
  /src/sentry.ts       # Sentry envelope
/scripts               # Build scripts (splash gen, etc.)
/public                # Static assets, manifest
LAUNCH_PLAN.md         # This file
```

---

## 23 · Wenn du am PC weitermachst — Quick Start

```bash
git pull
npm install
npm run dev            # Frontend auf localhost:5173
cd worker && npm run dev  # Worker auf localhost:8787
```

Erster Schritt aus dem Sprint: **Mode-Rebrand + Auto-Pick** (2h).
Dann: **Auth Foundation** (So) → **Auth Complete** (Mo) → **Michelin Rating** (Di) → siehe §10.

---

## 24 · Vision (langfristig)

> VozClara ist das **persönliche zweite Gehirn für alles was du schaust**.
> Sprachlerner nutzen es um sich Material zu bauen. Knowledge Worker nutzen
> es um Talks und Podcasts zu verlieren. Studenten verwandeln Vorlesungen in
> Studienmaterial. Und jeder dieser Use-Cases füttert die gleiche
> Knowledge-Graph-Infrastruktur, die mit jedem Pack wertvoller wird.
>
> In 12 Monaten: VozClara ist DIE Marke für Video-Wissen. „Hast du den
> Pack davon?" wird so selbstverständlich wie „Hast du das Notion-Doc?"
>
> Wirtschaftlich: 10.000 Pro-User → €1M ARR. Plus B2B Team-Pläne. Plus
> White-Label für Sprachschulen.

Mache es gut. Bleib geduldig. Ship wöchentlich.

— Letzte Pre-Launch-Beratung, 17.5.2026

---

## 25 · Sprint-Status — Übergabe Mo 18.5. (PC → Laptop)

> Lebt unten ans Doc, damit die nächste Session sofort den Stand
> hat. **Wenn du am Laptop git pull machst, lies zuerst diesen
> Abschnitt — §10 und §20 sind veraltet.**

### Stand: Mo 18.5.2026 abends — **T-7/8 Tage zum Launch, 3 Tage vorm Plan**

Heute Mo (eigentlich nur Mo geplant für Auth Foundation) wurde
effektiv Mo+Di+Mi+Do+halb-Fr durchgezogen. 12 Commits, ~3000 Zeilen.

### ✅ Geshippt (live auf vozclara.app + Worker deployed)

| Block | Plan-Tag | Status | Commits |
|---|---|---|---|
| **A · Auth Foundation** | Mo | ✅ Backend + Frontend + Brand-Email | `0af8f7f`, `187796e`, `8b3c74a` |
| **A · Mode-Rebrand** | Mo Bonus | ✅ `business→brief`, neuer `study`, Auto-Pick | `6e61db5` |
| **A · BrainId-Sync** | Mo Bonus | ✅ attach-brain + Library-Status-Banner | `5983806` |
| **B · Michelin Rating** | Di+Mi | ✅ Backend + RatingPanel + Discover + Bulk + Polish | `66244fc`, `a120955`, `bbe8739` |
| **C · Founder Deal** | Do | ✅ Code komplett · Stripe-Klicks offen | `62032ff` |
| **D · Audience + Citations** | Fr | ✅ AudienceTiles klickbar + Citation Copy | `8368dc3` |
| **E · 404 + Mobile + Drafts** | Sa+So | ✅ Editorial 404 + Mobile-FilterPills + LAUNCH_POSTS.md | `68a0247` |
| **Sentry-Bugfixes** | inline | ✅ Mobile-Safari TypeError + Chunk-Reload-Recovery | `3330c5e` |

### 🟡 Offen — Reihenfolge nach Wichtigkeit

#### 1. Resend API-Key rotieren — ✅ DONE
Ein älterer Resend-Key wurde am Sonntag im Chat geteilt. Verified
Do 21.5. im Resend-Dashboard: der Key existiert dort nicht mehr
(bereits revoked oder nie aktiv gewesen). Aktuelle Keys im Account:
`vozclara-worker-2026-05-18` (production) + `leon-mare-production`.
Worker hat den aktuellen Key bereits als `RESEND_API_KEY` Secret.

```bash
# Falls jemals wieder Rotation nötig:
cd worker
npx wrangler secret put RESEND_API_KEY
# → neuen Key aus https://resend.com/api-keys einfügen
npx wrangler deploy
```

#### 2. Stripe-Setup — Founder Deal aktivieren (15 Min)
1. https://dashboard.stripe.com → **Products** → **+ Add product**
   - Name: `Voz Clara Founder · Lifetime Pro`
   - Price: **€99 EUR · One-time**
   - Save → **Create payment link** vom Product aus
2. Payment-Link-Settings:
   - Quantity: 1 (kein adjustable)
   - Collect customer email: ✅
   - Success URL: `https://vozclara.app/founder?welcome=1`
3. Copy Payment Link URL (`https://buy.stripe.com/<hash>`)
4. In `.env.production` einsetzen:
   ```
   VITE_FOUNDER_CHECKOUT_URL=https://buy.stripe.com/...
   ```
5. `git commit -am "Wire live Founder Deal Stripe Payment Link"`
6. `git push` → Cloudflare Pages baut automatisch → Button live

#### 3. Live-Test (30 Min)
Klick durch alles was heute neu ist:
- [ ] `/signin` Magic-Link Flow (Mail + Cookie)
- [ ] Header-Avatar Dropdown wenn signed-in
- [ ] Landing: AudienceTiles klickbar mit Aktiv-Badge
- [ ] Generator: Default-Mode = ausgewählte Audience
- [ ] PackPage: § Bewertung-Panel + Top-Rated-Pill (sobald rated)
- [ ] QuotesTab: Copy-Citation Button
- [ ] Library: Account-Sync-Banner + Sort-Filter + Rating-Badges
- [ ] `/discover`: 3 Tabs, Wilson-Score-Ranking
- [ ] `/founder`: Counter-Card (zeigt 0/100)
- [ ] `/pricing`: Founder-Banner zwischen Hero und Free/Pro
- [ ] `/foobar` → neue 404-Seite

#### 4. Sample-Packs Entscheidung — OPTIONAL
LAUNCH_PLAN §10 will 5 Sample-Packs. Aktuell 3 (sample, sample-learn,
sample-creator). Vorgeschlagen:
- `sample-study` (Study-Mode — neuer Mode hat noch keinen Sample!)
  → z.B. Veritasium 25-Min Wissenschaft oder Lex-Fridman-Snippet
- `sample-news` (Brief-Mode, anderer Tone als der Politik-Sample)
  → z.B. YC-Founder-Talk oder Tech-News

**Entscheidung am Laptop**: 2 YouTube-URLs geben → Claude baut die
Packs. ODER: skippen, der Sprint ist eh 3 Tage vorne.

#### 5. LAUNCH_POSTS.md personalisieren — OPTIONAL
`LAUNCH_POSTS.md` enthält 4 Drafts (HN, r/languagelearning,
r/productivity, X-Thread). Editorial-Voice, brauchen aber deinen
persönlichen Pass bevor sie raus gehen.

### 🔵 Was NICHT angegangen wurde (bewusst geschnitten)

Aus `§10` ursprünglich für Fr/Sa/So vorgesehen, fliegen ins
Post-Launch-Roadmap (`§11`):
- Google OAuth (Magic-Link reicht für Launch — Woche 2)
- Email-to-Pack (Pro-Feature, Woche 3)
- MP3/MP4-Uploads (Pro-Feature, Woche 2)
- Folders + Public Pack URLs (Tags reichen — Woche 3)
- Email-Sequenz 4-Stufen (1 Welcome-Mail im LAUNCH_POSTS spezifiziert)
- 10 Blog-Posts (4 Posts in LAUNCH_POSTS.md statt 10)
- Status-Page (Sentry deckt das ab)
- PostHog (Cloudflare Analytics + Sentry reichen)
- Onboarding-4-Schritt-Wizard (1-Click AudienceTiles statt)

### 📋 Datei-Spickzettel — was wo lebt

**Frontend (src/)**
- `lib/auth.ts` · `hooks/useAuth.tsx` · `routes/SignInPage.tsx` — Auth
- `lib/audience.ts` — Audience-Onboarding-Persistenz
- `lib/rating.ts` · `components/RatingPanel.tsx` · `routes/DiscoverPage.tsx` — Michelin Rating
- `lib/founder.ts` · `routes/FounderPage.tsx` — Founder Deal
- `routes/NotFoundPage.tsx` — 404
- `components/landing/sections.tsx` — AudienceTiles + Pricing-FounderBanner

**Worker (worker/src/)**
- `auth.ts` — Magic-Link KV-State + 4 endpoints + attach-brain
- `email.ts` — Resend-API-Wrapper + brand-konforme Magic-Link Email
- `rating.ts` — Rating-Endpoints + Wilson-Score
- `founder.ts` — Founder-Counter + admin-endpoints

**Build / Config**
- `wrangler.toml` — AUTH KV binding (id `32113624ca574c16867b434f453b3237`)
- `.env.production` — `VITE_FOUNDER_CHECKOUT_URL=PLACEHOLDER` ← muss ersetzt werden
- `scripts/generate-brand-pngs.mjs` — Lighthouse-PNG-Generator (für Brand-Email)
- `public/brand-mark-256.png` + `brand-mark-512.png` — Email-Logo

**Docs**
- `LAUNCH_PLAN.md` — dieses Doc (Strategy + Sprint-Status, §25 = aktuell)
- `LAUNCH_POSTS.md` — 4 Post-Drafts für die Launch-Woche

### 🎯 Empfohlene erste 30 Min am Laptop

1. `git pull` + `npm install` (falls Dep-Drift seit letztem Build)
2. LAUNCH_PLAN.md §25 lesen (dieses Kapitel)
3. **Resend-Key rotieren** (5 Min)
4. **Stripe-Setup** (15 Min) → Founder-Deal-Button live
5. Auf vozclara.app einmal selber den Auth + Rating + Founder-Flow durchklicken

Danach: Sample-Pack-Entscheidung, dann je nach Energie weitere
Launch-Vorbereitung oder eine letzte Polish-Iteration.

— Übergabe Mo 18.5.2026 abends. Sprint 3 Tage voraus. Gute Pause.

---

## 26 · Sprint-Status — Update Di 19.5. (Laptop-Session, alles fertig)

> §25 ist die Übergabe vom PC am Sonntag. Heute Di 19.5. am Laptop
> wurde der Rest auf einen Aufwasch durchgezogen. **Launch-fertig.**

### Stand: Di 19.5.2026 abends — **T-7 Tage zum Launch, alle Blocker zu**

Vom §25-Backlog wurde alles abgehakt + drei neue Sachen draufgepackt.

### ✅ Heute geshippt (Commits siehe `git log`)

| Block | Status | Highlights |
|---|---|---|
| **Resend-Key-Rotation** | ✅ | Neuer Key in Worker-Secrets, Smoke-Test grün, alter Key revoked |
| **Stripe Founder Deal live** | ✅ | Product „VozClara Founder · Lifetime Pro" + Payment-Link mit 100-Käufer-Cap. `VITE_FOUNDER_CHECKOUT_URL` verdrahtet, Commit `e0a1c89` |
| **/me Account-Dashboard** | ✅ NEU | Hero mit Avatar + Plan-Badge, 3 Stat-Cards (Packs · Sprachen · zu wiederholen), Streak-Karte mit 7-Tage-Strip, Recent-Activity (3 letzte Packs mit Thumbnails), Plan & Founder-CTA, Account-Felder, Devices, DSGVO-Privacy-Sektion, Logout. Header-Dropdown von „nur Logout" zu Mein Konto / Bibliothek / Heute wiederholen / Founder Deal / Logout aufgewertet. Commit `c6797f6` |
| **/me Polish-Pass** | ✅ | Brand-conformer Avatar (navy disc, gold initial, kein Gravatar-Default), Streak-State erweitert um `activeDays[]` für die Kalender-Viz, alle Stat-Cards mit Empty-State-Copy. Commit `acf524c` |
| **Live-Test Desktop** | ✅ | Auth · Modi · Rating · Discover · Founder Stripe · Citations · 404 — alle Block 1–5 grün |
| **Live-Test Mobile (375×812)** | ✅ | Landing, /founder, /discover, /signin, /pack-Accordion alle sauber. Eine Polish-Notiz: /discover-Tab-Pills wrappen 2+1 statt 3 in Reihe — nicht-blocker. PackPage-Tabs auf Mobile sind clever als Collapsible-Accordion implementiert, kein Overflow |
| **sample-study** | ✅ NEU | Veritasium „Most Misunderstood Concept in Physics", 24 min, CEFR B2, ES + EN, 7 Kapitel + 8 Quiz-Fragen + 15 Vokabeln + 5 Quotes. `/pack/sample-study`. Commit `af3b1bb` |
| **sample-news** | ✅ NEU | Lex Fridman × Yann LeCun #416, 3 h, CEFR C1, ES + EN, 8 Kapitel + 7 Key Ideas + 6 Quotes (inkl. „LLMs are an off-ramp"). `/pack/sample-news`. Commit `af3b1bb` |
| **LAUNCH_POSTS.md Polish** | ✅ | 3 Pflicht-Fixes (Privacy-Honesty in HN-FAQ, „ferramentas" → „tools" Typo, Sample-Links in Post 1+3) + Post 4 r/getstudying neu (700 k Sub, Study-Mode + sample-study als Hook) |

### 🟢 Übrig vor Launch (Tage übrig: 7)

#### 1. Stripe Public-Name umbenennen (du, 2 Min)
Aktuell zeigt Stripe-Checkout „Zahlung an Leon Maré". Sollte „VozClara"
sein damit Käufer nicht verwirrt sind:

- Stripe Dashboard → **Einstellungen → Geschäftliches → Öffentliche Details**
- **Öffentlicher Unternehmensname:** `Leon Maré` → `VozClara`
- Speichern

#### 2. LAUNCH_POSTS.md persönlicher Pass (du, 30 Min)
Drafts sind editorial-sauber, brauchen aber deinen Ton. Geh durch:
- HN-Body — gibt's einen Satz wo du anders klingst?
- r/languagelearning — die Partner-Anekdote stimmt wörtlich?
- X-Tweet 1 — schärfer machen falls du willst (siehe Vorschlag im Chat)
- r/getstudying — neuer Post, wenn er für dich noch zu „Claude-glatt"
  klingt, ein paar persönlichere Sätze rein

#### 3. Final-QA-Checkliste (Mi, ~1 h)
Generieren wir am Mittwoch zusammen. Konkrete Klick-Path-Liste mit
Erwartungen, plus Cross-Browser-Spot-Check.

#### 4. Reddit-Account warm halten
Mi/Do/Fr: in r/languagelearning + r/productivity + r/getstudying ein paar
ehrliche Kommentare auf andere Threads. Reddit hasst Drive-by-Promo.
Account braucht Karma + Aktivität von **vor** dem Launch-Post.

#### 5. Discord-Server vorbereiten (Sa/So)
Founder-Lifetime-Deal verspricht „Direct Discord access".
Vor Mo Server anlegen, 3 Channels: #general, #feature-requests,
#founders-only. Einladungs-Link an die ersten 100 Founder-Käufer
manuell rausschicken nach jedem Stripe-Event.

### 🔵 Was bewusst auf Post-Launch verschoben bleibt

(Aus §25 unverändert):
- Google OAuth (Magic-Link reicht — Woche 2)
- Email-to-Pack (Pro, Woche 3)
- MP3/MP4-Uploads (Pro, Woche 2)
- Folders + Public Pack URLs (Woche 3)
- 4-Stufen Email-Sequenz (1 Welcome-Mail in LAUNCH_POSTS)
- 10 Blog-Posts (4 Posts in LAUNCH_POSTS.md statt 10)
- Status-Page (Sentry deckt's ab)
- PostHog (CF-Analytics + Sentry reichen)
- Onboarding-4-Schritt-Wizard (1-Click AudienceTiles statt)
- /me-Polish: editierbarer Display-Name + Avatar-Upload + Session-Liste

### 📋 Datei-Spickzettel — Stand Di 19.5.

Neu hinzugekommen zu §25-Liste:

**Frontend (src/)**
- `routes/AccountPage.tsx` — /me Dashboard mit 7 Sektionen
- `components/Avatar.tsx` — brand-conformer Monogram (3 Größen)
- `lib/samplePack.ts` — jetzt mit `samplePackStudy` + `samplePackNews`

**Worker (worker/src/)** — keine Änderungen heute

**Docs**
- `LAUNCH_POSTS.md` — Post 4 für r/getstudying ergänzt, Sample-Links
  in Post 1 + 3, Schedule-Tabelle im Header

### 🎯 Verbleibende Touch-Points pro Tag bis Launch

- **Mi 20.5.**: Stripe-Public-Name + LAUNCH_POSTS persönlich + Final-QA
- **Do 21.5.**: Reddit-Karma sammeln in den 3 Zielsubs + Discord-Server
- **Fr 22.5.**: Buffer-Tag, Sample-Pack-Spot-Check, mentale Vorbereitung
- **Sa 23.5.**: alles ruhen lassen, optional Discord-Test
- **So 24.5.**: 1 h Mock-QA — Stripe-Test-Käufe (mit echtem Konto?), Auth-
  Flow, Mobile in echter Hand
- **Mo 18.5.**: nichts neues bauen — nur lesen, ggf. Texte feilen
- **Di 26.5.** ⭐ **LAUNCH-Tag**: 14:00 UTC HN, 16:00 X-Thread,
  17:00 r/languagelearning + erste Comment-Response-Runde

— Update Di 19.5.2026 abends. Alles für den Launch bereit.

---

## 27 · Sprint-Status — Übergabe Mo 18.5. abends (Laptop → PC)

> **Wenn du am PC `git pull` machst, lies zuerst diesen Abschnitt.**
> §25 und §26 sind die historischen Übergaben. Dieses §27 ist der
> aktuelle Stand — alles davor ist erledigt, alles danach ist Backlog.

### Stand: Mo 18.5.2026 abends — **T-7/8 Tage zum Launch**

In einer 6-Stunden-Session am Laptop heute Abend wurde gerissen:
- Resend-Launch-Blocker eliminiert (Domain-Mismatch → leonmare.de Sender)
- voz-clara.com Konkurrenz analysiert (keine Trademark eingetragen)
- 3 Bugs vom Functional-Sweep gekillt
- /me Dashboard von „Logout-only" zu vollständigem Profile-Hub
- Welcome-Email auf erstem Sign-In
- Pack-Reviews-Display unter RatingPanel

### ✅ Heute geshippt (Commits chronologisch)

| Commit | Block | Detail |
|---|---|---|
| `2d6e351` | Resend-Fix | Sender-Domain `vozclara.app` → `leonmare.de` (verifiziert in deren Free-Tier), spart $20/Mo Pro-Plan. Magic-Link geht jetzt an *alle* Emails statt nur an deine eigene |
| `af8d9b3` | Bugs #1+#2 | Impressum hatte noch `[TODO: Straße]` in der V.i.S.d.P-Sektion (Frauenhofstraße 7 jetzt überall) · HeroPackPreview zeigte nur 3 Mode-Tabs, Studieren fehlte (alle 4 jetzt da, Klick auf Studieren lädt Veritasium) |
| `8f0cd64` | Bug #3 | Worker Curated-Endpoint: legacy KV-Einträge mit `mode: 'business'` werden on-read zu `brief` migriert |
| `94519be` | /me UX | Inline-Edit Display-Name + 2-Step Account-Delete-Flow (DSGVO-konform mit echter Server-Erasure). Worker-Endpoints: PATCH /api/auth/profile, DELETE /api/auth/account |
| `82a3822` | B + C | **C:** Welcome-Email auf erstem Sign-In, persönliche Christian-Stimme, ES/PT/DE/EN, CTA zum sample-study Pack. **B:** Reviews-Display unter RatingPanel mit neuem `/api/rating/reviews?videoId=X`-Endpoint und ReviewsList-Komponente |

### 🟡 Verbleibende Pre-Launch-Tasks (zu Hand erledigen)

#### 1. Stripe Public-Name umbenennen (2 Min)
1. https://dashboard.stripe.com → **Einstellungen → Geschäftliches → Öffentliche Details**
2. „Öffentlicher Unternehmensname": `Leon Maré` → `VozClara`
3. Speichern
→ Käufer sehen am Checkout „Zahlung an **VozClara**" statt „Leon Maré"

#### 2. DPMA-Trademark anmelden (30 Min, €290)
- https://anmeldung.dpma.de
- Marke: `VozClara`
- Klassen: **9** (Computer Software) + **41** (Bildungsdienstleistungen)
- Kosten: €290 (Grundgebühr für bis zu 3 Klassen)
- Schutz: 10 Jahre in DE, verteidigt gegen voz-clara.com-Expansion
- **Priorität:** Mi morgen — vor Reddit-Posts, da öffentliche Sichtbarkeit dann erst echte Bedrohung wird

#### 3. Defensive-Domains kaufen (10 Min, ~€20-25)
- Wo: **INWX** (https://www.inwx.de) oder **Netcup** (https://www.netcup.de)
  - **NICHT Cloudflare** — die verkaufen `.de`/`.eu` neue Registrierungen nicht
  - **NICHT Ionos** — teurer + Upsell-Müll
- Domains:
  - `vozclara.de` — €5/Jahr — Heimmarkt, 301-redirect auf .app
  - `vozclara.eu` — €5-7/Jahr — EU-weit defensive
  - `voz-clara.app` ← **skip**. Konkurrenz ist `voz-clara.com` (Audio,
    andere Kategorie); Wahrscheinlichkeit dass die in den .app-TLD
    expandieren ≈ 0. Außerdem würde es die "VozClara einwörtig"
    Brand-Konvention untergraben.
- **DNS-Setup**: Bei INWX/Netcup die Nameserver auf Cloudflare zeigen (`aron.ns.cloudflare.com`, `joy.ns.cloudflare.com` o.ä. — Cloudflare → Add Site → vozclara.de → erhält Nameserver)
- Später Pages-Setup → alle 3 → 301-Redirect auf `vozclara.app`
- **Skip `vozclara.io`** ($50/Jahr für kein strategisches Plus)

#### 4. Reddit-Karma sammeln (Do/Fr/Sa, je 30 Min)
- r/languagelearning + r/Spanish + r/learnGerman
- r/productivity + r/Notion
- r/getstudying
- **Echte** Comments auf andere Threads — kein Drive-by-Promo
- Reddit's Spam-Filter blockiert Accounts ohne Karma-Historie beim ersten Post

#### 5. Discord-Server vorbereiten (45 Min am PC)
- https://discord.com/new
- 3 Channels:
  - `#general` — allgemein
  - `#feature-requests` — Roadmap-Input
  - `#founders-only` — Channel für die ersten 100 Founder
- Welcome-Message mit Einführung + Founder-Roles-Verteilung
- Bot/Webhook für Stripe → Discord falls automatisiertes Founder-Onboarding gewünscht *(post-launch)*

#### 6. Mock-QA auf echtem iPhone (1 h, So)
- vozclara.app im Safari mobil öffnen
- FINAL_QA.md durchgehen (`/Users/christiang/Projects/vozclara/FINAL_QA.md`)
- /signin Magic-Link mit echter Email testen → check ob Mail kommt
- /me Inline-Name-Edit auf Touch testen
- /founder Stripe-Tap → Apple-Pay-Flow

#### 7. Final-Pre-Launch-Check (Mo Vormittag)
- Sentry-Dashboard kurz checken: keine neuen Error-Trends letzte 24h
- Cloudflare Analytics: RPS-Werte normal
- Stripe-Mode: **Live** (nicht mehr Test)

### 🔵 Was bewusst NICHT vor Launch gemacht wird

- Comments-Feed auf Pack-Listen (Reviews allein reichen)
- Avatar-Upload (Monogramm-Fallback ist on-brand)
- Notification-Preferences-Page (existierende NotificationToggle reicht)
- Public-Profile `/u/cmare` (Woche 3)
- Cross-Pack-Synthese (Woche 3 Re-Launch-Story)
- Watch-Mode mit synchronisiertem Transcript (Woche 2 Re-Launch-Story)

### 📋 Datei-Spickzettel — Stand heute

**Neu seit §26:**
- `src/components/ReviewsList.tsx` — Pack-Reviews-Display
- `worker/src/email.ts` — `sendWelcomeEmail()` + DEFAULT_FROM=`leonmare.de`
- `worker/src/auth.ts` — `handleAuthProfile`, `handleAuthDelete`, isFirstSignIn-Branch
- `worker/src/rating.ts` — `handleRatingReviews`
- `src/hooks/useAuth.tsx` — `updateProfile()` + `deleteAccount()` context methods
- `src/routes/AccountPage.tsx` — EditableNameRow + DeleteAccountCard

### 🎯 PC-Switch-Quickstart (5 Min)

```bash
git pull
npm install
npm run dev           # Frontend → localhost:5173
cd worker && npm run dev  # Worker → localhost:8787
```

Liest LAUNCH_PLAN.md §27 (dieses Kapitel) und FINAL_QA.md für die Walkthrough-Liste.

### Zeitleiste bis Launch

- **Mo 18.5.** *(heute)*: alles gebaut + Launch-Blocker (Resend) eliminiert ✅
- **Di 19.5.**: Stripe-Name + DPMA-Anmeldung + 3 Domains (am PC)
- **Mi 20.5.**: Reddit-Karma-Tag 1 (r/languagelearning + r/Spanish)
- **Do 21.5.**: Reddit-Karma-Tag 2 (r/productivity) + Discord-Setup
- **Fr 22.5.**: Buffer · Sample-Pack-Spot-Check · LAUNCH_POSTS persönlicher Pass
- **Sa 23.5.**: Discord-Server live, optional Mock-QA Vorab
- **So 24.5.**: 1 h Mock-QA auf echtem iPhone, Reddit-Karma-Tag 3 (r/getstudying)
- **Mo 25.5.** oder **Di 26.5.** ⭐ **LAUNCH**

— Übergabe Mo 18.5.2026 abends. Switching to PC. Gute Pause.

---

## 28 · Sprint-Status — PC-Session Mo 18.5. Spätabend → Übergabe an Di 19.5.

> §27 war die Übergabe Laptop→PC. Dieses §28 schließt die PC-Session
> ab und übergibt an Di 19.5. Beim nächsten Session-Start zuerst §28
> lesen, dann §27 für historischen Kontext.

### Stand: Mo 18.5.2026 spätabends — **T-6/7 Tage zum Launch**

PC-Session war eine 2-Stunden-Polish-Runde nach dem Laptop-Push.
Code-Review der Laptop-Commits + Founder-Discord-Wiring + Stripe
Success-URL gesetzt + 4 commits geshippt.

### ✅ In dieser PC-Session geshippt

| Commit | Was |
|---|---|
| `c8a02e3` | CI-Fix: `labels` prop in ReviewsList.tsx durchgereicht — Z. 85+87 hatten den dict-Closure verloren, tsc-Fehler killed `§27`-Deploy. ReviewRow ist jetzt typsicher mit `ReturnType<typeof reviewsLabels>` |
| `5ecfedc` | **DSGVO Art. 17 vollständig** beim Account-Delete — Code-Review hatte zwei reale Gaps gefunden: (1) `email:${user.email}` ohne `.toLowerCase()` als stale-pointer-Risiko, (2) `rvote:<videoId>:<voterId>` Reviews/Stars wurden beim Account-Delete nicht entfernt. Neue `purgeVotesForVoters()` in rating.ts sweept + dekrementiert Aggregates korrekt vor dem User-Record-Delete |
| `6f4d7b3` | `DISCORD_SETUP.md` — copy-paste-Pack für den Server-Setup mit Channel-Topics + 2 Welcome-Pinned-Posts (general/founders-only) + Roles + Permissions + Setup-Checklist |
| `2441ca3` | Founder Discord-Invite verdrahtet — `FOUNDER_DISCORD_INVITE` konstante in lib/founder.ts. `/founder?welcome=1` rendert jetzt einen goldenen Welcome-Banner mit prominentem "Join the Discord" CTA. 4 Locales |

### ✅ User-side heute Abend erledigt

| Task | Status |
|---|---|
| **Stripe Public-Name** `Leon Maré` → `VozClara` | ✅ |
| **Discord-Server `VozClara`** mit 3 Channels + Roles + Pinned-Posts + privatem #founders-only | ✅ Live-Link `https://discord.gg/z93CKmUSv6` |
| **Stripe Payment Link Success-URL** → `https://vozclara.app/founder?welcome=1` | ✅ |
| **Server-Nickname** in VozClara-Server → `Christian (VozClara)` | ✅ |

### 🎯 End-to-End Founder-Flow ist komplett verdrahtet

1. Besucher → `/founder` → klickt €99-CTA
2. Stripe-Checkout → zahlt
3. Stripe redirected → `vozclara.app/founder?welcome=1`
4. Welcome-Banner erscheint mit Discord-CTA
5. Käufer tritt Discord bei
6. Christian bekommt Stripe-Email + macht zwei manuelle Steps:
   - Discord → Mitglied → `Founder` Role assignen
   - Terminal: `curl -X POST /api/founder/admin/increment` → Counter +1

### 🟡 Verbleibende Tasks vor Launch (Di–So)

**Reihenfolge wenn du Di morgen anfängst:**

#### 1. Reddit-Karma sammeln — täglich 30 Min ab Di 19.5.
- **Di** r/languagelearning: 2-3 substanzielle Comments auf andere Threads (keine VozClara-Links)
- **Mi** r/productivity: gleiches Spiel
- **Do** r/getstudying: gleiches Spiel
- **Fr** Round 2 in allen 3 Subs (1-2 Comments je)
- Reddit-Spam-Filter blockt sonst den Launch-Post

#### 2. LAUNCH_POSTS persönlicher Pass — 30 Min (Fr passt)
Drafts in `LAUNCH_POSTS.md` sind editorial-clean, brauchen aber
deinen persönlichen Ton. Vor allem:
- HN-Body: gibt's einen Satz wo du anders klingst?
- r/languagelearning: Partner-Anekdote authentisch?
- X-Tweet 1: schärfer machen?
- r/getstudying: noch zu „Claude-glatt"?

#### 3. Mock-QA echtes iPhone — Sa 23.5., ~1 h
- `FINAL_QA.md` als Checkliste durchgehen
- /signin Magic-Link mit echter Email
- /me Inline-Name-Edit auf Touch
- /founder Stripe-Tap → Apple-Pay-Flow
- Welcome-Banner nach Test-Kauf?

#### 4. Pre-Launch-Check — So 24.5., ~15 Min
- Sentry: keine Error-Trends letzte 24 h
- Cloudflare Analytics: RPS-Werte normal
- Stripe: **Test-Mode → Live-Mode** umschalten (falls aktuell Test)

### 🔵 Nach hinten verschoben (User-Entscheidung)

- **DPMA-Trademark** (€290) — vorerst skip, nach Launch wenn Sichtbarkeit echte Bedrohung wird
- **Defensive Domains** `vozclara.de/.eu` (€20) — vorerst skip, gleicher Grund
- Beide haben User-Entscheidung-Status, sind nicht Launch-Blocker

### 📋 Wo der Stand morgen am Laptop/PC liegt

**Repo:** alles auf `main`, latest commit `2441ca3`. `git pull` reicht.

**Live:** vozclara.app ist deployed mit allem von heute. Founder-
Flow ist End-to-End klickbar.

**Discord:** `https://discord.gg/z93CKmUSv6` — Permanent-Invite,
landet in #general, manuelle Role-Vergabe für Founder.

### 🎯 Erste 10 Min wenn du Di anfängst

1. `git pull` (sollte clean sein, ich hab heute alles gepushed)
2. Reddit-Tab öffnen → r/languagelearning durchscrollen → 3 Threads finden wo du was substanzielles beitragen kannst
3. 30 Min organische Comments schreiben (KEIN VozClara-Link)
4. Wenn Energie da: LAUNCH_POSTS.md aufmachen, durchlesen, Bauchgefühl-Stellen markieren

Nicht vergessen: **DPMA + Domains** als Reminder für Tag 1 post-launch — sobald HN-Buzz da ist, ist Squatting-Risiko real.

— PC-Session-Ende Mo 18.5. spätabends. Sprint weiter 3+ Tage voraus. Gute Pause.

---

## 29 · Sprint-Status — Di 19.5. Vormittag (PC → Laptop)

> **Bei Laptop-Start zuerst dieses §29 lesen.** §27 + §28 sind die
> historischen Übergaben. Hier der aktuelle Stand zur Mittagszeit
> Di 19.5.

### Stand: Di 19.5.2026 Mittag — **T-6/7 Tage zum Launch**

Kurze PC-Session heute morgen, primär strategisch (kein neuer Code).
Reddit-Karma-Tag 2 läuft. BetaList-Decision getroffen. Marketing +
Investor-Strategie geklärt.

### ✅ Heute Vormittag erledigt

| Was | Status |
|---|---|
| **r/Spanish Karma-Comment** | ✅ gepostet ("Déjame"-Frage mit Heritage-Authority-Antwort, Venezolaner-Hintergrund) |
| **r/languagelearning Inbox-Check** | ✅ keine Antworten seit gestern Nacht (normal, viele Threads sind Drive-by-Lesen) |
| **BetaList Submission** | ⏸️ angefangen, bei Paywall ($39 Lite / $99 Standard / $299 Premium) bewusst abgebrochen |
| **Marketing-Strategie geklärt** | ✅ siehe unten — Spend-Hierarchie definiert |
| **Investor-Strategie geklärt** | ✅ siehe unten — jetzt nicht, post-launch Indie-VC |

### 🟢 Entschieden

#### BetaList — Skip jetzt, eventuell post-launch nochmal
BetaList hat **kein gratis tier mehr**. Lite $39 / Standard $99 / Premium $299. Pre-Launch nicht lohnenswert weil:
- Gleichen SEO-Backlink-Wert kriegen wir gratis von Futurepedia (DR ~70) und HN (DR 90) — falls letzteres Front-Page geht
- BetaList-Audience ist gemischt (Founder + Tool-Hunter), nicht direkte Conversion-Quelle
- Sunk-cost-30-min-Submission ist verloren, aber Lehrgeld

**Reminder für post-launch (Woche 2-3):** Wenn Founder Deal Geld reinkommt, BetaList Lite $39 als evergreen SEO-Backlink-Investment in Erwägung ziehen. Aber nicht Priority.

#### Marketing-Spend-Hierarchie (mit Cashflow nach Founder Deal)

**Tier S — gratis erst (insgesamt ~1h Aufwand):**
- ❌ Futurepedia — **2026 komplett paid** ($247 Sold Out / $497 Verified). Skip pre-revenue, reconsider post-launch wenn Cashflow stimmt. Update Di 19.5. 15:02.
- ❌ TAAFT — **auch komplett paid**, aber unterer Tier ist tatsächlich interessant. Siehe TAAFT-Eintrag in Tier-A unten. Update Di 19.5. 15:38.
- ✅ **futuretools.io** — submitted Di 19.5. 15:59 als Freemium / Education. Matt Wolfe reviewt manuell, ~1-2 Wochen bis Listing (oder Reject). Free bestätigt, keine Paywall in 2026. Mail-Confirm an salvador7eon@gmail.com.
- ❌ **toolify.ai** — **2026 auch paid**, $99 minimum (48h-Listing). Audience-Match aber sehr stark (5,1M Monthly Visits, Multi-language Intro auto-translates ES/PT/DE/EN — passt 1:1 zu unserer i18n-Positionierung). Siehe Tier-A Monat 2 unten. Update Di 19.5. 16:02.
- Product Hunt Setup (Mi nach Launch) — bisher nicht angefasst

**Lesson learned (Di 19.5.):** 2026er AI-Tool-Directory-Landschaft hat
sich in 12 Monaten komplett paywalled. Sweep-Bilanz: 3 von 4 Major-
Directories (Futurepedia, TAAFT, Toolify) haben ihre Free-Lane
geschlossen — nur Futuretools.io bleibt für 2026 free. Aber: nicht
alle Paywall-Tiers sind gleich teuer. TAAFT $49 Website-Only ist
günstiger als BetaList Lite $39 bei 80× größerer Reichweite. Toolify
$99 ist Audience-Match-Premium wegen Multi-language Intro. Vor dem
Reflex-Skip pricing genau lesen.

**Tier-A Reach-Spend — sequenzielle Roadmap mit Cashflow-Trigger**

Aktualisiert Di 19.5. — Direkt-Vergleich BetaList vs Futurepedia
durchgeführt. Klare Hierarchie pro Conversion-€, nicht pro
Eyeball-€:

| Wann | Spend | Was | Warum |
|---|---|---|---|
| Woche 1 post-Launch | €0 | Reddit + HN + Discord-Aktivität | Founder-Deal-Pitch trägt |
| Woche 2 | €0 | **Product Hunt Launch** vorbereitet | Bestes Free-Launch-Venue, US/EU-Eyeballs |
| Woche 2 (nach Reddit-Daten) | $49 | **TAAFT Website Only** | Permanent-Listing in 80M-Visitor-Directory + $100 PPC-Credit = effektiv gratis wenn PPC voll genutzt. Erst NACH Reddit-Daten weil wir dann wissen welche Headlines konvertieren |
| Woche 3 (≥30 Founder ≈ €3k) | $99 | **BetaList Standard** | Newsletter-Blast inkludiert, Indie-Audience kauft eher Lifetime |
| Woche 4 | $350-500 | **TLDR AI Newsletter** | 200k AI-curious Devs, direktes Audience-Match, beste €/Conversion |
| Monat 2 (wenn TAAFT konvertiert) | $347 | **TAAFT Maximum Exposure** | Upgrade auf das Newsletter-Tier nur wenn $49-Tier Daten geliefert hat dass die Audience konvertiert. 2,5M Newsletter-Subscribers + 10× mehr Traffic |
| Monat 2 | $247 | **Futurepedia Basic** *(wenn Sold-In)* | Reines SEO-Investment, DR 70 Backlink, payoff Monat 4+ |
| Monat 2-3 (wenn TAAFT $49 konvertiert) | $99 | **Toolify.ai Submit** | 5,1M Monthly Visits + **Multi-language Intro** auto-translatet unsere Tool-Description in ES/PT/DE/EN — direkter Audience-Match zu unserer i18n. 48h-Turnaround. Conditional auf TAAFT-Daten weil günstigerer Test zuerst |
| Monat 3 | $300 | **Indie Hackers Newsletter** | Cross-Promotion + Word-of-Mouth |
| Monat 3 | $200 | **Google Search Ads Test** | „youtube to anki", „study from youtube", „youtube transcript" Keywords |

**Tier-B Scale-Spend (wenn Pro-MRR ≥ €2k):**
- YouTube Influencer Integration (Easy German, Easy Spanish, Easy German Slow etc.) $500-2000 pro Channel
- Reddit Promoted Posts $300-500 in r/languagelearning + r/getstudying
- TLDR-Sponsorship monatlich rotieren ($350 × 3 = ~$1.000)

**Explicit-Skip-Liste (nicht reflexartig wieder probieren):**
- ❌ **Futurepedia $497 Verified** — Delta zu $247 Basic ist nicht 2× wert
- ❌ **BetaList Premium $299** — Delta zu $99 Standard ist nicht 3× wert
- ❌ **AppSumo Lifetime-Deal Marketplace** — kannibalisiert €9/Mo Pro-MRR. Founder-Deal ist schon der einzige Lifetime-Hook
- ❌ **Meta / Instagram / TikTok Ads** — falsches Audience-Match für editoriale Brand
- ❌ **LinkedIn Ads** — CPC > €5, miserabler ROI
- ❌ **Lifetime-Deals auf Stacksocial / DealMirror** — Brand-Schaden, Discount-Hunter-Audience

**Direkt-Vergleich BetaList vs Futurepedia (warum BetaList gewinnt
bei nur einem Pick):**

| | Futurepedia $247-497 | BetaList Standard $99 |
|---|---|---|
| Audience | 400k AI-Tool-Hunter | 1M+ Indie-Hacker + Early-Adopters |
| SEO-Authority | DR ~70 | DR ~65 |
| Was du bekommst | Listing | Listing + Newsletter-Blast |
| Sign-up-Konversion | Niedrig (Window-Shopper) | Mittel-Hoch (Launch-Hungrige) |
| €/Conversion | $$$ | $ |

BetaList gewinnt wegen Newsletter-Blast (direkt zu Eyeballs, nicht
erst „nach SEO-Ranking warten") + Indie-Hacker-Audience (kauft eher
€99 Founder-Deal wegen Tribe-Loyalität) + 5× billiger.

Futurepedia macht erst Sinn Monat 3+ als reines SEO-Investment, nicht
als Akquise-Kanal.

#### Investoren — jetzt nicht, später bewusst

**Pre-Launch / Launch:** keine Investor-Konversationen initiieren. Founder Deal Cashflow ist die Strategy, Brand-Story-Konsistenz mit „avoiding VC" Pitch.

**Falls Investor proaktiv anschreibt:** höflich + zurückhaltend antworten — „Thanks, not raising right now, happy to stay in touch post-launch."

**Monat 3-6 post-launch (wenn €5-10k MRR):** Indie-VC-Funds ansprechen, NICHT traditional VC. Konkrete Targets:
- Earnest Capital (Shared Earnings Agreement, keine Equity)
- Calm Company Fund
- TinySeed ($120k+ für 12-15% Equity, plus 1-Jahr Mentoring)
- Plus: Angel-Investoren mit Indie-SaaS-Erfahrung (Adam Wathan, Pieter Levels, Damon Chen, Tony Dinh — Twitter/Indie-Hackers-DM)

**Traditional VC (a16z, YC, Atomico)**: erst wenn €100M+ Outcome explicit angepeilt wird. Für VozClara aktuell nicht der richtige Match — eher Mid-Size-SaaS-Trajectory ($10-20M ARR Cap).

### 🟡 Verbleibende Pre-Launch-Tasks am Laptop

#### Heute Di 19.5. abends (~1h)
- [ ] **Futurepedia Submission** — Texte aus Chat-Historie kopieren, 15 Min
- [ ] **TAAFT Submission** — gleicher Workflow, 10 Min
- [ ] **futuretools.io + toolify.ai** — quick subs, 15 Min
- [ ] (Optional) Reddit Karma weiterverteilen — r/anki ist morgen Mi geplant, nicht heute

#### Rest der Woche (laut §28 Plan)
- **Mi 20.5.** r/anki Karma-Comment + Product Hunt Setup (Hunter finden, Maker-Profile)
- **Do 21.5.** r/Notion oder r/PersonalKnowledgeMgmt Karma + LAUNCH_POSTS persönlicher Pass
- **Fr 22.5.** r/learnGerman Karma + Buffer
- **Sa 23.5.** Mock-QA echtes iPhone (FINAL_QA.md durchgehen)
- **So 24.5.** Pre-Launch-Check (Sentry, CF Analytics, Stripe Live-Mode)
- **Mo 25.5. / Di 26.5.** ⭐ LAUNCH

### 📋 Wo der Stand am Laptop liegt

**Repo:** alles auf `main`, latest commit `ed12b09` (/changelog Route). `git pull` reicht.

**Live:** vozclara.app fully deployed. Founder-Flow End-to-End klickbar inklusive Welcome-Banner nach Stripe-Success.

**Reddit:**
- r/languagelearning Comment (gestern Nacht) — `https://www.reddit.com/r/languagelearning/comments/1tgb242/tl_personal_rules_i_use_to_become_fluent/`
- r/Spanish Comment (heute Vormittag) — Thread `1tgb242` Heritage-Authority-Antwort zur „déjame"-Frage

**Discord:** `https://discord.gg/z93CKmUSv6` live, 3 Channels, Roles, Pinned-Posts

**Stripe:** Founder Deal Payment Link live, Success-URL auf `/founder?welcome=1` gesetzt, Public-Name = „VozClara"

### 🎯 Erste 30 Min am Laptop (Vorschlag)

1. `git pull` (sollte clean sein)
2. Reddit-Inbox-Check beider Subs — wenn Antworten reagieren binnen 12h
3. **Futurepedia Submission** mit den Texten aus Chat-Historie (15 Min)
4. Wenn Energie da: TAAFT + futuretools.io

Texte für Futurepedia (kopier-fertig):

**Tagline:**
```
Turn YouTube into structured knowledge — packs with vocab, quiz, citations.
```

**Description (Futurepedia bevorzugt Bullets, 150-200 Wörter):**
```
VozClara turns any YouTube video into a structured Knowledge Pack you can study, search, and share.

Key features:
• TL;DR + chapter summaries with rewind-on-tap timestamps
• Vocabulary tuned to your CEFR level (A1 → C1)
• Comprehension quiz (recall + application questions)
• Key quotes with speaker, timestamp, translation
• AI tutor that knows your pack's content
• Voice shadowing with pronunciation scoring
• Anki .apkg export, one tap
• SRS (spaced repetition) for daily review
• Michelin-style community quality ratings

Four output modes: Briefing (decision-makers), Study (students), Learn (language learners), Creator (content repurposers).

Four languages: German, Spanish, English, Portuguese.

Local-first: your library lives in your browser (IndexedDB). No account required to start. Sign-in only unlocks cross-device sync.

Free tier covers most use. Pro plan €9/mo unlocks premium AI models (Claude Sonnet / GPT-5), unlimited packs, and MP3/MP4 uploads.
```

**Pricing:** Free + €9/mo Pro + €99 Lifetime (Founder, capped at 100)
**Categories:** Productivity · Education · Language Learning · Video · Summarization · AI Tools
**Logo:** `public/brand-mark-512.png`
**Screenshot:** `og-image.png` ODER deine zwei Submission-Screenshots von BetaList (auf Desktop liegend)

— PC-Session-Ende Di 19.5. Mittag. Switching to Laptop. Sprint weiter im Plan.

---

## §30 — Market Sweep & MRR-Reach-Strategie (Di 19.5. 16:30)

**Trigger:** User explicit request „mach eine komplette effektive Suche
für Marketing-Spending und Launch-Hilfe für VozClara mit maximalem ROI
für Monthly Recurring Users". Zwei aufeinanderfolgende Research-Sweeps
durchgeführt (1. allgemeine Reach-Landscape, 2. MRR-fokussiert + Pro-
Tier-Pricing-Benchmarks).

### 🎯 Die 4 strategischen Entscheidungen die alles ändern

#### 1. Pro Tier €9/mo — **bestätigt durch Marktdaten**

Schon in §29-Submission-Texten verwendet, jetzt durch 2026er-Markt-
Benchmarks validiert: Eightify $9.99, NoteGPT $9.99, Mindgrasp $9.99,
RemNote $8-10, LingQ $10, Brainscape $9.99. Median-Cluster bei
$9-10/mo.

**Feature-Gate-Entscheidung (sauber, einfach, defensible):**
- **Free**: 3 Videos/Woche, Summary + Transcript only
- **Pro €9/mo (€72/Jahr = €6 effektiv)**: Unlimited Videos, alle 4
  Reading Modes (learn/brief/study/creator), **SRS Flashcards + Anki
  Export**, Multi-Language Pack, Premium AI Models (Claude Sonnet),
  MP3/MP4 Upload
- **Founder Deal €99 Lifetime (cap 100)**: alles aus Pro, lifetime,
  einmalige Charge

**Der Moat:** SRS + Anki-Export ist die einzige Feature-Kombi die
NotebookLM (free, kein YouTube-first, kein SRS), Eightify (kein SRS),
NoteGPT (kein Anki-Export), YouLearn (kein YouTube-Fokus) nicht haben.
Das ist die „warum €9 statt free NotebookLM"-Antwort die in ALLE
Marketing-Copy gehört.

**Implementation-Blocker:** Stripe Payment Link für €9/mo Subscription
muss erstellt werden, /pricing-Page muss Pro Tier zeigen, Worker-Side
Pro-Quota-Check muss eingebaut werden. → Task #10.

#### 2. Affiliate-Stack > Flat Sponsorship — die Reach-Math kippt

**Alt:** $600 für EINE TLDR-Newsletter-Slot
**Neu:** $600 split auf 3 Creator × $200 + 30% Recurring Affiliate 12mo

Bei realistisch 10 konvertierten Pro-Usern pro Creator-Mention:
- 3 × 10 × €9/mo × 12 Monate = **€3.240 ARR aus $600 Initial-Spend**
- Pro Pro-User-Affiliate-Cost: €2.70/mo an Creator = nachhaltig
  motiviert über 12 Monate (Evergreen-Mentions, nicht One-Shot)

**Restruktur:** ALLE Creator-Outreach läuft jetzt als
$150-250 Flat + 30% Recurring 12mo. Niemand wird Flat-Sponsor-gepaid.

#### 3. Anki Add-on bauen = höchst-ROI-Build in Backlog

**3M+ Anki User · Add-on Store hat kaum Monetization-Noise · 2 Wochen
Dev · $0 Marketing-Spend.**

Funnel: Free Add-on „VozClara YouTube Import" → braucht VozClara-
Account → 5 Imports/Woche Free → Pro-Gate für mehr. Strukturell
schwer für Konkurrenz zu kopieren — Eightify/NoteGPT/YouLearn haben
keine Anki-Pipeline.

**Optional:** Obsidian Community Plugin mit demselben Funnel (4M+
User, 120M Plugin-Downloads). Selber Code recycelbar.

→ Task #12, Sprint Woche 2-3 nach Launch.

#### 4. Programmatic SEO JETZT seeden — Creator-spezifische Pages

Cluster-Ranking nach MRR-Conversion-Potential:

| Rank | Cluster | Beispiel-Title |
|---|---|---|
| 1 | „youtube to anki" Variants | „Turn YouTube into Anki cards", „YouTube to Anki workflow 2026" |
| 2 | **Creator-spezifische Notes-Pages** | „Huberman Lab Episode X — Notes + Flashcards", „Veritasium [video] summary + Anki Deck" |
| 3 | „[language] podcast/lecture transcription" | „Best Spanish podcast notes tool" |
| 4 | „NotebookLM alternative" Variants | „NotebookLM alternative for language learners" |
| 5 | „Anki tool comparisons" | „VozClara vs AnkiHub" |

**Cluster 2 ist Zapier-Pattern:** Tausende Long-Tail-Pages
programmatisch aus User-Packs in KV. **Eigene App generiert den
Content** — meta-credibility, zero marginal cost. 12 Wochen bis
Ranking — fällt genau zusammen mit dem Punkt wenn Paid Acquisition
Budget durch ist.

→ Task #13, Sprint Woche 1 nach Launch.

### 🔄 Reversals aus dem ersten §29-Sweep

**TAAFT $49 NICHT mehr Woche 2 unconditional.** Neuer Gate: Pro-
Upgrade-Funnel muss >3% konvertieren (PostHog/Plausible
instrumentiert, Task #11). Sonst verbrennen wir die Bullet weil
Directory-Traffic broad-intent landet auf einer Pricing-Page die das
SRS-Gate nicht klar signalisiert. Reihenfolge: erst Funnel
instrumentieren + optimieren, DANN TAAFT.

**AppSumo erneut betrachtet (war im §29-Skip):** Lifetime-Deal-
Marketplace bleibt skip. ABER: 1-Jahr-Pro-Deal-Variante ist
interessant — 200 Codes × $49 = $9.800 Cash-Injection + Audience
+ Reviews + forced Renewal-Cliff bei Monat 12 (vs Lifetime-Cliff =
nie). Verhandlungsoption für **Monat 4 post-launch**, NICHT jetzt.
AppSumo Review-Cycle ist 8-12 Wochen, also passt timing.

### 💰 Spend-Allocation (frische €3k Catering-Cash)

**Wenn $1.000 verfügbar:**
| Channel | Spend | Rationale |
|---|---|---|
| 3 Mid-Tier Creator Affiliate-Deals | **$600** | $150-250 flat + 30% recurring 12mo, Evergreen-Mentions |
| TLDR AI Newsletter (Woche 4) | **$350** | bleibt im Plan, AI-curious Devs konvertieren ~3-5% bei klarem Upgrade-Hook |
| Programmatic SEO Tooling (Ahrefs Lite o.ä.) | **$50** | 1mo Lizenz für Keyword-Validation der Creator-Notes-Cluster |

**Wenn $1.500 verfügbar — Add-ons:**
- +$350 zweites Newsletter staggered (Mindstream / Free Language /
  PKM Weekly), 10-14d nach TLDR
- +$50 Reddit Ads Test ($5/d × 10d) in r/languagelearning + r/Anki
  für Creative-A/B (NICHT als Primary Reach)

**KEIN sofortiges Spending vor:** (a) Pro-Tier in Stripe live, (b)
Conversion-Tracking läuft, (c) Reddit-/HN-Launch-Daten als Baseline.

### 📋 Named Creator-Targets für Outreach (aus Research-Sweep #2)

**Language-Learning (sortiert nach Outreach-Wahrscheinlichkeit):**

| Creator | Subs | Channel | Angle |
|---|---|---|---|
| Days & Words (Robin) | 80k | @DaysandWords | Refold/Immersion, polyglot-friendly |
| Easy Portuguese | 120k | @EasyPortuguese | Underbooked Sponsor-wise, rare PT-Niche |
| Portuguese with Leo | 390k | @PortugueseWithLeo | EU-PT, rare Niche |
| Dreaming Spanish (Pablo) | 700k | @DreamingSpanish | CI-Audience LIEBT Tools, höchst Affiliate-Yield |
| Days & Words → Justin Sung etc. (Study-Tubers) | siehe Reseach | — | Stack mit Language-Tubers |
| Luca Lampariello | 150k | @LucaLampariello | Polyglot OG, features oft Tools |
| Deutsch für Euch (Katja) | 270k | @DeutschFuerEuch | DE-DE Learners, Sponsor-Unterbooked |
| Spanish with Vicente | 400k | @spanishwithvicente | EU-Spanish |
| Speaking Brazilian (Virginia) | 450k | @SpeakingBrazilianLanguageSchool | PT-BR |
| Lindie Botes | 470k | @LindieBotes | Multi-Language Polyglot |

**Study-Tubers:**
| Justin Sung (iCanStudy) | 750k | @JustinSung | Active Sponsor Program ~$3-5k Integration |
| Elizabeth Filips | 700k | @ElizabethFilips | Med-Student Anki-Crowd |
| Curtis Gee | 700k | @curtisjgee | Study-Vlog |
| Archer Newton | 120k | @ArcherNewton | Learning Coach |
| Mike Dee | 150k | @MikeAndIkey | Obsidian-Crossover |
| Linking Your Thinking (Nick Milo) | 110k | @LinkingYourThinking | PKM hardcore, $500-2k Sponsor |
| Odysseas | 150k | @OdysseasD | Med-Student, Anki-native |

**Erwartung:** ~30% antworten auf Cold-Email. Bei 25 Pitches = 7-8
Antworten = 3-4 Deals realistic. Outreach-Block ~4h.

### 🌍 EU-Polyglot-Channels (VozClara only, kein CaterSmart-Crossover)

- **Discord „German Learning and Discussion"** — 224k Mitglieder,
  größter DE-Learning-Server, hat `#tools`-Channel, community-friendly
- **Discord „Deutsch lernen!"** — 24k Mitglieder, Resources-Mentions
  erlaubt
- **r/Spanish** (~700k) · **r/learnspanish** (~550k) · **r/Idiomas**
  (~30k Spanish-language polyglot meta)
- **r/learnportuguese** (~85k) · **r/portugal** für EU-PT
- **r/de** (~1M, native-side word-of-mouth) · **r/austria** ·
  **r/Switzerland**
- **r/Anki_DE** (klein, engaged) · **r/medizinstudium** (DE/AT
  Med-Students = High Anki-Intent)
- **Easy Languages Patreon-Discord** — gesponsorte Mention $200-500

Skip: FB-Polyglot-Groups (Engagement tot), TikTok ohne Native-Content-
Commitment.

### 🚫 Reinforced Skip-Liste (nach 2 Research-Sweeps)

- **AppSumo Lifetime** — kannibalisiert MRR (1-Jahr-Pro-Variante
  Monat 4 evaluieren, aber Default-Skip)
- **PitchGround / SaaSZombie / Dealify** — 2026 inaktiv geworden
- **Lenny's Newsletter** — B2B-PM-Audience, falsches ICP
- **Ben's Bites / Superhuman AI / Rundown AI Premium** — $1-3k/Send
  out of range pre-€10k-MRR
- **Heise / Golem / Lenny** Display-Ads — Enterprise/PM, nicht Learner
- **Hashnode / Dev.to Paid** — Distribution tot
- **Medium Partner / Hackernoon Paid** — Nofollow, low Conversion
- **Spray-Backlink-Farms <DR25** — Google ignoriert seit 2024
- **TikTok Ads ohne Native Content** — 0.2-0.5% Paid-Conversion
- **The Linguist / Steve Kaufmann Paid Placement** — LingQ-direkter-
  Konkurrent, nur Guest-Content statt Sponsor

### 🎯 Strategische Insights (was die Strategie ÄNDERT, nicht „Channel #X")

1. **Reddit organic > alles andere für Niche-Fit-SaaS in 2026.** 40%
   Conversion aus echten Replies vs 0% aus $500 Ads. Eine r/language-
   learning-Chance pro Monat → Build-Story Woche 2, NICHT Launch-Day.

2. **Polyglot-Niche ist underexploited** — alle AI-Tool-Founder
   gehen TLDR/Futurepedia/TAAFT. Niemand pitcht Free Language
   Newsletter, Refold Discord, Langpreneur Podcast. Diese Audience
   zahlt schon $10/mo bei LingQ/Migaku — €9 Lifetime ist ein No-Brainer.

3. **Product Hunt ist Backlink-Event, nicht Launch-Event.** ~5
   Conversions per 100 Upvotes für Niche-Products. DR-80 Backlink +
   Social Proof Trophy. Eine Woche Prep, nicht drei.

4. **15 Directories compound, 300 Directories sind tot.** Google
   ignoriert DR<25. Fokus auf die named DR-30+ Liste die wir haben.

5. **€99 Founder Deal IST Marketing-Currency.** 10-15 Codes als
   Free-Inventory für YouTuber-Affiliate-Stack. Steht in keinem
   Directory. Höchste ROI-Conversion von Catering-Cash-zu-Reichweite.

6. **Recurring Affiliate ≫ Flat Sponsorship** für solo founder.
   $1k flat = 1 Slot. $1k split auf 3 × $200 + 30% recurring =
   3 Slots × 12mo Evergreen-Mentions. Standardrestruktur ab jetzt.

7. **SRS+Anki-Export ist der Moat — IN JEDE COPY.** Jede Directory-
   Description, jede Creator-Pitch-Mail, jede SEO-Page führt mit
   dieser Diff. Kein anderes 2026er Tool hat das.

### ⏭ Was AB JETZT die Reihenfolge ist

**Pre-Launch (diese Woche):**
1. Task #10 — Pro Tier €9/mo in Stripe + /pricing-Page live (🔥
   Blocker für alles, frische Energie morgen früh)
2. Task #11 — Conversion-Tracking installieren (PostHog/Plausible
   Goals)
3. Task #13 — 50 Creator-Notes-Pages programmatisch (SEO-Seed)
4. Task #7 — Reddit-Karma Mi/Do/Fr
5. Task #4 — 8 Free Directories (~3h Block parallel)

**Launch-Woche (Mo 25.5. / Di 26.5.):**
6. Task #5 — Uneed Skip-Line $30
7. Show HN + Product Hunt
8. r/languagelearning Build-Story (NICHT Day-1, sondern Woche 2)

**Woche 2-4:**
9. Task #6 — 3 Creator Affiliate-Deals (Pro-Funnel muss >3% sein
   bevor wir pitchen)
10. Task #8 — TLDR AI booken + 2. Newsletter staggern
11. Task #12 — Anki Add-on Sprint starten

### 📌 Persistent-Notes für nächste Session

- **Pro-Tier-Price ist gesetzt: €9/mo, €72/Jahr.** Nicht erneut
  diskutieren, nur implementieren.
- **SRS+Anki-Export ist DER Moat.** Hauptkommunikations-Hook.
- **3 Creator × $200 + 30% recurring 12mo = $600** = die neue Reach-
  Math. Niemand mehr Flat-Sponsor pre-Launch.
- **Anki Add-on = Sprint nach Launch**, 2 Wochen, höchst-ROI-Build im
  ganzen Backlog.
- **Cluster #2 SEO (Creator-Notes Programmatic) ist der 12-Wochen-
  Compound** der Paid-Acquisition ersetzt wenn Budget durch ist.

— Session-Ende Di 19.5. 16:30. Tomorrow morning fresh: Task #10
(Stripe €9/mo Pro Setup), dann #11, dann #13. Don't burn energy on
docs/tests today — preserved here for resume.
