"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  step?: 1 | 2 | 3;
  userLabel?: string; // e.g. "Anupama · Working"
  children: ReactNode;
}

const STEPS = [
  { n: 1, label: "About you" },
  { n: 2, label: "Details" },
  { n: 3, label: "Decision" },
];

export default function PageShell({ step, userLabel, children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-paper via-paper to-signal/15">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative block h-9 w-9 overflow-hidden rounded-md bg-ink">
            <Image src="/logo.png" alt="" fill sizes="36px" className="object-contain p-0.5" />
          </span>
          <span className="font-display text-lg text-ink">The Future Lens</span>
        </Link>

        {userLabel && (
          <span className="rounded-full border border-line bg-white/70 px-3 py-1 font-body text-xs text-ink/70">
            {userLabel}
          </span>
        )}
      </header>

      {step && (
        <nav
          aria-label="Progress"
          className="mx-auto mt-8 flex w-full max-w-md items-center justify-between px-6"
        >
          {STEPS.map((s, i) => {
            const state = s.n < step ? "done" : s.n === step ? "current" : "upcoming";
            return (
              <div key={s.n} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={
                      "grid h-7 w-7 place-items-center rounded-full font-body text-xs transition " +
                      (state === "current"
                        ? "bg-signal text-paper"
                        : state === "done"
                          ? "bg-ink text-paper"
                          : "border border-line bg-white text-ink/40")
                    }
                    aria-current={state === "current" ? "step" : undefined}
                  >
                    {state === "done" ? "✓" : s.n}
                  </div>
                  <span
                    className={
                      "font-body text-[10px] uppercase tracking-wide " +
                      (state === "upcoming" ? "text-ink/30" : "text-ink/70")
                    }
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={
                      "mt-[-14px] h-px w-10 sm:w-16 " +
                      (s.n < step ? "bg-ink/60" : "bg-line")
                    }
                  />
                )}
              </div>
            );
          })}
        </nav>
      )}

      <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 pb-24 pt-10">
        {children}
      </main>
    </div>
  );
}
