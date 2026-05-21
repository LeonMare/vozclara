# Launch Posts — Draft Pack

> Drafts for the launch-week distribution push: HN + 3 subreddits + an
> X/Twitter thread, spread across seven days. Each draft is honest,
> hand-edited, and avoids marketing-bro phrasing. Pick one venue per
> session over launch week; HN ships on Day 1 alone.
>
> **Posting rules — read first**
> - Never schedule two on the same day. Reddit-mods catch
>   coordinated pushes and shadowban.
> - Reply to every comment in the first 24 h, then taper.
> - No exclamation marks in titles. Editorial voice carries the brand.
> - The 100/100 Founder counter is implicit; surface it only in the
>   comment thread if someone asks "do you have a business model".
> - When you push these, swap the `<placeholders>` for the live URLs.
>
> **Schedule at a glance:**
> - **Day 1 (Tuesday)** — Hacker News, ~14:00 UTC + X thread 2 h later
> - **Day 2 (Wednesday)** — r/languagelearning, ~17:00 UTC
> - **Day 4 (Friday)** — r/productivity, ~18:00 UTC
> - **Day 6 (Sunday)** — r/getstudying, ~19:00 UTC
> - **Day 7+** — taper, reply to lingering threads, watch the metrics

---

## Post 1 — Hacker News (Day 1, ~14:00 UTC, Tuesday)

**Title (≤80 chars):**
```
Show HN: VozClara – save the knowledge from every YouTube video you watch
```

**Body (the linked URL is `https://vozclara.app/` — HN renders it
automatically; the body below is plain text with no markdown):**

```
I built VozClara because my partner, a native Spanish speaker living in
Frankfurt, kept hitting the same wall: she wanted to understand the
Tagesschau, the German finance podcasts I followed, the explainer
videos in her field — but a 30-minute transcript is text, not
knowledge.

Concretely: you paste a YouTube URL, pick a language and a mode
(Briefing, Study, Learn, Creator), and you get back a Knowledge Pack —
TL;DR, chapter summaries, key ideas with timestamps, vocabulary at
your CEFR level, comprehension quiz, key quotes, and a chat tutor
that knows the pack's content. Your library stays on your device
(IndexedDB); only the analysis call leaves your browser.

Two technical bets I'd love HN's take on:

1. Mode-aware prompts. The same transcript becomes very different
   output depending on whether you asked for a briefing or a study
   note. The chapter counts, vocabulary depth, and quote selection
   are tier-scaled to the source video's length so a 3-minute clip
   doesn't produce 18 vocab cards.

2. Anonymous-first, local-first. No account is required. Brain-ID is a
   random anonymous identifier in localStorage so vector search can
   scope to your own packs. Sign-in (magic link) only unlocks
   cross-device migration and the Michelin-style rating system.

It runs on Cloudflare Workers + Workers AI (Llama 3.3 70B) for the
free tier; the paid path uses Claude Sonnet / GPT-5. Frontend is
React + Vite + TS. Built in public — happy to dig into any layer
in the comments.

Honest limitations: it only ingests YouTube transcripts that exist
(no Whisper pipeline yet for audio-only videos); the rating system
is brand new and the discovery page won't have much in it for a few
days; cross-device library sync is a Pro-tier feature that isn't
shipped yet.

The "why not just NotebookLM?" question — fair, worth naming. Their
strength is mixing many sources (YouTube + PDF + audio) into one
notebook; that's a great fit if you're building a literature map
across ten papers. VozClara goes the other direction: single source,
deeper output. The editorial-mode prompts bend the shape of the pack
(study vs. brief vs. learn-the-language vs. creator), the vocabulary
is CEFR-calibrated, there's a real SRS layer for daily review, voice
shadowing, Anki export, and a Michelin-style rating on the source
video itself so the next visitor doesn't waste an hour on a click-
bait. Different tool for a different job. If you're a student or a
language learner who actually wants to retain what they watched,
this is built for that.

And the "what about YouTube's new Ask feature?" question — also fair.
YouTube Ask is great for one-off questions inside YouTube Premium:
single video, English-only, the answer lives for two minutes and is
gone. VozClara is for the knowledge that *outlives* the watch session.
Your packs persist in IndexedDB, the library searches across hundreds
of videos via vector embeddings, output gets generated natively in
your language (not translated), and the SRS / Anki / shadowing layer
exists so you actually retain what you watched. Plus the MCP server
ships your library into Claude / Cursor / ChatGPT — YouTube Ask is
locked to the YouTube tab.

If you want to poke without signing up: the study-mode pack on
Veritasium's "Most Misunderstood Concept in Physics" lives at
https://vozclara.app/pack/sample-study (24-min lecture → 7 chapters
+ 8 comprehension questions + entropy vocabulary). The brief-mode
pack on the Lex Fridman × Yann LeCun interview is at
https://vozclara.app/pack/sample-news (3-hour podcast → 8 chapters,
6 quotable lines, in 5 minutes of reading).

I'd love HN's take on the editorial-mode prompts specifically.
That's the layer I've spent the most time on, and it's where I
think the product either works or doesn't. The rest is plumbing.

— Christian, Frankfurt
```

