import { describe, expect, it } from "vitest";
import {
  calculateDominantCareerAnchor,
  careerAnchorAnalyzeRequestSchema,
} from "@/lib/diagnostics/career-anchor";

function buildValidPayload() {
  return {
    userData: {
      name: "Persona de prueba",
      age: 38,
      occupation: "Analista",
      city: "Buenos Aires",
      country: "Argentina",
    },
    rawAnswers: {
      answers: Object.fromEntries(Array.from({ length: 40 }, (_, index) => [String(index + 1), 1])),
      bonus: [3, 11, 19],
    },
    captchaToken: "turnstile-token",
  };
}

describe("careerAnchorAnalyzeRequestSchema", () => {
  it("accepts the complete 40-question diagnostic", () => {
    expect(careerAnchorAnalyzeRequestSchema.safeParse(buildValidPayload()).success).toBe(true);
  });

  it("accepts supported locales and rejects unknown locales", () => {
    expect(
      careerAnchorAnalyzeRequestSchema.safeParse({ ...buildValidPayload(), locale: "en" }).success,
    ).toBe(true);
    expect(
      careerAnchorAnalyzeRequestSchema.safeParse({ ...buildValidPayload(), locale: "fr" }).success,
    ).toBe(false);
  });

  it("rejects missing and foreign question identifiers", () => {
    const payload = buildValidPayload();
    delete payload.rawAnswers.answers["40"];
    payload.rawAnswers.answers["999"] = 6;

    expect(careerAnchorAnalyzeRequestSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects duplicate or unknown bonus selections", () => {
    const duplicated = buildValidPayload();
    duplicated.rawAnswers.bonus = [3, 3, 11];
    const unknown = buildValidPayload();
    unknown.rawAnswers.bonus = [3, 11, 999];

    expect(careerAnchorAnalyzeRequestSchema.safeParse(duplicated).success).toBe(false);
    expect(careerAnchorAnalyzeRequestSchema.safeParse(unknown).success).toBe(false);
  });

  it("rejects client-supplied calculated fields", () => {
    const payload = { ...buildValidPayload(), anchor: { name: "Resultado manipulado" } };

    expect(careerAnchorAnalyzeRequestSchema.safeParse(payload).success).toBe(false);
  });
});

describe("calculateDominantCareerAnchor", () => {
  it("calculates the dominant anchor from trusted catalog mappings", () => {
    const payload = buildValidPayload();
    for (const questionId of [3, 11, 19, 27, 35]) {
      payload.rawAnswers.answers[String(questionId)] = 6;
    }

    expect(calculateDominantCareerAnchor(payload.rawAnswers)).toEqual({
      name: "Autonomía/Independencia",
    });
    expect(calculateDominantCareerAnchor(payload.rawAnswers, "en")).toEqual({
      name: "Autonomy/Independence",
    });
  });
});
