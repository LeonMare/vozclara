/**
 * Generate iOS PWA splash screens.
 *
 * Without these, an installed Voz Clara on iPhone shows a white flash
 * for ~1 s while React boots. With them, iOS shows a brand-coloured
 * splash that matches the app — feels native.
 *
 * Apple's `apple-touch-startup-image` mechanism requires exact-pixel
 * PNGs matched to each device's logical/physical resolution via a
 * media query. We ship 6 sizes covering iPhone SE through 15 Pro Max
 * — ~95 % of active iPhones in 2025-2026. Devices outside the list
 * get the closest match scaled by Safari (acceptable degradation).
 *
 * Design: navy background (#0A1A3A), lighthouse monogram in gold,
 * "VOZ · CLARA" wordmark beneath in creme. Minimal — splashes show
 * for under a second, art doesn't need to be busy.
 *
 * Run: node scripts/generate-splash.mjs
 */
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const PUBLIC = resolve(repoRoot, 'public');
const OUT_DIR = resolve(PUBLIC, 'splash');
await mkdir(OUT_DIR, { recursive: true });

// Pull the VozClara lighthouse mark SVG so splash & app icon agree
// visually. viewBox is 0 0 100 100; stroke-based design. The script
// recolours the strokes to gold at composite time.
const markSvg = await readFile(resolve(PUBLIC, 'voz-clara-mark.svg'), 'utf8');
const markInner = extractInnerSvg(markSvg);

const SIZES = [
  // iPhone 15 / 14 Pro Max
  { name: '1290x2796', w: 1290, h: 2796 },
  // iPhone 15 / 14 Pro
  { name: '1179x2556', w: 1179, h: 2556 },
  // iPhone 15 / 14 / 13 / 12, 13 Pro / 12 Pro
  { name: '1170x2532', w: 1170, h: 2532 },
  // iPhone X / XS / 11 Pro
  { name: '1125x2436', w: 1125, h: 2436 },
  // iPhone 11 / XR
  { name: '828x1792', w: 828, h: 1792 },
  // iPhone SE 2/3, 8, 7, 6s
  { name: '750x1334', w: 750, h: 1334 },
];

const NAVY = '#0A1A3A';
const GOLD = '#C9A24B';
const CREME = '#F7F3EC';

for (const { name, w, h } of SIZES) {
  const monogramSize = Math.round(Math.min(w, h) * 0.32);
  const monogramX = (w - monogramSize) / 2;
  const monogramY = (h - monogramSize) / 2 - Math.round(h * 0.06);

  const wordmarkY = monogramY + monogramSize + Math.round(h * 0.04);
  const wordmarkSize = Math.round(w * 0.052);
  const wordmarkTracking = (w * 0.025).toFixed(2);

  const ruleY = wordmarkY + wordmarkSize + Math.round(h * 0.018);
  const ruleHalf = Math.round(w * 0.04);

  // Mark is a stroke-based 100×100 SVG; recolour strokes to gold via
  // the parent <g style="color:…"> (the source uses currentColor).
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${NAVY}"/>
  <g transform="translate(${monogramX}, ${monogramY}) scale(${monogramSize / 100})" style="color:${GOLD}">
    ${markInner}
  </g>
  <text x="${w / 2}" y="${wordmarkY + wordmarkSize}" text-anchor="middle"
        font-family="Cinzel, 'Trajan Pro', Georgia, serif" font-weight="500"
        font-size="${wordmarkSize}" letter-spacing="${wordmarkTracking}"
        fill="${CREME}">VOZ · CLARA</text>
  <line x1="${w / 2 - ruleHalf}" y1="${ruleY}" x2="${w / 2 + ruleHalf}" y2="${ruleY}"
        stroke="${GOLD}" stroke-width="1.5"/>
</svg>`;

  const out = resolve(OUT_DIR, `${name}.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log(`splash: ${name} → public/splash/${name}.png`);
}

/**
 * Pull the inner content out of voz-clara-mark.svg so we can re-embed
 * it inside our composite. Strips the outer <svg>, <title>, <desc>;
 * keeps the path group intact. The source uses stroke="currentColor"
 * so colour is set by our parent <g style="color:…">.
 */
function extractInnerSvg(svg) {
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!innerMatch) throw new Error('voz-clara-mark.svg: malformed');
  // Drop <title> and <desc> — accessibility labels make no sense in a
  // raster splash.
  return innerMatch[1].replace(/<title[^>]*>[\s\S]*?<\/title>/g, '').replace(/<desc[^>]*>[\s\S]*?<\/desc>/g, '');
}
