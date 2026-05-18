/**
 * Auth context — single source of truth for the current user.
 *
 * Mounted once in App.tsx via <AuthProvider>. Children read via
 * useAuth() and get { user, loading, refresh, signOut }.
 *
 * Anonymous-first product: `user === null` is the normal state for
 * most visitors, NOT an error. Components should branch on that.
 *
 * Lifecycle:
 *   • On mount, hits /api/auth/me once to detect an existing session.
 *   • After the magic-link verify redirect lands the user on /library
 *     (or wherever), the SignInPage navigation calls refresh() so the
 *     header updates immediately without a hard reload.
 *   • Auto-refresh on `visibilitychange` to "tab restored" so a stale
 *     session detected in another tab gets corrected.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchMe, logout as apiLogout, type AuthUser } from '../lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Re-fetch /api/auth/me. Call after sign-in flow completes. */
  refresh: () => Promise<void>;
  /** POST /api/auth/logout, then clear local state. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    const fresh = await fetchMe();
    if (!mountedRef.current) return;
    setUser(fresh);
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    if (!mountedRef.current) return;
    setUser(null);
  }, []);

  // Initial probe — best-effort. A 503 (auth disabled) or network
  // failure resolves to null and the app stays in anonymous mode.
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        const initial = await fetchMe();
        if (mountedRef.current) setUser(initial);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Refresh when the tab regains focus — catches the case where the
  // user signed out in another tab. Cheap (one KV read on the worker)
  // and only fires on actual tab switches, not every render.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() called outside <AuthProvider>');
  }
  return ctx;
}
