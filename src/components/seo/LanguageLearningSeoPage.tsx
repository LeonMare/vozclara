import { Link } from 'react-router-dom';
import { SeoHero } from './SeoHero';
import { FounderBannerCallout } from './FounderBannerCallout';

/**
 * Shared language-pair SEO landing template. The four
 * /learn-X-with-youtube pages all use this with locale-specific
 * config. Adding a fifth language pair (French, Italian, Dutch,
 * Polish, etc.) is now a single config object + a 30-line route
 * component + a sitemap entry + a Pages Function.
 *
 * Composition fixed across pages:
 *   Hero (paste-URL form) →
 *   Story block (founder-story-adapted per language) →
 *   Image (anki-moment.png) →
 *   How-it-works (3 steps) →
 *   Channel ladder (4 source-channel cards) →
 *   Founder-deal callout →
 *   Secondary CTAs (sample / anki / back)
 */

export interface LanguageLearningStep {
  title: string;
  body: string;
}

export interface LanguageLearningChannel {
  name: string;
  level: string;
  genre: string;
  note: string;
}

export interface LanguageLearningSeoConfig {
  /** Hero props */
  eyebrow: string;
  h1: string;
  sub: string;
  cta: string;
  placeholder: string;
  trustNote: string;
  trackSource: string;

  /** Story block */
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;

  /** Image alt text */
  imageAlt: string;

  /** How-it-works section */
  howEyebrow: string;
  howTitle: string;
  howSteps: LanguageLearningStep[];

  /** Channel ladder */
  channelsEyebrow: string;
  channelsTitle: string;
  channels: LanguageLearningChannel[];

  /** Footer CTAs */
  sampleCta: string;
  ankiCta: string;
  backCta: string;
}

export interface LanguageLearningSeoPageProps {
  config: LanguageLearningSeoConfig;
}

export function LanguageLearningSeoPage({ config }: LanguageLearningSeoPageProps) {
  return (
    <main id="main" className="relative overflow-hidden bg-creme paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(201,162,75,0.16), transparent 55%), radial-gradient(ellipse at bottom left, rgba(10,26,58,0.06), transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
        <SeoHero
          eyebrow={config.eyebrow}
          h1={config.h1}
          sub={config.sub}
          cta={config.cta}
          placeholder={config.placeholder}
          trustNote={config.trustNote}
          trackSource={config.trackSource}
        />

        {/* Story block — founder-story angle adapted per language */}
        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {config.storyEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {config.storyTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-graphit/85">
            {config.storyBody}
          </p>
          <p className="mt-4 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
            — Christian Leon · LEON MARÉ · Frankfurt
          </p>
        </section>

        {/* Visual proof — anki-moment carries vocab pairs across all
            four supported locales so it reads on-topic regardless of
            direction */}
        <figure className="mt-12 overflow-hidden rounded-card border border-navy/10 shadow-card sm:mt-16">
          <img
            src="/anki-moment.png"
            alt={config.imageAlt}
            loading="lazy"
            className="block h-auto w-full"
          />
        </figure>

        {/* How-it-works */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {config.howEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {config.howTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {config.howSteps.map((step, i) => (
              <li
                key={i}
                className="rounded-card border border-navy/10 bg-white p-5 sm:p-6"
              >
                <span className="font-serif text-3xl leading-none text-gold/40 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-serif text-lg text-navy">{step.title}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-graphit/70">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Channel ladder — concrete starting points so the visitor
            does not bounce on "okay but what video do I paste" */}
        <section className="mt-16 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {config.channelsEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {config.channelsTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {config.channels.map((c, i) => (
              <li
                key={i}
                className="rounded-card border border-navy/10 bg-white px-5 py-4"
              >
                <div className="font-serif text-base text-navy">{c.name}</div>
                <div className="mt-1 font-sans text-[12px] text-graphit/65">
                  {c.level} · {c.genre}
                </div>
                <p className="mt-2 font-sans text-sm text-graphit/75">{c.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <FounderBannerCallout />

        {/* Footer secondary CTAs */}
        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm text-graphit/65 sm:mt-16">
          <Link
            to="/pack/sample-learn"
            className="italic underline-offset-4 transition hover:text-gold hover:underline"
          >
            {config.sampleCta}
          </Link>
          <Link
            to="/youtube-to-anki"
            className="underline-offset-4 transition hover:text-navy hover:underline"
          >
            {config.ankiCta}
          </Link>
          <Link
            to="/"
            className="underline-offset-4 transition hover:text-navy hover:underline"
          >
            {config.backCta}
          </Link>
        </div>
      </div>
    </main>
  );
}
