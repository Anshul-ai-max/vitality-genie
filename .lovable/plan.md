

# Fix: Edge Function 401 Error

## Problem
Your edge function returns `401: Invalid Token or Protected Header formatting`. This means JWT verification is enabled on the function, rejecting the anonymous/publishable key token.

The `--no-verify-jwt` flag on deploy should disable this, but the `supabase/config.toml` has no `[functions]` section to explicitly disable JWT verification. The config may be overriding the deploy flag.

## Fix (Two-Part)

### Part 1: Add function config to `supabase/config.toml`
Add these lines to explicitly disable JWT verification for both functions:

```toml
[functions.generate-plan]
verify_jwt = false

[functions.modify-plan]
verify_jwt = false
```

### Part 2: Redeploy
After this change is applied, you need to redeploy from your terminal:

```bash
supabase functions deploy generate-plan --no-verify-jwt
supabase functions deploy modify-plan --no-verify-jwt
```

### Why This Happens
The Supabase client sends `Authorization: Bearer sb_publishable_...` with every request. The edge function gateway tries to verify this as a JWT, but publishable keys aren't valid JWTs — they're just API keys. Disabling JWT verification tells the gateway to skip this check and pass the request through.

### Alternative Quick Check
If redeploying doesn't fix it, verify in your **Supabase Dashboard → Edge Functions** that the functions actually show as deployed and that JWT verification is turned OFF in the function settings there.

