import { useEffect, useState } from 'react';
import { useLocale } from '../lib/i18n';
import {
  fetchPushConfig,
  isPushEligible,
  loadPrefs,
  permissionState,
  sendTestPush,
  subscribePush,
  unsubscribePush,
} from '../lib/notifications';
import { getNextDueAt } from '../lib/srs';

/**
 * Daily-reminder toggle. Compact "card" suitable for end-of-session
 * placement on /review. Walks the user through the iOS reality
 * ("install first") and the permission-denied reality ("change in
 * browser settings"), and lets them pick a reminder hour.
 *
 * No-op when push is not eligible or the worker has push disabled —
 * renders nothing, so it's safe to drop into any view.
 */
export function NotificationToggle() {
  const { locale } = useLocale();
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(9);
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>('default');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const t = notifyLabels(locale);

  useEffect(() => {
    (async () => {
      if (!isPushEligible()) {
        setEligible(false);
        return;
      }
      const cfg = await fetchPushConfig();
      if (!cfg.available) {
        setEligible(false);
        return;
      }
      const prefs = loadPrefs();
      setEnabled(prefs.enabled);
      setHour(prefs.reminderHour);
      setPerm(permissionState());
      setEligible(true);
    })();
  }, []);

  if (eligible === null) return null;
  if (eligible === false) return null;

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }

  async function handleEnable() {
    setBusy(true);
    try {
      const nextDueAt = await getNextDueAt();
      await subscribePush({
        reminderHour: hour,
        locale: locale as 'es' | 'pt' | 'de' | 'en',
        nextDueAt: Number.isFinite(nextDueAt) ? nextDueAt : Date.now(),
      });
      setEnabled(true);
      setPerm('granted');
      flash(t.enabledToast);
    } catch (err) {
      const msg = String(err);
      if (msg.includes('permission_denied')) flash(t.permissionDenied);
      else if (msg.includes('push_unsupported')) flash(t.unsupported);
      else flash(t.failed);
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      await unsubscribePush();
      setEnabled(false);
      flash(t.disabledToast);
    } finally {
      setBusy(false);
    }
  }

  async function handleHourChange(next: number) {
    setHour(next);
    if (!enabled) return;
    // Re-subscribe to push the new hour to the worker.
    setBusy(true);
    try {
      const nextDueAt = await getNextDueAt();
      await subscribePush({
        reminderHour: next,
        locale: locale as 'es' | 'pt' | 'de' | 'en',
        nextDueAt: Number.isFinite(nextDueAt) ? nextDueAt : Date.now(),
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleTest() {
    setBusy(true);
    try {
      const r = await sendTestPush();
      flash(r.ok ? t.testSent : t.testFailed);
    } catch {
      flash(t.testFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-md rounded-card border border-navy/15 bg-white px-5 py-4 text-left">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-sans text-sm text-navy">{t.title}</p>
        {perm === 'denied' ? (
          <span className="font-sans text-[10px] uppercase tracking-widest text-red-700/70">
            {t.permissionDeniedShort}
          </span>
        ) : enabled ? (
          <span className="font-sans text-[10px] uppercase tracking-widest text-emerald-700/70">
            {t.onShort}
          </span>
        ) : (
          <span className="font-sans text-[10px] uppercase tracking-widest text-graphit/45">
            {t.offShort}
          </span>
        )}
      </div>

      <p className="mt-1 font-sans text-xs leading-relaxed text-graphit/60">{t.body}</p>

      <div className="mt-3 flex items-center gap-2">
        <label className="font-sans text-xs text-graphit/70">{t.atLabel}</label>
        <select
          value={hour}
          onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
          disabled={busy || perm === 'denied'}
          className="rounded-card border border-navy/15 bg-white px-2 py-1 font-sans text-sm text-navy disabled:opacity-50"
        >
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
          ))}
        </select>

        {enabled ? (
          <>
            <button
              type="button"
              onClick={handleTest}
              disabled={busy}
              className="rounded-card border border-navy/15 bg-white px-3 py-1 font-sans text-xs text-navy transition hover:border-gold disabled:opacity-50"
            >
              {t.test}
            </button>
            <button
              type="button"
              onClick={handleDisable}
              disabled={busy}
              className="ml-auto rounded-card border border-navy/15 bg-white px-3 py-1 font-sans text-xs text-graphit/65 transition hover:border-gold disabled:opacity-50"
            >
              {t.disable}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleEnable}
            disabled={busy || perm === 'denied'}
            className="ml-auto rounded-card bg-navy px-3 py-1 font-sans text-xs text-creme transition hover:bg-graphit disabled:opacity-50"
          >
            {t.enable}
          </button>
        )}
      </div>

      {toast && (
        <p role="status" className="mt-2 font-sans text-[11px] text-graphit/70">
          {toast}
        </p>
      )}
    </div>
  );
}

function notifyLabels(locale: string) {
  if (locale.startsWith('es')) return {
    title: 'Recordatorio diario',
    body: 'Recibe una notificación cuando tengas tarjetas para repasar.',
    atLabel: 'A las',
    enable: 'Activar',
    disable: 'Desactivar',
    test: 'Probar',
    onShort: 'ACTIVO',
    offShort: 'INACTIVO',
    permissionDeniedShort: 'BLOQUEADO',
    permissionDenied: 'Permiso bloqueado. Cámbialo en los ajustes del navegador.',
    enabledToast: 'Recordatorio activado. Recibirás un aviso diario.',
    disabledToast: 'Recordatorio desactivado.',
    testSent: 'Notificación de prueba enviada.',
    testFailed: 'No se pudo enviar la prueba.',
    unsupported: 'Tu navegador no admite notificaciones push. Instala la app para usarlas.',
    failed: 'No se pudo activar el recordatorio.',
  };
  if (locale.startsWith('pt')) return {
    title: 'Lembrete diário',
    body: 'Recebe uma notificação quando tens cartões para rever.',
    atLabel: 'Às',
    enable: 'Ativar',
    disable: 'Desativar',
    test: 'Testar',
    onShort: 'ATIVO',
    offShort: 'INATIVO',
    permissionDeniedShort: 'BLOQUEADO',
    permissionDenied: 'Permissão bloqueada. Muda nas definições do navegador.',
    enabledToast: 'Lembrete ativado. Receberás um aviso diário.',
    disabledToast: 'Lembrete desativado.',
    testSent: 'Notificação de teste enviada.',
    testFailed: 'Não foi possível enviar o teste.',
    unsupported: 'O teu navegador não suporta push. Instala a app para usar.',
    failed: 'Não foi possível ativar o lembrete.',
  };
  if (locale.startsWith('de')) return {
    title: 'Tägliche Erinnerung',
    body: 'Lass dich benachrichtigen wenn Karten zu wiederholen sind.',
    atLabel: 'Um',
    enable: 'Aktivieren',
    disable: 'Deaktivieren',
    test: 'Test',
    onShort: 'AKTIV',
    offShort: 'INAKTIV',
    permissionDeniedShort: 'BLOCKIERT',
    permissionDenied: 'Berechtigung blockiert. Ändere das in den Browser-Einstellungen.',
    enabledToast: 'Erinnerung aktiviert. Du bekommst täglich eine Benachrichtigung.',
    disabledToast: 'Erinnerung deaktiviert.',
    testSent: 'Test-Benachrichtigung gesendet.',
    testFailed: 'Test fehlgeschlagen.',
    unsupported: 'Dein Browser unterstützt keine Push-Notifications. Installiere die App dafür.',
    failed: 'Erinnerung konnte nicht aktiviert werden.',
  };
  return {
    title: 'Daily reminder',
    body: 'Get notified when cards are due for review.',
    atLabel: 'At',
    enable: 'Enable',
    disable: 'Disable',
    test: 'Test',
    onShort: 'ON',
    offShort: 'OFF',
    permissionDeniedShort: 'BLOCKED',
    permissionDenied: 'Permission blocked. Change it in your browser settings.',
    enabledToast: 'Reminder enabled. You will get a daily push.',
    disabledToast: 'Reminder disabled.',
    testSent: 'Test notification sent.',
    testFailed: 'Could not send test.',
    unsupported: 'Your browser does not support push. Install the app to use it.',
    failed: 'Could not enable reminder.',
  };
}
