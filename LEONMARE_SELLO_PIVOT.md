# VOZCLARA SELLO — THE PIVOT (by LEON MARÉ)

> Output of a 24-agent pivot-brainstorm (asset inventory ×2, EU-2026
> research ×5, product concepts ×7, judge panel ×8, master synthesis,
> red-team). ~2.2M tokens, June 2026. Code verified against the repo,
> not the docs.
>
> This is the **synthesis tempered by the red-team** (which graded the
> first-pass plan B / "Conditional GO" and cut the fantasy numbers).
> Where they disagreed, the red-team won.

---

## 0 · The decision in one paragraph

The original VozClara is dead — NotebookLM does generic YouTube
summary free, in 80+ languages, cross-lingual, with a mobile app.
**The pivot: VozClara Sello — the sovereign, multilingual AI-Act
compliance evidence layer for European creative/marketing agencies.**
On **2 August 2026** the EU AI Act Article 50 goes live: every
business publishing AI content or running a chatbot owes a label, a
disclosure, and an inspection-ready audit trail — **no SME exemption,
fines to €15M / 3% of turnover.** Nobody owns the *runtime* workflow:
existing tools make one-time classification PDFs, NotebookLM
structurally can't act, and **a US company can never credibly promise
the audit trail stays under EU jurisdiction (CLOUD Act / FISA 702).**
That last fact is the moat — and it's the one thing a solo EU founder
can hold that Google and OpenAI cannot.

**But the honest version is smaller and harder than the pitch:** the
only buyer who actually feels the pain is the **agency** (exposed
across 10-50 clients), not the 4-person salon. Realistic 18-month
outcome is **€60-180k ARR if the agency channel fires, €0 if it
doesn't** — a real cash business, not the seven-figure projection.
And the three things that ARE the product (recurring billing, the
tamper-evident ledger, EU inference) are **0% built today.**

---

## 1 · The product — VozClara Sello

A compliance-**runtime** product, four deterministic verbs:

1. **MARK** — at publish time, insert the correct human-readable AI
   label in the right language ("Generado con IA · KI-generiert ·
   AI-generated") + the Article 50 wording; auto-inject the chatbot
   disclosure where a bot is detected without one.
2. **LOG** — every marked artifact writes an **immutable,
   hash-chained, append-only, EU-resident** audit line (tool, model,
   version, prompt source, human reviewer, date, language) to a D1
   ledger. Genuinely tamper-evident — *not* today's inline
   `watermark:'vozclara.app'` string.
3. **PROVE** — one click exports an inspection-ready PDF "transparency
   folder" per period + a live dashboard.
4. **CERTIFY** — bundled Article 4 AI-literacy micro-course issues
   **dated, signed per-learner certificates** (the *second* live,
   no-exemption obligation — a cleaner recurring hook that survives
   even soft Art-50 enforcement).

**Magic moment:** an operator publishes an AI-assisted post, watches
Sello stamp the label and seal the ledger line in real time, then a
week later exports a bound creme "transparency folder" + a stack of
dated staff certificates — proof they could hand an inspector
tomorrow without panic. *Proof, made visible.*

Human-approve-before-publish review step (so labelling is a trust
moment, not an automation the operator distrusts).

---

## 2 · The red-team's sharpening — READ THIS, it changes the plan

The panel scored Sello #1 (72/100). The red-team held it to **B
(~70)** and cut it to a sharper, smaller, more certain shape. The
corrections are not optional — they are the difference between a cash
business and another beautifully-built thing nobody pays for.

| The pitch said | The truth (red-team, verified in code) |
|---|---|
| "Forced buyer, no SME exemption" → 2,800 self-serve SMBs = €2M ARR | The 4-person salon **rationally never buys** (no inspector will reach it). Self-serve €29/€79 path is **fiction**. Only the **agency** is a real forced buyer (exposed across many clients). |
| "~85% margin from day one, reuses what's built" | The easy parts (MCP, export engine, i18n, Paddle scaffold) transfer. **The three things that ARE the product — recurring billing, the hash-chained ledger, EU inference — are 0% built** and are the hardest, highest-liability work. |
| "EU-sovereign moat" | **Currently FALSE.** Everything runs on Cloudflare Workers-AI + Anthropic-via-Gateway (CLOUD-Act exposed). Shipping the claim before EU-inference migration = a fatal *second* marketing-vs-code lie on a trust product. |
| "€1M ARR / 330 agencies" | Realistic 18-month: **€60-180k ARR if the agency channel converts, €0 if not.** A €150-400k cash business sold to 50-150 agencies is the honest ceiling. |
| Asset reuse covers it | Channel sales to agencies is a motion **Christian has never run** — and it's the single largest determinant of revenue. |

### The sharper bet (this is the plan)

1. **Kill the self-serve Solo/Studio tiers at launch.** One price:
   **Agency €249/mo.** Sell to agencies only.
2. **Re-anchor away from "labelling" toward "PROVE + CERTIFY."** A CMS
   (Shopify/Canva/WordPress) will bundle a free "Generated with AI"
   label and gut the MARK verb — the *same free-default dynamic that
   killed the consumer wedge.* The **ledger + the dated literacy
   certificate are the un-bundleable core.** Lead with: *"a named,
   dated, signed, tamper-evident record proving who approved what AI
   content when — exportable to hand an inspector or a client's
   lawyer."*
3. **GATE EVERYTHING on one brutal milestone:** one genuinely
   **arm's-length** DACH or ES agency signs a **paid** (not free)
   pilot off a **one-page mock** — *before a single line of ledger
   code.* If no agency will pay for a slide, the finished product
   won't sell either. (Christian has exactly **one** arm's-length
   reference today — Arepas Pa ti Pa mi; Colmena and Claritas/catering
   are related-party and worthless as trust logos.)
