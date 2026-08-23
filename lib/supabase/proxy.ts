import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";
import { logEvent } from "@/lib/observability/logger";
import { readSupabasePublicConfig } from "@/lib/supabase/config";

type CookieUpdate = {
  name: string;
  value: string;
  options: CookieOptions;
};

export type SupabaseSessionRefresh = {
  cookies: CookieUpdate[];
  headers: Headers;
};

export async function refreshSupabaseSession(
  request: NextRequest,
): Promise<SupabaseSessionRefresh> {
  const config = readSupabasePublicConfig();
  const cookies: CookieUpdate[] = [];
  const headers = new Headers();

  if (!config) return { cookies, headers };

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, responseHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookies.push(...cookiesToSet);
        Object.entries(responseHeaders).forEach(([name, value]) => headers.set(name, value));
      },
    },
  });

  // Keep this call immediately after client creation. It validates the JWT and
  // refreshes both the request and browser cookies before rendering continues.
  try {
    await supabase.auth.getClaims();
  } catch (error) {
    // Public Senda pages must remain available during an Auth outage. Protected
    // routes still validate the user independently with auth.getUser().
    logEvent("warn", "auth.session_refresh.failed", {
      message: error instanceof Error ? error.message : "unknown-error",
      pathname: request.nextUrl.pathname,
    });
  }

  return { cookies, headers };
}

export function applySupabaseSessionRefresh(
  response: NextResponse,
  refresh: SupabaseSessionRefresh,
) {
  refresh.cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  refresh.headers.forEach((value, name) => response.headers.set(name, value));

  return response;
}
