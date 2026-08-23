import { NextResponse } from "next/server";
import { z } from "zod";
import { careerAnchorLocaleSchema } from "@/lib/diagnostics/career-anchor";
import { createRequestId } from "@/lib/http/request-context";
import { readJsonBody } from "@/lib/http/json-body";
import { withRequestHeaders } from "@/lib/http/response-headers";
import {
  ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE,
  anonymousCareerAnchorAttemptCookieOptions,
  verifyAnonymousCareerAnchorAttempt,
} from "@/lib/internal-notifications/anonymous-attempt";
import { checkInternalNotificationRequest } from "@/lib/internal-notifications/request-security";
import { notifyInternalActivity } from "@/lib/internal-notifications/service";
import { logEvent } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2 * 1_024;

const requestSchema = z
  .object({
    locale: careerAnchorLocaleSchema,
    completedQuestions: z.literal(40),
    selectedPriorities: z.literal(3),
  })
  .strict();

function responseHeaders(requestId: string) {
  return {
    ...withRequestHeaders(requestId),
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function readAttemptCookie(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return undefined;

  for (const entry of cookieHeader.split(";")) {
    const separatorIndex = entry.indexOf("=");
    if (separatorIndex < 0) continue;

    const name = entry.slice(0, separatorIndex).trim();
    if (name === ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE) {
      return entry.slice(separatorIndex + 1).trim();
    }
  }

  return undefined;
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  const requestCheck = checkInternalNotificationRequest(
    req,
    "anonymousCareerAnchorCompletion",
  );
  if (!requestCheck.ok) {
    logEvent("warn", "internal_notification.test_request_rejected", {
      requestId,
      reason: requestCheck.reason,
    });
    return NextResponse.json(
      { ok: false },
      { status: 403, headers: responseHeaders(requestId) },
    );
  }

  const body = await readJsonBody(req, MAX_BODY_BYTES);
  if (!body.ok) {
    const status = body.reason === "too-large"
      ? 413
      : body.reason === "invalid-content-type"
        ? 415
        : 400;
    return NextResponse.json(
      { ok: false },
      { status, headers: responseHeaders(requestId) },
    );
  }

  const parsed = requestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false },
      { status: 400, headers: responseHeaders(requestId) },
    );
  }

  const attemptToken = readAttemptCookie(req);
  const verifiedAttempt = attemptToken
    ? verifyAnonymousCareerAnchorAttempt(attemptToken)
    : { ok: false as const, reason: "missing" as const };

  if (!verifiedAttempt.ok) {
    const configurationUnavailable = verifiedAttempt.reason === "configuration";
    logEvent(
      configurationUnavailable ? "error" : "warn",
      "internal_notification.test_attempt_rejected",
      {
        requestId,
        reason: configurationUnavailable ? "configuration" : "invalid_proof",
      },
    );
    return NextResponse.json(
      { ok: false },
      {
        status: configurationUnavailable ? 503 : 403,
        headers: responseHeaders(requestId),
      },
    );
  }

  const headers = responseHeaders(requestId);

  let notification: Awaited<ReturnType<typeof notifyInternalActivity>>;
  try {
    notification = await notifyInternalActivity({
      type: "career_anchor_completed",
      eventId: `anonymous-${verifiedAttempt.attemptId}`,
      occurredAt: new Date(),
      audience: "anonymous",
    });
  } catch {
    logEvent("error", "internal_notification.test_outbox_unavailable", {
      requestId,
      reason: "unexpected",
    });
    return NextResponse.json({ ok: false }, { status: 503, headers });
  }

  if (notification.unavailable) {
    logEvent("error", "internal_notification.test_outbox_unavailable", {
      requestId,
      reason: notification.errorCode ?? "outbox_unavailable",
    });
    return NextResponse.json({ ok: false }, { status: 503, headers });
  }

  if (notification.failed > 0) {
    logEvent("warn", "internal_notification.test_delivery_queued_for_retry", {
      requestId,
      failed: notification.failed,
    });
  }

  const response = NextResponse.json({ ok: true }, { status: 202, headers });
  response.cookies.set({
    name: ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE,
    value: "",
    ...anonymousCareerAnchorAttemptCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });

  logEvent("info", "internal_notification.test_completion_recorded", {
    requestId,
    audience: "anonymous",
  });
  return response;
}
