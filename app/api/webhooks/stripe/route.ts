import { NextResponse } from "next/server";
import { connectDB, User, Subscription } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }

    default:
      // Unhandled event type — acknowledge it
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as "pro" | "team" | undefined;

  if (!userId || !tier) {
    console.error("Checkout session missing userId or tier metadata");
    return;
  }

  // Retrieve the subscription (with items expanded) to get period end
  const stripeSubscription = await getStripe().subscriptions.retrieve(
    session.subscription as string
  );
  const periodEnd = stripeSubscription.items.data[0]?.current_period_end ?? 0;

  // Upsert subscription record
  await Subscription.findOneAndUpdate(
    { userId },
    {
      userId,
      tier,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      status: "active",
      currentPeriodEnd: new Date(periodEnd * 1000),
    },
    { upsert: true }
  );

  // Update user tier
  await User.findByIdAndUpdate(userId, { tier });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  });
  if (!sub) return;

  const tier = (subscription.metadata?.tier as "pro" | "team") || sub.tier;
  const status = mapStripeStatus(subscription.status);

  sub.tier = tier;
  sub.status = status;
  const periodEnd = subscription.items.data[0]?.current_period_end ?? 0;
  sub.currentPeriodEnd = new Date(periodEnd * 1000);
  await sub.save();

  // Only update user tier if subscription is active
  if (status === "active") {
    await User.findByIdAndUpdate(sub.userId, { tier });
  } else if (status === "canceled") {
    // Downgrade at period end — Stripe sends this when cancel_at_period_end = true.
    // The user keeps access until currentPeriodEnd, then subscription.deleted fires.
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  });
  if (!sub) return;

  // Downgrade user to free tier
  await User.findByIdAndUpdate(sub.userId, { tier: "free" });

  sub.status = "canceled";
  await sub.save();
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  if (!subscriptionRef) return;

  const subscriptionId = typeof subscriptionRef === "string"
    ? subscriptionRef
    : subscriptionRef.id;

  const sub = await Subscription.findOne({
    stripeSubscriptionId: subscriptionId,
  });
  if (!sub) return;

  sub.status = "past_due";
  await sub.save();
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): "active" | "canceled" | "past_due" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    default:
      return "canceled";
  }
}
