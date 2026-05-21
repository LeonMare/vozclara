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
