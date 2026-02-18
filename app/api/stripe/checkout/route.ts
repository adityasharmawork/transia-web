import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isPaidTier } from "@/lib/billing/constants";
import { resolveBestDiscount } from "@/lib/billing/discount-engine";
import { connectDB, CheckoutIntent, Subscription } from "@/lib/db";
import { billingCheckoutLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getStripe, PRICE_IDS } from "@/lib/stripe";
import { getAppBaseUrl } from "@/lib/url";

interface CheckoutBody {
  tier: string;
  couponCode?: string;
  redeemPoints?: boolean;
  pointsToRedeem?: number;
}

export async function POST(req: Request) {
  let intentId: string | null = null;

  try {
    const user = await requireUser();
    const rateLimited = await checkRateLimit(
      billingCheckoutLimiter,
      user._id.toString()
    );
    if (rateLimited) return rateLimited;

    const body = (await req.json()) as CheckoutBody;
    const { tier } = body;

    if (!isPaidTier(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    await connectDB();

    const discount = await resolveBestDiscount({
      user,
      tier,
      couponCode: body.couponCode,
      redeemPoints: body.redeemPoints,
      pointsToRedeem: body.pointsToRedeem,
    });

    if (body.couponCode && discount.coupon && !discount.coupon.isValid) {
      return NextResponse.json(
        { error: discount.coupon.reason || "Invalid coupon code" },
        { status: 400 }
      );
    }

    if (discount.selected.source === "points") {
      const pendingWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const pendingPointsIntent = await CheckoutIntent.findOne({
        userId: user._id,
        discountSource: "points",
        status: "pending",
        createdAt: { $gte: pendingWindowStart },
      }).lean();

      if (pendingPointsIntent) {
        return NextResponse.json(
          {
            error:
              "A points redemption checkout is already pending. Complete or wait for it to expire before creating another.",
          },
          { status: 409 }
        );
      }
    }

    // Reuse existing Stripe customer if one exists
    const existingSub = await Subscription.findOne({ userId: user._id }).lean();
    let customerId = existingSub?.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { userId: user._id.toString(), clerkId: user.clerkId },
      });
      customerId = customer.id;
    }

    const intent = await CheckoutIntent.create({
      userId: user._id,
      tier,
      discountSource: discount.selected.source,
      discountPercent: discount.selected.percentOff,
      couponCode: discount.selected.couponCode ?? null,
      campaignId: discount.selected.campaignId ?? null,
      pointsToRedeem: discount.selected.pointsToRedeem ?? 0,
      stripeCustomerId: customerId,
      status: "pending",
    });
    intentId = intent._id.toString();

    let oneCycleCouponId: string | undefined;
    if (discount.selected.percentOff > 0) {
      const coupon = await getStripe().coupons.create({
        percent_off: discount.selected.percentOff,
        duration: "once",
        name: `Transia ${discount.selected.label}`.slice(0, 40),
        metadata: {
          userId: user._id.toString(),
          checkoutIntentId: intentId,
          discountSource: discount.selected.source,
        },
      });
      oneCycleCouponId = coupon.id;
    }

    const appBaseUrl = getAppBaseUrl();

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appBaseUrl}/dashboard/billing?success=true`,
      cancel_url: `${appBaseUrl}/dashboard/billing?canceled=true`,
      metadata: { userId: user._id.toString(), tier, checkoutIntentId: intentId },
      subscription_data: {
        metadata: { userId: user._id.toString(), tier, checkoutIntentId: intentId },
      },
      discounts: oneCycleCouponId ? [{ coupon: oneCycleCouponId }] : undefined,
      payment_method_collection:
        discount.selected.percentOff === 100 ? "if_required" : undefined,
    });

    await CheckoutIntent.findByIdAndUpdate(intent._id, {
      stripeCheckoutSessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (intentId) {
      await CheckoutIntent.findByIdAndUpdate(intentId, {
        status: "failed",
        processedAt: new Date(),
      }).catch(() => {});
    }

    console.error("Stripe checkout error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
