import { WeeklyPlan, UserProfile } from "./types";

export function generateMockPlan(profile: UserProfile): WeeklyPlan {
  const isLoss = profile.goals.includes("lose_weight");
  const isMuscle = profile.goals.includes("build_muscle");
  const bmr = profile.gender === "female"
    ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
    : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  const tdee = Math.round(bmr * 1.55);
  const calories = isLoss ? tdee - 500 : isMuscle ? tdee + 300 : tdee;
  const protein = Math.round(profile.weight * (isMuscle ? 2.0 : 1.6));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  const restDays = 7 - profile.workoutFrequency;
  const workouts = [];
  const focuses = profile.splitPreference === "ppl"
    ? ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Rest"]
    : profile.splitPreference === "upper_lower"
    ? ["Upper", "Lower", "Rest", "Upper", "Lower", "Rest", "Rest"]
    : ["Full Body", "Upper", "Lower", "Push", "Pull", "Legs", "Rest"];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  for (let i = 0; i < 7; i++) {
    const isRest = i >= profile.workoutFrequency;
    workouts.push({
      day: days[i],
      focus: isRest ? "Rest Day" : focuses[i % focuses.length],
      isRest,
      duration: isRest ? "0 min" : "45-60 min",
      exercises: isRest ? [] : [
        { name: "Warm-up", sets: 1, reps: "5 min", rest: "0s" },
        { name: i % 2 === 0 ? "Bench Press" : "Barbell Rows", sets: 4, reps: "8-10", rest: "90s" },
        { name: i % 2 === 0 ? "Overhead Press" : "Pull-ups", sets: 3, reps: "10-12", rest: "60s" },
        { name: i % 3 === 0 ? "Squats" : "Romanian Deadlifts", sets: 4, reps: "8-10", rest: "120s" },
        { name: "Core Circuit", sets: 3, reps: "15", rest: "45s" },
      ],
    });
  }

  const meals = [
    {
      name: "Breakfast",
      time: "8:00 AM",
      foods: [
        { item: "Oatmeal with berries", portion: "200g", calories: 280, protein: 10, carbs: 48, fat: 6 },
        { item: "Greek yogurt", portion: "150g", calories: 130, protein: 18, carbs: 6, fat: 4 },
        { item: "Almonds", portion: "20g", calories: 120, protein: 4, carbs: 3, fat: 10 },
      ],
      totalCalories: 530, totalProtein: 32, totalCarbs: 57, totalFat: 20,
    },
    {
      name: "Lunch",
      time: "1:00 PM",
      foods: [
        { item: "Grilled chicken breast", portion: "180g", calories: 280, protein: 52, carbs: 0, fat: 6 },
        { item: "Brown rice", portion: "150g", calories: 170, protein: 4, carbs: 36, fat: 1 },
        { item: "Mixed vegetables", portion: "200g", calories: 80, protein: 4, carbs: 14, fat: 1 },
      ],
      totalCalories: 530, totalProtein: 60, totalCarbs: 50, totalFat: 8,
    },
    {
      name: "Snack",
      time: "4:00 PM",
      foods: [
        { item: "Protein shake", portion: "300ml", calories: 180, protein: 30, carbs: 8, fat: 3 },
        { item: "Banana", portion: "1 medium", calories: 105, protein: 1, carbs: 27, fat: 0 },
      ],
      totalCalories: 285, totalProtein: 31, totalCarbs: 35, totalFat: 3,
    },
    {
      name: "Dinner",
      time: "7:30 PM",
      foods: [
        { item: "Salmon fillet", portion: "200g", calories: 360, protein: 40, carbs: 0, fat: 22 },
        { item: "Sweet potato", portion: "200g", calories: 180, protein: 4, carbs: 41, fat: 0 },
        { item: "Spinach salad", portion: "100g", calories: 25, protein: 3, carbs: 3, fat: 0 },
      ],
      totalCalories: 565, totalProtein: 47, totalCarbs: 44, totalFat: 22,
    },
  ];

  return {
    workouts,
    diet: {
      targetCalories: calories,
      targetProtein: protein,
      targetCarbs: carbs,
      targetFat: fat,
      meals,
      proteinNote: protein > 140 ? "High protein target — consider adding a protein supplement if struggling to hit targets through food alone." : undefined,
      supplementSuggestions: profile.supplementWillingness !== "none" ? ["Whey Protein", "Creatine Monohydrate", "Vitamin D3"] : undefined,
    },
    generatedAt: new Date().toISOString(),
  };
}