**HN comment to post yourself, 30 minutes in:**
```
Anticipating the recurring questions:

— Why YouTube only? It's the largest public corpus where transcripts
  already exist as captions. Whisper + uploads is on the Pro roadmap.

— Is there a Pro plan? Yes — €9/mo or €72/yr, unlocks premium models
  (Claude / GPT-5), unlimited packs, cross-device sync, MP3 uploads.
  Free covers most use today; I'm not gating the core features.

— Founder deal? €99 one-time for lifetime Pro, capped at 100 seats —
  https://vozclara.app/founder. It's how I'm avoiding VC for the
  first year. If it doesn't resonate, free covers you fine.

— Privacy? Your library is in IndexedDB on your device. Only the
  transcript + prompts hit my Cloudflare Worker which forwards to
  Workers AI (no training on inputs per their AUP). No third-party
  trackers, no marketing cookies. Privacy-friendly Cloudflare Web
  Analytics + Sentry for crash reports, both EU-hosted, no PII.
  /privacy spells it out.

— vs YouTube Ask (Premium feature)? YouTube Ask: single video,
  English, answer gone in two minutes, locked behind Premium.
  VozClara: persistent library across hundreds of videos, native
  multilingual generation (not translation), cross-pack vector
  search ("what did Lex say about LLMs in the last 5 podcasts I
  saved?"), and the SRS / Anki layer YouTube will never build.
  Different value: YouTube tells you, VozClara remembers.
```

---

## Post 2 — r/languagelearning (Day 2, ~17:00 UTC, Wednesday)

**Subreddit:** r/languagelearning (1.4M)
**Flair:** "Resources"

**Title (≤300 chars, no all-caps):**
```
I built a tool that turns YouTube into structured language-learning
material — vocab at your CEFR level, comprehension quiz, Anki export,
SRS, shadowing. Looking for feedback.
```

