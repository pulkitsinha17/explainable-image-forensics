/**
 * In-memory sliding window rate limiter for Next.js Route Handlers.
 * Protects endpoints against brute force, denial of service, and rapid abuse.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60_000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60_000);
}

export interface RateLimitOptions {
  /** Maximum number of allowed requests in the time window. */
  maxRequests: number;
  /** Window size in milliseconds (e.g., 60_000 for 1 minute). */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Checks if an identifier (e.g. userId or IP) is within the allowed request rate.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 30, windowMs: 60_000 }
): RateLimitResult {
  const now = Date.now();
  const { maxRequests, windowMs } = options;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}
