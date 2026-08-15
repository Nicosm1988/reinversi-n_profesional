# Senda — Registro de decisiones (ADR liviano)

Formato por entrada: **Contexto → Decisión → Consecuencias**. Sólo se documentan decisiones respaldadas por evidencia del repositorio o por la constitución del proyecto. Añadir una entrada nueva al final cuando se tome una decisión duradera; no reescribir el historial.

---

## 001 — La IA es copiloto, nunca reemplazo del equipo humano

**Contexto:** Senda combina acompañamiento humano experto con IA. Existe riesgo de que la IA escale a decisiones o diagnósticos sin supervisión.
**Decisión:** Toda salida de IA que impacte al usuario (informes, futuras rutas de carrera) pasa por revisión humana antes o después de mostrarse, y nunca constituye diagnóstico clínico. El informe post-diagnóstico se basa exclusivamente en la documentación de Schein/Anclas de Carrera cargada, sin extrapolar.
**Consecuencias:** Cualquier nueva funcionalidad de IA debe incluir un punto de supervisión humana o una limitación explícita de alcance. Fuente: `docs/product/master-architecture.md` §4, §8.

## 002 — Test de Anclas de Carrera: un intento gratuito por cuenta, aplicado server-side

**Contexto:** El test gratuito es el primer gancho de valor; permitir repetición ilimitada reduce el incentivo de continuidad y puede degradar la calidad del acompañamiento.
**Decisión:** Cada cuenta de Google autenticada puede completar el test gratuito una sola vez. El límite se aplica en el servidor y en Supabase (RLS/migraciones), nunca sólo en la interfaz. Ante un resultado existente, se muestra con un mensaje amable y se ofrece contacto humano, sin bloqueo hostil ni upselling agresivo.
**Consecuencias:** El endpoint `POST /api/diagnostics/save` fue retirado (410 Gone); `POST /api/diagnostics/analyze` persiste el resultado atómicamente en el mismo flujo autenticado. Migraciones relevantes: `20260531183000_require_auth_for_diagnostics.sql`, `20260718173000_single_free_career_anchor.sql`. Fuente: `AGENTS.md`, `docs/product-principles.md`.

## 003 — Autenticación obligatoria para el diagnóstico (Google OAuth vía Supabase)

**Contexto:** Permitir diagnósticos anónimos impediría aplicar el límite de un intento por cuenta y dificultaría dar continuidad al usuario.
**Decisión:** El test de Ancla de Carrera requiere sesión activa de Supabase Auth con Google; los diagnósticos anónimos están bloqueados tanto a nivel de página como de API.
**Consecuencias:** Cualquier nueva herramienta de diagnóstico debe evaluar si necesita la misma gate de autenticación. Fuente: `README.md`, `CLAUDE.md`.

## 004 — Bilingüe nativo desde el día uno (es/en) vía next-intl

**Contexto:** El mercado de lanzamiento es LATAM + España, con expansión global prevista manteniendo base bilingüe.
**Decisión:** Todas las rutas viven bajo `app/[locale]/`; toda cadena de UI se declara en `messages/es.json` y `messages/en.json`; español (`es`) es el locale por defecto con prefijo de URL "as-needed".
**Consecuencias:** No se agregan strings hardcodeadas en componentes; nueva copy requiere entrada en ambos archivos de mensajes. Fuente: `routing.ts`, `docs/product/master-architecture.md` §7, `CLAUDE.md` previo.

## 005 — Separación de proyectos "original" y "cosmos"

**Contexto:** Existe una variante visual independiente de Senda ("cosmos") en otro directorio y despliegue.
**Decisión:** Los cambios, credenciales y despliegues no se propagan entre "original" (este repositorio, `reinvension-profesional.vercel.app`) y "cosmos" (`senda-cosmos.vercel.app`) salvo pedido explícito del usuario.
**Consecuencias:** Antes de aplicar un cambio hay que confirmar a qué proyecto se refiere la instrucción cuando sea ambiguo. Fuente: `AGENTS.md`, `docs/architecture/project-naming.md`.

## 006 — Pagos (Stripe + MercadoPago) planificados, no implementados

**Contexto:** El modelo de negocio es un programa high-ticket, no una suscripción ni infoproducto.
**Decisión:** La pasarela de pagos es Fase 4 del roadmap; no se implementa hasta que se solicite explícitamente.
**Consecuencias:** No agregar dependencias, rutas ni UI de checkout de forma anticipada. Fuente: `docs/product/master-architecture.md` §2, §9.

## 007 — Este checkout se adoptó como fuente de verdad de `main`

**Contexto:** Este checkout (sin `.git`) y `origin/main` (`github.com/Nicosm1988/reinversi-n_profesional`) habían divergido en 41 archivos con cambios de contenido reales (config, dependencias, componentes UI, `master-architecture.md`, migraciones), probablemente por evolución paralela vía v0.dev (ramas `v0/taniuskaynicolai-1559-*`).
**Decisión (2026-08-06, confirmada explícitamente por el usuario):** se inicializó Git en este checkout, se conectó a `origin`, y se publicó un commit cuyo árbol es el contenido de este checkout con `origin/main` como padre (fast-forward, sin force push), dejando `main` remoto igual a este checkout.
**Consecuencias:** el contenido previo de `origin/main` en esos 41 archivos quedó reemplazado por el de este checkout. Sigue accesible en el historial de Git (commit `d8c5691` y anteriores) por si algo de esa versión necesita recuperarse. Fuente: esta sesión, ver `docs/senda/STATE.md`.

## 008 — Anclas es público; las cuentas autenticadas conservan un único intento

**Contexto:** La versión pública debe permitir completar las 40 preguntas y ver el resultado sin login, CAPTCHA, PII ni dependencia obligatoria de Supabase, mientras `AGENTS.md` mantiene el límite histórico para cuentas Google.
**Decisión (2026-08-15, reemplaza la decisión 003):** Las personas anónimas realizan el cálculo completo en el navegador. Si ya existe una sesión autenticada, se usa la misma experiencia sin PII ni CAPTCHA, pero el intento se registra atómicamente mediante las funciones server-side existentes; un resultado previo se vuelve a mostrar y no se habilita otra ejecución, salvo las cuentas técnicas ya exceptuadas por migración.
**Consecuencias:** El acceso público no crea cuentas ni persiste respuestas. El endpoint de registro autenticado valida las 40 respuestas y las tres elecciones, no recibe datos de perfil y falla cerrado si no puede aplicar el límite. La recepción voluntaria de resultados sigue separada y usa exclusivamente el formulario consentido.

## 009 — La IA enriquece un cálculo determinístico y tiene fallback completo

**Contexto:** Anclas necesita una explicación relacionada con el momento profesional sin delegar a un modelo el cálculo, el ranking ni la decisión de servicio.
**Decisión (2026-08-15, precisa la decisión 001):** El ranking y los empates se recalculan en servidor antes de invocar `gpt-4o`. La IA recibe solo anclas, etapa no identificatoria y catálogo cerrado; no recibe nombre, correo, teléfono, ubicación ni respuestas crudas. Su salida es orientativa, estructurada y opcional. Si falta la clave, hay límite o falla el proveedor, se devuelve una explicación determinística completa.
**Consecuencias:** La persona siempre ve primero un resultado útil. La interpretación no constituye diagnóstico clínico, no reemplaza acompañamiento humano y no puede inventar slugs ni alterar el ranking.
