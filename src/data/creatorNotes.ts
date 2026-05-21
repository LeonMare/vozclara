/**
 * /notes — programmatic SEO seed.
 *
 * Each entry renders at /notes/<slug> as an editorial essay ABOUT a
 * specific YouTube video. The page is an original VozClara-voice
 * commentary — NOT a transcript reproduction (no copyrighted text) —
 * with a quiet CTA to generate the user's own pack from the source URL.
 *
 * Why this exists:
 *   Google indexes individual videos rarely. People searching
 *   "Huberman sleep" find creator-channel pages and Reddit threads,
 *   not condensed essays. A 500-word editorial note about a single
 *   video — original prose, plus the source URL handy — is the kind
 *   of page that ranks for a long-tail query AND, in the same minute,
 *   converts the reader into a pack-generator. Programmatic SEO with
 *   editorial integrity.
 *
 * Editorial constraints (LEON MARÉ register):
 *   - First person plural ("we") used sparingly, never as marketing
 *   - No bullet-list bait, no "5 things you should know" framing
 *   - One coherent argument per essay, 4-7 short sections
 *   - Always credit the creator + link out to the original video
 *   - Never reproduce more than ~12 consecutive words from the source
 *
 * Add new entries by appending to CREATOR_NOTES below. The route +
 * sitemap pick them up automatically. Aim is 50 entries across the
 * three founding creator clusters (Huberman / Lex Fridman / Veritasium)
 * by end of launch week — the cohort here is the editorial template.
 */

export interface CreatorNoteSection {
  heading: string;
  body: string; // Single paragraph per section — multi-paragraph via \n\n.
}

export interface CreatorNote {
  /** URL slug — kebab-case, ≤60 chars, includes creator handle hint. */
  slug: string;
  creator: string;
  /** YouTube channel @handle without the @. Used for the credit line. */
  creatorHandle: string;
  videoTitle: string;
  youtubeId: string;
  /** ISO date of the source video — used in metadata, not displayed. */
  publishedDate: string;
  durationMin: number;
  /** Free-form topic tags — used for related-note linking + index filter. */
  topics: string[];
  /** Locale of THIS essay (not the source video). */
  lang: 'en' | 'es' | 'de' | 'pt';
  /** 2-3 sentence editorial framing — appears under the title. */
  intro: string;
  /** Body sections. 4-7 is the editorial sweet spot. */
  sections: CreatorNoteSection[];
  /** One-sentence takeaway, italicised in the page footer. */
  takeaway: string;
  /** Slugs of 2-3 thematically adjacent notes for end-of-page suggestions. */
  relatedSlugs: string[];
  /** SEO. Suffixed " · VozClara" automatically by usePageHead. */
  metaTitle: string;
  metaDescription: string;
}

