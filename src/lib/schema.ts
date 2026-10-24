// src/lib/schema.ts
// Zod schemas and TypeScript types for request, AI output, server response, and error payloads.
// Aligned with devpost/spec.md Section 8.

import { z } from "zod";

// --- 8.1 Server Request Schema ---
export const ConfessRequestSchema = z.object({
  input: z.string().min(1).max(100000),
});
export type ConfessRequest = z.infer<typeof ConfessRequestSchema>;

// --- 8.2 AI Output Schema (Raw LLM Generation Contract) ---
export const AIOutputSchema = z.object({
  aiAdjustment: z.number().int().min(-15).max(15),
  aiAdjustmentReason: z.string().max(240),
  whatHappened: z.string().max(300),
  cause: z.string().max(300),
  fix: z.string().max(300),
  prSummary: z.string().max(400),
  whatChanged: z.array(z.string().max(200)).max(4),
  howToCheck: z.array(z.string().max(200)).max(2),
});
export type AIOutput = z.infer<typeof AIOutputSchema>;

// --- 8.3 Server Response Schema (ConfessResponse) ---
export const SignalResultSchema = z.object({
  points: z.number(),
  evidence: z.string(),
  available: z.boolean(),
});
export type SignalResult = z.infer<typeof SignalResultSchema>;

export const BaseScoreSignalsSchema = z.object({
  rushedCommits: SignalResultSchema,
  shoutingMashing: SignalResultSchema,
  repeatedFiles: SignalResultSchema,
  debugLeftovers: SignalResultSchema,
  diffSize: SignalResultSchema,
  baseScore: z.number().min(0).max(100),
  dominantSignalReason: z.string(),
});
export type BaseScoreSignals = z.infer<typeof BaseScoreSignalsSchema>;

export const SeverityBandSchema = z.enum(["MINOR", "MODERATE", "MAJOR", "CRITICAL"]);
export type SeverityBand = z.infer<typeof SeverityBandSchema>;

export const IncidentReportSchema = z.object({
  severity: SeverityBandSchema,
  whatHappened: z.string(),
  cause: z.string(),
  fix: z.string(),
  lessonsLearned: z.string(),
});
export type IncidentReport = z.infer<typeof IncidentReportSchema>;

export const PRDescriptionSchema = z.object({
  summary: z.string(),
  whatChanged: z.array(z.string().max(200)).max(4),
  howToCheck: z.array(z.string().max(200)).max(2),
});
export type PRDescription = z.infer<typeof PRDescriptionSchema>;

export const ConfessResponseSchema = z.object({
  panicScore: z.object({
    finalScore: z.number().min(0).max(100),
    baseScore: z.number().min(0).max(100),
    aiAdjustment: z.number().int().min(-15).max(15),
    aiAdjustmentReason: z.string(),
    severity: SeverityBandSchema,
    dominantReason: z.string(),
    signals: BaseScoreSignalsSchema,
  }),
  incidentReport: IncidentReportSchema,
  prDescription: PRDescriptionSchema,
  truncated: z.boolean(),
  isMock: z.boolean().optional(),
});
export type ConfessResponse = z.infer<typeof ConfessResponseSchema>;

// --- 8.4 Error Response Schema ---
export const ErrorCodeSchema = z.enum([
  "EMPTY_INPUT",
  "INVALID_INPUT",
  "INPUT_TOO_LARGE",
  "AI_TIMEOUT",
  "AI_GENERATION_FAILED",
  "GUARDRAIL_FAILED",
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
  }),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
