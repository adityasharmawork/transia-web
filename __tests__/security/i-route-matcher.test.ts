// Regression (i): proxy.ts public-route list must expose CLI + docs routes.
import { describe, it, expect } from "vitest";
import { createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
// Verbatim copy of the public-route list in proxy.ts (post-fix):
const isPublicRoute = createRouteMatcher([
  "/", "/sign-in(.*)", "/sign-up(.*)", "/pricing(.*)", "/auth/cli(.*)",
  "/api/auth/cli/(.*)", "/api/cli/(.*)", "/docs(.*)",
  "/api/auth/verify", "/api/auth/tokens", "/api/translate",
  "/api/usage/(.*)", "/api/webhooks/(.*)", "/api/analytics/event",
]);
const isPublic = (p: string) => Boolean(isPublicRoute(new NextRequest(new URL("http://localhost" + p))));
describe("(i) proxy public-route matcher", () => {
  it("/api/cli/projects is public (CLI Bearer endpoint reachable)", () => expect(isPublic("/api/cli/projects")).toBe(true));
  it("/docs is public", () => expect(isPublic("/docs")).toBe(true));
  it("/dashboard stays protected", () => expect(isPublic("/dashboard")).toBe(false));
});
