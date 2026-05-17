"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NAV_SECTIONS } from "./docs-sidebar";

export function DocsMobileNav({
  activeSection,
}: {
  activeSection: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Floating TOC button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-[var(--border-hover)] bg-[var(--surface)] px-4 py-2.5 font-mono text-xs tracking-wider text-[var(--foreground)] shadow-lg backdrop-blur-md transition-colors hover:bg-[var(--glow)]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 4h12M2 8h8M2 12h10" />
        </svg>
        On this page
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-[var(--border)] bg-[var(--background)] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-sm font-medium text-[var(--foreground)]">
                  On this page
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
              {NAV_SECTIONS.map((section) => (
                <div key={section.label} className="mb-5">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {section.label}
                  </p>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            onClick={() => setOpen(false)}
                            className={`block border-l-2 py-1.5 pl-3 font-mono text-sm transition-colors ${
                              isActive
                                ? "border-[var(--foreground)] text-[var(--foreground)]"
                                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                            }`}
                          >
                            {item.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
