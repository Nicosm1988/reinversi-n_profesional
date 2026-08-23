import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/dist/compiled/server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  limitRequest: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limitRequest }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { POST } from "@/app/api/internal-notifications/career-anchor-attempt/route";
import {
  ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE,
  ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS,
  verifyAnonymousCareerAnchorAttempt,
} from "@/lib/internal-notifications/anonymous-attempt";

const ORIGIN = "https://universosenda.com";
const TEST_SECRET = "test-cron-secret-long-value";
const CLIENT_IP = "203.0.113.45";

function request(origin = ORIGIN) {
  return new NextRequest(
    `${ORIGIN}/api/internal-notifications/career-anchor-attempt`,
    {
      method: "POST",
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        "x-senda-notification": "career-anchor-attempt-anonymous",
        "x-forwarded-for": CLIENT_IP,
        "x-request-id": "unrelated-private-cookie=must-not-be-logged",
        cookie: "unrelated-private-cookie=must-not-be-logged",
      },
    },
  );
}

describe("POST /api/internal-notifications/career-anchor-attempt", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", TEST_SECRET);
    mocks.logEvent.mockReset();
    mocks.limitRequest.mockReset().mockResolvedValue({
      limited: false,
      remaining: 9,
      resetAt: Date.now() + 60_000,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("issues a signed three-hour proof only in a protected cookie", async () => {
    const response = await POST(request());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE}=`);
    expect(setCookie).toContain(
      `Max-Age=${ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS}`,
    );
    expect(setCookie).toContain("Path=/api/internal-notifications/career-anchor-completed");
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Secure/i);
    expect(setCookie).toMatch(/SameSite=strict/i);

    const token = setCookie
      .split(";")[0]
      ?.slice(`${ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE}=`.length);
    expect(token).toBeTruthy();
    expect(verifyAnonymousCareerAnchorAttempt(token ?? "").ok).toBe(true);

    const logs = JSON.stringify(mocks.logEvent.mock.calls);
    expect(logs).not.toContain(CLIENT_IP);
    expect(logs).not.toContain("must-not-be-logged");
    expect(logs).not.toContain(token);
  });

  it("limits issuance to ten attempts per IP and never returns a proof when limited", async () => {
    mocks.limitRequest.mockResolvedValueOnce({
      limited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(mocks.limitRequest).toHaveBeenCalledWith({
      key: expect.stringMatching(/^[a-f0-9]{64}$/),
      prefix: "internal-notifications:career-anchor-attempt",
      limit: 10,
      windowMs: 60 * 60_000,
    });
    expect(JSON.stringify(mocks.limitRequest.mock.calls)).not.toContain(CLIENT_IP);
  });

  it("fails closed for cross-origin calls or missing signing configuration", async () => {
    const crossOrigin = await POST(request("https://evil.example"));
    expect(crossOrigin.status).toBe(403);
    expect(crossOrigin.headers.get("set-cookie")).toBeNull();

    vi.stubEnv("CRON_SECRET", "short");
    const missingConfiguration = await POST(request());
    expect(missingConfiguration.status).toBe(503);
    expect(missingConfiguration.headers.get("set-cookie")).toBeNull();
  });

  it("accepts equivalent loopback hosts used by the production-mode E2E server", async () => {
    const response = await POST(
      new Request("http://localhost:3417/api/internal-notifications/career-anchor-attempt", {
        method: "POST",
        headers: {
          origin: "http://127.0.0.1:3417",
          "sec-fetch-site": "same-origin",
          "x-senda-notification": "career-anchor-attempt-anonymous",
          "x-forwarded-for": CLIENT_IP,
        },
      }),
    );

    expect(response.status).toBe(201);
  });
});
