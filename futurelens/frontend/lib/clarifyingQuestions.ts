import { CurrencyCode, currencyForCountry } from "./countries";
import { LifeStage } from "./userDetails";

export type QuestionType = "text" | "number" | "select";

export interface ClarifyingQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
}

const SALARY_BANDS_BY_CURRENCY: Record<CurrencyCode, string[]> = {
  USD: ["Less than $30k", "$30k–$50k", "$50k–$75k", "$75k–$100k", "$100k–$150k", "$150k–$250k", "More than $250k"],
  GBP: ["Less than £25k", "£25k–£40k", "£40k–£60k", "£60k–£80k", "£80k–£120k", "£120k–£200k", "More than £200k"],
  EUR: ["Less than €25k", "€25k–€40k", "€40k–€60k", "€60k–€80k", "€80k–€120k", "€120k–€200k", "More than €200k"],
  INR: ["Less than ₹3L", "₹3L–₹6L", "₹6L–₹10L", "₹10L–₹20L", "₹20L–₹40L", "₹40L–₹75L", "More than ₹75L"],
  JPY: ["Less than ¥3M", "¥3M–¥5M", "¥5M–¥8M", "¥8M–¥12M", "¥12M–¥20M", "¥20M–¥35M", "More than ¥35M"],
  CNY: ["Less than ¥50k", "¥50k–¥100k", "¥100k–¥200k", "¥200k–¥400k", "¥400k–¥800k", "¥800k–¥1.5M", "More than ¥1.5M"],
  AUD: ["Less than A$40k", "A$40k–A$60k", "A$60k–A$80k", "A$80k–A$110k", "A$110k–A$160k", "A$160k–A$250k", "More than A$250k"],
  CAD: ["Less than C$35k", "C$35k–C$55k", "C$55k–C$75k", "C$75k–C$100k", "C$100k–C$150k", "C$150k–C$250k", "More than C$250k"],
  SGD: ["Less than S$40k", "S$40k–S$70k", "S$70k–S$100k", "S$100k–S$150k", "S$150k–S$220k", "S$220k–S$350k", "More than S$350k"],
  CHF: ["Less than CHF 60k", "CHF 60k–90k", "CHF 90k–120k", "CHF 120k–160k", "CHF 160k–220k", "CHF 220k–350k", "More than CHF 350k"],
  AED: ["Less than AED 100k", "AED 100k–200k", "AED 200k–350k", "AED 350k–550k", "AED 550k–850k", "AED 850k–1.5M", "More than AED 1.5M"],
};

const SAVINGS_BANDS_BY_CURRENCY: Record<CurrencyCode, string[]> = {
  USD: ["Less than $5k", "$5k–$25k", "$25k–$50k", "$50k–$100k", "$100k–$250k", "$250k–$500k", "More than $500k"],
  GBP: ["Less than £5k", "£5k–£20k", "£20k–£50k", "£50k–£100k", "£100k–£200k", "£200k–£400k", "More than £400k"],
  EUR: ["Less than €5k", "€5k–€20k", "€20k–€50k", "€50k–€100k", "€100k–€200k", "€200k–€400k", "More than €400k"],
  INR: ["Less than ₹1L", "₹1L–₹5L", "₹5L–₹10L", "₹10L–₹25L", "₹25L–₹50L", "₹50L–₹1Cr", "More than ₹1Cr"],
  JPY: ["Less than ¥500k", "¥500k–¥2M", "¥2M–¥5M", "¥5M–¥10M", "¥10M–¥25M", "¥25M–¥50M", "More than ¥50M"],
  CNY: ["Less than ¥30k", "¥30k–¥150k", "¥150k–¥300k", "¥300k–¥600k", "¥600k–¥1.5M", "¥1.5M–¥3M", "More than ¥3M"],
  AUD: ["Less than A$10k", "A$10k–A$30k", "A$30k–A$70k", "A$70k–A$150k", "A$150k–A$300k", "A$300k–A$600k", "More than A$600k"],
  CAD: ["Less than C$10k", "C$10k–C$30k", "C$30k–C$60k", "C$60k–C$120k", "C$120k–C$250k", "C$250k–C$500k", "More than C$500k"],
  SGD: ["Less than S$10k", "S$10k–S$40k", "S$40k–S$80k", "S$80k–S$150k", "S$150k–S$300k", "S$300k–S$600k", "More than S$600k"],
  CHF: ["Less than CHF 10k", "CHF 10k–40k", "CHF 40k–80k", "CHF 80k–150k", "CHF 150k–300k", "CHF 300k–600k", "More than CHF 600k"],
  AED: ["Less than AED 20k", "AED 20k–100k", "AED 100k–250k", "AED 250k–500k", "AED 500k–1M", "AED 1M–2M", "More than AED 2M"],
};

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$", GBP: "£", EUR: "€", INR: "₹", JPY: "¥", CNY: "¥",
  AUD: "A$", CAD: "C$", SGD: "S$", CHF: "CHF", AED: "AED",
};

const LOAN_OPTIONS = ["No", "Yes — small", "Yes — significant"];

// Placeholder default so QUESTIONS is renderable in isolation.
// getQuestions(lifeStage, location) below replaces these at render time
// with the location-appropriate currency.
export const SALARY_BANDS = SALARY_BANDS_BY_CURRENCY.USD;

export function salaryBandsForLocation(location: string): string[] {
  return SALARY_BANDS_BY_CURRENCY[currencyForCountry(location)];
}

