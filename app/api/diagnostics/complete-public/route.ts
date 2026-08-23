import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildCareerAnchorFallbackInterpretation,
  calculateCareerAnchorRanking,
  careerAnchorLocaleSchema,
  careerAnchorRawAnswersSchema,
  getCareerAnchorResultGroups,
} from "@/lib/diagnostics/career-anchor";
import { processCareerAnchorReportEmails } from "@/lib/diagnostics/career-anchor-report-delivery";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { readJsonBody } from "@/lib/http/json-body";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { limitRequest, type RateLimitResult } from "@/lib/rate-limit";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { notifyInternalActivity } from "@/lib/internal-notifications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_LIMIT = 5;
const REQUEST_WINDOW_MS = 10 * 60_000;
const MAX_BODY_BYTES = 20 * 1_024;

const requestSchema = z
  .object({
    rawAnswers: careerAnchorRawAnswersSchema,
    locale: careerAnchorLocaleSchema.optional().default("es"),
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

  const { rawAnswers, locale } = parsed.data;
  const ranking = calculateCareerAnchorRanking(rawAnswers, locale);
  const groups = getCareerAnchorResultGroups(ranking);
  const fallback = buildCareerAnchorFallbackInterpretation(
    ranking,
    "prefer_not_to_say",
    locale,
  );
  const dominantName = groups.primary.map((anchor) => anchor.name).join(" · ");
  const storedFeedback = {
    title: fallback.title,
    summary: fallback.summary,
    frictionAreas: fallback.tensions.slice(0, 3),
    idealEcosystem: fallback.stageConnection,
    strategicQuestion: fallback.reflectionQuestions[0] ?? "",
  };

  const { data: existingAttempt, error: existingAttemptError } = await auth.supabase
    .from("user_diagnostics")
    .select("id")
    .eq("diagnostic_type", "career_anchor")
    .eq("status", "completed")
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

  if (existingAttempt) {
    logEvent("info", "diagnostics.public_completion.already_completed", { requestId });
    return NextResponse.json(
      { ok: false, code: "already_completed" },
      { status: 409, headers },
    );
  }

  const { data: diagnosticId, error: claimError } = await auth.supabase.rpc(
    "claim_free_career_anchor_diagnostic",
    {
      p_user_data: { name: "", age: "", occupation: "", city: "", country: "", locale },
      p_raw_answers: rawAnswers,
      p_dominant_result: { name: dominantName },
    },
  );

  if (claimError) {
    logEvent("error", "diagnostics.public_completion.claim_failed", {
      requestId,
      reason: claimError.code ?? "database_error",
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

  const { data: completed, error: completionError } = await auth.supabase.rpc(
    "complete_free_career_anchor_diagnostic",
    {
      p_diagnostic_id: diagnosticId,
      p_ai_feedback: storedFeedback,
    },
  );

  if (completionError || !completed) {
    logEvent("error", "diagnostics.public_completion.save_failed", {
      requestId,
      reason: completionError?.code ?? "not_completed",
    });
    return NextResponse.json(
      { ok: false, code: "unavailable" },
      { status: 503, headers },
    );
  }

  // The report is already durable at this point. Both immediate deliveries are
  // isolated from persistence so an SMTP outage never asks the person to retake the test.
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

  logEvent("info", "diagnostics.public_completion.success", { requestId, locale });
  return NextResponse.json({ ok: true }, { status: 200, headers });
}
