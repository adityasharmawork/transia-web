import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnalyticsEvent extends Document {
  projectId: mongoose.Types.ObjectId;
  eventType: "widget.loaded" | "widget.language_selected";
  locale: string;
  pageUrl: string;
  userAgent: string;
  country: string;
  createdAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    enum: ["widget.loaded", "widget.language_selected"],
    required: true,
  },
  locale: { type: String, default: "" },
  pageUrl: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  country: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Retention visibility per tier (30d Free / 1yr Pro / lifetime Team) is enforced
// at query time by filtering on createdAt. Data is NEVER deleted — all events are
// permanently retained for potential upselling of historical data access.

analyticsEventSchema.index({ projectId: 1, createdAt: -1 });
analyticsEventSchema.index({ projectId: 1, eventType: 1, createdAt: -1 });

export const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", analyticsEventSchema);
