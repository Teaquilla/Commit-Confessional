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

Commit Confessional is a developer micro-utility packaged as a SaaS. It analyzes messy git commits and diffs to generate two distinct documents:
1. **The Incident Report (Internal):** A 5-line monospace summary capturing severity, what happened, the observable cause, the fix, and lessons learned formatted directly from commit history.
2. **The PR Description (External):** A clean, diplomatic markdown draft ready to paste into GitHub or team channels.
3. **The Panic Score (0–100):** A diagnostic score derived from 5 deterministic code signals (rushed commit messages, shouting, repeated file touches, debug remnants, and diff volume) with a modest AI contextual adjustment (-15 to +15).

### How We Built It
- **Framework & Runtime:** Next.js, TypeScript, and Tailwind CSS.
- **AI Engine:** Google Gemini (`gemini-3.5-flash-lite`) via Google AI Studio REST API.
- **Architecture:** Zero database, entirely in-memory client state. Input is bounded to 10,000 characters.
- **Deterministic Heuristics:** Score calculation and commit summaries run locally in TypeScript. A server-side guardrail checks that every file name mentioned by the AI existed in the input diff before returning the response.

### Challenges We Ran Into
- **API Availability & Rate Limits:** During exploratory testing on Free Tier, `gemini-3.5-flash` returned HTTP 503 unavailability (`docs/evidence/call-budget.md`, `docs/decisions.md` > DEC-020). We selected `gemini-3.5-flash-lite`, which completed 15 of 15 preset runs without retries (`docs/evidence/preset-runs.md`).
- **Tone & Hallucination Control:** To prevent speculative procedural claims, we revised system prompts so that unobservable causes return "Under investigation" (`docs/decisions.md` > DEC-024). We also moved the `lessonsLearned` line into deterministic code (`formatLessonsLearned`) to reflect commit history directly (`docs/decisions.md` > DEC-025, DEC-026).

### Accomplishments That We're Proud Of
- **Systematic Failure Logging:** Technical failures encountered during development are documented in the repository (`docs/failures/failure-log.md`) with raw outputs.
- **Evidence-Backed Claims:** Every factual assertion in our documentation, landing page, and video is cataloged in `docs/failures/claims-register.md`.
- **Accessibility & Hygiene:** Design tokens meet WCAG AA contrast thresholds (checked by `scripts/check-contrast.mjs`), and automated unit tests pass locally (`npm test`).

### What We Learned
Separating deterministic logic (heuristics, commit message parsing, and file name validation) from generative language models produces predictable outputs compared to relying entirely on freeform AI prompts.

### What's Next
- GitHub App or repository import integration.
- Local confession history storage.
- Tone configuration settings.
- Non-English language support.
- Paid subscription tiers (Pro and Team checkout).

### Built With
- next.js
- react
- typescript
- tailwindcss
- zod
- google-gemini-api

---

## 2. Claims Cross-Reference Table

This table maps every factual assertion across project materials to `docs/failures/claims-register.md`. Unsubstantiated claims have been excluded. Every entry uses a unique claim ID and the exact claim text registered in `docs/failures/claims-register.md`.

| Material Location | Claim Stated | Claim ID | Register Status | Evidence Artifact |
|---|---|---|---|---|
| README.md, docs/plan/execution-plan.md | Struktur kerangka repo, AGENTS.md, dan konfigurasi lingkungan awal Fase 0 telah disiapkan | C-001 | `terverifikasi` | Inisialisasi struktur repo & commit Git Fase 0 |
| devpost/spec.md > 5, Landing Page (`/`) | Pasangan warna token yang dipakai memenuhi rasio 4,5:1 (diperiksa scripts/check-contrast.mjs); bukan pengujian teks yang dirender | C-002 | `terverifikasi` | `scripts/check-contrast.mjs` (9/9 pasang token warna lulus WCAG AA) |
| docs/decisions.md > DEC-004, scripts/ | Kredensial lingkungan lokal aman (.env* terabaikan git, tidak terlacak) dan transmisi API terverifikasi | C-004 | `terverifikasi` | git ls-files kosong, check-ignore aktif, smoke test HTTP 200 |
| docs/tasks/T-002.md, docs/STATE.md | 32 tes lulus pada 22 Okt 2026, lihat keluaran | C-007 | `terverifikasi` | Keluaran eksekusi node --test tests/guardrails.test.ts tests/panic-score.test.ts |
| docs/tasks/T-003.md, docs/STATE.md | 43 tes lulus pada 22 Okt 2026, lihat keluaran | C-008 | `terverifikasi` | Keluaran eksekusi npm test (43 pass, 0 fail) |
| docs/tasks/T-004.md, docs/STATE.md | 58 tes lulus pada 22 Okt 2026, lihat keluaran | C-009 | `terverifikasi` | Keluaran eksekusi npm test (58 pass, 0 fail) |
| docs/log/2026-10-22-12.md, docs/STATE.md | 59 tes lulus pada 22 Okt 2026, lihat keluaran | C-010 | `terverifikasi` | Keluaran eksekusi npm test (59 pass, 0 fail) |
| docs/failures/failure-log.md > F-005 | Pemilik menyatakan key lama sudah dicabut di AI Studio pada 2026-10-22 (pernyataan pemilik, tidak diverifikasi agen) | C-011 | `terverifikasi` | Pernyataan pemilik |
| docs/evidence/deploy-smoke.md, devpost/spec.md > 4, README.md | Project API berada di Free tier; billing belum diaktifkan (dilihat pemilik di AI Studio pada 2026-10-24). Tidak ada tagihan yang mungkin terjadi; risiko yang tersisa adalah kuota habis (HTTP 429). | C-012 | `terverifikasi` | Pernyataan pemilik di AI Studio pada 2026-10-24 |
| devpost/spec.md, docs/evidence/preset-runs.md, README.md | Model yang dipakai menghasilkan keluaran valid pada 3 preset x 5 | C-013 | `terverifikasi` | `docs/evidence/preset-runs.md` (15/15 valid runs pada 2026-10-24) |
| devpost/spec.md, docs/evidence/preset-runs.md, docs/DEMO_SCRIPT.md | The model used produced valid output across 3 presets x 5 | C-014 | `terverifikasi` | `docs/evidence/preset-runs.md` (15 of 15 valid runs on 2026-10-24) |
| devpost/spec.md > 5, scripts/check-contrast.mjs, docs/DEMO_SCRIPT.md | Design token color pairs meet the 4.5:1 contrast ratio (checked by scripts/check-contrast.mjs); not rendered text testing | C-015 | `terverifikasi` | `scripts/check-contrast.mjs` (9 token color pairs pass threshold) |
