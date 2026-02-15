export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
      {children}
    </span>
  );
}