**Body:**
```
Hi r/languagelearning,

Quick context: my partner is a Spanish speaker, I'm German, we live
in Frankfurt. She wanted to learn German *with content she actually
cared about* — the news, Wirtschaftspodcasts, history docs — but
what existed felt either too dumb (copy-paste transcript summaries
with no structure) or too generic (ChatGPT forgets the thread after
five minutes and loses the vocabulary by tomorrow). Copying vocab
into Anki was half an hour of friction per video.

So I built VozClara: https://vozclara.app

How it works in 60 seconds:

1. Paste a YouTube URL (Tagesschau, El País Audio, Easy German,
   whatever's in your target language).
2. Pick a Learn mode + your target language + your level.
3. It produces:
   • Vocabulary tuned to your CEFR level (A1 → C1), in context
   • A comprehension quiz (recall + application questions)
   • Chapter summaries you can rewind to with one tap
   • Key quotes with the speaker, timestamp, and translation
   • Shadowing practice with pronunciation scoring (Web Speech API)
   • SRS review (spaced repetition) that surfaces what's due today

Anki export is one tap — you get a proper .apkg file with cards and
sentence context, not just word lists.

Languages covered: German, Spanish, English, Portuguese. Source can
be in any of those; output (vocab translations, quiz, chapters) is
in whichever you set as your study language.

Free, no account needed. There's a Pro plan (€9/mo) with premium
LLMs and bigger limits, but the core language-learning loop is free
and stays free.

Sample pack you can poke without signing up:
https://vozclara.app/pack/sample-learn

What I'd love feedback on:

— Is the CEFR-level calibration actually right at your level? It's a
  prompt heuristic, not a measured calibration yet — I'd love
  contrastive feedback ("I'm B2 and this is too easy / too hard").

— Anki users: does the deck format play well with how you already
  organise your decks? It uses a single VozClara::<pack-title> deck
  hierarchy by default.

— Shadowing: which languages are the pronunciation scoring weak on?
  It's Web Speech API under the hood, accuracy varies.

I'll be in the comments — please be specific if it sucks.

— Christian
```

---

## Post 3 — r/productivity (Day 4, ~18:00 UTC, Friday)

**Subreddit:** r/productivity (3M)
**Flair:** "Software / Tools"

**Title:**
```
I built a "Michelin Guide" for YouTube — rate the quality of
educational videos so the good ones surface and the noise sinks.
```

**Body:**
```
YouTube ranks by retention, watch time, and clickthrough. None of
those measure whether a video was actually worth your hour afterwards.
That's why a 90-minute talk on a deep topic loses to a 3-minute hook
video that wasted you three minutes.

VozClara (https://vozclara.app) adds the missing layer: a quality
rating built into the tooling people *already use to remember what
they watched*.

How I use it:

1. You paste a YouTube URL → get a Knowledge Pack: TL;DR, key ideas
   with timestamps, action plan, quotes. Your library stays on your
   device (IndexedDB), no account required.

2. After watching + reading the pack, you rate. Anonymous 👍/👎 +
   four 1-tap signals (💡 mind-blowing / 🤔 confusing / 🚫 misleading
   / ⏱ too long). 5-star rating and text review require an account
   to prevent spam.

3. The /discover page ranks videos by Wilson-score lower bound, not
   raw approval. A 4/4 👍 doesn't beat a 95/100 👍 — small samples
   are less trustworthy, and the editorial promise is that the page
   surfaces durable quality, not flukes.

What this *isn't*: it's not a recommendation algorithm. The ratings
are sparse, the discovery page won't be useful until thousands of
people have used it, and I'm fine with that. The point is the
infrastructure — the same workflow that converts a video into your
study notes also tells the next person whether the video was worth
their hour.

Modes:
— **Briefing** (decision-maker, news / podcasts)
— **Study** (lectures, chapter summaries, comprehension quiz)
— **Learn** (language learners — vocab, SRS, shadowing)
— **Creator** (repurposing — hooks, captions, viral quotes)

Free. There's a Pro plan with premium AI models + cross-device sync,
but the rating + discovery layer is and will remain free.

If you want to poke without signing up: the live brief-mode sample
on the Lex Fridman × Yann LeCun interview is at
https://vozclara.app/pack/sample-news — a 3-hour podcast condensed
into 8 chapters and 6 quotable lines, in five minutes of reading.
That's the value of brief mode in one click.

I'd be curious how the productivity crowd here uses this kind of
thing. The first pattern I see emerging in my own workflow:
watch → save → rate → re-find weeks later when I need the specific
quote. That last part is what generic note-taking apps can't do
because they don't know the source video's structure.

— Christian (Frankfurt)
```

---

## Post 4 — r/getstudying (Day 6, ~19:00 UTC, Sunday)

**Subreddit:** r/getstudying (700k)
**Flair:** "Resources / Apps"

**Title:**
```
I built a tool that turns lectures into chapter summaries + a
comprehension quiz you can run before the exam. Looking for feedback
from students who actually use it.
```

