import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

const TOKEN_EXPIRY_DAYS = 90;
const MAX_TOKENS_PER_USER = 10;

export interface ICliToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  label: string;
  expiresAt: Date;
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
  label: { type: String, default: "CLI" },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  },
  createdAt: { type: Date, default: Date.now },
});

// Auto-delete expired tokens
cliTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Enforce max tokens per user. If at limit, delete the oldest token.
 */
export async function enforceTokenLimit(userId: mongoose.Types.ObjectId): Promise<void> {
  const CliTokenModel = mongoose.models.CliToken as Model<ICliToken>;
  const count = await CliTokenModel.countDocuments({ userId });
  if (count >= MAX_TOKENS_PER_USER) {
    const oldest = await CliTokenModel.findOne({ userId }).sort({ createdAt: 1 });
    if (oldest) {
      await oldest.deleteOne();
    }
  }
}

export const CliToken: Model<ICliToken> =
  mongoose.models.CliToken ||
  mongoose.model<ICliToken>("CliToken", cliTokenSchema);
