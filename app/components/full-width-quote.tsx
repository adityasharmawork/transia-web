"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

// Pre-launch: no customers yet, so these are the product's own principles stated
// plainly — NOT attributed testimonials. Keep them honest and verifiable.
const principles = [
  "Replace your entire i18n pipeline with one command — no JSON files to hand-edit, no separate translation workflow.",
  "Bring your own provider keys, or use managed translation. Same CLI, your call.",
  "Go from English-only to a dozen languages in production, from the codebase you already ship.",
  "Add a locale in seconds: re-run one command and every new string comes back translated.",
];

function PrincipleCard({ quote, index }: { quote: string; index: number }) {
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
                {i < words.length - 1 ? " " : ""}
              </motion.span>
            ))}
            &rdquo;
          </p>
        </blockquote>
      </div>
    </div>
  );
}

export function FullWidthQuote() {
  return (
    <section>
      {principles.map((quote, i) => (
        <PrincipleCard key={i} quote={quote} index={i} />
      ))}
    </section>
  );
}
