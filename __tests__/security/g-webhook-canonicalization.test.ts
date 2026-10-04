// Regression (g): app/api/webhooks/clerk/route.ts must verify the RAW body,
// so a legitimately signed (pretty-printed) delivery is accepted.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Webhook } from "svix";

const hdrs = vi.hoisted(() => ({ store: {} as Record<string, string> }));
vi.mock("next/headers", () => ({ headers: async () => ({ get: (k: string) => hdrs.store[k] ?? null }) }));
vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => {}),
  User: { findOneAndUpdate: vi.fn(async () => ({ _id: "u1", referralCode: "R1" })), findOneAndDelete: vi.fn(async () => ({})) },
}));
vi.mock("@/lib/referrals", () => ({ ensureUserReferralCode: vi.fn(async () => "CODE") }));
const SECRET = "whsec_" + Buffer.from("transia-clerk-webhook-test-secret!!").toString("base64");
process.env.CLERK_WEBHOOK_SECRET = SECRET;
import { POST } from "@/app/api/webhooks/clerk/route";

const payload = { type: "user.created", data: { id: "user_abc", email_addresses: [{ email_address: "new@corp.example" }], first_name: "New", last_name: "User" } };
let rawBody: string;
beforeEach(() => {
  const wh = new Webhook(SECRET);
  rawBody = JSON.stringify(payload, null, 2); // pretty-printed: differs from compact re-serialization
  const date = new Date();
  hdrs.store = { "svix-id": "msg_canon_test", "svix-timestamp": String(Math.floor(date.getTime() / 1000)), "svix-signature": wh.sign("msg_canon_test", date, rawBody) };
});

describe("(g) clerk webhook accepts a legit pretty-printed delivery", () => {
  it("verifies the raw bytes and returns success (not a 400 invalid-signature)", async () => {
    const req = new Request("http://localhost/api/webhooks/clerk", { method: "POST", headers: { "content-type": "application/json" }, body: rawBody });
    const res = await POST(req);
    const json: any = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
