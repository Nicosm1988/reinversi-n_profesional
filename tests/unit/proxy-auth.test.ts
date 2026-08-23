import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import proxy from "@/proxy";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

afterEach(() => {
  if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  if (originalSupabaseKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseKey;
});

describe("authentication-aware Proxy", () => {
  it("canonicalizes the legacy production hostname before any session can diverge", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://universosenda.com";
    const response = await proxy(
      new NextRequest("https://reinvension-profesional.vercel.app/panel?tab=result"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://universosenda.com/panel?tab=result",
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("marks localized responses private and non-cacheable even without Supabase", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await proxy(new NextRequest("https://universosenda.com/panel"));

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://universosenda.com/es/panel",
    );
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });
});
