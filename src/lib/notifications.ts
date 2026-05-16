/**
 * Client-side helpers for the Daily-Reminder push notification flow.
 *
 *   1. Health-probe the worker for VAPID public key.
 *   2. Subscribe via the page's ServiceWorkerRegistration.pushManager.
 *   3. POST the subscription + locale + reminder-hour + tz offset to
 *      /api/push/subscribe.
 *   4. Whenever the SRS state changes (rateCard called), POST the new
 *      nextDueAt to /api/push/state so the cron knows when to fire.
 *
 * iOS reality check
 *   On iOS the user MUST install the PWA to the home screen before
 *   permission can be requested. Safari running in browser tab has
 *   no PushManager. `isPushEligible()` covers that case.
 *
 * Persistence
 *   The user's reminderHour stays in localStorage so the toggle
 *   reflects their last choice across sessions even when the
 *   subscription itself rotates.
 */

import { getBrainId } from './pack';
import type { Locale } from './i18n';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const PREFS_KEY = 'vozclara:notify-prefs:v1';

export interface PushConfig {
  available: boolean;
  publicKey: string | null;
}

export interface NotifyPrefs {
  reminderHour: number;  // 0-23 local time
  enabled: boolean;
}

const DEFAULT_PREFS: NotifyPrefs = { reminderHour: 9, enabled: false };

/* ─── Eligibility & state ─────────────────────────────────────────── */

/**
 * Coarse compatibility check. Push API existence is the main gate;
 * iOS Safari only exposes it inside a home-screen-installed PWA.
 */
export function isPushEligible(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;
  if (!('Notification' in window)) return false;
  return true;
}

export function permissionState(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function loadPrefs(): NotifyPrefs {
  if (typeof localStorage === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotifyPrefs>;
    return {
      reminderHour: clampHour(parsed.reminderHour ?? 9),
      enabled: !!parsed.enabled,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: NotifyPrefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function clampHour(h: number): number {
  if (!Number.isFinite(h)) return 9;
  return Math.max(0, Math.min(23, Math.round(h)));
}

/* ─── Worker config ───────────────────────────────────────────────── */

let configCache: PushConfig | null = null;
let configPromise: Promise<PushConfig> | null = null;

export async function fetchPushConfig(): Promise<PushConfig> {
  if (configCache) return configCache;
  if (configPromise) return configPromise;
  configPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/push/config`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error('bad_status');
      const data = (await res.json()) as PushConfig;
      configCache = data;
      return data;
    } catch {
      const fallback: PushConfig = { available: false, publicKey: null };
      configCache = fallback;
      return fallback;
    }
  })();
  return configPromise;
}

/* ─── Subscribe / Unsubscribe ─────────────────────────────────────── */

export interface SubscribeArgs {
  reminderHour: number;
  locale: Locale;
  nextDueAt: number;
}

/**
 * Request permission (if not already granted), subscribe with the SW
 * pushManager, and register the subscription with the worker.
 * Throws if permission is denied or push is unavailable; surface those
 * errors to the user.
 */
export async function subscribePush(args: SubscribeArgs): Promise<void> {
  if (!isPushEligible()) throw new Error('push_unsupported');
  const config = await fetchPushConfig();
  if (!config.available || !config.publicKey) throw new Error('push_disabled');

  // Permission. Notification.requestPermission must be called from a
  // user gesture; that's the caller's responsibility.
  const perm =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
  if (perm !== 'granted') throw new Error(`permission_${perm}`);

  const reg = await navigator.serviceWorker.ready;
  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey),
    });
  }

  const brainId = getBrainId();
  const payload = {
    brainId,
    subscription: subscription.toJSON(),
    locale: args.locale,
    reminderHour: clampHour(args.reminderHour),
    tzOffsetMinutes: new Date().getTimezoneOffset(),
    nextDueAt: args.nextDueAt,
  };
  const res = await fetch(`${API_BASE}/api/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`subscribe_failed_${res.status}`);

  savePrefs({ enabled: true, reminderHour: clampHour(args.reminderHour) });
}

export async function unsubscribePush(): Promise<void> {
  if (!isPushEligible()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
  } catch {
    // ignore — still wipe server-side
  }
  try {
    await fetch(`${API_BASE}/api/push/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brainId: getBrainId() }),
    });
  } catch {
    /* ignore */
  }
  savePrefs({ ...loadPrefs(), enabled: false });
}

/**
 * Tell the worker that the user's next-due card moved (or that the
 * library has fresh new cards now). Fire-and-forget: notification
 * delivery is best-effort, never blocking.
 */
export async function syncDueState(nextDueAt: number): Promise<void> {
  if (!loadPrefs().enabled) return;
  try {
    await fetch(`${API_BASE}/api/push/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brainId: getBrainId(), nextDueAt }),
    });
  } catch {
    /* ignore */
  }
}

/**
 * Send a one-off test notification to the caller's subscription. Used
 * by the settings UI to verify the round trip.
 */
export async function sendTestPush(): Promise<{ status: number; ok: boolean }> {
  const res = await fetch(`${API_BASE}/api/push/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brainId: getBrainId() }),
  });
  const data = (await res.json()) as { status?: number };
  return { status: data.status ?? res.status, ok: res.ok };
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const pad = (4 - (b64.length % 4)) % 4;
  const str = (b64 + '='.repeat(pad)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(str);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
