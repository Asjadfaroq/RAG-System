"use client";

import { ReactNode } from "react";
import { AppFooter } from "./AppFooter";

type Props = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <main className="app-dark-bg app-grid flex min-h-dvh w-full flex-col lg:flex-row">
      {/* Left panel - branding strip on mobile, full column on desktop */}
      <aside className="relative flex flex-shrink-0 flex-col justify-center overflow-hidden border-b border-zinc-800/40 bg-zinc-950/60 px-5 py-6 sm:py-8 lg:w-[42%] lg:justify-between lg:border-b-0 lg:border-r lg:px-10 lg:py-12 xl:px-14">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-[70px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(99,102,241,0.02)_50%,transparent_100%)] opacity-60" />

        <div className="relative flex flex-col gap-4 sm:gap-6 lg:gap-8">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 shadow-lg shadow-indigo-500/10">
              <svg
                className="h-6 w-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-100">
              Doc Intelligence
            </span>
          </div>

          {/* Tagline + decorative line */}
          <div className="space-y-3 lg:space-y-4">
            <div className="h-px w-12 rounded-full bg-gradient-to-r from-indigo-500/80 to-transparent" />
            <p className="max-w-[280px] text-xs leading-relaxed text-zinc-400 sm:text-sm">
              AI-powered document Q&A and retrieval. Upload, ask, and get answers
              with citations.
            </p>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="relative mt-8 hidden lg:block">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full bg-zinc-800/60"
                style={{ opacity: 1 - (i - 1) * 0.15 }}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Right panel - form */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:px-6 lg:px-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
            )}
            <div className="mx-auto mt-4 h-px w-16 rounded-full bg-indigo-500/50 lg:mx-0" />
          </div>

          <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 px-6 py-6 shadow-xl ring-1 ring-white/5 backdrop-blur-sm sm:px-8 sm:py-8">
            {children}
          </div>

          <AppFooter variant="full" />
        </div>
      </div>
    </main>
  );
}
