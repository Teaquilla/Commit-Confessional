// scripts/preset-runs.mjs
// Runs 3 preset samples 5 times each sequentially with spacing.
// Records real test outcomes to docs/evidence/preset-runs.md.
// Strictly non-secret output: does NOT print input content or secret keys.

import fs from "node:fs";
import path from "node:path";
import { handleConfess } from "../src/lib/confess.ts";
import {
  lateNightHotfix,
  rebaseConflict,
  worksOnMachine,
} from "../src/samples/index.ts";
import { checkFileNames } from "../src/lib/guardrails.ts";
import { lastHttpErrorDetails } from "../src/lib/ai/index.ts";

const samples = [
  { name: "late-night-hotfix", input: lateNightHotfix },
  { name: "rebase-conflict", input: rebaseConflict },
  { name: "works-on-machine", input: worksOnMachine },
];

const modelArg = process.argv.find((arg) => arg.startsWith("--model="));
if (modelArg) {
  process.env.AI_MODEL_NAME = modelArg.split("=")[1];
}

const spacingArg = process.argv.find((arg) => arg.startsWith("--spacing-ms="));
const spacingMs = spacingArg ? parseInt(spacingArg.split("=")[1], 10) : 6000;

const modelName = process.env.AI_MODEL_NAME || "gemini-3.5-flash-lite";

console.log(`=== PRESET RUNS (3x5 EVIDENCE) ===`);
console.log(`Target Model: ${modelName}`);
console.log(`Spacing: ${spacingMs} ms\n`);

const budgetFile = path.resolve(process.cwd(), "docs/evidence/call-budget.md");
const initialBudgetLines = fs.existsSync(budgetFile)
  ? fs.readFileSync(budgetFile, "utf8").split("\n").filter(Boolean).length
  : 0;

const results = [];
const sampleOutputs = {};
let stoppedEarlyOn429 = false;

outerLoop: for (const sample of samples) {
  console.log(`=== Starting runs for preset: ${sample.name} ===`);
  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`\nPreset: ${sample.name} | Attempt: ${attempt}/5`);
    const t0 = performance.now();
    let jsonValid = false;
    let guardrailPassed = false;
    let latencyMs = 0;

    try {
      const res = await handleConfess({ input: sample.input });
      latencyMs = Math.round(performance.now() - t0);

      if (res.status === 200 && res.data && "panicScore" in res.data) {
        jsonValid = true;
        const data = res.data;
        const aiTexts = [
          data.panicScore.aiAdjustmentReason,
          data.incidentReport.whatHappened,
          data.incidentReport.cause,
          data.incidentReport.fix,
          data.prDescription.summary,
          ...data.prDescription.whatChanged,
          ...data.prDescription.howToCheck,
        ];
        const guardrailResult = checkFileNames(aiTexts, sample.input);
        guardrailPassed = guardrailResult.ok;

        if (!sampleOutputs[sample.name]) {
          sampleOutputs[sample.name] = data;
        }
      } else {
        if (lastHttpErrorDetails?.status === 429) {
          console.log(
            `\n[STOP ON 429] status: ${lastHttpErrorDetails.status}, error.status: ${
              lastHttpErrorDetails.errorStatus || "undefined"
            }, retryDelay: ${lastHttpErrorDetails.retryDelay || "undefined"}`
          );
          stoppedEarlyOn429 = true;
          break outerLoop;
        }
      }
    } catch {
      latencyMs = Math.round(performance.now() - t0);
      if (lastHttpErrorDetails?.status === 429) {
        console.log(
          `\n[STOP ON 429] status: ${lastHttpErrorDetails.status}, error.status: ${
            lastHttpErrorDetails.errorStatus || "undefined"
          }, retryDelay: ${lastHttpErrorDetails.retryDelay || "undefined"}`
        );
        stoppedEarlyOn429 = true;
        break outerLoop;
      }
    }

    const todayDate = new Date().toISOString().split("T")[0];
    results.push({
      preset: sample.name,
      attempt,
      jsonValid,
      guardrailPassed,
      latencyMs,
      model: modelName,
      date: todayDate,
    });

    console.log(`  JSON Valid: ${jsonValid}`);
    console.log(`  Guardrail Passed: ${guardrailPassed}`);
    console.log(`  Latency: ${latencyMs} ms`);

    if (spacingMs > 0 && !(sample === samples[samples.length - 1] && attempt === 5)) {
      await new Promise((r) => setTimeout(r, spacingMs));
    }
  }
}

