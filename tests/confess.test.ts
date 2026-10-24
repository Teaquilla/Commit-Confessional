// tests/confess.test.ts
// Unit tests for handleConfess in src/lib/confess.ts.
// Strictly offline: uses mock generateReport and fake clocks. No real network calls.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { handleConfess, type ConfessDeps } from "../src/lib/confess.ts";
import {
  lateNightHotfix,
  rebaseConflict,
  worksOnMachine,
} from "../src/samples/index.ts";
import { validateGitInput, calculatePanicScore } from "../src/lib/panic-score.ts";
import type { AIOutput } from "../src/lib/schema.ts";

const VALID_AI_OUTPUT: AIOutput = {
  aiAdjustment: 5,
  aiAdjustmentReason: "Multiple panic commits attempting to restore broken checkout flow.",
  whatHappened: "Checkout service experienced null customer billing references.",
  cause: "Missing null checks on nested customer billing object.",
  fix: "Added fallback error return when billingAddress is missing.",
  prSummary: "Adds null safety check for order billing address in checkout service.",
  whatChanged: [
    "Added null guard in processOrder",
    "Returned fallback error response",
  ],
  howToCheck: [
    "Send payload without billingAddress and verify fallback error",
  ],
};

describe("Sample Diffs Validation", () => {
  it("validates lateNightHotfix passes validateGitInput and scores reasonably", () => {
    assert.equal(validateGitInput(lateNightHotfix), true);
    const score = calculatePanicScore(lateNightHotfix);
    assert.ok(score.baseScore > 0, `Base score should be > 0, got ${score.baseScore}`);
    assert.ok(
      ["MINOR", "MODERATE", "MAJOR", "CRITICAL"].includes(score.severity),
      `Invalid severity: ${score.severity}`
    );
  });

  it("validates rebaseConflict passes validateGitInput and scores reasonably", () => {
    assert.equal(validateGitInput(rebaseConflict), true);
    const score = calculatePanicScore(rebaseConflict);
    assert.ok(score.baseScore > 0, `Base score should be > 0, got ${score.baseScore}`);
    assert.ok(
      ["MINOR", "MODERATE", "MAJOR", "CRITICAL"].includes(score.severity),
      `Invalid severity: ${score.severity}`
    );
  });

  it("validates worksOnMachine passes validateGitInput and scores reasonably", () => {
    assert.equal(validateGitInput(worksOnMachine), true);
    const score = calculatePanicScore(worksOnMachine);
    assert.ok(score.baseScore > 0, `Base score should be > 0, got ${score.baseScore}`);
    assert.ok(
      ["MINOR", "MODERATE", "MAJOR", "CRITICAL"].includes(score.severity),
      `Invalid severity: ${score.severity}`
    );
  });
});

