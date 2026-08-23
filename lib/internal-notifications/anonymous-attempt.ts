import "next/dist/compiled/server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = 1;
const TOKEN_DOMAIN = "senda:internal-notification:career-anchor-attempt:v1";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const HMAC_BYTES = 32;
const MAX_TOKEN_LENGTH = 512;
const MAX_CLOCK_SKEW_SECONDS = 60;
const REDACTED_SECRET_PATTERN = /^\[(?:sensitive|redacted|hidden)\]$/i;

export const ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE =
  "__Secure-senda-career-anchor-attempt";
export const ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE_PATH =
  "/api/internal-notifications/career-anchor-completed";
export const ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS = 3 * 60 * 60;

export const anonymousCareerAnchorAttemptCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: ANONYMOUS_CAREER_ANCHOR_ATTEMPT_COOKIE_PATH,
  maxAge: ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS,
  priority: "high" as const,
};

type AnonymousAttemptPayload = {
  v: typeof TOKEN_VERSION;
  attemptId: string;
  issuedAt: number;
  expiresAt: number;
};

export type IssuedAnonymousCareerAnchorAttempt =
  | {
      ok: true;
      attemptId: string;
      token: string;
      expiresAt: Date;
    }
  | { ok: false; reason: "configuration" };

export type VerifiedAnonymousCareerAnchorAttempt =
  | {
      ok: true;
      attemptId: string;
      expiresAt: Date;
    }
  | { ok: false; reason: "configuration" | "expired" | "invalid" };

function readSigningSecret() {
  const secret = process.env.CRON_SECRET?.trim();
  if (
    !secret
    || secret.length < 16
    || REDACTED_SECRET_PATTERN.test(secret)
  ) {
    return null;
  }

  return secret;
}

function signatureFor(payloadSegment: string, secret: string) {
  return createHmac("sha256", secret)
    .update(TOKEN_DOMAIN)
    .update("\0")
    .update(payloadSegment)
    .digest();
}

function encodePayload(payload: AnonymousAttemptPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(payloadSegment: string): AnonymousAttemptPayload | null {
  if (
    payloadSegment.length === 0
    || payloadSegment.length > MAX_TOKEN_LENGTH
    || !BASE64URL_PATTERN.test(payloadSegment)
  ) {
    return null;
  }

  try {
    const decoded = Buffer.from(payloadSegment, "base64url");
    if (decoded.toString("base64url") !== payloadSegment) return null;

    const value: unknown = JSON.parse(decoded.toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;

    const record = value as Record<string, unknown>;
    const expectedKeys = ["attemptId", "expiresAt", "issuedAt", "v"];
    const actualKeys = Object.keys(record).sort();
    if (
      actualKeys.length !== expectedKeys.length
      || actualKeys.some((key, index) => key !== expectedKeys[index])
      || record.v !== TOKEN_VERSION
      || typeof record.attemptId !== "string"
      || !UUID_PATTERN.test(record.attemptId)
      || !Number.isSafeInteger(record.issuedAt)
      || !Number.isSafeInteger(record.expiresAt)
    ) {
      return null;
    }

    return {
      v: TOKEN_VERSION,
      attemptId: record.attemptId,
      issuedAt: record.issuedAt as number,
      expiresAt: record.expiresAt as number,
    };
  } catch {
    return null;
  }
}

export function issueAnonymousCareerAnchorAttempt(
  now: Date = new Date(),
): IssuedAnonymousCareerAnchorAttempt {
  const secret = readSigningSecret();
  if (!secret) return { ok: false, reason: "configuration" };

  const issuedAt = Math.floor(now.getTime() / 1_000);
  const attemptId = randomUUID();
  const payloadSegment = encodePayload({
    v: TOKEN_VERSION,
    attemptId,
    issuedAt,
    expiresAt: issuedAt + ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS,
  });
  const signature = signatureFor(payloadSegment, secret).toString("base64url");

  return {
    ok: true,
    attemptId,
    token: `${payloadSegment}.${signature}`,
    expiresAt: new Date(
      (issuedAt + ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS) * 1_000,
    ),
  };
}

export function verifyAnonymousCareerAnchorAttempt(
  token: string,
  now: Date = new Date(),
): VerifiedAnonymousCareerAnchorAttempt {
  const secret = readSigningSecret();
  if (!secret) return { ok: false, reason: "configuration" };

  if (token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, reason: "invalid" };
  }

  const tokenParts = token.split(".");
  if (tokenParts.length !== 2) return { ok: false, reason: "invalid" };

  const [payloadSegment, signatureSegment] = tokenParts;
  if (
    !payloadSegment
    || !signatureSegment
    || !BASE64URL_PATTERN.test(signatureSegment)
  ) {
    return { ok: false, reason: "invalid" };
  }

  let providedSignature: Buffer;
  try {
    providedSignature = Buffer.from(signatureSegment, "base64url");
  } catch {
    return { ok: false, reason: "invalid" };
  }

  const expectedSignature = signatureFor(payloadSegment, secret);
  if (
    providedSignature.length !== HMAC_BYTES
    || providedSignature.toString("base64url") !== signatureSegment
    || !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    return { ok: false, reason: "invalid" };
  }

  const payload = decodePayload(payloadSegment);
  if (!payload) return { ok: false, reason: "invalid" };

  const nowSeconds = Math.floor(now.getTime() / 1_000);
  if (
    payload.expiresAt - payload.issuedAt
      !== ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS
    || payload.issuedAt > nowSeconds + MAX_CLOCK_SKEW_SECONDS
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (payload.expiresAt <= nowSeconds) {
    return { ok: false, reason: "expired" };
  }

  return {
    ok: true,
    attemptId: payload.attemptId,
    expiresAt: new Date(payload.expiresAt * 1_000),
  };
}
