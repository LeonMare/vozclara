# PRESS KIT — VozClara × LEON MARÉ

> Single-source-of-truth for everything a journalist, newsletter
> editor, podcast booker, directory-curator, or partner asks for.
> Copy-paste from here. Don't improvise — consistency is the brand.
>
> Updated: Do 21.5.2026

---

## 1 · Quick Facts

| Field | Value |
|---|---|
| **Product** | VozClara |
| **Studio** | LEON MARÉ |
| **Tagline (short)** | Knowledge layer over every video you watch. |
| **Tagline (long)** | Multilingual YouTube → Knowledge Pack. Editorial-first. Cross-lingual. MCP-callable. |
| **Founded** | 2025 |
| **Location** | Frankfurt am Main, Germany |
| **Team** | 1 (solo, by design) |
| **Founder** | Christian José Gulm |
| **Stack** | Cloudflare Workers · Pages · KV · D1 · Vectorize · Anthropic Sonnet 4.5 · Workers AI Llama 3.3 70B · Paddle (MoR) |
| **Stage** | Pre-launch (public launch Woche 3, Mai 2026) |
| **Pricing** | Free forever (current). Pro tier 9 €/mo + Pro Plus 19 €/mo arriving when app is mature. Founder Deal: 99 € once → Pro Plus forever (100 seats). |
| **Languages** | Spanish · Portuguese · German · English (output, any input language) |
| **Website** | https://vozclara.app |
| **MCP Server** | https://smithery.ai/server/salvador7eon/vozclara |
| **GitHub** | https://github.com/LeonMare/vozclara |
| **Studio site** | https://leonmare.de |

---

## 2 · Product Boilerplate (drei Längen, ready-to-paste)

### 2.1 · 50-Wort-Version (X bio, directory listings, podcast intro)

```
VozClara turns any YouTube video into a structured Knowledge Pack —
summary, key ideas, glossary, quiz — across Spanish, Portuguese,
German, and English. Editorial-first, cross-lingual, MCP-callable
from Claude / Cursor. Built solo under the LEON MARÉ studio in
Frankfurt.
```

### 2.2 · 150-Wort-Version (LinkedIn About, About-Sektion, Newsletter-Pitches)

```
VozClara is a multilingual YouTube-to-Knowledge-Pack tool. Paste a
URL — in any language — and get back a structured artefact: editorial
summary, 5–7 key ideas, glossary, quiz, inline timestamp citations
that link back to the source moment. Four output languages out of
the box: Spanish, Portuguese, German, English. Cross-lingual is the
default, not a feature — generate a German pack from a Spanish video.

Anki-compatible export with FSRS scheduling. MCP-callable from
Claude Code, Cursor, Windsurf, and any agent that speaks Model
Context Protocol. EU AI Act Art 50 compliant, GDPR Art 17 enforced
in code, cookieless analytics.

Built solo by Christian José Gulm in Frankfurt under the LEON MARÉ
studio. Editorial-first product DNA — the brand vocabulary borrows
from twentieth-century European publishing because the problem
(retaining ideas from videos watched once) is older than the
internet.
```

### 2.3 · 300-Wort-Version (Press release, long-form newsletter, podcast prep)

```
VozClara is a multilingual knowledge tool for the videos we watch
once and rarely revisit. It turns any YouTube URL — Spanish,
Portuguese, German, English, or any input language — into a
structured Knowledge Pack: editorial summary, five to seven key
ideas, a working glossary, quiz cards with FSRS-scheduled review,
and inline timestamp citations that link back to the source moment
of every claim.

The pack is yours; the original is one click away. The kind of
artefact a Sunday-magazine editor would produce, except generated
in thirty seconds and re-readable in ninety.

Three things make VozClara different from the existing video-
summary category. First, cross-lingual generation is the default,
not a feature — paste an English Huberman episode and ask for a
German pack with Spanish glossary, get it. Second, the MCP server
(published on Smithery) lets Claude Code, Cursor, Windsurf, and any
agent that speaks Model Context Protocol call VozClara natively —
no copy-paste, no glue code. Third, the Pro Plus tier upgrades the
generation pipeline to Claude Sonnet 4.5 via the Cloudflare AI
Gateway, with the extended-thinking reasoning trace streamed back
as its own UI region. Manus-style — but for content.

Compliance and privacy are built in, not bolted on. EU AI Act Art 50
disclosure appears at first pack-generate. GDPR Art 17 deletion is
enforced in the worker, not just documented. Cookieless analytics
via Plausible. No browser SDK that could leak user content.

Built solo by Christian José Gulm in Frankfurt under the LEON MARÉ
studio. Editorial-first product DNA — the visual register borrows
from twentieth-century European publishing. The studio works out
loud, in public, on GitHub.
```

