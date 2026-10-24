// scripts/verify.mjs
// Project verification script executing test, build, secret scan, forbidden words scan,
// untracked file hygiene, and production mock mode isolation.
// Exits with code 0 on PASS, non-zero on FAIL.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

let overallSuccess = true;

function logSection(title) {
  console.log(`\n=== [VERIFY] ${title} ===`);
}

function pass(name) {
  console.log(`[PASS] ${name}`);
}

function fail(name, reason) {
  console.error(`[FAIL] ${name}: ${reason}`);
  overallSuccess = false;
}

// 1. npm test
logSection("1. Unit Tests (npm test)");
try {
  execSync("npm test", { cwd: rootDir, stdio: "inherit" });
  pass("Unit tests passed");
} catch {
  fail("Unit tests", "npm test failed with non-zero exit code");
}

// 2. npm run build
logSection("2. Production Build (npm run build)");
try {
  execSync("npm run build", { cwd: rootDir, stdio: "inherit" });
  pass("Production build succeeded");
} catch {
  fail("Production build", "npm run build failed with non-zero exit code");
}

// 3. Secret Scanning
logSection("3. Secret Scanning");
try {
  const trackedFilesOutput = execSync("git ls-files", { cwd: rootDir, encoding: "utf8" });
  const trackedFiles = trackedFilesOutput
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const secretPatterns = [
    { name: "Google API Key prefix", regex: /AIza[0-9A-Za-z-_]{35}/g },
    { name: "AQ prefix pattern", regex: /AQ\.[0-9A-Za-z-_]+/g },
    { name: "OpenAI/generic sk- key", regex: /sk-[0-9A-Za-z-_]{20,}/g },
    { name: "Private key header", regex: new RegExp(["BEGIN", "PRIVATE", "KEY"].join(" "), "g") },
  ];

  let secretLeaks = [];
  let illegalEnvFiles = [];

  for (const relPath of trackedFiles) {
    const fileName = path.basename(relPath);

    // Check for tracked .env files other than .env.example
    if (fileName.startsWith(".env") && fileName !== ".env.example") {
      illegalEnvFiles.push(relPath);
    }

    // Exclude docs/plan/execution-plan.md and the verify script itself from secret scanning
    const normalizedRelPath = relPath.replace(/\\/g, "/");
    if (
      normalizedRelPath === "docs/plan/execution-plan.md" ||
      normalizedRelPath === "scripts/verify.mjs"
    ) {
      continue;
    }

    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) continue;

    try {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const p of secretPatterns) {
        if (p.regex.test(content)) {
          secretLeaks.push({ file: relPath, pattern: p.name });
        }
      }
    } catch {
      // Binary file or read error, ignore
    }
  }

  if (illegalEnvFiles.length > 0) {
    fail("Secret Scanning", `Tracked .env file detected: ${illegalEnvFiles.join(", ")}`);
  } else if (secretLeaks.length > 0) {
    fail(
      "Secret Scanning",
      `Potential secret pattern detected: ${secretLeaks
        .map((l) => `${l.file} (${l.pattern})`)
        .join(", ")}`
    );
  } else {
    pass("Secret scanning (0 secrets or illegal .env files detected)");
  }
} catch (err) {
  fail("Secret Scanning", err.message);
}

