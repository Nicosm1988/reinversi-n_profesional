# Imágenes preservadas — previas a la maduración visual (2026-08)

Copia de resguardo de las imágenes fotográficas/ilustradas que estaban visibles en el sitio antes de esta intervención. Los archivos originales en `public/` **no fueron movidos, renombrados ni borrados**; esta es una copia adicional para referencia y reemplazo futuro.

No se incluyen íconos, el favicon ni gráficos decorativos (SVG inline de `components/illustrations/`), solo las imágenes de tipo fotografía/ilustración de página completa.

| Archivo | Ruta original | Página / componente | Dimensiones | Formato | Origen | Estado en Git |
| --- | --- | --- | --- | --- | --- | --- |
| `hero.png` | `public/illustrations/hero.png` | Home — hero principal (`components/sections/senda-home.tsx`) | 640×640 | PNG | Local | Trackeado |
| `method.png` | `public/illustrations/method.png` | Home — tarjeta de proceso "Reinvención" y sección "Cómo funciona" (`senda-home.tsx`) | 640×640 | PNG | Local | Trackeado |
| `paths.png` | `public/illustrations/paths.png` | Home — tarjeta de proceso "Transición" y sección "Territorios" (`senda-home.tsx`) | 640×640 | PNG | Local | Trackeado |
| `problem.png` | `public/illustrations/problem.png` | Home — tarjeta de proceso "Orientación vocacional" (`senda-home.tsx`) | 640×640 | PNG | Local | Trackeado |
| `services.png` | `public/illustrations/services.png` | Home — sección manifiesto/servicios (`senda-home.tsx`) | 640×640 | PNG | Local | Trackeado |
| `trust.png` | `public/illustrations/trust.png` | Home — sección "bridge" (umbral / diagnóstico inicial) (`senda-home.tsx`) | 640×640 | PNG | Local | Trackeado |
| `therapy.png` | `public/illustrations/therapy.png` | Sin referencias activas encontradas en el código actual (`grep` sobre `.tsx`/`.ts` no arrojó uso) | 640×640 | PNG | Local | Trackeado |
| `senda-hero.png` | `public/brand/senda-hero.png` | Metadata Open Graph / Twitter card (`app/[locale]/layout.tsx`) | 1536×1024 | PNG | Local | Trackeado |

**Estado:** imagen actual, prevista para futuro reemplazo por fotografía real (personas ~35–60 años, contextos profesionales, luz natural — ver dirección fotográfica definida para la maduración visual de agosto 2026).

**Observaciones:**
- Todas son ilustraciones/gráficos estilizados (no fotografías), en formato cuadrado 640×640 salvo `senda-hero.png` (1536×1024, usada solo como imagen de metadata para compartir en redes).
- Tamaño total de esta copia: ~5.6 MB — muy por debajo del umbral de aviso (50 MB).
- Esta carpeta vive fuera de `public/` y de `app/`, por lo que Next.js no la incluye en el bundle ni la sirve como ruta pública.
- `therapy.png` no tiene una referencia activa en el código inspeccionado; se preserva de todas formas por si se usó en otra rama o se reincorpora.
