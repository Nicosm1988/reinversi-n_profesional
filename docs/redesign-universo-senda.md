# Rediseño Universo Senda

## Intervención 2 · Dos recorridos

- Fecha de inicio: 2026-08-12.
- Objetivo: reorganizar toda la comunicación pública alrededor de `Brújula` y `Nueva Etapa Profesional`, eliminar imágenes editoriales, normalizar la escala tipográfica y reparar de forma centralizada tema y linterna.
- Rama de trabajo: `redesign/two-journeys-20260812`.
- Hash base: `2f9cc3bc42d31fe1baf81c579b9e0acb590f9bd0`.
- Checkpoint local: `checkpoint/pre-two-journeys-20260812`.
- Estado inicial del árbol: limpio, sin cambios staged ni unstaged.
- El hash base corresponde al rediseño publicado directamente en el proyecto Vercel `reinvension-profesional`; todavía no fue integrado a `origin/main` por la conexión cruzada detectada con el proyecto independiente `senda-cosmos`.
- No se leerán ni modificarán PDF académicos, `.env`, secretos, `node_modules`, dependencias o archivos generados.
- No se hará push ni despliegue de esta intervención sin una nueva autorización expresa.

### Recuperación previa a esta intervención

Con el árbol limpio, volver al estado inmediatamente anterior:

```bash
git switch checkpoint/pre-two-journeys-20260812
```

Retomar esta intervención:

```bash
git switch redesign/two-journeys-20260812
```

### Arquitectura y decisiones finales

- La oferta pública queda reducida a dos recorridos canónicos: `Brújula` y `Nueva Etapa Profesional`.
- `Brújula` conserva cinco encuentros y seis fases. `Nueva Etapa Profesional` integra en un único recorrido adulto siete encuentros y ocho fases.
- La home se reconstruye en este orden: hero, dos recorridos, una sola sección de situaciones, funcionamiento, fases, equipo, preguntas frecuentes, CTA y footer.
- Se retira por completo el manifiesto indicado y no queda una tercera propuesta comercial, pública ni interna en el enrutamiento del diagnóstico.
- Las URLs anteriores conservan continuidad mediante redirecciones permanentes hacia uno de los dos recorridos canónicos, también bajo `/en`.
- El diagnóstico inicial usa `routing_version = 2`. La migración forward-only transforma resultados históricos y actualiza la restricción de base de datos sin modificar migraciones previas; queda versionada pero no aplicada a un entorno remoto durante esta intervención.
- Antes de una publicación futura se debe aplicar y verificar primero `supabase/migrations/20260812120000_consolidate_initial_diagnostic_routes.sql` y recién después desplegar la aplicación. El flujo `push-and-deploy.sh` no aplica migraciones automáticamente; invertir ese orden haría fallar los nuevos envíos del diagnóstico inicial.
- La escala tipográfica se normaliza y la composición deja de depender de imágenes editoriales. Universo Senda se expresa con tipografía, color, líneas, nodos y trayectorias abstractas de baja intensidad.
- El sistema existente de `next-themes` continúa como única fuente de tema. La elección persiste en la clave `theme`, respeta el sistema antes de una elección, sincroniza `color-scheme`/`theme-color` y aplica tokens semánticos también al diagnóstico y al test.
- La linterna global se monta una sola vez, usa `requestAnimationFrame` y transformaciones, no recibe eventos y se oculta al abandonar la ventana. Se desactiva con puntero táctil o grueso y con `prefers-reduced-motion`.

### Archivos intervenidos en la intervención 2

