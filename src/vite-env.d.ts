/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRANSLATION_EMAIL?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_CF_BEACON_TOKEN?: string;
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
