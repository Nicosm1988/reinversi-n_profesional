import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/http/request-context";

describe("getClientIp", () => {
  it("prefers trusted direct headers", () => {
    const request = new Request("https://example.com/api", {
      headers: {
        "x-real-ip": "203.0.113.10",
        "x-forwarded-for": "1.1.1.1, 203.0.113.20",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });

  it("uses nearest public address from x-forwarded-for", () => {
    const request = new Request("https://example.com/api", {
      headers: {
        "x-forwarded-for": "1.1.1.1, 10.0.0.1, 203.0.113.20",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.20");
  });

  it("returns unknown when no valid IP headers are available", () => {
    const request = new Request("https://example.com/api", {
      headers: {
        "x-forwarded-for": "unknown, bad-value",
      },
    });

    expect(getClientIp(request)).toBe("unknown");
  });
});
