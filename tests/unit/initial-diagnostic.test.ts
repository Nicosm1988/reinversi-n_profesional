import { describe, expect, it } from "vitest";
import {
  calculateRouteFinderResult,
  initialDiagnosticSchema,
  routeFinderRouteIds,
  suggestRoute,
  toInitialDiagnosticInsert,
  toShareableDiagnosticResult,
  type RouteFinderAnswers,
} from "@/lib/diagnostics/initial-diagnostic";

const baseInput = {
  situation: "need-clarity" as const,
  need: "know-myself" as const,
  careerStage: "experienced-professional" as const,
  urgency: "exploring" as const,
};

describe("initial diagnostic", () => {
  it("maps explicit situations to their corresponding process", () => {
    expect(suggestRoute({ ...baseInput, situation: "choosing-direction", need: "choose-alternatives", careerStage: "secondary-school" })).toBe("brujula");
    expect(suggestRoute({ ...baseInput, situation: "trajectory-no-longer-represents-me", need: "redefine-direction" })).toBe("nueva-etapa-profesional");
    expect(suggestRoute({ ...baseInput, situation: "concrete-work-change", need: "organize-transition" })).toBe("nueva-etapa-profesional");
  });

  it("uses career stage to avoid mismatched journey recommendations", () => {
    expect(suggestRoute({
      ...baseInput,
      situation: "choosing-direction",
      need: "choose-alternatives",
      careerStage: "leadership",
    })).toBe("entrevista-admision-requerida");
    expect(suggestRoute({
      ...baseInput,
      situation: "concrete-work-change",
      need: "organize-transition",
      careerStage: "secondary-school",
    })).toBe("entrevista-admision-requerida");
  });

  it("requires an admission interview when an unclear situation is urgent", () => {
    expect(suggestRoute({ ...baseInput, urgency: "urgent" })).toBe("entrevista-admision-requerida");
  });

  it("normalizes contact data and computes the route on the server", () => {
    const parsed = initialDiagnosticSchema.parse({
      ...baseInput,
      need: "redefine-direction",
      fullName: "  Persona Ejemplo  ",
      email: " Persona@Example.COM ",
      phone: "",
      consentAccepted: true,
      sourcePage: "/diagnostico",
      locale: "es",
    });

    expect(toInitialDiagnosticInsert(parsed, null)).toMatchObject({
      full_name: "Persona Ejemplo",
      email: "persona@example.com",
      phone: null,
      suggested_route: "entrevista-admision-requerida",
      routing_version: 2,
      form_version: 1,
    });
  });

  it("routes conflicting answers to an admission interview", () => {
    expect(suggestRoute({
      ...baseInput,
      situation: "concrete-work-change",
      need: "choose-alternatives",
    })).toBe("entrevista-admision-requerida");
  });

  it("rejects unknown fields and unsafe source paths", () => {
    const parsed = initialDiagnosticSchema.safeParse({
      ...baseInput,
      fullName: "Persona Ejemplo",
      email: "persona@example.com",
      consentAccepted: true,
      sourcePage: "https://example.com",
      suggestedRoute: "brujula",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("public route finder", () => {
  const routeCases: Array<{
    expectedRoute: (typeof routeFinderRouteIds)[number];
    expectedHref: string;
    answers: RouteFinderAnswers;
  }> = [
    {
      expectedRoute: "explorar-direccion",
      expectedHref: "/transiciones-laborales/explorar-direccion",
      answers: { situation: "direction", need: "identity", careerStage: "life", urgency: "exploring" },
    },
    {
      expectedRoute: "cambiar-empleo",
      expectedHref: "/transiciones-laborales/cambiar-empleo",
      answers: { situation: "jobChange", need: "search", careerStage: "experienced", urgency: "move-soon" },
    },
    {
      expectedRoute: "proyecto-propio",
      expectedHref: "/transiciones-laborales/proyecto-propio",
      answers: { situation: "project", need: "validate", careerStage: "owner", urgency: "move-soon" },
    },
    {
      expectedRoute: "liderazgo-empresa",
      expectedHref: "/transiciones-laborales/liderazgo-empresa",
      answers: { situation: "leadership", need: "lead", careerStage: "leadership", urgency: "exploring" },
    },
    {
      expectedRoute: "desafio-puntual",
      expectedHref: "/transiciones-laborales/desafio-puntual",
      answers: { situation: "focused", need: "decide", careerStage: "experienced", urgency: "short-term-decision" },
    },
    {
      expectedRoute: "elegir-formacion",
      expectedHref: "/transiciones-laborales/elegir-formacion",
      answers: { situation: "education", need: "learn", careerStage: "higher", urgency: "exploring" },
    },
    {
      expectedRoute: "brujulas",
      expectedHref: "/brujulas",
      answers: { situation: "compass", need: "firstDecisions", careerStage: "secondary", urgency: "exploring" },
    },
  ];

  it.each(routeCases)("selects $expectedRoute for a coherent answer set", ({ answers, expectedHref, expectedRoute }) => {
    const result = calculateRouteFinderResult(answers);

    expect(result.primary.id).toBe(expectedRoute);
    expect(result.primary.href).toBe(expectedHref);
    expect(result.primary.messageKey).toBeTruthy();
    expect(result.primary.workOnKeys.length).toBeGreaterThan(0);
    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.signals.length).toBeLessThanOrEqual(3);
    expect(result.signals.every((signal) => signal.weight > 0)).toBe(true);
  });

  it("does not add a secondary route when another option is not genuinely close", () => {
    const result = calculateRouteFinderResult({
      situation: "project",
      need: "validate",
      careerStage: "owner",
      urgency: "move-soon",
    });

    expect(result.primary.id).toBe("proyecto-propio");
    expect(result.secondary).toBeNull();
  });

  it("adds one secondary route when two grounded alternatives are within two points", () => {
    const result = calculateRouteFinderResult({
      situation: "direction",
      need: "learn",
      careerStage: "higher",
      urgency: "exploring",
    });

    expect(result.primary.id).toBe("explorar-direccion");
    expect(result.secondary?.id).toBe("elegir-formacion");
    expect(result.primary.score - (result.secondary?.score ?? 0)).toBeLessThanOrEqual(2);
  });

  it("keeps urgency as a human-contact signal instead of overriding the result", () => {
    const result = calculateRouteFinderResult({
      situation: "project",
      need: "validate",
      careerStage: "owner",
      urgency: "urgent",
    });

    expect(result.primary.id).toBe("proyecto-propio");
    expect(result.urgentHumanContact).toBe(true);
  });

  it("serializes an anonymous, locale-aware result for optional sharing", () => {
    const result = calculateRouteFinderResult({
      situation: "compass",
      need: "firstDecisions",
      careerStage: "secondary",
      urgency: "exploring",
    });
    const shareable = toShareableDiagnosticResult(result, "es", "2026-08-15T12:00:00.000Z");
    const serialized = JSON.stringify(shareable);

    expect(shareable).toMatchObject({
      instrument: "senda-route-finder",
      locale: "es",
      completedAt: "2026-08-15T12:00:00.000Z",
      routingVersion: 3,
    });
    expect(serialized).not.toContain("fullName");
    expect(serialized).not.toContain("email");
    expect(serialized).not.toContain("phone");
  });
});
