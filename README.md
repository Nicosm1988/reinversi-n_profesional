# Reinvencion Profesional

Plataforma web en Next.js 16 (App Router) para orientacion profesional, diagnosticos y captacion de leads.

## Requisitos

- Node.js 20+
- npm 10+

## Setup

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env.local` desde `.env.example` y completar claves.

3. Validar entorno:

```bash
npm run verify:env
```

4. Ejecutar en desarrollo:

```bash
npm run dev
```

## Scripts principales

- `npm run dev`: desarrollo local
- `npm run lint`: lint ESLint
- `npm run typecheck`: chequeo de tipos TypeScript
- `npm run test:unit`: tests unitarios (Vitest + coverage)
- `npm run test:e2e`: smoke e2e (Playwright)
- `npm run build`: build de produccion
- `npm run start`: levantar build de produccion
- `npm run verify:env`: valida env requerido y alerta por opcionales faltantes
- `npm run verify:env:strict`: valida env en modo estricto (incluye opcionales criticos)
- `npm run verify:deploy -- --base-url <url>`: smoke post-deploy sobre una URL
- `npm run release:check`: pipeline local completo de calidad

## Referencias tecnicas

- `GoogleChrome/modern-web-guidance-src`: referencia incorporada para decisiones de UX web moderna, performance, accesibilidad, privacidad y progressive enhancement.
- Skill local: `.agent/skills/modern_web_guidance/SKILL.md`
- Snapshot revisado: `c2e8cb6bb635e5465314ba151a222d3e837d7399`

## Seguridad y hardening

- Rate limiting en APIs con soporte distribuido por Upstash (`UPSTASH_REDIS_*`) y fallback en memoria.
- Verificacion de captcha Cloudflare Turnstile con validacion de `action/hostname` y enforcement en produccion.
- Sanitizacion de redirects OAuth y validacion de payloads con Zod.
- Insercion de leads por backend con Supabase `service_role` (`SUPABASE_SERVICE_ROLE_KEY`) para evitar bypass directo por cliente.
- Request ID en responses y logs estructurados en rutas criticas.
- Headers de seguridad en `next.config.ts` y `proxy.ts`.

## Endpoints operativos

- `POST /api/diagnostics/analyze`
- `POST /api/diagnostics/save` (retirado; responde `410 Gone`)
- `POST /api/leads`
- `GET /api/health`

## Base de datos (Supabase)

Migraciones relevantes:

- `supabase/migrations/20260303170000_lead_requests.sql`
- `supabase/migrations/20260303203000_lead_requests_hardening.sql`
- `supabase/migrations/20260304100000_lead_requests_lockdown.sql`
- `supabase/migrations/20260531183000_require_auth_for_diagnostics.sql`

Comandos recomendados:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

## Auth requerida para diagnosticos

- El test de Ancla de Carrera requiere sesion activa de Supabase Auth.
- El login disponible para diagnosticos es Google OAuth.
- La API `POST /api/diagnostics/analyze` requiere autenticacion y guarda el resultado en el mismo flujo seguro.
- El antiguo endpoint `POST /api/diagnostics/save` esta retirado para impedir escrituras separadas o manipuladas.
- Los resultados se guardan en `public.user_diagnostics` con `user_id` obligatorio y RLS por usuario.

Configurar en produccion:

1. Habilitar Google en Supabase Auth Providers.
2. Registrar `https://reinvension-profesional.vercel.app/auth/callback` como redirect/callback URL.
3. Cargar en Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` y `OPENAI_API_KEY`.

## Deploy y operaciones

- Checklist go-live: `docs/operations/go-live-checklist.md`
- Runbook de incidentes: `docs/operations/runbook.md`
- Baseline de SLO/alertas: `docs/operations/slo-alerting.md`

Smoke manual de deploy (GitHub Actions):
- Workflow: `.github/workflows/deploy-smoke.yml`
- Input requerido: `base_url`

## CI

GitHub Actions de CI:

1. lint
2. typecheck
3. unit tests
4. build
5. smoke e2e

Workflow: `.github/workflows/ci.yml`
