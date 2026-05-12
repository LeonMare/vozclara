import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { Landing } from './components/landing/Landing';
import { GeneratorPage } from './routes/GeneratorPage';
import { LibraryPage } from './routes/LibraryPage';
import { PackPage } from './routes/PackPage';

/**
 * VozClara — multilingual knowledge cloud for videos.
 *
 * Routing:
 *   /            Landing (the brand expression and onboarding)
 *   /new         Generator — paste URL, choose mode + language
 *   /library     Saved Knowledge Packs
 *   /pack/:id    Single Knowledge Pack (special: /pack/sample is pre-baked)
 *
 * Header is rendered on every route except Landing (Landing has its own
 * sticky brand chrome). Landing has its own footer; the other routes
 * inherit a minimal layout that lets the content breathe.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingShell />} />
        <Route path="/new" element={<AppShell><GeneratorPage /></AppShell>} />
        <Route path="/library" element={<AppShell><LibraryPage /></AppShell>} />
        <Route path="/pack/:id" element={<AppShell><PackPage /></AppShell>} />
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
