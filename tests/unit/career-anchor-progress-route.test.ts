import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  createAdminClient: vi.fn(),
  adminRpc: vi.fn(),
  limitRequest: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/supabase/auth", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));
vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limitRequest }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { POST } from "@/app/api/diagnostics/progress/route";

function progressBody(overrides: Record<string, unknown> = {}) {
  return {
    answers: { "1": 4, "2": 6, "3": 2 },
    bonus: [2],
    currentStatement: 4,
    clientRevision: 7,
    locale: "es",
    careerStage: "changing_employment",
    ...overrides,
  };
}

function progressRequest(body: unknown) {
  return new Request("https://senda.example/api/diagnostics/progress", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.29",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/diagnostics/progress", () => {
  beforeEach(() => {
    mocks.getAuthenticatedUser.mockReset().mockResolvedValue({
      ok: true,
      user: { id: "user-test-id" },
      supabase: {},
    });
    mocks.limitRequest.mockReset().mockResolvedValue({
      limited: false,
      remaining: 179,
      resetAt: Date.now() + 60_000,
    });
    mocks.adminRpc.mockReset().mockResolvedValue({
      data: {
        id: "diagnostic-id",
        status: "in_progress",
        savedAt: "2026-08-24T12:00:00.000Z",
        revision: 7,
        accepted: true,
      },
      error: null,
    });
    mocks.createAdminClient.mockReset().mockReturnValue({ rpc: mocks.adminRpc });
    mocks.logEvent.mockReset();
  });

  it("saves partial answers through the service-role RPC scoped to the authenticated user", async () => {
    const body = progressBody();
    const response = await POST(progressRequest(body));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      savedAt: "2026-08-24T12:00:00.000Z",
      revision: 7,
      accepted: true,
    });
    expect(mocks.adminRpc).toHaveBeenCalledTimes(1);
    expect(mocks.adminRpc).toHaveBeenCalledWith("save_career_anchor_progress", {
      p_user_id: "user-test-id",
      p_answers: body.answers,
      p_bonus: body.bonus,
      p_current_statement: 4,
      p_client_revision: 7,
      p_locale: "es",
      p_career_stage: "changing_employment",
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects a stale client revision and returns the authoritative stored revision", async () => {
    mocks.adminRpc.mockResolvedValueOnce({
      data: {
        id: "diagnostic-id",
        status: "in_progress",
        savedAt: "2026-08-24T12:01:00.000Z",
        revision: 9,
        accepted: false,
      },
      error: null,
    });

    const response = await POST(progressRequest(progressBody({ clientRevision: 8 })));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: "stale_revision",
      revision: 9,
    });
  });

  it.each([
    ["completed", "already_completed"],
    ["processing", "finalizing"],
  ])("does not reopen a diagnostic in %s state", async (status, code) => {
    mocks.adminRpc.mockResolvedValueOnce({
      data: {
        id: "diagnostic-id",
        status,
        savedAt: "2026-08-24T12:00:00.000Z",
        revision: 7,
        accepted: false,
      },
      error: null,
    });

    const response = await POST(progressRequest(progressBody()));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ ok: false, code });
  });

  it.each([
    [progressBody({ answers: { "41": 3 } }), "unknown statement"],
    [progressBody({ answers: { "1": 0 } }), "out-of-range score"],
    [progressBody({ bonus: [1, 1] }), "duplicate final selection"],
    [progressBody({ currentStatement: 41 }), "out-of-range cursor"],
    [progressBody({ clientRevision: 0 }), "nonpositive revision"],
    [progressBody({ email: "not-accepted@example.com" }), "personal data"],
  ])("rejects %s (%s) before persistence", async (body) => {
    const response = await POST(progressRequest(body));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "invalid" });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
    expect(mocks.adminRpc).not.toHaveBeenCalled();
  });

  it("requires authentication and fails closed when auth itself is unavailable", async () => {
    mocks.getAuthenticatedUser.mockResolvedValueOnce({
      ok: false,
      status: 401,
      reason: "unauthorized",
    });
    const unauthenticated = await POST(progressRequest(progressBody()));
    expect(unauthenticated.status).toBe(401);
    await expect(unauthenticated.json()).resolves.toEqual({
      ok: false,
      code: "unauthorized",
    });

    mocks.getAuthenticatedUser.mockResolvedValueOnce({
      ok: false,
      status: 503,
      reason: "supabase-unavailable",
    });
    const rejected = await POST(progressRequest(progressBody()));
    expect(rejected.status).toBe(503);
    await expect(rejected.json()).resolves.toEqual({ ok: false, code: "unavailable" });

    mocks.getAuthenticatedUser.mockRejectedValueOnce(new Error("auth unavailable"));
    const unavailable = await POST(progressRequest(progressBody()));
    expect(unavailable.status).toBe(503);
    await expect(unavailable.json()).resolves.toEqual({ ok: false, code: "unavailable" });

    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("rate limits before parsing or persistence", async () => {
    mocks.limitRequest.mockResolvedValueOnce({
      limited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const response = await POST(progressRequest(progressBody()));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "rate_limit" });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("fails closed and emits privacy-safe logs for RPC errors, empty results, and exceptions", async () => {
    mocks.adminRpc.mockResolvedValueOnce({ data: null, error: { code: "DB_FAILURE" } });
    const rpcFailure = await POST(progressRequest(progressBody()));
    expect(rpcFailure.status).toBe(503);
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "error",
      "career_anchor.progress.save_failed",
      expect.objectContaining({ reason: "DB_FAILURE" }),
    );

    mocks.adminRpc.mockResolvedValueOnce({ data: null, error: null });
    const emptyResult = await POST(progressRequest(progressBody()));
    expect(emptyResult.status).toBe(503);

    mocks.createAdminClient.mockImplementationOnce(() => {
      throw new Error("missing service role");
    });
    const exception = await POST(progressRequest(progressBody()));
    expect(exception.status).toBe(503);

    const logs = JSON.stringify(mocks.logEvent.mock.calls);
    expect(logs).not.toContain("203.0.113.29");
    expect(logs).not.toContain("user-test-id");
  });
});
