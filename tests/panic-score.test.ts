// tests/panic-score.test.ts
// Comprehensive unit tests for git input parsing, validation, and deterministic Panic Score calculation.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateGitInput,
  parseInput,
  calculatePanicScore,
  formatLessonsLearned,
} from "../src/lib/panic-score.ts";

describe("validateGitInput", () => {
  it("rejects input shorter than 20 characters", () => {
    assert.equal(validateGitInput(""), false);
    assert.equal(validateGitInput("diff --git a/a b/a"), false); // 18 chars
    assert.equal(validateGitInput("short commit message"), false);
  });

  it("rejects non-git text even if longer than 20 characters", () => {
    const text = "This is a random paragraph of developer text describing some issues without any git headers.";
    assert.equal(validateGitInput(text), false);

    // Markdown horizontal rule ("---") without "--- a/" should be rejected
    const markdown = "# Title\n\n---\nSome notes about the incident without any git markers.\n";
    assert.equal(validateGitInput(markdown), false);
  });

  it("accepts inputs containing specific git markers", () => {
    assert.equal(validateGitInput("diff --git a/file.ts b/file.ts\n+const a = 1;"), true);
    assert.equal(validateGitInput("@@ -1,5 +1,5 @@\n+line one\n-line two"), true);
    assert.equal(validateGitInput("--- a/index.ts\n+++ b/index.ts\n@@ -1 +1 @@"), true);
    assert.equal(validateGitInput("commit 4278f79e1fb11938eff75\nAuthor: Dev\n\n    fix bug"), true);
    assert.equal(validateGitInput("4278f79 fix bug in authentication middleware"), true);
  });
});

