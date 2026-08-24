import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  limitRequest: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limitRequest }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { POST } from "@/app/api/analytics/career-anchor/route";
import {
  careerAnchorAnalyticsEvents,
  trackCareerAnchorEvent,
} from "@/lib/analytics/career-anchor";

const JOURNEY_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function analyticsRequest(body: unknown) {
  const payload = body !== null && typeof body === "object" && !Array.isArray(body)
    ? { journeyId: JOURNEY_ID, ...body }
    : body;
  return new Request("https://senda.example/api/analytics/career-anchor", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.77",
    },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/analytics/career-anchor", () => {
  beforeEach(() => {
    mocks.limitRequest.mockReset().mockResolvedValue({
      limited: false,
      remaining: 199,
      resetAt: Date.now() + 60_000,
    });
    mocks.logEvent.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("accepts only the allowlisted, coarse journey metadata", async () => {
    const response = await POST(
      analyticsRequest({
        event: "career_anchor_statement_answered",
        locale: "es",
        statement: 12,
        progress: 30,
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.limitRequest).toHaveBeenCalledWith({
      key: expect.stringMatching(/^[a-f0-9]{64}$/),
      prefix: "analytics:career-anchor",
      limit: 200,
      windowMs: 30 * 60_000,
    });
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "info",
      "career_anchor_statement_answered",
      expect.objectContaining({
        journeyId: JOURNEY_ID,
        locale: "es",
        statement: 12,
        progress: 30,
      }),
    );
    const logs = JSON.stringify(mocks.logEvent.mock.calls);
    expect(logs).not.toContain("203.0.113.77");
  });

  it("keeps the public event vocabulary explicit and stable", () => {
    expect(careerAnchorAnalyticsEvents).toEqual([
      "career_anchor_intro_viewed",
      "career_anchor_started",
      "career_anchor_statement_answered",
      "career_anchor_25_percent",
      "career_anchor_50_percent",
      "career_anchor_75_percent",
      "career_anchor_statements_completed",
      "career_anchor_final_selection_started",
      "career_anchor_final_selection_completed",
      "career_anchor_result_generated",
      "career_anchor_result_viewed",
      "career_anchor_resumed",
      "career_anchor_abandoned",
      "career_anchor_progress_saved",
      "career_anchor_contact_requested",
    ]);
  });

  it.each([
    {
      body: { event: "career_anchor_unknown", locale: "es" },
      reason: "unknown event",
    },
    {
      body: { event: "career_anchor_started", locale: "fr" },
      reason: "unknown locale",
    },
    {
      body: { event: "career_anchor_statement_answered", locale: "es", statement: 41 },
      reason: "out-of-range statement",
    },
    {
      body: { event: "career_anchor_25_percent", locale: "es", progress: 101 },
      reason: "out-of-range progress",
    },
    {
      body: { event: "career_anchor_started", locale: "es", email: "person@example.com" },
      reason: "personal data",
    },
    {
      body: { event: "career_anchor_started", journeyId: "not-a-uuid", locale: "es" },
      reason: "invalid journey identifier",
    },
  ])("rejects $reason without logging it", async ({ body }) => {
    const response = await POST(analyticsRequest(body));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false });
    expect(mocks.logEvent).not.toHaveBeenCalled();
  });

  it("silently drops rate-limited telemetry", async () => {
    mocks.limitRequest.mockResolvedValueOnce({
      limited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const response = await POST(
      analyticsRequest({ event: "career_anchor_started", locale: "es" }),
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(mocks.logEvent).not.toHaveBeenCalled();
  });
});

describe("trackCareerAnchorEvent", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does nothing until analytics consent is present", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const dispatch = vi.spyOn(window, "dispatchEvent");

    trackCareerAnchorEvent(
      "career_anchor_started",
      { locale: "es", statement: 1, progress: 0 },
      false,
    );

    expect(dispatch).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("dispatches and posts only the allowlisted event metadata after consent", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const listener = vi.fn();
    window.localStorage.setItem("senda_career_anchor_analytics_journey_v1", JOURNEY_ID);
    window.addEventListener("senda:analytics", listener, { once: true });

    trackCareerAnchorEvent(
      "career_anchor_50_percent",
      { locale: "en", statement: 21, progress: 50 },
      true,
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      event: "career_anchor_50_percent",
      journeyId: JOURNEY_ID,
      locale: "en",
      statement: 21,
      progress: 50,
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/analytics/career-anchor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "career_anchor_50_percent",
        journeyId: JOURNEY_ID,
        locale: "en",
        statement: 21,
        progress: 50,
      }),
      credentials: "same-origin",
      keepalive: true,
    });
  });
});
