"use client";

import { useState, useCallback } from "react";

export function CopyIconButton({ text }: { text: string }) {
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
      className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)]"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
