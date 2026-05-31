import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

function createRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  const requestId = request.headers.get("x-request-id") ?? createRequestId();

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(es|en)/:path*",
    "/((?!api|auth|_next|_vercel|.*\\..*).*)",
  ],
};