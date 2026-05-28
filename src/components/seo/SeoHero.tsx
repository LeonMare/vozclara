import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractVideoId } from '../../lib/youtube';
import { useLocale } from '../../lib/i18n';
import { useMagneticHover } from '../../hooks/useMagneticHover';
import { track, Events } from '../../lib/analytics';

/**
 * Shared SEO-landing hero. Used by all seven /learn-X-with-youtube
 * landings plus /youtube-to-anki / /knowledge-packs / /privacy-first
 * SEO pages. Encapsulates the paste-URL form, magnetic-hover CTA,
 * gold draw-rule, trust note line, and the analytics event-fire.
 *
 * Trade-off vs inlining: a single source of truth for the form +
 * track() call, at the cost of one more component file. Worth it
 * because the form + CTA pattern is now used in 7 places and adding
 * an 8th language-pair landing should be a 50-line config commit,
 * not a 500-line copy-paste.
 */
export interface SeoHeroProps {
  /** Tiny gold-deep eyebrow above the headline. Uppercased + tracking-wide. */
  eyebrow: string;
  /** Serif H1. The main hook. */
  h1: string;
  /** Sub-copy under the gold draw-rule. */
  sub: string;
  /** CTA button label. */
  cta: string;
  /** Form input placeholder (defaults to the locale's t.heroPlaceholder). */
  placeholder?: string;
  /** Italic gold-deep line under the trust note. Optional. */
  trustNote: string;
  /** Plausible event source identifier. */
  trackSource: string;
}

export function SeoHero({
  eyebrow,
  h1,
  sub,
  cta,
  placeholder,
  trustNote,
  trackSource,
}: SeoHeroProps) {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = extractVideoId(value);
    if (!id) {
      if (!value.trim()) {
        navigate('/new');
        return;
      }
      setError(t.invalidUrl);
      return;
    }
    track(Events.PASTE_URL, { locale, source: trackSource });
    navigate(`/new?v=${id}`);
  }

  return (
    <header>
      <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
        {eyebrow}
      </div>
      <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
        {h1}
      </h1>
      <div className="mt-5 h-px w-16 bg-gold draw-rule" aria-hidden />
      <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-graphit/80 sm:text-lg">
        {sub}
      </p>

      <form onSubmit={handleSubmit} className="mt-7">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            aria-label={t.heroUrlInputLabel}
            placeholder={placeholder ?? t.heroPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 rounded-card border border-navy/15 bg-white px-4 py-3.5 font-sans text-base text-graphit placeholder-graphit/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
          <button
            ref={ctaRef}
            type="submit"
            className="group relative rounded-card bg-navy px-6 py-3.5 font-sans text-base font-medium text-creme will-change-transform hover:bg-navy/90"
            style={{ transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease' }}
          >
            <span className="relative z-10">{cta}</span>
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 font-sans text-sm text-red-700">
            {error}
          </p>
        )}
        <p className="mt-2.5 font-sans text-[12px] text-graphit/65">
          {trustNote}
        </p>
      </form>
    </header>
  );
}
