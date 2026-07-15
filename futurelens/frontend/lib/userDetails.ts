export type LifeStage = "Student" | "Working" | "Between roles" | "Retired" | "Other";

export interface UserDetails {
  name: string;
  age: string;
  occupation: string;
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
