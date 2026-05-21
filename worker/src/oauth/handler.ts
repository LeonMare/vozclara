/**
 * OAuth 2.1 consent UI for MCP — the bridge between Cloudflare's
 * `workers-oauth-provider` and our existing magic-link auth in
 * `worker/src/auth.ts`.
 *
 * Flow:
 *   1. MCP client (Claude Desktop, Cursor, Smithery installer) hits
 *      `GET /authorize?response_type=code&client_id=…&…`.
 *   2. We `parseAuthRequest()` to validate it. Invalid → 400.
 *   3. We look for the `vc_session` cookie (existing magic-link
 *      session). If absent → 302 to `/sign-in?oauth=1&next=…` so the
 *      user can request a magic link; the sign-in page already knows
 *      how to bring them back here once verified.
 *   4. With a session: render a brand-consistent HTML consent screen
 *      listing the requesting client + scopes. The full AuthRequest
 *      is serialized into a hidden form field so the POST handler can
 *      hand it back to `completeAuthorization()`.
 *   5. `POST /authorize`:
 *        • action=deny  → bounce back to client `redirect_uri` with
 *                         `error=access_denied`.
 *        • action=allow → resolve the user via session, attach their
 *                         brainId + tier as `props`, call
 *                         `completeAuthorization`, redirect to the
 *                         provider-issued URL (which holds the auth
 *                         code).
 *
 * Tier resolution is intentionally simple right now: every user is
 * `tier: 'free'` until Paddle approves and we wire the subscription
 * webhook through to a per-user field on the User record. This file
 * is the single place to upgrade that logic later (`resolveTier`).
 */

import { Hono } from 'hono';
import type { AuthRequest, OAuthHelpers } from '@cloudflare/workers-oauth-provider';
import { getCurrentUser } from '../auth';
import type { User } from '../auth';

/** Subset of the worker env we touch from here. */
export type OAuthHandlerEnv = {
  OAUTH_PROVIDER: OAuthHelpers;
  AUTH?: KVNamespace;
  RESEND_API_KEY?: string;
  AUTH_FROM_ADDRESS?: string;
  SITE_URL?: string;
};

/**
 * Tier the user is on. Mirrors MASTER.md §1.1 pricing. The Paddle
 * `transaction.completed` webhook (worker/src/founder.ts:handleFounderWebhook)
 * persists the tier directly on the User record after each
 * successful payment, so this is a simple field lookup.
 *
 * Falls back to `'free'` when the field is absent — every account
 * created before this field shipped, every account that hasn't paid,
 * and every account whose Paddle email didn't match the VozClara
 * email (POST /api/founder/admin/grant-tier backfills those one at
 * a time).
 */
function resolveTier(user: User): 'free' | 'pro' | 'pro_plus' {
  return user.tier ?? 'free';
}

/**
 * Pick the primary brainId for the user. Magic-link sessions can carry
 * multiple historical brainIds; we use the first one (chronologically
 * the original device) as the canonical scope for OAuth-granted tools.
 * Users without any brainId yet shouldn't normally reach the consent
 * screen — we still handle that case defensively.
 */
function pickBrainId(user: User): string | null {
  return user.brainIds[0] ?? null;
}

/* ─── Hono app ─────────────────────────────────────────────────────── */

const app = new Hono<{ Bindings: OAuthHandlerEnv }>();

/**
 * GET /authorize
 *
 * Either renders the consent screen or bounces to sign-in. We never
 * render the consent screen for an unauthenticated user — that would
 * leak the existence of the OAuth dance to anyone with the link.
 */
app.get('/oauth/authorize', async (c) => {
  let authRequest: AuthRequest;
  try {
    authRequest = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);
  } catch {
    return c.text('Invalid OAuth authorization request.', 400);
  }

  const user = await getCurrentUser(c.req.raw, c.env);
  if (!user) {
    const next = encodeURIComponent(c.req.url);
    // /sign-in renders our existing magic-link page. The `oauth=1` hint
    // lets the page swap its post-verify redirect target without
    // touching the rest of the auth surface.
    return c.redirect(`/sign-in?oauth=1&next=${next}`);
  }

  const brainId = pickBrainId(user);
  const tier = resolveTier(user);

  return c.html(
    renderConsentPage({
      user,
      brainId,
      tier,
      authRequest,
      // We embed the request as JSON in a hidden field so the POST
      // handler can deserialize it without re-parsing the URL.
      serializedRequest: JSON.stringify(authRequest),
    }),
  );
});

/**
 * POST /authorize — Allow / Deny.
 *
 * The form has an `action` field (`allow` | `deny`) and a `request`
 * hidden field carrying the serialized AuthRequest. We re-resolve the
 * user from the cookie (don't trust form-supplied identity) and feed
 * everything to `completeAuthorization`.
 */
app.post('/oauth/authorize', async (c) => {
  const form = await c.req.parseBody();
  const action = String(form.action ?? '');
  let request: AuthRequest;
  try {
    request = JSON.parse(String(form.request)) as AuthRequest;
  } catch {
    return c.text('Malformed consent submission.', 400);
  }

  // Deny: bounce back to the client with the standard OAuth error.
  if (action === 'deny') {
    const url = new URL(request.redirectUri);
    url.searchParams.set('error', 'access_denied');
    url.searchParams.set('error_description', 'User declined the authorization request.');
    if (request.state) url.searchParams.set('state', request.state);
    return c.redirect(url.toString(), 302);
  }

  // Allow: re-verify session, then complete the grant.
  const user = await getCurrentUser(c.req.raw, c.env);
  if (!user) {
    const next = encodeURIComponent(new URL('/authorize', c.req.url).toString());
    return c.redirect(`/sign-in?oauth=1&next=${next}`, 302);
  }

  const brainId = pickBrainId(user);
  const tier = resolveTier(user);

  const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
    request,
    userId: user.id,
    metadata: { email: user.email, displayName: user.displayName ?? null },
    scope: request.scope,
    // Props become `ctx.props` inside the MCP agent — keep them small
    // and side-effect-free. Anything that may change (e.g. tier after
    // a subscription update) must be re-resolved at tool-invocation
    // time, NOT trusted from these props alone.
    props: {
      userId: user.id,
      email: user.email,
      brainId,
      tier,
    },
  });

  return c.redirect(redirectTo, 302);
});

