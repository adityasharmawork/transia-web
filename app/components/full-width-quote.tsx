"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const reviews = [
  {
    quote:
      "We replaced our entire i18n pipeline with one CLI command. Transia paid for itself before lunch.",
    attribution: "Engineering Lead, Series B SaaS",
  },
  {
    quote:
      "Our competitors took 3 months to localize. We launched in 12 markets over a weekend. That's the difference Transia makes.",
    attribution: "CTO, YC-backed Fintech Startup",
  },
  {
    quote:
      "We went from English-only to 8 languages in production without a single engineer touching a JSON file. Revenue from non-English markets doubled in 6 weeks.",
    attribution: "VP of Engineering, E-Commerce Platform",
  },
  {
    quote:
      "I ran one command before a demo and our investor saw the product in Japanese. He wrote the check that afternoon.",
    attribution: "Solo Founder, Developer Tools",
  },
];

function ReviewCard({
  quote,
  attribution,
  index,
}: {
  quote: string;
  attribution: string;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "-40%",
  });

  const words = quote.split(" ");

  return (
    <div
      className="sticky top-0 flex h-screen items-center justify-center"
      style={{ zIndex: index + 1 }}
    >
      <div
        ref={cardRef}
        className="relative mx-auto w-full max-w-5xl bg-[var(--background)] px-6 text-center"
      >
        {/* Full-bleed background to cover previous card */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            top: "-50vh",
            bottom: "-50vh",
            background: "var(--background)",
          }}
        />

        {/* Decorative quote mark */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-serif text-[200px] leading-none text-[var(--foreground)]"
          style={{ opacity: 0.03 }}
          aria-hidden="true"
        >
          &ldquo;
        </div>

        <blockquote>
          <p className="text-2xl font-light leading-relaxed tracking-tight text-[var(--foreground)] sm:text-3xl md:text-5xl md:leading-[1.3]">
            &ldquo;
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: i * 0.03,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="inline-block"
              >
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
            &rdquo;
          </p>
          <motion.footer
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: words.length * 0.03 + 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mt-10"
          >
            <span className="font-mono text-sm text-[var(--text-tertiary)]">
              &mdash; {attribution}
            </span>
          </motion.footer>
        </blockquote>
      </div>
    </div>
  );
}

export function FullWidthQuote() {
  return (
    <section>
      {reviews.map((review, i) => (
        <ReviewCard
          key={i}
          quote={review.quote}
          attribution={review.attribution}
          index={i}
        />
      ))}
    </section>
  );
}
