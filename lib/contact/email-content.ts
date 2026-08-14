import type { ContactSubmission } from "@/lib/contact/schema";

export function buildContactEmailText(
  submission: ContactSubmission,
  context: { date: Date; source: string },
) {
  if (submission.formOrigin === "laboratorio_nuevas_narrativas") {
    return [
      "Interés en el Laboratorio de Nuevas Narrativas Laborales",
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
