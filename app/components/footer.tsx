export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-16 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6">
        <span className="font-mono text-lg tracking-[0.15em] text-[var(--foreground)]">
          transia
        </span>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline font-mono text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--foreground)]"
          >
            GitHub
          </a>
          <span className="text-[var(--text-muted)]">&middot;</span>
          <a
            href="https://npmjs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline font-mono text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--foreground)]"
          >
            npm
          </a>
          <span className="text-[var(--text-muted)]">&middot;</span>
          <a
            href="/pricing"
            className="link-underline font-mono text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--foreground)]"
          >
            Pricing
          </a>
          <span className="text-[var(--text-muted)]">&middot;</span>
          <a
            href="#"
            className="link-underline font-mono text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--foreground)]"
          >
            Documentation
          </a>
        </div>

        <p className="font-mono text-xs text-[var(--text-muted)]">
          MIT License &middot; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
