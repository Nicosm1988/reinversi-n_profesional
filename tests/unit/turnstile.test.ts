import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

const originalFetch = global.fetch;

afterEach(() => {
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.TURNSTILE_ENFORCED;
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("verifyTurnstileToken", () => {
  it("skips verification when secret key is not configured", async () => {
    const result = await verifyTurnstileToken(undefined, "127.0.0.1");
    expect(result.passed).toBe(true);
    expect(result.skipped).toBe(true);
  });

  it("fails when captcha is enforced and token is missing", async () => {
    process.env.TURNSTILE_SECRET_KEY = "dummy-secret";
    process.env.TURNSTILE_ENFORCED = "true";

    const result = await verifyTurnstileToken(undefined, "127.0.0.1");
    expect(result.passed).toBe(false);
    expect(result.skipped).toBe(false);
    expect(result.errors).toContain("missing-input-response");
  });

  it("fails when secret key is missing and captcha is enforced", async () => {
    process.env.TURNSTILE_ENFORCED = "true";

    const result = await verifyTurnstileToken("token", "127.0.0.1");
    expect(result.passed).toBe(false);
    expect(result.skipped).toBe(false);
    expect(result.errors).toContain("turnstile-secret-missing");
  });

  it("fails when action or hostname do not match", async () => {
    process.env.TURNSTILE_SECRET_KEY = "dummy-secret";
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          action: "wrong_action",
          hostname: "example.com",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    ) as typeof fetch;

    const result = await verifyTurnstileToken("token", "127.0.0.1", {
      expectedAction: "lead_contact",
      expectedHostname: "example.com",
    });

    expect(result.passed).toBe(false);
    expect(result.skipped).toBe(false);
    expect(result.errors).toContain("unexpected-action:wrong_action");
  });

  it("passes when Turnstile response matches expected action and hostname", async () => {
    process.env.TURNSTILE_SECRET_KEY = "dummy-secret";
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          action: "lead_contact",
          hostname: "example.com",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    ) as typeof fetch;

    const result = await verifyTurnstileToken("token", "127.0.0.1", {
      expectedAction: "lead_contact",
      expectedHostname: "example.com",
    });

    expect(result.passed).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.errors).toHaveLength(0);
  });
});
