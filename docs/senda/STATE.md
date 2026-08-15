# Senda — Estado operativo

> Breve y desechable: refleja el momento actual, no un diario de conversación. Actualizar sólo cuando cambie algo duradero.

**Última verificación:** 2026-08-15, desde el proyecto `original` (`v0-reinvention-web-platform`).

## Qué existe (confirmado)

- App Next.js 16 multipágina: home, seis propuestas bajo `/transiciones-laborales`, Brújulas secundaria, Laboratorio, metodología, equipo, contacto y páginas legales en español e inglés.
- `/encontrar-mi-recorrido` es un orientador público, local y sin PII. `/test-anclas-de-carrera` recupera las 40 preguntas, la escala 1–6 y tres elecciones adicionales; calcula el resultado antes de cualquier dato o servicio externo.
- La interpretación de Anclas por OpenAI es opcional, server-side y cuenta con fallback determinístico. El acceso anónimo no persiste; una sesión Google conserva un único intento por cuenta mediante validación server-side y Supabase/RLS.
- Compartir un resultado con Senda es posterior y consentido mediante el mismo endpoint SMTP de contacto. El endpoint legado `diagnostics/save` permanece retirado (410).
- Suite de tests unitarios (Vitest) y e2e (Playwright), CI en GitHub Actions (lint/typecheck/unit/build/e2e).
- Documentación de producto ya madura: `docs/product/master-architecture.md` (Fase 1 = informe post-diagnóstico, es el foco actual), `docs/product-principles.md`, `AGENTS.md`.

## En curso / roadmap declarado (no confirmado como implementado)

- Fase 2 (dashboard/auth base), Fase 3 (copiloto de carrera IA), Fase 4 (pagos Stripe + MercadoPago), Fase 5 (ejercicios y rutas de carrera con revisión humana) — ver `docs/product/master-architecture.md` §9. No hay evidencia en el código de este checkout de que estas fases estén implementadas más allá de lo descrito en Arquitectura.

## Git y despliegue (actualizado 2026-08-15)

- Repositorio inicializado y conectado: `github.com/Nicosm1988/reinversi-n_profesional`, rama `main` con tracking a `origin/main`.
- El trabajo actual parte de `80bb03d5733550ec4b1b29deeb6c477cdaaaf83d` en `main` y tiene el checkpoint recuperable `checkpoint/pre-transitions-restructure-20260815`.
- Vercel: `vercel.com/nmarcosan-2648s-projects/reinvension-profesional`, producción en `reinvension-profesional.vercel.app`. La publicación de esta intervención se registra al completar `release:check`, push y smoke productivo.
- Existen ramas remotas `v0/taniuskaynicolai-1559-*` no revisadas; puede ser generación previa de v0.dev — pendiente de decidir si se fusionan, descartan o se dejan como están.

## Riesgos y deuda conocidos

- Producción todavía no contiene `SMTP_PASSWORD`: `/api/health` permanece degradado y los formularios fallan cerrado con 503 hasta cargar el secreto y redesplegar. No debe afirmarse recepción de correo antes de una prueba real de buzón.
- El dominio heredado de producción contiene `reinvension-profesional`; la comunicación y rutas visibles ya no usan “reinvención”, pero cambiar el hostname requiere un dominio/alias confirmado.
- Sin Upstash válido, el rate limit degrada a memoria por instancia; verificar sus credenciales en cada entorno productivo.

## Siguiente paso verificable

Completar `SMTP_PASSWORD` en Vercel Production, redesplegar y confirmar una consulta real aceptada y recibida. Después de cada cambio, ejecutar `npm run release:check`, publicar con `push-and-deploy.sh` y recorrer la versión productiva en una sesión limpia.
