// tests/ui-logic.test.ts
// Unit tests for pure UI logic functions (format copy, severity styles, popover rows).

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatIncidentReportCopy,
  formatPrDescriptionCopy,
  getSeverityStyle,
  buildPopoverRows,
} from "../src/lib/ui-logic.ts";
import {
  mockLateNightHotfix,
  mockRebaseConflict,
  mockWorksOnMachine,
} from "./fixtures/mock-responses.ts";

describe("UI Pure Logic", () => {
  it("formats incident report copy into exactly 5 lines matching PRD", () => {
    const text = formatIncidentReportCopy(mockLateNightHotfix.incidentReport);
    const lines = text.split("\n");
    assert.equal(lines.length, 5);
    assert.equal(lines[0], "Severity: MODERATE");
    assert.ok(lines[1].startsWith("What happened: "));
    assert.ok(lines[2].startsWith("Cause: "));
    assert.ok(lines[3].startsWith("Fix: "));
    assert.ok(lines[4].startsWith("Lessons learned: "));
  });

  it("formats PR description copy into markdown with summary, changes, and checks", () => {
    const markdown = formatPrDescriptionCopy(mockLateNightHotfix.prDescription);
    assert.ok(markdown.includes("## Summary"));
    assert.ok(markdown.includes("## What changed"));
    assert.ok(markdown.includes("## How to check"));
    assert.ok(markdown.includes("- Added billing address presence validation in src/payments/checkout.ts"));
  });

  it("maps severity levels to correct 1-hue #C2410C styles per PRD", () => {
    const minor = getSeverityStyle("MINOR");
    assert.equal(minor.backgroundColor, "transparent");
    assert.equal(minor.color, "#5F5C55");

    const moderate = getSeverityStyle("MODERATE");
    assert.equal(moderate.backgroundColor, "transparent");
    assert.equal(moderate.color, "#C2410C");

    const major = getSeverityStyle("MAJOR");
    assert.equal(major.backgroundColor, "#FBE9DF");
    assert.equal(major.color, "#C2410C");

    const critical = getSeverityStyle("CRITICAL");
    assert.equal(critical.backgroundColor, "#C2410C");
    assert.equal(critical.color, "#FFFFFF");
  });

  it("builds popover rows with itemized breakdown and disclaimer", () => {
    const rows = buildPopoverRows(mockLateNightHotfix.panicScore);
    assert.equal(rows.length, 9);
    assert.equal(rows[0].label, "Base score from code");
    assert.equal(rows[0].value, "33");

    // Check last row is disclaimer
    const lastRow = rows[rows.length - 1];
    assert.equal(lastRow.isDisclaimer, true);
    assert.equal(lastRow.value, "A rule-of-thumb score, not a validated measure.");
  });

  it("handles diff-only inputs with unavailable commit signals gracefully in popover rows", () => {
    const diffOnlyScore = {
      ...mockLateNightHotfix.panicScore,
      signals: {
        ...mockLateNightHotfix.panicScore.signals,
        rushedCommits: { points: 0, evidence: "", available: false },
        shoutingMashing: { points: 0, evidence: "", available: false },
        repeatedFiles: { points: 0, evidence: "", available: false },
      },
    };

    const rows = buildPopoverRows(diffOnlyScore);
    const rushedRow = rows.find((r) => r.label === "Rushed commit messages");
    const shoutingRow = rows.find((r) => r.label === "Shouting or keyboard mashing");
    const repeatedRow = rows.find((r) => r.label === "Same file edited again and again");

    assert.equal(rushedRow?.value, "Not available (no commit messages)");
    assert.equal(shoutingRow?.value, "Not available (no commit messages)");
    assert.equal(repeatedRow?.value, "Not available (no commit messages)");
  });
});
