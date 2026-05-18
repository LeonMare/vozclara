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
import { fetchMe, logout as apiLogout, attachBrain, updateProfile as apiUpdateProfile, deleteAccount as apiDeleteAccount, type AuthUser } from '../lib/auth';
import { getBrainId } from '../lib/pack';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Re-fetch /api/auth/me. Call after sign-in flow completes. */
  refresh: () => Promise<void>;
  /** POST /api/auth/logout, then clear local state. */
  signOut: () => Promise<void>;
  /** Update mutable profile fields (displayName for now). Returns the
   *  fresh user or null on failure. Local state is updated on success. */
  updateProfile: (args: { displayName?: string | null }) => Promise<AuthUser | null>;
  /** Permanently delete the account. On success, the local user state
   *  is cleared and the caller can navigate away. Returns true/false. */
  deleteAccount: () => Promise<boolean>;
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

    // If the user is signed in but their account record doesn't yet
    // know about this device's brainId, attach it now — best-effort
    // and silent on failure. Updates the local user state with the
    // returned brainIds list so the rest of the app sees the change
    // immediately, without forcing a second /api/auth/me round trip.
    if (fresh) {
      const local = getBrainId();
      if (!fresh.brainIds.includes(local)) {
        const res = await attachBrain(local);
        if (mountedRef.current && res.ok && res.brainIds) {
          setUser({ ...fresh, brainIds: res.brainIds });
        }
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    if (!mountedRef.current) return;
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (args: { displayName?: string | null }): Promise<AuthUser | null> => {
    const fresh = await apiUpdateProfile(args);
    if (mountedRef.current && fresh) setUser(fresh);
    return fresh;
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    const ok = await apiDeleteAccount();
    if (mountedRef.current && ok) setUser(null);
    return ok;
  }, []);

  // Initial probe — best-effort. A 503 (auth disabled) or network
  // failure resolves to null and the app stays in anonymous mode.
  // We route through refresh() so the brainId attach-on-mount runs
  // for users with a still-valid cookie on a fresh device.
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        await refresh();
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

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
    <AuthContext.Provider value={{ user, loading, refresh, signOut, updateProfile, deleteAccount }}>
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
