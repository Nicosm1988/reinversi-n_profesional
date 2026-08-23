import { describe, expect, it } from "vitest";
import { buildCareerAnchorReportEmailContent } from "@/lib/diagnostics/career-anchor-report-email-content";

const ranking = [
  "Dirección General",
  "Creatividad Emprendedora",
  "Autonomía/Independencia",
  "Servicio/Dedicación",
  "Seguridad/Estabilidad",
  "Competencia Técnica/Funcional",
  "Puro Desafío",
  "Estilo de Vida",
].map((name, index) => ({ rank: index + 1, name }));

describe("buildCareerAnchorReportEmailContent", () => {
  it("builds a polished Spanish report with the highlighted top three and full ranking", () => {
    const result = buildCareerAnchorReportEmailContent({
      locale: "es",
      dominantAnchor: ranking[0]!.name,
      ranking,
      title: "Dirección General como punto de referencia",
      summary: "Una lectura cálida y prudente del resultado.",
      frictionAreas: ["Equilibrar dirección y autonomía.", "Evitar decisiones cerradas."],
      idealEcosystem: "Un entorno con objetivos claros y margen para decidir.",
      strategicQuestion: "¿Qué querés preservar en tu próximo paso?",
      reportUrl: "https://universosenda.com/panel#resultado",
    });

    expect(result.subject).toBe("Tu informe de Anclas de Carrera está listo | Senda");
    expect(result.text).toContain("Tus tres anclas más presentes:\n1. Dirección General");
    expect(result.text).toContain("Tu ranking completo:\n1. Dirección General");
    expect(result.text).toContain("8. Estilo de Vida");
    expect(result.text).toContain("No constituye un diagnóstico clínico");
    expect(result.html).toContain("Tus tres anclas más presentes");
    expect(result.html).toContain("Tu ranking completo");
    expect(result.html).toContain('href="https://universosenda.com/panel#resultado"');
    expect(result.html).not.toContain("determinística");
    expect(result.html).not.toContain("generación asistida");
  });

  it("escapes stored report values before using them in HTML", () => {
    const result = buildCareerAnchorReportEmailContent({
      locale: "en",
      dominantAnchor: "<script>alert(1)</script>",
      ranking: [{ rank: 1, name: '<img src=x onerror="alert(1)">' }],
      title: "A safe <reading>",
      summary: "Line one & line two",
      reportUrl: "https://universosenda.com/en/panel#resultado",
    });

    expect(result.html).not.toContain("<script>");
    expect(result.html).not.toContain("<img src=x");
    expect(result.html).toContain("&lt;script&gt;");
    expect(result.html).toContain("&amp;");
  });
});
