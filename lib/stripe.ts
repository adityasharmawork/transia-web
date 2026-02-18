import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Map tier names to Stripe Price IDs.
 * Set these in your .env after creating Products + Prices in the Stripe dashboard.
 */
export const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO || "",
  team: process.env.STRIPE_PRICE_TEAM || "",
};
