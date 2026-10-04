// Regression (f): referralCode / stripeCheckoutSessionId must be ABSENT (undefined) when omitted,
// so the sparse unique index skips them (no false collision).
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { User } from "@/lib/db/models/user";
import { CheckoutIntent } from "@/lib/db/models/checkout-intent";

describe("(f) sparse+unique indexes no longer defeated by default:null", () => {
  it("User.referralCode: omitted -> undefined, no default, still unique+sparse", () => {
    const u = new User({ clerkId: "c1", email: "a@b.example", name: "A" });
    expect(u.referralCode).toBeUndefined();
    const opts: any = User.schema.path("referralCode").options;
    expect(opts.default).toBeUndefined();
    expect(opts.unique).toBe(true);
    expect(opts.sparse).toBe(true);
  });
  it("CheckoutIntent.stripeCheckoutSessionId: omitted -> undefined, no default, still unique+sparse", () => {
    const c = new CheckoutIntent({ userId: new mongoose.Types.ObjectId(), tier: "pro" });
    expect(c.stripeCheckoutSessionId).toBeUndefined();
    const opts: any = CheckoutIntent.schema.path("stripeCheckoutSessionId").options;
    expect(opts.default).toBeUndefined();
    expect(opts.unique).toBe(true);
    expect(opts.sparse).toBe(true);
  });
});
