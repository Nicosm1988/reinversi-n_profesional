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
