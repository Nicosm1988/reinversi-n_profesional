# Documentación operativa de Senda

Índice breve de la capa de documentación pensada para trabajar con Claude Code. No duplica la documentación de producto ya existente; la referencia.

| Documento | Para qué sirve | Se actualiza |
| --- | --- | --- |
| [`PROJECT.md`](./PROJECT.md) | Identidad, propósito, público, tono y exclusiones de Senda. | Cuando cambie la identidad o el posicionamiento del producto. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Stack, estructura y comandos confirmados contra el repositorio real. | Cuando cambie el stack, las rutas o los comandos. |
| [`DECISIONS.md`](./DECISIONS.md) | Registro ADR liviano de decisiones técnicas/de producto duraderas. | Cada vez que se tome una decisión duradera nueva. |
| [`STATE.md`](./STATE.md) | Estado operativo actual, riesgos y próximo paso verificable. | Al final de cada sesión de trabajo relevante. |

## Fuente de verdad por tema

- **Producto y roadmap:** `docs/product/master-architecture.md` (documento maestro, prioridad máxima) y `docs/product-principles.md`.
- **Reglas permanentes de negocio:** `AGENTS.md` (nombres de proyecto original/cosmos, límite del test gratuito, tono, despliegue).
- **Estructura de repositorio y naming:** `docs/architecture/`.
- **Operación, incidentes y SLO:** `docs/operations/`.
- **Localización:** `docs/content/localization-status.md`.
- **Material histórico/consulta:** `docs/reference/`.
- **Reglas operativas de Claude Code:** `/CLAUDE.md` en la raíz (siempre vigente, no requiere releerse si ya está en contexto).

No se crean Skills, subagentes, hooks ni MCP adicionales como parte de esta base documental; se añadirán sólo ante un caso repetido con ganancia neta clara.
