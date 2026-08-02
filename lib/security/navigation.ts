export function sanitizeNextPath(nextValue: string | null, fallback = "/diagnostico/ancla-de-carrera") {
  if (!nextValue) return fallback;
  if (!nextValue.startsWith("/")) return fallback;
  if (nextValue.startsWith("//")) return fallback;
  if (/[\u0000-\u001F\u007F\\]/.test(nextValue)) return fallback;

  try {
    const baseUrl = new URL("https://senda.local");
    const targetUrl = new URL(nextValue, baseUrl);

    if (targetUrl.origin !== baseUrl.origin) return fallback;

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    return fallback;
  }
}
