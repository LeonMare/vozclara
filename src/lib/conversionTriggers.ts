/**
 * Conversion-trigger registry — the 5-trigger soft Free→Pro stack.
 *
 * Every trigger here represents a moment where the user has shown
 * enough engagement that a soft Pro nudge is *earned* (not pushed)
 * AND has reached a friction point Pro removes. CLAUDE.md §5 rules
 * the design:
 *
 *   • No countdown timers
 *   • No modal interruption mid-generation
 *   • No grayed-out features visible everywhere
 *   • No hard-wall quota before user has experienced value
 *   • Soft chip > hard wall
 *
 * Every chip is dismissible, persists its dismissal in localStorage,
 * and fires three analytics events through the Plausible layer
 * (#11 src/lib/analytics.ts):
 *
 *   trigger_shown      — first time the chip appears in this session
 *   trigger_clicked    — user opens the linked surface
 *   trigger_dismissed  — user explicitly closes the chip (×)
 *
 * The Plausible dashboard groups by `trigger_id` so one funnel goal
 * (`trigger_clicked` with conversion=true) covers all five.
 *
 * Trigger inventory:
 *
 *   T1 cross_device_sync       Covered by LibraryPage AccountSyncBanner
 *                               (signed-in, >1 device, locale-aware
 *                               "cross-device sync arrives with Pro"
 *                               sentence). No separate chip needed.
 *
 *   T2 pack_habit_forming      v1 — implemented on PackPage when the
 *                               user's library reaches ≥4 packs. Soft
 *                               Founder-Deal chip beneath the pack.
 *
 *   T3 ask_my_knowledge_hit    TODO — fire when /ask runs successfully
 *                               for the 3rd time. Soft chip below the
 *                               answer: "Ask runs Llama on Free,
 *                               Sonnet 4.5 on Pro Plus".
 *
 *   T4 long_video_or_playlist  TODO — fire when paste-form gets a
 *                               video >60 min OR a YouTube playlist
 *                               URL. Soft chip on /new pre-generate:
 *                               "Long videos? Season Pack (Pro Plus)
 *                               does cross-episode synthesis".
 *
 *   T5 anki_export_repeat      TODO — fire when Anki .apkg is exported
 *                               for the 2nd time. Soft line in the
 *                               export confirmation: "Looks like
 *                               serious study — Pro Plus removes
 *                               export-frequency limits".
 *
 * v1 ships T1 (already done) + T2 (this commit). T3/T4/T5 stay as
 * comments + a small follow-up task — they're conceptually
 * identical to T2 (same chip component, same event taxonomy, new
 * eligibility predicate + new copy).
 */

import { track } from './analytics';

/** Stable IDs. Used in localStorage keys and analytics event props. */
export const TRIGGERS = {
  CROSS_DEVICE_SYNC: 't1_cross_device_sync',
  PACK_HABIT_FORMING: 't2_pack_habit_forming',
  ASK_MY_KNOWLEDGE_HIT: 't3_ask_my_knowledge_hit',
  LONG_VIDEO_OR_PLAYLIST: 't4_long_video_or_playlist',
  ANKI_EXPORT_REPEAT: 't5_anki_export_repeat',
} as const;

export type TriggerId = (typeof TRIGGERS)[keyof typeof TRIGGERS];

/** Trigger-specific eligibility thresholds. */
export const THRESHOLDS = {
  PACK_HABIT_FORMING_MIN_PACKS: 4,
  ASK_MY_KNOWLEDGE_MIN_HITS: 3,
  LONG_VIDEO_MIN_SECONDS: 60 * 60, // 1h
  ANKI_EXPORT_MIN_COUNT: 2,
} as const;

/* ─── localStorage-backed dismissal state ─────────────────────────── */

const DISMISSED_KEY = (id: TriggerId): string =>
  `vozclara:trigger-dismissed:${id}`;

/** True iff the user has explicitly dismissed this trigger. */
export function isTriggerDismissed(id: TriggerId): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DISMISSED_KEY(id)) === '1';
}

/** Persist a dismissal. Idempotent. */
export function dismissTrigger(id: TriggerId): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DISMISSED_KEY(id), '1');
  } catch {
    /* private mode / quota — accept that the chip reappears next session */
  }
  track('trigger_dismissed', { trigger_id: id });
}

/* ─── Analytics convenience wrappers ──────────────────────────────── */

/** Call once when the chip becomes visible. Safe to call twice — the
 *  Plausible event-aggregation handles dedup-by-session on its side. */
export function trackTriggerShown(id: TriggerId, props?: Record<string, string | number | boolean>): void {
  track('trigger_shown', { trigger_id: id, ...(props ?? {}) });
}

/** Call on the chip's primary CTA click — separate from the Link
 *  navigation itself so the click is logged before the route change. */
export function trackTriggerClicked(id: TriggerId, props?: Record<string, string | number | boolean>): void {
  track('trigger_clicked', { trigger_id: id, ...(props ?? {}) });
}

/* ─── Localised copy ──────────────────────────────────────────────── */

export interface TriggerCopy {
  /** Pre-CTA sentence — the "earned" framing. Keep declarative. */
  message: string;
  /** Primary CTA label — link to Founder / Pricing / etc. */
  ctaLabel: string;
  /** Target URL for the CTA. */
  ctaHref: string;
  /** aria-label for the small × dismiss button. */
  dismissLabel: string;
}

/**
 * Returns the locale-aware copy for a given trigger. Currently only
 * T2 has copy — the rest are TODO and fall through to an English
 * placeholder so a wired-but-unfilled trigger still renders something
 * during development rather than blowing up.
 */
export function triggerCopy(id: TriggerId, locale: string): TriggerCopy {
  if (id === TRIGGERS.PACK_HABIT_FORMING) {
    if (locale.startsWith('es')) {
      return {
        message: 'VozClara se está volviendo costumbre. El Founder Deal lo deja para siempre.',
        ctaLabel: 'Ver Founder Deal',
        ctaHref: '/founder',
        dismissLabel: 'Cerrar',
      };
    }
    if (locale.startsWith('pt')) {
      return {
        message: 'A VozClara está a tornar-se hábito. O Founder Deal fixa-a para sempre.',
        ctaLabel: 'Ver Founder Deal',
        ctaHref: '/founder',
        dismissLabel: 'Fechar',
      };
    }
    if (locale.startsWith('de')) {
      return {
        message: 'VozClara wird zur Gewohnheit. Der Founder Deal macht das dauerhaft.',
        ctaLabel: 'Founder Deal ansehen',
        ctaHref: '/founder',
        dismissLabel: 'Schließen',
      };
    }
    return {
      message: 'VozClara is becoming a habit. The Founder Deal makes that permanent.',
      ctaLabel: 'See Founder Deal',
      ctaHref: '/founder',
      dismissLabel: 'Dismiss',
    };
  }

  // T3/T4/T5 — placeholder copy until the eligibility wiring lands.
  // The chip stays usable so design integration can proceed in
  // parallel with the per-trigger logic; replace these strings as
  // the eligibility predicate for each trigger ships.
  return {
    message: '— trigger copy not yet written —',
    ctaLabel: 'See pricing',
    ctaHref: '/pricing',
    dismissLabel: 'Dismiss',
  };
}
