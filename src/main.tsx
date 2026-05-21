import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { initAnalytics } from './lib/analytics';

// Browser-side error reporting intentionally OFF: Sentry's browser SDK
// sets cookies which would force a DSGVO cookie banner. We instead
// rely on (a) Worker-side Sentry for server errors, (b) the
// ErrorBoundary's console.error + visual fallback for render errors,
// and (c) cookieless Cloudflare Web Analytics for product metrics.
// See CLAUDE.md §1.4 / MASTER.md §1.2.
//
// Plausible Analytics layers on top of Cloudflare Web Analytics with
// custom funnel events (paste_url → pack_generated → viewed_pricing →
// founder_checkout_opened). Cookieless, EU-hosted, respects DNT —
// preserves the no-banner posture. Dormant until VITE_PLAUSIBLE_DOMAIN
// is set at build time (see src/lib/analytics.ts).
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service Worker — registered only in production. Vite's dev server has its
// own HMR machinery and a SW would fight it; the production build serves
// /sw.js correctly via the static `public/` folder.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}
