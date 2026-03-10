"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiBase, readResponseBody, formatError } from "../lib/api";
import { useToast } from "../components/ToastProvider";
import AuthLayout from "../components/AuthLayout";

const inputBase =
  "w-full rounded-xl border border-zinc-600/80 bg-zinc-800/40 pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-500 transition-all duration-200 focus:border-indigo-500/60 focus:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const inputIcon = "absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500";

export default function SignUpPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch(`${getApiBase()}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) router.replace("/");
      })
      .catch(() => { /* ignore */ });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setStatus(msg);
      showToast(msg, "error");
      return;
    }
    setBusy(true);
    setStatus("Creating account...");
    try {
      const res = await fetch(`${getApiBase()}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      const body = await readResponseBody(res);
      if (!res.ok) throw new Error(formatError(res.status, body));
      if (!body || typeof body !== "object" || !("role" in body))
        throw new Error("Unexpected response.");
      setStatus("Account created. Redirecting...");
      showToast("Account created.", "success");
      router.replace("/");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Create account failed.";
      setStatus(msg);
      showToast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Get started with AI-powered document intelligence">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Email
          </label>
          <div className="relative">
            <svg className={inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              id="email"
              className={inputBase}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Password
          </label>
          <div className="relative">
            <svg className={inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              id="password"
              className={inputBase}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Confirm password
          </label>
          <div className="relative">
            <svg className={inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <input
              id="confirmPassword"
              className={inputBase}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {status && (
          <p className="text-sm text-zinc-400" role="status">
            {status}
          </p>
        )}

        <button
          className="mt-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 disabled:opacity-60 disabled:hover:bg-indigo-600"
          type="submit"
          disabled={busy}
        >
          {busy ? "Creating..." : "Create account"}
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700/60" />
          </div>
          <div className="relative flex justify-center text-xs text-zinc-500">
            <span className="bg-zinc-900/40 px-3">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-indigo-400 underline-offset-2 hover:text-indigo-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
