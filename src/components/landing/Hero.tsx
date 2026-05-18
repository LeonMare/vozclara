import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractVideoId } from '../../lib/youtube';
import { useLocale } from '../../lib/i18n';
import { useMagneticHover } from '../../hooks/useMagneticHover';
import { HeroPackPreview } from './HeroPackPreview';
import { BrandMark } from '../BrandMark';

/**
 * Hero — the entry point. Tightened above-the-fold so the headline,
 * sub-claim, paste-field and CTAs all live in the first viewport on
 * a typical desktop (≥768px tall).
 *
 * Composition:
 *   • Medallion seal (small, dignified — not a hero ornament that
 *     wastes space)
 *   • Eyebrow → Headline → Gold draw-rule
 *   • Sub-claim (one sentence, concrete promise)
 *   • Paste input + primary CTA in one row
 *   • Trust note ("free, no card") immediately under the input
 *   • Tertiary links: "see how" and "sample pack"
 *   • Live Pack preview on the right (HeroPackPreview)
 */
export function Hero() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = extractVideoId(value);
    if (!id) {
      setError(t.invalidUrl);
      return;
    }
    navigate(`/new?v=${id}`);
  }

  function scrollToHow() {
    document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' });
  }

  const headlineWords = t.heroHeadline.split(' ');

  return (
    <section className="relative overflow-hidden bg-creme paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[75vh] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(201,162,75,0.16), transparent 55%), radial-gradient(ellipse at bottom left, rgba(10,26,58,0.06), transparent 50%)',
        }}
        aria-hidden
      />

      {/* Tighter vertical rhythm on mobile so the headline + CTA land
          above the first-fold on a 375 × 812 iPhone. The XL monogram
          is hidden on small screens for the same reason — it pushes
          the actual value-prop below the fold otherwise. */}
      <div className="relative mx-auto max-w-6xl px-5 py-4 sm:px-8 sm:py-14 lg:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Left — copy */}
          <div>
            <div className="animate-fade-in">
              <div className="hidden sm:block">
                <BrandMark variant="monogram" size="xl" tone="navy" decorative />
              </div>
              <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep sm:mt-4">
                {t.heroEyebrow}
              </div>
            </div>

            <h1
              className="word-stagger mt-3 font-serif text-4xl leading-[1.05] text-navy sm:mt-5 sm:text-5xl lg:text-6xl"
            >
              {headlineWords.map((word, i) => (
                <span key={i} style={{ ['--i' as string]: i }}>
                  {word}
                  {i < headlineWords.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h1>

            <div className="mt-5 h-px w-16 origin-left bg-gold draw-rule" aria-hidden />

            <p
              className="hero-rise-slow mt-5 max-w-xl font-sans text-base leading-relaxed text-graphit/80 sm:text-lg"
              style={{ animationDelay: '500ms' }}
            >
              {t.heroSub}
            </p>

            <form
              onSubmit={handleSubmit}
              className="hero-rise mt-6"
              style={{ animationDelay: '750ms' }}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={t.heroUrlInputLabel}
                  placeholder={t.heroPlaceholder}
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
                  <span className="relative z-10">{t.primaryCTA}</span>
                  <span
                    className="absolute inset-0 rounded-card opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ boxShadow: '0 0 0 1px rgba(201,162,75,0.4), 0 0 28px rgba(201,162,75,0.25)' }}
                    aria-hidden
                  />
                </button>
              </div>
              {/* Trust note — immediately under the input, never far from the CTA. */}
              <p className="mt-2.5 font-sans text-[12px] text-graphit/65">
                {trustNote(locale)}
              </p>
              {error && (
                <p role="alert" className="mt-2 font-sans text-sm text-red-700">{error}</p>
              )}
            </form>

            <div
              className="hero-rise mt-4 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm"
              style={{ animationDelay: '900ms' }}
            >
              <button
                type="button"
                onClick={scrollToHow}
                className="text-graphit/65 underline-offset-4 transition hover:text-navy hover:underline"
              >
                {t.seeHowCTA} →
              </button>
              <Link
                to="/pack/sample"
                className="text-graphit/65 italic underline-offset-4 transition hover:text-gold hover:underline"
              >
                {t.trySamplePack}
              </Link>
            </div>
          </div>

          {/* Right — live interactive Sample Pack preview */}
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <HeroPackPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

// "Free to try. No credit card." — localised under the paste input so the
// trust signal arrives at the moment of hesitation. Takes locale from
// useLocale's reactive state, never from DOM (DOM reads are not React-
// reactive and caused mixed-language UI when the user switched picker).
function trustNote(locale: string): string {
  if (locale.startsWith('es')) return 'Gratis para probar. Sin tarjeta de crédito.';
  if (locale.startsWith('pt')) return 'Grátis para experimentar. Sem cartão de crédito.';
  if (locale.startsWith('de')) return 'Kostenlos testen. Keine Kreditkarte.';
  return 'Free to try. No credit card.';
}