describe("parseInput", () => {
  it("parses default git log format", () => {
    const gitLog = [
      "commit 4278f79e1fb11938eff754278f79e1fb11938ef",
      "Author: Developer <dev@example.com>",
      "Date:   Thu Oct 22 10:00:00 2026 +0700",
      "",
      "    fix: resolve edge case in parser",
      "    added fallback handling",
      "",
      "commit 38eff75e1fb11938eff754278f79e1fb11938ef",
      "Author: Developer <dev@example.com>",
      "Date:   Thu Oct 22 09:30:00 2026 +0700",
      "",
      "    wip",
    ].join("\n");

    const parsed = parseInput(gitLog);
    assert.equal(parsed.hasCommits, true);
    assert.equal(parsed.commits.length, 2);
    assert.equal(parsed.commits[0].hash, "4278f79e1fb11938eff754278f79e1fb11938ef");
    assert.equal(parsed.commits[0].message, "fix: resolve edge case in parser added fallback handling");
    assert.equal(parsed.commits[1].message, "wip");
    assert.equal(parsed.hasDiff, false);
  });

  it("parses git oneline format", () => {
    const onelineLog = [
      "4278f79 fix: first quick fix",
      "38eff75 wip: second commit",
      "e1fb119 try again",
    ].join("\n");

    const parsed = parseInput(onelineLog);
    assert.equal(parsed.hasCommits, true);
    assert.equal(parsed.commits.length, 3);
    assert.equal(parsed.commits[0].hash, "4278f79");
    assert.equal(parsed.commits[0].message, "fix: first quick fix");
    assert.equal(parsed.commits[2].message, "try again");
  });

  it("parses git show / unified diff and excludes +++ and --- from added/deleted lines", () => {
    const gitShow = [
      "commit 4278f79e1fb11938eff754278f79e1fb11938ef",
      "Author: Developer <dev@example.com>",
      "Date:   Thu Oct 22 10:00:00 2026 +0700",
      "",
      "    fix: patch buffer overflow",
      "",
      "diff --git a/src/buffer.ts b/src/buffer.ts",
      "--- a/src/buffer.ts",
      "+++ b/src/buffer.ts",
      "@@ -10,3 +10,4 @@",
      "-const oldSize = 64;",
      "+const newSize = 128;",
      "+console.log('allocated');",
    ].join("\n");

    const parsed = parseInput(gitShow);
    assert.equal(parsed.hasCommits, true);
    assert.equal(parsed.hasDiff, true);
    assert.deepEqual(parsed.files, ["src/buffer.ts"]);
    assert.equal(parsed.deletedLines.length, 1);
    assert.equal(parsed.deletedLines[0], "const oldSize = 64;");
    assert.equal(parsed.addedLines.length, 2);
    assert.equal(parsed.addedLines[0], "const newSize = 128;");
    assert.equal(parsed.addedLines[1], "console.log('allocated');");
    assert.equal(parsed.totalChanged, 3);
  });

  it("parses git log -p with multiple commits and associates files per commit", () => {
    const gitLogP = [
      "commit 1111111111111111111111111111111111111111",
      "Author: Dev <dev@example.com>",
      "",
      "    fix",
      "",
      "diff --git a/src/auth.ts b/src/auth.ts",
      "--- a/src/auth.ts",
      "+++ b/src/auth.ts",
      "@@ -1 +1 @@",
      "+touch 1",
      "",
      "commit 2222222222222222222222222222222222222222",
      "Author: Dev <dev@example.com>",
      "",
      "    fix again",
      "",
      "diff --git a/src/auth.ts b/src/auth.ts",
      "--- a/src/auth.ts",
      "+++ b/src/auth.ts",
      "@@ -1 +1 @@",
      "+touch 2",
      "",
      "commit 3333333333333333333333333333333333333333",
      "Author: Dev <dev@example.com>",
      "",
      "    try again",
      "",
      "diff --git a/src/auth.ts b/src/auth.ts",
      "--- a/src/auth.ts",
      "+++ b/src/auth.ts",
      "@@ -1 +1 @@",
      "+touch 3",
    ].join("\n");

    const parsed = parseInput(gitLogP);
    assert.equal(parsed.hasCommits, true);
    assert.equal(parsed.hasCommitFiles, true);
    assert.equal(parsed.commits.length, 3);
    assert.equal(parsed.commits[0].files.includes("src/auth.ts"), true);
    assert.equal(parsed.commits[1].files.includes("src/auth.ts"), true);
    assert.equal(parsed.commits[2].files.includes("src/auth.ts"), true);
  });

  it("does not leak indented python context lines into commit message in git show", () => {
    const gitShowPython = [
      "commit 4278f79e1fb11938eff754278f79e1fb11938ef",
      "Author: Developer <dev@example.com>",
      "Date:   Thu Oct 22 10:00:00 2026 +0700",
      "",
      "    fix",
      "",
      "diff --git a/app.py b/app.py",
      "--- a/app.py",
      "+++ b/app.py",
      "@@ -10,4 +10,4 @@",
      "     def process_request():",
      "-        return False",
      "+        return True",
    ].join("\n");

    const parsed = parseInput(gitShowPython);
    assert.equal(parsed.commits.length, 1);
    assert.equal(parsed.commits[0].message, "fix");

    const scoreResult = calculatePanicScore(gitShowPython);
    assert.equal(scoreResult.signals.rushedCommits.points, 30);
  });

  it("does not leak tab-indented context lines into commit message in git log -p", () => {
    const gitLogPTab = [
      "commit 1111111111111111111111111111111111111111",
      "Author: Dev <dev@example.com>",
      "Date:   Thu Oct 22 10:00:00 2026 +0700",
      "",
      "    wip",
      "",
      "diff --git a/main.go b/main.go",
      "--- a/main.go",
      "+++ b/main.go",
      "@@ -1,3 +1,3 @@",
      "\tfunc main() {",
      "-\t\tprintln(1)",
      "+\t\tprintln(2)",
    ].join("\n");

    const parsed = parseInput(gitLogPTab);
    assert.equal(parsed.commits.length, 1);
    assert.equal(parsed.commits[0].message, "wip");

    const scoreResult = calculatePanicScore(gitLogPTab);
    assert.equal(scoreResult.signals.rushedCommits.points, 30);
  });
});

