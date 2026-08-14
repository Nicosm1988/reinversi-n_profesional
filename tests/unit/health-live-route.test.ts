import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/live/route";

describe("GET /api/health/live", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports the application process as live without exposing dependency readiness", async () => {
    vi.stubEnv("SMTP_PASSWORD", "");

    const response = await GET(
      new Request("https://senda.example/api/health/live", {
        headers: { "x-request-id": "liveness-test" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("liveness-test");
    expect(body.status).toBe("ok");
    expect(body.timestamp).toEqual(expect.any(String));
    expect(body).not.toHaveProperty("checks");
    expect(body).not.toHaveProperty("readiness");

  });
});
