"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import DecisionForm from "@/components/DecisionForm";
import PageShell from "@/components/PageShell";
import { analyzeDecision } from "@/lib/api";
import { consumePrefillDecision, saveAnalysisResult } from "@/lib/analysisResult";
import { loadClarifyAnswers } from "@/lib/clarifyingQuestions";
import { DECISION_FIELDS, categorizeDecision } from "@/lib/decisionContext";
import { UserDetails, loadUserDetails } from "@/lib/userDetails";

export default function AnalyzePage() {
  const router = useRouter();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  const [prefill, setPrefill] = useState("");
  const [decision, setDecision] = useState("");
  const [contextAnswers, setContextAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadUserDetails();
    const a = loadClarifyAnswers();
    if (!d || !a) {
      router.replace("/");
      return;
    }
    setDetails(d);
    setAnswers(a);
    const pre = consumePrefillDecision();
    if (pre) {
      setPrefill(pre);
      setDecision(pre);
    }
  }, [router]);

  const category = useMemo(() => categorizeDecision(decision), [decision]);
  const contextFields = DECISION_FIELDS[category];
  const visibleFields = contextFields.filter((f) => !f.showIf || f.showIf(contextAnswers));
  const requiredMissing = visibleFields.some(
    (f) => !f.optional && !(contextAnswers[f.id] ?? "").trim(),
  );

  function handleContextChange(id: string, value: string) {
    setContextAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(text: string) {
    if (!details || !answers) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeDecision(text, details, answers, contextAnswers);
      saveAnalysisResult(data);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (!details) return null;

  const inputClass =
    "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 font-body text-ink placeholder:text-ink/40 transition focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30";
  const labelClass = "mb-1.5 block font-body text-sm font-medium text-ink/80";

  const extraContent = contextFields.length > 0 ? (
    <div className="mt-6 rounded-xl border border-signal/30 bg-signal/5 p-5">
      <p className="mb-1 font-body text-xs font-semibold uppercase tracking-wide text-signal">
        Extra context
      </p>
      <p className="mb-4 font-body text-sm text-ink/70">
        This looks like an education decision — a few extra details help us recommend specific schools and locations.
      </p>
      <div className="space-y-4">
        {visibleFields.map((f) => (
          <div key={f.id}>
            <label htmlFor={`ctx-${f.id}`} className={labelClass}>
              {f.label}
              {f.optional && <span className="ml-1 text-ink/40">(optional)</span>}
            </label>
            {f.type === "select" ? (
              <select
                id={`ctx-${f.id}`}
                value={contextAnswers[f.id] ?? ""}
                onChange={(e) => handleContextChange(f.id, e.target.value)}
                required={!f.optional}
                className={inputClass}
              >
                <option value="" disabled>Select one…</option>
                {f.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={`ctx-${f.id}`}
                type="text"
                value={contextAnswers[f.id] ?? ""}
                onChange={(e) => handleContextChange(f.id, e.target.value)}
                required={!f.optional}
                className={inputClass}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  ) : null;

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
          onDecisionChange={setDecision}
          submitDisabled={requiredMissing}
          extraContent={extraContent}
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
