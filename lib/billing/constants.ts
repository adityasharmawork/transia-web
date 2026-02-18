export const PAID_TIERS = ["pro", "team"] as const;

export type PaidTier = (typeof PAID_TIERS)[number];

export function isPaidTier(value: string): value is PaidTier {
  return PAID_TIERS.includes(value as PaidTier);
}
