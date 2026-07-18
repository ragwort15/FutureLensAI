import { AnalyzeResponse } from "./types";
import { UserDetails } from "./userDetails";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeDecision(
  decision: string,
  user?: UserDetails,
  clarifyAnswers?: Record<string, string>,
  decisionContext?: Record<string, string>,
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, user, clarifyAnswers, decisionContext }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Analysis failed (${res.status}): ${body}`);
  }

  return res.json();
}

export const MOCK_RESPONSE: AnalyzeResponse = {
  decision: "Should I take a job offer in a new city or stay in my current role?",
  summary: "",
  scenarios: [],
};