**Body:**
```
Hi r/getstudying,

I'm building a tool called VozClara (https://vozclara.app). The
part most relevant to this sub is Study mode — it takes a lecture-
style YouTube video and produces a structured study pack you can
actually run before an exam.

Specifically, you get:

— **TL;DR** in one sentence (so you can decide whether to keep going)
— **Chapter summaries** with the timestamp where each starts, so you
  can rewind to the exact 90 seconds you didn't catch the first time
— **Key ideas** (5–7 of them) — the concepts the lecture is *actually*
  trying to teach, separated from filler
— **Comprehension quiz** (6–10 questions) with full answers and
  explanations — runnable as a self-test before the exam
— **Vocabulary** of the domain terms — useful if the lecture is in
  a second language or full of jargon you're still meeting
— **Action plan** — concrete next steps for retaining the material

You can poke a real example without signing up:
https://vozclara.app/pack/sample-study

It's a 24-minute Veritasium lecture on entropy. The pack has 7
chapters (intuition → Boltzmann's formula → Maxwell's demon → Shannon
information → arrow of time), 8 quiz questions (with worked answers),
15 vocabulary terms, and a 5-step action plan that ends in spaced
repetition. The quiz alone is what would have saved me 30 minutes
of re-reading when I was studying for thermodynamics finals.

Why I think it's worth your time:

1. The quiz is real comprehension testing, not regurgitation. Questions
   like "why is the second law statistical, not absolute?" with full
   explanations. The kind of question a TA would write.

2. It works on the videos you're already watching. 3Blue1Brown, MIT
   OCW, your professor's recorded lecture, Veritasium, Crash Course.
   If it has captions on YouTube, VozClara reads them.

3. Spaced repetition is built in. Cards from vocabulary auto-sync to
   the SRS layer — review what's due today, the algorithm handles the
   interval scheduling. One-tap Anki export if you'd rather use your
   own deck.

4. It's free. There's a Pro tier (€9/mo) for premium AI and unlimited
   packs, but the core study loop — packs, quiz, SRS, Anki export —
   stays free.

What I'd love feedback on:

— Are the comprehension questions at the right depth for *your*
  domain? Try it on a lecture you know well and tell me if the
  questions feel like a TA wrote them or like a parrot wrote them.

— Anki users: does the deck export format play with your existing
  cards or fight them?

— Anyone studying in a language that isn't your native one: how does
  the vocabulary calibration feel?

Free, no account needed to try. Reply or DM if you want me to walk
through a specific lecture from your syllabus — I'm curious where
it breaks.

— Christian, Frankfurt
```

---

## X / Twitter thread (Day 1, post-HN by 2 hours)

**Tweet 1 — link tweet:**
```
Shipped VozClara. Turn every video you watch into a Knowledge Pack you can search years later.

First 100 founders pay €99 once.

🔗 https://vozclara.app
```

**Tweet 2 — what it does, in 3 lines:**
```
Paste any YouTube URL. Get:
— Briefing summary you can scan in 2 min
— Vocab at your CEFR level if you're learning the language
— Chapter notes with timestamps you can rewind to
— Quote citations one tap to clipboard
```

**Tweet 3 — the Michelin-rating hook:**
```
The hook nobody else has yet:

Built-in rating system (anonymous 👍/👎 + four 1-tap signals).
Wilson-score ranks the videos so durable quality surfaces, not
flukes.

YouTube measures retention. VozClara measures whether it was
worth your hour.

→ https://vozclara.app/discover
```

**Tweet 4 — the technical reveal:**
```
Stack:
— Cloudflare Workers + Workers AI (Llama 3.3 70B) for free tier
— Claude Sonnet / GPT-5 for Pro
— React + Vite + TS frontend
— IndexedDB library (local-first)
— Privacy-friendly CF Analytics + Sentry, both EU-hosted, no PII

Built in public — DMs open for layer-by-layer questions.
```

**Tweet 5 — the founder deal:**
```
Building this without VC.

First 100 founders get Pro for life at €99 (vs the upcoming €9/mo).
Direct Discord access, roadmap voting, early betas.

If you've waited for a tool that respects long-form content,
this is it.

→ https://vozclara.app/founder
```

