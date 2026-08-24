# Rediseño Universo Senda

## Intervención 7 · Transiciones laborales, orientación de recorrido y Anclas públicas

- Fecha de inicio: 2026-08-15.
- Proyecto: `original` (`v0-reinvention-web-platform`), sin intervenir `senda-cosmos`.
- Objetivo: centrar Senda en transiciones laborales, organizar seis propuestas adultas por situación, mantener Brújulas en segundo plano y reconstruir los dos cuestionarios como herramientas públicas con resultado inmediato.
- Hash base: `80bb03d5733550ec4b1b29deeb6c477cdaaaf83d`.
- Rama de publicación: `main`.
- Checkpoint local previo: `checkpoint/pre-transitions-restructure-20260815`.
- Estado inicial: árbol limpio y sincronizado con `origin/main`; no había cambios de usuario staged, unstaged ni sin seguimiento.
- El checkpoint es una referencia Git al estado exacto previo y no incorpora secretos, `.env`, PDF, `node_modules` ni artefactos generados.

### Recuperación previa a esta intervención

Una vez guardado o publicado cualquier trabajo posterior, volver al estado previo con:

```bash
git switch checkpoint/pre-transitions-restructure-20260815
```

Retomar la versión publicada de esta intervención:

```bash
git switch main
```

No requiere `git reset`, `git restore`, `git checkout --` ni force push.

### Benchmark interno Claudina / Glimar

Esta tabla documenta la función de los elementos observados y la adaptación original adoptada para Senda. No forma parte del contenido público.

| Elemento observado | Función que cumple | Adaptación original para Senda |
| --- | --- | --- |
| Hero breve que relaciona una tensión con una respuesta profesional | Aclara rápidamente posicionamiento y siguiente acción | Hero propio centrado en transiciones laborales y CTA a reconocer el momento actual, sin repetir fórmulas verbales ni composición visual. |
| Oferta organizada por situaciones reconocibles | Permite identificarse sin conocer nombres de servicios | Hub multipágina con seis situaciones adultas y una página profunda para cada propuesta. |
| Anatomía consistente por propuesta | Facilita comparar alcance, destinatarios y próximos pasos | Cada página explica para quién es, señales, qué puede trabajarse, límites y continuidad, sin inventar encuentros ni resultados. |
| Desarrollo institucional de enfoque y equipo | Construye confianza antes de pedir contacto | Páginas propias de metodología y equipo con información real; sin testimonios, cifras ni credenciales no verificadas. |
| Repetición de formularios como vía principal | Convierte interés en consultas | Senda invierte el orden: primero ofrece orientación pública y resultado; el contacto aparece después y siempre es voluntario y consentido. |
| Página extensa que reúne toda la oferta | Permite revisar alternativas en continuidad | Senda conserva un hub sintético y páginas individuales; ni la home ni el hub se convierten en una página sábana. |
| WhatsApp y CTA de conversación humana | Ofrece una salida de baja fricción | Se mantiene el botón global activado solo por clic y la conversación con Senda como alternativa, sin trackers ni apertura automática. |
| Jerarquía editorial clara | Mejora lectura y escaneo | Se reutilizan tipografía, tokens, órbitas, coordenadas y trayectorias propias; no se copian fuentes, colores, imágenes, CSS ni composición. |

Elementos deliberadamente no copiados: textos, preguntas, nombres comerciales, diseño, código, imágenes, testimonios, biografías, cifras, años de experiencia, metodología propietaria y tipografías. El Laboratorio permanece como experiencia grupal independiente y Brújulas como propuesta secundaria para primeras decisiones.

### Decisiones iniciales

