"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { MagneticButton } from "./shared/magnetic-button";
import { CopyButton } from "./shared/copy-button";

export function CtaBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, {
    once: true,
    margin: "-100px",
  });

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden py-24">
      {/* Spotlight radial glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-strong), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-5xl md:text-7xl"
        >
          Your next market is
          <br />
          one command away.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-6 text-lg text-[var(--text-secondary)] md:text-xl"
        >
          One command. Your keys. Your AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <MagneticButton
            href="#get-started"
            className="rounded-full bg-[var(--foreground)] px-8 py-3 text-sm font-medium text-[var(--background)] transition-colors hover:opacity-90"
          >
            Go Global Now
          </MagneticButton>
          <MagneticButton
            href="https://github.com"
            className="rounded-full border border-[var(--border-hover)] px-8 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--glow)]"
          >
            View on GitHub
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.45,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-8"
        >
          <CopyButton text="npx transia init" />
        </motion.div>
      </div>
    </section>
  );
}
