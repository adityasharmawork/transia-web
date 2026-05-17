"use client";

import { ReactNode } from "react";

type CalloutType = "info" | "warning" | "tip";

interface DocsCalloutProps {
  type: CalloutType;
  title?: string;
  children: ReactNode;
}

const calloutStyles: Record<
  CalloutType,
  { container: string; iconColor: string }
> = {
  info: {
    container:
      "border-[var(--terminal-cyan)]/20 bg-[var(--terminal-cyan)]/5",
    iconColor: "text-[var(--terminal-cyan)]",
  },
  warning: {
    container:
      "border-[var(--terminal-yellow)]/20 bg-[var(--terminal-yellow)]/5",
    iconColor: "text-[var(--terminal-yellow)]",
  },
  tip: {
    container:
      "border-[var(--terminal-green)]/20 bg-[var(--terminal-green)]/5",
    iconColor: "text-[var(--terminal-green)]",
  },
};

function CalloutIcon({ type }: { type: CalloutType }) {
  const { iconColor } = calloutStyles[type];

  if (type === "info") {
    return (
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-xs font-bold ${iconColor}`}
        aria-hidden="true"
      >
        i
      </span>
    );
  }

  if (type === "warning") {
    return (
      <svg
        className={`h-5 w-5 ${iconColor}`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  // tip
  return (
    <svg
      className={`h-5 w-5 ${iconColor}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function DocsCallout({ type, title, children }: DocsCalloutProps) {
  const { container } = calloutStyles[type];

  return (
    <div className={`rounded-lg border p-4 my-4 ${container}`}>
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">
          <CalloutIcon type={type} />
        </div>
        <div className="min-w-0">
          {title && (
            <p className="font-medium text-sm text-[var(--foreground)]">
              {title}
            </p>
          )}
          <div
            className={`text-sm text-[var(--text-secondary)] ${title ? "mt-1" : ""}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
