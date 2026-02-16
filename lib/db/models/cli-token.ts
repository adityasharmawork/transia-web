import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface ICliToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  createdAt: Date;
}

const cliTokenSchema = new Schema<ICliToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  tokenHash: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const CliToken: Model<ICliToken> =
  mongoose.models.CliToken ||
  mongoose.model<ICliToken>("CliToken", cliTokenSchema);
