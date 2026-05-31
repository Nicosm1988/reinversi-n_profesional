type RateLimitMeta = {
  limit: number;
  remaining: number;
  resetAt: number;
};

export function withRequestHeaders(requestId: string, rateLimit?: RateLimitMeta) {
  const headers: Record<string, string> = {
    "x-request-id": requestId,
  };

  if (rateLimit) {
    headers["x-ratelimit-limit"] = String(rateLimit.limit);
    headers["x-ratelimit-remaining"] = String(Math.max(rateLimit.remaining, 0));
    headers["x-ratelimit-reset"] = new Date(rateLimit.resetAt).toISOString();
  }

  return headers;
}
