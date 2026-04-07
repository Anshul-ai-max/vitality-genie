const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { currentPlan, modification, planType } = await req.json();

    if (!currentPlan || !modification || !planType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: currentPlan, modification, planType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are EvoWell AI, an expert fitness and nutrition coach. The user wants to modify their existing ${planType} plan.

RULES:
- Only modify the ${planType} portion of the plan
- Keep the same JSON structure
- If the modification makes macro targets unrealistic, add a "proteinNote" explaining why
- Every food item must have portion sizes in grams/ml
- Calorie cross-validation: protein×4 + carbs×4 + fat×9 ≈ listed calories
- Be honest if constraints make the plan suboptimal

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences, no extra text.
Return the COMPLETE updated plan as JSON (same structure as input), not just the changed parts.`;

    const userPrompt = `Current plan:
${JSON.stringify(currentPlan, null, 2)}

User's modification request: "${modification}"

Apply this modification and return the complete updated plan as JSON. Return ONLY valid JSON.`;

    const apiKey = Deno.env.get("AI_GATEWAY_API_KEY");
    const apiUrl = Deno.env.get("AI_GATEWAY_URL") || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    if (!apiKey) {
      console.error("AI_GATEWAY_API_KEY is not set in secrets");
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
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI modification failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty AI response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean markdown code fences if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    const updatedPlan = JSON.parse(cleanContent);
    updatedPlan.generatedAt = new Date().toISOString();

    return new Response(JSON.stringify(updatedPlan), {
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
