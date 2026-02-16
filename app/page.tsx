import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { SocialProof } from "./components/social-proof";
import { StatsCounter } from "./components/stats-counter";
import { ProblemSolution } from "./components/problem-solution";
import { BentoFeatures } from "./components/bento-features";
import { FullWidthQuote } from "./components/full-width-quote";
import { DeveloperExperience } from "./components/developer-experience";
import { LanguageOrbit } from "./components/language-orbit";
import { HowItWorks } from "./components/how-it-works";
import { BuiltForScale } from "./components/built-for-scale";
import { PricingPreview } from "./components/pricing-preview";
import { CtaBanner } from "./components/cta-banner";
import { Footer } from "./components/footer";
import { GlowLine } from "./components/shared/glow-line";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <SocialProof />
      <GlowLine />
      <StatsCounter />
      <GlowLine />
      <ProblemSolution />
      <GlowLine />
      <BentoFeatures />
      <GlowLine />
      <FullWidthQuote />
      <GlowLine />
      <DeveloperExperience />
      <GlowLine />
      <LanguageOrbit />
      <GlowLine />
      <HowItWorks />
      <GlowLine />
      <BuiltForScale />
      <GlowLine />
      <PricingPreview />
      <GlowLine />
      <CtaBanner />
      <Footer />
    </main>
  );
}
