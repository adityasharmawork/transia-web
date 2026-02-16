"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { MagneticButton } from "./shared/magnetic-button";
import { ThemeToggle } from "./shared/theme-toggle";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk = clerkKey.startsWith("pk_") && clerkKey.length > 20;

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
    if (latest > lastY && latest > 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastY(latest);
  });

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 z-50 w-full px-6 py-4 transition-colors duration-300 md:px-10 ${
        scrolled
          ? "border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a
          href="/"
          className="font-mono text-base font-medium tracking-[0.1em] text-[var(--foreground)]"
        >
          transia
        </a>

        <div className="flex items-center gap-4">
          <a
            href="/pricing"
            className="link-underline hidden font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)] sm:inline"
          >
            Pricing
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline hidden font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)] sm:inline"
          >
            GitHub
          </a>
          <ThemeToggle />
          {hasClerk ? (
            <>
              <SignedOut>
                <MagneticButton
                  href="/sign-in"
                  className="rounded-full border border-[var(--border-hover)] px-5 py-2 font-mono text-xs tracking-wider text-[var(--foreground)] transition-colors hover:bg-[var(--glow)]"
                >
                  Sign In
                </MagneticButton>
              </SignedOut>
              <SignedIn>
                <MagneticButton
                  href="/dashboard"
                  className="rounded-full border border-[var(--border-hover)] px-5 py-2 font-mono text-xs tracking-wider text-[var(--foreground)] transition-colors hover:bg-[var(--glow)]"
                >
                  Dashboard
                </MagneticButton>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          ) : (
            <MagneticButton
              href="/sign-in"
              className="rounded-full border border-[var(--border-hover)] px-5 py-2 font-mono text-xs tracking-wider text-[var(--foreground)] transition-colors hover:bg-[var(--glow)]"
            >
              Sign In
            </MagneticButton>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
