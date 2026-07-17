"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DecisionForm from "@/components/DecisionForm";
import PageShell from "@/components/PageShell";
import { MOCK_RESPONSE, analyzeDecision } from "@/lib/api";
import { consumePrefillDecision, saveAnalysisResult } from "@/lib/analysisResult";
import { loadClarifyAnswers } from "@/lib/clarifyingQuestions";
import { UserDetails, loadUserDetails } from "@/lib/userDetails";

const USE_MOCK = true;

export default function AnalyzePage() {
  const router = useRouter();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [prefill, setPrefill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadUserDetails();
    const answers = loadClarifyAnswers();
    if (!d || !answers) {
      router.replace("/");
      return;
    }
    setDetails(d);
    const pre = consumePrefillDecision();
    if (pre) setPrefill(pre);
  }, [router]);

  async function handleSubmit(decision: string) {
    setLoading(true);
    setError(null);
    try {
      const data = USE_MOCK ? MOCK_RESPONSE : await analyzeDecision(decision);
      saveAnalysisResult(data);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (!details) return null;

  return (
    <PageShell step={3} userLabel={`${details.name} · ${details.lifeStage}`}>
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          What are you <span className="text-signal">weighing?</span>
        </h1>
        <p className="mt-3 font-body text-ink/60">
          Describe the decision. We&apos;ll simulate three plausible futures.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <DecisionForm
          onSubmit={handleSubmit}
          onBack={() => router.push("/clarify")}
          loading={loading}
          initialValue={prefill}
        />
      </div>

      {error && (
        <p className="mt-6 max-w-2xl rounded-lg border border-ember/40 bg-ember/10 p-3 font-body text-sm text-ember">
          {error}
        </p>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/60 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-paper" aria-hidden="true" />
          <p className="max-w-xs text-center font-body text-paper">
            Simulating three futures… this may take a moment.
          </p>
        </div>
      )}
    </PageShell>
  );
}