describe("calculatePanicScore", () => {
  it("rejects nonsensical input and returns standard friendly error", () => {
    const result = calculatePanicScore("too short");
    assert.equal(result.valid, false);
    assert.equal(
      result.errorMessage,
      "That doesn't look like commits or code changes. Paste a git diff or commit messages and try again."
    );
    assert.equal(result.baseScore, 0);
    assert.equal(result.severity, "MINOR");
  });

  it("computes score 50 (MAJOR) for diff-only input with >300 lines and no other signals", () => {
    const diffHeader = "diff --git a/large-file.ts b/large-file.ts\n--- a/large-file.ts\n+++ b/large-file.ts\n@@ -1,1 +1,351 @@\n";
    const addedLines = Array.from({ length: 350 }, (_, i) => `+const value_${i} = ${i};`).join("\n");
    const input = diffHeader + addedLines;

    const result = calculatePanicScore(input);

    assert.equal(result.valid, true);
    assert.equal(result.signals.rushedCommits.available, false);
    assert.equal(result.signals.shoutingMashing.available, false);
    assert.equal(result.signals.repeatedFiles.available, false);
    assert.equal(result.signals.debugLeftovers.available, true);
    assert.equal(result.signals.debugLeftovers.points, 0);
    assert.equal(result.signals.diffSize.available, true);
    assert.equal(result.signals.diffSize.points, 20);

    // 20 points earned out of 40 available points normalized to 100-point scale: Math.round(20 * 100 / 40) = 50
    assert.equal(result.baseScore, 50);
    assert.equal(result.finalScore, 50);
    assert.equal(result.severity, "MAJOR");
    assert.equal(
      result.dominantReason,
      "Large changeset volume increases risk and review complexity."
    );
  });

  it("does not trigger shouting signal for singular short acronyms like WIP or API", () => {
    const onelineInput = "4278f79 WIP on API authentication endpoint\n38eff75 API updates and fixes\n";
    const result = calculatePanicScore(onelineInput);

    assert.equal(result.valid, true);
    assert.equal(result.signals.shoutingMashing.points, 0);
    assert.equal(result.signals.shoutingMashing.evidence, "No shouting or character mashing detected");
  });

  it("triggers shouting signal for ALL CAPS word with >= 4 letters or repeated punctuation", () => {
    const shoutingInput = "4278f79 FIXING THIS RIGHT NOW\n38eff75 why does this fail???\n";
    const result = calculatePanicScore(shoutingInput);

    assert.equal(result.valid, true);
    assert.equal(result.signals.shoutingMashing.points, 10);
    assert.match(result.signals.shoutingMashing.evidence, /Detected shouting or character mashing/);
  });

  it("triggers mashing signal for characters repeated 5 times or more", () => {
    const mashingInput = "4278f79 fixed asdfghhhhh bug\n";
    const result = calculatePanicScore(mashingInput);

    assert.equal(result.valid, true);
    assert.equal(result.signals.shoutingMashing.points, 10);
  });

  it("calculates rushed commits accurately with low-effort keywords, single-words, and duplicates", () => {
    const input = [
      "1111111 fix",
      "2222222 wip",
      "3333333 custom feature implemented cleanly",
      "4444444 custom feature implemented cleanly", // duplicate
    ].join("\n");

    const result = calculatePanicScore(input);
    assert.equal(result.valid, true);
    // 3 out of 4 are low effort (fix, wip, duplicate) -> Math.round((3/4) * 30) = 23 points
    assert.equal(result.signals.rushedCommits.points, 23);
    assert.equal(result.signals.rushedCommits.evidence, "3 of 4 commit messages are low-effort");
  });

  it("awards 20 points for repeated file touches when a file is modified across >= 3 commits", () => {
    const gitLogP = [
      "commit 1111111",
      "    feat: add endpoint",
      "diff --git a/src/api.ts b/src/api.ts",
      "--- a/src/api.ts",
      "+++ b/src/api.ts",
      "@@ -1 +1 @@",
      "+line 1",
      "",
      "commit 2222222",
      "    fix: patch endpoint",
      "diff --git a/src/api.ts b/src/api.ts",
      "--- a/src/api.ts",
      "+++ b/src/api.ts",
      "@@ -1 +1 @@",
      "+line 2",
      "",
      "commit 3333333",
      "    fix: fix endpoint again",
      "diff --git a/src/api.ts b/src/api.ts",
      "--- a/src/api.ts",
      "+++ b/src/api.ts",
      "@@ -1 +1 @@",
      "+line 3",
    ].join("\n");

    const result = calculatePanicScore(gitLogP);
    assert.equal(result.valid, true);
    assert.equal(result.signals.repeatedFiles.available, true);
    assert.equal(result.signals.repeatedFiles.points, 20);
    assert.match(result.signals.repeatedFiles.evidence, /"src\/api\.ts" modified across 3 commits/);
  });

  it("calculates debug leftovers (4 pts each, capped at 20)", () => {
    const diff = [
      "diff --git a/src/debug.ts b/src/debug.ts",
      "--- a/src/debug.ts",
      "+++ b/src/debug.ts",
      "@@ -1,5 +1,9 @@",
      "+console.log('test1');",
      "+console.log('test2');",
      "+debugger;",
      "+print('python style');",
      "+var_dump($debug);",
      "+console.log('excess');", // 6th instance, capped at 5 -> 20 pts
    ].join("\n");

    const result = calculatePanicScore(diff);
    assert.equal(result.valid, true);
    assert.equal(result.signals.debugLeftovers.points, 20);
    assert.equal(result.signals.debugLeftovers.evidence, "6 debug statements found in added lines");
  });

  it("handles a large diff of 50,000 characters rapidly without regex catastrophic backtracking", () => {
    const header = "diff --git a/src/huge.ts b/src/huge.ts\n--- a/src/huge.ts\n+++ b/src/huge.ts\n@@ -1,1 +1,1000 @@\n";
    // Generate ~50,000 characters of added lines
    const line = "+const item_data_with_some_attributes = { key: 'value', count: 12345 };\n";
    const lineCount = Math.ceil(50000 / line.length);
    const hugeInput = header + line.repeat(lineCount);

    assert.ok(hugeInput.length >= 50000);

    const startTime = performance.now();
    const result = calculatePanicScore(hugeInput);
    const duration = performance.now() - startTime;

    assert.equal(result.valid, true);
    assert.equal(result.signals.diffSize.points, 20);
    // Must execute well under 100ms
    assert.ok(duration < 150, `Execution took ${duration}ms, expected < 150ms`);
  });

  it("clamps final score strictly between 0 and 100", () => {
    // Clean minimal diff
    const cleanDiff = "diff --git a/a.ts b/a.ts\n--- a/a.ts\n+++ b/a.ts\n@@ -1 +1 @@\n+const x = 1;\n";
    const cleanResult = calculatePanicScore(cleanDiff);
    assert.ok(cleanResult.baseScore >= 0 && cleanResult.baseScore <= 100);

    // Highly panicked multi-signal input reaching 100 points (CRITICAL)
    const largeAddedLines = Array.from({ length: 320 }, (_, i) => `+const crash_${i} = ${i};`).join("\n");
    const maxPanicInput = [
      "commit 1111111",
      "    ASDFGHHH WHAT THE HECK",
      "diff --git a/bad.ts b/bad.ts",
      "--- a/bad.ts",
      "+++ b/bad.ts",
      "@@ -1 +1 @@",
      "+console.log('1'); debugger; print('2'); var_dump($3); console.log('4');",
      "",
      "commit 2222222",
      "    FIX NOW!!!",
      "diff --git a/bad.ts b/bad.ts",
      "--- a/bad.ts",
      "+++ b/bad.ts",
      "@@ -1 +1 @@",
      "+console.log('5');",
      "",
      "commit 3333333",
      "    fix",
      "diff --git a/bad.ts b/bad.ts",
      "--- a/bad.ts",
      "+++ b/bad.ts",
      "@@ -1,1 +1,320 @@",
      largeAddedLines,
    ].join("\n");

    const panicResult = calculatePanicScore(maxPanicInput);
    assert.ok(panicResult.baseScore >= 0 && panicResult.baseScore <= 100);
    assert.equal(panicResult.severity, "CRITICAL");
  });

  it("handles commit log without diff: signals 1-2 available, 3-5 unavailable, normalized from 40 points", () => {
    const commitOnlyInput = [
      "4278f79 fix",
      "38eff75 wip",
      "e1fb119 custom feature implemented cleanly",
      "ce8a85b custom feature implemented cleanly", // duplicate -> low effort
    ].join("\n");

    const result = calculatePanicScore(commitOnlyInput);

    assert.equal(result.valid, true);
    assert.equal(result.signals.rushedCommits.available, true);
    assert.equal(result.signals.shoutingMashing.available, true);
    assert.equal(result.signals.repeatedFiles.available, false);
    assert.equal(result.signals.debugLeftovers.available, false);
    assert.equal(result.signals.diffSize.available, false);

    // 3 of 4 commits are low effort -> round((3/4)*30) = 23 points earned out of 40 available
    // Normalized score: round((23 * 100) / 40) = 58
    assert.equal(result.signals.rushedCommits.points, 23);
    assert.equal(result.signals.shoutingMashing.points, 0);
    assert.equal(result.baseScore, 58);
    assert.equal(result.finalScore, 58);
    assert.equal(result.severity, "MAJOR");
  });

  it("handles valid diff with 0 changed lines without division by zero", () => {
    const zeroDiff = [
      "diff --git a/empty.txt b/empty.txt",
      "new file mode 100644",
      "index 0000000..e69de29",
    ].join("\n");

    const result = calculatePanicScore(zeroDiff);

    assert.equal(result.valid, true);
    assert.equal(result.baseScore, 0);
    assert.equal(result.finalScore, 0);
    assert.equal(result.severity, "MINOR");
    assert.equal(result.signals.diffSize.points, 0);
    assert.equal(result.signals.debugLeftovers.points, 0);
    assert.equal(result.signals.diffSize.evidence, "0 total lines changed in diff");
  });

  it("awards 10 points when a file is modified across exactly 2 commits", () => {
    const gitLogP2 = [
      "commit 1111111",
      "    feat: initial endpoint",
      "diff --git a/src/service.ts b/src/service.ts",
      "--- a/src/service.ts",
      "+++ b/src/service.ts",
      "@@ -1 +1 @@",
      "+step 1",
      "",
      "commit 2222222",
      "    fix: patch endpoint",
      "diff --git a/src/service.ts b/src/service.ts",
      "--- a/src/service.ts",
      "+++ b/src/service.ts",
      "@@ -1 +1 @@",
      "+step 2",
      "",
      "commit 3333333",
      "    docs: add readme",
      "diff --git a/README.md b/README.md",
      "--- a/README.md",
      "+++ b/README.md",
      "@@ -1 +1 @@",
      "+readme line",
    ].join("\n");

    const result = calculatePanicScore(gitLogP2);

    assert.equal(result.valid, true);
    assert.equal(result.signals.repeatedFiles.available, true);
    assert.equal(result.signals.repeatedFiles.points, 10);
    assert.equal(result.signals.repeatedFiles.evidence, '"src/service.ts" modified across 2 commits');
  });

  it("verifies exact score boundaries of 0 and 100", () => {
    // Exact 0 score: clean single-line diff without debug statements
    const zeroInput = "diff --git a/clean.ts b/clean.ts\n--- a/clean.ts\n+++ b/clean.ts\n@@ -1 +1 @@\n+const x = 1;\n";
    const zeroResult = calculatePanicScore(zeroInput);
    assert.equal(zeroResult.baseScore, 0);
    assert.equal(zeroResult.finalScore, 0);
    assert.equal(zeroResult.severity, "MINOR");

    // Exact 100 score: all 5 signals maxed out (30 + 10 + 20 + 20 + 20 = 100/100)
    const largeDiff350 = Array.from({ length: 350 }, (_, i) => `+const line_${i} = ${i};`).join("\n");
    const hundredInput = [
      "commit 1111111",
      "    fix",
      "diff --git a/churn.ts b/churn.ts",
      "--- a/churn.ts",
      "+++ b/churn.ts",
      "@@ -1 +1 @@",
      "+console.log('1'); debugger; print('2'); var_dump($3); console.log('4');",
      "",
      "commit 2222222",
      "    ASDFGHHH!!!",
      "diff --git a/churn.ts b/churn.ts",
      "--- a/churn.ts",
      "+++ b/churn.ts",
      "@@ -1 +1 @@",
      "+console.log('5');",
      "",
      "commit 3333333",
      "    wip",
      "diff --git a/churn.ts b/churn.ts",
      "--- a/churn.ts",
      "+++ b/churn.ts",
      "@@ -1,1 +1,350 @@",
      largeDiff350,
    ].join("\n");

    const hundredResult = calculatePanicScore(hundredInput);
    assert.equal(hundredResult.signals.rushedCommits.points, 30); // 3 of 3 low effort
    assert.equal(hundredResult.signals.shoutingMashing.points, 10); // FIX NOW!!!
    assert.equal(hundredResult.signals.repeatedFiles.points, 20); // churn.ts in 3 commits
    assert.equal(hundredResult.signals.debugLeftovers.points, 20); // >= 5 debugs
    assert.equal(hundredResult.signals.diffSize.points, 20); // > 300 lines
    assert.equal(hundredResult.baseScore, 100);
    assert.equal(hundredResult.finalScore, 100);
    assert.equal(hundredResult.severity, "CRITICAL");
  });
});

