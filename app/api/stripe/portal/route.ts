import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, Subscription } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await connectDB();

    const sub = await Subscription.findOne({ userId: user._id }).lean();
    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const origin = req.headers.get("origin") || "https://transia.dev";

    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
