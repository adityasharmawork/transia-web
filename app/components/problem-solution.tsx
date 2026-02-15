"use client";

import { Badge } from "./shared/badge";
import { AnimatedSection } from "./shared/animated-section";

const painPoints = [
  "Weeks lost wrangling translation files while competitors launch first",
  "Revenue left on the table in markets you could already serve",
  "Engineering time burned on copy-paste i18n busywork instead of features",
  "Broken translations slip into production, eroding user trust",
  "Every new feature multiplies the localization debt across all languages",
];

const solutions = [
  "Ship to new markets in minutes — not quarters",
  "Zero code changes. Write JSX, Transia handles the rest",
  "AI translates in seconds with context-aware accuracy",
  "Built-in validation catches XSS, broken placeholders, and length issues",
  "Delta detection means you only pay for what actually changed",
];

export function ProblemSolution() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection className="mb-16">
          <Badge>The Bottleneck</Badge>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
            Localization is killing
            <br />
            <span className="text-[var(--text-secondary)]">your time to market.</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Pain - Without Transia */}
          <AnimatedSection direction="right" delay={0.1}>
            <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                Without Transia
              </p>
              <ul className="space-y-4">
                {painPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--terminal-red)]/10 text-[var(--terminal-red)]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 2l6 6M8 2L2 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <p className="font-mono text-sm text-[var(--terminal-red)]">
                  ~4 hours per feature, per language — multiplied across every market
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Solution - With Transia */}
          <AnimatedSection direction="left" delay={0.2}>
            <div className="h-full rounded-2xl border border-[var(--border-hover)] bg-[var(--surface)] p-6 md:p-8">
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                With Transia
              </p>
              <ul className="space-y-4">
                {solutions.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--terminal-green)]/10 text-[var(--terminal-green)]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5.5l2 2 4-4.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm leading-relaxed text-[var(--text-primary)]">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <p className="font-mono text-sm text-[var(--terminal-green)]">
                  ~30 seconds to your next market. Unlimited languages.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
