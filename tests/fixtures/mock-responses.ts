// tests/fixtures/mock-responses.ts
// Fixed mock fixtures for development mode (AI_MOCK=1).
// Validated against ConfessResponseSchema with three distinct severity levels.

import type { ConfessResponse } from "../../src/lib/schema.ts";

export const mockLateNightHotfix: ConfessResponse = {
  panicScore: {
    finalScore: 45,
    baseScore: 33,
    aiAdjustment: 12,
    aiAdjustmentReason: "Detected hasty hotfix markers and debug statements in checkout module.",
    severity: "MODERATE",
    dominantReason: "Repeated file touches on src/payments/checkout.ts",
    signals: {
      rushedCommits: {
        points: 8,
        evidence: "2 low-effort messages ('fix', 'try again')",
        available: true,
      },
      shoutingMashing: {
        points: 0,
        evidence: "No shouting or key mashing detected",
        available: true,
      },
      repeatedFiles: {
        points: 10,
        evidence: "src/payments/checkout.ts changed across 2 commits",
        available: true,
      },
      debugLeftovers: {
        points: 5,
        evidence: "1 leftover console.log statement",
        available: true,
      },
      diffSize: {
        points: 10,
        evidence: "112 lines changed",
        available: true,
      },
      baseScore: 33,
      dominantSignalReason: "Repeated file touches on src/payments/checkout.ts",
    },
  },
  incidentReport: {
    severity: "MODERATE",
    whatHappened: "Order processing logic was modified across 2 commits with repeated changes to src/payments/checkout.ts.",
    cause: "Under investigation.",
    fix: "A conditional check for billing address presence was introduced and subsequent logging statements were commented out.",
    lessonsLearned: "Emergency patches were applied directly to production paths without prior staging validation.",
  },
  prDescription: {
    summary: "Updates order validation checks in the checkout module.",
    whatChanged: [
      "Added billing address presence validation in src/payments/checkout.ts",
      "Commented out debug logging statement in src/payments/checkout.ts",
    ],
    howToCheck: [
      "Verify order processing behavior with missing billing addresses in src/payments/checkout.ts",
    ],
  },
  truncated: false,
  isMock: true,
};

export const mockRebaseConflict: ConfessResponse = {
  panicScore: {
    finalScore: 18,
    baseScore: 18,
    aiAdjustment: 0,
    aiAdjustmentReason: "Standard rebase conflict resolution without additional panic indicators.",
    severity: "MINOR",
    dominantReason: "Diff size volume during rebase synchronization",
    signals: {
      rushedCommits: {
        points: 4,
        evidence: "1 repetitive commit message",
        available: true,
      },
      shoutingMashing: {
        points: 0,
        evidence: "No shouting detected",
        available: true,
      },
      repeatedFiles: {
        points: 4,
        evidence: "src/auth/session.ts edited during merge",
        available: true,
      },
      debugLeftovers: {
        points: 0,
        evidence: "No leftover debug code",
        available: true,
      },
      diffSize: {
        points: 10,
        evidence: "95 lines changed",
        available: true,
      },
      baseScore: 18,
      dominantSignalReason: "Diff size volume during rebase synchronization",
    },
  },
  incidentReport: {
    severity: "MINOR",
    whatHappened: "Session verification logic in src/auth/session.ts was modified across 6 commits due to merge conflicts.",
    cause: "Under investigation.",
    fix: "Signature verification return logic was established and debug artifacts were removed.",
    lessonsLearned: "Rebase operations were conducted without intermediate validation checks.",
  },
  prDescription: {
    summary: "Resolves merge conflicts in session authentication and ensures signature verification returns boolean output.",
    whatChanged: [
      "Added session timeout constant definition",
      "Implemented token existence check",
      "Restored signature verification return statement",
    ],
    howToCheck: [
      "Run authentication test suite against src/auth/session.ts",
      "Verify absence of debug logging statements in production code",
    ],
  },
  truncated: false,
  isMock: true,
};

export const mockWorksOnMachine: ConfessResponse = {
  panicScore: {
    finalScore: 82,
    baseScore: 72,
    aiAdjustment: 10,
    aiAdjustmentReason: "High-frequency desperate commits and trial-and-error permissions changes.",
    severity: "CRITICAL",
    dominantReason: "Repeated file touches across 6 frantic commits on src/storage/upload.ts",
    signals: {
      rushedCommits: {
        points: 20,
        evidence: "5 low-effort commit messages in rapid succession",
        available: true,
      },
      shoutingMashing: {
        points: 12,
        evidence: "Commit messages contain shouting capitalization",
        available: true,
      },
      repeatedFiles: {
        points: 20,
        evidence: "src/storage/upload.ts touched repeatedly across 6 commits",
        available: true,
      },
      debugLeftovers: {
        points: 10,
        evidence: "Multiple console.log and permission bypass probes",
        available: true,
      },
      diffSize: {
        points: 10,
        evidence: "145 lines changed",
        available: true,
      },
      baseScore: 72,
      dominantSignalReason: "Repeated file touches across 6 frantic commits on src/storage/upload.ts",
    },
  },
  incidentReport: {
    severity: "CRITICAL",
    whatHappened: "The file src/storage/upload.ts was modified across 6 consecutive commits with debug statements left in the code.",
    cause: "Under investigation.",
    fix: "Directory path resolution and permission enforcement were implemented.",
    lessonsLearned: "Environmental constraints were addressed through iterative adjustments rather than systematic analysis.",
  },
  prDescription: {
    summary: "Updates file upload utility with directory configuration, path handling, and permission settings.",
    whatChanged: [
      "Configured upload base directory from environment variable",
      "Added path joining and directory creation logic",
      "Included debug logging statements",
      "Applied explicit permission settings to the upload directory",
    ],
    howToCheck: [
      "Verify file upload behavior against configured environment variables",
      "Check directory permissions on the target storage path",
    ],
  },
  truncated: false,
  isMock: true,
};
