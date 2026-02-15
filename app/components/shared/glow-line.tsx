export function GlowLine() {
  return (
    <div className="flex justify-center py-2">
      <div className="animate-glow-pulse h-px w-full max-w-md bg-gradient-to-r from-transparent via-[var(--border-hover)] to-transparent" />
    </div>
  );
}
