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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
