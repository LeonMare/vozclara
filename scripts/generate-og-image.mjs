/**
 * Generate the Open-Graph + Twitter-Card share image for vozclara.app.
 *
 * Why this exists as a script: the previous og-image.png hard-coded a
 * formal-Sie DE tagline ("Speichern Sie das Video, nicht nur das Video")
 * AND truncated half its text behind the image edge. Both bugs would
 * have shipped to HN / Reddit / Twitter on launch day. Now the image is
 * generated from one editorial composition so it can be regenerated
 * whenever the brand voice shifts.
 *
 * Composition is centred — eyebrow + lighthouse seal + wordmark + gold
 * ornament rule + tagline + URL. Nothing on the edges means no truncation
 * regardless of how the social-preview crops it (Twitter and Slack each
 * crop slightly differently).
 *
 * Output: public/og-image.png · 1200×630 · PNG, ~50 KB.
 *
 * Run: node scripts/generate-og-image.mjs
 */
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const PUBLIC = resolve(repoRoot, 'public');

const NAVY = '#0A1A3A';
const NAVY_LIGHT = '#142545';  // subtle radial highlight, paper-like
const GOLD = '#C9A24B';
const CREME = '#F7F3EC';

/* Lighthouse strokes — mirror of LighthouseMark() in BrandMark.tsx.
   Same source as generate-brand-pngs.mjs but stroked in gold instead
   of navy because the OG image places it on a navy background. */
const LIGHTHOUSE_INNER = `
  <g fill="none" stroke="${GOLD}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-50, -50)">
    <circle cx="50" cy="50" r="44" stroke-width="2.2" />
    <circle cx="50" cy="50" r="40.7" stroke-width="1.6" />
    <path d="M50 16V26" stroke-width="1.7" />
    <path d="M33 25l10 6" stroke-width="1.4" />
    <path d="M67 25l-10 6" stroke-width="1.4" />
    <path d="M31 36l12-3" stroke-width="1.4" />
    <path d="M69 36l-12-3" stroke-width="1.4" />
    <path d="M46.5 30h7" stroke-width="1.4" />
    <path d="M47.8 25.6h4.4c.2 0 .5.2.5.5v1.3" stroke-width="1.4" />
    <path d="M44.4 31.2l5.6-4.1 5.6 4.1" stroke-width="1.6" />
    <path d="M45.6 31.4h8.8v5.7h-8.8z" stroke-width="1.4" />
    <path d="M47.3 31.4v5.7M50 31.4v5.7M52.7 31.4v5.7" stroke-width="1.05" />
    <path d="M43.8 37.1h12.4" stroke-width="1.7" />
    <path d="M44.7 39h10.6" stroke-width="1.15" />
    <path d="M45.3 39.1 42.3 73.7M54.7 39.1 57.7 73.7" stroke-width="1.6" />
    <path d="M46.8 48h6.4" stroke-width="1.2" />
    <rect x="48.6" y="50.2" width="2.8" height="5.5" rx="0.2" stroke-width="1.35" />
    <path d="M41.2 73.8h17.6" stroke-width="1.7" />
    <path d="M24.6 79.4C33.7 73.8 43 72.2 50 72.2s16.3 1.6 25.4 7.2" stroke-width="1.8" />
  </g>
`;

/* 1200×630 — Facebook/LinkedIn/Twitter Summary Large standard.
   Centered editorial layout: nothing within 80 px of an edge so the
   crop-variants from different platforms don't slice off content. */
const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="65%">
      <stop offset="0%" stop-color="${NAVY_LIGHT}" />
      <stop offset="100%" stop-color="${NAVY}" />
    </radialGradient>
  </defs>

  <!-- Navy paper-like background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Eyebrow: § KNOWLEDGE · VIDEO · LEARNING -->
  <text x="600" y="105"
        font-family="Georgia, 'Cormorant Garamond', serif"
        font-size="20"
        font-style="italic"
        letter-spacing="6"
        fill="${GOLD}"
        text-anchor="middle"
        opacity="0.85">§ KNOWLEDGE · VIDEO · LEARNING</text>

  <!-- Thin gold rule under eyebrow -->
  <rect x="580" y="125" width="40" height="1.5" fill="${GOLD}" opacity="0.7" />

  <!-- Lighthouse seal, scaled to 200×200 px, centred -->
  <g transform="translate(600, 250) scale(2.0)">
    ${LIGHTHOUSE_INNER}
  </g>

  <!-- Wordmark: VOZ · CLARA in classical caps -->
  <text x="600" y="425"
        font-family="'Cinzel', 'Trajan Pro', 'Times New Roman', serif"
        font-size="68"
        font-weight="400"
        letter-spacing="22"
        fill="${GOLD}"
        text-anchor="middle">VOZ · CLARA</text>

  <!-- Gold diamond ornament rule -->
  <g transform="translate(600, 470)">
    <line x1="-90" y1="0" x2="-12" y2="0" stroke="${GOLD}" stroke-width="1.2" opacity="0.8" />
    <path d="M 0 -7 L 8 0 L 0 7 L -8 0 Z" fill="${GOLD}" />
    <line x1="12" y1="0" x2="90" y2="0" stroke="${GOLD}" stroke-width="1.2" opacity="0.8" />
  </g>

  <!-- Tagline · serif italic, centred · the single editorial promise -->
  <text x="600" y="535"
        font-family="Georgia, 'Cormorant Garamond', serif"
        font-size="38"
        font-style="italic"
        fill="${CREME}"
        text-anchor="middle">Stop losing what you watch.</text>

  <!-- Domain footer -->
  <text x="600" y="595"
        font-family="Georgia, 'Cormorant Garamond', serif"
        font-size="15"
        letter-spacing="8"
        fill="${GOLD}"
        text-anchor="middle"
        opacity="0.75">VOZCLARA.APP</text>
</svg>`;

const out = resolve(PUBLIC, 'og-image.png');
await sharp(Buffer.from(OG_SVG), { density: 384 })
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(`✓ ${out.replace(repoRoot + '/', '')}`);
