import mongoose, { Schema, Document, Model } from "mongoose";

export type CheckoutDiscountSource =
  | "none"
  | "coupon"
  | "campaign"
  | "referral"
  | "points";

export interface ICheckoutIntent extends Document {
  userId: mongoose.Types.ObjectId;
  tier: "pro" | "team";
  discountSource: CheckoutDiscountSource;
  discountPercent: number;
  couponCode: string | null;
  campaignId: mongoose.Types.ObjectId | null;
  pointsToRedeem: number;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string | null;
  status: "pending" | "completed" | "failed" | "canceled";
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const checkoutIntentSchema = new Schema<ICheckoutIntent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["pro", "team"],
      required: true,
    },
    discountSource: {
      type: String,
      enum: ["none", "coupon", "campaign", "referral", "points"],
      default: "none",
      index: true,
    },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    couponCode: { type: String, default: null },
    campaignId: { type: Schema.Types.ObjectId, ref: "SaleCampaign", default: null },
    pointsToRedeem: { type: Number, default: 0, min: 0, max: 100 },
    stripeCustomerId: { type: String, default: null },
    stripeCheckoutSessionId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "canceled"],
      default: "pending",
      index: true,
    },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

checkoutIntentSchema.index({ userId: 1, createdAt: -1 });

export const CheckoutIntent: Model<ICheckoutIntent> =
  mongoose.models.CheckoutIntent ||
  mongoose.model<ICheckoutIntent>("CheckoutIntent", checkoutIntentSchema);
