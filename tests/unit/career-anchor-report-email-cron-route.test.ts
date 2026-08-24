import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  processCareerAnchorReportEmails: vi.fn(),
  processCareerAnchorInternalResultEmails: vi.fn(),
  processInternalNotificationOutbox: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/diagnostics/career-anchor-report-delivery", () => ({
  processCareerAnchorReportEmails: mocks.processCareerAnchorReportEmails,
}));
vi.mock("@/lib/diagnostics/career-anchor-internal-result-delivery", () => ({
  processCareerAnchorInternalResultEmails:
    mocks.processCareerAnchorInternalResultEmails,
}));
vi.mock("@/lib/internal-notifications/service", () => ({
  processInternalNotificationOutbox: mocks.processInternalNotificationOutbox,
}));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { GET } from "@/app/api/cron/career-anchor-report-emails/route";

describe("GET /api/cron/career-anchor-report-emails", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret-long-value");
    vi.stubEnv("REPORT_EMAIL_BATCH_SIZE", "5");
    mocks.logEvent.mockReset();
    mocks.processCareerAnchorReportEmails.mockReset().mockResolvedValue({
      claimed: 2,
      sent: 2,
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
    mocks.processInternalNotificationOutbox.mockReset().mockResolvedValue({
      sent: 1,
      duplicates: 0,
      failed: 0,
      unavailable: false,
      deliveries: [{ recipientKey: "slot-0" }],
    });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("rejects requests without the private bearer secret", async () => {
    const response = await GET(
      new Request("https://universosenda.com/api/cron/career-anchor-report-emails"),
    );

    expect(response.status).toBe(401);
    expect(mocks.processCareerAnchorReportEmails).not.toHaveBeenCalled();
    expect(mocks.processCareerAnchorInternalResultEmails).not.toHaveBeenCalled();
    expect(mocks.processInternalNotificationOutbox).not.toHaveBeenCalled();
  });

  it("processes a bounded batch and exposes no delivery identifiers", async () => {
    const response = await GET(
      new Request("https://universosenda.com/api/cron/career-anchor-report-emails", {
        headers: { authorization: "Bearer test-cron-secret-long-value" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.processCareerAnchorReportEmails).toHaveBeenCalledWith({ maxDeliveries: 5 });
    expect(mocks.processCareerAnchorInternalResultEmails).toHaveBeenCalledWith({
      maxDeliveries: 5,
    });
    expect(mocks.processInternalNotificationOutbox).toHaveBeenCalledWith({ maxDeliveries: 25 });
    expect(body).toEqual({
      ok: true,
      claimed: 2,
      sent: 2,
      retryScheduled: 0,
      permanentFailures: 0,
      unavailable: false,
      internalResultEmails: {
        claimed: 2,
        sent: 2,
        retryScheduled: 0,
        permanentFailures: 0,
        unavailable: false,
      },
      internalNotifications: {
        sent: 1,
        duplicates: 0,
        failed: 0,
        unavailable: false,
      },
    });
  });

  it("reports degraded while keeping retryable internal deliveries private", async () => {
    mocks.processInternalNotificationOutbox.mockResolvedValueOnce({
      sent: 0,
      duplicates: 0,
      failed: 2,
      unavailable: true,
      errorCode: "outbox_unavailable",
      deliveries: [
        { recipientKey: "slot-0", status: "failed" },
        { recipientKey: "slot-1", status: "failed" },
      ],
    });

    const response = await GET(
      new Request("https://universosenda.com/api/cron/career-anchor-report-emails", {
        headers: { authorization: "Bearer test-cron-secret-long-value" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.internalNotifications).toEqual({
      sent: 0,
      duplicates: 0,
      failed: 2,
      unavailable: true,
      errorCode: "outbox_unavailable",
    });
    expect(JSON.stringify(body)).not.toContain("slot-0");
  });

  it("reports degraded when durable internal result delivery is unavailable", async () => {
    mocks.processCareerAnchorInternalResultEmails.mockResolvedValueOnce({
      claimed: 1,
      sent: 0,
      retryScheduled: 1,
      permanentFailures: 0,
      unavailable: true,
    });

    const response = await GET(
      new Request("https://universosenda.com/api/cron/career-anchor-report-emails", {
        headers: { authorization: "Bearer test-cron-secret-long-value" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.internalResultEmails).toEqual({
      claimed: 1,
      sent: 0,
      retryScheduled: 1,
      permanentFailures: 0,
      unavailable: true,
    });
  });
});
