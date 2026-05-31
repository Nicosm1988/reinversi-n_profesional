import { describe, expect, it } from "vitest";
import { withRequestHeaders } from "@/lib/http/response-headers";

describe("withRequestHeaders", () => {
  it("always includes request id", () => {
    expect(withRequestHeaders("req-1")).toEqual({
      "x-request-id": "req-1",
    });
  });

  it("includes rate limit metadata when provided", () => {
    const headers = withRequestHeaders("req-2", {
      limit: 10,
      remaining: 4,
      resetAt: Date.parse("2026-03-03T12:00:00.000Z"),
    });

    expect(headers["x-request-id"]).toBe("req-2");
    expect(headers["x-ratelimit-limit"]).toBe("10");
    expect(headers["x-ratelimit-remaining"]).toBe("4");
    expect(headers["x-ratelimit-reset"]).toBe("2026-03-03T12:00:00.000Z");
  });
});
