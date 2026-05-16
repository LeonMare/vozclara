import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { LanguagePicker } from './LanguagePicker';
import { BrandMark } from './BrandMark';

/**
 * App-wide sticky header.
 *
 * Two flavours of navigation depending on the route:
 *
 *  • Landing (/) — anchor links to landing sections (How, Sample,
 *    Pricing) plus product links (Library, New). The visitor needs
 *    orientation before they commit.
 *
 *  • App routes — minimal product nav (Library, New) plus a primary
 *    "+ New" CTA. The user has already engaged; the header should
 *    get out of the way.
 *
 * On mobile both flavours collapse into a single small menu so the
 * brand mark stays prominent.
 */
export function AppHeader() {
  const { t, locale } = useLocale();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 border-b border-navy/10 bg-creme/95 backdrop-blur supports-[backdrop-filter]:bg-creme/85"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link to="/" className="min-w-0">
          <BrandMark variant="lockup" size="md" tone="navy" />
        </Link>

        {/* Desktop nav — different on landing vs app routes */}
        <nav className="hidden items-center gap-5 font-sans text-sm text-graphit/65 md:flex">
          {isLanding ? (
            <>
              <AnchorLink href="#how">{landingNav(locale, 'how')}</AnchorLink>
              <AnchorLink href="#pricing">{landingNav(locale, 'pricing')}</AnchorLink>
              <Link to="/pack/sample" className="transition hover:text-navy">
                {landingNav(locale, 'sample')}
              </Link>
              <HeaderLink to="/library">{t.navLibrary}</HeaderLink>
            </>
          ) : (
            <>
              <HeaderLink to="/library">{t.navLibrary}</HeaderLink>
              <HeaderLink to="/new">{t.navNew}</HeaderLink>
              <HeaderLink to="/pricing">{landingNav(locale, 'pricing')}</HeaderLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguagePicker compact />

          {/* Primary CTA — always present, but hidden on landing because the
              hero already has the paste-input. */}
          {!isLanding && (
            <Link
              to="/new"
              className="hidden rounded-card bg-navy px-3 py-1.5 font-sans text-xs text-creme transition hover:bg-navy/90 sm:inline-block"
            >
              + {t.navNew}
            </Link>
          )}
          {isLanding && (
            <Link
              to="/new"
              className="hidden rounded-card bg-navy px-3 py-1.5 font-sans text-xs text-creme transition hover:bg-navy/90 md:inline-block"
            >
              + {t.navNew}
            </Link>
          )}

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-card border border-navy/15 bg-white text-navy md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              {mobileOpen ? (
                <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              ) : (
                <>
                  <path d="M2 4 H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M2 8 H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M2 12 H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="border-t border-navy/10 bg-creme md:hidden">
          <nav
            className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3 font-sans text-sm text-graphit/75 sm:px-8"
            onClick={() => setMobileOpen(false)}
          >
            {isLanding && (
              <>
                <a href="#how" className="rounded-card px-3 py-2 transition hover:bg-white hover:text-navy">
                  {landingNav(locale, 'how')}
                </a>
                <a href="#pricing" className="rounded-card px-3 py-2 transition hover:bg-white hover:text-navy">
                  {landingNav(locale, 'pricing')}
                </a>
                <Link to="/pack/sample" className="rounded-card px-3 py-2 transition hover:bg-white hover:text-navy">
                  {landingNav(locale, 'sample')}
                </Link>
              </>
            )}
            <Link to="/library" className="rounded-card px-3 py-2 transition hover:bg-white hover:text-navy">
              {t.navLibrary}
            </Link>
            {!isLanding && (
              <Link to="/pricing" className="rounded-card px-3 py-2 transition hover:bg-white hover:text-navy">
                {landingNav(locale, 'pricing')}
              </Link>
            )}
            <Link to="/about" className="rounded-card px-3 py-2 transition hover:bg-white hover:text-navy">
              {aboutNavLabel(locale)}
            </Link>
            <Link to="/new" className="rounded-card bg-navy px-3 py-2 text-creme transition hover:bg-navy/90">
              + {t.navNew}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function HeaderLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'relative py-1 transition-colors',
          isActive ? 'text-navy' : 'hover:text-navy',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" aria-hidden />
          )}
        </>
      )}
    </NavLink>
  );
}

function AnchorLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="transition hover:text-navy">
      {children}
    </a>
  );
}

// Local labels for the landing-only nav items. Receives the active
// locale from useLocale() so React-driven re-renders pick up the
// right language — reading document.documentElement.lang is not
// reactive and led to a mixed-language header (Spanish links next
// to German links) when the user switched in the picker.
function landingNav(locale: string, key: 'how' | 'pricing' | 'sample'): string {
  const dict: Record<string, Record<typeof key, string>> = {
    es: { how: 'Cómo funciona', pricing: 'Planes', sample: 'Ejemplo' },
    pt: { how: 'Como funciona', pricing: 'Planos', sample: 'Exemplo' },
    de: { how: 'So funktioniert es', pricing: 'Preise', sample: 'Beispiel' },
    en: { how: 'How it works', pricing: 'Pricing', sample: 'Sample' },
  };
  return dict[locale]?.[key] ?? dict.es[key];
}

function aboutNavLabel(locale: string): string {
  if (locale.startsWith('es')) return 'Sobre';
  if (locale.startsWith('pt')) return 'Sobre';
  if (locale.startsWith('de')) return 'Über';
  return 'About';
}
