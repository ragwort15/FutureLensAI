// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// import ComparisonDashboard from "@/components/ComparisonDashboard";
// import DecisionForm from "@/components/DecisionForm";
// import { MOCK_RESPONSE, analyzeDecision } from "@/lib/api";
// import { AnalyzeResponse } from "@/lib/types";
// import { UserDetails, loadUserDetails } from "@/lib/userDetails";

// // Flip to true for frontend-only work in Phase 1, before the backend is wired up.
// const USE_MOCK = true;

// export default function AnalyzePage() {
//   const router = useRouter();
//   const [details, setDetails] = useState<UserDetails | null>(null);
//   const [result, setResult] = useState<AnalyzeResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const d = loadUserDetails();
//     if (!d) {
//       router.replace("/");
//       return;
//     }
//     setDetails(d);
//   }, [router]);

//   async function handleSubmit(decision: string) {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = USE_MOCK ? MOCK_RESPONSE : await analyzeDecision(decision);
//       setResult(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (!details) return null;

//   return (
//     <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gradient-to-b from-paper to-signal/5">
//       <div className="mb-6 w-full max-w-2xl rounded-lg border border-line bg-white/60 px-4 py-3 font-body text-sm text-ink/70">
//         <span className="font-medium text-ink">{details.name}</span>
//         <span className="mx-2 text-ink/30">·</span>
//         <span>{details.lifeStage}</span>
//       </div>

//       <div className="mb-10 text-center">
//         <h1 className="font-display text-4xl text-ink">FutureLens</h1>
//         <p className="mt-2 font-body text-ink/60">
//           Explore the future before making your next big decision.
//         </p>
//       </div>

//       <p className="mb-4 max-w-xl text-center font-body text-sm text-ink/50">
//         Describe the decision you're weighing.
//       </p>

//       <DecisionForm onSubmit={handleSubmit} loading={loading} />

//       {error && (
//         <p className="mt-6 max-w-2xl rounded-lg border border-ember/40 bg-ember/10 p-3 font-body text-sm text-ember">
//           {error}
//         </p>
//       )}

//       {result && (
//         <div className="mt-12 w-full">
//           <ComparisonDashboard result={result} />
//         </div>
//       )}
//     </main>
//   );
// }
"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ContextForm from "@/components/ContextForm";
import DecisionForm from "@/components/DecisionForm";
import { MOCK_RESPONSE, analyzeDecision } from "@/lib/api";
import { consumePrefillDecision, saveAnalysisResult } from "@/lib/analysisResult";
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
    if (!d) {
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
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gradient-to-b from-paper to-signal/40">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl text-ink">FutureLens</h1>
        <p className="mt-2 font-body text-ink/60">
          Explore the future before making your next big decision.
        </p>
      </div>

      <p className="mb-4 max-w-xl text-center font-body text-sm text-ink/50">
        Describe the decision you're weighing.
      </p>

      <div className="mb-6 w-full max-w-2xl rounded-lg border border-line bg-white/60 px-4 py-3 font-body text-sm text-ink/70">
        <span className="font-medium text-ink">{details.name}</span>
        <span className="mx-2 text-ink/30">·</span>
        <span>{details.occupation}</span>
      </div>

      <ContextForm />

      <p className="mb-2 w-full max-w-2xl font-body text-sm text-ink/70">
        What is the question that you are weighing?
      </p>

      <DecisionForm
        onSubmit={handleSubmit}
        onBack={() => router.push("/")}
        loading={loading}
        initialValue={prefill}
      />

      {error && (
        <p className="mt-6 max-w-2xl rounded-lg border border-ember/40 bg-ember/10 p-3 font-body text-sm text-ember">
          {error}
        </p>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/50 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-paper" aria-hidden="true" />
          <p className="max-w-xs text-center font-body text-paper">
            Simulating three futures… this may take a moment.
          </p>
        </div>
      )}
    </main>
  );
}