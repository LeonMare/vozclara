import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { BrandMark } from './components/BrandMark';
import { Landing } from './components/landing/Landing';

/**
 * VozClara — multilingual knowledge cloud for videos.
 *
 * Routing:
 *   /            Landing (the brand expression and onboarding)
 *   /new         Generator — paste URL, choose mode + language
 *   /library     Saved Knowledge Packs
 *   /pack/:id    Single Knowledge Pack (special: /pack/sample is pre-baked)
 *
 * Bundle strategy
 *   Landing is the first-paint route for nearly every visitor, so it
 *   stays in the main bundle alongside the header + brand chrome. The
 *   three app routes are lazy-loaded with React.lazy so they only
 *   download when the user navigates to them. Vite's automatic
 *   code-splitting takes care of the chunk boundaries; the .then()
 *   shim turns each named export back into a default for lazy()'s
 *   contract.
 *
 *   First-load cost on / is dominated by Landing now, not the entire
 *   app surface. The other routes warm up in <100 ms on a typical
 *   network — there's a small RouteLoader fallback for slower
 *   connections so the navigation feels intentional.
 *
 * Header is rendered on every route except Landing (Landing has its own
 * sticky brand chrome). Landing has its own footer; the other routes
 * inherit a minimal layout that lets the content breathe.
 */

const GeneratorPage = lazy(() =>
  import('./routes/GeneratorPage').then((m) => ({ default: m.GeneratorPage })),
);
const LibraryPage = lazy(() =>
  import('./routes/LibraryPage').then((m) => ({ default: m.LibraryPage })),
);
const PackPage = lazy(() =>
  import('./routes/PackPage').then((m) => ({ default: m.PackPage })),
);
const PricingPage = lazy(() =>
  import('./routes/PricingPage').then((m) => ({ default: m.PricingPage })),
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingShell />} />
        <Route
          path="/new"
          element={
            <AppShell>
              <Suspense fallback={<RouteLoader />}>
                <GeneratorPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/library"
          element={
            <AppShell>
              <Suspense fallback={<RouteLoader />}>
                <LibraryPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/pack/:id"
          element={
            <AppShell>
              <Suspense fallback={<RouteLoader />}>
                <PackPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/pricing"
          element={
            <AppShell>
              <Suspense fallback={<RouteLoader />}>
                <PricingPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function LandingShell() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1">
        <Landing />
      </main>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      {children}
    </div>
  );
}

/**
 * Quiet, brand-conform fallback while a route chunk downloads. Uses the
 * gold lighthouse mark with the existing slow-glow keyframe so the load
 * state reads as "voz clara is fetching" rather than "something
 * unexpected is happening". Visible only on slow networks — Vite chunks
 * gzip to 10-30 kB and arrive in <200 ms on broadband.
 */
function RouteLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="flex min-h-[45vh] items-center justify-center"
    >
      <span className="slow-glow inline-block">
        <BrandMark variant="monogram" size="lg" tone="gold" decorative />
      </span>
    </div>
  );
}