- Las seis propuestas adultas pertenecen al territorio `Transiciones laborales`; Brújulas queda fuera de ese catálogo principal.
- El cuestionario de situación calcula y muestra la orientación en el navegador antes de pedir datos. El nuevo recorrido no usa `/api/initial-diagnostic`, CAPTCHA ni Supabase.
- El test de Anclas conserva los 40 enunciados, la escala 1–6 y las tres elecciones adicionales de la implementación propia. Los empates mantienen el desempate determinístico histórico por orden de catálogo y la IA nunca decide el ancla.
- La explicación determinística es completa. La persona puede solicitar de forma explícita una interpretación ampliada por IA; se ejecuta en servidor y su ausencia o fallo no impide ver el resultado.
- El uso anónimo de ambos cuestionarios no persiste respuestas. Si existe una sesión Google, Anclas conserva en Supabase el único intento gratuito para aplicar el límite server-side y permitir volver a consultarlo, de acuerdo con las reglas permanentes del proyecto.
- Antes de iniciar Anclas se solicita consentimiento obligatorio, expreso e informado para que, al completar el test, Senda envíe a `hola@universosenda.com` y `tanisardella@gmail.com` la dirección de correo de la cuenta Google, el momento profesional opcional, el ranking completo de las ocho anclas, sus puntajes y la devolución orientativa determinística persistida. El informe no incluye identificadores técnicos, fecha exacta ni las 40 respuestas individuales, y tampoco habilita marketing; la interpretación por IA permanece separada y no es una dependencia de ese envío. El formulario posterior conserva `/api/contact` exclusivamente para una solicitud voluntaria de contacto.
- Las rutas anteriores se conservan únicamente como redirecciones permanentes.

### Archivos y validación

Archivos realmente intervenidos:

- Rutas, metadata y API: `app/[locale]/{page,layout}.tsx`, `app/[locale]/brujulas/page.tsx`, `app/[locale]/como-trabajamos/page.tsx`, `app/[locale]/contacto/{layout,page}.tsx`, `app/[locale]/diagnostico/{page,ancla-de-carrera/page,ancla-de-carrera/test/page}.tsx`, `app/[locale]/encontrar-mi-recorrido/page.tsx`, `app/[locale]/equipo/page.tsx`, `app/[locale]/laboratorio-{narrativas-laborales-alternativas,nuevas-narrativas}/page.tsx`, `app/[locale]/{login,panel,preguntas-frecuentes,privacidad,terminos}/page.tsx`, `app/[locale]/orientacion-vocacional/page.tsx`, `app/[locale]/procesos/[slug]/page.tsx`, `app/[locale]/recorridos/{page,[slug]/page}.tsx`, `app/[locale]/test-anclas-de-carrera/page.tsx`, `app/[locale]/transiciones-laborales/{page,[slug]/page}.tsx`, `app/api/diagnostics/{analyze,complete-public,interpret}/route.ts` y `app/sitemap.ts`.
- Experiencia, navegación y formularios: `components/diagnostic/initial-diagnostic-form.tsx`, `components/forms/{diagnostic-result-share-form,laboratory-interest-form}.tsx`, `components/layout/{footer,header,process-popup}.tsx`, `components/pages/{journeys-page,methodology-page,page-primitives}.tsx`, `components/processes/process-detail.tsx` y `components/sections/{career-quiz,senda-home}.tsx`.
- Dominio, contenido y configuración: `lib/contact/{email-content,mailer,schema}.ts`, `lib/data/{anchors.json,senda-processes.ts}`, `lib/diagnostics/{access,career-anchor,initial-diagnostic}.ts`, `lib/security/navigation.ts`, `messages/{es,en}.json`, `next.config.ts`, `public/llms.txt`, `scripts/{verify-deploy,verify-env}.mjs`, `supabase/migrations/20260815120000_enforce_single_career_anchor_attempt.sql` y `README.md`.
- Documentación: `docs/operations/go-live-checklist.md`, `docs/redesign-universo-senda.md` y `docs/senda/{ARCHITECTURE,DECISIONS,PROJECT,STATE}.md`.
- Pruebas de navegador: `tests/e2e/{authenticated-diagnostic,internal-pages,questionnaires,senda-experience,smoke,visual-assets}.spec.ts`.
- Pruebas unitarias: `tests/unit/{career-anchor-interpret-route,career-anchor-public-completion-route,career-anchor,contact-email-content,contact-mailer,contact-route,contact-schema,diagnostic-access,i18n,initial-diagnostic,navigation}.test.ts`.

No se modificaron dependencias, lockfiles, fuentes, PDF, migraciones históricas, secretos ni archivos `.env`. La nueva migración forward-only elimina la excepción de repetición para cuentas creadoras. La paridad localizada actual es de 951 valores terminales en español y 951 en inglés.

Validación previa al cierre:

