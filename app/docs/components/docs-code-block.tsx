"use client";

import { useState, useCallback } from "react";

interface DocsCodeBlockProps {
  code: string;
  filename?: string;
  children?: never;
}

export function DocsCodeBlock({ code, filename }: DocsCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [code]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
      {filename && (
        <div className="border-b border-white/[0.06] px-4 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-neutral-500">
            {filename}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="font-mono text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <div className="overflow-x-auto p-5">
        <pre className="font-mono text-sm leading-relaxed text-neutral-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
