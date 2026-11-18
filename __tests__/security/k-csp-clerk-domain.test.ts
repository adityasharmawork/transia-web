import { describe, it, expect } from "vitest";
import {
  parseClerkFapiHost,
  buildContentSecurityPolicy,
} from "@/lib/security/csp";

// Clerk publishable keys are `pk_(test|live)_<base64(fapiHost + "$")>`.
const makeKey = (prefix: "test" | "live", host: string) =>
  `pk_${prefix}_${Buffer.from(`${host}$`).toString("base64")}`;

const PROD_HOST = "clerk.transia.dev";
const DEV_HOST = "relaxed-kangaroo-42.clerk.accounts.dev";
const LIVE_KEY = makeKey("live", PROD_HOST);
const TEST_KEY = makeKey("test", DEV_HOST);

describe("parseClerkFapiHost", () => {
  it("decodes the production FAPI host from a live key", () => {
    expect(parseClerkFapiHost(LIVE_KEY)).toBe(PROD_HOST);
  });

  it("decodes the dev FAPI host from a test key", () => {
    expect(parseClerkFapiHost(TEST_KEY)).toBe(DEV_HOST);
  });

  it("strips the trailing `$` sentinel", () => {
    const host = parseClerkFapiHost(LIVE_KEY);
    expect(host?.endsWith("$")).toBe(false);
  });

  it("returns null for an undefined or empty key", () => {
    expect(parseClerkFapiHost(undefined)).toBeNull();
    expect(parseClerkFapiHost("")).toBeNull();
  });

  it("returns null for a key without the pk_ prefix", () => {
    expect(parseClerkFapiHost("sk_live_whatever")).toBeNull();
    expect(parseClerkFapiHost("not-a-key")).toBeNull();
  });

  it("returns null when the decoded value is not a bare hostname (scheme/path)", () => {
    const evilScheme = `pk_live_${Buffer.from("https://evil.com$").toString("base64")}`;
    const evilPath = `pk_live_${Buffer.from("clerk.transia.dev/../x$").toString("base64")}`;
    const evilSpace = `pk_live_${Buffer.from("clerk.transia.dev evil.com$").toString("base64")}`;
    expect(parseClerkFapiHost(evilScheme)).toBeNull();
    expect(parseClerkFapiHost(evilPath)).toBeNull();
    expect(parseClerkFapiHost(evilSpace)).toBeNull();
  });
});

describe("buildContentSecurityPolicy", () => {
  const dir = (csp: string, name: string): string => {
    const found = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(name + " "));
    return found ?? "";
  };
  // Exact tokens of a directive (everything after the directive name).
  const tokens = (csp: string, name: string): string[] => {
    const d = dir(csp, name);
    return d ? d.split(" ").slice(1) : [];
  };

  it("production + live key: uses the prod FAPI host across the right directives", () => {
    const csp = buildContentSecurityPolicy({ publishableKey: LIVE_KEY, isDev: false });
    const host = `https://${PROD_HOST}`;
    expect(dir(csp, "script-src")).toContain(host);
    expect(dir(csp, "connect-src")).toContain(host);
    expect(dir(csp, "frame-src")).toContain(host);
    expect(dir(csp, "font-src")).toContain(host);
  });

  it("production: drops 'unsafe-eval' and the *.clerk.accounts.dev wildcard", () => {
    const csp = buildContentSecurityPolicy({ publishableKey: LIVE_KEY, isDev: false });
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("*.clerk.accounts.dev");
  });

  it("includes Clerk bot-protection with the correct per-directive port handling", () => {
    const csp = buildContentSecurityPolicy({ publishableKey: LIVE_KEY, isDev: false });
    // script-src: port-less (served on 443).
    expect(tokens(csp, "script-src")).toContain("https://*.protect.clerk.com");
    // connect-src: MUST carry :* — Clerk abuse/fraud hosts use non-443 ports, and a
    // CSP host source with no port matches port 443 only.
    expect(tokens(csp, "connect-src")).toContain("https://*.protect.clerk.com:*");
    // frame-src: the bot-protection challenge iframe.
    expect(tokens(csp, "frame-src")).toContain("https://*.protect.clerk.com");
  });

  it("allows both bare and wildcard Clerk telemetry hosts in connect-src", () => {
    const csp = buildContentSecurityPolicy({ publishableKey: LIVE_KEY, isDev: false });
    expect(tokens(csp, "connect-src")).toContain("https://clerk-telemetry.com");
    expect(tokens(csp, "connect-src")).toContain("https://*.clerk-telemetry.com");
  });

  it("dev + test key: includes 'unsafe-eval', the dev wildcard, and the dev host", () => {
    const csp = buildContentSecurityPolicy({ publishableKey: TEST_KEY, isDev: true });
    expect(dir(csp, "script-src")).toContain("'unsafe-eval'");
    expect(csp).toContain("https://*.clerk.accounts.dev");
    expect(dir(csp, "script-src")).toContain(`https://${DEV_HOST}`);
  });

  it("decouples the two dev axes: prod build + test key (staging) keeps the wildcard but not unsafe-eval", () => {
    const csp = buildContentSecurityPolicy({ publishableKey: TEST_KEY, isDev: false });
    expect(csp).not.toContain("'unsafe-eval'"); // NODE_ENV=production
    expect(csp).toContain("https://*.clerk.accounts.dev"); // dev Clerk instance
  });

  it("an explicit frontendApiOverride wins over the key and suppresses the dev wildcard", () => {
    const csp = buildContentSecurityPolicy({
      publishableKey: TEST_KEY,
      frontendApiOverride: "clerk.custom.example",
      isDev: false,
    });
    expect(dir(csp, "script-src")).toContain("https://clerk.custom.example");
    expect(csp).not.toContain("https://*.clerk.accounts.dev");
  });

  it("ignores an invalid override (contains a scheme) and falls back to the key", () => {
    const csp = buildContentSecurityPolicy({
      publishableKey: LIVE_KEY,
      frontendApiOverride: "https://clerk.evil.example",
      isDev: false,
    });
    expect(csp).not.toContain("https://https://"); // no doubled-scheme token
    expect(csp).not.toContain("clerk.evil.example");
    expect(tokens(csp, "script-src")).toContain(`https://${PROD_HOST}`); // fell back to key
  });

  it("ignores an override containing a space (no CSP token injection)", () => {
    const csp = buildContentSecurityPolicy({
      publishableKey: LIVE_KEY,
      frontendApiOverride: "clerk.ok.example evil.example",
      isDev: false,
    });
    expect(csp).not.toContain("evil.example");
    expect(tokens(csp, "script-src")).toContain(`https://${PROD_HOST}`);
  });

  it("no key: still emits a valid, locked-down CSP", () => {
    const csp = buildContentSecurityPolicy({ isDev: false });
    expect(dir(csp, "default-src")).toBe("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it("always keeps the baseline directives (style/img/worker)", () => {
    const csp = buildContentSecurityPolicy({ publishableKey: LIVE_KEY, isDev: false });
    expect(dir(csp, "style-src")).toContain("'unsafe-inline'");
    expect(dir(csp, "img-src")).toContain("https://img.clerk.com");
    expect(dir(csp, "worker-src")).toContain("blob:");
  });
});
