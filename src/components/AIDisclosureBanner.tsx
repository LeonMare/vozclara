import { useEffect, useState } from 'react';
import { useLocale } from '../lib/i18n';

/**
 * AIDisclosureBanner — EU AI Act Art. 50 disclosure surface.
 *
 * Art. 50(1): "Providers shall ensure that AI systems intended to
 * interact directly with natural persons are designed and developed in
 * such a way that the natural persons concerned are informed that they
 * are interacting with an AI system."
 *
 * Art. 50(2): "Providers of AI systems generating synthetic content
 * shall ensure that the outputs are marked in a machine-readable format
 * and detectable as artificially generated."
 *
 * We satisfy (1) with this one-time banner shown on first visit to
 * /new (the generator). Dismiss persists in localStorage forever so
 * returning users are not nagged. We satisfy (2) with the watermark
 * line written into every export (`worker/src/index.ts` exports +
 * src export adapters).
 *
 * UX posture:
 *   • Subtle gold-bordered card, not a modal — does not block the
 *     URL input or the generator flow.
 *   • Editorial copy in all four locales, no emojis (CLAUDE.md §5).
 *   • Single-button dismiss. No "decline" path — disclosure is a
 *     notice, not a consent gate.
 */

const STORAGE_KEY = 'vc.ai_disclosure_seen_v1';

export function AIDisclosureBanner() {
  const { locale } = useLocale();
  const labels = bannerLabels(locale);

  // Render gate. Default null until effect runs — avoids SSR hydration
  // flash even though we are CSR-only today.
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      setVisible(seen !== '1');
    } catch {
      // localStorage blocked (private mode / hardened browser) → just hide
      setVisible(false);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // best-effort persist; if blocked, the banner reappears next visit
    }
    setVisible(false);
  }

  if (visible !== true) return null;

  return (
    <aside
      role="note"
      aria-label={labels.ariaLabel}
      className="mx-auto mb-6 max-w-3xl rounded-card border border-gold/50 bg-creme/80 px-5 py-4 shadow-sm"
    >
      <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
        · {labels.eyebrow}
      </div>
      <p className="mt-2 font-serif text-base leading-relaxed text-graphit/90 sm:text-lg">
        {labels.body}
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md border border-navy/30 bg-white px-3 py-1.5 font-sans text-xs font-medium text-navy transition hover:border-navy hover:bg-navy hover:text-creme"
        >
          {labels.cta}
        </button>
      </div>
    </aside>
  );
}

function bannerLabels(locale: string) {
  if (locale.startsWith('es')) return {
    ariaLabel: 'Aviso sobre el uso de IA',
    eyebrow: 'Aviso IA',
    body:
      'VozClara genera resúmenes, glosarios y preguntas con modelos de IA (Llama 3.3 70B; Claude Sonnet 4.5 en Pro Plus). Los resultados pueden equivocarse, omitir matices o tener sesgos. Cada Pack lleva una marca de agua que indica que el contenido fue generado por IA.',
    cta: 'Entendido',
  };
  if (locale.startsWith('pt')) return {
    ariaLabel: 'Aviso sobre o uso de IA',
    eyebrow: 'Aviso IA',
    body:
      'A VozClara gera resumos, glossários e perguntas com modelos de IA (Llama 3.3 70B; Claude Sonnet 4.5 no Pro Plus). Os resultados podem enganar-se, omitir nuances ou conter vieses. Cada Pack leva uma marca de água a indicar que o conteúdo foi gerado por IA.',
    cta: 'Entendido',
  };
  if (locale.startsWith('de')) return {
    ariaLabel: 'KI-Nutzungshinweis',
    eyebrow: 'KI-Hinweis',
    body:
      'VozClara erzeugt Zusammenfassungen, Glossare und Fragen mit KI-Modellen (Llama 3.3 70B; Claude Sonnet 4.5 in Pro Plus). Die Ergebnisse können fehlerhaft sein, Nuancen weglassen oder Verzerrungen enthalten. Jeder Pack trägt ein Wasserzeichen, das den Inhalt als KI-generiert kennzeichnet.',
    cta: 'Verstanden',
  };
  return {
    ariaLabel: 'AI usage notice',
    eyebrow: 'AI notice',
    body:
      'VozClara generates summaries, glossaries, and questions with AI models (Llama 3.3 70B; Claude Sonnet 4.5 on Pro Plus). Outputs may be wrong, miss nuance, or carry bias. Each Pack carries a watermark indicating that the content is AI-generated.',
    cta: 'Got it',
  };
}
