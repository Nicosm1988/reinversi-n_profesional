import "server-only";
import { createClient } from "@supabase/supabase-js";
import { readSupabaseAdminConfig } from "@/lib/supabase/config";

export function createAdminClient() {
  const config = readSupabaseAdminConfig();
  if (!config) {
    throw new Error("Supabase service role environment variables are not configured.");
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
