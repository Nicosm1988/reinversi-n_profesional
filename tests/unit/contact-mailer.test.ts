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
  name: "Ana Pérez",
  phone: "+54 9 11 1234-5678",
  email: "ana@example.com",
  message: "Quisiera conversar sobre mi próximo paso.",
  consent: true as const,
  companyWebsite: "",
  sourcePage: "/contacto",
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
        text: expect.stringContaining("Origen: https://senda.example/contacto"),
      }),
    );
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