export const CREATOR_NOTES: CreatorNote[] = [
  // ─── Andrew Huberman ────────────────────────────────────────────
  {
    slug: 'andrew-huberman-sleep-toolkit',
    creator: 'Andrew Huberman',
    creatorHandle: 'hubermanlab',
    videoTitle: 'Toolkit for Sleep',
    youtubeId: 'aXvDEmo6uS4',
    publishedDate: '2022-08-15',
    durationMin: 14,
    topics: ['sleep', 'circadian rhythm', 'neuroscience', 'health'],
    lang: 'en',
    intro:
      'Andrew Huberman’s short “Toolkit for Sleep” is the rare Huberman episode you can finish on a single subway ride. Stripped of guests and tangents, it reads as an operating manual — the kind a sleep clinician might hand a patient on the way out.',
    sections: [
      {
        heading: 'The thesis is unfashionable',
        body:
          'Most popular sleep advice from the last decade has been pharmacological: melatonin, magnesium, an app-tracked supplement stack. Huberman builds the opposite argument. The behavioural levers — when you see light, when you eat, when you move — are larger than the chemical ones, and they are free. The toolkit reorders priorities accordingly: light first, temperature second, supplements last and optional.',
      },
      {
        heading: 'Light is the load-bearing variable',
        body:
          'The first ten minutes of the talk press a single point: morning light through the eyes, ideally outside, ideally within an hour of waking. The mechanism is well-trod neuroscience — the suprachiasmatic nucleus reads photons and sets the day’s cortisol arc — but Huberman’s framing is operational. Cloudy day? Stay outside longer. Behind a window? Doesn’t count. The protocol is annoying enough to be memorable, which is part of why it sticks.',
      },
      {
        heading: 'Temperature, the quiet co-author',
        body:
          'Body temperature drops as you fall asleep and rises as you wake. The toolkit treats this as a controllable signal: a cool bedroom, a warm shower an hour before bed (paradoxically lowers core temp via vasodilation), no late-evening exercise. The argument is not that any one of these matters individually — it is that, stacked, they make the difference between a restless night and a clean one.',
      },
      {
        heading: 'Where the episode is honest',
        body:
          'Huberman is unusually candid about what doesn’t work. He flags that melatonin dosing in most US supplements is 5–10× what the science supports, names the studies, and stops short of recommending it for chronic use. That moment is the reason the talk is worth re-listening to — it models the rare habit of saying "I was wrong, here is the data" in a public-facing health context.',
      },
      {
        heading: 'What a knowledge pack does with it',
        body:
          'A 14-minute episode is short enough to listen straight through, but it has enough specific dosages, timing windows, and protocols that revisiting it later from memory tends to fail. Running it through VozClara compresses the toolkit into a single page of cards — the morning-light protocol, the temperature levers, the supplement caveats — that you can re-read in 90 seconds before bed. The pack does not replace the talk; it makes the talk re-usable.',
      },
    ],
    takeaway:
      'Sleep advice that works is mostly behavioural and mostly free — the harder part is remembering it on a Wednesday.',
    relatedSlugs: ['andrew-huberman-dopamine-motivation', 'lex-fridman-andrej-karpathy-agi'],
    metaTitle: 'Andrew Huberman’s Sleep Toolkit — a reading note',
    metaDescription:
      'A 500-word editorial note on Andrew Huberman’s “Toolkit for Sleep” — the behavioural levers, where the talk is honest, and how to turn the dosages into something you can re-read in 90 seconds.',
  },
  {
    slug: 'andrew-huberman-dopamine-motivation',
    creator: 'Andrew Huberman',
    creatorHandle: 'hubermanlab',
    videoTitle: 'Controlling Your Dopamine For Motivation, Focus & Satisfaction',
    youtubeId: 'QmOF0crdyRU',
    publishedDate: '2021-09-27',
    durationMin: 121,
    topics: ['dopamine', 'motivation', 'focus', 'neuroscience'],
    lang: 'en',
    intro:
      'The two-hour dopamine episode is the one Huberman fan-translates argue about for years afterwards. It is also the one most casual listeners abandon by minute twenty. The argument it builds is worth the work — and it makes a strong case for not listening to it linearly.',
    sections: [
      {
        heading: 'Why most popular dopamine talk gets it backwards',
        body:
          'Internet culture has settled on a vague "dopamine = pleasure" framing that treats every reward as a deposit and every craving as a withdrawal. Huberman spends the first thirty minutes dismantling this. Dopamine, in his telling, encodes anticipation more than satisfaction. The "high" is what you feel reaching for the reward; the satisfaction is a separate, often smaller, neuromodulator response. Conflating the two is why so much pop-neuroscience advice misfires.',
      },
      {
        heading: 'The baseline-versus-peak frame',
        body:
          'The episode\'s most useful concept is the distinction between baseline dopamine (how good your day feels by default) and peak dopamine (the spikes from specific rewards). Repeated peaks lower the baseline. This is not a fringe interpretation — it is consensus neuroscience — but Huberman is the rare science communicator who connects it to everyday choices: caffeine stacking, energy-drink habits, doom-scrolling, the music you listen to while working.',
      },
      {
        heading: 'The protocol is more restrained than its reputation',
        body:
          'Fans on Twitter often reduce the talk to "cold plunges raise dopamine 250%". The episode itself is more careful: the cold-exposure section comes ninety minutes in, with caveats about who shouldn\'t do it. The real recommendation is less photogenic — vary your reward sources, do not stack stimulants, treat the deliberate effort itself as the reward source where you can. None of this is novel; most of it is hard.',
      },
      {
        heading: 'Where it earns its length',
        body:
          'A two-hour talk on a single neuromodulator should not be this listenable. The reason it is comes down to Huberman\'s scaffolding: every claim is anchored to a named researcher and a year, and every protocol is bracketed by what we don\'t know yet. By the end, you have not just the dopamine model — you have a working bibliography. The pack, when you generate one, preserves that bibliography in a single screen.',
      },
      {
        heading: 'How to listen to it twice',
        body:
          'The talk rewards a second pass more than a first. First time through, the protocols stick; second time through, the mechanism does. We recommend listening once linearly, generating a VozClara pack, and using the pack as the index — every section heading in the pack is a re-entry point into the audio.',
      },
    ],
    takeaway:
      'Dopamine is about anticipation, not satisfaction — and your baseline matters more than your peaks.',
    relatedSlugs: ['andrew-huberman-sleep-toolkit', 'naval-ravikant-how-to-get-rich'],
    metaTitle: 'Huberman on dopamine — what the two-hour episode actually argues',
    metaDescription:
      'An editorial note on Andrew Huberman’s 2-hour dopamine episode — why "dopamine = pleasure" gets the model backwards, the baseline-versus-peak frame, and how to listen to it twice.',
  },

  // ─── Lex Fridman ────────────────────────────────────────────────
  {
    slug: 'lex-fridman-andrej-karpathy-agi',
    creator: 'Lex Fridman',
    creatorHandle: 'lexfridman',
    videoTitle: 'Andrej Karpathy: Tesla AI, Self-Driving, Optimus, AGI, and the Future',
    youtubeId: 'cdiD-9MMpb0',
    publishedDate: '2024-10-12',
    durationMin: 213,
    topics: ['agi', 'machine learning', 'self-driving', 'karpathy'],
    lang: 'en',
    intro:
      'Three and a half hours of Andrej Karpathy in conversation is, on paper, a punishing format. In practice the interview is the most usable AGI primer of the last twelve months — partly because Karpathy refuses to perform certainty.',
    sections: [
      {
        heading: 'The interview\'s thesis, such as it is',
        body:
          'Karpathy does not argue for or against AGI on a specific timeline. The argument he builds — almost in passing, across the first ninety minutes — is that the question itself is poorly framed. The relevant axis is not "will we get AGI"; it is "which slice of human cognition is the current architecture closest to, and how far does the next training run move that needle." This is a less dramatic frame than the public discourse, but it is the frame practitioners actually use.',
      },
      {
        heading: 'On self-driving as the canary',
        body:
          'The section on Tesla\'s self-driving stack is the longest and the most quoted. Karpathy is on record being more optimistic about end-to-end neural networks for driving than he was three years ago. Two specifics matter. First, the system architecture is converging on something that looks, structurally, like a small language model — vision tokens in, action tokens out. Second, the bottleneck has stopped being algorithmic and started being the long tail of edge-case data. The implication for AGI timelines is non-trivial: both fields, by 2026, share the same shape of remaining problem.',
      },
      {
        heading: 'The Optimus section is more honest than expected',
        body:
          'Humanoid robotics has been the most over-promised category of the decade. Karpathy\'s treatment of Optimus is unusually careful. He flags the dexterity-versus-locomotion split, names what is hard ("manipulation in cluttered environments" is the phrase to remember), and stops short of timeline claims. If you have been confused about why humanoid demos look impressive but ship products do not, this is the twenty minutes that explains it.',
      },
      {
        heading: 'Why the conversation is hard to summarise',
        body:
          'A talk this long, with this many threads, resists the standard "5 key insights" treatment. The conversation is recursive — Karpathy returns to the same handful of ideas (scaling laws, data quality, architectural priors) from different angles, and the value is in watching the same idea mature across two hours. A VozClara pack captures this differently than a transcript would: it tracks the recurring concept across timestamps, so you can see when "data quality" first comes up at 0:47 and when it returns at 2:31 with a stronger claim.',
      },
    ],
    takeaway:
      'The most useful AGI primer of the year is also the one that refuses to give you a timeline.',
    relatedSlugs: ['andrew-huberman-dopamine-motivation', 'veritasium-speed-of-light'],
    metaTitle: 'Karpathy on AGI — a reading note on the Lex Fridman interview',
    metaDescription:
      'An editorial note on Lex Fridman’s 3.5-hour conversation with Andrej Karpathy — the AGI frame, self-driving as the canary, and why the talk is hard to summarise.',
  },

  // ─── Veritasium ─────────────────────────────────────────────────
  {
    slug: 'veritasium-speed-of-light',
    creator: 'Veritasium',
    creatorHandle: 'veritasium',
    videoTitle: 'Why No One Has Measured The Speed Of Light',
    youtubeId: 'pTn6Ewhb27k',
    publishedDate: '2020-10-31',
    durationMin: 19,
    topics: ['physics', 'philosophy of science', 'epistemology'],
    lang: 'en',
    intro:
      'The Veritasium episode that, more than any other, taught a generation to be suspicious of textbook physics. Twenty minutes, one argument, a quiet philosophical bomb under a number every student knew by heart.',
    sections: [
      {
        heading: 'The claim is genuinely strange',
        body:
          'No one has measured the one-way speed of light. We have measured the round-trip speed exhaustively. But the one-way speed — photon leaves here, arrives there, and only there — has never been directly measured, and there are deep reasons to believe it never can be. Derek Muller spends the episode explaining why, and the answer is more interesting than the headline.',
      },
      {
        heading: 'Synchronisation is the trick',
        body:
          'To measure a one-way speed you need two synchronised clocks. To synchronise two distant clocks you need to send a signal between them. To know how long that signal took, you need to know the speed of the signal. The circle closes. Einstein, asked about this in the 1905 paper, did not so much solve it as choose: he assumed the one-way speed equals the round-trip average, called it a convention, and built relativity on it. Most physics curricula skip the "convention" part.',
      },
      {
        heading: 'Why this matters beyond physics',
        body:
          'The episode\'s second half quietly generalises. Many scientific constants we treat as measured are actually conventions — choices that nothing in the data forces. This is not a relativist position; the choices are well-defended. But it is a reminder that the line between "measured" and "assumed" is fuzzier in physics than the textbooks admit, and noticing this is the entry point into philosophy of science.',
      },
      {
        heading: 'What the episode does well',
        body:
          'Muller is rare among science YouTubers in that he tolerates the audience\'s discomfort. The video does not resolve into a satisfying "but here\'s how we know". It ends with the question still open. The implicit lesson — that some scientific questions are settled by convention rather than measurement — sticks because the video refuses to soften it. This is the kind of essay-as-video that deserves a knowledge pack you can re-open at 2am next year.',
      },
    ],
    takeaway:
      'The one-way speed of light is a convention, not a measurement — and noticing this is how you start to read physics carefully.',
    relatedSlugs: ['lex-fridman-andrej-karpathy-agi', 'andrew-huberman-sleep-toolkit'],
    metaTitle: 'No one has measured the speed of light — a note on the Veritasium episode',
    metaDescription:
      'An editorial note on Veritasium’s "Why No One Has Measured The Speed Of Light" — the synchronisation problem, why Einstein called it a convention, and what it means for reading physics carefully.',
  },

  // ─── Naval Ravikant ─────────────────────────────────────────────
  {
    slug: 'naval-ravikant-how-to-get-rich',
    creator: 'Naval Ravikant',
    creatorHandle: 'naval',
    videoTitle: 'How to Get Rich (Without Getting Lucky)',
    youtubeId: '1-TZqOsVCNM',
    publishedDate: '2020-03-13',
    durationMin: 191,
    topics: ['wealth', 'leverage', 'specific knowledge', 'startups'],
    lang: 'en',
    intro:
      'Naval Ravikant\'s "How to Get Rich" is the most influential business-philosophy talk of the last decade. It is also, deliberately, the least quotable — Naval refuses to give the listener a list to screenshot.',
    sections: [
      {
        heading: 'The thesis hidden inside the title',
        body:
          'The phrase "how to get rich" is bait. The actual argument is that wealth (assets that earn while you sleep) and money (income from your time) are two different categories that the language collapses. Naval spends the first hour separating them. Once you see the distinction, the rest of the talk reads as practical: most career advice optimises for money and leaves wealth on the table.',
      },
      {
        heading: 'Specific knowledge is the load-bearing concept',
        body:
          'If the talk has a single keystone, it is "specific knowledge" — the things you know that cannot be taught in a classroom, that come from doing the thing for years, that the market cannot easily commodify. Naval\'s point is not that you should pick a niche; it is that the niches you can defend are the ones that emerged from genuine curiosity over a decade. This is not a productivity hack. It is a slow argument.',
      },
      {
        heading: 'Leverage, properly defined',
        body:
          'The "four forms of leverage" framing — labour, capital, code, media — has been quoted to death in tweet threads. The talk\'s version is more careful than the screenshots suggest. Naval is explicit that code and media are the new, asymmetric leverages — they let one person reach billions — but he is equally explicit that they only work when applied to specific knowledge you actually have. Without that anchor, leverage amplifies noise.',
      },
      {
        heading: 'Why the talk wears well',
        body:
          'Most business-advice content ages badly. Naval\'s talk has held up since 2019 because the underlying concepts are about how value gets created — not about which tools to use this quarter. The specific examples (crypto, Substack, AI) update; the model does not. This is why people re-listen yearly. A knowledge pack of the talk is, in this sense, almost a journal entry — you read the same notes a year apart and notice what you finally understand.',
      },
    ],
    takeaway:
      'Wealth and income are different categories — and specific knowledge is the thing the market cannot commoditise.',
    relatedSlugs: ['andrew-huberman-dopamine-motivation', 'lex-fridman-andrej-karpathy-agi'],
    metaTitle: 'Naval’s "How to Get Rich" — a reading note',
    metaDescription:
      'An editorial note on Naval Ravikant’s "How to Get Rich (Without Getting Lucky)" — the wealth-vs-income split, specific knowledge as the keystone, and why the talk wears well.',
  },

  // ─── Andrew Huberman — second batch ──────────────────────────────
  {
    slug: 'andrew-huberman-caffeine-protocol',
    creator: 'Andrew Huberman',
    creatorHandle: 'hubermanlab',
    videoTitle: 'Using Caffeine to Optimize Mental and Physical Performance',
    youtubeId: 'iw97uvIge7c', // TODO(verify): cross-check with hubermanlab.com episode catalogue
    publishedDate: '2022-07-25',
    durationMin: 132,
    topics: ['caffeine', 'cognition', 'sleep', 'performance', 'neuroscience'],
    lang: 'en',
    intro:
      'Of all Huberman’s "toolkit" episodes, the caffeine one gets recommended the least and changes behaviour the most. The talk is uncomfortable in a useful way — it asks you to give up the habit you defend most, and offers a calmer version in return.',
    sections: [
      {
        heading: 'Delay, do not eliminate',
        body:
          'The argument is not anti-coffee. Huberman is explicit that caffeine in the right window is one of the few legal, well-studied performance enhancers we have. The intervention is timing: wait 90 to 120 minutes after waking before the first cup. The mechanism is adenosine clearance — your morning grogginess is the brain finishing a metabolic chore that caffeine, if drunk too early, masks rather than completes. Mask it for years and the afternoon crash becomes structural.',
      },
      {
        heading: 'The afternoon cutoff is the second lever',
        body:
          'The episode is unusually precise about a 10-hour cutoff before sleep — meaning a 6 a.m. riser stops by 2 p.m., not 4. The half-life argument is the obvious one (caffeine has a 5–7 hour active span, plus a long tail), but Huberman pairs it with sleep-architecture data: even when you fall asleep after a late coffee, deep sleep is measurably reduced. The night feels normal; the next day is not.',
      },
      {
        heading: 'Tolerance and the "reset"',
        body:
          'A short section in the middle of the episode is the most useful — and the most ignored. Heavy users (300+ mg daily) lose most of the cognitive benefits within weeks; what they feel as "the lift" is mostly withdrawal relief. Huberman’s suggested reset is two to four caffeine-free weeks once or twice a year. The cost is one bad week; the return is the next year of coffee actually doing what it’s supposed to.',
      },
      {
        heading: 'Where the science is honest about what it does not know',
        body:
          'The episode is candid about the gaps: caffeine + meditation interactions, ADHD-medication overlap, individual genetic variability (the CYP1A2 polymorphism gets fifteen minutes of careful nuance). Huberman names the unknowns rather than papering them over. The honesty is what makes the protocol feel earned rather than evangelical.',
      },
      {
        heading: 'What a pack does with this',
        body:
          'A 132-minute talk on a single molecule is too long for most people to re-listen to. A VozClara pack captures the four or five protocols on a single screen — the 90-minute window, the 10-hour cutoff, the annual reset, the genetic caveat — without losing the citations that make the talk trustworthy. The pack does not replace the episode; it makes the episode actionable on a Tuesday morning a year from now.',
      },
    ],
    takeaway:
      'Move your first coffee, mind your last one, and reset once a year — most of the rest is folklore.',
    relatedSlugs: ['andrew-huberman-sleep-toolkit', 'andrew-huberman-dopamine-motivation'],
    metaTitle: 'Huberman on caffeine — what the 2-hour episode actually argues',
    metaDescription:
      'A reading note on Andrew Huberman’s caffeine toolkit — the 90-minute delay, the 10-hour cutoff, the annual reset, and how to make the protocols stick.',
  },
  {
    slug: 'andrew-huberman-cold-exposure',
    creator: 'Andrew Huberman',
    creatorHandle: 'hubermanlab',
    videoTitle: 'The Science & Use of Cold Exposure for Health and Performance',
    youtubeId: 'pq6WHJzOkno', // TODO(verify): episode 66 of HubermanLab
    publishedDate: '2022-04-04',
    durationMin: 109,
    topics: ['cold exposure', 'metabolism', 'dopamine', 'recovery'],
    lang: 'en',
    intro:
      'The cold-plunge episode is the one most often misquoted on social media. Strip away the screenshot culture and the underlying talk is restrained: a careful map of what cold reliably does, what it might do, and what it absolutely does not.',
    sections: [
      {
        heading: 'Why "dopamine 250%" is technically true and broadly misleading',
        body:
          'The famous chart shows a sustained dopamine rise after cold-water immersion — real, well-replicated, and the source of most of the talk’s viral moments. Huberman is the first to say it is not what most viewers think it is. The lift lasts hours, not minutes; the effect is on tonic baseline, not on the peak you experience while sitting in the bath. Mistaking one for the other is why people start cold-plunging for mood and quit when it doesn’t feel euphoric in week one.',
      },
      {
        heading: 'The protocol is short and unsexy',
        body:
          'A useful weekly cold dose, per the episode, is roughly 11 minutes total — three to five sessions of one to three minutes each, anywhere between 1 °C and 10 °C, cold enough to be deeply uncomfortable but not dangerous. That is it. The variations (intervals, contrast showers, ice-vest training) are mostly second-order. Huberman returns to the 11-minute number explicitly to short-circuit the "more is better" misreading.',
      },
      {
        heading: 'What cold does not do, despite the marketing',
        body:
          'The episode is unusually clear about the brown-fat metabolism story being weaker than internet culture has packaged it. Cold does upregulate brown adipose tissue activity. It does not, however, produce the dramatic weight-loss effects often quoted, and Huberman names the misread papers by year. The protocol is a stress-tolerance intervention with a side benefit, not a metabolic shortcut.',
      },
      {
        heading: 'Where the talk earns its length',
        body:
          'The careful section is the contraindications. People on certain blood-pressure medications, with Raynaud’s, with cardiovascular conditions, pregnant — the talk does not just flag them, it spends fifteen minutes walking through the physiology of each. This is the section the screenshots never quote, and the section most worth keeping in the pack.',
      },
    ],
    takeaway:
      'Cold exposure is a stress-tolerance practice with a real dopamine tail — and it is shorter, less frequent, and less photogenic than the internet sells it as.',
    relatedSlugs: ['andrew-huberman-sleep-toolkit', 'andrew-huberman-dopamine-motivation'],
    metaTitle: 'Huberman on cold exposure — 11 minutes a week, not what the screenshots say',
    metaDescription:
      'A reading note on Andrew Huberman’s cold-exposure episode — what the dopamine rise actually means, the 11-minute weekly protocol, and the contraindications the screenshots never quote.',
  },
  {
    slug: 'andrew-huberman-morning-routine',
    creator: 'Andrew Huberman',
    creatorHandle: 'hubermanlab',
    videoTitle: 'The Optimal Morning Routine (compilation)',
    youtubeId: 'AY7HD7zsAvE', // TODO(verify): pulled from "morning routine" compilation reel
    publishedDate: '2023-03-13',
    durationMin: 24,
    topics: ['morning routine', 'circadian rhythm', 'productivity', 'habits'],
    lang: 'en',
    intro:
      'The compiled "morning routine" reel is the easiest Huberman entry point — twenty-four minutes pulled together from the longer Sleep and Dopamine episodes. It is also the talk that quietly contradicts most of the productivity-Twitter morning-routine genre.',
    sections: [
      {
        heading: 'There is no morning routine — there is a morning sequence',
        body:
          'Huberman never says "do these ten things". The compilation makes the ordering explicit instead: light first, hydration second, movement third, caffeine fourth, work fifth. Each step preconditions the next. Doing them out of order is most of what wastes the morning. The reel is short on purpose — the protocol is operational, not philosophical.',
      },
      {
        heading: 'The first ten minutes are the only ones that matter',
        body:
          'If you only do one thing from the talk, do this: get outside, eyes open, within twenty minutes of waking, for two to ten minutes depending on the cloud cover. The argument is not motivational. It is mechanical — the suprachiasmatic nucleus locks the day’s cortisol curve in those minutes, and a misset curve costs you alertness for the next sixteen hours. Everything else in the routine compensates for or amplifies what happens in those first ten.',
      },
      {
        heading: 'Why the talk is anti-aesthetic',
        body:
          'The morning-routine genre on YouTube is built on cold plunges, journals, and Notion templates. The Huberman compilation is hostile to all three. He is explicit that journals are optional, that cold plunges belong elsewhere in the week, and that productivity apps are downstream of biology. The reel reads almost like a reaction video to the genre it belongs to.',
      },
      {
        heading: 'The discipline is staying boring',
        body:
          'The closing minute is the one most worth keeping. Huberman says, almost in passing, that the people he sees stick with the protocol are the ones who never optimise it further — they find the four or five things that work, do them every day, and refuse to add a sixth. The implication is unflattering to productivity culture: the routine works in proportion to how aggressively you resist improving it.',
      },
    ],
    takeaway:
      'A morning that works is a sequence, not a stack — and the discipline is staying boring once you’ve found yours.',
    relatedSlugs: ['andrew-huberman-sleep-toolkit', 'andrew-huberman-caffeine-protocol'],
    metaTitle: 'Huberman’s morning sequence — short, ordered, anti-aesthetic',
    metaDescription:
      'A reading note on Andrew Huberman’s morning-routine compilation — light first, why the first ten minutes are the only ones that matter, and the discipline of staying boring.',
  },

  // ─── Lex Fridman — second batch ─────────────────────────────────
  {
    slug: 'lex-fridman-sam-altman-openai',
    creator: 'Lex Fridman',
    creatorHandle: 'lexfridman',
    videoTitle: 'Sam Altman: OpenAI, GPT-5, Sora, AGI, Future of AI',
    youtubeId: 'jvqFAi7vkBc', // TODO(verify): Lex #419, recorded March 2024
    publishedDate: '2024-03-18',
    durationMin: 122,
    topics: ['openai', 'agi', 'gpt-5', 'sam altman', 'ai safety'],
    lang: 'en',
    intro:
      'The Sam Altman re-appearance on Lex Fridman — months after the board-coup episode — is the one to listen to if you want the OpenAI worldview without the press training. It is more candid than the keynotes and less defensive than the earnings calls.',
    sections: [
      {
        heading: 'The November-coup section is the most-quoted, least-useful one',
        body:
          'Lex opens with the board-firing aftermath because it is the conversation everyone wants. Altman gives a careful, lawyered answer that is honest about the timeline and reticent on the people. The section is worth listening to once, taking nothing away from it but the texture of his post-trauma posture, and moving on. The interesting episode starts around minute 35.',
      },
      {
        heading: 'AGI is no longer the rhetorical anchor it was',
        body:
          'A subtle shift through the conversation: Altman talks about AGI noticeably less than he did in the 2022 episode. The frame has moved to "useful AI" — capability without the loaded definitional baggage. The shift is partly strategic (the term has cooled with the public) but partly genuine (the field’s researchers are themselves debating whether the boundary still makes sense). The conversation is more interesting after this concession.',
      },
      {
        heading: 'Where the safety conversation actually lives now',
        body:
          'The most useful forty minutes are on alignment as an empirical discipline rather than a philosophical one. Altman is concrete about how the company evaluates jailbreaks, what red-teaming does and does not catch, the role of post-training versus pre-training in shaping behaviour. The discussion is technical without being inaccessible — the kind of thing a generalist viewer can follow with a pack to refer back to.',
      },
      {
        heading: 'What Lex does well that other interviewers do not',
        body:
          'The episode is a useful reminder that Lex’s style — slow, repetitive in good faith, willing to ask the obvious question — is hard to imitate. He gets Altman to say things in the simple, take-it-or-leave-it way that he never quite reaches on stage. The format is what produces the value; transcripts of the episode read flat compared to the audio.',
      },
    ],
    takeaway:
      'AGI has quietly stopped being the rhetorical anchor — and the interesting part of the OpenAI worldview is now in the empirics, not the manifesto.',
    relatedSlugs: ['lex-fridman-andrej-karpathy-agi', 'lex-fridman-demis-hassabis-deepmind'],
    metaTitle: 'Lex × Sam Altman — what shifted since the board coup',
    metaDescription:
      'A reading note on Lex Fridman’s second Sam Altman interview — why AGI rhetoric has cooled, where the safety conversation actually lives now, and what Lex does that other interviewers can’t.',
  },
  {
    slug: 'lex-fridman-demis-hassabis-deepmind',
    creator: 'Lex Fridman',
    creatorHandle: 'lexfridman',
    videoTitle: 'Demis Hassabis: DeepMind, AGI, AlphaFold, Gemini',
    youtubeId: 'Gfr50f6ZBvo', // TODO(verify): late-2024 Hassabis episode
    publishedDate: '2024-12-10',
    durationMin: 175,
    topics: ['deepmind', 'agi', 'alphafold', 'gemini', 'demis hassabis'],
    lang: 'en',
    intro:
      'The three-hour Hassabis episode is the patient sibling of the Altman one — slower, less defensive, more interested in the science than the company. If the Altman conversation is about navigating a moment, the Hassabis conversation is about navigating a career.',
    sections: [
      {
        heading: 'AlphaFold remains the cleanest argument for the field',
        body:
          'Hassabis returns to AlphaFold in the first half-hour, and the reason is not nostalgic. The system solved a fifty-year-old problem in biology in a way that is now used by hundreds of thousands of labs, and it did so by combining domain priors with deep learning in a way that almost nothing in the LLM era has reproduced. The talk uses it as a reference point for what AI can do when it has a clean objective — and as a quiet rebuke to the everything-is-a-chatbot framing.',
      },
      {
        heading: 'The Gemini section is where DeepMind disagrees with itself',
        body:
          'Hassabis is more transparent than expected about the internal tensions at Google DeepMind — the research-versus-product compromises, the merge with Google Brain, the cultural mismatch in early Gemini releases. He does not vent; he describes. The section is unusual in tech-interview podcasting because it admits that organisational decisions shaped the science as much as the other way around.',
      },
      {
        heading: 'The AGI definition he uses is narrower than the press version',
        body:
          'Hassabis is careful about not collapsing "AGI" into a single moment. His working definition is roughly "a system that can match top-percentile human performance across most cognitive tasks within a reasonable wall-clock budget" — a high bar, but a measurable one. Compared to the loose definitions in circulation, his is closer to a project plan than a slogan.',
      },
      {
        heading: 'What three hours give you that twenty minutes cannot',
        body:
          'The episode is long enough that Lex’s slow style finally pays off. Hassabis warms up, drops the rehearsed answers around minute 90, and the final hour is the most candid public statement from any DeepMind founder in years. A pack of the episode is essentially a single-page bibliography of where Hassabis thinks the science is going.',
      },
    ],
    takeaway:
      'Hassabis’s AGI is narrower than the press version — and the patient three-hour format is the one that gets it out of him.',
    relatedSlugs: ['lex-fridman-sam-altman-openai', 'lex-fridman-andrej-karpathy-agi'],
    metaTitle: 'Lex × Demis Hassabis — DeepMind, AlphaFold, and a narrower AGI',
    metaDescription:
      'A reading note on Lex Fridman’s Demis Hassabis interview — why AlphaFold is the cleanest argument for the field, the Gemini section that admits internal tensions, and a narrower AGI definition.',
  },

  // ─── Veritasium — second batch ──────────────────────────────────
  {
    slug: 'veritasium-quantum-entanglement',
    creator: 'Veritasium',
    creatorHandle: 'veritasium',
    videoTitle: 'How Quantum Entanglement Was Proven, In One Brilliant Experiment',
    youtubeId: 'tafGL02EUOA', // TODO(verify): 2023 Bell-test explainer
    publishedDate: '2023-09-21',
    durationMin: 21,
    topics: ['quantum mechanics', 'entanglement', 'physics', 'bell test'],
    lang: 'en',
    intro:
      'Most popular explanations of quantum entanglement crumble under their own metaphors — "spooky action at a distance" doing the work that the maths should. Derek Muller’s twenty-one minutes are the rare exception: the metaphor is held precisely as long as it earns its keep.',
    sections: [
      {
        heading: 'The historical setup is the part most other videos skip',
        body:
          'The first nine minutes are about the EPR paradox of 1935 — Einstein, Podolsky, and Rosen arguing that quantum mechanics had to be incomplete because the alternative was absurd. Most popular videos rush past this; Muller treats it as the load-bearing question, because the experiments that closed it took fifty years and four Nobel prizes. Knowing what was being argued about makes the resolution legible.',
      },
      {
        heading: 'Bell\'s theorem, finally explained without the cartoon',
        body:
          'The middle section earns the running time. Muller walks through the inequality with paper cards, polariser angles, and a back-of-envelope calculation any viewer can follow. The trick is that he never simplifies away the actual maths — the 22.5° detector setting and the cos²θ probability stay in the explanation, because removing them is what makes most explanations meaningless.',
      },
      {
        heading: 'The 2022 Nobel matters more than the press said',
        body:
          'Aspect, Clauser, and Zeilinger received the Nobel for proving the universe really is non-local. The video makes a careful, well-cited case for why the 2022 prize is more philosophically consequential than it was treated in the press — it closed the last loopholes that defenders of "local hidden variables" had retreated to. The science press, focused on AI that month, mostly missed it.',
      },
      {
        heading: 'Where the video is honest about what entanglement does not do',
        body:
          'The closing minutes are the corrective. Entanglement does not let you send signals faster than light. It does not power telepathy, healing crystals, or quantum-marketed startups. Muller is direct about the misuse, with a level of patience that suggests he has been corrected on Twitter many times. The pack version of this section is the one to save.',
      },
    ],
    takeaway:
      'Entanglement is stranger than common intuition and less magical than the marketing — and the patient explanation is the only one worth keeping.',
    relatedSlugs: ['veritasium-speed-of-light', 'lex-fridman-demis-hassabis-deepmind'],
    metaTitle: 'Veritasium on quantum entanglement — the patient explanation',
    metaDescription:
      'A reading note on Derek Muller’s Bell-theorem explainer — why the historical setup matters, the maths he refuses to skip, and what entanglement absolutely does not let you do.',
  },
  {
    slug: 'veritasium-bayes-theorem',
    creator: 'Veritasium',
    creatorHandle: 'veritasium',
    videoTitle: 'The Bayesian Trap',
    youtubeId: 'R13BD8qKeTg',
    publishedDate: '2017-04-05',
    durationMin: 10,
    topics: ['bayes theorem', 'probability', 'medical testing', 'cognition'],
    lang: 'en',
    intro:
      'The "Bayesian Trap" is the Veritasium video most often shown in first-year statistics seminars, and the one most often misunderstood by the people sharing the screenshot. The argument is not "Bayes’ theorem solves cognition" — it is the opposite.',
    sections: [
      {
        heading: 'The medical-test framing is the right hook',
        body:
          'Muller opens with a classic puzzle: a test for a rare disease is 99% accurate, you test positive, what is the probability you actually have it? The intuitive answer is "99%". The actual answer, for a disease with 0.1% base rate, is closer to 9%. Most viewers feel the gap immediately. The setup is the kind that earns the rest of the video — you cannot leave the puzzle alone until you understand why your gut was wrong.',
      },
      {
        heading: 'The theorem is the easy part',
        body:
          'Bayes’ theorem itself takes maybe ninety seconds to derive. Muller does it cleanly, with no formula-anxiety, and the algebra is essentially "what fraction of the positive tests are true positives". The mathematical content of the video is unintimidating; the point of the video is not the maths.',
      },
      {
        heading: 'The "trap" is the second half nobody quotes',
        body:
          'Once you have the framework, Muller walks through the iterative trap: if you update on your prior, and your prior was wrong, repeated Bayesian updates can lock you into the wrong belief more firmly with every data point. The example is sobering: a person who holds a false belief and then reads anecdotal evidence consistent with it will rationally become more confident in the false belief over time, because every data point fits the prior. Bayes is not a cure; it is a method that respects whatever you bring to it.',
      },
      {
        heading: 'Where the video lands',
        body:
          'The closing is unusually epistemic for a ten-minute YouTube science video: pick your priors carefully, seek out evidence that would update them downward as well as upward, and beware of the version of you that has been Bayes-ing in one direction for too long. None of this is a productivity tip. All of it is a way of holding beliefs that survives contact with the internet.',
      },
    ],
    takeaway:
      'Bayes’ theorem does not protect you from being wrong — it amplifies whatever prior you brought to the data.',
    relatedSlugs: ['veritasium-speed-of-light', 'veritasium-quantum-entanglement'],
    metaTitle: 'Veritasium’s "Bayesian Trap" — what the screenshot misses',
    metaDescription:
      'A reading note on Derek Muller’s "Bayesian Trap" — the medical-test hook, why the theorem itself is the easy part, and the iterative trap nobody quotes.',
  },

  // ─── Naval Ravikant — second batch ──────────────────────────────
  {
    slug: 'naval-ravikant-reading-philosophy',
    creator: 'Naval Ravikant',
    creatorHandle: 'navalravikant',
    videoTitle: 'How to Read Better and Faster',
    youtubeId: 'XQRG54nNiPI', // TODO(verify): Naval reading-philosophy clip
    publishedDate: '2020-01-15',
    durationMin: 9,
    topics: ['reading', 'learning', 'attention', 'first principles'],
    lang: 'en',
    intro:
      'The nine-minute Naval clip on reading has been re-uploaded so many times that the original timestamps are hard to find. The argument is shorter than the YouTube reaction-video genre suggests, and stranger.',
    sections: [
      {
        heading: 'Quit the book',
        body:
          'The framing claim is the one people post: most books are bad and you should put them down without finishing. Naval’s version of this is more careful than the screenshots — he is not saying skim, he is saying that the cost of continuing a book that is not teaching you something is the next book you could be reading instead. Treating reading as a flow of partial books rather than a queue of completed ones is the entire shift.',
      },
      {
        heading: 'Read what you can re-read',
        body:
          'A point easy to miss: the books worth finishing are the ones you will come back to. The original quote is roughly "read what you can re-read", and the operational consequence is that the books worth your time are usually older than you expect. Naval names the survivorship-bias argument explicitly — books that have been in print for fifty years are in print for a reason, and the new bestseller list is mostly noise.',
      },
      {
        heading: 'The maths-and-science-first frame',
        body:
          'The clip’s most provocative section: Naval argues that if you are going to read deeply in one direction, start with mathematics, then physics, then biology, then the social sciences, in that order. The argument is that each successive layer is built on the one beneath, and you cannot fully read above your foundation. It is an unfashionable claim that most viewers ignore — and that the ones who follow it report changing how they think about books for life.',
      },
      {
        heading: 'Where the clip ends and the practice begins',
        body:
          'The video itself does not give you a reading list. It gives you a posture: pick books like you pick friends, quit the wrong ones early, re-read the right ones often, and ground your reading in disciplines deeper than the headlines. The practice is what you do for the next decade — the clip is the prompt.',
      },
    ],
    takeaway:
      'Read fewer books, finish fewer, re-read more — and start deeper in the stack than feels comfortable.',
    relatedSlugs: ['naval-ravikant-how-to-get-rich', 'tim-ferriss-naval-decision-making'],
    metaTitle: 'Naval on reading — quit the book, re-read the right ones',
    metaDescription:
      'A reading note on Naval Ravikant’s nine-minute reading clip — quit early, re-read often, and start deeper in the stack than feels comfortable.',
  },

  // ─── Tim Ferriss × Naval ─────────────────────────────────────────
  {
    slug: 'tim-ferriss-naval-decision-making',
    creator: 'Tim Ferriss',
    creatorHandle: 'TimFerriss',
    videoTitle: 'Naval Ravikant — The Person I Call Most for Startup Advice',
    youtubeId: 'HiYo14wylQw', // TODO(verify): Ferriss Show #97 audio-only YT upload
    publishedDate: '2015-08-18',
    durationMin: 117,
    topics: ['naval ravikant', 'decision making', 'startups', 'angel investing'],
    lang: 'en',
    intro:
      'The 2015 Tim Ferriss × Naval episode is the conversation that turned Naval from a respected angel into the public intellectual the internet now quotes. It is also the last time he gave the long, rambling, unedited version of his framework — every later interview is a refinement.',
    sections: [
      {
        heading: 'The episode is more textured than the tweet-thread version',
        body:
          'Almost everything Naval has said in the decade since is in this conversation, somewhere — but in the original form, surrounded by the qualifications and second-thoughts that the later "Almanack" book strips out. Listening to it is unusually clarifying, because you hear Naval thinking through the framework rather than presenting it. The talk is what an argument sounds like before it becomes a brand.',
      },
      {
        heading: 'Decision-making as the keystone',
        body:
          'The conversation’s spine is decision-making, and Tim is unusually disciplined about returning to it whenever Naval drifts. The takeaway most people miss: Naval’s argument is not "make decisions faster" but "make irreversible decisions slowly, reversible ones fast". The asymmetry is the entire point. Most productivity-talk loses this distinction by minute ten; the Tim-and-Naval format preserves it for two hours.',
      },
      {
        heading: 'The angel-investing thread is the practical chapter',
        body:
          'A long section in the middle is on Naval’s angel-investing strategy — the part that AngelList grew out of. The technical content has dated (the funding landscape has shifted, SAFE notes won, valuations have inflated), but the meta-content has not. He explains how to evaluate a founder rather than a deck, and the framework still applies. The pack of this section is the chapter most often saved.',
      },
      {
        heading: 'Why Tim is the right interviewer for Naval',
        body:
          'Tim’s gift is patience with the high-density guest. He lets Naval finish thoughts that other hosts would interrupt. He asks the second-order question after the first answer lands. He marks the timestamps that matter — and the result is the rare two-hour interview where the second hour is denser than the first. Most contemporary podcast formats cannot reproduce this; the episode is half time-capsule, half operating-manual.',
      },
    ],
    takeaway:
      'Make irreversible decisions slowly, reversible ones fast — and the rest of the framework rolls out from there.',
    relatedSlugs: ['naval-ravikant-how-to-get-rich', 'naval-ravikant-reading-philosophy'],
    metaTitle: 'Tim Ferriss × Naval — the conversation before the brand',
    metaDescription:
      'A reading note on Tim Ferriss’s 2015 Naval episode — decision-making as the keystone, the angel-investing chapter, and why Tim is the right interviewer for the high-density guest.',
  },

  // ─── Cal Newport ─────────────────────────────────────────────────
  {
    slug: 'cal-newport-deep-work-talk',
    creator: 'Cal Newport',
    creatorHandle: 'calnewportmedia',
    videoTitle: 'Deep Work — Rules for Focused Success in a Distracted World',
    youtubeId: 'wmiJtKgYET8', // TODO(verify): Google Talks-style Newport lecture
    publishedDate: '2016-03-22',
    durationMin: 53,
    topics: ['deep work', 'focus', 'productivity', 'attention'],
    lang: 'en',
    intro:
      'The Cal Newport talk that launched the "Deep Work" genre is now nearly a decade old. It has aged better than almost any other productivity talk of that era — partly because the underlying claim has only become more right, partly because Newport refused to add tools.',
    sections: [
      {
        heading: 'The claim is narrower than the book made famous',
        body:
          'Deep Work, as defined in the talk, is "professional activity performed in a state of distraction-free concentration that pushes your cognitive capacities to their limit". Newport is careful that this is a small slice of any working day, not a lifestyle. The book’s readers often inflate this; the talk does not. The protocol is two to four hours a day at most, scheduled in advance, ring-fenced from interruption.',
      },
      {
        heading: 'Shallow work is the part nobody adopts',
        body:
          'The talk’s most useful concept is the counter-category: "shallow work" — the email, the calls, the coordination, the meetings. Newport’s point is not that shallow work is bad; it is that most knowledge workers have inverted the ratio. Shallow expands to fill all available time unless you actively bound it. The implication is uncomfortable: most jobs need 60–80% shallow work, and the protocol is about protecting the 20–40% that produces the actual output.',
      },
      {
        heading: 'The "deep work hypothesis" is testable',
        body:
          'Newport makes a falsifiable prediction in the talk: the ability to do deep work is becoming rarer and more valuable simultaneously, and individuals who cultivate it will earn an outsize share of the next decade’s opportunity. A decade on, the prediction has aged remarkably well — the AI-augmentation era amplifies the asymmetry rather than erases it. The pack version of this section is the one to keep.',
      },
      {
        heading: 'Why the talk refuses to recommend apps',
        body:
          'A small but telling moment: Newport refuses to name a single app, blocker, or notification-management tool. His argument is that tools are downstream of the discipline, and that anyone who needs an app to do deep work has not yet decided to do it. This is the section that dates the worst on first listen — and the section most worth re-reading every year, as you cycle through your own tool stack.',
      },
    ],
    takeaway:
      'Deep Work is a small daily slice protected from shallow expansion — and the tools you reach for are downstream of the decision to protect it.',
    relatedSlugs: ['naval-ravikant-reading-philosophy', 'andrew-huberman-morning-routine'],
    metaTitle: 'Cal Newport’s Deep Work talk — a decade on',
    metaDescription:
      'A reading note on Cal Newport’s "Deep Work" talk — the narrow definition, why shallow work expands, the testable hypothesis, and why Newport refuses to recommend apps.',
  },
];

/** Lookup helper — returns the note for a slug, or null. */
export function getCreatorNote(slug: string): CreatorNote | null {
  return CREATOR_NOTES.find((n) => n.slug === slug) ?? null;
}

/** Returns notes whose slugs are in the given list, in input order. */
export function getRelatedNotes(slugs: string[]): CreatorNote[] {
  return slugs
    .map((s) => getCreatorNote(s))
    .filter((n): n is CreatorNote => n !== null);
}

/** Full URL for the YouTube source — used in the "listen to original" link. */
export function youtubeUrl(note: CreatorNote): string {
  return `https://www.youtube.com/watch?v=${note.youtubeId}`;
}