---

## 3 · Founder Bio (drei Längen)

### 3.1 · 30 Wörter (X bio, byline)

```
Christian José Gulm — solo founder building VozClara at the LEON
MARÉ studio in Frankfurt. Editorial-first tools at the intersection
of language, memory, and the videos we watch.
```

### 3.2 · 100 Wörter (LinkedIn About, podcast-intro)

```
Christian José Gulm is a solo founder building VozClara at the LEON
MARÉ studio in Frankfurt. He works at the intersection of language,
memory, and the videos we watch — building tools that treat
multilingual knowledge as an editorial problem, not a translation
problem. Currently shipping VozClara end-to-end: product, brand,
backend, MCP layer, distribution. Works in public on GitHub and
writes the rare honest postmortem when something breaks in
production. Based in Frankfurt, working across Spanish, Portuguese,
German, and English.
```

### 3.3 · 250 Wörter (long-form interview prep, press feature)

Available on request. Don't paste a long bio anywhere — it reads as
performance. The 100-word version is the ceiling for almost every
use case.

---

## 4 · Brand Assets (Pfade im Repo)

| Asset | Pfad | Notes |
|---|---|---|
| **Lighthouse Glyph (primary mark)** | `public/brand-mark.svg` | SVG, navy on transparent. Use for profile pictures everywhere. |
| **Wordmark** | TBD — needs vectorising from Cormorant Garamond „LEON MARÉ" | Use Cormorant Garamond Italic, navy, letter-spacing 0.05em |
| **OG Image** | `public/og-image.png` | 1200×630, current redesign with eyebrow + sub-claim + lang strip |
| **Apple Touch Icon** | `public/apple-touch-icon.png` | 180×180 |
| **Favicon** | `public/favicon.svg` + `public/favicon.ico` | — |
| **Sample Pack screenshot** | Capture from `https://vozclara.app/pack/sample-learn` | Use Safari + 1× pixel density, 1440×900 viewport |
| **Generator screenshot** | Capture from `https://vozclara.app/new` after pasting a Huberman URL | Show the streaming token reveal mid-generation |
| **MCP-in-action screenshot** | Claude Code calling `vozclara_generate_pack` | See Smithery page for canonical version |

### Color Palette (hex)

| Color | Hex | Usage |
|---|---|---|
| Navy | `#0E1B33` | Primary, body text, brand mark |
| Gold | `#B89546` | Accent, rules, brand ornament |
| Gold-deep | `#8E6F2D` | Eyebrows, secondary accent |
| Creme | `#F5EFE3` | Background, paper feel |
| Graphit | `#3A3A38` | Secondary body text |

### Typography

| Use | Font | Weight |
|---|---|---|
| Display / serif headlines | Cormorant Garamond | 400 italic for taglines, 500 for headlines |
| Body / UI | Inter | 400 regular, 500 medium |
| Per-language display (es/pt/de/en) | CSS variable `--font-display-locale` | See `src/styles/fonts.css` |

---

## 5 · Key Product Facts (für Feature-Listings / Direktorien)

Use this list when filling out a directory submission. Pick the
3–5 most relevant per directory.

- **Cross-lingual by default**: 4 output languages (ES/PT/DE/EN) ×
  any input language
- **Modes**: Learn (language) · Briefing (executive) · Study
  (academic) · Creator (content production)
