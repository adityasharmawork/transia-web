"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Navbar } from "../components/navbar";

const ease = [0.25, 0.1, 0.25, 1] as const;

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individual developers exploring Transia",
    features: [
      "Unlimited BYOK translations",
      "3 projects",
      "next-intl & i18next output",
      "Language widget (with Transia branding)",
      "Basic analytics (30-day retention)",
      "Community support",
    ],
    cta: "Get Started Free",
    ctaHref: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    description: "For developers shipping to international markets",
    features: [
      "Everything in Free, plus:",
      "Managed translations (10K strings/mo)",
      "No API keys to manage",
      "10 projects",
      "Remove widget branding",
      "Full analytics (1-year retention)",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/sign-up",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For teams and agencies managing multiple sites",
    features: [
      "Everything in Pro, plus:",
      "Managed translations (50K strings/mo)",
      "Unlimited projects",
      "5 team members",
      "Lifetime analytics retention",
      "Priority support",
      "Guided onboarding",
    ],
    cta: "Upgrade to Team",
    ctaHref: "/sign-up",
    highlighted: false,
  },
];

const includedFeatures = [
  "4 AI providers",
  "AST parsing",
  "Delta detection",
  "Secret redaction",
  "Atomic writes",
  "Retry logic",
  "next-intl & i18next",
  "Language widget",
];

function PricingCard({
  tier,
  index,
}: {
  tier: (typeof tiers)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.12, ease }}
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl border p-8 transition-shadow duration-300 ${
        tier.highlighted
          ? "border-[var(--foreground)]/20 bg-[var(--surface)] shadow-xl hover:shadow-2xl"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)] hover:shadow-lg"
      }`}
    >
      {/* Hover glow effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: tier.highlighted
            ? "radial-gradient(circle at 50% 0%, var(--glow-strong), transparent 60%)"
            : "radial-gradient(circle at 50% 0%, var(--glow-strong), transparent 70%)",
        }}
      />

      {tier.highlighted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4, ease }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--foreground)] px-4 py-1 font-mono text-xs text-[var(--background)]"
        >
          Most Popular
        </motion.div>
      )}

      <div className="relative mb-6">
        <h2 className="text-xl font-medium text-[var(--foreground)]">
          {tier.name}
        </h2>
        <div className="mt-3 flex items-baseline gap-1">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.2 + index * 0.12,
              ease,
            }}
            className="text-4xl font-bold text-[var(--foreground)]"
          >
            {tier.price}
          </motion.span>
          <span className="font-mono text-sm text-[var(--text-muted)]">
            {tier.period}
          </span>
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {tier.description}
        </p>
      </div>

      <ul className="relative mb-8 space-y-3">
        {tier.features.map((feature, i) => (
          <motion.li
            key={feature}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.3,
              delay: 0.3 + index * 0.08 + i * 0.04,
              ease,
            }}
            className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
          >
            <span className="mt-0.5 text-[var(--terminal-green)]">
              &#10003;
            </span>
            {feature}
          </motion.li>
        ))}
      </ul>

      <Link
        href={tier.ctaHref}
        className={`relative block w-full overflow-hidden rounded-lg py-3 text-center font-mono text-sm transition-all duration-300 ${
          tier.highlighted
            ? "bg-[var(--foreground)] text-[var(--background)] hover:shadow-lg"
            : "border border-[var(--border-hover)] text-[var(--foreground)] hover:bg-[var(--glow)] hover:shadow-md"
        }`}
      >
        <span className="relative z-10">{tier.cta}</span>
        {/* Shine on hover */}
        {tier.highlighted && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}
      </Link>
    </motion.div>
  );
}

export default function PricingPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });
  const bottomRef = useRef<HTMLDivElement>(null);
  const bottomInView = useInView(bottomRef, { once: true, margin: "-60px" });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Background glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-strong), transparent 70%)",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        {/* Header */}
        <div ref={headerRef} className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[var(--terminal-green)]"
          >
            Plans for every stage
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]"
          >
            Start for free with your own API keys. Upgrade when you want
            managed translations, deeper analytics, and team features.
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} />
          ))}
        </div>

        {/* All plans include */}
        <div ref={bottomRef} className="mt-20 text-center">
          <motion.h3
            initial={{ opacity: 0, y: 16 }}
            animate={bottomInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="text-lg font-medium text-[var(--foreground)]"
          >
            All plans include
          </motion.h3>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {includedFeatures.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 12 }}
                animate={bottomInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + i * 0.05,
                  ease,
                }}
                whileHover={{
                  scale: 1.03,
                  borderColor: "var(--border-hover)",
                }}
                className="cursor-default rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-mono text-xs text-[var(--text-secondary)] transition-shadow duration-200 hover:shadow-md"
              >
                {feature}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-[var(--text-muted)]">
            Not sure which plan is right?
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Start free and upgrade anytime from your dashboard.
            <br />
            No contracts. No hidden fees. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
