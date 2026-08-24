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

- `POST /api/diagnostics/progress` (autosave autenticado y versionado de Anclas)
- `POST /api/diagnostics/complete-public` (finalización autenticada y atómica de Anclas)
- `POST /api/diagnostics/interpret` (interpretación del resultado guardado)
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
- `supabase/migrations/20260823032739_career_anchor_report_email_outbox.sql`
- `supabase/migrations/20260824040817_career_anchor_persistent_journey.sql`
- `supabase/migrations/20260824050000_lock_down_legacy_career_anchor_rpcs.sql`

La migración `20260824050000` retira los RPC legados y se aplica sólo después de publicar el código del recorrido persistente.

El endpoint histórico de diagnóstico inicial persiste en `public.initial_diagnostics`. La tabla tiene RLS activa, no concede acceso a `anon` ni `authenticated`, y recibe escrituras únicamente a través del backend con `service_role`. El orientador público `/encontrar-mi-recorrido` calcula el resultado localmente y no escribe en esa tabla.

Comandos de vinculación:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
```

Para este cambio, no aplicar `20260824040817` y `20260824050000` juntas sobre una
instalación que todavía ejecuta el código legado. El orden de rollout compatible es:

1. aplicar únicamente `20260824040817` (mantiene temporalmente los RPC legados);
2. publicar la aplicación del recorrido persistente y comprobar que está activa;
3. aplicar `20260824050000` para retirar los RPC legados.

En instalaciones nuevas, o una vez completada esa transición, `supabase db push`
puede volver a utilizarse normalmente para las migraciones posteriores.

## Acceso a los cuestionarios

- `/encontrar-mi-recorrido` es público y calcula el resultado en el navegador. `/test-anclas-de-carrera` requiere una cuenta Google autenticada.
- Anclas guarda el avance mediante `POST /api/diagnostics/progress`, permite reanudarlo y finaliza una sola vez con `POST /api/diagnostics/complete-public`.
- La interpretación usa `POST /api/diagnostics/interpret`: parte del ranking durable calculado por el servidor (y sólo recalcula registros legados que no lo tengan), no envía PII al modelo y conserva un fallback determinístico.
- Antes de iniciar Anclas, la persona debe prestar un consentimiento expreso e informado para que, al completar el test, Senda envíe a `hola@universosenda.com` y `tanisardella@gmail.com` la dirección de correo de su cuenta Google, el momento profesional opcional, el ranking completo de las ocho anclas, sus puntajes y la devolución orientativa determinística persistida. El informe no contiene las 40 respuestas individuales ni habilita marketing; la interpretación por IA permanece separada y no es una dependencia del correo interno.
- El formulario posterior mediante `POST /api/contact` queda como una solicitud de contacto opcional; no es el mecanismo que autoriza ni dispara el informe interno.
- El antiguo endpoint `POST /api/diagnostics/save` esta retirado para impedir escrituras separadas o manipuladas.
- El antiguo endpoint `POST /api/diagnostics/analyze` también está retirado; el recorrido persistente usa exclusivamente `progress`, `complete-public` e `interpret`.
- Los avances y resultados se guardan en `public.user_diagnostics` con `user_id` obligatorio: cada cuenta sólo lee su propia fila mediante RLS y todas las escrituras pasan por el backend.

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
