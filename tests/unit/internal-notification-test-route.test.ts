import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/dist/compiled/server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  notifyInternalActivity: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/internal-notifications/service", () => ({
  notifyInternalActivity: mocks.notifyInternalActivity,
}));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { POST } from "@/app/api/internal-notifications/career-anchor-completed/route";
import {
  ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE,
  ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS,
  issueAnonymousCareerAnchorAttempt,
} from "@/lib/internal-notifications/anonymous-attempt";

const ORIGIN = "https://universosenda.com";
const TEST_SECRET = "test-cron-secret-long-value";
const CLIENT_IP = "203.0.113.44";

function validBody() {
  return {
    locale: "es",
    completedQuestions: 40,
    selectedPriorities: 3,
  };
}

function issueAttempt(now = new Date()) {
  const attempt = issueAnonymousCareerAnchorAttempt(now);
  if (!attempt.ok) throw new Error("test signing configuration unavailable");
  return attempt;
}

function request(
  body: unknown,
  token?: string,
  origin = ORIGIN,
) {
  const headers: Record<string, string> = {
    origin,
    "sec-fetch-site": "same-origin",
    "content-type": "application/json",
    "x-senda-notification": "career-anchor-completed-anonymous",
    "x-forwarded-for": CLIENT_IP,
  };
  if (token) {
    headers.cookie = `${ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE}=${token}`;
    headers["x-request-id"] = token;
  }

  return new NextRequest(
    `${ORIGIN}/api/internal-notifications/career-anchor-completed`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );
}

function acceptedNotificationResult() {
  return {
    sent: 0,
    duplicates: 0,
    failed: 0,
    unavailable: false,
    deliveries: [],
  };
}

describe("POST /api/internal-notifications/career-anchor-completed", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", TEST_SECRET);
    mocks.logEvent.mockReset();
    mocks.notifyInternalActivity
      .mockReset()
      .mockResolvedValue(acceptedNotificationResult());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a server-issued proof and consumes it only after outbox acceptance", async () => {
    const attempt = issueAttempt();
    const response = await POST(request(validBody(), attempt.token));

    expect(response.status).toBe(202);
    expect(mocks.notifyInternalActivity).toHaveBeenCalledWith({
      type: "career_anchor_completed",
      eventId: `anonymous-${attempt.attemptId}`,
      occurredAt: expect.any(Date),
      audience: "anonymous",
    });
    expect(response.headers.get("set-cookie")).toEqual(
      expect.stringMatching(
        new RegExp(`${ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE}=.*Max-Age=0`, "i"),
      ),
    );
  });

  it("rejects a missing proof", async () => {
    const response = await POST(request(validBody()));

    expect(response.status).toBe(403);
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
  });

  it("rejects a proof whose signature was altered", async () => {
    const attempt = issueAttempt();
    const lastCharacter = attempt.token.at(-1);
    const altered = `${attempt.token.slice(0, -1)}${lastCharacter === "a" ? "b" : "a"}`;

    const response = await POST(request(validBody(), altered));

    expect(response.status).toBe(403);
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
  });

  it("rejects an expired proof", async () => {
    const issuedAt = new Date(
      Date.now() - (ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS + 60) * 1_000,
    );
    const attempt = issueAttempt(issuedAt);

    const response = await POST(request(validBody(), attempt.token));

    expect(response.status).toBe(403);
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
  });

  it("keeps the proof on 503 so the identical event can be retried", async () => {
    const attempt = issueAttempt();
    mocks.notifyInternalActivity
      .mockResolvedValueOnce({
        sent: 0,
        duplicates: 0,
        failed: 0,
        unavailable: true,
        errorCode: "unexpected",
        deliveries: [],
      })
      .mockResolvedValueOnce(acceptedNotificationResult());

    const firstResponse = await POST(request(validBody(), attempt.token));
    expect(firstResponse.status).toBe(503);
    expect(firstResponse.headers.get("set-cookie")).toBeNull();

    const retryResponse = await POST(request(validBody(), attempt.token));
    expect(retryResponse.status).toBe(202);
    expect(retryResponse.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(mocks.notifyInternalActivity).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ eventId: `anonymous-${attempt.attemptId}` }),
    );
  });

  it("consumes the proof when SMTP failures were accepted into the retry outbox", async () => {
    const attempt = issueAttempt();
    mocks.notifyInternalActivity.mockResolvedValueOnce({
      sent: 0,
      duplicates: 0,
      failed: 2,
      unavailable: false,
      deliveries: [],
    });

    const response = await POST(request(validBody(), attempt.token));

    expect(response.status).toBe(202);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "warn",
      "internal_notification.test_delivery_queued_for_retry",
      expect.objectContaining({ failed: 2 }),
    );
  });

  it("rejects client UUIDs, answers, wrong counters, and cross-origin calls", async () => {
    const attempt = issueAttempt();
    const payloadWithPrivateData = {
      ...validBody(),
      attemptId: attempt.attemptId,
      rawAnswers: { answers: { 1: 6 }, bonus: [1, 2, 3] },
    };

    expect(
      (await POST(request(payloadWithPrivateData, attempt.token))).status,
    ).toBe(400);
    expect(
      (await POST(request({ ...validBody(), completedQuestions: 39 }, attempt.token))).status,
    ).toBe(400);
    expect(
      (await POST(request(validBody(), attempt.token, "https://evil.example"))).status,
    ).toBe(403);
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
  });

  it("never logs the IP, proof cookie, answers, or response values", async () => {
    const attempt = issueAttempt();
    await POST(request(validBody(), attempt.token));

    const serializedLogs = JSON.stringify(mocks.logEvent.mock.calls);
    expect(serializedLogs).not.toContain(CLIENT_IP);
    expect(serializedLogs).not.toContain(attempt.token);
    expect(serializedLogs).not.toMatch(/rawAnswers|bonus|completedQuestions|selectedPriorities/i);
  });

});
