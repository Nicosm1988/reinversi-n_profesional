import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  sendCareerAnchorReportEmail: vi.fn(),
  logEvent: vi.fn(),
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("next/dist/compiled/server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/diagnostics/career-anchor-report-mailer", async () => {
  const actual = await vi.importActual<typeof import("@/lib/diagnostics/career-anchor-report-mailer")>(
    "@/lib/diagnostics/career-anchor-report-mailer",
  );
  return { ...actual, sendCareerAnchorReportEmail: mocks.sendCareerAnchorReportEmail };
});
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { processCareerAnchorReportEmails } from "@/lib/diagnostics/career-anchor-report-delivery";

const claim = {
  delivery_id: "f83b4e39-354c-4783-b65a-99b399a70947",
  diagnostic_id: "9e06fa68-d93f-4856-b73e-98a4659a95c4",
  user_id: "2d4ce17f-9664-45c4-b606-7e1a2467110f",
  locale: "es",
  attempt_id: "5d0aface-88ad-4df6-8390-2cf52e819810",
  attempt_number: 1,
};

const storedReport = {
  status: "completed",
};

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

describe("processCareerAnchorReportEmails", () => {
  beforeEach(() => {
    const builder = queryBuilder();
    mocks.rpc.mockReset();
    mocks.maybeSingle.mockReset().mockResolvedValue({ data: storedReport, error: null });
    mocks.getUserById.mockReset().mockResolvedValue({
      data: { user: { email: "person@example.com" } },
      error: null,
    });
    mocks.sendCareerAnchorReportEmail.mockReset().mockResolvedValue({
      messageId: "<message@universosenda.com>",
    });
    mocks.logEvent.mockReset();
    mocks.createAdminClient.mockReset().mockReturnValue({
      rpc: mocks.rpc,
      from: vi.fn(() => builder),
      auth: { admin: { getUserById: mocks.getUserById } },
    });
  });

  it("claims once, sends a private notification, and finalizes atomically", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: [claim], error: null })
      .mockResolvedValueOnce({ data: true, error: null });

    await expect(
      processCareerAnchorReportEmails({ diagnosticId: claim.diagnostic_id, maxDeliveries: 1 }),
    ).resolves.toEqual({
      claimed: 1,
      sent: 1,
      retryScheduled: 0,
      permanentFailures: 0,
      unavailable: false,
    });

    expect(mocks.sendCareerAnchorReportEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: "person@example.com",
        reportUrl: "https://universosenda.com/panel#resultado",
      }),
    );
    expect(mocks.sendCareerAnchorReportEmail.mock.calls[0]?.[0]).not.toHaveProperty("ranking");
    expect(mocks.rpc).toHaveBeenNthCalledWith(
      2,
      "finish_career_anchor_report_email_delivery",
      expect.objectContaining({
        p_delivery_id: claim.delivery_id,
        p_attempt_id: claim.attempt_id,
        p_outcome: "sent",
        p_provider_message_id: "<message@universosenda.com>",
      }),
    );
    expect(JSON.stringify(mocks.logEvent.mock.calls)).not.toContain("person@example.com");
  });

  it("keeps a transport failure retryable without losing the report", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: [claim], error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    mocks.sendCareerAnchorReportEmail.mockRejectedValueOnce(new Error("connection lost"));

    const result = await processCareerAnchorReportEmails({ maxDeliveries: 1 });

    expect(result).toMatchObject({ claimed: 1, sent: 0, retryScheduled: 1 });
    expect(mocks.rpc).toHaveBeenNthCalledWith(
      2,
      "finish_career_anchor_report_email_delivery",
      expect.objectContaining({
        p_outcome: "failed",
        p_error_code: "smtp_transport",
        p_retry_after_seconds: 900,
      }),
    );
  });

  it("records missing report data as a permanent failure without sending", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: [claim], error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await processCareerAnchorReportEmails({ maxDeliveries: 1 });

    expect(result).toMatchObject({ claimed: 1, permanentFailures: 1 });
    expect(mocks.sendCareerAnchorReportEmail).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenNthCalledWith(
      2,
      "finish_career_anchor_report_email_delivery",
      expect.objectContaining({
        p_outcome: "permanent_failure",
        p_error_code: "report_data_invalid",
      }),
    );
  });
});
