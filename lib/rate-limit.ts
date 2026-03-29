import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiters for different API endpoints.
 * Uses sliding window algorithm for smooth rate limiting.
 */

// Public endpoints — limit by IP
export const authInitLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "rl:auth-init",
});

export const analyticsEventLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:analytics",
});

// Authenticated endpoints — limit by user ID
export const translateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:translate",
});

export const usageLogLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:usage-log",
});

export const billingQuoteLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "rl:billing-quote",
});

export const billingCheckoutLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:billing-checkout",
});

export const referralClaimLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "rl:referral-claim",
});

export const adminMutationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "rl:admin-mutation",
});

/**
 * Extract client IP from request headers.
 * Prefers platform-set headers that cannot be spoofed by clients,
 * then falls back to x-real-ip and finally x-forwarded-for.
 */
export function getClientIp(req: Request): string {
  const headers = new Headers(req.headers);
  return (
    // Vercel sets this from the connecting IP — cannot be spoofed
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    // Cloudflare sets this from the connecting IP — cannot be spoofed
    headers.get("cf-connecting-ip") ||
    // Set by most reverse proxies from the socket address
    headers.get("x-real-ip") ||
    // Fallback: take only the rightmost (closest proxy) entry, which is
    // harder to spoof than the leftmost (client-supplied) entry
    headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
    "unknown"
  );
}

// --- In-memory fallback rate limiter ---
// Used when Redis is unavailable. Provides basic protection
// with automatic entry expiry. Not shared across serverless
// instances but still better than allowing unlimited requests.

const memoryStore = new Map<string, { count: number; resetAt: number }>();
const MEMORY_CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function memoryRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): { success: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Periodic cleanup of expired entries to prevent memory leaks
  if (now - lastCleanup > MEMORY_CLEANUP_INTERVAL) {
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
    lastCleanup = now;
  }

  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, retryAfterSec: 0 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { success: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  return { success: true, retryAfterSec: 0 };
}

// Default fallback limits (conservative) per limiter prefix
const FALLBACK_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "rl:auth-init": { max: 5, windowMs: 60_000 },
  "rl:analytics": { max: 30, windowMs: 60_000 },
  "rl:translate": { max: 10, windowMs: 60_000 },
  "rl:usage-log": { max: 30, windowMs: 60_000 },
  "rl:billing-quote": { max: 20, windowMs: 60_000 },
  "rl:billing-checkout": { max: 10, windowMs: 60_000 },
  "rl:referral-claim": { max: 10, windowMs: 3_600_000 },
  "rl:admin-mutation": { max: 60, windowMs: 60_000 },
};

/**
 * Check rate limit and return a 429 response if exceeded.
 * Returns null if the request is allowed.
 *
 * Fail-closed: if Redis is unavailable, falls back to an in-memory
 * rate limiter instead of allowing unlimited requests.
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
): Promise<Response | null> {
  try {
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.max(retryAfter, 1)),
          },
        },
      );
    }
    return null;
  } catch {
    // Redis unavailable — fall back to in-memory rate limiting.
    // This is per-instance only (not shared across serverless functions)
    // but still provides basic protection against abuse.
    const prefix = (limiter as unknown as { prefix?: string }).prefix ?? "rl:default";
    const limits = FALLBACK_LIMITS[prefix] ?? { max: 10, windowMs: 60_000 };
    const fallbackKey = `${prefix}:${identifier}`;
    const result = memoryRateLimit(fallbackKey, limits.max, limits.windowMs);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.retryAfterSec),
          },
        },
      );
    }
    return null;
  }
}
