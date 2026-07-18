# Senda: reglas permanentes

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

- Cada cuenta autenticada con Google puede realizar el test gratuito una sola vez.
- El límite debe aplicarse en el servidor y en Supabase; nunca depender solo de la interfaz.
- La persona puede volver a consultar el resultado guardado, pero no reiniciar ni repetir el test gratuito.
- Ante un resultado existente, mostrarlo con un mensaje amable y ofrecer contacto humano opcional.
- No presentar la versión paga como castigo por haber agotado el intento gratuito.

## Cambios y despliegue

- Preservar privacidad, RLS y validaciones server-side.
- Ejecutar `npm run release:check` antes de publicar.
- Los cambios completados se publican mediante `push-and-deploy.sh`.
