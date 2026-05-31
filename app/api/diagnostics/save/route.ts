import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limitRequest } from "@/lib/rate-limit";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { hasSupabaseAdminConfig, hasSupabasePublicConfig } from "@/lib/supabase/config";

const saveDiagnosticSchema = z.object({
  diagnosticType: z.string().trim().min(2).max(60),
  userData: z.object({
    name: z.string().trim().min(2).max(120),
    age: z.coerce.number().int().min(18).max(90),
    occupation: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(120),
    country: z.string().trim().min(2).max(120),
  }),
  rawAnswers: z.record(z.string(), z.unknown()),
  dominantResult: z
    .object({
      name: z.string().trim().min(2).max(120),
    })
    .passthrough(),
  aiFeedback: z
    .object({
      title: z.string(),
      summary: z.string(),
      frictionAreas: z.array(z.string()),
      idealEcosystem: z.string(),
      strategicQuestion: z.string(),
    })
    .nullable()
    .optional(),
});

const SAVE_LIMIT = 15;
const SAVE_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const ip = getClientIp(req);

  try {
    const publicConfigAvailable = hasSupabasePublicConfig();
    const adminConfigAvailable = hasSupabaseAdminConfig();

    let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
    let userId: string | null = null;

    if (publicConfigAvailable) {
      supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        logEvent("warn", "diagnostics.save.auth_lookup_failed", {
          requestId,
          ip,
          message: authError.message,
        });
      }

      userId = user?.id ?? null;
    }

    const rateLimit = await limitRequest({
      key: `${userId ?? "anonymous"}:${ip}`,
      prefix: "diagnostics:save",
      limit: SAVE_LIMIT,
      windowMs: SAVE_WINDOW_MS,
    });
    const { limited, remaining, resetAt } = rateLimit;
    const rateHeaders = withRequestHeaders(requestId, {
      limit: SAVE_LIMIT,
      remaining,
      resetAt,
    });

    if (limited) {
      logEvent("warn", "diagnostics.save.rate_limited", { requestId, userId, ip });
      return NextResponse.json(
        { error: "Too many requests. Please try again in one minute." },
        { status: 429, headers: rateHeaders },
      );
    }

    const json = await req.json();
    const parsed = saveDiagnosticSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: parsed.error.flatten().fieldErrors },
        { status: 400, headers: rateHeaders },
      );
    }

    const payload = parsed.data;

    if (!userId && !adminConfigAvailable) {
      logEvent("info", "diagnostics.save.skipped", {
        requestId,
        ip,
        reason: publicConfigAvailable ? "anonymous_without_admin" : "supabase_unavailable",
      });

      return NextResponse.json(
        { success: true, persisted: false },
        { headers: rateHeaders },
      );
    }

    const saveClient = userId && supabase ? supabase : createAdminClient();
    const { data, error } = await saveClient
      .from("user_diagnostics")
      .insert({
        user_id: userId,
        diagnostic_type: payload.diagnosticType,
        user_data: payload.userData,
        raw_answers: payload.rawAnswers,
        dominant_result: payload.dominantResult,
        ai_feedback: payload.aiFeedback ?? null,
      })
      .select()
      .single();

    if (error) {
      logEvent("error", "diagnostics.save.db_error", {
        requestId,
        userId,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { error: "Failed to save diagnostic" },
        { status: 500, headers: rateHeaders },
      );
    }

    logEvent("info", "diagnostics.save.success", {
      requestId,
      userId,
      persistedAs: userId ? "authenticated" : "anonymous",
    });
    return NextResponse.json({ success: true, persisted: true, data }, { headers: rateHeaders });
  } catch (error) {
    logEvent("error", "diagnostics.save.error", {
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
