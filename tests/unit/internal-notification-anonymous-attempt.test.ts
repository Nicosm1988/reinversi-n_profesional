import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/dist/compiled/server-only", () => ({}));

import {
  ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS,
  issueAnonymousCareerAnchorAttempt,
  verifyAnonymousCareerAnchorAttempt,
} from "@/lib/internal-notifications/anonymous-attempt";

const TEST_SECRET = "test-cron-secret-long-value";
const NOW = new Date("2026-08-23T15:00:00.000Z");

describe("anonymous career-anchor attempt proof", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", TEST_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("issues an opaque HMAC proof with a three-hour lifetime", () => {
    const issued = issueAnonymousCareerAnchorAttempt(NOW);
    expect(issued.ok).toBe(true);
    if (!issued.ok) return;

    expect(issued.token).not.toContain(issued.attemptId);
    expect(issued.expiresAt.getTime() - NOW.getTime()).toBe(
      ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS * 1_000,
    );
    expect(verifyAnonymousCareerAnchorAttempt(issued.token, NOW)).toEqual({
      ok: true,
      attemptId: issued.attemptId,
      expiresAt: issued.expiresAt,
    });
  });

  it("rejects tampering with either payload or signature", () => {
    const issued = issueAnonymousCareerAnchorAttempt(NOW);
    if (!issued.ok) throw new Error("test signing configuration unavailable");
    const [payload, signature] = issued.token.split(".");

    expect(
      verifyAnonymousCareerAnchorAttempt(`a${payload}.${signature}`, NOW),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      verifyAnonymousCareerAnchorAttempt(`${payload}.${signature}a`, NOW),
    ).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects expired proofs and proofs signed by another secret", () => {
    const issued = issueAnonymousCareerAnchorAttempt(NOW);
    if (!issued.ok) throw new Error("test signing configuration unavailable");

    const afterExpiry = new Date(
      NOW.getTime() + ANONYMOUS_CAREER_ANCHOR_ATTEMPT_TTL_SECONDS * 1_000,
    );
    expect(
      verifyAnonymousCareerAnchorAttempt(issued.token, afterExpiry),
    ).toEqual({ ok: false, reason: "expired" });

    vi.stubEnv("CRON_SECRET", "different-test-cron-secret");
    expect(verifyAnonymousCareerAnchorAttempt(issued.token, NOW)).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("fails closed when CRON_SECRET is unavailable or too short", () => {
    vi.stubEnv("CRON_SECRET", "short");

    expect(issueAnonymousCareerAnchorAttempt(NOW)).toEqual({
      ok: false,
      reason: "configuration",
    });
    expect(verifyAnonymousCareerAnchorAttempt("payload.signature", NOW)).toEqual({
      ok: false,
      reason: "configuration",
    });
  });
});
