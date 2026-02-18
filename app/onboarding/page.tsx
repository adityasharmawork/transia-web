"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Explore Transia with your own API keys",
    features: [
      "Unlimited BYOK translations",
      "3 projects",
      "Language widget (Transia branding)",
      "30-day analytics",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$15",
    period: "/month",
    tagline: "Ship to international markets — zero key management",
    badge: "Recommended",
    features: [
      "Managed translations (10K strings/mo)",
      "10 projects",
      "Remove widget branding",
      "1-year analytics",
      "Email support",
    ],
  },
  {
    id: "team" as const,
    name: "Team",
    price: "$49",
    period: "/month",
    tagline: "For teams scaling across multiple sites",
    features: [
      "Managed translations (50K strings/mo)",
      "Unlimited projects",
      "5 team members",
      "Lifetime analytics",
      "Priority support",
      "Guided onboarding",
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"free" | "pro" | "team">("pro");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    // All new users start on the free tier (set in the User model default).
    // Paid tier upgrades will be handled via Stripe Checkout from the billing page.
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-16">
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="mb-6 inline-block font-mono text-base font-medium tracking-[0.1em] text-[var(--foreground)]"
          >
            transia
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Welcome! Choose your plan.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-[var(--text-secondary)]">
            You can change this anytime from your dashboard. Pick the plan that
            fits where you are today.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative cursor-pointer rounded-xl border p-6 text-left transition-all ${
                  isSelected
                    ? "border-[var(--foreground)] bg-[var(--surface)] shadow-lg ring-1 ring-[var(--foreground)]/20"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)]"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--foreground)] px-3 py-0.5 font-mono text-[10px] text-[var(--background)]">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-medium text-[var(--foreground)]">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[var(--foreground)]">
                      {plan.price}
                    </span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {plan.period}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {plan.tagline}
                  </p>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <span className="mt-0.5 text-[var(--terminal-green)]">
                        &#10003;
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Selection indicator */}
                <div
                  className={`mt-5 flex h-8 items-center justify-center rounded-md font-mono text-xs transition-colors ${
                    isSelected
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "border border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {isSelected ? "Selected" : "Select"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="rounded-full bg-[var(--foreground)] px-10 py-3 font-mono text-sm text-[var(--background)] transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Continue to Dashboard"}
          </button>
          <p className="text-center font-mono text-xs text-[var(--text-muted)]">
            {selected === "free"
              ? "No credit card required."
              : "Payment will be set up in your dashboard."}
            {" "}You can change plans anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
