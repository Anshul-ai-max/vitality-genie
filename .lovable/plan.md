

# Connect Supabase Backend & Gemini API

## Overview

Wire up your Supabase project as the backend, create a Supabase client, deploy edge functions for AI plan generation using your Gemini key, and replace the mock plan generator with real AI calls.

## Step 1: Install Supabase SDK & Configure Client

- Install `@supabase/supabase-js`
- Create `src/integrations/supabase/client.ts` with your project URL and publishable key (these are public keys, safe to store in code)
- Add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the project

## Step 2: Add Gemini API Key as a Supabase Secret

Your Gemini API key is a **private secret** — it must NOT go in the frontend code. Here's how to set it up:

1. Go to your **Supabase Dashboard** → your project → **Edge Functions** → **Secrets**
2. Add a secret named `AI_GATEWAY_API_KEY` with your Gemini API key as the value
3. Also add `AI_GATEWAY_URL` = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`

This way, the edge functions can read the key securely via `Deno.env.get("AI_GATEWAY_API_KEY")`.

## Step 3: Create Edge Functions

### `supabase/functions/generate-plan/index.ts`
- Accepts user profile data in the request body
- Calculates TDEE/macros server-side
- Calls Gemini API using the stored secret with a detailed prompt
- Returns structured JSON (workouts + diet plan)
- Includes CORS headers and error handling

### `supabase/functions/modify-plan/index.ts`
- Accepts current plan + modification request + plan type
- Sends to Gemini to modify the plan
- Returns updated plan JSON

## Step 4: Update Frontend to Use Supabase

- Replace `generateMockPlan()` calls in `Dashboard.tsx` with `supabase.functions.invoke('generate-plan', { body: profile })`
- Update storage to cache the AI-generated plan
- Add loading states and error handling with toast notifications

## Step 5: Deploy Edge Functions

You'll need to deploy the functions using Supabase CLI from your local machine:
```
supabase link --project-ref lzdrqolezmvbzrrfiuhl
supabase functions deploy generate-plan
supabase functions deploy modify-plan
```

## Technical Notes

- The publishable key (`sb_publishable_...`) is safe to store in the codebase — it's designed to be public
- The Gemini API key stays server-side only, accessed via `Deno.env.get()` in edge functions
- Edge functions will have `verify_jwt = false` initially for simplicity
- All responses include CORS headers for cross-origin calls

