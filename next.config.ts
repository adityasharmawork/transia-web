import type { NextConfig } from "next";
import { buildContentSecurityPolicy } from "./lib/security/csp";

// The Clerk Frontend API origin is derived from the publishable key (dev uses
// *.clerk.accounts.dev; prod uses a customer domain), so the CSP works in prod
// without a hardcoded dev host. `NEXT_PUBLIC_CLERK_FRONTEND_API` can override it.
const contentSecurityPolicy = buildContentSecurityPolicy({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  frontendApiOverride: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
  isDev: process.env.NODE_ENV !== "production",
});

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // X-Powered-By header is disabled by default in Next.js 16+
};

export default nextConfig;
