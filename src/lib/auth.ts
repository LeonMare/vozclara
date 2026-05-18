/**
 * Magic-link auth — client-side API wrapper.
 *
 * The worker side lives in worker/src/auth.ts and exposes:
 *   POST /api/auth/request   { email, lang, redirectUrl, brainId } → { ok, sent }
 *   GET  /api/auth/verify    (hit by the user's email click; redirects)
 *   GET  /api/auth/me        → { user } | 401
 *   POST /api/auth/logout    → { ok }
 *
 * Every call uses `credentials: 'include'` so the session cookie
 * (vc_session) flows even from the *.workers.dev fallback origin in
 * dev. The worker sends `Access-Control-Allow-Credentials: true`.
 *
 * Anonymous-first stays the contract: when a user is not signed in,
 * fetchMe() resolves to null. Library writes don't block on it.
 */

import { API_BASE } from './apiBase';
import { SITE_URL } from './site';

export interface AuthUser {
  id: string;
  email: string;
  createdAt: number;
  lang: string;
  /** Anonymous brainIds that this account has adopted across devices. */
  brainIds: string[];
  displayName?: string;
}

export class AuthError extends Error {
  constructor(public code: 'invalid_email' | 'rate_limited' | 'disabled' | 'network', message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Ask the worker to email a magic link. Always resolves on a 200
 * (the worker intentionally returns 200 even for unknown emails to
 * prevent enumeration). Throws AuthError only on hard failures the
 * UI should surface — invalid email format, rate-limit, network.
 */
export async function requestMagicLink(args: {
  email: string;
  lang: string;
  brainId?: string;
  /** Where to land after the user clicks the link. Must be same-origin
   *  as SITE_URL or the worker rewrites it to /library. */
  redirectPath?: string;
}): Promise<{ ok: boolean; sent: boolean; dev?: boolean }> {
  const redirectUrl = `${SITE_URL}${args.redirectPath ?? '/library'}`;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/auth/request`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: args.email.trim(),
        lang: args.lang,
        brainId: args.brainId,
        redirectUrl,
      }),
    });
  } catch (err) {
    throw new AuthError('network', err instanceof Error ? err.message : 'Network error');
  }

  if (res.status === 400) {
    throw new AuthError('invalid_email', 'Invalid email');
  }
  if (res.status === 429) {
    throw new AuthError('rate_limited', 'Too many requests. Try again shortly.');
  }
  if (res.status === 503) {
    throw new AuthError('disabled', 'Sign-in temporarily unavailable.');
  }
  if (!res.ok) {
    throw new AuthError('network', `HTTP ${res.status}`);
  }
  const body = (await res.json()) as { ok: boolean; sent: boolean; dev?: boolean };
  return body;
}

/**
 * Resolve the signed-in user from the session cookie, or null if
 * unauthenticated. Used by useAuth() on mount + after every magic-
 * link verify redirect.
 */
export async function fetchMe(): Promise<AuthUser | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include',
    });
  } catch {
    return null;
  }
  if (res.status === 401) return null;
  if (!res.ok) return null;
  const body = (await res.json()) as { user: AuthUser };
  return body.user;
}

/**
 * Sign the user out. Idempotent — calling twice on an already
 * signed-out browser just clears the (already empty) cookie.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    /* swallow — logout should never throw from the UI's perspective */
  }
}

/**
 * Probe whether auth is enabled on the worker (i.e. KV is bound).
 * Used by the AppHeader to decide whether to render the "Sign in"
 * link at all — there's no point teasing the feature on a worker
 * that 503s every request.
 */
export async function isAuthAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include',
    });
    // 401 means the endpoint is alive (just no session). 503 means
    // the AUTH KV binding is missing.
    return res.status !== 503;
  } catch {
    return false;
  }
}
