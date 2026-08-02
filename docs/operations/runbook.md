# Operations Runbook

## Health endpoint

Endpoint: `GET /api/health`

Response includes:
- `status`: `ok` or `degraded`
- `checks`: raw dependency checks
- `readiness`: checks required for full service
- `requirements.turnstileEnforced`

## Incident triage

## If `status=degraded`

1. Check `checks.supabase`.
2. Check `checks.supabaseAdmin`.
3. Check `checks.openai`.
4. If `turnstileEnforced=true`, check `checks.turnstile`.
5. Validate environment variables with:

```bash
npm run verify:env:strict
```

## If API rate limit errors spike

1. Verify Upstash credentials are present:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
2. Check health payload (`checks.upstash`).
3. Confirm responses include:
- `x-ratelimit-limit`
- `x-ratelimit-remaining`
- `x-ratelimit-reset`

## If lead capture fails

1. Check `POST /api/leads` logs (`leads.create.*` events).
2. Confirm Supabase table `lead_requests` exists and policies are active.
3. If captcha is enabled, validate Turnstile client/server keys.

## If the initial diagnostic fails

1. Check `POST /api/initial-diagnostic` logs (`initial_diagnostic.*` events).
2. Confirm migration `20260802150000_initial_diagnostics.sql` is applied.
3. Confirm `initial_diagnostics` has RLS enabled, no direct grants for `anon` or `authenticated`, and the required `service_role` grants.
4. If captcha is enabled, validate the `initial_diagnostic` Turnstile action and client/server keys.

## If OAuth callback fails

1. Check `auth.callback.*` logs.
2. Confirm `NEXT_PUBLIC_SITE_URL` matches deployment domain.
3. Confirm provider callback URL matches `/auth/callback`.

## Quick rollback path

1. Roll back deployment to last known good release.
2. Re-run smoke:

```bash
npm run verify:deploy -- --base-url <URL>
```

3. If DB migration caused failure, apply forward fix migration (avoid destructive rollback in-place).
