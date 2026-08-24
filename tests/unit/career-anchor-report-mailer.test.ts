import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("next/dist/compiled/server-only", () => ({}));
vi.mock("nodemailer", () => ({
  default: { createTransport: mocks.createTransport },
}));

import {
  CareerAnchorReportEmailConfigurationError,
  CareerAnchorReportEmailDeliveryError,
  CareerAnchorReportEmailRecipientError,
  sendCareerAnchorInternalResultEmail,
  sendCareerAnchorReportEmail,
} from "@/lib/diagnostics/career-anchor-report-mailer";

const input = {
  recipient: "person@example.com",
  deliveryId: "0fcd30d2-7d83-45a5-9854-23c18c5c31f1",
  locale: "es" as const,
  reportUrl: "https://universosenda.com/panel#resultado",
};

const internalInput = {
  recipient: "equipo-one@universosenda.com",
  deliveryId: "7a788b36-06d0-4cd3-b8d6-ddf8eac07a15",
  locale: "es" as const,
  accountEmail: "person@example.com",
  careerStage: "changing_employment" as const,
  scoreResult: [
    { id: "technical", name: "Nombre no confiable", score: 31, mean: 6.2, rank: 2 },
    { id: "management", name: "Nombre no confiable", score: 29, mean: 5.8, rank: 3 },
    { id: "autonomy", name: "Nombre no confiable", score: 34, mean: 6.8, rank: 1 },
    { id: "security", name: "Nombre no confiable", score: 25, mean: 5, rank: 4 },
    { id: "entrepreneurial", name: "Nombre no confiable", score: 22, mean: 4.4, rank: 5 },
    { id: "service", name: "Nombre no confiable", score: 19, mean: 3.8, rank: 6 },
    { id: "challenge", name: "Nombre no confiable", score: 16, mean: 3.2, rank: 7 },
    { id: "lifestyle", name: "Nombre no confiable", score: 13, mean: 2.6, rank: 8 },
  ],
  resultBase: {
    mode: "fallback" as const,
    title: "Una lectura situada",
    summary: "Resumen determinístico completo.",
    tensions: ["Una tensión relevante."],
    reflectionQuestions: ["Pregunta 1", "Pregunta 2", "Pregunta 3"],
    stageConnection: "Conexión con el momento profesional.",
    relevantServices: [
      {
        slug: "/transiciones-laborales/cambiar-empleo" as const,
        label: "Cambio de empleo",
        reason: "Ordenar alternativas.",
      },
    ],
    nextSteps: ["Paso 1", "Paso 2", "Paso 3"],
  },
};

describe("sendCareerAnchorReportEmail", () => {
  beforeEach(() => {
    vi.stubEnv("SMTP_HOST", "mail.privateemail.com");
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_USER", "hola@universosenda.com");
    vi.stubEnv("SMTP_PASSWORD", "test-only-password");
    mocks.sendMail.mockReset().mockResolvedValue({
      accepted: ["person@example.com"],
      rejected: [],
      messageId: "<provider-message@universosenda.com>",
    });
    mocks.createTransport.mockReset().mockReturnValue({ sendMail: mocks.sendMail });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("sends branded HTML and text to the authenticated account address", async () => {
    await expect(sendCareerAnchorReportEmail(input)).resolves.toEqual({
      messageId: "<provider-message@universosenda.com>",
    });

    expect(mocks.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "mail.privateemail.com",
        port: 465,
        secure: true,
        auth: { user: "hola@universosenda.com", pass: "test-only-password" },
      }),
    );
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { name: "Senda", address: "hola@universosenda.com" },
        to: "person@example.com",
        replyTo: { name: "Equipo Senda", address: "hola@universosenda.com" },
        subject: "Tu resultado de Anclas de Carrera está listo | Senda",
        text: expect.stringContaining("Por privacidad"),
        html: expect.stringContaining("Ver mi resultado privado"),
        messageId: expect.stringMatching(/^<career-anchor-[a-f0-9]{40}@universosenda\.com>$/),
      }),
    );
  });

  it("rejects invalid recipients before opening an SMTP connection", async () => {
    await expect(
      sendCareerAnchorReportEmail({ ...input, recipient: "invalid-address" }),
    ).rejects.toBeInstanceOf(CareerAnchorReportEmailRecipientError);
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("fails safely for missing SMTP configuration or a rejected recipient", async () => {
    vi.stubEnv("SMTP_PASSWORD", "");
    await expect(sendCareerAnchorReportEmail(input)).rejects.toBeInstanceOf(
      CareerAnchorReportEmailConfigurationError,
    );

    vi.stubEnv("SMTP_PASSWORD", "test-only-password");
    mocks.sendMail.mockResolvedValueOnce({ accepted: [], rejected: ["person@example.com"] });
    await expect(sendCareerAnchorReportEmail(input)).rejects.toBeInstanceOf(
      CareerAnchorReportEmailDeliveryError,
    );
  });
});

describe("sendCareerAnchorInternalResultEmail", () => {
  beforeEach(() => {
    vi.stubEnv("SMTP_HOST", "mail.privateemail.com");
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_USER", "hola@universosenda.com");
    vi.stubEnv("SMTP_PASSWORD", "test-only-password");
    mocks.sendMail.mockReset().mockResolvedValue({
      accepted: ["equipo-one@universosenda.com"],
      rejected: [],
      messageId: "<provider-internal@universosenda.com>",
    });
    mocks.createTransport.mockReset().mockReturnValue({ sendMail: mocks.sendMail });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("sends one complete internal result to one recipient with the shared SMTP contract", async () => {
    await expect(sendCareerAnchorInternalResultEmail(internalInput)).resolves.toEqual({
      messageId: "<provider-internal@universosenda.com>",
    });

    expect(mocks.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "mail.privateemail.com",
        port: 465,
        secure: true,
        auth: { user: "hola@universosenda.com", pass: "test-only-password" },
      }),
    );
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    const message = mocks.sendMail.mock.calls[0]?.[0];
    expect(message).toEqual(
      expect.objectContaining({
        from: { name: "Senda", address: "hola@universosenda.com" },
        to: "equipo-one@universosenda.com",
        replyTo: { name: "Equipo Senda", address: "hola@universosenda.com" },
        subject: "Resultado interno de Anclas de Carrera | Senda",
        text: expect.stringContaining("Cuenta: person@example.com"),
        html: expect.stringContaining("Devolución determinística completa"),
        messageId: expect.stringMatching(/^<career-anchor-[a-f0-9]{40}@universosenda\.com>$/),
      }),
    );
    expect(message).not.toHaveProperty("cc");
    expect(message).not.toHaveProperty("bcc");
    expect(Array.isArray(message?.to)).toBe(false);
  });

  it("uses a stable Message-ID for retries of the same individual delivery", async () => {
    await sendCareerAnchorInternalResultEmail(internalInput);
    await sendCareerAnchorInternalResultEmail(internalInput);

    expect(mocks.sendMail.mock.calls[0]?.[0]?.messageId).toBe(
      mocks.sendMail.mock.calls[1]?.[0]?.messageId,
    );
  });

  it("rejects a multi-address recipient before opening an SMTP connection", async () => {
    await expect(
      sendCareerAnchorInternalResultEmail({
        ...internalInput,
        recipient: "equipo-one@universosenda.com,equipo-two@universosenda.com",
      }),
    ).rejects.toBeInstanceOf(CareerAnchorReportEmailRecipientError);
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });
});
