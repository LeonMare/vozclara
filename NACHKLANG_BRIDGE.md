# NACHKLANG — monetize the VozClara engine now (the bridge)

> 5th-brainstorm convergence (16 agents this round). The question:
> what monetizes the EXISTING VozClara engine fast, via LEON MARÉ
> strengths, in front of the separate Manufaktur/MARGEMACHER track.
> Pick tempered by the red-team (B− — "pursue, but stop calling it a
> product"). This is the honest version.

---

## 0 · The pick

**NACHKLANG — a premium multilingual event-recap dossier (Studio by
LEON MARÉ).** For every premium event LEON MARÉ caters, the existing
VozClara engine turns the agenda + speaker decks + transcript into a
**designed DE/EN/ES/PT recap** — exec summary, speaker pull-quote
cards, key takeaways, glossary, LinkedIn share-cards, and a board-ready
PDF — delivered within ~48h, sold as a Studio editorial Werkstück on
top of a catering booking LEON MARÉ has **already won**.

Five of six concepts converged here. It's the fastest first euro
because it sells warm onto an existing relationship (the caterer is
on-site and trusted), it's firewall-safe (sells *design/editorial*,
not an AI-competence claim), and it reuses the verified engine
near-verbatim.

- **Per-event:** €1,200-3,500 (tiered by talks + languages)
- **Retainer ("Event-Content-Flat"):** €1,490-2,900/mo for recurring hosts
- **COGS <5%** (Llama floor / Sonnet premium + 70% prompt-cache)

---

## 1 · The honest tension (this is the real message)

You said you want a **scalable SaaS/tool**, not a service. The brutal
truth the red-team confirmed in code: **the fastest money from the
VozClara engine via your warm channel is a productized SERVICE, not a
SaaS.** NACHKLANG's marginal unit is *your hours* (48h SLA + human QA),
not server cost. That's consulting/agency work with an LLM inside.

There is no clean "fast + scalable-SaaS + engine-reuse + low-
competition" answer — the engine's best fast-money use is a high-touch
premium Studio Werkstück. The truest *SaaS* reuse (runner-up below) is
slower and thinner.

**So this is a genuine fork, and it's yours to make:**

| If your priority is… | Then build… |
|---|---|
| **Fast cash + your first arm's-length reference** (to fund Manufaktur) | **NACHKLANG** — accept it's a productized Studio service / bridge, not the destination |
| **A true scalable SaaS from the engine, even if slower** | **Lingua MCP** (runner-up) — a private per-tenant multilingual editorial MCP endpoint, €290-1,990/mo |

My honest recommendation: **NACHKLANG as the bridge.** It fits your
real Studio "Werkstück" model, it's the fastest euro, and — most
importantly — it attacks your single biggest strategic bottleneck:
**you have exactly ONE arm's-length paid reference ever** (Arepas;
Colmena/catering are related-party and worthless as trust logos). One
published NACHKLANG case study from a real Flow-the-Kitchen corporate
event breaks that deadlock and de-risks everything else, Manufaktur
included. Treat it as the bridge that funds the SaaS — not the SaaS.

---

## 2 · The red-team's three code-honest corrections

