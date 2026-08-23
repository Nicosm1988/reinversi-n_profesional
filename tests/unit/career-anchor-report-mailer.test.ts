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
  sendCareerAnchorReportEmail,
} from "@/lib/diagnostics/career-anchor-report-mailer";

const input = {
  recipient: "person@example.com",
  deliveryId: "0fcd30d2-7d83-45a5-9854-23c18c5c31f1",
  locale: "es" as const,
  dominantAnchor: "Dirección General",
  ranking: Array.from({ length: 8 }, (_, index) => ({
    rank: index + 1,
    name: `Ancla ${index + 1}`,
  })),
  title: "Una lectura para seguir explorando",
  summary: "Tu resultado ofrece un punto de partida.",
  frictionAreas: ["Una tensión posible."],
  idealEcosystem: "Un entorno con objetivos claros.",
  strategicQuestion: "¿Qué querés preservar?",
  reportUrl: "https://universosenda.com/panel#resultado",
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
        subject: "Tu informe de Anclas de Carrera está listo | Senda",
        text: expect.stringContaining("Tu ranking completo"),
        html: expect.stringContaining("Tus tres anclas más presentes"),
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
