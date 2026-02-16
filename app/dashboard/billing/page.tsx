"use client";

import { useState, useEffect } from "react";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individual developers exploring Transia",
    features: [
      "Unlimited BYOK translations",
      "3 projects",
      "Language widget (Transia branding)",
      "30-day analytics",
      "Community support",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$15",
    period: "/month",
    description: "For developers shipping to international markets",
    popular: true,
    features: [
      "Everything in Free, plus:",
      "Managed translations (10K strings/mo)",
      "No API keys to manage",
      "10 projects",
      "Remove widget branding",
      "1-year analytics retention",
      "Email support",
    ],
  },
  {
    id: "team" as const,
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For teams and agencies managing multiple sites",
    features: [
      "Everything in Pro, plus:",
      "Managed translations (50K strings/mo)",
      "Unlimited projects",
      "5 team members",
      "Lifetime analytics retention",
      "Priority support",
      "Guided onboarding",
    ],
  },
];

type Tier = "free" | "pro" | "team";

export default function BillingPage() {
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<Tier | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetch("/api/account/tier")
      .then((r) => r.json())
      .then((data) => {
        setCurrentTier(data.tier);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleChangeTier(tier: Tier) {
    if (tier === currentTier) return;
    setChanging(tier);
    setMessage(null);

    try {
      const res = await fetch("/api/account/tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to change plan", type: "error" });
        return;
      }

      setCurrentTier(tier);
      const action =
        plans.findIndex((p) => p.id === tier) >
        plans.findIndex((p) => p.id === currentTier)
          ? "upgraded"
          : "changed";
      setMessage({
        text: `Successfully ${action} to ${plans.find((p) => p.id === tier)?.name}.`,
        type: "success",
      });
    } catch {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setChanging(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">
          Loading billing...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Billing & Plan
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          You are currently on the{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {plans.find((p) => p.id === currentTier)?.name}
          </span>{" "}
          plan. Change anytime — upgrades take effect immediately.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 font-mono text-sm ${
            message.type === "success"
              ? "border-[var(--terminal-green)]/30 bg-[var(--terminal-green)]/5 text-[var(--terminal-green)]"
              : "border-red-500/30 bg-red-500/5 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const isChanging = changing === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 transition-all ${
                isCurrent
                  ? "border-[var(--foreground)]/20 bg-[var(--surface)] shadow-lg ring-1 ring-[var(--foreground)]/10"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--foreground)] px-3 py-0.5 font-mono text-[10px] text-[var(--background)]">
                  Current Plan
                </span>
              )}

              {plan.popular && !isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-[var(--border-hover)] bg-[var(--surface)] px-3 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                  Most Popular
                </span>
              )}

              <div className="mb-5">
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
                  {plan.description}
                </p>
              </div>

              <ul className="mb-6 space-y-2">
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

              <button
                onClick={() => handleChangeTier(plan.id)}
                disabled={isCurrent || isChanging}
                className={`block w-full rounded-lg py-2.5 text-center font-mono text-sm transition-colors ${
                  isCurrent
                    ? "cursor-default border border-[var(--border)] text-[var(--text-muted)]"
                    : "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-50"
                }`}
              >
                {isCurrent
                  ? "Current Plan"
                  : isChanging
                    ? "Changing..."
                    : plans.findIndex((p) => p.id === plan.id) >
                        plans.findIndex((p) => p.id === currentTier)
                      ? `Upgrade to ${plan.name}`
                      : `Switch to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          Payment
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Stripe payment integration coming soon. During the beta, plan changes
          take effect immediately at no charge.
        </p>
      </div>
    </div>
  );
}
