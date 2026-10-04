// Regression (a): app/api/auth/cli/status/route.ts must reject non-string session.
import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

const db = vi.hoisted(() => ({
  connectDB: vi.fn(async () => {}),
  CliSession: { findOne: vi.fn(), deleteOne: vi.fn(async () => ({})) },
  CliToken: { create: vi.fn(async () => ({})) },
  User: { findById: vi.fn() },
  enforceTokenLimit: vi.fn(async () => {}),
  hashToken: (t: string) => crypto.createHash("sha256").update(t).digest("hex"),
}));
vi.mock("@/lib/db", () => db);
import { POST } from "@/app/api/auth/cli/status/route";

const req = (session: unknown) => new Request("http://localhost/api/auth/cli/status", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session }),
});
beforeEach(() => vi.clearAllMocks());

describe("(a) status route rejects operator injection", () => {
  it("a filter object is rejected with 400 and never reaches the query", async () => {
    for (const bad of [{ $ne: null }, { $regex: "^ab" }, ["x"], 5, null]) {
      const res = await POST(req(bad));
      expect(res.status).toBe(400);
    }
    expect(db.CliSession.findOne).not.toHaveBeenCalled();
    expect(db.CliToken.create).not.toHaveBeenCalled();
  });
  it("a string session is still accepted (equality query)", async () => {
    db.CliSession.findOne.mockResolvedValue(null);
    const res = await POST(req("abc123session"));
    expect(res.status).toBe(200);
    expect(db.CliSession.findOne).toHaveBeenCalledWith({ sessionToken: "abc123session" });
  });
});
