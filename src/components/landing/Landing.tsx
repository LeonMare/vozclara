import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { SeeTheAIWork } from './SeeTheAIWork';
import {
  Problem,
  Solution,
  KnowledgePackPreview,
  LibraryPreview,
  AskMyKnowledge,
  LanguageLearnerToolkit,
  LanguageSection,
  PricingPreview,
  TrustSection,
  FounderNote,
  LandingFooter,
} from './sections';
import { FinalCTA } from './FinalCTA';

/**
 * Landing composition.
 *
 *   § 01 Hero
 *   § 02 Problem
 *   § 03 Solution
 *   § 04 How it works (5 steps)
 *   § 05 Knowledge Pack Preview (showpiece)
 *   § 06 Library Preview
 *   § 07 Ask My Knowledge (live demo)
 *   § 07·b Language-learner toolkit
 *   § 08 Languages
 *   § 09 Pricing
 *   § 10 Final CTA
 *   Footer with subtle LEON MARÉ studio mention.
 */
export function Landing() {
  return (
    <>
      <Hero />
      <Problem />
      <Solution />
      <div id="how"><HowItWorks /></div>
      <SeeTheAIWork />
      <KnowledgePackPreview />
      <LibraryPreview />
      <AskMyKnowledge />
      <LanguageLearnerToolkit />
      <LanguageSection />
      <PricingPreview />
      <TrustSection />
      <FinalCTA />
      <FounderNote />
      <LandingFooter />
    </>
  );
}
