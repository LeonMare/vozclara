import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { initSentry } from './lib/sentry';

// Initialise error reporting before React mounts so render-phase
// exceptions are captured. No-op when VITE_SENTRY_DSN is unset.
initSentry();

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
