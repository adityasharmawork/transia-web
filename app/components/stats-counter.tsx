"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

function useCountUp(
  target: number,
  duration: number,
  startWhen: boolean,
  decimals = 0
) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!startWhen) return;

    const start = performance.now();

    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      setValue(parseFloat((eased * target).toFixed(decimals)));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, startWhen, decimals]);

  return value;
}

export function StatsCounter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (isInView) setStarted(true);
  }, [isInView]);

  const billions = useCountUp(7.8, 2500, started, 1);

  return (
    <section className="flex min-h-[80vh] items-center justify-center py-24">
      <div
        ref={containerRef}
        className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        {/* Big number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative"
        >
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: "var(--terminal-green)", opacity: 0.05 }}
            aria-hidden="true"
          />
          <span className="font-mono text-7xl font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-8xl md:text-[120px]">
            {billions.toFixed(1)}B
          </span>
        </motion.div>

        {/* Context line */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-6 text-xl text-[var(--text-secondary)] md:text-2xl"
        >
          people speak a language other than English.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{
            duration: 0.8,
            delay: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="my-10 h-px w-32 bg-[var(--border-hover)]"
        />

        {/* Punch line */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl"
        >
          Reach them in{" "}
          <span className="text-[var(--terminal-green)]">30 seconds.</span>
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{
            duration: 0.6,
            delay: 1.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-4 font-mono text-sm text-[var(--text-tertiary)]"
        >
          One command. Unlimited languages. Zero translation agencies.
        </motion.p>
      </div>
    </section>
  );
}
