import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  notifyInternalActivity: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("next/dist/compiled/server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/internal-notifications/service", () => ({
  notifyInternalActivity: mocks.notifyInternalActivity,
}));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { reconcileCareerAnchorCompletionNotifications } from "@/lib/internal-notifications/reconcile-career-anchor-completions";

type SourceRow = { diagnostic_id: string; created_at: string };

function adminWithPages(pages: Array<{ data: SourceRow[] | null; error: null | { code?: string } }>) {
  const ranges: Array<[number, number]> = [];
  const selected: string[] = [];
  let page = 0;

  const admin = {
    from: vi.fn((table: string) => {
      expect(table).toBe("diagnostic_report_email_deliveries");
      const query = {
        select: vi.fn((columns: string) => {
          selected.push(columns);
          return query;
        }),
        eq: vi.fn(() => query),
        gte: vi.fn(() => query),
        lte: vi.fn(() => query),
        order: vi.fn(() => query),
        range: vi.fn((from: number, to: number) => {
          ranges.push([from, to]);
          return Promise.resolve(pages[page++] ?? { data: [], error: null });
        }),
      };
      return query;
    }),
  };

  return { admin, ranges, selected };
}

describe("authenticated Career Anchor completion reconciliation", () => {
  beforeEach(() => {
    vi.stubEnv("INTERNAL_NOTIFICATION_STARTED_AT", "2026-08-23T12:00:00-03:00");
    mocks.createAdminClient.mockReset();
    mocks.notifyInternalActivity.mockReset().mockResolvedValue({
      sent: 0,
      duplicates: 2,
      failed: 0,
      unavailable: false,
      deliveries: [],
    });
    mocks.logEvent.mockReset();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("rebuilds each event from only its diagnostic id and creation time", async () => {
    const first = {
      diagnostic_id: "9ae3ea1c-b610-4d08-824d-498f39a761ca",
      created_at: "2026-08-23T15:05:00Z",
    };
    const second = {
      diagnostic_id: "56ba0032-09c4-40cc-aeb8-d73bfda79150",
      created_at: "2026-08-23T15:06:00Z",
    };
    const { admin, ranges, selected } = adminWithPages([
      { data: [first, second], error: null },
      { data: [], error: null },
    ]);
    mocks.createAdminClient.mockReturnValue(admin);

    const result = await reconcileCareerAnchorCompletionNotifications({
      now: new Date("2026-08-23T16:00:00Z"),
      pageSize: 2,
    });

    expect(selected).toEqual([
      "diagnostic_id, created_at",
      "diagnostic_id, created_at",
    ]);
    expect(ranges).toEqual([[0, 1], [2, 3]]);
    expect(mocks.notifyInternalActivity).toHaveBeenNthCalledWith(1, {
      type: "career_anchor_completed",
      eventId: first.diagnostic_id,
      occurredAt: new Date(first.created_at),
      audience: "authenticated",
    });
    expect(mocks.notifyInternalActivity).toHaveBeenNthCalledWith(2, {
      type: "career_anchor_completed",
      eventId: second.diagnostic_id,
      occurredAt: new Date(second.created_at),
      audience: "authenticated",
    });
    expect(result).toEqual({
      scanned: 2,
      reconciled: 2,
      sent: 0,
      duplicates: 4,
      failed: 0,
      unavailable: false,
    });
    expect(JSON.stringify(result)).not.toContain(first.diagnostic_id);
  });

  it("does not query historical rows beyond the Redis deduplication window", async () => {
    vi.stubEnv("INTERNAL_NOTIFICATION_STARTED_AT", "2020-01-01T00:00:00Z");
    const { admin } = adminWithPages([{ data: [], error: null }]);
    mocks.createAdminClient.mockReturnValue(admin);

    await reconcileCareerAnchorCompletionNotifications({
      now: new Date("2026-08-23T00:00:00Z"),
    });

    const query = admin.from.mock.results[0]?.value;
    expect(query.gte).toHaveBeenCalledWith("created_at", "2026-05-26T00:00:00.000Z");
    expect(query.lte).toHaveBeenCalledWith("created_at", "2026-08-23T00:00:00.000Z");
  });

  it("stops safely when the internal outbox is unavailable", async () => {
    const rows = [
      {
        diagnostic_id: "9ae3ea1c-b610-4d08-824d-498f39a761ca",
        created_at: "2026-08-23T15:05:00Z",
      },
      {
        diagnostic_id: "56ba0032-09c4-40cc-aeb8-d73bfda79150",
        created_at: "2026-08-23T15:06:00Z",
      },
    ];
    const { admin } = adminWithPages([{ data: rows, error: null }]);
    mocks.createAdminClient.mockReturnValue(admin);
    mocks.notifyInternalActivity.mockResolvedValueOnce({
      sent: 0,
      duplicates: 0,
      failed: 0,
      unavailable: true,
      errorCode: "outbox_unavailable",
      deliveries: [],
    });

    const result = await reconcileCareerAnchorCompletionNotifications({
      now: new Date("2026-08-23T16:00:00Z"),
    });

    expect(result.unavailable).toBe(true);
    expect(result.scanned).toBe(1);
    expect(mocks.notifyInternalActivity).toHaveBeenCalledTimes(1);
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "error",
      "internal_notifications.completion_reconciliation_interrupted",
      { reason: "outbox_unavailable", scanned: 1 },
    );
  });

  it("fails closed on missing cutoff or a database error without exposing rows", async () => {
    vi.stubEnv("INTERNAL_NOTIFICATION_STARTED_AT", "");
    const missingConfig = await reconcileCareerAnchorCompletionNotifications();
    expect(missingConfig.unavailable).toBe(true);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();

    vi.stubEnv("INTERNAL_NOTIFICATION_STARTED_AT", "2026-08-23T15:00:00Z");
    const { admin } = adminWithPages([{ data: null, error: { code: "db_unavailable" } }]);
    mocks.createAdminClient.mockReturnValue(admin);
    const databaseFailure = await reconcileCareerAnchorCompletionNotifications({
      now: new Date("2026-08-23T16:00:00Z"),
    });

    expect(databaseFailure.unavailable).toBe(true);
    expect(mocks.notifyInternalActivity).not.toHaveBeenCalled();
    expect(mocks.logEvent).toHaveBeenLastCalledWith(
      "error",
      "internal_notifications.completion_reconciliation_query_failed",
      { reason: "db_unavailable" },
    );
  });
});
