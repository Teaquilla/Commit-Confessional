---
doc: prd
status: approved
---

# Commit Confessional — Product Requirements Document (PRD)

A developer micro-utility packaged as a SaaS that transforms messy git commits or code changes into an unfiltered, deadpan Incident Report alongside a clean, diplomatic PR description with a Panic Score.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

---

## 1. The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. **Discovery & Landing (`/`):** The user lands on the homepage, reads the headline *"Honest first. Polite second."*, reviews the 3-step workflow and 3 plan cards, and clicks the primary button *"Try it now"*.
2. **App Transition (`/app`):** The user is routed to the dedicated application screen. The input area is ready with 3 preset chips below it.
3. **Selection / Input:** The user either clicks one of 3 preset chips (*"Late-night hotfix"*, *"Rebase conflict panic"*, *"Works on my machine"*) to populate real panic changes, or pastes their own git diff/commit log (up to 10,000 characters).
4. **Execution:** The user clicks the *"Confess"* button (or presses `Ctrl+Enter`).
5. **Loading Feedback:** The button disables, and a fixed deadpan status line appears: *"Filing your incident report..."* (if taking >10 seconds, appends: *"Still working. This is taking longer than the incident itself."*).
6. **Revealing Results:**
   - The Panic Score counts up from 0 to its final clamped number (0–100) alongside a severity stamp (*Minor*, *Moderate*, *Major*, *Critical*).
   - The left panel displays the 5-line monospace Incident Report.
   - The right panel displays the structured, neutral PR Description.
7. **Score Inspection:** The user can click *"Why this score?"* to open a popover detailing the 5 deterministic code signals, the AI adjustment (+/-15), and the transparency disclaimer.
8. **Copy & Exit:** The user clicks the primary *"Copy PR Description"* button on the PR panel (or secondary *"Copy Report"* on the left), sees the label change to *"Copied"*, pastes the PR description into their repository/team channel, and finishes the loop in under 10 seconds.

---

## 2. Screens and Layout
Source: `scope.md > The POC Boundary`, `scope.md > SaaS Packaging`.

### Screen 1: Landing Page (`/`)
A clean, document-inspired layout with generous spacing (at least 32px between sections):
- **Hero Section:**
  - Headline (48px+): *"Honest first. Polite second."*
  - Subline (18–20px): *"Paste your messy commits or code changes. Get a deadpan incident report and a clean PR description."*
  - CTA Button: *"Try it now"* (navigates to `/app`).
  - *Constraint:* No screenshot carousels, no fake testimonials, no feature grids.
- **How It Works (3 Steps):**
  1. *Paste:* "Paste your commits or code changes, or pick an example."
  2. *Confess:* "Press Confess. We score the panic and write two versions of the story."
  3. *Copy:* "Copy the clean PR description and send it to your team."
- **Plan Cards (3 Cards):**
  - **Free Card:** Price label `"Free"`. Features listed (strictly truthful):
    - "Paste commits or a diff"
    - "Get a Panic Score, Incident Report and PR description"
    - "Copy the results"
    - Button: *"Try it now"* (links to `/app`).
  - **Pro Card:** Price `"-"`. Subtitle: *"For individual developers"*. Button: *"Coming soon"* (disabled). No feature list.
  - **Team Card:** Price `"-"`. Subtitle: *"For engineering teams"*. Button: *"Coming soon"* (disabled). No feature list.
  - **Transparency Footer:** *"Plans and pricing are not final. Only Free is available today."*

### Screen 2: Dedicated App Surface (`/app`)
Focused entirely on the core loop without landing page clutter (optimized for 30s video demo):
- **Header:** Minimal wordmark *"Commit Confessional"* in the top left, linking back to `/`. No navigation menus or modal popups.
- **Input Area:** Large monospace textarea with placeholder *"Paste your commits or code changes here"*. Directly below the input box, a small line states: *"Your input is sent to an AI service to generate the report."*
- **Action Bar:**
  - 3 preset chips directly below textarea: `[Late-night hotfix]`, `[Rebase conflict panic]`, `[Works on my machine]`.
  - Primary button: *"Confess"* (styled in solid accent `#C2410C`; disabled when textarea is empty or during loading).
- **Results View (Appears on completion below input):**
  - **Score Bar:**
    - Panic Score displayed in large type (64px+).
    - Severity Stamp uppercase badge (*MINOR*, *MODERATE*, *MAJOR*, or *CRITICAL*).
    - One-line summary reason (formed in code from the signal with the largest contribution, not free text from AI).
    - Inline link: *"Why this score?"* (triggers popover).
  - **Two-Column Panel Display:**
    - **Left Column (Incident Report):** Monospace typography, slightly tinted background (`#F3F1EC`). Includes secondary button *"Copy Report"*.
    - **Right Column (PR Description):** Sans-serif typography, crisp white background (`#FFFFFF`). Includes primary button *"Copy PR Description"*.

