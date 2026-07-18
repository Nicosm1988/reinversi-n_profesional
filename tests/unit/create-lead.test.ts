import { describe, expect, it } from "vitest";
import { createLeadSchema, toLeadInsert } from "@/lib/leads/create-lead";

describe("createLeadSchema", () => {
  it("accepts a complete contact request and normalizes its email", () => {
    const parsed = createLeadSchema.parse({
      type: "contact",
      fullName: "  Persona Ejemplo  ",
      email: " Persona@Example.COM ",
      reason: "Consulta general",
      message: "Quisiera conversar con el equipo.",
      sourcePage: "/contacto",
      locale: "es",
      consentAccepted: true,
      captchaToken: "token",
    });

    expect(parsed.email).toBe("persona@example.com");
    expect(toLeadInsert(parsed, "user-id")).toMatchObject({
      user_id: "user-id",
      lead_type: "contact",
      full_name: "Persona Ejemplo",
      metadata: {},
    });
  });

  it("rejects unexpected metadata and fields", () => {
    const result = createLeadSchema.safeParse({
      type: "newsletter",
      email: "persona@example.com",
      consentAccepted: true,
      metadata: { channel: "footer-newsletter", privateNotes: "unexpected" },
      message: "not allowed",
    });

    expect(result.success).toBe(false);
  });

  it("requires the fields appropriate for each request type", () => {
    const contactWithoutMessage = createLeadSchema.safeParse({
      type: "contact",
      fullName: "Persona Ejemplo",
      email: "persona@example.com",
      reason: "Consulta",
      consentAccepted: true,
    });
    const newsletterWithName = createLeadSchema.safeParse({
      type: "newsletter",
      fullName: "Campo no solicitado",
      email: "persona@example.com",
      consentAccepted: true,
    });

    expect(contactWithoutMessage.success).toBe(false);
    expect(newsletterWithName.success).toBe(false);
  });

  it("rejects external or malformed source pages", () => {
    const result = createLeadSchema.safeParse({
      type: "newsletter",
      email: "persona@example.com",
      sourcePage: "https://attacker.example/path",
      consentAccepted: true,
    });

    expect(result.success).toBe(false);
  });
});
