---
doc: spec
status: approved
---


# Commit Confessional — Technical Specification

A technical blueprint for building Commit Confessional: components, data flow, server architecture, output guardrails, file structure, testing, and deployment instructions.
Source: `prd.md > 1. The Core Journey`, `prd.md > 2. Screens and Layout`, `prd.md > 4. Features and Behavior`.

---

## 1. How This Works, In Plain Language

Commit Confessional is a Next.js application that does one job cleanly:
1. A developer pastes messy git commits or code changes (or clicks one of 3 built-in sample diffs) on the `/app` screen.
2. The browser sends the text (capped at 10,000 characters) to an internal server route (`/api/confess`).
3. The server immediately calculates a **Base Panic Score** deterministically in pure code by analyzing 5 concrete signals (rushed messages, keyboard mashing, repeated file touches, debug code leftovers, and diff size).
4. The server calls an isolated AI function (`generateReport`) using Google Gemini (model configured via `AI_MODEL_NAME`, starting with `gemini-3.8-flash`) to generate:
   - an AI score adjustment (+/-15) with a 1-sentence reason,
   - a 5-line monospace Incident Report (deadpan, facts only), and
   - a 3-section clean PR Description (neutral, professional).
5. The server runs an **Output Guardrail Validator** over the AI output: any file name mentioned anywhere in the AI output must exist in the input diff.
6. The combined result is validated against a strict JSON schema and returned to the browser.
7. The browser reveals the Panic Score count-up, Incident Report, and PR Description with one-click copy buttons.

---

## 2. The Core Journey Through the System
PRD ref: `prd.md > 1. The Core Journey`.

```
User Browser                      Next.js Server (/api/confess)             Gemini API
     |                                          |                                |
     |-- 1. Click sample or paste changes ----->|                                |
     |-- 2. Click Confess (POST /api/confess) ->|                                |
     |                                          |-- 3. Enforce 10k cap           |
     |                                          |-- 4. Compute 5 base signals    |
     |                                          |-- 5. generateReport(input) --->|
     |                                          |      (total deadline: 28s)     |-- 6. Model generates JSON
     |                                          |<-- 7. Returns raw JSON --------|
     |                                          |-- 8. Guardrails & 503/429 check|
     |                                          |      (retry once if rem >=10s) |
     |                                          |-- 9. Compute severity & clamp  |
     |                                          |-- 10. Schema verification      |
     |<-- 11. Returns verified JSON response ---|                                |
     |-- 12. Animated count-up & dual panels    |                                |
     |-- 13. User clicks "Copy PR Description"  |                                |
```


---

## 3. Stack & Key Dependencies
PRD ref: `prd.md > 3. Look and Feel`, `prd.md > 6. Product Decisions`.

- **Framework:** [Next.js](https://nextjs.org/docs) (v15+, App Router, TypeScript).
  - *Rationale:* Native support for React Server Components, secure server-side Route Handlers (`/api/confess`) to keep API keys private, and self-hosted production reliability.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/docs).
  - *Rationale:* Utility-first CSS configured with custom color tokens (`#FAFAF7`, `#1C1B19`, `#C2410C`, `#E4E2DC`, `#F3F1EC`, `#FBE9DF`) and layout spacing.
- **Typography:** [`next/font/google`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) loading **IBM Plex Sans** and **IBM Plex Mono**.
  - *Rationale:* Zero layout shift, self-hosted at build time, distinct engineering document aesthetics.
