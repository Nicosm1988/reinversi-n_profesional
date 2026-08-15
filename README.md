# Senda

Mapa digital en Next.js 16 para explorar trabajo, identidad, aprendizaje y propósito con herramientas de orientación y acompañamiento humano.

## Requisitos

- Node.js 20+
- npm 10+

## Setup

1. Instalar dependencias:

```bash
npm ci
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
- `POST /api/diagnostics/interpret`
- `POST /api/contact`
- `POST /api/diagnostics/save` (retirado; responde `410 Gone`)
- `POST /api/initial-diagnostic` (legado; el orientador público no lo utiliza)
- `POST /api/leads`
- `GET /api/health/live` (liveness sin dependencias)
- `GET /api/health` (readiness estricta del servicio completo)

## Base de datos (Supabase)

Migraciones relevantes:

- `supabase/migrations/20260303170000_lead_requests.sql`
- `supabase/migrations/20260303203000_lead_requests_hardening.sql`
- `supabase/migrations/20260304100000_lead_requests_lockdown.sql`
- `supabase/migrations/20260531183000_require_auth_for_diagnostics.sql`
- `supabase/migrations/20260802150000_initial_diagnostics.sql`

El endpoint histórico de diagnóstico inicial persiste en `public.initial_diagnostics`. La tabla tiene RLS activa, no concede acceso a `anon` ni `authenticated`, y recibe escrituras únicamente a través del backend con `service_role`. El orientador público `/encontrar-mi-recorrido` calcula el resultado localmente y no escribe en esa tabla.

Comandos recomendados:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

## Acceso a los cuestionarios

- `/encontrar-mi-recorrido` y `/test-anclas-de-carrera` son públicos y muestran resultados sin pedir datos personales, login ni CAPTCHA.
- La interpretación opcional de Anclas usa `POST /api/diagnostics/interpret`, recalcula el ranking en servidor, no recibe PII y conserva un fallback determinístico.
- Si ya existe una sesión Google, `POST /api/diagnostics/complete-public` registra atómicamente el único intento gratuito y permite volver a consultar el resultado guardado, sin exigir el preformulario ni CAPTCHA. La API histórica `POST /api/diagnostics/analyze` se conserva para compatibilidad.
- Compartir un resultado con Senda es posterior, voluntario y consentido; usa `POST /api/contact` y no Supabase.
- El antiguo endpoint `POST /api/diagnostics/save` esta retirado para impedir escrituras separadas o manipuladas.
- Los resultados se guardan en `public.user_diagnostics` con `user_id` obligatorio y RLS por usuario.

Configurar en produccion:

1. Habilitar Google en Supabase Auth Providers.
2. Registrar `https://reinvension-profesional.vercel.app/auth/callback` como redirect/callback URL.
3. Cargar en Vercel las variables de Supabase, `NEXT_PUBLIC_SITE_URL`, `OPENAI_API_KEY`, Upstash y las cinco variables SMTP documentadas en `.env.example`.

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