- Home y recorridos: `components/sections/senda-home.tsx`, `components/processes/process-detail.tsx`, `lib/data/senda-processes.ts`.
- Tema y efectos: `app/globals.css` —incluido el retiro de estilos huérfanos de imágenes y secciones—, `app/[locale]/layout.tsx`, `components/theme/theme-provider.tsx`, `components/theme/theme-toggle.tsx`, `components/effects/pointer-illumination.tsx`.
- Diagnóstico y test: `app/[locale]/diagnostico/page.tsx`, `app/[locale]/diagnostico/ancla-de-carrera/page.tsx`, `components/diagnostic/initial-diagnostic-form.tsx`, `components/forms/pre-quiz-form.tsx`, `components/sections/career-quiz.tsx`, `lib/diagnostics/initial-diagnostic.ts`, `lib/data/anchors.json`.
- Navegación y páginas: `components/layout/header.tsx`, `components/layout/footer.tsx`, `app/[locale]/quienes-somos/page.tsx`, `app/[locale]/orientacion-vocacional/page.tsx`.
- Rutas, metadata y discovery: `next.config.ts`, `app/sitemap.ts`, `public/llms.txt`, `scripts/verify-deploy.mjs`.
- Contenido bilingüe: `messages/es.json`, `messages/en.json`; se retiraron además namespaces y claves sin consumidores que conservaban la narrativa anterior.
- Persistencia: `supabase/migrations/20260812120000_consolidate_initial_diagnostic_routes.sql`.
- Pruebas: `tests/unit/i18n.test.ts`, `tests/unit/initial-diagnostic.test.ts`, `tests/e2e/internal-pages.spec.ts`, `tests/e2e/senda-experience.spec.ts`, `tests/e2e/smoke.spec.ts`.
- Documentación: `docs/redesign-universo-senda.md`.
- Código editorial retirado por quedar sin uso: `components/illustrations/index.ts`, `components/illustrations/pastel-illustrations.tsx`, `components/sections/{faq,hero,method,paths,problem,senda-journey,services,trust}.tsx`.
- Imágenes retiradas: `public/brand/senda-hero.png`, `public/illustrations/{hero,method,paths,problem,services,therapy,trust}.png`, sus copias archivadas bajo `archive/site-images/pre-maturity-redesign-2026-08/` y los SVG iniciales sin uso `public/{file,globe,next,vercel,window}.svg`. Los checkpoints Git conservan la recuperación sin mantener binarios huérfanos en el árbol actual.

No se modificaron dependencias, lockfiles, PDF, `.env`, secretos, autenticación ni la regla de un único intento gratuito del test.

### Validación final de la intervención 2

- `npm run release:check`: aprobado.
  - ESLint: aprobado.
  - TypeScript (`tsc --noEmit`): aprobado.
  - Pruebas unitarias: 57 aprobadas.
  - Pruebas E2E: 44 aprobadas; 2 pruebas autenticadas condicionales omitidas por no disponer de credenciales de prueba.
  - Build de producción Next.js: aprobado.
- Las pruebas de navegador cubren ambos idiomas, los dos recorridos, diagnóstico, introducción y test de Anclas, páginas internas, redirecciones permanentes, cambio de tema y viewport móvil estrecho.
- La revisión visual dirigida se realizó en desktop y 390/320 px, en claro y oscuro, además de puntero táctil y `prefers-reduced-motion`; no se observó overflow horizontal.
- Se verificó en navegador la persistencia del tema, el estado visual inequívoco del control, la sincronización de `color-scheme`/`theme-color`, el movimiento de la linterna con mouse y su ausencia en touch/reduced-motion.
- `git diff --check`: aprobado. Las salidas de `.next`, `coverage`, Playwright y capturas permanecen ignoradas y fuera de Git.
- La única advertencia no bloqueante es la antigüedad local de `caniuse-lite`; no se actualizó para respetar la prohibición de cambiar dependencias.
- No se hizo push, despliegue ni migración remota.

### Recuperación exacta de la intervención 2

Al cerrar el trabajo, el resultado queda consolidado en un commit local y señalado por `checkpoint/two-journeys-final-20260812`. Con el árbol limpio:

```bash
git switch checkpoint/pre-two-journeys-20260812
```

vuelve exactamente al estado anterior. Para recuperar exactamente este resultado:

```bash
git switch checkpoint/two-journeys-final-20260812
```

Para seguir desarrollando sobre él:

```bash
git switch redesign/two-journeys-20260812
```

No hace falta usar `git reset`, `git restore` ni `git checkout --`.

## Intervención 1 · Rediseño editorial

### Estado inicial

- Fecha de inicio: 2026-08-12.
- Proyecto: `original` (`v0-reinvention-web-platform`).
- Rama de trabajo: `redesign/universo-senda-20260812`.
- Hash base: `77521caa67380ba5582c3d4cb3e80ca43ab480b7`.
- Checkpoint local: `checkpoint/pre-universo-senda-20260812`.
- Estado del árbol antes del cambio: limpio, sin diferencias locales.
- La rama parte de `origin/main`, que al iniciar coincidía con el último commit publicado en Vercel.
- El checkpoint es una referencia Git local al código versionado; no incorpora `.env`, secretos, PDF, `node_modules` ni archivos generados.

### Referencia editorial

- Referencia indicada por el usuario: <https://claudina.ar/>.
- Se toma su claridad jerárquica, ritmo amplio, composición editorial, contraste tipográfico y presencia humana.
- No se copian su marca, contenido, fotografías, ornamentos ni identidad visual.

### Decisiones visuales

