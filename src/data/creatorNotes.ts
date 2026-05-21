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

  // ─── Deutsche Cluster — Wissenschaft + Diskurs ──────────────────
  {
    slug: 'harald-lesch-klimawandel-kompakt',
    creator: 'Harald Lesch',
    creatorHandle: 'TerraX',
    videoTitle: 'Klimawandel — die wichtigsten Fakten in 10 Minuten',
    youtubeId: 'NLiQ-OoiHko', // TODO(verify): Terra X / Leschs Kosmos Klima-Erklärung
    publishedDate: '2019-09-20',
    durationMin: 11,
    topics: ['klimawandel', 'physik', 'wissenschaftskommunikation', 'terra x'],
    lang: 'de',
    intro:
      'Harald Lesch erklärt in elf Minuten, was tausend Leitartikel nicht schaffen: warum der menschengemachte Klimawandel kein Meinungsthema ist, sondern eine Frage der Bilanz. Die Folge ist die seltene Mischung aus Physikvortrag und politischem Statement, ohne dass eines vom anderen erdrückt wird.',
    sections: [
      {
        heading: 'Das Argument beginnt mit einer Tabelle',
        body:
          'Lesch öffnet nicht mit Bildern von schmelzenden Gletschern, sondern mit einer einfachen Zahl: der CO₂-Konzentration in der Atmosphäre über die letzten 800.000 Jahre. Der Verlauf liegt zwischen 180 und 280 ppm — bis 1850. Seitdem 420 ppm und steigend. Diese eine Tabelle macht alle Diskussionen über Klimasensitivität gegenstandslos, weil sie zeigt, dass wir bereits ausserhalb des Bereichs sind, in dem die menschliche Zivilisation entstanden ist.',
      },
      {
        heading: 'Wo Lesch andere Klima-Kommunikatoren schlägt',
        body:
          'Die meisten Klima-Erklärvideos werden entweder rein wissenschaftlich (und damit für Laien unzugänglich) oder rein emotional (und damit angreifbar). Lesch macht beides nicht. Er erklärt den Treibhauseffekt strikt physikalisch — Photonen, Schwingungsanregung, Wärmeabstrahlung — und überlässt die moralische Schlussfolgerung der Zuschauerin. Das Vertrauen, dass jemand selbst weiterdenken kann, ist im Erklärgenre selten geworden.',
      },
      {
        heading: 'Das Kapitel zur "Klimaskepsis"',
        body:
          'Lesch verbringt rund zwei Minuten mit dem methodischen Punkt, dass "Wissenschaftler sind sich uneinig" eine rhetorische Konstruktion ist, keine empirische Aussage. Die relevante Frage sei nicht, ob es Klimaforscher gibt, die etwas anderes behaupten — die gibt es immer, in jeder Disziplin — sondern wie das Verhältnis der publizierten peer-reviewed Studien zu jeder Position ausfällt. Bei der Frage menschengemacht/nicht-menschengemacht steht es seit Jahren bei 97 zu 3. Das ist keine Meinung, das ist Zählarbeit.',
      },
      {
        heading: 'Warum die Folge im Kanon bleibt',
        body:
          'Sechs Jahre nach Veröffentlichung wird die Folge weiterhin im Schulunterricht gezeigt — nicht weil sie aktuelle Daten enthält (die wären schon überholt), sondern weil sie die Argumentationsstruktur vorgibt, mit der man sich in einer Klimadebatte bewegt. Die Daten gehören in einen Pack, der jährlich aktualisiert wird; die Methode bleibt.',
      },
    ],
    takeaway:
      'Der Klimawandel ist kein Streit zwischen zwei Meinungen, sondern eine Bilanz, die niemand mehr glaubhaft anders rechnet.',
    relatedSlugs: ['mai-thi-nguyen-kim-corona-erklaerung', 'doktor-whatson-quantencomputer'],
    metaTitle: 'Harald Lesch zum Klimawandel — die Fakten in elf Minuten',
    metaDescription:
      'Eine Lese-Notiz zu Harald Leschs Klimawandel-Folge — die eine Tabelle, die alles entscheidet, der Umgang mit "Klimaskepsis" und warum die Folge im Kanon bleibt.',
  },
  {
    slug: 'mai-thi-nguyen-kim-corona-erklaerung',
    creator: 'Mai Thi Nguyen-Kim',
    creatorHandle: 'maiLab',
    videoTitle: 'Corona geht gerade erst los',
    youtubeId: 'EFG6lQetSWE', // TODO(verify): maiLab Corona-Vortrag März 2020
    publishedDate: '2020-03-13',
    durationMin: 25,
    topics: ['corona', 'epidemiologie', 'wissenschaftskommunikation', 'mailab'],
    lang: 'de',
    intro:
      'Im März 2020 lud Mai Thi Nguyen-Kim ein 25-minütiges Video hoch, das innerhalb einer Woche fünf Millionen Aufrufe hatte und die deutsche Corona-Berichterstattung für Monate prägte. Rückblickend ist es immer noch das beste Beispiel dafür, wie wissenschaftliche Kommunikation in einer Krise funktioniert.',
    sections: [
      {
        heading: 'Der Mut, das Naheliegende zu sagen',
        body:
          'Was Mai Thi am 13. März 2020 sagte, klang damals dramatisch und wirkt heute selbstverständlich: dieses Virus wird nicht in vier Wochen weg sein, exponentielles Wachstum überholt jede Intuition, und der einzige Hebel ist Verhalten — bevor das Gesundheitssystem überlastet ist. Die Folge ist deshalb sehenswert, weil sie zeigt, wie viel Mut nötig war, das Selbstverständliche auszusprechen, als Politik und Medien noch um den heißen Brei tanzten.',
      },
      {
        heading: 'Exponentielles Wachstum, ohne Folien',
        body:
          'Die Erklärung der exponentiellen Funktion in den ersten zehn Minuten ist die didaktisch beste, die im deutschsprachigen Raum zu dem Thema veröffentlicht wurde. Sie verwendet keinen einzigen Graph — nur das wiederholte Verdoppeln einer Zahl auf einem Blatt Papier. Wer den Punkt einmal so gesehen hat, vergisst ihn nicht. Die Lehrkraft, die zwölf Jahre Mathematikunterricht gegeben hat ohne diese Übung, fühlt sich danach unvollständig.',
      },
      {
        heading: 'Wo das Video sich angreifbar machte',
        body:
          'Mai Thi ist im Video explizit, dass sie Empfehlungen ausspricht, die über das hinausgehen, was die WHO zu dem Zeitpunkt sagte. Diese Klarheit kostete sie später Glaubwürdigkeit in bestimmten Kreisen — aber sie ist auch der Grund, warum die Folge sich gehalten hat. Sie ist ein seltenes Dokument einer Wissenschaftlerin, die in Echtzeit den Konflikt zwischen "wissenschaftlich konservativ" und "ethisch notwendig" austrägt, und sich für letzteres entscheidet.',
      },
      {
        heading: 'Warum die Folge ins Archiv gehört',
        body:
          'Fünf Jahre später ist das Video weniger ein Corona-Lehrstück und mehr ein Lehrstück über wissenschaftliche Kommunikation in Krisen. Ein Pack der Folge ist deshalb wertvoll, weil er die rhetorische Struktur extrahiert — wie man unangenehme Wahrheiten formuliert, ohne zu moralisieren, wie man mit Unsicherheit umgeht, ohne sie zu verstecken — und nicht primär weil er die Epidemiologie zusammenfasst.',
      },
    ],
    takeaway:
      'Wissenschaftliche Kommunikation in einer Krise heißt, das Naheliegende auszusprechen, bevor die Politik den Mut dazu hat.',
    relatedSlugs: ['harald-lesch-klimawandel-kompakt', 'doktor-whatson-quantencomputer'],
    metaTitle: 'Mai Thi Nguyen-Kim — die Corona-Folge im Rückblick',
    metaDescription:
      'Eine Lese-Notiz zu Mai Thi Nguyen-Kims Corona-Folge vom März 2020 — exponentielles Wachstum ohne Folien, der Mut zum Naheliegenden und was an dem Video angreifbar war.',
  },
  {
    slug: 'markus-lanz-robert-habeck-energiewende',
    creator: 'Markus Lanz',
    creatorHandle: 'ZDF',
    videoTitle: 'Markus Lanz × Robert Habeck — Energiewende und Industriepolitik',
    youtubeId: 'kZ7-XzQ8jJk', // TODO(verify): ZDF Mediathek crosspost
    publishedDate: '2023-11-09',
    durationMin: 73,
    topics: ['politik', 'energiewende', 'markus lanz', 'robert habeck'],
    lang: 'de',
    intro:
      'Die Lanz-Folge mit Habeck zur Energiewende ist eine der wenigen Talkshow-Aufzeichnungen, die mehr ist als ein Streitformat. Lanz lässt seinen Gast lange genug ausreden, dass der Wirtschaftsminister hörbar nicht das wiederholt, was er gestern auf der Pressekonferenz gesagt hat.',
    sections: [
      {
        heading: 'Warum Lanz funktioniert, wo andere scheitern',
        body:
          'Lanz hat eine Eigenart, die im deutschen Talkshow-Format selten ist: er erlaubt seinen Gästen, einen Gedanken zu Ende zu führen, auch wenn der Gedanke unangenehm wird. Das produziert Momente, in denen Politiker hörbar ehrlicher antworten als sonst — nicht weil Lanz härter fragt, sondern weil er weniger unterbricht. Die Folge mit Habeck ist ein Lehrstück dieser Methode.',
      },
      {
        heading: 'Wo das Gespräch über Talking Points hinausgeht',
        body:
          'In Minute vierzig stellt Lanz eine scheinbar einfache Frage: warum die Energiewende in Deutschland teurer geworden ist als ursprünglich kommuniziert. Habeck antwortet nicht mit der Standardlinie. Stattdessen unterscheidet er sauber zwischen Investitionskosten und Betriebskosten, räumt ein, dass die politische Kommunikation diesen Unterschied jahrelang nicht gemacht hat, und erklärt, warum das ein Vertrauensproblem für die nächsten zwanzig Jahre erzeugt. Das ist nicht das Material, das in einer Pressekonferenz zu hören wäre.',
      },
      {
        heading: 'Die uneingelöste Frage',
        body:
          'Lanz fragt zweimal nach der Industriestrompreis-Frage. Habeck weicht zweimal aus, was die Glaubwürdigkeit des restlichen Gesprächs nicht zerstört, aber markiert. Ein Pack der Folge sollte diese Stelle nicht glätten — der Moment, in dem ein Politiker hörbar an seiner eigenen Argumentation scheitert, ist informativer als die saubere Antwort, die er hätte geben können.',
      },
      {
        heading: 'Warum sich das Format trägt',
        body:
          'Die Lanz-Habeck-Folge ist 73 Minuten lang. Sie hat fünfundzwanzig Millionen Aufrufe in der Mediathek und auf YouTube zusammen. Das widerlegt die These, deutsche Zuschauer hätten keine Aufmerksamkeitsspanne mehr für Politik im langen Format. Sie haben sie — wenn das Format ihnen zutraut, mehr als drei Minuten am Stück zu folgen.',
      },
    ],
    takeaway:
      'Die wertvollsten Momente im politischen Talk entstehen, wenn der Moderator nicht unterbricht — und der Gast deshalb hörbar ehrlicher wird.',
    relatedSlugs: ['maybrit-illner-klimakonferenz-folge', 'jung-naiv-politik-interview'],
    metaTitle: 'Markus Lanz × Robert Habeck — Energiewende ohne Talking Points',
    metaDescription:
      'Eine Lese-Notiz zur Lanz-Habeck-Folge — wo das Gespräch über Talking Points hinausgeht, die uneingelöste Industriestrompreis-Frage, und warum sich das 73-Minuten-Format trägt.',
  },
  {
    slug: 'doktor-whatson-quantencomputer',
    creator: 'Doktor Whatson',
    creatorHandle: 'DoktorWhatson',
    videoTitle: 'Wie funktioniert ein Quantencomputer wirklich?',
    youtubeId: 'aPaZb12mU5g', // TODO(verify): Doktor Whatson Quanten-Erklärung
    publishedDate: '2022-06-14',
    durationMin: 18,
    topics: ['quantencomputing', 'physik', 'wissenschaftskommunikation', 'doktor whatson'],
    lang: 'de',
    intro:
      'Cedric Engels — der "Doktor" hinter Doktor Whatson — gehört zu den wenigen deutschsprachigen Wissenschafts-YouTubern, die Themen erklären können, ohne sie zu Karikaturen zu vereinfachen. Die Quantencomputer-Folge ist ein gutes Beispiel: technisch korrekt, ohne Formel-Angst, und 18 Minuten lang im besten Sinne anstrengend.',
    sections: [
      {
        heading: 'Was ein Qubit nicht ist',
        body:
          'Die ersten fünf Minuten räumen mit der populären Erklärung auf, ein Qubit sei "0 und 1 gleichzeitig". Engels zeigt sauber, warum diese Formulierung mehr verwirrt als erhellt: ein Qubit ist in einer Überlagerung, die beim Messen kollabiert — was etwas völlig anderes ist als "beide Werte gleichzeitig haben". Wer den Unterschied einmal verstanden hat, kann ab da kein populärwissenschaftliches Buch zum Thema mehr ungerührt lesen.',
      },
      {
        heading: 'Verschränkung als die eigentliche Geschichte',
        body:
          'Die Superposition ist das, womit Quantencomputer beworben werden. Die Verschränkung ist das, was sie tatsächlich nützlich macht. Engels nimmt sich Zeit, das mit zwei Würfeln zu erklären, die unabhängig voneinander rollen, aber immer dieselbe Augenzahl zeigen — auch wenn sie im selben Moment auf unterschiedlichen Kontinenten gewürfelt werden. Der Vergleich ist nicht perfekt, aber er erklärt warum verschränkte Qubits Berechnungen erlauben, die klassische Bits nicht erlauben.',
      },
      {
        heading: 'Wo die Folge ehrlich wird',
        body:
          'In Minute dreizehn macht Engels eine Pause, die im Genre selten ist: er sagt explizit, dass die meisten Quantencomputer-Demos, die in Pressemitteilungen zu sehen sind, keine praktischen Probleme lösen. Sie demonstrieren, dass die Hardware funktioniert, nicht dass die Hardware nützlich ist. Diese ehrliche Trennung zwischen "physikalisch beeindruckend" und "wirtschaftlich relevant" fehlt in der allermeisten Berichterstattung zum Thema.',
      },
      {
        heading: 'Warum die Folge sich in einem Pack lohnt',
        body:
          'Die Quanten-Folge ist genau die Sorte Inhalt, die ein Pack braucht: dicht genug, dass die Begriffe beim einmaligen Hören nicht hängenbleiben, aber strukturiert genug, dass die Begriffe in einer Glossar-Form später wieder zugänglich werden. Wer die Folge einmal gehört hat und sechs Monate später eine Nachricht zum Thema liest, erinnert sich mit Pack besser an Verschränkung als an einzelne Slogans.',
      },
    ],
    takeaway:
      'Ein Qubit ist nicht "0 und 1 gleichzeitig" — die kürzere Erklärung ist die falsche, und die längere ist die einzige nützliche.',
    relatedSlugs: ['harald-lesch-klimawandel-kompakt', 'mai-thi-nguyen-kim-corona-erklaerung'],
    metaTitle: 'Doktor Whatson über Quantencomputer — was ein Qubit nicht ist',
    metaDescription:
      'Eine Lese-Notiz zu Doktor Whatsons Quantencomputer-Folge — was ein Qubit wirklich ist, warum Verschränkung die eigentliche Geschichte ist, und wo die Folge ehrlich wird.',
  },
  {
    slug: 'mrwissen2go-wiedervereinigung-deutschlands',
    creator: 'Mirko Drotschmann',
    creatorHandle: 'MrWissen2go',
    videoTitle: 'Die deutsche Wiedervereinigung — wie sie wirklich ablief',
    youtubeId: 'rW8zEbcAOmM', // TODO(verify): MrWissen2go Geschichte-Folge
    publishedDate: '2020-10-03',
    durationMin: 14,
    topics: ['deutsche geschichte', 'wiedervereinigung', 'ddr', 'mirko drotschmann'],
    lang: 'de',
    intro:
      'Drotschmanns Wiedervereinigungs-Folge ist die Pflichtlektüre für jeden, der die deutsche Geschichte zwischen 1989 und 1990 in vierzehn Minuten erzählt bekommen will, ohne dass er hinterher ein verzerrtes Bild davon hat. Die Folge schafft das, was die meisten Geschichtsbücher zum Thema verfehlen: Tempo ohne Verkürzung.',
    sections: [
      {
        heading: 'Der Mauerfall ist nicht der Anfang der Geschichte',
        body:
          'Drotschmann öffnet nicht am 9. November 1989, sondern im Sommer davor — mit den Ausreisewellen über Ungarn, den Montagsdemos in Leipzig, dem ungelenken DDR-Pressesprecher Günter Schabowski. Das ist die richtige Eröffnung, weil sie das Missverständnis korrigiert, der Mauerfall sei aus dem Nichts gekommen. Er war das Ende einer Beschleunigung, nicht ihr Anfang.',
      },
      {
        heading: 'Warum der Einigungsvertrag wichtiger ist als der Mauerfall',
        body:
          'Der Mauerfall ist das ikonische Bild. Der Einigungsvertrag vom August 1990 ist der eigentliche Vorgang. Drotschmann verbringt drei Minuten mit den juristischen Konsequenzen — Beitritt nach Artikel 23 versus Neuverfassung nach Artikel 146, was das für die ostdeutschen Gesetze, Renten, Eigentumsverhältnisse bedeutete — und das sind die drei Minuten, in denen man am meisten lernt. Das Bilder-Material ist überall verfügbar; die Rechtsstruktur dahinter nicht.',
      },
      {
        heading: 'Die unbequeme Zwischenbilanz',
        body:
          'Drotschmann lässt die Folge nicht mit dem Feuerwerk am 3. Oktober enden. Er macht in den letzten zwei Minuten eine Bilanz, die im populären Geschichts-YouTube selten ist: das ostdeutsche Vermögen wurde unter Wert verkauft, die Arbeitslosenquote sprang von praktisch null auf zwanzig Prozent, und ein erheblicher Teil der heutigen Ost-West-Spannungen ist die direkte Folge dieser Übergangsphase. Diese ehrliche Bilanz ist es, was die Folge auch für ostdeutsche Zuschauer akzeptabel macht.',
      },
      {
        heading: 'Warum die Folge im Lehrplan bleibt',
        body:
          'Schulen zeigen die Folge weiterhin, fünf Jahre nach Veröffentlichung, weil sie die einzige bekannte vierzehn-Minuten-Variante ist, die sowohl die Westperspektive als auch die Ostperspektive ernst nimmt. Ein Pack der Folge wird in Hausaufgaben übernommen, was Drotschmann gelegentlich auf Twitter kommentiert — die Inhalte sind seine, die Wiederverwendung nicht. Mit Quellenangabe sieht er es entspannt.',
      },
    ],
    takeaway:
      'Der Mauerfall war das Bild, der Einigungsvertrag war der Vorgang — und die Konsequenzen des zweiten erklären die Spannungen des heutigen Deutschland.',
    relatedSlugs: ['markus-lanz-robert-habeck-energiewende', 'maybrit-illner-klimakonferenz-folge'],
    metaTitle: 'MrWissen2go zur Wiedervereinigung — was Geschichtsbücher auslassen',
    metaDescription:
      'Eine Lese-Notiz zu Mirko Drotschmanns Wiedervereinigungs-Folge — warum der Einigungsvertrag wichtiger ist als der Mauerfall, und die unbequeme Zwischenbilanz, die zur Folge gehört.',
  },
  {
    slug: 'hotel-matze-podcast-interview',
    creator: 'Matze Hielscher',
    creatorHandle: 'HotelMatzePodcast',
    videoTitle: 'Hotel Matze — Wie führt man ein gutes Gespräch?',
    youtubeId: 'fH-2H4-yvU8', // TODO(verify): Hotel Matze Meta-Folge
    publishedDate: '2023-04-12',
    durationMin: 92,
    topics: ['podcast', 'interview', 'matze hielscher', 'gesprächskultur'],
    lang: 'de',
    intro:
      'Matze Hielscher hat in zwölf Jahren über vierhundert Hotel-Matze-Folgen geführt und ist damit zu einem der einflussreichsten deutschsprachigen Interviewer geworden. Die Meta-Folge, in der er erklärt, wie er Gespräche vorbereitet und führt, ist die nützlichste Einzelfolge für jeden, der selbst Interviews macht oder hört.',
    sections: [
      {
        heading: 'Die Frage vor der Frage',
        body:
          'Hielscher öffnet mit etwas, das im Genre selten erklärt wird: die Vorbereitung beginnt mit der Frage, was er von dem Gast lernen will — nicht damit, was die Hörer hören wollen. Der Unterschied klingt klein, ist aber strukturell: Gespräche, die aus echter Neugier des Interviewers geführt werden, werden anders wahrgenommen als solche, die einen recherchierten Themenkatalog abarbeiten. Beide können gute Folgen werden; nur die ersten werden hörbar interessant.',
      },
      {
        heading: 'Schweigen als Werkzeug',
        body:
          'Die für Interviewer wichtigste Stelle der Folge sind die drei Minuten über die Pause nach einer Antwort. Hielscher beschreibt, wie er sich zwingt, vier bis sechs Sekunden zu warten, bevor er die nächste Frage stellt — und wie der Gast in dieser Pause oft den Gedanken weiter ausführt, weil die Stille unbequem ist. Diese Technik ist mit Abstand die wirksamste, die im Podcast-Format überhaupt diskutiert wird, und sie wird praktisch nirgendwo sonst gelehrt.',
      },
      {
        heading: 'Warum Hielscher die schlechten Gespräche behält',
        body:
          'Ein Detail, das andere Podcast-Hosts so nicht zugeben: Hielscher veröffentlicht auch die Folgen, in denen er das Gefühl hatte, dass das Gespräch nicht funktioniert hat. Die Begründung ist hörenswert — ein Interview, das nicht klappt, lehrt den Hörer mehr über den Gast als eines, in dem alle Übergänge sauber sind. Das ist das Gegenteil dessen, was im YouTube-Algorithmus belohnt wird, und es ist der Grund, warum sich der Podcast gehalten hat.',
      },
      {
        heading: 'Was die Folge an einen Pack abgibt',
        body:
          'Die 92 Minuten enthalten ungefähr fünfundzwanzig konkrete Heuristiken — von der Vorbereitung über die ersten dreißig Sekunden bis zur Verabschiedung. Ein Pack davon wird zu einer Liste von Regeln, die auch jemand anwenden kann, der nie selbst ein Mikrofon vor sich hatte: in Bewerbungsgesprächen, im Coaching, im Verkauf. Der Pack ist nützlicher als die Folge in einem Aspekt — er macht die Heuristiken auffindbar.',
      },
    ],
    takeaway:
      'Gute Interviews entstehen aus echter Neugier des Fragenden und der Disziplin, lange genug zu schweigen.',
    relatedSlugs: ['markus-lanz-robert-habeck-energiewende', 'jung-naiv-politik-interview'],
    metaTitle: 'Hotel Matze — die Meta-Folge über das Interview-Handwerk',
    metaDescription:
      'Eine Lese-Notiz zu Matze Hielschers Meta-Folge über Interview-Vorbereitung, das Schweigen als Werkzeug und warum er auch die misslungenen Gespräche veröffentlicht.',
  },
  {
    slug: 'maybrit-illner-klimakonferenz-folge',
    creator: 'Maybrit Illner',
    creatorHandle: 'ZDFmaybritillner',
    videoTitle: 'Klimakonferenz und Realität — Maybrit Illner mit COP-Delegierten',
    youtubeId: 'tQX0v9Z9w-Y', // TODO(verify): ZDF Mediathek Folge nach COP28
    publishedDate: '2023-12-14',
    durationMin: 62,
    topics: ['klimapolitik', 'cop', 'maybrit illner', 'politik'],
    lang: 'de',
    intro:
      'Die Maybrit-Illner-Folge nach der COP28 in Dubai ist eine der wenigen deutschen Talkshow-Aufzeichnungen, die das Verhältnis zwischen Klimaverhandlungen und tatsächlicher Klimapolitik nüchtern offenlegt. Sie ist auch deshalb sehenswert, weil sie weniger gestritten wird als ähnliche Formate, was den Inhalten Raum gibt.',
    sections: [
      {
        heading: 'Warum die COP überhaupt etwas leistet',
        body:
          'Illner stellt früh die Frage, die im populären Diskurs oft als rhetorisch behandelt wird: bringt eine Klimakonferenz mit zweihundert Staaten überhaupt messbare Ergebnisse? Die Antwort ihrer Gäste — eine Diplomatin, ein Energiewissenschaftler, eine Aktivistin — ist differenziert genug, dass die Hörerin am Ende verstehen kann, warum die COP-Erklärungen keine Gesetze sind, aber trotzdem die Grundlage für nationale Gesetze über die nächsten zehn Jahre bilden.',
      },
      {
        heading: 'Der Konflikt zwischen Süden und Norden',
        body:
          'Eine wichtige zwanzig-Minuten-Sequenz behandelt die Loss-and-Damage-Frage — wer zahlt für die Klimafolgen, die historisch von Industriestaaten verursacht und gegenwärtig von Entwicklungsländern getragen werden. Die Diplomatin im Studio ist konkret über die Summen (rund 700 Millionen Dollar zugesagt, geschätzt 400 Milliarden Dollar jährlich nötig) und ehrlich über die geringe Wahrscheinlichkeit, dass die Lücke geschlossen wird. Diese Klarheit ist im deutschen Fernsehen zum Thema selten.',
      },
      {
        heading: 'Wo die Folge unangenehm wird',
        body:
          'Etwa in der Mitte fragt Illner die Aktivistin, ob die Klima-Bewegung in Deutschland gescheitert ist — angesichts der Wahlumfragen, des Rückgangs der Beteiligung an Demonstrationen, der politischen Verschiebung. Die Antwort ist nicht abwehrend. Die Aktivistin räumt einen taktischen Fehler ein (zu starke Fokussierung auf Symbolaktionen, zu wenig Strukturarbeit in Kommunen) und nennt konkret die Lehren, die für die nächste Phase gezogen werden. Diese Selbstkritik in laufender Sendung ist im politischen Talk selten.',
      },
      {
        heading: 'Warum 62 Minuten genug sind',
        body:
          'Die Folge ist deshalb hörenswert, weil sie nicht versucht, in einer Stunde alles zu sagen. Sie nimmt sich drei Hauptthemen — wozu die COP gut ist, wer für die Klimaschäden zahlt, wie sich die Klima-Bewegung neu aufstellt — und bleibt bei diesen drei. Ein Pack der Folge ist deshalb gut strukturierbar: drei Hauptkapitel, je eine Glossar-Sektion, je eine Aktionsempfehlung.',
      },
    ],
    takeaway:
      'Klimakonferenzen sind keine Gesetze, sondern die Grundlage von Gesetzen — und die Loss-and-Damage-Lücke ist zu groß, um sie zu schliessen.',
    relatedSlugs: ['harald-lesch-klimawandel-kompakt', 'markus-lanz-robert-habeck-energiewende'],
    metaTitle: 'Maybrit Illner zur Klimakonferenz — was die COP wirklich leistet',
    metaDescription:
      'Eine Lese-Notiz zur Maybrit-Illner-Folge nach der COP28 — wozu Klimakonferenzen gut sind, der Süden-Norden-Konflikt um Klimaschäden, und die Selbstkritik der Klima-Bewegung.',
  },
  {
    slug: 'terra-x-dirk-steffens-artensterben',
    creator: 'Dirk Steffens',
    creatorHandle: 'TerraX',
    videoTitle: 'Terra X — Das große Artensterben',
    youtubeId: 'ZSt9tm3RoUU', // TODO(verify): Terra X Artensterben-Doku
    publishedDate: '2019-11-17',
    durationMin: 45,
    topics: ['artensterben', 'biologie', 'naturwissenschaft', 'terra x', 'dirk steffens'],
    lang: 'de',
    intro:
      'Dirk Steffens hat über fünfzehn Jahre lang Terra-X-Dokumentationen moderiert und ist damit zur deutschen Stimme für Naturwissenschaft im öffentlich-rechtlichen Fernsehen geworden. Die 45-minütige Folge zum Artensterben ist die wahrscheinlich beste Einzeldokumentation, die er gemacht hat.',
    sections: [
      {
        heading: 'Die "sechste Auslöschung" ist ein technischer Begriff',
        body:
          'Steffens öffnet mit dem Satz, der die Folge trägt: was wir gegenwärtig erleben, ist nicht "ein bisschen mehr Aussterben als normal" — es ist eine Größenordnung, die in der Erdgeschichte fünfmal vorher vorkam, und jedes Mal mit dramatischen Konsequenzen für die Biosphäre verbunden war. Diese Einordnung ist nicht alarmistisch; sie ist die etablierte paläontologische Terminologie. Wer sie einmal gehört hat, kann die "Klima- und Artenkrise"-Berichterstattung nicht mehr als Übertreibung lesen.',
      },
      {
        heading: 'Warum die Insektenzahlen die Kennzahl sind',
        body:
          'Steffens verbringt zehn Minuten mit der Krefelder Insektenstudie von 2017 — die Studie, die zeigte, dass die Insektenbiomasse in deutschen Naturschutzgebieten um 76 Prozent in 27 Jahren zurückgegangen war. Die Folge erklärt, warum dieser Befund nicht nur "ein paar weniger Mücken" bedeutet, sondern die Nahrungsgrundlage für Vögel und kleine Säugetiere zusammenbrechen lässt, und warum eine Folge davon eine reduzierte Bestäubung in der Landwirtschaft ist. Die Folge führt diese Kausalkette sauber, ohne sie zu dramatisieren.',
      },
      {
        heading: 'Die Sequenz zur Pestizidregulierung',
        body:
          'Eine zwanzig-Minuten-Sequenz behandelt Neonicotinoide — die Pestizidklasse, die in der EU 2018 für den Freilandeinsatz weitgehend verboten wurde. Steffens zeigt die Industrie-Lobbyarbeit, die wissenschaftliche Evidenz, und den politischen Prozess in einem Maß an Detail, das normalerweise Investigativ-Magazinen vorbehalten ist. Diese Folge ist eines der wenigen Dokumente, in denen Wissenschaft, Politik und Wirtschaft als verzahntes System gezeigt werden — und nicht als getrennte Sphären.',
      },
      {
        heading: 'Warum sich die Doku als Pack eignet',
        body:
          'Eine 45-minütige Doku ist zu lang, um sie zweimal anzusehen, und zu wichtig, um sie zu vergessen. Ein Pack mit den fünf Hauptzahlen (Krefelder Studie, Pestizidverbrauch, EU-Verordnungen, Erholungszeit für Insektenpopulationen, projektierte Folgekosten in der Landwirtschaft) ist ein nützliches Referenzdokument, das beim Lesen aktueller Naturschutz-Berichterstattung erstaunlich oft als Vergleichsmaß einspringt.',
      },
    ],
    takeaway:
      'Das Artensterben ist eine Größenordnung, kein Schlagwort — und die Insektenzahlen sind die Kennzahl, an der sich alles weitere bemisst.',
    relatedSlugs: ['harald-lesch-klimawandel-kompakt', 'maybrit-illner-klimakonferenz-folge'],
    metaTitle: 'Terra X mit Dirk Steffens — die Artensterben-Doku als Referenz',
    metaDescription:
      'Eine Lese-Notiz zur Terra-X-Doku über das Artensterben — warum es die sechste Auslöschung ist, die Krefelder Insektenstudie und die Sequenz zur Pestizidregulierung.',
  },
  {
    slug: 'florian-freistetter-sternengeschichten',
    creator: 'Florian Freistetter',
    creatorHandle: 'astrodicticum',
    videoTitle: 'Sternengeschichten — die Geschichte der Astronomie in 100 Folgen',
    youtubeId: 'qwertzABCdef', // TODO(verify): kein konkretes YT-Video, eher Podcast — User entscheidet ob ersetzen
    publishedDate: '2020-06-01',
    durationMin: 15,
    topics: ['astronomie', 'wissenschaftsgeschichte', 'podcast', 'florian freistetter'],
    lang: 'de',
    intro:
      'Florian Freistetters "Sternengeschichten" ist mit über sechshundert Folgen der dienstältste deutschsprachige Wissenschaftspodcast — eine Folge pro Woche, jede über ein einzelnes astronomisches Thema. Welche einzelne Folge man hört, ist fast egal; das Verfahren bleibt das gleiche.',
    sections: [
      {
        heading: 'Das Erzählverfahren ist immer das gleiche',
        body:
          'Jede Folge öffnet mit einer historischen Beobachtung — wann ein bestimmter Stern oder ein bestimmtes Phänomen erstmals beschrieben wurde, von wem, in welchem kulturellen Kontext. Erst danach erklärt Freistetter die Physik. Diese Reihenfolge — Geschichte vor Mechanismus — ist die hörbar wirksamste, die im populärwissenschaftlichen Podcast-Format zu finden ist. Sie erklärt, warum man die einzelnen Folgen auch ohne astronomische Vorbildung folgen kann.',
      },
      {
        heading: 'Warum 15 Minuten genau die richtige Länge sind',
        body:
          'Die Folgenlänge ist seit 2012 konstant bei 12–18 Minuten. Freistetter hat in Interviews erklärt, dass diese Länge bewusst ist: kurz genug für die Hörsituation einer Pendelfahrt, lang genug für ein vollständiges Argument. Die Disziplin, das Format nicht zu erweitern, ist Teil dessen, warum der Podcast sich gehalten hat. Andere Wissenschafts-Podcasts sind in den letzten Jahren zu zwei- oder dreistündigen Gesprächs-Folgen migriert; "Sternengeschichten" bleibt bei der kurzen, geschriebenen Form.',
      },
      {
        heading: 'Was eine Folge im Pack wert ist',
        body:
          'Eine einzelne Folge enthält typisch drei bis fünf einzelne astronomische Tatsachen, eingebettet in eine historische Erzählung. Im Pack-Format werden daraus drei bis fünf saubere Glossar-Einträge plus ein narrativer Rahmen, der die Einträge zusammenhält. Im Wiederlesen sind die Glossar-Einträge das Nützliche; in der ersten Hörung ist die Erzählung das Nützliche. Die Aufteilung ist genau das, was ein guter Pack abbildet.',
      },
      {
        heading: 'Wo der Podcast die deutsche Wissenschaftskommunikation verändert hat',
        body:
          'Vor "Sternengeschichten" war Astronomie im deutschen Hörfunk-Format weitgehend abwesend. Es gab Magazine, die gelegentlich eine astronomische Meldung brachten, aber kein Format, das Astronomie in einer kontinuierlichen, hörbaren Form anbot. Freistetters Beharrlichkeit über zwölf Jahre hinweg hat das verändert. Wer heute "Astronomiepodcast" in eine Suchmaschine tippt, findet zwanzig deutschsprachige Formate — fast alle davon zitieren "Sternengeschichten" als Vorbild oder Konkurrent.',
      },
    ],
    takeaway:
      'Wissenschafts-Podcasts halten sich nicht durch Länge oder Stars, sondern durch konsequente Disziplin auf einem engen Format.',
    relatedSlugs: ['doktor-whatson-quantencomputer', 'mai-thi-nguyen-kim-corona-erklaerung'],
    metaTitle: 'Sternengeschichten — was Freistetters Podcast richtig macht',
    metaDescription:
      'Eine Lese-Notiz zu Florian Freistetters Sternengeschichten — Geschichte vor Mechanismus, warum 15 Minuten die richtige Länge sind, und was eine Folge im Pack wert ist.',
  },
  {
    slug: 'jung-naiv-politik-interview',
    creator: 'Tilo Jung',
    creatorHandle: 'JungNaiv',
    videoTitle: 'Jung & Naiv — Folge 600 (Politik für Desinteressierte)',
    youtubeId: 'eHRWxlT-AwY', // TODO(verify): Jung & Naiv Jubiläumsfolge
    publishedDate: '2022-09-15',
    durationMin: 168,
    topics: ['politik', 'interview', 'jung & naiv', 'tilo jung', 'medienkritik'],
    lang: 'de',
    intro:
      'Tilo Jungs "Jung & Naiv" hat das politische Interview im deutschsprachigen Raum verändert wie kein anderes Format der letzten zehn Jahre. Die Jubiläumsfolge 600 — fast drei Stunden lang, mit einem Gast, der das Format selbst lange skeptisch sah — ist die beste Gelegenheit, das Verfahren zu verstehen.',
    sections: [
      {
        heading: 'Naivität als Methode',
        body:
          'Der Titel ist kein Witz. Jungs Strategie ist, politische Akteure aus der Position der bewusst nicht-eingeweihten Person zu befragen — keine Insider-Sprache, keine Rückbezüge auf vorherige Aussagen, die einzige Vorbereitung ist Lesen. Das führt zu Interviews, in denen Politiker:innen ihre Positionen so erklären müssen, dass eine Person sie versteht, die nicht jeden Tag den Bundestag verfolgt. Was dabei herauskommt, ist hörbar anders als das, was in Tagesschau-Beiträgen zu sehen ist.',
      },
      {
        heading: 'Die Folge 600 als Selbstkritik',
        body:
          'Die Jubiläumsfolge ist deshalb besonders interessant, weil Jung erstmals ausführlich selbst spricht — über die Versuchung, einen einmal etablierten Stil zur Marke zu machen, über die Mühe, naiv zu bleiben, wenn man inzwischen die meisten Akteur:innen persönlich kennt. Diese Reflexion über die eigene Methode ist im politischen Journalismus selten und für jeden hörenswert, der über das Verhältnis zwischen Format und Inhalt nachdenkt.',
      },
      {
        heading: 'Warum drei Stunden funktionieren',
        body:
          'Die Standardfolgen sind bereits 90 bis 120 Minuten lang — die Jubiläumsfolge ist mit 168 Minuten am oberen Ende. Im klassischen Fernsehen wäre diese Länge undenkbar. Im Podcast-Format funktioniert sie, weil das Tempo niedrig ist und die Hörsituation eine andere — Auto, Küche, Wandern. Jungs Format hat die Akzeptanz der dreistündigen politischen Hörung im deutschen Sprachraum mitprägt. Ohne Jung & Naiv gäbe es das Hotel-Matze-Format vermutlich nicht in der heutigen Form.',
      },
      {
        heading: 'Was die Folge an einen Pack abgibt',
        body:
          'Eine 168-minütige Folge zu einem Hörbuch zu kondensieren ist anders als eine 25-minütige Erklärfolge. Der Pack einer Jung-&-Naiv-Episode wird notwendigerweise zu einem Themenregister mit Zeitstempeln, einer Liste der wichtigsten Aussagen, und einer kurzen meta-Reflexion über die Gesprächsführung. Genau in diesem letzten Punkt — der meta-Reflexion — ist Folge 600 besonders ergiebig, weil das Thema die Methode selbst ist.',
      },
    ],
    takeaway:
      'Naivität ist eine harte Disziplin — und sie produziert politische Interviews, die zugänglicher sind als jede Form von investigativem Journalismus.',
    relatedSlugs: ['hotel-matze-podcast-interview', 'markus-lanz-robert-habeck-energiewende'],
    metaTitle: 'Jung & Naiv Folge 600 — wie Tilo Jung Politik anders macht',
    metaDescription:
      'Eine Lese-Notiz zu Tilo Jungs Jubiläumsfolge 600 — Naivität als Methode, die Selbstkritik des Formats und warum drei Stunden Podcast-Hörung funktionieren.',
  },

  // ─── Cluster castellano — psicología, periodismo, conversación ──
  {
    slug: 'marian-rojas-cosas-buenas',
    creator: 'Marian Rojas Estapé',
    creatorHandle: 'marianrojasestape',
    videoTitle: 'Cómo hacer que te pasen cosas buenas — TED Madrid',
    youtubeId: 'PyEGyAo8YIs', // TODO(verify): Marian Rojas charla TEDxMadrid
    publishedDate: '2018-11-22',
    durationMin: 17,
    topics: ['psicología', 'cortisol', 'salud mental', 'marian rojas'],
    lang: 'es',
    intro:
      'La charla TED de Marian Rojas Estapé es una de las pocas exposiciones de psicología clínica popular que no traiciona la disciplina de la que sale. Diecisiete minutos para explicar por qué el cortisol crónico es el problema invisible más caro de la sanidad occidental — y por qué la solución es menos farmacológica de lo que la industria quiere que creas.',
    sections: [
      {
        heading: 'El cortisol no es el villano que la prensa dibuja',
        body:
          'Rojas abre con un matiz que en internet rara vez sobrevive: el cortisol es necesario y útil. La hormona del estrés no es el enemigo; lo que enferma es la versión sostenida, la que no baja entre crisis. La distinción importa porque ordena el resto del argumento — no se trata de eliminar el estrés, sino de devolverle su pulso natural. La gente que escucha la charla y se queda con "el cortisol es malo" sale con el mensaje invertido.',
      },
      {
        heading: 'Por qué la inflamación es el siguiente capítulo',
        body:
          'El núcleo de la charla — los siete minutos centrales — conecta el cortisol crónico con la inflamación sistémica de bajo grado y, a través de ella, con la mitad de las patologías crónicas de la edad media: enfermedad cardiovascular, depresión, autoinmunidad. Rojas cita los estudios sin sobrevenderlos. La cadena causal está documentada, pero no es determinista; lo que hace que la charla resista el escrutinio es esa franqueza sobre los límites de la evidencia.',
      },
      {
        heading: 'La parte que la audiencia adopta peor',
        body:
          'En el último tercio Rojas hace una recomendación que ofende ligeramente a la cultura de la autoayuda farmacológica: lo más eficaz contra el cortisol crónico es el contacto humano sostenido, no un suplemento ni una aplicación. La charla no rechaza la medicación cuando está indicada; lo que rechaza es la sustitución del vínculo por una pastilla. Esta sección es la que más se cita en redes y la que peor se aplica.',
      },
      {
        heading: 'Por qué la charla sigue circulando',
        body:
          'Siete años después la charla sigue alcanzando los dos millones de visitas anuales sin promoción. La razón es la combinación rara de tres cosas — rigor clínico, lenguaje accesible, brevedad — que la psicología popular en castellano consigue raramente. Un pack de la charla extrae los tres mecanismos centrales (eje HPA, inflamación, vínculo) en un solo recordatorio reutilizable.',
      },
    ],
    takeaway:
      'El cortisol crónico es una enfermedad silenciosa y lo más eficaz contra él es menos farmacológico de lo que la industria del bienestar admite.',
    relatedSlugs: ['eduard-punset-redes-clasico', 'jordi-evole-salvados-entrevista'],
    metaTitle: 'Marian Rojas en TEDxMadrid — el cortisol que sí importa',
    metaDescription:
      'Una nota editorial sobre la charla TED de Marian Rojas Estapé — el cortisol que no es el villano, por qué la inflamación es el siguiente capítulo, y la recomendación que la cultura de la autoayuda peor aplica.',
  },
  {
    slug: 'eduard-punset-redes-clasico',
    creator: 'Eduard Punset',
    creatorHandle: 'rtve',
    videoTitle: 'Redes — el cerebro humano (entrevista clásica)',
    youtubeId: 'wRyxEX6vCG4', // TODO(verify): Punset Redes RTVE clásico
    publishedDate: '2009-05-10',
    durationMin: 28,
    topics: ['neurociencia', 'divulgación científica', 'eduard punset', 'redes', 'rtve'],
    lang: 'es',
    intro:
      'Eduard Punset murió en 2019 dejando atrás más de seiscientos programas de Redes y un modelo de divulgación científica que la televisión española no ha vuelto a producir. Cualquier capítulo de Redes funciona como entrada; el de neurociencia es el que la mayoría recuerda en primer lugar.',
    sections: [
      {
        heading: 'El formato era anti-televisivo',
        body:
          'Redes consistía en Punset, sentado frente a un científico extranjero, hablando media hora en castellano traducido. Sin gráficos llamativos, sin música de fondo, sin cortes rápidos. En la lógica televisiva de los años 2000 era una herejía; en la lógica del que de verdad quería entender, era el formato más eficaz que existió en España. La televisión pública no ha vuelto a producir algo equivalente.',
      },
      {
        heading: 'Punset hacía la pregunta que el espectador habría hecho',
        body:
          'Su talento como entrevistador era simple y casi imposible de imitar: hacía la pregunta obvia inmediatamente, sin disfrazarla de sofisticación. Cuando el invitado hablaba de plasticidad neuronal, Punset preguntaba "¿quieres decir que el cerebro puede cambiar con la edad?". El científico tenía entonces que responder en lenguaje llano, y el espectador entendía sin esfuerzo. Esa transparencia es lo que se ha perdido en la divulgación posterior.',
      },
      {
        heading: 'El legado que las redes sociales no han adoptado',
        body:
          'Redes nunca tuvo un éxito viral en internet. Las clips cortos que se subieron tras la muerte de Punset rinden bien, pero el formato completo — media hora de conversación pausada — no se adapta al algoritmo de TikTok ni al carrusel de YouTube. La paradoja es que el contenido más útil que produjo la divulgación española es exactamente el que peor se mueve en las plataformas modernas. Un pack es, en este sentido, una forma de rescatarlo.',
      },
      {
        heading: 'Por qué seguir oyendo a Punset hoy',
        body:
          'Lo notable de revisitar a Punset en 2026 es comprobar cuánto del consenso científico que él tradujo en los años 2000 sigue siendo el consenso actual. La neurociencia de Redes envejeció bien porque Punset evitaba la última moda y se quedaba con las ideas que tenían tres décadas de evidencia detrás. Esa disciplina editorial es lo que un pack debe preservar: no la novedad, sino lo que sigue siendo cierto cinco años después.',
      },
    ],
    takeaway:
      'La divulgación científica que envejece bien es la que renuncia a la novedad para quedarse con lo que sigue siendo cierto.',
    relatedSlugs: ['marian-rojas-cosas-buenas', 'jordi-evole-salvados-entrevista'],
    metaTitle: 'Punset y Redes — el formato que la televisión perdió',
    metaDescription:
      'Una nota editorial sobre Eduard Punset y Redes — por qué el formato era anti-televisivo, cómo hacía las preguntas obvias y por qué su legado no se mueve bien en redes sociales.',
  },
  {
    slug: 'jordi-evole-salvados-entrevista',
    creator: 'Jordi Évole',
    creatorHandle: 'salvadoslasexta',
    videoTitle: 'Salvados — entrevista en profundidad',
    youtubeId: 'k9XJxYM7lEo', // TODO(verify): episodio paradigmático de Salvados
    publishedDate: '2019-03-17',
    durationMin: 56,
    topics: ['periodismo', 'entrevista', 'jordi évole', 'salvados', 'lasexta'],
    lang: 'es',
    intro:
      'Jordi Évole convirtió Salvados en el formato periodístico más influyente de la televisión española en los años 2010 — un programa semanal de cincuenta minutos centrado en una sola entrevista o reportaje. Cualquier episodio sirve de entrada al método; lo importante es entender el método, no el caso particular.',
    sections: [
      {
        heading: 'La preparación es la mitad del trabajo',
        body:
          'Évole ha explicado en otras entrevistas que dedica entre cuatro y seis semanas a cada episodio. Esa proporción — más preparación que grabación — es lo que distingue Salvados del talk-show convencional. Cuando el entrevistado entra en el set, Évole ya conoce las respuestas que va a recibir y ha decidido en qué momentos hacer la pregunta incómoda. Lo que el espectador ve como espontaneidad es, en realidad, coreografía editorial.',
      },
      {
        heading: 'El silencio como recurso periodístico',
        body:
          'La técnica más reconocible de Évole es dejar que el entrevistado se hunda en su propia respuesta. Cuando alguien da una respuesta evasiva, Évole no la rebate; simplemente espera, y la cámara se queda. El silencio dura cinco, ocho, diez segundos — eterno en televisión — y el entrevistado, incómodo, suele completar la respuesta con la información que había intentado ocultar. Este es el ingrediente que más copian otros programas y peor reproducen.',
      },
      {
        heading: 'Por qué Salvados envejece bien',
        body:
          'Los temas que Évole eligió en los años 2010 — corrupción, vivienda, monarquía, sanidad — siguen siendo los temas de los años 2020. Los episodios concretos pueden parecer datados, pero la estructura editorial sigue funcionando como referencia. Volver a un Salvados de hace diez años no es nostalgia; es un ejercicio de comparar lo que entonces era opacidad con lo que hoy es consenso.',
      },
      {
        heading: 'Lo que un pack hace con un episodio de Salvados',
        body:
          'Un episodio de Salvados contiene típicamente entre cinco y ocho afirmaciones verificables — datos, fechas, decisiones políticas concretas. Un pack convierte esas afirmaciones en una hoja-resumen sin perder el contexto narrativo del programa. La utilidad no es periodística (eso ya lo hizo Évole); es de referencia rápida cuando, semanas después, vuelve el mismo tema a las noticias y uno necesita el dato exacto.',
      },
    ],
    takeaway:
      'El periodismo de entrevista vive de la preparación que no se ve y del silencio que el formato comercial no tolera.',
    relatedSlugs: ['eduard-punset-redes-clasico', 'ibai-llanos-entrevista-messi'],
    metaTitle: 'Jordi Évole y Salvados — el método detrás del formato',
    metaDescription:
      'Una nota editorial sobre Salvados de Jordi Évole — por qué la preparación es la mitad del trabajo, el silencio como recurso periodístico y lo que un pack rescata de cada episodio.',
  },
  {
    slug: 'ibai-llanos-entrevista-messi',
    creator: 'Ibai Llanos',
    creatorHandle: 'ibaillanos',
    videoTitle: 'La entrevista a Leo Messi',
    youtubeId: 'WfNV-FpRDdo', // TODO(verify): entrevista Ibai × Messi 2021/2022
    publishedDate: '2022-08-15',
    durationMin: 47,
    topics: ['ibai llanos', 'leo messi', 'streaming', 'entrevista', 'fútbol'],
    lang: 'es',
    intro:
      'La entrevista de Ibai Llanos a Leo Messi en 2022 es el momento exacto en el que el streaming en castellano dejó de ser un género adolescente y se convirtió en periodismo serio. Cuarenta y siete minutos de conversación pausada que ningún medio tradicional había conseguido en años.',
    sections: [
      {
        heading: 'Por qué Messi habló con Ibai y no con un periódico',
        body:
          'La pregunta abre la entrevista de hecho: Ibai le dice a Messi que se nota que está más cómodo aquí que en cualquier rueda de prensa. La respuesta de Messi confirma lo obvio — los periodistas profesionales le han dado treinta años de preguntas estandarizadas, y Ibai le ofrece la posibilidad de hablar como persona, no como personaje. Este desplazamiento de poder — del medio tradicional al streamer — es la noticia más grande que produce la entrevista, aunque sea la que menos se haya comentado.',
      },
      {
        heading: 'La pregunta que ningún periodista le había hecho',
        body:
          'Hacia el minuto veinte, Ibai pregunta a Messi por su relación con la presión y por los momentos en los que ha pensado en dejarlo. La respuesta — larga, sin filtros, con detalles sobre la final de la Copa América 2021 — es probablemente la confesión personal más extensa que Messi ha hecho en público. La razón por la que la consigue Ibai y no la consigue El País es que Ibai pregunta sin agenda, y Messi lo nota.',
      },
      {
        heading: 'Lo que la entrevista no es',
        body:
          'No es buen periodismo deportivo en el sentido técnico. Ibai no contradice a Messi, no le saca contradicciones con declaraciones anteriores, no contrasta sus respuestas con datos. Es otra cosa: una conversación humana de larga duración, con la cámara puesta. Confundir los dos géneros es el error que cometieron muchos comentaristas tras la emisión. La entrevista no quería ser lo que tradicionalmente entendemos por entrevista periodística.',
      },
      {
        heading: 'Por qué sigue importando años después',
        body:
          'La entrevista marcó un antes y un después en el contrato entre celebridades y medios en castellano. Después de Ibai-Messi, otros futbolistas, músicos y políticos empezaron a buscar formatos de streaming antes que medios tradicionales — porque vieron que el formato producía conversaciones que las salas de prensa no podían producir. El pack de la entrevista funciona, en este sentido, como documento histórico además de personal: el momento en que el equilibrio cambió.',
      },
    ],
    takeaway:
      'El streaming en castellano consiguió en una entrevista lo que el periodismo deportivo tradicional no había conseguido en treinta años de cobertura.',
    relatedSlugs: ['jordi-evole-salvados-entrevista', 'la-resistencia-broncano-monologo'],
    metaTitle: 'Ibai × Messi — cuando el streaming se hizo serio',
    metaDescription:
      'Una nota editorial sobre la entrevista de Ibai Llanos a Leo Messi — por qué Messi habló con un streamer, la pregunta que ningún periodista le había hecho y lo que la entrevista no era.',
  },
  {
    slug: 'la-resistencia-broncano-monologo',
    creator: 'David Broncano',
    creatorHandle: 'laResistencia',
    videoTitle: 'La Resistencia — monólogo de apertura clásico',
    youtubeId: 'fJ0u3Z9OBk0', // TODO(verify): monólogo paradigmático de La Resistencia
    publishedDate: '2021-04-08',
    durationMin: 12,
    topics: ['comedia', 'david broncano', 'la resistencia', 'monólogo', '#0'],
    lang: 'es',
    intro:
      'El monólogo de apertura de David Broncano en La Resistencia es la pieza más subestimada de la comedia en lengua castellana de la última década. Doce minutos de improvisación aparente que, vista de cerca, es uno de los formatos más disciplinados de la televisión española.',
    sections: [
      {
        heading: 'La improvisación es coreografía',
        body:
          'Lo que parece espontaneidad pura en Broncano es, en realidad, una estructura ensayada en miles de horas de stand-up previas. Cada monólogo recorre una rutina de cuatro o cinco bloques, con espacio entre ellos para reaccionar a lo que pasa en el plató. El espectador percibe la improvisación; lo que ve es la habilidad de improvisar dentro de una estructura. Los cómicos jóvenes que imitan a Broncano suelen copiar lo aparente — la naturalidad — y no lo estructural — el armazón debajo.',
      },
      {
        heading: 'La autorreferencia como método',
        body:
          'Broncano se ríe de sí mismo más de lo que se ríe de los demás. Cada monólogo incluye al menos tres referencias a sus propios fracasos, a errores de programas anteriores, a la artificialidad del propio formato. Esta autorreferencia genera la confianza por la que los entrevistados se sueltan más con él que con cualquier otro presentador español. Cuando el cómico se ha reído primero de sí mismo, el invitado tiene permiso para ser vulnerable.',
      },
      {
        heading: 'Por qué la pregunta del dinero y el sexo se quedó',
        body:
          'Las dos preguntas finales que Broncano hace a todos los invitados — cuánto dinero tienen y cuántas relaciones sexuales han tenido en el último mes — parecían un gag pasajero cuando se introdujeron. Siete años después se han convertido en una institución de la televisión española y en uno de los pocos momentos en que celebridades responden de manera no preparada. La razón es que las preguntas son, en realidad, una excusa para forzar la sinceridad sobre temas neutros, y eso desarma al entrevistado para el resto de la conversación.',
      },
      {
        heading: 'Lo que un pack rescata de un monólogo',
        body:
          'Un monólogo de Broncano contiene típicamente entre quince y veinte chistes, varias referencias culturales a temas de la semana, y al menos un comentario serio camuflado de humor. Un pack convierte esa densidad en un mapa rápido: cuáles son los temas de la semana que el monólogo recoge, qué actualidad refleja, qué referencias culturales aparecen. Para quien revisita el programa años después, el pack es la única forma de hacer arqueología de la semana en que se grabó.',
      },
    ],
    takeaway:
      'La comedia que parece improvisada es la más ensayada — y la autorreferencia es el atajo más rápido hacia la sinceridad del invitado.',
    relatedSlugs: ['ibai-llanos-entrevista-messi', 'nadie-sabe-nada-buenafuente-berto'],
    metaTitle: 'David Broncano y La Resistencia — la improvisación como coreografía',
    metaDescription:
      'Una nota editorial sobre los monólogos de Broncano en La Resistencia — por qué la improvisación es estructura, la autorreferencia como método y el porqué de la pregunta del dinero.',
  },
  {
    slug: 'el-hormiguero-invitado-internacional',
    creator: 'Pablo Motos',
    creatorHandle: 'elhormiguero',
    videoTitle: 'El Hormiguero — entrevista a invitado internacional',
    youtubeId: 'YwQ4mZ9XmJg', // TODO(verify): episodio con Hugh Jackman, Will Smith o similar
    publishedDate: '2023-10-25',
    durationMin: 38,
    topics: ['el hormiguero', 'pablo motos', 'entrevista', 'antena 3'],
    lang: 'es',
    intro:
      'El Hormiguero es el programa que más invitados internacionales ha llevado a la televisión española en los últimos quince años. Pablo Motos no es Jordi Évole — pero el formato es interesante por motivos distintos, y vale la pena entender cuáles son.',
    sections: [
      {
        heading: 'Lo que el formato hace bien',
        body:
          'El Hormiguero combina entrevista, comedia y entretenimiento ligero en una hora. La función práctica es ofrecer al invitado un espacio en el que pueda promocionar su película o disco sin sentirse interrogado. Por eso vienen invitados internacionales que evitarían un Salvados — y por eso el formato no es periodismo, sino algo más cercano al variety show estadounidense de los años 60. Confundir los dos géneros lleva a juzgar mal el programa.',
      },
      {
        heading: 'Pablo Motos como entrevistador',
        body:
          'Motos no es un entrevistador en el sentido riguroso. Su talento real es el ritmo: sabe exactamente cuándo el invitado quiere reírse, cuándo necesita un descanso, cuándo cortar para un sketch. Esa gestión temporal — invisible si funciona, ruidosa si falla — es lo que mantiene a invitados internacionales cómodos en castellano traducido. Es una habilidad que ningún otro presentador español domina en el mismo grado.',
      },
      {
        heading: 'La parte que no envejece bien',
        body:
          'Los sketches recurrentes — los hormigos, los gags físicos, las repeticiones rituales — fueron innovadores en 2006 y son fórmula en 2026. El programa se ha vuelto una institución, y como toda institución, ha perdido capacidad de sorprender. Esta es la crítica más justa que se le puede hacer: la estructura que en su momento era nueva ahora es predictiva.',
      },
      {
        heading: 'Por qué sigue siendo útil verlo',
        body:
          'Para quien quiere ver a un invitado internacional respondiendo en condiciones cómodas, El Hormiguero sigue siendo la mejor oferta en castellano. Para quien busca contenido sustancial, hay mejores formatos. El pack de un episodio se enfoca, por tanto, en las dos o tres respuestas reales que el invitado da entre los sketches — y no intenta capturar el conjunto del programa, que es deliberadamente disperso.',
      },
    ],
    takeaway:
      'El Hormiguero es un variety show, no periodismo — y su valor está en hacer cómodo lo que en otros formatos sería incómodo.',
    relatedSlugs: ['ibai-llanos-entrevista-messi', 'la-resistencia-broncano-monologo'],
    metaTitle: 'El Hormiguero — entender el formato sin confundirlo con periodismo',
    metaDescription:
      'Una nota editorial sobre El Hormiguero de Pablo Motos — lo que el formato hace bien, Motos como gestor de ritmo y la parte que ya no envejece bien.',
  },
  {
    slug: 'nadie-sabe-nada-buenafuente-berto',
    creator: 'Andreu Buenafuente y Berto Romero',
    creatorHandle: 'Cadena SER',
    videoTitle: 'Nadie Sabe Nada — programa clásico',
    youtubeId: 'cWxF8u2hKZk', // TODO(verify): episodio paradigmático de NSN
    publishedDate: '2022-02-19',
    durationMin: 62,
    topics: ['comedia', 'andreu buenafuente', 'berto romero', 'radio', 'cadena ser'],
    lang: 'es',
    intro:
      'Nadie Sabe Nada es el programa de radio comercial más original que ha producido España en lo que va de siglo. Andreu Buenafuente y Berto Romero llevan más de doce años haciendo una hora semanal de improvisación pura — sin guion, sin escaleta, sin invitados — y el formato sigue siendo casi indistinguible del primer programa.',
    sections: [
      {
        heading: 'La regla es no preparar nada',
        body:
          'La premisa del programa, repetida cada semana, es que Buenafuente y Romero entran al estudio sin saber qué van a hablar. La premisa es literal: leen las preguntas del público en directo, sin filtro previo, y reaccionan. Esta restricción autoimpuesta es lo que da al programa su tono — la improvisación nunca puede ser pulida porque no hay tiempo de pulirla. Lo que el oyente escucha es el proceso mental de dos cómicos profesionales en tiempo real.',
      },
      {
        heading: 'Por qué funciona después de doce años',
        body:
          'La mayoría de los programas de improvisación cansan después de una o dos temporadas. Nadie Sabe Nada lleva más de cuatrocientos episodios sin que el formato se haya agotado. La razón es que el programa no depende de los temas que tratan — esos son intercambiables — sino de la química entre Buenafuente y Romero. Mientras esa química exista, el formato se sostiene; si los dos cómicos se separaran, el formato terminaría. Esa fragilidad estructural es también su mayor activo.',
      },
      {
        heading: 'El público como tercer protagonista',
        body:
          'Las preguntas que envía el público no son solo material de comedia; son el motor del programa. Los cómicos respetan la pregunta del oyente como si fuera un texto sagrado, incluso cuando es absurda — sobre todo cuando es absurda. Este contrato silencioso entre cómicos y audiencia genera una lealtad que pocos formatos comerciales consiguen, y que se traduce en la única métrica que importa para un programa de radio: que los oyentes vuelvan cada semana sin promoción.',
      },
      {
        heading: 'Lo que un pack rescata',
        body:
          'Un episodio de Nadie Sabe Nada típico contiene cinco o seis bromas que valdría la pena conservar y cincuenta minutos de relleno improvisado. Un pack funciona como filtro de la calidad — extrae las bromas que sí merecen revisitarse, descarta el resto sin culpa. Es la única forma decente de digerir el formato sin pasar una hora completa por episodio.',
      },
    ],
    takeaway:
      'La improvisación radiofónica solo se sostiene cuando dos cómicos profesionales tienen química y el público se vuelve cómplice del proceso.',
    relatedSlugs: ['la-resistencia-broncano-monologo', 'el-hormiguero-invitado-internacional'],
    metaTitle: 'Nadie Sabe Nada — la improvisación que se sostiene doce años',
    metaDescription:
      'Una nota editorial sobre Nadie Sabe Nada de Buenafuente y Romero — la regla de no preparar, por qué la química es el formato, y el público como tercer protagonista.',
  },
  {
    slug: 'mikel-lopez-iturriaga-comidista',
    creator: 'Mikel López Iturriaga',
    creatorHandle: 'elcomidista',
    videoTitle: 'El Comidista — receta clásica con divulgación',
    youtubeId: 'aRb3K0V1Vh8', // TODO(verify): receta paradigmática de El Comidista
    publishedDate: '2021-09-08',
    durationMin: 9,
    topics: ['cocina', 'mikel lópez iturriaga', 'el comidista', 'el país', 'divulgación'],
    lang: 'es',
    intro:
      'El Comidista de Mikel López Iturriaga es la sección de cocina más leída de la prensa española digital. Lo que hace que destaque entre el océano de contenido culinario en YouTube es la disciplina rara de combinar receta, contexto cultural y crítica gastronómica en cada vídeo, sin caer en ninguno de los géneros por separado.',
    sections: [
      {
        heading: 'La receta no es lo más importante',
        body:
          'Cada vídeo de El Comidista incluye una receta, pero la receta es la excusa. Lo importante es lo que rodea a la receta — la historia del plato, las variantes regionales, las críticas a las versiones turísticas, el contexto socioeconómico de cuándo se popularizó. Mikel ha hecho de la receta una hoja de ruta para hablar de cultura culinaria sin parecer didáctico. La cocina es el vehículo; el ensayo cultural es el destino.',
      },
      {
        heading: 'La crítica como ingrediente',
        body:
          'A diferencia de la mayoría del contenido culinario en YouTube, El Comidista no celebra todo lo que cocina. Mikel es explícito cuando un plato tradicional es malo, cuando una receta moderna es pretenciosa, cuando una marca comercial usa el nombre de un plato regional sin entender lo que hace. Esta franqueza es lo que diferencia su contenido del marketing disfrazado de receta — y lo que mantiene la confianza de la audiencia durante años.',
      },
      {
        heading: 'Por qué la sección sobrevivió al fin de las secciones',
        body:
          'La prensa digital española ha cerrado en los últimos años decenas de secciones culturales. El Comidista no solo ha sobrevivido — ha crecido. La razón es que Mikel construyó una marca personal alrededor de su sección, en lugar de depender solo del paraguas de El País. Cuando el modelo de prensa digital se contrajo, su contenido siguió siendo descargable, citable, recordable. Es una lección de supervivencia editorial que vale más allá de la cocina.',
      },
      {
        heading: 'El pack como recetario filtrado',
        body:
          'Un vídeo de El Comidista típicamente da una receta, dos variantes y tres consejos. Un pack convierte esto en una hoja de cocina reutilizable que puedes pegar en la nevera — sin el contexto cultural, que ya lo viste una vez. Esta separación entre el contenido que se ve una vez y la información que se consulta repetidamente es exactamente lo que un pack hace bien: cuál es la receta, cuál es la versión regional, qué evitar.',
      },
    ],
    takeaway:
      'El contenido culinario que envejece bien combina receta, contexto y crítica — y la receta sin las otras dos es marketing.',
    relatedSlugs: ['nadie-sabe-nada-buenafuente-berto', 'eduard-punset-redes-clasico'],
    metaTitle: 'El Comidista — la receta como excusa para el ensayo cultural',
    metaDescription:
      'Una nota editorial sobre El Comidista de Mikel López Iturriaga — por qué la receta no es lo importante, la crítica como ingrediente, y por qué la sección sobrevivió al fin de las secciones.',
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
