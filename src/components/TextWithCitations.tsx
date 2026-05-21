/**
 * TextWithCitations — render prose with inline `[mm:ss]` timestamp
 * citations as click-to-seek chips, plus a transcript-chunk preview
 * tooltip on hover.
 *
 * The signature feature (CLAUDE.md / IDEAS §22). Every claim in a
 * Knowledge Pack should be auditable back to the exact second in
 * the source video. The LLM is prompted to suffix claims in
 * `summary.long` and `keyIdeas[].body` with `[mm:ss]` (or `[h:mm:ss]`
 * for hour-plus videos). This component finds those markers and
 * renders them as small editorial chips that:
 *
 *   • Hover (desktop) / focus (keyboard) / tap (mobile) → small
 *     editorial preview tooltip surfaces the ±2 transcript segments
 *     around the cited second, so the reader can verify the claim
 *     without leaving the pack body.
 *   • Click → fires `onSeek(seconds)`. The PackPage state pipeline
 *     auto-expands the VideoPanel + seeks the embedded YouTube
 *     iframe to the exact moment.
 *
 * Render contract:
 *   • Text outside `[mm:ss]` markers renders as-is in the parent's
 *     typography stack — the parent's `<p>` wraps this component so
 *     line-height + font-family stay inherited.
 *   • Each citation becomes a `<button type="button">` with a small
 *     `[` `]` chip styling (gold border, monospace digits, tabular
 *     numerals).
 *   • If `onSeek` is omitted (preview surfaces where the player
 *     isn't mounted) citations still render but as inert spans —
 *     visual cue preserved, no interaction.
 *   • If `segments` is omitted the tooltip simply doesn't appear —
 *     the chip still clicks through to seek. Both props are
 *     optional so the component degrades gracefully.
 */

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Segment } from '../lib/pack';

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
  /** Transcript segments — used to surface the ±2 surrounding
   *  segments as a hover-preview tooltip. When omitted the chip
   *  still seeks on click but no preview appears. */
  segments?: Segment[];
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
  segments,
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
        segments={segments}
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
  segments?: Segment[];
  jumpLabel: string;
  chipClassName?: string;
}

