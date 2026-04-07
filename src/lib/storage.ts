import { UserProfile, WeeklyPlan, defaultProfile } from "./types";

const PROFILE_KEY = "evowell_profile";
const PLAN_KEY = "evowell_plan";

export function getProfile(): UserProfile {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return { ...defaultProfile };
  try {
    return JSON.parse(raw);
  } catch {
    return { ...defaultProfile };
  }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getPlan(): WeeklyPlan | null {
  const raw = localStorage.getItem(PLAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePlan(plan: WeeklyPlan) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function clearAll() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(PLAN_KEY);
}
