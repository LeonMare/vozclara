/**
 * Small URL-safe ID generator. 12 chars from a 64-char alphabet gives
 * 2^72 entropy — plenty for pack IDs and brain IDs without pulling in
 * the full nanoid npm package (extra dep, slightly larger bundle).
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export function nanoid(size = 12): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    let out = '';
    for (let i = 0; i < size; i++) out += ALPHABET[bytes[i] & 63];
    return out;
  }
  // Fallback (Node-only, never hit in browser).
  let out = '';
  for (let i = 0; i < size; i++) out += ALPHABET[Math.floor(Math.random() * 64)];
  return out;
}
