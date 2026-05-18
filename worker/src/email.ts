/**
 * Email-sending via Resend HTTP API.
 *
 * Cloudflare Workers cannot open outbound SMTP connections, so we
 * call Resend's REST endpoint. Resend's free tier gives 3 000 emails
 * per month and 100 per day — comfortably above launch volume.
 *
 * Required environment variables (set via `wrangler secret put`):
 *   RESEND_API_KEY      — Bearer token from resend.com/api-keys
 *   AUTH_FROM_ADDRESS   — verified sender, e.g. "noreply@vozclara.app"
 *
 * If RESEND_API_KEY is missing the helper returns `{ ok: false,
 * reason: 'email_disabled' }` so the caller can keep working
 * (e.g. log the magic-link URL for local dev).
 */
export interface SendMailResult {
  ok: boolean;
  id?: string;
  reason?: string;
}

interface ResendEnv {
  RESEND_API_KEY?: string;
  AUTH_FROM_ADDRESS?: string;
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
/* Send from leonmare.de — the LEON MARÉ studio domain is already DNS-
   verified at Resend's free tier, so we don't burn the $20/mo Pro plan
   just to add a second verified domain. The user-visible "from name"
   stays "VozClara" so the inbox preview reads as expected; the trailing
   leonmare.de actually reinforces the "A LEON MARÉ product" footer.
   The replyTo points back to support@vozclara.app so any reply lands
   in the product mailbox, not the studio one. */
const DEFAULT_FROM = 'VozClara <noreply@leonmare.de>';
const DEFAULT_REPLY_TO = 'support@vozclara.app';

/**
 * Low-level send. Returns ok=false on transport errors but never
 * throws — the auth flow swallows email failures so a flaky provider
 * doesn't take down the login endpoint. Callers should still log.
 */
export async function sendMail(
  env: ResendEnv,
  payload: {
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
  },
): Promise<SendMailResult> {
  if (!env.RESEND_API_KEY) {
    return { ok: false, reason: 'email_disabled' };
  }

  const from = env.AUTH_FROM_ADDRESS ?? DEFAULT_FROM;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('resend_error:', res.status, detail.slice(0, 300));
      return { ok: false, reason: `resend_${res.status}` };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    console.error('resend_throw:', err);
    return { ok: false, reason: 'fetch_failed' };
  }
}

/* ─── Magic-link email template ──────────────────────────────────────── *
 *
 * Editorial tone matching the rest of the brand — no marketing
 * exclamation marks, no progress bars, no fake personalization. A
 * single sentence, a single button, a single security note. Plain-
 * text mirror for plain-text-only clients (some corporate inboxes
 * still strip HTML).
 */

interface MagicLinkLabels {
  subject: string;
  preheader: string;
  greeting: string;
  body: string;
  cta: string;
  fallback: string;
  expiry: string;
  ignore: string;
}

/**
 * Editorial-tone copy — short sentences, no exclamation marks, no
 * "tap the button to..." instructions. Trust the reader to know
 * what a button does. Brand voice over transactional voice.
 */
