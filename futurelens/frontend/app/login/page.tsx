"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { saveSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid = /.+@.+\..+/.test(email.trim()) && password.trim().length >= 4;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Enter a valid email and a password (4+ characters).");
      return;
    }
    saveSession({ email: email.trim(), role: "user" });
    router.push("/");
  }

  function handleGuest() {
    saveSession({ email: "guest@futurelens.local", role: "guest" });
    router.push("/");
  }

  function handleAdmin() {
    saveSession({ email: "admin@futurelens.local", role: "admin" });
    router.push("/");
  }

  const inputClass =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 font-body text-paper placeholder:text-paper/40 transition focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/40";
  const labelClass = "mb-1.5 block font-body text-sm font-medium text-paper/80";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-12">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-signal/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-ember/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative h-32 w-32 sm:h-40 sm:w-40">
            <Image
              src="/logo.png"
              alt="The Future Lens"
              fill
              priority
              sizes="160px"
              className="object-contain"
            />
          </div>
          <h1 className="mt-4 font-display text-3xl text-paper sm:text-4xl">The Future Lens</h1>
          <p className="mt-1 font-body text-sm text-paper/60">Capturing tomorrow, today.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••"
                required
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-ember/40 bg-ember/10 p-2.5 font-body text-xs text-ember">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className="mt-6 w-full rounded-lg bg-signal px-6 py-3 font-body font-medium text-paper shadow-lg shadow-signal/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sign in
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-body text-xs uppercase tracking-wide text-paper/40">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGuest}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 font-body font-medium text-paper transition hover:border-white/30 hover:bg-white/10"
            >
              Continue as guest
            </button>
            <button
              type="button"
              onClick={handleAdmin}
              className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 font-body font-medium text-ember transition hover:border-ember hover:bg-ember/20"
            >
              Login as admin
            </button>
          </div>

          <p className="mt-4 text-center font-body text-xs text-paper/50">
            Guest and admin sessions aren&apos;t saved after you close the tab.
          </p>
        </form>
      </div>
    </div>
  );
}
