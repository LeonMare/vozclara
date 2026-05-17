import { Link } from 'react-router-dom';
import type { CuratedItem } from '../lib/curated';

interface Props {
  items: CuratedItem[];
  locale: string;
  /** "empty" = on empty-library page (centred, contained); "header" = on populated library top. */
  variant: 'empty' | 'header';
}

/**
 * Featured Knowledge Packs row. Card per pack with mode tag, source
 * channel, language combo, and a short excerpt. Click → /pack/:id.
 *
 * Empty-library variant: centred, slightly larger, intended as a
 * cold-start hook — gives the user something to read before they
 * have any saved packs of their own.
 *
 * Header variant: above the stats line on a populated library, so
 * return-visitors see fresh editorial picks without having to scroll.
 */
export function CuratedSection({ items, locale, variant }: Props) {
  const t = labels(locale);
  if (items.length === 0) return null;

  const trimmed = items.slice(0, 3);

  return (
    <section
      className={
        variant === 'empty'
          ? 'mt-14 text-left'
          : 'mb-8 border-b border-navy/10 pb-8'
      }
      aria-labelledby="curated-heading"
    >
      <header className={variant === 'empty' ? 'text-center' : ''}>
        <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
          {t.eyebrow}
        </p>
        <h2
          id="curated-heading"
          className={
            variant === 'empty'
              ? 'mt-3 font-serif text-2xl text-navy sm:text-3xl'
              : 'mt-2 font-serif text-xl text-navy sm:text-2xl'
          }
        >
          {t.title}
        </h2>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trimmed.map((item) => (
          <CuratedCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function CuratedCard({ item, locale }: { item: CuratedItem; locale: string }) {
  const t = labels(locale);
  const date = new Date(item.publishedAt).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
  });
  const modeLabel = t.modes[item.mode];

  // Auto-generated entries (videoId present) route to /new with the
  // YouTube id pre-filled; static fallback entries route directly to
  // the existing sample pack.
  const target = item.videoId
    ? `/new?v=${encodeURIComponent(item.videoId)}&lang=${item.packLangs[0] ?? 'es'}&mode=${item.mode}`
    : `/pack/${item.id}`;

  return (
    <Link
      to={target}
      className="group flex flex-col gap-2 rounded-card border border-navy/15 bg-white px-4 py-4 transition hover:border-gold"
    >
      <div className="flex items-center justify-between font-sans text-[10px] uppercase tracking-widest text-graphit/55">
        <span>{item.source}</span>
        <span>{date}</span>
      </div>
      <h3 className="font-serif text-base leading-snug text-navy">
        {item.title}
      </h3>
      <p className="line-clamp-2 font-sans text-xs leading-relaxed text-graphit/70">
        {item.excerpt}
      </p>
      <div className="mt-1 flex items-center justify-between font-sans text-[10px] uppercase tracking-widest text-graphit/55">
        <span>{modeLabel}</span>
        <span>
          {item.sourceLang.toUpperCase()} → {item.packLangs.map((l) => l.toUpperCase()).join(' · ')}
        </span>
      </div>
    </Link>
  );
}

function labels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'DESTACADOS',
    title: 'Conocimiento curado',
    modes: { learn: 'Aprender', business: 'Business', creator: 'Creator' },
  };
  if (locale.startsWith('pt')) return {
    eyebrow: 'DESTAQUES',
    title: 'Conhecimento curado',
    modes: { learn: 'Aprender', business: 'Business', creator: 'Creator' },
  };
  if (locale.startsWith('de')) return {
    eyebrow: 'AUSGEWÄHLT',
    title: 'Kuratiertes Wissen',
    modes: { learn: 'Lernen', business: 'Business', creator: 'Creator' },
  };
  return {
    eyebrow: 'FEATURED',
    title: 'Curated knowledge',
    modes: { learn: 'Learn', business: 'Business', creator: 'Creator' },
  };
}
