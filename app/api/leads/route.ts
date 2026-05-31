import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limitRequest } from "@/lib/rate-limit";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { hasSupabaseAdminConfig, hasSupabasePublicConfig } from "@/lib/supabase/config";

const createLeadSchema = z.object({
  type: z.enum(["contact", "newsletter", "therapy"]),
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(160),
  reason: z.string().trim().max(200).optional(),
  message: z.string().trim().max(5000).optional(),
  sourcePage: z.string().trim().max(120).optional(),
  locale: z.enum(["es", "en"]).optional(),
  consentAccepted: z.literal(true),
  captchaToken: z.string().trim().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const LEADS_LIMIT = 6;
const LEADS_WINDOW_MS = 60_000;
const LEAD_TURNSTILE_ACTIONS: Record<z.infer<typeof createLeadSchema>["type"], string> = {
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

    const json = await req.json();
    const parsed = createLeadSchema.safeParse(json);

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

    const { error } = await supabaseAdmin.from("lead_requests").insert({
      user_id: userId,
      lead_type: payload.type,
      full_name: payload.fullName ?? null,
      email: payload.email,
      reason: payload.reason ?? null,
      message: payload.message ?? null,
      source_page: payload.sourcePage ?? null,
      locale: payload.locale ?? "es",
      metadata: payload.metadata ?? {},
    });

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
