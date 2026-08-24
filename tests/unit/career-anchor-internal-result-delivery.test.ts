import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  sendCareerAnchorInternalResultEmail: vi.fn(),
  logEvent: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
  maybeSingle: vi.fn(),
  getUserById: vi.fn(),
  claims: [] as unknown[],
}));

vi.mock("next/dist/compiled/server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/diagnostics/career-anchor-report-mailer", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/diagnostics/career-anchor-report-mailer")
  >("@/lib/diagnostics/career-anchor-report-mailer");
  return {
    ...actual,
    sendCareerAnchorInternalResultEmail: mocks.sendCareerAnchorInternalResultEmail,
  };
});
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { processCareerAnchorInternalResultEmails } from "@/lib/diagnostics/career-anchor-internal-result-delivery";

const HOLA_DELIVERY_ID = "f83b4e39-354c-4783-b65a-99b399a70947";
const TANIA_DELIVERY_ID = "ab977833-0f18-4e93-9752-18a1407b6f19";
const DIAGNOSTIC_ID = "9e06fa68-d93f-4856-b73e-98a4659a95c4";
const USER_ID = "2d4ce17f-9664-45c4-b606-7e1a2467110f";
const ACCOUNT_EMAIL = "person@example.com";

const scoreResult = [
  { id: "technical", name: "Técnica/Funcional", score: 34, mean: 6.8, rank: 1 },
  { id: "management", name: "Dirección General", score: 31, mean: 6.2, rank: 2 },
  { id: "autonomy", name: "Autonomía/Independencia", score: 29, mean: 5.8, rank: 3 },
  { id: "security", name: "Seguridad/Estabilidad", score: 26, mean: 5.2, rank: 4 },
  { id: "entrepreneurial", name: "Creatividad Emprendedora", score: 23, mean: 4.6, rank: 5 },
  { id: "service", name: "Servicio/Dedicación", score: 20, mean: 4, rank: 6 },
  { id: "challenge", name: "Desafío Puro", score: 17, mean: 3.4, rank: 7 },
  { id: "lifestyle", name: "Estilo de Vida", score: 14, mean: 2.8, rank: 8 },
];

const resultBase = {
  mode: "fallback" as const,
  title: "Técnica/Funcional como punto de referencia",
  summary: "El resultado ofrece una orientación para comparar alternativas.",
  tensions: [],
  reflectionQuestions: [
    "¿Qué querés preservar?",
    "¿Qué falta en tu situación actual?",
    "¿Qué experiencia pequeña podés probar?",
  ],
  stageConnection: "El cambio de empleo puede revisarse con estos criterios.",
  relevantServices: [
    {
      slug: "/transiciones-laborales/cambiar-empleo" as const,
      label: "Preparar un cambio de empleo",
      reason: "Permite ordenar alternativas y próximos pasos.",
    },
  ],
  nextSteps: [
    "Revisar experiencias recientes.",
    "Comparar una alternativa concreta.",
    "Conversar con una persona profesional si resulta útil.",
  ],
};

function claim(
  emailKind:
    | "career_anchor_internal_hola_v1"
    | "career_anchor_internal_tanisardella_v1",
) {
  const isHola = emailKind === "career_anchor_internal_hola_v1";
  return {
    delivery_id: isHola ? HOLA_DELIVERY_ID : TANIA_DELIVERY_ID,
    diagnostic_id: DIAGNOSTIC_ID,
    user_id: USER_ID,
    email_kind: emailKind,
    locale: "es",
    attempt_id: isHola
      ? "5d0aface-88ad-4df6-8390-2cf52e819810"
      : "48bf6174-71ed-4267-b3fd-a1e5973f525c",
    attempt_number: 1,
  };
}

function validReport(overrides: Record<string, unknown> = {}) {
  return {
    status: "completed",
    score_result: scoreResult,
    result_base: resultBase,
    user_data: {
      locale: "es",
      careerStage: "changing_employment",
      resultEmailConsent: {
        granted: true,
        version: "career-anchor-team-result-email-v1",
        recordedAt: "2026-08-24T14:35:20.000Z",
        purpose: "senda_team_result_review",
        recipients: ["hola@universosenda.com", "tanisardella@gmail.com"],
        includes: [
          "account_email",
          "career_stage",
          "eight_anchor_ranking",
          "scores",
          "deterministic_guidance",
        ],
        excludes: ["raw_answers"],
      },
    },
    ...overrides,
  };
}

