// src/lib/panic-score.ts
// Standalone module for git input parsing, validation, and deterministic Panic Score calculation.
// No external runtime imports. Node.js type-strip compatible (no enums/namespaces).

export interface ParsedCommit {
  hash: string;
  message: string;
  files: string[];
}

export interface ParsedInput {
  commits: ParsedCommit[];
  files: string[];
  addedLines: string[];
  deletedLines: string[];
  totalChanged: number;
  hasDiff: boolean;
  hasCommits: boolean;
  hasCommitFiles: boolean;
}

export interface SignalResult {
  points: number;
  evidence: string;
  available: boolean;
}

export interface BaseScoreSignals {
  rushedCommits: SignalResult;
  shoutingMashing: SignalResult;
  repeatedFiles: SignalResult;
  debugLeftovers: SignalResult;
  diffSize: SignalResult;
  baseScore: number;
  dominantSignalReason: string;
}

export type SeverityBand = "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL";

export interface PanicScoreResult {
  valid: boolean;
  errorMessage?: string;
  baseScore: number;
  finalScore: number;
  severity: SeverityBand;
  dominantReason: string;
  signals: BaseScoreSignals;
  parsed: ParsedInput;
}

const LOW_EFFORT_SET = new Set([
  "fix",
  "fixed",
  "fix again",
  "wip",
  "test",
  "tests",
  "asdf",
  "asdfgh",
  "try again",
  "???",
]);

const NONSENSICAL_ERROR_MESSAGE =
  "That doesn't look like commits or code changes. Paste a git diff or commit messages and try again.";

/**
 * Validates if the input meets the minimum criteria for git changes.
 */
export function validateGitInput(input: string): boolean {
  if (!input || typeof input !== "string" || input.length < 20) {
    return false;
  }

  // Check specific git markers per spec/contract
  if (input.includes("diff --git ")) return true;
  if (/@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/.test(input)) return true;
  if (input.includes("+++ b/")) return true;
  if (input.includes("--- a/")) return true;
  if (/commit [a-f0-9]{7,40}/.test(input)) return true;
  if (/^[a-f0-9]{7,40} .+/m.test(input)) return true;

  return false;
}

/**
 * Parses git input into structured format for scoring and guardrail validation.
 */
