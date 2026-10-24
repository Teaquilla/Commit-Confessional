# Live Video Demo Script (1:45 – 2:30)

> Language: English  
> Target Duration: 2 minutes 10 seconds (Range: 1:45 – 2:30)  
> Requirement: Every narration line references concrete evidence or an approved claim ID. Unsubstantiated claims are omitted. No forbidden words.

---

## Timeline Breakdown

### 0:00 – 0:30 | The Core Loop & Aha Moment
- **Visual:** Open browser to `https://commit-confessional.vercel.app/app`. Minimal wordmark, clean monospace input, preset chips visible. Click chip `[Late-night hotfix]`. Monospace textarea fills with 2 hasty commits and diff lines. Click the burnt-orange *"Confess"* button.
- **Narration:**
  - "Welcome to Commit Confessional, an engineering micro-utility built for late-night git panic." `[Evidence: devpost/prd.md > Section 1]`
  - "When you click 'Late-night hotfix', real frantic commits populate the input." `[Evidence: src/samples/late-night-hotfix.ts]`
  - "Pressing Confess triggers our analysis endpoint." `[Evidence: docs/evidence/deploy-smoke.md]`
  - "The Panic Score counts up to 41 Moderate, and two distinct documents appear side by side." `[Evidence: tests/ui-logic.test.ts]`
  - "On the left is a deadpan 5-line Incident Report; on the right is a polite markdown PR description ready for your team." `[Evidence: devpost/spec.md > Section 6.2]`

---

### 0:30 – 1:15 | Testing Different Panicked Changesets
- **Visual:** Click chip `[Rebase conflict panic]`. Press *"Confess"*. Results update. Click *"Why this score?"* popover to reveal the itemized signals. Next, click `[Works on my machine]`. Press *"Confess"*. Score updates to Major (55) with accent badge styling.
- **Narration:**
  - "Let's switch to a rebase conflict scenario." `[Evidence: src/samples/rebase-conflict.ts]`
  - "Notice the score breakdown popover: it details 5 distinct heuristics calculated in code, including file touch repetition and diff volume." `[Evidence: src/lib/panic-score.ts > calculatePanicScore]`
  - "Now testing 'Works on my machine', the score climbs to Major severity with a tinted badge." `[Evidence: devpost/spec.md > Section 5]`
  - "In the Incident Report, the cause is reported as under investigation because the diff lacks an obvious single failure." `[Evidence: docs/decisions.md > DEC-024]`
  - "The 'Lessons learned' line is formatted by code using the actual commit messages truncated to thirty characters." `[Evidence: docs/decisions.md > DEC-025, src/lib/panic-score.ts]`

---

### 1:15 – 1:50 | Honest SaaS Packaging
- **Visual:** Click the wordmark to navigate back to `/`. Scroll smoothly past the hero headline ("Honest first. Polite second.") down to How It Works (3 cards) and Plans & Pricing (3 cards: Free, Pro, Team).
- **Narration:**
  - "Navigating to the home page reveals the SaaS framing." `[Evidence: src/app/page.tsx]`
  - "The headline states our core rule: Honest first, polite second." `[Evidence: devpost/prd.md > Section 2]`
  - "In Plans & Pricing, Free is the only tier available today at zero dollars." `[Evidence: src/app/page.tsx]`
  - "Pro and Team tiers are labeled 'Coming soon' with disabled buttons, backed by a clear transparency disclaimer." `[Evidence: devpost/prd.md > Screen 1]`
  - "We do not advertise unbuilt features or fictional checkout flows." `[Claim: C-001, devpost/scope.md]`

---

### 1:50 – 2:30 | Technical Differentiation & Engineering Rigor
- **Visual:** Briefly show the terminal running `npm test` and `scripts/check-contrast.mjs`, then show `docs/failures/failure-log.md` in editor.
- **Narration:**
  - "Commit Confessional separates deterministic math from generative language." `[Evidence: src/lib/confess.ts]`
  - "Heuristics and commit summaries run locally in TypeScript, while Gemini Flash Lite provides concise narrative summaries." `[Claim: C-013, docs/evidence/preset-runs.md]`
  - "Before returning text to the browser, a guardrail checks that every file name in the output was present in the input diff." `[Evidence: src/lib/guardrails.ts]`
  - "Token color combinations meet standard contrast thresholds measured by our checker script." `[Claim: C-002, scripts/check-contrast.mjs]`
  - "Every engineering error and API limit encountered during development is cataloged in our public failure log." `[Evidence: docs/failures/failure-log.md]`

---

## Fallback Strategy (If Live API Encounters Errors During Recording)

1. **First Option (Retake):** If the live API returns HTTP 429 (quota limit) or 503 during recording, wait 15 seconds and record a fresh take using the live endpoint. Mock mode (`AI_MOCK=1`) is strictly prohibited in the final demo recording.
2. **Second Option (Local Deployment Fallback):** If cloud infrastructure is temporarily unresponsive, execute the application locally against the production build (`npm run build && npm run start`) with live credentials, record the interaction, and explicitly state in the video description that a local instance was recorded due to temporary Free tier provider quota limits.
