# Rediseño Universo Senda

## Estado inicial

- Fecha de inicio: 2026-08-12.
- Proyecto: `original` (`v0-reinvention-web-platform`).
- Rama de trabajo: `redesign/universo-senda-20260812`.
- Hash base: `77521caa67380ba5582c3d4cb3e80ca43ab480b7`.
- Checkpoint local: `checkpoint/pre-universo-senda-20260812`.
- Estado del árbol antes del cambio: limpio, sin diferencias locales.
- La rama parte de `origin/main`, que al iniciar coincidía con el último commit publicado en Vercel.
- El checkpoint es una referencia Git local al código versionado; no incorpora `.env`, secretos, PDF, `node_modules` ni archivos generados.

## Referencia editorial

- Referencia indicada por el usuario: <https://claudina.ar/>.
- Se toma su claridad jerárquica, ritmo amplio, composición editorial, contraste tipográfico y presencia humana.
- No se copian su marca, contenido, fotografías, ornamentos ni identidad visual.

## Decisiones visuales

- Mantener una base sobria, humana y de alta confianza para profesionales de más de 35 años, líderes y gerentes.
- Introducir “Universo Senda” como lenguaje secundario: coordenadas, trayectorias, nodos, líneas orbitales y profundidad controlada.
- Evitar imaginería espacial literal, astrología, misticismo, estética gamer y ciencia ficción.
- Usar una paleta nocturna editorial con superficies claras cálidas, acentos minerales y puntos de luz moderados.
- Priorizar tipografía, espacio, fotografía/ilustración existente y composición antes que efectos.
- Limitar el movimiento a transformaciones y opacidad lentas, con alternativa para `prefers-reduced-motion`.
- Preservar rutas, contenido útil, lógica del test, seguridad, privacidad y paridad español/inglés.
- No publicar precios ni sumar promesas grandilocuentes; Brújula permanece secundaria.

## Archivos intervenidos

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

## Validación final

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

## Recuperación exacta

El estado anterior vive en una referencia local inmutable y el rediseño queda consolidado en un commit local de su rama. Con el árbol limpio, para volver exactamente al punto anterior:

```bash
git switch checkpoint/pre-universo-senda-20260812
```

Para retomar exactamente el rediseño:

```bash
git switch redesign/universo-senda-20260812
```

No hace falta usar `git reset`, `git restore` ni `git checkout --`.
