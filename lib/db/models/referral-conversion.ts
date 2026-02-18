import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReferralConversion extends Document {
  referrerUserId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  checkoutIntentId: mongoose.Types.ObjectId | null;
  stripeCheckoutSessionId: string | null;
  awardedPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const referralConversionSchema = new Schema<IReferralConversion>(
  {
    referrerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    checkoutIntentId: {
      type: Schema.Types.ObjectId,
      ref: "CheckoutIntent",
      default: null,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    awardedPoints: { type: Number, default: 10, min: 1, max: 100 },
  },
  { timestamps: true }
);

referralConversionSchema.index({ referrerUserId: 1, createdAt: -1 });

export const ReferralConversion: Model<IReferralConversion> =
  mongoose.models.ReferralConversion ||
  mongoose.model<IReferralConversion>("ReferralConversion", referralConversionSchema);
