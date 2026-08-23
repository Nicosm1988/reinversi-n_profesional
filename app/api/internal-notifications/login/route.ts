import { NextResponse } from "next/server";
import { getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { notifyAuthenticatedLogin } from "@/lib/internal-notifications/login";
import { checkInternalNotificationRequest } from "@/lib/internal-notifications/request-security";

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
  const requestId = getRequestId(req);
  const requestCheck = checkInternalNotificationRequest(req, "login");
  if (!requestCheck.ok) {
    logEvent("warn", "internal_notification.login_request_rejected", {
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

  const notification = await notifyAuthenticatedLogin({
    supabase: auth.supabase,
    requestId,
  });

  return NextResponse.json(
    { ok: notification.ok },
    { status: notification.ok ? 202 : 503, headers: responseHeaders(requestId) },
  );
}
