// src/lib/ui-logic.ts
// Pure UI helper functions for copy formatting, severity badge styling, and popover breakdown rows.
// Easily testable with node --test without requiring DOM or React environment.

import type {
  IncidentReport,
  PRDescription,
  SeverityBand,
  ConfessResponse,
} from "./schema.ts";

export interface SeverityStyle {
  border: string;
  color: string;
  backgroundColor: string;
  badgeClass: string;
}

export interface PopoverRow {
  label: string;
  value: string;
  isDisclaimer?: boolean;
}

/**
 * Formats the 5-line Incident Report into plain text for clipboard copy.
 */
export function formatIncidentReportCopy(report: IncidentReport): string {
  return [
    `Severity: ${report.severity}`,
    `What happened: ${report.whatHappened}`,
    `Cause: ${report.cause}`,
    `Fix: ${report.fix}`,
    `Lessons learned: ${report.lessonsLearned}`,
  ].join("\n");
}

/**
 * Formats the PR Description into markdown text for clipboard copy.
 */
export function formatPrDescriptionCopy(pr: PRDescription): string {
  const parts: string[] = ["## Summary", pr.summary, "", "## What changed"];

  for (const item of pr.whatChanged) {
    parts.push(`- ${item}`);
  }

  parts.push("", "## How to check");

  for (const item of pr.howToCheck) {
    parts.push(`- ${item}`);
  }

  return parts.join("\n");
}

/**
 * Maps severity band to single-hue #C2410C styling tokens per devpost/prd.md Section 3:
 * - Minor (0-24): Neutral charcoal outline (#5F5C55), no accent fill.
 * - Moderate (25-49): Accent outline (#C2410C), accent text, transparent fill.
 * - Major (50-74): Accent text on light accent tint fill (#FBE9DF), 1px accent border.
 * - Critical (75-100): Solid accent fill (#C2410C), crisp white text (#FFFFFF).
 */
export function getSeverityStyle(severity: SeverityBand): SeverityStyle {
  switch (severity) {
    case "CRITICAL":
      return {
        border: "1px solid #C2410C",
        color: "#FFFFFF",
        backgroundColor: "#C2410C",
        badgeClass: "bg-[#C2410C] text-[#FFFFFF] border border-[#C2410C]",
      };
    case "MAJOR":
      return {
        border: "1px solid #C2410C",
        color: "#C2410C",
        backgroundColor: "#FBE9DF",
        badgeClass: "bg-[#FBE9DF] text-[#C2410C] border border-[#C2410C]",
      };
    case "MODERATE":
      return {
        border: "1px solid #C2410C",
        color: "#C2410C",
        backgroundColor: "transparent",
        badgeClass: "bg-transparent text-[#C2410C] border border-[#C2410C]",
      };
    case "MINOR":
    default:
      return {
        border: "1px solid #5F5C55",
        color: "#5F5C55",
        backgroundColor: "transparent",
        badgeClass: "bg-transparent text-[#5F5C55] border border-[#5F5C55]",
      };
  }
}

/**
 * Assembles the itemized breakdown rows for the "Why this score?" popover.
 * Handles diff-only inputs by outputting "Not available (no commit messages)".
 */
export function buildPopoverRows(
  panicScore: ConfessResponse["panicScore"]
): PopoverRow[] {
  const { signals, baseScore, aiAdjustment, aiAdjustmentReason, finalScore, severity } =
    panicScore;

  const rows: PopoverRow[] = [
    {
      label: "Base score from code",
      value: `${baseScore}`,
    },
    {
      label: "Rushed commit messages",
      value: signals.rushedCommits.available
        ? `${signals.rushedCommits.evidence} (+${signals.rushedCommits.points})`
        : "Not available (no commit messages)",
    },
    {
      label: "Shouting or keyboard mashing",
      value: signals.shoutingMashing.available
        ? `${signals.shoutingMashing.evidence} (+${signals.shoutingMashing.points})`
        : "Not available (no commit messages)",
    },
    {
      label: "Same file edited again and again",
      value: signals.repeatedFiles.available
        ? `${signals.repeatedFiles.evidence} (+${signals.repeatedFiles.points})`
        : "Not available (no commit messages)",
    },
    {
      label: "Leftover debug code",
      value: `${signals.debugLeftovers.evidence} (+${signals.debugLeftovers.points})`,
    },
    {
      label: "Size of the change",
      value: `${signals.diffSize.evidence} (+${signals.diffSize.points})`,
    },
    {
      label: "AI adjustment",
      value: `${aiAdjustment >= 0 ? `+${aiAdjustment}` : `${aiAdjustment}`}, ${aiAdjustmentReason}`,
    },
    {
      label: "Final Score & Severity",
      value: `${finalScore} (${severity})`,
    },
    {
      label: "Transparency Note",
      value: "A rule-of-thumb score, not a validated measure.",
      isDisclaimer: true,
    },
  ];

  return rows;
}
