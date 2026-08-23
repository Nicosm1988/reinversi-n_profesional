import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  applySupabaseSessionRefresh,
  refreshSupabaseSession,
  type SupabaseSessionRefresh,
} from "@/lib/supabase/proxy";

const INTERNAL_REWRITE_HEADER = "x-senda-locale-rewrite";
const NEXT_INTL_LOCALE_HEADER = "X-NEXT-INTL-LOCALE";
const LEGACY_PRODUCTION_HOST = "reinvension-profesional.vercel.app";

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

function finalize(
  response: NextResponse,
  request: NextRequest,
  sessionRefresh: SupabaseSessionRefresh,
  locale?: "es" | "en",
) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("cache-control", "private, no-cache, no-store, must-revalidate, max-age=0");
  response.headers.set("expires", "0");
  response.headers.set("pragma", "no-cache");
  if (locale) response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
  return applySupabaseSessionRefresh(response, sessionRefresh);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const emptyRefresh: SupabaseSessionRefresh = { cookies: [], headers: new Headers() };

  if (request.nextUrl.hostname === LEGACY_PRODUCTION_HOST) {
    const destination = new URL(`${pathname}${request.nextUrl.search}`, getSiteUrl());
    return finalize(NextResponse.redirect(destination, 308), request, emptyRefresh);
  }

  const sessionRefresh = await refreshSupabaseSession(request);

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return finalize(NextResponse.next({ request }), request, sessionRefresh);
  }

  // The locale-free Spanish URL is internally rewritten to /es. The marker
  // prevents Next 16 from processing that rewrite as a fresh public request.
  if (request.headers.get(INTERNAL_REWRITE_HEADER) === "es") {
    return finalize(
      NextResponse.next({ request: { headers: getLocalizedRequestHeaders(request, "es") } }),
      request,
      sessionRefresh,
      "es",
    );
  }

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const canonicalPath = pathname.slice(3) || "/";
    const destination = new URL(`${canonicalPath}${request.nextUrl.search}`, request.url);
    return finalize(NextResponse.redirect(destination, 308), request, sessionRefresh, "es");
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return finalize(
      NextResponse.next({ request: { headers: getLocalizedRequestHeaders(request, "en") } }),
      request,
      sessionRefresh,
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
    sessionRefresh,
    "es",
  );
}

export const config = {
  matcher: "/((?!auth|_next|_vercel|.*\\..*).*)",
};