function magicLinkLabels(locale: string): MagicLinkLabels {
  if (locale.startsWith('es')) return {
    subject: 'Tu enlace a VozClara',
    preheader: 'Un clic abre tu biblioteca. Válido quince minutos.',
    greeting: 'Bienvenido.',
    body: 'Un clic abre tu VozClara — quince minutos de validez, después el enlace caduca en silencio.',
    cta: 'Abrir VozClara',
    fallback: 'Si el botón no responde, copia esta dirección en tu navegador:',
    expiry: 'Por seguridad, el enlace caduca en quince minutos.',
    ignore: '¿No lo has pedido? Ignora este correo. Sin el clic no se abre nada.',
  };
  if (locale.startsWith('pt')) return {
    subject: 'O teu link para a VozClara',
    preheader: 'Um clique abre a tua biblioteca. Válido quinze minutos.',
    greeting: 'Bem-vindo.',
    body: 'Um clique abre a tua VozClara — quinze minutos de validade, depois o link expira em silêncio.',
    cta: 'Abrir VozClara',
    fallback: 'Se o botão não responder, copia este endereço para o navegador:',
    expiry: 'Por segurança, o link expira em quinze minutos.',
    ignore: 'Não pediste isto? Ignora o email. Sem o clique, nada se abre.',
  };
  if (locale.startsWith('de')) return {
    subject: 'Dein Link zur VozClara',
    preheader: 'Ein Klick öffnet deine Bibliothek. Fünfzehn Minuten gültig.',
    greeting: 'Willkommen.',
    body: 'Ein Klick öffnet deine VozClara — fünfzehn Minuten lang gültig, danach erlischt der Link still.',
    cta: 'VozClara öffnen',
    fallback: 'Falls der Button still bleibt, kopiere diese Adresse in deinen Browser:',
    expiry: 'Aus Sicherheitsgründen läuft der Link in fünfzehn Minuten ab.',
    ignore: 'Nicht angefordert? Ignorier diese Mail. Ohne Klick öffnet sich nichts.',
  };
  return {
    subject: 'Your VozClara link',
    preheader: 'One click opens your library. Valid for fifteen minutes.',
    greeting: 'Welcome.',
    body: 'One click opens your VozClara — valid for fifteen minutes, then the link quietly expires.',
    cta: 'Open VozClara',
    fallback: 'If the button stays silent, paste this address into your browser:',
    expiry: 'For security, the link expires in fifteen minutes.',
    ignore: "Didn't ask for this? Ignore the email. Without the click, nothing opens.",
  };
}

/**
 * Render the brand-conform HTML magic-link email. Inline styles only
 * (no <style> tags) because every meaningful email client (Gmail,
 * Outlook, Apple Mail) sandboxes external CSS unreliably.
 *
 * Logo strategy — PNG over SVG. Gmail (web + Android) strips inline
 * SVG defensively, but renders external HTTPS PNGs reliably. The
 * 192×192 PWA icon is already on the production origin, so we
 * reference it absolutely. Displayed at 64×64 (retina-friendly).
 *
 * Typography — Georgia stack for serif (installed in 99%+ of mail
 * clients), Inter stack for sans (with system-font fallback). No
 * @font-face imports, those are stripped or unreliable in mail.
 */
