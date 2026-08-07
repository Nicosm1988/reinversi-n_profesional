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

## Git y despliegue (actualizado 2026-08-06)

- Repositorio inicializado y conectado: `github.com/Nicosm1988/reinversi-n_profesional`, rama `main` con tracking a `origin/main`.
- `origin/main` y este checkout habían divergido en 41 archivos con contenido real distinto (ver `docs/senda/DECISIONS.md` #007). Se resolvió publicando el contenido de este checkout como nuevo commit de `main` (fast-forward, sin force push) — decisión explícita del usuario.
- Vercel: `vercel.com/nmarcosan-2648s-projects/reinvension-profesional`, producción en `reinvension-profesional.vercel.app`. No se verificó desde esta sesión si el deploy automático post-push se disparó ni si pasó el build en Vercel.
- Existen ramas remotas `v0/taniuskaynicolai-1559-*` no revisadas; puede ser generación previa de v0.dev — pendiente de decidir si se fusionan, descartan o se dejan como están.

## Riesgos y deuda conocidos

- **No hay `node_modules/` instalado** en este checkout: no se ha podido ejecutar `npm run lint|typecheck|test:unit|test:e2e|build` para verificar que el código realmente compila/pasa en este momento.
- **No hay `.env.local`/`.env.example`** en este checkout: las variables de entorno necesarias (ver `docs/senda/ARCHITECTURE.md`) están documentadas por nombre pero no verificadas con valores reales; `npm run verify:env` fallaría hasta configurarlas.
- El push a `main` reemplazó el contenido previo de `origin/main` en 41 archivos (config, dependencias, componentes UI, `master-architecture.md`, migraciones); esa versión anterior sigue en el historial de Git si hace falta recuperar algo.
- Posible discrepancia de nombre de directorio: `docs/architecture/project-naming.md` referencia `v0-reinvention-web-platform` como carpeta del proyecto "original", mientras este checkout vive en una carpeta distinta — no afecta el código, pero vale confirmar si es intencional.

## Siguiente paso verificable

Ejecutar `npm install` + `npm run verify:env` para dejar el entorno local operativo y poder correr `lint`/`typecheck`/`test:unit` con resultados reales; y confirmar en el dashboard de Vercel que el deploy disparado por este push terminó exitosamente.
