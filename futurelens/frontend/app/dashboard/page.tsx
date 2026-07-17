"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { loadAnalysisResult, savePrefillDecision } from "@/lib/analysisResult";
import { AnalyzeResponse } from "@/lib/types";
import { UserDetails, loadUserDetails } from "@/lib/userDetails";

const cardClass =
  "rounded-2xl border border-line bg-white/90 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 font-body text-xs font-medium uppercase tracking-wide text-ink/50">
      <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [customQuestionInput, setCustomQuestionInput] = useState("");

  useEffect(() => {
    const d = loadUserDetails();
    if (!d) {
      router.replace("/");
      return;
    }
    const r = loadAnalysisResult();
    if (!r) {
      router.replace("/analyze");
      return;
    }
    setDetails(d);
    setResult(r);
  }, [router]);

  function askThis(question: string) {
    savePrefillDecision(question);
    router.push("/analyze");
  }

  function handleAddCustomQuestion(e: React.FormEvent) {
    e.preventDefault();
    const question = customQuestionInput.trim();
    if (!question) return;
    setCustomQuestions((prev) => [...prev, question]);
    setCustomQuestionInput("");
  }

  function handleDownload() {
    if (!result || !details) return;

    const lines = [
      `FutureLens analysis for ${details.name}`,
      `${details.occupation} · ${details.location}`,
      "",
      "Question",
      result.decision,
      "",
      "Summary",
      result.summary,
      "",
      ...result.scenarios.flatMap((s) => [
        `${s.title} (score: ${Math.round(s.score)})`,
        s.narrative,
        ...(s.risks.length > 0 ? ["Risks:", ...s.risks.map((r) => `- ${r}`)] : []),
        "",
      ]),
      "Assumptions",
      ...(result.assumptions && result.assumptions.length > 0
        ? result.assumptions.map((a) => `- ${a}`)
        : ["None provided."]),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "futurelens-analysis.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!details || !result) return null;

  const chartData = result.scenarios.map((s) => ({
    name: s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title,
    score: Math.round(s.score),
  }));

  const initials = details.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="relative flex min-h-screen justify-center overflow-hidden bg-gradient-to-b from-paper via-paper to-signal/20 px-8 py-10">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-signal/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl text-ink">FutureLens</h1>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 font-body text-sm font-semibold text-ink shadow-lg shadow-ember/40 ring-2 ring-ember/30 transition hover:scale-105 hover:shadow-xl hover:shadow-ember/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M10 2a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 11.586V3a1 1 0 0 1 1-1Z" />
              <path d="M4 15a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1a1 1 0 0 1 1-1Z" />
            </svg>
            Download your report
          </button>
        </div>

        <div>
          <SectionLabel>Your question</SectionLabel>
          <p className={`${cardClass} border-l-4 border-l-signal p-4 font-body text-ink`}>
            {result.decision}
          </p>
        </div>

        <div>
          <SectionLabel>Summary</SectionLabel>
          <p className={`${cardClass} p-4 font-body leading-relaxed text-ink/80`}>
            {result.summary}
          </p>
        </div>

        <div>
          <SectionLabel>Score comparison</SectionLabel>
          <div className={`${cardClass} h-48 p-4`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DAD7CE" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#151726" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#151726" }} />
                <Tooltip />
                <Bar dataKey="score" fill="#3D5A80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {result.scenarios.map((scenario) => (
            <div
              key={scenario.title}
              className={`${cardClass} group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1`}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-signal to-ember/70" />

              <div className="flex flex-col p-5">
                <div className="mb-4 text-center">
                  <span className="font-display text-5xl font-semibold text-signal transition-transform duration-200 group-hover:scale-105">
                    {Math.round(scenario.score)}
                  </span>
                  <p className="mt-1 font-body text-xs font-medium uppercase tracking-wide text-ink/50">
                    Score
                  </p>
                </div>

                <h3 className="mb-2 text-center font-display text-lg leading-tight text-ink">
                  {scenario.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-ink/80">
                  {scenario.narrative}
                </p>

                {scenario.risks.length > 0 && (
                  <div className="mt-4">
                    <p className="font-body text-xs font-medium uppercase tracking-wide text-ember">
                      Risks
                    </p>
                    <ul className="mt-1 space-y-1">
                      {scenario.risks.map((risk) => (
                        <li key={risk} className="font-body text-sm text-ink/70">
                          · {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scenario.evidence.length > 0 && (
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/50">
                      Evidence
                    </p>
                    <ul className="mt-1 space-y-1">
                      {scenario.evidence.map((e) => (
                        <li key={e.url}>
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-body text-sm text-signal underline decoration-signal/30 underline-offset-2 hover:decoration-signal"
                          >
                            {e.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col">
            <SectionLabel>Assumptions</SectionLabel>
            {result.assumptions && result.assumptions.length > 0 ? (
              <ul className={`${cardClass} flex-1 space-y-2 p-4`}>
                {result.assumptions.map((assumption) => (
                  <li key={assumption} className="font-body text-sm text-ink/80">
                    · {assumption}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${cardClass} flex-1 p-4 font-body text-sm text-ink/50`}>
                No assumptions were provided for this analysis.
              </p>
            )}
          </div>

          <div className={`${cardClass} flex flex-col p-5`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-signal font-display text-sm font-semibold text-paper">
                {initials}
              </div>
              <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/50">
                Your profile
              </p>
            </div>
            <dl className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <dt className="font-body text-sm text-ink/60">Name</dt>
                <dd className="font-body text-sm font-medium text-ink">{details.name}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <dt className="font-body text-sm text-ink/60">Age</dt>
                <dd className="font-body text-sm font-medium text-ink">{details.age}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <dt className="font-body text-sm text-ink/60">Occupation</dt>
                <dd className="font-body text-sm font-medium text-ink">{details.occupation}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-body text-sm text-ink/60">Location</dt>
                <dd className="font-body text-sm font-medium text-ink">{details.location}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <SectionLabel>Suggested next questions</SectionLabel>

          {[...(result.nextQuestions ?? []), ...customQuestions].length > 0 ? (
            <ul className="space-y-3">
              {[...(result.nextQuestions ?? []), ...customQuestions].map((question) => (
                <li
                  key={question}
                  className={`${cardClass} flex items-center justify-between gap-4 p-4`}
                >
                  <span className="font-body text-sm text-ink/80">{question}</span>
                  <button
                    type="button"
                    onClick={() => askThis(question)}
                    className="shrink-0 rounded-lg border border-signal px-3 py-1.5 font-body text-xs font-medium text-signal transition hover:bg-signal hover:text-paper"
                  >
                    Ask this
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${cardClass} p-4 font-body text-sm text-ink/50`}>
              No follow-up questions yet — add your own below.
            </p>
          )}

          <form onSubmit={handleAddCustomQuestion} className="mt-3 flex gap-2">
            <input
              value={customQuestionInput}
              onChange={(e) => setCustomQuestionInput(e.target.value)}
              placeholder="Add your own question…"
              className="flex-1 rounded-lg border border-line bg-white p-2.5 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-signal"
            />
            <button
              type="submit"
              disabled={!customQuestionInput.trim()}
              className="shrink-0 rounded-lg bg-signal px-4 py-2 font-body text-sm font-medium text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
