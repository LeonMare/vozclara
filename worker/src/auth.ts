/**
 * Magic-link authentication.
 *
 * Anonymous-first product — users can create Knowledge Packs without
 * an account (brainId persisted in their IndexedDB). Sign-in unlocks
 * cross-device sync, the Founder Deal, and the upcoming Pack-Rating
 * (Michelin) features. Login is intentionally low-friction:
 *
 *   1. POST /api/auth/request  { email, redirectUrl?, lang? }
 *      → 200 always (no enumeration). Sends a magic link if Resend is
 *        configured, otherwise logs the link to the worker console
 *        for dev.
 *
 *   2. GET /api/auth/verify?token=<>&next=<>
 *      → 302 to `next` with Set-Cookie. Creates the user lazily on
 *        first successful verification.
 *
 *   3. GET /api/auth/me
 *      → 200 { user } if cookie+session valid, 401 otherwise.
 *
 *   4. POST /api/auth/logout
 *      → 200 — deletes session from KV and clears the cookie.
 *
 * Why KV and not JWT?  Sessions in KV are revocable in O(1) and free
 * us from key-rotation choreography. KV reads are <10 ms p50 from
 * Cloudflare's edge, so the per-request cost is negligible.
 *
 * brainId migration — when /api/auth/verify completes for a brand-new
 * user and the request carries `?brainId=<id>`, we attach that brainId
 * to the user record so the upcoming sync layer can adopt the existing
 * IndexedDB library on first sign-in.
 */

import { sendMagicLink } from './email';

export interface AuthEnv {
  /** KV namespace for users, sessions, magic-link tokens, email index. */
  AUTH?: KVNamespace;
  /** Resend API key — when absent we still create magic tokens but
   *  only log them to the worker console (dev mode). */
  RESEND_API_KEY?: string;
  /** Verified Resend sender, e.g. "VozClara <noreply@vozclara.app>". */
  AUTH_FROM_ADDRESS?: string;
  /** Public origin of the frontend, used to build the verify URL. */
  SITE_URL?: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: number;
  lang: string;
  /** Anonymous IDs this account has adopted. The first one is set
   *  during sign-up; subsequent sign-ins on new devices append. */
  brainIds: string[];
  displayName?: string;
}

interface Session {
  userId: string;
  createdAt: number;
  expiresAt: number;
  ua?: string;
}

interface MagicToken {
  email: string;
  redirectUrl: string;
  brainId?: string;
  lang: string;
  createdAt: number;
  expiresAt: number;
}

const MAGIC_TTL_SECONDS = 15 * 60;            // 15 minutes
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const SESSION_COOKIE = 'vc_session';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── Tokens ─────────────────────────────────────────────────────── */

/** 32 cryptographically random bytes, base64url-encoded → 43 chars. */
function randomToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return base64url(buf);
}

function base64url(buf: Uint8Array): string {
  let s = '';
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* ─── Cookies ────────────────────────────────────────────────────── */

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('Cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...vs] = part.trim().split('=');
    if (k === name) return decodeURIComponent(vs.join('='));
  }
  return null;
}

function setSessionCookie(token: string): string {
  // Lax keeps the cookie usable when the user clicks the magic link
  // from their email client (same-site top-level navigation). Strict
  // would break that flow.
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  return parts.join('; ');
}

function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
  ].join('; ');
}

/* ─── KV access ──────────────────────────────────────────────────── */

async function getUserById(env: AuthEnv, id: string): Promise<User | null> {
  if (!env.AUTH) return null;
  const raw = await env.AUTH.get(`user:${id}`);
  return raw ? (JSON.parse(raw) as User) : null;
}

async function getUserByEmail(env: AuthEnv, email: string): Promise<User | null> {
  if (!env.AUTH) return null;
  const id = await env.AUTH.get(`email:${email.toLowerCase()}`);
  return id ? getUserById(env, id) : null;
}

async function putUser(env: AuthEnv, user: User): Promise<void> {
  if (!env.AUTH) return;
  await env.AUTH.put(`user:${user.id}`, JSON.stringify(user));
  await env.AUTH.put(`email:${user.email.toLowerCase()}`, user.id);
}

async function getSession(env: AuthEnv, token: string): Promise<Session | null> {
  if (!env.AUTH) return null;
  const raw = await env.AUTH.get(`session:${token}`);
  return raw ? (JSON.parse(raw) as Session) : null;
}

async function putSession(env: AuthEnv, token: string, session: Session): Promise<void> {
  if (!env.AUTH) return;
  await env.AUTH.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: Math.floor((session.expiresAt - Date.now()) / 1000),
  });
}

