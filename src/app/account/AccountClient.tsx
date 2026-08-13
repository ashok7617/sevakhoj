"use client";

import { useState } from "react";

export function AccountClient() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (r.ok) {
        window.location.href = "/account";
        return;
      }
      setErr(j.error ?? "Something went wrong. Try again.");
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-emerald-700">SevaKhoj · Account</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{mode === "login" ? "Sign in" : "Create your account"}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Save your details once and reuse them across every scheme application — on any device.
      </p>

      <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password {mode === "signup" ? <span className="font-normal text-slate-400">(min 8 characters)</span> : null}
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </label>

        {err ? <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</div> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        {mode === "login" ? "New to SevaKhoj?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setErr(null);
            setMode((m) => (m === "login" ? "signup" : "login"));
          }}
          className="font-medium text-emerald-700 hover:underline"
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
      <p className="mt-4 text-center text-xs text-slate-400">
        Prototype auth. Your password is hashed; details are stored only to pre-fill your applications.
      </p>
    </div>
  );
}
