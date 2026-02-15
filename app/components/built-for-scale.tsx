"use client";

import { AnimatedSection } from "./shared/animated-section";

const scaleStats = [
  {
    value: "50 strings/batch",
    description: "Optimal batch size for AI context windows",
  },
  {
    value: "3 concurrent",
    description: "Parallel requests per locale",
  },
  {
    value: "SHA-256",
    description: "Fingerprint every string change",
  },
];

export function BuiltForScale() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-24">
      {/* Subtle darker gradient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, var(--glow), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Giant watermark number */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-mono text-[120px] font-bold leading-none md:text-[200px]"
        style={{ opacity: 0.04, color: "var(--foreground)" }}
        aria-hidden="true"
      >
        14,320
      </div>

      <div className="mx-auto max-w-4xl px-6">
        <div className="space-y-12">
          {scaleStats.map((stat, i) => (
            <AnimatedSection key={stat.value} delay={i * 0.15} direction="right">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-8">
                <span className="font-mono text-2xl font-semibold text-[var(--foreground)] md:min-w-[240px] md:text-3xl">
                  {stat.value}
                </span>
                <div className="hidden h-px flex-1 bg-[var(--border)] md:block" />
                <span className="text-sm text-[var(--text-secondary)] md:text-base">
                  {stat.description}
                </span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
