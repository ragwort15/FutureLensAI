export type DecisionCategory = "education" | "generic";

const EDUCATION_KEYWORDS = [
  "master", "masters", "phd", "doctorate", "grad school", "graduate school",
  "mba", "college", "university", "study abroad", "degree", "postgrad", "post-grad",
];

export function categorizeDecision(decision: string): DecisionCategory {
  const d = decision.toLowerCase();
  if (EDUCATION_KEYWORDS.some((kw) => d.includes(kw))) return "education";
  return "generic";
}

export interface DecisionField {
  id: string;
  label: string;
  type: "text" | "select";
  options?: string[];
  optional?: boolean;
  showIf?: (answers: Record<string, string>) => boolean;
}

// Stage 1 — asked on /analyze before the initial should/shouldn't analysis.
// Just enough context to make the yes/no verdict realistic.
export const DECISION_FIELDS: Record<DecisionCategory, DecisionField[]> = {
  education: [
    {
      id: "maritalStatus",
      label: "Marital / partnership status",
      type: "select",
      options: ["Single", "Married", "Partnered"],
    },
    {
      id: "spouseLocation",
      label: "Where is your spouse / partner based? (city, state)",
      type: "text",
      showIf: (a) => a.maritalStatus === "Married" || a.maritalStatus === "Partnered",
    },
  ],
  generic: [],
};

// Stage 2 — asked on the dashboard AFTER the user decides to go ahead.
// Drives the specific college / state recommendations.
export const COLLEGE_FIELDS: DecisionField[] = [
  { id: "fieldOfStudy", label: "Intended field of study", type: "text" },
  {
    id: "priority",
    label: "Top priority",
    type: "select",
    options: ["Lowest tuition", "Highest-ranked school", "Best location for me", "Balanced tradeoff"],
  },
  {
    id: "preferredRegion",
    label: "Preferred U.S. region (optional)",
    type: "select",
    optional: true,
    options: ["No preference", "Northeast", "Midwest", "South", "West Coast", "Mountain West"],
  },
];
