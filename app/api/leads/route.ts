import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLeadSchema, toLeadInsert, type CreateLead } from "@/lib/leads/create-lead";
import { readJsonBody } from "@/lib/http/json-body";
import { limitRequest } from "@/lib/rate-limit";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { hasSupabaseAdminConfig, hasSupabasePublicConfig } from "@/lib/supabase/config";

const LEADS_LIMIT = 6;
const LEADS_WINDOW_MS = 60_000;
const LEADS_MAX_BODY_BYTES = 16 * 1024;
const LEAD_TURNSTILE_ACTIONS: Record<CreateLead["type"], string> = {
  contact: "lead_contact",
  newsletter: "lead_newsletter",
  therapy: "lead_therapy",
};

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const ip = getClientIp(req);
  const requestHostname = new URL(req.url).hostname;

  try {
    if (!hasSupabaseAdminConfig()) {
      logEvent("error", "leads.create.supabase_admin_missing", { requestId, ip });
      return NextResponse.json(
        { error: "Lead capture is temporarily unavailable." },
        { status: 503, headers: withRequestHeaders(requestId) },
      );
    }

    const rateLimit = await limitRequest({
      key: ip,
      prefix: "leads:create",
      limit: LEADS_LIMIT,
      windowMs: LEADS_WINDOW_MS,
    });
    const { limited, remaining, resetAt } = rateLimit;
    const rateHeaders = withRequestHeaders(requestId, {
      limit: LEADS_LIMIT,
      remaining,
      resetAt,
    });

    if (limited) {
      logEvent("warn", "leads.create.rate_limited", { requestId, ip });
      return NextResponse.json(
        { error: "Too many requests. Please try again in one minute." },
        { status: 429, headers: rateHeaders },
      );
    }

    const body = await readJsonBody(req, LEADS_MAX_BODY_BYTES);
    if (!body.ok) {
      const status = body.reason === "too-large" ? 413 : body.reason === "invalid-content-type" ? 415 : 400;
      return NextResponse.json(
        { error: "Invalid request body", reason: body.reason },
        { status, headers: rateHeaders },
      );
    }

    const parsed = createLeadSchema.safeParse(body.value);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: parsed.error.flatten().fieldErrors },
        { status: 400, headers: rateHeaders },
      );
    }

    const turnstile = await verifyTurnstileToken(parsed.data.captchaToken, ip, {
      expectedAction: LEAD_TURNSTILE_ACTIONS[parsed.data.type],
      expectedHostname: requestHostname,
    });
    if (!turnstile.passed) {
      logEvent("warn", "leads.create.captcha_failed", { requestId, ip, errors: turnstile.errors });
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 403, headers: rateHeaders },
      );
    }

    let userId: string | null = null;
    if (hasSupabasePublicConfig()) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }
    const supabaseAdmin = createAdminClient();

    const payload = parsed.data;

    const { error } = await supabaseAdmin.from("lead_requests").insert(toLeadInsert(payload, userId));

    if (error) {
      logEvent("error", "leads.create.db_error", {
        requestId,
        code: error.code,
        message: error.message,
      });

      return NextResponse.json(
        { error: "Failed to create lead request" },
        { status: 500, headers: rateHeaders },
      );
    }

    logEvent("info", "leads.create.success", {
      requestId,
      userId,
      leadType: payload.type,
      sourcePage: payload.sourcePage ?? null,
    });

    return NextResponse.json({ success: true }, { headers: rateHeaders });
  } catch (error) {
    logEvent("error", "leads.create.error", {
      requestId,
      ip,
      message: error instanceof Error ? error.message : "unknown-error",
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: withRequestHeaders(requestId) },
    );
  }
}
