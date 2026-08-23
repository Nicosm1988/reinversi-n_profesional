import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createRequestId, getClientIp } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import {
  ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE,
  anonymousCareerAnchorAttemptCookieOptions,
  issueAnonymousCareerAnchorAttempt,
} from "@/lib/internal-notifications/anonymous-attempt";
import { checkInternalNotificationRequest } from "@/lib/internal-notifications/request-security";
import { logEvent } from "@/lib/observability/logger";
import { limitRequest, type RateLimitResult } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_LIMIT = 10;
const REQUEST_WINDOW_MS = 60 * 60_000;

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
    Vary: "Origin",
  };
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  const requestCheck = checkInternalNotificationRequest(
    req,
    "anonymousCareerAnchorAttempt",
  );
  if (!requestCheck.ok) {
    logEvent("warn", "internal_notification.test_attempt_request_rejected", {
      requestId,
      reason: requestCheck.reason,
    });
    return NextResponse.json(
      { ok: false },
      { status: 403, headers: responseHeaders(requestId) },
    );
  }

  const rateLimit = await limitRequest({
    key: createHash("sha256").update(getClientIp(req)).digest("hex"),
    prefix: "internal-notifications:career-anchor-attempt",
    limit: REQUEST_LIMIT,
    windowMs: REQUEST_WINDOW_MS,
  });
  const headers = responseHeaders(requestId, rateLimit);
  if (rateLimit.limited) {
    logEvent("warn", "internal_notification.test_attempt_rate_limited", {
      requestId,
    });
    return NextResponse.json({ ok: false }, { status: 429, headers });
  }

  const issuedAttempt = issueAnonymousCareerAnchorAttempt();
  if (!issuedAttempt.ok) {
    logEvent("error", "internal_notification.test_attempt_unavailable", {
      requestId,
      reason: issuedAttempt.reason,
    });
    return NextResponse.json({ ok: false }, { status: 503, headers });
  }

  const response = NextResponse.json({ ok: true }, { status: 201, headers });
  response.cookies.set({
    name: ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE,
    value: issuedAttempt.token,
    ...anonymousCareerAnchorAttemptCookieOptions,
    expires: issuedAttempt.expiresAt,
  });

  logEvent("info", "internal_notification.test_attempt_issued", { requestId });
  return response;
}
