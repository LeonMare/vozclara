import { useState } from 'react';
import { useLocale } from '../../lib/i18n';
import { AskPanel } from '../AskPanel';
import {
  samplePackBusiness,
  samplePackLearn,
  samplePackCreator,
} from '../../lib/samplePack';

/**
 * Live demo of "Ask My Knowledge" on the landing page.
 *
 * Uses the three sample packs (business / learn / creator on the same
 * Tagesschau video) as the visitor's "library" and pre-fills the
 * question input with whichever example chip they click. The visitor
 * can then submit and see a real AI answer with citations linking to
 * /pack/sample, /pack/sample-learn or /pack/sample-creator — same flow
 * as a logged-in user would experience with their own library.
 *
 * Strongest demonstrable proof on the entire landing page that the
 * product DOES SOMETHING; pairs with HeroPackPreview to cover both
 * sides of the value prop: "save the knowledge" + "ask it later".
 */
export function LandingAskDemo() {
  const { t } = useLocale();
  const [question, setQuestion] = useState('');

  const examples = t.askExamples;
  const samples = [samplePackBusiness, samplePackLearn, samplePackCreator];

  return (
    <div className="mx-auto max-w-3xl text-left">
      {/* Example questions as clickable suggestion chips */}
      <div className="mb-5 flex flex-wrap justify-center gap-2 text-center">
        {examples.slice(0, 4).map((q, i) => {
          const isActive = q === question;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setQuestion(q)}
              aria-pressed={isActive}
              className={[
                'rounded-card border px-3 py-1.5 text-left font-serif text-[13px] italic leading-snug transition sm:text-sm',
                isActive
                  ? 'border-gold bg-gold/15 text-creme'
                  : 'border-creme/15 bg-navy/40 text-creme/75 hover:border-gold/60 hover:text-creme',
              ].join(' ')}
            >
              "{q}"
            </button>
          );
        })}
      </div>

      {/* The actual AskPanel — styled to read on a navy background.
          We wrap it in a creme card so it pops against the section's
          navy backdrop without re-skinning the whole component. */}
      <div className="rounded-card bg-creme p-1 shadow-card">
        <AskPanel
          packs={samples}
          question={question}
          onQuestionChange={setQuestion}
        />
      </div>
    </div>
  );
}
