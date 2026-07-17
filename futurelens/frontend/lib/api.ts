import { AnalyzeResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeDecision(decision: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Analysis failed (${res.status}): ${body}`);
  }

  return res.json();
}

// TODO(frontend): once the mocked dashboard (Phase 1) is built against this
// shape, swap the mock import for analyzeDecision() in Phase 2.
export const MOCK_RESPONSE: AnalyzeResponse = {
  decision: "Should I take a job offer in a new city or stay in my current role?",
  summary:
    "The new-city offer has the strongest upside but carries relocation risk; staying put is the safest floor but caps growth.",
  scenarios: [
    {
      title: "Take the offer",
      narrative:
        "You relocate, ramp up over 3 months, and the broader scope accelerates your career meaningfully within a year.",
      score: 78,
      risks: ["Relocation costs and disruption", "New team fit is unproven"],
      evidence: [{ title: "Example source", url: "https://example.com" }],
    },
    {
      title: "Stay and negotiate",
      narrative:
        "You stay, use the offer as leverage, and gain a smaller but immediate improvement in scope and compensation.",
      score: 64,
      risks: ["Leverage may not translate to real change", "Opportunity may not come again"],
      evidence: [{ title: "Example source", url: "https://example.com" }],
    },
    {
      title: "Decline and stay",
      narrative:
        "You decline outright, keep stability, and continue on your current trajectory without disruption.",
      score: 52,
      risks: ["Slower growth", "Regret if the door doesn't reopen"],
      evidence: [{ title: "Example source", url: "https://example.com" }],
    },
  ],
  assumptions: [
    "You have no major financial constraints preventing relocation.",
    "Your current role has limited growth ceiling within the next year.",
    "You're open to a moderate level of short-term disruption for long-term gain.",
  ],
  nextQuestions: [
    "What would change if the new offer included relocation assistance?",
    "How would this decision differ if you had a 2-year time horizon instead of 1?",
  ],
};
