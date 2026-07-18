// Mirrors backend/app/schemas.py. Keep these in sync manually —
// if you change one, change the other.

export interface Evidence {
  title: string;
  url: string;
}

export interface ScoreFactor {
  label: string;
  value: number;
}

export interface ScenarioResult {
  title: string;
  narrative: string;
  score: number; // 0-100
  risks: string[];
  evidence: Evidence[];
  scoreBreakdown?: ScoreFactor[]; // NEW — optional, backend may not send this yet. Factor labels are AI-generated per-decision, not fixed.
}

export interface AnalyzeResponse {
  decision: string;
  scenarios: ScenarioResult[];
  summary: string;
  assumptions?: string[];       // NEW — optional, backend may not send this yet
  nextQuestions?: string[];     // NEW — optional, backend may not send this yet
}
