# Senda — Proyecto

> Síntesis operativa. La fuente extensa y con prioridad máxima en decisiones de producto es `docs/product/master-architecture.md`; los principios de acompañamiento están en `docs/product-principles.md`; las reglas de marca y negocio en `AGENTS.md`.

## Propósito

Senda acompaña a personas que necesitan explorar su identidad, talentos, vocación, propósito y próximos caminos profesionales en un mundo atravesado por la IA, el cambio tecnológico y la incertidumbre laboral. Es una plataforma para el mundo, no un portfolio personal de sus fundadores (Nicolás y Tania), y antes se llamó "Reinvención Pro" / "Reinvención Profesional".

## Público

- Líderes y mandos medios (35-50 años) que buscan pivotar a roles C-Level, tecnología o emprendimiento.
- Jóvenes profesionales (25-30 años) atravesando incertidumbre de rumbo laboral ("crisis de cuarto de vida").
- En general, cualquier persona en cambio laboral que valore un proceso guiado y profesional.
- Mercado de lanzamiento: LATAM + España, bilingüe español neutro / inglés desde el día 1.

## Problema y propuesta de valor

El mundo del trabajo cambia más rápido que la capacidad de las personas para reinterpretar su identidad profesional. Senda ofrece un recorrido guiado — combinando ciencia psicométrica validada, acompañamiento humano experto e IA como copiloto — para ayudar a decidir con más claridad, sin prescribir una respuesta única ni prometer una fórmula mágica.

## Principios (ver `docs/product-principles.md` para el detalle completo)

1. Cuidado antes que conversión: sin presión, juicio ni empuje a comprar.
2. Autonomía: invitaciones a continuar siempre opcionales y sin urgencia artificial.
3. Continuidad humana: quien quiera profundizar puede conversar con el equipo o un profesional recomendado.
4. Límites honestos: un resultado automatizado es orientativo, nunca un diagnóstico clínico o profesional completo.
5. Sin automatización invasiva: entregado el test gratuito, no se reemplaza el acompañamiento humano con IA ilimitada.
6. Supervisión humana siempre: toda salida de IA que impacte al usuario pasa por revisión del equipo antes de mostrarse.
7. Datos sagrados: RLS habilitado en todas las tablas; cada usuario ve sólo lo suyo.

## Rol de la IA

La IA es copiloto, no el núcleo del servicio (el núcleo es el acompañamiento humano). Genera el informe post-diagnóstico del test de Anclas de Carrera basándose exclusivamente en la documentación de Schein cargada (sin extrapolar), y en fases futuras asistirá en rutas de carrera (con revisión humana previa) y en un copiloto de chat 24/7. No hace diagnóstico clínico ni toma decisiones autónomas sin supervisión.

## Servicios y fases del roadmap (detalle en `docs/product/master-architecture.md` §9)

1. **Fase 1 (actual):** informe post-diagnóstico de IA para el test de Anclas de Carrera.
2. Fase 2: autenticación y dashboard base.
3. Fase 3: copiloto de carrera (chat IA privado).
4. Fase 4: pasarela de pagos (Stripe + MercadoPago).
5. Fase 5: ejercicios desbloqueables y rutas de carrera con revisión humana.

## Tono e identidad

- Español neutro ("tú", ni voseo ni "usted"), inglés como segundo idioma simultáneo.
- Estilo editorial: humano, cálido, sereno, profundo, elegante, contemporáneo — alta cultura sin elitismo, tecnología sin espectáculo vacío.
- Metáforas válidas: umbral, punto de partida, caminos, mapa, brújula, cuaderno, pausa, conversación, exploración, integración, regreso al mundo con una dirección posible.
- Paleta conceptual: hueso cálido, carbón suave, verde musgo, bronce envejecido, ámbar, madera, piedra, lino, vegetación sobria.
- La persona y su recorrido son protagonistas; la IA nunca lo es.

## Exclusiones (qué NO es ni hace Senda)

- No es una consultora de RR. HH. genérica, una bolsa de empleo, un test que encasilla, una clínica, una escuela tradicional, una app de productividad ni un espacio religioso.
- No usa lenguaje de coaching vacío, slogans grandilocuentes ni promesas de éxito garantizado.
- No usa estética startup genérica, neón, gradientes excesivos, gamificación infantil ni efectos gratuitos.
- No implementa simuladores de entrevista en tiempo real, diagnóstico clínico/psicológico por IA, ni funciones, mundos 3D o pagos no solicitados explícitamente.
- No presenta la versión paga como castigo por agotar el test gratuito, ni hace upselling agresivo.
- No se presenta como "reinvención profesional" de marca (nombre legado, ver `docs/architecture/project-naming.md`).
