import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateObject: vi.fn(),
  openai: vi.fn((model: string) => ({ model })),
  limitRequest: vi.fn(),
  logEvent: vi.fn(),
  getAuthenticatedUser: vi.fn(),
  createAdminClient: vi.fn(),
  select: vi.fn(),
  maybeSingle: vi.fn(),
  adminRpc: vi.fn(),
}));

vi.mock("ai", () => ({ generateObject: mocks.generateObject }));
vi.mock("@ai-sdk/openai", () => ({ openai: mocks.openai }));
vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limitRequest }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));
vi.mock("@/lib/supabase/auth", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));

import { POST } from "@/app/api/diagnostics/interpret/route";

const CLAIM_TOKEN = "33333333-3333-4333-8333-333333333333";

function storedAnswers() {
  const answers = Object.fromEntries(
    Array.from({ length: 40 }, (_, index) => [String(index + 1), 1]),
  );
  for (const questionId of [3, 11, 19, 27, 35]) {
    answers[String(questionId)] = 6;
  }

  return { answers, bonus: [3, 11, 19] };
}

function validInterpretation(mode: "ai" | "fallback" = "ai") {
  return {
    title: "Una lectura posible",
    summary: "La autonomía aparece como una motivación relevante para comparar alternativas.",
    tensions: [],
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
    mode,
  };
}

function storedScoreWithTechnicalFirst() {
  return [
    { id: "technical", name: "Técnica/Funcional", score: 50, mean: 10, rank: 1 },
    { id: "management", name: "Dirección General", score: 40, mean: 8, rank: 2 },
    { id: "security", name: "Seguridad/Estabilidad", score: 35, mean: 7, rank: 3 },
    { id: "entrepreneurial", name: "Creatividad Emprendedora", score: 30, mean: 6, rank: 4 },
    { id: "service", name: "Servicio/Dedicación", score: 25, mean: 5, rank: 5 },
    { id: "challenge", name: "Desafío Puro", score: 20, mean: 4, rank: 6 },
    { id: "lifestyle", name: "Estilo de Vida", score: 15, mean: 3, rank: 7 },
    { id: "autonomy", name: "Autonomía/Independencia", score: 10, mean: 2, rank: 8 },
  ];
}

function storedDiagnostic(overrides: Record<string, unknown> = {}) {
  return {
    raw_answers: storedAnswers(),
    user_data: { locale: "es", careerStage: "changing_employment" },
    ai_feedback: null,
    result_ai: null,
    result_base: null,
    score_result: null,
    ...overrides,
  };
}

