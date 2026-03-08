"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readResponseBody, formatError, AUTH_KEY, StoredPrefill, AuthResponse } from "../lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [apiBase, setApiBase] = useState(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5224",
  );
  const [tenantSlug, setTenantSlug] = useState("acme");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5224";
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const prefill = JSON.parse(raw) as StoredPrefill;
        if (prefill.apiBase) { base = prefill.apiBase; setApiBase(prefill.apiBase); }
        if (prefill.tenantSlug) setTenantSlug(prefill.tenantSlug);
      }
    } catch { /* ignore */ }
    fetch(`${base.trim()}/auth/me`, { credentials: "include" })
      .then((res) => res.ok ? res.json() : null)
      .then((data: AuthResponse | null) => {
        if (data) router.replace("/");
      })
      .catch(() => { /* ignore */ });
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus("Signing in...");
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: tenantSlug.trim(),
          email: email.trim(),
          password,
        }),
      });
      const body = await readResponseBody(res);
      if (!res.ok) throw new Error(formatError(res.status, body));
      if (!body || typeof body !== "object" || !("role" in body))
        throw new Error("Unexpected response.");
      const auth = body as AuthResponse;
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify({ apiBase, tenantSlug: tenantSlug.trim() } as StoredPrefill));
      } catch { /* ignore */ }
      setStatus("Success. Redirecting...");
      router.replace("/");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign In</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="rounded border border-zinc-600 bg-transparent p-2"
          placeholder="API base (e.g. http://localhost:5224)"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
        />
        <input
          className="rounded border border-zinc-600 bg-transparent p-2"
          placeholder="Tenant slug"
          value={tenantSlug}
          onChange={(e) => setTenantSlug(e.target.value)}
        />
        <input
          className="rounded border border-zinc-600 bg-transparent p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded border border-zinc-600 bg-transparent p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="rounded bg-blue-600 p-2 font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={busy}
        >
          {busy ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="text-sm text-zinc-400">{status}</p>
      <p className="text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-400 underline hover:no-underline">
          Create account
        </Link>
      </p>
    </main>
  );
}
