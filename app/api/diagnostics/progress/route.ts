import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { careerAnchorProgressRequestSchema } from "@/lib/diagnostics/career-anchor";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { readJsonBody } from "@/lib/http/json-body";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { limitRequest, type RateLimitResult } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_LIMIT = 180;
const REQUEST_WINDOW_MS = 30 * 60_000;
const MAX_BODY_BYTES = 16 * 1_024;

type SavedProgress = {
  id: string;
  status: "in_progress" | "processing" | "completed";
  savedAt: string;
  revision: number;
  accepted: boolean;
};

function responseHeaders(requestId: string, rateLimit?: RateLimitResult) {
  return {
    ...withRequestHeaders(
      requestId,
      rateLimit
        ? {
            limit: REQUEST_LIMIT,
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          }
        : undefined,
    ),
    "Cache-Control": "no-store",
  };
}

function rateLimitKey(req: Request, userId: string) {
  return createHash("sha256").update(`${userId}:${getClientIp(req)}`).digest("hex");
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const auth = await getAuthenticatedUser().catch(() => null);

  if (!auth?.ok) {
    const unavailable = !auth || auth.status === 503;
    return NextResponse.json(
      { ok: false, code: unavailable ? "unavailable" : "unauthorized" },
      { status: unavailable ? 503 : 401, headers: responseHeaders(requestId) },
    );
  }

  const rateLimit = await limitRequest({
    key: rateLimitKey(req, auth.user.id),
    prefix: "diagnostics:career-anchors:progress",
    limit: REQUEST_LIMIT,
    windowMs: REQUEST_WINDOW_MS,
  });
  const headers = responseHeaders(requestId, rateLimit);

  if (rateLimit.limited) {
    return NextResponse.json(
      { ok: false, code: "rate_limit" },
      { status: 429, headers },
    );
  }

  const body = await readJsonBody(req, MAX_BODY_BYTES);
  if (!body.ok) {
    const status =
      body.reason === "too-large" ? 413 : body.reason === "invalid-content-type" ? 415 : 400;
    return NextResponse.json(
      { ok: false, code: body.reason },
      { status, headers },
    );
  }

  const parsed = careerAnchorProgressRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: "invalid" },
      { status: 400, headers },
    );
  }

  const { answers, bonus, currentStatement, clientRevision, locale, careerStage } = parsed.data;

  try {
    const { data, error } = await createAdminClient().rpc("save_career_anchor_progress", {
      p_user_id: auth.user.id,
      p_answers: answers,
      p_bonus: bonus,
      p_current_statement: currentStatement,
      p_client_revision: clientRevision,
      p_locale: locale,
      p_career_stage: careerStage,
    });

    if (error || !data) {
      logEvent("error", "career_anchor.progress.save_failed", {
        requestId,
        reason: error?.code ?? "empty_result",
      });
      return NextResponse.json(
        { ok: false, code: "unavailable" },
        { status: 503, headers },
      );
    }

    const saved = data as SavedProgress;
    if (saved.status === "completed") {
      return NextResponse.json(
        { ok: false, code: "already_completed" },
        { status: 409, headers },
      );
    }

    if (saved.status === "processing") {
      return NextResponse.json(
        { ok: false, code: "finalizing" },
        { status: 409, headers },
      );
    }

    if (!saved.accepted) {
      return NextResponse.json(
        { ok: false, code: "stale_revision", revision: saved.revision },
        { status: 409, headers },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        savedAt: saved.savedAt,
        revision: saved.revision,
        accepted: saved.accepted,
      },
      { status: 200, headers },
    );
  } catch (error) {
    logEvent("error", "career_anchor.progress.unexpected", {
      requestId,
      reason: error instanceof Error ? error.name : "unknown_error",
    });
    return NextResponse.json(
      { ok: false, code: "unavailable" },
      { status: 503, headers },
    );
  }
}
