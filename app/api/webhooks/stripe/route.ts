import { NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  connectDB,
  CheckoutIntent,
  DiscountCoupon,
  ProcessedStripeEvent,
  ReferralConversion,
  Subscription,
  User,
} from "@/lib/db";
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

  const lock = await ProcessedStripeEvent.updateOne(
    { eventId: event.id },
    {
      $setOnInsert: {
        eventId: event.id,
        eventType: event.type,
        status: "processing",
        processedAt: null,
      },
    },
    { upsert: true }
  );

  if (lock.upsertedCount === 0) {
    const existing = await ProcessedStripeEvent.findOne({
      eventId: event.id,
    }).lean();
    if (existing?.status === "processed" || existing?.status === "processing") {
      return NextResponse.json({ received: true });
    }
  }

  try {
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
  } catch (error) {
    await ProcessedStripeEvent.deleteOne({
      eventId: event.id,
      status: "processing",
    }).catch(() => {});

    console.error("Stripe webhook handler failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  try {
    await ProcessedStripeEvent.updateOne(
      { eventId: event.id },
      {
        $set: {
          eventType: event.type,
          status: "processed",
          processedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error("Failed to persist processed Stripe event:", error);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as "pro" | "team" | undefined;
  const checkoutIntentId = session.metadata?.checkoutIntentId;

  if (!userId || !tier) {
    console.error("Checkout session missing userId or tier metadata");
    return;
  }

  if (typeof session.subscription !== "string") {
    console.error("Checkout session missing subscription id");
    return;
  }

  // Retrieve the subscription (with items expanded) to get period end
  const stripeSubscription = await getStripe().subscriptions.retrieve(
    session.subscription
  );
  const periodEnd = stripeSubscription.items.data[0]?.current_period_end ?? 0;
  const now = new Date();

  const dbSession = await mongoose.startSession();
  try {
    await dbSession.withTransaction(async () => {
      await applyCheckoutCompletion({
        userId,
        tier,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCheckoutSessionId: session.id,
        checkoutIntentId,
        periodEnd,
        now,
        dbSession,
      });
    });
  } catch (error) {
    if (!isTransactionUnavailableError(error)) {
      throw error;
    }

    await applyCheckoutCompletion({
      userId,
      tier,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCheckoutSessionId: session.id,
      checkoutIntentId,
      periodEnd,
      now,
      dbSession: null,
    });
  } finally {
    await dbSession.endSession();
  }
}

function isTransactionUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("transaction numbers are only allowed") ||
    message.includes("replica set") ||
    message.includes("mongos")
  );
}

async function applyCheckoutCompletion(input: {
  userId: string;
  tier: "pro" | "team";
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeCheckoutSessionId: string;
  checkoutIntentId?: string;
  periodEnd: number;
  now: Date;
  dbSession: mongoose.ClientSession | null;
}) {
  const {
    userId,
    tier,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCheckoutSessionId,
    checkoutIntentId,
    periodEnd,
    now,
    dbSession,
  } = input;

  await Subscription.findOneAndUpdate(
    { userId },
    {
      userId,
      tier,
      stripeCustomerId,
      stripeSubscriptionId,
      status: "active",
      currentPeriodEnd: new Date(periodEnd * 1000),
    },
    { upsert: true, ...(dbSession ? { session: dbSession } : {}) }
  );

  await User.findByIdAndUpdate(
    userId,
    { tier },
    { ...(dbSession ? { session: dbSession } : {}) }
  );

  const intentLookup: Array<Record<string, unknown>> = [
    { stripeCheckoutSessionId },
  ];
  if (checkoutIntentId && /^[a-f\d]{24}$/i.test(checkoutIntentId)) {
    intentLookup.unshift({ _id: checkoutIntentId });
  }

  const checkoutIntentQuery = CheckoutIntent.findOne({
    userId,
    $or: intentLookup,
  });
  if (dbSession) checkoutIntentQuery.session(dbSession);
  const checkoutIntent = await checkoutIntentQuery;

  if (checkoutIntent && checkoutIntent.status !== "completed") {
    if (
      checkoutIntent.discountSource === "points" &&
      checkoutIntent.pointsToRedeem > 0
    ) {
      await User.updateOne(
        { _id: userId },
        [
          {
            $set: {
              referralPoints: {
                $max: [0, { $subtract: ["$referralPoints", checkoutIntent.pointsToRedeem] }],
              },
            },
          },
        ],
        { ...(dbSession ? { session: dbSession } : {}) }
      );
    }

    if (checkoutIntent.discountSource === "coupon" && checkoutIntent.couponCode) {
      await DiscountCoupon.updateOne(
        { code: checkoutIntent.couponCode },
        { $inc: { redemptionCount: 1 } },
        { ...(dbSession ? { session: dbSession } : {}) }
      );
    }

    if (checkoutIntent.discountSource === "referral") {
      await User.updateOne(
        { _id: userId, referralWelcomeConsumedAt: null },
        { $set: { referralWelcomeConsumedAt: now } },
        { ...(dbSession ? { session: dbSession } : {}) }
      );
    }

    checkoutIntent.status = "completed";
    checkoutIntent.processedAt = now;
    checkoutIntent.stripeCheckoutSessionId =
      checkoutIntent.stripeCheckoutSessionId || stripeCheckoutSessionId;
    await checkoutIntent.save({ ...(dbSession ? { session: dbSession } : {}) });
  }

  const firstPaidTransition = await User.findOneAndUpdate(
    { _id: userId, firstPaidAt: null },
    { $set: { firstPaidAt: now } },
    { new: false, ...(dbSession ? { session: dbSession } : {}) }
  );

  if (!firstPaidTransition?.referredByUserId) return;

  const conversionLookup = ReferralConversion.findOne({ referredUserId: userId });
  if (dbSession) conversionLookup.session(dbSession);
  const existingConversion = await conversionLookup;
  if (existingConversion) return;

  await ReferralConversion.create(
    [
      {
        referrerUserId: firstPaidTransition.referredByUserId,
        referredUserId: userId,
        checkoutIntentId:
          checkoutIntentId && /^[a-f\d]{24}$/i.test(checkoutIntentId)
            ? checkoutIntentId
            : null,
        stripeCheckoutSessionId,
        awardedPoints: 10,
      },
    ],
    dbSession ? { session: dbSession } : undefined
  );

  await User.updateOne(
    { _id: firstPaidTransition.referredByUserId },
    [
      {
        $set: {
          referralPoints: {
            $min: [100, { $add: ["$referralPoints", 10] }],
          },
        },
      },
    ],
    { ...(dbSession ? { session: dbSession } : {}) }
  );
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
