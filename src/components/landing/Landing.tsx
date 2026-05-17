import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { SeeTheAIWork } from './SeeTheAIWork';
import {
  AudienceTiles,
  Problem,
  Solution,
  KnowledgePackPreview,
  LibraryPreview,
  AskMyKnowledge,
  LanguageLearnerToolkit,
  LanguageSection,
  WhyNotChatGPT,
  PricingPreview,
  TrustSection,
  FounderNote,
  LandingFooter,
} from './sections';
import { FinalCTA } from './FinalCTA';

/**
 * Landing composition.
 *
 *   § 01    Hero
 *   § 01·b  Founder note (the human "why")
 *   § 01·c  Audience tiles — three doors into the product
 *   § 02    Problem
 *   § 03    Solution
 *   § 04    How it works (5 steps)
 *   § 05    Knowledge Pack Preview (showpiece)
 *   § 06    Library Preview
 *   § 07    Ask My Knowledge (live demo)
 *   § 07·b  Language-learner toolkit
 *   § 08    Languages
 *   § 08·b  Why not just ChatGPT? — objection killer
 *   § 09    Pricing
 *   § 10    Final CTA
 *   Footer with subtle LEON MARÉ studio mention.
 */
export function Landing() {
  return (
    <>
      <Hero />
      {/* Founder note moved up — the human "why" lands within the
          first scroll, before the abstract Problem framing. */}
      <FounderNote />
      {/* Audience tiles — the three doors. Right after FounderNote so
          the visitor self-selects into the value prop that fits them
          before reading the longer pitch. */}
      <AudienceTiles />
      <Problem />
      <Solution />
      <div id="how"><HowItWorks /></div>
      <SeeTheAIWork />
      <KnowledgePackPreview />
      <LibraryPreview />
      <AskMyKnowledge />
      <LanguageLearnerToolkit />
      <LanguageSection />
      {/* Why-not-ChatGPT lives right before Pricing because the
          objection peaks exactly when the visitor reaches the price
          tag. Naming it explicitly converts better than ignoring it. */}
      <WhyNotChatGPT />
      <PricingPreview />
      <TrustSection />
      <FinalCTA />
      <LandingFooter />
    </>
  );
}
