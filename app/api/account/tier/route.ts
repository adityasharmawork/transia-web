import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ensureUserReferralCode } from "@/lib/referrals";

export async function GET() {
  try {
    const user = await requireUser();
    let referralCode = user.referralCode;
    if (!referralCode) {
      try {
        referralCode = await ensureUserReferralCode(user._id);
      } catch {
        referralCode = null;
      }
    }

    return NextResponse.json({
      tier: user.tier,
      email: user.email,
      name: user.name,
      referralCode,
      referralPoints: user.referralPoints,
      referredByUserId: user.referredByUserId,
      firstPaidAt: user.firstPaidAt,
      canClaimReferral: !user.referredByUserId && !user.firstPaidAt,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// Tier changes are handled exclusively via Stripe webhooks.
// See /api/webhooks/stripe for the implementation.
export async function POST() {
  return NextResponse.json(
    { error: "Tier changes are managed through billing. Visit /dashboard/billing to upgrade." },
    { status: 403 }
  );
}
