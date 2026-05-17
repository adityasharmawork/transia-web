"use client";

const NAV_SECTIONS = [
  {
    label: "Getting Started",
    items: [
      { id: "quick-start", title: "Quick Start" },
      { id: "installation", title: "Installation" },
      { id: "authentication", title: "Authentication" },
    ],
  },
  {
    label: "Advanced: ITSAW",
    items: [
      { id: "itsaw", title: "The ITSAW Flow" },
      { id: "init", title: "I \u2014 Init" },
      { id: "translate", title: "T \u2014 Translate" },
      { id: "setup", title: "S \u2014 Setup" },
      { id: "apply", title: "A \u2014 Apply" },
      { id: "widget", title: "W \u2014 Widget" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "configuration", title: "Configuration" },
      { id: "providers", title: "Provider Setup" },
      { id: "cli-reference", title: "CLI Commands" },
      { id: "faq", title: "FAQ" },
    ],
  },
];

export { NAV_SECTIONS };

export function DocsSidebar({
  activeSection,
}: {
  activeSection: string;
}) {
  return (
    <nav className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block border-l-2 py-1 pl-3 font-mono text-sm transition-colors ${
                      isActive
                        ? "border-[var(--foreground)] text-[var(--foreground)]"
                        : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
