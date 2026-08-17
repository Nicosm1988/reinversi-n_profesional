import type { ContactSubmission } from "@/lib/contact/schema";

export function buildContactEmailText(
  submission: ContactSubmission,
  context: { date: Date; source: string },
) {
  if (submission.formOrigin === "diagnostic_result") {
    return [
      "Resultado compartido voluntariamente desde Senda",
      "",
      `Nombre: ${submission.name}`,
      `Teléfono: ${submission.phone || "No informado"}`,
      `Correo: ${submission.email}`,
      `Preferencia de contacto: ${submission.preferredContact}`,
      `Fecha: ${context.date.toISOString()}`,
      `Idioma: ${submission.locale}`,
      `Consentimiento explícito: ${submission.consent ? "Sí" : "No"}`,
      `Origen: ${submission.formOrigin}`,
      `Página de origen: ${context.source}`,
      "",
      "Resultado orientativo:",
      `Cuestionario: ${submission.result.questionnaire}`,
      `Situación: ${submission.result.situation || "No informada"}`,
      `Recorrido recomendado: ${submission.result.recommendedService || "No informado"}`,
      `Alternativa secundaria: ${submission.result.alternativeService || "No informada"}`,
      `Anclas principales: ${submission.result.primaryAnchors?.join(", ") || "No informadas"}`,
      `Anclas secundarias: ${submission.result.secondaryAnchors?.join(", ") || "No informadas"}`,
      "",
      "Resumen:",
      submission.result.summary,
      "",
      "Mensaje opcional:",
      submission.message || "No informado",
    ].join("\n");
  }

  if (submission.formOrigin === "transiciones_laborales_interes") {
    return [
      "Interés en una transición laboral desde la web de Senda",
      "",
      `Servicio de interés: ${submission.service}`,
      `Nombre: ${submission.name}`,
      `Teléfono: ${submission.phone}`,
      `Correo: ${submission.email}`,
      `Fecha: ${context.date.toISOString()}`,
      `Origen: ${submission.formOrigin}`,
      `Página de origen: ${context.source}`,
    ].join("\n");
  }

  if (submission.formOrigin === "laboratorio_narrativas_laborales_alternativas") {
    return [
      "Interés en el Laboratorio de Narrativas Laborales Alternativas",
      "",
      `Nombre: ${submission.name}`,
      `Teléfono: ${submission.phone || "No informado"}`,
      `Correo: ${submission.email}`,
      `Fecha: ${context.date.toISOString()}`,
      `Origen: ${submission.formOrigin}`,
      `Página de origen: ${context.source}`,
      "",
      "Qué te interesa explorar:",
      submission.explorationInterest || "No informado",
    ].join("\n");
  }

  return [
    "Nueva consulta desde la web de Senda",
    "",
    `Nombre: ${submission.name}`,
    `Teléfono: ${submission.phone || "No informado"}`,
    `Correo: ${submission.email}`,
    `Fecha: ${context.date.toISOString()}`,
    `Origen: ${context.source}`,
    "",
    "Mensaje:",
    submission.message,
  ].join("\n");
}
