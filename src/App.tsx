import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { Landing } from './components/landing/Landing';
import { RouteSkeleton } from './components/RouteSkeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './hooks/useAuth';

/**
 * VozClara — knowledge layer over every video you watch.
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
 *   network — there's a small RouteSkeleton fallback for slower
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
const AboutPage = lazy(() =>
  import('./routes/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const PrivacyPage = lazy(() =>
  import('./routes/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import('./routes/TermsPage').then((m) => ({ default: m.TermsPage })),
);
const RefundPage = lazy(() =>
  import('./routes/RefundPage').then((m) => ({ default: m.RefundPage })),
);
const ReviewPage = lazy(() =>
  import('./routes/ReviewPage').then((m) => ({ default: m.ReviewPage })),
);
const ProgressPage = lazy(() =>
  import('./routes/ProgressPage').then((m) => ({ default: m.ProgressPage })),
);
const ShadowPage = lazy(() =>
  import('./routes/ShadowPage').then((m) => ({ default: m.ShadowPage })),
);
const ChatPage = lazy(() =>
  import('./routes/ChatPage').then((m) => ({ default: m.ChatPage })),
);
const ImpressumPage = lazy(() =>
  import('./routes/ImpressumPage').then((m) => ({ default: m.ImpressumPage })),
);
const SignInPage = lazy(() =>
  import('./routes/SignInPage').then((m) => ({ default: m.SignInPage })),
);
const DiscoverPage = lazy(() =>
  import('./routes/DiscoverPage').then((m) => ({ default: m.DiscoverPage })),
);
const FounderPage = lazy(() =>
  import('./routes/FounderPage').then((m) => ({ default: m.FounderPage })),
);
const NotFoundPage = lazy(() =>
  import('./routes/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const ChangelogPage = lazy(() =>
  import('./routes/ChangelogPage').then((m) => ({ default: m.ChangelogPage })),
);
const AccountPage = lazy(() =>
  import('./routes/AccountPage').then((m) => ({ default: m.AccountPage })),
);
const CreatorNotesIndex = lazy(() =>
  import('./routes/CreatorNotesIndex').then((m) => ({ default: m.CreatorNotesIndex })),
);
const CreatorNotePage = lazy(() =>
  import('./routes/CreatorNotePage').then((m) => ({ default: m.CreatorNotePage })),
);
const YouTubeToAnkiPage = lazy(() =>
  import('./routes/YouTubeToAnkiPage').then((m) => ({ default: m.YouTubeToAnkiPage })),
);
const LearnGermanWithYouTubePage = lazy(() =>
  import('./routes/LearnGermanWithYouTubePage').then((m) => ({ default: m.LearnGermanWithYouTubePage })),
);
const LearnEnglishWithYouTubePage = lazy(() =>
  import('./routes/LearnEnglishWithYouTubePage').then((m) => ({ default: m.LearnEnglishWithYouTubePage })),
);

/**
 * Scroll to top on every route change. SPA navigation otherwise inherits
 * the previous route's scroll position, which is jarring when going from
 * a long pack page back to /library (you land at mid-page where you
 * happened to click the "back" link). Honours `prefers-reduced-motion`
 * by skipping the smooth-scroll behaviour for users who opted out.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
        <ScrollToTop />
      {/* Skip-link for keyboard users — invisible until focused, then
          jumps past the header into the route's <main> content. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-navy focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:font-medium focus:text-creme"
      >
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<LandingShell />} />
        <Route
          path="/new"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <GeneratorPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/library"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <LibraryPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/review"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <ReviewPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/progress"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <ProgressPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/pack/:id"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <PackPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/pack/:id/shadow"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <ShadowPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/pack/:id/chat"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <ChatPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/pricing"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <PricingPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/youtube-to-anki"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <YouTubeToAnkiPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/learn-german-with-youtube"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <LearnGermanWithYouTubePage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/learn-english-with-youtube"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <LearnEnglishWithYouTubePage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/about"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <AboutPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/privacy"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <PrivacyPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/terms"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <TermsPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/refund"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <RefundPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/impressum"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <ImpressumPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/signin"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <SignInPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/discover"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <DiscoverPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/founder"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <FounderPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/changelog"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <ChangelogPage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/me"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <AccountPage />
              </Suspense>
            </AppShell>
          }
        />
        {/* Programmatic SEO — editorial reading notes (#13). The index
            is a hub page; individual notes are essays about a single
            YouTube video, each with JSON-LD Article schema and a
            quiet generate-pack CTA. */}
        <Route
          path="/notes"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <CreatorNotesIndex />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/notes/:slug"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <CreatorNotePage />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="*"
          element={
            <AppShell>
              <Suspense fallback={<RouteSkeleton />}>
                <NotFoundPage />
              </Suspense>
            </AppShell>
          }
        />
      </Routes>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function LandingShell() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main id="main" className="flex-1">
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

