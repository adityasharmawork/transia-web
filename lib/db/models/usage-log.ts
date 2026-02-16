import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUsageLog extends Document {
  projectId: mongoose.Types.ObjectId;
  stringsTranslated: number;
  tokensUsed: number;
  provider: string;
  locale: string;
  createdAt: Date;
}

const usageLogSchema = new Schema<IUsageLog>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true,
  },
  stringsTranslated: { type: Number, required: true },
  tokensUsed: { type: Number, required: true },
  provider: { type: String, required: true },
  locale: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

usageLogSchema.index({ projectId: 1, createdAt: -1 });

export const UsageLog: Model<IUsageLog> =
  mongoose.models.UsageLog ||
  mongoose.model<IUsageLog>("UsageLog", usageLogSchema);