export function parseInput(input: string): ParsedInput {
  const lines = input.split(/\r?\n/);
  const commits: ParsedCommit[] = [];
  const filesSet = new Set<string>();
  const addedLines: string[] = [];
  const deletedLines: string[] = [];

  let currentCommit: ParsedCommit | null = null;
  let inIndentedMessage = false;
  let inDiffSection = false;

  const defaultCommitHeaderRegex = /^commit\s+([a-f0-9]{7,40})/i;
  const onelineCommitRegex = /^([a-f0-9]{7,40})\s+(.+)$/;
  const diffGitRegex = /^diff --git\s+a\/(.+?)\s+b\/(.+)$/;
  const plusFileRegex = /^\+\+\+\s+b\/(.+)$/;
  const minusFileRegex = /^---\s+a\/(.+)$/;
  const statLineRegex = /^\s*([a-zA-Z0-9_\-\./\\]+\.[a-zA-Z0-9]{1,8})\s+\|\s+\d+/;

  // First pass: detect if there are full 'commit <hash>' blocks
  const hasFullCommitBlocks = lines.some((l) => defaultCommitHeaderRegex.test(l));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for standard commit header (git log / git show / git log -p)
    const commitMatch = line.match(defaultCommitHeaderRegex);
    if (commitMatch) {
      if (currentCommit) {
        currentCommit.message = currentCommit.message.trim();
        commits.push(currentCommit);
      }
      currentCommit = {
        hash: commitMatch[1],
        message: "",
        files: [],
      };
      inIndentedMessage = false;
      inDiffSection = false;
      continue;
    }

    // If not using full commit blocks, check for oneline format
    if (!hasFullCommitBlocks && !line.startsWith("+") && !line.startsWith("-")) {
      const onelineMatch = line.match(onelineCommitRegex);
      if (onelineMatch) {
        commits.push({
          hash: onelineMatch[1],
          message: onelineMatch[2].trim(),
          files: [],
        });
        continue;
      }
    }

    // Parsing inside a full commit block
    if (currentCommit) {
      // Check author/date lines or blank separator
      if (!inDiffSection && /^(Author|Date|Merge|AuthorDate|Commit|CommitDate):/i.test(line)) {
        inIndentedMessage = false;
        continue;
      }

      // If we encounter diff markers, diff lines, or stat lines, stop treating as commit message
      if (
        line.startsWith("diff ") ||
        line.startsWith("---") ||
        line.startsWith("+++") ||
        line.startsWith("@@") ||
        line.startsWith("+") ||
        line.startsWith("-") ||
        statLineRegex.test(line)
      ) {
        inDiffSection = true;
        inIndentedMessage = false;
      } else if (!inDiffSection) {
        if (line.trim() === "") {
          inIndentedMessage = true;
          continue;
        }

        if (inIndentedMessage || /^(\s{4}|\t)/.test(line)) {
          if (!line.startsWith("commit ") && !line.startsWith("diff ")) {
            const msgLine = line.trim();
            if (msgLine) {
              currentCommit.message = currentCommit.message ? `${currentCommit.message} ${msgLine}` : msgLine;
            }
            continue;
          }
        }
      }
    }

    // Extract files from diff headers
    const diffMatch = line.match(diffGitRegex);
    if (diffMatch) {
      const pathB = diffMatch[2].trim();
      filesSet.add(pathB);
      if (currentCommit && !currentCommit.files.includes(pathB)) {
        currentCommit.files.push(pathB);
      }
      continue;
    }

    const plusMatch = line.match(plusFileRegex);
    if (plusMatch) {
      const fileB = plusMatch[1].trim();
      if (fileB !== "/dev/null") {
        filesSet.add(fileB);
        if (currentCommit && !currentCommit.files.includes(fileB)) {
          currentCommit.files.push(fileB);
        }
      }
      continue;
    }

    const minusMatch = line.match(minusFileRegex);
    if (minusMatch) {
      const fileA = minusMatch[1].trim();
      if (fileA !== "/dev/null") {
        filesSet.add(fileA);
        if (currentCommit && !currentCommit.files.includes(fileA)) {
          currentCommit.files.push(fileA);
        }
      }
      continue;
    }

    // Check stat lines if present (--stat)
    const statMatch = line.match(statLineRegex);
    if (statMatch) {
      const statFile = statMatch[1].trim();
      filesSet.add(statFile);
      if (currentCommit && !currentCommit.files.includes(statFile)) {
        currentCommit.files.push(statFile);
      }
      continue;
    }

    // Added and deleted lines (excluding diff headers +++ and ---)
    if (line.startsWith("+") && !line.startsWith("+++")) {
      addedLines.push(line.slice(1));
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      deletedLines.push(line.slice(1));
    }
  }

  if (currentCommit) {
    currentCommit.message = currentCommit.message.trim();
    commits.push(currentCommit);
  }

  const files = Array.from(filesSet);
  const totalChanged = addedLines.length + deletedLines.length;
  const hasDiff = totalChanged > 0 || files.length > 0;
  const hasCommits = commits.length > 0;
  const hasCommitFiles = commits.some((c) => c.files.length > 0);

  return {
    commits,
    files,
    addedLines,
    deletedLines,
    totalChanged,
    hasDiff,
    hasCommits,
    hasCommitFiles,
  };
}

/**
 * Calculates Base Panic Score deterministically from parsed input.
 */
