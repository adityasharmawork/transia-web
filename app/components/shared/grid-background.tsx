export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{
        maskImage:
          "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 70%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
