/**
 * ConversionChip — the editorial Pro-nudge surface used by every
 * trigger in src/lib/conversionTriggers.ts.
 *
 * Design intent (CLAUDE.md §5 + LEON MARÉ register):
 *   • Soft pill, not a modal — the user can keep reading the pack /
 *     library / pricing without it interrupting them.
 *   • One declarative sentence (no "ONLY TODAY", no countdown).
 *   • One primary CTA (Link to /founder or /pricing) + one small
 *     dismiss × that persists in localStorage so the chip stays
 *     dismissed across sessions.
 *   • Gold + creme palette, Cormorant for the sentence + Inter
 *     for the CTA — visually echoes the AccountSyncBanner so the
 *     two soft-conversion surfaces read as siblings.
 *
 * The chip is `aria-live="polite"` so screen readers announce it
 * once when it appears, then stay quiet. The dismiss button is a
 * real `<button>` with a clear aria-label.
 *
 * The component fires `trigger_shown` exactly once per mount via
 * useEffect — re-mounting on a route switch is the desired
 * behaviour because that's a fresh exposure. Click + dismiss
 * events fire from inside the handlers.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  dismissTrigger,
  isTriggerDismissed,
  trackTriggerClicked,
  trackTriggerShown,
  triggerCopy,
  type TriggerId,
} from '../lib/conversionTriggers';

export interface ConversionChipProps {
  /** Stable trigger id — controls copy + persistence + analytics. */
  triggerId: TriggerId;
  /** Locale for the chip's text. */
  locale: string;
  /**
   * Eligibility predicate the caller checks before rendering. The
   * chip itself ALSO short-circuits on `isTriggerDismissed(id)`
   * so the caller doesn't have to repeat that check. Returning
   * null from the chip when dismissed keeps the parent layout
   * stable without conditional rendering at every call-site.
   */
  visible?: boolean;
  /**
   * Optional extra analytics props to attach to all three events
   * (e.g. `pack_count: 7` for T2 — useful for funnel filtering on
   * the Plausible dashboard).
   */
  analyticsProps?: Record<string, string | number | boolean>;
  /** Optional extra Tailwind utilities the caller wants on the chip. */
  className?: string;
}

export function ConversionChip({
  triggerId,
  locale,
  visible = true,
  analyticsProps,
  className = '',
}: ConversionChipProps): JSX.Element | null {
  const dismissed = isTriggerDismissed(triggerId);
  const shouldShow = visible && !dismissed;

  // Fire the `trigger_shown` event exactly once per mount where the
  // chip is actually visible. The empty-array deps keep this from
  // re-firing if the parent re-renders for unrelated reasons.
  useEffect(() => {
    if (shouldShow) trackTriggerShown(triggerId, analyticsProps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!shouldShow) return null;

  const copy = triggerCopy(triggerId, locale);

  function onCtaClick(): void {
    trackTriggerClicked(triggerId, analyticsProps);
  }

  function onDismiss(): void {
    dismissTrigger(triggerId);
    // Force re-render via location-hash trick isn't worth it for v1 —
    // chip re-checks isTriggerDismissed on next render, parent will
    // re-render naturally when the user navigates / generates / etc.
    // For an immediate visual disappear, the parent can branch on
    // its own state if it wants. Documented in the trigger's
    // call-site comment.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vozclara:trigger-dismissed', {
        detail: { triggerId },
      }));
    }
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className={[
        'flex flex-wrap items-center gap-3 rounded-card border border-gold/40 bg-gold/8 px-4 py-3 sm:px-5',
        className,
      ].join(' ')}
    >
      <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-gold/70" aria-hidden />
      <p className="min-w-0 flex-1 font-serif italic text-[14px] leading-snug text-navy sm:text-[15px]">
        {copy.message}
      </p>
      <Link
        to={copy.ctaHref}
        onClick={onCtaClick}
        className="shrink-0 rounded-card border border-gold/60 bg-creme px-3 py-1.5 font-sans text-xs font-medium text-navy transition hover:bg-gold/15"
      >
        {copy.ctaLabel} →
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={copy.dismissLabel}
        title={copy.dismissLabel}
        className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-graphit/55 transition hover:bg-navy/5 hover:text-navy"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path
            d="M2 2 L10 10 M10 2 L2 10"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </aside>
  );
}
