/**
 * Post-build step: stamp the build timestamp into dist/sw.js so each
 * deploy gets a fresh cache name. Without this the Service Worker keeps
 * serving the old shell from CacheStorage and installed PWAs never see
 * new code until the user manually clears storage.
 *
 * Wired into the npm `build` script so it runs on every Vite production
 * build, including Cloudflare Pages auto-deploys from GitHub.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swPath = resolve(__dirname, '..', 'dist', 'sw.js');

const buildId = `${Date.now()}`;
const sw = await readFile(swPath, 'utf8');
if (!sw.includes('__BUILD_ID__')) {
  console.warn('stamp-sw: __BUILD_ID__ placeholder not found in dist/sw.js — skipping.');
  process.exit(0);
}
await writeFile(swPath, sw.replaceAll('__BUILD_ID__', buildId));
console.log(`stamp-sw: cache name = vozclara-shell-${buildId}`);
