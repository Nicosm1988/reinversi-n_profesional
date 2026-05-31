import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/security/navigation";
import { getRequestId } from "@/lib/http/request-context";
import { logEvent } from "@/lib/observability/logger";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));
  const loginErrorPath = "/login?error=auth-callback-failed";

  try {
    if (!hasSupabasePublicConfig()) {
      logEvent("error", "auth.callback.supabase_missing", { requestId, next });
      return NextResponse.redirect(new URL(`${loginErrorPath}&reason=supabase-unavailable`, origin), {
        headers: { "x-request-id": requestId },
      });
    }

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        logEvent("info", "auth.callback.success", { requestId, next });
        return NextResponse.redirect(new URL(next, origin), {
          headers: { "x-request-id": requestId },
        });
      }

      logEvent("warn", "auth.callback.exchange_failed", {
        requestId,
        message: error.message,
        next,
      });
    }
  } catch (error) {
    logEvent("error", "auth.callback.error", {
      requestId,
      message: error instanceof Error ? error.message : "unknown-error",
      next,
    });
  }

  return NextResponse.redirect(new URL(loginErrorPath, origin), {
    headers: { "x-request-id": requestId },
  });
}
