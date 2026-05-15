import type { FriendlyError } from '../lib/errorMessages';

interface Props {
  error: FriendlyError;
  /** Optional action button to the right (e.g. "Try a different video") */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Inline error/warning card. Used by GeneratorPage (and any future
 * route that needs to surface a typed error) instead of the plain
 * red `<p role="alert">` line we had before.
 *
 * Severity drives the colour band:
 *   error  → red border, red title, red icon
 *   warn   → amber border, navy title, amber icon (most common —
 *            covers retry-possible failures like no_captions,
 *            rate_limited, ai_failed)
 *   info   → navy border, navy title, navy icon
 */
export function ErrorCard({ error, actionLabel, onAction }: Props) {
  const tone = toneStyles(error.severity);

  return (
    <div
      role="alert"
      className={[
        'mt-4 flex items-start gap-3 rounded-card border-l-2 px-4 py-3 sm:px-5 sm:py-4',
        tone.container,
      ].join(' ')}
    >
      <span className={['mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center', tone.icon].join(' ')} aria-hidden>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          {error.severity === 'info' ? (
            <>
              <circle cx="7" cy="4" r="0.8" fill="currentColor" />
              <path d="M7 6.5 V10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M7 3.5 V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="7" cy="10" r="0.8" fill="currentColor" />
            </>
          )}
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <p className={['font-serif text-base leading-snug', tone.title].join(' ')}>
          {error.title}
        </p>
        <p className="mt-1 font-sans text-sm leading-snug text-graphit/75">
          {error.description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 self-start rounded-card border border-navy/20 bg-white px-3 py-1.5 font-sans text-xs text-navy transition hover:border-gold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function toneStyles(severity: FriendlyError['severity']) {
  if (severity === 'error') {
    return {
      container: 'border-red-700/60 bg-red-50',
      icon: 'text-red-700',
      title: 'text-red-900',
    };
  }
  if (severity === 'warn') {
    return {
      container: 'border-amber-500/60 bg-amber-50/70',
      icon: 'text-amber-700',
      title: 'text-navy',
    };
  }
  return {
    container: 'border-navy/30 bg-creme',
    icon: 'text-navy',
    title: 'text-navy',
  };
}