export function calculatePanicScore(input: string): PanicScoreResult {
  const isValid = validateGitInput(input);
  if (!isValid) {
    return {
      valid: false,
      errorMessage: NONSENSICAL_ERROR_MESSAGE,
      baseScore: 0,
      finalScore: 0,
      severity: "MINOR",
      dominantReason: "Input does not contain valid git commits or diff markers.",
      signals: {
        rushedCommits: { points: 0, evidence: "Not available (invalid input)", available: false },
        shoutingMashing: { points: 0, evidence: "Not available (invalid input)", available: false },
        repeatedFiles: { points: 0, evidence: "Not available (invalid input)", available: false },
        debugLeftovers: { points: 0, evidence: "Not available (invalid input)", available: false },
        diffSize: { points: 0, evidence: "Not available (invalid input)", available: false },
        baseScore: 0,
        dominantSignalReason: "No signals available due to invalid input.",
      },
      parsed: {
        commits: [],
        files: [],
        addedLines: [],
        deletedLines: [],
        totalChanged: 0,
        hasDiff: false,
        hasCommits: false,
        hasCommitFiles: false,
      },
    };
  }

  const parsed = parseInput(input);

  // --- Signal 1: Rushed Commit Messages (max 30 pts) ---
  let s1Points = 0;
  let s1Evidence = "Not available (no commit messages)";
  let s1Available = parsed.hasCommits;

  if (s1Available) {
    const totalCommits = parsed.commits.length;
    let lowEffortCount = 0;
    const seenMessages = new Set<string>();

    for (const commit of parsed.commits) {
      const msg = commit.message.toLowerCase().trim();
      const isFixedWord = LOW_EFFORT_SET.has(msg);
      const isSingleWord = msg.length > 0 && !msg.includes(" ");
      const isDuplicate = seenMessages.has(msg);

      if (isFixedWord || isSingleWord || isDuplicate) {
        lowEffortCount++;
      }
      seenMessages.add(msg);
    }

    s1Points = totalCommits > 0 ? Math.round((lowEffortCount / totalCommits) * 30) : 0;
    s1Evidence = `${lowEffortCount} of ${totalCommits} commit messages are low-effort`;
  }

  // --- Signal 2: Shouting or Keyboard Mashing (max 10 pts) ---
  let s2Points = 0;
  let s2Evidence = "Not available (no commit messages)";
  let s2Available = parsed.hasCommits;

  if (s2Available) {
    let shoutingFound = false;
    let evidenceSnippet = "";

    for (const commit of parsed.commits) {
      const msg = commit.message;

      // Shouting: ALL CAPS with >= 4 letters
      const capsMatch = msg.match(/\b[A-Z]{4,}\b/);
      if (capsMatch) {
        shoutingFound = true;
        evidenceSnippet = capsMatch[0];
        break;
      }

      // Shouting: [!?]{3,}
      const punctMatch = msg.match(/[!?]{3,}/);
      if (punctMatch) {
        shoutingFound = true;
        evidenceSnippet = punctMatch[0];
        break;
      }

      // Mashing: character repeated 5 times or more
      const mashMatch = msg.match(/(.)\1{4,}/);
      if (mashMatch) {
        shoutingFound = true;
        evidenceSnippet = mashMatch[0];
        break;
      }
    }

    if (shoutingFound) {
      s2Points = 10;
      s2Evidence = `Detected shouting or character mashing: "${evidenceSnippet}"`;
    } else {
      s2Points = 0;
      s2Evidence = "No shouting or character mashing detected";
    }
  }

  // --- Signal 3: Repeated File Touches (max 20 pts) ---
  let s3Points = 0;
  let s3Evidence = "Not available (no per-commit file history)";
  let s3Available = parsed.hasCommitFiles;

  if (s3Available) {
    const fileCommitCounts: Record<string, number> = {};
    for (const commit of parsed.commits) {
      for (const file of commit.files) {
        fileCommitCounts[file] = (fileCommitCounts[file] || 0) + 1;
      }
    }

    let maxTouches = 0;
    let churnFile = "";

    for (const [file, count] of Object.entries(fileCommitCounts)) {
      if (count > maxTouches) {
        maxTouches = count;
        churnFile = file;
      }
    }

    if (maxTouches >= 3) {
      s3Points = 20;
      s3Evidence = `"${churnFile}" modified across ${maxTouches} commits`;
    } else if (maxTouches === 2) {
      s3Points = 10;
      s3Evidence = `"${churnFile}" modified across 2 commits`;
    } else {
      s3Points = 0;
      s3Evidence = `Files modified across at most ${maxTouches} commits`;
    }
  }

  // --- Signal 4: Debug Leftovers (max 20 pts) ---
  let s4Points = 0;
  let s4Evidence = "Not available (no diff lines)";
  let s4Available = parsed.hasDiff;

  if (s4Available) {
    let debugCount = 0;
    const debugRegex = /\b(?:console\.log|debugger|var_dump)\b|\bprint\(/g;

    for (const line of parsed.addedLines) {
      const matches = line.match(debugRegex);
      if (matches) {
        debugCount += matches.length;
      }
    }

    s4Points = Math.min(5, debugCount) * 4;
    s4Evidence = `${debugCount} debug statements found in added lines`;
  }

  // --- Signal 5: Diff Size (max 20 pts) ---
  let s5Points = 0;
  let s5Evidence = "Not available (no diff lines)";
  let s5Available = parsed.hasDiff;

  if (s5Available) {
    const count = parsed.totalChanged;
    if (count > 300) {
      s5Points = 20;
    } else if (count >= 100) {
      s5Points = 10;
    } else {
      s5Points = 0;
    }
    s5Evidence = `${count} total lines changed in diff`;
  }

  // --- General Dynamic Normalization ---
  let maxAvailable = 0;
  let earnedPoints = 0;

  if (s1Available) {
    maxAvailable += 30;
    earnedPoints += s1Points;
  }
  if (s2Available) {
    maxAvailable += 10;
    earnedPoints += s2Points;
  }
  if (s3Available) {
    maxAvailable += 20;
    earnedPoints += s3Points;
  }
  if (s4Available) {
    maxAvailable += 20;
    earnedPoints += s4Points;
  }
  if (s5Available) {
    maxAvailable += 20;
    earnedPoints += s5Points;
  }

  const baseScore =
    maxAvailable > 0
      ? Math.min(100, Math.max(0, Math.round((earnedPoints * 100) / maxAvailable)))
      : 0;

  // --- Severity Classification ---
  let severity: SeverityBand = "MINOR";
  if (baseScore >= 75) {
    severity = "CRITICAL";
  } else if (baseScore >= 50) {
    severity = "MAJOR";
  } else if (baseScore >= 25) {
    severity = "MODERATE";
  } else {
    severity = "MINOR";
  }

  // --- Dominant Signal Reason ---
  // Signals ordered 1 through 5. Tie breaks in favor of lower index.
  const signalRanks = [
    { id: 1, points: s1Points, available: s1Available, reason: "Frequent low-effort commit messages indicate rushed progression." },
    { id: 2, points: s2Points, available: s2Available, reason: "Aggressive punctuation or shouting indicates elevated developer stress." },
    { id: 3, points: s3Points, available: s3Available, reason: "Repeated modifications to the same files signal persistent churn." },
    { id: 4, points: s4Points, available: s4Available, reason: "Leftover debugging statements indicate uncleaned work." },
    { id: 5, points: s5Points, available: s5Available, reason: "Large changeset volume increases risk and review complexity." },
  ];

  let topSignal = signalRanks.find((s) => s.available && s.points > 0);
  for (const s of signalRanks) {
    if (s.available && s.points > (topSignal?.points ?? 0)) {
      topSignal = s;
    }
  }

  const dominantReason = topSignal
    ? topSignal.reason
    : "No significant panic signals detected in changeset.";

  return {
    valid: true,
    baseScore,
    finalScore: baseScore,
    severity,
    dominantReason,
    signals: {
      rushedCommits: { points: s1Points, evidence: s1Evidence, available: s1Available },
      shoutingMashing: { points: s2Points, evidence: s2Evidence, available: s2Available },
      repeatedFiles: { points: s3Points, evidence: s3Evidence, available: s3Available },
      debugLeftovers: { points: s4Points, evidence: s4Evidence, available: s4Available },
      diffSize: { points: s5Points, evidence: s5Evidence, available: s5Available },
      baseScore,
      dominantSignalReason: dominantReason,
    },
    parsed,
  };
}

/**
 * Formats a single commit message for display in lessons learned:
 * 1. Trim leading and trailing whitespace.
 * 2. Sanitize internal single quotes (replace ' with ’) to prevent quote collisions.
 * 3. If longer than 30 characters:
 *    - Cut at the last word boundary before 30 characters (or at 30 chars if no space).
 *    - Strip trailing punctuation and whitespace.
 *    - Append '...'.
 * 4. Ensures no whitespace precedes the closing quote and preserves casing.
 */
function formatSingleLessonMessage(rawMsg: string): string {
  let msg = rawMsg.trim();
  msg = msg.replace(/'/g, "’");

  if (msg.length <= 30) {
    return msg;
  }

  const slice = msg.slice(0, 30);
  const lastSpace = slice.lastIndexOf(" ");
  let cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;

  cut = cut.replace(/[\s\.,;:!\?\-_'"’]+$/, "");

  return cut + "...";
}

/**
 * Formats the Incident Report's 'lessonsLearned' line deterministically from parsed commit messages.
 * Rules (DEC-026):
 * - If no commit log provided (empty/null array): "No commit messages were provided."
 * - If commit log exists but has no non-empty messages: "The change was made in N commits."
 * - If commit messages exist: Always quote up to 3 messages in commit order, then ' and N more' if > 3.
 */
export function formatLessonsLearned(commits: ParsedCommit[]): string {
  if (!commits || commits.length === 0) {
    return "No commit messages were provided.";
  }

  const validMessages = commits
    .map((c) => (c.message ? c.message.trim() : ""))
    .filter((m) => m.length > 0);

  if (validMessages.length === 0) {
    return `The change was made in ${commits.length} commits.`;
  }

  const formatted = validMessages.slice(0, 3).map(formatSingleLessonMessage);
  const remaining = validMessages.length - 3;

  if (remaining > 0) {
    return `The commit messages were '${formatted[0]}', '${formatted[1]}', '${formatted[2]}' and ${remaining} more.`;
  }

  if (formatted.length === 1) {
    return `The commit messages were '${formatted[0]}'.`;
  }

  if (formatted.length === 2) {
    return `The commit messages were '${formatted[0]}' and '${formatted[1]}'.`;
  }

  return `The commit messages were '${formatted[0]}', '${formatted[1]}' and '${formatted[2]}'.`;
}
