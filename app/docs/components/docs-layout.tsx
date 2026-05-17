"use client";

import { useState, useEffect } from "react";
import { DocsSidebar } from "./docs-sidebar";
import { DocsMobileNav } from "./docs-mobile-nav";
import { DocsContent } from "./docs-content";

export function DocsLayout() {
  const [activeSection, setActiveSection] = useState("quick-start");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -80% 0px" },
    );

    const sections = document.querySelectorAll("[data-docs-section]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
      <div className="flex gap-12 lg:gap-16">
        {/* Sidebar — desktop only */}
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <DocsSidebar activeSection={activeSection} />
        </aside>

        {/* Mobile nav */}
        <DocsMobileNav activeSection={activeSection} />

        {/* Main content */}
        <main className="min-w-0 max-w-3xl flex-1">
          <DocsContent />
        </main>
      </div>
    </div>
  );
}
