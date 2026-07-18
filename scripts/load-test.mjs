#!/usr/bin/env node

const args = process.argv.slice(2);
const baseUrl = args.find((arg) => arg.startsWith("http"));
const durationSeconds = Number(args.find((arg) => arg.startsWith("--duration="))?.split("=")[1] ?? 10);
const concurrency = Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ?? 10);
const path = args.find((arg) => arg.startsWith("--path="))?.split("=")[1] ?? "/";
const allowProduction = args.includes("--allow-production");

if (!baseUrl) {
  throw new Error("Usage: node scripts/load-test.mjs <preview-url> [--duration=10] [--concurrency=10]");
}

const target = new URL(path, baseUrl);
if (target.hostname === "reinvension-profesional.vercel.app" && !allowProduction) {
  throw new Error("Production load tests require the explicit --allow-production flag.");
}
if (!Number.isFinite(durationSeconds) || durationSeconds < 1 || durationSeconds > 60) {
  throw new Error("Duration must be between 1 and 60 seconds.");
}
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 50) {
  throw new Error("Concurrency must be an integer between 1 and 50.");
}

const deadline = Date.now() + durationSeconds * 1000;
const latencies = [];
const statuses = new Map();

async function worker() {
  while (Date.now() < deadline) {
    const startedAt = performance.now();
    try {
      const response = await fetch(target, { cache: "no-store" });
      statuses.set(response.status, (statuses.get(response.status) ?? 0) + 1);
      await response.arrayBuffer();
    } catch {
      statuses.set(0, (statuses.get(0) ?? 0) + 1);
    }
    latencies.push(performance.now() - startedAt);
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
latencies.sort((a, b) => a - b);
const percentile = (value) => latencies[Math.min(Math.floor(latencies.length * value), latencies.length - 1)] ?? 0;

console.log(JSON.stringify({
  target: target.href,
  requests: latencies.length,
  requestsPerSecond: Math.round(latencies.length / durationSeconds),
  latencyMs: { p50: Math.round(percentile(0.5)), p95: Math.round(percentile(0.95)), p99: Math.round(percentile(0.99)) },
  statuses: Object.fromEntries(statuses),
}, null, 2));

if ([...statuses].some(([status]) => status === 0 || status >= 500)) process.exitCode = 1;
