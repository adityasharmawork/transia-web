"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "./shared/badge";
import { MagneticButton } from "./shared/magnetic-button";
import { CopyButton } from "./shared/copy-button";
import { TerminalWindow } from "./shared/terminal-window";
import { TypingAnimation } from "./shared/typing-animation";
import { GridBackground } from "./shared/grid-background";

const terminalLines = [
  { text: "$ transia translate --target es,fr,de,ja", color: "dim" as const, delay: 300 },
  { text: "", instant: true, delay: 200 },
  { text: "  ✔ Found 45 source files", color: "green" as const, instant: true, delay: 150 },
  { text: "  ✔ Extracted 328 unique translatable strings", color: "green" as const, instant: true, delay: 300 },
  { text: "", instant: true, delay: 100 },
  { text: "  ◼ Translating to es... [7/7 batches]", color: "cyan" as const, instant: true, delay: 400 },
  { text: "  ◼ Translating to fr... [7/7 batches]", color: "cyan" as const, instant: true, delay: 400 },
  { text: "  ◼ Translating to de... [7/7 batches]", color: "cyan" as const, instant: true, delay: 400 },
  { text: "  ◼ Translating to ja... [7/7 batches]", color: "cyan" as const, instant: true, delay: 400 },
  { text: "", instant: true, delay: 100 },
  { text: "  ✔ Generated 8 translation files in locales/", color: "green" as const, instant: true, delay: 200 },
  { text: "", instant: true, delay: 100 },
  { text: "  Translation complete!", color: "green" as const, instant: true, delay: 200 },
  { text: "", instant: true, delay: 50 },
  { text: "  Strings translated: 328", color: "dim" as const, instant: true, delay: 100 },
  { text: "  Target locales:     es, fr, de, ja", color: "dim" as const, instant: true, delay: 100 },
  { text: "  Provider:           openai", color: "dim" as const, instant: true, delay: 100 },
  { text: "  Tokens used:        45,234", color: "dim" as const, instant: true },
];

const ease = [0.25, 0.1, 0.25, 1] as const;

const greetings = [
  { text: "Hello", colors: ["#ffe873", "#ffb703"], textColor: "#0a0a0a" },
  { text: "Hola", colors: ["#ff6b6b", "#ff304f"], textColor: "#fff7ed" },
  { text: "Bonjour", colors: ["#60a5fa", "#2563eb"], textColor: "#e5edff" },
  { text: "नमस्ते", colors: ["#34d399", "#10b981"], textColor: "#022c22" },
  { text: "Ciao", colors: ["#f97316", "#facc15"], textColor: "#2b1100" },
  { text: "Olá", colors: ["#a855f7", "#6366f1"], textColor: "#f8f5ff" },
  { text: "こんにちは", colors: ["#38bdf8", "#0ea5e9"], textColor: "#022c4f" },
  { text: "안녕하세요", colors: ["#f472b6", "#ef4444"], textColor: "#3b0a14" },
];

function GreetingSticker() {
  const [index, setIndex] = useState(0);
  const activeGreeting = greetings[index];

  useEffect(() => {
    const id = setInterval(() => setIndex((prev) => (prev + 1) % greetings.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute -right-1.5 -top-7 rotate-[8deg] sm:-right-8 sm:-top-10">
      <motion.div
        className="relative inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-sm font-semibold shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
        style={{
          background: `linear-gradient(135deg, ${activeGreeting.colors[0]}, ${activeGreeting.colors[1]})`,
          color: activeGreeting.textColor,
        }}
        animate={{ rotate: [4, 2.25, 4], scale: [1, 1.015, 1], y: [0, -0.5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={activeGreeting.text}
            initial={{ y: 12, opacity: 0, rotate: -6 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -12, opacity: 0, rotate: 6 }}
            transition={{ duration: 0.35, ease }}
            className="text-base sm:text-lg"
          >
            {activeGreeting.text}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative w-full flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 sm:px-6">
      <GridBackground className="-z-10" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/4 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-strong), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <Badge>Global Growth Engine</Badge>
        </motion.div>

        <div className="relative mt-8 inline-block text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-6xl md:text-7xl"
          >
            Launch in every language.
            <br />
            <span className="text-[var(--text-secondary)]">Sell in every market.</span>
          </motion.h1>

          <GreetingSticker />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl"
        >
          Turn your React app into a global product in under 60 seconds.
          No translators, no delays, no rebuilt workflows.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease }}
          className="mt-8"
        >
          <CopyButton text="npx transia init" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease }}
        className="mx-auto mt-16 w-full max-w-3xl"
      >
        <TerminalWindow title="transia">
          <TypingAnimation
            lines={terminalLines}
            typingSpeed={25}
            lineDelay={100}
            startDelay={1200}
          />
        </TerminalWindow>
      </motion.div>
    </section>
  );
}