async function deleteSession(env: AuthEnv, token: string): Promise<void> {
  if (!env.AUTH) return;
  await env.AUTH.delete(`session:${token}`);
}

async function getMagic(env: AuthEnv, token: string): Promise<MagicToken | null> {
  if (!env.AUTH) return null;
  const raw = await env.AUTH.get(`magic:${token}`);
  return raw ? (JSON.parse(raw) as MagicToken) : null;
}

async function putMagic(env: AuthEnv, token: string, magic: MagicToken): Promise<void> {
  if (!env.AUTH) return;
  await env.AUTH.put(`magic:${token}`, JSON.stringify(magic), {
    expirationTtl: MAGIC_TTL_SECONDS,
  });
}

async function deleteMagic(env: AuthEnv, token: string): Promise<void> {
  if (!env.AUTH) return;
  await env.AUTH.delete(`magic:${token}`);
}

/* ─── Public helpers ─────────────────────────────────────────────── */

/**
 * Resolve the signed-in user from the request, if any. Returns null
 * for anonymous or expired sessions. Worker endpoints that need a
 * user should call this and respond 401 themselves — there's no
 * middleware layer in this codebase.
 */
export async function getCurrentUser(req: Request, env: AuthEnv): Promise<User | null> {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const session = await getSession(env, token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    await deleteSession(env, token);
    return null;
  }
  return getUserById(env, session.userId);
}

/* ─── Endpoint handlers ──────────────────────────────────────────── */

/**
 * Common JSON response helper — wired to the worker's CORS_HEADERS
 * via the `extraHeaders` parameter (the parent index.ts already
 * applies CORS via its own `json()`, but auth is imported and we
 * shouldn't reach back into it).
 */
function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      ...extra,
    },
  });
}

/**
 * POST /api/auth/request
 *
 * Body: { email, redirectUrl?, lang?, brainId? }
 *
 * Always returns 200 with `{ ok: true, sent: boolean }` so attackers
 * can't enumerate registered emails. `sent` is true if Resend
 * actually accepted the message; in dev (no RESEND_API_KEY) we log
 * the URL and report `sent: false, dev: true` so the developer can
 * follow the link manually.
 */