describe("formatLessonsLearned", () => {
  it("returns 'No commit messages were provided.' when commits array is empty (tidak ada pesan)", () => {
    assert.equal(formatLessonsLearned([]), "No commit messages were provided.");
  });

  it("returns 'The change was made in N commits.' when commit messages are all empty or whitespace (pesan kosong)", () => {
    const commits = [
      { hash: "a1", message: "", files: [] },
      { hash: "a2", message: "   ", files: [] },
    ];
    assert.equal(formatLessonsLearned(commits), "The change was made in 2 commits.");
  });

  it("formats single message correctly (satu pesan)", () => {
    const commits = [{ hash: "a1", message: "Initial commit", files: [] }];
    assert.equal(
      formatLessonsLearned(commits),
      "The commit messages were 'Initial commit'."
    );
  });

  it("cuts long message at last word boundary before 30 characters with '...' (pesan panjang terpotong di batas kata)", () => {
    const longMsg = "This is a very long commit message that exceeds thirty chars";
    const commits = [{ hash: "a1", message: longMsg, files: [] }];
    // "This is a very long commit mes" -> cut at "commit" -> "This is a very long commit..."
    assert.equal(
      formatLessonsLearned(commits),
      "The commit messages were 'This is a very long commit...'."
    );
  });

  it("ensures no trailing whitespace before closing quotes (pesan tanpa spasi akhir)", () => {
    const commits = [
      { hash: "a1", message: "fix trailing spaces   ", files: [] },
      { hash: "a2", message: "another message with long text that has words", files: [] },
    ];
    const result = formatLessonsLearned(commits);
    const quotedItems = [...result.matchAll(/'([^']*)'/g)].map((m) => m[1]);
    for (const item of quotedItems) {
      assert.ok(!item.endsWith(" "), `Quoted item "${item}" should not end with space`);
    }
    assert.match(result, /'fix trailing spaces'/);
    assert.match(result, /'another message with long...'/);
  });

  it("formats six messages into 3 quotes and 'and 3 more' (enam pesan menghasilkan 3 kutipan dan and 3 more)", () => {
    const commits = [
      { hash: "1", message: "m1", files: [] },
      { hash: "2", message: "m2", files: [] },
      { hash: "3", message: "m3", files: [] },
      { hash: "4", message: "m4", files: [] },
      { hash: "5", message: "m5", files: [] },
      { hash: "6", message: "m6", files: [] },
    ];
    assert.equal(
      formatLessonsLearned(commits),
      "The commit messages were 'm1', 'm2', 'm3' and 3 more."
    );
  });

  it("escapes or replaces internal single quotes with safe quote (pesan dengan tanda kutip tunggal)", () => {
    const commits = [
      { hash: "a1", message: "don't touch this user's session", files: [] },
    ];
    const result = formatLessonsLearned(commits);
    assert.equal(
      result,
      "The commit messages were 'don’t touch this user’s...'."
    );
  });

  it("formats 2 commits correctly", () => {
    const commits = [
      { hash: "a1", message: "fix", files: [] },
      { hash: "a2", message: "please work now", files: [] },
    ];
    assert.equal(
      formatLessonsLearned(commits),
      "The commit messages were 'fix' and 'please work now'."
    );
  });

  it("formats 3 commits correctly", () => {
    const commits = [
      { hash: "a1", message: "fix", files: [] },
      { hash: "a2", message: "wip", files: [] },
      { hash: "a3", message: "third attempt", files: [] },
    ];
    assert.equal(
      formatLessonsLearned(commits),
      "The commit messages were 'fix', 'wip' and 'third attempt'."
    );
  });
});