- Mantener una base sobria, humana y de alta confianza para profesionales de más de 35 años, líderes y gerentes.
- Introducir “Universo Senda” como lenguaje secundario: coordenadas, trayectorias, nodos, líneas orbitales y profundidad controlada.
- Evitar imaginería espacial literal, astrología, misticismo, estética gamer y ciencia ficción.
- Usar una paleta nocturna editorial con superficies claras cálidas, acentos minerales y puntos de luz moderados.
- Priorizar tipografía, espacio, fotografía/ilustración existente y composición antes que efectos.
- Limitar el movimiento a transformaciones y opacidad lentas, con alternativa para `prefers-reduced-motion`.
- Preservar rutas, contenido útil, lógica del test, seguridad, privacidad y paridad español/inglés.
- No publicar precios ni sumar promesas grandilocuentes; Brújula permanece secundaria.

### Archivos intervenidos

- `app/globals.css` — tokens, superficies, contraste, fondos nocturnos, trayectorias y comportamiento responsive/reduced-motion.
- `app/[locale]/layout.tsx` — metadatos de viewport y simplificación del efecto global de puntero.
- `app/[locale]/contacto/page.tsx` — hero, formulario y composición editorial responsive.
- `app/[locale]/diagnostico/page.tsx` — presentación del diagnóstico y corrección de grillas estrechas.
- `app/[locale]/diagnostico/ancla-de-carrera/page.tsx` — introducción completa de Anclas y continuidad humana.
- `app/[locale]/login/page.tsx` — acceso integrado al nuevo sistema visual.
- `app/[locale]/panel/page.tsx` — fondo y continuidad visual del área personal.
- `app/[locale]/quienes-somos/page.tsx` — hero y jerarquía editorial.
- `components/visual/universe-field.tsx` — campo abstracto reutilizable de nodos, coordenadas y trayectorias.
- `components/sections/senda-home.tsx` — rediseño integral de la experiencia principal.
- `components/sections/career-quiz.tsx` — integración visual y jerarquía semántica del test, sin alterar su lógica.
- `components/processes/process-detail.tsx` — plantilla completa de procesos.
- `components/diagnostic/initial-diagnostic-form.tsx` — estados de foco y CTA accesible.
- `components/layout/header.tsx` — navegación desktop/móvil, marca y CTA.
- `components/layout/footer.tsx` — cierre editorial nocturno y contraste mejorado.
- `components/layout/cookie-banner.tsx` — banner responsive, superficie opaca y switches con nombre accesible.
- `components/layout/process-popup.tsx` — tarjeta contextual alineada al sistema.
- `components/i18n/language-switcher.tsx` — selector ES/EN.
- `components/theme/theme-toggle.tsx` — control de tema.
- `docs/redesign-universo-senda.md` — registro del rediseño y recuperación.

No se modificaron `messages/es.json`, `messages/en.json`, APIs, migraciones, dependencias, lockfiles, PDF, `.env` ni lógica de autenticación o persistencia.

### Validación final

- `npm run release:check`: aprobado.
  - ESLint: aprobado.
  - TypeScript (`tsc --noEmit`): aprobado.
  - Pruebas unitarias: 55 aprobadas.
  - Pruebas E2E: 35 aprobadas y 2 pruebas autenticadas condicionales omitidas por el entorno.
  - Build de producción Next.js: aprobado.
- Matriz Playwright adicional: 84 combinaciones, 14 rutas ES/EN y anchos de 320, 390, 768, 1024, 1440 y 1920 px; sin overflow, errores HTTP, títulos ausentes ni jerarquía `h1` inválida.
- Auditoría dirigida de 10 rutas: una sola `h1` por vista, imágenes con `alt`, controles con etiqueta y acciones con nombre accesible.
- Interacciones de teclado: menú móvil abre con teclado, bloquea el scroll y cierra con `Escape`; switches de cookies exponen nombre accesible.
- Revisión visual final en home claro/oscuro móvil, proceso desktop, Anclas móvil y banner de cookies a 320 px.
- Contraste del CTA principal: 6,05:1 sobre blanco; cumple WCAG AA para texto normal.
- `git diff --check`: aprobado.
- Capturas, `.next`, `coverage` y demás salidas de validación permanecen ignoradas y fuera de Git.
- No se hizo push ni despliegue.

### Recuperación exacta

El estado anterior vive en una referencia local inmutable y el rediseño queda consolidado en un commit local de su rama. Con el árbol limpio, para volver exactamente al punto anterior:

```bash
git switch checkpoint/pre-universo-senda-20260812
```

Para retomar exactamente el rediseño:

```bash
git switch redesign/universo-senda-20260812
```

No hace falta usar `git reset`, `git restore` ni `git checkout --`.