---

## MCP Beat — VozClara on Smithery (publishable once Paddle is approved)

> A separate distribution wave around the **MCP-callable** moment.
> Different audience than the Day-1 launch: agent-builders, Claude
> Code users, indie devs experimenting with MCP. We ship these only
> after Paddle approves and the Founder checkout is wired against the
> new MoR — running these against an offline payment link would burn
> a hot top-of-funnel moment.
>
> Three drafts below — pick all three (different audiences, no
> overlap risk):
>   1. X / Twitter thread (4 tweets)
>   2. LinkedIn long-form founder post
>   3. Reddit r/ClaudeAI (technical, builders-to-builders)
>
> Posting rules: stagger 24–48 h between the three. Do **not** also
> post to r/mcp or r/Anthropic in the same week (the MCP/Claude
> subreddits read each other; coordinated pushes get noticed). HN is
> off-limits for the MCP beat because we want that Show HN slot for
> the full-product launch later — a second "Show HN" within the same
> month gets flagged.

### Post 5 — X / Twitter thread (MCP Beat)

**Tweet 1 — the hook:**
```
Just shipped: VozClara is now MCP-callable.

Tell Claude, Cursor, or Windsurf to summarize a YouTube video, and
they call VozClara behind the scenes — full structured Knowledge
Pack, four output languages, no copy-paste.

One-click install on Smithery 🪶
https://smithery.ai/server/salvador7eon/vozclara
```

**Tweet 2 — what it does in agent mode:**
```
You say:
"Read this Huberman episode and give me the key claims as
flashcards in German."

Your agent calls `vozclara_generate_pack(url, "de", "deep")` and
hands back: summary, 5–7 key ideas, 6–10 glossary terms, 5 Q/A
flashcards. Cross-lingual: it works on any video, any output
language.
```

**Tweet 3 — the technical reveal:**
```
Stack note for the curious:

— Cloudflare `agents` SDK + McpAgent + Durable Objects for session
  state across Streamable-HTTP and SSE transports
— Supadata for the YouTube transcript layer (residential egress,
  MoR for licensing)
— Llama 3.3 70B on Workers AI for the generation pass — Pro Plus
  tier upgrades to Sonnet 4.5 via Cloudflare AI Gateway

Built solo. Edited in public. https://github.com/LeonMare/vozclara
```

**Tweet 4 — full surface + honest gaps:**
```
Phase 2 also shipped: OAuth-protected /api/mcp/pro endpoint adds
three library-scoped tools — search_my_library, ask_video,
export_anki. PKCE S256, scopes library:read/write + profile.

Still missing: Sonnet-tier behind MCP. Llama path only until the
Pro-Plus wire-up — that's next.

→ https://smithery.ai/server/salvador7eon/vozclara
```

### Post 6 — LinkedIn long-form (MCP Beat)

```
A small win that took a year of reading to set up correctly.

VozClara — the multilingual knowledge-pack tool I've been building
under the LEON MARÉ brand — is now natively callable from any
MCP-compatible AI client: Claude, Cursor, Windsurf, Lovable, the
whole emerging stack. One-click install on Smithery. Zero glue code
required on the user's side.

Why this mattered enough to ship before the main public launch:

Distribution for indie SaaS is rarely a feature problem; it's an
access problem. Most multilingual-YouTube tools live behind their
own URL — you have to remember they exist, paste a link, and copy
the output to wherever you're already working. MCP collapses that
loop: the AI assistant you already work with reaches out and gets
the structured Knowledge Pack, in the language you asked for,
without you switching context.

The technical bet was on Cloudflare's `agents` SDK over rolling our
own transport. Streamable-HTTP plus SSE with Durable-Object-backed
session state, OAuth provider on the same edge, everything in
TypeScript. It made the whole MCP layer a one-week build instead of
a one-month one.

Both phases are shipped. The anonymous `generate_pack` tool is
public on Smithery as `salvador7eon/vozclara`, scoring 84/100 in
their automated audit. The OAuth-protected pro endpoint adds three
library-scoped tools — search across saved packs, ask a specific
video, export an Anki deck — gated on PKCE S256 + magic-link auth
behind the scenes. What's left for the next sprint is the Sonnet
4.5 path behind MCP for Pro Plus subscribers; Llama 3.3 70B on
Workers AI is the current default.

If you're building anything with Claude Code or running an MCP
stack inside your team, I'd love your feedback on what's clunky.

→ https://vozclara.app
→ https://smithery.ai/server/salvador7eon/vozclara
```

