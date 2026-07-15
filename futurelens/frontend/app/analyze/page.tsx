"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ComparisonDashboard from "@/components/ComparisonDashboard";
import DecisionForm from "@/components/DecisionForm";
import { MOCK_RESPONSE, analyzeDecision } from "@/lib/api";
import { AnalyzeResponse } from "@/lib/types";
import { UserDetails, loadUserDetails } from "@/lib/userDetails";

// Flip to true for frontend-only work in Phase 1, before the backend is wired up.
const USE_MOCK = false;

export default function AnalyzePage() {
  const router = useRouter();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadUserDetails();
    if (!d) {
      router.replace("/");
      return;
    }
    setDetails(d);
  }, [router]);

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

  if (!details) return null;

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="mb-6 w-full max-w-2xl rounded-lg border border-line bg-white/60 px-4 py-3 font-body text-sm text-ink/70">
        <span className="font-medium text-ink">{details.name}</span>
        <span className="mx-2 text-ink/30">·</span>
        <span>{details.lifeStage}</span>
      </div>

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
