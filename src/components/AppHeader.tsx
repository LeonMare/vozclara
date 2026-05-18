import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { LanguagePicker } from './LanguagePicker';
import { BrandMark } from './BrandMark';
import { useAuth } from '../hooks/useAuth';

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
          {/* Mobile: just the seal so the language picker + burger fit
              without clipping the wordmark. Tablet/desktop get the
              full horizontal lockup. */}
          <span className="sm:hidden">
            <BrandMark variant="monogram" size="md" tone="navy" />
          </span>
          <span className="hidden sm:inline-block">
            <BrandMark variant="lockup" size="md" tone="navy" />
          </span>
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

          {/* User identity — signed-in shows an avatar dropdown, anonymous
              shows a quiet "Sign in" link on desktop. Hidden on mobile;
              the burger menu carries the same controls there. */}
          <UserSlot locale={locale} />

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
            <MobileAuthBlock locale={locale} />
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

/* ─── Auth slots — desktop user menu + mobile drawer block ─────── */

/**
 * Desktop-only auth indicator that sits between the language picker
 * and the "+ New" CTA. Anonymous visitors see a quiet "Sign in" link.
 * Signed-in users see a circular avatar with their email initial; a
 * click opens a small dropdown carrying the full email + sign-out.
 *
 * The dropdown is keyboard-friendly — Escape closes, focus returns
 * to the trigger button. Click-outside also closes via a window
 * listener attached only while the dropdown is open.
 */
function UserSlot({ locale }: { locale: string }) {
  const { user, loading } = useAuth();
  const labels = authLabels(locale);

  // Don't flash a "Sign in" link while we still don't know — first
  // paint stays neutral until /api/auth/me has resolved.
  if (loading) {
    return <span className="hidden h-7 w-7 rounded-full bg-navy/5 md:inline-block" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        to="/signin"
        className="hidden font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline md:inline-block"
      >
        {labels.signIn}
      </Link>
    );
  }

  return <UserDropdown user={user} labels={labels} />;
}

function UserDropdown({
  user,
  labels,
}: {
  user: { email: string; displayName?: string };
  labels: ReturnType<typeof authLabels>;
}) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-outside + Escape close. Mounted only while open so we
  // don't churn listeners on every render of the closed state.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      if (triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initial = (user.displayName ?? user.email).charAt(0).toUpperCase();

  return (
    <div className="relative hidden md:inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-label={labels.account}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-navy/15 bg-white font-serif text-sm text-navy transition hover:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
      >
        {initial}
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-card border border-navy/10 bg-white p-2 shadow-lg shadow-navy/5"
        >
          <div className="px-3 pb-2 pt-1.5">
            <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
              {labels.account}
            </div>
            <div className="mt-1 break-all font-serif text-sm text-graphit/80">{user.email}</div>
          </div>
          <div className="my-1 h-px bg-navy/8" aria-hidden />
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate('/');
            }}
            className="block w-full rounded px-3 py-2 text-left font-sans text-sm text-graphit/80 transition hover:bg-creme hover:text-navy"
          >
            {labels.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile drawer block — same controls as desktop but laid flat. The
 * sign-out button navigates the user home so they don't sit on a
 * route that may have just lost permission to load.
 */
function MobileAuthBlock({ locale }: { locale: string }) {
  const { user, loading, signOut } = useAuth();
  const labels = authLabels(locale);
  const navigate = useNavigate();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        to="/signin"
        className="rounded-card px-3 py-2 transition hover:bg-white hover:text-navy"
      >
        {labels.signIn}
      </Link>
    );
  }

  return (
    <div className="mt-1 rounded-card border border-navy/8 bg-white/60 px-3 py-2">
      <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
        {labels.account}
      </div>
      <div className="mt-1 break-all font-serif text-sm text-graphit/80">{user.email}</div>
      <button
        type="button"
        onClick={async (e) => {
          e.stopPropagation();
          await signOut();
          navigate('/');
        }}
        className="mt-2 font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
      >
        {labels.signOut}
      </button>
    </div>
  );
}

function authLabels(locale: string) {
  if (locale.startsWith('es')) return {
    signIn: 'Entrar',
    signOut: 'Cerrar sesión',
    account: 'Cuenta',
  };
  if (locale.startsWith('pt')) return {
    signIn: 'Entrar',
    signOut: 'Terminar sessão',
    account: 'Conta',
  };
  if (locale.startsWith('de')) return {
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    account: 'Konto',
  };
  return {
    signIn: 'Sign in',
    signOut: 'Sign out',
    account: 'Account',
  };
}
