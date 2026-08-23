import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  processCareerAnchorReportEmails: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/diagnostics/career-anchor-report-delivery", () => ({
  processCareerAnchorReportEmails: mocks.processCareerAnchorReportEmails,
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
  });

  afterEach(() => vi.unstubAllEnvs());

  it("rejects requests without the private bearer secret", async () => {
    const response = await GET(
      new Request("https://universosenda.com/api/cron/career-anchor-report-emails"),
    );

    expect(response.status).toBe(401);
    expect(mocks.processCareerAnchorReportEmails).not.toHaveBeenCalled();
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
    expect(body).toEqual({
      ok: true,
      claimed: 2,
      sent: 2,
      retryScheduled: 0,
      permanentFailures: 0,
      unavailable: false,
    });
  });
});
