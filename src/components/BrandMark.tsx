/**
 * BrandMark — official VozClara identity (v2, refined lighthouse).
 *
 * Three variants:
 *   monogram  — just the seal/lighthouse mark
 *   lockup    — mark + "VOZ · CLARA" wordmark side by side, with
 *               diamond divider under the wordmark and a vertical
 *               hairline separator between mark and wordmark
 *   stacked   — mark above wordmark, centred, with diamond divider
 *               beneath. Used as an ornament inside hero / footer.
 *
 * The mark is an inline SVG built from the authoritative source file
 * (public/voz-clara-mark.svg), with all strokes set to currentColor
 * so tone follows the surrounding CSS class. The wordmark is HTML
 * text in Cinzel (loaded from index.html), and the diamond divider
 * is a small inline SVG so it scales with the wordmark and inherits
 * the same currentColor.
 *
 * vector-effect="non-scaling-stroke" keeps line weight visually
 * consistent across sizes — essential for the fine balcony pillars
 * and beacon hairlines to read at 28px without thickening at 88px.
 */

interface Props {
  variant?: 'monogram' | 'lockup' | 'stacked';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'navy' | 'gold' | 'creme';
  className?: string;
  decorative?: boolean;
}

const MARK_PX: Record<NonNullable<Props['size']>, number> = {
  xs: 22,
  sm: 30,
  md: 40,
  lg: 60,
  xl: 96,
};

const WORDMARK_SIZE: Record<NonNullable<Props['size']>, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-2xl',
};

const DIVIDER_W: Record<NonNullable<Props['size']>, string> = {
  xs: 'w-6',
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
  xl: 'w-20',
};

const TONE: Record<NonNullable<Props['tone']>, string> = {
  navy: 'text-navy',
  gold: 'text-gold',
  creme: 'text-creme',
};

export function BrandMark({
  variant = 'lockup',
  size = 'md',
  tone = 'navy',
  className = '',
  decorative = false,
}: Props) {
  const markPx = MARK_PX[size];
  const mark = <LighthouseMark size={markPx} decorative={decorative} />;
  const wordmarkText = (
    <span
      className={['wordmark whitespace-nowrap', WORDMARK_SIZE[size]].join(' ')}
      style={{ color: 'inherit', letterSpacing: '0.22em' }}
    >
      VOZ&nbsp;·&nbsp;CLARA
    </span>
  );

  if (variant === 'monogram') {
    return (
      <span className={['inline-flex shrink-0', TONE[tone], className].join(' ')}>
        {mark}
      </span>
    );
  }

  if (variant === 'stacked') {
    return (
      <span className={['inline-flex flex-col items-center gap-3', TONE[tone], className].join(' ')}>
        {mark}
        {wordmarkText}
        <DiamondDivider width={DIVIDER_W[size]} />
      </span>
    );
  }

  // lockup — mark + vertical hairline + wordmark stack on the right
  return (
    <span className={['inline-flex items-center gap-3', TONE[tone], className].join(' ')}>
      {mark}
      <span
        className="h-8 w-px shrink-0"
        style={{ backgroundColor: 'currentColor', opacity: 0.35 }}
        aria-hidden
      />
      <span className="inline-flex flex-col items-center gap-1.5">
        {wordmarkText}
        <DiamondDivider width={DIVIDER_W[size]} />
      </span>
    </span>
  );
}

/**
 * The numismatic lighthouse seal — v2, refined.
 *
 * Detail over the v1 mark:
 *  • Cleaner double-ring frame at r=44/40.7
 *  • Two pairs of angled beacon rays instead of three vertical ones
 *  • Articulated balcony with vertical pillars
 *  • Small door/window in the tower mid-section
 *  • Curved horizon at the base
 *
 * Strokes inherit currentColor; vector-effect keeps line weights
 * visually constant from 16px favicon to 96px hero mark.
 */
function LighthouseMark({ size, decorative }: { size: number; decorative: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'VozClara'}
      aria-hidden={decorative ? true : undefined}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* Double numismatic seal */}
        <circle cx={50} cy={50} r={44} strokeWidth={2.2} />
        <circle cx={50} cy={50} r={40.7} strokeWidth={1.6} />

        {/* Beacon rays — vertical centre + two angled pairs */}
        <path d="M50 16V26" strokeWidth={1.7} />
        <path d="M33 25l10 6" strokeWidth={1.4} />
        <path d="M67 25l-10 6" strokeWidth={1.4} />
        <path d="M31 36l12-3" strokeWidth={1.4} />
        <path d="M69 36l-12-3" strokeWidth={1.4} />

        {/* Lantern cap (small pediment + roof line) */}
        <path d="M46.5 30h7" strokeWidth={1.4} />
        <path d="M47.8 25.6h4.4c.2 0 .5.2.5.5v1.3" strokeWidth={1.4} />
        <path d="M44.4 31.2l5.6-4.1 5.6 4.1" strokeWidth={1.6} />

        {/* Galerie/balcony with vertical pillars */}
        <path d="M45.6 31.4h8.8v5.7h-8.8z" strokeWidth={1.4} />
        <path d="M47.3 31.4v5.7M50 31.4v5.7M52.7 31.4v5.7" strokeWidth={1.05} />
        <path d="M43.8 37.1h12.4" strokeWidth={1.7} />
        <path d="M44.7 39h10.6" strokeWidth={1.15} />

        {/* Tapered tower */}
        <path d="M45.3 39.1 42.3 73.7M54.7 39.1 57.7 73.7" strokeWidth={1.6} />

        {/* Mid-tower horizontal band */}
        <path d="M46.8 48h6.4" strokeWidth={1.2} />

        {/* Door / window */}
        <rect x={48.6} y={50.2} width={2.8} height={5.5} rx={0.2} strokeWidth={1.35} />

        {/* Base plinth */}
        <path d="M41.2 73.8h17.6" strokeWidth={1.7} />

        {/* Curved editorial horizon */}
        <path
          d="M24.6 79.4C33.7 73.8 43 72.2 50 72.2s16.3 1.6 25.4 7.2"
          strokeWidth={1.8}
        />
      </g>
    </svg>
  );
}

/**
 * Diamond divider — the editorial flourish used under the wordmark.
 * Two thin hairlines flanking a 4-point diamond. Width scales with
 * the surrounding wordmark size (passed via Tailwind w-* class).
 */
function DiamondDivider({ width }: { width: string }) {
  return (
    <span
      aria-hidden
      className={['inline-flex items-center justify-center gap-1.5', width].join(' ')}
    >
      <span
        className="h-px flex-1"
        style={{ backgroundColor: 'currentColor', opacity: 0.55 }}
      />
      <svg width="6" height="6" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
        <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" />
      </svg>
      <span
        className="h-px flex-1"
        style={{ backgroundColor: 'currentColor', opacity: 0.55 }}
      />
    </span>
  );
}
