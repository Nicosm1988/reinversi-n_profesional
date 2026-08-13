export const CONTACT_REQUEST_HEADER = "x-senda-form";
export const CONTACT_REQUEST_HEADER_VALUE = "contact";

export type ContactRequestCheck =
  | { ok: true; origin: string }
  | { ok: false; reason: "custom-header" | "cross-origin" | "missing-origin" };

export function checkContactRequest(req: Request): ContactRequestCheck {
  if (req.headers.get(CONTACT_REQUEST_HEADER) !== CONTACT_REQUEST_HEADER_VALUE) {
    return { ok: false, reason: "custom-header" };
  }

  const origin = req.headers.get("origin");
  if (!origin) {
    return { ok: false, reason: "missing-origin" };
  }

  let requestOrigin: string;
  let normalizedOrigin: string;

  try {
    requestOrigin = new URL(req.url).origin;
    normalizedOrigin = new URL(origin).origin;
  } catch {
    return { ok: false, reason: "cross-origin" };
  }

  const fetchSite = req.headers.get("sec-fetch-site");
  if (
    normalizedOrigin !== requestOrigin ||
    (fetchSite !== null && fetchSite !== "same-origin" && fetchSite !== "same-site")
  ) {
    return { ok: false, reason: "cross-origin" };
  }

  return { ok: true, origin: normalizedOrigin };
}
