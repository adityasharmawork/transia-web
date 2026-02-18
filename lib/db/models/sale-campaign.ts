import mongoose, { Schema, Document, Model } from "mongoose";

type PaidTier = "pro" | "team";

export interface ISaleCampaign extends Document {
  name: string;
  description: string | null;
  percentOff: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  priority: number;
  allowedTiers: PaidTier[];
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const saleCampaignSchema = new Schema<ISaleCampaign>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    percentOff: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    active: { type: Boolean, default: true, index: true },
    startsAt: { type: Date, default: null, index: true },
    endsAt: { type: Date, default: null, index: true },
    priority: { type: Number, default: 0, index: true },
    allowedTiers: {
      type: [String],
      enum: ["pro", "team"],
      default: ["pro", "team"],
    },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

saleCampaignSchema.index({ active: 1, startsAt: 1, endsAt: 1, priority: -1 });

export const SaleCampaign: Model<ISaleCampaign> =
  mongoose.models.SaleCampaign ||
  mongoose.model<ISaleCampaign>("SaleCampaign", saleCampaignSchema);
