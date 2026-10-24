# Live Video Demo Script (1:45 – 2:30)

> Language: English  
> Target Duration: 2 minutes 3 seconds (Range: 1:45 – 2:30)  
> Speaking Rate: 140 words per minute (approx. 2.33 words/sec)  
> Total Narration Word Count: 286 words  
> Requirement: Every narration line references concrete evidence or an approved claim ID. Unsubstantiated claims are omitted. No forbidden words.

---

## Timeline Breakdown

### 0:00 – 0:30 | The Core Loop & Aha Moment
- **Timing:** 30 seconds target | **Narration Words:** 72 words | **Estimated Duration:** ~31 seconds (at 140 wpm)
- **Visual:** Open browser to `https://commit-confessional.vercel.app/app`. Minimal wordmark, clean monospace input, preset chips visible. Click chip `[Late-night hotfix]`. Monospace textarea fills with sample commits and diff lines. Click the burnt-orange *"Confess"* button.
- **Narration:**
  - "Welcome to Commit Confessional, an engineering micro-utility built for late-night git panic." `[Evidence: devpost/prd.md > Section 1]`
  - "When you click 'Late-night hotfix', sample commits written for this demo populate the input." `[Evidence: src/samples/late-night-hotfix.ts]`
  - "Pressing Confess triggers our analysis endpoint." `[Evidence: src/app/api/confess/route.ts]`
  - "The score counts up and a severity stamp appears, then two distinct documents appear side by side." `[Evidence: devpost/spec.md > Section 6.2]`
  - "On the left is a deadpan 5-line Incident Report; on the right is a polite markdown PR description ready for your team." `[Evidence: devpost/spec.md > Section 6.2]`

---

### 0:30 – 1:15 | Testing Different Panicked Changesets
- **Timing:** 45 seconds target | **Narration Words:** 77 words | **Estimated Duration:** ~33 seconds (at 140 wpm)
- **Visual:** Click chip `[Rebase conflict panic]`. Press *"Confess"*. Results update. Click *"Why this score?"* popover to reveal the itemized signals. Next, click `[Works on my machine]`. Press *"Confess"*. Score counter and severity stamp update.
- **Narration:**
  - "Let's switch to a rebase conflict scenario." `[Evidence: src/samples/rebase-conflict.ts]`
  - "Notice the score breakdown popover: it details 5 distinct heuristics calculated in code, including file touch repetition and diff volume." `[Evidence: src/lib/panic-score.ts > calculatePanicScore]`
  - "Now testing 'Works on my machine', the score counts up and a severity stamp appears." `[Evidence: devpost/spec.md > Section 5]`
  - "In the Incident Report, what happened, the observable cause, and the fix are presented as separate fields." `[Evidence: devpost/spec.md > Section 6.2]`
  - "The 'Lessons learned' line is formatted by code using the actual commit messages truncated to thirty characters." `[Evidence: docs/decisions.md > DEC-026, src/lib/panic-score.ts]`

---

### 1:15 – 1:50 | Honest SaaS Packaging
- **Timing:** 35 seconds target | **Narration Words:** 62 words | **Estimated Duration:** ~27 seconds (at 140 wpm)
- **Visual:** Click the wordmark to navigate back to `/`. Scroll smoothly past the hero headline ("Honest first. Polite second.") down to How It Works (3 cards) and Plans & Pricing (3 cards: Free, Pro, Team).
- **Narration:**
  - "Navigating to the home page reveals the SaaS framing." `[Evidence: src/app/page.tsx]`
  - "The headline states our core rule: Honest first, polite second." `[Evidence: devpost/prd.md > Section 2]`
  - "In Plans & Pricing, Free is the only tier available today at zero dollars." `[Evidence: src/app/page.tsx]`
  - "Pro and Team tiers are labeled 'Coming soon' with disabled buttons, backed by a clear transparency disclaimer." `[Evidence: devpost/prd.md > Screen 1]`
  - "Unbuilt capabilities and fictional checkout flows are excluded from this proof of concept." `[Evidence: devpost/scope.md]`

---

### 1:50 – 2:30 | Technical Differentiation & Engineering Rigor
- **Timing:** 40 seconds target | **Narration Words:** 75 words | **Estimated Duration:** ~32 seconds (at 140 wpm)
- **Visual:** Briefly show the terminal running `npm test` and `scripts/check-contrast.mjs`, then show `docs/failures/failure-log.md` in editor.
- **Narration:**
  - "Commit Confessional separates deterministic math from generative language." `[Evidence: src/lib/confess.ts]`
  - "The model used produced valid output across 3 presets x 5." `[Claim: C-014, docs/evidence/preset-runs.md]`
  - "Before returning text to the browser, a guardrail checks that every file name in the output was present in the input diff." `[Evidence: src/lib/guardrails.ts]`
  - "Design token color pairs meet the 4.5:1 contrast ratio (checked by scripts/check-contrast.mjs); not rendered text testing." `[Claim: C-015, scripts/check-contrast.mjs]`
  - "Every engineering error and API limit encountered during development is cataloged in the failure log in the repository." `[Evidence: docs/failures/failure-log.md]`

---

## Fallback Strategy (If Live API Encounters Errors During Recording)

1. **First Option (Retake):** If the live API returns HTTP 429 (quota limit) or 503 during recording, wait 15 seconds and record a fresh take using the live endpoint. Mock mode (`AI_MOCK=1`) is strictly prohibited in the final demo recording.
2. **Second Option (Local Deployment Fallback):** If cloud infrastructure is temporarily unresponsive, execute the application locally against the production build (`npm run build && npm run start`) with live credentials, record the interaction, and explicitly state in the video description that a local instance was recorded due to temporary Free tier provider quota limits.
