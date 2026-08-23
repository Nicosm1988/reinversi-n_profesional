import type {
  InternalActivityAudience,
  InternalActivityType,
} from "@/lib/internal-notifications/types";

export type InternalNotificationContentInput = {
  type: InternalActivityType;
  audience: InternalActivityAudience;
  occurredAt: Date;
};

function formatArgentinaDate(date: Date) {
  const formatted = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return `${formatted} (hora de Argentina)`;
}

export function buildInternalNotificationContent(input: InternalNotificationContentInput) {
  const isLogin = input.type === "login";
  const subject = isLogin
    ? "Nuevo inicio de sesión en Senda"
    : "Una persona completó el test de Anclas de Carrera | Senda";
  const activity = isLogin
    ? "Inicio de sesión"
    : "Finalización del test de Anclas de Carrera";
  const account = input.audience === "anonymous"
    ? "Visitante anónimo"
    : "Cuenta autenticada";

  return {
    subject,
    text: [
      "Senda — notificación interna",
      "",
      `Actividad: ${activity}`,
      `Cuenta: ${account}`,
      `Fecha: ${formatArgentinaDate(input.occurredAt)}`,
    ].join("\n"),
  };
}
