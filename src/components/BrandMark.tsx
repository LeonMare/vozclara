import { LeonMareMark } from './LeonMareMark';

/**
 * BrandMark — official VozClara identity (a LEON MARÉ product).
 *
 * Three variants:
 *
 *   monogram  — LEON MARÉ lion mark only, no wordmark. Compact spaces.
 *   lockup    — mark + "Voz · Clara" wordmark side by side.
 *   stacked   — mark above wordmark, centered. Ornaments.
 *
 * Identity hierarchy:
 *   • The lion-and-wave is the LEON MARÉ family signature — every
 *     product under LEON MARÉ shares it, so users learn to recognise
 *     it as the "house mark".
 *   • The wordmark "Voz · Clara" in Cinzel is the product's own name.
 *   • Together: parent + product, two words, one identity, no clash.
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
  sm: 28,
  md: 36,
  lg: 52,
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
  const mark = <LeonMareMark size={MARK_PX[size]} decorative={decorative} />;

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
