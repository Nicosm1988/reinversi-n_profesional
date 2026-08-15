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
- `20260224100000_user_diagnostics.sql`
- `20260531183000_require_auth_for_diagnostics.sql`
- `20260718173000_single_free_career_anchor.sql`
- `20260802150000_initial_diagnostics.sql`
- `20260812120000_consolidate_initial_diagnostic_routes.sql`
- `20260815120000_enforce_single_career_anchor_attempt.sql`

También deben permanecer aplicadas las tres migraciones de `lead_requests` (`20260303170000`, `20260303203000` y `20260304100000`).

## 3) Deploy

Deploy the app to staging/production using your CI/CD pipeline.

## 4) Post-deploy smoke

Run deploy verification against the deployed URL:

```bash
npm run verify:deploy -- --base-url https://staging.example.com --retries 3 --retry-delay-ms 5000
```

This checks:
- `/`
- las seis páginas de transiciones laborales y `/brujulas`
- `/encontrar-mi-recorrido` y `/test-anclas-de-carrera`
- el Laboratorio, contacto y sus equivalentes en inglés
- redirecciones permanentes desde las rutas anteriores
- `/contacto`
- `/login`
- `/api/health/live` (liveness)
- `/api/health` (HTTP + health payload)

## 5) Manual product sanity checks

- Completar el orientador y verificar sus siete resultados posibles.
- Completar Anclas, verificar ranking/empates, interpretación con IA y fallback.
- Enviar de forma consentida un resultado y el formulario general; confirmar recepción real antes de declararla.
- Revisar Laboratorio, WhatsApp, español/inglés, claro/oscuro y móvil.
- Validar el callback OAuth, el límite de un intento autenticado y la consulta del resultado guardado.

## 6) Security checks

- `GET /api/health` returns `status: ok`.
- `checks.supabase`, `checks.supabaseAdmin`, `checks.openai` y `checks.contactSmtp` son `true`.
- If `TURNSTILE_ENFORCED=true`, `checks.turnstile` is `true`.
- API responses include `x-request-id`.
- In production, include `x-health-token: <HEALTHCHECK_DIAGNOSTICS_TOKEN>` to retrieve detailed health diagnostics.

## 7) Rollback readiness

Before release window:
- Keep previous deployment artifact available for one-click rollback.
- Keep SQL backup/snapshot strategy defined.
- Prepare communication template for degraded mode incident.