- Instalación reproducible con `npm ci`: aprobada.
- `npm run release:check`: aprobado el 2026-08-15 sobre el estado final previo al commit.
  - ESLint y TypeScript: aprobados.
  - Suite unitaria: 123 aprobadas en 22 archivos.
  - Playwright: 81 aprobadas y 2 autenticadas omitidas por no disponer de `E2E_AUTH_STORAGE_STATE`.
  - Build optimizado de Next.js: aprobado e incluye las rutas y APIs nuevas.
- El rerun dirigido de cuestionarios y contacto aprobó además 21/21 después de incorporar la gestión de foco entre pasos y en las confirmaciones.
- `git diff --check`: aprobado; sin secretos ni artefactos generados versionados.
- El commit, el push, el deployment y el recorrido productivo se registran después de completar la publicación.
- La migración `20260815120000_enforce_single_career_anchor_attempt.sql` fue aplicada y verificada en el proyecto Supabase productivo enlazado; el historial remoto coincide con las 13 migraciones locales.
- Bloqueo operativo externo conocido: Vercel Production contiene cuatro de las cinco variables SMTP y falta `SMTP_PASSWORD`. Hasta cargar ese secreto y redesplegar, `/api/health` seguirá degradado y los formularios responderán 503 sin afirmar envío ni recepción.

## Intervención 6 · Uptime y escala del símbolo

- Fecha de inicio: 2026-08-14.
- Proyecto: `original` (`v0-reinvention-web-platform`), sin intervenir `senda-cosmos`.
- Objetivo: separar liveness de readiness para que el monitor de uptime describa correctamente la disponibilidad pública, y ampliar solo el símbolo orbital del header conservando la palabra `Senda`.
- Hash base: `b927e46c274be07a61966767f4d3c7e472ce6d64`.
- Rama de trabajo: `agent/fix-uptime-logo-20260814`.
- Checkpoint local previo: `checkpoint/pre-uptime-logo-20260814`.
- Estado inicial: árbol limpio y sincronizado con `origin/main`.

### Decisiones

- `/api/health/live` es una sonda de proceso sin dependencias: responde 200 si Next puede ejecutar el handler y no expone diagnósticos.
- `/api/health` conserva sin cambios su semántica estricta de readiness, incluido SMTP. La falta de `SMTP_PASSWORD` continúa degradando ese endpoint y bloqueando el smoke de despliegue; no se oculta ni se reemplaza con una credencial ficticia.
- `Production Uptime` comprueba rutas públicas y liveness, e informa readiness degradada como una advertencia separada con la URL y el estado HTTP.
- La palabra `Senda`, la cinta vectorial y el footer conservan su escala. Solo el símbolo orbital del header pasa a 64 px en la variante compacta y 80 px desde 768 px.
- La cinta se desplaza un píxel hacia la izquierda y hacia arriba para solaparse realmente con el remate inferior de la `S`; no se modifica su silueta ni su afinado.

### Recuperación previa a esta intervención

```bash
git switch checkpoint/pre-uptime-logo-20260814
```

Retomar la rama de trabajo:

```bash
git switch agent/fix-uptime-logo-20260814
```

No requiere `git reset`, `git restore` ni `git checkout --`.

### Archivos intervenidos

- Marca y validación responsive: `app/globals.css`, `tests/e2e/{smoke,internal-pages}.spec.ts`.
- Liveness y monitoreo: `app/api/health/live/route.ts`, `.github/workflows/uptime-monitor.yml`, `tests/unit/health-live-route.test.ts`.
- Operación y trazabilidad: `README.md`, `docs/senda/ARCHITECTURE.md`, `docs/operations/{slo-alerting,runbook}.md` y este documento.

No se modifican dependencias, lockfiles, PDF, variables de entorno, secretos, formularios, autenticación, RLS ni el proyecto `senda-cosmos`.

### Validación

- `npm run release:check`: aprobado el 2026-08-14.
  - ESLint y TypeScript: aprobados.
  - Unitarias: 89 aprobadas en 21 archivos.
  - Playwright: 67 aprobadas y 2 autenticadas omitidas por no disponer de `E2E_AUTH_STORAGE_STATE`.
  - Build optimizado de Next.js: aprobado e incluye `/api/health/live`.
