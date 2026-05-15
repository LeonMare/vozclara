import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractVideoId } from '../../lib/youtube';
import { useLocale } from '../../lib/i18n';
import { useMagneticHover } from '../../hooks/useMagneticHover';

/**
 * Closing call-to-action. Echoes the hero form so a reader who scrolled
 * all the way down doesn't have to scroll back up.
 */
export function FinalCTA() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ctaRef = useMagneticHover<HTMLButtonElement>(0.22);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = extractVideoId(value);
    if (!id) {
      // Allow empty submit too — sends user to /new where they can paste later.
      if (!value.trim()) {
        navigate('/new');
        return;
      }
      setError(t.invalidUrl);
      return;
    }
    navigate(`/new?v=${id}`);
  }

  return (
    <section className="relative overflow-hidden border-t border-navy/10 bg-creme paper py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] opacity-40"
        style={{ background: 'radial-gradient(ellipse at bottom center, rgba(201,162,75,0.15), transparent 60%)' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">§ 10</div>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-navy sm:text-5xl">
          {t.finalTitle}
        </h2>
        <div className="mx-auto mt-5 h-px w-12 bg-gold" aria-hidden />
        <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-graphit/75 sm:text-lg">
          {t.finalSub}
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
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
              <span className="relative z-10">{t.finalCTA}</span>
              <span
                className="absolute inset-0 rounded-card opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ boxShadow: '0 0 0 1px rgba(201,162,75,0.4), 0 0 28px rgba(201,162,75,0.25)' }}
                aria-hidden
              />
            </button>
          </div>
          {error && <p role="alert" className="mt-3 font-sans text-sm text-red-700">{error}</p>}
        </form>
      </div>
    </section>
  );
}
