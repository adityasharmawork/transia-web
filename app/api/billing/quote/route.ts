import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { resolveBestDiscount } from "@/lib/billing/discount-engine";
import { isPaidTier } from "@/lib/billing/constants";
import { TIER_MONTHLY_PRICE_CENTS } from "@/lib/billing/pricing";
import { billingQuoteLimiter, checkRateLimit } from "@/lib/rate-limit";

interface QuoteBody {
  tier: string;
  couponCode?: string;
  redeemPoints?: boolean;
  pointsToRedeem?: number;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const rateLimited = await checkRateLimit(
      billingQuoteLimiter,
      user._id.toString()
    );
    if (rateLimited) return rateLimited;

    const body = (await req.json()) as QuoteBody;

    if (!isPaidTier(body.tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const resolution = await resolveBestDiscount({
      user,
      tier: body.tier,
      couponCode: body.couponCode,
      redeemPoints: body.redeemPoints,
      pointsToRedeem: body.pointsToRedeem,
    });

    if (body.couponCode && resolution.coupon && !resolution.coupon.isValid) {
      return NextResponse.json(
        {
          error: resolution.coupon.reason || "Invalid coupon code",
          coupon: resolution.coupon,
        },
        { status: 400 }
      );
    }

    const basePriceCents = TIER_MONTHLY_PRICE_CENTS[body.tier];
    const finalPriceCents = Math.max(
      0,
      Math.round(basePriceCents * ((100 - resolution.selected.percentOff) / 100))
    );

    return NextResponse.json({
      tier: body.tier,
      basePriceCents,
      finalPriceCents,
      discount: resolution.selected,
      candidates: resolution.candidates,
      coupon: resolution.coupon,
      referralPoints: user.referralPoints,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