- La matriz responsive dirigida de 51 pruebas aprobó rutas ES/EN y los anchos críticos del header, incluidos 320, 390, 768, 1366, 1599, 1600, 1720 y 1920 px, sin overflow ni solapamientos.
- La inspección visual real se repitió a 390 y 1720 px en modo oscuro. Confirmó el símbolo ampliado, la palabra sin cambio de escala y la continuidad S→senda.
- `git diff --check`: aprobado. No se incorporaron secretos, variables locales ni artefactos generados.
- La publicación, el nuevo run manual de `Production Uptime` y la comprobación del alias productivo se registran al cerrar la intervención.

## Intervención 5 · Marca ampliada y estructura Sobre mí

- Fecha de inicio: 2026-08-14.
- Proyecto: `original` (`v0-reinvention-web-platform`), sin intervenir `senda-cosmos`.
- Objetivo: ampliar de forma visible la marca del encabezado, convertir el remate inferior de la `S` en una senda continua bajo la palabra y agregar una estructura editable de `Sobre mí` entre Inicio y Recorridos.
- Hash base: `62bc59b61a3ae79b6d104b95b06ae4a891647e82`.
- Rama de trabajo: `agent/senda-logo-sobre-mi`.
- Checkpoint local previo: `checkpoint/pre-logo-sobre-mi-20260814`.
- Estado inicial: árbol limpio, sin cambios staged ni unstaged; el hash base coincidía con `origin/main`.

### Decisiones de diseño y arquitectura

- La ampliación se limita al logo del header desde `768 px`; en móvil angosto se conserva la escala compacta para no superponer la marca con idioma, tema y menú.
- El camino inferior sigue siendo una silueta SVG propia, animada únicamente cuando el sistema permite movimiento. Su inicio se solapa con el remate inferior de la `S`, baja en una curva orgánica bajo `Senda` y se afina hacia el final.
- El header completo pasa a mostrarse desde `1600 px`. Entre 320 y 1599 px usa la navegación compacta accesible, evitando que notebooks o zoom ampliado compriman los títulos.
- `Sobre mí` se incorpora como destino independiente en español e inglés, inmediatamente después de Inicio y antes de Recorridos. Se conserva también la página Equipo: no se fusionan identidades ni se inventan datos personales.
- La nueva página presenta una estructura real para trayectoria, forma de acompañar y origen de Senda, con texto explícito de que el contenido se completará. No incorpora retrato, credenciales ni biografía no confirmados.
- Mientras la biografía esté incompleta, `/sobre-mi` y `/en/sobre-mi` publican `noindex,follow` y quedan fuera del sitemap y `llms.txt`; sí se verifican como rutas productivas accesibles.
- Raleway se conserva como única familia visual, pero pasa de `next/font/google` a un archivo variable oficial autohospedado con licencia OFL. Esto elimina los 404 intermitentes de Google Fonts que bloqueaban builds locales y de Vercel, sin instalar paquetes ni cambiar la identidad tipográfica.

### Recuperación previa a esta intervención

Con el árbol limpio, volver exactamente al estado anterior:

```bash
git switch checkpoint/pre-logo-sobre-mi-20260814
```

Retomar la rama de trabajo:

```bash
git switch agent/senda-logo-sobre-mi
```

No hace falta usar `git reset`, `git restore` ni `git checkout --`.

### Archivos intervenidos

- Marca y layout responsive: `components/brand/senda-logo.tsx`, `app/globals.css` y `components/layout/header.tsx`.
- Fuente autohospedada: `app/[locale]/layout.tsx`, `app/fonts/{raleway-variable.ttf,OFL.txt}` y `tailwind.config.ts`.
- Nueva estructura: `app/[locale]/sobre-mi/page.tsx` y `components/pages/about-me-page.tsx`.
- Navegación y contenido localizado: `components/layout/footer.tsx` y `messages/{es,en}.json`.
- Verificación: `tests/unit/i18n.test.ts`, `tests/e2e/{internal-pages,smoke}.spec.ts` y `scripts/verify-deploy.mjs`.
- Trazabilidad: este documento.

No se modificaron dependencias, lockfiles, PDF, variables de entorno, secretos, autenticación, RLS, diagnósticos, formularios ni el proyecto independiente `senda-cosmos`.