4. **Build order, non-negotiable:** EU inference migration FIRST (make
   the one brand-killing claim true) → recurring Paddle + metering
   (so you can charge) → the ledger → the literacy cert. **Nothing
   else** — no chatbot detection, no C2PA, no WordPress/Shopify
   snippet, no white-label — until the first agency is live and
   paying.

---

## 3 · Naming & brand — zero net-new identity

**Keep both names. Add a sub-brand. Do not rebrand the studio.**

- **LEON MARÉ** stays the multi-venture parent (brass-diamond mark,
  on contracts/press/outbound).
- Product: **"VozClara Sello by LEON MARÉ"** → "VozClara Sello" → "Sello".
- The naming is self-justifying: **Sello = seal/stamp** in ES/PT,
  which *is* the product, and it maps onto the **lighthouse-seal
  product mark already in BRAND.md** — brand metaphor, product name,
  and existing visual identity collapse into one with **zero net-new
  design work.**
- "VozClara" = "clear voice" re-cast as the multilingual legal-wording
  layer (the correct label/disclosure voice in ES/PT/DE/EN).
- Surface: **leonmare.de/sello** (or sello.leonmare.de).

---

## 4 · Design direction (for the visual identity)

**Concept: "the lighthouse seal pressed into wax — proof, made
visible."** A trust instrument that feels like a 20th-century European
notarial house, not an SMB SaaS dashboard.

- **Palette** (verbatim from `tailwind.config.ts`): LEON-NAVY `#0A1A3A`
  ground · CREME `#F7F3EC` paper · LEON-GOLD `#C9A24B` seal/foil ·
  GOLD-DEEP `#8C6F2A` text-on-creme · GRAPHIT `#1A1A1A` body. One
  restrained verification-green only in the live ledger status chip.
- **Type:** Cormorant Garamond display/wordmark (inscriptional,
  editorial); Inter for UI + 4 locales.
- **Motifs:** the lighthouse seal re-read as a **wax/foil compliance
  seal**; a faint **guilloché / engraved-banknote** security pattern
  behind hero panels; a vertical **ledger** motif of fine horizontal
  rules like a bound register; navy-to-deeper-navy gradient like deep
  water lit by a single beam.
- **UI feel:** an editorial *document* surface, not a console — a
  bound creme "transparency folder" with gold tab dividers; an
  append-only ledger rendered as a register of dated sealed lines,
  each with a tiny embossed gold seal glyph.
- **Hero:** a brass lighthouse seal striking into warm wax on creme
  paper, the beam becoming a gold underline beneath *"Generado con IA
  · KI-generiert · AI-generated"*, navy deep-water field behind —
  one image saying label + proof + EU-sovereign + multilingual at once.

---

## 5 · What to reuse / rebuild / kill (verified in code)

**REUSE (transfers cleanly):**
- Production OAuth 2.1/PKCE MCP server → becomes the publish-time
  integration layer
- Real `.apkg`/SQLite/JSZip export engine → repoints to the
  transparency-folder PDF + signed certificates
