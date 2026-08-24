import { describe, expect, it } from "vitest";
import {
  buildCareerAnchorInternalResultEmailContent,
  type CareerAnchorInternalResultEmailContentInput,
} from "@/lib/diagnostics/career-anchor-internal-result-email-content";

const scoreResult = [
  { id: "technical", name: "<img src=x onerror=alert(1)>", score: 31, mean: 6.2, rank: 2 },
  { id: "management", name: "Nombre manipulado", score: 29, mean: 5.8, rank: 3 },
  { id: "autonomy", name: "Nombre manipulado", score: 34, mean: 6.8, rank: 1 },
  { id: "security", name: "Nombre manipulado", score: 25, mean: 5, rank: 4 },
  { id: "entrepreneurial", name: "Nombre manipulado", score: 22, mean: 4.4, rank: 5 },
  { id: "service", name: "Nombre manipulado", score: 19, mean: 3.8, rank: 6 },
  { id: "challenge", name: "Nombre manipulado", score: 16, mean: 3.2, rank: 7 },
  { id: "lifestyle", name: "Nombre manipulado", score: 13, mean: 2.6, rank: 8 },
];

const input: CareerAnchorInternalResultEmailContentInput = {
  locale: "es",
  accountEmail: "Persona@Example.com",
  careerStage: "changing_employment",
  scoreResult,
  resultBase: {
    mode: "fallback",
    title: "Una lectura <segura> & situada",
    summary: "Tu ranking ofrece una orientación concreta sin convertirla en una etiqueta.",
    tensions: ["Autonomía & estabilidad pueden pedir decisiones distintas."],
    reflectionQuestions: [
      "¿Qué margen de decisión necesitás?",
      "¿Qué condiciones querés preservar?",
      "¿Qué conversación conviene abrir primero?",
    ],
    stageConnection: "En este cambio, <script>alert('x')</script> conviene mirar el contexto.",
    relevantServices: [
      {
        slug: "/transiciones-laborales/cambiar-empleo",
        label: "Cambio de empleo <acompañado>",
        reason: "Puede ayudar a ordenar opciones & próximos pasos.",
      },
    ],
    nextSteps: [
      "Registrar dos condiciones irrenunciables.",
      "Comparar alternativas con el ranking.",
      "Conversar con una persona de confianza.",
    ],
  },
};

describe("buildCareerAnchorInternalResultEmailContent", () => {
  it("renders all persisted scores in rank order with names hydrated from the Spanish catalog", () => {
    const content = buildCareerAnchorInternalResultEmailContent(input);

    expect(content.subject).toBe("Resultado interno de Anclas de Carrera | Senda");
    expect(content.text).toContain("Cuenta: persona@example.com");
    expect(content.text).toContain("Momento profesional: Preparar un cambio de empleo");
    expect(content.text).not.toContain("ID del diagnóstico");
    expect(content.text).not.toContain("Finalizado:");

    const expectedRanking = [
      ["Autonomía/Independencia", 34, "6,8"],
      ["Técnica/Funcional", 31, "6,2"],
      ["Dirección General", 29, "5,8"],
      ["Seguridad/Estabilidad", 25, "5"],
      ["Creatividad Emprendedora", 22, "4,4"],
      ["Servicio/Dedicación", 19, "3,8"],
      ["Desafío Puro", 16, "3,2"],
      ["Estilo de Vida", 13, "2,6"],
    ];
    expectedRanking.forEach(([name, score, mean], index) => {
      expect(content.text).toContain(
        `${index + 1}. ${name} — Puntaje: ${score} — Promedio: ${mean}`,
      );
    });
    expect(content.text.indexOf("1. Autonomía/Independencia")).toBeLessThan(
      content.text.indexOf("2. Técnica/Funcional"),
    );
    expect(content.text).not.toContain("Nombre manipulado");
    expect(content.text).not.toContain("<img src=x onerror=alert(1)>");
  });

  it("includes the complete deterministic interpretation and the privacy and orientation notices", () => {
    const content = buildCareerAnchorInternalResultEmailContent(input);

    expect(content.text).toContain(input.resultBase.title);
    expect(content.text).toContain(input.resultBase.summary);
    expect(content.text).toContain(input.resultBase.stageConnection);
    for (const tension of input.resultBase.tensions) expect(content.text).toContain(tension);
    for (const question of input.resultBase.reflectionQuestions) expect(content.text).toContain(question);
    for (const step of input.resultBase.nextSteps) expect(content.text).toContain(step);
    for (const service of input.resultBase.relevantServices) {
      expect(content.text).toContain(service.label);
      expect(content.text).toContain(service.slug);
      expect(content.text).toContain(service.reason);
    }
    expect(content.text).toContain("No constituye un diagnóstico clínico");
    expect(content.text).toContain("nunca las 40 respuestas individuales");
    expect(content.text).toContain("ni las selecciones finales de enunciados");
  });

  it("escapes every dynamic value in HTML", () => {
    const content = buildCareerAnchorInternalResultEmailContent(input);

    expect(content.html).not.toContain("<script>alert('x')</script>");
    expect(content.html).not.toContain("<img src=x onerror=alert(1)>");
    expect(content.html).toContain("Una lectura &lt;segura&gt; &amp; situada");
    expect(content.html).toContain("&lt;script&gt;alert(&#039;x&#039;)&lt;/script&gt;");
    expect(content.html).toContain("Cambio de empleo &lt;acompañado&gt;");
    expect(content.html).toContain("opciones &amp; próximos pasos");
  });

  it("localizes catalog names and score labels without trusting persisted names", () => {
    const content = buildCareerAnchorInternalResultEmailContent({
      ...input,
      locale: "en",
    });

    expect(content.text).toContain("1. Autonomy/Independence — Score: 34 — Mean: 6.8");
    expect(content.text).toContain("2. Technical/Functional Competence");
    expect(content.text).toContain("Professional stage: Prepare for a job change");
    expect(content.text).not.toContain("Diagnostic ID");
    expect(content.text).not.toContain("Completed:");
    expect(content.text).not.toContain("Nombre manipulado");
    expect(content.text).toContain("It is not a clinical diagnosis");
    expect(content.text).toContain("never the 40 individual responses");
  });

  it("rejects non-deterministic results and extra raw-answer data", () => {
    expect(() =>
      buildCareerAnchorInternalResultEmailContent({
        ...input,
        resultBase: { ...input.resultBase, mode: "ai" },
      }),
    ).toThrow(/deterministic fallback/i);

    expect(() =>
      buildCareerAnchorInternalResultEmailContent({
        ...input,
        rawAnswers: { answers: { "1": 6 }, bonus: [1, 2, 3] },
      } as CareerAnchorInternalResultEmailContentInput),
    ).toThrow();
  });
});
