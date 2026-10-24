# Devpost Submission Text & Claims Cross-Reference

This document contains the official submission text for Devpost (*Build With AI: Basics* Hackathon) and the cross-reference mapping table ensuring that every claim in the README, landing page, video script, and submission text is supported by concrete evidence in `docs/failures/claims-register.md`.

---

## 1. Devpost Submission Text

### Project Title
Commit Confessional

### Tagline
Turn frantic late-night git diffs into deadpan incident reports and clean pull requests.

### Description
Late-night bug fixing is stressful. Frantic git logs full of "fix", "asdfgh", and keyboard mashing often turn into messy pull requests or uncommunicated regressions.

Commit Confessional is a developer micro-utility packaged as a sleek SaaS. It analyzes messy git commits and diffs to generate two distinct physical documents:
1. **The Incident Report (Internal):** A 5-line monospace summary capturing severity, what happened, the observable cause, the fix, and lessons learned formatted directly from commit history.
2. **The PR Description (External):** A clean, diplomatic markdown draft ready to paste into GitHub or team channels.
3. **The Panic Score (0–100):** A diagnostic score derived from 5 deterministic code signals (rushed commit messages, shouting, repeated file touches, debug remnants, and diff volume) with a modest AI contextual adjustment (-15 to +15).

### How We Built It
- **Framework & Runtime:** Next.js 16 (App Router), TypeScript, and Tailwind CSS.
- **AI Engine:** Google Gemini (`gemini-3.5-flash-lite`) via Google AI Studio REST API.
- **Architecture:** Zero database, zero cookies, entirely in-memory browser state. Input is bounded to 10,000 characters.
- **Deterministic Heuristics:** Score calculation and commit summaries run locally in TypeScript. A server-side guardrail checks that every file name mentioned by the AI existed in the input diff before returning the response.

### Challenges We Ran Into
- **API Availability & Rate Limits:** During exploratory testing on Free Tier, larger models encountered frequent HTTP 503 unavailability and rate limit exhaustion. We logged all 27 technical failures transparently in our public failure log, benchmarked candidates empirically across 15 runs, and selected `gemini-3.5-flash-lite` for stability.
- **Tone & Hallucination Control:** To prevent speculative procedural claims, we revised system prompts so that unobservable causes return "Under investigation." We also moved the `lessonsLearned` line into deterministic code (`formatLessonsLearned`) to reflect commit history directly.

### Accomplishments That We're Proud Of
- **Radical Transparency:** Every error, retry, API failure, and scope adjustment is recorded in `docs/failures/failure-log.md` with raw outputs.
- **Evidence-Backed Claims:** Every factual assertion in our documentation, landing page, and video is cataloged in `docs/failures/claims-register.md`.
- **Accessibility & Hygiene:** Design tokens meet WCAG AA contrast thresholds (checked by script), and 75 automated unit tests pass in under 2 seconds.

### What We Learned
Separating deterministic logic (heuristics, commit message parsing, and file name validation) from generative language models yields far more reliable developer tools than relying entirely on freeform AI prompts.

### What's Next
- Optional GitHub CLI integration (`gh confessional`).
- Multi-branch history inspection for larger team repos.

### Built With
- next.js
- react
- typescript
- tailwindcss
- zod
- google-gemini-api

---

## 2. Claims Cross-Reference Table

This table maps every factual assertion across project materials to `docs/failures/claims-register.md`. Unsubstantiated claims have been excluded.

| Material Location | Claim Stated | Claim ID | Register Status | Evidence Artifact |
|---|---|---|---|---|
| README.md > Getting Started | Repository structure and environment initialized | C-001 | `terverifikasi` | Git initialization & `docs/plan/execution-plan.md` |
| Landing Page (`/`) > Look & Feel | Design tokens meet WCAG AA contrast threshold (> 4.5:1) | C-002 | `terverifikasi` | `scripts/check-contrast.mjs` (9/9 passed) |
| README.md > Known Limitations | API operates on Free tier without active billing; quota limit 429 risk noted | C-012 | `terverifikasi` | Owner declaration at AI Studio & `docs/evidence/deploy-smoke.md` |
| README.md > Known Limitations | `gemini-3.5-flash-lite` produced valid output across 15 of 15 preset runs | C-013 | `terverifikasi` | `docs/evidence/preset-runs.md` (15/15 valid runs on 2026-10-24) |
| Demo Script (0:00–0:30) | Public deployment URL responds with HTTP 200 | C-012 | `terverifikasi` | `docs/evidence/deploy-smoke.md` (GET /api/health and GET /app) |
| Demo Script (0:30–1:15) | Panic Score calculated deterministically across 5 code signals | C-009 | `terverifikasi` | `src/lib/panic-score.ts`, `tests/panic-score.test.ts` (75 tests) |
| Demo Script (1:15–1:50) | Only Free tier is offered today; Pro and Team are labeled Coming soon | C-001 | `terverifikasi` | `src/app/page.tsx`, `devpost/prd.md > Screen 1` |
| Demo Script (1:50–2:30) | Server-side guardrail checks file names against diff input | C-007 | `terverifikasi` | `src/lib/guardrails.ts`, `tests/guardrails.test.ts` |
| Submission Text > Challenges | Exploration of alternative models cataloged in failure log | C-013 | `terverifikasi` | `docs/failures/failure-log.md` (F-017 through F-026) |
