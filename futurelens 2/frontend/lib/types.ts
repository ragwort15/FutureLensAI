// Mirrors backend/app/schemas.py. Keep these in sync manually —
// if you change one, change the other.

export interface Evidence {
  title: string;
  url: string;
}

export interface ScenarioResult {
  title: string;
  narrative: string;
  score: number; // 0-100
  risks: string[];
  evidence: Evidence[];
}

export interface AnalyzeResponse {
  decision: string;
  scenarios: ScenarioResult[];
  summary: string;
}
