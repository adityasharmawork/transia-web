import type { CheckoutDiscountSource, IUser } from "@/lib/db";
import { DiscountCoupon, SaleCampaign } from "@/lib/db";
import type { PaidTier } from "./constants";

const COUPON_CODE_RE = /^[A-Z0-9_-]{3,32}$/;

const SOURCE_TIEBREAKER: Record<CheckoutDiscountSource, number> = {
  coupon: 1,
  campaign: 2,
  referral: 3,
  points: 4,
  none: 5,
};

export interface DiscountCandidate {
  source: CheckoutDiscountSource;
  percentOff: number;
  label: string;
  couponCode?: string;
  campaignId?: string;
  pointsToRedeem?: number;
}

interface CouponStatus {
  providedCode: string;
  normalizedCode: string | null;
  isValid: boolean;
  reason: string | null;
}

export interface DiscountResolution {
  selected: DiscountCandidate;
  candidates: DiscountCandidate[];
  coupon: CouponStatus | null;
}

export interface ResolveDiscountInput {
  user: IUser;
  tier: PaidTier;
  couponCode?: string | null;
  redeemPoints?: boolean;
  pointsToRedeem?: number | null;
  now?: Date;
}

function normalizeCouponCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  if (!COUPON_CODE_RE.test(normalized)) return null;
  return normalized;
}

function isNowWithinWindow(
  now: Date,
  startsAt: Date | null | undefined,
  endsAt: Date | null | undefined
): boolean {
  if (startsAt && startsAt.getTime() > now.getTime()) return false;
  if (endsAt && endsAt.getTime() < now.getTime()) return false;
  return true;
}

export async function resolveBestDiscount(
  input: ResolveDiscountInput
): Promise<DiscountResolution> {
  const now = input.now ?? new Date();
  const candidates: DiscountCandidate[] = [];
  let couponStatus: CouponStatus | null = null;

  if (input.couponCode && input.couponCode.trim().length > 0) {
    const normalized = normalizeCouponCode(input.couponCode);
    couponStatus = {
      providedCode: input.couponCode,
      normalizedCode: normalized,
      isValid: false,
      reason: null,
    };

    if (!normalized) {
      couponStatus.reason = "Invalid coupon code format";
    } else {
      const coupon = await DiscountCoupon.findOne({ code: normalized }).lean();
      if (!coupon) {
        couponStatus.reason = "Coupon code not found";
      } else if (!coupon.active) {
        couponStatus.reason = "Coupon is not active";
      } else if (!coupon.allowedTiers.includes(input.tier)) {
        couponStatus.reason = "Coupon does not apply to this plan";
      } else if (!isNowWithinWindow(now, coupon.startsAt, coupon.endsAt)) {
        couponStatus.reason = "Coupon is outside its active window";
      } else if (
        coupon.maxRedemptions !== null &&
        coupon.redemptionCount >= coupon.maxRedemptions
      ) {
        couponStatus.reason = "Coupon redemption limit reached";
      } else {
        couponStatus.isValid = true;
        candidates.push({
          source: "coupon",
          percentOff: coupon.percentOff,
          label: `Coupon ${coupon.code}`,
          couponCode: coupon.code,
        });
      }
    }
  }

  const campaign = await SaleCampaign.findOne({
    active: true,
    allowedTiers: input.tier,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .sort({ percentOff: -1, priority: -1, createdAt: 1 })
    .lean();

  if (campaign) {
    candidates.push({
      source: "campaign",
      percentOff: campaign.percentOff,
      label: campaign.name,
      campaignId: campaign._id.toString(),
    });
  }

  if (
    input.user.referredByUserId &&
    !input.user.firstPaidAt &&
    !input.user.referralWelcomeConsumedAt
  ) {
    candidates.push({
      source: "referral",
      percentOff: 20,
      label: "Referral welcome discount",
    });
  }

  if (input.redeemPoints && input.user.referralPoints > 0) {
    const requested = Math.floor(
      input.pointsToRedeem && input.pointsToRedeem > 0
        ? input.pointsToRedeem
        : input.user.referralPoints
    );
    const pointsToRedeem = Math.max(
      1,
      Math.min(requested, input.user.referralPoints, 100)
    );
    candidates.push({
      source: "points",
      percentOff: pointsToRedeem,
      pointsToRedeem,
      label: `Referral points (${pointsToRedeem}%)`,
    });
  }

  if (candidates.length === 0) {
    return {
      selected: {
        source: "none",
        percentOff: 0,
        label: "No discount",
      },
      candidates: [],
      coupon: couponStatus,
    };
  }

  candidates.sort((a, b) => {
    if (a.percentOff !== b.percentOff) return b.percentOff - a.percentOff;
    return SOURCE_TIEBREAKER[a.source] - SOURCE_TIEBREAKER[b.source];
  });

  return {
    selected: candidates[0],
    candidates,
    coupon: couponStatus,
  };
}
