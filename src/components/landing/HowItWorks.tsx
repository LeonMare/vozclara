import { useLocale } from '../../lib/i18n';

/**
 * "How it works" — five-step editorial flow. Serif numerals, gold
 * underline accent. Last step (Ask my library) is dimmed with a
 * "coming soon" treatment.
 */
export function HowItWorks() {
  const { t } = useLocale();

  return (
    <section className="bg-white/70 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="mb-12 sm:mb-16">
          <div className="mb-3 font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § 04
          </div>
          <h2 className="font-serif text-3xl text-navy sm:text-4xl">
            {t.howTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
        </header>

        <ol className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {t.howSteps.map((step, i) => {
            const isComingSoon = i === 4;
            return (
              <li
                key={i}
                className={[
                  'group relative card-hover scroll-fade rounded-card border border-navy/10 bg-creme p-5 sm:p-6',
                  isComingSoon ? 'opacity-70' : '',
                ].join(' ')}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span
                  className="font-serif text-4xl leading-none text-gold/35 tabular-nums sm:text-5xl"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-serif text-lg leading-tight text-navy sm:text-xl">
                  {step}
                </h3>
                <p className="mt-2 font-sans text-[13px] leading-relaxed text-graphit/70">
                  {t.howDescriptions[i]}
                </p>
                <div
                  className="mt-4 h-px w-6 bg-gold/40 transition-all duration-300 group-hover:w-10 group-hover:bg-gold"
                  aria-hidden
                />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
