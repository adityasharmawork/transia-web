import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, Subscription } from "@/lib/db";
import { getStripe, PRICE_IDS } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { tier } = (await req.json()) as { tier: string };

    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    await connectDB();

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

    const origin = req.headers.get("origin") || "https://transia.dev";

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/billing?success=true`,
      cancel_url: `${origin}/dashboard/billing?canceled=true`,
      metadata: { userId: user._id.toString(), tier },
      subscription_data: {
        metadata: { userId: user._id.toString(), tier },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
