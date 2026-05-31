# Go-Live Checklist

## 1) Pre-deploy (local)

Run these checks in the branch to deploy:

```bash
npm ci
npm run verify:env:strict
npm run release:check
```

Expected result:
- `verify:env:strict` passes with no missing keys.
- `release:check` passes (`lint`, `typecheck`, `unit`, `e2e`, `build`).

## 2) Database migrations (Supabase)

Link and push migrations:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

Verify latest migrations are applied:
- `20260303170000_lead_requests.sql`
- `20260303203000_lead_requests_hardening.sql`
- `20260304100000_lead_requests_lockdown.sql`

## 3) Deploy

Deploy the app to staging/production using your CI/CD pipeline.

## 4) Post-deploy smoke

Run deploy verification against the deployed URL:

```bash
npm run verify:deploy -- --base-url https://staging.example.com --retries 3 --retry-delay-ms 5000
```

This checks:
- `/`
- `/diagnostico/ancla-de-carrera` redirects anonymous users to `/login`
- `/contacto`
- `/login`
- `/api/health` (HTTP + health payload)

## 5) Manual product sanity checks

- Submit Contact form successfully.
- Submit Newsletter form successfully.
- Submit Therapy modal successfully.
- Complete diagnostic flow up to AI response.
- Validate OAuth login callback and redirect.

## 6) Security checks

- `GET /api/health` returns `status: ok`.
- `checks.supabase`, `checks.supabaseAdmin` and `checks.openai` are `true`.
- If `TURNSTILE_ENFORCED=true`, `checks.turnstile` is `true`.
- API responses include `x-request-id`.
- In production, include `x-health-token: <HEALTHCHECK_DIAGNOSTICS_TOKEN>` to retrieve detailed health diagnostics.

## 7) Rollback readiness

Before release window:
- Keep previous deployment artifact available for one-click rollback.
- Keep SQL backup/snapshot strategy defined.
- Prepare communication template for degraded mode incident.
