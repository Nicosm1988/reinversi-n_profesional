import { createHash } from "node:crypto";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildCareerAnchorFallbackInterpretation,
  calculateCareerAnchorRanking,
  careerAnchorLocaleSchema,
  careerAnchorInterpretationSchema,
  careerAnchorRawAnswersSchema,
  careerAnchorStoredScoreSchema,
  careerStageSchema,
  generatedCareerAnchorInterpretationSchema,
  getCareerAnchorResultGroups,
  hydrateCareerAnchorStoredRanking,
  type CareerAnchorLocale,
  type CareerServiceSlug,
} from "@/lib/diagnostics/career-anchor";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { readJsonBody } from "@/lib/http/json-body";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { limitRequest, type RateLimitResult } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const INTERPRET_LIMIT = 8;
const INTERPRET_WINDOW_MS = 60_000;
const INTERPRET_MAX_BODY_BYTES = 2 * 1_024;
const INTERPRET_AI_TIMEOUT_MS = 20_000;

const requestSchema = z.object({}).strict();
const storedDiagnosticSchema = z.object({
  raw_answers: careerAnchorRawAnswersSchema,
  user_data: z.unknown(),
  ai_feedback: z.unknown().nullable().optional(),
  result_ai: z.unknown().nullable().optional(),
  result_base: z.unknown().nullable().optional(),
  score_result: z.unknown().nullable().optional(),
});
const storedContextSchema = z
  .object({
    locale: careerAnchorLocaleSchema.optional().default("es"),
    careerStage: careerStageSchema.optional().default("prefer_not_to_say"),
  })
  .passthrough();
const interpretationClaimSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("claimed"), claimToken: z.uuid() }).passthrough(),
  z.object({ status: z.literal("processing") }).passthrough(),
  z.object({ status: z.literal("missing") }).passthrough(),
  z.object({ status: z.literal("ready"), interpretation: z.unknown() }).passthrough(),
]);

