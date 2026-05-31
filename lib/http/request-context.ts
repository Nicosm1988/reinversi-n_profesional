export function createRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function getRequestId(req: Request) {
  return req.headers.get("x-request-id") ?? createRequestId();
}

function isValidIPv4(ip: string) {
  const octets = ip.split(".");
  if (octets.length !== 4) return false;

  return octets.every((octet) => {
    if (!/^\d{1,3}$/.test(octet)) return false;
    const value = Number(octet);
    return value >= 0 && value <= 255;
  });
}

function isValidIPv6(ip: string) {
  // Covers compressed and full IPv6 forms.
  return /^[a-f0-9:]+$/i.test(ip) && ip.includes(":");
}

function normalizeIp(raw: string | null) {
  if (!raw) return null;

  let value = raw.trim().replace(/^for=/i, "").replace(/^"|"$/g, "");
  if (!value) return null;

  if (value.startsWith("[")) {
    const bracketEnd = value.indexOf("]");
    if (bracketEnd > 0) {
      value = value.slice(1, bracketEnd);
    }
  } else if (value.includes(":") && value.indexOf(":") === value.lastIndexOf(":")) {
    // IPv4 with port: 203.0.113.10:443
    value = value.split(":")[0] ?? value;
  }

  const normalized = value.toLowerCase();
  if (normalized === "unknown") return null;
  if (!isValidIPv4(normalized) && !isValidIPv6(normalized)) return null;

  return normalized;
}

function isPrivateIp(ip: string) {
  if (isValidIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }

  return ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:");
}

function pickIpFromForwardedHeader(headerValue: string | null) {
  if (!headerValue) return null;

  const candidates = headerValue
    .split(",")
    .map((entry) => normalizeIp(entry))
    .filter((entry): entry is string => Boolean(entry));

  if (candidates.length === 0) return null;

  // Prefer the nearest valid public entry (right-most); fallback to nearest valid private entry.
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const candidate = candidates[index];
    if (!isPrivateIp(candidate)) {
      return candidate;
    }
  }

  return candidates[candidates.length - 1] ?? null;
}

export function getClientIp(req: Request) {
  const directHeaders = [
    "cf-connecting-ip",
    "true-client-ip",
    "x-real-ip",
    "x-vercel-forwarded-for",
  ];

  for (const headerName of directHeaders) {
    const ip = normalizeIp(req.headers.get(headerName));
    if (ip) return ip;
  }

  const forwardedIp = pickIpFromForwardedHeader(req.headers.get("x-forwarded-for"));
  return forwardedIp ?? "unknown";
}
