import type { SupabaseClient, User } from "@supabase/supabase-js";

export const DEFAULT_GOOGLE_CLIENT_ID =
  "1083979108762-kcq9jlvlqi15uj8sbcme1n312flfiaak.apps.googleusercontent.com";

export function readGoogleClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || DEFAULT_GOOGLE_CLIENT_ID;
}

function bytesToBase64Url(bytes: Uint8Array) {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createGoogleNonce() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = bytesToBase64Url(randomBytes);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(nonce));

  return {
    nonce,
    hashedNonce: bytesToHex(new Uint8Array(digest)),
  };
}

type GoogleCredentialHandler = (response: GoogleCredentialResponse) => void;

type GoogleIdentityInitialization = {
  nonce: string;
};

type GoogleIdentityInitializationState = {
  clientId: string;
  handler: GoogleCredentialHandler;
  promise: Promise<GoogleIdentityInitialization>;
};

export function createGoogleIdentityInitializer() {
  let state: GoogleIdentityInitializationState | null = null;

  return function initializeGoogleIdentityOnce(
    googleIdentity: GoogleIdentityServices["accounts"]["id"],
    clientId: string,
    handler: GoogleCredentialHandler,
  ) {
    if (state) {
      if (state.clientId !== clientId) {
        return Promise.reject(new Error("Google Identity Services was initialized with another client ID."));
      }

      // Client-side navigation can remount the login page. Keep Google's
      // single initialization, but always deliver a credential to the active
      // page instance rather than to an unmounted callback.
      state.handler = handler;
      return state.promise;
    }

    const nextState = {
      clientId,
      handler,
      promise: Promise.resolve({ nonce: "" }),
    } satisfies GoogleIdentityInitializationState;

    nextState.promise = (async () => {
      const { nonce, hashedNonce } = await createGoogleNonce();

      googleIdentity.disableAutoSelect();
      googleIdentity.initialize({
        client_id: clientId,
        callback: (response) => nextState.handler(response),
        nonce: hashedNonce,
        auto_select: false,
        button_auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        ux_mode: "popup",
      });

      return { nonce };
    })().catch((error) => {
      if (state === nextState) state = null;
      throw error;
    });

    state = nextState;
    return nextState.promise;
  };
}

export const initializeGoogleIdentityOnce = createGoogleIdentityInitializer();

export async function replaceSessionWithGoogleIdToken(
  supabase: SupabaseClient,
  credential: string,
  nonce: string,
): Promise<User> {
  // A login is an explicit account choice. Clear only this browser's prior
  // Senda session before accepting the newly selected Google identity.
  await supabase.auth.signOut({ scope: "local" });

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: credential,
    nonce,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Google sign-in completed without a user.");

  return data.user;
}
