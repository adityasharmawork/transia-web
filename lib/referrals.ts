import crypto from "crypto";
import mongoose from "mongoose";
import { User } from "@/lib/db";

const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_REFERRAL_CODE_LENGTH = 8;

export function generateReferralCode(length = DEFAULT_REFERRAL_CODE_LENGTH): string {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += REFERRAL_CODE_ALPHABET[bytes[i] % REFERRAL_CODE_ALPHABET.length];
  }
  return code;
}

export async function ensureUserReferralCode(
  userId: mongoose.Types.ObjectId | string
): Promise<string> {
  const existing = await User.findById(userId).select("referralCode").lean();
  if (existing?.referralCode) return existing.referralCode;

  for (let i = 0; i < 12; i += 1) {
    const code = generateReferralCode();
    try {
      await User.updateOne(
        { _id: userId, referralCode: null },
        { $set: { referralCode: code } }
      );
      const updated = await User.findById(userId).select("referralCode").lean();
      if (updated?.referralCode) return updated.referralCode;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: number }).code === 11000
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Unable to generate a unique referral code");
}
