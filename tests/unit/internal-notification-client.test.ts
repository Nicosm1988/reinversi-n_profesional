import { afterEach, describe, expect, it, vi } from "vitest";
import {
  requestAnonymousCareerAnchorAttempt,
  requestAnonymousCareerAnchorCompletionNotification,
  requestAuthenticatedCareerAnchorCompletionNotification,
  requestLoginNotification,
} from "@/lib/internal-notifications/client";

afterEach(() => vi.unstubAllGlobals());

describe("internal notification client", () => {
  it("requests a login notification without sending identity data from the browser", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestLoginNotification()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal-notifications/login",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "x-senda-notification": "login" },
        body: undefined,
      }),
    );
  });

  it("requests an authenticated completion retry without browser identity or answers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestAuthenticatedCareerAnchorCompletionNotification(),
    ).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal-notifications/career-anchor-completed-authenticated",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: {
          "x-senda-notification": "career-anchor-completed-authenticated",
        },
        body: undefined,
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(/email|answer|score|diagnosticId/i);
  });

  it("sends only a completion receipt, never the answers, and retries transport once", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("navigation interrupted"));
    vi.stubGlobal("fetch", fetchMock);
    const input = {
      locale: "es" as const,
      completedQuestions: 40 as const,
      selectedPriorities: 3 as const,
    };

    await expect(
      requestAnonymousCareerAnchorCompletionNotification(input),
    ).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal-notifications/career-anchor-completed",
      expect.objectContaining({
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "x-senda-notification": "career-anchor-completed-anonymous",
        },
        body: JSON.stringify(input),
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(
      /answers|bonus|score|attemptId|uuid/i,
    );
  });

  it("starts an anonymous attempt without exposing an identifier to the browser", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestAnonymousCareerAnchorAttempt()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal-notifications/career-anchor-attempt",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: {
          "x-senda-notification": "career-anchor-attempt-anonymous",
        },
        body: undefined,
      }),
    );
  });

  it("does not immediately retry a rejected or rate-limited request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestAnonymousCareerAnchorAttempt()).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
