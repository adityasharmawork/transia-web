import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProcessedStripeEvent extends Document {
  eventId: string;
  eventType: string;
  status: "processing" | "processed";
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const processedStripeEventSchema = new Schema<IProcessedStripeEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["processing", "processed"],
      default: "processing",
      index: true,
    },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const ProcessedStripeEvent: Model<IProcessedStripeEvent> =
  mongoose.models.ProcessedStripeEvent ||
  mongoose.model<IProcessedStripeEvent>(
    "ProcessedStripeEvent",
    processedStripeEventSchema
  );
