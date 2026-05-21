import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePageHead } from '../hooks/usePageHead';
import { useLocale } from '../lib/i18n';
import {
  getCreatorNote,
  getRelatedNotes,
  youtubeUrl,
} from '../data/creatorNotes';
import { SITE_URL } from '../lib/site';

/**
 * /notes/:slug — single creator-note page.
 *
 * Programmatic SEO entry point. Each page is an original editorial
 * essay about a specific YouTube video. The shape mirrors AboutPage
 * (eyebrow + gold rule + serif lead + section bands) so the design
 * register is consistent with the rest of the marketing surface.
 *
 * Three SEO levers wired here:
 *   1. usePageHead → per-page <title> + <meta description> (Google
 *      executes JS and picks these up, even though X/WhatsApp won't).
 *   2. JSON-LD <script type="application/ld+json"> with Article schema
 *      → eligible for the Google "Top stories" + rich-result carousels.
 *   3. Canonical <link> injected via the same effect → cleans up
 *      query-string variants like /notes/foo?utm=x.
 *
 * The CTA is intentionally quiet — a single editorial line at the
 * bottom of the essay ("Generate your own pack from this video →")
 * deep-links into /new with the YouTube URL prefilled.
 */
export function CreatorNotePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { locale } = useLocale();
  const note = slug ? getCreatorNote(slug) : null;

  usePageHead({
    title: note?.metaTitle ?? 'Note',
    description: note?.metaDescription,
  });

  // Inject JSON-LD Article schema + canonical link. Both restored
  // on unmount so SPA navigation back to another route doesn't leak
  // stale structured data.
  useEffect(() => {
    if (!note) return;
    if (typeof document === 'undefined') return;

    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: note.metaTitle,
      description: note.metaDescription,
      author: {
        '@type': 'Organization',
        name: 'VozClara',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'LEON MARÉ',
        url: SITE_URL,
      },
      inLanguage: note.lang,
      about: {
        '@type': 'VideoObject',
        name: note.videoTitle,
        embedUrl: `https://www.youtube.com/embed/${note.youtubeId}`,
        uploadDate: note.publishedDate,
        creator: { '@type': 'Person', name: note.creator },
      },
      mainEntityOfPage: `${SITE_URL}/notes/${note.slug}`,
    });
    document.head.appendChild(ld);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const hadCanonical = canonical !== null;
    const prevHref = canonical?.href ?? null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}/notes/${note.slug}`;

    return () => {
      ld.remove();
      if (!canonical) return;
      if (hadCanonical && prevHref) {
        canonical.href = prevHref;
      } else {
        canonical.remove();
      }
    };
  }, [note]);

  if (!note) {
    return (
      <main id="main" className="bg-creme paper">
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-20 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § Note not found
          </div>
          <h1 className="mt-5 font-serif text-3xl leading-tight text-navy">
            We don’t have a reading note for that slug.
          </h1>
          <div className="mt-6 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-6 font-serif text-lg leading-relaxed text-graphit/85">
            Either the link is mistyped, or the note has been retired. The full index of
            current notes lives at{' '}
            <Link to="/notes" className="text-navy underline-offset-4 hover:underline">
              /notes
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={() => navigate('/notes')}
            className="mt-8 inline-flex items-center gap-2 rounded-card border border-navy/15 bg-white px-4 py-2 font-sans text-sm text-navy transition hover:border-gold"
          >
            ← Browse all notes
          </button>
        </div>
      </main>
    );
  }

  const related = getRelatedNotes(note.relatedSlugs);
  const sourceUrl = youtubeUrl(note);
  // GeneratorPage's pre-fill contract uses ?v=<youtubeId>, not a full
  // ?url= — match it so the CTA lands on /new with the paste field
  // already populated and the form one click from submit.
  const generateUrl = `/new?v=${encodeURIComponent(note.youtubeId)}`;

  return (
    <main id="main" className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8 sm:pt-8">
        <Link
          to="/notes"
          className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
        >
          ← All reading notes
        </Link>
      </div>

      {/* Hero */}
      <article>
        <header className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § Reading note · {note.creator}
          </div>
          <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
            {note.videoTitle}
          </h1>
          <div className="mt-6 h-px w-16 bg-gold" aria-hidden />
          <p className="mt-6 font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
            {note.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-navy underline-offset-4 hover:underline"
            >
              ▷ Watch on YouTube
            </a>
            <span aria-hidden className="text-graphit/30">·</span>
            <span>{note.durationMin} min source</span>
            <span aria-hidden className="text-graphit/30">·</span>
            <span>@{note.creatorHandle}</span>
          </div>
        </header>

        {/* Sections */}
        <div className="bg-white/70 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="space-y-12">
              {note.sections.map((section, i) => (
                <section key={i}>
                  <h2 className="font-serif text-2xl leading-tight text-navy sm:text-3xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 h-px w-10 bg-gold" aria-hidden />
                  <div className="mt-5 space-y-5 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
                    {section.body.split('\n\n').map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <hr className="mt-14 border-t border-gold/40" />
            <p className="mt-6 font-serif italic text-lg leading-relaxed text-navy sm:text-xl">
              {note.takeaway}
            </p>
          </div>
        </div>

        {/* CTA — quiet, editorial */}
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § Make it yours
          </div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl">
            Generate a knowledge pack from the same video.
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-6 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            This page is a reading of the talk. A pack is your reading of the talk — keyed
            to your language, your mode, and the cards you’ll come back to in a week. No
            signup, no account — start instantly.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              to={generateUrl}
              className="inline-flex items-center gap-2 rounded-card bg-navy px-5 py-3 font-sans text-sm font-medium uppercase tracking-widest text-gold transition hover:bg-navy/90"
            >
              Generate the pack →
            </Link>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm text-navy underline-offset-4 hover:underline"
            >
              Or listen to the original on YouTube
            </a>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-navy/10 bg-white/50 py-14 sm:py-20">
            <div className="mx-auto max-w-3xl px-5 sm:px-8">
              <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
                § Adjacent reading
              </div>
              <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
                If this note held your attention.
              </h2>
              <div className="mt-5 h-px w-10 bg-gold" aria-hidden />
              <ul className="mt-8 space-y-6">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to={`/notes/${r.slug}`}
                      className="group block"
                      aria-label={`Read ${r.metaTitle}`}
                    >
                      <div className="font-sans text-[10px] uppercase tracking-widest text-graphit/65">
                        {r.creator} · {r.durationMin} min
                      </div>
                      <div className="mt-1.5 font-serif text-xl leading-tight text-navy group-hover:underline group-hover:underline-offset-4 sm:text-2xl">
                        {r.videoTitle}
                      </div>
                      <div className="mt-2 font-serif text-base italic leading-snug text-graphit/80 sm:text-lg">
                        {r.takeaway}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </article>

      <footer className="mx-auto max-w-3xl px-5 py-12 text-center font-sans text-xs text-graphit/55 sm:px-8">
        Note written for{' '}
        <Link to="/" className="text-navy underline-offset-4 hover:underline">
          VozClara
        </Link>
        . Original talk by {note.creator} (@{note.creatorHandle}) on YouTube — all rights
        belong to the creator. {locale === 'de' ? 'Diese Notiz ist redaktionell, kein Transkript.' : null}
      </footer>
    </main>
  );
}