describe("handleConfess Integration Unit Tests", () => {
  // Scenario 1: Success
  it("1. handles successful confession request with valid schema response", async () => {
    const deps: ConfessDeps = {
      generateReport: async (_input, _signals, opts) => {
        if (opts?.callTracker) opts.callTracker.count++;
        return { ...VALID_AI_OUTPUT };
      },
    };

    const res = await handleConfess({ input: lateNightHotfix }, deps);
    assert.equal(res.status, 200);
    assert.ok("panicScore" in res.data);
    if ("panicScore" in res.data) {
      assert.equal(res.data.truncated, false);
      assert.ok(res.data.panicScore.finalScore >= 0 && res.data.panicScore.finalScore <= 100);
      assert.equal(res.data.incidentReport.whatHappened, VALID_AI_OUTPUT.whatHappened);
      assert.equal(res.data.prDescription.summary, VALID_AI_OUTPUT.prSummary);
    }
  });

  // Scenario 2: Empty input
  it("2. returns EMPTY_INPUT (HTTP 400) for empty or whitespace-only input", async () => {
    const res1 = await handleConfess({ input: "" });
    assert.equal(res1.status, 400);
    assert.equal((res1.data as any).error.code, "EMPTY_INPUT");

    const res2 = await handleConfess({ input: "     \n\t   " });
    assert.equal(res2.status, 400);
    assert.equal((res2.data as any).error.code, "EMPTY_INPUT");

    const res3 = await handleConfess({});
    assert.equal(res3.status, 400);
    assert.equal((res3.data as any).error.code, "EMPTY_INPUT");
  });

  // Scenario 3: Nonsensical input
  it("3. returns INVALID_INPUT (HTTP 400) for nonsensical non-git input", async () => {
    const res = await handleConfess({
      input: "This is just a random blog post about JavaScript programming.",
    });
    assert.equal(res.status, 400);
    assert.equal((res.data as any).error.code, "INVALID_INPUT");
    assert.match((res.data as any).error.message, /commits or code changes/);
  });

  // Scenario 4: Input 12,000 characters (truncated: true)
  it("4. truncates input longer than 10,000 characters and sets truncated: true", async () => {
    let capturedInput = "";
    const deps: ConfessDeps = {
      generateReport: async (input, _signals, opts) => {
        if (opts?.callTracker) opts.callTracker.count++;
        capturedInput = input;
        return { ...VALID_AI_OUTPUT };
      },
    };

    // Construct 12,000-character valid git input
    const baseGit = lateNightHotfix;
    const longInput = (baseGit + "\n# extra diff context\n").padEnd(12000, "A");
    assert.equal(longInput.length, 12000);

    const res = await handleConfess({ input: longInput }, deps);
    assert.equal(res.status, 200);
    if ("panicScore" in res.data) {
      assert.equal(res.data.truncated, true);
    }
    assert.equal(capturedInput.length, 10000);
  });

  // Scenario 5: Body over 100 KB
  it("5. returns INPUT_TOO_LARGE (HTTP 413) when raw body exceeds 100 KB", async () => {
    const hugeInput = "a".repeat(105000);
    const res = await handleConfess({ input: hugeInput });
    assert.equal(res.status, 413);
    assert.equal((res.data as any).error.code, "INPUT_TOO_LARGE");
  });

  // Scenario 6: Guardrail fails then succeeds on retry
  it("6. retries once on guardrail failure and succeeds if second attempt passes", async () => {
    let attempt = 0;
    const deps: ConfessDeps = {
      generateReport: async (_input, _signals, opts) => {
        if (opts?.callTracker) opts.callTracker.count++;
        attempt++;
        if (attempt === 1) {
          // First attempt references invented file
          return {
            ...VALID_AI_OUTPUT,
            whatHappened: "Invented error occurred in hallucinatory_file.ts",
          };
        }
        // Second attempt references valid file from input
        return {
          ...VALID_AI_OUTPUT,
          whatHappened: "Error in src/payments/checkout.ts was addressed.",
        };
      },
    };

    const res = await handleConfess({ input: lateNightHotfix }, deps);
    assert.equal(res.status, 200);
    assert.equal(attempt, 2);
  });

  // Scenario 7: Guardrail fails twice
  it("7. returns GUARDRAIL_FAILED (HTTP 502) if guardrail fails on both attempts", async () => {
    let attempt = 0;
    const deps: ConfessDeps = {
      generateReport: async (_input, _signals, opts) => {
        if (opts?.callTracker) opts.callTracker.count++;
        attempt++;
        return {
          ...VALID_AI_OUTPUT,
          whatHappened: `Invented file error in hallucinatory_${attempt}.ts`,
        };
      },
    };

    const res = await handleConfess({ input: lateNightHotfix }, deps);
    assert.equal(res.status, 502);
    assert.equal((res.data as any).error.code, "GUARDRAIL_FAILED");
    assert.equal(attempt, 2);
  });

  // Scenario 8: 503 retry followed by guardrail failure (quota of 2 exhausted, no 3rd call)
  it("8. exhausts 2-call quota on 503 retry so guardrail failure cannot retry a 3rd time", async () => {
    let callCount = 0;
    const deps: ConfessDeps = {
      generateReport: async (_input, _signals, opts) => {
        // Simulate that generateReport internally consumed 2 calls (1st was 503, 2nd returned output)
        if (opts?.callTracker) {
          opts.callTracker.count += 2;
        }
        callCount++;
        return {
          ...VALID_AI_OUTPUT,
          whatHappened: "Output from attempt 2 references hallucinated_auth.ts",
        };
      },
    };

    const res = await handleConfess({ input: lateNightHotfix }, deps);
    assert.equal(res.status, 502);
    assert.equal((res.data as any).error.code, "GUARDRAIL_FAILED");
    // Ensure generateReport was only invoked once by handleConfess (which reported 2 total attempts)
    assert.equal(callCount, 1);
  });

  // Scenario 9: Timeout
  it("9. returns AI_TIMEOUT (HTTP 504) when deadline is exceeded", async () => {
    const deps: ConfessDeps = {
      generateReport: async () => {
        throw new Error("AI_TIMEOUT: Total request deadline exceeded");
      },
    };

    const res = await handleConfess({ input: lateNightHotfix }, deps);
    assert.equal(res.status, 504);
    assert.equal((res.data as any).error.code, "AI_TIMEOUT");
  });

  // Scenario 10: JSON parsing failure from AI
  it("10. returns AI_GENERATION_FAILED (HTTP 502) on malformed AI output", async () => {
    const deps: ConfessDeps = {
      generateReport: async () => {
        throw new Error("AI_GENERATION_FAILED: Malformed JSON output from AI");
      },
    };

    const res = await handleConfess({ input: lateNightHotfix }, deps);
    assert.equal(res.status, 502);
    assert.equal((res.data as any).error.code, "AI_GENERATION_FAILED");
  });

  // Scenario 11: Out-of-range aiAdjustment clamped strictly [-15, 15]
  it("11. clamps out-of-range aiAdjustment strictly between -15 and 15 in final score", async () => {
    const depsHigh: ConfessDeps = {
      generateReport: async (_input, _signals, opts) => {
        if (opts?.callTracker) opts.callTracker.count++;
        return { ...VALID_AI_OUTPUT, aiAdjustment: 99 };
      },
    };

    const resHigh = await handleConfess({ input: lateNightHotfix }, depsHigh);
    assert.equal(resHigh.status, 200);
    if ("panicScore" in resHigh.data) {
      assert.equal(resHigh.data.panicScore.aiAdjustment, 15);
      assert.ok(resHigh.data.panicScore.finalScore <= 100);
    }

    const depsLow: ConfessDeps = {
      generateReport: async (_input, _signals, opts) => {
        if (opts?.callTracker) opts.callTracker.count++;
        return { ...VALID_AI_OUTPUT, aiAdjustment: -99 };
      },
    };

    const resLow = await handleConfess({ input: lateNightHotfix }, depsLow);
    assert.equal(resLow.status, 200);
    if ("panicScore" in resLow.data) {
      assert.equal(resLow.data.panicScore.aiAdjustment, -15);
      assert.ok(resLow.data.panicScore.finalScore >= 0);
    }
  });

  // Scenario 12: Errors and console logs never contain input content or API keys
  it("12. ensures errors and console logs never leak user input or secrets", async () => {
    const sensitiveInput = "SUPER_SECRET_PAYROLL_DATA_DO_NOT_LEAK";
    const sensitiveKey = "AIzaSy_SENSITIVE_KEY_SECRET_789";

    const loggedMessages: string[] = [];
    const origError = console.error;
    const origWarn = console.warn;
    console.error = (...args: unknown[]) => {
      loggedMessages.push(args.map(String).join(" "));
    };
    console.warn = (...args: unknown[]) => {
      loggedMessages.push(args.map(String).join(" "));
    };

    try {
      const deps: ConfessDeps = {
        generateReport: async () => {
          throw new Error(`AI_GENERATION_FAILED: Failed with key ${sensitiveKey}`);
        },
      };

      const res = await handleConfess(
        {
          input: `${lateNightHotfix}\n# ${sensitiveInput}`,
        },
        deps
      );

      assert.equal(res.status, 502);

      const responseString = JSON.stringify(res.data);
      const allLogs = loggedMessages.join("\n");

      // Verify response body does not contain secret or sensitive input
      assert.equal(responseString.includes(sensitiveInput), false);
      assert.equal(responseString.includes(sensitiveKey), false);

      // Verify console logs do not contain secret or sensitive input
      assert.equal(allLogs.includes(sensitiveInput), false);
      assert.equal(allLogs.includes(sensitiveKey), false);
    } finally {
      console.error = origError;
      console.warn = origWarn;
    }
  });

  it("13. returns mock fixtures with distinct severities when AI_MOCK=1 and NODE_ENV=development", async () => {
    const envObj = process.env as Record<string, string | undefined>;
    const origMock = process.env.AI_MOCK;
    const origEnv = process.env.NODE_ENV;
    envObj.AI_MOCK = "1";
    envObj.NODE_ENV = "development";

    try {
      // Sample 1: late-night-hotfix -> MODERATE
      const res1 = await handleConfess({ input: lateNightHotfix });
      assert.equal(res1.status, 200);
      assert.equal("panicScore" in res1.data, true);
      if ("panicScore" in res1.data) {
        assert.equal(res1.data.isMock, true);
        assert.equal(res1.data.incidentReport.severity, "MODERATE");
      }

      // Sample 2: rebase-conflict -> MINOR
      const res2 = await handleConfess({ input: rebaseConflict });
      assert.equal(res2.status, 200);
      if ("panicScore" in res2.data) {
        assert.equal(res2.data.isMock, true);
        assert.equal(res2.data.incidentReport.severity, "MINOR");
      }

      // Sample 3: works-on-machine -> CRITICAL
      const res3 = await handleConfess({ input: worksOnMachine });
      assert.equal(res3.status, 200);
      if ("panicScore" in res3.data) {
        assert.equal(res3.data.isMock, true);
        assert.equal(res3.data.incidentReport.severity, "CRITICAL");
      }
    } finally {
      envObj.AI_MOCK = origMock;
      envObj.NODE_ENV = origEnv;
    }
  });

  it("14. ignores AI_MOCK=1 strictly when NODE_ENV is production", async () => {
    const envObj = process.env as Record<string, string | undefined>;
    const origMock = process.env.AI_MOCK;
    const origEnv = process.env.NODE_ENV;
    envObj.AI_MOCK = "1";
    envObj.NODE_ENV = "production";

    try {
      const fakeGenerate = async () => ({
        aiAdjustment: 0,
        aiAdjustmentReason: "Production execution without mock bypass.",
        whatHappened: "Order processing logic was modified across 2 commits.",
        cause: "Under investigation",
        fix: "Applied condition check in src/payments/checkout.ts",
        prSummary: "Fix validation in payments checkout.",
        whatChanged: ["src/payments/checkout.ts"],
        howToCheck: ["Verify checkout flow"],
      });

      const res = await handleConfess(
        { input: lateNightHotfix },
        { generateReport: fakeGenerate }
      );

      assert.equal(res.status, 200);
      if ("panicScore" in res.data) {
        assert.equal(res.data.isMock, undefined); // AI_MOCK ignored in production!
      }
    } finally {
      envObj.AI_MOCK = origMock;
      envObj.NODE_ENV = origEnv;
    }
  });

  it("15. logs a single [TIMING] telemetry line per request without leaking input content", async () => {
    const sensitiveCanary = "CONFIDENTIAL_CANARY_TOKEN_XYZ_98765";
    const loggedOutputs: string[] = [];
    const origLog = console.log;

    console.log = (...args: unknown[]) => {
      loggedOutputs.push(args.map(String).join(" "));
      origLog(...args);
    };

    try {
      const deps: ConfessDeps = {
        generateReport: async (_input, _signals, opts) => {
          if (opts?.callTracker) opts.callTracker.count++;
          return {
            ...VALID_AI_OUTPUT,
            whatHappened: "Changes made in payments checkout.",
            cause: "Under investigation",
            fix: "Patched src/payments/checkout.ts",
          };
        },
      };

      const res = await handleConfess(
        { input: `${lateNightHotfix}\n# ${sensitiveCanary}` },
        deps
      );

      assert.equal(res.status, 200);

      const timingLines = loggedOutputs.filter((line) =>
        line.startsWith("[TIMING]")
      );

      // Exactly ONE [TIMING] line per request
      assert.equal(timingLines.length, 1);

      const line = timingLines[0];

      // Must strictly conform to telemetry contract
      assert.match(
        line,
        /^\[TIMING\] total=\d+ parse_score=\d+ ai=\d+ guardrail=\d+ attempts=\d+ retried=(true|false)$/
      );

      // Must never contain input content, canary string, or keys
      assert.ok(!line.includes(sensitiveCanary));
      assert.ok(!line.includes("commit"));
      assert.ok(!line.includes("checkout.ts"));
    } finally {
      console.log = origLog;
    }
  });
});