function interpretRequest(body: unknown = {}) {
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
    mocks.maybeSingle.mockReset().mockResolvedValue({
      data: storedDiagnostic(),
      error: null,
    });
    mocks.adminRpc.mockReset().mockImplementation(
      async (functionName: string, parameters: { p_interpretation?: unknown }) => {
        if (functionName === "claim_career_anchor_interpretation") {
          return { data: { status: "claimed", claimToken: CLAIM_TOKEN }, error: null };
        }

        if (functionName === "save_career_anchor_interpretation") {
          return { data: parameters.p_interpretation, error: null };
        }

        throw new Error(`Unexpected RPC: ${functionName}`);
      },
    );
    mocks.createAdminClient.mockReset().mockReturnValue({ rpc: mocks.adminRpc });

    mocks.select.mockReset();
    const query = {
      select: mocks.select,
      eq: vi.fn(),
      maybeSingle: mocks.maybeSingle,
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);

    mocks.getAuthenticatedUser.mockReset().mockResolvedValue({
      ok: true,
      user: { id: "user-test-id", email: "person@example.com" },
      supabase: { from: vi.fn(() => query) },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds and persists the fallback only from the authenticated stored result", async () => {
    const response = await POST(interpretRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      mode: "fallback",
      tensions: [],
      relevantServices: [{ slug: "/transiciones-laborales/cambiar-empleo" }],
    });
    expect(body.reflectionQuestions).toHaveLength(3);
    expect(body.nextSteps).toHaveLength(3);
    expect(mocks.generateObject).not.toHaveBeenCalled();
    expect(mocks.adminRpc).toHaveBeenNthCalledWith(1, "claim_career_anchor_interpretation", {
      p_user_id: "user-test-id",
    });
    expect(mocks.adminRpc).toHaveBeenNthCalledWith(2, "save_career_anchor_interpretation", {
      p_user_id: "user-test-id",
      p_claim_token: CLAIM_TOKEN,
      p_interpretation: body,
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns a valid saved interpretation without invoking AI, rate limiting, or persistence", async () => {
    const saved = validInterpretation("ai");
    mocks.maybeSingle.mockResolvedValueOnce({
      data: storedDiagnostic({ result_ai: saved, ai_feedback: validInterpretation("fallback") }),
      error: null,
    });

    const response = await POST(interpretRequest({}));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(saved);
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.generateObject).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("returns a canonical interpretation from the claim without generating or saving again", async () => {
    const canonical = validInterpretation("ai");
    mocks.adminRpc.mockResolvedValueOnce({
      data: { status: "ready", interpretation: canonical },
      error: null,
    });

    const response = await POST(interpretRequest({}));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(canonical);
    expect(mocks.adminRpc).toHaveBeenCalledTimes(1);
    expect(mocks.adminRpc).toHaveBeenCalledWith("claim_career_anchor_interpretation", {
      p_user_id: "user-test-id",
    });
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.generateObject).not.toHaveBeenCalled();
  });

  it("returns a retryable response while another request holds the interpretation lease", async () => {
    mocks.adminRpc.mockResolvedValueOnce({
      data: { status: "processing" },
      error: null,
    });

    const response = await POST(interpretRequest({}));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ code: "interpretation_processing" });
    expect(response.headers.get("retry-after")).toBe("2");
    expect(mocks.adminRpc).toHaveBeenCalledTimes(1);
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.generateObject).not.toHaveBeenCalled();
  });

  it("fails closed for a missing or malformed interpretation claim", async () => {
    mocks.adminRpc.mockResolvedValueOnce({
      data: { status: "missing" },
      error: null,
    });
    const missing = await POST(interpretRequest({}));
    expect(missing.status).toBe(404);

    mocks.adminRpc.mockResolvedValueOnce({ data: { status: "unknown" }, error: null });
    const malformed = await POST(interpretRequest({}));
    expect(malformed.status).toBe(503);

    mocks.adminRpc.mockResolvedValueOnce({ data: { status: "claimed" }, error: null });
    const missingToken = await POST(interpretRequest({}));
    expect(missingToken.status).toBe(503);
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.generateObject).not.toHaveBeenCalled();
  });

  it("uses AI only to explain the server-calculated stored ranking and strips inferred tensions", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    mocks.generateObject.mockResolvedValueOnce({
      object: { ...validInterpretation("ai"), tensions: ["Una tensión no validada."] },
    });

    const response = await POST(interpretRequest({}));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ mode: "ai", tensions: [] });
    expect(mocks.openai).toHaveBeenCalledWith("gpt-4o");
    const generationParameters = mocks.generateObject.mock.calls[0]?.[0];
    expect(generationParameters.prompt).toContain("Autonomía/Independencia");
    expect(generationParameters.prompt).not.toContain("rawAnswers");
    expect(generationParameters.prompt).not.toContain("person@example.com");
    expect(generationParameters.prompt).not.toContain("203.0.113.4");
    expect(mocks.adminRpc).toHaveBeenCalledWith(
      "save_career_anchor_interpretation",
      expect.objectContaining({
        p_user_id: "user-test-id",
        p_claim_token: CLAIM_TOKEN,
        p_interpretation: expect.objectContaining({ mode: "ai", tensions: [] }),
      }),
    );
  });

  it("uses the durable score ordering instead of recalculating the stored raw answers", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    mocks.maybeSingle.mockResolvedValueOnce({
      data: storedDiagnostic({ score_result: storedScoreWithTechnicalFirst() }),
      error: null,
    });
    mocks.generateObject.mockResolvedValueOnce({ object: validInterpretation("ai") });

    const response = await POST(interpretRequest({}));

    expect(response.status).toBe(200);
    const generationParameters = mocks.generateObject.mock.calls[0]?.[0];
    const trustedContext = JSON.parse(
      String(generationParameters.prompt).replace(/^TRUSTED_CONTEXT_JSON\n/, ""),
    );
    expect(trustedContext.primaryAnchors).toEqual([
      expect.objectContaining({ id: "technical", score: 50, rank: 1 }),
    ]);
    expect(trustedContext.completeRanking.map((anchor: { id: string }) => anchor.id)).toEqual([
      "technical",
      "management",
      "security",
      "entrepreneurial",
      "service",
      "challenge",
      "lifestyle",
      "autonomy",
    ]);
    expect(mocks.select).toHaveBeenCalledWith(
      "raw_answers, user_data, ai_feedback, result_ai, result_base, score_result",
    );
  });

  it("reuses the durable base result unchanged when AI is unavailable", async () => {
    const durableFallback = {
      ...validInterpretation("fallback"),
      title: "Lectura base guardada al completar",
      summary: "Esta devolución estable fue calculada y persistida junto con el resultado.",
    };
    mocks.maybeSingle.mockResolvedValueOnce({
      data: storedDiagnostic({
        result_base: durableFallback,
        score_result: storedScoreWithTechnicalFirst(),
      }),
      error: null,
    });

    const response = await POST(interpretRequest({}));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(durableFallback);
    expect(mocks.generateObject).not.toHaveBeenCalled();
    expect(mocks.adminRpc).toHaveBeenNthCalledWith(2, "save_career_anchor_interpretation", {
      p_user_id: "user-test-id",
      p_claim_token: CLAIM_TOKEN,
      p_interpretation: durableFallback,
    });
  });

  it("returns the canonical value from save when another writer wins the race", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    const generatedCandidate = validInterpretation("ai");
    const canonical = {
      ...validInterpretation("fallback"),
      title: "Lectura canónica ya guardada",
    };
    mocks.generateObject.mockResolvedValueOnce({ object: generatedCandidate });
    mocks.adminRpc.mockImplementation(
      async (functionName: string) =>
        functionName === "claim_career_anchor_interpretation"
          ? { data: { status: "claimed", claimToken: CLAIM_TOKEN }, error: null }
          : { data: canonical, error: null },
    );

    const response = await POST(interpretRequest({}));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(canonical);
    expect(mocks.adminRpc).toHaveBeenNthCalledWith(
      2,
      "save_career_anchor_interpretation",
      expect.objectContaining({
        p_claim_token: CLAIM_TOKEN,
        p_interpretation: expect.objectContaining({ mode: "ai" }),
      }),
    );
  });

  it("falls back from provider failure and from rate limiting while keeping the result durable", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    mocks.generateObject.mockRejectedValueOnce(new Error("provider unavailable"));

    const providerFailure = await POST(interpretRequest({}));
    await expect(providerFailure.json()).resolves.toMatchObject({ mode: "fallback" });

    mocks.limitRequest.mockResolvedValueOnce({
      limited: true,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });
    mocks.generateObject.mockClear();
    const limited = await POST(interpretRequest({}));

    expect(limited.status).toBe(200);
    await expect(limited.json()).resolves.toMatchObject({ mode: "fallback" });
    expect(mocks.generateObject).not.toHaveBeenCalled();
    expect(mocks.adminRpc.mock.calls.map(([functionName]) => functionName)).toEqual([
      "claim_career_anchor_interpretation",
      "save_career_anchor_interpretation",
      "claim_career_anchor_interpretation",
      "save_career_anchor_interpretation",
    ]);
  });

  it("requires an empty body and rejects legacy answers, rankings, and personal data before lookup", async () => {
    const response = await POST(
      interpretRequest({
        rawAnswers: storedAnswers(),
        ranking: [{ id: "manipulated", score: 999 }],
        email: "not-accepted@example.com",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.generateObject).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("requires authentication and a completed, structurally valid stored diagnostic", async () => {
    mocks.getAuthenticatedUser.mockResolvedValueOnce({
      ok: false,
      status: 401,
      reason: "auth-required",
    });
    const unauthenticated = await POST(interpretRequest({}));
    expect(unauthenticated.status).toBe(401);

    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const missing = await POST(interpretRequest({}));
    expect(missing.status).toBe(404);

    mocks.maybeSingle.mockResolvedValueOnce({
      data: storedDiagnostic({ raw_answers: { answers: { "1": 6 }, bonus: [] } }),
      error: null,
    });
    const invalid = await POST(interpretRequest({}));
    expect(invalid.status).toBe(503);
    expect(mocks.generateObject).not.toHaveBeenCalled();
  });

  it("fails closed when the stored result lookup fails", async () => {
    mocks.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { code: "database_unavailable" },
    });

    const response = await POST(interpretRequest({}));

    expect(response.status).toBe(503);
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "error",
      "diagnostics.interpret.lookup_failed",
      expect.objectContaining({ reason: "database_unavailable" }),
    );
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });
});
