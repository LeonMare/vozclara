import { useState } from 'react';
import { useLocale } from '../lib/i18n';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

interface Props {
  ctaCopy: string;
  source: string;
  variant: 'featured' | 'default';
}

/**
 * Pro-tier waitlist CTA — replaces the alert("Apuntado!") placeholder
 * with a real e-mail capture that POSTs to /api/subscribe and stores
 * the address in KV under waitlist:<sha256>. Inline expand-on-click so
 * the pricing grid layout doesn't reflow until the user engages.
 */
export function WaitlistButton({ ctaCopy, source, variant }: Props) {
  const { locale } = useLocale();
  const t = waitlistLabels(locale);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle');
  const [error, setError] = useState<string | null>(null);

  const buttonClass =
    'mt-6 rounded-card py-2.5 font-sans text-sm font-medium transition ' +
    (variant === 'featured'
      ? 'bg-navy text-creme hover:bg-navy/90'
      : 'border border-navy/20 bg-white text-navy hover:border-gold');

  if (!open && status === 'idle') {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        {ctaCopy}
      </button>
    );
  }

  if (status === 'ok') {
    return (
      <div className="mt-6 rounded-card border border-emerald-300/50 bg-emerald-50/50 px-3 py-2.5 text-center font-sans text-sm text-emerald-700">
        ✓ {t.success}
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError(t.invalidEmail);
      return;
    }
    setStatus('busy');
    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale, source }),
      });
      if (!res.ok) {
        let body: { error?: string } = {};
        try { body = await res.json(); } catch { /* ignore */ }
        if (body.error === 'invalid_email') setError(t.invalidEmail);
        else if (body.error === 'rate_limited') setError(t.rateLimited);
        else setError(t.networkError);
        setStatus('err');
        return;
      }
      setStatus('ok');
    } catch {
      setError(t.networkError);
      setStatus('err');
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-2">
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.placeholder}
        disabled={status === 'busy'}
        className="rounded-card border border-navy/15 bg-white px-3 py-2 font-sans text-sm text-navy placeholder-graphit/40 outline-none focus:border-gold disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === 'busy'}
        className={buttonClass + ' !mt-0 disabled:opacity-50'}
      >
        {status === 'busy' ? t.sending : t.confirm}
      </button>
      {error && (
        <p role="alert" className="font-sans text-xs text-amber-700">
          {error}
        </p>
      )}
    </form>
  );
}

function waitlistLabels(locale: string) {
  if (locale.startsWith('es')) return {
    placeholder: 'tu@email.com',
    confirm: 'Apuntarme',
    sending: 'Enviando…',
    success: '¡Apuntado! Te avisamos cuando Pro esté listo.',
    invalidEmail: 'Email inválido.',
    rateLimited: 'Demasiados intentos. Vuelve a probar en un minuto.',
    networkError: 'No se pudo enviar. Inténtalo otra vez.',
  };
  if (locale.startsWith('pt')) return {
    placeholder: 'teu@email.com',
    confirm: 'Inscrever-me',
    sending: 'A enviar…',
    success: 'Inscrito! Avisamos-te quando o Pro estiver pronto.',
    invalidEmail: 'E-mail inválido.',
    rateLimited: 'Demasiadas tentativas. Tenta de novo num minuto.',
    networkError: 'Não foi possível enviar. Tenta de novo.',
  };
  if (locale.startsWith('de')) return {
    placeholder: 'deine@email.de',
    confirm: 'Auf Warteliste',
    sending: 'Sende…',
    success: 'Eingetragen! Wir melden uns wenn Pro startklar ist.',
    invalidEmail: 'Ungültige E-Mail.',
    rateLimited: 'Zu viele Versuche. In einer Minute nochmal.',
    networkError: 'Senden fehlgeschlagen. Versuch es nochmal.',
  };
  return {
    placeholder: 'you@email.com',
    confirm: 'Join waitlist',
    sending: 'Sending…',
    success: 'You\'re in! We\'ll mail you when Pro is ready.',
    invalidEmail: 'Invalid email.',
    rateLimited: 'Too many attempts. Try again in a minute.',
    networkError: 'Could not send. Please try again.',
  };
}
