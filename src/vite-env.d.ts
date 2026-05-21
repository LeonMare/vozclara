/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRANSLATION_EMAIL?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_CF_BEACON_TOKEN?: string;
  /**
   * Plausible Analytics domain (e.g. `vozclara.app`). When set,
   * `src/lib/analytics.ts:initAnalytics()` injects the Plausible
   * script tag and `track()` starts firing custom events. When
   * unset, every `track()` call is a silent no-op — the call
   * sites stay in place before and after activation without
   * conditional guards.
   *
   * Provision once Plausible.io account + project is created:
   *   1. Create the site at plausible.io (free 30-day trial).
   *   2. Add `VITE_PLAUSIBLE_DOMAIN=vozclara.app` to
   *      `.env.production` (and a matching value to `.env.local`
   *      for dev hits).
   *   3. Re-deploy via `node scripts/deploy.mjs`.
   *   4. Mark the funnel goals in the Plausible dashboard using
   *      the event names exported from `src/lib/analytics.ts`
   *      (Events constant).
   */
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_BUILD_ID?: string;
  /** Paddle client-side token (live_…) — public-safe, domain-restricted
   *  in the Paddle dashboard. Used by @paddle/paddle-js to open the
   *  embedded Founder-Deal checkout overlay. See src/lib/founder.ts. */
  readonly VITE_PADDLE_CLIENT_TOKEN?: string;
  /** Paddle price id (pri_…) for the Founder Deal one-time €99 plan. */
  readonly VITE_PADDLE_FOUNDER_PRICE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
