import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendContactEmail: vi.fn(),
  limitRequest: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/contact/mailer", () => {
  class ContactConfigurationError extends Error {}
  class ContactDeliveryError extends Error {}

  return {
    ContactConfigurationError,
    ContactDeliveryError,
    sendContactEmail: mocks.sendContactEmail,
  };
});

vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limitRequest }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.logEvent }));

import { POST } from "@/app/api/contact/route";
import { ContactConfigurationError } from "@/lib/contact/mailer";
import { CONTACT_REQUEST_HEADER, CONTACT_REQUEST_HEADER_VALUE } from "@/lib/contact/request-security";

const VALID_BODY = {
  name: "Ana Pérez",
  phone: "+54 9 11 1234-5678",
  email: "ana@example.com",
  message: "Quisiera conversar sobre mi próximo paso.",
  consent: true,
  companyWebsite: "",
  sourcePage: "/contacto",
  locale: "es",
};

const VALID_LABORATORY_BODY = {
  formOrigin: "laboratorio_nuevas_narrativas",
  name: "Ana Pérez",
  email: "ana@example.com",
  explorationInterest: "Explorar nuevas formas de contar mi trayectoria.",
  consent: true,
  companyWebsite: "",
  sourcePage: "/laboratorio-nuevas-narrativas",
  locale: "es",
};

function contactRequest(body: unknown, overrides: Record<string, string> = {}) {
  return new Request("https://senda.example/api/contact", {
    method: "POST",
    headers: {
      origin: "https://senda.example",
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
      [CONTACT_REQUEST_HEADER]: CONTACT_REQUEST_HEADER_VALUE,
      ...overrides,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    mocks.sendContactEmail.mockReset().mockResolvedValue(undefined);
    mocks.limitRequest.mockReset().mockResolvedValue({
      limited: false,
      remaining: 4,
      resetAt: Date.now() + 60_000,
    });
    mocks.logEvent.mockReset();
  });

  it("returns success only after the mailer resolves", async () => {
    const response = await POST(contactRequest(VALID_BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.sendContactEmail).toHaveBeenCalledOnce();
    expect(mocks.sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({ formOrigin: "contacto" }),
      expect.objectContaining({ source: "https://senda.example/contacto" }),
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("reuses the endpoint for the exact laboratory origin without a message", async () => {
    const response = await POST(contactRequest(VALID_LABORATORY_BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        formOrigin: "laboratorio_nuevas_narrativas",
        phone: "",
        explorationInterest:
          "Explorar nuevas formas de contar mi trayectoria.",
      }),
      expect.objectContaining({
        source: "https://senda.example/laboratorio-nuevas-narrativas",
      }),
    );

    const parsedSubmission = mocks.sendContactEmail.mock.calls[0]?.[0];
    expect(parsedSubmission).not.toHaveProperty("message");
  });

  it("does not send email when the honeypot is populated", async () => {
    const response = await POST(contactRequest({ ...VALID_BODY, companyWebsite: "spam.example" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "invalid" });
    expect(mocks.sendContactEmail).not.toHaveBeenCalled();
  });

  it("reports a controlled failure when SMTP rejects or fails", async () => {
    mocks.sendContactEmail.mockRejectedValueOnce(new Error("private transport detail"));

    const response = await POST(contactRequest(VALID_BODY));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "send" });
    expect(mocks.logEvent).toHaveBeenCalledWith(
      "error",
      "contact.smtp_delivery_failed",
      expect.not.objectContaining({ email: expect.anything(), message: expect.anything() }),
    );
    const logged = JSON.stringify(mocks.logEvent.mock.calls);
    expect(logged).not.toContain("ana@example.com");
    expect(logged).not.toContain("Ana Pérez");
    expect(logged).not.toContain("Quisiera conversar sobre mi próximo paso.");
  });

  it("maps missing SMTP configuration to a closed 503 response", async () => {
    mocks.sendContactEmail.mockRejectedValueOnce(new ContactConfigurationError());

    const response = await POST(contactRequest(VALID_LABORATORY_BODY));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "config" });
    expect(JSON.stringify(mocks.logEvent.mock.calls)).not.toContain(
      VALID_LABORATORY_BODY.explorationInterest,
    );
  });

  it("rejects mismatched laboratory metadata and client-owned subjects", async () => {
    const mismatchedSource = await POST(
      contactRequest({
        ...VALID_LABORATORY_BODY,
        sourcePage: "/en/laboratorio-nuevas-narrativas",
      }),
    );
    const clientSubject = await POST(
      contactRequest({
        ...VALID_LABORATORY_BODY,
        subject: "Asunto inyectado",
      }),
    );

    expect(mismatchedSource.status).toBe(400);
    expect(clientSubject.status).toBe(400);
    expect(mocks.sendContactEmail).not.toHaveBeenCalled();
  });

  it("shares the existing contact rate-limit bucket across both origins", async () => {
    await POST(contactRequest(VALID_BODY));
    await POST(contactRequest(VALID_LABORATORY_BODY));

    expect(mocks.limitRequest).toHaveBeenCalledTimes(2);
    for (const [parameters] of mocks.limitRequest.mock.calls) {
      expect(parameters).toEqual(
        expect.objectContaining({
          prefix: "contact:send",
          limit: 5,
          windowMs: 10 * 60_000,
        }),
      );
    }
  });

  it("rejects cross-origin requests before rate limiting or SMTP", async () => {
    const response = await POST(
      contactRequest(VALID_BODY, {
        origin: "https://attacker.example",
        "sec-fetch-site": "cross-site",
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.limitRequest).not.toHaveBeenCalled();
    expect(mocks.sendContactEmail).not.toHaveBeenCalled();
  });
});
