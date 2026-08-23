#!/usr/bin/env node

const EXECUTE_CONFIRMATION = "SEND_QUEUED_REPORT_EMAILS";

function argumentValue(name, fallback) {
  const prefix = `--${name}=`;
  const argument = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : fallback;
}

function validSecret(value) {
  return Boolean(
    typeof value === "string"
      && value.trim().length >= 16
      && !/^\[(?:sensitive|redacted|hidden)\]$/i.test(value.trim()),
  );
}

async function main() {
  const execute = process.argv.includes("--execute");
  if (!execute) {
    console.log(JSON.stringify({ mode: "dry-run", invoked: false }));
    return;
  }

  if (argumentValue("confirm", "") !== EXECUTE_CONFIRMATION) {
    throw new Error(`Execution requires --confirm=${EXECUTE_CONFIRMATION}.`);
  }

  const baseUrlValue = argumentValue("base-url", process.env.NEXT_PUBLIC_SITE_URL ?? "");
  const secret = process.env.CRON_SECRET?.trim();
  if (!validSecret(secret)) throw new Error("CRON_SECRET must contain at least 16 characters.");

  let endpoint;
  try {
    endpoint = new URL("/api/cron/career-anchor-report-emails", baseUrlValue);
  } catch {
    throw new Error("A valid NEXT_PUBLIC_SITE_URL or --base-url is required.");
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: { authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({ ok: false }));
  if (!response.ok) {
    throw new Error(`Report email worker returned HTTP ${response.status}.`);
  }

  console.log(JSON.stringify({ mode: "execute", ...body }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Worker invocation failed.");
  process.exitCode = 1;
});
