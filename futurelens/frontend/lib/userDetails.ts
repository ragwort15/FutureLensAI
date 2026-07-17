export type LifeStage =
  | "Student"
  | "Working"
  | "Between roles"
  | "Business owner"
  | "Retired"
  | "Homemaker"
  | "Freelancer"
  | "Architect"
  | "Designer"
  | "Interior decorator"
  | "Engineer"
  | "Other";

export const LIFE_STAGES: LifeStage[] = [
  "Student",
  "Working",
  "Between roles",
  "Business owner",
  "Freelancer",
  "Homemaker",
  "Architect",
  "Designer",
  "Interior decorator",
  "Engineer",
  "Retired",
  "Other",
];

export interface UserDetails {
  name: string;
  age: string;
  location: string;
  lifeStage: LifeStage;
}

const KEY = "futurelens.userDetails";

export function saveUserDetails(details: UserDetails) {
  sessionStorage.setItem(KEY, JSON.stringify(details));
}

export function loadUserDetails(): UserDetails | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserDetails;
  } catch {
    return null;
  }
}
