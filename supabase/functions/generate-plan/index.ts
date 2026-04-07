import { corsHeaders } from "../_shared/cors.ts";

interface UserProfile {
  gender: string;
  goals: string[];
  fitnessLevel: string;
  age: number;
  height: number;
  weight: number;
  workoutFrequency: number;
  environment: string;
  splitPreference: string;
  dietaryPreferences: string[];
  allergies: string[];
  cuisine: string[];
  budget: string;
  supplementWillingness: string;
  currentSupplements: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const profile: UserProfile = await req.json();

    // Calculate TDEE using Mifflin-St Jeor
    const bmr =
      profile.gender === "female"
        ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
        : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;

    const activityMultipliers: Record<number, number> = {
      1: 1.2, 2: 1.3, 3: 1.4, 4: 1.55, 5: 1.65, 6: 1.75, 7: 1.9,
    };
    const tdee = Math.round(bmr * (activityMultipliers[profile.workoutFrequency] || 1.55));

    const isLoss = profile.goals.includes("lose_weight");
    const isMuscle = profile.goals.includes("build_muscle");
    const calories = isLoss ? tdee - 500 : isMuscle ? tdee + 300 : tdee;
    const protein = Math.round(profile.weight * (isMuscle ? 2.0 : 1.6));
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

    const systemPrompt = `You are EvoWell AI, an expert fitness and nutrition coach. Generate a complete 7-day workout plan and daily diet plan as structured JSON.

RULES:
- Every food item MUST have portion sizes in grams or ml
- Calorie cross-validation: protein×4 + carbs×4 + fat×9 should approximately equal listed calories
- Use cuisine-authentic meals based on user preferences
- Be equipment-aware based on workout environment
- Be budget-aware for ingredient selection
- If the user is vegetarian with high protein targets, include a "proteinNote" explaining achievability
- If supplement willingness is "basic" or "open", include "supplementSuggestions" array

OUTPUT FORMAT (strict JSON, no markdown):
{
  "workouts": [
    {
      "day": "Monday",
      "focus": "Push / Chest & Shoulders",
      "isRest": false,
      "duration": "45-60 min",
      "exercises": [
        { "name": "Exercise Name", "sets": 4, "reps": "8-10", "rest": "90s", "notes": "optional tip" }
      ]
    }
  ],
  "diet": {
    "targetCalories": ${calories},
    "targetProtein": ${protein},
    "targetCarbs": ${carbs},
    "targetFat": ${fat},
    "meals": [
      {
        "name": "Breakfast",
        "time": "8:00 AM",
        "foods": [
          { "item": "Food name", "portion": "200g", "calories": 280, "protein": 10, "carbs": 48, "fat": 6 }
        ],
        "totalCalories": 530,
        "totalProtein": 32,
        "totalCarbs": 57,
        "totalFat": 20
      }
    ],
    "proteinNote": "optional note about protein targets",
    "supplementSuggestions": ["Whey Protein", "Creatine"]
  }
}`;

    const userPrompt = `Create a personalized plan for:
- Gender: ${profile.gender}, Age: ${profile.age}, Height: ${profile.height}cm, Weight: ${profile.weight}kg
- Goals: ${profile.goals.join(", ")}
- Fitness level: ${profile.fitnessLevel}
- Workout frequency: ${profile.workoutFrequency} days/week
- Environment: ${profile.environment}
- Split preference: ${profile.splitPreference}
- Dietary preferences: ${profile.dietaryPreferences.join(", ") || "none"}
- Allergies: ${profile.allergies.join(", ") || "none"}
- Cuisine preferences: ${profile.cuisine.join(", ") || "any"}
- Budget: ${profile.budget}
- Supplement willingness: ${profile.supplementWillingness}
- Current supplements: ${profile.currentSupplements.join(", ") || "none"}

TDEE: ${tdee} kcal | Target: ${calories} kcal | Protein: ${protein}g | Carbs: ${carbs}g | Fat: ${fat}g

Generate exactly 7 workout days (${profile.workoutFrequency} training + ${7 - profile.workoutFrequency} rest) and 4 meals (breakfast, lunch, snack, dinner) hitting the macro targets.`;

    const apiKey = Deno.env.get("AI_GATEWAY_API_KEY");
    const apiUrl = Deno.env.get("AI_GATEWAY_URL") || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI_GATEWAY_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plan = JSON.parse(content);
    plan.generatedAt = new Date().toISOString();

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
