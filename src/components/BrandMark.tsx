/**
 * BrandMark — official Voz Clara identity.
 *
 * Three variants:
 *   monogram  — just the seal/lighthouse mark
 *   lockup    — mark + "VOZ · CLARA" wordmark side by side
 *   stacked   — mark above wordmark, centred (for ornaments)
 *
 * The mark is an inline SVG with hairline strokes set to currentColor,
 * so tone (gold / navy / creme) is controlled entirely via CSS. The
 * wordmark is rendered as HTML text using the Cinzel webfont already
 * loaded in index.html — not embedded inside the SVG — so typography
 * stays sharp and we never need to ship the font as glyph paths.
 *
 * Source: the final "Numismatic Lighthouse Seal" identity by the
 * Voz Clara brand iteration of 2026-05-14. See public/voz-clara-mark.svg
 * for the authoritative source file; this component is a pixel-faithful
 * inline copy of those paths so the React build doesn't depend on a
 * runtime fetch.
 */

interface Props {
  variant?: 'monogram' | 'lockup' | 'stacked';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'navy' | 'gold' | 'creme';
  className?: string;
  decorative?: boolean;
}

const MARK_PX: Record<NonNullable<Props['size']>, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 56,
  xl: 88,
};

const WORDMARK_SIZE: Record<NonNullable<Props['size']>, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-2xl',
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
  const wordmark = (
    <span
      className={['wordmark whitespace-nowrap', WORDMARK_SIZE[size]].join(' ')}
      style={{ color: 'inherit', letterSpacing: '0.18em' }}
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
        {wordmark}
      </span>
    );
  }

  return (
    <span className={['inline-flex items-center gap-3', TONE[tone], className].join(' ')}>
      {mark}
      {wordmark}
    </span>
  );
}

/**
 * The numismatic lighthouse seal. Inlined from voz-clara-mark.svg.
 * All strokes use currentColor so the surrounding TONE class controls
 * the colour. Hairline-friendly: vector-effect="non-scaling-stroke"
 * keeps the line weight visually consistent at any rendered size.
 */
function LighthouseMark({ size, decorative }: { size: number; decorative: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'Voz Clara'}
      aria-hidden={decorative ? true : undefined}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* Double numismatic seal */}
        <circle cx={50} cy={50} r={43} />
        <circle cx={50} cy={50} r={39.2} strokeWidth={1.65} />

        {/* Three precise beacon rays */}
        <path d="M50 14 L50 24" />
        <path d="M39 21 L32 28" />
        <path d="M61 21 L68 28" />

        {/* Lighthouse lantern and cap */}
        <path d="M45 30 L50 25 L55 30" />
        <path d="M43 32 H57" />
        <path d="M44.5 32 V38 H55.5 V32" />
        <path d="M47.3 32 V38" strokeWidth={1.43} />
        <path d="M52.7 32 V38" strokeWidth={1.43} />
        <path d="M41.5 39 H58.5" />

        {/* Slim tapered tower */}
        <path d="M44 40 L39.2 76" />
        <path d="M56 40 L60.8 76" />
        <path d="M42.5 51 H57.5" strokeWidth={1.76} />
        <path d="M41 64 H59" strokeWidth={1.76} />
        <path d="M48.2 55 V60" strokeWidth={1.54} />

        {/* Restrained editorial horizon / knowledge line */}
        <path d="M27 78 C36 74.5 43 75.5 50 78 C57 80.5 64 81.5 73 78" />
      </g>
    </svg>
  );
}