- 41KB 4-locale i18n → per-locale legal label + Art-50 disclosure +
  course copy
- Signature-verified Paddle MoR webhook scaffold → extend to
  subscriptions
- Cloudflare Workers/Pages/KV/**D1** edge chassis — **app/edge only,
  EU-region-pinned for the ledger** (NOT inference)
- LEON MARÉ design system + lighthouse-seal mark — the seal IS the
  product

**REBUILD (the actual product — 0% today):**
- Recurring Paddle `subscription.*` handlers (today: one-time
  `FOUNDER_PRICE_ID` only)
- Server-side per-workspace quota + artifact metering (today: a doc
  comment, not code)
- **The hash-chained, append-only, EU-pinned D1 audit ledger** (today:
  an inline `provenance` object — this is the moat, build it real)
- **EU-incorporated inference** (Mistral / Scaleway / OVHcloud) —
  migrate off Cloudflare-AI/Anthropic-Gateway so the sovereignty claim
  is TRUE
- Repoint MCP tools from read/generative → publish-time actions
  (label, disclose, log, export, issue-cert) with a human-approval
  write-gate

**KILL:**
- The entire B2C YouTube→Knowledge-Pack surface, public-pack SEO
  flywheel, €99 Founder Deal framing (dead + legally exposed)
- Marketing-vs-code debt: "FSRS" (it's SM-2), "lenses" (don't exist),
  free Lingva dependency
- SRS/flashcard/shadowing/rating mechanics + consumer retention nudge
  stack
- Sample/curated consumer content (~85KB ballast)

---

## 6 · Business model (honest version)

- **One launch price: Agency €249/mo** (multi-client workspaces,
  per-client white-label labels + transparency folders, MCP/API).
  Add Agency Plus €349-499 at 25+ clients later. Self-serve tiers
  deferred until the channel is proven.
- **Margin ~85%** — marking/logging/cert-issuing are deterministic;
  LLM only fires on per-locale wording (cached, regen on law change) +
  course content. EU inference is cheap at this call volume.
- **Billed via Paddle MoR** — EU VAT handled, DACH + LATAM
  cross-border out of the box.
- **Honest ceiling: €150-400k ARR, 50-150 agencies.** A real cash
  business. Not a unicorn — the correct ambition for this founder,
  window, and asset base.
- Why it makes real money: budget-owning buyer (not a consumer
  wallet), stateful obligation (real retention in the >€50/mo band),
  B2B2B expansion (one agency = many client workspaces).

---

## 7 · 90-day plan (red-team build order)

**Days 0-30 — Sell + spine.**
- 8-10 discovery calls; **prioritise 4-5 arm's-length DACH/ES
  agencies** (warm SMBs = dogfood only). Script: *"Show me the last 5
  AI things you published. Who labelled them? Could you prove to an
  inspector what was AI-made, by whom, when?"* — listen for panic + WTP.
- **One arm's-length agency signs a PAID pilot off a one-page mock**
  (the walk-away gate).
- EU-incorporated inference live (Mistral/Scaleway) for all wording.
- Recurring Paddle subscription handlers + server-side quota/metering.
- Hash-chained, EU-pinned D1 ledger + verification routine.
- Public architecture/honesty note documenting the EU-only path.

**Days 30-60 — Smallest sellable loop.**
- Website-chatbot widget + publish-time snippet that detects an
  undisclosed chatbot and injects the Art-50 disclosure.
- Per-locale lawyer-reviewed labels (ES/DE/EN; PT fast-follow).
- One-click PDF transparency-folder export (off the sql.js/JSZip
  engine).
- Art-4 literacy micro-course + dated signed certificate.
- Human-approve-before-publish review step.

**Days 60-90 — Channel + first revenue.**
- Agency multi-client workspaces + per-client white-label (the €249
  hero tier).
- Repointed MCP publish-time tools.
- First 3-5 paying agencies live on recurring Paddle, metered.
- `leonmare.de/sello` brand surface (wax-seal hero, sample folder,
  sample certificate).
- DEFERRED to v1.1+: C2PA, FR/IT/PL packs, the Akten
  training-from-recordings module.

---

## 8 · Risks (ranked)

1. **Distribution against soft felt-pain** — the agency channel is the
   only real path and Christian has never run channel sales. *Mitig:
   sign 2-3 agency design partners before broad build; literacy cert
   as the recurring hook that survives soft enforcement.*
2. **Sovereignty-claim honesty debt (existential)** — the moat is EU
   jurisdiction; the stack is currently 100% US-cloud. *Mitig: EU
   inference migration BEFORE any sovereignty marketing. Non-negotiable.*
3. **Platform bundling** — Shopify/Canva/WordPress ship free AI labels
   → guts MARK. *Mitig: lead with PROVE + CERTIFY (un-bundleable),
   treat the label as a feature.*
4. **Agency liability-transfer objection** — an agency may not want to
   become the accountable party. *Mitig: frame as "evidence that
   protects you," never "we make your clients compliant."*
5. **Regulatory goalposts move** (Digital Omnibus already softened the
   adjacent high-risk lane). *Mitig: the ledger + literacy cert retain
   value regardless of Art-50 enforcement intensity.*
6. **Legal-positioning liability** — *hard copy rule from day one:
   "evidence tooling, never legal advice or certification."*
7. **Related-party reference thinness** — one arm's-length logo today.
   *The walk-away gate exists precisely for this.*
8. **Solo-founder scope creep** — MVP is label + disclosure injection
   + ledger + cert ONLY.

---

## 9 · Walk-away condition (in ink)

> If by **Day 60** Christian has NOT secured at least **3 paid LOIs of
> which ≥1 is genuinely arm's-length** (not Colmena, not
> Claritas/catering, not family) → **stop building breadth**; either
> hard-pivot to the runner-up (VozClara Pflege — multilingual
> migrant-care-worker documentation, attacking voize's German-only
> flank) or shelve.
>
> And: **ship no "EU-sovereign" claim until inference verifiably runs
> on an EU-incorporated provider.** A second marketing-vs-code lie on
> a trust product is fatal.

---

## 10 · First two weeks

- **Day 1-3:** 8-10 discovery calls, prioritise arm's-length agencies.
  Listen, don't pitch.
- **Day 3-5:** honest capability sheet (what's built vs 0%-built) +
  pin the walk-away gate.
- **Day 5-8:** lock the EU-inference decision (Mistral + Scaleway
  accounts, run the wording prompts, write the public architecture
  note).
- **Day 6-9:** confirm "VozClara Sello" sub-brand + leonmare.de/sello
  + the "evidence tooling, not legal advice" disclaimer; line up an
  AI-Act-literate lawyer/gestoría for the wording templates.
- **Day 9-12:** spike the **hash-chained D1 ledger** (schema: id,
  prev_hash, hash, actor, surface, model, version, language, action,
  timestamp) + verification routine + one-click PDF export.
- **Day 12-14:** build the LOI artifact (wax-seal hero + sample
  transparency folder + sample certificate) + the €249 Agency LOI;
  take it to the 2-3 warmest arm's-length agencies and **ask for a
  signed paid pilot.** Do NOT build the funnel or C2PA until one signs.

---

## 11 · The honest bottom line (red-team, DE)

> Bauen — ja. Aber als kleines, hässliches, kanalgetriebenes
> Cash-Geschäft, nicht als das Siebenstellige, das der erste Plan dir
> verspricht. Der Käufer ist real (ein Unternehmen mit Budget, nicht
> eine Konsumenten-Brieftasche), die Pflicht ist zustandsbehaftet
> (echte Retention), die Marge ist hoch (deterministisch). ABER: der
> „forced buyer" ist auf SMB-Ebene eine Illusion — nur die **Agentur**
> kauft wirklich, und genau diesen Vertrieb hast du noch nie gemacht.
> Die drei Dinge, die das Produkt ausmachen, sind heute 0% gebaut, und
> die Souveränitäts-Behauptung ist aktuell falsch.
>
> **Das eine, was zählt:** Schreibe keine Zeile Ledger-Code, bevor
> EINE echte, nicht-verwandte Agentur einen BEZAHLTEN Piloten auf eine
> Mock-Seite hin unterschrieben hat. **Verkaufe zuerst, baue danach.**
> Zahlt keine fremde Agentur für eine Folie, wird auch das fertige
> Produkt niemand kaufen — dann sofort stoppen.

---

*Full 24-agent evidence (7 concepts, scores, ranking, synthesis,
red-team) in the session transcript, June 2026. Today is June 2026;
model cutoff Jan 2026 — re-verify the Art-50 timeline, the Digital
Omnibus status, and competitor moves before committing.*
