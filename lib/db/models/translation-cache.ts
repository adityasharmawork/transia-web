import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface ITranslationCache extends Document {
  hash: string;
  original: string;
  sourceLocale: string;
  targetLocale: string;
  translated: string;
  provider: string;
  hitCount: number;
  createdAt: Date;
}

const translationCacheSchema = new Schema<ITranslationCache>({
  hash: { type: String, required: true, unique: true, index: true },
  original: { type: String, required: true },
  sourceLocale: { type: String, required: true },
  targetLocale: { type: String, required: true },
  translated: { type: String, required: true },
  provider: { type: String, required: true },
  hitCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// TTL: cache entries expire after 90 days of inactivity
translationCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const TranslationCache: Model<ITranslationCache> =
  mongoose.models.TranslationCache ||
  mongoose.model<ITranslationCache>("TranslationCache", translationCacheSchema);

/**
 * Generate a cache key hash from the original string and locale pair.
 */
export function cacheHash(original: string, sourceLocale: string, targetLocale: string): string {
  return crypto
    .createHash("sha256")
    .update(`${original}|${sourceLocale}|${targetLocale}`)
    .digest("hex");
}
