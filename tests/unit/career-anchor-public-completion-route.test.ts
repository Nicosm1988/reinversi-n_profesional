import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  limitRequest: vi.fn(),
  logEvent: vi.fn(),
  processCareerAnchorReportEmails: vi.fn(),
  notifyInternalActivity: vi.fn(),
}));

vi.mock("@/lib/supabase/auth", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));
vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limitRequest }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));
vi.mock("@/lib/diagnostics/career-anchor-report-delivery", () => ({
  processCareerAnchorReportEmails: mocks.processCareerAnchorReportEmails,
}));
vi.mock("@/lib/internal-notifications/service", () => ({
  notifyInternalActivity: mocks.notifyInternalActivity,
}));

import { POST } from "@/app/api/diagnostics/complete-public/route";

function validBody() {
  return {
    rawAnswers: {
      answers: Object.fromEntries(
        Array.from({ length: 40 }, (_, index) => [String(index + 1), (index % 6) + 1]),
      ),
      bonus: [1, 2, 3],
    },
    locale: "es",
  };
}

function completionRequest(body: unknown) {
  return new Request("https://senda.example/api/diagnostics/complete-public", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.18",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/diagnostics/complete-public", () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
    mocks.maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
    mocks.logEvent.mockReset();
    mocks.processCareerAnchorReportEmails.mockReset().mockResolvedValue({
      claimed: 1,
      sent: 1,
      retryScheduled: 0,
      permanentFailures: 0,
      unavailable: false,
    });
    mocks.notifyInternalActivity.mockReset().mockResolvedValue({
      sent: 2,
      duplicates: 0,
      failed: 0,
      unavailable: false,
    });
    mocks.limitRequest.mockReset().mockResolvedValue({
      limited: false,
      remaining: 4,
      resetAt: Date.now() + 60_000,
    });
    mocks.getAuthenticatedUser.mockReset().mockResolvedValue({
      ok: true,
      user: { id: "user-test-id", email: "person@example.com" },
      supabase: {
        rpc: mocks.rpc,
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({ maybeSingle: mocks.maybeSingle })),
            })),
          })),
        })),
      },
    });
  });

  it("records one authenticated attempt without profile data or CAPTCHA", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: "diagnostic-id", error: null })
      .mockResolvedValueOnce({ data: true, error: null });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.rpc).toHaveBeenNthCalledWith(
      1,
      "claim_free_career_anchor_diagnostic",
      expect.objectContaining({
        p_user_data: { name: "", age: "", occupation: "", city: "", country: "", locale: "es" },
        p_raw_answers: validBody().rawAnswers,
      }),
    );
    expect(mocks.rpc).toHaveBeenNthCalledWith(
      2,
      "complete_free_career_anchor_diagnostic",
      expect.objectContaining({
        p_diagnostic_id: "diagnostic-id",
        p_ai_feedback: expect.objectContaining({
          title: expect.any(String),
          summary: expect.any(String),
          frictionAreas: expect.any(Array),
          strategicQuestion: expect.any(String),
        }),
      }),
    );
    const logs = JSON.stringify(mocks.logEvent.mock.calls);
    expect(logs).not.toContain("person@example.com");
    expect(logs).not.toContain("203.0.113.18");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.processCareerAnchorReportEmails).toHaveBeenCalledWith({
      diagnosticId: "diagnostic-id",
      maxDeliveries: 1,
    });
    expect(mocks.notifyInternalActivity).toHaveBeenCalledWith({
      type: "career_anchor_completed",
      eventId: "diagnostic-id",
      occurredAt: expect.any(Date),
      audience: "authenticated",
    });
  });

  it("keeps completion successful when the internal notification throws unexpectedly", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: "diagnostic-id", error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    mocks.notifyInternalActivity.mockRejectedValueOnce(new Error("notification unavailable"));

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(200);
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "error",
      "diagnostics.public_completion.internal_notification_unexpected",
      expect.objectContaining({ reason: "Error" }),
    );
  });

  it("keeps report completion successful when immediate mail delivery fails", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: "diagnostic-id", error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    mocks.processCareerAnchorReportEmails.mockRejectedValueOnce(new Error("worker unavailable"));

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "error",
      "diagnostics.public_completion.report_email_unexpected",
      expect.objectContaining({ reason: "Error" }),
    );
  });

  it("keeps the server-side one-attempt limit", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: null });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "already_completed" });
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("blocks an existing completed attempt before calling the database claim RPC", async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: { id: "existing-id" }, error: null });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "already_completed" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("requires an authenticated account for persistence", async () => {
    mocks.getAuthenticatedUser.mockResolvedValueOnce({
      ok: false,
      status: 401,
      reason: "unauthorized",
    });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "unauthorized" });
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects incomplete answers and client-supplied fields", async () => {
    const response = await POST(
      completionRequest({
        rawAnswers: { answers: { "1": 6 }, bonus: [1, 2, 3] },
        locale: "es",
        email: "not-accepted@example.com",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("fails closed when persistence cannot complete", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: "diagnostic-id", error: null })
      .mockResolvedValueOnce({ data: false, error: { code: "DB_FAILURE" } });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "unavailable" });
  });

  it("rate limits repeated authenticated completion requests", async () => {
    mocks.limitRequest.mockResolvedValueOnce({
      limited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "rate_limit" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
