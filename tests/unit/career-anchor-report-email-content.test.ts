import { describe, expect, it } from "vitest";
import { buildCareerAnchorReportEmailContent } from "@/lib/diagnostics/career-anchor-report-email-content";

describe("buildCareerAnchorReportEmailContent", () => {
  it("builds a private Spanish notification without embedding the result", () => {
    const result = buildCareerAnchorReportEmailContent({
      locale: "es",
      reportUrl: "https://universosenda.com/panel#resultado",
    });

    expect(result.subject).toBe("Tu resultado de Anclas de Carrera está listo | Senda");
    expect(result.text).toContain("Por privacidad");
    expect(result.text).toContain("Ver mi resultado privado");
    expect(result.text).toContain("No constituye un diagnóstico clínico");
    expect(result.html).not.toContain("Dirección General");
    expect(result.html).not.toContain("ranking completo");
    expect(result.html).toContain('href="https://universosenda.com/panel#resultado"');
  });

  it("escapes the private report URL before using it in HTML", () => {
    const result = buildCareerAnchorReportEmailContent({
      locale: "en",
      reportUrl: 'https://universosenda.com/en/panel?next="<script>"',
    });

    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
    expect(result.html).toContain("&quot;");
  });
});
