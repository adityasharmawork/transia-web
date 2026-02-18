"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<Tier | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [ownReferralCode, setOwnReferralCode] = useState("");
  const [referralPoints, setReferralPoints] = useState(0);
  const [canClaimReferral, setCanClaimReferral] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claimingReferral, setClaimingReferral] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const loadAccount = useCallback(async () => {
    const res = await fetch("/api/account/tier");
    const data = await res.json();
    setCurrentTier(data.tier);
    setOwnReferralCode(data.referralCode || "");
    setReferralPoints(data.referralPoints || 0);
    setCanClaimReferral(Boolean(data.canClaimReferral));
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage({ text: "Subscription activated! Your plan has been upgraded.", type: "success" });
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ text: "Checkout canceled. No changes were made.", type: "error" });
    }
  }, [searchParams]);

  useEffect(() => {
    loadAccount()
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [loadAccount]);

  async function handleChangeTier(tier: Tier) {
    if (tier === currentTier) return;

    if (tier === "free") {
      // Downgrade: redirect to Stripe Customer Portal
      await openPortal();
      return;
    }

    // Upgrade: redirect to Stripe Checkout
    setChanging(tier);
    setMessage(null);

    try {
      const checkoutPayload = {
        tier,
        couponCode: couponCode.trim() || undefined,
        redeemPoints: usePoints,
      };

      const quoteRes = await fetch("/api/billing/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload),
      });

      if (!quoteRes.ok) {
        const quoteError = await quoteRes.json();
        setMessage({
          text: quoteError.error || "Discount validation failed",
          type: "error",
        });
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ text: data.error || "Failed to start checkout", type: "error" });
      }
    } catch {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setChanging(null);
    }
  }

  async function openPortal() {
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({
          text: "To downgrade to Free, please contact support.",
          type: "error",
        });
      }
    } catch {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    }
  }

  async function claimReferralCode() {
    if (!claimCode.trim()) {
      setMessage({ text: "Enter a referral code first.", type: "error" });
      return;
    }

    setClaimingReferral(true);
    setMessage(null);
    try {
      const res = await fetch("/api/referrals/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: claimCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || "Failed to claim referral code", type: "error" });
        return;
      }

      setMessage({ text: "Referral code claimed successfully.", type: "success" });
      setClaimCode("");
      await loadAccount();
    } catch {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setClaimingReferral(false);
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

      <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          Discounts
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter a coupon code and choose whether to spend referral points.
          The single best eligible discount is applied automatically.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Coupon code"
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-hover)] focus:outline-none"
          />
          <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={usePoints}
              onChange={(e) => setUsePoints(e.target.checked)}
              className="h-4 w-4 accent-[var(--foreground)]"
            />
            Spend points ({referralPoints}% available)
          </label>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          Referral Program
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Share your code: <span className="font-mono text-[var(--foreground)]">{ownReferralCode || "—"}</span>
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Referral points:{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {referralPoints}
          </span>
        </p>

        {canClaimReferral && (
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              placeholder="Enter referral code"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-hover)] focus:outline-none"
            />
            <button
              onClick={claimReferralCode}
              disabled={claimingReferral}
              className="rounded-lg bg-[var(--foreground)] px-4 py-2 font-mono text-sm text-[var(--background)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {claimingReferral ? "Claiming..." : "Claim Code"}
            </button>
          </div>
        )}
      </div>

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
                    ? "Redirecting..."
                    : plans.findIndex((p) => p.id === plan.id) >
                        plans.findIndex((p) => p.id === currentTier)
                      ? `Upgrade to ${plan.name}`
                      : `Switch to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {currentTier !== "free" && (
        <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-medium text-[var(--foreground)]">
            Manage Subscription
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Update payment method, view invoices, or cancel your subscription.
          </p>
          <button
            onClick={openPortal}
            className="mt-3 rounded-lg border border-[var(--border)] px-4 py-2 font-mono text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            Open Billing Portal
          </button>
        </div>
      )}
    </div>
  );
}
