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
const spacingMs = spacingArg ? parseInt(spacingArg.split("=")[1], 10) : 15000;

const modelName = process.env.AI_MODEL_NAME || "gemini-3.5-flash-lite";

console.log(`=== PRESET RUNS (3x5 EVIDENCE) ===`);
console.log(`Target Model: ${modelName}`);
console.log(`Spacing: ${spacingMs} ms\n`);

const results = [];

for (const sample of samples) {
  console.log(`=== Starting runs for preset: ${sample.name} ===`);
  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`\nPreset: ${sample.name} | Attempt: ${attempt}/5`);
    const t0 = performance.now();
    let jsonValid = false;
    let guardrailPassed = false;
    let latencyMs = 0;
    let providerCalls = 1;

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
          data.incidentReport.lessonsLearned,
          data.prDescription.summary,
          ...data.prDescription.whatChanged,
          ...data.prDescription.howToCheck,
        ];
        const guardrailResult = checkFileNames(aiTexts, sample.input);
        guardrailPassed = guardrailResult.ok;
      }
    } catch {
      latencyMs = Math.round(performance.now() - t0);
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

    if (spacingMs > 0) {
      await new Promise((r) => setTimeout(r, spacingMs));
    }
  }
}

console.log("\n=== SUMMARY OF RUNS ===");
console.table(results);
