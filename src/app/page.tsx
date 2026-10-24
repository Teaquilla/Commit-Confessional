// src/app/page.tsx
// Public landing page for Commit Confessional.
// Implements Screen 1 from devpost/prd.md Section 2 and look-and-feel from spec.md Section 5.

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1C1B19] font-sans antialiased selection:bg-[#FBE9DF] selection:text-[#C2410C]">
      {/* Top Navigation */}
      <header className="border-b border-[#E4E2DC] bg-[#FAFAF7]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-[#1C1B19] hover:opacity-80 transition-opacity"
          >
            Commit Confessional
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#C2410C] rounded hover:bg-[#9A3412] transition-colors"
          >
            Open App
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-24">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#1C1B19] leading-[1.1]">
            Honest first. Polite second.
          </h1>
          <p className="text-lg md:text-xl text-[#5F5C55] leading-relaxed max-w-2xl mx-auto">
            Paste your messy commits or code changes. Get a deadpan incident report and a clean PR description.
          </p>
          <div className="pt-4">
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-[#C2410C] rounded hover:bg-[#9A3412] transition-colors shadow-sm"
            >
              Try it now
            </Link>
          </div>
        </section>

        {/* How It Works (3 Steps) */}
        <section className="space-y-8">
          <div className="border-t border-[#E4E2DC] pt-12">
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1B19] mb-2">
              How It Works
            </h2>
            <p className="text-sm text-[#5F5C55]">
              Three steps from frantic git commits to a professional pull request.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#E4E2DC] p-6 rounded space-y-3">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C2410C]">
                Step 1
              </div>
              <h3 className="text-lg font-semibold text-[#1C1B19]">Paste</h3>
              <p className="text-sm text-[#5F5C55] leading-relaxed">
                Paste your commits or code changes, or pick an example.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E4E2DC] p-6 rounded space-y-3">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C2410C]">
                Step 2
              </div>
              <h3 className="text-lg font-semibold text-[#1C1B19]">Confess</h3>
              <p className="text-sm text-[#5F5C55] leading-relaxed">
                Press Confess. We score the panic and write two versions of the story.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E4E2DC] p-6 rounded space-y-3">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C2410C]">
                Step 3
              </div>
              <h3 className="text-lg font-semibold text-[#1C1B19]">Copy</h3>
              <p className="text-sm text-[#5F5C55] leading-relaxed">
                Copy the clean PR description and send it to your team.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards (3 Cards) */}
        <section className="space-y-8 pb-12">
          <div className="border-t border-[#E4E2DC] pt-12">
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1B19] mb-2">
              Plans & Pricing
            </h2>
            <p className="text-sm text-[#5F5C55]">
              Transparent options sized for developer workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Card */}
            <div className="bg-white border border-[#E4E2DC] p-6 rounded flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1C1B19]">Free</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight text-[#1C1B19]">$0</span>
                    <span className="ml-1 text-xs text-[#5F5C55]">/ today</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-[#5F5C55] pt-2">
                  <li className="flex items-start">
                    <span className="text-[#C2410C] mr-2 font-mono">•</span>
                    <span>Paste commits or a diff</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#C2410C] mr-2 font-mono">•</span>
                    <span>Get a Panic Score, Incident Report and PR description</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#C2410C] mr-2 font-mono">•</span>
                    <span>Copy the results</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/app"
                className="w-full text-center py-2.5 px-4 text-sm font-medium text-white bg-[#C2410C] rounded hover:bg-[#9A3412] transition-colors"
              >
                Try it now
              </Link>
            </div>

            {/* Pro Card */}
            <div className="bg-white border border-[#E4E2DC] p-6 rounded flex flex-col justify-between space-y-6 opacity-75">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1C1B19]">Pro</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight text-[#1C1B19]">-</span>
                  </div>
                </div>
                <p className="text-sm italic text-[#5F5C55]">
                  For individual developers
                </p>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 text-sm font-medium text-[#5F5C55] bg-[#F3F1EC] rounded cursor-not-allowed border border-[#E4E2DC]"
              >
                Coming soon
              </button>
            </div>

            {/* Team Card */}
            <div className="bg-white border border-[#E4E2DC] p-6 rounded flex flex-col justify-between space-y-6 opacity-75">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1C1B19]">Team</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight text-[#1C1B19]">-</span>
                  </div>
                </div>
                <p className="text-sm italic text-[#5F5C55]">
                  For engineering teams
                </p>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 text-sm font-medium text-[#5F5C55] bg-[#F3F1EC] rounded cursor-not-allowed border border-[#E4E2DC]"
              >
                Coming soon
              </button>
            </div>
          </div>

          {/* Transparency Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#5F5C55] italic">
              Plans and pricing are not final. Only Free is available today.
            </p>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-[#E4E2DC] bg-[#FAFAF7] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F5C55] gap-4">
          <p>© 2026 Commit Confessional. Proof of concept for Build With AI: Basics.</p>
          <div className="flex items-center space-x-6">
            <Link href="/app" className="hover:text-[#1C1B19] transition-colors">
              Open App
            </Link>
            <a
              href="https://github.com/Teaquilla/Commit-Confessional"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1C1B19] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
