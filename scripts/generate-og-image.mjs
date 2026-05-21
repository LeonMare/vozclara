/**
 * Generate the Open-Graph + Twitter-Card share image for vozclara.app.
 *
 * Output: public/og-image.png · 1200×630 · PNG.
 *
 * Design v2 — refresh Do 21.5.2026 alongside the landing-copy polish
 * (#44 / commit 2797917). Two changes vs the v1 brand-identity card:
 *
 *   1. Eyebrow swap. v1 said "§ KNOWLEDGE · VIDEO · LEARNING" — generic
 *      category nouns. v2 says "MULTILINGUAL KNOWLEDGE FROM VIDEO" —
 *      a positioning line that tells a fresh visitor what we do in
 *      five words. Matches the new Hero eyebrow in src/lib/i18n.ts.
 *
 *   2. Concrete sub-claim added below the tagline. v1 was identity
 *      only (eyebrow + seal + wordmark + tagline + URL). v2 keeps all
 *      that and adds the asyndetic triple-list from the new heroSub
 *      ("the ideas, the vocabulary, the citations") in sans, creme
 *      at 78 % opacity — quieter than the tagline but visible enough
 *      to deliver the concrete promise the tagline alludes to.
 *
 *   3. Bottom strip joins languages + URL into one editorial baseline
 *      ("ES · PT · DE · EN · VOZCLARA.APP") — signals multilingual
 *      DNA without a dedicated row, and survives the WhatsApp /
 *      Square-crop centre safe area.
 *
 * Composition is centred — nothing within 80 px of an edge so the
 * crop-variants from different platforms (Twitter and Slack each
 * crop slightly differently, WhatsApp squares the centre) don't
 * slice off content.
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

/* 1200×630 — Facebook / LinkedIn / Twitter Summary Large standard.
   Centred editorial layout: every element sits in the inner 60 % of
   the canvas so square-crop platforms (WhatsApp) keep all six layers
   visible — eyebrow / rule / seal / wordmark / ornament / tagline /
   sub-claim / footer.

   Vertical rhythm targets a 60 px baseline above the seal, the seal
   centred at y=232, then 70-50 px gaps between successive type
   blocks down to the footer at y=595. */
const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="65%">
      <stop offset="0%" stop-color="${NAVY_LIGHT}" />
      <stop offset="100%" stop-color="${NAVY}" />
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
      <feColorMatrix values="0 0 0 0 0
                             0 0 0 0 0
                             0 0 0 0 0
                             0 0 0 0.05 0" />
    </filter>
  </defs>

  <!-- Navy radial background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <!-- Subtle paper-grain overlay — matches the .paper class on the
       site so the OG image feels printed, not screen-flat. The 0.05
       alpha is barely perceptible; just enough to break up the
       gradient banding. -->
  <rect width="1200" height="630" filter="url(#grain)" />

  <!-- Eyebrow: positioning line. Inter caps with wide letter-spacing
       so the five words read as a poster headline, not a tagline. -->
  <text x="600" y="100"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="18"
        font-weight="600"
        letter-spacing="6"
        fill="${GOLD}"
        text-anchor="middle"
        opacity="0.92">MULTILINGUAL KNOWLEDGE FROM VIDEO</text>

  <!-- Thin gold rule under eyebrow — visual equivalent of the
       hero's draw-rule line on the landing page. -->
  <rect x="580" y="118" width="40" height="1.5" fill="${GOLD}" opacity="0.7" />

  <!-- Lighthouse seal — scaled to 165 × 165 px (scale 1.65 of the
       100 × 100 source), centred at x=600 y=232. Smaller than v1's
       scale 2.0 to leave room for the new sub-claim below the
       tagline without crowding the wordmark. -->
  <g transform="translate(600, 232) scale(1.65)">
    ${LIGHTHOUSE_INNER}
  </g>

  <!-- Wordmark: VOZ · CLARA in classical caps. Letter-spacing
       matches the lockup in src/components/BrandMark.tsx. -->
  <text x="600" y="380"
        font-family="'Cinzel', 'Trajan Pro', 'Times New Roman', serif"
        font-size="58"
        font-weight="400"
        letter-spacing="20"
        fill="${GOLD}"
        text-anchor="middle">VOZ · CLARA</text>

  <!-- Gold diamond ornament rule — preserved from v1. -->
  <g transform="translate(600, 420)">
    <line x1="-80" y1="0" x2="-12" y2="0" stroke="${GOLD}" stroke-width="1.2" opacity="0.8" />
    <path d="M 0 -7 L 8 0 L 0 7 L -8 0 Z" fill="${GOLD}" />
    <line x1="12" y1="0" x2="80" y2="0" stroke="${GOLD}" stroke-width="1.2" opacity="0.8" />
  </g>

  <!-- Tagline · serif italic, centred · the editorial promise.
       Holds the line from v1; the words are the proven part of the
       landing's hero, no reason to change. -->
  <text x="600" y="475"
        font-family="Georgia, 'Cormorant Garamond', serif"
        font-size="34"
        font-style="italic"
        fill="${CREME}"
        text-anchor="middle">Stop losing what you watch.</text>

  <!-- Sub-claim · sans, smaller, creme at 78 % opacity. New in v2.
       Delivers the concrete promise the tagline alludes to — the
       asyndetic triple-list (ideas, vocabulary, citations) that the
       hero sub now uses on the landing. Sits quietly under the
       tagline; doesn't compete with the wordmark. -->
  <text x="600" y="520"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="18"
        font-weight="400"
        fill="${CREME}"
        text-anchor="middle"
        opacity="0.78">Save any video. Get back the ideas, the vocabulary, the citations.</text>

  <!-- Bottom strip · joins the four supported languages + URL into
       one editorial baseline. The languages signal multilingual DNA
       at a glance; the URL closes the card. Letter-spaced to match
       the eyebrow above so the composition reads as a framed poster
       (eyebrow top, footer bottom, type stack between). -->
  <text x="600" y="592"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="14"
        font-weight="500"
        letter-spacing="6"
        fill="${GOLD}"
        text-anchor="middle"
        opacity="0.85">ES · PT · DE · EN · VOZCLARA.APP</text>
</svg>`;

const out = resolve(PUBLIC, 'og-image.png');
await sharp(Buffer.from(OG_SVG), { density: 144 })
  // density:144 is 2× the SVG's intrinsic 72 DPI — enough super-
  // sampling for crisp anti-aliased type at 1× DPR, but well under
  // the 384 we used in v1 (which inflated the PNG to >5 MB because
  // the noise filter pegs the entropy budget). Resize the rasterised
  // 2400×1260 buffer back down to the spec'd 1200×630 with LANCZOS3
  // for the cleanest letterforms.
  .resize(1200, 630, { kernel: sharp.kernel.lanczos3 })
  .png({ compressionLevel: 9, palette: false })
  .toFile(out);

console.log(`✓ ${out.replace(repoRoot + '/', '')}`);
