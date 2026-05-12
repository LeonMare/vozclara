import { VozClaraMark } from './VozClaraMark';

/**
 * BrandMark — the VozClara product identity in three variants:
 *
 *   monogram  — V monogram only. Used in compact spaces.
 *   lockup    — monogram + VozClara wordmark side by side.
 *   stacked   — monogram above wordmark, centered. Ornaments.
 *
 * The monogram is the editorial serif "V" with gold sound-wave arcs,
 * rendered as inline SVG so it stays crisp at any size. The wordmark
 * is Cinzel (Latin caps) to inherit the LEON MARÉ Brand Foundation
 * typography while remaining its own product mark.
 *
 * "VOZ · CLARA" is rendered as two words divided by an interpunct so
 * the bilingual heritage (voz = voice in ES/PT, clara = clear) shows
 * even in the wordmark.
 */

interface Props {
  variant?: 'monogram' | 'lockup' | 'stacked';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'navy' | 'gold' | 'creme';
  className?: string;
  decorative?: boolean;
}

const MONOGRAM_PX: Record<NonNullable<Props['size']>, number> = {
  xs: 20,
  sm: 26,
  md: 34,
  lg: 46,
  xl: 78,
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
  const mark = (
    <VozClaraMark
      size={MONOGRAM_PX[size]}
      className={TONE[tone]}
      decorative={decorative}
    />
  );

  if (variant === 'monogram') {
    return <span className={['inline-flex shrink-0', className].join(' ')}>{mark}</span>;
  }

  if (variant === 'stacked') {
    return (
      <span className={['inline-flex flex-col items-center gap-2', TONE[tone], className].join(' ')}>
        {mark}
        <span className={['wordmark', WORDMARK_SIZE[size]].join(' ')} style={{ color: 'inherit' }}>
          Voz&nbsp;·&nbsp;Clara
        </span>
      </span>
    );
  }

  return (
    <span className={['inline-flex items-center gap-2.5', TONE[tone], className].join(' ')}>
      {mark}
      <span className={['wordmark', WORDMARK_SIZE[size]].join(' ')} style={{ color: 'inherit' }}>
        Voz&nbsp;·&nbsp;Clara
      </span>
    </span>
  );
}
