// src/lib/guardrails.ts
// Output Guardrail Validator: checks AI output texts for invented file names against input git changes.
// No external runtime imports. Reuses parseInput from panic-score.ts.

import { parseInput, type ParsedInput } from "./panic-score.ts";

export interface GuardrailResult {
  ok: boolean;
  invalid: string[];
}

const FILE_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "py",
  "json",
  "md",
  "css",
  "scss",
  "html",
  "yml",
  "yaml",
  "toml",
  "sh",
  "java",
  "kt",
  "go",
  "rs",
  "c",
  "cpp",
  "h",
  "hpp",
  "php",
  "rb",
  "sql",
  "vue",
  "svelte",
  "txt",
]);

const EXCLUDED_LIBRARIES = new Set([
  "next.js",
  "node.js",
  "react.js",
  "vue.js",
  "express.js",
  "d3.js",
  "three.js",
  "nest.js",
  "nuxt.js",
  "alpine.js",
  "chart.js",
  "moment.js",
  "day.js",
  "lodash.js",
  "ember.js",
  "backbone.js",
  "require.js",
  "angular.js",
  "svelte.js",
  "tailwind.css",
]);

const EXCLUDED_CODE_TOKENS = new Set([
  "console.log",
  "console.error",
  "console.warn",
  "console.info",
  "console.debug",
  "console.trace",
  "e.g.",
  "i.e.",
]);

const VERSION_REGEX = /^v?\d+(?:\.\d+)+$/i;
const URL_REGEX = /^(?:https?|ftp):\/\/[^\s]+$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Strips surrounding quotes, backticks, brackets, and trailing punctuation.
 */
function cleanToken(token: string): string {
  let cleaned = token.trim();
  // Strip surrounding quotes or backticks
  cleaned = cleaned.replace(/^[`'"]+|[`'"]+$/g, "");
  // Strip trailing punctuation like comma, period, colon, semicolon, exclamation, question mark, closing parens/brackets
  cleaned = cleaned.replace(/[\.,:;?!)\"'>\]]+$/g, "");
  // Strip leading opening parens/brackets
  cleaned = cleaned.replace(/^[\(\"'\<\[]+/g, "");
  return cleaned.trim();
}

/**
 * Checks if a token should be explicitly excluded from being treated as a file name.
 */
function isExcludedToken(token: string): boolean {
  const lower = token.toLowerCase();

  if (EXCLUDED_LIBRARIES.has(lower)) return true;
  if (EXCLUDED_CODE_TOKENS.has(lower)) return true;
  if (VERSION_REGEX.test(token)) return true;
  if (URL_REGEX.test(token)) return true;
  if (EMAIL_REGEX.test(token)) return true;

  return false;
}

/**
 * Extracts candidate file tokens from a text string according to narrow detection rules.
 */
export function extractCandidateFileTokens(text: string): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const candidates: string[] = [];
  const seen = new Set<string>();

  // 1. Extract tokens in backticks (`token`)
  const backtickRegex = /`([^`\r\n]+)`/g;
  let btMatch: RegExpExecArray | null;
  while ((btMatch = backtickRegex.exec(text)) !== null) {
    const raw = btMatch[1];
    const cleaned = cleanToken(raw);
    if (!cleaned || isExcludedToken(cleaned)) {
      continue;
    }
    // Any non-excluded token inside backticks is considered a candidate
    if (!seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      candidates.push(cleaned);
    }
  }

  // 2. Extract word tokens outside of backticks (paths with '/' or files with registered extensions)
  // Mask backtick spans to avoid duplicate extraction
  const maskedText = text.replace(/`([^`\r\n]+)`/g, " ");
  const words = maskedText.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = cleanToken(words[i]);
    if (!word || isExcludedToken(word)) {
      continue;
    }

    let isCandidate = false;

    // Rule (b): Path format (contains '/')
    if (word.includes("/") && !word.startsWith("//")) {
      isCandidate = true;
    } else {
      // Rule (c): Registered file extension
      const lastDot = word.lastIndexOf(".");
      if (lastDot > 0 && lastDot < word.length - 1) {
        const ext = word.slice(lastDot + 1).toLowerCase();
        if (FILE_EXTENSIONS.has(ext)) {
          isCandidate = true;
        }
      }
    }

    if (isCandidate) {
      const lower = word.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        candidates.push(word);
      }
    }
  }

  return candidates;
}

/**
 * Normalizes a file path/basename for case-insensitive matching.
 */
function normalizeFilePath(filePath: string): { full: string; base: string } {
  let cleaned = filePath.trim().replace(/\\/g, "/");
  // Remove leading git diff prefixes like a/ or b/
  cleaned = cleaned.replace(/^[ab]\//, "");
  const lower = cleaned.toLowerCase();
  const base = lower.split("/").pop() || lower;
  return { full: lower, base };
}

/**
 * Validates file names mentioned in AI generated texts against the valid files in the input.
 */
export function checkFileNames(texts: string[], input: string): GuardrailResult {
  const validFullPaths = new Set<string>();
  const validBasenames = new Set<string>();

  // 1. Gather valid files from parsed diff headers
  const parsed: ParsedInput = parseInput(input || "");
  for (const f of parsed.files) {
    const { full, base } = normalizeFilePath(f);
    validFullPaths.add(full);
    validBasenames.add(base);
  }

  // 2. Also gather valid file tokens mentioned in the input text itself (commit messages, diff content)
  if (input) {
    const inputTokens = extractCandidateFileTokens(input);
    for (const t of inputTokens) {
      const { full, base } = normalizeFilePath(t);
      validFullPaths.add(full);
      validBasenames.add(base);
    }
  }

  // 3. Check candidate tokens across all AI-generated texts
  const invalidSet = new Set<string>();

  if (Array.isArray(texts)) {
    for (const text of texts) {
      if (!text || typeof text !== "string") continue;

      const candidates = extractCandidateFileTokens(text);
      for (const candidate of candidates) {
        const { full, base } = normalizeFilePath(candidate);

        // Check if candidate matches any valid full path or basename
        const isMatch = validFullPaths.has(full) || validBasenames.has(base);

        if (!isMatch) {
          invalidSet.add(candidate);
        }
      }
    }
  }

  const invalid = Array.from(invalidSet);
  return {
    ok: invalid.length === 0,
    invalid,
  };
}