### Validación y publicación

- `npm run release:check`: aprobado el 2026-08-14.
  - ESLint y TypeScript: aprobados.
  - Unitarias: 88 aprobadas en 20 archivos.
  - Playwright: 67 aprobadas y 2 autenticadas omitidas por no disponer de `E2E_AUTH_STORAGE_STATE`.
  - Build optimizado de Next.js: aprobado e incluye `/sobre-mi` y `/en/sobre-mi`; ya no realiza descargas de Google Fonts.
- La matriz responsive cubrió 320, 389, 390, 720, 767, 768, 960, 1152, 1366, 1440, 1536, 1599, 1600, 1720 y 1920 px en español e inglés. Confirmó ausencia de overflow o solapes, palabra visible desde 390 px, marca ampliada desde 768 px y navegación completa únicamente desde 1600 px.
- La prueba geométrica verifica una unión de hasta 3 px entre el remate inferior de la `S` y la senda, además de un grosor final inferior a un tercio del inicial. El modo de movimiento reducido mantiene el logo completo y estático.
- La inspección visual en navegador real cubrió 390, 1366 y 1720 px, la página completa en modo oscuro y el orden `Inicio → Sobre mí → Recorridos` / `Home → About me → Journeys`.
- Paridad exacta de 659 claves ES/EN y `git diff --check`: aprobados.
- El archivo variable Raleway coincide byte por byte con la distribución oficial `google/fonts/main/ofl/raleway`; `OFL.txt` conserva íntegro el texto oficial, normalizado a finales de línea LF para el repositorio.
- El commit, la publicación en `origin/main` y la comprobación de Vercel Production se informan al cerrar la intervención.

## Revisión final del Laboratorio para producción

- Fecha: 2026-08-13.
- Proyecto: `original` (`v0-reinvention-web-platform`), sin intervenir `senda-cosmos`.
- Hash inicial: `6897ce15b0b68e261a7fba6b52fee89ce20befaf`.
- Rama de trabajo: `agent/senda-laboratorio-final-production`.
- Checkpoint recuperable previo: `checkpoint/pre-laboratorio-final-production-20260813`.
- Estado inicial: árbol limpio, sin cambios staged ni unstaged, y `main` sincronizada con `origin/main`.
- Recuperación exacta del estado previo: `git switch checkpoint/pre-laboratorio-final-production-20260813`. No requiere `git reset`, `git restore` ni `git checkout --`.
- La revisión completa incorporó el noveno eje editorial solicitado, “construir sentido alrededor de las decisiones laborales”, en español e inglés; el Laboratorio continúa separado de los dos recorridos.
- Se excluyó el honeypot del árbol accesible sin retirarlo del formulario ni modificar la protección del endpoint.
- El popup de otras herramientas queda suprimido en esta ruta para no tapar ni interrumpir el formulario; al confirmarse un envío, el foco pasa al mensaje de éxito.
- Archivos intervenidos: `components/pages/narratives-lab-page.tsx`, `components/forms/laboratory-interest-form.tsx`, `components/layout/process-popup.tsx`, `messages/{es,en}.json`, `tests/unit/i18n.test.ts`, `tests/e2e/senda-experience.spec.ts` y este documento.
- `npm run release:check` aprobado: ESLint, TypeScript, 88 pruebas unitarias, 63 pruebas E2E, 2 pruebas autenticadas omitidas por falta de credenciales técnicas y build optimizado con la ruta ES/EN del Laboratorio.
- La inspección visual dirigida cubrió escritorio claro a 1440 px y móvil oscuro a 390 px en español e inglés; la matriz E2E verificó además 320 px, ambos temas y ausencia de overflow.
- El control de Vercel Production confirmó cuatro de las cinco variables SMTP. Falta `SMTP_PASSWORD`; por lo tanto no se intentó ni se afirma un envío o recepción real. El endpoint permanece en fallo cerrado con 503 `config` hasta incorporar ese secreto y generar un nuevo deployment.
- El commit, el deployment y la URL pública se informan al cerrar esta revisión.

## Intervención 4 · Laboratorio de Nuevas Narrativas Laborales

