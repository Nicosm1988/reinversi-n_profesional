import { NextResponse } from "next/server";
import { z } from "zod";
import { limitRequest } from "@/lib/rate-limit";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

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
    const auth = await getAuthenticatedUser();
    if (!auth.ok) {
      logEvent(auth.status === 503 ? "error" : "warn", "diagnostics.save.auth_blocked", {
        requestId,
        ip,
        reason: auth.reason,
      });

      return NextResponse.json(
        {
          error:
            auth.reason === "supabase-unavailable"
              ? "Authentication is temporarily unavailable."
              : "You must sign in with Google before saving the diagnostic.",
        },
        { status: auth.status, headers: withRequestHeaders(requestId) },
      );
    }

    const rateLimit = await limitRequest({
      key: `${auth.user.id}:${ip}`,
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
      logEvent("warn", "diagnostics.save.rate_limited", { requestId, userId: auth.user.id, ip });
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

    const { data, error } = await auth.supabase
      .from("user_diagnostics")
      .insert({
        user_id: auth.user.id,
        diagnostic_type: payload.diagnosticType,
        user_data: payload.userData,
        raw_answers: payload.rawAnswers,
        dominant_result: payload.dominantResult,
        ai_feedback: payload.aiFeedback ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        logEvent("info", "diagnostics.save.already_completed", {
          requestId,
          userId: auth.user.id,
        });
        return NextResponse.json(
          {
            code: "DIAGNOSTIC_ALREADY_COMPLETED",
            error:
              "Tu diagnóstico gratuito ya está guardado. Podés volver a consultarlo cuando quieras.",
          },
          { status: 409, headers: rateHeaders },
        );
      }

      logEvent("error", "diagnostics.save.db_error", {
        requestId,
        userId: auth.user.id,
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
      userId: auth.user.id,
      persistedAs: "authenticated",
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
