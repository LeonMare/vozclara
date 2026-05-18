import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../lib/i18n';
import { BrandMark } from '../BrandMark';
import { samplePackBusiness, samplePackLearn, samplePackCreator, samplePackStudy } from '../../lib/samplePack';
import { activeView, type KnowledgePack, type Language, type Mode } from '../../lib/pack';

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
  const { t, locale } = useLocale();
  const cta = previewCta(locale);
  const [mode, setMode] = useState<Mode>('brief');
  const [tab, setTab] = useState<TabKey>('summary');
  const [lang, setLang] = useState<Language>('es');

  // The base pack for the current mode. We then create a derived
  // `displayPack` whose `outputLang` reflects the visitor's chosen
  // language chip — that drives `activeView()` everywhere downstream.
  const basePack = packForMode(mode);
  const supportedLang = basePack.outputLanguages.includes(lang) ? lang : basePack.outputLang;
  const pack: KnowledgePack = supportedLang === basePack.outputLang
    ? basePack
    : { ...basePack, outputLang: supportedLang };

  const availableTabs = tabsForMode(pack);

  // Reset tab if it becomes invalid for the chosen mode.
  if (!availableTabs.includes(tab)) {
    setTab(availableTabs[0]);
  }

  return (
    <div className="relative">
      {/* Mode switcher above the plate — looks like a print edition selector.
          All four production modes surface here. Selecting `study` swaps the
          preview to the Veritasium entropy pack (different source video by
          design — that's the only sample that has the full study-mode
          treatment with quiz + comprehension questions). The shift in
          source actually demonstrates the value: same pipeline, different
          content type, different output. */}
      <div className="mb-4 flex items-center justify-center gap-1.5 sm:justify-end">
        {(['learn', 'brief', 'study', 'creator'] as Mode[]).map((m) => (
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
            {t.modes[m]?.name ?? m}
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
          <div className="font-sans text-[10px] tabular-nums tracking-widest text-graphit/65">
            vozclara.app/pack/{pack.id}
          </div>
          <BrandMark variant="monogram" size="xs" tone="gold" decorative />
        </div>

        {/* Pack header */}
        <div className="border-b border-navy/10 bg-creme px-5 py-4">
          <div className="flex flex-wrap items-center gap-1.5 font-sans text-[9px] uppercase tracking-widest">
            <span className="rounded-full bg-navy px-2 py-0.5 text-gold">
              {t.modes[pack.mode]?.name ?? pack.mode}
            </span>
            {/* Language chips — interactive when the pack ships multiple
                translations (Business sample does, learn/creator don't).
                Click a chip to swap the entire pack body into that
                language without leaving the hero. */}
            {pack.outputLanguages.length > 1 ? (
              <span
                role="group"
                aria-label="Language"
                className="inline-flex overflow-hidden rounded-full border border-navy/15 bg-white"
              >
                {pack.outputLanguages.map((l) => {
                  const active = l === pack.outputLang;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      aria-pressed={active}
                      className={[
                        'px-2 py-0.5 font-medium transition',
                        active
                          ? 'bg-navy text-gold'
                          : 'bg-white text-graphit/65 hover:bg-creme hover:text-navy',
                      ].join(' ')}
                    >
                      {l.toUpperCase()}
                    </button>
                  );
                })}
              </span>
            ) : (
              <span className="rounded-full bg-navy/8 px-2 py-0.5 text-graphit/70">
                {pack.outputLang.toUpperCase()}
              </span>
            )}
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
                  isActive ? 'font-medium text-navy' : 'text-graphit/65 hover:text-navy',
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
            {cta.viewFull} →
          </Link>
        </div>
      </div>

      <p className="mt-4 text-center font-serif text-xs italic text-graphit/65">
        {cta.tip}
      </p>
    </div>
  );
}

function packForMode(m: Mode): KnowledgePack {
  if (m === 'learn') return samplePackLearn;
  if (m === 'creator') return samplePackCreator;
  if (m === 'study') return samplePackStudy;
  return samplePackBusiness;
}

function tabsForMode(pack: KnowledgePack): TabKey[] {
  const view = activeView(pack);
  const out: TabKey[] = ['summary', 'insights'];
  if (pack.mode === 'learn') {
    if (view.vocabulary.length > 0) out.push('vocabulary');
    if (view.quiz.length > 0) out.push('quiz');
  }
  if (pack.mode === 'brief') {
    if (view.actionPlan.length > 0) out.push('actionPlan');
    if (view.keyQuotes.length > 0) out.push('quotes');
  }
  if (pack.mode === 'study') {
    // Hero is a mini-preview — chapter detail lives in the full PackPage.
    if (view.quiz.length > 0) out.push('quiz');
    if (view.keyQuotes.length > 0) out.push('quotes');
  }
  if (pack.mode === 'creator') {
    if (view.socialAngles.length > 0) out.push('socialAngles');
    if (view.keyQuotes.length > 0) out.push('quotes');
  }
  return out;
}

/* ─── Preview body — compact, snippet-style ────────────────────────────── */

function PreviewBody({ pack, tab }: { pack: KnowledgePack; tab: TabKey }) {
  const view = activeView(pack);

  if (tab === 'summary') {
    return (
      <div>
        <p className="font-serif text-[15px] leading-relaxed text-navy sm:text-base">
          {view.summary.short}
        </p>
        <div className="my-3 h-px w-6 bg-gold/50" />
        <p className="font-sans text-[13px] leading-relaxed text-graphit/75 line-clamp-4">
          {view.summary.long}
        </p>
      </div>
    );
  }

  if (tab === 'insights') {
    return (
      <div className="space-y-3">
        {view.keyIdeas.slice(0, 2).map((idea, i) => (
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
        {view.actionPlan.slice(0, 3).map((line, i) => (
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
        {view.vocabulary.slice(0, 4).map((v, i) => (
          <div key={i} className="flex flex-wrap items-baseline gap-2">
            <span className="font-serif text-base text-navy">{v.word}</span>
            {v.partOfSpeech && (
              <span className="font-sans text-[9px] uppercase tracking-widest text-graphit/65">
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
        {view.quiz.slice(0, 2).map((q, i) => (
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
        {view.keyQuotes.slice(0, 2).map((q, i) => (
          <blockquote key={i} className="border-l-2 border-gold/50 pl-3">
            <p className="font-serif text-[15px] italic leading-snug text-navy">"{q.text}"</p>
            {q.speaker && (
              <footer className="mt-1 font-sans text-[10px] uppercase tracking-widest text-graphit/65">
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
        {view.socialAngles.slice(0, 2).map((s, i) => (
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

/**
 * Tiny i18n table for the two strings beneath the preview that aren't
 * worth a full Strings entry. Falls back to English. The CTAs follow
 * the visitor's interface locale, NOT the pack's outputLang — the pack
 * content stays in its sample-pack language (Spanish for the business
 * sample) but "View the full pack" + the tip line belong to the
 * surrounding UI.
 */
function previewCta(locale: string) {
  if (locale.startsWith('es')) return {
    viewFull: 'Ver el Knowledge Pack completo',
    tip: 'Cambia el modo o explora las pestañas — todo es contenido real.',
  };
  if (locale.startsWith('pt')) return {
    viewFull: 'Ver o Knowledge Pack completo',
    tip: 'Muda o modo ou explora as abas — tudo é conteúdo real.',
  };
  if (locale.startsWith('de')) return {
    viewFull: 'Den vollen Knowledge Pack ansehen',
    tip: 'Wechsel den Modus oder erkund die Tabs — alles ist echter Inhalt.',
  };
  return {
    viewFull: 'See the full Knowledge Pack',
    tip: 'Switch mode or explore the tabs — every line is real content.',
  };
}
