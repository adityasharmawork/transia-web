import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  tier: "free" | "pro" | "team";
  referralCode: string | null;
  referredByUserId: mongoose.Types.ObjectId | null;
  referralPoints: number;
  firstPaidAt: Date | null;
  referralWelcomeConsumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tier: {
      type: String,
      enum: ["free", "pro", "team"],
      default: "free",
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      default: null,
    },
    referredByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    referralPoints: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    firstPaidAt: { type: Date, default: null },
    referralWelcomeConsumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
