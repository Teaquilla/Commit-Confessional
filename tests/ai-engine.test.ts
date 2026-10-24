// tests/ai-engine.test.ts
// Unit tests for the AI Engine (generateReport) using fake injected fetch (no network, zero API cost).

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateReport } from "../src/lib/ai/index.ts";
import { AIOutputSchema } from "../src/lib/schema.ts";

describe("AI Engine (generateReport)", () => {
  const sampleValidOutput = {
    aiAdjustment: 5,
    aiAdjustmentReason: "Detected hasty hotfix markers and debug statements.",
    whatHappened: "A late-night hotfix was deployed directly to production.",
    cause: "Under investigation",
    fix: "Refactored buffer configuration to prevent overflow.",
    prSummary: "Fix buffer size configuration and error boundaries.",
    whatChanged: ["src/buffer.ts", "src/config.ts"],
    howToCheck: ["Run tests/panic-score.test.ts"],
  };

  const makeGeminiResponse = (contentObj: unknown) => {
    return {
      candidates: [
        {
          content: {
            parts: [
              {
                text: typeof contentObj === "string" ? contentObj : JSON.stringify(contentObj),
              },
            ],
          },
        },
      ],
    };
  };

  it("successfully parses valid AI JSON output", async () => {
    const fakeFetch: typeof fetch = async () => {
      return {
        ok: true,
        status: 200,
        json: async () => makeGeminiResponse(sampleValidOutput),
      } as unknown as Response;
    };

    const result = await generateReport("diff --git a/app.ts b/app.ts", undefined, {
      fetchFn: fakeFetch,
      apiKey: "test-api-key",
      modelName: "test-model",
    });

    assert.equal(result.aiAdjustment, 5);
    assert.equal(result.cause, "Under investigation");
    assert.equal(result.whatChanged.length, 2);
    assert.ok(AIOutputSchema.safeParse(result).success);
  });

  it("handles broken/malformed JSON and rejects with AI_GENERATION_FAILED", async () => {
    const fakeFetch: typeof fetch = async () => {
      return {
        ok: true,
        status: 200,
        json: async () => makeGeminiResponse("Here is the incident report: { not valid json"),
      } as unknown as Response;
    };

    await assert.rejects(
      async () => {
        await generateReport("diff --git a/app.ts b/app.ts", undefined, {
          fetchFn: fakeFetch,
          apiKey: "test-api-key",
        });
      },
      (err: Error) => {
        assert.ok(err.message.includes("AI_GENERATION_FAILED"));
        assert.ok(err.message.includes("Malformed JSON"));
        return true;
      }
    );
  });

  it("handles request timeout and rejects with AI_TIMEOUT", async () => {
    const fakeFetch: typeof fetch = async (_url, init) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        if (signal) {
          signal.addEventListener("abort", () => {
            const err = new Error("This operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    };

    await assert.rejects(
      async () => {
        await generateReport("diff --git a/app.ts b/app.ts", undefined, {
          fetchFn: fakeFetch,
          apiKey: "test-api-key",
          deadlineMs: 50, // 50ms deadline
        });
      },
      (err: Error) => {
        assert.ok(err.message.includes("AI_TIMEOUT"));
        return true;
      }
    );
  });

  it("retries on HTTP 503 when sufficient time remains (>= 10s) and succeeds on 2nd attempt", async () => {
    let callCount = 0;
    const fakeFetch: typeof fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 503,
          json: async () => ({ error: "Service Unavailable" }),
        } as unknown as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => makeGeminiResponse(sampleValidOutput),
      } as unknown as Response;
    };

    const result = await generateReport("diff --git a/app.ts b/app.ts", undefined, {
      fetchFn: fakeFetch,
      apiKey: "test-api-key",
      deadlineMs: 25000, // 25s total budget (well above 10s)
    });

    assert.equal(callCount, 2);
    assert.equal(result.fix, "Refactored buffer configuration to prevent overflow.");
  });

  it("does not retry on HTTP 503 if remaining time is below 10 seconds", async () => {
    let callCount = 0;
    const fakeFetch: typeof fetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 503,
        json: async () => ({ error: "Service Unavailable" }),
      } as unknown as Response;
    };

    await assert.rejects(
      async () => {
        await generateReport("diff --git a/app.ts b/app.ts", undefined, {
          fetchFn: fakeFetch,
          apiKey: "test-api-key",
          deadlineMs: 5000, // Only 5s remaining (< 10s threshold)
        });
      },
      (err: Error) => {
        assert.ok(err.message.includes("AI_GENERATION_FAILED"));
        assert.ok(err.message.includes("503"));
        return true;
      }
    );

    assert.equal(callCount, 1); // Strictly 1 attempt, no retry
  });

  it("handles HTTP 429 rate limit correctly", async () => {
    let callCount = 0;
    const fakeFetch: typeof fetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 429,
        json: async () => ({ error: "Resource exhausted" }),
      } as unknown as Response;
    };

    await assert.rejects(
      async () => {
        await generateReport("diff --git a/app.ts b/app.ts", undefined, {
          fetchFn: fakeFetch,
          apiKey: "test-api-key",
          deadlineMs: 5000, // < 10s -> no retry
        });
      },
      (err: Error) => {
        assert.ok(err.message.includes("AI_GENERATION_FAILED"));
        assert.ok(err.message.includes("429"));
        return true;
      }
    );

    assert.equal(callCount, 1);
  });

  it("clamps out-of-range aiAdjustment strictly between -15 and 15", async () => {
    const outOfRangeOutputHigh = {
      ...sampleValidOutput,
      aiAdjustment: 42, // Above +15
    };

    const fakeFetchHigh: typeof fetch = async () => {
      return {
        ok: true,
        status: 200,
        json: async () => makeGeminiResponse(outOfRangeOutputHigh),
      } as unknown as Response;
    };

    const resultHigh = await generateReport("diff --git a/app.ts b/app.ts", undefined, {
      fetchFn: fakeFetchHigh,
      apiKey: "test-api-key",
    });

    assert.equal(resultHigh.aiAdjustment, 15);

    const outOfRangeOutputLow = {
      ...sampleValidOutput,
      aiAdjustment: -99, // Below -15
    };

    const fakeFetchLow: typeof fetch = async () => {
      return {
        ok: true,
        status: 200,
        json: async () => makeGeminiResponse(outOfRangeOutputLow),
      } as unknown as Response;
    };

    const resultLow = await generateReport("diff --git a/app.ts b/app.ts", undefined, {
      fetchFn: fakeFetchLow,
      apiKey: "test-api-key",
    });

    assert.equal(resultLow.aiAdjustment, -15);
  });

  it("ensures error messages and logs never leak input content or API keys", async () => {
    const sensitiveInput = "CONFIDENTIAL_PAYROLL_DATA_AND_SECRET_CODE_12345";
    const sensitiveKey = "AIzaSy_CONFIDENTIAL_KEY_XYZ987";

    const fakeFetch: typeof fetch = async () => {
      return {
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal Server Error" }),
      } as unknown as Response;
    };

    try {
      await generateReport(sensitiveInput, undefined, {
        fetchFn: fakeFetch,
        apiKey: sensitiveKey,
        deadlineMs: 5000,
      });
      assert.fail("Expected generateReport to throw");
    } catch (err: unknown) {
      assert.ok(err instanceof Error);
      const msg = err.message;
      assert.equal(msg.includes(sensitiveInput), false, "Error message must not leak user input");
      assert.equal(msg.includes(sensitiveKey), false, "Error message must not leak API key");
    }
  });

  it("logs only status, error.status, and retryDelay without leaking input or keys on provider HTTP error", async () => {
    const sensitiveInput = "SECRET_PAYLOAD_TOKEN_NEVER_LOG_987654";
    const sensitiveKey = "AIzaSy_SUPER_SECRET_KEY_123456";

    const loggedWarnings: string[] = [];
    const origWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      loggedWarnings.push(args.map(String).join(" "));
      origWarn(...args);
    };

    try {
      const fakeFetch: typeof fetch = async () => {
        return {
          ok: false,
          status: 429,
          clone() {
            return this;
          },
          json: async () => ({
            error: {
              code: 429,
              message: "Quota exceeded for project",
              status: "RESOURCE_EXHAUSTED",
              details: [
                {
                  "@type": "type.googleapis.com/google.rpc.RetryInfo",
                  retryDelay: "30s",
                },
              ],
            },
          }),
        } as unknown as Response;
      };

      await assert.rejects(
        async () => {
          await generateReport(sensitiveInput, undefined, {
            fetchFn: fakeFetch,
            apiKey: sensitiveKey,
            deadlineMs: 5000, // < 10s so retry is skipped
          });
        },
        (err: Error) => {
          assert.ok(err.message.includes("AI_GENERATION_FAILED"));
          assert.ok(err.message.includes("429"));
          assert.ok(err.message.includes("RESOURCE_EXHAUSTED"));
          assert.ok(err.message.includes("30s"));
          assert.equal(err.message.includes(sensitiveInput), false, "Error message must not leak input");
          assert.equal(err.message.includes(sensitiveKey), false, "Error message must not leak API key");
          return true;
        }
      );

      const allWarns = loggedWarnings.join("\n");
      assert.ok(allWarns.includes("[AI_HTTP_ERROR]"));
      assert.ok(allWarns.includes("status: 429"));
      assert.ok(allWarns.includes("error.status: RESOURCE_EXHAUSTED"));
      assert.ok(allWarns.includes("retryDelay: 30s"));
      assert.equal(allWarns.includes(sensitiveInput), false, "Console warnings must not leak input");
      assert.equal(allWarns.includes(sensitiveKey), false, "Console warnings must not leak API key");
    } finally {
      console.warn = origWarn;
    }
  });
});
