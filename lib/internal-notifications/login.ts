import "next/dist/compiled/server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logEvent } from "@/lib/observability/logger";
import { notifyInternalActivity } from "@/lib/internal-notifications/service";

type LoginNotificationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "claims_unavailable" | "session_id_unavailable" | "queue_unavailable";
    };

export async function notifyAuthenticatedLogin(input: {
  supabase: SupabaseClient;
  requestId: string;
}): Promise<LoginNotificationResult> {
  let claimsResult: Awaited<ReturnType<SupabaseClient["auth"]["getClaims"]>>;
  try {
    claimsResult = await input.supabase.auth.getClaims();
  } catch {
    logEvent("error", "internal_notification.login_claims_unavailable", {
      requestId: input.requestId,
    });
    return { ok: false, reason: "claims_unavailable" };
  }

  const { data, error } = claimsResult;
  if (error || !data?.claims) {
    logEvent("error", "internal_notification.login_claims_unavailable", {
      requestId: input.requestId,
    });
    return { ok: false, reason: "claims_unavailable" };
  }

  const sessionId = data.claims.session_id;
  if (typeof sessionId !== "string" || sessionId.length < 16 || sessionId.length > 200) {
    logEvent("error", "internal_notification.login_session_id_unavailable", {
      requestId: input.requestId,
    });
    return { ok: false, reason: "session_id_unavailable" };
  }

  try {
    const delivery = await notifyInternalActivity({
      type: "login",
      eventId: sessionId,
      occurredAt: new Date(),
      audience: "authenticated",
    });

    if (delivery.unavailable) {
      logEvent("error", "internal_notification.login_delivery_unavailable", {
        requestId: input.requestId,
        reason: delivery.errorCode ?? "queue_unavailable",
        failed: delivery.failed,
      });
      return { ok: false, reason: "queue_unavailable" };
    }

    if (delivery.failed > 0) {
      logEvent("warn", "internal_notification.login_delivery_queued_for_retry", {
        requestId: input.requestId,
        failed: delivery.failed,
      });
    }
  } catch (error) {
    logEvent("error", "internal_notification.login_delivery_unexpected", {
      requestId: input.requestId,
      reason: error instanceof Error ? error.name : "unknown_error",
    });
    return { ok: false, reason: "queue_unavailable" };
  }

  return { ok: true };
}
