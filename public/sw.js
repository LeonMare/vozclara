/**
 * VozClara Service Worker — minimal, intentionally so.
 *
 *   • Cache-first for the static app shell (HTML, JS, CSS, fonts, icons) so
 *     the PWA opens instantly once installed.
 *   • Network-first for /api/* calls so transcripts stay fresh.
 *   • Pass-through for YouTube and MyMemory third-party resources — those
 *     have their own CDN caches and we shouldn't try to outsmart them.
 *
 * Cache name carries the build timestamp (__BUILD_ID__ stamped by
 * scripts/stamp-sw.mjs at build time). On each deploy the cache name
 * changes, the install handler caches fresh assets, and the activate
 * handler purges the old cache — so installed PWAs pick up the new
 * bundle automatically on next visit.
 */

const BUILD_ID = '__BUILD_ID__';
const APP_CACHE = `vozclara-shell-${BUILD_ID}`;
const RUNTIME_CACHE = `vozclara-runtime-${BUILD_ID}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== APP_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip cross-origin (YouTube, MyMemory, Google Fonts CSS/woff2) — let the
  // browser cache handle them. Caching them ourselves doesn't help and would
  // bloat IndexedDB unnecessarily.
  if (url.origin !== self.location.origin) return;

  // Network-first for the transcript API: we want fresh data, fall back to
  // cache only if the network is dead.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Cache-first for everything else (the app shell + Vite-built assets).
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') {
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    // Last resort for navigations: return the cached index.
    if (req.mode === 'navigate') {
      return (await cache.match('/index.html')) ?? Response.error();
    }
    throw new Error('network_unavailable');
  }
}

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    return Response.error();
  }
}
