"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiBase, readResponseBody, formatError, AUTH_KEY, StoredPrefill, AuthResponse } from "../lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const prefill = JSON.parse(raw) as StoredPrefill;
        if (prefill.tenantSlug) setTenantSlug(prefill.tenantSlug);
      }
    } catch { /* ignore */ }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus("Creating account...");
    try {
      const res = await fetch(`${getApiBase()}/auth/register-tenant`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: tenantName.trim(),
          tenantSlug: tenantSlug.trim(),
          ownerEmail: ownerEmail.trim(),
          ownerPassword: ownerPassword,
        }),
      });
      const body = await readResponseBody(res);
      if (!res.ok) throw new Error(formatError(res.status, body));
      if (!body || typeof body !== "object" || !("role" in body))
        throw new Error("Unexpected response.");
      const auth = body as AuthResponse;
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify({ tenantSlug: tenantSlug.trim() } as StoredPrefill));
      } catch { /* ignore */ }
      setStatus("Account created. Redirecting...");
      router.replace("/");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Create account failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create Account</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="rounded border border-zinc-600 bg-transparent p-2"
          placeholder="Tenant name"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
        />
        <input
          className="rounded border border-zinc-600 bg-transparent p-2"
          placeholder="Tenant slug (e.g. acme)"
          value={tenantSlug}
          onChange={(e) => setTenantSlug(e.target.value)}
          required
        />
        <input
          className="rounded border border-zinc-600 bg-transparent p-2"
          type="email"
          placeholder="Owner email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          required
        />
        <input
          className="rounded border border-zinc-600 bg-transparent p-2"
          type="password"
          placeholder="Password"
          value={ownerPassword}
          onChange={(e) => setOwnerPassword(e.target.value)}
          required
        />
        <button
          className="rounded bg-indigo-600 p-2 font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={busy}
        >
          {busy ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="text-sm text-zinc-400">{status}</p>
      <p className="text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/signin" className="text-blue-400 underline hover:no-underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
