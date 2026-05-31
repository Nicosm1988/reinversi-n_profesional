import { z } from "zod";

const turnstileResponseSchema = z.object({
  success: z.boolean(),
  action: z.string().optional(),
  hostname: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
});

export type TurnstileResult = {
  passed: boolean;
  skipped: boolean;
  errors: string[];
};

type VerifyTurnstileOptions = {
  expectedAction?: string;
  expectedHostname?: string;
};

function normalizeHostname(hostname: string | undefined) {
  return hostname?.trim().toLowerCase() ?? "";
}

function shouldEnforceTurnstile() {
  if (process.env.TURNSTILE_ENFORCED === "true") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

export async function verifyTurnstileToken(
  token: string | undefined,
  ip: string,
  options: VerifyTurnstileOptions = {},
): Promise<TurnstileResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  const enforce = shouldEnforceTurnstile();

  if (!secretKey) {
    if (enforce) {
      return { passed: false, skipped: false, errors: ["turnstile-secret-missing"] };
    }

    return { passed: true, skipped: true, errors: [] };
  }

  if (!token) {
    return { passed: false, skipped: false, errors: ["missing-input-response"] };
  }

  const body = new URLSearchParams();
  body.set("secret", secretKey);
  body.set("response", token);
  if (ip && ip !== "unknown") {
    body.set("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return { passed: false, skipped: false, errors: ["turnstile-http-error"] };
  }

  const json = await response.json();
  const parsed = turnstileResponseSchema.safeParse(json);

  if (!parsed.success) {
    return { passed: false, skipped: false, errors: ["turnstile-parse-error"] };
  }

  const expectedAction = options.expectedAction?.trim();
  if (expectedAction && parsed.data.action !== expectedAction) {
    return {
      passed: false,
      skipped: false,
      errors: [`unexpected-action:${parsed.data.action ?? "missing"}`],
    };
  }

  const expectedHostname = normalizeHostname(options.expectedHostname);
  const actualHostname = normalizeHostname(parsed.data.hostname);
  if (expectedHostname && actualHostname !== expectedHostname) {
    return {
      passed: false,
      skipped: false,
      errors: [`unexpected-hostname:${parsed.data.hostname ?? "missing"}`],
    };
  }

  return {
    passed: parsed.data.success,
    skipped: false,
    errors: parsed.data["error-codes"] ?? [],
  };
}
