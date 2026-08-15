# Senda — Arquitectura

Estado verificado directamente contra el repositorio en este checkout. "Confirmado" = observado en código/config; "Inferido" = deducido con alta confianza pero sin verificación directa; "Pendiente de verificar" = no se pudo comprobar desde este checkout.

## Confirmado

**Stack** (`package.json`):
- Next.js `^16.2.9` (App Router), React `19.2.3`, TypeScript `^5`.
- next-intl `^4.8.3` — locales `es` (default) y `en`, `localePrefix: "as-needed"`, `localeDetection: false` (`routing.ts`).
- Tailwind CSS `^3.4.1` + `tailwindcss-animate`, Framer Motion `^12`, Radix UI + shadcn/ui (`components.json`).
- Supabase: `@supabase/ssr` + `@supabase/supabase-js`. Clientes separados en `lib/supabase/{server,client,admin,auth,config}.ts`.
- Vercel AI SDK (`ai@^6`) + `@ai-sdk/openai` — patrón de referencia en `app/api/diagnostics/analyze/route.ts` (`generateObject()` con esquema Zod).
- React Hook Form `^7` + Zod `^4` para validación de formularios.
- Rate limiting: `@upstash/ratelimit` + `@upstash/redis`.
- Notificaciones: Sonner. Analytics: `@vercel/speed-insights`.

**Estructura de rutas** (`app/`):
- `app/[locale]/` — páginas canónicas: home, `transiciones-laborales/` con seis propuestas, `brujulas/`, `encontrar-mi-recorrido/`, `test-anclas-de-carrera/`, `laboratorio-narrativas-laborales-alternativas/`, `como-trabajamos/`, `equipo/`, `preguntas-frecuentes/`, `contacto/`, `login/`, `panel/`, `privacidad/` y `terminos/`; las rutas públicas anteriores permanecen solo como redirecciones permanentes.
- `app/api/` — `contact` (SMTP y tres orígenes tipados), `diagnostics/interpret` (explicación pública sin PII, gpt-4o + fallback), `diagnostics/complete-public` (registro atómico del único intento autenticado de Anclas), `diagnostics/analyze` (flujo autenticado histórico), `diagnostics/save` (retirado, 410 Gone), `initial-diagnostic` (legado), `leads`, `health` (readiness estricta) y `health/live` (liveness sin dependencias).
- `app/auth/` — callback OAuth.
- `app/robots.ts`, `app/sitemap.ts`, `app/globals.css` (variables HSL del sistema de diseño).

**Componentes** (`components/`): `layout/` (Header, Footer, CookieBanner, therapy-float), `sections/` (secciones de landing), `motion/` (wrappers de Framer Motion), `ui/` (primitivas shadcn/ui).

**Dominio** (`lib/`): `data/`, `diagnostics/`, `http/`, `leads/`, `observability/`, `security/`, `supabase/`, más `cookie-context.tsx` (Context de consentimiento GDPR, localStorage), `rate-limit.ts`, `site-url.ts`, `utils.ts` (`cn()` = clsx + tailwind-merge).

**Base de datos** (`supabase/migrations/`, 13 migraciones): tablas con RLS incluyen `initial_diagnostics` y `user_diagnostics` (sin acceso `anon`/`authenticated` directo; escritura sólo vía backend con `service_role`); esquema base (`core_platform_schema`), `lead_requests` (con hardening y lockdown posteriores), avatares de perfil y límite de Anclas gratuito único (`single_free_career_anchor`, reforzado sin excepciones por `enforce_single_career_anchor_attempt`). El orientador calcula siempre en el navegador y no persiste. Anclas tampoco persiste en uso anónimo; con una sesión Google registra atómicamente el único intento gratuito para aplicar el límite server-side y permitir volver a consultar el resultado.

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
