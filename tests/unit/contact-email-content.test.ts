import { describe, expect, it } from "vitest";
import { buildContactEmailText } from "@/lib/contact/email-content";

describe("buildContactEmailText", () => {
  it("includes every required field, the server date and the form origin", () => {
    const text = buildContactEmailText(
      {
        name: "Ana Pérez",
        phone: "+54 9 11 1234-5678",
        email: "ana@example.com",
        message: "Quisiera conversar sobre mi próximo paso.",
        consent: true,
        companyWebsite: "",
        sourcePage: "/contacto",
        locale: "es",
      },
      {
        date: new Date("2026-08-13T01:30:00.000Z"),
        source: "https://senda.example/contacto",
      },
    );

    expect(text).toContain("Nombre: Ana Pérez");
    expect(text).toContain("Teléfono: +54 9 11 1234-5678");
    expect(text).toContain("Correo: ana@example.com");
    expect(text).toContain("Fecha: 2026-08-13T01:30:00.000Z");
    expect(text).toContain("Origen: https://senda.example/contacto");
    expect(text).toContain("Mensaje:\nQuisiera conversar sobre mi próximo paso.");
  });
});
