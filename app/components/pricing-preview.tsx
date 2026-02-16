"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const competitors = [
  { name: "Translation Platform A", price: "$32 – $769" },
  { name: "Translation Platform B", price: "$59 – $450" },
  { name: "Translation Platform C", price: "$30 – $600" },
];

const valueProps = [
  {
    icon: "\u26A1",
    title: "AI-powered, not manual",
    detail: "4 providers. One command. Translations in seconds, not days.",
  },
  {
    icon: "\uD83C\uDF10",
    title: "Widget included",
    detail:
      "A branded language switcher on your site — zero frontend work.",
  },
  {
    icon: "\uD83D\uDCC8",
    title: "Analytics built in",
    detail:
      "See which languages your visitors want. Data-driven expansion.",
  },
];

export function PricingPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-28 md:py-36">
      {/* Multi-layer glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-strong), transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 left-1/3 -z-10 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rotate-12 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-strong), transparent 70%)",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div ref={ref} className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          className="text-center"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-[var(--terminal-green)]">
            Pricing that makes sense
          </p>
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            Go global for{" "}
            <span className="relative inline-block">
              <span className="relative z-10">$0</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5, ease }}
                className="absolute -bottom-1 left-0 h-[6px] w-full origin-left rounded-full"
                style={{ background: "var(--terminal-green)", opacity: 0.3 }}
              />
            </span>
            .
            <br />
            <span className="text-[var(--text-secondary)]">
              Scale when revenue does.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            Your competitors are already multilingual. Transia gets you there in
            minutes — with AI translations, a branded widget, and analytics —
            all included. No credit card. No limits on BYOK translations.
          </p>
        </motion.div>

        {/* Value props */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {valueProps.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease }}
              className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-lg"
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, var(--glow-strong), transparent 70%)",
                }}
              />
              <span className="relative mb-4 block text-2xl">{item.icon}</span>
              <h3 className="relative font-mono text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Competitor comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.65, ease }}
          className="mt-16 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8"
        >
          <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Left: comparison */}
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
                What other i18n tools charge
              </p>
              <div className="space-y-3">
                {competitors.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: 0.8 + i * 0.08,
                      ease,
                    }}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-2.5"
                  >
                    <span className="text-sm text-[var(--text-secondary)]">
                      {c.name}
                    </span>
                    <span className="font-mono text-sm text-[var(--text-muted)] line-through decoration-[var(--text-muted)]/50">
                      {c.price}/mo
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Transia offer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.1, ease }}
              className="text-center md:text-left"
            >
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--terminal-green)]">
                Transia
              </p>
              <p className="mt-2 text-5xl font-bold tracking-tight text-[var(--foreground)] md:text-6xl">
                $0
              </p>
              <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
                to start. Forever.
              </p>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Upgrade to Pro at $15/mo or Team at $49/mo
                <br />
                only when you need managed translations.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.3, ease }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <Link
            href="/sign-up"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--foreground)] px-10 py-3.5 font-mono text-sm font-medium text-[var(--background)] transition-all duration-300 hover:shadow-lg"
          >
            <span className="relative z-10">Start Free — No Card Required</span>
            <motion.span
              className="relative z-10"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              &rarr;
            </motion.span>
            {/* Button shine */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <Link
            href="/pricing"
            className="font-mono text-xs text-[var(--text-muted)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:text-[var(--text-secondary)] hover:decoration-[var(--text-secondary)]"
          >
            Compare all plans in detail
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