- **Structured outputs**: editorial summary · 5–7 key ideas · glossary ·
  quiz · timestamped chapters · action plan · pull-quotes
- **Inline `[mm:ss]` timestamp citations** with click-to-seek + hover
  transcript preview
- **Anki export** with FSRS scheduling (not SM-2)
- **Editorial pack covers** designed per genre + mode + language
- **MCP server** on Smithery — Claude / Cursor / Windsurf compatible
- **Pro Plus tier**: Claude Sonnet 4.5 with extended-thinking
  reasoning trace as separate UI region
- **Account-less first pack** — no signup required to generate
- **Local-first storage** — packs live in IndexedDB; sync optional
  via account
- **EU AI Act Art 50** disclosure built in
- **GDPR Art 17** account deletion enforced in code
- **Cookieless analytics** via Plausible
- **No browser tracking SDK** — server-side error logging only
- **Open source** — full repo on GitHub
- **Built solo, in public** — weekly studio notes, honest postmortems

---

## 6 · Quotes (attributable to Christian)

Three pre-approved quotes for press / newsletter / podcast use.
Use as-is or pick fragments.

### On the problem

> „The thing we actually have is a memory problem. You watch a
> Huberman episode and three weeks later you remember it was good
> but not what it said. Transcripts don't fix that — they just give
> you a longer version of the thing you forgot. We're building the
> editorial layer that sits on top." — Christian José Gulm, LEON MARÉ

### On the multilingual default

> „Treating cross-lingual as a feature is how every existing tool in
> this space got the architecture wrong. If your model has to think
> about the source language as a separate variable, you've already
> lost the people in Lisbon trying to learn from an English video.
> Cross-lingual has to be the default — everything else is a
> regression." — Christian José Gulm

### On building solo

> „Solo isn't a constraint, it's a design choice. Every additional
> hand adds a layer of coordination that's hostile to editorial
> coherence. The reason VozClara reads as one designed thing is
> that one person designed it. The reason it ships fast is the
> same reason." — Christian José Gulm

---

## 7 · Contact

| Purpose | Where |
|---|---|
| **Press / interview** | `vozclara@leonmare.de` (Subject: PRESS — your-publication) |
| **Partnership / integration** | `vozclara@leonmare.de` (Subject: PARTNERSHIP — your-company) |
| **Product support** | `hola@vozclara.app` |
| **General / studio** | `hello@leonmare.de` |

Typical response time: 24h business hours. We're in CET (UTC+1 /
UTC+2).

---

## 8 · Social

| Platform | Handle |
|---|---|
| Instagram | `@leonmaregroup` — *live* |
| TikTok | `@leonmaregroup` — *live* |
| X / Twitter | `@leonmaregroup` — *zu erstellen, Setup-Block in SOCIAL_PLAYBOOK §1 A* |
| LinkedIn (Company) | `linkedin.com/company/leonmaregroup` — *zu erstellen* |
| LinkedIn (Personal) | Christian José Gulm — *zu aktualisieren* |
| YouTube | `@leonmaregroup` — *zu erstellen* |
| Reddit | Existing Christian-Karma-Account (not brand-named, by design) |
| Discord | Existing community server |

---

## 9 · Anti-Patterns (was wir NICHT sind, falls gefragt)

- **Not** a YouTube transcript tool
- **Not** an AI summarisation widget
- **Not** a Chrome extension
- **Not** a Notion plugin
- **Not** a Spaced-repetition app (we export to one — Anki — that
  already exists)
- **Not** a language-learning app like Duolingo (different category)
- **Not** „ChatGPT for YouTube"
- **Not** a transcription service
- **Not** investor-backed (solo + bootstrapped, by design)

If a journalist needs a category label, the closest is „multilingual
knowledge management" or „editorial AI tool". „Cross-lingual
knowledge layer" is the phrase we prefer in our own writing.

---

*This kit is a living document. When something changes (pricing,
feature, founder bio), update it here first, then everywhere else
quotes it. Single source of truth.*
