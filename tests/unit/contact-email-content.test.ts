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
        formOrigin: "laboratorio_narrativas_laborales_alternativas",
        name: "Ana Pérez",
        phone: "",
        email: "ana@example.com",
        explorationInterest: "Revisar cómo cuento mi experiencia laboral.",
        consent: true,
        companyWebsite: "",
        sourcePage: "/laboratorio-narrativas-laborales-alternativas",
        locale: "es",
      },
      {
        date: new Date("2026-08-13T01:30:00.000Z"),
        source: "https://senda.example/laboratorio-narrativas-laborales-alternativas",
      },
    );

    expect(text).toContain("Origen: laboratorio_narrativas_laborales_alternativas");
    expect(text).toContain(
      "Página de origen: https://senda.example/laboratorio-narrativas-laborales-alternativas",
    );
    expect(text).toContain(
      "Qué te interesa explorar:\nRevisar cómo cuento mi experiencia laboral.",
    );
    expect(text).not.toContain("Mensaje:");
  });

  it("marks an omitted laboratory exploration field as not provided", () => {
    const text = buildContactEmailText(
      {
        formOrigin: "laboratorio_narrativas_laborales_alternativas",
        name: "Ana Pérez",
        phone: "",
        email: "ana@example.com",
        explorationInterest: "",
        consent: true,
        companyWebsite: "",
        sourcePage: "/laboratorio-narrativas-laborales-alternativas",
        locale: "es",
      },
      {
        date: new Date("2026-08-13T01:30:00.000Z"),
        source: "https://senda.example/laboratorio-narrativas-laborales-alternativas",
      },
    );

    expect(text).toContain("Qué te interesa explorar:\nNo informado");
  });

  it("includes only the consented diagnostic summary and contact preference", () => {
    const text = buildContactEmailText(
      {
        formOrigin: "diagnostic_result",
        name: "Ana Pérez",
        phone: "",
        email: "ana@example.com",
        preferredContact: "email",
        message: "Quisiera conversar.",
        consent: true,
        companyWebsite: "",
        sourcePage: "/test-anclas-de-carrera",
        locale: "es",
        result: {
          questionnaire: "career_anchors",
          primaryAnchors: ["Autonomía/Independencia"],
          secondaryAnchors: ["Creatividad Emprendedora"],
          summary: "El resultado ofrece un mapa orientativo de motivaciones.",
        },
      },
      {
        date: new Date("2026-08-15T12:00:00.000Z"),
        source: "https://senda.example/test-anclas-de-carrera",
      },
    );

    expect(text).toContain("Cuestionario: career_anchors");
    expect(text).toContain("Anclas principales: Autonomía/Independencia");
    expect(text).toContain("Anclas secundarias: Creatividad Emprendedora");
    expect(text).toContain("Preferencia de contacto: email");
    expect(text).toContain("Fecha: 2026-08-15T12:00:00.000Z");
    expect(text).toContain("Idioma: es");
    expect(text).toContain("Consentimiento explícito: Sí");
    expect(text).not.toContain("rawAnswers");
  });
});
