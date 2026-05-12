import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../lib/i18n';
import { BrandMark } from '../BrandMark';
import { samplePackBusiness, samplePackLearn, samplePackCreator } from '../../lib/samplePack';
import type { KnowledgePack, Mode } from '../../lib/pack';

type TabKey = 'summary' | 'insights' | 'actionPlan' | 'vocabulary' | 'quiz' | 'quotes' | 'socialAngles';

/**
 * Live interactive Sample Pack preview in the hero.
 *
 * Replaces the static MockInterface. Three mode tabs at the top let
 * the visitor switch between Learn / Business / Creator outputs of
 * the SAME video. Inside each mode they can click through the result
 * tabs (Summary / Ideas / Action Plan / etc.).
 *
 * This is the single highest-impact piece on the landing: it shows the
 * product working before the user pastes anything. Show, don't tell.
 *
 * Brand-conform throughout: editorial typography, gold accents, tipped
 * plate effect on the outer frame, no glassmorphism.
 */
export function HeroPackPreview() {
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>('business');
  const [tab, setTab] = useState<TabKey>('summary');

  const pack = packForMode(mode);
  const availableTabs = tabsForMode(pack);

  // Reset tab if it becomes invalid for the chosen mode.
  if (!availableTabs.includes(tab)) {
    setTab(availableTabs[0]);
  }

  return (
    <div className="relative">
      {/* Mode switcher above the plate — looks like a print edition selector */}
      <div className="mb-4 flex items-center justify-center gap-1.5 sm:justify-end">
        {(['learn', 'business', 'creator'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setTab('summary'); }}
            className={[
              'rounded-card px-3 py-1.5 font-sans text-xs transition',
              m === mode
                ? 'bg-navy text-creme'
                : 'border border-navy/15 bg-white text-graphit/65 hover:border-gold hover:text-navy',
            ].join(' ')}
          >
            {t.modes[m].name}
          </button>
        ))}
      </div>

      <div className="tipped-plate overflow-hidden rounded-card border border-navy/15 bg-white shadow-card">
        {/* Browser-style chrome bar */}
        <div className="flex items-center justify-between border-b border-navy/10 bg-creme px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-navy/15" />
            <span className="h-2 w-2 rounded-full bg-navy/15" />
            <span className="h-2 w-2 rounded-full bg-navy/15" />
          </div>
          <div className="font-sans text-[10px] tabular-nums tracking-widest text-graphit/45">
            vozclara.app/pack/{pack.id}
          </div>
          <BrandMark variant="monogram" size="xs" tone="gold" decorative />
        </div>

        {/* Pack header */}
        <div className="border-b border-navy/10 bg-creme px-5 py-4">
          <div className="flex flex-wrap items-baseline gap-1.5 font-sans text-[9px] uppercase tracking-widest">
            <span className="rounded-full bg-navy px-2 py-0.5 text-gold">
              {t.modes[pack.mode].name}
            </span>
            <span className="rounded-full bg-navy/8 px-2 py-0.5 text-graphit/70">
              {pack.outputLang.toUpperCase()}
            </span>
            <span className="rounded-full bg-navy/8 px-2 py-0.5 text-graphit/70">
              {t.genreNames[pack.genre]}
            </span>
          </div>
          <h3 className="mt-2 font-serif text-base leading-tight text-navy sm:text-lg">
            {pack.title}
          </h3>
          <div className="mt-2 h-px w-8 bg-gold" />
        </div>

        {/* Result tabs */}
        <div className="flex gap-3 overflow-x-auto border-b border-navy/10 bg-creme px-4 py-2 text-[10px] sm:px-5">
          {availableTabs.map((k) => {
            const isActive = k === tab;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={[
                  'relative whitespace-nowrap pb-1 font-sans transition-colors',
                  isActive ? 'font-medium text-navy' : 'text-graphit/55 hover:text-navy',
                ].join(' ')}
              >
                {t.packTabs[k as keyof typeof t.packTabs]}
                {isActive && <span className="absolute inset-x-0 -bottom-0 h-0.5 bg-gold" />}
              </button>
            );
          })}
        </div>

        {/* Result body — minimum height stops the card from jumping when
            switching; key forces a fade-in on every mode/tab change. */}
        <div className="min-h-[260px] bg-white px-5 py-5">
          <div
            key={`${mode}-${tab}`}
            className="animate-fade-in"
            style={{ animationDuration: '450ms' }}
          >
            <PreviewBody pack={pack} tab={tab} />
          </div>
        </div>

        {/* Footer with deep-link */}
        <div className="border-t border-navy/10 bg-creme px-5 py-2.5 text-center">
          <Link
            to={`/pack/${pack.id}`}
            className="font-sans text-[11px] text-graphit/65 transition hover:text-gold"
          >
            Ver el Knowledge Pack completo →
          </Link>
        </div>
      </div>

      <p className="mt-4 text-center font-serif text-xs italic text-graphit/55">
        Cambia el modo o explora las pestañas — todo es contenido real.
      </p>
    </div>
  );
}

