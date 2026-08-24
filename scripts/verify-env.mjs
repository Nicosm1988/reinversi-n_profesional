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

function looksLikeRedactedValue(value) {
  return /^\[(?:sensitive|redacted|hidden)\]$/i.test(value.trim());
}

function isIsoDateTime(value) {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value))
  );
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
    if (!isPresent(process.env[key]) || looksLikeRedactedValue(process.env[key])) {
      errors.push(`Missing required env var: ${key}`);
    }
  }

  if (isPresent(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    validateUrl("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL, errors);
  }

  if (isPresent(process.env.NEXT_PUBLIC_SITE_URL)) {
    validateUrl("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL, errors);
  }

  const hasSupabaseServiceRole =
    isPresent(process.env.SUPABASE_SERVICE_ROLE_KEY)
    && !looksLikeRedactedValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabaseServiceRole) {
    const message = "SUPABASE_SERVICE_ROLE_KEY missing: server-backed forms will return 503.";
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  const hasUpstashUrl =
    isPresent(process.env.UPSTASH_REDIS_REST_URL)
    && !looksLikeRedactedValue(process.env.UPSTASH_REDIS_REST_URL);
  const hasUpstashToken =
    isPresent(process.env.UPSTASH_REDIS_REST_TOKEN)
    && !looksLikeRedactedValue(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (hasUpstashUrl !== hasUpstashToken) {
    errors.push("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together.");
  }
  if (hasUpstashUrl) {
    validateUrl("UPSTASH_REDIS_REST_URL", process.env.UPSTASH_REDIS_REST_URL, errors);
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

  if (!isPresent(process.env.OPENAI_API_KEY) || looksLikeRedactedValue(process.env.OPENAI_API_KEY)) {
    const message =
      "OPENAI_API_KEY missing: AI-enhanced interpretation will use the deterministic fallback.";
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

  const smtpKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "CONTACT_TO_EMAIL"];
  const configuredSmtpKeys = smtpKeys.filter(
    (key) => isPresent(process.env[key]) && !looksLikeRedactedValue(process.env[key]),
  );
  if (configuredSmtpKeys.length > 0 && configuredSmtpKeys.length < smtpKeys.length) {
    errors.push("SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and CONTACT_TO_EMAIL must be set together.");
  } else if (configuredSmtpKeys.length === 0) {
    const message = "SMTP contact delivery is not configured: the contact form will return 503.";
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (isPresent(process.env.SMTP_PORT)) {
    const smtpPort = Number(process.env.SMTP_PORT);
    if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65_535) {
      errors.push("SMTP_PORT must be an integer between 1 and 65535.");
    }
  }

  if (isPresent(process.env.INTERNAL_NOTIFICATION_BATCH_SIZE)) {
    const notificationBatchSize = Number(process.env.INTERNAL_NOTIFICATION_BATCH_SIZE);
    if (
      !Number.isInteger(notificationBatchSize)
      || notificationBatchSize < 1
      || notificationBatchSize > 25
    ) {
      errors.push("INTERNAL_NOTIFICATION_BATCH_SIZE must be an integer between 1 and 25.");
    }
  }

  if (!isPresent(process.env.INTERNAL_NOTIFICATION_EMAILS)) {
    const message =
      "INTERNAL_NOTIFICATION_EMAILS missing: login and test-completion notifications are disabled.";
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  } else {
    const rawNotificationEmails = process.env.INTERNAL_NOTIFICATION_EMAILS
      .split(",")
      .map((email) => email.trim().toLowerCase());
    const notificationEmails = [...new Set(rawNotificationEmails)];
    const requiredNotificationEmails = [
      "hola@universosenda.com",
      "tanisardella@gmail.com",
    ];
    if (
      rawNotificationEmails.some((email) => email.length === 0)
      || notificationEmails.length < 1
      || notificationEmails.length > 5
      || notificationEmails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      errors.push("INTERNAL_NOTIFICATION_EMAILS must contain between 1 and 5 valid comma-separated emails.");
    } else if (requiredNotificationEmails.some((email) => !notificationEmails.includes(email))) {
      errors.push(
        "INTERNAL_NOTIFICATION_EMAILS must include hola@universosenda.com and tanisardella@gmail.com.",
      );
    }
  }

  if (isPresent(process.env.INTERNAL_NOTIFICATION_STARTED_AT)) {
    const notificationStartedAt = process.env.INTERNAL_NOTIFICATION_STARTED_AT.trim();
    if (!isIsoDateTime(notificationStartedAt)) {
      errors.push("INTERNAL_NOTIFICATION_STARTED_AT must be an ISO 8601 date-time with timezone.");
    } else if (Date.parse(notificationStartedAt) > Date.now() + 5 * 60 * 1_000) {
      errors.push("INTERNAL_NOTIFICATION_STARTED_AT cannot be in the future.");
    }
  }

  const hasCronSecret =
    isPresent(process.env.CRON_SECRET)
    && !looksLikeRedactedValue(process.env.CRON_SECRET);
  if (!hasCronSecret) {
    const message = "CRON_SECRET missing: queued report-email retries will not run securely.";
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  } else if (process.env.CRON_SECRET.trim().length < 16) {
    errors.push("CRON_SECRET must contain at least 16 characters.");
  }

  if (isPresent(process.env.REPORT_EMAIL_BATCH_SIZE)) {
    const batchSize = Number(process.env.REPORT_EMAIL_BATCH_SIZE);
    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 25) {
      errors.push("REPORT_EMAIL_BATCH_SIZE must be an integer between 1 and 25.");
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
