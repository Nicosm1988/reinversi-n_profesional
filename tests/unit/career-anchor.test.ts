import { describe, expect, it } from "vitest";
import englishQuizData from "@/lib/data/anchors.en.json";
import spanishQuizData from "@/lib/data/anchors.json";
import {
  buildCareerAnchorFallbackInterpretation,
  calculateCareerAnchorRanking,
  calculateDominantCareerAnchor,
  careerAnchorAnalyzeRequestSchema,
  careerAnchorInterpretRequestSchema,
  getCareerAnchorResultGroups,
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

  it("preserves the validated response scale from 1 to 6", () => {
    const belowScale = buildValidPayload();
    belowScale.rawAnswers.answers["1"] = 0;
    const aboveScale = buildValidPayload();
    aboveScale.rawAnswers.answers["40"] = 7;

    expect(careerAnchorAnalyzeRequestSchema.safeParse(belowScale).success).toBe(false);
    expect(careerAnchorAnalyzeRequestSchema.safeParse(aboveScale).success).toBe(false);
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

describe("public career anchor ranking", () => {
  it("preserves the validated 40-question order and anchor mapping in both locales", () => {
    const expectedMappings = [
      [1, 9, 17, 25, 33],
      [2, 10, 18, 26, 34],
      [3, 11, 19, 27, 35],
      [4, 12, 20, 28, 36],
      [5, 13, 21, 29, 37],
      [6, 14, 22, 30, 38],
      [7, 15, 23, 31, 39],
      [8, 16, 24, 32, 40],
    ];

    for (const catalog of [spanishQuizData, englishQuizData]) {
      expect(catalog.questions.map((question) => question.id)).toEqual(
        Array.from({ length: 40 }, (_, index) => index + 1),
      );
      expect(catalog.anchors.map((anchor) => anchor.questions)).toEqual(expectedMappings);
    }

    expect(englishQuizData.anchors.map((anchor) => anchor.id)).toEqual(
      spanishQuizData.anchors.map((anchor) => anchor.id),
    );
  });

  it("applies the +4 bonus to each of the three selected statements", () => {
    const payload = buildValidPayload();
    payload.rawAnswers.bonus = [1, 2, 3];

    const ranking = calculateCareerAnchorRanking(payload.rawAnswers);
    const scoreById = Object.fromEntries(ranking.map((anchor) => [anchor.id, anchor.score]));

    expect(scoreById).toMatchObject({
      technical: 9,
      management: 9,
      autonomy: 9,
      security: 5,
    });
  });

  it.each(spanishQuizData.anchors)("can identify $id as the leading anchor", (anchor) => {
    const payload = buildValidPayload();
    for (const questionId of anchor.questions) {
      payload.rawAnswers.answers[String(questionId)] = 6;
    }
    payload.rawAnswers.bonus = anchor.questions.slice(0, 3);

    expect(calculateCareerAnchorRanking(payload.rawAnswers)[0]?.id).toBe(anchor.id);
  });

  it("uses standard competition ranks when scores tie", () => {
    const payload = buildValidPayload();
    payload.rawAnswers.bonus = [1, 2, 3];
    payload.rawAnswers.answers["9"] = 2;
    payload.rawAnswers.answers["10"] = 2;

    const ranking = calculateCareerAnchorRanking(payload.rawAnswers);

    expect(ranking.slice(0, 4).map(({ id, score, rank }) => ({ id, score, rank }))).toEqual([
      { id: "technical", score: 10, rank: 1 },
      { id: "management", score: 10, rank: 1 },
      { id: "autonomy", score: 9, rank: 3 },
      { id: "security", score: 5, rank: 4 },
    ]);
    expect(getCareerAnchorResultGroups(ranking)).toMatchObject({
      primary: [{ id: "technical" }, { id: "management" }],
      secondary: [{ id: "autonomy" }],
    });
  });

  it("accepts only non-identifying context and recalculable raw answers", () => {
    const payload = buildValidPayload();
    const publicPayload = {
      rawAnswers: payload.rawAnswers,
      careerStage: "changing_employment",
      locale: "es",
    };

    expect(careerAnchorInterpretRequestSchema.safeParse(publicPayload).success).toBe(true);
    expect(
      careerAnchorInterpretRequestSchema.safeParse({
        ...publicPayload,
        name: "Dato personal no permitido",
      }).success,
    ).toBe(false);
    expect(
      careerAnchorInterpretRequestSchema.safeParse({
        ...publicPayload,
        ranking: [{ id: "manipulated", score: 999 }],
      }).success,
    ).toBe(false);
  });

  it("builds a complete deterministic fallback without personal data", () => {
    const payload = buildValidPayload();
    const ranking = calculateCareerAnchorRanking(payload.rawAnswers);
    const fallback = buildCareerAnchorFallbackInterpretation(
      ranking,
      "choosing_education",
      "es",
    );

    expect(fallback.mode).toBe("fallback");
    expect(fallback.tensions.length).toBeGreaterThanOrEqual(2);
    expect(fallback.reflectionQuestions.length).toBeGreaterThanOrEqual(3);
    expect(fallback.nextSteps.length).toBeGreaterThanOrEqual(3);
    expect(fallback.relevantServices[0]?.slug).toBe(
      "/transiciones-laborales/elegir-formacion",
    );
  });
});
