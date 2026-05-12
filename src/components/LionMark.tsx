/**
 * LionMark — the LEON MARÉ lion + wave, rendered as inline SVG so every
 * path inherits currentColor and stays crisp at any scale.
 *
 * The previous implementation used CSS mask-image, which produced a flat
 * silhouette — fine but visually thin. Inlining the paths preserves the
 * original stroke weights and lets us layer a subtle gold-on-navy gradient
 * for the "ornamented" variant used as a hero medallion.
 */

interface Props {
  /**
   * "flat"        — single colour silhouette (current text color).
   * "ornamented"  — gold gradient overlay on navy backing, used for
   *                 medallion-style hero ornaments.
   */
  variant?: 'flat' | 'ornamented';
  size?: number | string;
  className?: string;
  decorative?: boolean;
}

const VIEW_BOX = '700 670 720 530';

/**
 * The lion + wave paths, extracted from the LEON MARÉ Brand Foundation v5
 * primary mark. Adobe-Illustrator-exported, untouched apart from removing
 * the wordmark layer and the navy backing rectangle.
 */
const LION_PATHS = [
  'M1175.89,944.72c0,0,15.91-3.18,22.27-20c6.36-16.82-1.14-33.18-3.41-33.41c-2.27-0.23-20.23,10.23-38.87,10.23s-31.82-14.55-31.82-14.55s-2.73,7.05,3.41,15.68c6.14,8.64,26.14,11.14,32.05,18.87c5.91,7.73,2.84,16.82,2.84,16.82c3.75-0.45,9.43-7.73,9.43-7.73c-0.45,9.32-6.36,15.46-6.36,15.46c7.5-1.36,19.77-15,19.77-15C1182.93,939.04,1175.89,944.72,1175.89,944.72z',
  'M796.31,897.22c0,0,30.91-98.04,175.92-121.3c0,0-26.82-7.2-65.91,0c0,0,33.64-15.07,74.1-18.26c0,0-39.09-14.55-81.82,0s-69.55,49.09-69.55,49.09s19.09-14.09,41.37-20.91C870.41,785.85,809.04,816.76,796.31,897.22z',
  'M1039.03,768.53c0,0-14.33-26.67-48.9-26.18c0,0-4.94,45.45,36.06,45.45c0,0-18.77-8.4-23.71-30.63C1002.48,757.17,1024.71,770.51,1039.03,768.53z',
  'M1053.83,715.57c37.28,26.59,42.96,44.94,42.96,44.94s0,0,0,0c0,0-9.36-3.57-21.85-1.69c-4.15,0.63-8.65,1.87-13.27,4.03c-3.31,1.55-6.68,3.58-10.03,6.21c-0.59,0.47-1.19,0.94-1.78,1.45c0,0,1.05-0.09,2.87-0.13c0.06,0.08,0.13,0.16,0.19,0.24c0,0,0.7-0.11,1.98-0.25c4.55,0.04,11.69,0.51,19.3,2.51c0,0-31.45,2.71-44.64,26.72c0,0,9.13-5.41,25.7-7.44c0,0-30.02,19.01-34.14,46.9c-0.74,4.99-0.65,10.26,0.59,15.77c0,0,1.79-4.05,5.51-9.59c0,0.25,0.01,0.39,0.01,0.39c0.44-0.83,0.91-1.63,1.39-2.42c3.69-5.18,8.91-11.3,15.77-16.61c6.53-4.8,12.47-7.56,14.43-8.41c0.23-0.1,0.46-0.2,0.69-0.29c0,0-18.87,17.96-17.96,43.87c0.91,25.91,20.46,41.59,20.46,41.59c-10.68-37.28,10.91-53.87,10.91-53.87s-5,15.68-0.45,37.28c4.55,21.59,27.27,35.46,27.27,35.46s-3.86-27.5,10.68-42.5c14.55-15,21.99-13.18,21.99-13.18c-4.94,7.5-8.35,14.66,15.68,21.31c24.04,6.65,35.46-2.22,43.13-5.09c7.67-2.88,11.08-0.53,11.76-0.02c0.68,0.51,6.48-9.38,6.14-16.71c-0.34-7.33-2.56-8.18-9.89-12.78c-7.33-4.6-11.25-9.21-10.06-10.57c1.19-1.36,17.22-2.05,20.29,2.05c3.07,4.09,0.51,11.59,2.39,11.42c1.88-0.17,7.16-9.21,7.16-13.81c0-4.6-4.77-9.21-19.26-19.26c-14.49-10.06-35.29-22.33-35.29-22.33s0.85-9.55-1.19-12.96c-2.05-3.41-39.21-22.5-39.21-22.5c4.09-46.03-28.64-62.39-28.64-62.39c13.64,13.64,17.05,35.46,17.05,35.46s-10.57-39.55-79.44-52.85c-68.87-13.3-103.99,12.27-103.99,12.27C948.48,689.93,1009.69,684.09,1053.83,715.57z M1140.03,799.19c4.34,1.6,25.38,24.69,25.38,25.38c0,0.69-20.12-10.97-21.03-11.2c-0.91-0.23-11.2,1.85-16.69-2.05c-5.49-3.9-8.92-8.24-9.83-8.47c-0.91-0.23-10.59-3.51-10.67-4.72C1107.19,798.12,1135.69,797.59,1140.03,799.19z',
  'M861.62,751.2c0,0,34.53-42.33,101.04-47.09c66.51-4.75,91.29,25.41,103.22,47.09c0,0-75.67-35.74-143.24-12.17c0,0,21.57-14.95,46.24-17.86C968.88,721.16,918.31,715.45,861.62,751.2z',
  'M988.4,949.24c0,0-6.53,41.58,61.53,80.77c57.89,33.34,53.65,74.43,53.65,74.43s22.39-34.75-0.7-66.49C1076.04,1001.08,1037.49,1007.01,988.4,949.24z',
  'M968.59,846.54c0,0-52.27,133.78,76.64,214.7c0,0-95.16-14.98-109.89-90.73C921.5,899.32,968.59,846.54,968.59,846.54z',
  'M987.5,796.63c0,0-38.69,28.58-63.29,79.68s-15.9,107.98,4.93,142.28c0,0-44.03-13.78-43.73-86.13c0,0-13.6,17.96-11.86,58.78c0,0-21.1-32.45-4.75-87.88C887.45,840.13,951.08,807.8,987.5,796.63z',
  'M1137.46,991.75c-25.52-33.22-86.68-40.1-113.15-102.74c-0.71-1.69-1.28-3.44-1.85-5.2c-2.05,18.41,3.41,32.73,3.41,32.73s-0.21-0.28-0.57-0.8c-39.33-54.13-10.22-112.73-10.06-113.05c-26.89,20.67-39.93,60.29-30.77,98.66c0.01,0.06,0.03,0.12,0.04,0.19c10.23,42.5,44.55,59.32,44.55,59.32c-18.86-15.68-21.37-41.82-21.37-41.82s1.5,5.78,7.49,14.12c7.74,10.78,23.83,23.38,52.19,38.26c69.68,36.54,68.68,59.81,72.92,83.53C1140.29,1054.95,1157.26,1017.53,1137.46,991.75z',
  'M780.99,1009.13c0,0,23.31-28.23,34.94-71.17c11.63-42.95,24.78-96.17,84.5-120.74c0,0-37.83,29.32-53.9,98.55C832.08,978,817.67,1004.21,780.99,1009.13z',
  'M782.47,1066.84c0,0,16.11-11.9,61.87-8.06c39.24,3.29,72.82,21.3,111.87,46.34c39.06,25.04,92.62,57.57,154.84,48.36s82.86-56.13,87.6-64.47c0,0-37.38,36.55-89.55,37.13c-52.17,0.58-80.91-24.92-130.29-54.34c-49.38-29.42-86.66-46.19-136.42-40.07C796.67,1037.35,782.47,1066.84,782.47,1066.84z',
  'M814.03,1096.7c0.84-0.58,28.83-1.77,83.7,30.57c48.71,28.71,94.86,58.66,158.74,45.42c0,0-44.08-2.65-89-29.7c-44.92-27.06-65.88-46.3-109.92-54.98C828.49,1082.28,814.03,1096.7,814.03,1096.7z',
];

