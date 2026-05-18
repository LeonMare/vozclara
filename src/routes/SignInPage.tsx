import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { BrandMark } from '../components/BrandMark';
import { usePageHead } from '../hooks/usePageHead';
import { requestMagicLink, AuthError } from '../lib/auth';
import { getBrainId } from '../lib/pack';

/**
 * /signin — single-field magic-link sign-in.
 *
 * Editorial layout matching AboutPage / PrivacyPage:
 *   • § eyebrow, gold hairline, serif heading
 *   • One email field, one button, one fallback note
 *   • After submit, the form swaps to a "check your inbox" state
 *
 * Error handling — when the worker's verify endpoint rejects a magic
 * token it 302s the user to /signin#error=<code>. We read the hash on
 * mount and surface a friendly message above the form.
 *
 * Anonymous brainId — passed in the request so the worker can attach
 * it to the user record on first sign-in. That preserves the user's
 * existing IndexedDB library when the future sync layer adopts it.
 *
 * `next` query param — when something deep-linked here (e.g. a
 * "Sign in to access X" CTA), we propagate it as the redirectPath so
 * the user lands back where they were trying to go.
 */
export function SignInPage() {
  const { locale } = useLocale();
  const labels = signInLabels(locale);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectPath = useMemo(() => sanitizePath(searchParams.get('next')), [searchParams]);

  usePageHead({ title: labels.headTitle, description: labels.headDescription });

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashError, setHashError] = useState<string | null>(null);

  // Read #error=<code> coming back from /api/auth/verify rejections.
  useEffect(() => {
    if (!location.hash) return;
    const params = new URLSearchParams(location.hash.slice(1));
    const code = params.get('error');
    if (code === 'expired') setHashError(labels.errExpired);
    else if (code === 'missing_token') setHashError(labels.errMissingToken);
  }, [location.hash, labels.errExpired, labels.errMissingToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setHashError(null);
    setSubmitting(true);
    try {
      await requestMagicLink({
        email,
        lang: locale,
        brainId: getBrainId(),
        redirectPath,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 'invalid_email') setError(labels.errInvalidEmail);
        else if (err.code === 'rate_limited') setError(labels.errRateLimited);
        else if (err.code === 'disabled') setError(labels.errDisabled);
        else setError(labels.errNetwork);
      } else {
        setError(labels.errNetwork);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main" className="bg-creme paper min-h-screen">
      <div className="mx-auto max-w-md px-5 pt-6 sm:px-8 sm:pt-8">
        <Link
          to="/"
          className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
        >
          ← {labels.backHome}
        </Link>
      </div>

      <section className="mx-auto max-w-md px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
        {/* Editorial header — brand seal + eyebrow + heading */}
        <div className="text-center">
          <BrandMark variant="monogram" size="lg" tone="navy" decorative />
          <div className="mt-6 font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.eyebrow}
          </div>
          <h1 className="mt-4 font-serif text-3xl leading-[1.1] text-navy sm:text-4xl">
            {labels.heading}
          </h1>
          <div className="mx-auto mt-5 h-px w-12 bg-gold" aria-hidden />
        </div>

        {sent ? (
          <SentState labels={labels} email={email} />
        ) : (
          <>
            <p className="mt-7 font-serif text-lg leading-relaxed text-graphit/80 sm:text-xl">
              {labels.lead}
            </p>

            {(hashError ?? error) && (
              <div
                role="alert"
                className="mt-5 rounded-card border border-rose-300/60 bg-rose-50/80 px-4 py-3 font-sans text-sm leading-relaxed text-rose-900"
              >
                {hashError ?? error}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-8 space-y-3">
              <label htmlFor="email" className="sr-only">
                {labels.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                inputMode="email"
                autoComplete="email"
                placeholder={labels.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="w-full rounded-card border border-navy/15 bg-white px-4 py-3 font-sans text-base text-graphit placeholder:text-graphit/65 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting || email.length === 0}
                className="w-full rounded-card bg-navy px-5 py-3 font-sans text-sm font-medium tracking-wide text-creme transition hover:bg-navy/90 disabled:opacity-60"
              >
                {submitting ? labels.sending : labels.send}
              </button>
            </form>

            <p className="mt-8 font-sans text-xs leading-relaxed text-graphit/65">
              {labels.privacyNote}{' '}
              <Link to="/privacy" className="underline-offset-4 hover:text-navy hover:underline">
                {labels.privacyLink}
              </Link>
              .
            </p>
          </>
        )}
      </section>
    </main>
  );
}

function SentState({ labels, email }: { labels: SignInLabels; email: string }) {
  return (
    <div className="mt-8">
      <div className="rounded-card border border-navy/10 bg-white p-6 sm:p-8">
        <p className="font-serif text-lg leading-relaxed text-navy sm:text-xl">
          {labels.sentLead}
        </p>
        <p className="mt-3 font-sans text-sm break-all text-graphit/70">
          <span className="text-graphit/65">→ </span>
          {email}
        </p>
        <div className="mt-6 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-6 font-sans text-sm leading-relaxed text-graphit/70">
          {labels.sentExpiry}
        </p>
        <p className="mt-3 font-sans text-sm italic leading-relaxed text-graphit/60">
          {labels.sentSpam}
        </p>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function sanitizePath(input: string | null): string {
  if (!input) return '/library';
  // Same-origin paths only — don't let the URL crowbar an attacker
  // redirect after sign-in.
  if (!input.startsWith('/') || input.startsWith('//')) return '/library';
  return input;
}

/* ─── Localised copy ─────────────────────────────────────────────── */

interface SignInLabels {
  headTitle: string;
  headDescription: string;
  backHome: string;
  eyebrow: string;
  heading: string;
  lead: string;
  emailLabel: string;
  emailPlaceholder: string;
  send: string;
  sending: string;
  privacyNote: string;
  privacyLink: string;
  sentLead: string;
  sentExpiry: string;
  sentSpam: string;
  errInvalidEmail: string;
  errRateLimited: string;
  errDisabled: string;
  errNetwork: string;
  errExpired: string;
  errMissingToken: string;
}

function signInLabels(locale: string): SignInLabels {
  if (locale.startsWith('es')) return {
    headTitle: 'Entrar — VozClara',
    headDescription: 'Un enlace de un solo uso, válido quince minutos. Sin contraseña.',
    backHome: 'Volver',
    eyebrow: 'Acceso',
    heading: 'Bienvenido.',
    lead: 'Escribe tu correo y recibirás un enlace para entrar. Sin contraseña, sin formularios largos — quince minutos de validez.',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.com',
    send: 'Enviar enlace',
    sending: 'Enviando…',
    privacyNote: 'Solo usamos tu correo para iniciar sesión.',
    privacyLink: 'Privacidad',
    sentLead: 'Listo — revisa tu bandeja.',
    sentExpiry: 'El enlace caduca en quince minutos y solo funciona una vez.',
    sentSpam: '¿No lo ves? Mira en Spam o Promociones — la primera vez Gmail a veces lo filtra.',
    errInvalidEmail: 'Correo no válido. Comprueba que esté bien escrito.',
    errRateLimited: 'Demasiados intentos. Espera un momento y vuelve a probar.',
    errDisabled: 'El acceso está temporalmente desactivado. Inténtalo más tarde.',
    errNetwork: 'No hemos podido enviar el enlace. Comprueba tu conexión.',
    errExpired: 'El enlace ha caducado. Pide uno nuevo aquí abajo.',
    errMissingToken: 'Enlace incompleto. Pide uno nuevo aquí abajo.',
  };
  if (locale.startsWith('pt')) return {
    headTitle: 'Entrar — VozClara',
    headDescription: 'Um link de uso único, válido quinze minutos. Sem palavra-passe.',
    backHome: 'Voltar',
    eyebrow: 'Acesso',
    heading: 'Bem-vindo.',
    lead: 'Escreve o teu email e recebes um link para entrar. Sem palavra-passe, sem formulários longos — quinze minutos de validade.',
    emailLabel: 'Email',
    emailPlaceholder: 'teu@email.com',
    send: 'Enviar link',
    sending: 'A enviar…',
    privacyNote: 'Usamos o teu email apenas para iniciar sessão.',
    privacyLink: 'Privacidade',
    sentLead: 'Pronto — verifica a tua caixa.',
    sentExpiry: 'O link expira em quinze minutos e só funciona uma vez.',
    sentSpam: 'Não o vês? Olha em Spam ou Promoções — da primeira vez o Gmail por vezes filtra.',
    errInvalidEmail: 'Email inválido. Confere se está bem escrito.',
    errRateLimited: 'Demasiadas tentativas. Espera um momento e tenta novamente.',
    errDisabled: 'O acesso está temporariamente desativado. Tenta mais tarde.',
    errNetwork: 'Não conseguimos enviar o link. Verifica a tua ligação.',
    errExpired: 'O link expirou. Pede um novo aqui em baixo.',
    errMissingToken: 'Link incompleto. Pede um novo aqui em baixo.',
  };
  if (locale.startsWith('de')) return {
    headTitle: 'Anmelden — VozClara',
    headDescription: 'Ein Einmal-Link, fünfzehn Minuten gültig. Kein Passwort.',
    backHome: 'Zurück',
    eyebrow: 'Anmeldung',
    heading: 'Willkommen.',
    lead: 'Tippe deine E-Mail ein und du bekommst einen Link zum Einloggen. Kein Passwort, keine langen Formulare — fünfzehn Minuten gültig.',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'deine@email.de',
    send: 'Link senden',
    sending: 'Wird gesendet…',
    privacyNote: 'Wir verwenden deine E-Mail ausschließlich zum Anmelden.',
    privacyLink: 'Datenschutz',
    sentLead: 'Erledigt — schau in deinen Posteingang.',
    sentExpiry: 'Der Link läuft in fünfzehn Minuten ab und funktioniert nur einmal.',
    sentSpam: 'Nicht zu sehen? Schau in Spam oder Werbung — Gmail filtert die erste Mail manchmal.',
    errInvalidEmail: 'E-Mail ungültig. Prüfe die Schreibweise.',
    errRateLimited: 'Zu viele Versuche. Warte einen Moment und probier es erneut.',
    errDisabled: 'Anmeldung ist vorübergehend deaktiviert. Versuche es später.',
    errNetwork: 'Wir konnten den Link nicht senden. Prüfe deine Verbindung.',
    errExpired: 'Der Link ist abgelaufen. Fordere unten einen neuen an.',
    errMissingToken: 'Link unvollständig. Fordere unten einen neuen an.',
  };
  return {
    headTitle: 'Sign in — VozClara',
    headDescription: 'One single-use link, valid for fifteen minutes. No password.',
    backHome: 'Back',
    eyebrow: 'Sign in',
    heading: 'Welcome.',
    lead: 'Type your email and you get a link to sign in. No password, no long forms — valid for fifteen minutes.',
    emailLabel: 'Email',
    emailPlaceholder: 'you@email.com',
    send: 'Send link',
    sending: 'Sending…',
    privacyNote: 'We use your email only to sign you in.',
    privacyLink: 'Privacy',
    sentLead: 'Done — check your inbox.',
    sentExpiry: 'The link expires in fifteen minutes and only works once.',
    sentSpam: "Don't see it? Check Spam or Promotions — Gmail sometimes filters the first one.",
    errInvalidEmail: 'Invalid email. Check the spelling.',
    errRateLimited: 'Too many attempts. Wait a moment and try again.',
    errDisabled: 'Sign-in is temporarily disabled. Try later.',
    errNetwork: "We couldn't send the link. Check your connection.",
    errExpired: 'Link expired. Request a new one below.',
    errMissingToken: 'Link incomplete. Request a new one below.',
  };
}