function packForMode(m: Mode): KnowledgePack {
  if (m === 'learn') return samplePackLearn;
  if (m === 'creator') return samplePackCreator;
  return samplePackBusiness;
}

function tabsForMode(pack: KnowledgePack): TabKey[] {
  const out: TabKey[] = ['summary', 'insights'];
  if (pack.mode === 'learn') {
    if (pack.vocabulary.length > 0) out.push('vocabulary');
    if (pack.quiz.length > 0) out.push('quiz');
  }
  if (pack.mode === 'business') {
    if (pack.actionPlan.length > 0) out.push('actionPlan');
    if (pack.keyQuotes.length > 0) out.push('quotes');
  }
  if (pack.mode === 'creator') {
    if (pack.socialAngles.length > 0) out.push('socialAngles');
    if (pack.keyQuotes.length > 0) out.push('quotes');
  }
  return out;
}

/* ─── Preview body — compact, snippet-style ────────────────────────────── */

function PreviewBody({ pack, tab }: { pack: KnowledgePack; tab: TabKey }) {
  if (tab === 'summary') {
    return (
      <div>
        <p className="font-serif text-[15px] leading-relaxed text-navy sm:text-base">
          {pack.summary.short}
        </p>
        <div className="my-3 h-px w-6 bg-gold/50" />
        <p className="font-sans text-[13px] leading-relaxed text-graphit/75 line-clamp-4">
          {pack.summary.long}
        </p>
      </div>
    );
  }

  if (tab === 'insights') {
    return (
      <div className="space-y-3">
        {pack.keyIdeas.slice(0, 2).map((idea, i) => (
          <div key={i}>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-sm text-gold/65 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="font-serif text-[15px] font-medium leading-tight text-navy">{idea.title}</h4>
            </div>
            <p className="mt-1 pl-6 font-sans text-[12px] leading-snug text-graphit/75 line-clamp-3">
              {idea.body}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'actionPlan') {
    return (
      <ul className="space-y-2">
        {pack.actionPlan.slice(0, 3).map((line, i) => (
          <li key={i} className="flex gap-2.5 border-l-2 border-gold/50 bg-creme/50 px-3 py-2">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gold font-sans text-[9px] text-gold">
              {i + 1}
            </span>
            <p className="font-serif text-[13px] leading-snug text-navy">{line}</p>
          </li>
        ))}
      </ul>
    );
  }

  if (tab === 'vocabulary') {
    return (
      <div className="space-y-3">
        {pack.vocabulary.slice(0, 4).map((v, i) => (
          <div key={i} className="flex flex-wrap items-baseline gap-2">
            <span className="font-serif text-base text-navy">{v.word}</span>
            {v.partOfSpeech && (
              <span className="font-sans text-[9px] uppercase tracking-widest text-graphit/45">
                {v.partOfSpeech}
              </span>
            )}
            <span className="text-gold/55">→</span>
            <span className="font-serif italic text-sm text-graphit/85">{v.translation}</span>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'quiz') {
    return (
      <div className="space-y-3">
        {pack.quiz.slice(0, 2).map((q, i) => (
          <div key={i} className="border-l-2 border-gold/50 pl-3">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-sm text-gold/65 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <p className="font-serif text-[14px] leading-snug text-navy">{q.question}</p>
            </div>
            <p className="mt-1 pl-6 font-sans text-[12px] italic text-graphit/60">→ {q.answer}</p>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'quotes') {
    return (
      <div className="space-y-3">
        {pack.keyQuotes.slice(0, 2).map((q, i) => (
          <blockquote key={i} className="border-l-2 border-gold/50 pl-3">
            <p className="font-serif text-[15px] italic leading-snug text-navy">"{q.text}"</p>
            {q.speaker && (
              <footer className="mt-1 font-sans text-[10px] uppercase tracking-widest text-graphit/55">
                {q.speaker}
              </footer>
            )}
          </blockquote>
        ))}
      </div>
    );
  }

  if (tab === 'socialAngles') {
    return (
      <div className="space-y-3">
        {pack.socialAngles.slice(0, 2).map((s, i) => (
          <div key={i} className="border border-navy/10 bg-creme/50 p-3">
            <p className="font-serif text-[14px] font-medium leading-snug text-navy">"{s.hook}"</p>
            <p className="mt-1.5 font-sans text-[11px] leading-snug text-graphit/70 line-clamp-2">
              {s.caption}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
