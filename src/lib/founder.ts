/**
 * Founder Deal — client-side helpers.
 *
 * Two things the frontend needs:
 *   1. fetchFounderStatus()  → renders the urgency counter
 *   2. founderCheckoutUrl()  → the Stripe Payment Link to redirect to
 *
 * The Stripe link is configured via VITE_FOUNDER_CHECKOUT_URL at
 * build time so the deploy stays a single env-var flip. Until the
 * actual Payment Link exists we expose a placeholder constant that
 * routes to /founder?coming-soon — the button stays clickable but
 * surfaces a friendly "almost ready" state instead of opening a
 * broken Stripe page.
 */

import { API_BASE } from './apiBase';

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
 * The Stripe Payment Link. Returns null when the env var is missing
 * — components branch on that to show "coming soon" rather than a
 * dead URL. Once the actual link is set in .env.production the
 * button becomes live in the next build.
 */
export function founderCheckoutUrl(): string | null {
  const url = import.meta.env.VITE_FOUNDER_CHECKOUT_URL as string | undefined;
  if (!url || url.length === 0 || url.startsWith('PLACEHOLDER')) return null;
  return url;
}

/**
 * The Founder Discord invite link. Hard-coded here because the link
 * is a permanent, no-expiry Discord URL — it isn't sensitive and
 * doesn't change per environment. If we ever rotate the server (or
 * generate a fresh invite for any reason), update this single spot
 * and every surface — /founder page, Stripe success message,
 * Welcome-Email — picks it up.
 *
 * The invite landing channel is #general; the Founder role gates
 * #founders-only and is assigned manually by Christian after each
 * Stripe sale until we wire the Stripe→Discord webhook post-launch.
 */
export const FOUNDER_DISCORD_INVITE = 'https://discord.gg/z93CKmUSv6';
