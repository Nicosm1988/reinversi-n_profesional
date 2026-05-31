import { createBrowserClient } from "@supabase/ssr";
import { readSupabasePublicConfig } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const config = readSupabasePublicConfig();
  if (!config) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(config.url, config.anonKey);
  }

  return browserClient;
}