function Citation({ stamp, sec, onSeek, segments, jumpLabel, chipClassName }: CitationProps): JSX.Element {
  const [previewOpen, setPreviewOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Tap-elsewhere-to-close — only attached when the preview is open.
  // Mobile users tap the chip to open the preview, then tapping
  // anywhere else dismisses it. Desktop hover doesn't need this
  // because mouseleave handles it.
  useEffect(() => {
    if (!previewOpen) return;
    function onDocClick(ev: MouseEvent) {
      if (!wrapperRef.current?.contains(ev.target as Node)) {
        setPreviewOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [previewOpen]);

  const baseClass = [
    'inline-flex items-baseline gap-0 align-baseline rounded-[3px] border px-1 py-px text-[0.78em] font-medium tabular-nums tracking-tight transition',
    chipClassName ?? 'border-gold/45 bg-gold/8 text-navy/80',
  ].join(' ');

  const monoStyle = { fontFamily: '"SF Mono", ui-monospace, Consolas, monospace' };

  if (!onSeek) {
    return (
      <span aria-hidden className={baseClass} title={stamp}>
        <span aria-hidden className="text-gold/65">[</span>
        <span style={monoStyle}>{stamp}</span>
        <span aria-hidden className="text-gold/65">]</span>
      </span>
    );
  }

  const hasPreview = segments && segments.length > 0;
  const preview = hasPreview ? buildPreview(segments, sec) : null;

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={hasPreview ? () => setPreviewOpen(true) : undefined}
      onMouseLeave={hasPreview ? () => setPreviewOpen(false) : undefined}
    >
      <button
        type="button"
        onClick={(e) => {
          // Tap on mobile: first tap opens preview (don't seek yet),
          // second tap seeks. Desktop: hover shows preview + click
          // seeks. Distinguish via the previewOpen state — if the
          // preview wasn't open and we're on a touch device, the
          // mouseenter was synthesised by the tap. Heuristic but
          // good enough for v1; a proper touch / pointer-type
          // detection can come later.
          if (hasPreview && !previewOpen && isLikelyTouch()) {
            e.preventDefault();
            setPreviewOpen(true);
            return;
          }
          onSeek(sec);
        }}
        onFocus={hasPreview ? () => setPreviewOpen(true) : undefined}
        onBlur={hasPreview ? () => setPreviewOpen(false) : undefined}
        aria-label={`${jumpLabel} ${stamp}`}
        aria-describedby={previewOpen ? `citation-preview-${sec}` : undefined}
        title={!hasPreview ? `${jumpLabel} ${stamp}` : undefined}
        className={[
          baseClass,
          'cursor-pointer hover:border-gold hover:bg-gold/15 hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
        ].join(' ')}
      >
        <span aria-hidden className="text-gold/70">[</span>
        <span style={monoStyle}>{stamp}</span>
        <span aria-hidden className="text-gold/70">]</span>
      </button>

      {previewOpen && preview && (
        <CitationPreview
          stamp={stamp}
          preview={preview}
          previewId={`citation-preview-${sec}`}
        />
      )}
    </span>
  );
}

/* ─── Preview tooltip ──────────────────────────────────────────────── */

interface PreviewData {
  before?: { text: string; offset: number };
  current: { text: string; offset: number } | null;
  after?: { text: string; offset: number };
}

/**
 * Find the ±2 segments around the cited second. The "current"
 * segment is the one whose [start, start+dur) interval contains sec;
 * fallback is the closest segment by start-time when no segment
 * brackets the second exactly (model timestamps sometimes land
 * between segment boundaries).
 */
function buildPreview(segments: Segment[], sec: number): PreviewData {
  const containing = segments.findIndex(
    (s) => sec >= s.start && sec < s.start + s.dur,
  );
  let currentIdx = containing;
  if (currentIdx === -1) {
    // No segment contains the citation second — pick the closest
    // by start-time. Binary search not necessary at typical
    // segment counts.
    let bestIdx = -1;
    let bestDelta = Infinity;
    for (let i = 0; i < segments.length; i++) {
      const delta = Math.abs(segments[i].start - sec);
      if (delta < bestDelta) {
        bestIdx = i;
        bestDelta = delta;
      }
    }
    currentIdx = bestIdx;
  }
  if (currentIdx < 0) {
    return { current: null };
  }
  const cur = segments[currentIdx];
  const before = currentIdx > 0 ? segments[currentIdx - 1] : undefined;
  const after = currentIdx < segments.length - 1 ? segments[currentIdx + 1] : undefined;
  // Prefer the translated string when available — packs are read
  // in the user's target language, so the preview should match.
  // Source-language text is the fallback when no translation was
  // attached (transcripts where source === target).
  const pickText = (s: Segment): string => (s.translated ?? s.text).trim();
  return {
    before: before ? { text: pickText(before), offset: before.start } : undefined,
    current: { text: pickText(cur), offset: cur.start },
    after: after ? { text: pickText(after), offset: after.start } : undefined,
  };
}

function CitationPreview({
  stamp,
  preview,
  previewId,
}: {
  stamp: string;
  preview: PreviewData;
  previewId: string;
}): JSX.Element {
  return (
    <span
      id={previewId}
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 w-80 max-w-[88vw] -translate-x-1/2 rounded-card border border-gold/30 bg-creme px-4 py-3 text-left text-graphit shadow-card"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      <span
        className="block font-sans text-[10px] uppercase tracking-[0.22em] text-gold-deep"
        style={{ fontFamily: '-apple-system, "Segoe UI", Helvetica, Arial, sans-serif' }}
      >
        Transcript · {stamp}
      </span>
      <span className="mt-1 block h-px w-6 bg-gold/40" aria-hidden />
      <span className="mt-2 block space-y-1.5">
        {preview.before && (
          <span className="block text-[12px] italic leading-snug text-graphit/55">
            …{preview.before.text}
          </span>
        )}
        {preview.current && (
          <span className="block text-[13px] leading-snug text-navy">
            {preview.current.text}
          </span>
        )}
        {preview.after && (
          <span className="block text-[12px] italic leading-snug text-graphit/55">
            {preview.after.text}…
          </span>
        )}
      </span>
    </span>
  );
}

/* ─── Touch detection ──────────────────────────────────────────────── */

function isLikelyTouch(): boolean {
  if (typeof window === 'undefined') return false;
  // Three signals, any one of which suggests touch primary input:
  //   • coarse pointer (matches phones + most tablets)
  //   • no hover capability (matches phones)
  //   • touch event support (matches Android + iOS but also some
  //     hybrid laptops — false positive acceptable)
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches ||
    'ontouchstart' in window
  );
}
