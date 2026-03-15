Railway EQ Edge Function Notes

Observed live behavior on 2026-03-15:
- `sign-eq-letter` returned `401` from the edge gateway in the deployed environment.
- Frontend fallback approval path worked, which confirms the workflow is now resilient.

Client-side fixes included in app code:
- `generate-eq-letter`, `sign-eq-letter`, and `send-eq-email` now send explicit `Authorization: Bearer <access_token>` headers.
- `apikey` is also sent explicitly when available.

Recommended deployment checks:
1. Ensure the functions are deployed after the latest code changes.
2. Ensure these secrets exist in Supabase:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` for `send-eq-email`
3. Deploy with JWT verification enabled (recommended):

```bash
supabase functions deploy generate-eq-letter
supabase functions deploy sign-eq-letter
supabase functions deploy send-eq-email
```

Avoid `--no-verify-jwt` in production unless you have a separate, explicit internal authentication guard and no direct client invocation path.

Behavioral note:
- `sign-eq-letter` no longer invokes `send-eq-email` internally.
- Email dispatch should be triggered by the frontend after signing succeeds.