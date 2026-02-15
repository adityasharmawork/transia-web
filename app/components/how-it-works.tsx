"use client";

import { Badge } from "./shared/badge";
import { AnimatedSection } from "./shared/animated-section";

const steps = [
  {
    number: "01",
    title: "Connect your codebase",
    description:
      "Run transia init in your project root. It auto-detects your framework (Next.js, Remix, Gatsby), finds source directories, and creates a config file with sensible defaults. You're ready in 30 seconds.",
    code: `{
  "version": 1,
  "sourceLocale": "en",
  "targetLocales": ["es", "fr", "de"],
  "provider": { "name": "openai", "model": "gpt-4o-mini" },
  "include": ["app/**/*.{tsx,jsx}", "src/**/*.{tsx,jsx}"],
  "output": { "format": "next-intl", "path": "locales" }
}`,
    label: "transia.config.json",
  },
  {
    number: "02",
    title: "Translate and validate instantly",
    description:
      "Transia parses your JSX/TSX with Babel, extracts every user-facing string, batches them (50 per batch) to your AI provider with 3 concurrent requests, validates the output, and writes locale files. SHA-256 fingerprinting means you only pay for what changed.",
    code: `$ transia translate --target es,fr,de

  ✔ Found 45 source files
  ✔ Extracted 328 unique translatable strings
  ● Translating to es... [7/7 batches]
  ● Translating to fr... [7/7 batches]
  ● Translating to de... [7/7 batches]
  ✔ Generated 6 translation files in locales/

  Translation complete!

  Strings translated: 328
  Target locales:     es, fr, de
  Provider:           openai
  Tokens used:        34,120`,
    label: "Terminal output",
  },
  {
    number: "03",
    title: "Go live in new markets",
    description:
      "Generated files are compatible with next-intl and i18next out of the box. No migration needed. Commit the locale files, deploy, and start acquiring customers in every market you target.",
    code: `import { useTranslations } from "next-intl";

export default function Dashboard() {
  const t = useTranslations();
  return <h1>{t("welcome_back_a1b2c3")}</h1>;
}`,
    label: "app/dashboard/page.tsx",
  },
];

export function HowItWorks() {
  return (
    <section id="get-started" className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedSection>
          <Badge>Your Global Launch Plan</Badge>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
            From local product to global
            <br />
            <span className="text-[var(--text-secondary)]">in 3 steps.</span>
          </h2>
        </AnimatedSection>

        <div className="relative mt-16">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-[15px] hidden w-px bg-gradient-to-b from-[var(--border-hover)] via-[var(--border)] to-transparent md:block" />

          <div className="space-y-16 md:space-y-20">
            {steps.map((step, i) => (
              <AnimatedSection
                key={step.number}
                delay={i * 0.15}
                direction="up"
              >
                <div className="flex gap-6 md:gap-10">
                  {/* Step indicator */}
                  <div className="hidden flex-shrink-0 md:block">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-hover)] bg-[var(--background)]">
                      <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-1 font-mono text-xs text-[var(--text-tertiary)] md:hidden">
                      Step {step.number}
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)] md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                      {step.description}
                    </p>

                    {/* Code block */}
                    <div className="force-dark mt-6 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0d0d0d]">
                      <div className="border-b border-white/[0.06] px-4 py-2">
                        <span className="font-mono text-[10px] text-[var(--gray-500)]">
                          {step.label}
                        </span>
                      </div>
                      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--gray-300)]">
                        {step.code}
                      </pre>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
