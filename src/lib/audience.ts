/**
 * Audience preference — the lightweight onboarding signal.
 *
 * LAUNCH_PLAN §13 envisioned a four-step wizard. The cut-sprint
 * realisation is far simpler: a single click on one of the
 * AudienceTiles on the landing page, persisted in localStorage,
 * shapes:
 *
 *   • the default mode shown by the Generator's ModePicker
 *   • (later) which Sample Pack the homepage highlights
 *   • (later) which onboarding email sequence the user receives
 *
 * Three audiences map to three default modes, plus a fourth
 * "creator" the AudienceTiles don't yet expose but the type
 * accepts so we don't paint ourselves into a corner.
 *
 * Anonymous-first: no server round trip, no account requirement.
 * Just a single key in localStorage. When a signed-in user lands
 * on a new device, the audience prefs don't follow them yet —
 * that's a Pro-tier sync concern (LAUNCH_PLAN §7).
 */

import type { Mode } from './pack';

export type Audience = 'language' | 'news' | 'study' | 'creator';

const STORAGE_KEY = 'vc:audience';

const AUDIENCE_TO_MODE: Record<Audience, Mode> = {
  language: 'learn',
  news:     'brief',
  study:    'study',
  creator:  'creator',
};

/**
 * Read the saved audience, or null if the visitor hasn't picked
 * one yet. Safe to call during SSR / pre-window contexts.
 */
export function getAudience(): Audience | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'language' || v === 'news' || v === 'study' || v === 'creator') {
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAudience(a: Audience): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, a);
  } catch { /* localStorage disabled — fail silently */ }
}

/**
 * Default Mode for new Pack generation, based on the audience the
 * visitor picked on the landing tiles. Returns `null` when no
 * choice has been made yet — the caller should fall back to its
 * own default (typically `brief` for the cold-start flow).
 */
export function audienceDefaultMode(): Mode | null {
  const a = getAudience();
  return a ? AUDIENCE_TO_MODE[a] : null;
}
