"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "./shared/badge";
import { AnimatedSection } from "./shared/animated-section";
import { TerminalWindow } from "./shared/terminal-window";

const tabs = ["init", "translate", "status", "reset"] as const;
type Tab = (typeof tabs)[number];

const tabContent: Record<Tab, React.ReactNode> = {
  init: (
    <div className="whitespace-pre text-sm">
      <div className="text-white/40">$ transia init</div>
      <div className="mt-3 text-[var(--terminal-green)] font-semibold">
        {"  "}&check; Transia initialized successfully!
      </div>
      <div className="mt-3 text-white/50">
        {"  "}Detected: <span className="text-white">Next.js</span> project
      </div>
      <div className="text-white/50">
        {"  "}Scanning: <span className="text-white">app, src</span> directories
      </div>
      <div className="mt-3 text-white font-semibold">{"  "}Next steps:</div>
      <div className="mt-2 text-[var(--terminal-cyan)]">
        {"  "}1. Add your API key to <span className="text-[var(--terminal-yellow)]">.env</span> or <span className="text-[var(--terminal-yellow)]">.env.local</span>:
      </div>
      <div className="mt-1 text-white/50">
        {"     "}# For OpenAI (default provider)
      </div>
      <div className="text-white">
        {"     "}OPENAI_API_KEY=your-key-here
      </div>
      <div className="mt-2 text-white/40">
        {"     "}# Or for other providers:
      </div>
      <div className="text-white/40">
        {"     "}ANTHROPIC_API_KEY=your-key-here
      </div>
      <div className="text-white/40">
        {"     "}GEMINI_API_KEY=your-key-here
      </div>
      <div className="text-white/40">
        {"     "}XAI_API_KEY=your-key-here
      </div>
      <div className="mt-2 text-[var(--terminal-cyan)]">
        {"  "}2. Edit <span className="text-[var(--terminal-yellow)]">transia.config.json</span> to configure target locales.
      </div>
      <div className="mt-2 text-[var(--terminal-cyan)]">
        {"  "}3. Run your first translation:
      </div>
      <div className="mt-1 text-[var(--terminal-green)]">
        {"     "}npx transia translate
      </div>
    </div>
  ),
  translate: (
    <div className="whitespace-pre text-sm">
      <div className="text-white/40">$ transia translate --target es,fr,de,ja</div>
      <div className="mt-3 text-[var(--terminal-green)]">
        {"  "}&check; Found 45 source files
      </div>
      <div className="text-[var(--terminal-green)]">
        {"  "}&check; Extracted 328 unique translatable strings
      </div>
      <div className="mt-2 text-[var(--terminal-cyan)]">
        {"  "}&bull; Translating to es... [7/7 batches]
      </div>
      <div className="text-[var(--terminal-cyan)]">
        {"  "}&bull; Translating to fr... [7/7 batches]
      </div>
      <div className="text-[var(--terminal-cyan)]">
        {"  "}&bull; Translating to de... [7/7 batches]
      </div>
      <div className="text-[var(--terminal-cyan)]">
        {"  "}&bull; Translating to ja... [7/7 batches]
      </div>
      <div className="mt-2 text-[var(--terminal-green)]">
        {"  "}&check; Generated 8 translation files in locales/
      </div>
      <div className="mt-2 text-[var(--terminal-green)] font-semibold">
        {"  "}Translation complete!
      </div>
      <div className="mt-2 text-white/50">
        {"  "}Strings translated: <span className="text-white">328</span>
      </div>
      <div className="text-white/50">
        {"  "}Target locales:     <span className="text-white">es, fr, de, ja</span>
      </div>
      <div className="text-white/50">
        {"  "}Provider:           <span className="text-white">openai</span>
      </div>
      <div className="text-white/50">
        {"  "}Tokens used:        <span className="text-white">45,234</span>
      </div>
    </div>
  ),
  status: (
    <div className="whitespace-pre text-sm">
      <div className="text-white/40">$ transia status</div>
      <div className="mt-3 text-white/30">
        {"  "}+----------+-------+------------+---------+----------+
      </div>
      <div className="text-white/30">
        {"  "}|
        <span className="text-white/60"> Locale   </span>|
        <span className="text-white/60"> Total </span>|
        <span className="text-white/60"> Translated </span>|
        <span className="text-white/60"> Missing </span>|
        <span className="text-white/60"> Coverage </span>|
      </div>
      <div className="text-white/30">
        {"  "}+----------+-------+------------+---------+----------+
      </div>
      <div className="text-white/30">
        {"  "}|<span className="text-white"> es       </span>|
        <span className="text-white"> 328   </span>|
        <span className="text-white"> 328        </span>|
        <span className="text-white"> 0       </span>|
        <span className="text-[var(--terminal-green)]"> 100%     </span>|
      </div>
      <div className="text-white/30">
        {"  "}|<span className="text-white"> fr       </span>|
        <span className="text-white"> 328   </span>|
        <span className="text-white"> 328        </span>|
        <span className="text-white"> 0       </span>|
        <span className="text-[var(--terminal-green)]"> 100%     </span>|
      </div>
      <div className="text-white/30">
        {"  "}|<span className="text-white"> de       </span>|
        <span className="text-white"> 328   </span>|
        <span className="text-white"> 326        </span>|
        <span className="text-[var(--terminal-yellow)]"> 2       </span>|
        <span className="text-[var(--terminal-yellow)]"> 99%      </span>|
      </div>
      <div className="text-white/30">
        {"  "}|<span className="text-white"> ja       </span>|
        <span className="text-white"> 328   </span>|
        <span className="text-white"> 328        </span>|
        <span className="text-white"> 0       </span>|
        <span className="text-[var(--terminal-green)]"> 100%     </span>|
      </div>
      <div className="text-white/30">
        {"  "}+----------+-------+------------+---------+----------+
      </div>
      <div className="mt-3 text-white/50">
        {"  "}Source locale: <span className="text-white">en</span>
      </div>
      <div className="text-white/50">
        {"  "}Provider: <span className="text-white">openai</span>
      </div>
      <div className="text-white/50">
        {"  "}Output: <span className="text-white">next-intl &rarr; locales/</span>
      </div>
    </div>
  ),
  reset: (
    <div className="whitespace-pre text-sm">
      <div className="text-white/40">$ transia reset --confirm</div>
      <div className="mt-3 text-white/50">
        {"  "}Deleted .transia-state.json
      </div>
      <div className="text-white/50">
        {"  "}Deleted .transia-state.json.bak
      </div>
      <div className="mt-3 text-[var(--terminal-green)]">
        {"  "}Translation state has been reset.
      </div>
      <div className="text-white/50">
        {"  "}Run <span className="text-[var(--terminal-cyan)]">transia translate</span> to re-translate from scratch.
      </div>
    </div>
  ),
};

export function DeveloperExperience() {
  const [activeTab, setActiveTab] = useState<Tab>("translate");

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedSection>
          <Badge>Speed to Market</Badge>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
            4 commands.
            <br />
            <span className="text-[var(--text-secondary)]">Infinite markets.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            From first install to live-in-production translations in under 5 minutes.
            No learning curve, no migration, no config debt.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mt-12">
          {/* Tab bar */}
          <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)] pb-px">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors"
              >
                <span
                  className={
                    activeTab === tab
                      ? "text-[var(--foreground)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }
                >
                  {tab}
                </span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute right-0 bottom-0 left-0 h-px bg-[var(--foreground)]"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Terminal */}
          <TerminalWindow title={`transia ${activeTab}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </TerminalWindow>
        </AnimatedSection>
      </div>
    </section>
  );
}