// Count provider calls and retries made during this execution
let providerCalls = 0;
let retryCalls = 0;
if (fs.existsSync(budgetFile)) {
  const currentLines = fs.readFileSync(budgetFile, "utf8").split("\n").filter(Boolean);
  const newLines = currentLines.slice(initialBudgetLines);
  for (const line of newLines) {
    if (line.includes(`| ${modelName} |`)) {
      providerCalls++;
      if (line.trim().endsWith("| true |")) {
        retryCalls++;
      }
    }
  }
}

console.log("\n=== SUMMARY OF RUNS ===");
console.table(results);

// Calculate summary per preset
const summaryByPreset = {};
for (const sample of samples) {
  const runs = results.filter((r) => r.preset === sample.name);
  const passedRuns = runs.filter((r) => r.jsonValid && r.guardrailPassed);
  const latencies = runs.map((r) => r.latencyMs).sort((a, b) => a - b);
  const medianLatency =
    latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : 0;
  const worstLatency =
    latencies.length > 0 ? latencies[latencies.length - 1] : 0;
  summaryByPreset[sample.name] = {
    totalRuns: runs.length,
    passedRuns: passedRuns.length,
    medianLatency,
    worstLatency,
  };
}

console.log("\n=== PRESET RUNS AGGREGATED SUMMARY ===");
console.log(
  JSON.stringify(
    {
      summaryByPreset,
      totalProviderCalls: providerCalls,
      totalRetryCalls: retryCalls,
      stoppedEarlyOn429,
    },
    null,
    2
  )
);

// Write to docs/evidence/preset-runs.md
const presetEvidencePath = path.resolve(
  process.cwd(),
  "docs/evidence/preset-runs.md"
);
let mdContent = `# Catatan Pengujian Preset (Preset Runs Evidence)

Dokumen ini mencatat bukti empiris pengujian keandalan model AI pada 3 sample diff bawaan (*late-night-hotfix*, *rebase-conflict*, *works-on-machine*).
Sesuai kriteria pemilihan model pada \`devpost/spec.md\` dan \`docs/decisions.md\` (DEC-004), model yang digunakan pada video demo dan materi README wajib lolos **5 kali berturut-turut** untuk masing-masing preset.

**Aturan Pengisian:** Tabel ini **hanya diisi dengan hasil pengujian nyata**, tanpa angka estimasi atau rekayasa data.

---

## Log Pengujian 3 Preset x 5 Percobaan

| Preset | Percobaan | JSON Valid | Lolos Guardrail | Latensi (ms) | Model | Tanggal |
|---|---|---|---|---|---|---|
`;

for (const r of results) {
  mdContent += `| ${r.preset} | ${r.attempt} | ${r.jsonValid ? "Ya" : "Tidak"} | ${
    r.guardrailPassed ? "Ya" : "Tidak"
  } | ${r.latencyMs} | ${r.model} | ${r.date} |\n`;
}

const totalTested = results.length;
const totalJsonValid = results.filter((r) => r.jsonValid).length;
const totalGuardrail = results.filter((r) => r.guardrailPassed).length;

mdContent += `
---

## Ringkasan & Keputusan Pemilihan Model
- **Model Terpilih:** ${modelName}
- **Total Percobaan Dieksekusi:** ${totalTested} dari 15
- **Tingkat Kelolosan JSON:** ${totalJsonValid} / ${totalTested} percobaan lolos
- **Tingkat Kelolosan Guardrail:** ${totalGuardrail} / ${totalTested} percobaan lolos
- **Total Panggilan Penyedia (Run Ini):** ${providerCalls}
- **Total Retry Aplikasi (Run Ini):** ${retryCalls}
- **Catatan & Temuan:**
${Object.entries(summaryByPreset)
  .map(
    ([name, s]) =>
      `  - **${name}**: ${s.passedRuns}/${s.totalRuns} lolos, median latensi: ${s.medianLatency} ms, latensi terburuk: ${s.worstLatency} ms.`
  )
  .join("\n")}
`;

fs.writeFileSync(presetEvidencePath, mdContent, "utf8");
console.log(`\nEvidence written to docs/evidence/preset-runs.md`);

// Print sample outputs
console.log("\n=== ONE COMPLETE OUTPUT PER SAMPLE ===");
for (const [name, data] of Object.entries(sampleOutputs)) {
  console.log(`\n--- [Complete Output: ${name}] ---`);
  console.log(JSON.stringify(data, null, 2));
}
