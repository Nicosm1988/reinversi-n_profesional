import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/security/navigation";
import { getRequestId } from "@/lib/http/request-context";
import { logEvent } from "@/lib/observability/logger";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { notifyAuthenticatedLogin } from "@/lib/internal-notifications/login";

const AUTH_RESPONSE_HEADERS = {
  "cache-control": "private, no-cache, no-store, must-revalidate, max-age=0",
  expires: "0",
  pragma: "no-cache",
};

function redirectWithAuthHeaders(url: URL, requestId: string) {
  return NextResponse.redirect(url, {
    headers: {
      ...AUTH_RESPONSE_HEADERS,
      "x-request-id": requestId,
    },
  });
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));
  const isEnglishFlow = next === "/en" || next.startsWith("/en/");
  const loginErrorPath = `${isEnglishFlow ? "/en" : ""}/login?error=auth-callback-failed`;

  try {
    if (!hasSupabasePublicConfig()) {
      logEvent("error", "auth.callback.supabase_missing", { requestId, next });
      return redirectWithAuthHeaders(
        new URL(`${loginErrorPath}&reason=supabase-unavailable`, origin),
        requestId,
      );
    }

    if (code) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        if (data.user) {
          await notifyAuthenticatedLogin({ supabase, requestId });
        }
        logEvent("info", "auth.callback.success", { requestId, next });
        return redirectWithAuthHeaders(new URL(next, origin), requestId);
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

  return redirectWithAuthHeaders(new URL(loginErrorPath, origin), requestId);
}
