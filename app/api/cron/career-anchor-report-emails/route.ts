import { createHash, timingSafeEqual } from "node:crypto";
import { processCareerAnchorInternalResultEmails } from "@/lib/diagnostics/career-anchor-internal-result-delivery";
import { processCareerAnchorReportEmails } from "@/lib/diagnostics/career-anchor-report-delivery";
import { processInternalNotificationOutbox } from "@/lib/internal-notifications/service";
import { getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

function validSecret(value: string | undefined) {
  const normalized = value?.trim();
  return Boolean(
    normalized
      && normalized.length >= 16
      && !/^\[(?:sensitive|redacted|hidden)\]$/i.test(normalized),
  );
}

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = req.headers.get("authorization");
  if (!validSecret(secret) || !authorization?.startsWith("Bearer ")) return false;

  const provided = authorization.slice("Bearer ".length);
  const expectedDigest = createHash("sha256").update(secret!).digest();
  const providedDigest = createHash("sha256").update(provided).digest();
  return timingSafeEqual(expectedDigest, providedDigest);
}

function batchSize() {
  const configured = Number(process.env.REPORT_EMAIL_BATCH_SIZE ?? "5");
  return Number.isInteger(configured) && configured >= 1 && configured <= 25 ? configured : 5;
}

function internalNotificationBatchSize() {
  const configured = Number(process.env.INTERNAL_NOTIFICATION_BATCH_SIZE ?? "25");
  return Number.isInteger(configured) && configured >= 1 && configured <= 25 ? configured : 25;
}

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const headers = {
    ...withRequestHeaders(requestId),
    "Cache-Control": "no-store",
  };

  if (!authorized(req)) {
    logEvent("warn", "diagnostics.report_email.cron_unauthorized", { requestId });
    return Response.json({ ok: false }, { status: 401, headers });
  }

  const maxDeliveries = batchSize();
  const [summary, internalResultEmailSummary, internalNotificationResult] = await Promise.all([
    processCareerAnchorReportEmails({ maxDeliveries }),
    processCareerAnchorInternalResultEmails({ maxDeliveries }),
    processInternalNotificationOutbox({ maxDeliveries: internalNotificationBatchSize() }),
  ]);
  const internalNotifications = {
    sent: internalNotificationResult.sent,
    duplicates: internalNotificationResult.duplicates,
    failed: internalNotificationResult.failed,
    unavailable: internalNotificationResult.unavailable,
    ...(internalNotificationResult.errorCode
      ? { errorCode: internalNotificationResult.errorCode }
      : {}),
  };
  const internalResultEmails = {
    claimed: internalResultEmailSummary.claimed,
    sent: internalResultEmailSummary.sent,
    retryScheduled: internalResultEmailSummary.retryScheduled,
    permanentFailures: internalResultEmailSummary.permanentFailures,
    unavailable: internalResultEmailSummary.unavailable,
  };
  const unavailable =
    summary.unavailable
    || internalResultEmails.unavailable
    || internalNotifications.unavailable;

  return Response.json(
    { ok: !unavailable, ...summary, internalResultEmails, internalNotifications },
    { status: unavailable ? 503 : 200, headers },
  );
}
