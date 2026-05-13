/**
 * LeonMareMark — the LEON MARÉ family mark, used as VozClara's symbol.
 *
 * VozClara is a product under the LEON MARÉ parent brand. We use the
 * family's lion-and-wave mark as the visual signature, and pair it
 * with the "Voz · Clara" wordmark (Cinzel) so the product keeps its
 * own identity within the family.
 *
 * Implementation:
 *  - Source asset: /leon-mare-mark.png (2128×2128, navy background,
 *    gold lion + wave + "LEON MARÉ" text below).
 *  - We crop to the upper portion of the image so only the lion
 *    ornament is visible — the "LEON MARÉ" text from the PNG is
 *    deliberately clipped, because the product wordmark is rendered
 *    separately as "Voz · Clara".
 *  - The crop is centred on the lion's visual midpoint via a fixed
 *    scale-and-shift, sized to the requested mark size.
 *
 * The image already carries its own navy backdrop, so the mark works
 * as both a flat symbol and a medallion-style seal without an extra
 * disc wrapper. The Medallion variant adds a fine gold hairline ring
 * for reserved hero / app-icon usage.
 */

interface Props {
  size?: number;
  className?: string;
  decorative?: boolean;
}

const SOURCE_URL = '/leon-mare-mark.png';

// The lion ornament sits in roughly the top 60% of the source canvas;
// its visual centre is around y ≈ 42% of the source. To make a square
// crop that fills the requested size with the lion centred:
//   • Render the image at ~1.75× the requested size (so it overflows
//     the container both ways)
//   • Translate it up so the lion's centre lands at the container's
//     centre — the LEON MARÉ wordmark below is pushed off the bottom
const IMG_SCALE = 1.75;
const VERTICAL_OFFSET = 0.18; // fraction of size to shift up

export function LeonMareMark({ size = 48, className = '', decorative = true }: Props) {
  const s = `${size}px`;
  return (
    <div
      style={{
        width: s,
        height: s,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '50%',
        backgroundColor: '#0A1A3A',
        flexShrink: 0,
      }}
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'LEON MARÉ'}
      aria-hidden={decorative ? true : undefined}
    >
      <img
        src={SOURCE_URL}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          width: `${size * IMG_SCALE}px`,
          height: `${size * IMG_SCALE}px`,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, calc(-50% - ${size * VERTICAL_OFFSET}px))`,
          maxWidth: 'none',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
}

/**
 * Medallion variant — adds a fine gold hairline ring for reserved
 * anchor usage (hero ornament, app icon, footer seal). Most surfaces
 * should use the plain LeonMareMark; the ring is for moments where
 * the mark is the centrepiece.
 */
export function LeonMareMedallion({ size = 80 }: { size?: number }) {
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <LeonMareMark size={size} />
      {/* Gold hairline — sits just inside the disc edge. Matte, not
          decorative-heavy: this is a print-style enseigne, not a button. */}
      <div
        className="pointer-events-none absolute inset-[3px] rounded-full"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(201,162,75,0.45)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: '0 6px 18px rgba(10,26,58,0.22)' }}
        aria-hidden
      />
    </div>
  );
}
