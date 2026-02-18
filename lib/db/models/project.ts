import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
  publicKey: string;
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
    apiKeyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    apiKeyPrefix: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `trn_pub_${crypto.randomBytes(16).toString("hex")}`,
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

/**
 * Generate a new API key and return the full key, its hash, and a display prefix.
 * The full key is only returned at creation time — it is never stored.
 */
export function generateApiKey(): {
  fullKey: string;
  hash: string;
  prefix: string;
} {
  const fullKey = `trn_live_${crypto.randomBytes(24).toString("hex")}`;
  return {
    fullKey,
    hash: hashApiKey(fullKey),
    prefix: `${fullKey.slice(0, 16)}...${fullKey.slice(-4)}`,
  };
}

/**
 * Hash an API key for storage or lookup.
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
