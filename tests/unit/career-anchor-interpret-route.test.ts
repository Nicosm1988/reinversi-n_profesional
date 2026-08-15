import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateObject: vi.fn(),
  openai: vi.fn((model: string) => ({ model })),
  limitRequest: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("ai", () => ({ generateObject: mocks.generateObject }));
vi.mock("@ai-sdk/openai", () => ({ openai: mocks.openai }));
vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limitRequest }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { POST } from "@/app/api/diagnostics/interpret/route";

function buildRequestBody() {
  const answers = Object.fromEntries(
    Array.from({ length: 40 }, (_, index) => [String(index + 1), 1]),
  );
  for (const questionId of [3, 11, 19, 27, 35]) {
    answers[String(questionId)] = 6;
  }

  return {
    rawAnswers: {
      answers,
      bonus: [3, 11, 19],
    },
    careerStage: "changing_employment",
    locale: "es",
  };
}

function interpretRequest(body: unknown) {
  return new Request("https://senda.example/api/diagnostics/interpret", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.4",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/diagnostics/interpret", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "");
    mocks.generateObject.mockReset();
    mocks.openai.mockClear();
    mocks.limitRequest.mockReset().mockResolvedValue({
      limited: false,
      remaining: 7,
      resetAt: Date.now() + 60_000,
    });
    mocks.logEvent.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a complete deterministic fallback when OpenAI is unavailable", async () => {
    const response = await POST(interpretRequest(buildRequestBody()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      mode: "fallback",
      relevantServices: [
        { slug: "/transiciones-laborales/cambiar-empleo" },
      ],
    });
    expect(body.tensions.length).toBeGreaterThanOrEqual(2);
    expect(body.reflectionQuestions.length).toBeGreaterThanOrEqual(3);
    expect(body.nextSteps.length).toBeGreaterThanOrEqual(3);
    expect(mocks.generateObject).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("uses AI only to explain the server-calculated ranking and sends no PII", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    mocks.generateObject.mockResolvedValueOnce({
      object: {
        title: "Una lectura posible",
        summary: "La autonomía aparece como una motivación relevante para comparar alternativas.",
        tensions: ["Equilibrar autonomía y coordinación.", "Evitar decisiones impulsivas."],
        reflectionQuestions: ["¿Qué querés preservar?", "¿Qué falta hoy?", "¿Qué podés probar?"],
        stageConnection: "El cambio de empleo puede revisarse con estos criterios.",
        relevantServices: [
          {
            slug: "/transiciones-laborales/cambiar-empleo",
            label: "Preparar un cambio de empleo",
            reason: "Permite ordenar una estrategia coherente con la trayectoria.",
          },
        ],
        nextSteps: ["Revisar experiencias.", "Comparar alternativas.", "Definir un experimento."],
      },
    });

    const response = await POST(interpretRequest(buildRequestBody()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe("ai");
    expect(mocks.openai).toHaveBeenCalledWith("gpt-4o");
    const generationParameters = mocks.generateObject.mock.calls[0]?.[0];
    expect(generationParameters.prompt).toContain("Autonomía/Independencia");
    expect(generationParameters.prompt).not.toContain("rawAnswers");
    expect(generationParameters.prompt).not.toContain("email");
    expect(generationParameters.prompt).not.toContain("phone");
  });

  it("falls back when structured generation fails or the rate limit is reached", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    mocks.generateObject.mockRejectedValueOnce(new Error("provider unavailable"));

    const providerFailure = await POST(interpretRequest(buildRequestBody()));
    await expect(providerFailure.json()).resolves.toMatchObject({ mode: "fallback" });

    mocks.limitRequest.mockResolvedValueOnce({
      limited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });
    mocks.generateObject.mockClear();
    const limited = await POST(interpretRequest(buildRequestBody()));

    expect(limited.status).toBe(200);
    await expect(limited.json()).resolves.toMatchObject({ mode: "fallback" });
    expect(mocks.generateObject).not.toHaveBeenCalled();
  });

  it("rejects personal data and client-supplied rankings", async () => {
    const response = await POST(
      interpretRequest({
        ...buildRequestBody(),
        name: "Dato personal no permitido",
        ranking: [{ id: "manipulated", score: 999 }],
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.generateObject).not.toHaveBeenCalled();
  });
});