/**
 * The renderer is intentionally in this file (not split into a
 * template engine). A 60-line HTML page with brand colors is easier
 * to audit and modify than a templating abstraction. If this grows
 * past ~150 lines, split into `consent.ts` then.
 *
 * Brand tokens mirror tailwind.config.ts: navy #0A1A3A, gold #C9A14A,
 * creme #FAF7F2, graphit #2B2F36. Cormorant Garamond + Inter.
 */
function renderConsentPage(args: {
  user: User;
  brainId: string | null;
  tier: 'free' | 'pro' | 'pro_plus';
  authRequest: AuthRequest;
  serializedRequest: string;
}): string {
  const { user, brainId, tier, authRequest, serializedRequest } = args;
  const clientLabel = escapeHtml(authRequest.clientId || 'an MCP client');
  const scopes = authRequest.scope.length
    ? authRequest.scope.map(escapeHtml).join(', ')
    : 'read your VozClara library + generate packs';
  const brainSummary = brainId
    ? `Library scope: <code>${escapeHtml(brainId.slice(0, 8))}…</code>`
    : 'No library attached yet — generate-only access.';
  const userLine = `${escapeHtml(user.displayName ?? user.email)} · ${escapeHtml(tier)}`;
  const requestJson = escapeHtml(serializedRequest);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Authorize ${clientLabel} · VozClara</title>
<style>
  :root {
    --navy: #0A1A3A;
    --gold: #C9A14A;
    --gold-deep: #8C6F2A;
    --creme: #FAF7F2;
    --graphit: #2B2F36;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--creme); color: var(--graphit); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  main { max-width: 460px; margin: 0 auto; padding: 64px 24px 32px; }
  header { text-align: center; margin-bottom: 32px; }
  header a { color: var(--navy); text-decoration: none; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; letter-spacing: 0.02em; }
  h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 26px; color: var(--navy); margin: 0 0 8px; line-height: 1.2; }
  p.lede { margin: 0 0 24px; color: var(--graphit); font-size: 15px; line-height: 1.55; }
  .card { background: #fff; border: 1px solid rgba(10, 26, 58, 0.08); border-radius: 8px; padding: 20px 22px; margin-bottom: 20px; box-shadow: 0 1px 0 rgba(10, 26, 58, 0.04); }
  .row { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; padding: 6px 0; border-bottom: 1px solid rgba(10, 26, 58, 0.06); }
  .row:last-child { border-bottom: 0; }
  .row .k { color: rgba(43, 47, 54, 0.6); }
  .row .v { color: var(--navy); font-weight: 500; text-align: right; word-break: break-word; }
  ul.scopes { margin: 0; padding-left: 18px; font-size: 14px; }
  ul.scopes li { padding: 3px 0; color: var(--graphit); }
  form { display: flex; gap: 12px; margin-top: 24px; }
  button { flex: 1; padding: 11px 16px; border-radius: 6px; font-size: 15px; font-weight: 500; cursor: pointer; border: 1px solid transparent; font-family: inherit; }
  button[name=action][value=allow] { background: var(--navy); color: var(--creme); }
  button[name=action][value=allow]:hover { background: #061229; }
  button[name=action][value=deny] { background: transparent; color: var(--navy); border-color: rgba(10, 26, 58, 0.18); }
  button[name=action][value=deny]:hover { background: rgba(10, 26, 58, 0.04); }
  code { font-family: 'SF Mono', Menlo, monospace; font-size: 13px; background: rgba(10, 26, 58, 0.05); padding: 2px 6px; border-radius: 3px; color: var(--navy); }
  footer { margin-top: 32px; text-align: center; font-size: 12px; color: rgba(43, 47, 54, 0.55); }
  footer a { color: rgba(43, 47, 54, 0.7); }
</style>
</head>
<body>
<main>
  <header>
    <a href="/">§ VOZ · CLARA</a>
  </header>
  <h1>Authorize ${clientLabel}</h1>
  <p class="lede">This app is requesting access to your VozClara account. Review the details below before approving.</p>

  <div class="card">
    <div class="row"><span class="k">Signed in as</span><span class="v">${userLine}</span></div>
    <div class="row"><span class="k">Client</span><span class="v"><code>${clientLabel}</code></span></div>
    <div class="row"><span class="k">Will redirect to</span><span class="v">${escapeHtml(redirectHost(authRequest.redirectUri))}</span></div>
    <div class="row"><span class="k">Library</span><span class="v">${brainSummary}</span></div>
  </div>

  <div class="card">
    <p class="lede" style="margin: 0 0 8px;">It will be able to:</p>
    <ul class="scopes">
      <li>${scopes}</li>
    </ul>
  </div>

  <form method="post" action="/authorize">
    <input type="hidden" name="request" value="${requestJson}" />
    <button name="action" value="deny" type="submit">Deny</button>
    <button name="action" value="allow" type="submit">Allow</button>
  </form>

  <footer>
    You can revoke this access any time on <a href="/account">your account page</a>.
  </footer>
</main>
</body>
</html>`;
}

function redirectHost(uri: string): string {
  try {
    return new URL(uri).host;
  } catch {
    return uri;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default app;
