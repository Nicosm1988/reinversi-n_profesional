# Master Architecture Prompt — Reinvención.Pro

> **Documento maestro inamovible.** Toda decisión técnica, de diseño o de producto debe alinearse con este archivo. Si un agente o desarrollador contradice algo escrito aquí, este documento tiene prioridad.

---

## 1. Visión del Producto

**Reinvención.Pro** es una plataforma premium de orientación vocacional-ocupacional (OVO) y acompañamiento a la reinvención profesional, asistida por inteligencia artificial y supervisada por un equipo de psicólogos especializados.

### Propuesta de Valor

> _Darle espacio al cambio es la mejor forma de construir algo real. Cada proceso es único, te acompañamos a transitar el tuyo._

La plataforma combina ciencia psicométrica validada, acompañamiento humano experto e inteligencia artificial para guiar a profesionales en transición hacia un nuevo rumbo laboral con claridad y confianza.

---

## 2. Modelo de Negocio

| Dimensión              | Decisión                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Producto principal** | Programa estructurado de acompañamiento OVO + inserción laboral (High-ticket)                                                            |
| **Modelo de ingresos** | Venta de programa High-ticket (NO suscripción, NO infoproducto)                                                                          |
| **Embudo actual**      | Landing → Test diagnóstico gratuito → Informe de resultados → Agendar cita 1:1 → Venta del programa                                      |
| **Escalamiento**       | A través de la IA como copiloto 24/7 + rutas de carrera automatizadas, reduciendo la carga del equipo humano en las fases más operativas |

---

## 3. Audiencia Objetivo (Target)

### Perfiles primarios

1. **Líderes y mandos medios (35-50 años)** — Aburridos del mundo corporativo, buscan roles C-Level o pivotar a Tech/emprendimiento.
2. **Jóvenes profesionales (25-30 años)** — Crisis de "cuarto de vida", incertidumbre sobre su rumbo laboral.
3. **Toda persona que busque un cambio laboral** — Sin importar industria o nivel, siempre que valore un proceso guiado y profesional.

### Tono de comunicación

- **Español neutro** (ni voseo argentino, ni "usted" formal). Se habla de "tú" neutro.
- **Inglés** como segundo idioma simultáneo desde el día 1.
- **Estilo editorial:** Empático, cálido, profesional. Nada corporativo frío ni coaching genérico.

---

## 4. Rol de la Inteligencia Artificial

> **La IA NO es el core del servicio. El core es el acompañamiento humano (OVO).** La IA potencia y personaliza la experiencia.

### 4.1 Copiloto de Carrera (Chat privado 24/7)

Un asistente conversacional disponible en el dashboard del usuario que:

- Responde preguntas sobre su proceso de reinvención.
- Ofrece recursos y ejercicios relevantes según su perfil y etapa.
- Guía en la preparación de entrevistas, CVs y cartas de presentación.
- **NO reemplaza al psicólogo.** Escala al equipo humano cuando detecta temas sensibles.

### 4.2 Informe Post-Diagnóstico (Test de Anclas de Carrera)

- Tras completar el test, la IA genera un informe personalizado.
- **Basado exclusivamente en la documentación subida** (Schein, Anclas de Carrera). Sin inventar ni extrapolar.
- El informe se entrega al usuario como primer gancho de valor.

### 4.3 Rutas de Carrera (Generación con supervisión humana)

- La IA genera borradores de rutas de aprendizaje y reinvención basadas en los resultados del test.
- **Estas rutas pasan por revisión del equipo de psicólogos ANTES de mostrarse al usuario.**
- La IA se ocupa de la inteligencia de mercado laboral 2026+ para la fase de inserción laboral.

### 4.4 Lo que NO hace la IA (por ahora)

- ❌ Simuladores de entrevistas en tiempo real (voz/texto).
- ❌ Diagnóstico clínico o psicológico.
- ❌ Toma de decisiones autónoma sin supervisión del equipo.

---

## 5. Funcionalidades del Dashboard (Post-Login)

Una vez que el usuario se registra o paga, verá:

