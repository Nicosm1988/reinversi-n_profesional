import { afterEach, describe, expect, it } from "vitest";
import {
  hasSupabaseAdminConfig,
  hasSupabasePublicConfig,
  readSupabaseAdminConfig,
  readSupabasePublicConfig,
} from "@/lib/supabase/config";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe("supabase public config", () => {
  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    }

    if (originalKey === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    }

    if (originalServiceRole === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRole;
    }
  });

  it("returns null when env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(readSupabasePublicConfig()).toBeNull();
    expect(hasSupabasePublicConfig()).toBe(false);
  });

  it("returns trimmed config when env vars exist", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = " https://project.supabase.co ";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = " anon-key ";

    expect(readSupabasePublicConfig()).toEqual({
      url: "https://project.supabase.co",
      anonKey: "anon-key",
    });
    expect(hasSupabasePublicConfig()).toBe(true);
  });

  it("returns null admin config when service role key is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(readSupabaseAdminConfig()).toBeNull();
    expect(hasSupabaseAdminConfig()).toBe(false);
  });

  it("returns trimmed admin config when env vars exist", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = " https://project.supabase.co ";
    process.env.SUPABASE_SERVICE_ROLE_KEY = " service-role-key ";

    expect(readSupabaseAdminConfig()).toEqual({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-role-key",
    });
    expect(hasSupabaseAdminConfig()).toBe(true);
  });
});
