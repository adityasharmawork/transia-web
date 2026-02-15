export function TerminalWindow({
  children,
  title = "Terminal",
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`force-dark overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0a] shadow-[0_0_80px_-20px_rgba(255,255,255,0.03)] ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-white/30">{title}</span>
      </div>
      <div className="overflow-x-auto p-5 font-mono text-sm leading-relaxed md:p-6">
        {children}
      </div>
    </div>
  );
}
