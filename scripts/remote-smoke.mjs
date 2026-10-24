// scripts/remote-smoke.mjs
// Remote smoke test script for validating deployed target URL.
// Performs:
// 1. GET /api/health (status, latency, JSON ok:true check)
// 2. GET /app (status, latency, HTML page check)
// 3. POST /api/confess (status, latency, JSON schema check - ONLY if --with-live-confess is passed)
//
// Usage: node scripts/remote-smoke.mjs <BASE_URL> [--with-live-confess]

import { lateNightHotfix } from "../src/samples/index.ts";
import { ConfessResponseSchema } from "../src/lib/schema.ts";

const args = process.argv.slice(2);
const withLiveConfess = args.includes("--with-live-confess") || process.env.IZIN_LIVE === "1";
const urlArg = args.find((a) => !a.startsWith("--"));

const rawBaseUrl = urlArg || process.env.BASE_URL;

if (!rawBaseUrl) {
  console.error("Usage: node scripts/remote-smoke.mjs <BASE_URL> [--with-live-confess]");
  console.error("Example: node scripts/remote-smoke.mjs https://commit-confessional.example.com");
  process.exit(1);
}

const baseUrl = rawBaseUrl.replace(/\/+$/, "");

console.log(`=== REMOTE SMOKE TEST ===`);
console.log(`Target: ${baseUrl}`);
console.log(`Live POST Confess Allowed: ${withLiveConfess ? "YES" : "NO (GET only)"}\n`);

const results = [];

// 1. GET /api/health
console.log(`--- [1/3] GET /api/health ---`);
try {
  const t0 = performance.now();
  const res = await fetch(`${baseUrl}/api/health`, { method: "GET" });
  const latencyMs = Math.round(performance.now() - t0);
  let isValidJson = false;

  try {
    const data = await res.json();
    isValidJson = data && typeof data === "object" && data.ok === true;
  } catch {
    isValidJson = false;
  }

  console.log(`Status: ${res.status}`);
  console.log(`Latency: ${latencyMs} ms`);
  console.log(`JSON Valid (ok: true): ${isValidJson}`);

  results.push({
    endpoint: "GET /api/health",
    status: res.status,
    latencyMs,
    valid: isValidJson && res.status === 200,
  });
} catch (err) {
  console.error(`Request Failed: ${err instanceof Error ? err.message : String(err)}`);
  results.push({
    endpoint: "GET /api/health",
    status: "ERROR",
    latencyMs: 0,
    valid: false,
  });
}

// 2. GET /app
console.log(`\n--- [2/3] GET /app ---`);
try {
  const t0 = performance.now();
  const res = await fetch(`${baseUrl}/app`, { method: "GET" });
  const latencyMs = Math.round(performance.now() - t0);
  let isHtmlValid = false;

  try {
    const text = await res.text();
    isHtmlValid = text.includes("Commit Confessional");
  } catch {
    isHtmlValid = false;
  }

  console.log(`Status: ${res.status}`);
  console.log(`Latency: ${latencyMs} ms`);
  console.log(`HTML Valid (contains wordmark): ${isHtmlValid}`);

  results.push({
    endpoint: "GET /app",
    status: res.status,
    latencyMs,
    valid: isHtmlValid && res.status === 200,
  });
} catch (err) {
  console.error(`Request Failed: ${err instanceof Error ? err.message : String(err)}`);
  results.push({
    endpoint: "GET /app",
    status: "ERROR",
    latencyMs: 0,
    valid: false,
  });
}

// 3. POST /api/confess (Only if authorized)
console.log(`\n--- [3/3] POST /api/confess ---`);
if (!withLiveConfess) {
  console.log(`[INFO] POST /api/confess skipped (requires IZIN LIVE / --with-live-confess).`);
  results.push({
    endpoint: "POST /api/confess",
    status: "SKIPPED",
    latencyMs: 0,
    valid: true,
  });
} else {
  try {
    const t0 = performance.now();
    const res = await fetch(`${baseUrl}/api/confess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: lateNightHotfix }),
    });
    const latencyMs = Math.round(performance.now() - t0);
    let isValidJson = false;

    try {
      const data = await res.json();
      const parseResult = ConfessResponseSchema.safeParse(data);
      isValidJson = parseResult.success;
    } catch {
      isValidJson = false;
    }

    console.log(`Status: ${res.status}`);
    console.log(`Latency: ${latencyMs} ms`);
    console.log(`JSON Schema Valid: ${isValidJson}`);

    results.push({
      endpoint: "POST /api/confess",
      status: res.status,
      latencyMs,
      valid: isValidJson && res.status === 200,
    });
  } catch (err) {
    console.error(`Request Failed: ${err instanceof Error ? err.message : String(err)}`);
    results.push({
      endpoint: "POST /api/confess",
      status: "ERROR",
      latencyMs: 0,
      valid: false,
    });
  }
}

console.log("\n=== SMOKE TEST SUMMARY ===");
console.table(results);
