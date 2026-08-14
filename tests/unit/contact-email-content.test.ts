import { describe, expect, it } from "vitest";
import { buildContactEmailText } from "@/lib/contact/email-content";

describe("buildContactEmailText", () => {
  it("includes every required field, the server date and the form origin", () => {
    const text = buildContactEmailText(
      {
        formOrigin: "contacto",
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

  it("renders the exact laboratory origin and optional exploration field", () => {
    const text = buildContactEmailText(
      {
        formOrigin: "laboratorio_nuevas_narrativas",
        name: "Ana Pérez",
        phone: "",
        email: "ana@example.com",
        explorationInterest: "Revisar cómo cuento mi experiencia laboral.",
        consent: true,
        companyWebsite: "",
        sourcePage: "/laboratorio-nuevas-narrativas",
        locale: "es",
      },
      {
        date: new Date("2026-08-13T01:30:00.000Z"),
        source: "https://senda.example/laboratorio-nuevas-narrativas",
      },
    );

    expect(text).toContain("Origen: laboratorio_nuevas_narrativas");
    expect(text).toContain(
      "Página de origen: https://senda.example/laboratorio-nuevas-narrativas",
    );
    expect(text).toContain(
      "Qué te interesa explorar:\nRevisar cómo cuento mi experiencia laboral.",
    );
    expect(text).not.toContain("Mensaje:");
  });

  it("marks an omitted laboratory exploration field as not provided", () => {
    const text = buildContactEmailText(
      {
        formOrigin: "laboratorio_nuevas_narrativas",
        name: "Ana Pérez",
        phone: "",
        email: "ana@example.com",
        explorationInterest: "",
        consent: true,
        companyWebsite: "",
        sourcePage: "/laboratorio-nuevas-narrativas",
        locale: "es",
      },
      {
        date: new Date("2026-08-13T01:30:00.000Z"),
        source: "https://senda.example/laboratorio-nuevas-narrativas",
      },
    );

    expect(text).toContain("Qué te interesa explorar:\nNo informado");
  });
});
