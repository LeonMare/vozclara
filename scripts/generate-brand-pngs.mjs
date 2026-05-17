/**
 * Generate PNG versions of the Voz Clara brand mark.
 *
 * Why PNG and not SVG everywhere? Gmail (web + Android) and Outlook
 * defensively strip <svg> blocks and reject <img src="*.svg">. For
 * any context that travels through an email client we need raster.
 *
 * Output:
 *   public/brand-mark-256.png   — transparent navy lighthouse at 256×256
 *                                 (used in transactional emails, displayed
 *                                 at 96×96 retina-friendly)
 *   public/brand-mark-512.png   — same, 512×512 for higher-DPI surfaces
 *
 * The SVG source is duplicated inline here (not read from
 * public/voz-clara-mark.svg) so this script stays self-contained and
 * the source-of-truth lives next to the React component in
 * src/components/BrandMark.tsx — kept in sync by hand. If the
 * lighthouse drawing ever changes there, update the LIGHTHOUSE_SVG
 * constant below to match.
 *
 * Run: node scripts/generate-brand-pngs.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const PUBLIC = resolve(repoRoot, 'public');
await mkdir(PUBLIC, { recursive: true });

const NAVY = '#0A1A3A';

/**
 * The refined lighthouse seal — mirror of LighthouseMark() in
 * src/components/BrandMark.tsx. Strokes hard-coded to navy here
 * (no currentColor) because we're rendering for transparent output.
 */
const LIGHTHOUSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <g fill="none" stroke="${NAVY}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Double numismatic seal -->
    <circle cx="50" cy="50" r="44" stroke-width="2.2" />
    <circle cx="50" cy="50" r="40.7" stroke-width="1.6" />

    <!-- Beacon rays -->
    <path d="M50 16V26" stroke-width="1.7" />
    <path d="M33 25l10 6" stroke-width="1.4" />
    <path d="M67 25l-10 6" stroke-width="1.4" />
    <path d="M31 36l12-3" stroke-width="1.4" />
    <path d="M69 36l-12-3" stroke-width="1.4" />

    <!-- Lantern cap -->
    <path d="M46.5 30h7" stroke-width="1.4" />
    <path d="M47.8 25.6h4.4c.2 0 .5.2.5.5v1.3" stroke-width="1.4" />
    <path d="M44.4 31.2l5.6-4.1 5.6 4.1" stroke-width="1.6" />

    <!-- Galerie / balcony -->
    <path d="M45.6 31.4h8.8v5.7h-8.8z" stroke-width="1.4" />
    <path d="M47.3 31.4v5.7M50 31.4v5.7M52.7 31.4v5.7" stroke-width="1.05" />
    <path d="M43.8 37.1h12.4" stroke-width="1.7" />
    <path d="M44.7 39h10.6" stroke-width="1.15" />

    <!-- Tapered tower -->
    <path d="M45.3 39.1 42.3 73.7M54.7 39.1 57.7 73.7" stroke-width="1.6" />

    <!-- Mid-tower band -->
    <path d="M46.8 48h6.4" stroke-width="1.2" />

    <!-- Door / window -->
    <rect x="48.6" y="50.2" width="2.8" height="5.5" rx="0.2" stroke-width="1.35" />

    <!-- Base plinth -->
    <path d="M41.2 73.8h17.6" stroke-width="1.7" />

    <!-- Curved editorial horizon -->
    <path d="M24.6 79.4C33.7 73.8 43 72.2 50 72.2s16.3 1.6 25.4 7.2" stroke-width="1.8" />
  </g>
</svg>`;

async function renderSize(size) {
  const svgBuf = Buffer.from(LIGHTHOUSE_SVG.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`));
  const out = resolve(PUBLIC, `brand-mark-${size}.png`);
  await sharp(svgBuf, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ ${out.replace(repoRoot + '/', '')}`);
}

await renderSize(256);
await renderSize(512);
