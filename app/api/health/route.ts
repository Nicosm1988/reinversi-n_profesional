import { NextResponse } from "next/server";
import { getRequestId } from "@/lib/http/request-context";
import { hasSupabaseAdminConfig, hasSupabasePublicConfig } from "@/lib/supabase/config";

function hasSecret(name: string) {
  const value = process.env[name]?.trim();
  return Boolean(value && !/^\[(?:sensitive|redacted|hidden)\]$/i.test(value));
}

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const turnstileEnforced = process.env.TURNSTILE_ENFORCED === "true";
  const diagnosticsToken = process.env.HEALTHCHECK_DIAGNOSTICS_TOKEN?.trim();
  const isProduction = process.env.NODE_ENV === "production";
  const canExposeDiagnostics =
    !isProduction ||
    (Boolean(diagnosticsToken) && req.headers.get("x-health-token") === diagnosticsToken);

  const checks = {
    supabase: hasSupabasePublicConfig(),
    supabaseAdmin: hasSupabaseAdminConfig(),
    openai: hasSecret("OPENAI_API_KEY"),
    upstash: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    turnstile: Boolean(process.env.TURNSTILE_SECRET_KEY),
    contactSmtp: Boolean(
      hasSecret("SMTP_HOST")
        && hasSecret("SMTP_PORT")
        && hasSecret("SMTP_USER")
        && hasSecret("SMTP_PASSWORD")
        && hasSecret("CONTACT_TO_EMAIL"),
    ),
    reportEmailCron: Boolean(
      hasSecret("CRON_SECRET") && (process.env.CRON_SECRET?.trim().length ?? 0) >= 16,
    ),
  };

  const readiness = {
    supabase: checks.supabase,
    supabaseAdmin: checks.supabaseAdmin,
    openai: checks.openai,
    turnstile: turnstileEnforced ? checks.turnstile : true,
    contactSmtp: checks.contactSmtp,
    reportEmailCron: checks.reportEmailCron,
  };

  const healthy =
    readiness.supabase
    && readiness.supabaseAdmin
    && readiness.openai
    && readiness.turnstile
    && readiness.contactSmtp
    && readiness.reportEmailCron;
  const payload: Record<string, unknown> = {
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
  };

  if (canExposeDiagnostics) {
    payload.checks = checks;
    payload.readiness = readiness;
    payload.requirements = {
      turnstileEnforced,
    };
  }

  return NextResponse.json(
    payload,
    {
      status: healthy ? 200 : 503,
      headers: {
        "x-request-id": requestId,
        "cache-control": "no-store",
      },
    },
  );
}
