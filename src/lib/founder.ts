/**
 * Founder Deal — client-side helpers.
 *
 * Three things the frontend needs:
 *   1. fetchFounderStatus()       → renders the urgency counter
 *   2. openFounderCheckout(opts)  → opens the embedded Paddle overlay
 *   3. founderCheckoutAvailable() → whether the Paddle env-vars are set
 *
 * Paddle (Merchant of Record) replaced the original Stripe Payment Link
 * on 20 May 2026 — Paddle handles EU VAT + US sales tax + chargeback +
 * fraud automatically, sparing the solo founder a tax compliance burden
 * that would have eaten the launch window. Config is two env-vars set
 * at build time:
 *
 *   VITE_PADDLE_CLIENT_TOKEN       — public client-side token (live_…)
 *   VITE_PADDLE_FOUNDER_PRICE_ID   — Paddle price id (pri_…)
 *
 * Both are public-safe by design: the client-token alone can only
 * launch the overlay from domains pre-approved in the Paddle dashboard
 * (vozclara.app, set 20 May 2026). Without a matching domain, opening
 * the overlay fails with a Paddle-side error.
 *
 * On successful payment Paddle redirects to `/founder?welcome=1`,
 * which the existing FounderPage UI uses to surface the welcome
 * banner with the Discord invite. The increment of the global
 * founder counter is still triggered manually from the admin endpoint
 * (`POST /api/founder/admin/increment`) until we wire the Paddle
 * subscription-created webhook through to the worker — sub-launch task.
 */

import { API_BASE } from './apiBase';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

export interface FounderStatus {
  /** null when the worker hasn't bound KV yet — treat as unknown. */
  claimed: number | null;
  max: number;
  available: boolean;
}

export async function fetchFounderStatus(): Promise<FounderStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/founder/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as FounderStatus;
  } catch {
    return { claimed: null, max: 100, available: true };
  }
}

/**
 * The Founder Discord invite link. Hard-coded here because the link
 * is a permanent, no-expiry Discord URL — it isn't sensitive and
 * doesn't change per environment. If we ever rotate the server (or
 * generate a fresh invite for any reason), update this single spot
 * and every surface — /founder page, welcome email, Paddle success
 * page — picks it up.
 *
 * The invite landing channel is #general; the Founder role gates
 * #founders-only and is assigned manually by Christian after each
 * Paddle payment until we wire the Paddle→Discord webhook later.
 */
export const FOUNDER_DISCORD_INVITE = 'https://discord.gg/z93CKmUSv6';

/* ─── Paddle integration ───────────────────────────────────────────── */

function paddleConfig(): { token: string; priceId: string } | null {
  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
  const priceId = import.meta.env.VITE_PADDLE_FOUNDER_PRICE_ID as string | undefined;
  if (!token || !priceId) return null;
  if (token.startsWith('PLACEHOLDER') || priceId.startsWith('PLACEHOLDER')) return null;
  return { token, priceId };
}

/**
 * True when both env-vars are wired. Components branch on this to
 * show "coming soon" rather than a dead button before deploy.
 */
export function founderCheckoutAvailable(): boolean {
  return paddleConfig() !== null;
}

/**
 * Paddle is bootstrapped once per session and the resulting handle is
 * cached. The library guards itself internally but caching avoids a
 * second await + dynamic import on repeat opens.
 */
let paddleInstance: Paddle | null = null;
let paddleBootstrap: Promise<Paddle | null> | null = null;

async function getPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return paddleInstance;
  if (paddleBootstrap) return paddleBootstrap;
  const cfg = paddleConfig();
  if (!cfg) return null;

  paddleBootstrap = initializePaddle({
    environment: 'production',
    token: cfg.token,
  }).then((p) => {
    paddleInstance = p ?? null;
    return paddleInstance;
  });
  return paddleBootstrap;
}

/**
 * Open the Paddle overlay for the Founder Deal. Returns true if the
 * overlay opened (or is opening), false when the env-vars are missing.
 * The success-redirect is wired to `/founder?welcome=1` — same flag the
 * legacy Stripe path used, so the FounderPage's welcome-banner branch
 * still triggers correctly.
 */
export async function openFounderCheckout(opts: {
  locale?: 'en' | 'es' | 'pt' | 'de';
  email?: string;
} = {}): Promise<boolean> {
  const cfg = paddleConfig();
  const paddle = await getPaddle();
  if (!cfg || !paddle) return false;

  paddle.Checkout.open({
    items: [{ priceId: cfg.priceId, quantity: 1 }],
    customer: opts.email ? { email: opts.email } : undefined,
    settings: {
      // Stay on vozclara.app post-payment so the welcome banner can
      // pick up the ?welcome=1 flag the FounderPage already handles.
      successUrl: 'https://vozclara.app/founder?welcome=1',
      // Paddle auto-detects from the browser, but we pin to whatever
      // locale the visitor is reading the page in for consistency.
      locale: opts.locale ?? 'en',
      // Embedded overlay style — keeps the visitor on vozclara.app
      // for the full transaction, matches our editorial brand polish.
      displayMode: 'overlay',
      theme: 'light',
    },
  });
  return true;
}
