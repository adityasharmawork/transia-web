"use client";

import { ReactNode } from "react";

interface DocsSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function DocsSection({ id, title, subtitle, children }: DocsSectionProps) {
  return (
    <section
      id={id}
      data-docs-section
      className="mt-16 scroll-mt-24 border-t border-[var(--border)] pt-10 first-of-type:mt-0 first-of-type:border-t-0 first-of-type:pt-0"
    >
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-[var(--text-secondary)]">{subtitle}</p>
      )}
      <div className="mt-8 space-y-6">{children}</div>
    </section>
  );
}