- Fecha de inicio: 2026-08-13.
- Proyecto: `original` (`v0-reinvention-web-platform`), sin intervenir `senda-cosmos`.
- Objetivo: incorporar una futura experiencia grupal de Senda con página propia y formulario de interés, sin convertirla en un tercer recorrido ni alterar la arquitectura de Brújula y Nueva Etapa Profesional.
- Ruta canónica en español: `/laboratorio-nuevas-narrativas`.
- Ruta canónica en inglés: `/en/laboratorio-nuevas-narrativas`.
- Rama de trabajo: `agent/senda-laboratorio-narrativas`.
- Hash base: `4e8d271e965b04d5482438f21de8d5bdab078bc4`.
- Checkpoint local previo: `checkpoint/pre-laboratorio-narrativas-20260813`.
- Estado inicial del árbol: limpio, sin cambios staged ni unstaged; el hash base coincidía con `origin/main` y con la versión productiva al comenzar.
- El checkpoint es una referencia Git y no incorpora `.env`, secretos, PDF, `node_modules` ni archivos generados.

### Decisiones de arquitectura y contenido

- El Laboratorio es una experiencia grupal futura e independiente. No se agrega a `sendaProcesses`, a las tarjetas de Recorridos ni al enrutamiento del diagnóstico.
- La Home conserva su función breve: incorpora un único acceso editorial secundario, separado visual y semánticamente de los dos recorridos.
- La navegación lo presenta como `Laboratorio` dentro de la arquitectura general y el footer lo ubica bajo `Explorar`, nunca bajo `Recorridos`.
- La página utiliza únicamente tipografía, color, nodos, conexiones y trayectorias vectoriales propias. No incorpora fotografías, recursos cósmicos literales, testimonios ni datos comerciales inventados.
- El contenido mantiene `Próximamente` como estado real y no publica fechas, modalidad, duración, precio, cantidad de participantes o facilitadores no confirmados.
- Español es la fuente editorial; la versión inglesa conserva el mismo alcance con traducción natural mediante el catálogo `next-intl` existente.

### Formulario de interés

- El formulario solicita nombre, correo, teléfono opcional, un campo opcional sobre qué interesa explorar y consentimiento específico para recibir información del Laboratorio.
- Reutiliza el endpoint seguro `/api/contact`, el mismo destinatario `hola@universosenda.com`, el control de origen HTTP, el honeypot, la sanitización, el límite de solicitudes y el transporte SMTP existentes.
- El origen permitido queda cerrado en servidor como `laboratorio_nuevas_narrativas`; la ruta y el idioma deben coincidir con ese origen.
- El asunto se resuelve exclusivamente en el servidor como `Interés en el Laboratorio de Nuevas Narrativas Laborales`; el navegador no puede elegir asunto ni destinatario.
- No se agrega a la persona a campañas, CRM, listas externas ni flujos automáticos. El éxito se muestra solamente después de que el servidor confirma aceptación SMTP; cualquier fallo conserva todos los datos en pantalla.
- La recepción real seguirá condicionada a que las cinco variables SMTP, incluida `SMTP_PASSWORD`, sean válidas en Vercel Production. Nunca se versiona, muestra ni registra esa credencial.

### Recuperación previa a esta intervención

Con el árbol limpio, volver exactamente al estado anterior:

```bash
git switch checkpoint/pre-laboratorio-narrativas-20260813
```

Retomar la rama de trabajo:

```bash
git switch agent/senda-laboratorio-narrativas
```

No hace falta usar `git reset`, `git restore` ni `git checkout --`.

### Archivos y validación de la intervención 4

- Página y composición: `app/[locale]/laboratorio-nuevas-narrativas/page.tsx`, `components/pages/narratives-lab-page.tsx` y `components/forms/laboratory-interest-form.tsx`.
- Navegación y acceso secundario: `components/layout/{header,footer}.tsx` y `components/sections/senda-home.tsx`.
- Contenido y discovery: `messages/{es,en}.json`, `app/sitemap.ts`, `public/llms.txt` y `scripts/verify-deploy.mjs`.
- Canal seguro compartido: `lib/contact/{schema,email-content,mailer}.ts`; `app/[locale]/contacto/page.tsx` incorpora únicamente el nuevo nombre de campo al mapa exhaustivo de errores compartido.
- Pruebas: `tests/unit/{contact-schema,contact-email-content,contact-mailer,contact-route,i18n}.test.ts` y `tests/e2e/{internal-pages,senda-experience,smoke}.spec.ts`.
- Trazabilidad y artefactos: este documento y `.gitignore`, que mantiene fuera de Git las capturas y salidas locales de Playwright.

