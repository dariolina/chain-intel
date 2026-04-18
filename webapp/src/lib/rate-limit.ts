import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function hit(key: string, maxPerMinute: number): RateLimitResult {
  const now = Date.now();
  const windowMs = 60_000;
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxPerMinute - 1, resetInSeconds: 60 };
  }
  b.count += 1;
  return {
    allowed: b.count <= maxPerMinute,
    remaining: Math.max(0, maxPerMinute - b.count),
    resetInSeconds: Math.max(0, Math.round((b.resetAt - now) / 1000)),
  };
}
