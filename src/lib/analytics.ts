/**
 * Plausible Analytics — cookieless funnel-event tracking.
 *
 * Activation requires the build-time env var `VITE_PLAUSIBLE_DOMAIN`
 * (e.g. `vozclara.app`) to be set. When unset, `track()` is a
 * silent no-op, so the call sites can stay in place before and after
 * activation without conditional guards.
 *
 * Why Plausible over PostHog: VozClara is cookieless-by-design
 * (MASTER.md §63, CLAUDE.md §1.4) — Cloudflare Web Analytics is
 * already running, no consent banner has ever been needed. Plausible
 * preserves that posture (no cookies, respects DNT, EU-hosted) while
 * adding the custom-event taxonomy that the pre-launch Pro-Upgrade
 * funnel requires. PostHog's full feature set would mean turning on
 * cookies + a consent banner, which conflicts with the brand promise
 * on /privacy and the OG image bottom strip.
 *
 * Funnel taxonomy (mirrored on the Plausible dashboard as goals):
 *
 *   paste_url                 → user pasted a YouTube URL on Hero / /new
 *   pack_generation_started   → handleGenerate ran successfully past
 *                               the transcript-fetch step
 *   pack_generated            → pack persisted to IndexedDB, redirect
 *                               to /pack/{id} fired
 *   pack_generation_failed    → handleGenerate threw — useful for
 *                               flagging Supadata / LLM outages
 *   viewed_pricing            → /pricing route mounted
 *   viewed_founder            → /founder route mounted
 *   founder_checkout_opened   → Paddle overlay opened (paddle-js
 *                               `Checkout.open` resolved)
 *   founder_checkout_dismissed→ Paddle overlay closed without payment
 *                               (`Checkout.completed === false`)
 *
 * The actual `founder_purchase` event fires server-side via the
 * Paddle `transaction.completed` webhook (worker/src/founder.ts) so
 * adblockers / DNT can't poison the conversion number. The Plausible
 * goal for it gets set with the server-side events API endpoint —
 * documented as a follow-up in MASTER.md once Plausible is provisioned.
 */

declare global {
  interface Window {
    plausible?: ((
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void) & { q?: unknown[][] };
  }
}

/* ─── Provisioning helpers ─────────────────────────────────────────── */

/** True iff Plausible has been activated for this build. */
export function analyticsEnabled(): boolean {
  return Boolean(import.meta.env.VITE_PLAUSIBLE_DOMAIN);
}

/**
 * Inject Plausible's script tag — call once from `src/main.tsx`
 * before React mounts. Safe to call when the env var is unset
 * (no-op). Safe to call twice (second call short-circuits).
 *
 * Uses Plausible's tagged-events build so custom events fire from
 * any element with `data-tagged-event="…"` in addition to the
 * imperative `window.plausible()` calls our code makes through
 * `track()`. Cuts down on event-call-site sprawl as new conversion
 * moments appear in the UI.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain) return;
  if (window.plausible && Array.isArray(window.plausible.q)) return; // already loaded

  // Pre-stub the window.plausible queue so calls made before the
  // script lands don't get lost. Plausible's snippet does the same
  // pattern (queue calls until script ready, flush on load).
  const stub = function (
    event: string,
    options?: { props?: Record<string, string | number | boolean> },
  ) {
    (stub.q = stub.q || []).push([event, options]);
  } as Window['plausible'] & { q?: unknown[][] };
  stub.q = [];
  window.plausible = stub;

  const s = document.createElement('script');
  s.defer = true;
  s.dataset.domain = domain;
  s.src = 'https://plausible.io/js/script.tagged-events.outbound-links.js';
  document.head.appendChild(s);
}

/* ─── Event tracking ──────────────────────────────────────────────── */

/** Centralised event names. Renames only happen here. */
export const Events = {
  PASTE_URL: 'paste_url',
  PACK_GENERATION_STARTED: 'pack_generation_started',
  PACK_GENERATED: 'pack_generated',
  PACK_FAILED: 'pack_generation_failed',
  VIEWED_PRICING: 'viewed_pricing',
  VIEWED_FOUNDER: 'viewed_founder',
  FOUNDER_CHECKOUT_OPENED: 'founder_checkout_opened',
  FOUNDER_CHECKOUT_DISMISSED: 'founder_checkout_dismissed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

/**
 * Fire a Plausible custom event. No-ops cleanly when Plausible is
 * not provisioned (VITE_PLAUSIBLE_DOMAIN unset) or when the script
 * has been blocked by an adblocker. Never throws.
 *
 * Props should be flat key-value pairs (string / number / boolean) —
 * Plausible drops anything nested. Use them for low-cardinality
 * dimensions (locale, mode, tier) so the dashboard filters stay
 * useful; do NOT pass user-identifying values (cookieless-by-design).
 */
export function track(
  event: EventName | (string & {}),
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.plausible !== 'function') return;
  try {
    window.plausible(event, props ? { props } : undefined);
  } catch {
    /* Analytics is fire-and-forget. Never let a tracking error
       crash the page. */
  }
}
