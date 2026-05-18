/**
 * Avatar — brand-conform monogram fallback.
 *
 * Editorial palette: navy disc, gold initial, faint gold ring.
 * No Gravatar dependency — editorial design clashes with Gravatar's
 * generic patterns, and the monogram works deterministically without
 * any network call. Avatar upload (Pro feature) lands post-launch.
 *
 * Size scales: sm (32 px) for header chip, md (48 px) for inline rows,
 * lg (80 px) for the /me hero. Border thickness scales with size so it
 * keeps the same optical weight at every scale.
 */

interface AvatarProps {
  /** Used to derive the initial. Falls back to email when undefined. */
  name?: string;
  /** Always required — used both as fallback initial and as a11y label. */
  email: string;
  size?: 'sm' | 'md' | 'lg';
  /** Decorative — set to true to hide from screen readers (when the
   *  avatar accompanies the user's name elsewhere in the same component). */
  decorative?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-sm border',
  md: 'h-12 w-12 text-lg border',
  lg: 'h-20 w-20 text-3xl border-2',
};

export function Avatar({ name, email, size = 'md', decorative = false }: AvatarProps) {
  const source = (name ?? email).trim();
  const initial = source.charAt(0).toUpperCase() || '?';

  return (
    <div
      aria-hidden={decorative}
      aria-label={decorative ? undefined : `Avatar for ${name ?? email}`}
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-full bg-navy font-serif text-gold border-gold/30',
        'shadow-sm',
        SIZE_CLASSES[size],
      ].join(' ')}
    >
      {initial}
    </div>
  );
}
