import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "../components/shared/theme-toggle";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-mono text-base font-medium tracking-[0.1em] text-[var(--foreground)]"
            >
              transia
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)]"
              >
                Projects
              </Link>
              <Link
                href="/dashboard/analytics"
                className="font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)]"
              >
                Analytics
              </Link>
              <Link
                href="/dashboard/billing"
                className="font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)]"
              >
                Billing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
