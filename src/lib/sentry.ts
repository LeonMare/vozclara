/**
 * Sentry frontend wiring — conditional on VITE_SENTRY_DSN being set
 * at build time. Dev / unset = no-op, so contributors don't ship
 * test errors to production and CI builds without a DSN don't fail.
 *
 * Activation:
 *   1. Create a Sentry project at sentry.io (React + Browser).
 *   2. Copy the DSN ("https://<key>@o<org>.ingest.sentry.io/<project>").
 *   3. Set VITE_SENTRY_DSN in .env.production and redeploy.
 *
 * Once active, the ErrorBoundary's componentDidCatch hands errors
 * here via window.__VOZCLARA_ERROR_HOOK, and Sentry also catches
 * unhandled promise rejections + global errors via its native hooks.
 */
import * as Sentry from '@sentry/browser';

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initSentry(): void {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.PROD ? 'production' : 'development',
    release: import.meta.env.VITE_BUILD_ID as string | undefined,
    // Keep sample rates lean to stay inside the 5k errors/month free
    // tier. Bumps allowed once paid metrics show how much we actually
    // ingest.
    sampleRate: 1.0,
    tracesSampleRate: 0,
    // Don't ship third-party errors we can't action (browser
    // extensions, ad-blockers stripping fetch URLs, etc.).
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Loading chunk \d+ failed/,
      /^Network Error$/,
    ],
  });

  // Bridge for ErrorBoundary — class component dispatches errors here.
  (window as unknown as { __VOZCLARA_ERROR_HOOK?: (e: Error, info: unknown) => void }).__VOZCLARA_ERROR_HOOK =
    (error: Error, info: unknown) => {
      Sentry.captureException(error, { extra: { info } });
    };
}
