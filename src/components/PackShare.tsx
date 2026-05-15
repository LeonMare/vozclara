import { useState } from 'react';
import { useLocale } from '../lib/i18n';
import { activeView, type KnowledgePack } from '../lib/pack';
import { copyToClipboard } from '../lib/export';

interface Props {
  pack: KnowledgePack;
}

/**
 * Share trigger for the Pack view header.
 *
 * Behaviour
 *   • Mobile (iOS/Android with Web Share API) → native share sheet
 *     with the pack title + short summary + deep-link URL.
 *   • Desktop / browsers without Web Share → falls back to copying
 *     that same share-text bundle to the clipboard.
 *
 * Why share both summary AND URL: user packs live in the recipient's
 * IndexedDB-or-nothing world, so a bare URL would 404 for them today
 * (no server-side store yet). Bundling the title + short summary in
 * the share-text means the recipient at least sees the substance even
 * if they can't open the link. Sample packs are public and work
 * either way.
 */
export function PackShare({ pack }: Props) {
  const { locale } = useLocale();
  const [toast, setToast] = useState<string | null>(null);
  const labels = shareLabels(locale);

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }

  async function handleShare() {
    const view = activeView(pack);
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/pack/${pack.id}`
      : `https://vozclara.pages.dev/pack/${pack.id}`;

    const text = view.summary.short
      ? `${pack.title}\n\n${view.summary.short}\n\n— ${labels.viaLine}`
      : `${pack.title}\n\n— ${labels.viaLine}`;

    const shareData = { title: pack.title, text, url };

    // Web Share API first — native sheet on iOS/Android.
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (!navigator.canShare || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return; // OS handles confirmation, no in-app toast needed
        }
      } catch (err) {
        // User cancelled (AbortError) → silently do nothing.
        // Any other error → fall through to clipboard.
        if ((err as DOMException)?.name === 'AbortError') return;
      }
    }

    // Fallback: copy the same text + URL to clipboard.
    const ok = await copyToClipboard(`${text}\n${url}`);
    flashToast(ok ? labels.copied : labels.copyFailed);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-card border border-navy/15 bg-white px-2.5 py-1 font-sans text-[11px] uppercase tracking-widest text-graphit/70 transition hover:border-gold hover:text-navy"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
          {/* iOS-style share arrow: rectangle base + arrow up out of it */}
          <path
            d="M6 1 L6 7 M6 1 L4 3 M6 1 L8 3 M2.5 5 V10 H9.5 V5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        {labels.button}
      </button>

      {toast && (
        <span
          role="status"
          className="pointer-events-none absolute right-0 top-full z-40 mt-1.5 whitespace-nowrap rounded-card border border-gold/40 bg-creme px-3 py-1.5 font-sans text-[11px] text-navy shadow-card"
        >
          {toast}
        </span>
      )}
    </div>
  );
}

function shareLabels(locale: string) {
  if (locale.startsWith('es')) return {
    button: 'Compartir',
    viaLine: 'guardado con Voz Clara',
    copied: 'Copiado al portapapeles',
    copyFailed: 'No se pudo copiar',
  };
  if (locale.startsWith('pt')) return {
    button: 'Partilhar',
    viaLine: 'guardado com Voz Clara',
    copied: 'Copiado',
    copyFailed: 'Não foi possível copiar',
  };
  if (locale.startsWith('de')) return {
    button: 'Teilen',
    viaLine: 'gespeichert mit Voz Clara',
    copied: 'In Zwischenablage kopiert',
    copyFailed: 'Kopieren fehlgeschlagen',
  };
  return {
    button: 'Share',
    viaLine: 'saved with Voz Clara',
    copied: 'Copied to clipboard',
    copyFailed: 'Copy failed',
  };
}
