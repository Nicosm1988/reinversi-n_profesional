import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/config", () => ({
  hasSupabasePublicConfig: () => false,
}));

import { GET } from "@/app/auth/callback/route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /auth/callback", () => {
  it("never permits an authentication redirect response to be cached", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await GET(
      new Request("https://universosenda.com/auth/callback?next=%2Fpanel"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://universosenda.com/login?error=auth-callback-failed&reason=supabase-unavailable",
    );
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });
});
