"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  lateNightHotfix,
  rebaseConflict,
  worksOnMachine,
} from "../../samples/index.ts";
import type { ConfessResponse, ErrorResponse } from "../../lib/schema.ts";
import {
  formatIncidentReportCopy,
  formatPrDescriptionCopy,
  getSeverityStyle,
  buildPopoverRows,
} from "../../lib/ui-logic.ts";

export default function AppPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlow, setLoadingSlow] = useState(false);
  const [result, setResult] = useState<ConfessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedPr, setCopiedPr] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

  // Handle slow loading notice (>10 seconds)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setLoadingSlow(false);
      timer = setTimeout(() => {
        setLoadingSlow(true);
      }, 10000);
    } else {
      setLoadingSlow(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Handle outside click and Escape key for popover
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && showPopover) {
        setShowPopover(false);
        popoverTriggerRef.current?.focus();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        showPopover &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        popoverTriggerRef.current &&
        !popoverTriggerRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopover]);

  // Score count-up animation (~800ms) with prefers-reduced-motion check
  useEffect(() => {
    if (!result) {
      setAnimatedScore(0);
      return;
    }

    const targetScore = result.panicScore.finalScore;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setAnimatedScore(targetScore);
      return;
    }

    const durationMs = 800;
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(easedProgress * targetScore);

      setAnimatedScore(currentScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setAnimatedScore(targetScore);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [result]);

  // Confess API submission
  async function handleSubmit() {
    if (!input.trim() || loading) return;

    setLoading(true);
    setErrorMessage(null);
    setResult(null);
    setShowPopover(false);

    try {
      const res = await fetch("/api/confess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = (await res.json()) as ConfessResponse | ErrorResponse;

      if (!res.ok) {
        const errObj = data as ErrorResponse;
        setErrorMessage(
          errObj.error?.message ||
            "Something went wrong and no report was filed. Please try again."
        );
      } else {
        setResult(data as ConfessResponse);
      }
    } catch {
      setErrorMessage(
        "Something went wrong and no report was filed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  // Preset chip selection
  function handleSelectPreset(presetText: string) {
    setInput(presetText);
    setErrorMessage(null);
  }

  // Clipboard copy helper with fallback
  async function copyToClipboard(text: string, isPr: boolean) {
    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch {
      // Fallback to execCommand
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        success = true;
      } catch {
        success = false;
      }
    }

    if (success) {
      if (isPr) {
        setCopiedPr(true);
        setTimeout(() => setCopiedPr(false), 2000);
      } else {
        setCopiedReport(true);
        setTimeout(() => setCopiedReport(false), 2000);
      }
    }
  }

  const severityStyle = result
    ? getSeverityStyle(result.panicScore.severity)
    : null;
  const popoverRows = result
    ? buildPopoverRows(result.panicScore)
    : [];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1C1B19] font-sans">
      {/* Top Header */}
      <header className="border-b border-[#E4E2DC] bg-[#FFFFFF] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#1C1B19] hover:text-[#C2410C] transition-colors"
          >
            Commit Confessional
          </Link>
          {result?.isMock && (
            <span
              id="mock-badge"
              className="text-xs font-mono font-medium px-2.5 py-1 bg-[#FBE9DF] text-[#C2410C] border border-[#C2410C] rounded"
            >
              MOCK RESPONSE (development only)
            </span>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Input Area */}
        <div className="space-y-3">
          <label
            htmlFor="confess-input"
            className="block text-sm font-medium text-[#1C1B19]"
          >
            Git diff or commit messages
          </label>
          <textarea
            id="confess-input"
            className="w-full h-56 p-4 font-mono text-sm bg-[#FFFFFF] border border-[#E4E2DC] rounded-none focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] disabled:bg-[#F3F1EC] resize-y"
            placeholder="Paste your commits or code changes here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <p className="text-xs text-[#5F5C55]">
            Your input is sent to an AI service to generate the report.
          </p>
        </div>

        {/* Action Bar (Presets & Confess Button) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#5F5C55] mr-1">Presets:</span>
            <button
              type="button"
              id="preset-hotfix"
              onClick={() => handleSelectPreset(lateNightHotfix)}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-[#FFFFFF] border border-[#E4E2DC] hover:border-[#1C1B19] text-[#1C1B19] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Late-night hotfix
            </button>
            <button
              type="button"
              id="preset-rebase"
              onClick={() => handleSelectPreset(rebaseConflict)}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-[#FFFFFF] border border-[#E4E2DC] hover:border-[#1C1B19] text-[#1C1B19] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Rebase conflict panic
            </button>
            <button
              type="button"
              id="preset-machine"
              onClick={() => handleSelectPreset(worksOnMachine)}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-[#FFFFFF] border border-[#E4E2DC] hover:border-[#1C1B19] text-[#1C1B19] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Works on my machine
            </button>
          </div>

          <button
            type="button"
            id="confess-button"
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="px-6 py-2.5 bg-[#C2410C] text-[#FFFFFF] font-medium text-sm rounded-none hover:bg-[#9a3412] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? "Filing..." : "Confess"}
          </button>
        </div>

        {/* Loading Feedback State */}
        {loading && (
          <div
            id="loading-status"
            className="mt-6 p-4 border border-[#E4E2DC] bg-[#FFFFFF] text-sm text-[#1C1B19] space-y-1"
          >
            <p className="font-medium text-[#1C1B19]">
              Filing your incident report...
            </p>
            {loadingSlow && (
              <p className="text-xs text-[#5F5C55]">
                Still working. This is taking longer than the incident itself.
              </p>
            )}
          </div>
        )}

        {/* Error Notice & Try Again Button */}
        {errorMessage && (
          <div
            id="error-banner"
            className="mt-6 p-4 border border-[#C2410C] bg-[#FBE9DF] text-sm text-[#1C1B19] flex items-center justify-between gap-4"
          >
            <p>{errorMessage}</p>
            <button
              type="button"
              id="try-again-button"
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs font-medium bg-[#C2410C] text-[#FFFFFF] hover:bg-[#9a3412] transition-colors whitespace-nowrap cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results View Container */}
        {result && (
          <div id="results-view" className="mt-8 space-y-6">
            {/* Truncation Warning Banner */}
            {result.truncated && (
              <div
                id="truncation-banner"
                className="p-3 bg-[#F3F1EC] border border-[#E4E2DC] text-xs text-[#5F5C55]"
              >
                Your input was longer than 10,000 characters. Only the first
                10,000 were used.
              </div>
            )}

            {/* Score Bar Section */}
            <div
              id="score-bar"
              className="p-6 bg-[#FFFFFF] border border-[#E4E2DC] flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-baseline gap-4">
                <span
                  id="panic-score-number"
                  className="text-6xl font-bold tracking-tight text-[#1C1B19]"
                >
                  {animatedScore}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      id="severity-stamp"
                      className={`text-xs font-mono font-semibold px-2 py-0.5 uppercase tracking-wider ${
                        severityStyle?.badgeClass || ""
                      }`}
                    >
                      {result.panicScore.severity}
                    </span>
                    <span className="text-xs text-[#5F5C55]">Panic Score</span>
                  </div>
                  <p id="dominant-reason" className="text-sm text-[#5F5C55]">
                    {result.panicScore.dominantReason}
                  </p>
                </div>
              </div>

              {/* Popover Trigger */}
              <div className="relative">
                <button
                  type="button"
                  ref={popoverTriggerRef}
                  id="why-this-score-button"
                  onClick={() => setShowPopover(!showPopover)}
                  aria-expanded={showPopover}
                  aria-haspopup="dialog"
                  className="text-sm text-[#C2410C] hover:underline underline-offset-2 font-medium cursor-pointer"
                >
                  Why this score?
                </button>

                {/* Score Breakdown Popover */}
                {showPopover && (
                  <div
                    ref={popoverRef}
                    id="score-popover"
                    role="dialog"
                    aria-label="Score breakdown"
                    className="absolute right-0 top-8 z-20 w-80 md:w-96 p-5 bg-[#FFFFFF] border border-[#E4E2DC] shadow-lg text-xs space-y-2.5"
                  >
                    <div className="font-semibold text-sm border-b border-[#E4E2DC] pb-2 text-[#1C1B19]">
                      Score Breakdown
                    </div>
                    <div className="space-y-2">
                      {popoverRows.map((row, idx) => (
                        <div
                          key={idx}
                          className={
                            row.isDisclaimer
                              ? "pt-2 border-t border-[#E4E2DC] text-[#5F5C55] italic"
                              : "flex justify-between items-start gap-2"
                          }
                        >
                          <span className="text-[#5F5C55]">{row.label}</span>
                          <span
                            className={
                              row.isDisclaimer
                                ? "block"
                                : "font-mono font-medium text-[#1C1B19] text-right"
                            }
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Two-Column Output Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Monospace Incident Report */}
              <div
                id="incident-report-panel"
                className="bg-[#F3F1EC] border border-[#E4E2DC] p-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5F5C55]">
                      Incident Report
                    </span>
                    <span className="text-xs font-mono text-[#5F5C55]">
                      Plain text
                    </span>
                  </div>

                  {/* 5-line Incident Report Body */}
                  <div className="font-mono text-xs text-[#1C1B19] leading-relaxed space-y-2.5">
                    <div>
                      <span className="text-[#5F5C55]">Severity: </span>
                      <span className="font-semibold">
                        {result.incidentReport.severity}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5F5C55]">What happened: </span>
                      <span>{result.incidentReport.whatHappened}</span>
                    </div>
                    <div>
                      <span className="text-[#5F5C55]">Cause: </span>
                      <span>{result.incidentReport.cause}</span>
                    </div>
                    <div>
                      <span className="text-[#5F5C55]">Fix: </span>
                      <span>{result.incidentReport.fix}</span>
                    </div>
                    <div>
                      <span className="text-[#5F5C55]">Lessons learned: </span>
                      <span>{result.incidentReport.lessonsLearned}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4E2DC]">
                  <button
                    type="button"
                    id="copy-report-button"
                    onClick={() =>
                      copyToClipboard(
                        formatIncidentReportCopy(result.incidentReport),
                        false
                      )
                    }
                    className="w-full py-2 px-3 text-xs font-mono font-medium bg-[#FFFFFF] border border-[#E4E2DC] text-[#1C1B19] hover:border-[#1C1B19] transition-colors cursor-pointer"
                  >
                    {copiedReport ? "Copied" : "Copy Report"}
                  </button>
                </div>
              </div>

              {/* Right Column: Sans-serif PR Description */}
              <div
                id="pr-description-panel"
                className="bg-[#FFFFFF] border border-[#E4E2DC] p-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-2">
                    <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#5F5C55]">
                      Pull Request Description
                    </span>
                    <span className="text-xs font-sans text-[#5F5C55]">
                      Markdown
                    </span>
                  </div>

                  {/* Structured PR Description Body */}
                  <div className="font-sans text-xs text-[#1C1B19] leading-relaxed space-y-4">
                    <div>
                      <h4 className="font-semibold text-xs text-[#5F5C55] uppercase tracking-wider mb-1">
                        Summary
                      </h4>
                      <p className="text-[#1C1B19]">
                        {result.prDescription.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-[#5F5C55] uppercase tracking-wider mb-1">
                        What changed
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 text-[#1C1B19]">
                        {result.prDescription.whatChanged.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-[#5F5C55] uppercase tracking-wider mb-1">
                        How to check
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 text-[#1C1B19]">
                        {result.prDescription.howToCheck.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4E2DC]">
                  <button
                    type="button"
                    id="copy-pr-button"
                    onClick={() =>
                      copyToClipboard(
                        formatPrDescriptionCopy(result.prDescription),
                        true
                      )
                    }
                    className="w-full py-2 px-3 text-xs font-sans font-medium bg-[#1C1B19] text-[#FFFFFF] hover:bg-[#33322e] transition-colors cursor-pointer"
                  >
                    {copiedPr ? "Copied" : "Copy PR Description"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