export function salaryLabelForLocation(location: string): string {
  const c = currencyForCountry(location);
  return `Salary range (${CURRENCY_SYMBOL[c]})`;
}

function savingsBandsForLocation(location: string): string[] {
  return SAVINGS_BANDS_BY_CURRENCY[currencyForCountry(location)];
}

function savingsLabelForLocation(location: string): string {
  const c = currencyForCountry(location);
  return `Savings (${CURRENCY_SYMBOL[c]})`;
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Freelance", "Own practice"];

export const QUESTIONS: Record<LifeStage, ClarifyingQuestion[]> = {
  Student: [
    { id: "year", label: "What year of study?", type: "select", options: ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] },
    { id: "field", label: "Field of study", type: "text" },
    { id: "workingPartTime", label: "Working part-time?", type: "select", options: ["Yes", "No"] },
  ],
  Working: [
    { id: "experience", label: "Years of experience", type: "number" },
    { id: "field", label: "Which field?", type: "text" },
    { id: "isFresher", label: "Fresher or experienced?", type: "select", options: ["Fresher", "Experienced"] },
    { id: "salaryRange", label: "Salary range (USD)", type: "select", options: SALARY_BANDS },
  ],
  "Between roles": [
    { id: "lastRole", label: "Last role", type: "text" },
    { id: "timeOff", label: "How long between roles?", type: "text" },
    { id: "reason", label: "Reason for the gap", type: "select", options: ["Layoff", "Voluntary", "Study", "Personal", "Other"] },
  ],
  "Business owner": [
    { id: "industry", label: "Industry", type: "text" },
    { id: "teamSize", label: "Team size", type: "number" },
    { id: "yearsRunning", label: "Years running the business", type: "number" },
    { id: "stage", label: "Stage", type: "select", options: ["Early", "Growth", "Established"] },
  ],
  Retired: [
    { id: "yearsRetired", label: "Years since retiring", type: "number" },
    { id: "priorField", label: "Prior field", type: "text" },
  ],
  Homemaker: [
    { id: "householdSize", label: "Household size", type: "number" },
    { id: "yearsAtHome", label: "Years focused on the home", type: "number" },
    { id: "priorField", label: "Prior field (if any)", type: "text" },
  ],
  Freelancer: [
    { id: "field", label: "Field", type: "text" },
    { id: "yearsFreelancing", label: "Years freelancing", type: "number" },
    { id: "clientMix", label: "Client mix", type: "select", options: ["Mostly one client", "A few steady clients", "Many short-term clients"] },
    { id: "salaryRange", label: "Annual income range (USD)", type: "select", options: SALARY_BANDS },
  ],
  Architect: [
    { id: "experience", label: "Years of experience", type: "number" },
    { id: "specialization", label: "Specialization", type: "select", options: ["Residential", "Commercial", "Landscape", "Urban planning", "Other"] },
    { id: "employment", label: "Employment type", type: "select", options: EMPLOYMENT_TYPES },
    { id: "salaryRange", label: "Salary range (USD)", type: "select", options: SALARY_BANDS },
  ],
  Designer: [
    { id: "discipline", label: "Design discipline", type: "select", options: ["Graphic", "UX / UI", "Product", "Fashion", "Motion", "Other"] },
    { id: "experience", label: "Years of experience", type: "number" },
    { id: "employment", label: "Employment type", type: "select", options: EMPLOYMENT_TYPES },
    { id: "salaryRange", label: "Salary range (USD)", type: "select", options: SALARY_BANDS },
  ],
  "Interior decorator": [
    { id: "experience", label: "Years of experience", type: "number" },
    { id: "clientType", label: "Primary client type", type: "select", options: ["Residential", "Commercial", "Both"] },
    { id: "employment", label: "Employment type", type: "select", options: EMPLOYMENT_TYPES },
    { id: "salaryRange", label: "Salary range (USD)", type: "select", options: SALARY_BANDS },
  ],
  Engineer: [
    { id: "discipline", label: "Engineering discipline", type: "select", options: ["Software", "Mechanical", "Electrical", "Civil", "Chemical", "Aerospace", "Other"] },
    { id: "experience", label: "Years of experience", type: "number" },
    { id: "isFresher", label: "Fresher or experienced?", type: "select", options: ["Fresher", "Experienced"] },
    { id: "salaryRange", label: "Salary range (USD)", type: "select", options: SALARY_BANDS },
  ],
  Other: [
    { id: "situation", label: "Briefly describe your situation", type: "text" },
  ],
};

export function getQuestions(lifeStage: LifeStage, location: string): ClarifyingQuestion[] {
  const bands = salaryBandsForLocation(location);
  const label = salaryLabelForLocation(location);
  const base = (QUESTIONS[lifeStage] ?? []).map((q) =>
    q.id === "salaryRange" ? { ...q, options: bands, label } : q,
  );
  const financial: ClarifyingQuestion[] = [
    {
      id: "savings",
      label: savingsLabelForLocation(location),
      type: "select",
      options: savingsBandsForLocation(location),
    },
    { id: "ongoingLoan", label: "Any ongoing loan?", type: "select", options: LOAN_OPTIONS },
  ];
  return [...base, ...financial];
}

const KEY = "futurelens.clarifyAnswers";

export function saveClarifyAnswers(answers: Record<string, string>) {
  sessionStorage.setItem(KEY, JSON.stringify(answers));
}

export function loadClarifyAnswers(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}
