// Regression (h): analytics/event must strip pageUrl query/hash, reduce UA to a
// family, and honour a per-project Origin allowlist when configured.
import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

vi.mock("@/lib/rate-limit", () => ({ analyticsEventLimiter: {}, getClientIp: () => "1.2.3.4", checkRateLimit: vi.fn(async () => null) }));
vi.mock("next/headers", () => ({ headers: async () => ({ get: (k: string) => (k === "user-agent" ? "Mozilla/5.0 (X11) Chrome/120.0 Safari/537.36" : "") }) }));

const PUBLIC_KEY = "trn_pub_" + "a".repeat(32);
const PROJECT_ID = new mongoose.Types.ObjectId();
const inserted = vi.hoisted(() => ({ docs: [] as any[] }));
const row = vi.hoisted(() => ({ project: null as any }));
vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => {}),
  Project: { find: vi.fn(() => ({ lean: vi.fn(async () => [row.project]) })) },
  AnalyticsEvent: { insertMany: vi.fn(async (docs: any[]) => { inserted.docs.push(...docs); return docs; }) },
}));
import { POST } from "@/app/api/analytics/event/route";

const PAGE_URL = "https://app.example/checkout?session_id=cs_live_SECRET123&email=user@corp.example";
const mkReq = (origin: string) => new Request("http://localhost/api/analytics/event", {
  method: "POST", headers: { "content-type": "application/json", Origin: origin },
  body: JSON.stringify({ events: [{ projectId: PUBLIC_KEY, eventType: "widget.loaded", locale: "en", pageUrl: PAGE_URL }] }),
});
beforeEach(() => { vi.clearAllMocks(); inserted.docs = []; });

describe("(h) analytics/event privacy + origin allowlist", () => {
  it("no allowlist: accepted, but pageUrl query/hash stripped and UA reduced to a family", async () => {
    row.project = { publicKey: PUBLIC_KEY, _id: PROJECT_ID, analyticsEnabled: true }; // no allowedOrigins
    const res = await POST(mkReq("https://attacker.evil.example"));
    expect((await res.json()).success).toBe(true);
    expect(inserted.docs).toHaveLength(1);
    expect(inserted.docs[0].pageUrl).toBe("https://app.example/checkout");
    expect(inserted.docs[0].pageUrl).not.toContain("cs_live_SECRET123");
    expect(inserted.docs[0].pageUrl).not.toContain("email=");
    expect(inserted.docs[0].userAgent).toBe("Chrome");
  });
  it("allowlist set: a foreign Origin is dropped", async () => {
    row.project = { publicKey: PUBLIC_KEY, _id: PROJECT_ID, analyticsEnabled: true, allowedOrigins: ["https://app.example"] };
    const res = await POST(mkReq("https://attacker.evil.example"));
    expect((await res.json()).success).toBe(true); // request ok, but event dropped
    expect(inserted.docs).toHaveLength(0);
  });
  it("allowlist set: the matching Origin is accepted", async () => {
    row.project = { publicKey: PUBLIC_KEY, _id: PROJECT_ID, analyticsEnabled: true, allowedOrigins: ["https://app.example"] };
    await POST(mkReq("https://app.example"));
    expect(inserted.docs).toHaveLength(1);
  });
});