export async function handleAuthRequest(req: Request, env: AuthEnv): Promise<Response> {
  if (!env.AUTH) {
    return json({ error: 'auth_disabled', detail: 'AUTH KV not bound.' }, 503);
  }

  let body: { email?: string; redirectUrl?: string; lang?: string; brainId?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: 'invalid_email' }, 400);
  }

  const siteUrl = env.SITE_URL ?? new URL(req.url).origin;
  const redirectUrl = sanitizeRedirect(body.redirectUrl, siteUrl);
  const lang = sanitizeLang(body.lang);
  const brainId = sanitizeBrainId(body.brainId);

  const token = randomToken();
  const now = Date.now();
  await putMagic(env, token, {
    email,
    redirectUrl,
    brainId,
    lang,
    createdAt: now,
    expiresAt: now + MAGIC_TTL_SECONDS * 1000,
  });

  const verifyUrl = `${siteUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const result = await sendMagicLink(env, { to: email, link: verifyUrl, locale: lang });

  if (!result.ok) {
    // Dev mode (no key) or transient Resend failure — log so the
    // developer can grab the link from `wrangler tail`. We still
    // respond 200 to avoid leaking provider state to clients.
    console.log('auth_magic_link:', { email, verifyUrl, reason: result.reason });
    return json({ ok: true, sent: false, dev: result.reason === 'email_disabled' });
  }

  return json({ ok: true, sent: true });
}

/**
 * GET /api/auth/verify?token=<>
 *
 * Validates the magic token (single-use, 15 min TTL), upserts the
 * user, creates a session, sets the cookie, and 302-redirects to
 * the URL the user originally requested from.
 */
export async function handleAuthVerify(req: Request, env: AuthEnv): Promise<Response> {
  if (!env.AUTH) {
    return new Response('Auth disabled', { status: 503 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) return verifyError('missing_token', env);

  const magic = await getMagic(env, token);
  if (!magic) return verifyError('expired', env);
  if (magic.expiresAt < Date.now()) {
    await deleteMagic(env, token);
    return verifyError('expired', env);
  }

  // Single-use: consume the token immediately so it can't be replayed
  // from a forwarded email or browser-history scrape.
  await deleteMagic(env, token);

  let user = await getUserByEmail(env, magic.email);
  if (!user) {
    user = {
      id: randomToken().slice(0, 22),
      email: magic.email,
      createdAt: Date.now(),
      lang: magic.lang,
      brainIds: magic.brainId ? [magic.brainId] : [],
    };
    await putUser(env, user);
  } else if (magic.brainId && !user.brainIds.includes(magic.brainId)) {
    // Returning user signing in from a new device — adopt the new
    // brainId so the upcoming sync layer can merge that library.
    user.brainIds.push(magic.brainId);
    await putUser(env, user);
  }

  const sessionToken = randomToken();
  const session: Session = {
    userId: user.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    ua: req.headers.get('User-Agent')?.slice(0, 200) ?? undefined,
  };
  await putSession(env, sessionToken, session);

  return new Response(null, {
    status: 302,
    headers: {
      Location: magic.redirectUrl,
      'Set-Cookie': setSessionCookie(sessionToken),
    },
  });
}

/**
 * GET /api/auth/me
 * 200 → { user } | 401 → { error: 'unauthorized' }
 */
export async function handleAuthMe(req: Request, env: AuthEnv): Promise<Response> {
  const user = await getCurrentUser(req, env);
  if (!user) return json({ error: 'unauthorized' }, 401);
  // Strip internal fields. brainIds is exposed because the frontend
  // uses it to migrate the local IndexedDB library on first sign-in.
  return json({
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      lang: user.lang,
      displayName: user.displayName,
      brainIds: user.brainIds,
    },
  });
}

/**
 * POST /api/auth/attach-brain   body: { brainId }
 *
 * The Magic-Link verify path already attaches the brainId that was
 * present in the request — but a signed-in user who browses to a
 * second device with a still-valid session cookie never goes through
 * verify again, and their fresh device-local brainId would otherwise
 * stay disconnected from their account record. This endpoint lets
 * the frontend declare "this brainId belongs to me" on every page
 * load so the brainIds list stays a complete inventory of the user's
 * known devices.
 *
 * Idempotent: re-submitting a known brainId is a no-op.
 * Authenticated: 401 if no session.
 * Validated: brainId must match the standard alphanumeric shape; we
 * cap the per-user list at 16 to bound storage and to prevent a
 * compromised client from inflating the record.
 */
export async function handleAuthAttachBrain(req: Request, env: AuthEnv): Promise<Response> {
  const user = await getCurrentUser(req, env);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { brainId?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const brainId = sanitizeBrainId(body.brainId);
  if (!brainId) return json({ error: 'invalid_brain_id' }, 400);

  // Already linked → fast path, no KV write.
  if (user.brainIds.includes(brainId)) {
    return json({ ok: true, attached: false, brainIds: user.brainIds });
  }

  // Cap list at 16 — beyond that, a client churning brainIds in a
  // loop would be doing something pathological. Drop the oldest.
  const next = [...user.brainIds, brainId].slice(-16);
  user.brainIds = next;
  await putUser(env, user);

  return json({ ok: true, attached: true, brainIds: next });
}

/**
 * POST /api/auth/logout
 * Deletes the server-side session and clears the cookie. Idempotent.
 */
export async function handleAuthLogout(req: Request, env: AuthEnv): Promise<Response> {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) await deleteSession(env, token);
  return json(
    { ok: true },
    200,
    { 'Set-Cookie': clearSessionCookie() },
  );
}

/* ─── Sanitisation ───────────────────────────────────────────────── */

/**
 * The redirect URL must be on the same origin to prevent open-
 * redirect abuse via the magic link (an attacker could send a link
 * that bounces to their phishing page after auth, looking legit
 * because it came from vozclara.app).
 */
function sanitizeRedirect(input: string | undefined, siteOrigin: string): string {
  if (!input) return `${siteOrigin}/library`;
  try {
    const target = new URL(input, siteOrigin);
    const site = new URL(siteOrigin);
    if (target.origin !== site.origin) return `${siteOrigin}/library`;
    return target.toString();
  } catch {
    return `${siteOrigin}/library`;
  }
}

function sanitizeLang(input: string | undefined): string {
  if (!input) return 'en';
  const lower = input.toLowerCase().slice(0, 5);
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('pt')) return 'pt';
  if (lower.startsWith('de')) return 'de';
  return 'en';
}

function sanitizeBrainId(input: string | undefined): string | undefined {
  if (!input) return undefined;
  // Brain IDs are random alphanumerics; reject anything that looks
  // like an injection probe.
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(input)) return undefined;
  return input;
}

function verifyError(code: string, _env: AuthEnv): Response {
  // 302 to the sign-in page with the error in the hash so we don't
  // leave a 4xx in the user's browser history. The frontend reads
  // `location.hash` and shows the friendly message.
  const url = `/signin#${encodeURIComponent('error=' + code)}`;
  return new Response(null, { status: 302, headers: { Location: url } });
}
