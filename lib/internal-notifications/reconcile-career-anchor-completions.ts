import "next/dist/compiled/server-only";

import { z } from "zod";
import { readInternalNotificationReconciliationConfig } from "@/lib/internal-notifications/config";
import { notifyInternalActivity } from "@/lib/internal-notifications/service";
import { logEvent } from "@/lib/observability/logger";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 250;
const DEDUPLICATION_WINDOW_MS = 89 * 24 * 60 * 60 * 1_000;

const sourceRowSchema = z
  .object({
    diagnostic_id: z.uuid(),
    created_at: z.iso.datetime({ offset: true }),
  })
  .strict();

export type CareerAnchorCompletionReconciliationSummary = {
  scanned: number;
  reconciled: number;
  sent: number;
  duplicates: number;
  failed: number;
  unavailable: boolean;
};

function emptySummary(): CareerAnchorCompletionReconciliationSummary {
  return {
    scanned: 0,
    reconciled: 0,
    sent: 0,
    duplicates: 0,
    failed: 0,
    unavailable: false,
  };
}

function effectiveCutoff(startedAt: Date, now: Date) {
  // Redis keeps delivered markers for 90 days. Stopping one day earlier
  // prevents a successful historical notification from being sent again
  // after its marker expires.
  return new Date(Math.max(startedAt.getTime(), now.getTime() - DEDUPLICATION_WINDOW_MS));
}

export async function reconcileCareerAnchorCompletionNotifications(options: {
  now?: Date;
  pageSize?: number;
} = {}): Promise<CareerAnchorCompletionReconciliationSummary> {
  const summary = emptySummary();
  const config = readInternalNotificationReconciliationConfig();
  const now = options.now ?? new Date();
  if (!config || !Number.isFinite(now.getTime())) {
    logEvent("error", "internal_notifications.completion_reconciliation_unavailable", {
      reason: "configuration",
    });
    return { ...summary, unavailable: true };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    logEvent("error", "internal_notifications.completion_reconciliation_unavailable", {
      reason: "supabase_admin_configuration",
    });
    return { ...summary, unavailable: true };
  }

  const pageSize = Math.max(
    1,
    Math.min(Math.trunc(options.pageSize ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE),
  );
  const cutoff = effectiveCutoff(config.startedAt, now).toISOString();
  const upperBound = now.toISOString();
  let offset = 0;

  while (true) {
    const { data, error } = await admin
      .from("diagnostic_report_email_deliveries")
      .select("diagnostic_id, created_at")
      .eq("email_kind", "career_anchor_completed_v1")
      .gte("created_at", cutoff)
      .lte("created_at", upperBound)
      .order("created_at", { ascending: true })
      .order("diagnostic_id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      logEvent("error", "internal_notifications.completion_reconciliation_query_failed", {
        reason: error.code ?? "database_error",
      });
      return { ...summary, unavailable: true };
    }

    const parsedRows = z.array(sourceRowSchema).safeParse(data ?? []);
    if (!parsedRows.success) {
      logEvent("error", "internal_notifications.completion_reconciliation_query_failed", {
        reason: "invalid_database_payload",
      });
      return { ...summary, unavailable: true };
    }

    for (const row of parsedRows.data) {
      summary.scanned += 1;
      const result = await notifyInternalActivity({
        type: "career_anchor_completed",
        eventId: row.diagnostic_id,
        occurredAt: new Date(row.created_at),
        audience: "authenticated",
      });
      summary.sent += result.sent;
      summary.duplicates += result.duplicates;
      summary.failed += result.failed;

      if (result.unavailable) {
        logEvent("error", "internal_notifications.completion_reconciliation_interrupted", {
          reason: result.errorCode ?? "notification_unavailable",
          scanned: summary.scanned,
        });
        return { ...summary, unavailable: true };
      }

      summary.reconciled += 1;
    }

    if (parsedRows.data.length < pageSize) break;
    offset += parsedRows.data.length;
  }

  logEvent("info", "internal_notifications.completion_reconciliation_completed", summary);
  return summary;
}
