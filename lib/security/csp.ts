/**
 * Clerk-aware Content-Security-Policy builder.
 *
 * The Clerk Frontend API (FAPI) host is encoded in the publishable key, so the
 * CSP can be derived from the key that is already required — there is no second
 * env var to drift out of sync. Clerk serves its own UI/scripts from the FAPI
 * host at runtime, so the host MUST appear in `script-src`/`connect-src` or auth
 * silently breaks (dev uses `*.clerk.accounts.dev`; prod uses a customer domain
 * such as `clerk.your-domain.com`).
 *
 * An explicit `NEXT_PUBLIC_CLERK_FRONTEND_API` override is honored for satellite,
 * proxy, or self-hosted setups.
 */

/** A bare hostname: dot-separated DNS labels, no scheme, path, port, or spaces. */
const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/**
 * Extract the FAPI host from a Clerk publishable key.
 * Keys are `pk_(test|live)_<base64(fapiHost + "$")>`. Returns `null` for anything
 * that is not a well-formed key decoding to a bare hostname (so a tampered key
 * can never inject an arbitrary origin into the CSP).
 */
export function parseClerkFapiHost(publishableKey?: string): string | null {
  if (!publishableKey) return null;
  const match = /^pk_(test|live)_(.+)$/.exec(publishableKey.trim());
  if (!match) return null;

  let decoded: string;
  try {
    decoded = Buffer.from(match[2], "base64").toString("utf8");
  } catch {
    return null;
  }

  // Strip the trailing `$` sentinel Clerk appends before base64-encoding.
  const host = decoded.replace(/\$+$/, "").trim();
  return HOSTNAME_RE.test(host) ? host : null;
}

export interface CspOptions {
  /** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — the FAPI host is derived from it. */
  publishableKey?: string;
  /** `NEXT_PUBLIC_CLERK_FRONTEND_API` — explicit host override (no scheme). */
  frontendApiOverride?: string;
  /** `NODE_ENV !== "production"` — gates Next.js dev-server-only relaxations. */
  isDev: boolean;
}

/**
 * Build the full `Content-Security-Policy` header value.
 *
 * Two independent "dev" axes are deliberately decoupled:
 *   - `'unsafe-eval'` is a Next.js **dev-server** need → gated on `isDev`.
 *   - `*.clerk.accounts.dev` is a Clerk **dev-instance** need → gated on a
 *     `pk_test_` key, so a staging build (`NODE_ENV=production`) using a test key
 *     still works.
 */
export function buildContentSecurityPolicy(opts: CspOptions): string {
  const override = opts.frontendApiOverride?.trim();
  const fapiHost = override || parseClerkFapiHost(opts.publishableKey);
  const fapi = fapiHost ? `https://${fapiHost}` : null;

  // Clerk dev instance (test key, no explicit override) needs the accounts.dev
  // wildcard — independent of NODE_ENV.
  const isDevInstance = !override && (opts.publishableKey ?? "").startsWith("pk_test_");
  const accountsDev = isDevInstance ? "https://*.clerk.accounts.dev" : null;

  const protect = "https://*.protect.clerk.com"; // Clerk bot protection

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(opts.isDev ? ["'unsafe-eval'"] : []), // Next.js dev server only
    "https://js.stripe.com",
    fapi,
    protect,
    "https://challenges.cloudflare.com",
    accountsDev,
  ];

  const connectSrc = [
    "'self'",
    "https://api.stripe.com",
    fapi,
    protect,
    "https://clerk-telemetry.com",
    accountsDev,
  ];

  const frameSrc = [
    "https://js.stripe.com",
    fapi,
    "https://challenges.cloudflare.com",
    accountsDev,
  ];

  const fontSrc = ["'self'", fapi, accountsDev];

  const directives: Array<[string, Array<string | null>]> = [
    ["default-src", ["'self'"]],
    ["script-src", scriptSrc],
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["img-src", ["'self'", "data:", "blob:", "https://img.clerk.com", "https://*.clerk.com"]],
    ["font-src", fontSrc],
    ["connect-src", connectSrc],
    ["frame-src", frameSrc],
    ["worker-src", ["'self'", "blob:"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
  ];

  return directives
    .map(([name, values]) => `${name} ${values.filter((v): v is string => !!v).join(" ")}`)
    .join("; ");
}
