# SENDA — Constitución operativa del proyecto

## 0. Aplicación y prioridades

- Este archivo rige todas las tareas realizadas en este repositorio (proyecto **original** de Senda; ver `docs/architecture/project-naming.md` para la distinción con la variante **cosmos**, que vive en otro directorio y no debe tocarse desde aquí).
- Aplicar sus reglas silenciosamente antes de planificar, leer, editar o ejecutar herramientas. Si ya está cargado en contexto, no volver a leerlo con una herramienta sólo para demostrar cumplimiento.
- Orden de prioridad: pedido actual del usuario; seguridad e integridad de datos; esta constitución; convenciones verificadas del repositorio.
- Optimizar siempre la **calidad por token**: mínimo desperdicio, máximo valor útil y verificable. La economía de tokens nunca justifica omitir análisis necesario, seguridad, pruebas o corrección.

## 1. Identidad y producto

Senda es una plataforma de orientación vocacional-ocupacional y acompañamiento profesional, organizada como un recorrido (umbral → ubicación personal → exploración de caminos → herramienta orientativa → contacto humano opcional). Combina ciencia psicométrica, acompañamiento humano experto e IA como copiloto — **la IA nunca reemplaza al equipo humano ni emite diagnóstico clínico**. Detalle completo y roadmap: `docs/product/master-architecture.md` (documento maestro, prioridad sobre cualquier otra fuente de producto) y `docs/senda/PROJECT.md`.

Reglas no negociables (fuente: `AGENTS.md`):
- Nunca presentar el producto como "reinvención profesional" de marca ni como landing comercial genérica; la marca es **Senda** y la metáfora rectora es la senda.
- El test gratuito de Anclas de Carrera se completa una sola vez por cuenta de Google; el límite se aplica server-side y en Supabase, nunca sólo en la UI.
- Sin upselling agresivo, presión, urgencia artificial ni derivación automática a la versión paga como castigo.
- Los resultados de IA son orientativos, no un diagnóstico clínico.

## 2. Política de economía inteligente de tokens

- Resolver el objetivo con el menor contexto, número de pasos y volumen de salida razonables.
- Antes de explorar, identificar objetivo, criterios de aceptación, riesgo y archivos probablemente relevantes.
- Usar primero `git status`, manifiestos, índices, búsquedas dirigidas y archivos señalados por el usuario. No escanear todo el repositorio ni leer `node_modules`, `.next`, `coverage`, `test-results` o archivos generados.
- Preguntar sólo ante ambigüedad material; si no, adoptar la suposición más conservadora y declararla al cierre.
- No activar MCP, Skills, subagentes o equipos de agentes por curiosidad. Las skills locales en `.agent/skills/` (UX web moderna, copywriting, backend, psicometría, estrategia global) se consultan sólo cuando la tarea las necesita puntualmente.
- No generar alternativas equivalentes, planes ceremoniales, documentación duplicada ni resúmenes reiterativos. No volcar logs completos; filtrar errores y evidencia relevante.
- Detenerse cuando los criterios de aceptación estén cumplidos y verificados.
- No investigar, instalar herramientas ni ejecutar procesos extensos que la tarea no requiera explícitamente. No repetir análisis, búsquedas o validaciones ya realizadas en la misma tarea. No modificar archivos, contenidos o funcionalidades no solicitados. Agrupar búsquedas y verificaciones relacionadas para reducir pasos. Si la instrucción es clara, ejecutarla sin pedir confirmaciones innecesarias; si hay ambigüedad que pueda producir un cambio incorrecto o ampliar el alcance, detenerse y consultar antes de asumir.

## 3. Protocolo de cada tarea

**Antes:** interpretar el resultado en criterios verificables → revisar estado de Git (`git status`) sin pisar cambios del usuario → consultar sólo documentación relevante → identificar el cambio coherente más pequeño → confirmar comandos y convenciones reales antes de usarlos.

**Durante:** modificar sólo lo necesario, sin refactors laterales; reutilizar componentes/estilos/utilidades existentes; parches pequeños, tipados y reversibles; no debilitar tipos, lint, seguridad o pruebas para "hacer pasar" el cambio; no instalar dependencias sin verificar que la capacidad no exista ya.

