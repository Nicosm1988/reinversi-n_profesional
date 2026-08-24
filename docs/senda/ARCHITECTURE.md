# Senda — Arquitectura

Estado verificado directamente contra el repositorio en este checkout. "Confirmado" = observado en código/config; "Inferido" = deducido con alta confianza pero sin verificación directa; "Pendiente de verificar" = no se pudo comprobar desde este checkout.

## Confirmado

**Stack** (`package.json`):
- Next.js `^16.2.9` (App Router), React `19.2.3`, TypeScript `^5`.
- next-intl `^4.8.3` — locales `es` (default) y `en`, `localePrefix: "as-needed"`, `localeDetection: false` (`routing.ts`).
- Tailwind CSS `^3.4.1` + `tailwindcss-animate`, Framer Motion `^12`, Radix UI + shadcn/ui (`components.json`).
- Supabase: `@supabase/ssr` + `@supabase/supabase-js`. Clientes separados en `lib/supabase/{server,client,admin,auth,config}.ts`.
- Vercel AI SDK (`ai@^6`) + `@ai-sdk/openai` — generación estructurada con Zod en `app/api/diagnostics/interpret/route.ts`.
- React Hook Form `^7` + Zod `^4` para validación de formularios.
- Rate limiting: `@upstash/ratelimit` + `@upstash/redis`.
- Notificaciones: Sonner. Analytics: `@vercel/speed-insights`.

**Estructura de rutas** (`app/`):
- `app/[locale]/` — páginas canónicas: home, `transiciones-laborales/` con seis propuestas, `brujulas/`, `encontrar-mi-recorrido/`, `test-anclas-de-carrera/`, `laboratorio-narrativas-laborales-alternativas/`, `como-trabajamos/`, `equipo/`, `preguntas-frecuentes/`, `contacto/`, `login/`, `panel/`, `privacidad/` y `terminos/`; las rutas públicas anteriores permanecen solo como redirecciones permanentes.
- `app/api/` — `contact` (SMTP y tres orígenes tipados), `diagnostics/progress` (autosave autenticado con revisión), `diagnostics/complete-public` (finalización atómica del único intento de Anclas), `diagnostics/interpret` (gpt-4o + fallback sobre el resultado guardado), `diagnostics/save` (retirado, 410 Gone), `initial-diagnostic` (legado), `leads`, `health` (readiness estricta) y `health/live` (liveness sin dependencias).
- `app/auth/` — callback OAuth.
- `app/robots.ts`, `app/sitemap.ts`, `app/globals.css` (variables HSL del sistema de diseño).

**Componentes** (`components/`): `layout/` (Header, Footer, CookieBanner, therapy-float), `sections/` (secciones de landing), `motion/` (wrappers de Framer Motion), `ui/` (primitivas shadcn/ui).

**Dominio** (`lib/`): `data/`, `diagnostics/`, `http/`, `leads/`, `observability/`, `security/`, `supabase/`, más `cookie-context.tsx` (Context de consentimiento GDPR, localStorage), `rate-limit.ts`, `site-url.ts`, `utils.ts` (`cn()` = clsx + tailwind-merge).

**Base de datos** (`supabase/migrations/`, 17 migraciones): `initial_diagnostics` no concede acceso directo al navegador; `user_diagnostics` permite a cada cuenta autenticada leer sólo su propia fila mediante RLS y reserva todas las escrituras al backend con `service_role`. El recorrido de Anclas persiste avances versionados, finaliza una única vez, conserva ranking/fallback/interpretación y encola el correo en la misma transacción. El orientador `/encontrar-mi-recorrido` calcula en el navegador y no persiste.

**Seguridad** (`next.config.ts`): headers (`x-content-type-options`, `x-frame-options: DENY`, HSTS, `permissions-policy`, CSP con `frame-ancestors 'none'` y soporte para Cloudflare Turnstile + origen de Supabase).

**Variables de entorno referenciadas en código:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `OPENAI_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_ENFORCED`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `HEALTHCHECK_DIAGNOSTICS_TOKEN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_TO_EMAIL`, `BASE_URL`, `NODE_ENV`.

**Testing y CI:**
- Vitest (`vitest.config.ts`, `test:unit` con coverage v8) — suites en `tests/unit/`.
- Playwright (`playwright.config.ts`, `test:e2e`) — specs en `tests/e2e/`.
- `.github/workflows/ci.yml` — lint → typecheck → unit → build → e2e smoke (Node 20).
- `.github/workflows/deploy-smoke.yml` y `uptime-monitor.yml` — smoke post-deploy y monitoreo.

**Scripts** (`scripts/`): `verify-env.mjs`, `verify-deploy.mjs`, `load-test.mjs`.

**Repositorio y despliegue:** GitHub `github.com/Nicosm1988/reinversi-n_profesional` (rama `main`), enlazado al proyecto Vercel `vercel.com/nmarcosan-2648s-projects/reinvension-profesional` (producción: `reinvension-profesional.vercel.app`, ver `docs/architecture/project-naming.md`). `push-and-deploy.sh` / `.ps1` ejecutan `npm run release:check` y hacen `git push origin <branch>`; el deploy real lo dispara Vercel vía integración con Git.

## Inferido

- El proyecto Vercel está enlazado por integración Git (push a `origin` dispara build), no se ve config de Vercel (`vercel.json`) en el repo — probablemente configurado desde el dashboard de Vercel.
- El nombre de paquete `senda-web-platform` (`package.json`) corresponde al proyecto "original" descrito en `docs/architecture/project-naming.md`; el directorio legado allí referenciado es `v0-reinvention-web-platform`, que no coincide con el nombre de carpeta de este checkout — posible renombrado o extracción parcial.

## Pendiente de verificar

- Versión exacta de Node.js requerida (no hay campo `engines` en `package.json`; CI usa Node 20).
- La recepción real del formulario depende de completar `SMTP_PASSWORD` en Vercel y de verificar el mensaje en el buzón destinatario.
