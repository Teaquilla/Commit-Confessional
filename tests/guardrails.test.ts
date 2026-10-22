// tests/guardrails.test.ts
// Unit tests for Output Guardrail file name validation.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkFileNames, extractCandidateFileTokens } from "../src/lib/guardrails.ts";

describe("checkFileNames", () => {
  const sampleDiff = [
    "diff --git a/src/lib/panic-score.ts b/src/lib/panic-score.ts",
    "--- a/src/lib/panic-score.ts",
    "+++ b/src/lib/panic-score.ts",
    "@@ -1,5 +1,5 @@",
    "+export const version = '1.0';",
    "diff --git a/README.md b/README.md",
    "--- a/README.md",
    "+++ b/README.md",
    "@@ -1 +1 @@",
    "+# Commit Confessional",
  ].join("\n");

  it("accepts file names that exist in diff headers (both full path and basename)", () => {
    const aiTexts = [
      "We updated `src/lib/panic-score.ts` to calculate scores.",
      "The documentation in `README.md` was also revised.",
      "Furthermore, panic-score.ts was tested thoroughly.",
    ];

    const result = checkFileNames(aiTexts, sampleDiff);
    assert.equal(result.ok, true);
    assert.deepEqual(result.invalid, []);
  });

  it("detects invented/hallucinated file names", () => {
    const aiTexts = [
      "The change introduces `auth_controller.ts` and `secret-key.json`.",
      "Fixed issue in src/lib/panic-score.ts.",
    ];

    const result = checkFileNames(aiTexts, sampleDiff);
    assert.equal(result.ok, false);
    assert.equal(result.invalid.includes("auth_controller.ts"), true);
    assert.equal(result.invalid.includes("secret-key.json"), true);
    assert.equal(result.invalid.includes("src/lib/panic-score.ts"), false);
  });

  it("accepts file names that are only mentioned in commit messages", () => {
    const commitOnlyInput = [
      "commit 4278f79e1fb11938eff75",
      "Author: Dev <dev@example.com>",
      "",
      "    refactor config.json and fix database.sql schema",
    ].join("\n");

    const aiTexts = [
      "The commit refactors `config.json`.",
      "Applied schema fixes to database.sql.",
    ];

    const result = checkFileNames(aiTexts, commitOnlyInput);
    assert.equal(result.ok, true);
    assert.deepEqual(result.invalid, []);
  });

  it("does not reject common libraries like Next.js, Node.js, and React.js", () => {
    const aiTexts = [
      "Upgraded to Next.js 15 and Node.js v24 runtime.",
      "Using React.js with Vue.js comparison.",
    ];

    const result = checkFileNames(aiTexts, sampleDiff);
    assert.equal(result.ok, true);
    assert.deepEqual(result.invalid, []);
  });

  it("does not reject code methods like console.log or Latin abbreviations", () => {
    const aiTexts = [
      "Cleaned up stray `console.log` statements (e.g., debug lines).",
      "Removed console.error calls, i.e., unwanted logs.",
    ];

    const result = checkFileNames(aiTexts, sampleDiff);
    assert.equal(result.ok, true);
    assert.deepEqual(result.invalid, []);
  });

  it("does not reject version numbers and URLs", () => {
    const aiTexts = [
      "Updated dependency to 1.2.3 and 15.0.0.",
      "Referenced specification at https://github.com/Teaquilla/Commit-Confessional.",
    ];

    const result = checkFileNames(aiTexts, sampleDiff);
    assert.equal(result.ok, true);
    assert.deepEqual(result.invalid, []);
  });

  it("rejects tokens in backticks that do not exist in the input", () => {
    const aiTexts = [
      "Extracted logic into `ghost_module.ts` without specifying in diff.",
    ];

    const result = checkFileNames(aiTexts, sampleDiff);
    assert.equal(result.ok, false);
    assert.equal(result.invalid.includes("ghost_module.ts"), true);
  });

  it("applies refined backtick rules: ignores non-file tokens and function calls, detects paths and registered extensions", () => {
    const aiTexts = [
      "Called `calculatePanicScore` and helper `parse()`.",
      "Used `mystery_module` internally.",
      "Returned data via `res.json`.",
      "Updated `config.json` and altered `src/config`.",
    ];

    const result = checkFileNames(aiTexts, sampleDiff);
    assert.equal(result.ok, false);
    assert.equal(result.invalid.includes("config.json"), true);
    assert.equal(result.invalid.includes("src/config"), true);
    assert.equal(result.invalid.includes("mystery_module"), false);
    assert.equal(result.invalid.includes("calculatePanicScore"), false);
    assert.equal(result.invalid.includes("res.json"), false);
    assert.equal(result.invalid.includes("parse()"), false);
    assert.equal(result.invalid.includes("parse"), false);
  });

  it("handles input that is commit-log-only without diffs", () => {
    const logOnly = "4278f79 fix: update server.ts and routes.ts\n";
    const aiTexts = ["Modified server.ts and `routes.ts`."];

    const result = checkFileNames(aiTexts, logOnly);
    assert.equal(result.ok, true);
    assert.deepEqual(result.invalid, []);
  });

  it("handles empty texts array and empty input gracefully", () => {
    const r1 = checkFileNames([], sampleDiff);
    assert.equal(r1.ok, true);
    assert.deepEqual(r1.invalid, []);

    const r2 = checkFileNames(["", "   "], "");
    assert.equal(r2.ok, true);
    assert.deepEqual(r2.invalid, []);
  });

  it("processes long texts without file names rapidly without regex backtracking", () => {
    // 50,000 characters of ordinary English prose
    const sentence = "The development team discussed various architectural decisions during the sprint meeting. ";
    const longText = sentence.repeat(Math.ceil(50000 / sentence.length));

    assert.ok(longText.length >= 50000);

    const startTime = performance.now();
    const result = checkFileNames([longText], sampleDiff);
    const duration = performance.now() - startTime;

    assert.equal(result.ok, true);
    assert.deepEqual(result.invalid, []);
    assert.ok(duration < 50, `Execution took ${duration}ms, expected < 50ms`);
  });

  it("supports case-insensitive matching for files", () => {
    const diff = "diff --git a/SRC/UTILS.TS b/SRC/UTILS.TS\n";
    const aiTexts = ["Updated `src/utils.ts` and `utils.ts`."];

    const result = checkFileNames(aiTexts, diff);
    assert.equal(result.ok, true);
    assert.deepEqual(result.invalid, []);
  });
});
