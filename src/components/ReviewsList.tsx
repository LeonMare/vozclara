import { useEffect, useState } from 'react';
import { useLocale } from '../lib/i18n';
import { fetchReviews, type ReviewItem } from '../lib/rating';

/**
 * Reviews list — shows the text reviews other signed-in users have
 * written on this video's rating, beneath the RatingPanel.
 *
 * Editorial style: each row is a serif italic blockquote with a small
 * avatar bubble (gold initial on navy disc, mirrors the brand Avatar
 * but lightweight here because we don't have the reviewer's email or
 * name — only their opaque voterId-prefix), star count, relative date,
 * and the review text itself.
 *
 * The component is fire-and-forget: any fetch failure or empty result
 * yields zero rendered output. The rating-panel write-flow already
 * lives inside RatingPanel; this is purely the read surface.
 *
 * Per-video, not per-pack — the same video viewed via different modes
 * shares one review pool. That matches the rating aggregation already
 * happening on the rating aggregate.
 */
export function ReviewsList({ videoId }: { videoId: string }) {
  const { locale } = useLocale();
  const labels = reviewsLabels(locale);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchReviews(videoId, 20).then((list) => {
      if (!cancelled) {
        setItems(list);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [videoId]);

  // Hide entirely until we know whether anything's there + when empty.
  // No editorial value in showing a "no reviews yet" empty state — the
  // RatingPanel already says "Sei der Erste, der bewertet."
  if (!loaded || items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
        § {labels.eyebrow}
      </div>
      <h3 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
        {labels.heading(items.length)}
      </h3>
      <div className="mt-4 h-px w-12 bg-gold" aria-hidden />

      <ol className="mt-6 space-y-5">
        {items.map((r) => (
          <ReviewRow key={r.voterId + r.updatedAt} review={r} locale={locale} labels={labels} />
        ))}
      </ol>
    </section>
  );
}

function ReviewRow({
  review,
  locale,
  labels,
}: {
  review: ReviewItem;
  locale: string;
  labels: ReturnType<typeof reviewsLabels>;
}) {
  const initial = review.voterId.charAt(0).toUpperCase() || '?';
  const date = new Date(review.updatedAt).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return (
    <li className="rounded-card border border-navy/10 bg-white px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex items-start gap-3">
        {/* Lightweight inline avatar disc — same brand recipe as the
            Avatar component (navy / gold initial) but sized to fit
            inline with the review row without overpowering it. */}
        <span
          aria-hidden
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-navy font-serif text-sm text-gold"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
            <span>{`${labels.reader} ${review.voterId}`}</span>
            {review.stars !== null && (
              <span aria-label={`${review.stars} ${labels.stars}`} className="text-gold-deep">
                {'★'.repeat(review.stars)}
                <span className="opacity-30">{'★'.repeat(5 - review.stars)}</span>
              </span>
            )}
            <span className="tabular-nums">{date}</span>
          </div>
          <p className="mt-2 font-serif text-base italic leading-relaxed text-graphit/85 sm:text-lg">
            “{review.review}”
          </p>
        </div>
      </div>
    </li>
  );
}

function reviewsLabels(locale: string) {
  const l = (locale ?? '').toLowerCase();
  if (l.startsWith('es')) return {
    eyebrow: 'OPINIONES',
    heading: (n: number) => (n === 1 ? 'Una reseña.' : `${n} reseñas.`),
    reader: 'Lector',
    stars: 'estrellas',
  };
  if (l.startsWith('pt')) return {
    eyebrow: 'OPINIÕES',
    heading: (n: number) => (n === 1 ? 'Uma opinião.' : `${n} opiniões.`),
    reader: 'Leitor',
    stars: 'estrelas',
  };
  if (l.startsWith('de')) return {
    eyebrow: 'STIMMEN',
    heading: (n: number) => (n === 1 ? 'Eine Rezension.' : `${n} Rezensionen.`),
    reader: 'Leser',
    stars: 'Sterne',
  };
  return {
    eyebrow: 'REVIEWS',
    heading: (n: number) => (n === 1 ? 'One review.' : `${n} reviews.`),
    reader: 'Reader',
    stars: 'stars',
  };
}
