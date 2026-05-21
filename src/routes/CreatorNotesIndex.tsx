import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { usePageHead } from '../hooks/usePageHead';
import { CREATOR_NOTES } from '../data/creatorNotes';

/**
 * /notes — index of all editorial reading notes.
 *
 * Lists every note from `creatorNotes.ts`, grouped under a single
 * editorial spread. Includes a creator filter (one-click filter
 * chips at the top) and a topic count under each group header so
 * the page reads as a magazine table-of-contents, not a card grid.
 *
 * SEO role: this is the hub page. Each note links back to it from
 * the breadcrumb / "all notes" link, so internal-link weight
 * accumulates here. Google sees a tight cluster of cross-linked
 * articles + this hub, which is the pattern that ranks for
 * editorial sites.
 */
export function CreatorNotesIndex() {
  usePageHead({
    title: 'Reading notes — short essays on the videos worth re-reading',
    description:
      'Editorial reading notes on the YouTube talks that shaped how we think about sleep, dopamine, AGI, physics, and wealth. Each note is 500–700 words, original prose, with the source talk one click away.',
  });

  const [creatorFilter, setCreatorFilter] = useState<string | null>(null);

  const creators = useMemo(() => {
    const set = new Set<string>();
    CREATOR_NOTES.forEach((n) => set.add(n.creator));
    return Array.from(set);
  }, []);

  const visibleNotes = useMemo(
    () => (creatorFilter ? CREATOR_NOTES.filter((n) => n.creator === creatorFilter) : CREATOR_NOTES),
    [creatorFilter],
  );

  return (
    <main id="main" className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8 sm:pt-8">
        <Link
          to="/"
          className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
        >
          ← Home
        </Link>
      </div>

      <section className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14">
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
          § Reading notes
        </div>
        <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
          Short essays on the videos worth re-reading.
        </h1>
        <div className="mt-6 h-px w-16 bg-gold" aria-hidden />
        <p className="mt-6 font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
          Each note is around five hundred words of original commentary on a single
          YouTube talk — the kind of writing we wish existed before we sat down with the
          video itself. The source is always one click away. The pack is always one click
          further.
        </p>
      </section>

      {/* Filter chips */}
      <section className="border-y border-navy/10 bg-white/60">
        <div className="mx-auto max-w-3xl px-5 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-widest">
            <span className="text-graphit/65">Filter:</span>
            <button
              type="button"
              onClick={() => setCreatorFilter(null)}
              className={`rounded-full px-3 py-1 transition ${
                creatorFilter === null
                  ? 'bg-navy text-gold'
                  : 'border border-navy/15 bg-white text-graphit/75 hover:border-gold hover:text-navy'
              }`}
            >
              All
            </button>
            {creators.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCreatorFilter(c)}
                className={`rounded-full px-3 py-1 transition ${
                  creatorFilter === c
                    ? 'bg-navy text-gold'
                    : 'border border-navy/15 bg-white text-graphit/75 hover:border-gold hover:text-navy'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notes list */}
      <section className="bg-white/40 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <ul className="space-y-10">
            {visibleNotes.map((note) => (
              <li key={note.slug}>
                <Link to={`/notes/${note.slug}`} className="group block">
                  <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
                    § {note.creator} · {note.durationMin} min
                  </div>
                  <h2 className="mt-3 font-serif text-2xl leading-tight text-navy group-hover:underline group-hover:underline-offset-4 sm:text-3xl">
                    {note.videoTitle}
                  </h2>
                  <div className="mt-3 h-px w-10 bg-gold/60 transition group-hover:w-16 group-hover:bg-gold" aria-hidden />
                  <p className="mt-4 font-serif text-base leading-relaxed text-graphit/85 sm:text-lg">
                    {note.intro}
                  </p>
                  <div className="mt-3 font-sans text-[11px] uppercase tracking-widest text-navy/70">
                    Read the note →
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {visibleNotes.length === 0 && (
            <p className="mt-8 font-serif italic text-lg text-graphit/70">
              No notes yet for this creator. The cohort grows every week.
            </p>
          )}
        </div>
      </section>

      <footer className="mx-auto max-w-3xl px-5 py-12 text-center font-sans text-xs text-graphit/55 sm:px-8">
        Notes written for{' '}
        <Link to="/" className="text-navy underline-offset-4 hover:underline">
          VozClara
        </Link>{' '}
        — a knowledge layer over every video you watch.
      </footer>
    </main>
  );
}
