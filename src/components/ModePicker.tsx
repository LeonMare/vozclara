import type { Mode } from '../lib/pack';
import { useLocale } from '../lib/i18n';

interface Props {
  value: Mode;
  onChange: (m: Mode) => void;
  recommended?: Mode;
}

/**
 * Three editorial mode cards instead of a dropdown. Each card has a
 * bespoke ornamental cipher (book/compass/quill), a tagline in serif,
 * a description in sans, and a short feature list. The recommended
 * mode (based on detected genre) gets a discrete "Recomendado" badge.
 */
export function ModePicker({ value, onChange, recommended }: Props) {
  const { t } = useLocale();
  const modes: Mode[] = ['learn', 'business', 'creator'];

  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
      {modes.map((m) => {
        const selected = m === value;
        const isRecommended = m === recommended;
        const meta = t.modes[m];
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            aria-pressed={selected}
            className={[
              'group relative flex flex-col rounded-card border bg-white p-5 text-left transition-all duration-300 sm:p-6',
              selected
                ? 'border-gold shadow-card -translate-y-0.5'
                : 'border-navy/15 hover:border-gold/60 hover:-translate-y-0.5',
            ].join(' ')}
          >
            {isRecommended && (
              <span className="absolute right-4 top-4 rounded-full bg-navy px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest text-gold">
                {t.modeRecommended}
              </span>
            )}

            <div className={selected ? 'text-gold' : 'text-graphit/55 group-hover:text-gold'}>
              <ModeCipher mode={m} />
            </div>

            <h3 className="mt-4 font-serif text-2xl text-navy">{meta.name}</h3>
            <p className="mt-1 font-serif italic text-graphit/70">{meta.tagline}</p>
            <div className="mt-3 h-px w-8 bg-gold/50" aria-hidden />
            <p className="mt-3 font-sans text-sm leading-relaxed text-graphit/75">{meta.description}</p>

            <ul className="mt-4 space-y-1.5 font-sans text-[13px] text-graphit/70">
              {meta.bullets.map((b, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="text-gold/70">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Bespoke ornamental ciphers ──────────────────────────────────────── */

function ModeCipher({ mode }: { mode: Mode }) {
  const stroke = { stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const size = 32;

  if (mode === 'learn') {
    // Open book — classical educational cipher.
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <path d="M4 8c4-1 8-1 12 2v17c-4-3-8-3-12-2V8z" {...stroke} />
        <path d="M28 8c-4-1-8-1-12 2v17c4-3 8-3 12-2V8z" {...stroke} />
        <path d="M16 10v17" {...stroke} />
        <path d="M7 12h5M7 15h5M7 18h5M20 12h5M20 15h5M20 18h5" {...stroke} strokeWidth={0.9} />
      </svg>
    );
  }

  if (mode === 'business') {
    // Compass rose — strategic cipher.
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="11" {...stroke} />
        <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
        <path d="M16 5l-2.2 11L16 18l2.2-2L16 5z" {...stroke} fill="currentColor" fillOpacity="0.85" />
        <path d="M16 27l-2.2-11L16 14l2.2 2L16 27z" {...stroke} />
        <path d="M5 16l11 2.2L14 16l2-2.2L5 16z" {...stroke} />
        <path d="M27 16l-11 2.2L18 16l-2-2.2L27 16z" {...stroke} fill="currentColor" fillOpacity="0.5" />
      </svg>
    );
  }

  // Creator — quill with ink drop.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M26 4c-4 1-9 4-13 8L8 17l3 3 5-5c4-4 7-9 8-13z" {...stroke} fill="currentColor" fillOpacity="0.15" />
      <path d="M11 20l-4 4 1 1 4-4" {...stroke} />
      <path d="M8 24l-2 4" {...stroke} />
      <circle cx="22" cy="9" r="1" fill="currentColor" stroke="none" />
      <path d="M18 24c-1 2-1 4 1 5 2-1 2-3 1-5" {...stroke} fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}
