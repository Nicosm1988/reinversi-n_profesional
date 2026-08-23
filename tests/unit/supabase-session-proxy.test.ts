import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  publicConfig: {
    url: "https://project.supabase.co",
    anonKey: "public-anon-key",
  } as { url: string; anonKey: string } | null,
  createServerClient: vi.fn(),
  getClaims: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("@/lib/supabase/config", () => ({
  readSupabasePublicConfig: () => mocks.publicConfig,
}));

import {
  applySupabaseSessionRefresh,
  refreshSupabaseSession,
} from "@/lib/supabase/proxy";

describe("Supabase session refresh in Proxy", () => {
  beforeEach(() => {
    mocks.publicConfig = {
      url: "https://project.supabase.co",
      anonKey: "public-anon-key",
    };
    mocks.createServerClient.mockReset();
    mocks.getClaims.mockReset();

    mocks.createServerClient.mockImplementation((...args: unknown[]) => {
      const options = args[2] as {
        cookies: {
          setAll: (
            cookies: Array<{ name: string; value: string; options: { path: string } }>,
            headers: Record<string, string>,
          ) => void;
        };
      };

      mocks.getClaims.mockImplementationOnce(async () => {
        options.cookies.setAll(
          [{ name: "sb-project-auth-token", value: "fresh-session", options: { path: "/" } }],
          {
            "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
            Expires: "0",
            Pragma: "no-cache",
          },
        );
        return { data: { claims: { sub: "user-id" } }, error: null };
      });

      return { auth: { getClaims: mocks.getClaims } };
    });
  });

  it("validates claims and forwards refreshed cookies to request and response", async () => {
    const request = new NextRequest("https://universosenda.com/panel", {
      headers: { cookie: "sb-project-auth-token=stale-session" },
    });

    const refresh = await refreshSupabaseSession(request);
    const response = applySupabaseSessionRefresh(NextResponse.next(), refresh);

    expect(mocks.createServerClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "public-anon-key",
      expect.any(Object),
    );
    expect(mocks.getClaims).toHaveBeenCalledOnce();
    expect(request.cookies.get("sb-project-auth-token")?.value).toBe("fresh-session");
    expect(response.headers.get("set-cookie")).toContain(
      "sb-project-auth-token=fresh-session",
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it("is a no-op when Supabase is not configured", async () => {
    mocks.publicConfig = null;
    const request = new NextRequest("https://universosenda.com/");

    await expect(refreshSupabaseSession(request)).resolves.toMatchObject({ cookies: [] });
    expect(mocks.createServerClient).not.toHaveBeenCalled();
  });
});
