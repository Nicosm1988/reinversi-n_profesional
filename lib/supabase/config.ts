export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export type SupabaseAdminConfig = {
  url: string;
  serviceRoleKey: string;
};

export function readSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function hasSupabasePublicConfig() {
  return readSupabasePublicConfig() !== null;
}

export function readSupabaseAdminConfig(): SupabaseAdminConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

export function hasSupabaseAdminConfig() {
  return readSupabaseAdminConfig() !== null;
}
