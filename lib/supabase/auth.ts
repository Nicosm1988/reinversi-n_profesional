import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type AuthenticatedUserResult =
  | {
      ok: true;
      user: User;
      supabase: SupabaseServerClient;
    }
  | {
      ok: false;
      user: null;
      supabase: null;
      status: 401 | 503;
      reason: "supabase-unavailable" | "auth-required";
    };

function hasGoogleIdentity(user: User) {
  // app_metadata and identities come from Supabase Auth. Do not trust the
  // user-editable user_metadata when enforcing the allowed identity provider.
  const providers = user.app_metadata?.providers;
  const identities = user.identities;

  if (user.is_anonymous) return false;

  return (
    user.app_metadata?.provider === "google" ||
    (Array.isArray(providers) && providers.includes("google")) ||
    (Array.isArray(identities) &&
      identities.some((identity) => identity.provider === "google"))
  );
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUserResult> {
  if (!hasSupabasePublicConfig()) {
    return {
      ok: false,
      user: null,
      supabase: null,
      status: 503,
      reason: "supabase-unavailable",
    };
  }

  let supabase: SupabaseServerClient;
  try {
    supabase = await createClient();
  } catch {
    return {
      ok: false,
      user: null,
      supabase: null,
      status: 503,
      reason: "supabase-unavailable",
    };
  }

  let authResult: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    authResult = await supabase.auth.getUser();
  } catch {
    return {
      ok: false,
      user: null,
      supabase: null,
      status: 503,
      reason: "supabase-unavailable",
    };
  }

  const {
    data: { user },
    error,
  } = authResult;

  if (error && error.name !== "AuthSessionMissingError") {
    return {
      ok: false,
      user: null,
      supabase: null,
      status: 503,
      reason: "supabase-unavailable",
    };
  }

  if (!user || !hasGoogleIdentity(user)) {
    return {
      ok: false,
      user: null,
      supabase: null,
      status: 401,
      reason: "auth-required",
    };
  }

  return {
    ok: true,
    user,
    supabase,
  };
}
