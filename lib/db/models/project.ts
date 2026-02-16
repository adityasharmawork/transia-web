import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  apiKey: string;
  sourceLocale: string;
  targetLocales: string[];
  outputFormat: "next-intl" | "i18next";
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `trn_live_${crypto.randomBytes(24).toString("hex")}`,
    },
    sourceLocale: { type: String, default: "en" },
    targetLocales: { type: [String], default: [] },
    outputFormat: {
      type: String,
      enum: ["next-intl", "i18next"],
      default: "next-intl",
    },
  },
  { timestamps: true }
);

projectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Project: Model<IProject> =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", projectSchema);
