import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  hasSupabasePublicConfig: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/supabase/config", () => ({
  hasSupabasePublicConfig: mocks.hasSupabasePublicConfig,
}));

import { getAuthenticatedUser } from "@/lib/supabase/auth";

function authUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-test-id",
    email: "person@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-08-24T12:00:00.000Z",
    identities: [],
    ...overrides,
  };
}

describe("getAuthenticatedUser", () => {
  beforeEach(() => {
    mocks.hasSupabasePublicConfig.mockReset().mockReturnValue(true);
    mocks.getUser.mockReset();
    mocks.createClient.mockReset().mockResolvedValue({
      auth: { getUser: mocks.getUser },
    });
  });

  it.each([
    authUser({ app_metadata: { provider: "google" } }),
    authUser({ app_metadata: { provider: "email", providers: ["email", "google"] } }),
    authUser({
      app_metadata: { provider: "email" },
      identities: [{ id: "identity-id", user_id: "user-test-id", provider: "google" }],
    }),
  ])("accepts a Google identity asserted by Supabase Auth", async (user) => {
    mocks.getUser.mockResolvedValueOnce({ data: { user }, error: null });

    const result = await getAuthenticatedUser();

    expect(result).toMatchObject({ ok: true, user });
    if (result.ok) {
      expect(result.supabase.auth.getUser).toBe(mocks.getUser);
    }
  });

  it("rejects a non-Google user even when editable user metadata claims Google", async () => {
    const user = authUser({
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { provider: "google" },
      identities: [{ id: "identity-id", user_id: "user-test-id", provider: "email" }],
    });
    mocks.getUser.mockResolvedValueOnce({ data: { user }, error: null });

    await expect(getAuthenticatedUser()).resolves.toEqual({
      ok: false,
      user: null,
      supabase: null,
      status: 401,
      reason: "auth-required",
    });
  });

  it("treats an absent session as authentication required", async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { name: "AuthSessionMissingError", message: "Auth session missing" },
    });

    await expect(getAuthenticatedUser()).resolves.toEqual({
      ok: false,
      user: null,
      supabase: null,
      status: 401,
      reason: "auth-required",
    });
  });

  it("maps a real Supabase Auth error to service unavailable", async () => {
    mocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { name: "AuthApiError", message: "upstream unavailable" },
    });

    await expect(getAuthenticatedUser()).resolves.toEqual({
      ok: false,
      user: null,
      supabase: null,
      status: 503,
      reason: "supabase-unavailable",
    });
  });

  it("fails closed when client creation or the Auth request throws", async () => {
    mocks.createClient.mockRejectedValueOnce(new Error("client initialization failed"));
    await expect(getAuthenticatedUser()).resolves.toMatchObject({
      ok: false,
      status: 503,
      reason: "supabase-unavailable",
    });

    mocks.getUser.mockRejectedValueOnce(new Error("network failed"));
    await expect(getAuthenticatedUser()).resolves.toMatchObject({
      ok: false,
      status: 503,
      reason: "supabase-unavailable",
    });
  });

  it("does not create a client when public Supabase configuration is absent", async () => {
    mocks.hasSupabasePublicConfig.mockReturnValueOnce(false);

    await expect(getAuthenticatedUser()).resolves.toMatchObject({
      ok: false,
      status: 503,
      reason: "supabase-unavailable",
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