| Funcionalidad                  | Descripción                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Progress Tracking**          | Sistema visual de seguimiento del progreso de su reinvención (etapas, hitos, porcentaje)                       |
| **Copiloto IA**                | Chat privado 24/7 con el asistente de carrera                                                                  |
| **Repositorio de Documentos**  | CVs optimizados por IA, cartas de presentación, portfolio profesional                                          |
| **Ejercicios Psicológicos**    | Muro de ejercicios desbloqueables diseñados para construir confianza basada en la experiencia real del usuario |
| **Resultados de Diagnósticos** | Historial de tests con informes generados                                                                      |
| **Rutas de Carrera**           | Plan de acción personalizado (supervisado por el equipo humano)                                                |

---

## 6. Tech Stack Actual

| Capa               | Tecnología                           | Versión                 |
| ------------------ | ------------------------------------ | ----------------------- |
| **Framework**      | Next.js (App Router)                 | 16.1.6                  |
| **UI**             | React + TailwindCSS + Framer Motion  | React 19, TW 3.4, FM 12 |
| **Componentes**    | Radix UI + shadcn/ui (CVA)           | latest                  |
| **i18n**           | next-intl                            | 4.8                     |
| **Backend/DB**     | Supabase (Postgres + Auth + RLS)     | latest                  |
| **IA**             | Vercel AI SDK + OpenAI               | ai 6.x                  |
| **Formularios**    | React Hook Form + Zod                | latest                  |
| **Hosting**        | Vercel                               | —                       |
| **Pagos**          | Stripe + MercadoPago (multicurrency) | _por implementar_       |
| **Notificaciones** | Sonner (toasts)                      | 2.x                     |

### Base de datos actual (Supabase)

Tablas existentes con RLS habilitado:

- `profiles` — Extensión de `auth.users` (nombre, país, timezone)
- `diagnostics` — Catálogo de tests disponibles
- `diagnostic_sessions` — Sesiones del usuario con respuestas (JSONB)
- `diagnostic_results` — Resultados procesados + feedback IA
- `applications` — Solicitudes para agendar cita 1:1
- `user_diagnostics` — Registro simplificado de respuestas de Anclas de Carrera

---

## 7. Visión Global e i18n

| Aspecto                    | Decisión                                                 |
| -------------------------- | -------------------------------------------------------- |
| **Mercado de lanzamiento** | LATAM + España                                           |
| **Idiomas desde el día 1** | Español neutro + Inglés                                  |
| **Monedas**                | Multi-currency vía Stripe (global) + MercadoPago (LATAM) |
| **Zonas horarias**         | Soporte nativo en `profiles.timezone`                    |
| **Escalamiento a 2 años**  | Expansión global manteniendo la base bilingüe            |

---

## 8. Principios de Desarrollo

1. **Supervisión humana siempre.** Toda salida de IA que impacte al usuario pasa por revisión del equipo.
2. **Datos del usuario son sagrados.** RLS habilitado en todas las tablas. El usuario solo ve lo suyo.
3. **Premium desde el diseño.** Cada componente debe sentirse cuidado: tipografía, animaciones, espaciado.
4. **Bilingüe nativo.** Toda string de UI va en `messages/es.json` y `messages/en.json` desde el día 1.
5. **Documentación como fuente de verdad.** Los informes de IA se basan exclusivamente en la documentación cargada (Schein, Anclas de Carrera). Sin invención.
6. **Escalar sin perder humanidad.** La IA libera tiempo del equipo, pero nunca reemplaza la conexión humana.

---

## 9. Próximas Fases (Roadmap Técnico)

### Fase 1: Informe Post-Diagnóstico ← **AHORA**

- Generar el informe de Anclas de Carrera post-test usando Vercel AI SDK.
- Basado exclusivamente en la documentación de Schein subida al proyecto.
- Entrega del informe al usuario en pantalla con opción de descarga PDF.

### Fase 2: Autenticación y Dashboard Base

- Login/Registro con Supabase Auth (email + Google).
- Dashboard mínimo: perfil, historial de diagnósticos, resultados.

### Fase 3: Copiloto de Carrera (Chat IA)

- Chat privado en el dashboard con contexto del perfil del usuario.
- Entrenado sobre documentación OVO y mercado laboral 2026+.

### Fase 4: Pasarela de Pagos

- Integración Stripe (internacional) + MercadoPago (LATAM).
- Checkout para programa High-ticket.

### Fase 5: Ejercicios y Rutas de Carrera

- Muro de ejercicios desbloqueables.
- Generación de rutas de carrera con revisión humana.
- Repositorio de documentos (CVs, cartas de presentación).

---

_Última actualización: 28 de febrero de 2026_
