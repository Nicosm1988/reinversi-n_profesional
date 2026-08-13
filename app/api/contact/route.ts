import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ContactConfigurationError,
  ContactDeliveryError,
  sendContactEmail,
} from "@/lib/contact/mailer";
import { checkContactRequest } from "@/lib/contact/request-security";
import { contactSubmissionSchema } from "@/lib/contact/schema";
import { readJsonBody } from "@/lib/http/json-body";
import { createRequestId, getClientIp } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { limitRequest, type RateLimitResult } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTACT_MAX_BODY_BYTES = 16 * 1_024;
const CONTACT_RATE_LIMIT = 5;
const CONTACT_RATE_WINDOW_MS = 10 * 60_000;

type ContactErrorCode =
  | "invalid"
  | "tooLarge"
  | "rateLimit"
  | "origin"
  | "config"
  | "send"
  | "unexpected";

function responseHeaders(requestId: string, rateLimit?: RateLimitResult) {
  return {
    ...withRequestHeaders(
      requestId,
      rateLimit
        ? {
            limit: CONTACT_RATE_LIMIT,
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          }
        : undefined,
    ),
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function errorResponse(
  code: ContactErrorCode,
  status: number,
  requestId: string,
  rateLimit?: RateLimitResult,
  extraHeaders: Record<string, string> = {},
) {
  return NextResponse.json(
    { ok: false, code },
    {
      status,
      headers: { ...responseHeaders(requestId, rateLimit), ...extraHeaders },
    },
  );
}

function rateLimitKey(req: Request) {
  return createHash("sha256").update(getClientIp(req)).digest("hex");
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  const requestCheck = checkContactRequest(req);

  if (!requestCheck.ok) {
    logEvent("warn", "contact.request_rejected", { requestId, reason: requestCheck.reason });
    return errorResponse("origin", 403, requestId);
  }

  const rateLimit = await limitRequest({
    key: rateLimitKey(req),
    prefix: "contact:send",
    limit: CONTACT_RATE_LIMIT,
    windowMs: CONTACT_RATE_WINDOW_MS,
  });

  if (rateLimit.limited) {
    const retryAfterSeconds = Math.max(Math.ceil((rateLimit.resetAt - Date.now()) / 1_000), 1);
    logEvent("warn", "contact.rate_limited", { requestId });
    return errorResponse("rateLimit", 429, requestId, rateLimit, {
      "Retry-After": String(retryAfterSeconds),
    });
  }

  try {
    const body = await readJsonBody(req, CONTACT_MAX_BODY_BYTES);
    if (!body.ok) {
      const status = body.reason === "too-large" ? 413 : body.reason === "invalid-content-type" ? 415 : 400;
      const code = body.reason === "too-large" ? "tooLarge" : "invalid";
      return errorResponse(code, status, requestId, rateLimit);
    }

    const parsed = contactSubmissionSchema.safeParse(body.value);
    if (!parsed.success || parsed.data.companyWebsite !== "") {
      return errorResponse("invalid", 400, requestId, rateLimit);
    }

    const date = new Date();
    const source = new URL(parsed.data.sourcePage, requestCheck.origin).toString();

    try {
      await sendContactEmail(parsed.data, { date, source });
    } catch (error) {
      if (error instanceof ContactConfigurationError) {
        logEvent("error", "contact.smtp_config_missing", { requestId });
        return errorResponse("config", 503, requestId, rateLimit);
      }

      logEvent("error", "contact.smtp_delivery_failed", {
        requestId,
        reason: error instanceof ContactDeliveryError ? "not-accepted" : "transport-error",
      });
      return errorResponse("send", 502, requestId, rateLimit);
    }

    logEvent("info", "contact.smtp_accepted", { requestId });
    return NextResponse.json(
      { ok: true },
      { status: 200, headers: responseHeaders(requestId, rateLimit) },
    );
  } catch {
    logEvent("error", "contact.unexpected_error", { requestId });
    return errorResponse("unexpected", 500, requestId, rateLimit);
  }
}
