import { createHash, timingSafeEqual } from "node:crypto";
import { processCareerAnchorReportEmails } from "@/lib/diagnostics/career-anchor-report-delivery";
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

  const summary = await processCareerAnchorReportEmails({ maxDeliveries: batchSize() });
  return Response.json(
    { ok: !summary.unavailable, ...summary },
    { status: summary.unavailable ? 503 : 200, headers },
  );
}
