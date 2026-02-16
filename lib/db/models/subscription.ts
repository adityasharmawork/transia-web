import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  tier: "pro" | "team";
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["pro", "team"],
      required: true,
    },
    stripeCustomerId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "canceled", "past_due", "trialing"],
      default: "active",
    },
    currentPeriodEnd: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", subscriptionSchema);
