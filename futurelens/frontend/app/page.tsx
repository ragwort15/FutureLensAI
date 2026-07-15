"use client";

import { useState } from "react";

import ComparisonDashboard from "@/components/ComparisonDashboard";
import DecisionForm from "@/components/DecisionForm";
import { MOCK_RESPONSE, analyzeDecision } from "@/lib/api";
import { AnalyzeResponse } from "@/lib/types";

// Flip to true for frontend-only work in Phase 1, before the backend is wired up.
const USE_MOCK = false;

export default function Home() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(decision: string) {
    setLoading(true);
    setError(null);
    try {
      const data = USE_MOCK ? MOCK_RESPONSE : await analyzeDecision(decision);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl text-ink">FutureLens</h1>
        <p className="mt-2 font-body text-ink/60">Three futures for every decision.</p>
      </div>

      <DecisionForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <p className="mt-6 max-w-2xl rounded-lg border border-ember/40 bg-ember/10 p-3 font-body text-sm text-ember">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-12 w-full">
          <ComparisonDashboard result={result} />
        </div>
      )}
    </main>
  );
}
