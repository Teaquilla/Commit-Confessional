// scripts/live-check.mjs
// Exploratory live check for 3 sample diffs against Gemini API.
// Strictly non-secret output: does NOT print input content or secret keys.

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

const modelName = process.env.AI_MODEL_NAME || "gemini-3.8-flash";
console.log(`=== LIVE CHECK (EKSPLORATORI, BUKAN BUKTI 3X5) ===`);
console.log(`Target Model: ${modelName}\n`);

for (const sample of samples) {
  console.log(`--- Sample: ${sample.name} ---`);
  const t0 = performance.now();
  try {
    const res = await handleConfess({ input: sample.input });
    const latencyMs = Math.round(performance.now() - t0);

    const isSuccess = res.status === 200;
    console.log(`Status: ${res.status}`);
    console.log(`Latency: ${latencyMs} ms`);

    if (isSuccess && res.data && "panicScore" in res.data) {
      const data = res.data;
      console.log(`Schema Valid: true`);

      // Check guardrail
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
      console.log(`Guardrail Passed: ${guardrailResult.ok}`);

      console.log(
        `Final Score: ${data.panicScore.finalScore} (Base: ${data.panicScore.baseScore}, Adj: ${data.panicScore.aiAdjustment})`
      );
      console.log(`Severity: ${data.panicScore.severity}`);

      // String lengths vs limits
      console.log(`String Lengths vs Limits:`);
      console.log(`  aiAdjustmentReason: ${data.panicScore.aiAdjustmentReason.length} / 240`);
      console.log(`  whatHappened:       ${data.incidentReport.whatHappened.length} / 300`);
      console.log(`  cause:              ${data.incidentReport.cause.length} / 300`);
      console.log(`  fix:                ${data.incidentReport.fix.length} / 300`);
      console.log(`  lessonsLearned:     ${data.incidentReport.lessonsLearned.length} / 300`);
      console.log(`  prSummary:          ${data.prDescription.summary.length} / 400`);

      const wcLens = data.prDescription.whatChanged.map((s) => s.length);
      console.log(`  whatChanged:        [${wcLens.join(", ")}] / max 200 each (count: ${wcLens.length}/4)`);

      const hcLens = data.prDescription.howToCheck.map((s) => s.length);
      console.log(`  howToCheck:         [${hcLens.join(", ")}] / max 200 each (count: ${hcLens.length}/2)`);
    } else {
      console.log(`Schema Valid: false`);
      console.log(`Error Code: ${res.data?.error?.code || "UNKNOWN"}`);
    }
  } catch (err) {
    const latencyMs = Math.round(performance.now() - t0);
    console.log(`Status: 500 (Exception)`);
    console.log(`Latency: ${latencyMs} ms`);
    console.log(`Exception: ${err instanceof Error ? err.name : String(err)}`);
  }
  console.log("");
}
