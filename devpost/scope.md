---
doc: scope
status: approved
---

# Commit Confessional

Paste your messy commits or code changes. Get a deadpan incident report and a clean PR description.

## The Unique Kernel
*Honest first, polite second.* Two distinct panels generated from the exact same input: an unfiltered, deadpan Incident Report on the left, and a clean, diplomatic PR description on the right. If either panel is removed, the product loses its distinctive identity.

## Who It's For
A developer who has to explain freshly written code to their team or boss: after late-night debugging, after vibe coding with AI, or after any messy set of changes. The output must also be easy to read for non-developers (product managers, QA, team leads).

## The Core Loop
1. **Open:** One large monospace input box with placeholder *"Paste your commits or code changes here"*. Below it: 3 preset chips and one *Confess* button (disabled while input is empty). No onboarding modal or complex menus.
2. **Select / Input:** Pick one of 3 preset chips (which fills the input with an editable real panic diff of 20–40 lines plus panicked commits), or paste custom commits/diff.
3. **Execute:** Click *Confess* (or press `Ctrl+Enter`).
4. **Transition & Reveal:** A short loading state with one deadpan line reveals the results step by step: Panic Score counts up from 0, followed by the Incident Report (left), and then the PR description (right).
5. **Copy & Done:** User clicks the primary *Copy* button on the PR panel (or secondary *Copy* on the Incident Report), sees the button change to *"Copied"*, and the loop ends.
*Performance target:* Preset to Copy in 3 clicks or fewer, under 10 seconds (excluding API wait).

## Panic Score & Diagnostic Heuristics
- **Computation:**
  1. Base score is calculated deterministically in code from 5 heuristic signals:
     - Low-effort commit messages (e.g. "fix", "asdfgh")
     - Shouting or keyboard mashing
     - Repeated file touches
     - Debug leftovers (e.g. console.log, print, commented code)
     - Diff size (lines and files changed)
  2. AI adds an adjustment of at most +/-15.
  3. Final result is clamped to 0–100.
- **Nature:** It is explicitly a heuristic, not a scientifically validated measure.
- **Evidence:** Concrete diagnostic evidence sits behind a *"Why this score?"* link.
- **Severity Labels:**
  - Minor: 0–24
  - Moderate: 25–49
  - Major: 50–74
  - Critical: 75–100

## Output Specifications & Guardrails
- **Incident Report (5 short lines):**
  1. Severity
  2. What happened
  3. Cause (*Rule:* If cause is unclear from input, state *"Under investigation"*)
  4. Fix
  5. Lessons learned
  *Tone:* Deadpan humor, dry, and factual. Facts derived strictly from the input only.
- **PR Description:**
  - Summary: 1–2 sentences
  - What changed: maximum 4 bullet points
  - How to check: maximum 2 bullet points
  *Tone:* Neutral, professional, and clear. Zero deadpan or comedic remarks.
- **Integrity Guardrails:**
  - File names mentioned in the output must exist in the input to limit invented file names and malformed output.
  - JSON output schema must be strictly validated before rendering.
  - Input capped at about 10,000 characters (truncated with a clear notice).
  - Every error, failed command, or unverifiable claim is logged in `docs/failures/failure-log.md` (see `AGENTS.md`).

## Inspiration & Identity
- **Language:** English only, for both UI and generated output.
- **Visual Style:** Clean, lots of whitespace, large type. Monospace typography reserved exclusively for the report panel. One accent color used strictly for the severity label.
- **Tone Distinction:** Deadpan and humorous only for the Incident Report; strictly neutral and professional for the PR description.

## Why This Matters to the Learner
I am building this tool to help explain newly written code to a team or a boss. Sometimes the code was vibe coded with AI, and sometimes the changes are simply messy. In both cases, the code needs a clear explanation that other people can read.

## What "Working" Looks Like
- **First 30 seconds of demo video:** Shows pasting frantic changes / selecting a preset, and immediately revealing the two panels side-by-side (comedy on the left, professionalism on the right) with the Panic Score rising.
- **End-to-end execution:** Preset to Copy in 3 clicks or fewer, under 10 seconds (excluding API wait):
  A user selects the "Late-night hotfix" preset -> clicks Confess -> Panic Score animates with its severity label and "Why this score?" evidence -> 5-line Incident Report and clean PR description appear with verified file names -> Copy button shows "Copied".

## The POC Boundary
- **Application:** One-screen core loop app.
- **Landing Page:** Minimalist SaaS landing page consisting strictly of: hero section, 3-step how-it-works, and 3 plan cards. Nothing more.
- **Built-in presets:** 3 real preset diffs (20–40 lines each) stored in `src/samples/` ("Late-night hotfix", "Rebase conflict panic", "Works on my machine"), calling the real API (no mocked or cached results).
- **Validation:** Strict JSON schema validation and file existence verification against input.
- **Input cap:** ~10,000 characters.

## SaaS Packaging
Landing page + one-screen app + three plan cards (Free, Pro, Team):
- **Free Card:** Titled "Free", lists only features that actually exist (paste commits/diff, confess, copy outputs).
- **Pro & Team Cards:** Show `"-"` for price and `"Coming soon"`.
- **Transparency Notice:** Explicit label: *"Plans and pricing are not final. Only Free is available today."*

## Known Limitations
- **Heuristic Score:** Panic Score is a heuristic rule-of-thumb, not a validated measure.
- **Score Tuning:** The score is tuned for panicked human commits; AI-generated changes with tidy messages may score lower than they feel.
- **AI Interpretation:** The "Cause" line provided by AI in the Incident Report is an interpretation based on code diff clues, not guaranteed ground truth.
- **Language Support:** Non-English inputs are completely untested.
- **Diff-Only Inputs:** If an input consists solely of a git diff without commit messages, signals 1–3 (commit messages, shouting, repeated file touches across commits) are marked as "n/a" in the UI, and weights are automatically re-normalized across the remaining signals.

## Later
- Real team subscription billing and seat management.
- Additional language support.
- Local browser history of past confessions.

## Explicitly Cut
- User authentication & login.
- Persistent database & server storage.
- Real payment processing & billing systems.
- GitHub App integration or direct URL/repo import.
- Tone settings customization.
- Regenerate button, export features, and email collection.
