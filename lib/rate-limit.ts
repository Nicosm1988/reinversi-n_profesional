import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logEvent } from "@/lib/observability/logger";

type MemoryBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetAt: number;
};

type RateLimitParams = {
  key: string;
  prefix: string;
  limit: number;
  windowMs: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();
const upstashLimiters = new Map<string, Ratelimit>();
let memoryLimiterCalls = 0;

export function normalizeEnvironmentSecret(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const hasMatchingQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));

  return hasMatchingQuotes ? trimmed.slice(1, -1).trim() : trimmed;
}

function cleanupExpiredMemoryBuckets(now: number) {
  memoryLimiterCalls += 1;

  // Cleanup every 200 calls to keep fallback mode bounded without extra timers.
  if (memoryLimiterCalls % 200 !== 0) {
    return;
  }

  for (const [bucketKey, bucket] of memoryBuckets.entries()) {
    if (now >= bucket.resetAt) {
      memoryBuckets.delete(bucketKey);
    }
  }
}

function readRedisConfig() {
  const url = normalizeEnvironmentSecret(process.env.UPSTASH_REDIS_REST_URL);
  const token = normalizeEnvironmentSecret(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!url || !token) return null;

  return { url, token };
}

function toUpstashWindow(windowMs: number) {
  if (windowMs % 60_000 === 0) {
    return `${windowMs / 60_000} m`;
  }

  return `${Math.ceil(windowMs / 1000)} s`;
}

function getUpstashLimiter(limit: number, windowMs: number) {
  const cacheKey = `${limit}:${windowMs}`;
  const cached = upstashLimiters.get(cacheKey);
  if (cached) return cached;

  const redisConfig = readRedisConfig();
  if (!redisConfig) return null;

  const redis = new Redis(redisConfig);
  const upstashWindow = toUpstashWindow(windowMs) as Parameters<typeof Ratelimit.slidingWindow>[1];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, upstashWindow),
    analytics: true,
    prefix: "reinvencion:ratelimit",
  });

  upstashLimiters.set(cacheKey, limiter);
  return limiter;
}

function runMemoryLimiter(storageKey: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanupExpiredMemoryBuckets(now);
  const current = memoryBuckets.get(storageKey);

  if (!current || now >= current.resetAt) {
    memoryBuckets.set(storageKey, { count: 1, resetAt: now + windowMs });
    return {
      limited: false,
      remaining: Math.max(limit - 1, 0),
      resetAt: now + windowMs,
    };
  }

  current.count += 1;
  const limited = current.count > limit;

  return {
    limited,
    remaining: limited ? 0 : Math.max(limit - current.count, 0),
    resetAt: current.resetAt,
  };
}

export async function limitRequest({ key, prefix, limit, windowMs }: RateLimitParams): Promise<RateLimitResult> {
  const storageKey = `${prefix}:${key}`;
  const upstashLimiter = getUpstashLimiter(limit, windowMs);

  if (!upstashLimiter) {
    return runMemoryLimiter(storageKey, limit, windowMs);
  }

  try {
    const result = await upstashLimiter.limit(storageKey);
    return {
      limited: !result.success,
      remaining: Math.max(result.remaining, 0),
      resetAt: result.reset,
    };
  } catch (error) {
    logEvent("error", "rate_limit.upstash_unavailable", {
      prefix,
      message: error instanceof Error ? error.message : "unknown-error",
    });
    return runMemoryLimiter(storageKey, limit, windowMs);
  }
}
