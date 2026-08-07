# Senda — Estado operativo

> Breve y desechable: refleja el momento actual, no un diario de conversación. Actualizar sólo cuando cambie algo duradero.

**Última verificación:** 2026-08-06, desde este checkout (`.../reinversi-n_profesional-main actualizada6-8/reinversi-n_profesional-main`).

## Qué existe (confirmado)

- App Next.js 16 funcional en código: landing, `diagnostico/ancla-de-carrera` (gate por Supabase Auth + Google), `orientacion-vocacional`, `contacto`, `login`, `panel`, páginas legales.
- API de diagnóstico con generación de informe vía OpenAI (`generateObject`), persistencia atómica en Supabase con RLS, endpoint legado `save` retirado (410).
- Suite de tests unitarios (Vitest) y e2e (Playwright), CI en GitHub Actions (lint/typecheck/unit/build/e2e).
- Documentación de producto ya madura: `docs/product/master-architecture.md` (Fase 1 = informe post-diagnóstico, es el foco actual), `docs/product-principles.md`, `AGENTS.md`.

## En curso / roadmap declarado (no confirmado como implementado)

- Fase 2 (dashboard/auth base), Fase 3 (copiloto de carrera IA), Fase 4 (pagos Stripe + MercadoPago), Fase 5 (ejercicios y rutas de carrera con revisión humana) — ver `docs/product/master-architecture.md` §9. No hay evidencia en el código de este checkout de que estas fases estén implementadas más allá de lo descrito en Arquitectura.

## Riesgos y deuda conocidos

- **Este checkout no tiene `.git` inicializado.** `push-and-deploy.sh` y el flujo de CI/despliegue dependen de un repositorio Git con remoto `origin`; hasta que se inicialice y conecte, no se puede hacer commit, push ni disparar el pipeline real. No ejecutar `git init` ni configurar remotos sin confirmarlo con el usuario primero, dado que puede haber una intención específica (repo separado, restauración, etc.).
- **No hay `node_modules/` instalado** en este checkout: no se ha podido ejecutar `npm run lint|typecheck|test:unit|test:e2e|build` para verificar que el código realmente compila/pasa en este momento.
- **No hay `.env.local`/`.env.example`** en este checkout: las variables de entorno necesarias (ver `docs/senda/ARCHITECTURE.md`) están documentadas por nombre pero no verificadas con valores reales; `npm run verify:env` fallaría hasta configurarlas.
- Posible discrepancia de nombre de directorio: `docs/architecture/project-naming.md` referencia `v0-reinvention-web-platform` como carpeta del proyecto "original", mientras este checkout vive en una carpeta distinta — no afecta el código, pero vale confirmar si es intencional.

## Siguiente paso verificable

Antes de la próxima tarea de desarrollo: confirmar con el usuario si este checkout debe conectarse a un repositorio Git existente (y cuál), y ejecutar `npm install` + `npm run verify:env` para dejar el entorno local operativo y poder correr `lint`/`typecheck`/`test:unit` con resultados reales.