### Post 7 — Reddit r/ClaudeAI (MCP Beat)

**Title:** `Built an MCP server for YouTube → multilingual study packs (Claude/Cursor/Windsurf compatible)`

**Body:**
```
Hey r/ClaudeAI — solo founder posting honestly, hoping for
feedback from people actually using MCP in anger.

I run VozClara, a tool that turns YouTube videos into structured
Knowledge Packs (summary + key ideas + glossary + quiz, in four
output languages). I shipped the MCP server a couple of days ago
and want to share what worked and what didn't.

**What works today**
- `vozclara_generate_pack(url, language, depth)` is live anonymous,
  one-click-installable via Smithery — `salvador7eon/vozclara`
- Cross-lingual out of the box: paste a Spanish video, ask for a
  German pack at `deep` depth, get back glossary + quiz in German
- Cloudflare `agents` SDK + Durable-Object-backed sessions handle
  the Streamable-HTTP + SSE transports
- Phase 2 OAuth endpoint at `/api/mcp/pro` adds three library-scoped
  tools (`search_my_library`, `ask_video`, `export_anki`) behind
  `workers-oauth-provider` — PKCE S256, scopes `library:read` /
  `library:write` / `profile`, refresh-token cached locally by
  `mcp-remote` after first browser auth

**What I deferred**
- Sonnet 4.5 isn't behind MCP yet. The Anthropic-via-AI-Gateway
  client exists in the worker for the web `/api/insights` path; the
  MCP route still uses Llama 3.3 70B on Workers AI. Tier-aware
  routing is the next sprint.
- Inline citations / timestamp hover-replay aren't in any tool
  output yet — that's a signature feature in flight for the main
  product launch, not the MCP layer.

**The honest trade-off**
Supadata's `data.lang` came back as `de` on English videos because
their EU-edge defaults override their detection. Llama happens to
be cross-lingual enough that the output was correct, but the
sourceLanguage field on the Pack schema lied. Fixed with a
stop-word heuristic on the transcript text itself — five minutes
of work, but I would have caught it sooner if I had paid attention
to the first eval log.

If anyone here uses MCP servers inside Claude Code in their daily
flow, I'd love to know: which UX patterns make a tool feel
"native" vs feel like an external thing you remember exists? My
current bet is composite tools with depth/lang as parameters, not
five atomic tools, but I'd take counter-arguments.

— install link: https://smithery.ai/server/salvador7eon/vozclara
— code: https://github.com/LeonMare/vozclara
```

---

## Post-launch dashboard checklist

Watch on Day 1:
- [ ] Sentry — is the Mobile Safari error from May 18 still trending?
      Should be zero new events after the defensive-mode-key fix.
- [ ] Cloudflare Web Analytics — RPS on /, /pack/sample, /discover.
- [ ] /api/rating/top should start having items after ~10 ratings.
- [ ] /api/founder/status counter — bump manually after each Paddle
      sale email lands (`POST /api/founder/admin/increment`) — until
      the `transaction.completed` webhook is wired sub-launch.
- [ ] HN front page rank if any (zero is fine; r/languagelearning is
      the real volume driver, HN is brand polish).

Watch through Day 7:
- [ ] WAU on the dashboard. Threshold for "real launch": 200+.
- [ ] Sample pack open rate vs. /new generation rate — sample is the
      activation funnel.
- [ ] Discover page rank distribution — Wilson-cutoff working?

---

— LEON MARÉ · Frankfurt · May 2026
