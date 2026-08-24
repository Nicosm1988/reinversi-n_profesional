import { createHash } from "node:crypto";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import {
  CAREER_ANCHOR_ALGORITHM_VERSION,
  CAREER_ANCHOR_INSTRUMENT_VERSION,
  buildCareerAnchorFallbackInterpretation,
  calculateCareerAnchorRanking,
  careerAnchorLocaleSchema,
  careerAnchorRawAnswersSchema,
  careerStageSchema,
  getCareerAnchorResultGroups,
} from "@/lib/diagnostics/career-anchor";
import { processCareerAnchorReportEmails } from "@/lib/diagnostics/career-anchor-report-delivery";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { readJsonBody } from "@/lib/http/json-body";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { limitRequest, type RateLimitResult } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { notifyInternalActivity } from "@/lib/internal-notifications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REQUEST_LIMIT = 5;
const REQUEST_WINDOW_MS = 10 * 60_000;
const MAX_BODY_BYTES = 20 * 1_024;

const requestSchema = z
  .object({
    rawAnswers: careerAnchorRawAnswersSchema,
    locale: careerAnchorLocaleSchema.optional().default("es"),
    careerStage: careerStageSchema.optional().default("prefer_not_to_say"),
  })
  .strict();

function responseHeaders(requestId: string, rateLimit?: RateLimitResult) {
  return {
    ...withRequestHeaders(
      requestId,
      rateLimit
        ? {
            limit: REQUEST_LIMIT,
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          }
        : undefined,
    ),
    "Cache-Control": "no-store",
  };
}

