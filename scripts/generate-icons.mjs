/**
 * Generate the PNG icon set for PWA install + iOS home-screen.
 *
 * The full LEON MARÉ logo (Lion + wave + wordmark) doesn't read at icon
 * sizes — letters become illegible specks. The Brand Foundation v5
 * Kapitel 16 explicitly approves a Monogramm variant: "nur Löwe". We crop
 * the upper portion of the primary logo (Lion + wave swoosh) and center
 * it on Navy.
 *
 * Maskable icons get extra padding for Android adaptive-icon safe zones.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const SOURCE = 'C:\\Users\\User\\Downloads\\leonmare-brand\\logos\\logo-4.png';
const OUT = resolve(repoRoot, 'public');

await mkdir(OUT, { recursive: true });

const NAVY = { r: 10, g: 26, b: 58, alpha: 1 }; // #0A1A3A

// Source is 836×638. The Lion+wave element occupies the upper ~480 px;
// "LEON MARÉ" wordmark sits in the bottom ~150 px. Crop to the top so the
// icon is dominated by the lion at every size.
const meta = await sharp(SOURCE).metadata();
const cropHeight = Math.round(meta.height * 0.74); // keep lion + wave, drop wordmark
const monogram = await sharp(SOURCE)
  .extract({ left: 0, top: 0, width: meta.width, height: cropHeight })
  .toBuffer();

async function emit(name, size, { paddingRatio = 0.12 } = {}) {
  const file = resolve(OUT, name);
  // Inner content area shrinks by paddingRatio on all sides so the icon
  // breathes inside platform crop circles.
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const padding = Math.round((size - inner) / 2);
  const logo = await sharp(monogram)
    .resize(inner, inner, { fit: 'inside' })
    .toBuffer();
  const composed = await sharp({
    create: { width: size, height: size, channels: 4, background: NAVY },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
  // Manually re-center if the inner is portrait-ish (sharp's gravity:center
  // works on our canvas; the .resize fit:'inside' preserves aspect so the
  // logo may be smaller than `inner` in one dimension — gravity handles it).
  await sharp(composed).toFile(file);
  console.log(`✓ ${name} (${size}×${size})`);
}

await emit('icon-192.png', 192, { paddingRatio: 0.1 });
await emit('icon-512.png', 512, { paddingRatio: 0.1 });

// Maskable: bigger safe zone since Android crops aggressively.
await emit('icon-512-maskable.png', 512, { paddingRatio: 0.18 });

// iOS home-screen icon. iOS does NOT mask, so use the smaller padding for
// a tight crop that fills the icon nicely.
await emit('apple-touch-icon.png', 180, { paddingRatio: 0.08 });

await emit('favicon-32.png', 32, { paddingRatio: 0.05 });
await emit('favicon-16.png', 16, { paddingRatio: 0.05 });

console.log('\nIcons written to', OUT);
