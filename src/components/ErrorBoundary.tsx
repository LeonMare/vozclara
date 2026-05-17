import { Component, type ReactNode } from 'react';
import { useLocale } from '../lib/i18n';

/**
 * Top-level error boundary. Without this, an uncaught render error
 * blanks the whole document — the user sees a white screen and we
 * never know it happened. With this, we show a brand-coloured
 * fallback with a reload action, log the error to console, and (if
 * configured) ship it to Sentry via the global hook below.
 *
 * Per React's API the boundary itself has to be a class component;
 * the rendered fallback is a separate function so it can subscribe
 * to the i18n locale.
 */
interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }): void {
    // Always console-log so we see it in dev + via remote-log relays.
    console.error('[VozClara] Uncaught render error:', error, info.componentStack);
    // Hand off to Sentry / generic error reporter if one was wired
    // onto window.__VOZCLARA_ERROR_HOOK before mount.
    const hook = (window as unknown as { __VOZCLARA_ERROR_HOOK?: (e: Error, info: unknown) => void }).__VOZCLARA_ERROR_HOOK;
    hook?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const { locale } = useLocale();
  const t = fallbackLabels(locale);

  return (
    <main className="bg-creme paper min-h-screen">
      <div className="mx-auto max-w-xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
        <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
          {t.eyebrow}
        </p>
        <h1 className="mt-6 font-serif text-3xl text-navy sm:text-4xl">
          {t.title}
        </h1>
        <div className="mx-auto mt-5 h-px w-12 bg-gold" aria-hidden />
        <p className="mt-6 font-sans text-base leading-relaxed text-graphit/75">
          {t.body}
        </p>

        <details className="mx-auto mt-6 max-w-md rounded-card border border-navy/15 bg-white px-4 py-3 text-left">
          <summary className="cursor-pointer font-sans text-xs uppercase tracking-widest text-graphit/55">
            {t.detailsLabel}
          </summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-graphit/70">
            {error.message}
          </pre>
        </details>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              reset();
              if (typeof window !== 'undefined') window.location.assign('/');
            }}
            className="rounded-card bg-navy px-6 py-3 font-sans text-sm font-medium text-creme transition hover:bg-graphit"
          >
            {t.reloadCta}
          </button>
          <button
            type="button"
            onClick={reset}
            className="font-sans text-sm text-graphit/65 underline-offset-4 transition hover:text-navy hover:underline"
          >
            {t.dismissCta}
          </button>
        </div>
      </div>
    </main>
  );
}

function fallbackLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'ERROR',
    title: 'Algo salió mal aquí.',
    body: 'Voz Clara encontró un problema inesperado en esta página. Vuelve al inicio — tu biblioteca local está intacta, no se perdió nada.',
    detailsLabel: 'Detalles técnicos',
    reloadCta: 'Volver al inicio',
    dismissCta: 'Cerrar',
  };
  if (locale.startsWith('pt')) return {
    eyebrow: 'ERRO',
    title: 'Algo correu mal aqui.',
    body: 'A Voz Clara encontrou um problema inesperado nesta página. Volta ao início — a tua biblioteca local está intacta, nada se perdeu.',
    detailsLabel: 'Detalhes técnicos',
    reloadCta: 'Voltar ao início',
    dismissCta: 'Fechar',
  };
  if (locale.startsWith('de')) return {
    eyebrow: 'FEHLER',
    title: 'Hier ist etwas schiefgegangen.',
    body: 'Voz Clara hat auf dieser Seite ein unerwartetes Problem gefunden. Geh zurück zur Startseite — deine lokale Bibliothek ist unberührt, es ist nichts verloren gegangen.',
    detailsLabel: 'Technische Details',
    reloadCta: 'Zur Startseite',
    dismissCta: 'Schließen',
  };
  return {
    eyebrow: 'ERROR',
    title: 'Something broke here.',
    body: 'Voz Clara hit an unexpected problem on this page. Head back home — your local library is untouched, nothing was lost.',
    detailsLabel: 'Technical details',
    reloadCta: 'Back to home',
    dismissCta: 'Dismiss',
  };
}
