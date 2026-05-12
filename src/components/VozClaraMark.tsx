/**
 * VozClaraMark — the official VozClara product monogram.
 *
 * A slim editorial serif "V" with two gold resonance arcs beneath.
 * The V references typography (the product handles text); the arcs
 * are "Voz" (voice / resonance); together they speak "Clara"
 * (clarity, precision).
 *
 * Designed as inline SVG so geometry stays crisp at every size and
 * tone follows currentColor or a gold gradient (ornamented variant).
 *
 * Lives alongside LionMark which represents the LEON MARÉ parent
 * brand. VozClara is a product under LEON MARÉ — visual language
 * matches (Navy / Gold / serif), but the mark is its own.
 *
 * Tuning notes (iteration 2):
 *  - V slimmer + slightly taller for editorial gravitas
 *  - Serifs finer (3px not 4px) and shorter notch
 *  - Apex inner moved higher (y=64) so the V breathes
 *  - Resonance arcs raised closer to the V and made finer
 */

interface Props {
  variant?: 'flat' | 'ornamented';
  size?: number | string;
  className?: string;
  decorative?: boolean;
}

const VIEW_BOX = '0 0 100 100';

// Slim Roman-caps V with fine serif terminals. Drawn as a single
// closed path so renderer optimisation stays minimal.
//
// Coordinates trace (clockwise from TL outer corner):
//   (27,22) → top serif left → (42,22) → down (42,25) → inner notch (39,25)
//   → inner apex (50,64) → up to inner right (61,25) → notch (58,25)
//   → up (58,22) → top serif right (73,22) → down (73,25) → notch (70,25)
//   → outer apex right (54,78) → apex point shift left (46,78)
//   → outer bottom left (30,25) → notch (27,25) → close to start
const V_PATH =
  'M 27 22 L 42 22 L 42 25 L 39 25 L 50 64 L 61 25 L 58 25 L 58 22 L 73 22 L 73 25 L 70 25 L 54 78 L 46 78 L 30 25 L 27 25 Z';

// Resonance arcs — raised closer to the V so the silhouette reads
// as one mark, not "letter + decoration". Two nested curves of
// decreasing amplitude suggest voice propagating outward.
const ARC_OUTER = 'M 30 86 Q 50 76 70 86';
const ARC_INNER = 'M 36 88 Q 50 81 64 88';

export function VozClaraMark({
  variant = 'flat',
  size = 32,
  className = '',
  decorative = true,
}: Props) {
  const w = typeof size === 'number' ? `${size}px` : size;
  const role = decorative ? 'presentation' : 'img';
  const aria = decorative ? { 'aria-hidden': true } : { 'aria-label': 'VozClara' };

  if (variant === 'ornamented') {
    return (
      <svg
        viewBox={VIEW_BOX}
        style={{ width: w, height: w }}
        className={className}
        role={role}
        {...aria}
      >
        <defs>
          <linearGradient id="vozGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8D29A" />
            <stop offset="50%" stopColor="#C9A24B" />
            <stop offset="100%" stopColor="#8C6A2A" />
          </linearGradient>
        </defs>
        <path d={V_PATH} fill="url(#vozGold)" />
        <path d={ARC_OUTER} fill="none" stroke="url(#vozGold)" strokeWidth="1.7" strokeLinecap="round" />
        <path d={ARC_INNER} fill="none" stroke="url(#vozGold)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }

  // Flat — inherits currentColor; arcs slightly transparent for hierarchy.
  return (
    <svg
      viewBox={VIEW_BOX}
      style={{ width: w, height: w }}
      className={className}
      role={role}
      {...aria}
    >
      <path d={V_PATH} fill="currentColor" />
      <path d={ARC_OUTER} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.75" />
      <path d={ARC_INNER} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/**
 * Hero medallion — the V monogram inside a thin gold-ringed navy disc.
 * Matter than the previous version: lighter shadow, no glow burnish,
 * and more inner breathing room so the V doesn't crowd the ring.
 *
 * Reserved for special anchors: hero ornament, app icon, footer seal.
 * Not used as a general-purpose lockup symbol — the flat monogram
 * (BrandMark variant="monogram") handles that.
 */
export function VozClaraMedallion({ size = 80 }: { size?: number }) {
  const w = `${size}px`;
  // Inner padding scales with size so the V never feels cramped against
  // the hairline ring at any scale.
  const innerInset = Math.max(7, Math.round(size * 0.11));
  const markSize = size * 0.58;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: w, height: w }}
    >
      {/* Outer navy disc — matte, soft shadow only. No big drop-shadow. */}
      <div
        className="absolute inset-0 rounded-full bg-navy"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(201,162,75,0.32), 0 4px 14px rgba(10,26,58,0.18)',
        }}
        aria-hidden
      />
      {/* Inner gold hairline — finer than before. */}
      <div
        className="absolute rounded-full"
        style={{
          top: innerInset,
          left: innerInset,
          right: innerInset,
          bottom: innerInset,
          boxShadow: 'inset 0 0 0 1px rgba(201,162,75,0.4)',
        }}
        aria-hidden
      />
      {/* Monogram */}
      <VozClaraMark variant="ornamented" size={markSize} />
    </div>
  );
}