1. **The named PDF dossier does NOT exist in the codebase.** The worker
   emits only JSON + SVG cards + Markdown/.apkg — `index.ts:2360` ("no
   satori, no resvg-wasm"), `export.ts` knows only `markdown`|`text`.
   The bound multi-page PDF is the **one real build** — and it's the
   demo that closes the deal. **So build the PDF renderer FIRST**; the
   plan's "dogfood in week 1" is backwards from its own dependency
   graph.
2. **No recurring billing.** Paddle is wired only for the €99 one-time
   Founder Deal — no subscription webhook anywhere. Per-event + retainer
   both invoice as manual B2B for now (fine for high-ticket). The
   "recurring spine" is an earned upsell, not a launch feature.
3. **The first sale must be arm's-length BY CONSTRUCTION.** Pre-select
   ONE Flow-the-Kitchen corporate/Messe booking and secure the
   publish-as-case-study + content/recording-rights clause **in writing
   before building the sample.** A related-party first sale produces
   zero usable proof — and proof is the whole reason to do this.

---

## 3 · What's reused as-is vs the one build (verified in code)

**Reused verbatim:** arbitrary-transcript ingest (`/api/insights`
`{transcript, sourceLang, targetLang}` — not YouTube-locked) · cross-
lingual DE/EN/ES/PT default · `season-pack.ts` cross-synthesis (collapses
N talks into one artefact, ~$0.75/pack) · the 3 SVG card renderers
(navy/gold/creme baked in) · tier routing Llama/Sonnet + 70% cache
(<5% COGS) · `.apkg`/Obsidian/Markdown export.

**The one real build (days, not a rebuild):** a **print-CSS / HTML-to-
PDF dossier renderer** in the LEON MARÉ system (designed cover, exec-
summary page, quote-card pages, glossary, provenance footer) wrapping
the existing season-pack JSON + SVG cards.

**New only if needed:** event-AUDIO ingest needs ASR (none in code) —
v1 sidesteps it by ingesting agenda + decks + provided transcripts,
which the engine already accepts.

---

## 4 · Re-sequenced plan (red-team's dependency order)

| Window | Do |
|---|---|
| **Week 1** | Build the **PDF dossier renderer** (the gating task). Write the recap-specific Lens/system prompt. Run ONE past LEON MARÉ event through the engine to validate output. |
| **Week 1-2** | Ship a narrowed **"NACHKLANG Cards"** SKU (DE/EN/ES/PT pull-quote + OG cards + Markdown recap, €600-1,200) — sellable *today* while the dossier renderer lands. Then 2-3 polished sample **dossiers** as the sales artefact. |
| **Week 2-3** | Pre-secure ONE **arm's-length Flow-the-Kitchen** corporate/Messe booking + case-study/rights clause **in writing**. |
| **Week 3-4** | Pitch NACHKLANG as a €1,200-3,500 line item on that event, finished sample as the demo. Deliver <48h. Capture the case study. |
| **Week 5-8** | Convert one host to the retainer; cap at **2 concurrent events**, budget **3-4h QA/dossier** (board-facing — a bad quote-card kills the premium frame). Optional: wire Paddle `subscription.*`. |

---

## 5 · Competition (honest)

- **Race to zero (don't frame here):** NotebookLM, Castmagic $23,
  Podsqueeze $8.99, Distill $19-49 — self-serve summarisers.
- **Adjacent but different:** premium event-recap is a real $1-7k/event
  market owned by **video** shops (Tally, FireBrand) + experiential
  agencies (Mariko, from €3k/mo) — **none ship a designed multilingual
  editorial-TEXT dossier in DE/EN/ES/PT**. Frankfurt's made.io is
  text-only, no designed export, no real ES/PT.
- **The real competitor** is the host doing nothing / a junior writing
  one English LinkedIn post — and your own arm's-length-reference
  deadlock.

The designed + 4-language + 48h + delivered-by-the-caterer-on-site
combination is genuinely unowned whitespace.

---

## 6 · Runner-up: Lingua MCP (the true-SaaS fork)

A private, brand-skinned per-tenant **multilingual editorial MCP
endpoint** (the shipped OAuth 2.1/PKCE MCP server, brainId-scoped
Vectorize) sold €290-1,990/mo into the warm Consulting channel — a
firm's own Claude/Cursor stack calls it to turn any source into a
designed DE/EN/ES/PT artefact. **Truest SaaS reuse** (the rarest shipped
asset) but: thin 2026 buyer pool (few warm clients run MCP-consuming
agent stacks), no on-site warm trigger, no recurring billing wired. A
strong **parallel boutique line**, not the fastest first euro.

---

## 7 · Naming + the kill-criterion

**NACHKLANG** (Studio by LEON MARÉ) — German, "the resonance/afterglow
of an event," reads editorial not software, firewall-safe, no "AI" in
the customer-facing name. SKUs: *NACHKLANG Cards* (entry), *NACHKLANG
Dossier* (core), *Event-Content-Flat* (retainer), *NACHKLANG Archiv*
(later RAG add-on).

**Kill-criterion (red-team):** if NACHKLANG consumes **>40% of your
build hours for two months**, it's cannibalizing the destination
(Manufaktur). It is the bridge, not the building.

---

*Full evidence (2 fit-research, 6 concepts, scores, pick, red-team B−)
in the session transcript, June 2026. The "PDF dossier doesn't exist
yet" finding is load-bearing — verify against the repo before pitching
the artefact as ready.*
