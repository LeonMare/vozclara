/**
 * PackCover — generative editorial book-cover for a Knowledge Pack.
 *
 * Replaces the YouTube thumbnail in the Library grid (and anywhere
 * else a Pack needs a visual identifier). The point: turn the
 * Library from "list of items with random YouTube thumbnails" into
 * "personal bibliography of designed objects".
 *
 * The component is pure CSS — no SVG, no font downloads — so it
 * renders at the same speed as a plain `<img>` but inherits every
 * webfont weight already loaded for the rest of the site (Cormorant
 * Garamond + Inter). For PNG export (Twitter / Instagram share
 * cards) the SVG-only sibling lives in scripts/generate-cover.mjs.
 *
 * Aspect ratios:
 *   • '16:9'  — Library grid card (matches the existing thumbnail box)
 *   • '3:4'   — Standalone hero block on the Pack detail page
 *   • '1:1'   — Future: Instagram-shareable square
 *
 * Per-genre ornament (top-left §-style glyph):
 *   news       → § (section mark, classic editorial)
 *   business   → ◆ (diamond, decisive)
 *   coaching   → ❋ (asterism, structured guidance)
 *   education  → ※ (reference mark)
 *   interview  → ❝ (left curly quote)
 *   creator    → ✦ (four-point star)
 *   general    → ¶ (pilcrow, "any paragraph")
 *
 * Brand glyph (top-right) is always V·C in Cormorant Roman caps.
 * Bottom-left: source→output language pair. Bottom-right: mode.
 *
 * Title sizing is adaptive — shorter titles get bigger Cormorant,
 * longer titles cascade down so a 120-character title still fits
 * inside the inner frame at 16:9 without clipping.
 */

import type { Genre, Language, Mode } from '../lib/pack';

export interface PackCoverProps {
  title: string;
  genre: Genre;
  sourceLang: Language;
  outputLang: Language;
  mode: Mode;
  /** Optional CEFR level (only set on language-learner packs). */
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  /** Visual variant. Default 16:9 matches the existing Library card. */
  aspect?: '16:9' | '3:4' | '1:1';
  /** Extra Tailwind utilities the caller wants on the outer container. */
  className?: string;
}

const GENRE_GLYPH: Record<Genre, string> = {
  news: '§',
  business: '◆',
  coaching: '❋',
  education: '※',
  interview: '❝',
  creator: '✦',
  general: '¶',
};

const GENRE_LABEL: Record<Genre, string> = {
  news: 'News',
  business: 'Business',
  coaching: 'Coaching',
  education: 'Education',
  interview: 'Interview',
  creator: 'Creator',
  general: 'General',
};

const MODE_LABEL: Record<Mode, string> = {
  learn: 'Learn',
  brief: 'Briefing',
  study: 'Study',
  creator: 'Creator',
};

const ASPECT_CLASS: Record<NonNullable<PackCoverProps['aspect']>, string> = {
  '16:9': 'aspect-video',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
};

/** Title-size cascade. Picks the largest Cormorant size that still
 *  fits the inner frame without overflow at the smallest grid width
 *  (~280 px on the iPhone breakpoint). */
function titleSizeClass(length: number, aspect: PackCoverProps['aspect']): string {
  if (aspect === '3:4' || aspect === '1:1') {
    // Portrait formats have more vertical headroom — start one tier larger.
    if (length < 24) return 'text-3xl sm:text-4xl';
    if (length < 48) return 'text-2xl sm:text-3xl';
    if (length < 80) return 'text-xl sm:text-2xl';
    return 'text-lg sm:text-xl';
  }
  // 16:9 — flatter, less vertical room.
  if (length < 24) return 'text-2xl sm:text-3xl';
  if (length < 48) return 'text-xl sm:text-2xl';
  if (length < 80) return 'text-base sm:text-lg';
  return 'text-sm sm:text-base';
}

/** Language pair label. Same source + output collapses to a single tag
 *  so the bottom row stays clean. */
function langPair(source: Language, output: Language): string {
  return source === output
    ? output.toUpperCase()
    : `${source.toUpperCase()} → ${output.toUpperCase()}`;
}

export function PackCover({
  title,
  genre,
  sourceLang,
  outputLang,
  mode,
  difficulty,
  aspect = '16:9',
  className = '',
}: PackCoverProps): JSX.Element {
  return (
    <div
      className={[
        'relative w-full overflow-hidden bg-navy text-creme',
        ASPECT_CLASS[aspect],
        className,
      ].join(' ')}
    >
      {/* Radial highlight — the same subtle paper-like gradient we use
          on the OG image and the .paper class. Off-centre to give the
          composition a focal point that isn't dead-centre boring. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 35% 38%, rgba(20,37,69,1) 0%, rgba(10,26,58,1) 70%)',
        }}
      />

      {/* Inner gold frame — 12 px from the edge so the rule survives
          the rounded-card corner radius the caller applies. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 border border-gold/30"
      />

      {/* Top-left ornament + genre tag */}
      <div className="absolute left-5 top-4 flex items-center gap-2 sm:left-6 sm:top-5">
        <span className="font-serif text-base leading-none text-gold/80 sm:text-lg">
          {GENRE_GLYPH[genre]}
        </span>
        <span className="font-sans text-[9px] uppercase tracking-[0.28em] text-gold/65">
          {GENRE_LABEL[genre]}
        </span>
      </div>

      {/* Top-right brand mark — VozClara in classical caps. The middot
          mirrors the wordmark on the OG image so the visual lockup is
          consistent across surfaces. */}
      <div className="absolute right-5 top-4 font-serif text-sm tracking-[0.25em] text-gold/75 sm:right-6 sm:top-5 sm:text-base">
        V·C
      </div>

      {/* Title — centred, adaptive size. line-clamp keeps very long
          titles from busting the frame on the narrowest cards. */}
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center sm:inset-x-8">
        <p
          className={[
            'line-clamp-4 font-serif italic leading-snug text-creme',
            titleSizeClass(title.length, aspect),
          ].join(' ')}
        >
          {title}
        </p>
        <div
          aria-hidden
          className="mx-auto mt-3 h-px w-8 bg-gold/50 sm:mt-4 sm:w-10"
        />
      </div>

      {/* Bottom-left — language pair. The arrow is U+2192 (real arrow,
          not -> ascii) so the typography stays editorial. */}
      <div className="absolute bottom-4 left-5 flex items-baseline gap-2 sm:bottom-5 sm:left-6">
        <span className="font-sans text-[9px] uppercase tracking-[0.28em] text-creme/70 tabular-nums">
          {langPair(sourceLang, outputLang)}
        </span>
        {difficulty && (
          <span
            className="font-sans text-[9px] uppercase tracking-[0.28em] text-gold/70 tabular-nums"
            title={`CEFR ${difficulty}`}
          >
            · {difficulty}
          </span>
        )}
      </div>

      {/* Bottom-right — mode. Same caps tracking as the language pair
          so the two corners read as a baseline strip. */}
      <div className="absolute bottom-4 right-5 sm:bottom-5 sm:right-6">
        <span className="font-sans text-[9px] uppercase tracking-[0.28em] text-creme/55">
          {MODE_LABEL[mode]}
        </span>
      </div>
    </div>
  );
}
