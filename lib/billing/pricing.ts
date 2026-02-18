import type { PaidTier } from "./constants";

export const TIER_MONTHLY_PRICE_CENTS: Record<PaidTier, number> = {
  pro: 1500,
  team: 4900,
};
