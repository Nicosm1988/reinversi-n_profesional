#!/usr/bin/env node

function isPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateUrl(name, value, errors) {
  try {
    new URL(value);
  } catch {
    errors.push(`${name} must be a valid absolute URL.`);
  }
}

function getMode() {
  const strict = process.argv.includes("--strict");
  return { strict };
}

function main() {
  const { strict } = getMode();
  const errors = [];
  const warnings = [];

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
  ];

  for (const key of required) {
    if (!isPresent(process.env[key])) {
      errors.push(`Missing required env var: ${key}`);
    }
  }

  if (isPresent(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    validateUrl("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL, errors);
  }

  if (isPresent(process.env.NEXT_PUBLIC_SITE_URL)) {
    validateUrl("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL, errors);
  }

  const hasSupabaseServiceRole = isPresent(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabaseServiceRole) {
    const message = "SUPABASE_SERVICE_ROLE_KEY missing: server-backed forms will return 503.";
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  const hasUpstashUrl = isPresent(process.env.UPSTASH_REDIS_REST_URL);
  const hasUpstashToken = isPresent(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (hasUpstashUrl !== hasUpstashToken) {
    errors.push("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together.");
  }

  const hasTurnstileSite = isPresent(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const hasTurnstileSecret = isPresent(process.env.TURNSTILE_SECRET_KEY);
  const turnstileEnforced = process.env.TURNSTILE_ENFORCED === "true";

  if (hasTurnstileSite !== hasTurnstileSecret) {
    errors.push("NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY must be set together.");
  }

  if (turnstileEnforced && !hasTurnstileSecret) {
    errors.push("TURNSTILE_ENFORCED=true requires TURNSTILE_SECRET_KEY.");
  }

  if (!isPresent(process.env.OPENAI_API_KEY)) {
    const message = "OPENAI_API_KEY missing: AI diagnostics endpoint will return 503.";
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!hasUpstashUrl || !hasUpstashToken) {
    const message = "Upstash not configured: rate limit will run in memory only.";
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!hasTurnstileSite || !hasTurnstileSecret) {
    const message = "Turnstile not configured: captcha protection will be unavailable.";
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  console.log(`Mode: ${strict ? "strict" : "standard"}`);

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.error("\nEnvironment validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("\nEnvironment validation passed.");
}

main();
