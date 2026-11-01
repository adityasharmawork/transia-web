// Regression (e): app/api/usage/log/route.ts must clamp negative/non-integer counts to 0.
import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import crypto from "crypto";
vi.mock("@/lib/rate-limit", () => ({ usageLogLimiter: {}, checkRateLimit: vi.fn(async () => null) }));
const USER_ID = new mongoose.Types.ObjectId();
const PROJECT_ID = new mongoose.Types.ObjectId();
const logs = vi.hoisted(() => ({ rows: [] as any[] }));
const db = vi.hoisted(() => ({
  connectDB: vi.fn(async () => {}),
  CliToken: { findOne: vi.fn() },
  Project: { findOne: vi.fn() },
  UsageLog: { create: vi.fn() },
  hashToken: (t: string) => crypto.createHash("sha256").update(t).digest("hex"),
  hashApiKey: (k: string) => crypto.createHash("sha256").update(k).digest("hex"),
}));
vi.mock("@/lib/db", () => db);
import { POST } from "@/app/api/usage/log/route";
beforeEach(() => {
  vi.clearAllMocks(); logs.rows = [];
  db.CliToken.findOne.mockResolvedValue({ userId: USER_ID });
  db.Project.findOne.mockResolvedValue({ _id: PROJECT_ID, userId: USER_ID });
  db.UsageLog.create.mockImplementation(async (d: any) => { logs.rows.push(d); return d; });
});
const req = (body: unknown) => new Request("http://localhost/api/usage/log", {
  method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer trn_cli_validtoken" }, body: JSON.stringify(body),
});
const sum = (rows: { stringsTranslated: number }[]) => rows.reduce((t, r) => t + (r.stringsTranslated ?? 0), 0);

describe("(e) usage/log clamps bad counts", () => {
  it("a negative stringsTranslated is stored as 0 and cannot lower the quota sum", async () => {
    logs.rows.push({ projectId: PROJECT_ID, stringsTranslated: 10000 });
    const res = await POST(req({ projectApiKey: "trn_live_realkey", stringsTranslated: -100000 }));
    expect((await res.json()).success).toBe(true);
    const injected = logs.rows.find((r) => r.projectId === PROJECT_ID && r.stringsTranslated === -100000);
    expect(injected).toBeUndefined();
    expect(sum(logs.rows)).toBe(10000);
  });
  it("a fractional count is clamped to 0", async () => {
    await POST(req({ projectApiKey: "trn_live_realkey", stringsTranslated: 3.7 }));
    expect(logs.rows.at(-1).stringsTranslated).toBe(0);
  });
});