function finishCalls() {
  return mocks.rpc.mock.calls.filter(
    ([functionName]) => functionName === "finish_career_anchor_report_email_delivery",
  );
}

describe("processCareerAnchorInternalResultEmails", () => {
  beforeEach(() => {
    mocks.claims.length = 0;
    mocks.select.mockReset();
    mocks.maybeSingle.mockReset().mockResolvedValue({ data: validReport(), error: null });
    mocks.getUserById.mockReset().mockResolvedValue({
      data: { user: { email: ACCOUNT_EMAIL } },
      error: null,
    });
    mocks.sendCareerAnchorInternalResultEmail.mockReset().mockImplementation(
      async (input: { deliveryId: string }) => ({
        messageId: `<${input.deliveryId}@universosenda.com>`,
      }),
    );
    mocks.logEvent.mockReset();
    mocks.rpc.mockReset().mockImplementation(async (functionName: string) => {
      if (functionName === "claim_career_anchor_internal_result_email_delivery") {
        const next = mocks.claims.shift();
        return { data: next ? [next] : [], error: null };
      }
      if (functionName === "finish_career_anchor_report_email_delivery") {
        return { data: true, error: null };
      }
      throw new Error(`Unexpected RPC: ${functionName}`);
    });

    const query = {
      select: mocks.select,
      eq: vi.fn(),
      maybeSingle: mocks.maybeSingle,
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);

    mocks.createAdminClient.mockReset().mockReturnValue({
      rpc: mocks.rpc,
      from: vi.fn(() => query),
      auth: { admin: { getUserById: mocks.getUserById } },
    });
  });

  it("reads only the consented derived result and maps each kind to exactly one recipient", async () => {
    mocks.claims.push(
      claim("career_anchor_internal_hola_v1"),
      claim("career_anchor_internal_tanisardella_v1"),
    );

    await expect(
      processCareerAnchorInternalResultEmails({ diagnosticId: DIAGNOSTIC_ID, maxDeliveries: 2 }),
    ).resolves.toEqual({
      claimed: 2,
      sent: 2,
      retryScheduled: 0,
      permanentFailures: 0,
      unavailable: false,
    });

    expect(mocks.select).toHaveBeenCalledTimes(2);
    expect(mocks.select).toHaveBeenCalledWith(
      "status, score_result, result_base, user_data",
    );
    expect(JSON.stringify(mocks.select.mock.calls)).not.toContain("raw_answers");

    expect(mocks.sendCareerAnchorInternalResultEmail).toHaveBeenCalledTimes(2);
    expect(mocks.sendCareerAnchorInternalResultEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        recipient: "hola@universosenda.com",
        deliveryId: HOLA_DELIVERY_ID,
        accountEmail: ACCOUNT_EMAIL,
        careerStage: "changing_employment",
        scoreResult,
        resultBase,
      }),
    );
    expect(mocks.sendCareerAnchorInternalResultEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        recipient: "tanisardella@gmail.com",
        deliveryId: TANIA_DELIVERY_ID,
        accountEmail: ACCOUNT_EMAIL,
        careerStage: "changing_employment",
        scoreResult,
        resultBase,
      }),
    );
    for (const [input] of mocks.sendCareerAnchorInternalResultEmail.mock.calls) {
      expect(input.recipient).toEqual(expect.any(String));
      expect(input.recipient).not.toEqual(expect.any(Array));
      expect(input).not.toHaveProperty("rawAnswers");
    }

    const serializedLogs = JSON.stringify(mocks.logEvent.mock.calls);
    expect(serializedLogs).not.toContain(ACCOUNT_EMAIL);
    expect(serializedLogs).not.toContain(DIAGNOSTIC_ID);
    expect(serializedLogs).not.toContain("hola@universosenda.com");
    expect(serializedLogs).not.toContain("tanisardella@gmail.com");
    expect(serializedLogs).not.toContain(resultBase.summary);
  });

  it.each([
    [
      "missing consent",
      () => {
        const report = validReport();
        return {
          ...report,
          user_data: {
            locale: report.user_data.locale,
            careerStage: report.user_data.careerStage,
          },
        };
      },
    ],
    [
      "an obsolete consent version",
      () => {
        const report = validReport();
        return {
          ...report,
          user_data: {
            ...report.user_data,
            resultEmailConsent: {
              ...report.user_data.resultEmailConsent,
              version: "career-anchor-team-result-email-v0",
            },
          },
        };
      },
    ],
    ["fewer than eight scores", () => validReport({ score_result: scoreResult.slice(0, 7) })],
    ["a non-deterministic result", () => validReport({ result_base: { ...resultBase, mode: "ai" } })],
  ])("permanently rejects %s before resolving or sending email", async (_label, reportFactory) => {
    mocks.claims.push(claim("career_anchor_internal_hola_v1"));
    mocks.maybeSingle.mockResolvedValueOnce({ data: reportFactory(), error: null });

    await expect(
      processCareerAnchorInternalResultEmails({ maxDeliveries: 1 }),
    ).resolves.toMatchObject({
      claimed: 1,
      sent: 0,
      retryScheduled: 0,
      permanentFailures: 1,
      unavailable: false,
    });

    expect(mocks.getUserById).not.toHaveBeenCalled();
    expect(mocks.sendCareerAnchorInternalResultEmail).not.toHaveBeenCalled();
    expect(finishCalls()).toEqual([
      [
        "finish_career_anchor_report_email_delivery",
        expect.objectContaining({
          p_delivery_id: HOLA_DELIVERY_ID,
          p_outcome: "permanent_failure",
          p_error_code: "report_data_invalid",
        }),
      ],
    ]);
  });

  it("schedules only the failed recipient for retry and continues with the other delivery", async () => {
    mocks.claims.push(
      claim("career_anchor_internal_hola_v1"),
      claim("career_anchor_internal_tanisardella_v1"),
    );
    mocks.sendCareerAnchorInternalResultEmail
      .mockRejectedValueOnce(new Error("SMTP connection lost"))
      .mockResolvedValueOnce({ messageId: "<tania-accepted@universosenda.com>" });

    await expect(
      processCareerAnchorInternalResultEmails({ maxDeliveries: 2 }),
    ).resolves.toEqual({
      claimed: 2,
      sent: 1,
      retryScheduled: 1,
      permanentFailures: 0,
      unavailable: false,
    });

    expect(mocks.sendCareerAnchorInternalResultEmail).toHaveBeenCalledTimes(2);
    expect(finishCalls()).toEqual([
      [
        "finish_career_anchor_report_email_delivery",
        expect.objectContaining({
          p_delivery_id: HOLA_DELIVERY_ID,
          p_outcome: "failed",
          p_error_code: "smtp_transport",
          p_retry_after_seconds: 900,
        }),
      ],
      [
        "finish_career_anchor_report_email_delivery",
        expect.objectContaining({
          p_delivery_id: TANIA_DELIVERY_ID,
          p_outcome: "sent",
          p_provider_message_id: "<tania-accepted@universosenda.com>",
        }),
      ],
    ]);
  });

  it.each([
    ["missing", undefined, "account_email_unavailable"],
    ["invalid", "not-an-email", "account_email_unavailable"],
  ])("treats a %s account email as a permanent failure without opening SMTP", async (
    _label,
    email,
    errorCode,
  ) => {
    mocks.claims.push(claim("career_anchor_internal_hola_v1"));
    mocks.getUserById.mockResolvedValueOnce({
      data: { user: email === undefined ? {} : { email } },
      error: null,
    });

    await expect(
      processCareerAnchorInternalResultEmails({ maxDeliveries: 1 }),
    ).resolves.toMatchObject({
      claimed: 1,
      sent: 0,
      retryScheduled: 0,
      permanentFailures: 1,
      unavailable: false,
    });

    expect(mocks.sendCareerAnchorInternalResultEmail).not.toHaveBeenCalled();
    expect(finishCalls()).toEqual([
      [
        "finish_career_anchor_report_email_delivery",
        expect.objectContaining({
          p_outcome: "permanent_failure",
          p_error_code: errorCode,
        }),
      ],
    ]);
    expect(JSON.stringify(mocks.logEvent.mock.calls)).not.toContain(String(email));
  });
});