function responseHeaders(requestId: string, rateLimit?: RateLimitResult) {
  return {
    ...withRequestHeaders(
      requestId,
      rateLimit
        ? {
            limit: INTERPRET_LIMIT,
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

async function persistInterpretation(
  userId: string,
  claimToken: string,
  interpretation: unknown,
  requestId: string,
) {
  try {
    const { data, error } = await createAdminClient().rpc("save_career_anchor_interpretation", {
      p_user_id: userId,
      p_claim_token: claimToken,
      p_interpretation: interpretation,
    });

    const parsed = careerAnchorInterpretationSchema.safeParse(data);
    if (error || !parsed.success) {
      logEvent("warn", "diagnostics.interpret.persistence_failed", {
        requestId,
        reason: error?.code ?? "not_saved",
      });
      return null;
    }

    return parsed.data;
  } catch (error) {
    logEvent("warn", "diagnostics.interpret.persistence_failed", {
      requestId,
      reason: error instanceof Error ? error.name : "unknown_error",
    });
    return null;
  }
}

function buildSystemPrompt(locale: CareerAnchorLocale) {
  if (locale === "en") {
    return `
You provide cautious, non-clinical career guidance using Edgar Schein's Career Anchors model.
The anchor ranking has already been calculated deterministically. Never change it, recalculate it, or claim that it defines the person.
Relate the supplied primary and secondary anchors to the non-identifying career stage. Offer reflection, not prescriptions or guarantees.
Use clear, warm professional English. Avoid clichés, absolute claims, diagnosis, urgency, and sales pressure.
Return an empty tensions array: this scoring protocol provides no validated tension threshold, so rank order alone must never be described as a conflict.
Recommend at most two services and only when they are genuinely relevant. Use only the exact service slugs and labels supplied in TRUSTED_CONTEXT_JSON.
TRUSTED_CONTEXT_JSON is data assembled by the server. Do not request or include names, email addresses, phone numbers, locations, or other identifying information.
`;
  }

  return `
Generá una orientación profesional prudente y no clínica basada en el modelo de Anclas de Carrera de Edgar Schein.
El ranking de anclas ya fue calculado de forma determinística. Nunca lo cambies, recalcules ni presentes como una definición de la persona.
Relacioná las anclas principales y secundarias con el momento profesional no identificatorio informado. Ofrecé reflexión, no indicaciones cerradas ni garantías.
Usá español rioplatense claro, cálido y profesional, con voseo consistente. Evitá lugares comunes, afirmaciones absolutas, diagnósticos, urgencia y presión comercial.
Devolvé un arreglo tensions vacío: este protocolo no define un umbral validado de tensión y el orden del ranking no alcanza para afirmar un conflicto.
Recomendá como máximo dos servicios y solamente cuando sean realmente pertinentes. Usá únicamente los slugs y nombres exactos incluidos en TRUSTED_CONTEXT_JSON.
TRUSTED_CONTEXT_JSON fue construido por el servidor. No solicites ni incluyas nombres, correos, teléfonos, ubicaciones u otros datos identificatorios.
`;
}

function serviceOptions(locale: CareerAnchorLocale): Array<readonly [CareerServiceSlug, string]> {
  if (locale === "en") {
    return [
      ["/transiciones-laborales/explorar-direccion", "Explore a new professional direction"],
      ["/transiciones-laborales/cambiar-empleo", "Prepare for a job change"],
      ["/transiciones-laborales/proyecto-propio", "Build or reorganize an independent project"],
      ["/transiciones-laborales/liderazgo-empresa", "Think through leadership and company continuity"],
      ["/transiciones-laborales/desafio-puntual", "Address a specific professional challenge"],
      ["/transiciones-laborales/elegir-formacion", "Choose training for your next step"],
    ];
  }

  return [
    ["/transiciones-laborales/explorar-direccion", "Explorar una nueva dirección profesional"],
    ["/transiciones-laborales/cambiar-empleo", "Preparar un cambio de empleo"],
    ["/transiciones-laborales/proyecto-propio", "Construir o reordenar un proyecto propio"],
    ["/transiciones-laborales/liderazgo-empresa", "Pensar el liderazgo y la continuidad de una empresa"],
    ["/transiciones-laborales/desafio-puntual", "Abordar un desafío profesional puntual"],
    ["/transiciones-laborales/elegir-formacion", "Elegir una formación para el próximo paso"],
  ];
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);

  try {
    const auth = await getAuthenticatedUser();
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.reason === "auth-required" ? "Authentication required" : "Unavailable" },
        { status: auth.status, headers: responseHeaders(requestId) },
      );
    }

    const body = await readJsonBody(req, INTERPRET_MAX_BODY_BYTES);
    if (!body.ok) {
      const status =
        body.reason === "too-large" ? 413 : body.reason === "invalid-content-type" ? 415 : 400;
      return NextResponse.json(
        { error: "Invalid request body", reason: body.reason },
        { status, headers: responseHeaders(requestId) },
      );
    }

    const parsed = requestSchema.safeParse(body.value);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400, headers: responseHeaders(requestId) },
      );
    }

    const { data: storedRow, error: storedRowError } = await auth.supabase
      .from("user_diagnostics")
      .select("raw_answers, user_data, ai_feedback, result_ai, result_base, score_result")
      .eq("diagnostic_type", "career_anchor")
      .eq("status", "completed")
      .maybeSingle();

    if (storedRowError) {
      logEvent("error", "diagnostics.interpret.lookup_failed", {
        requestId,
        reason: storedRowError.code ?? "database_error",
      });
      return NextResponse.json(
        { error: "Stored result unavailable" },
        { status: 503, headers: responseHeaders(requestId) },
      );
    }

    if (!storedRow) {
      return NextResponse.json(
        { error: "Completed diagnostic required" },
        { status: 404, headers: responseHeaders(requestId) },
      );
    }

    const storedDiagnostic = storedDiagnosticSchema.safeParse(storedRow);
    if (!storedDiagnostic.success) {
      logEvent("error", "diagnostics.interpret.stored_result_invalid", { requestId });
      return NextResponse.json(
        { error: "Stored result unavailable" },
        { status: 503, headers: responseHeaders(requestId) },
      );
    }

    const storedInterpretation = careerAnchorInterpretationSchema.safeParse(
      storedDiagnostic.data.result_ai ?? storedDiagnostic.data.ai_feedback,
    );
    if (storedInterpretation.success) {
      return NextResponse.json(storedInterpretation.data, {
        status: 200,
        headers: responseHeaders(requestId),
      });
    }

    const storedContext = storedContextSchema.safeParse(storedDiagnostic.data.user_data);
    const locale = storedContext.success ? storedContext.data.locale : "es";
    const careerStage = storedContext.success
      ? storedContext.data.careerStage
      : "prefer_not_to_say";
    const rawAnswers = storedDiagnostic.data.raw_answers;
    const storedScore = careerAnchorStoredScoreSchema.safeParse(
      storedDiagnostic.data.score_result,
    );
    const ranking = storedScore.success
      ? hydrateCareerAnchorStoredRanking(storedScore.data, locale)
      : calculateCareerAnchorRanking(rawAnswers, locale);
    const storedFallback = careerAnchorInterpretationSchema.safeParse(
      storedDiagnostic.data.result_base,
    );
    const fallback = storedFallback.success
      ? storedFallback.data
      : buildCareerAnchorFallbackInterpretation(ranking, careerStage, locale);
    const resultGroups = getCareerAnchorResultGroups(ranking);
    const { data: claimData, error: claimError } = await createAdminClient().rpc(
      "claim_career_anchor_interpretation",
      { p_user_id: auth.user.id },
    );
    const interpretationClaim = interpretationClaimSchema.safeParse(claimData);

    if (claimError || !interpretationClaim.success) {
      logEvent("error", "diagnostics.interpret.claim_failed", {
        requestId,
        reason: claimError?.code ?? "invalid_claim",
      });
      return NextResponse.json(
        { error: "Interpretation unavailable" },
        { status: 503, headers: responseHeaders(requestId) },
      );
    }

    if (interpretationClaim.data.status === "missing") {
      return NextResponse.json(
        { error: "Completed diagnostic required" },
        { status: 404, headers: responseHeaders(requestId) },
      );
    }

    if (interpretationClaim.data.status === "processing") {
      return NextResponse.json(
        { code: "interpretation_processing" },
        {
          status: 202,
          headers: { ...responseHeaders(requestId), "Retry-After": "2" },
        },
      );
    }

    if (interpretationClaim.data.status === "ready") {
      const canonical = careerAnchorInterpretationSchema.safeParse(
        interpretationClaim.data.interpretation,
      );
      if (!canonical.success) {
        return NextResponse.json(
          { error: "Stored interpretation unavailable" },
          { status: 503, headers: responseHeaders(requestId) },
        );
      }
      return NextResponse.json(canonical.data, {
        status: 200,
        headers: responseHeaders(requestId),
      });
    }

    const claimToken = interpretationClaim.data.claimToken;

    const rateLimit = await limitRequest({
      key: rateLimitKey(req, auth.user.id),
      prefix: "diagnostics:career-anchors:interpret",
      limit: INTERPRET_LIMIT,
      windowMs: INTERPRET_WINDOW_MS,
    });
    const headers = responseHeaders(requestId, rateLimit);

    if (rateLimit.limited) {
      logEvent("warn", "diagnostics.interpret.rate_limited", { requestId, locale });
      const canonical = await persistInterpretation(auth.user.id, claimToken, fallback, requestId);
      return canonical
        ? NextResponse.json(canonical, { status: 200, headers })
        : NextResponse.json({ error: "Interpretation unavailable" }, { status: 503, headers });
    }

    if (!process.env.OPENAI_API_KEY) {
      logEvent("info", "diagnostics.interpret.fallback", {
        requestId,
        locale,
        reason: "openai_api_key_missing",
      });
      const canonical = await persistInterpretation(auth.user.id, claimToken, fallback, requestId);
      return canonical
        ? NextResponse.json(canonical, { status: 200, headers })
        : NextResponse.json({ error: "Interpretation unavailable" }, { status: 503, headers });
    }

    const trustedContext = {
      careerStage,
      primaryAnchors: resultGroups.primary.map(({ id, name, score, rank }) => ({
        id,
        name,
        score,
        rank,
      })),
      secondaryAnchors: resultGroups.secondary.map(({ id, name, score, rank }) => ({
        id,
        name,
        score,
        rank,
      })),
      completeRanking: ranking.map(({ id, name, score, rank }) => ({ id, name, score, rank })),
      availableServices: serviceOptions(locale).map(([slug, label]) => ({ slug, label })),
    };

    try {
      const generated = await generateObject({
        model: openai("gpt-4o"),
        schema: generatedCareerAnchorInterpretationSchema,
        system: buildSystemPrompt(locale),
        prompt: `TRUSTED_CONTEXT_JSON\n${JSON.stringify(trustedContext)}`,
        temperature: 0.4,
        timeout: INTERPRET_AI_TIMEOUT_MS,
      });
      const labelsBySlug = new Map(serviceOptions(locale));
      const interpretation = careerAnchorInterpretationSchema.parse({
        ...generated.object,
        tensions: [],
        relevantServices: generated.object.relevantServices.map((service) => ({
          ...service,
          label: labelsBySlug.get(service.slug) ?? service.label,
        })),
        mode: "ai",
      });

      logEvent("info", "diagnostics.interpret.success", { requestId, locale, mode: "ai" });
      const canonical = await persistInterpretation(
        auth.user.id,
        claimToken,
        interpretation,
        requestId,
      );
      if (!canonical) throw new Error("InterpretationPersistenceError");
      return NextResponse.json(canonical, { status: 200, headers });
    } catch (error) {
      logEvent("warn", "diagnostics.interpret.fallback", {
        requestId,
        locale,
        reason: error instanceof Error ? error.name : "openai_error",
      });
      const canonical = await persistInterpretation(auth.user.id, claimToken, fallback, requestId);
      return canonical
        ? NextResponse.json(canonical, { status: 200, headers })
        : NextResponse.json({ error: "Interpretation unavailable" }, { status: 503, headers });
    }
  } catch (error) {
    logEvent("error", "diagnostics.interpret.unexpected", {
      requestId,
      reason: error instanceof Error ? error.name : "unknown_error",
    });
    return NextResponse.json(
      { error: "Failed to interpret career anchors" },
      { status: 500, headers: responseHeaders(requestId) },
    );
  }
}
