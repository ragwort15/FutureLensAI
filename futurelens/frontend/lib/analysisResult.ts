import { AnalyzeResponse } from "./types";

const RESULT_KEY = "futurelens.analysisResult";
const PREFILL_KEY = "futurelens.prefillDecision";

export function saveAnalysisResult(result: AnalyzeResponse) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadAnalysisResult(): AnalyzeResponse | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnalyzeResponse;
  } catch {
    return null;
  }
}

export function savePrefillDecision(decision: string) {
  sessionStorage.setItem(PREFILL_KEY, decision);
}

// Reads and clears in one step so the pre-filled text doesn't linger for a
// later, unrelated visit to /analyze.
export function consumePrefillDecision(): string | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(PREFILL_KEY);
  if (value) sessionStorage.removeItem(PREFILL_KEY);
  return value;
}
