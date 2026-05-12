import { useLocale, SUPPORTED_LOCALES, LOCALE_SHORT, type Locale } from '../lib/i18n';

interface Props {
  /** Compact mode for embedding in the header. */
  compact?: boolean;
}

/**
 * Four-language picker. ES · PT · DE · EN — the four LEON MARÉ
 * brand-foundation languages. Plain text buttons, no flag icons
 * (flags are politically loaded and the Brand Foundation favours
 * substance over symbolism).
 */
export function LanguagePicker({ compact = false }: Props) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Language"
      className={[
        'inline-flex items-center gap-px rounded-card border border-navy/15 bg-white p-0.5',
        compact ? 'text-[10px]' : 'text-xs',
      ].join(' ')}
    >
      {SUPPORTED_LOCALES.map((l: Locale) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            className={[
              'rounded-card font-sans font-medium tracking-widest transition',
              compact ? 'px-2 py-1' : 'px-2.5 py-1.5',
              active
                ? 'bg-navy text-creme'
                : 'text-graphit/60 hover:text-navy',
            ].join(' ')}
          >
            {LOCALE_SHORT[l]}
          </button>
        );
      })}
    </div>
  );
}
