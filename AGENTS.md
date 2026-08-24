# Senda: reglas permanentes

## Nombres operativos de los proyectos

- **original**: proyecto productivo principal de Senda, ubicado en `v0-reinvention-web-platform` y publicado actualmente en `reinvension-profesional.vercel.app`.
- **cosmos**: variante visual espacial e independiente, ubicada en `senda-cosmos` y publicada en `senda-cosmos.vercel.app`.
- Cuando una instrucción mencione **original**, modificar exclusivamente el proyecto original.
- Cuando una instrucción mencione **cosmos**, modificar exclusivamente el proyecto cosmos.
- Nunca propagar cambios, credenciales o despliegues entre ambos proyectos salvo pedido explícito del usuario.

## Identidad y experiencia

- La marca y el nombre del producto son **Senda**.
- La experiencia se organiza como un recorrido: umbral, ubicación personal, cruces de caminos, herramientas e hitos.
- Evitar presentar el sitio como una landing comercial tradicional o usar “reinvención profesional” como identidad de marca.
- El cambio profesional puede aparecer como situación del usuario, pero la metáfora rectora es la senda.

## Experiencia y tono

- Tratar a la persona con calidez, respeto y autonomía; evitar presión, urgencia artificial, culpa o escasez fabricada.
- No usar upselling agresivo ni derivar de forma automática o violenta a una versión paga.
- Cuando una herramienta gratuita llegue a su límite, ofrecer continuidad humana: contactar al equipo o conversar con un profesional recomendado.
- La IA puede generar la devolución inicial del test, pero no debe sustituir un diagnóstico profesional ni responder automáticamente como si fuera un profesional humano.
- Explicar siempre que los resultados son orientativos y no constituyen un diagnóstico clínico.

## Test gratuito de Anclas de Carrera

- Toda presentación pública del test debe indicar de forma explícita que está compuesto por **40 enunciados** (`40 statements` en inglés). No describir su estructura como 40 preguntas, ítems o afirmaciones; reservar “afirmaciones” para la experiencia subjetiva de selección.
- Cada cuenta autenticada con Google puede realizar el test gratuito una sola vez.
- El límite debe aplicarse en el servidor y en Supabase; nunca depender solo de la interfaz.
- La persona puede volver a consultar el resultado guardado, pero no reiniciar ni repetir el test gratuito.
- Ante un resultado existente, mostrarlo con un mensaje amable y ofrecer contacto humano opcional.
- No presentar la versión paga como castigo por haber agotado el intento gratuito.

## Cambios y despliegue

- Preservar privacidad, RLS y validaciones server-side.
- Ejecutar `npm run release:check` antes de publicar.
- Los cambios completados se publican mediante `push-and-deploy.sh`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
