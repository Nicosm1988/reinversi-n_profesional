import { describe, expect, it } from "vitest";
import {
  initialDiagnosticSchema,
  suggestRoute,
  toInitialDiagnosticInsert,
} from "@/lib/diagnostics/initial-diagnostic";

const baseInput = {
  situation: "need-clarity" as const,
  need: "know-myself" as const,
  careerStage: "experienced-professional" as const,
  urgency: "exploring" as const,
};

describe("initial diagnostic", () => {
  it("maps explicit situations to their corresponding process", () => {
    expect(suggestRoute({ ...baseInput, situation: "choosing-direction", need: "choose-alternatives" })).toBe("orientacion-vocacional");
    expect(suggestRoute({ ...baseInput, situation: "trajectory-no-longer-represents-me", need: "redefine-direction" })).toBe("reinvencion-profesional");
    expect(suggestRoute({ ...baseInput, situation: "concrete-work-change", need: "organize-transition" })).toBe("transicion-laboral");
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
      routing_version: 1,
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
      suggestedRoute: "orientacion-vocacional",
    });

    expect(parsed.success).toBe(false);
  });
});
