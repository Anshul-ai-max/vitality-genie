

# Fix Edge Function Deploy Error

## Problem
The edge functions import CORS headers from `../_shared/cors.ts` using a relative path. Supabase Edge Functions don't support shared files across functions via relative imports — each function must be self-contained in its own folder.

## Fix

### Option A: Inline CORS headers (recommended, simplest)

**File 1: `supabase/functions/generate-plan/index.ts`**
- Remove `import { corsHeaders } from "../_shared/cors.ts";`
- Add inline constant at the top:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**File 2: `supabase/functions/modify-plan/index.ts`**
- Same change — remove the import, add inline constant.

No other changes needed. After this fix, redeploy:
```
supabase functions deploy generate-plan --no-verify-jwt
supabase functions deploy modify-plan --no-verify-jwt
```