function rateLimitKey(req: Request, userId: string) {
  return createHash("sha256").update(`${userId}:${getClientIp(req)}`).digest("hex");
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const auth = await getAuthenticatedUser();

  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, code: auth.status === 503 ? "unavailable" : "unauthorized" },
      { status: auth.status, headers: responseHeaders(requestId) },
    );
  }

  const rateLimit = await limitRequest({
    key: rateLimitKey(req, auth.user.id),
    prefix: "diagnostics:career-anchors:complete-public",
    limit: REQUEST_LIMIT,
    windowMs: REQUEST_WINDOW_MS,
  });
  const headers = responseHeaders(requestId, rateLimit);

  if (rateLimit.limited) {
    logEvent("warn", "diagnostics.public_completion.rate_limited", { requestId });
    return NextResponse.json(
      { ok: false, code: "rate_limit" },
      { status: 429, headers },
    );
  }

  const body = await readJsonBody(req, MAX_BODY_BYTES);
  if (!body.ok) {
    const status = body.reason === "too-large" ? 413 : body.reason === "invalid-content-type" ? 415 : 400;
    return NextResponse.json(
      { ok: false, code: body.reason },
      { status, headers },
    );
  }

  const parsed = requestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: "invalid" },
      { status: 400, headers },
    );
  }

  const { rawAnswers, locale, careerStage } = parsed.data;
  const ranking = calculateCareerAnchorRanking(rawAnswers, locale);
  const groups = getCareerAnchorResultGroups(ranking);
  const fallback = buildCareerAnchorFallbackInterpretation(
    ranking,
    careerStage,
    locale,
  );
  const primaryAnchor = groups.primary[0];
  const dominantResult = primaryAnchor
    ? {
        id: primaryAnchor.id,
        name: primaryAnchor.name,
        score: primaryAnchor.score,
        rank: primaryAnchor.rank,
      }
    : null;

  if (!dominantResult) {
    return NextResponse.json(
      { ok: false, code: "invalid" },
      { status: 400, headers },
    );
  }

  const { data: existingAttempt, error: existingAttemptError } = await auth.supabase
    .from("user_diagnostics")
    .select("id, status, updated_at")
    .eq("diagnostic_type", "career_anchor")
    .maybeSingle();

  if (existingAttemptError) {
    logEvent("error", "diagnostics.public_completion.lookup_failed", {
      requestId,
      reason: existingAttemptError.code ?? "database_error",
    });
    return NextResponse.json(
      { ok: false, code: "unavailable" },
      { status: 503, headers },
    );
  }

  if (existingAttempt?.status === "completed") {
    logEvent("info", "diagnostics.public_completion.already_completed", { requestId });
    return NextResponse.json(
      { ok: false, code: "already_completed" },
      { status: 409, headers },
    );
  }

  const processingUpdatedAt = existingAttempt?.status === "processing"
    ? Date.parse(existingAttempt.updated_at)
    : Number.NaN;
  const processingLeaseIsActive = existingAttempt?.status === "processing"
    && (!Number.isFinite(processingUpdatedAt)
      || Date.now() - processingUpdatedAt < 15 * 60_000);

  if (processingLeaseIsActive) {
    return NextResponse.json(
      { ok: false, code: "finalizing" },
      { status: 409, headers },
    );
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { ok: false, code: "unavailable" },
      { status: 503, headers },
    );
  }

  const { data: diagnosticId, error: completionError } = await admin.rpc(
    "finalize_career_anchor_diagnostic",
    {
      p_user_id: auth.user.id,
      p_raw_answers: rawAnswers,
      p_dominant_result: dominantResult,
      p_score_result: ranking.map(({ id, name, score, mean, rank }) => ({
        id,
        name,
        score,
        mean,
        rank,
      })),
      p_result_base: fallback,
      p_locale: locale,
      p_career_stage: careerStage,
      p_instrument_version: CAREER_ANCHOR_INSTRUMENT_VERSION,
      p_algorithm_version: CAREER_ANCHOR_ALGORITHM_VERSION,
    },
  );

  if (completionError) {
    logEvent("error", "diagnostics.public_completion.save_failed", {
      requestId,
      reason: completionError?.code ?? "not_completed",
    });
    return NextResponse.json(
      { ok: false, code: "unavailable" },
      { status: 503, headers },
    );
  }

  if (!diagnosticId) {
    logEvent("info", "diagnostics.public_completion.already_completed", { requestId });
    return NextResponse.json(
      { ok: false, code: "already_completed" },
      { status: 409, headers },
    );
  }

  // The result and delivery jobs are durable before this point. Keep SMTP and
  // internal notifications outside the user's completion latency; their own
  // outboxes retain retries independently of the response lifecycle.
  after(async () => {
    const [reportDelivery, internalNotification] = await Promise.allSettled([
      processCareerAnchorReportEmails({ diagnosticId, maxDeliveries: 1 }),
      notifyInternalActivity({
        type: "career_anchor_completed",
        eventId: diagnosticId,
        occurredAt: new Date(),
        audience: "authenticated",
      }),
    ]);

    if (reportDelivery.status === "rejected") {
      logEvent("error", "diagnostics.public_completion.report_email_unexpected", {
        requestId,
        reason: reportDelivery.reason instanceof Error ? reportDelivery.reason.name : "unknown_error",
      });
    }

    if (internalNotification.status === "rejected") {
      logEvent("error", "diagnostics.public_completion.internal_notification_unexpected", {
        requestId,
        reason:
          internalNotification.reason instanceof Error
            ? internalNotification.reason.name
            : "unknown_error",
      });
    } else if (internalNotification.value.unavailable) {
      logEvent("error", "diagnostics.public_completion.internal_notification_unavailable", {
        requestId,
        reason: internalNotification.value.errorCode ?? "outbox_unavailable",
        failed: internalNotification.value.failed,
      });
    } else if (internalNotification.value.failed > 0) {
      logEvent("warn", "diagnostics.public_completion.internal_notification_queued_for_retry", {
        requestId,
        failed: internalNotification.value.failed,
      });
    }
  });

  logEvent("info", "diagnostics.public_completion.success", { requestId, locale });
  return NextResponse.json({ ok: true }, { status: 200, headers });
}
