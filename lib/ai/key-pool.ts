/**
 * Multi-key rotation pool for free-tier AI provider API keys.
 * Supports comma-separated keys in environment variables.
 * Tracks rate-limit status per key and rotates automatically.
 */

interface KeyState {
  key: string;
  rateLimitedUntil: number; // timestamp (0 = available)
}

interface ProviderPool {
  name: string;
  keys: KeyState[];
  index: number; // round-robin counter
}

const pools = new Map<string, ProviderPool>();

/**
 * Initialize a provider pool from a comma-separated env var.
 * Falls back to the single-key env var if the multi-key var is not set.
 */
function getPool(provider: "gemini" | "grok"): ProviderPool {
  if (pools.has(provider)) return pools.get(provider)!;

  const multiKeyVar = provider === "gemini" ? "GEMINI_API_KEYS" : "GROK_API_KEYS";
  const singleKeyVar = provider === "gemini" ? "GEMINI_API_KEY" : "GROK_API_KEY";

  const multiKeys = process.env[multiKeyVar];
  const singleKey = process.env[singleKeyVar];

  let rawKeys: string[] = [];
  if (multiKeys) {
    rawKeys = multiKeys.split(",").map((k) => k.trim()).filter(Boolean);
  } else if (singleKey) {
    rawKeys = [singleKey];
  }

  const pool: ProviderPool = {
    name: provider,
    keys: rawKeys.map((key) => ({ key, rateLimitedUntil: 0 })),
    index: 0,
  };

  pools.set(provider, pool);
  return pool;
}

/**
 * Get the next available API key for a provider.
 * Skips rate-limited keys. Returns null if all keys are exhausted.
 */
export function getAvailableKey(provider: "gemini" | "grok"): string | null {
  const pool = getPool(provider);
  if (pool.keys.length === 0) return null;

  const now = Date.now();
  const total = pool.keys.length;

  // Try each key starting from the current round-robin position
  for (let i = 0; i < total; i++) {
    const idx = (pool.index + i) % total;
    const keyState = pool.keys[idx];

    if (keyState.rateLimitedUntil <= now) {
      pool.index = (idx + 1) % total; // advance for next call
      return keyState.key;
    }
  }

  return null; // all keys rate-limited
}

/**
 * Mark a key as rate-limited for a given duration.
 */
export function markRateLimited(
  provider: "gemini" | "grok",
  key: string,
  retryAfterMs: number = 60_000,
): void {
  const pool = getPool(provider);
  const keyState = pool.keys.find((k) => k.key === key);
  if (keyState) {
    keyState.rateLimitedUntil = Date.now() + retryAfterMs;
  }
}

/**
 * Get the earliest time when any key becomes available again.
 * Returns 0 if a key is available now.
 */
export function getEarliestRetryTime(provider: "gemini" | "grok"): number {
  const pool = getPool(provider);
  if (pool.keys.length === 0) return 0;

  const now = Date.now();
  let earliest = Infinity;

  for (const keyState of pool.keys) {
    if (keyState.rateLimitedUntil <= now) return 0;
    earliest = Math.min(earliest, keyState.rateLimitedUntil);
  }

  return earliest;
}

/**
 * Check if a provider has any keys configured.
 */
export function hasKeys(provider: "gemini" | "grok"): boolean {
  return getPool(provider).keys.length > 0;
}
