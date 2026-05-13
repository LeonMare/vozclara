/**
 * LeonMareMark — the LEON MARÉ family mark, used as VozClara's symbol.
 *
 * Rendering strategy (v3, transparent-background version):
 *
 *  We render the lion as an inline SVG that:
 *    1. Loads `/leon-mare-mark.png` as an <image> inside a <mask>
 *    2. Pushes that image through a feComponentTransfer filter that
 *       boosts contrast so the navy backdrop drops to ~0 alpha and
 *       the gold ornament stays at ~100% alpha. This converts the
 *       source PNG into a near-binary mask in-browser, no offline
 *       editing required.
 *    3. Fills a rectangle with a vertical gold gradient and masks it
 *       with the cleaned lion mask
 *    4. Positions the mask image to crop out the "LEON MARÉ" text
 *       block at the bottom of the source — we render that wordmark
 *       separately in Cinzel as "Voz · Clara"
 *
 *  Result: a crisp gold lion ornament that floats on whatever
 *  background the page provides (creme, white, navy — all work),
 *  with no navy disc, no dark backdrop, and no compositing artefacts.
 *
 *  Why mask + filter instead of just shipping an SVG of the lion?
 *  Because the user-approved logo IS the PNG — we want to preserve
 *  its exact silhouette and proportions rather than try to redraw
 *  it. The mask approach uses the PNG as the truth source for shape
 *  and re-applies the brand colour cleanly.
 *
 *  Why a unique filter id per instance? Because two SVGs on the same
 *  page with the same `id` collide. We generate the id from the size
 *  prop — that's stable across renders of the same instance, and
 *  different across instances of different sizes.
 */

import { useId } from 'react';

interface Props {
  size?: number;
  className?: string;
  decorative?: boolean;
}

// Crop / position constants for the mask image. The source PNG has the
// lion centred horizontally and sitting in roughly the upper-middle of
// the canvas. We zoom 1.55× and shift up so only the lion ornament fills
// the visible square — the "LEON MARÉ" text is pushed below the frame.
const MASK_SCALE = 1.55;
const MASK_Y_SHIFT = 0.06; // fraction of the SVG height to shift up

export function LeonMareMark({ size = 48, className = '', decorative = true }: Props) {
  const uid = useId();
  const maskId = `lm-mask-${uid}`;
  const filterId = `lm-filter-${uid}`;
  const gradId = `lm-gold-${uid}`;

  // Mask image positioning in viewBox units (100×100). Image is
  // rendered at MASK_SCALE × the viewBox and centred, shifted up.
  const imgSize = 100 * MASK_SCALE;
  const imgX = (100 - imgSize) / 2;
  const imgY = (100 - imgSize) / 2 - MASK_Y_SHIFT * 100;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'LEON MARÉ'}
      aria-hidden={decorative ? true : undefined}
      style={{ flexShrink: 0, overflow: 'visible' }}
    >
      <defs>
        {/* Vertical gold gradient — top highlight to deep bronze.
            Same stops we use across the brand for "ornamented" elements. */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0DCA5" />
          <stop offset="35%" stopColor="#D8B466" />
          <stop offset="65%" stopColor="#C9A24B" />
          <stop offset="100%" stopColor="#8C6A2A" />
        </linearGradient>

        {/* Contrast-boost filter. Pushes the gold parts of the PNG up
            to near-white and the navy parts down to black, so when the
            image is used as a luminance mask the result is binary-clean. */}
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feComponentTransfer>
            <feFuncR type="linear" slope="3.2" intercept="-0.9" />
            <feFuncG type="linear" slope="3.2" intercept="-0.9" />
            <feFuncB type="linear" slope="3.2" intercept="-0.9" />
            <feFuncA type="linear" slope="1" intercept="0" />
          </feComponentTransfer>
        </filter>

        {/* Mask: the contrast-boosted PNG becomes a luminance mask.
            White = visible, black = hidden. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect x="0" y="0" width="100" height="100" fill="black" />
          <image
            href="/leon-mare-mark.png"
            x={imgX}
            y={imgY}
            width={imgSize}
            height={imgSize}
            preserveAspectRatio="xMidYMid slice"
            filter={`url(#${filterId})`}
          />
        </mask>
      </defs>

      {/* The gold gradient, masked to the lion silhouette. */}
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill={`url(#${gradId})`}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}

/**
 * Medallion variant — the lion plus a fine gold hairline arc framing
 * the bottom, like a coin enseigne. Reserved for hero / app-icon usage
 * where the mark is the centrepiece. No heavy disc, no shadow — the
 * mark is the gesture, the ring is just a punctuation mark.
 */
export function LeonMareMedallion({ size = 80 }: { size?: number }) {
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <LeonMareMark size={size} />
      {/* Thin gold arc beneath the lion — echoes the wave in the mark
          itself and gives the medallion a sense of base without a disc. */}
      <svg
        className="pointer-events-none absolute inset-0"
        viewBox="0 0 100 100"
        aria-hidden
        style={{ overflow: 'visible' }}
      >
        <path
          d="M 18 92 Q 50 100 82 92"
          fill="none"
          stroke="#C9A24B"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
