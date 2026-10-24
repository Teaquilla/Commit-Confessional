// src/lib/confess.ts
// Pure handler logic for /api/confess: handles payload size, truncation, git validation,
// Panic Score computation, AI generation, file name guardrails, and response validation.

import {
  ConfessRequestSchema,
  ConfessResponseSchema,
  type ConfessResponse,
  type ErrorResponse,
  type AIOutput,
  type SeverityBand,
} from "./schema.ts";
import {
  validateGitInput,
  calculatePanicScore,
  formatLessonsLearned,
  type BaseScoreSignals,
} from "./panic-score.ts";
import { checkFileNames } from "./guardrails.ts";
import {
  generateReport as defaultGenerateReport,
  type GenerateReportOptions,
} from "./ai/index.ts";
import {
  mockLateNightHotfix,
  mockRebaseConflict,
  mockWorksOnMachine,
} from "../../tests/fixtures/mock-responses.ts";

export interface ConfessDeps {
  generateReport?: (
    input: string,
    signals?: BaseScoreSignals,
    opts?: GenerateReportOptions
  ) => Promise<AIOutput>;
  now?: () => number;
}

export interface ConfessResult {
  status: number;
  data: ConfessResponse | ErrorResponse;
}

const MAX_RAW_BYTES = 100 * 1024; // 100 KB = 102400 bytes
const TOTAL_DEADLINE_MS = 28000; // 28s total budget per request

const PRD_NONSENSICAL_MESSAGE =
  "That doesn't look like commits or code changes. Paste a git diff or commit messages and try again.";
const PRD_FAILURE_MESSAGE =
  "Something went wrong and no report was filed. Please try again.";

function computeSeverity(score: number): SeverityBand {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "MAJOR";
  if (score >= 25) return "MODERATE";
  return "MINOR";
}

function collectAllAiTexts(ai: AIOutput): string[] {
  return [
    ai.aiAdjustmentReason,
    ai.whatHappened,
    ai.cause,
    ai.fix,
    ai.prSummary,
    ...ai.whatChanged,
    ...ai.howToCheck,
  ];
}

/**
 * Pure handler function for processing a confession request.
 * Dependencies (generateReport, now) can be injected for unit testing.
 */
