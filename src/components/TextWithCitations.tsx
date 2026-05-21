/**
 * TextWithCitations — render prose with inline `[mm:ss]` timestamp
 * citations as click-to-seek chips.
 *
 * The signature feature (CLAUDE.md / IDEAS §22): every claim in a
 * Knowledge Pack should be auditable back to the exact second in
 * the source video. The LLM is prompted to suffix claims in
 * `summary.long` and `keyIdeas[].body` with `[mm:ss]` (or `[h:mm:ss]`
 * for hour-plus videos). This component finds those markers and
 * renders them as small editorial chips that, on click, hand the
 * second over to the parent's `onSeek` (which auto-expands the
 * VideoPanel + seeks the embedded YouTube iframe).
 *
 * Render contract:
 *   • Text outside `[mm:ss]` markers renders as-is in the parent's
 *     typography stack — the parent's `<p>` wraps this component so
 *     line-height + font-family stay inherited.
 *   • Each citation becomes a `<button type="button">` with a small
 *     `[` `]` chip styling (gold border, monospace digits, tabular
 *     numerals). Click → `onSeek(seconds)`.
 *   • If `onSeek` is omitted (e.g. preview surfaces where the player
 *     isn't mounted) the citations still render but as inert <span>s
 *     so the visual cue is preserved.
 *
 * Hover-replay (transcript-chunk preview tooltip) is v2 — the
 * placeholder ARIA + title attribute means a hover shows the
 * timestamp at least, until the richer preview lands.
 */

import { Fragment, type ReactNode } from 'react';

/** Matches `[mm:ss]` and `[h:mm:ss]` — the two shapes the prompt
 *  emits. The leading colons are required so `[42]` (just a number)
 *  doesn't false-positive on arbitrary bracketed numerals the model
 *  might include for other reasons (footnote markers, etc.). */
const TIMESTAMP_RE = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;

function stampToSeconds(stamp: string): number {
  const parts = stamp.split(':').map((s) => Number.parseInt(s, 10));
  if (parts.some((n) => !Number.isFinite(n))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export interface TextWithCitationsProps {
  text: string;
  /** When set, citations are clickable buttons that fire this with
   *  the parsed second. When omitted, citations render as inert
   *  spans (still visually distinct). */
  onSeek?: (sec: number) => void;
  /** Optional aria-label prefix for the seek button. Defaults to
   *  "Jump to" — caller can pass a localised string if needed. */
  jumpLabel?: string;
  /** Tailwind override for the chip background (defaults to gold
   *  subtle). Useful when the chip sits on a different surface. */
  chipClassName?: string;
}

export function TextWithCitations({
  text,
  onSeek,
  jumpLabel = 'Jump to',
  chipClassName,
}: TextWithCitationsProps): JSX.Element | null {
  if (!text) return null;

  const parts: ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  // Use a fresh regex execution — RegExp objects are stateful and we
  // call this on every render of the parent. exec() with `g` flag
  // would carry lastIndex across calls without a reset.
  const re = new RegExp(TIMESTAMP_RE.source, 'g');
  while ((match = re.exec(text)) !== null) {
    const before = text.slice(lastIdx, match.index);
    if (before) parts.push(<Fragment key={`t-${lastIdx}`}>{before}</Fragment>);
    const stamp = match[1];
    const sec = stampToSeconds(stamp);
    parts.push(
      <Citation
        key={`c-${match.index}`}
        stamp={stamp}
        sec={sec}
        onSeek={onSeek}
        jumpLabel={jumpLabel}
        chipClassName={chipClassName}
      />,
    );
    lastIdx = match.index + match[0].length;
  }
  const trailing = text.slice(lastIdx);
  if (trailing) parts.push(<Fragment key={`t-${lastIdx}`}>{trailing}</Fragment>);

  return <>{parts}</>;
}

/* ─── single-citation render ──────────────────────────────────────── */

interface CitationProps {
  stamp: string;
  sec: number;
  onSeek?: (sec: number) => void;
  jumpLabel: string;
  chipClassName?: string;
}

function Citation({ stamp, sec, onSeek, jumpLabel, chipClassName }: CitationProps): JSX.Element {
  const baseClass = [
    'inline-flex items-baseline gap-0 align-baseline rounded-[3px] border px-1 py-px text-[0.78em] font-medium tabular-nums tracking-tight transition',
    chipClassName ?? 'border-gold/45 bg-gold/8 text-navy/80',
  ].join(' ');

  if (!onSeek) {
    return (
      <span aria-hidden className={baseClass} title={stamp}>
        <span aria-hidden className="text-gold/65">[</span>
        <span style={{ fontFamily: '"SF Mono", ui-monospace, Consolas, monospace' }}>{stamp}</span>
        <span aria-hidden className="text-gold/65">]</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSeek(sec)}
      aria-label={`${jumpLabel} ${stamp}`}
      title={`${jumpLabel} ${stamp}`}
      className={[
        baseClass,
        'cursor-pointer hover:border-gold hover:bg-gold/15 hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
      ].join(' ')}
    >
      <span aria-hidden className="text-gold/70">[</span>
      <span style={{ fontFamily: '"SF Mono", ui-monospace, Consolas, monospace' }}>{stamp}</span>
      <span aria-hidden className="text-gold/70">]</span>
    </button>
  );
}
