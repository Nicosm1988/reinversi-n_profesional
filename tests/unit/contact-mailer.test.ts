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
  ContactConfigurationError,
  ContactDeliveryError,
  sendContactEmail,
} from "@/lib/contact/mailer";

const SUBMISSION = {
  formOrigin: "contacto" as const,
  name: "Ana Pérez",
  phone: "+54 9 11 1234-5678",
  email: "ana@example.com",
  message: "Quisiera conversar sobre mi próximo paso.",
  consent: true as const,
  companyWebsite: "",
  sourcePage: "/contacto",
  locale: "es" as const,
};

const LABORATORY_SUBMISSION = {
  formOrigin: "laboratorio_narrativas_laborales_alternativas" as const,
  name: "Ana Pérez",
  phone: "",
  email: "ana@example.com",
  explorationInterest: "Explorar nuevas formas de contar mi trayectoria.",
  consent: true as const,
  companyWebsite: "",
  sourcePage: "/laboratorio-narrativas-laborales-alternativas" as const,
  locale: "es" as const,
};

const DIAGNOSTIC_RESULT_SUBMISSION = {
  formOrigin: "diagnostic_result" as const,
  name: "Ana Pérez",
  phone: "",
  email: "ana@example.com",
  preferredContact: "email" as const,
  message: "Quisiera conversar.",
  consent: true as const,
  companyWebsite: "",
  sourcePage: "/encontrar-mi-recorrido" as const,
  locale: "es" as const,
  result: {
    questionnaire: "route_finder" as const,
    recommendedService: "Explorar una nueva dirección profesional",
    summary: "Una lectura orientativa.",
  },
};

const CAREER_ANCHOR_CONTACT_SUBMISSION = {
  formOrigin: "career_anchor_contact" as const,
  name: "Ana Pérez",
  phone: "+54 9 11 1234-5678",
  email: "ana@example.com",
  preferredContact: "email" as const,
  message: "Quisiera conversar sobre mi resultado.",
  consent: true as const,
  companyWebsite: "",
  sourcePage: "/test-anclas-de-carrera" as const,
  locale: "es" as const,
};

describe("sendContactEmail", () => {
  beforeEach(() => {
    vi.stubEnv("SMTP_HOST", "mail.privateemail.com");
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_USER", "hola@universosenda.com");
    vi.stubEnv("SMTP_PASSWORD", "test-only-password");
    vi.stubEnv("CONTACT_TO_EMAIL", "hola@universosenda.com");
    mocks.sendMail.mockReset().mockResolvedValue({
      accepted: ["hola@universosenda.com"],
      rejected: [],
    });
    mocks.createTransport.mockReset().mockReturnValue({ sendMail: mocks.sendMail });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses private SSL SMTP and validated Reply-To data", async () => {
    await expect(
      sendContactEmail(SUBMISSION, {
        date: new Date("2026-08-13T01:30:00.000Z"),
        source: "https://senda.example/contacto",
      }),
    ).resolves.toBeUndefined();

    expect(mocks.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "mail.privateemail.com",
        port: 465,
        secure: true,
        auth: {
          user: "hola@universosenda.com",
          pass: "test-only-password",
        },
      }),
    );
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "hola@universosenda.com",
        replyTo: { name: "Ana Pérez", address: "ana@example.com" },
        subject: "Nueva consulta desde la web de Senda",
        text: expect.stringContaining("Origen: https://senda.example/contacto"),
      }),
    );
  });

  it("uses a server-owned laboratory subject with the same SMTP destination", async () => {
    await sendContactEmail(LABORATORY_SUBMISSION, {
      date: new Date("2026-08-13T01:30:00.000Z"),
      source: "https://senda.example/laboratorio-narrativas-laborales-alternativas",
    });

    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { name: "Senda web", address: "hola@universosenda.com" },
        to: "hola@universosenda.com",
        replyTo: { name: "Ana Pérez", address: "ana@example.com" },
        subject: "Interés en el Laboratorio de Narrativas Laborales Alternativas",
        text: expect.stringContaining(
          "Origen: laboratorio_narrativas_laborales_alternativas",
        ),
      }),
    );
  });

  it("uses a server-owned subject for a consented diagnostic result", async () => {
    await sendContactEmail(DIAGNOSTIC_RESULT_SUBMISSION, {
      date: new Date("2026-08-15T12:00:00.000Z"),
      source: "https://senda.example/encontrar-mi-recorrido",
    });

    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Resultado orientativo compartido desde Senda",
        text: expect.stringContaining("Cuestionario: route_finder"),
      }),
    );
  });

  it("uses a contact-only subject for Career Anchors without attaching a result", async () => {
    await sendContactEmail(CAREER_ANCHOR_CONTACT_SUBMISSION, {
      date: new Date("2026-08-24T12:00:00.000Z"),
      source: "https://senda.example/test-anclas-de-carrera",
    });

    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Solicitud de contacto sobre Anclas de Carrera",
        text: expect.stringContaining("Origen: career_anchor_contact"),
      }),
    );
    const message = mocks.sendMail.mock.calls[0]?.[0];
    expect(message?.text).not.toContain("Resultado orientativo:");
    expect(message?.text).not.toMatch(/Anclas principales|Anclas secundarias|Resumen:/);
  });

  it("fails closed when required SMTP configuration is missing", async () => {
    vi.stubEnv("SMTP_PASSWORD", "");

    await expect(
      sendContactEmail(SUBMISSION, {
        date: new Date(),
        source: "https://senda.example/contacto",
      }),
    ).rejects.toBeInstanceOf(ContactConfigurationError);
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("fails closed when a pulled secret is only a redacted placeholder", async () => {
    vi.stubEnv("SMTP_PASSWORD", "[SENSITIVE]");

    await expect(
      sendContactEmail(SUBMISSION, {
        date: new Date(),
        source: "https://senda.example/contacto",
      }),
    ).rejects.toBeInstanceOf(ContactConfigurationError);
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("does not report success when SMTP accepts no recipient", async () => {
    mocks.sendMail.mockResolvedValueOnce({
      accepted: [],
      rejected: ["hola@universosenda.com"],
    });

    await expect(
      sendContactEmail(SUBMISSION, {
        date: new Date(),
        source: "https://senda.example/contacto",
      }),
    ).rejects.toBeInstanceOf(ContactDeliveryError);
  });
});