// 4. Forbidden Words Scanning
logSection("4. Forbidden Words Scanning");
try {
  const forbiddenRegex =
    /(?:100%|\b(?:verified|guaranteed|eliminate|anti-hallucination|secure|accurate|perfect|never|always)\b)/i;

  // Target files: README.md, src/app/**, docs/SUBMISSION.md, docs/DEMO_SCRIPT.md
  const targetPaths = [];

  const readme = path.join(rootDir, "README.md");
  if (fs.existsSync(readme)) targetPaths.push(readme);

  const submission = path.join(rootDir, "docs/SUBMISSION.md");
  if (fs.existsSync(submission)) targetPaths.push(submission);

  const demoScript = path.join(rootDir, "docs/DEMO_SCRIPT.md");
  if (fs.existsSync(demoScript)) targetPaths.push(demoScript);

  function walkAppDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkAppDir(full);
      } else if (entry.isFile() && /\.(tsx|ts|js|jsx|css|json)$/.test(entry.name)) {
        targetPaths.push(full);
      }
    }
  }

  walkAppDir(path.join(rootDir, "src/app"));

  let forbiddenHits = [];

  for (const filePath of targetPaths) {
    const rel = path.relative(rootDir, filePath).replace(/\\/g, "/");
    const lines = fs.readFileSync(filePath, "utf8").split("\n");

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      const match = line.match(forbiddenRegex);
      if (match) {
        forbiddenHits.push({
          file: rel,
          line: lineNum + 1,
          word: match[0],
          snippet: line.trim(),
        });
      }
    }
  }

  if (forbiddenHits.length > 0) {
    fail(
      "Forbidden Words",
      `Detected ${forbiddenHits.length} forbidden word matches:\n` +
        forbiddenHits
          .map((h) => `  - ${h.file}:${h.line} [${h.word}] -> "${h.snippet}"`)
          .join("\n")
    );
  } else {
    pass(`Forbidden words scanning (${targetPaths.length} target files scanned, 0 violations)`);
  }
} catch (err) {
  fail("Forbidden Words", err.message);
}

// 5. Untracked Cleanliness Check
logSection("5. Untracked Hygiene Check (node_modules, .next, .env*)");
try {
  const trackedFilesOutput = execSync("git ls-files", { cwd: rootDir, encoding: "utf8" });
  const violations = trackedFilesOutput
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => {
      if (!f) return false;
      if (f.startsWith("node_modules/") || f === "node_modules") return true;
      if (f.startsWith(".next/") || f === ".next") return true;
      if (f.startsWith(".env") && f !== ".env.example") return true;
      return false;
    });

  if (violations.length > 0) {
    fail("Untracked Hygiene", `Tracked forbidden paths found: ${violations.join(", ")}`);
  } else {
    pass("Untracked hygiene (node_modules, .next, .env* are clean and not tracked)");
  }
} catch (err) {
  fail("Untracked Hygiene", err.message);
}

// 6. Production Mock Inactivity Check
logSection("6. Production Mock Mode Inactivity Check");
try {
  // Dynamically import handleConfess and verify that AI_MOCK=1 is ignored when NODE_ENV=production
  const { handleConfess } = await import("../src/lib/confess.ts");
  const { lateNightHotfix } = await import("../src/samples/index.ts");

  const origEnv = process.env.NODE_ENV;
  const origMock = process.env.AI_MOCK;

  process.env.NODE_ENV = "production";
  process.env.AI_MOCK = "1";

  try {
    const fakeGenerate = async () => ({
      aiAdjustment: 0,
      aiAdjustmentReason: "Production test verify.",
      whatHappened: "Verified production behavior.",
      cause: "Under investigation",
      fix: "Fixed prod check.",
      lessonsLearned: "Production verify passed.",
      prSummary: "Production verify test.",
      whatChanged: ["src/payments/checkout.ts"],
      howToCheck: ["Verify checkout."],
    });

    const res = await handleConfess(
      { input: lateNightHotfix },
      { generateReport: fakeGenerate }
    );

    if (res.status === 200 && "panicScore" in res.data && res.data.isMock === undefined) {
      pass("Mock mode is strictly ignored in production (AI_MOCK=1 ignored in NODE_ENV=production)");
    } else {
      fail(
        "Production Mock Check",
        `Mock mode was unexpectedly active in production (isMock=${res.data?.isMock})`
      );
    }
  } finally {
    process.env.NODE_ENV = origEnv;
    process.env.AI_MOCK = origMock;
  }
} catch (err) {
  fail("Production Mock Check", err.message);
}

// Final Verdict
console.log("\n==========================================");
if (overallSuccess) {
  console.log(">>> VERIFY RESULT: ALL CHECKS PASSED <<<");
  console.log("==========================================\n");
  process.exit(0);
} else {
  console.error(">>> VERIFY RESULT: SOME CHECKS FAILED <<<");
  console.log("==========================================\n");
  process.exit(1);
}
