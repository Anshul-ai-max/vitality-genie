export interface UserProfile {
  gender: "male" | "female" | "other";
  goals: string[];
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  age: number;
  height: number;
  weight: number;
  workoutFrequency: number;
  environment: "home_none" | "home_basic" | "gym" | "outdoor" | "mixed";
  splitPreference: string;
  dietaryPreferences: string[];
  allergies: string[];
  cuisine: string[];
  budget: "budget" | "moderate" | "no_limit";
  supplementWillingness: "none" | "basic" | "open";
  currentSupplements: string[];
  onboarded: boolean;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
  duration: string;
  isRest: boolean;
}

export interface Meal {
  name: string;
  time: string;
  foods: { item: string; portion: string; calories: number; protein: number; carbs: number; fat: number }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface DietPlan {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: Meal[];
  proteinNote?: string;
  supplementSuggestions?: string[];
}

export interface WeeklyPlan {
  workouts: WorkoutDay[];
  diet: DietPlan;
  generatedAt: string;
}

export const defaultProfile: UserProfile = {
  gender: "male",
  goals: [],
  fitnessLevel: "beginner",
  age: 25,
  height: 170,
  weight: 70,
  workoutFrequency: 4,
  environment: "gym",
  splitPreference: "auto",
  dietaryPreferences: [],
  allergies: [],
  cuisine: [],
  budget: "moderate",
  supplementWillingness: "basic",
  currentSupplements: [],
  onboarded: false,
};