---

## 3. Look and Feel
Source: `scope.md > Inspiration & Identity`.

- **Base Theme:** Light mode only. Dark mode is explicitly deferred to later.
  - Page Background: `#FAFAF7` (warm off-white).
  - Card & Panel Surfaces: `#FFFFFF` with 1px solid border `#E4E2DC` (no drop shadows).
  - Incident Report Panel: `#F3F1EC` (subtle contrast tint so both panels read as distinct physical documents).
  - Primary Text: `#1C1B19`.
  - Secondary Text: `#5F5C55`.
  - Spacing: Generous layout rhythm (at least 32px between major blocks).
- **Accent System (Single Hue):**
  - Base Hue: `#C2410C` (burnt orange-red). Reserved exclusively for the *"Confess"* button and the severity intensity states.
  - **Severity Stamp Styling:**
    - *Minor (0–24):* Neutral charcoal outline (`#5F5C55`), no accent fill.
    - *Moderate (25–49):* Accent outline (`#C2410C`), accent text, transparent fill.
    - *Major (50–74):* Accent text on light accent tint fill (`#FBE9DF`), 1px accent border.
    - *Critical (75–100):* Solid accent fill (`#C2410C`), crisp white text (`#FFFFFF`).
  - **Accessibility:** All text and background combinations must pass WCAG AA contrast (4.5:1 minimum for body text).
- **Typography:**
  - Interface & PR Description Panel: **IBM Plex Sans** (400, 500, 600).
  - Incident Report Panel & Monospace Input: **IBM Plex Mono** (400, 500).
  - Fallbacks: `system-ui, sans-serif` / `ui-monospace, monospace`.
  - Sizing: Body text 16px minimum; Panic Score 64px+; Hero headline 48px+.

---

## 4. Features and Behavior

### 4.1 Preset Insertion
- Clicking any preset chip replaces the current input with pre-packaged panic code changes (20–40 lines diff + realistic frantic commit messages) loaded from `src/samples/`.
- Textarea remains fully editable after clicking a preset.
- Clicking a preset immediately enables the *"Confess"* button.

### 4.2 Panic Score & "Why This Score?" Popover
Source: `scope.md > Panic Score & Diagnostic Heuristics`.
- **Base Score (Deterministic Code):** Scored from 5 signals:
  1. *Rushed commit messages:* Low-effort messages (e.g. "fix", "asdfgh", "try again").
  2. *Shouting / keyboard mashing:* Messages in ALL CAPS or repetitive key mashing.
  3. *Repeated file touches:* The same file edited repeatedly across commits.
  4. *Leftover debug code:* Remnants of `console.log`, `print()`, debugger statements, or commented code.
  5. *Diff size:* Volume of insertions, deletions, and touched files.
- **AI Adjustment:** LLM provides contextual adjustment of at most `+/-15` with a 1-sentence rationale. File names mentioned in the rationale must exist in the input diff.
- **Clamping:** Final score is clamped strictly between `0` and `100`.
- **One-Line Summary Reason:** Formed deterministically in code from the signal with the largest contribution, not free text from the AI.
- **"Why this score?" Popover Behavior:**
  - Opens on click below the score; closes on outside click or pressing `Esc`.
  - Displays each item on its own line:
    - Base score from code: e.g. `58`
    - Rushed commit messages: e.g. `"7 of 9 commits are 'fix'" (+18)`
    - Shouting or keyboard mashing: e.g. `"2 messages in ALL CAPS" (+6)`
    - Same file edited again and again: e.g. `"auth.ts changed in 5 commits" (+12)`
    - Leftover debug code: e.g. `"4 console.log lines" (+10)`
    - Size of the change: e.g. `"412 lines changed" (+12)`
    - AI adjustment: e.g. `+6, [one sentence reason]`
    - Final Score & Severity: e.g. `64 (Major)`
  - *Diff-Only Rule:* If input lacks commit messages, signals 1–3 display `"Not available (no commit messages)"` instead of numeric points, and weights are re-normalized across remaining signals.
  - *Footer Disclaimer:* Small text: *"A rule-of-thumb score, not a validated measure."*

### 4.3 Incident Report Generation (Left Panel)
Source: `scope.md > Output Specifications & Guardrails`.
- Formatted as exactly **5 short lines**:
  1. `Severity:` [MINIOR | MODERATE | MAJOR | CRITICAL]
  2. `What happened:` [Direct, deadpan description of what broke or changed]
  3. `Cause:` [Root cause derived from diff clues; if unclear, state *"Under investigation"*]
  4. `Fix:` [Factual remedy observed in code]
  5. `Lessons learned:` [Deadpan takeaway from the incident]
