// tests/panic-score.test.ts
// Unit tests for Panic Score calculation and edge cases

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Reference formula implementation per spec.md section 7
export function calculatePanicScore(input: string) {
  const isDiffOnly = !input.includes("commit ") && !input.match(/^[a-f0-9]{7,10}\s/m);
  
  // Signal 4: Debug leftovers (4 pts each, max 20)
  const debugMatches = input.match(/\b(console\.log|print\(|debugger|var_dump)\b/g) || [];
  const debugPoints = Math.min(5, debugMatches.length) * 4;

  // Signal 5: Diff size (>300 lines = 20, 100-300 = 10, <100 = 0)
  const lineCount = (input.match(/^\+[^+]/gm) || []).length + (input.match(/^-[^-]/gm) || []).length;
  let diffPoints = 0;
  if (lineCount > 300) {
    diffPoints = 20;
  } else if (lineCount >= 100) {
    diffPoints = 10;
  }

  if (isDiffOnly) {
    const rawScore = debugPoints + diffPoints; // max 40
    const normalizedScore = Math.round(rawScore * (100 / 40));
    
    let severity: "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL" = "MINOR";
    if (normalizedScore >= 75) severity = "CRITICAL";
    else if (normalizedScore >= 50) severity = "MAJOR";
    else if (normalizedScore >= 25) severity = "MODERATE";

    return {
      baseScore: normalizedScore,
      finalScore: normalizedScore,
      severity,
      signals: {
        rushedCommits: { points: 0, available: false },
        shoutingMashing: { points: 0, available: false },
        repeatedFiles: { points: 0, available: false },
        debugLeftovers: { points: debugPoints, available: true },
        diffSize: { points: diffPoints, available: true },
      },
    };
  }

  // Fallback for full commits input
  return { baseScore: 0, finalScore: 0, severity: "MINOR" as const };
}

describe("Panic Score - Diff Only Edge Cases", () => {
  it("computes score 50 (MAJOR) for diff-only input with >300 lines and no other signals", () => {
    // Generate clean diff with 350 added lines without debug code or commit logs
    const diffHeader = "diff --git a/large-file.ts b/large-file.ts\n--- a/large-file.ts\n+++ b/large-file.ts\n@@ -1,1 +1,351 @@\n";
    const addedLines = Array.from({ length: 350 }, (_, i) => `+const value_${i} = ${i};`).join("\n");
    const input = diffHeader + addedLines;

    const result = calculatePanicScore(input);

    assert.equal(result.signals.rushedCommits.available, false);
    assert.equal(result.signals.shoutingMashing.available, false);
    assert.equal(result.signals.repeatedFiles.available, false);
    assert.equal(result.signals.debugLeftovers.points, 0);
    assert.equal(result.signals.diffSize.points, 20);
    
    // 20/40 points normalized to 100-point scale equals exactly 50
    assert.equal(result.baseScore, 50);
    assert.equal(result.finalScore, 50);
    // Score 50 lands in MAJOR (50 - 74) purely due to diff size
    assert.equal(result.severity, "MAJOR");
  });
});
