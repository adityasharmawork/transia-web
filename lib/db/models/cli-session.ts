import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface ICliSession extends Document {
  sessionToken: string;
  userId: mongoose.Types.ObjectId | null;
  status: "pending" | "confirmed" | "expired";
  expiresAt: Date;
  createdAt: Date;
}

const cliSessionSchema = new Schema<ICliSession>({
  sessionToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: () => crypto.randomBytes(32).toString("hex"),
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "expired"],
    default: "pending",
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
  createdAt: { type: Date, default: Date.now },
});

// Auto-delete expired sessions
cliSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CliSession: Model<ICliSession> =
  mongoose.models.CliSession ||
  mongoose.model<ICliSession>("CliSession", cliSessionSchema);
