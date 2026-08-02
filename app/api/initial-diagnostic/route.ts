import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseAdminConfig, hasSupabasePublicConfig } from "@/lib/supabase/config";
import { initialDiagnosticSchema, toInitialDiagnosticInsert } from "@/lib/diagnostics/initial-diagnostic";
import { readJsonBody } from "@/lib/http/json-body";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { limitRequest } from "@/lib/rate-limit";
import { logEvent } from "@/lib/observability/logger";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

const REQUEST_LIMIT = 5;
const REQUEST_WINDOW_MS = 60_000;
const MAX_BODY_BYTES = 12 * 1024;

function noStoreHeaders(requestId: string) {
  return { ...withRequestHeaders(requestId), "cache-control": "no-store" };
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const ip = getClientIp(request);

  try {
    if (!hasSupabaseAdminConfig()) {
      logEvent("error", "initial_diagnostic.supabase_admin_missing", { requestId, ip });
      return NextResponse.json(
        { error: "Initial diagnostic is temporarily unavailable." },
        { status: 503, headers: noStoreHeaders(requestId) },
      );
    }

    const rateLimit = await limitRequest({
      key: ip,
      prefix: "initial-diagnostic:create",
      limit: REQUEST_LIMIT,
      windowMs: REQUEST_WINDOW_MS,
    });
    const rateHeaders = {
      ...withRequestHeaders(requestId, {
      limit: REQUEST_LIMIT,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt,
      }),
      "cache-control": "no-store",
    };

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in one minute." },
        { status: 429, headers: rateHeaders },
      );
    }

    const body = await readJsonBody(request, MAX_BODY_BYTES);
    if (!body.ok) {
      const status = body.reason === "too-large" ? 413 : body.reason === "invalid-content-type" ? 415 : 400;
      return NextResponse.json(
        { error: "Invalid request body", reason: body.reason },
        { status, headers: rateHeaders },
      );
    }

    const parsed = initialDiagnosticSchema.safeParse(body.value);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: parsed.error.flatten().fieldErrors },
        { status: 400, headers: rateHeaders },
      );
    }

    const hostname = new URL(request.url).hostname;
    const turnstile = await verifyTurnstileToken(parsed.data.captchaToken, ip, {
      expectedAction: "initial_diagnostic",
      expectedHostname: hostname,
    });
    if (!turnstile.passed) {
      logEvent("warn", "initial_diagnostic.captcha_failed", {
        requestId,
        ip,
        errors: turnstile.errors,
      });
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 403, headers: rateHeaders },
      );
    }

    let userId: string | null = null;
    if (hasSupabasePublicConfig()) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }

    const insert = toInitialDiagnosticInsert(parsed.data, userId);
    const { error } = await createAdminClient().from("initial_diagnostics").insert(insert);

    if (error) {
      logEvent("error", "initial_diagnostic.db_error", {
        requestId,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { error: "Failed to save initial diagnostic" },
        { status: 500, headers: rateHeaders },
      );
    }

    logEvent("info", "initial_diagnostic.created", {
      requestId,
      userId,
      suggestedRoute: insert.suggested_route,
    });

    return NextResponse.json({ success: true }, { status: 201, headers: rateHeaders });
  } catch (error) {
    logEvent("error", "initial_diagnostic.error", {
      requestId,
      ip,
      message: error instanceof Error ? error.message : "unknown-error",
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: noStoreHeaders(requestId) },
    );
  }
}
