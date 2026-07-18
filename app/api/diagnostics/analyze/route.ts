import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { limitRequest } from "@/lib/rate-limit";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

const diagnosticResultSchema = z.object({
  title: z.string().describe("Short but strong career anchor archetype."),
  summary: z.string().describe("Two short paragraphs focused on current role and context."),
  frictionAreas: z.array(z.string()).describe("Three likely friction points for this profile."),
  idealEcosystem: z.string().describe("What this person should look for in the next role."),
  strategicQuestion: z.string().describe("One strategic reflection question."),
});

const analyzeRequestSchema = z.object({
  anchor: z.object({
    name: z.string().trim().min(2).max(120),
  }),
  userData: z.object({
    age: z.coerce.number().int().min(18).max(90),
    occupation: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(120),
    country: z.string().trim().min(2).max(120),
  }),
  captchaToken: z.string().trim().optional(),
});

type AnalyzeAnchor = z.infer<typeof analyzeRequestSchema>["anchor"];
type AnalyzeUserData = z.infer<typeof analyzeRequestSchema>["userData"];

const ANALYZE_LIMIT = 8;
const ANALYZE_WINDOW_MS = 60_000;

function buildFallbackDiagnostic(anchor: AnalyzeAnchor, userData: AnalyzeUserData) {
  const location = [userData.city, userData.country].filter(Boolean).join(", ");
  const careerStage =
    userData.age < 30
      ? "Estas en una etapa donde probar opciones sin perder coherencia interna es clave."
      : userData.age < 45
        ? "Estas en un momento donde necesitas que tu siguiente paso combine crecimiento con sentido."
        : "Estas en una etapa donde el criterio, la autonomia y el impacto pesan mas que el simple cambio.";

  return diagnosticResultSchema.parse({
    title: `${anchor.name}: eje probable de tu reinvencion`,
    summary:
      `${userData.occupation} en ${location}: tu ancla dominante sugiere que no necesitas cualquier cambio, sino uno que respete la forma en que mejor rindes, decides y sostienes tu energia profesional. ${careerStage}` +
      ` Si tu contexto actual te aleja de ${anchor.name.toLowerCase()}, es esperable que aparezcan desgaste, ambivalencia o sensacion de estar fuera de eje.`,
    frictionAreas: [
      `Roles que te pidan operar de una forma que contradice tu ancla ${anchor.name.toLowerCase()}.`,
      "Entornos con expectativas poco claras, poca coherencia o margen limitado para decidir bien.",
      "Cambios profesionales pensados solo por urgencia externa y no por compatibilidad real con tu motivacion central.",
    ],
    idealEcosystem:
      `Te convienen contextos donde tu forma natural de aportar tenga lugar real: objetivos claros, conversaciones adultas y espacio para desplegar ${anchor.name.toLowerCase()} sin forzarte a actuar en contra de tu criterio.`,
    strategicQuestion:
      `Que ajuste concreto en tu carrera te acercaria mas a ${anchor.name.toLowerCase()} durante los proximos 90 dias?`,
  });
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const ip = getClientIp(req);
  const requestHostname = new URL(req.url).hostname;

  try {
    const auth = await getAuthenticatedUser();
    if (!auth.ok) {
      logEvent(auth.status === 503 ? "error" : "warn", "diagnostics.analyze.auth_blocked", {
        requestId,
        ip,
        reason: auth.reason,
      });

      return NextResponse.json(
        {
          error:
            auth.reason === "supabase-unavailable"
              ? "Authentication is temporarily unavailable."
              : "You must sign in with Google before taking the diagnostic.",
        },
        { status: auth.status, headers: withRequestHeaders(requestId) },
      );
    }

    const rateLimit = await limitRequest({
      key: `${auth.user.id}:${ip}`,
      prefix: "diagnostics:analyze",
      limit: ANALYZE_LIMIT,
      windowMs: ANALYZE_WINDOW_MS,
    });
    const { limited, remaining, resetAt } = rateLimit;
    const rateHeaders = withRequestHeaders(requestId, {
      limit: ANALYZE_LIMIT,
      remaining,
      resetAt,
    });

    if (limited) {
      logEvent("warn", "diagnostics.analyze.rate_limited", { requestId, userId: auth.user.id, ip });
      return NextResponse.json(
        { error: "Too many requests. Please try again in one minute." },
        { status: 429, headers: rateHeaders },
      );
    }

    const json = await req.json();
    const parsed = analyzeRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: parsed.error.flatten().fieldErrors },
        { status: 400, headers: rateHeaders },
      );
    }

    const { anchor, userData } = parsed.data;
    const turnstile = await verifyTurnstileToken(parsed.data.captchaToken, ip, {
      expectedAction: "diagnostic_prequiz",
      expectedHostname: requestHostname,
    });
    if (!turnstile.passed) {
      logEvent("warn", "diagnostics.analyze.captcha_failed", {
        requestId,
        userId: auth.user.id,
        ip,
        errors: turnstile.errors,
      });
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 403, headers: rateHeaders },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      logEvent("warn", "diagnostics.analyze.fallback", {
        requestId,
        userId: auth.user.id,
        ip,
        anchor: anchor.name,
        reason: "openai_api_key_missing",
      });
      return NextResponse.json(buildFallbackDiagnostic(anchor, userData), { headers: rateHeaders });
    }

    const prompt = `
Actua como un consultor de carrera premium especializado en el modelo de Edgar Schein.

Datos del perfil:
- Edad: ${userData.age}
- Rol/Ocupacion: ${userData.occupation}
- Ubicacion: ${userData.city}, ${userData.country}
- Ancla dominante: ${anchor.name}

Escribe una devolucion unica y personalizada, conectando ancla, etapa profesional y contexto.

Regla estricta de privacidad:
- No incluyas ni solicites datos personales de identificacion.
- No menciones nombre, email, telefono ni direccion.

Tono:
- Editorial Warmth
- Profesional, directo, sin exageraciones
- No menciones que eres una IA
`;

    try {
      const result = await generateObject({
        model: openai("gpt-4o"),
        schema: diagnosticResultSchema,
        prompt,
        temperature: 0.5,
      });

      logEvent("info", "diagnostics.analyze.success", { requestId, userId: auth.user.id, ip, anchor: anchor.name });
      return NextResponse.json(result.object, { headers: rateHeaders });
    } catch (error) {
      logEvent("warn", "diagnostics.analyze.fallback", {
        requestId,
        userId: auth.user.id,
        ip,
        anchor: anchor.name,
        reason: error instanceof Error ? error.message : "openai_unknown_error",
      });
      return NextResponse.json(buildFallbackDiagnostic(anchor, userData), { headers: rateHeaders });
    }
  } catch (error) {
    logEvent("error", "diagnostics.analyze.error", {
      requestId,
      ip,
      message: error instanceof Error ? error.message : "unknown-error",
    });

    return NextResponse.json(
      { error: "Failed to analyze diagnostic" },
      { status: 500, headers: withRequestHeaders(requestId) },
    );
  }
}
