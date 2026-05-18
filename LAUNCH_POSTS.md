# Launch Posts — Draft Pack

> Drafts for the launch-week distribution push. LAUNCH_PLAN §10 calls
> for 2 Reddit posts + 1 HN submission as the cut-down version of the
> originally-planned 10 blog posts. Each draft is honest, hand-edited,
> and avoids marketing-bro phrasing. Pick one subreddit per session
> over launch week; HN ships on Day 1 alone.
>
> **Posting rules — read first**
> - Never schedule two on the same day. Reddit-mods catch
>   coordinated pushes and shadowban.
> - Reply to every comment in the first 24 h, then taper.
> - No exclamation marks in titles. Editorial voice carries the brand.
> - The 100/100 Founder counter is implicit; surface it only in the
>   comment thread if someone asks "do you have a business model".
> - When you push these, swap the `<placeholders>` for the live URLs.

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

What VozClara does, in one paragraph: you paste a YouTube URL, pick a
language and a mode (Briefing, Study, Learn, Creator), and it produces
a Knowledge Pack — TL;DR, chapter summaries, key ideas with timestamps,
vocabulary at your CEFR level, comprehension quiz, key quotes, and a
chat tutor that knows the pack's content. Your library stays on your
device (IndexedDB); only the analysis call leaves your browser.

Two things I think are interesting technically:

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
free tier; the paid path uses Claude Sonnet / GPT-5. Frontend is React +
Vite + TS. Repo is open: https://github.com/LeonMare/vozclara

Honest limitations: it only ingests YouTube transcripts that exist
(no Whisper pipeline yet for audio-only videos); the rating system
is brand new and the discovery page won't have much in it for a few
days; cross-device library sync is a Pro-tier feature that isn't
shipped yet.

I'd love feedback on the editorial-mode prompts — that's the layer
that took the longest and where I think the differentiation lives.

— Christian, Frankfurt
```

**HN comment to post yourself, 30 minutes in:**
```
Quick FAQ from threads on r/languagelearning earlier this week:

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
  Workers AI (no training on inputs per their AUP). No analytics
  tracker, no third-party cookies. /privacy spells it out.
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
cared about* — the news, Wirtschaftspodcasts, history docs — and the
existing tooling kept disappointing her. Transcripts felt raw,
generic summaries lost what was useful, copying vocab into Anki was
half an hour of friction per video.

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

Happy to answer anything.

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
The pitch: YouTube ranks by retention + watch time + clickthrough.
None of those measure whether a video was actually worth the time
afterwards. That's why a 90-minute talk on a deep topic loses to a
3-minute hook video that wasted you 3 minutes.

VozClara (https://vozclara.app) adds the missing layer: a quality
rating built into the tooling people *already use to remember what
they watched*.

The flow:

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

I'd be curious how the productivity crowd here uses this kind of
thing. The first pattern I see emerging in my own workflow:
ferramentas → save → rate → re-find weeks later when I need the
specific quote. That last part is what generic note-taking apps
can't do because they don't know the source video's structure.

— Christian (Frankfurt)
```

---

## X / Twitter thread (Day 1, post-HN by 2 hours)

**Tweet 1 — link tweet:**
```
Shipped VozClara — save the knowledge from every YouTube video you watch.

Editorial-mode prompts, anonymous-first, lifetime €99 founder deal
capped at 100 seats.

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
— No tracking, no analytics, no third-party cookies

Open source: https://github.com/LeonMare/vozclara
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

## Post-launch dashboard checklist

Watch on Day 1:
- [ ] Sentry — is the Mobile Safari error from May 18 still trending?
      Should be zero new events after the defensive-mode-key fix.
- [ ] Cloudflare Web Analytics — RPS on /, /pack/sample, /discover.
- [ ] /api/rating/top should start having items after ~10 ratings.
- [ ] /api/founder/status counter — bump manually after each Stripe
      email lands (`POST /api/founder/admin/increment`).
- [ ] HN front page rank if any (zero is fine; r/languagelearning is
      the real volume driver, HN is brand polish).

Watch through Day 7:
- [ ] WAU on the dashboard. Threshold for "real launch": 200+.
- [ ] Sample pack open rate vs. /new generation rate — sample is the
      activation funnel.
- [ ] Discover page rank distribution — Wilson-cutoff working?

---

— LEON MARÉ · Frankfurt · May 2026
