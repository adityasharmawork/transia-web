"use client";

import { useRef, useCallback, useState, type ReactNode, type MouseEvent } from "react";

export function GlowCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(500px circle at ${x}% ${y}%, var(--glow), transparent 60%)`;
    }
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all duration-300 hover:border-[var(--border-hover)] hover:-translate-y-0.5 md:p-8 ${className ?? ""}`}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: isHovered ? 1 : 0 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
