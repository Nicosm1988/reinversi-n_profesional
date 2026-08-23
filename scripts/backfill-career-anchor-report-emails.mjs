#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const EXECUTE_CONFIRMATION = "BACKFILL_COMPLETED_REPORTS";

function argumentValue(name, fallback) {
  const prefix = `--${name}=`;
  const argument = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : fallback;
}

function presentSecret(value) {
  return Boolean(
    typeof value === "string"
      && value.trim().length > 0
      && !/^\[(?:sensitive|redacted|hidden)\]$/i.test(value.trim()),
  );
}

function readConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !presentSecret(serviceRoleKey)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  try {
    new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be an absolute URL.");
  }

  return { url, serviceRoleKey };
}

function readPositiveInteger(name, fallback, maximum) {
  const value = Number(argumentValue(name, String(fallback)));
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new Error(`--${name} must be an integer between 1 and ${maximum}.`);
  }
  return value;
}

async function invokeBackfill(client, { dryRun, limit }) {
  const { data, error } = await client.rpc("backfill_career_anchor_report_email_deliveries", {
    p_dry_run: dryRun,
    p_limit: limit,
  });
  if (error) {
    throw new Error(`Backfill RPC failed (${error.code ?? "database_error"}).`);
  }

  const result = Array.isArray(data) ? data[0] : data;
  const candidates = Number(result?.candidates ?? 0);
  const enqueued = Number(result?.enqueued ?? 0);
  if (!Number.isSafeInteger(candidates) || !Number.isSafeInteger(enqueued)) {
    throw new Error("Backfill RPC returned an invalid result.");
  }
  return { candidates, enqueued };
}

async function main() {
  const execute = process.argv.includes("--execute");
  const confirmation = argumentValue("confirm", "");
  const limit = readPositiveInteger("limit", 100, 1000);
  const maxBatches = readPositiveInteger("max-batches", 10, 100);

  if (execute && confirmation !== EXECUTE_CONFIRMATION) {
    throw new Error(`Execution requires --confirm=${EXECUTE_CONFIRMATION}.`);
  }

  const config = readConfig();
  const client = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  if (!execute) {
    const result = await invokeBackfill(client, { dryRun: true, limit });
    console.log(JSON.stringify({ mode: "dry-run", ...result }));
    return;
  }

  let totalEnqueued = 0;
  let remaining = 0;
  for (let batch = 0; batch < maxBatches; batch += 1) {
    const result = await invokeBackfill(client, { dryRun: false, limit });
    totalEnqueued += result.enqueued;
    remaining = Math.max(0, result.candidates - result.enqueued);
    if (result.enqueued === 0 || remaining === 0) break;
  }

  console.log(JSON.stringify({ mode: "execute", enqueued: totalEnqueued, remaining }));
  if (remaining > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Backfill failed.");
  process.exitCode = 1;
});
