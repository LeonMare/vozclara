import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../lib/i18n';
import {
  copyToClipboard,
  downloadFile,
  exportFilename,
  packToMarkdown,
  packToText,
  type ExportFormat,
} from '../lib/export';
import { activeView, type KnowledgePack } from '../lib/pack';
import { incrementAnkiExportCount } from '../lib/conversionTriggers';

interface Props {
  pack: KnowledgePack;
}

/**
 * Export-menu trigger for the Pack view header.
 *
 * Renders a small "Export" pill that opens a popover with three
 * actions:
 *   • Download as Markdown (.md)
 *   • Download as plain text (.txt)
 *   • Copy markdown to clipboard
 *
 * All paths are client-side: serialise the active translation via
 * lib/export, then Blob-download or write the system clipboard. No
 * worker call, no network. The exported file reflects whichever
 * language the user is currently reading.
 */
export function PackExport({ pack }: Props) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const labels = exportLabels(locale);

  // Click-outside + Escape close the menu.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }

  function handleDownload(format: ExportFormat) {
    const content = format === 'markdown' ? packToMarkdown(pack) : packToText(pack);
    const ext = format === 'markdown' ? 'md' : 'txt';
    const mime = format === 'markdown' ? 'text/markdown' : 'text/plain';
    downloadFile(exportFilename(pack, ext), content, mime);
    setOpen(false);
    flashToast(labels.downloaded);
  }

  async function handleCopy() {
    const ok = await copyToClipboard(packToMarkdown(pack));
    setOpen(false);
    flashToast(ok ? labels.copied : labels.copyFailed);
  }

  async function handleAnki() {
    setOpen(false);
    flashToast(labels.ankiPreparing);
    try {
      // Lazy-load: the .apkg generator pulls in sql.js (≈600 KB) and
      // jszip, so the cost is only paid when a user actually exports.
      const { packToAnkiDeck, ankiFilename } = await import('../lib/anki');
      const blob = await packToAnkiDeck(pack);
      if (!blob) {
        flashToast(labels.ankiEmpty);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ankiFilename(pack);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      // T5 trigger — count this Anki export. When the user opens
      // any pack page from this point on, the PackPage tail will
      // surface the "looks like serious study, Pro Plus removes
      // export-frequency limits" chip once the count hits 2.
      // Done client-side via localStorage so the counter survives
      // refreshes + works for anonymous users.
      incrementAnkiExportCount();
      flashToast(labels.downloaded);
    } catch (err) {
      console.warn('Anki export failed:', err);
      flashToast(labels.ankiFailed);
    }
  }

  const hasVocabulary = activeView(pack).vocabulary.length > 0;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-card border border-navy/15 bg-white px-2.5 py-1 font-sans text-[11px] uppercase tracking-widest text-graphit/70 transition hover:border-gold hover:text-navy"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 1.5v6m0 0L3.5 5M6 7.5l2.5-2.5M2 9.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        {labels.button}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={labels.button}
          className="absolute right-0 top-full z-30 mt-1.5 w-56 overflow-hidden rounded-card border border-navy/15 bg-white shadow-card"
        >
          <MenuItem
            label={labels.markdown}
            hint=".md"
            onClick={() => handleDownload('markdown')}
          />
          <MenuItem
            label={labels.text}
            hint=".txt"
            onClick={() => handleDownload('text')}
          />
          {hasVocabulary && (
            <>
              <div className="border-t border-navy/8" />
              <MenuItem
                label={labels.anki}
                hint=".apkg"
                onClick={handleAnki}
              />
            </>
          )}
          <div className="border-t border-navy/8" />
          <MenuItem
            label={labels.copy}
            hint="Markdown"
            onClick={handleCopy}
          />
        </div>
      )}

      {toast && (
        <span
          role="status"
          className="pointer-events-none absolute right-0 top-full z-40 mt-1.5 rounded-card border border-gold/40 bg-creme px-3 py-1.5 font-sans text-[11px] text-navy shadow-card"
        >
          {toast}
        </span>
      )}
    </div>
  );
}

function MenuItem({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left font-sans text-sm text-navy transition hover:bg-creme/60"
    >
      <span>{label}</span>
      {hint && <span className="font-sans text-[10px] uppercase tracking-widest text-graphit/65">{hint}</span>}
    </button>
  );
}

function exportLabels(locale: string) {
  if (locale.startsWith('es')) return {
    button: 'Exportar',
    markdown: 'Descargar como Markdown',
    text: 'Descargar como texto',
    anki: 'Mazo Anki (vocabulario)',
    copy: 'Copiar al portapapeles',
    downloaded: 'Archivo guardado',
    copied: 'Copiado al portapapeles',
    copyFailed: 'No se pudo copiar',
    ankiPreparing: 'Generando mazo Anki…',
    ankiEmpty: 'Este Pack no tiene vocabulario',
    ankiFailed: 'No se pudo generar el mazo',
  };
  if (locale.startsWith('pt')) return {
    button: 'Exportar',
    markdown: 'Descarregar como Markdown',
    text: 'Descarregar como texto',
    anki: 'Baralho Anki (vocabulário)',
    copy: 'Copiar para a área de transferência',
    downloaded: 'Ficheiro guardado',
    copied: 'Copiado',
    copyFailed: 'Não foi possível copiar',
    ankiPreparing: 'A gerar baralho Anki…',
    ankiEmpty: 'Este Pack não tem vocabulário',
    ankiFailed: 'Não foi possível gerar o baralho',
  };
  if (locale.startsWith('de')) return {
    button: 'Exportieren',
    markdown: 'Als Markdown herunterladen',
    text: 'Als Text herunterladen',
    anki: 'Anki-Deck (Vokabular)',
    copy: 'In die Zwischenablage kopieren',
    downloaded: 'Datei gespeichert',
    copied: 'In Zwischenablage kopiert',
    copyFailed: 'Kopieren fehlgeschlagen',
    ankiPreparing: 'Anki-Deck wird erstellt…',
    ankiEmpty: 'Dieses Pack hat kein Vokabular',
    ankiFailed: 'Deck konnte nicht erstellt werden',
  };
  return {
    button: 'Export',
    markdown: 'Download as Markdown',
    text: 'Download as plain text',
    anki: 'Anki deck (vocabulary)',
    copy: 'Copy to clipboard',
    downloaded: 'File saved',
    copied: 'Copied to clipboard',
    copyFailed: 'Copy failed',
    ankiPreparing: 'Building Anki deck…',
    ankiEmpty: 'This Pack has no vocabulary',
    ankiFailed: 'Could not build deck',
  };
}