export async function handleConfess(
  body: unknown,
  deps?: ConfessDeps
): Promise<ConfessResult> {
  const now = deps?.now || Date.now;
  const generateReportFn = deps?.generateReport || defaultGenerateReport;
  const startTime = now();

  // Timing breakdown metrics
  let tParseScore = 0;
  let tAi = 0;
  let tGuardrail = 0;
  let retried = false;

  // Track total AI calls made within this request
  const callTracker = { count: 0 };

  const respond = (result: ConfessResult): ConfessResult => {
    const total = Math.round(now() - startTime);
    const parseScoreMs = Math.round(tParseScore);
    const aiMs = Math.round(tAi);
    const guardrailMs = Math.round(tGuardrail);
    const isRetried = retried || callTracker.count > 1;
    console.log(
      `[TIMING] total=${total} parse_score=${parseScoreMs} ai=${aiMs} guardrail=${guardrailMs} attempts=${callTracker.count} retried=${isRetried}`
    );
    return result;
  };

  // (1) Check raw body size limit of 100 KB (HTTP 413)
  let rawBytes = 0;
  if (typeof body === "string") {
    rawBytes = Buffer.byteLength(body, "utf8");
  } else if (body && typeof body === "object") {
    try {
      rawBytes = Buffer.byteLength(JSON.stringify(body), "utf8");
    } catch {
      rawBytes = 0;
    }
  }

  if (rawBytes > MAX_RAW_BYTES) {
    console.error("[API_ERROR] INPUT_TOO_LARGE attempts=0");
    return respond({
      status: 413,
      data: {
        error: {
          code: "INPUT_TOO_LARGE",
          message: "Input exceeds maximum allowed size of 100 KB.",
        },
      },
    });
  }

  // (2) Extract input and check for empty or whitespace-only input (HTTP 400)
  let extractedInput: unknown;
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      extractedInput = parsed?.input;
    } catch {
      extractedInput = undefined;
    }
  } else if (body && typeof body === "object" && "input" in body) {
    extractedInput = (body as Record<string, unknown>).input;
  }

  if (typeof extractedInput !== "string" || extractedInput.trim().length === 0) {
    console.error("[API_ERROR] EMPTY_INPUT attempts=0");
    return respond({
      status: 400,
      data: {
        error: {
          code: "EMPTY_INPUT",
          message: PRD_NONSENSICAL_MESSAGE,
        },
      },
    });
  }

  // (3) Truncate to 10,000 characters if longer, setting truncated: true
  let finalInput = extractedInput;
  let truncated = false;
  if (finalInput.length > 10000) {
    finalInput = finalInput.slice(0, 10000);
    truncated = true;
  }

  // Validate with ConfessRequestSchema
  const reqParse = ConfessRequestSchema.safeParse({ input: finalInput });
  if (!reqParse.success) {
    console.error("[API_ERROR] INVALID_INPUT attempts=0");
    return respond({
      status: 400,
      data: {
        error: {
          code: "INVALID_INPUT",
          message: PRD_NONSENSICAL_MESSAGE,
        },
      },
    });
  }

  // (4) Validate git input markers (HTTP 400)
  if (!validateGitInput(finalInput)) {
    console.error("[API_ERROR] INVALID_INPUT attempts=0");
    return respond({
      status: 400,
      data: {
        error: {
          code: "INVALID_INPUT",
          message: PRD_NONSENSICAL_MESSAGE,
        },
      },
    });
  }

  // (5) Parse git input and calculate deterministic Panic Score
  const t0Parse = now();
  const panicResult = calculatePanicScore(finalInput);
  tParseScore = now() - t0Parse;

  const baseScore = panicResult.baseScore;
  const baseSignals = panicResult.signals;
  const dominantReason = panicResult.dominantReason;

  // Development Mock Mode (AI_MOCK=1 ONLY when NODE_ENV === 'development')
  const isMockMode =
    process.env.AI_MOCK === "1" && process.env.NODE_ENV === "development";

  if (isMockMode) {
    let mockFixture = mockLateNightHotfix;
    if (finalInput.includes("session.ts") || finalInput.includes("rebase")) {
      mockFixture = mockRebaseConflict;
    } else if (
      finalInput.includes("upload.ts") ||
      finalInput.includes("storage")
    ) {
      mockFixture = mockWorksOnMachine;
    }

    return respond({
      status: 200,
      data: {
        ...mockFixture,
        truncated,
        isMock: true,
      },
    });
  }

  // (6) Call AI generation with 28-second overall request deadline
  let aiOutput: AIOutput;
  try {
    const elapsed = now() - startTime;
    const remainingMs = TOTAL_DEADLINE_MS - elapsed;

    if (remainingMs <= 0) {
      console.error(`[API_ERROR] AI_TIMEOUT attempts=${callTracker.count}`);
      return respond({
        status: 504,
        data: {
          error: {
            code: "AI_TIMEOUT",
            message: PRD_FAILURE_MESSAGE,
          },
        },
      });
    }

    const t0Ai = now();
    try {
      aiOutput = await generateReportFn(finalInput, baseSignals, {
        deadlineMs: remainingMs,
        callTracker,
      });
    } finally {
      tAi += now() - t0Ai;
    }
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error && err.message.startsWith("AI_TIMEOUT");
    const errCode = isTimeout ? "AI_TIMEOUT" : "AI_GENERATION_FAILED";
    const status = isTimeout ? 504 : 502;
    console.error(`[API_ERROR] ${errCode} attempts=${callTracker.count}`);
    return respond({
      status,
      data: {
        error: {
          code: errCode,
          message: PRD_FAILURE_MESSAGE,
        },
      },
    });
  }

  // (7) Guardrail check: verify file names across all AI output texts
  const t0Guard = now();
  let guardrail = checkFileNames(collectAllAiTexts(aiOutput), finalInput);
  tGuardrail += now() - t0Guard;

  if (!guardrail.ok) {
    const elapsed = now() - startTime;
    const remainingMs = TOTAL_DEADLINE_MS - elapsed;

    // Retry AI call ONCE with firmer reminder ONLY if remaining time >= 10s AND total calls < 2
    if (remainingMs >= 10000 && callTracker.count < 2) {
      retried = true;
      try {
        const t0Ai2 = now();
        try {
          aiOutput = await generateReportFn(finalInput, baseSignals, {
            deadlineMs: remainingMs,
            callTracker,
            extraSystemInstruction:
              "STRICT GUARDRAIL REMINDER: Do not mention file names that are not in the input.",
          });
        } finally {
          tAi += now() - t0Ai2;
        }

        const t0Guard2 = now();
        guardrail = checkFileNames(collectAllAiTexts(aiOutput), finalInput);
        tGuardrail += now() - t0Guard2;

        if (!guardrail.ok) {
          console.error(`[API_ERROR] GUARDRAIL_FAILED attempts=${callTracker.count}`);
          return respond({
            status: 502,
            data: {
              error: {
                code: "GUARDRAIL_FAILED",
                message: PRD_FAILURE_MESSAGE,
              },
            },
          });
        }
      } catch (err: unknown) {
        const isTimeout =
          err instanceof Error && err.message.startsWith("AI_TIMEOUT");
        const errCode = isTimeout ? "AI_TIMEOUT" : "AI_GENERATION_FAILED";
        const status = isTimeout ? 504 : 502;
        console.error(`[API_ERROR] ${errCode} attempts=${callTracker.count}`);
        return respond({
          status,
          data: {
            error: {
              code: errCode,
              message: PRD_FAILURE_MESSAGE,
            },
          },
        });
      }
    } else {
      // Cannot retry: out of time or 2-call quota exhausted
      console.error(`[API_ERROR] GUARDRAIL_FAILED attempts=${callTracker.count}`);
      return respond({
        status: 502,
        data: {
          error: {
            code: "GUARDRAIL_FAILED",
            message: PRD_FAILURE_MESSAGE,
          },
        },
      });
    }
  }

  // (8) Final Score calculation: clamp(baseScore + aiAdjustment, 0, 100)
  const clampedAiAdjustment = Math.max(
    -15,
    Math.min(15, Math.round(aiOutput.aiAdjustment))
  );
  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(baseScore + clampedAiAdjustment))
  );
  const severity = computeSeverity(finalScore);

  // (9) Assemble response and validate with ConfessResponseSchema
  const lessonsLearned = formatLessonsLearned(panicResult.parsed.commits);

  const responseCandidate: ConfessResponse = {
    panicScore: {
      finalScore,
      baseScore,
      aiAdjustment: clampedAiAdjustment,
      aiAdjustmentReason: aiOutput.aiAdjustmentReason,
      severity,
      dominantReason,
      signals: baseSignals,
    },
    incidentReport: {
      severity,
      whatHappened: aiOutput.whatHappened,
      cause: aiOutput.cause,
      fix: aiOutput.fix,
      lessonsLearned,
    },
    prDescription: {
      summary: aiOutput.prSummary,
      whatChanged: aiOutput.whatChanged,
      howToCheck: aiOutput.howToCheck,
    },
    truncated,
  };

  const responseParse = ConfessResponseSchema.safeParse(responseCandidate);
  if (!responseParse.success) {
    console.error(
      `[API_ERROR] AI_GENERATION_FAILED attempts=${callTracker.count}`
    );
    return respond({
      status: 502,
      data: {
        error: {
          code: "AI_GENERATION_FAILED",
          message: PRD_FAILURE_MESSAGE,
        },
      },
    });
  }

  return respond({
    status: 200,
    data: responseParse.data,
  });
}
