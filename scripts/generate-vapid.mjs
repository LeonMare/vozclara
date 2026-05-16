/**
 * Generate a VAPID keypair (P-256 ECDSA) for Web Push.
 *
 * Run once, store the output as Cloudflare Worker secrets:
 *
 *   node scripts/generate-vapid.mjs
 *   echo $PUB | npx wrangler secret put VAPID_PUBLIC_KEY  --cwd worker
 *   echo $PRIV | npx wrangler secret put VAPID_PRIVATE_KEY --cwd worker
 *
 * The public key also lives in the frontend bundle (VITE_VAPID_PUBLIC)
 * so the browser can subscribe. The private key never leaves the worker.
 */
import { webcrypto } from 'node:crypto';

const { publicKey, privateKey } = await webcrypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify'],
);

const pubRaw = await webcrypto.subtle.exportKey('raw', publicKey);
const privJwk = await webcrypto.subtle.exportKey('jwk', privateKey);

const pubB64 = base64urlFromBytes(new Uint8Array(pubRaw));
const privB64 = privJwk.d;  // already base64url

console.log('VAPID_PUBLIC_KEY  =', pubB64);
console.log('VAPID_PRIVATE_KEY =', privB64);

function base64urlFromBytes(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
