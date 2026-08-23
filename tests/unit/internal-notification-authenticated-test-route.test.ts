import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  maybeSingle: vi.fn(),
  notifyInternalActivity: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/supabase/auth", () => ({ getAuthenticatedUser: mocks.getAuthenticatedUser }));
vi.mock("@/lib/internal-notifications/service", () => ({
  notifyInternalActivity: mocks.notifyInternalActivity,
}));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { POST } from "@/app/api/internal-notifications/career-anchor-completed-authenticated/route";

function queryBuilder() {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: mocks.maybeSingle,
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
}

function request(origin = "https://universosenda.com") {
  return new Request(
    "https://universosenda.com/api/internal-notifications/career-anchor-completed-authenticated",
    {
      method: "POST",
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        "x-senda-notification": "career-anchor-completed-authenticated",
      },
    },
  );
}

describe("POST authenticated career-anchor completion notification", () => {
  beforeEach(() => {
    const builder = queryBuilder();
    mocks.logEvent.mockReset();
    mocks.maybeSingle.mockReset().mockResolvedValue({
      data: { id: "diagnostic-id" },
      error: null,
    });
    mocks.getAuthenticatedUser.mockReset().mockResolvedValue({
      ok: true,
      user: { id: "user-id", email: "person@example.com" },
      supabase: { from: vi.fn().mockReturnValue(builder) },
    });
    mocks.notifyInternalActivity.mockReset().mockResolvedValue({
      sent: 0,
      duplicates: 2,
      failed: 0,
      unavailable: false,
      deliveries: [],
    });
  });

  it("derives the completed diagnostic server-side and queues an idempotent retry", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    expect(mocks.notifyInternalActivity).toHaveBeenCalledWith({
      type: "career_anchor_completed",
      eventId: "diagnostic-id",
      occurredAt: expect.any(Date),
      audience: "authenticated",
    });
    const serialized = JSON.stringify([
      mocks.notifyInternalActivity.mock.calls,
      mocks.logEvent.mock.calls,
    ]);
    expect(serialized).not.toContain("person@example.com");
    expect(serialized).not.toMatch(/answer|score|rawAnswers/i);
  });

  it("returns 503 so the client retries when the durable outbox is unavailable", async () => {
    mocks.notifyInternalActivity.mockResolvedValueOnce({
      sent: 0,
      duplicates: 0,
      failed: 0,
      unavailable: true,
      errorCode: "outbox_unavailable",
      deliveries: [],
    });

    const response = await POST(request());
    expect(response.status).toBe(503);
  });

  it("rejects cross-origin and unauthenticated calls before database lookup", async () => {
    expect((await POST(request("https://evil.example"))).status).toBe(403);
    expect(mocks.getAuthenticatedUser).not.toHaveBeenCalled();

    mocks.getAuthenticatedUser.mockResolvedValueOnce({ ok: false, status: 401 });
    expect((await POST(request())).status).toBe(401);
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
  });

  it("does not invent an event when no completed diagnostic exists", async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const response = await POST(request());
    expect(response.status).toBe(404);
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
  });
});