No se modificaron dependencias, lockfiles, PDF, variables de entorno, secretos, autenticación, RLS, el diagnóstico, el test gratuito ni el proyecto independiente `senda-cosmos`.

### Validación de la intervención 4

- La inspección local en navegador cubre español e inglés, tema claro y oscuro, desktop de 1440 px y móvil de 390/320 px. No se detectó overflow horizontal; la página no usa fotografías y el Laboratorio permanece separado de los dos recorridos.
- El formulario se valida con el mismo esquema en cliente y servidor, conserva todos los datos ante fallos y solo muestra éxito después de HTTP 200 con `{ok: true}`. Las pruebas interceptadas no se presentan como evidencia de recepción de correo.
- La recepción real depende de que Vercel Production tenga las cinco variables SMTP válidas. Al comenzar esta intervención faltaba `SMTP_PASSWORD`; por ello el estado productivo del correo no se considera verificado y debe seguir fallando de forma cerrada hasta completar esa credencial.
- `npm run release:check`: aprobado el 2026-08-13.
  - ESLint y TypeScript: aprobados.
  - Unitarias: 88 aprobadas en 20 archivos.
  - Playwright: 61 aprobadas y 2 autenticadas omitidas por no disponer de `E2E_AUTH_STORAGE_STATE`.
  - Build optimizado de Next.js: aprobado e incluye las rutas ES/EN del Laboratorio.
- `git diff --check` y la paridad exacta de 633 claves ES/EN: aprobados. Los catálogos de recorridos conservan únicamente `compass` y `newStage`.
- La comprobación limpia de producción se realiza después del push y deployment; su evidencia se informa junto al hash y URL pública, sin confundirla con la validación local.

## Intervención 3 · Arquitectura multipágina, marca viva y contacto

- Fecha de inicio: 2026-08-12.
- Proyecto: `original` (`v0-reinvention-web-platform`), sin intervenir `senda-cosmos`.
- Objetivo: convertir la portada extensa en un sitio multipágina, incorporar navegación real, animación accesible de marca, contacto global por WhatsApp y envío de consultas por SMTP desde el servidor.
- Rama de trabajo: `agent/senda-multipage-contact`.
- Hash base: `d1312470bc980393da7ea6efa5312acc40bd19ab`.
- Checkpoint local previo: `checkpoint/pre-multipage-contact-20260812`.
- Estado inicial del árbol: limpio, sin cambios staged ni unstaged; la rama partió de `origin/main`.
- El checkpoint es una referencia Git y no contiene `.env`, secretos, PDF, `node_modules` ni archivos generados.

### Arquitectura anterior y nueva

La arquitectura anterior concentraba en la portada el desarrollo completo de recorridos, metodología, equipo y preguntas frecuentes. Los detalles de los recorridos vivían bajo `/procesos/*` y la página institucional bajo `/quienes-somos`.

La nueva arquitectura asigna un único lugar principal a cada tema:

- `/` — portada breve.
- `/recorridos` — presentación comparada de los dos recorridos.
- `/recorridos/brujula` — detalle de Brújula.
- `/recorridos/nueva-etapa-profesional` — detalle de Nueva Etapa Profesional.
- `/como-trabajamos` — metodología y funcionamiento.
- `/equipo` — equipo y criterios de acompañamiento.
- `/preguntas-frecuentes` — preguntas frecuentes.
- `/contacto` — formulario y canales directos.

Todas las rutas se publican también con prefijo `/en` mediante el sistema `next-intl` existente. Las URLs anteriores de recorridos y `/quienes-somos` redirigen permanentemente a sus destinos canónicos equivalentes, preservando el idioma.

### Marca y movimiento

- La marca conserva el símbolo y la palabra `Senda` como enlace a Inicio.
- Las órbitas se animan de forma lenta e independiente con SVG y CSS.
- Un trazo fino dibuja un camino orgánico bajo la palabra, sin atravesar las letras.
- Con `prefers-reduced-motion` la marca permanece completa y estática; su lectura no depende de JavaScript.

