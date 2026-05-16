/**
 * Web Push protocol implementation for Cloudflare Workers.
 *
 * Self-contained — no external dependencies. Uses Web Crypto for
 * ECDH key agreement, HKDF, ECDSA signing, and AES-128-GCM
 * encryption. Implements:
 *
 *   • RFC 8030 — Generic Event Delivery Using HTTP Push
 *   • RFC 8188 — Encrypted Content-Encoding (aes128gcm)
 *   • RFC 8291 — Message Encryption for Web Push
 *   • RFC 8292 — VAPID — Voluntary Application Server Identification
 *
 * The Workers runtime ships SubtleCrypto with all the primitives,
 * so this works in V8 isolates without any Node-only modules.
 *
 * Usage:
 *
 *   const result = await sendPush({
 *     subscription,
 *     payload: { title, body, ... },
 *     vapid: { publicKey, privateKey, subject },
 *     ttl: 86400,
 *   });
 *   if (result.status === 410) // subscription gone, delete from KV
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface VapidKeys {
  publicKey: string;   // base64url, raw 65-byte EC P-256 point
  privateKey: string;  // base64url, raw 32-byte scalar (JWK "d")
  subject: string;     // mailto: or https://
}

export interface SendPushOptions {
  subscription: PushSubscriptionData;
  payload: string | object;
  vapid: VapidKeys;
  ttl?: number;     // seconds, defaults 86400 (24h)
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  topic?: string;   // dedup key; UAs collapse to latest with same topic
}

export interface SendPushResult {
  status: number;
  statusText: string;
  endpoint: string;
  /** True when the subscription is gone — KV entry should be deleted. */
  gone: boolean;
}

/* ─── Public API ──────────────────────────────────────────────────── */

export async function sendPush(opts: SendPushOptions): Promise<SendPushResult> {
  const { subscription, vapid } = opts;
  const ttl = opts.ttl ?? 86400;

  const payloadBytes =
    typeof opts.payload === 'string'
      ? new TextEncoder().encode(opts.payload)
      : new TextEncoder().encode(JSON.stringify(opts.payload));

  const encrypted = await encryptPayload(payloadBytes, subscription);
  const auth = await vapidAuthHeader(new URL(subscription.endpoint).origin, vapid);

  const headers: Record<string, string> = {
    'Authorization': auth,
    'Content-Type': 'application/octet-stream',
    'Content-Encoding': 'aes128gcm',
    'TTL': String(ttl),
  };
  if (opts.urgency) headers['Urgency'] = opts.urgency;
  if (opts.topic) headers['Topic'] = opts.topic;

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers,
    body: encrypted,
  });

  return {
    status: res.status,
    statusText: res.statusText,
    endpoint: subscription.endpoint,
    // 404/410 = subscription expired; the spec also allows 410.
    gone: res.status === 404 || res.status === 410,
  };
}

/* ─── VAPID JWT (RFC 8292) ────────────────────────────────────────── */

async function vapidAuthHeader(audience: string, vapid: VapidKeys): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,  // 12 h — well under the 24 h spec ceiling
    sub: vapid.subject,
  };

  const signingInput =
    b64url(new TextEncoder().encode(JSON.stringify(header))) +
    '.' +
    b64url(new TextEncoder().encode(JSON.stringify(payload)));

  const privateKey = await importVapidPrivateKey(vapid);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signingInput),
  );
  const jwt = signingInput + '.' + b64url(new Uint8Array(signature));

  return `vapid t=${jwt}, k=${vapid.publicKey}`;
}

async function importVapidPrivateKey(vapid: VapidKeys): Promise<CryptoKey> {
  const pub = unb64url(vapid.publicKey);
  if (pub.length !== 65 || pub[0] !== 0x04) {
    throw new Error('vapid_public_key_invalid');
  }
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: b64url(pub.subarray(1, 33)),
    y: b64url(pub.subarray(33, 65)),
    d: vapid.privateKey,
  };
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
}

/* ─── Payload encryption (RFC 8291 + RFC 8188) ───────────────────── */

async function encryptPayload(
  plaintext: Uint8Array,
  sub: PushSubscriptionData,
): Promise<Uint8Array> {
  const uaPublic = unb64url(sub.keys.p256dh);
  if (uaPublic.length !== 65 || uaPublic[0] !== 0x04) {
    throw new Error('subscription_p256dh_invalid');
  }
  const authSecret = unb64url(sub.keys.auth);
  if (authSecret.length !== 16) {
    throw new Error('subscription_auth_invalid');
  }

  // Ephemeral application server key (AS = "as_unauth" in RFC 8291).
  const asKeyPair = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  )) as CryptoKeyPair;
  const asPublicRaw = new Uint8Array(
    (await crypto.subtle.exportKey('raw', asKeyPair.publicKey)) as ArrayBuffer,
  );

  // ECDH(as_priv, ua_pub) → 32-byte shared secret.
  const uaPubKey = await crypto.subtle.importKey(
    'raw',
    uaPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  // Workers' EcdhKeyDeriveParams type uses `$public` in current
  // @cloudflare/workers-types; the runtime accepts the standard
  // `public` field too.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: uaPubKey } as any,
    asKeyPair.privateKey,
    256,
  );
  const sharedSecret = new Uint8Array(sharedBits);

  // RFC 8291 §3.3 — derive IKM with WebPush-specific info string.
  const keyInfo = concat(
    new TextEncoder().encode('WebPush: info\0'),
    uaPublic,
    asPublicRaw,
  );
  const ikm = await hkdf(authSecret, sharedSecret, keyInfo, 32);

  // RFC 8188 §2.2 — derive CEK and nonce from PRK with salt.
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, new TextEncoder().encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, new TextEncoder().encode('Content-Encoding: nonce\0'), 12);

  // RFC 8188 §2 — record padded with 0x02 last-record marker.
  const padded = concat(plaintext, new Uint8Array([0x02]));

  const cekKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cekKey, padded),
  );

  // RFC 8188 §2.1 — record header: salt(16) + rs(4 BE) + idlen(1) + keyid.
  const header = new Uint8Array(16 + 4 + 1 + asPublicRaw.length);
  header.set(salt, 0);
  // rs = 4096 — well above our payload, fits in one record.
  header[16] = 0x00;
  header[17] = 0x00;
  header[18] = 0x10;
  header[19] = 0x00;
  header[20] = asPublicRaw.length;       // 0x41
  header.set(asPublicRaw, 21);

  return concat(header, ciphertext);
}

/* ─── HKDF (SHA-256) ──────────────────────────────────────────────── */

async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    baseKey,
    length * 8,
  );
  return new Uint8Array(bits);
}

/* ─── Base64URL helpers ───────────────────────────────────────────── */

export function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function unb64url(str: string): Uint8Array {
  const pad = (4 - (str.length % 4)) % 4;
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function concat(...parts: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const p of parts) len += p.length;
  const out = new Uint8Array(len);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}
