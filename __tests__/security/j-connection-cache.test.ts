// Regression (j): connectDB must reset a rejected promise so a later call retries;
// and mongoose.ts must enable sanitizeFilter globally.
import { describe, it, expect, vi, beforeEach } from "vitest";
const m = vi.hoisted(() => ({ connect: vi.fn(), set: vi.fn() }));
vi.mock("mongoose", () => ({ default: { connect: m.connect, set: m.set } }));
beforeEach(() => {
  vi.resetModules();
  delete (globalThis as any).mongooseCache;
  m.connect.mockReset(); m.set.mockReset();
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/audit";
});
describe("(j) connectDB recovers; sanitizeFilter on", () => {
  it("after a failed connect, the next call retries and succeeds", async () => {
    let n = 0;
    m.connect.mockImplementation(() => (++n === 1
      ? Promise.reject(new Error("ECONNREFUSED (db down)"))
      : Promise.resolve({ ok: true })));
    const { connectDB } = await import("@/lib/db/mongoose");
    await expect(connectDB()).rejects.toThrow("ECONNREFUSED");
    await expect(connectDB()).resolves.toEqual({ ok: true });
    expect(m.connect).toHaveBeenCalledTimes(2);
  });
  it("sanitizeFilter is enabled on import", async () => {
    await import("@/lib/db/mongoose");
    expect(m.set).toHaveBeenCalledWith("sanitizeFilter", true);
  });
});