### Contacto

- WhatsApp se centraliza con el número público internacional `5491136736778` y el mensaje inicial aprobado, sin SDK, tracker ni apertura automática.
- El formulario envía desde un endpoint server-side al buzón `hola@universosenda.com`, valida y limita el cuerpo, evita inyección de cabeceras, incluye honeypot y rate limiting, conserva los datos ante fallos y solo confirma éxito después de la aceptación SMTP.
- Variables privadas necesarias: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` y `CONTACT_TO_EMAIL`. La contraseña nunca se versiona, muestra ni registra.
- La verificación de recepción real queda condicionada a que `SMTP_PASSWORD` esté configurada de forma segura en Vercel.

### Recuperación previa a esta intervención

Con el árbol limpio, volver exactamente al estado previo:

```bash
git switch checkpoint/pre-multipage-contact-20260812
```

Retomar la rama de trabajo:

```bash
git switch agent/senda-multipage-contact
```

No hace falta usar `git reset`, `git restore` ni `git checkout --`.

### Archivos intervenidos en la intervención 3

- Páginas y composición: `components/sections/senda-home.tsx`, `components/pages/{page-primitives,journeys-page,methodology-page,team-page,faq-page}.tsx`, `components/processes/process-detail.tsx`.
- Rutas canónicas: `app/[locale]/{recorridos,como-trabajamos,equipo,preguntas-frecuentes,contacto}/`; redirecciones en `app/[locale]/{procesos,orientacion-vocacional,quienes-somos}/` y `next.config.ts`.
- Navegación y marca: `components/layout/{header,footer,whatsapp-button}.tsx`, `components/brand/senda-logo.tsx`, `app/globals.css`, `lib/contact-config.ts`.
- Contacto server-side: `app/api/contact/route.ts`, `lib/contact/{schema,request-security,email-content,mailer,smtp-result}.ts`, `app/api/health/route.ts`, `.env.example`.
- Contenido y discovery: `messages/{es,en}.json`, `app/sitemap.ts`, `public/llms.txt`, `scripts/{verify-env,verify-deploy}.mjs`.
- Dependencia estrictamente necesaria: `nodemailer` y sus tipos, registrados en `package.json` y `package-lock.json` sin actualizar otras dependencias.
- Pruebas: `tests/unit/{contact-email-content,contact-mailer,contact-request-security,contact-route,contact-schema,contact-smtp-result,i18n}.test.ts` y `tests/e2e/{internal-pages,senda-experience,smoke}.spec.ts`.
- Documentación adicional sincronizada: `docs/operations/brand-domain-migration.md`, `docs/senda/ARCHITECTURE.md` y este documento.

No se modificaron los PDF académicos, secretos, `.env.local`, la lógica del test gratuito, autenticación, RLS ni el proyecto independiente `senda-cosmos`.

### Validación de la intervención 3

- `npm run release:check`: aprobado el 2026-08-13.
  - ESLint: aprobado.
  - TypeScript: aprobado.
  - Unitarias: 77 aprobadas en 20 archivos.
  - Playwright: 56 aprobadas y 2 autenticadas omitidas por no disponer de `E2E_AUTH_STORAGE_STATE`.
  - Build de producción Next.js: aprobado.
- La matriz nueva cubre las ocho rutas en español e inglés, desktop y móvil, metadata, página activa, menú desplegable por teclado, menú móvil, redirecciones 308, 6/8 fases, tema persistente, linterna, logo animado/estático, WhatsApp exacto y contacto con validación, éxito aceptado por API y fallo controlado que conserva datos.
- `git diff --check`: aprobado; paridad exacta de claves ES/EN y búsqueda pública sin las denominaciones retiradas.
- En Vercel Production quedaron configurados los cuatro valores SMTP no secretos y el número público de WhatsApp. `SMTP_PASSWORD` permanece pendiente de carga segura por el propietario; el health check y el endpoint fallan cerrados hasta entonces.
- La recepción real de correo y la verificación final de producción se realizan únicamente después de completar esa credencial; no se declaran verificadas antes.

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
