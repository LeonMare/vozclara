/**
 * API base URL for all /api/* fetches.
 *
 * Three layers, evaluated once at module load:
 *
 *   1. VITE_API_BASE env (build-time)
 *        — explicit override. Used when devs run `npm run dev` with
 *          a local wrangler worker on :8787, or for staging deploys
 *          pointing at a different worker.
 *
 *   2. Hostname == "vozclara.app" (runtime)
 *        — production domain. The Worker route in worker/wrangler.toml
 *          handles /api/* same-origin, so we leave the base empty and
 *          let the browser resolve relatively.
 *
 *   3. Anywhere else (runtime fallback)
 *        — Cloudflare Pages preview URLs (*.pages.dev), localhost on
 *          a stale build, anything custom. The Worker route does NOT
 *          match those hostnames, so same-origin /api/* would hit the
 *          SPA HTML fallback and break JSON parsing. Fall through to
 *          the workers.dev URL directly so the API still works.
 *
 *  This module is the single source of truth — every other lib that
 *  used to read import.meta.env.VITE_API_BASE inline now imports
 *  API_BASE from here.
 */

const WORKER_FALLBACK = 'https://vozclara-transcript.salvador7eon.workers.dev';
const PRODUCTION_HOST = 'vozclara.app';

function compute(): string {
  const explicit = import.meta.env.VITE_API_BASE as string | undefined;
  if (explicit && explicit.length > 0) return explicit;
  if (typeof window === 'undefined') return '';
  if (window.location.hostname === PRODUCTION_HOST) return '';
  return WORKER_FALLBACK;
}

export const API_BASE: string = compute();
