import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  notifyAuthenticatedLogin: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/supabase/auth", () => ({ getAuthenticatedUser: mocks.getAuthenticatedUser }));
vi.mock("@/lib/internal-notifications/login", () => ({
  notifyAuthenticatedLogin: mocks.notifyAuthenticatedLogin,
}));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { POST } from "@/app/api/internal-notifications/login/route";

function request(origin = "https://universosenda.com") {
  return new Request("https://universosenda.com/api/internal-notifications/login", {
    method: "POST",
    headers: {
      origin,
      "sec-fetch-site": "same-origin",
      "x-senda-notification": "login",
    },
  });
}

describe("POST /api/internal-notifications/login", () => {
  beforeEach(() => {
    mocks.logEvent.mockReset();
    mocks.notifyAuthenticatedLogin.mockReset().mockResolvedValue({ ok: true });
    mocks.getAuthenticatedUser.mockReset().mockResolvedValue({
      ok: true,
      user: { id: "user-id", email: "person@example.com" },
      supabase: { auth: { getClaims: vi.fn() } },
    });
  });

  it("accepts only a same-origin authenticated login event", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.notifyAuthenticatedLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        supabase: expect.any(Object),
        requestId: expect.any(String),
      }),
    );
  });

  it("returns a retryable response when the durable queue is unavailable", async () => {
    mocks.notifyAuthenticatedLogin.mockResolvedValueOnce({
      ok: false,
      reason: "queue_unavailable",
    });

    const response = await POST(request());
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false });
  });

  it("rejects cross-origin and unauthenticated requests without sending", async () => {
    expect((await POST(request("https://evil.example"))).status).toBe(403);
    expect(mocks.getAuthenticatedUser).not.toHaveBeenCalled();

    mocks.getAuthenticatedUser.mockResolvedValueOnce({ ok: false, status: 401 });
    expect((await POST(request())).status).toBe(401);
    expect(mocks.notifyAuthenticatedLogin).not.toHaveBeenCalled();
  });
});