function renderMagicLinkHTML(labels: MagicLinkLabels, link: string): string {
  // LEON MARÉ palette mirrored from tailwind.config.ts:
  //   navy   #0A1A3A   gold   #C9A24B   creme  #F7F3EC
  //   graphit #2A2F3A
  const PALETTE = {
    navy: '#0A1A3A',
    gold: '#C9A24B',
    creme: '#F7F3EC',
    graphit: '#2A2F3A',
  };

  // The 256×256 transparent navy lighthouse — same drawing as the
  // BrandMark component on the website, baked to PNG so Gmail and
  // Outlook can render it. Displayed at 88×88 (retina-friendly).
  // Generated by scripts/generate-brand-pngs.mjs.
  const LOGO_URL = 'https://vozclara.app/brand-mark-256.png';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(labels.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${PALETTE.creme};font-family:Georgia,'Times New Roman',serif;color:${PALETTE.graphit};">
    <!-- Preheader (hidden, but Gmail-preview pulls it) -->
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;visibility:hidden;mso-hide:all;">
      ${escapeHtml(labels.preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PALETTE.creme};">
      <tr>
        <td align="center" style="padding:56px 16px;">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;max-width:520px;width:100%;border:1px solid rgba(10,26,58,0.08);">

            <!-- Brand mark + wordmark — pure lighthouse seal on white,
                 mirroring the BrandMark component on vozclara.app -->
            <tr>
              <td style="padding:48px 36px 0;text-align:center;">
                <img src="${escapeAttr(LOGO_URL)}" width="88" height="88" alt="VozClara"
                     style="display:inline-block;width:88px;height:88px;border:0;outline:none;text-decoration:none;" />
                <div style="margin-top:20px;font-family:Georgia,serif;letter-spacing:0.22em;color:${PALETTE.navy};font-size:13px;">VOZ&nbsp;·&nbsp;CLARA</div>
                <div style="height:1px;width:36px;background:${PALETTE.gold};margin:14px auto 0;line-height:1px;font-size:1px;">&nbsp;</div>
              </td>
            </tr>

            <!-- Greeting + body -->
            <tr>
              <td style="padding:32px 44px 0;">
                <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.35;color:${PALETTE.navy};">${escapeHtml(labels.greeting)}</p>
                <p style="margin:0 0 32px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;color:${PALETTE.graphit};">${escapeHtml(labels.body)}</p>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:0 44px 32px;">
                <a href="${escapeAttr(link)}"
                   style="display:inline-block;background:${PALETTE.navy};color:${PALETTE.creme};text-decoration:none;padding:15px 32px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;letter-spacing:0.04em;border-radius:2px;">
                  ${escapeHtml(labels.cta)}
                </a>
              </td>
            </tr>

            <!-- Plain-URL fallback -->
            <tr>
              <td style="padding:0 44px 32px;">
                <p style="margin:0 0 8px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:rgba(42,47,58,0.6);">${escapeHtml(labels.fallback)}</p>
                <p style="margin:0;word-break:break-all;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;line-height:1.5;color:rgba(42,47,58,0.48);">${escapeHtml(link)}</p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 44px;">
                <div style="height:1px;background:rgba(10,26,58,0.08);line-height:1px;font-size:1px;">&nbsp;</div>
              </td>
            </tr>

            <!-- Security note -->
            <tr>
              <td style="padding:22px 44px 8px;">
                <p style="margin:0 0 8px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:rgba(42,47,58,0.6);">${escapeHtml(labels.expiry)}</p>
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13px;line-height:1.55;color:rgba(42,47,58,0.55);">${escapeHtml(labels.ignore)}</p>
              </td>
            </tr>

            <!-- Signature — "VozClara by LEON MARÉ" -->
            <tr>
              <td style="padding:32px 44px 40px;text-align:center;">
                <div style="height:1px;width:24px;background:${PALETTE.gold};margin:0 auto 18px;line-height:1px;font-size:1px;">&nbsp;</div>
                <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.3;color:${PALETTE.navy};letter-spacing:0.04em;">VozClara</p>
                <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(10,26,58,0.5);">by LEON MARÉ</p>
              </td>
            </tr>
          </table>

          <!-- Outside-card footer, very quiet -->
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
            <tr>
              <td style="padding:20px 12px 0;text-align:center;">
                <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.08em;color:rgba(42,47,58,0.4);">vozclara.app · Frankfurt</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderMagicLinkText(labels: MagicLinkLabels, link: string): string {
  return [
    labels.greeting,
    '',
    labels.body,
    '',
    link,
    '',
    labels.expiry,
    labels.ignore,
    '',
    '—',
    'VozClara',
    'by LEON MARÉ',
    'vozclara.app',
  ].join('\n');
}

/**
 * Send the magic-link email. Returns the underlying SendMailResult so
 * the caller can decide whether to surface a soft error to the user
 * (or, in dev, log the URL to the worker console).
 */
export async function sendMagicLink(
  env: ResendEnv,
  args: { to: string; link: string; locale: string },
): Promise<SendMailResult> {
  const labels = magicLinkLabels(args.locale);
  const html = renderMagicLinkHTML(labels, args.link);
  const text = renderMagicLinkText(labels, args.link);
  return sendMail(env, {
    to: args.to,
    subject: labels.subject,
    html,
    text,
    replyTo: DEFAULT_REPLY_TO,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return c;
    }
  });
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