**Después:** inspeccionar el diff (cambios accidentales, secretos, código muerto); ejecutar la verificación más pequeña y relevante primero, ampliar a typecheck/lint/tests/build según el alcance; informar qué cambió y qué se verificó sin repetir el proceso; actualizar `docs/senda/STATE.md` o `DECISIONS.md` sólo si cambió información duradera; no afirmar que algo funciona sin haberlo verificado.

## 4. Calidad de ingeniería

- Respetar el stack, npm como gestor de paquetes, estructura y estilo comprobados (ver `docs/senda/ARCHITECTURE.md`).
- TypeScript estricto; evitar `any`, supresiones y excepciones silenciosas sin justificación.
- Server Components por defecto; `"use client"` sólo para interactividad real (formularios, contexto, Framer Motion).
- Toda cadena de UI va en `messages/es.json` y `messages/en.json` desde el día 1 (bilingüe nativo, sin excepciones).
- Preservar RLS, validación server-side con Zod y separación de clientes Supabase (`lib/supabase/server.ts` vs `client.ts`).
- No dejar mocks, TODOs ni implementaciones parciales como solución final salvo pedido explícito.
- Nunca exponer secretos ni credenciales; usar variables de entorno (ver `npm run verify:env`).
- No ejecutar comandos destructivos (`reset --hard`, force push, limpieza masiva). No hacer commit, push ni deploy sin pedido explícito — el deploy real ocurre vía `push-and-deploy.sh`, que ejecuta `npm run release:check` y hace push a `origin`.

## 5. Calidad de experiencia

- Copy en español neutro ("tú"), cálido y editorial; nunca frío-corporativo ni coaching genérico.
- Animación (Framer Motion) al servicio del recorrido, nunca decorativa sin propósito.
- Accesibilidad: navegación por teclado, foco visible, contraste, `prefers-reduced-motion`.
- No introducir funcionalidades, pagos o integraciones no respaldadas por `docs/product/master-architecture.md` o el pedido explícito del usuario (p. ej. Stripe/MercadoPago son Fase 4, aún no implementados).

## 6. Fuentes de verdad

- `docs/product/master-architecture.md` — documento maestro de producto y roadmap (prioridad máxima en decisiones de producto).
- `docs/product-principles.md` — principios de acompañamiento y microcopy del test.
- `AGENTS.md` — reglas permanentes: nombres de proyecto (original/cosmos), límites del test gratuito, tono, despliegue.
- `docs/architecture/` — estructura de repositorio y convención de nombres.
- `docs/operations/` — checklist de go-live, runbook de incidentes, SLO/alertas.
- `docs/senda/` — capa operativa para Claude Code: `PROJECT.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `STATE.md` (ver `docs/senda/README.md` como índice).
- No duplicar información entre documentos; corregir lo obsoleto cuando un cambio lo invalide, sin convertir cada tarea menor en documentación.

## 7. Comandos verificados (`package.json`)

- Paquetes: `npm install` (npm; no hay `node_modules/` en este checkout, no ejecutar instalación salvo que la tarea lo requiera).
- Desarrollo: `npm run dev`
- Typecheck: `npm run typecheck` (`tsc --noEmit`)
- Lint: `npm run lint`
- Tests unitarios: `npm run test:unit` (Vitest + coverage)
- Tests e2e: `npm run test:e2e` (Playwright)
- Build: `npm run build` / iniciar: `npm run start`
- Pipeline completo: `npm run release:check` (lint + typecheck + test:unit + test:e2e + build)
- Verificación de entorno: `npm run verify:env` / `npm run verify:env:strict`
- Smoke post-deploy: `npm run verify:deploy -- --base-url <url>`
- Deploy: `./push-and-deploy.sh "mensaje"` — nunca ejecutar sin autorización explícita. Repo: `github.com/Nicosm1988/reinversi-n_profesional` (rama `main`), conectado a Vercel (`vercel.com/nmarcosan-2648s-projects/reinvension-profesional`).

## 8. Formato de cierre

La respuesta final debe ser breve y contener únicamente: resultado conseguido, archivos principales modificados, verificaciones ejecutadas y su resultado, y riesgo/supuesto/pendiente real sólo si existe.
