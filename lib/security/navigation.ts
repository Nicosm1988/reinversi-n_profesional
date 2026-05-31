export function sanitizeNextPath(nextValue: string | null, fallback = "/diagnostico/ancla-de-carrera") {
  if (!nextValue) return fallback;
  if (!nextValue.startsWith("/")) return fallback;
  if (nextValue.startsWith("//")) return fallback;
  return nextValue;
}