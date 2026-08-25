import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  createAdminClient: vi.fn(),
  adminRpc: vi.fn(),
  maybeSingle: vi.fn(),
  limitRequest: vi.fn(),
  logEvent: vi.fn(),
  processCareerAnchorReportEmails: vi.fn(),
  processCareerAnchorInternalResultEmails: vi.fn(),
  after: vi.fn(),
  afterCallbacks: [] as Array<() => void | Promise<void>>,
}));

vi.mock("next/server", async (importOriginal) => {
  const original = await importOriginal<typeof import("next/server")>();
  return { ...original, after: mocks.after };
});
vi.mock("@/lib/supabase/auth", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));
vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limitRequest }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));
vi.mock("@/lib/diagnostics/career-anchor-report-delivery", () => ({
  processCareerAnchorReportEmails: mocks.processCareerAnchorReportEmails,
}));
vi.mock("@/lib/diagnostics/career-anchor-internal-result-delivery", () => ({
  processCareerAnchorInternalResultEmails:
    mocks.processCareerAnchorInternalResultEmails,
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
    careerStage: "changing_employment",
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

async function runAfterCallbacks() {
  for (const callback of mocks.afterCallbacks) await callback();
}

describe("POST /api/diagnostics/complete-public", () => {
  beforeEach(() => {
    mocks.afterCallbacks.length = 0;
    mocks.after.mockReset().mockImplementation((callback: () => void | Promise<void>) => {
      mocks.afterCallbacks.push(callback);
    });
    mocks.adminRpc.mockReset().mockResolvedValue({ data: "diagnostic-id", error: null });
    mocks.createAdminClient.mockReset().mockReturnValue({ rpc: mocks.adminRpc });
    mocks.maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
    mocks.logEvent.mockReset();
    mocks.processCareerAnchorReportEmails.mockReset().mockResolvedValue({
      claimed: 1,
      sent: 1,
      retryScheduled: 0,
      permanentFailures: 0,
      unavailable: false,
    });
    mocks.processCareerAnchorInternalResultEmails.mockReset().mockResolvedValue({
      claimed: 2,
      sent: 2,
      retryScheduled: 0,
      permanentFailures: 0,
      unavailable: false,
    });
    mocks.limitRequest.mockReset().mockResolvedValue({
      limited: false,
      remaining: 4,
      resetAt: Date.now() + 60_000,
    });

    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: mocks.maybeSingle,
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);

    mocks.getAuthenticatedUser.mockReset().mockResolvedValue({
      ok: true,
      user: { id: "user-test-id", email: "person@example.com" },
      supabase: { from: vi.fn(() => query) },
    });
  });

  it("finalizes the authenticated attempt atomically with server-calculated, versioned results", async () => {
    const requestBody = validBody();
    const response = await POST(completionRequest(requestBody));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.createAdminClient).toHaveBeenCalledTimes(1);
    expect(mocks.adminRpc).toHaveBeenCalledTimes(1);
    expect(mocks.adminRpc).toHaveBeenCalledWith(
      "finalize_career_anchor_diagnostic_with_internal_result_emails",
      {
        p_user_id: "user-test-id",
        p_raw_answers: requestBody.rawAnswers,
        p_dominant_result: {
          id: expect.any(String),
          name: expect.any(String),
          score: expect.any(Number),
          rank: 1,
        },
        p_score_result: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            score: expect.any(Number),
            mean: expect.any(Number),
            rank: expect.any(Number),
          }),
        ]),
        p_result_base: expect.objectContaining({
          mode: "fallback",
          tensions: [],
          reflectionQuestions: expect.any(Array),
          nextSteps: expect.any(Array),
        }),
        p_locale: "es",
        p_career_stage: "changing_employment",
        p_instrument_version: "schein-career-anchors-40-v1",
        p_algorithm_version: "senda-career-anchor-score-v1",
      },
    );
    const rpcPayload = mocks.adminRpc.mock.calls[0]?.[1];
    expect(rpcPayload.p_score_result).toHaveLength(8);
    expect(rpcPayload).not.toHaveProperty("p_result_email_consent");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.after).toHaveBeenCalledTimes(1);
    expect(mocks.processCareerAnchorReportEmails).not.toHaveBeenCalled();
    expect(mocks.processCareerAnchorInternalResultEmails).not.toHaveBeenCalled();
    await runAfterCallbacks();
    expect(mocks.processCareerAnchorReportEmails).toHaveBeenCalledWith({
      diagnosticId: "diagnostic-id",
      maxDeliveries: 1,
    });
    expect(mocks.processCareerAnchorInternalResultEmails).toHaveBeenCalledWith({
      diagnosticId: "diagnostic-id",
      maxDeliveries: 2,
    });
    const logs = JSON.stringify(mocks.logEvent.mock.calls);
    expect(logs).not.toContain("person@example.com");
    expect(logs).not.toContain("203.0.113.18");
  });

  it("keeps completion successful when post-persistence deliveries throw", async () => {
    mocks.processCareerAnchorReportEmails.mockRejectedValueOnce(new Error("worker unavailable"));
    mocks.processCareerAnchorInternalResultEmails.mockRejectedValueOnce(
      new Error("notification unavailable"),
    );

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    await runAfterCallbacks();
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "error",
      "diagnostics.public_completion.report_email_unexpected",
      expect.objectContaining({ reason: "Error" }),
    );
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "error",
      "diagnostics.public_completion.internal_result_email_unexpected",
      expect.objectContaining({ reason: "Error" }),
    );
  });

  it.each([
    ["completed", "already_completed"],
    ["processing", "finalizing"],
  ])("blocks an existing %s attempt before the finalize RPC", async (status, code) => {
    mocks.maybeSingle.mockResolvedValueOnce({
      data: { id: "existing-id", status },
      error: null,
    });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ ok: false, code });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
    expect(mocks.adminRpc).not.toHaveBeenCalled();
  });

  it("keeps the server-side single-completion invariant when finalization returns no id", async () => {
    mocks.adminRpc.mockResolvedValueOnce({ data: null, error: null });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "already_completed" });
    expect(mocks.adminRpc).toHaveBeenCalledTimes(1);
    expect(mocks.processCareerAnchorReportEmails).not.toHaveBeenCalled();
    expect(mocks.processCareerAnchorInternalResultEmails).not.toHaveBeenCalled();
  });

  it("requires an authenticated account and preserves authentication outages", async () => {
    mocks.getAuthenticatedUser.mockResolvedValueOnce({
      ok: false,
      status: 401,
      reason: "unauthorized",
    });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "unauthorized" });
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();

    mocks.getAuthenticatedUser.mockResolvedValueOnce({
      ok: false,
      status: 503,
      reason: "supabase-unavailable",
    });
    const unavailable = await POST(completionRequest(validBody()));
    expect(unavailable.status).toBe(503);
    await expect(unavailable.json()).resolves.toEqual({ ok: false, code: "unavailable" });
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("rejects incomplete answers and client-supplied calculated or personal fields", async () => {
    const response = await POST(
      completionRequest({
        rawAnswers: { answers: { "1": 6 }, bonus: [1, 2, 3] },
        locale: "es",
        dominantResult: { id: "manipulated", score: 999 },
        resultBase: { mode: "ai" },
        email: "not-accepted@example.com",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "invalid" });
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("temporarily accepts a legacy true field but ignores it", async () => {
    const response = await POST(
      completionRequest({ ...validBody(), resultEmailConsent: true }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.adminRpc).toHaveBeenCalledTimes(1);
    expect(mocks.adminRpc.mock.calls[0]?.[1]).not.toHaveProperty(
      "p_result_email_consent",
    );
  });

  it("rejects a legacy false field before reading or saving answers", async () => {
    const response = await POST(
      completionRequest({ ...validBody(), resultEmailConsent: false }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "invalid" });
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
    expect(mocks.processCareerAnchorInternalResultEmails).not.toHaveBeenCalled();
  });

  it("fails closed on lookup, admin configuration, and finalize RPC errors", async () => {
    mocks.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { code: "lookup_failed" },
    });
    const lookupFailure = await POST(completionRequest(validBody()));
    expect(lookupFailure.status).toBe(503);

    mocks.createAdminClient.mockImplementationOnce(() => {
      throw new Error("missing service role");
    });
    const adminFailure = await POST(completionRequest(validBody()));
    expect(adminFailure.status).toBe(503);

    mocks.adminRpc.mockResolvedValueOnce({ data: null, error: { code: "DB_FAILURE" } });
    const rpcFailure = await POST(completionRequest(validBody()));
    expect(rpcFailure.status).toBe(503);
    await expect(rpcFailure.json()).resolves.toEqual({ ok: false, code: "unavailable" });
    expect(mocks.processCareerAnchorReportEmails).not.toHaveBeenCalled();
  });

  it("rate limits repeated authenticated completion requests before reading the payload", async () => {
    mocks.limitRequest.mockResolvedValueOnce({
      limited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const response = await POST(completionRequest(validBody()));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "rate_limit" });
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });
});
