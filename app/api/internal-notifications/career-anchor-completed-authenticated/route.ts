import { NextResponse } from "next/server";
import { createRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { checkInternalNotificationRequest } from "@/lib/internal-notifications/request-security";
import { notifyInternalActivity } from "@/lib/internal-notifications/service";
import { logEvent } from "@/lib/observability/logger";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function responseHeaders(requestId: string) {
  return {
    ...withRequestHeaders(requestId),
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  const requestCheck = checkInternalNotificationRequest(
    req,
    "authenticatedCareerAnchorCompletion",
  );
  if (!requestCheck.ok) {
    logEvent("warn", "internal_notification.authenticated_test_request_rejected", {
      requestId,
      reason: requestCheck.reason,
    });
    return NextResponse.json(
      { ok: false },
      { status: 403, headers: responseHeaders(requestId) },
    );
  }

  const auth = await getAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false },
      { status: auth.status, headers: responseHeaders(requestId) },
    );
  }

  const { data: diagnostic, error } = await auth.supabase
    .from("user_diagnostics")
    .select("id")
    .eq("diagnostic_type", "career_anchor")
    .eq("status", "completed")
    .maybeSingle();

  if (error) {
    logEvent("error", "internal_notification.authenticated_test_lookup_failed", {
      requestId,
      reason: error.code ?? "database_error",
    });
    return NextResponse.json(
      { ok: false },
      { status: 503, headers: responseHeaders(requestId) },
    );
  }

  if (!diagnostic?.id) {
    return NextResponse.json(
      { ok: false },
      { status: 404, headers: responseHeaders(requestId) },
    );
  }

  const notification = await notifyInternalActivity({
    type: "career_anchor_completed",
    eventId: diagnostic.id,
    occurredAt: new Date(),
    audience: "authenticated",
  });

  if (notification.unavailable) {
    logEvent("error", "internal_notification.authenticated_test_outbox_unavailable", {
      requestId,
      reason: notification.errorCode ?? "outbox_unavailable",
    });
    return NextResponse.json(
      { ok: false },
      { status: 503, headers: responseHeaders(requestId) },
    );
  }

  if (notification.failed > 0) {
    logEvent("warn", "internal_notification.authenticated_test_delivery_queued_for_retry", {
      requestId,
      failed: notification.failed,
    });
  }

  return NextResponse.json(
    { ok: true },
    { status: 202, headers: responseHeaders(requestId) },
  );
}
