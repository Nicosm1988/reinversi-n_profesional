import { NextResponse, type NextRequest } from "next/server";

const INTERNAL_REWRITE_HEADER = "x-senda-locale-rewrite";
const NEXT_INTL_LOCALE_HEADER = "X-NEXT-INTL-LOCALE";

function getLocalizedRequestHeaders(request: NextRequest, locale: "es" | "en") {
  const headers = new Headers(request.headers);
  headers.set(NEXT_INTL_LOCALE_HEADER, locale);
  return headers;
}

function createRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function finalize(response: NextResponse, request: NextRequest, locale: "es" | "en") {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
  return response;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The locale-free Spanish URL is internally rewritten to /es. The marker
  // prevents Next 16 from processing that rewrite as a fresh public request.
  if (request.headers.get(INTERNAL_REWRITE_HEADER) === "es") {
    return finalize(
      NextResponse.next({ request: { headers: getLocalizedRequestHeaders(request, "es") } }),
      request,
      "es",
    );
  }

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const canonicalPath = pathname.slice(3) || "/";
    const destination = new URL(`${canonicalPath}${request.nextUrl.search}`, request.url);
    return finalize(NextResponse.redirect(destination, 308), request, "es");
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return finalize(
      NextResponse.next({ request: { headers: getLocalizedRequestHeaders(request, "en") } }),
      request,
      "en",
    );
  }

  const requestHeaders = getLocalizedRequestHeaders(request, "es");
  requestHeaders.set(INTERNAL_REWRITE_HEADER, "es");
  const destination = request.nextUrl.clone();
  destination.pathname = `/es${pathname === "/" ? "" : pathname}`;

  return finalize(
    NextResponse.rewrite(destination, { request: { headers: requestHeaders } }),
    request,
    "es",
  );
}

export const config = {
  matcher: "/((?!api|auth|_next|_vercel|.*\\..*).*)",
};
