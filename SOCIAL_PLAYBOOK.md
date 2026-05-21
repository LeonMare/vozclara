# SOCIAL PLAYBOOK — VozClara MCP Beat + Full Launch

> Updated: Do 21.5.2026, frischer Stand am Spätnachmittag.
>
> Posting Tactics + Pre-Flight Checklist + Cadence Map.
> Drafts leben in `LAUNCH_POSTS.md`; dieses Dokument ist der
> Operating Layer rundherum. Nichts hier posten ohne den Pre-Flight.

---

## 1 · Account Setup (β — must happen BEFORE any post)

Setup-Reihenfolge wenn LEON MARÉ noch keine Accounts hat:

1. **X / Twitter** — Handle: `@leonmare_studio` (oder `@vozclara_app`,
   was verfügbar ist). Bio max 160 chars, see template below.
2. **LinkedIn** — Persönlicher Account von Christian + Company Page
   "LEON MARÉ Studio". Company Page first, dann post.
3. **Reddit** — Use existing Christian-Reddit-Karma-Account (#7).
   Kein "vozclara_official" — Reddit detects shill instantly.

### Bio Templates

**X (160-char hard cap):**
```
Studio. Knowledge-layer over every video you watch. Built in public.
VozClara → vozclara.app  ·  Smithery → @smithery_dev
```

**LinkedIn Company Page (2200-char):**
```
LEON MARÉ is a studio building tools at the intersection of language,
memory, and the videos we watch.

Our first product, VozClara, turns any YouTube video into a
structured Knowledge Pack — summary, key ideas, glossary, quiz —
across English, Spanish, German, and Portuguese. The pack is yours;
the source is one click away. The kind of artefact a magazine editor
would produce, except generated in 30 seconds and re-readable in 90.

We work editorial-first. The brand DNA — navy, gold, creme paper —
is borrowed from twentieth-century European publishing, because the
problem we're solving (how to retain the ideas from things you
watched once) is older than the internet.

Built solo, in public, by Christian Gulm in Frankfurt.

vozclara.app  ·  github.com/LeonMare/vozclara  ·  hello@leonmare.de
```

---

## 2 · Posting Cadence (MCP Beat — 7-day arc)

The MCP Beat is a **distribution wave**, not a launch. The full
Show-HN moment is reserved for Woche 3 after content + 50-pack
seeding lands.

| Day | Slot | Platform | Post | Notes |
|---|---|---|---|---|
| **Tag 0** (Mo) | 14:00 UTC | X / Twitter | Post 5 (Thread) | Hook → 2 → 3 → 4. Pin tweet 1. |
| **Tag 0** (Mo) | 14:30 UTC | Smithery | Re-share own page | Quick QT of tweet 1. |
| **Tag 1** (Di) | 17:00 UTC | LinkedIn | Post 6 (Long-form) | From personal account, tag Company Page. |
| **Tag 3** (Do) | 18:00 UTC | r/ClaudeAI | Post 7 (Reddit) | Mid-week, Thursday is the highest-engagement day. |
| **Tag 7** (Mo+1) | — | Echo | LinkedIn dropdown to "What I learned" follow-up | Reply-thread on first LinkedIn post. |

**Forbidden combos this week:**
- ❌ r/mcp + r/Anthropic (same audience, coordinated push reads as
  shill — pick ONE and pick r/ClaudeAI instead, it's the highest-
  signal of the three).
- ❌ Show HN slot (reserve für Woche 3 full launch — second Show HN
  inside a month gets the post flagged).

---

## 3 · Pre-Flight Checklist (run BEFORE every post)

Run all five every time. Five minutes total. Saves the launch.

1. **[ ] Read the post aloud once.** German cadence vs English
   cadence — wenn beim Lesen ein Komma fehlt, fehlt es auch beim
   Leser.
2. **[ ] Verify every URL.** Click each link in the draft → confirm
   it loads → confirm the destination is the one you meant.
3. **[ ] Test the Smithery link with the actual MCP client.**
   Open Claude Code → install via Smithery → call
   `vozclara_generate_pack(url, "de", "shallow")` → confirm a pack
   comes back. If it doesn't, do not post.
4. **[ ] Check vozclara.app is up.** A 30-second `curl -I
   https://vozclara.app/api/health` before posting catches any
   silent regression.
5. **[ ] Pre-emptive reply queued.** Have 2–3 likely-question replies
   ready in a draft doc — "What's your stack?", "How does pricing
   work?", "Is the source open?". First-hour engagement is when
   the algorithm decides.

---

## 4 · Engagement Playbook (first 4 hours after posting)

Algorithms reward early signal. Time-box this aggressively.

### X / Twitter (Tag 0)
- 0:00 — Post the thread, pin tweet 1.
- 0:05 — Reply to tweet 1 with the Smithery install link as a
  quote-tweet of @smithery_dev's most recent pin (if exists).
- 0:30 — Check replies, answer top 3 questions with substance.
- 1:00 — DM 3 people from the agent-builder community asking for
  technical feedback (NOT for shares).
- 2:00 — If engagement is alive, post a fifth "bonus" tweet with
  one screenshot of the thinking-trace stream in action.
- 4:00 — Stop refreshing. Algorithm has made its decision.

### LinkedIn (Tag 1)
- 0:00 — Post.
- 0:05 — Comment on your own post with the "tagged you because" 3
  most-relevant connections (peer founders, Anthropic alumni if
  any).
- 0:30 — Reply to every comment in the first hour with one
  question back (drives reply-depth, which LinkedIn rewards).
- 2:00 — Re-share to LEON MARÉ Studio Company Page.
- 24:00 — Comment on 5 adjacent LinkedIn posts in the same
  topic-cluster (not promotional — substantive).

### Reddit (Tag 3)
- 0:00 — Post.
- 0:05 — DO NOT upvote your own post (Reddit detects and shadow-
  bans).
- 0:30 — Reply to every comment with at least 3 sentences. Never
  one-line acks.
- 2:00 — If a question is asked you can't answer, say "I don't
  know yet — I'll dig and come back." Then actually come back.
- 24:00 — Cross-post permission: r/SideProject is safe IF the post
  has positive net-karma after Tag 3+24h. r/programming is risky;
  needs higher karma threshold.

---

## 5 · Hashtag + @-Mention Strategy

### X
- **Mentions (Tweet 1):** `@smithery_dev` (cross-promotion path)
- **Mentions (Tweet 3, technical reveal):** `@cloudflaredev`
  `@AnthropicAI` (rate-limited — only mention if real reach)
- **Hashtags:** None on tweet 1 (lowers initial-tweet reach in
  current algorithm). Light use on tweet 3: `#MCP` only.

### LinkedIn
- **No hashtags above the fold.** Move them to a single line at the
  bottom: `#AI #BuildInPublic #LanguageLearning #Anthropic`
- **@-mention LEON MARÉ Studio Company Page** so it cross-posts.

### Reddit r/ClaudeAI
- **No flair gaming.** Use "Question" or "Discussion" flair as
  appropriate. Self-promotional flair gets removed.
- **No hashtags. No @-mentions.** Reddit doesn't index either.

---

## 6 · Failure-State Replies (have these ready)

Pre-drafted replies for the three most-likely critical comments.
Each is one paragraph, calm, no defensiveness.

### "This is just a YouTube transcript tool with a coat of paint."
```
Fair pushback. The transcript layer is one of about twelve moving
parts — what makes a Knowledge Pack different from a transcript is
the structure (mode-specific outputs: Learn / Brief / Study /
Creator), the cross-lingual generation (Spanish source → German
glossary + quiz), the citation chips with click-to-seek, and the
Anki export. Transcripts are a commodity; the editorial layer on
top is where the work lives. Try the sample pack at
vozclara.app/pack/sample and see if you still think coat of paint.
```

### "Why not just use [Notion AI / Reader / NotebookLM]?"
```
Honest answer: for single-source linear reading, NotebookLM is
genuinely strong and free. VozClara's bet is on the bits NotebookLM
doesn't do — multilingual generation (paste an English video, get a
German pack), the Anki export with proper FSRS scheduling, the
inline timestamp citations that link back to the exact source
moment, and the MCP layer so your existing agent stack can call it.
If you mainly want to chat with one PDF, NotebookLM wins. If you
want a library of multilingual study packs that lives outside
Google's ecosystem, that's the gap I'm trying to fill.
```

### "Privacy / GDPR concerns?"
```
Reasonable to ask. The full subprocessor list is at
vozclara.app/privacy. Short version: Cloudflare hosts the infra,
Supadata pulls the public YouTube transcript, Anthropic processes
the prompt (no training on inputs, contractual), Resend sends the
transactional emails, Paddle handles the payment as Merchant-of-
Record. Cookieless analytics via Plausible. Account deletion sweeps
sessions + votes + reviews per GDPR Art 17 — this is enforced in
the worker, not just documented. EU AI Act Art 50 disclosure
appears on first pack-generate.
```

---

## 7 · Post-Posting Tracking

After each post, fill this into `LAUNCH_PLAN.md §32` (create section
if missing):

```
Post: <number + platform>
Posted: <ISO timestamp>
Engagement (24 h):
  - Impressions: …
  - Replies: …
  - Shares / RTs: …
  - Net karma (Reddit only): …
  - Clicks to vozclara.app (Plausible): …
Top question asked: <one line>
Sentiment: positive / mixed / negative
Lesson for next post: <one line>
```

Three datapoints across the MCP Beat are enough to calibrate the
Show-HN tone three weeks later.

---

## 8 · The Brand-Voice Guardrail

Re-read this paragraph before EVERY post. It is the LEON MARÉ
register — drift catches up faster than you'd think.

> We write like a Sunday-magazine editor, not a startup founder.
> Short sentences. One claim per paragraph. Specifics over
> superlatives. Numbers when we have them, "I don't know" when we
> don't. No emojis except the brand wordmark glyph. Never
> "revolutionary", "game-changing", "AI-powered". The product is
> the proof; the voice is the studio.

---

*This playbook lives in the repo so it travels with the launch.
Update §2 (cadence) as posts land; rotate stale templates in §6
every quarter. The pre-flight in §3 is non-negotiable.*
