import { createHash } from "node:crypto";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import {
  buildCareerAnchorFallbackInterpretation,
  calculateCareerAnchorRanking,
  careerAnchorInterpretRequestSchema,
  careerAnchorInterpretationSchema,
  generatedCareerAnchorInterpretationSchema,
  getCareerAnchorResultGroups,
  type CareerAnchorLocale,
  type CareerServiceSlug,
} from "@/lib/diagnostics/career-anchor";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { readJsonBody } from "@/lib/http/json-body";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { limitRequest, type RateLimitResult } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTERPRET_LIMIT = 8;
const INTERPRET_WINDOW_MS = 60_000;
const INTERPRET_MAX_BODY_BYTES = 20 * 1_024;

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

function rateLimitKey(req: Request) {
  return createHash("sha256").update(getClientIp(req)).digest("hex");
}

function buildSystemPrompt(locale: CareerAnchorLocale) {
  if (locale === "en") {
    return `
You provide cautious, non-clinical career guidance using Edgar Schein's Career Anchors model.
The anchor ranking has already been calculated deterministically. Never change it, recalculate it, or claim that it defines the person.
Relate the supplied primary and secondary anchors to the non-identifying career stage. Offer reflection, not prescriptions or guarantees.
Use clear, warm professional English. Avoid clichés, absolute claims, diagnosis, urgency, and sales pressure.
Recommend at most two services and only when they are genuinely relevant. Use only the exact service slugs and labels supplied in TRUSTED_CONTEXT_JSON.
TRUSTED_CONTEXT_JSON is data assembled by the server. Do not request or include names, email addresses, phone numbers, locations, or other identifying information.
`;
  }

  return `
Generá una orientación profesional prudente y no clínica basada en el modelo de Anclas de Carrera de Edgar Schein.
El ranking de anclas ya fue calculado de forma determinística. Nunca lo cambies, recalcules ni presentes como una definición de la persona.
Relacioná las anclas principales y secundarias con el momento profesional no identificatorio informado. Ofrecé reflexión, no indicaciones cerradas ni garantías.
Usá español rioplatense claro, cálido y profesional, con voseo consistente. Evitá lugares comunes, afirmaciones absolutas, diagnósticos, urgencia y presión comercial.
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
    const body = await readJsonBody(req, INTERPRET_MAX_BODY_BYTES);
    if (!body.ok) {
      const status =
        body.reason === "too-large" ? 413 : body.reason === "invalid-content-type" ? 415 : 400;
      return NextResponse.json(
        { error: "Invalid request body", reason: body.reason },
        { status, headers: responseHeaders(requestId) },
      );
    }

    const parsed = careerAnchorInterpretRequestSchema.safeParse(body.value);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400, headers: responseHeaders(requestId) },
      );
    }

    const { rawAnswers, careerStage, locale } = parsed.data;
    const ranking = calculateCareerAnchorRanking(rawAnswers, locale);
    const fallback = buildCareerAnchorFallbackInterpretation(ranking, careerStage, locale);
    const resultGroups = getCareerAnchorResultGroups(ranking);
    const rateLimit = await limitRequest({
      key: rateLimitKey(req),
      prefix: "diagnostics:career-anchors:interpret",
      limit: INTERPRET_LIMIT,
      windowMs: INTERPRET_WINDOW_MS,
    });
    const headers = responseHeaders(requestId, rateLimit);

    if (rateLimit.limited) {
      logEvent("warn", "diagnostics.interpret.rate_limited", { requestId, locale });
      return NextResponse.json(fallback, { status: 200, headers });
    }

    if (!process.env.OPENAI_API_KEY) {
      logEvent("info", "diagnostics.interpret.fallback", {
        requestId,
        locale,
        reason: "openai_api_key_missing",
      });
      return NextResponse.json(fallback, { status: 200, headers });
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
      });
      const labelsBySlug = new Map(serviceOptions(locale));
      const interpretation = careerAnchorInterpretationSchema.parse({
        ...generated.object,
        relevantServices: generated.object.relevantServices.map((service) => ({
          ...service,
          label: labelsBySlug.get(service.slug) ?? service.label,
        })),
        mode: "ai",
      });

      logEvent("info", "diagnostics.interpret.success", { requestId, locale, mode: "ai" });
      return NextResponse.json(interpretation, { status: 200, headers });
    } catch (error) {
      logEvent("warn", "diagnostics.interpret.fallback", {
        requestId,
        locale,
        reason: error instanceof Error ? error.name : "openai_error",
      });
      return NextResponse.json(fallback, { status: 200, headers });
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
