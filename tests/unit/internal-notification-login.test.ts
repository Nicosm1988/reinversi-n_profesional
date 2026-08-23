import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  logEvent: vi.fn(),
  notifyInternalActivity: vi.fn(),
}));

vi.mock("next/dist/compiled/server-only", () => ({}));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));
vi.mock("@/lib/internal-notifications/service", () => ({
  notifyInternalActivity: mocks.notifyInternalActivity,
}));

import { notifyAuthenticatedLogin } from "@/lib/internal-notifications/login";

describe("notifyAuthenticatedLogin", () => {
  beforeEach(() => {
    mocks.logEvent.mockReset();
    mocks.notifyInternalActivity.mockReset().mockResolvedValue({
      sent: 2,
      duplicates: 0,
      failed: 0,
      unavailable: false,
    });
  });

  it("derives the idempotency key from validated session claims", async () => {
    const getClaims = vi.fn().mockResolvedValue({
      data: { claims: { session_id: "session-1234567890abcdef" } },
      error: null,
    });

    await expect(
      notifyAuthenticatedLogin({
        supabase: { auth: { getClaims } } as never,
        requestId: "request-id",
      }),
    ).resolves.toEqual({ ok: true });

    expect(mocks.notifyInternalActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "login",
        eventId: "session-1234567890abcdef",
        audience: "authenticated",
      }),
    );
  });

  it("fails closed without exposing or inventing a session id", async () => {
    const getClaims = vi.fn().mockResolvedValue({ data: { claims: {} }, error: null });

    await expect(
      notifyAuthenticatedLogin({
        supabase: { auth: { getClaims } } as never,
        requestId: "request-id",
      }),
    ).resolves.toEqual({ ok: false, reason: "session_id_unavailable" });
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
    expect(JSON.stringify(mocks.logEvent.mock.calls)).not.toContain("person@example.com");
  });

  it("does not throw when claim validation is temporarily unavailable", async () => {
    const getClaims = vi.fn().mockRejectedValue(new Error("network unavailable"));

    await expect(
      notifyAuthenticatedLogin({
        supabase: { auth: { getClaims } } as never,
        requestId: "request-id",
      }),
    ).resolves.toEqual({ ok: false, reason: "claims_unavailable" });
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
  });

  it("reports an unavailable durable queue without throwing", async () => {
    const getClaims = vi.fn().mockResolvedValue({
      data: { claims: { session_id: "session-1234567890abcdef" } },
      error: null,
    });
    mocks.notifyInternalActivity.mockResolvedValueOnce({
      sent: 0,
      duplicates: 0,
      failed: 0,
      unavailable: true,
      errorCode: "outbox",
    });

    await expect(
      notifyAuthenticatedLogin({
        supabase: { auth: { getClaims } } as never,
        requestId: "request-id",
      }),
    ).resolves.toEqual({ ok: false, reason: "queue_unavailable" });
  });
});
