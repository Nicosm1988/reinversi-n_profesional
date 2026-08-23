import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasSupabasePublicConfig: vi.fn(),
  createClient: vi.fn(),
  notifyAuthenticatedLogin: vi.fn(),
}));

vi.mock("@/lib/supabase/config", () => ({
  hasSupabasePublicConfig: mocks.hasSupabasePublicConfig,
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/internal-notifications/login", () => ({
  notifyAuthenticatedLogin: mocks.notifyAuthenticatedLogin,
}));

import { GET } from "@/app/auth/callback/route";

beforeEach(() => {
  mocks.hasSupabasePublicConfig.mockReset().mockReturnValue(false);
  mocks.createClient.mockReset();
  mocks.notifyAuthenticatedLogin.mockReset().mockResolvedValue({ ok: true });
});

afterEach(() => vi.restoreAllMocks());

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

  it("notifies after a successful legacy OAuth exchange without changing the redirect", async () => {
    mocks.hasSupabasePublicConfig.mockReturnValue(true);
    const user = { id: "user-id", email: "person@example.com" };
    const supabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({
          data: { user, session: {} },
          error: null,
        }),
      },
    };
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(
      new Request("https://universosenda.com/auth/callback?code=oauth-code&next=%2Fpanel"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://universosenda.com/panel");
    expect(mocks.notifyAuthenticatedLogin).toHaveBeenCalledWith({
      supabase,
      requestId: expect.any(String),
    });
  });
});
