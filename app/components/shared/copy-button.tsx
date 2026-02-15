"use client";

import { useState, useCallback } from "react";

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`group inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-5 py-2.5 font-mono text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] ${className ?? ""}`}
    >
      <span className="text-[var(--text-muted)]">$</span>
      <span>{text}</span>
      <span className="ml-1 text-xs text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-tertiary)]">
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}
