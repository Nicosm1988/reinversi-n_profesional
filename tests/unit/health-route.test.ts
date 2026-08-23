import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/config", () => ({
  hasSupabaseAdminConfig: () => true,
  hasSupabasePublicConfig: () => true,
}));

import { GET } from "@/app/api/health/route";

const smtpEnvironment = {
  SMTP_HOST: "mail.privateemail.com",
  SMTP_PORT: "465",
  SMTP_USER: "hola@universosenda.com",
  SMTP_PASSWORD: "test-only-password",
  CONTACT_TO_EMAIL: "hola@universosenda.com",
  CRON_SECRET: "test-cron-secret-long-value",
};

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    for (const [name, value] of Object.entries(smtpEnvironment)) {
      vi.stubEnv(name, value);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports healthy only when contact SMTP is configured", async () => {
    const response = await GET(new Request("https://senda.example/api/health"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.contactSmtp).toBe(true);
    expect(body.checks.reportEmailCron).toBe(true);
  });

  it("reports degraded when contact SMTP is incomplete", async () => {
    vi.stubEnv("SMTP_PASSWORD", "");

    const response = await GET(new Request("https://senda.example/api/health"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.readiness.contactSmtp).toBe(false);
  });

  it("does not treat redacted secret placeholders as configured", async () => {
    vi.stubEnv("SMTP_PASSWORD", "[SENSITIVE]");

    const response = await GET(new Request("https://senda.example/api/health"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.readiness.contactSmtp).toBe(false);
  });
});
