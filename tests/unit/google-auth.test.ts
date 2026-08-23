import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  DEFAULT_GOOGLE_CLIENT_ID,
  createGoogleIdentityInitializer,
  createGoogleNonce,
  readGoogleClientId,
  replaceSessionWithGoogleIdToken,
} from "@/lib/supabase/google";

const originalGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

afterEach(() => {
  if (originalGoogleClientId === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  else process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = originalGoogleClientId;
});

describe("Google ID-token authentication", () => {
  it("uses the production client id with an optional trimmed override", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    expect(readGoogleClientId()).toBe(DEFAULT_GOOGLE_CLIENT_ID);

    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = " custom-client.apps.googleusercontent.com ";
    expect(readGoogleClientId()).toBe("custom-client.apps.googleusercontent.com");
  });

  it("creates a cryptographically random nonce and the matching SHA-256 hash", async () => {
    const { nonce, hashedNonce } = await createGoogleNonce();
    const expectedDigest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(nonce),
    );
    const expectedHash = Array.from(
      new Uint8Array(expectedDigest),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");

    expect(nonce).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hashedNonce).toBe(expectedHash);
  });

  it("initializes Google once and routes credentials to the active page mount", async () => {
    const initializeOnce = createGoogleIdentityInitializer();
    const firstHandler = vi.fn();
    const activeHandler = vi.fn();
    let credentialCallback: ((response: GoogleCredentialResponse) => void) | undefined;
    const googleIdentity = {
      initialize: vi.fn((configuration: GoogleIdConfiguration) => {
        credentialCallback = configuration.callback;
      }),
      renderButton: vi.fn(),
      disableAutoSelect: vi.fn(),
      cancel: vi.fn(),
    } satisfies GoogleIdentityServices["accounts"]["id"];

    const firstMount = initializeOnce(googleIdentity, "client.apps.googleusercontent.com", firstHandler);
    const activeMount = initializeOnce(googleIdentity, "client.apps.googleusercontent.com", activeHandler);
    const [firstResult, activeResult] = await Promise.all([firstMount, activeMount]);

    expect(googleIdentity.initialize).toHaveBeenCalledTimes(1);
    expect(googleIdentity.disableAutoSelect).not.toHaveBeenCalled();
    expect(firstResult.nonce).toBe(activeResult.nonce);
    expect(googleIdentity.initialize).toHaveBeenCalledWith(expect.objectContaining({
      client_id: "client.apps.googleusercontent.com",
      auto_select: false,
      button_auto_select: false,
      ux_mode: "popup",
    }));

    credentialCallback?.({ credential: "selected-id-token" });
    expect(firstHandler).not.toHaveBeenCalled();
    expect(activeHandler).toHaveBeenCalledWith({ credential: "selected-id-token" });
  });

  it("clears the local Senda session before accepting the selected Google identity", async () => {
    const selectedUser = { id: "selected-user" } as User;
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const signInWithIdToken = vi.fn().mockResolvedValue({
      data: { user: selectedUser, session: {} },
      error: null,
    });
    const supabase = {
      auth: { signOut, signInWithIdToken },
    } as unknown as SupabaseClient;

    await expect(
      replaceSessionWithGoogleIdToken(supabase, "google-id-token", "raw-nonce"),
    ).resolves.toBe(selectedUser);

    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(signInWithIdToken).toHaveBeenCalledWith({
      provider: "google",
      token: "google-id-token",
      nonce: "raw-nonce",
    });
    expect(signOut.mock.invocationCallOrder[0]).toBeLessThan(
      signInWithIdToken.mock.invocationCallOrder[0],
    );
  });
});