export function LionMark({ variant = 'flat', size = 32, className = '', decorative = true }: Props) {
  const w = typeof size === 'number' ? `${size}px` : size;

  if (variant === 'ornamented') {
    // Gold-gradient over navy backing — used for the hero medallion.
    return (
      <svg
        viewBox={VIEW_BOX}
        style={{ width: w, height: w }}
        className={className}
        role={decorative ? 'presentation' : 'img'}
        aria-label={decorative ? undefined : 'LEON MARÉ'}
        aria-hidden={decorative || undefined}
      >
        <defs>
          <linearGradient id="lionGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8D29A" />
            <stop offset="45%" stopColor="#C9A24B" />
            <stop offset="100%" stopColor="#8C6A2A" />
          </linearGradient>
        </defs>
        <g fill="url(#lionGold)">
          {LION_PATHS.map((d, i) => <path key={i} d={d} />)}
        </g>
      </svg>
    );
  }

  // Default: single-colour, follows currentColor.
  return (
    <svg
      viewBox={VIEW_BOX}
      style={{ width: w, height: w }}
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'LEON MARÉ'}
      aria-hidden={decorative || undefined}
    >
      <g fill="currentColor">
        {LION_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

/**
 * Hero medallion — the lion sits inside a thin gold-ringed navy disc.
 * Looks like a fine-art enseigne or a coin. Used as the centrepiece
 * ornament above the hero headline.
 */
export function LionMedallion({ size = 80 }: { size?: number }) {
  const w = `${size}px`;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: w, height: w }}
    >
      {/* Outer navy disc with thin gold ring */}
      <div
        className="absolute inset-0 rounded-full bg-navy"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(201,162,75,0.35), 0 6px 22px rgba(10,26,58,0.25), 0 1px 2px rgba(0,0,0,0.08)',
        }}
        aria-hidden
      />
      {/* Inner gold hairline */}
      <div
        className="absolute inset-[6px] rounded-full"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(201,162,75,0.45)' }}
        aria-hidden
      />
      {/* Lion */}
      <LionMark variant="ornamented" size={size * 0.62} />
    </div>
  );
}
