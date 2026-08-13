import type { ContactSubmission } from "@/lib/contact/schema";

export function buildContactEmailText(
  submission: ContactSubmission,
  context: { date: Date; source: string },
) {
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
