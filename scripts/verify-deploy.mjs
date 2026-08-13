#!/usr/bin/env node

const DEFAULT_TIMEOUT_MS = 12000;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "true";
    parsed[key] = value;
    if (value !== "true") i += 1;
  }

  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeoutMs, extraHeaders = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-request-id": `deploy-verify-${Date.now()}`,
        ...extraHeaders,
      },
      signal: controller.signal,
      redirect: "manual",
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function checkEndpoint(baseUrl, path, expectedStatuses) {
  const url = new URL(path, baseUrl).toString();
  const response = await fetchWithTimeout(url, DEFAULT_TIMEOUT_MS);
  const ok = expectedStatuses.includes(response.status);

  return {
    url,
    status: response.status,
    ok,
    expected: expectedStatuses.join(", "),
    headers: response.headers,
  };
}

async function checkAuthRedirect(baseUrl, path) {
  const check = await checkEndpoint(baseUrl, path, [307, 308]);
  const location = check.headers.get("location") ?? "";
  const redirectsToLogin = location.includes("/login") && location.includes("next=");

  return {
    ...check,
    ok: check.ok && redirectsToLogin,
    expected: "307/308 redirect to /login with next param",
  };
}

async function checkHealth(baseUrl) {
  const url = new URL("/api/health", baseUrl).toString();
  const diagnosticsToken = process.env.HEALTHCHECK_DIAGNOSTICS_TOKEN;
  const healthHeaders = diagnosticsToken ? { "x-health-token": diagnosticsToken } : {};
  const response = await fetchWithTimeout(url, DEFAULT_TIMEOUT_MS, healthHeaders);
  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const statusOk = response.status === 200;
  const payloadOk = body?.status === "ok";
  const checks = body?.checks ?? {};
  const hasChecks = typeof body?.checks === "object" && body?.checks !== null;
  const criticalChecksOk = !hasChecks || (
    Boolean(checks.supabase) &&
    Boolean(checks.supabaseAdmin) &&
    Boolean(checks.openai)
  );
  const hasRequestIdHeader = Boolean(response.headers.get("x-request-id"));

  return {
    url,
    status: response.status,
    ok: statusOk && payloadOk && criticalChecksOk && hasRequestIdHeader,
    details: body,
  };
}

async function main() {
  const args = parseArgs();
  const baseUrlInput = args["base-url"] ?? process.env.BASE_URL;

  if (!baseUrlInput) {
    console.error("Missing base URL. Use --base-url <url> or set BASE_URL.");
    process.exit(1);
  }

  let baseUrl;
  try {
    baseUrl = new URL(baseUrlInput).toString();
  } catch {
    console.error(`Invalid base URL: ${baseUrlInput}`);
    process.exit(1);
  }

  console.log(`Verifying deployment at ${baseUrl}`);

  const retries = Number(args.retries ?? 1);
  const retryDelayMs = Number(args["retry-delay-ms"] ?? 3000);

  let lastFailure = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    if (attempt > 1) {
      console.log(`Retrying (${attempt}/${retries})...`);
      await sleep(retryDelayMs);
    }

    const checks = [];
    checks.push(await checkEndpoint(baseUrl, "/", [200]));
    checks.push(await checkEndpoint(baseUrl, "/diagnostico", [200]));
    checks.push(await checkEndpoint(baseUrl, "/procesos/brujula", [200]));
    checks.push(await checkEndpoint(baseUrl, "/procesos/nueva-etapa-profesional", [200]));
    checks.push(await checkAuthRedirect(baseUrl, "/diagnostico/ancla-de-carrera"));
    checks.push(await checkEndpoint(baseUrl, "/contacto", [200]));
    checks.push(await checkEndpoint(baseUrl, "/login", [200]));
    checks.push(await checkEndpoint(baseUrl, "/api/health", [200]));

    const health = await checkHealth(baseUrl);
    checks.push({
      url: `${baseUrl} (health payload)`,
      status: health.status,
      ok: health.ok,
      expected: "HTTP 200 + payload status=ok (+ diagnostic checks if exposed)",
    });

    console.log("");
    for (const check of checks) {
      console.log(`${check.ok ? "OK" : "FAIL"} ${check.url} -> ${check.status} (expected: ${check.expected})`);
    }

    const homeCheck = checks.find((check) => check.url.endsWith("/"));
    if (homeCheck?.headers) {
      const xFrameOptions = homeCheck.headers.get("x-frame-options");
      if (xFrameOptions !== "DENY") {
        console.log(`FAIL security header x-frame-options on / (expected: DENY, got: ${xFrameOptions ?? "missing"})`);
        checks.push({
          url: `${baseUrl} (security headers)`,
          status: homeCheck.status,
          ok: false,
          expected: "x-frame-options=DENY",
        });
      }
    }

    if (health.details) {
      console.log(`Health payload: ${JSON.stringify(health.details)}`);
    }

    const hasFailures = checks.some((check) => !check.ok);
    if (!hasFailures) {
      console.log("\nDeployment verification passed.");
      return;
    }

    lastFailure = checks;
  }

  console.error("\nDeployment verification failed.");
  if (lastFailure) {
    const failed = lastFailure.filter((check) => !check.ok);
    for (const check of failed) {
      console.error(`- ${check.url} returned ${check.status} (expected: ${check.expected})`);
    }
  }
  process.exit(1);
}

main().catch((error) => {
  console.error(`Unexpected error during deployment verification: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
