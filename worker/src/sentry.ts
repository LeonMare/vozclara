/**
 * Minimal Sentry envelope POST for Cloudflare Workers.
 *
 * Why not @sentry/cloudflare? Bundle weight + opinionated wiring we
 * don't need. Sentry's envelope API is plain HTTPS POST — ~80 lines
 * of TypeScript gets us the 90 % that matters: caught errors land in
 * the same Sentry project as the frontend, tagged environment=worker.
 *
 * Activate by setting SENTRY_DSN as a wrangler secret:
 *   echo "<dsn>" | wrangler secret put SENTRY_DSN
 *
 * Absent secret = silent no-op.
 */

export interface WorkerSentryEnv {
  SENTRY_DSN?: string;
}

interface ParsedDsn {
  ingestUrl: string;
  publicKey: string;
}

let cachedDsn: ParsedDsn | null = null;
let cachedDsnSource: string | null = null;

function parseDsn(dsn: string): ParsedDsn | null {
  if (cachedDsnSource === dsn && cachedDsn) return cachedDsn;
  try {
    // DSN: https://<publicKey>@o<org>.ingest.<region>.sentry.io/<projectId>
    const u = new URL(dsn);
    const publicKey = u.username;
    const projectId = u.pathname.replace(/^\//, '');
    if (!publicKey || !projectId) return null;
    const ingestUrl = `${u.protocol}//${u.host}/api/${projectId}/envelope/`;
    const parsed: ParsedDsn = { ingestUrl, publicKey };
    cachedDsn = parsed;
    cachedDsnSource = dsn;
    return parsed;
  } catch {
    return null;
  }
}

function uuid4(): string {
  const a = crypto.getRandomValues(new Uint8Array(16));
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

interface CaptureContext {
  url?: string;
  method?: string;
  ip?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

/**
 * Fire-and-forget — never blocks the request. Caller is expected to
 * wrap the call site in ctx.waitUntil() so the worker doesn't return
 * before the envelope is sent.
 */
export async function captureWorkerError(
  env: WorkerSentryEnv,
  error: unknown,
  context: CaptureContext = {},
): Promise<void> {
  const dsn = env.SENTRY_DSN;
  if (!dsn) return;
  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const eventId = uuid4();
  const now = new Date().toISOString();
  const err = error instanceof Error ? error : new Error(String(error));

  const event = {
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: 'javascript',
    level: 'error',
    environment: 'worker',
    server_name: 'vozclara-transcript',
    request: context.url
      ? {
          url: context.url,
          method: context.method,
          headers: context.ip ? { 'cf-connecting-ip': context.ip } : undefined,
        }
      : undefined,
    tags: { ...(context.tags ?? {}) },
    extra: context.extra,
    exception: {
      values: [
        {
          type: err.name,
          value: err.message,
          stacktrace: err.stack
            ? {
                frames: parseStack(err.stack),
              }
            : undefined,
        },
      ],
    },
  };

  const body =
    JSON.stringify({ event_id: eventId, sent_at: now }) +
    '\n' +
    JSON.stringify({ type: 'event' }) +
    '\n' +
    JSON.stringify(event);

  try {
    await fetch(parsed.ingestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=vozclara-worker/0.1.0, sentry_key=${parsed.publicKey}`,
      },
      body,
    });
  } catch {
    // Sentry ingest unreachable — never crash the worker over telemetry.
  }
}

function parseStack(stack: string): Array<{ filename?: string; function?: string; lineno?: number; colno?: number }> {
  return stack
    .split('\n')
    .slice(0, 20)
    .map((line) => {
      const m = line.match(/at\s+(?:(\S+)\s+\()?(.+?):(\d+):(\d+)\)?$/);
      if (!m) return null;
      const [, fn, filename, lineno, colno] = m;
      return {
        filename,
        function: fn,
        lineno: parseInt(lineno, 10),
        colno: parseInt(colno, 10),
      };
    })
    .filter(<T>(f: T): f is NonNullable<T> => !!f)
    .reverse();  // Sentry expects oldest-first
}
