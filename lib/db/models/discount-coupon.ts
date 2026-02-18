import mongoose, { Schema, Document, Model } from "mongoose";

type PaidTier = "pro" | "team";

export interface IDiscountCoupon extends Document {
  code: string;
  percentOff: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  allowedTiers: PaidTier[];
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const discountCouponSchema = new Schema<IDiscountCoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      set: (value: string) => value.trim().toUpperCase(),
    },
    percentOff: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    active: { type: Boolean, default: true, index: true },
    startsAt: { type: Date, default: null, index: true },
    endsAt: { type: Date, default: null, index: true },
    maxRedemptions: { type: Number, default: null, min: 1 },
    redemptionCount: { type: Number, default: 0, min: 0 },
    allowedTiers: {
      type: [String],
      enum: ["pro", "team"],
      default: ["pro", "team"],
    },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

discountCouponSchema.index({ active: 1, startsAt: 1, endsAt: 1 });

export const DiscountCoupon: Model<IDiscountCoupon> =
  mongoose.models.DiscountCoupon ||
  mongoose.model<IDiscountCoupon>("DiscountCoupon", discountCouponSchema);
