# BRAND.md — VozClara brand architecture, naming conflict, trademark plan

> Single-page brand contract. Anything that touches positioning,
> wordmark, or visual marks references this file. Updated Do 28.5.2026
> after the design audit surfaced two blind spots (the voz-clara.com
> namesconflict and the three-mark coordination question).

---

## 1. Brand layers

VozClara operates inside the LEON MARÉ parent brand. The layering is
deliberate — different audiences see different surfaces:

| Layer | Surface | Audience |
|---|---|---|
| **LEON MARÉ** | Parent brand, signature on press / contracts / outbound emails | Investors, press, partners |
| **VozClara** | Consumer product name on vozclara.app, App Store / Play listings | Language learners, students, knowledge workers |
| **VozClara MCP** | Developer-facing surface at vozclara.app/api/mcp and Glama / Smithery / awesome-mcp-servers | AI engineers, Claude / Cursor users |

The product is always **VozClara by LEON MARÉ** in disambiguated
contexts (social share cards, About page, footer colophon). When a
surface is unambiguously inside the consumer product (Hero, in-app
copy, generator) the LEON MARÉ attribution can drop — it would read
as belt-and-suspenders.

## 2. Visual marks — what each one means

Three marks live in the system. They are NOT redundant; each maps to
a brand layer.

| Mark | Stands for | Where it lives |
|---|---|---|
| **Lighthouse seal** | The VozClara product mark — "voz clara" = clear voice = a signal cutting through dark water. | `/og-image.png`, `/og-founder.png`, FounderNote BrandMark, LandingFooter, app icons |
| **Brass diamond** | The LEON MARÉ parent-brand mark — a single faceted ornament that catches light. Appears as a brand-reveal / closing-card moment. | Higgsfield campaign library, brand films, future LEON MARÉ ventures (e.g. catering studio) |
| **VC monogram** | The combined product+parent glyph for tight app-icon contexts where neither full mark fits. | MCP icon (`/public/mcp-icon.png`), Smithery listing, future PWA icons |

The trinity is intentional. Decision rule: at every surface, ask
"which layer am I representing?" then pick the matching mark. Do not
mix two marks on the same surface unless you are explicitly doing a
co-brand moment.

## 3. The voz-clara.com naming conflict

Discovered during the design audit Do 28.5.2026.

**Their product:** AI voice transcription via WhatsApp / Telegram for
doctors / lawyers / therapists. Audio-to-text in 99 languages.
Positions as "Your voice, clarified." Different category, identical
name, similar voice-clarity metaphor.

**Differentiation we lean on:**

- TLD: ours is `vozclara.app` (no hyphen); theirs is `voz-clara.com`.
- Category: ours is video → knowledge pack (visual-first study tool);
  theirs is audio → transcript (B2B professional dictation).
- Visual register: ours is navy / brass-gold / cordovan editorial;
  theirs is blue / white tech-startup.
- Audience: ours is language learners + students; theirs is regulated
  professionals.

**Our position:** coexist with aggressive differentiation. We do not
rename pre-launch. Reasons:

1. Products genuinely different — fair use defense is viable.
2. Brand momentum is real (PR #6721 on awesome-mcp-servers, Smithery
   listing, Glama Servers + Connectors, 50 reading-note essays
   indexed).
3. Visual identity is distinctively LEON MARÉ — not at risk of
   visual confusion.
4. The pre-launch rename window stays open if the conflict escalates;
   the cost of waiting six months is non-existential.

**Defensive moves we take immediately:**

- `og:site_name` is `"VozClara by LEON MARÉ"` (signed Do 28.5.2026
  commit ${see git log}). Every social share preview disambiguates us
  from the audio tool.
- The page `<title>` already reads "Voz Clara · A LEON MARÉ product".
- All external communications consistently say "VozClara by
  LEON MARÉ" or "VozClara — the YouTube → Knowledge Pack engine".

## 4. Trademark filing plan

**Goal:** secure the VozClara wordmark in the categories that actually
matter for our product before anyone else does, including the
voz-clara.com operator.

**Where to file:**

- **DPMA** (German Patent and Trademark Office) — €290 for the first
  three Nice classes. Cheapest path. Protection covers Germany only.
- **EUIPO** (European Union Intellectual Property Office) — €850 for
  the first three Nice classes. Covers all 27 EU member states. The
  pragmatic next step once DPMA is filed.
- **USPTO** (US Patent and Trademark Office) — separate filing in
  the US. Around $250-$350 per class. Defer until the US becomes a
  meaningful market segment.
- **Madrid Protocol** — international filing via WIPO using the DPMA
  application as a base. Available once the German mark is six months
  old.

**Which classes to file in:**

- **Class 9** — Software (downloadable applications for educational
  use, language learning, knowledge management). Core class for any
  SaaS.
- **Class 41** — Education / training services. Captures the
  language-learning positioning.
- **Class 42** — SaaS, cloud computing, software as a service. The
  obvious modern-SaaS bucket.

Three classes maximises protection while staying inside the
"first three classes" pricing tier on both DPMA and EUIPO.

**Filing checklist (Christian-action, ~1-2 hours):**

1. Pull the latest VozClara wordmark SVG from `/public/voz-clara-mark.svg`
   and confirm it's the canonical version we want to register.
2. Open dpma.de → Marken → Online-Anmeldung. Use the wordmark + a
   B&W version of the lighthouse seal as the figurative element.
3. Fill the goods-and-services description for class 9 / 41 / 42
   (DPMA provides a template assistant).
4. Pay €290 (or €490 for paper-form, avoid).
5. Save the DPMA file number. It becomes the base for the Madrid
   Protocol filing later.
6. Set a 90-day calendar reminder to check examination status.
7. Optional: file an EUIPO application in parallel for full-EU
   protection (€850, +€50 per extra class above three).

If a trademark attorney is preferred, expect €500-€1500 for end-to-end
service including class advice and prior-art search. For a solo
founder pre-launch, the self-filed DPMA route is the lower-risk
starting point — the application can be withdrawn or amended cheaply
if issues surface.

## 5. Anti-patterns — what we never do

- Never use "voz clara" with a space in product copy (only the marketing
  wordmark accepts "VOZ · CLARA" with separators for visual rhythm).
- Never co-brand "VozClara" with any unrelated audio tool, transcription
  service, or voice-AI product — that would muddle the differentiation
  from voz-clara.com.
- Never let the lighthouse seal and brass diamond appear on the same
  surface without an explicit co-brand context.
- Never claim "VozClara" as a registered trademark in copy or footer
  until the DPMA / EUIPO application is approved — until then the
  status is "VozClara™" (asserted, unregistered) at most.
- Never abbreviate to "VC" outside of the monogram-icon context. The
  monogram is for icons only; written copy always spells the full
  name.

## 6. When to re-evaluate

The brand stays "VozClara" coexisting with voz-clara.com until ONE of
these triggers fires:

- A legal letter (C&D, trademark opposition) lands from the voz-clara
  operator OR a third party.
- Plausible analytics show repeated user-confusion patterns ("voice
  transcription" search terms hitting our domain).
- The voz-clara.com operator expands into video processing or
  educational tooling, narrowing the category gap.
- We win a class-9 trademark registration — at that point the
  position hardens further and there is nothing to re-evaluate.

At any of those triggers, escalate to a trademark attorney before
making any public statement or rebrand decision.
