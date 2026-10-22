// scripts/model-probe.mjs
// Probe model availability across candidate Gemini models.
// Strictly non-secret: reads API key from environment, never prints key or input.

import { SYSTEM_PROMPT, formatUserPrompt } from "../src/lib/ai/index.ts";
import { lateNightHotfix } from "../src/samples/late-night-hotfix.ts";
import { worksOnMachine } from "../src/samples/works-on-machine.ts";

const spacingArg = process.argv.find((arg) => arg.startsWith("--spacing-ms="));
const spacingMs = spacingArg ? parseInt(spacingArg.split("=")[1], 10) : 8000;

const modelArgs = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const rawArg = modelArgs[0];
const models = rawArg
  ? rawArg.split(",").map((s) => s.trim()).filter(Boolean)
  : [
      "gemini-3.5-flash",
      "gemini-3.8-flash",
      "gemini-3.5-flash-lite",
      "gemini-2.5-flash",
    ];

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: Missing GEMINI_API_KEY in environment.");
  process.exit(1);
}

function calculateMedian(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return Math.round(sorted[mid]);
}

async function callModel(model, requestBody) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s individual timeout

  const t0 = performance.now();
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - t0);
    return { status: res.status, latency };
  } catch (err) {
    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - t0);
    return { status: 0, error: err.name || "Error", latency };
  }
}

async function runProbeSet(model, testType, makeBody, count = 6) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const body = makeBody();
    const res = await callModel(model, body);
    results.push(res);
    process.stdout.write(` [${i + 1}:${res.status || res.error}(${res.latency}ms)]`);
    if (i < count - 1 && spacingMs > 0) {
      await new Promise((r) => setTimeout(r, spacingMs));
    }
  }
  return results;
}

function summarizeResults(results) {
  let c200 = 0;
  let c503 = 0;
  let c429 = 0;
  let cOther = 0;
  const latencies = [];

  for (const r of results) {
    if (r.status === 200) c200++;
    else if (r.status === 503) c503++;
    else if (r.status === 429) c429++;
    else cOther++;
    latencies.push(r.latency);
  }

  const median = calculateMedian(latencies);
  const max = latencies.length > 0 ? Math.max(...latencies) : 0;
  return { c200, c503, c429, cOther, median, max };
}

console.log("=== MODEL AVAILABILITY PROBE ===");
console.log(`Candidate Models: ${models.join(", ")}`);
console.log(`Rounds per test: 6 calls each (minimal, late-night-hotfix, works-on-machine)`);
console.log(`Total per model: 18 calls sequential (1s delay, no retries)\n`);

const allSummaries = [];

for (const model of models) {
  console.log(`Probing: ${model}`);

  // (1) 6 calls minimal prompt
  process.stdout.write(`  [1/3] minimal: `);
  const minResults = await runProbeSet(model, "minimal", () => ({
    contents: [
      {
        role: "user",
        parts: [{ text: 'Return JSON {"ok":true}' }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  }));
  console.log(" done");

  // (2) 6 calls late-night-hotfix with real SYSTEM_PROMPT
  process.stdout.write(`  [2/3] late-night-hotfix: `);
  const hotfixResults = await runProbeSet(model, "late-night-hotfix", () => ({
    contents: [
      {
        role: "user",
        parts: [{ text: formatUserPrompt(lateNightHotfix) }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  }));
  console.log(" done");

  // (3) 6 calls works-on-machine with real SYSTEM_PROMPT
  process.stdout.write(`  [3/3] works-on-machine: `);
  const womResults = await runProbeSet(model, "works-on-machine", () => ({
    contents: [
      {
        role: "user",
        parts: [{ text: formatUserPrompt(worksOnMachine) }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  }));
  console.log(" done\n");

  const sMin = summarizeResults(minResults);
  const sHotfix = summarizeResults(hotfixResults);
  const sWom = summarizeResults(womResults);
  const sAll = summarizeResults([...minResults, ...hotfixResults, ...womResults]);

  allSummaries.push({
    model,
    rawCalls: [
      { jenis: "minimal", calls: minResults },
      { jenis: "late-night-hotfix", calls: hotfixResults },
      { jenis: "works-on-machine", calls: womResults },
    ],
    rows: [
      { jenis: "minimal", ...sMin },
      { jenis: "late-night-hotfix", ...sHotfix },
      { jenis: "works-on-machine", ...sWom },
      { jenis: "TOTAL", ...sAll },
    ],
  });
}

// Print final markdown table
console.log("\n### TABEL HASIL PROBE KETERSEDIAAN MODEL\n");
console.log(
  "| Model | Jenis | 200 | 503 | 429 | Lainnya | Median (ms) | Max (ms) |"
);
console.log(
  "| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |"
);

for (const s of allSummaries) {
  for (const r of s.rows) {
    const isTotal = r.jenis === "TOTAL";
    const bold = (txt) => (isTotal ? `**${txt}**` : txt);
    console.log(
      `| ${bold(s.model)} | ${bold(r.jenis)} | ${bold(r.c200)} | ${bold(
        r.c503
      )} | ${bold(r.c429)} | ${bold(r.cOther)} | ${bold(r.median)} | ${bold(
        r.max
      )} |`
    );
  }
}

console.log("\n### STATUS HTTP TIAP PANGGILAN MENTAH:\n");
for (const s of allSummaries) {
  console.log(`Model: ${s.model}`);
  for (const rc of s.rawCalls) {
    const callDetails = rc.calls
      .map((c, idx) => `#${idx + 1}:${c.status || c.error}(${c.latency}ms)`)
      .join(", ");
    console.log(`  - ${rc.jenis}: [${callDetails}]`);
  }
}