- **Schema Validation:** [Zod](https://zod.dev/).
  - *Rationale:* Runtime validation of request payloads and AI JSON output before rendering.
- **AI SDK & Model:** Google Gemini API using official SDK ([Google Gen AI Documentation](https://ai.google.dev/gemini-api/docs)).
  - *Model:* `gemini-3.8-flash` (listed in the model catalog on 2026-10-20; generateContent returned HTTP 503 (high demand); gemini-3.5-flash returned HTTP 200 with the new key). Text generation capability for `gemini-3.8-flash` is not yet proven.
  - *Configuration:* Model string read strictly from environment variable `AI_MODEL_NAME`. No automatic model switching.
  - *Model Selection Criteria:* The model used in the demonstration video and README is the one that passes 5 consecutive runs on each of the 3 sample diffs (valid JSON against schema, passes output guardrails); model name and test date must be recorded in `docs/decisions.md` under DEC-004.


---

## 4. Where It Runs and How Someone Tries It
PRD ref: `prd.md > 2. Screens and Layout`.

### Local Execution (For Development & Video Recording)
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and configure your API key:
   ```bash
   cp .env.example .env.local
   # Set GEMINI_API_KEY and AI_MODEL_NAME=gemini-3.8-flash
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) for the Landing Page, or [http://localhost:3000/app](http://localhost:3000/app) for the App Screen.

### Production Hosting (Self-Hosted Server)
- **Runtime:** Node.js LTS running `next build` and `next start` managed under a process manager (`pm2` or `systemd`) or Docker container.
- **Reverse Proxy:** `nginx` or `Caddy` with HTTPS, forwarding to local port (e.g. 3000) with a read timeout of 35 seconds (`proxy_read_timeout 35s;`), ensuring the application's internal 28-second deadline resolves cleanly before proxy termination.
- **Environment Variables:** Stored securely on the server environment (e.g. `/etc/environment` or `.env.local` outside version control).
- **Fallback Deployment:** Vercel Free Plan is documented as a secondary backup option in `docs/decisions.md`.

### Deployment Checklist
- [ ] Project-specific Gemini API key created with a hard spending quota configured at the provider before deployment; verify and record the evidence.
- [ ] Ports 80 and 443 open with valid SSL/TLS certificate.
- [ ] Reverse proxy read timeout set to 35 seconds (`proxy_read_timeout 35s;`).
- [ ] Per-IP rate limiting configured (e.g. in reverse proxy or middleware) to protect the API endpoint.
- [ ] Access logging configured so that request bodies are never stored in log files.
- [ ] Service restart command verified (`pm2 restart commit-confessional` or `systemctl restart commit-confessional`).
- [ ] Verification that the public URL is reachable from an external network.

### Known Limitations
- Demo publik berjalan pada Free tier API dengan batas harian; permintaan bisa gagal dengan HTTP 429 saat kuota habis.
- C-013: Pada 24 Okt 2026, 15 dari 15 percobaan pada tiga preset menghasilkan keluaran valid dengan gemini-3.5-flash-lite; sampel kecil, satu hari, Free tier; gemini-3.5-flash dan gemini-3.8-flash menghasilkan 503 pada pengujian lain.
- Baris 'Lessons learned' pada Incident Report disusun secara deterministik oleh kode (berdasarkan fakta pesan commit), bukan oleh AI.


---

## 5. Look and Feel Implementation
PRD ref: `prd.md > 3. Look and Feel`.

- **Color Tokens (Tailwind Config):**
  - Background: `bg-[#FAFAF7]`
  - Panels: `bg-white border border-[#E4E2DC]`
  - Report Tint: `bg-[#F3F1EC]`
  - Primary Text: `text-[#1C1B19]`
  - Secondary Text: `text-[#5F5C55]`
  - Accent Hue: `#C2410C` (Confess button & severity intensity levels)
  - Major Tint Fill: `bg-[#FBE9DF]`
- **Typography Classes:**
  - Standard UI & PR panel: `font-sans` (IBM Plex Sans)
  - Report panel & Input: `font-mono` (IBM Plex Mono)
- **Accessibility:** Body text contrast ratio must be verified with a contrast checker before Gate 3 (target > 4.5:1 for WCAG AA).

---

## 6. Components Architecture
PRD ref: `prd.md > 2. Screens and Layout`, `prd.md > 4. Features and Behavior`.

### 6.1 Landing Page Components (`src/app/page.tsx`)
- `HeroSection`: Displays headline *"Honest first. Polite second."*, subline, and *"Try it now"* CTA button.
- `HowItWorks`: 3 horizontal cards detailing Paste, Confess, and Copy.
- `PricingCards`: 3 plan cards (Free with 3 real lines, Pro and Team with `Coming soon`, plus transparency notice).

### 6.2 App Core Components (`src/app/app/page.tsx`)
- `AppHeader`: Minimalist header with wordmark linking back to `/`.
- `InputSection`: Monospace textarea, disclosure notice (*"Your input is sent to an AI service to generate the report."*), 3 preset chips, and Confess button.
- `LoadingState`: Animated spinner with *"Filing your incident report..."* and 10s fallback message.
- `ScoreBar`: Panic Score number (64px+), severity stamp badge, one-line summary reason (derived from the top code signal), and *"Why this score?"* trigger.
- `WhyThisScorePopover`: Popover breaking down the 5 deterministic signals, AI adjustment, and disclaimer footer.
- `IncidentReportPanel`: Left column (`#F3F1EC`, monospace) showing 5 short lines and *"Copy Report"* button.
- `PRDescriptionPanel`: Right column (white, sans-serif) showing Summary, What changed, How to check, and primary *"Copy PR Description"* button.

---

## 7. Panic Score Formula & Parsing Rules
PRD ref: `prd.md > 4.2 Panic Score & "Why This Score?" Popover`.

### 7.1 Maximum Signal Weights & Point Mapping
The base score (0–100) is calculated deterministically in code from 5 signals:
1. **Rushed commit messages:** Max 30 points.
   - *Point Mapping:* `Math.round((low_effort_commit_count / total_commits) * 30)`. Low-effort messages include generic phrases ("fix", "wip", "test", "asdfgh"), single-word messages, or repeated messages.
2. **Shouting or keyboard mashing:** Max 10 points.
   - *Point Mapping:* If any commit message is in ALL CAPS with at least 4 letters (to avoid short acronyms like "WIP" or "API") or contains repetitive punctuation/character mashing (e.g. `!!!`, `???`) = 10 points; otherwise = 0 points.
3. **Repeated file touches:** Max 20 points.
   - *Point Mapping:* If any single file is modified across $\ge 3$ commits in the same changeset = 20 points; if modified across 2 commits = 10 points; otherwise = 0 points.
4. **Debug leftovers:** Max 20 points.
   - *Point Mapping:* 4 points per added line containing debug statements (`console.log`, `print(`, `debugger`, `var_dump`), capped at 5 instances (`Math.min(5, debug_count) * 4` = max 20 points).
5. **Diff size:** Max 20 points.
   - *Point Mapping:* Scaled by total lines changed (added + deleted): >300 lines = 20 points; 100–300 lines = 10 points; <100 lines = 0 points.



### 7.2 Normalization for Diff-Only Inputs
If the input contains no commit messages (diff only):
- Signals 1, 2, and 3 are marked as `available: false` (UI shows `"Not available (no commit messages)"`).
- The base score is computed from signals 4 and 5 (maximum available: 40 points).
- The raw score is re-normalized to a 100-point scale: `normalizedBaseScore = Math.round(rawScore * (100 / 40))`.

### 7.3 Severity Bands
Severity is computed strictly in code from the final score:
- **MINOR:** 0 – 24
- **MODERATE:** 25 – 49
- **MAJOR:** 50 – 74
- **CRITICAL:** 75 – 100

### 7.4 Input Parsing Rules
The parser supports three git formats:
1. Standard git log format (`commit <40-char-hex> ...`)
2. Git oneline format (`<7-10-char-hex> <message>`)
3. Unified diff format (`diff --git a/... b/...`, `--- a/...`, `+++ b/...`, `@@ ... @@`)
4. Combined input (git log followed by diff)

### 7.5 Nonsensical Input Criteria
An input is rejected before processing if:
- Length is strictly fewer than 20 characters, OR
- It contains no diff markers (`diff --git`, `@@`, `+++`, `---`) AND no recognizable commit line structures.
Rejection returns the friendly error: *"That doesn't look like commits or code changes. Paste a git diff or commit messages and try again."*

---

## 8. Data Model & Contract Schemas

### 8.1 Server Request Schema
```typescript
import { z } from "zod";

export const ConfessRequestSchema = z.object({
  input: z.string().min(20).max(10000),
});
export type ConfessRequest = z.infer<typeof ConfessRequestSchema>;
```

### 8.2 AI Output Schema (Raw LLM Generation Contract)
The AI model is instructed to output strictly this structure. The AI does NOT output severity, final scores, or lessons learned.
```typescript
export const AIOutputSchema = z.object({
  aiAdjustment: z.number().int().min(-15).max(15),
  aiAdjustmentReason: z.string().max(150),
  whatHappened: z.string().max(200),
  cause: z.string().max(200),
  fix: z.string().max(200),
  prSummary: z.string().max(300),
  whatChanged: z.array(z.string().max(150)).max(4),
  howToCheck: z.array(z.string().max(150)).max(2),
});
export type AIOutput = z.infer<typeof AIOutputSchema>;
```

### 8.3 Server Response Schema (`ConfessResponse`)
```typescript
export interface BaseScoreSignals {
  rushedCommits: { points: number; evidence: string; available: boolean };
  shoutingMashing: { points: number; evidence: string; available: boolean };
  repeatedFiles: { points: number; evidence: string; available: boolean };
  debugLeftovers: { points: number; evidence: string; available: boolean };
  diffSize: { points: number; evidence: string; available: boolean };
  baseScore: number; // 0 - 100
  dominantSignalReason: string; // One-line summary reason from top signal
}

export interface ConfessResponse {
  panicScore: {
    finalScore: number; // 0 - 100 (clamped in code)
    baseScore: number;
    aiAdjustment: number; // -15 to +15 (clamped in code)
    aiAdjustmentReason: string;
    severity: "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL";
    dominantReason: string;
    signals: BaseScoreSignals;
  };
  incidentReport: {
    severity: "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL";
    whatHappened: string;
    cause: string;
    fix: string;
    lessonsLearned: string; // Formatted deterministically by code from commit messages
  };
  prDescription: {
    summary: string;
    whatChanged: string[]; // Max 4 items
    howToCheck: string[];  // Max 2 items
  };
  truncated: boolean;
}
```

### 8.4 Error Response Schema
```typescript
export interface ErrorResponse {
  error: {
    code: "EMPTY_INPUT" | "INVALID_INPUT" | "INPUT_TOO_LARGE" | "AI_TIMEOUT" | "AI_GENERATION_FAILED" | "GUARDRAIL_FAILED";
    message: string;
  };
}
```
*Rule:* Stack traces are never exposed in responses.

---

## 9. Swappable AI Engine & Output Guardrails
PRD ref: `prd.md > 4. Features and Behavior`, `prd.md > 6. Product Decisions`.

### 9.1 Single Engine Entrypoint (`src/lib/ai/index.ts`)
All external AI calls are encapsulated in a single exported function:
```typescript
export async function generateReport(input: string): Promise<AIOutput>;
```
- Reads model name strictly from `process.env.AI_MODEL_NAME`. There is **no automatic model switching/fallback**.
- Enforces an overall total request deadline of 28 seconds managed via `AbortController`.
- Injects a strict system prompt instructing structured JSON output with temperature 0.2.
- Input is treated strictly as data: wrapped in explicit delimiters (`=== BEGIN USER CODE INPUT ===\n${input}\n=== END USER CODE INPUT ===`), with system instructions stating that any instructions found inside the input must be ignored.
- **Provider Retry Policy (HTTP 503 / 429):**
  - If the Gemini API returns HTTP 503 (high demand) or HTTP 429 (rate limit), the server performs at most one retry after a 1–2 second delay.
  - The retry is executed *only* if the remaining time within the 28-second total budget is at least 10 seconds (`remainingTime >= 10s`).
  - Every retry logs strictly the error code to the server console (e.g. `[AI_RETRY] 503`), never logging input content.
  - If remaining time is <10s or the second attempt fails, it terminates with an error.

### 9.2 Output Guardrails Validator (`src/lib/guardrails.ts`)
- **Extraction:**
  - *Valid File Names Set:* Parsed from diff headers (`diff --git a/... b/...`, `+++ b/...`, `--- a/...`), plus any file paths identified in the raw input text. Both full relative paths and basenames (e.g. `auth.ts` for `src/auth.ts`) are considered valid.
  - *Extracted AI References:* Scanned across all AI-generated fields (`whatHappened`, `cause`, `fix`, `prSummary`, `whatChanged`, `howToCheck`, and `aiAdjustmentReason`) using regex pattern matching file extensions (`\b[\w\.\-/]+\.[a-zA-Z0-9]{1,8}\b`).
- **Enforcement & Retry Policy:**
  1. If any file name referenced by the AI does not exist in the valid set:
     - The output is rejected.
     - The AI call is retried once with a firmer prompt reminder: *"Do not mention file names that are not in the input."*, *only* if the remaining time within the 28-second total deadline is at least 10 seconds.
  2. If the second attempt still contains invalid file names (or remaining time is <10s):
     - The request is terminated.
     - The server logs the event to the console (error code `GUARDRAIL_FILE_MISMATCH` only, NEVER logging input content).
     - The server returns the standard error: *"Something went wrong and no report was filed. Please try again."*


---

## 10. File Structure

```
repo-root/
├── .env.example                  # Secret-free environment template
├── .gitignore                    # Prevents secret leaks, ignores .env* and learner-profile.md
├── AGENTS.md                     # Multi-agent rules and failure-logging protocol
├── README.md                     # Project overview, run instructions, and known limitations
├── devpost/
│   ├── learner-profile.md        # Learner preferences and onboarding record
│   ├── scope.md                  # Approved scope document
│   ├── prd.md                    # Approved product requirements document
│   └── spec.md                   # Technical specification (this document)
├── docs/
│   ├── plan/execution-plan.md    # Multi-phase execution plan
│   ├── log/                      # Antigravity session logs
│   ├── failures/                 # Failure log, claims register, raw error captures
│   ├── reports/                  # Failure reports per gate
│   ├── audit/                    # Codex audit reports
│   └── decisions.md              # Architectural decisions and changelog
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with IBM Plex fonts
│   │   ├── page.tsx              # Landing page (Hero, How It Works, Pricing)
│   │   ├── app/page.tsx          # Dedicated Core Loop App Screen
│   │   └── api/confess/route.ts  # Next.js Server Route Handler (28s total deadline)
│   ├── components/
│   │   ├── AppHeader.tsx         # Header wordmark linking to /
│   │   ├── HeroSection.tsx       # Landing hero
│   │   ├── HowItWorks.tsx        # 3-step how it works
│   │   ├── PricingCards.tsx      # 3 plan cards with notice
│   │   ├── InputSection.tsx      # Monospace input, presets, confess button
│   │   ├── LoadingState.tsx      # Animated deadpan loading state
│   │   ├── ScoreBar.tsx          # Panic Score, severity badge, reason
│   │   ├── WhyThisScorePopover.tsx # 5 signals breakdown popover
│   │   ├── IncidentReportPanel.tsx # 5-line monospace report panel
│   │   └── PRDescriptionPanel.tsx  # 3-section clean PR panel
│   ├── lib/
│   │   ├── panic-score.ts        # 5-signal deterministic code calculation
│   │   ├── guardrails.ts         # Output guardrails (file name check against input)
│   │   └── ai/
│   │       └── index.ts          # Swappable AI engine (generateReport)
│   └── samples/
│       ├── late-night-hotfix.ts  # Sample diff 1
│       ├── rebase-conflict.ts    # Sample diff 2
│       └── works-on-machine.ts   # Sample diff 3
├── tests/
│   ├── panic-score.test.ts       # Unit tests for scoring & edge cases
│   └── guardrails.test.ts        # Unit tests for file validation & retry
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 11. Testing & Verification

### Unit Testing Architecture
Unit tests are implemented using standard TypeScript testing (Vitest or Jest) in `tests/`:
1. `panic-score.test.ts`:
   - Tests base score calculation against the 3 sample diffs.
   - Tests diff-only input: asserts signals 1–3 are `available: false` and score is re-normalized to 100.
   - Tests empty / nonsensical input: asserts rejection for <20 characters or lack of git markers.
   - Tests clamp boundary: asserts final score cannot exceed 100 or fall below 0.
2. `guardrails.test.ts`:
   - Tests file name extraction and basename matching against diff headers.
   - Tests rejection when an invented file name is present.
   - Tests retry mechanism and error trigger on repeated guardrail violation.
   - Tests input truncation at 10,000 characters.

*Rule:* All unit tests (`npm test`) must pass before concluding build tasks, and results must be recorded in session logs.

---

## 12. Security & Guardrails

1. **Prompt Injection & Data Separation:** User input is strictly treated as passive data. Encapsulated inside delimiters (`=== BEGIN USER CODE INPUT ===`) with system prompt instructions explicitly forbidding command execution.
2. **Safe Rendering:** All text from the AI is rendered as plain text strings in React. The use of `dangerouslySetInnerHTML` is prohibited.
3. **Dual-Layer Truncation:** Input is truncated at 10,000 characters both on the client before submission and on the server Route Handler before calling the AI engine.
4. **Zero Input Logging:** Server console logs record error codes only (`GUARDRAIL_FILE_MISMATCH`, `AI_TIMEOUT`), never printing user input to console or persistent files.

---

## 13. What Was Simplified and Why
PRD ref: `prd.md > 8. Deferred From the POC`, `prd.md > 9. Non-Goals`.

- **Pure In-Memory State:** Instead of a database, inputs and outputs live strictly in browser memory. Why: Eliminates database latency, credential management, and privacy liability; aligns with *"The app does not store inputs."*
- **Sample Diffs on Disk:** Stored as static TypeScript modules in `src/samples/` rather than external storage. Why: Fast, reliable, and calls the real API without mocking.
- **Single Accent Hue Intensity:** Instead of multi-color palette switching, intensity variants of `#C2410C` are used to fulfill the "one accent color" rule.

---

## 14. Decisions and Known Limitations

### Decisions Made
1. **Design decision:** Limit invented file names and malformed output with deterministic checks.
2. **Next.js App Router + TypeScript:** Approved for server route isolation and self-hosted production reliability.
3. **Google Gemini:** Model configured strictly via `AI_MODEL_NAME` (listed in catalog on 2026-10-20; text generation unproven for 3.8-flash; gemini-3.5-flash returned 200). Strict single retry policy for 503/429 (rem >=10s) with no automatic model switching.
4. **Self-Hosted Production Architecture:** Primary deployment targets a self-hosted Linux server with HTTPS reverse proxy; Vercel Free Plan is kept as backup.

### Known Limitations
1. **Heuristic Score:** Panic Score is a heuristic rule-of-thumb, not a validated measure.
2. **Score Tuning:** The score is tuned for panicked human commits; AI-generated changes with tidy messages may score lower than they feel.
3. **AI Interpretation:** The "Cause" line provided by AI in the Incident Report is an interpretation based on code diff clues, not guaranteed ground truth.
4. **Language Support:** Non-English inputs are completely untested.
5. **Diff-Only Inputs:** If an input consists solely of a git diff without commit messages, signals 1–3 are marked as "n/a" in the UI, and weights are automatically re-normalized across remaining signals (signals 4 and 5). Note: For a diff-only input with >300 lines changed and no other signals, the normalized score is 50 (MAJOR) purely due to diff size (20/40 points normalized to 50/100; verified in `tests/panic-score.test.ts`).
6. **AI Output Variance:** AI generation is not completely deterministic; identical inputs may produce slight variations in wording.
7. **Third-Party Service:** User input is transmitted to Google Gemini API to generate the reports.
8. **Rate Limiting:** Per-IP rate limiting must be configured at the reverse proxy before deployment (see Deployment checklist); until verified, it is not claimed.
9. **Free Tier Daily Quota:** Demo publik berjalan pada Free tier API dengan batas harian; permintaan bisa gagal dengan HTTP 429 saat kuota habis.



