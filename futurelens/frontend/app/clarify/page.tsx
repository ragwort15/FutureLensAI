"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import PageShell from "@/components/PageShell";
import { getQuestions, saveClarifyAnswers } from "@/lib/clarifyingQuestions";
import { UserDetails, loadUserDetails } from "@/lib/userDetails";

export default function ClarifyPage() {
  const router = useRouter();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const d = loadUserDetails();
    if (!d) {
      router.replace("/");
      return;
    }
    setDetails(d);
  }, [router]);

  const questions = useMemo(
    () => (details ? getQuestions(details.lifeStage, details.location) : []),
    [details],
  );

  const isValid = questions.every((q) => (answers[q.id] ?? "").trim().length > 0);

  function handleChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    saveClarifyAnswers(answers);
    router.push("/analyze");
  }

  if (!details) return null;

  const inputClass =
    "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 font-body text-ink placeholder:text-ink/40 transition focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30";
  const labelClass = "mb-1.5 block font-body text-sm font-medium text-ink/80";

  return (
    <PageShell step={2} userLabel={`${details.name} · ${details.lifeStage}`}>
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          A few more <span className="text-signal">details</span>
        </h1>
        <p className="mt-3 font-body text-ink/60">
          These help us tailor the scenarios to your situation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8"
      >
        <div className="space-y-5">
          {questions.map((q) => (
            <div key={q.id}>
              <label htmlFor={q.id} className={labelClass}>{q.label}</label>
              {q.type === "select" ? (
                <select
                  id={q.id}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>Select one…</option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={q.id}
                  type={q.type}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  required
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg border border-line px-4 py-2.5 font-body text-sm text-ink/70 transition hover:border-ink/40 hover:text-ink"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="rounded-lg bg-signal px-6 py-3 font-body font-medium text-paper shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue →
          </button>
        </div>
      </form>
    </PageShell>
  );
}