- *Tone:* Deadpan, dry, concise humor. Facts derived strictly from input lines.
- *Output guardrails:* File names mentioned in the report must exist in the input diff.

### 4.4 PR Description Generation (Right Panel)
Source: `scope.md > Output Specifications & Guardrails`.
- Formatted strictly into 3 standard sections:
  1. `Summary:` 1–2 neutral sentences describing the change.
  2. `What changed:` Maximum 4 bullet points.
  3. `How to check:` Maximum 2 bullet points for reviewers.
- *Tone:* Strictly neutral, diplomatic, and professional. Zero jokes, deadpan remarks, or emotional commentary.
- *Output guardrails:* File names mentioned in the PR description must exist in the input diff.

### 4.5 Copy to Clipboard
- Primary *"Copy PR Description"* button on the PR panel copies the formatted markdown PR description.
- Secondary *"Copy Report"* button copies the 5-line incident report.
- Clicking either button changes its label to *"Copied"* for 2 seconds before reverting.

---

## 5. States and Boundaries

- **Empty / Initial State:** Textarea is blank. *"Confess"* button is disabled. Presets are clickable. Results container is hidden.
- **Active Editing State:** Textarea contains text. *"Confess"* button is enabled. `Ctrl+Enter` shortcut active.
- **Loading State:** *"Confess"* button disabled with spinner. Fixed text: *"Filing your incident report..."*. If >10 seconds elapse, text appends: *"Still working. This is taking longer than the incident itself."*. Textarea remains visible and disabled to prevent accidental loss.
- **Success State:** Panels render smoothly. Panic Score animates count-up from 0. Copy buttons active.
- **Input Truncation State (>10,000 chars):** Warning banner placed above results: *"Your input was longer than 10,000 characters. Only the first 10,000 were used."*
- **Nonsensical / Empty Input Error:** Friendly notice: *"That doesn't look like commits or code changes. Paste a git diff or commit messages and try again."*
- **API Failure / Timeout (28s total deadline) / Malformed JSON State:** Notice: *"Something went wrong and no report was filed. Please try again."* with a *"Try again"* button that retries using the exact same preserved input. (No unverified cause stated).
- **Session Persistence:** Zero server persistence. Input is preserved locally in memory while the user stays on the page.

---

## 6. Product Decisions
1. Light mode only.
2. One accent hue (`#C2410C` with intensity varying by severity).
3. Dedicated `/app` route.
4. IBM Plex typography family (Plex Sans and Plex Mono).
5. Output guardrails: File names mentioned anywhere in the AI-generated text (including the adjustment reason) must exist in the input diff; JSON schema validated before rendering; unverified error causes prohibited.

---

## 7. What We're Building
- Dedicated landing page (`/`) with Hero, 3-step How It Works, and 3 Plan Cards (Free, Pro, Team).
- Dedicated core loop app (`/app`) with large textarea, 3 real preset chips, Confess trigger, and step-by-step reveal.
- Deterministic 5-signal base score computation + AI adjustment clamped to 0–100.
- Interactive *"Why this score?"* popover with signal breakdown.
- Two distinct output panels: 5-line monospace Incident Report vs 3-section neutral PR description.
- Clipboard copy functionality with "Copied" feedback.
- Robust edge case handling (truncation at 10,000 chars, invalid input check, retry button on API failure).

---

## 8. Deferred From the POC
- **Dark Mode Theme:** Deferred to later.
- **Browser Local History:** Deferred to later.
- **Additional Language Support:** Deferred to later.
- **Paid Features for Pro and Team:** Deferred to later (cards show `Coming soon`).

---

## 9. Non-Goals (Explicitly Cut)
- No user authentication, accounts, or login.
- No database storage, multi-tenant architecture, or server retention. The app does not store inputs.
- No payment gateway integration or active billing.
- No direct GitHub App OAuth or repository cloning from URLs.
- No email collection or newsletter forms.
- No regenerate button (retries only allowed upon actual execution failure).
- No tone or style settings customization.

---

## 10. Known Limitations
Mirrored verbatim from `scope.md`:
1. **Heuristic Score:** Panic Score is a heuristic rule-of-thumb, not a validated measure.
2. **Score Tuning:** The score is tuned for panicked human commits; AI-generated changes with tidy messages may score lower than they feel.
3. **AI Interpretation:** The "Cause" line provided by AI in the Incident Report is an interpretation based on code diff clues, not guaranteed ground truth.
4. **Language Support:** Non-English inputs are completely untested.
5. **Diff-Only Inputs:** If an input consists solely of a git diff without commit messages, signals 1–3 are marked as "n/a" in the UI, and weights are automatically re-normalized across remaining signals.
