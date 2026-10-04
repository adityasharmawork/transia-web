// Regression (b): app/api/auth/cli/confirm/route.ts must reject non-string sessionToken.
import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

const clerk = vi.hoisted(() => ({ auth: vi.fn(), clerkClient: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => clerk);
const db = vi.hoisted(() => ({
  connectDB: vi.fn(async () => {}),
  CliSession: { findOne: vi.fn() },
  User: { findOne: vi.fn(), findOneAndUpdate: vi.fn() },
}));
vi.mock("@/lib/db", () => db);
vi.mock("@/lib/referrals", () => ({ ensureUserReferralCode: vi.fn(async () => "CODE1234") }));
import { POST } from "@/app/api/auth/cli/confirm/route";

const req = (sessionToken: unknown) => new Request("http://localhost/api/auth/cli/confirm", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionToken }),
});
beforeEach(() => vi.clearAllMocks());

describe("(b) confirm route rejects operator injection", () => {
  it("a signed-in caller sending a filter object gets 400; no session is looked up or bound", async () => {
    clerk.auth.mockResolvedValue({ userId: "clerk_attacker" });
    db.User.findOne.mockResolvedValue({ _id: new mongoose.Types.ObjectId(), clerkId: "clerk_attacker" });
    const res = await POST(req({ $ne: null }));
    expect(res.status).toBe(400);
    expect(db.CliSession.findOne).not.toHaveBeenCalled();
  });
});
