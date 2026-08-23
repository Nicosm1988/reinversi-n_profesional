import {
  INTERNAL_NOTIFICATION_HEADER,
  INTERNAL_NOTIFICATION_HEADER_VALUES,
} from "@/lib/internal-notifications/protocol";

type InternalNotificationKind = keyof typeof INTERNAL_NOTIFICATION_HEADER_VALUES;

export type InternalNotificationRequestCheck =
  | { ok: true }
  | { ok: false; reason: "custom-header" | "cross-origin" | "missing-origin" };

function isLoopbackHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function isSameRequestOrigin(origin: string, requestUrl: string) {
  const originUrl = new URL(origin);
  const targetUrl = new URL(requestUrl);
  if (originUrl.origin === targetUrl.origin) return true;

  return isLoopbackHostname(originUrl.hostname)
    && isLoopbackHostname(targetUrl.hostname)
    && originUrl.protocol === targetUrl.protocol
    && originUrl.port === targetUrl.port;
}

export function checkInternalNotificationRequest(
  req: Request,
  kind: InternalNotificationKind,
): InternalNotificationRequestCheck {
  if (req.headers.get(INTERNAL_NOTIFICATION_HEADER) !== INTERNAL_NOTIFICATION_HEADER_VALUES[kind]) {
    return { ok: false, reason: "custom-header" };
  }

  const origin = req.headers.get("origin");
  if (!origin) return { ok: false, reason: "missing-origin" };

  try {
    if (!isSameRequestOrigin(origin, req.url)) {
      return { ok: false, reason: "cross-origin" };
    }
  } catch {
    return { ok: false, reason: "cross-origin" };
  }

  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite !== null && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return { ok: false, reason: "cross-origin" };
  }

  return { ok: true };
}
