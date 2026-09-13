# PayPal Sandbox — Universo Senda

Integración local, sin despliegue productivo ni cobros reales. No modifica Universo Psi.

## Oferta autorizada

- Orientación Vocacional: **USD 450.00**, pago único.
- Transiciones Laborales: **USD 850.00**, pago único.
- Acompañamiento en Proyectos: **Comunicate con nosotros**, sin checkout.
- Reinvención Profesional queda fuera de la oferta de pago.

Se implementa **Orders v2**, sin suscripciones ni conversión ARS/USD. Los accesos están en `/panel`; las pantallas son `/pagos/orientacion-vocacional` y `/pagos/transiciones-laborales` (prefijo `/en` para inglés). El importe final se obtiene del servidor y se muestra antes del botón.

## Variables exactas

Cargar exclusivamente en local o **Vercel Preview** (preferentemente limitado a esta rama). Nunca copiar credenciales Sandbox a Production. No pegar secretos en mensajes, código o logs.

```dotenv
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=sandbox
PAYPAL_PRODUCTS_OR_PLANS=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
NEXT_PUBLIC_SITE_URL=
```

`PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`: aplicación REST de la cuenta Business Sandbox. `PAYPAL_WEBHOOK_ID`: identificador del webhook de **esa misma aplicación**. El secreto y el webhook ID sólo se utilizan en servidor.

`NEXT_PUBLIC_PAYPAL_CLIENT_ID` se documenta por compatibilidad, pero queda vacío: este flujo usa redirección oficial y no carga el SDK. No necesita exponer un Client ID.

`NEXT_PUBLIC_SITE_URL`: origen exacto del Preview público HTTPS, sin ruta; en local, `http://localhost:3000`. Los POST de checkout deben tener este mismo origen. El código nunca construye el retorno con un Host enviado por el cliente.

Valor autorizado para `PAYPAL_PRODUCTS_OR_PLANS` (JSON en una sola línea, sin comillas externas al pegarlo en Vercel):

```json
{"environment":"sandbox","services":{"orientacion-vocacional":{"amount":"450.00","currency":"USD"},"transiciones-laborales":{"amount":"850.00","currency":"USD"}}}
```

No hay Product IDs ni Plan IDs: no se requieren para órdenes de pago único. `environment` debe coincidir con `PAYPAL_ENV`. El código rechaza otros entornos, importes ausentes/no positivos, monedas distintas y configuración incompleta. `sandbox` está bloqueado en Vercel Production y `live` fuera de Production. Las credenciales se validan mediante OAuth contra el host correspondiente; nunca se prueban contra ambos hosts como fallback.

Reutiliza las variables existentes de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Usar Supabase local o una rama/base de Preview aislada; **no aplicar la migración a producción para probar Sandbox**.

## Crear las cuentas y el webhook

1. Entrar en [PayPal Developer](https://developer.paypal.com/dashboard/), con una cuenta PayPal del titular.
2. En **Testing Tools → Sandbox Accounts** ([guía oficial](https://developer.paypal.com/sandbox-testing/accounts)), crear o elegir una cuenta **Business** vendedora y una **Personal** compradora distinta, con saldo ficticio. Guardar sus accesos de prueba. El comprador puede tener un email distinto del usuario Google de Senda.
3. En **Apps & Credentials → Sandbox**, crear una aplicación REST asociada a la Business. Copiar Client ID y Secret al entorno local/Preview.
4. Preparar un Preview HTTPS de Senda y una base de Preview con `supabase/migrations/20260913194343_paypal_service_payments.sql` aplicada mediante el flujo habitual de migraciones. No usar `push-and-deploy.sh`: el pedido actual prohíbe publicar a producción.
5. Dentro de esa aplicación Sandbox, agregar el webhook `https://<preview-domain>/api/webhooks/paypal`. Debe ser accesible públicamente por PayPal, sin login de Vercel ni redirección a producción. Limitar cualquier excepción de protección a este endpoint/Preview.
6. Seleccionar estos eventos: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.PENDING`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`, `PAYMENT.CAPTURE.REVERSED`.
7. Copiar el Webhook ID a `PAYPAL_WEBHOOK_ID`, cargar el JSON anterior y `PAYPAL_ENV=sandbox`, y reconstruir únicamente el Preview para aplicar las variables.

La firma se verifica con `POST /v1/notifications/verify-webhook-signature`; luego se consulta la orden y, para eventos de captura, `GET /v2/payments/captures/{id}`. No se almacenan payloads ni datos del comprador. El simulador de webhooks no sustituye la compra Sandbox: PayPal no admite su verificación con el método de postback usado aquí. Ver [guía oficial de webhooks](https://developer.paypal.com/api/rest/webhooks/rest/) y [Orders v2](https://developer.paypal.com/api/orders/v2).

## E2E mínimo, una compra y una cancelación

1. Ingresar con Google al Preview y abrir `/panel` → Orientación Vocacional. Confirmar **USD 450.00**.
2. Pulsar **Pagar con PayPal**. Ingresar en PayPal con la cuenta Personal Sandbox y aprobar **una sola compra**; no usar cuentas Live.
3. Verificar en el Dashboard Sandbox la orden y su captura. `CHECKOUT.ORDER.APPROVED` dispara la captura server-side aun si el navegador no regresa. `PAYMENT.CAPTURE.COMPLETED` consulta PayPal antes de registrar `approved`.
4. Al volver, la pantalla muestra pendiente hasta confirmar el webhook (actualiza cada cinco segundos durante un minuto; luego ofrece actualización manual). **Reintentar confirmación** puede solicitar la captura al backend, pero nunca habilita el servicio por sí mismo.
5. Consultar en la base de Preview `paypal_payments`: proveedor, referencia UUID, usuario, orden externa, captura, USD 450.00, `approved`, timestamps. Verificar un solo `webhook_event_id` por evento en `paypal_webhook_events`. No copiar datos de cuentas ni payloads a logs.
6. Confirmar que aparece **Coordinar mi servicio**. Cerrar sesión e ingresar de nuevo: `/panel` → el mismo servicio conserva el resultado, sin crear otra orden.
7. Abrir Transiciones Laborales, confirmar **USD 850.00**, iniciar y cancelar en PayPal. Debe informar la salida cancelada, sin habilitar el servicio. No completar una segunda compra. La cancelación del navegador es informativa: nunca reemplaza el estado del proveedor.
8. Registrar IDs opacos de prueba y resultado, sin secretos. Si un webhook falló transitoriamente, reenviar **ese evento real** desde el Dashboard; no fabricar un evento de éxito.

## Persistencia y reintentos

Una inscripción por usuario/servicio/entorno, con referencia UUID enviada como `custom_id`. El email no identifica ni condiciona pagos. Índices únicos por proveedor/orden, proveedor/captura e inscripción evitan duplicados; PayPal recibe la misma clave de idempotencia para reintentos de cada operación. Un inicio incierto sin orden guardada se bloquea tras cinco horas para no sobrepasar la retención estándar de idempotencia de PayPal. Requiere conciliación humana, no recreación automática.

El RPC `record_paypal_event` bloquea la fila y guarda evento/estado en una transacción. Sólo `service_role` puede escribir; el usuario sólo puede leer sus filas. Una confirmación tardía nunca reactiva una inscripción reembolsada/revertida. Un reembolso parcial también suspende la habilitación para revisión humana. Si se necesita comprar nuevamente un servicio ya aprobado o reembolsado, coordinar un nuevo proceso con el equipo; no se inventa recurrencia ni se elimina el historial para reintentar.

No existe agenda/entrega automática previa en este repositorio: el siguiente paso habilitado es coordinar el servicio con el equipo. Toda futura entrega protegida debe comprobar en servidor `status = approved` y el entorno correcto; nunca confiar en la URL de retorno.

## Validación y estado actual

- Migración y pruebas `supabase/tests/paypal_payments.test.sql` ejecutadas en PostgreSQL local de Senda dentro de `BEGIN`/`ROLLBACK`: permisos, aislamiento de usuarios, orden/inscripción únicas, eventos duplicados, evento tardío y reembolso. No aplicada persistentemente ni a una base remota.
- Typecheck y lint: correctos. 319 pruebas unitarias verificadas (36 de PayPal): configuración, importes, OAuth, referencias, firma oficial, reconciliación, deduplicación, autenticación, doble clic y estados de pantalla.
- Build Webpack: correcto fuera del sandbox local. Turbopack falló al abrir un puerto por permisos; Webpack dentro del sandbox falló al leer la salida del subproceso TypeScript. No se alteraron dependencias ni se ignoraron errores de tipos.
- **Estado remoto comprobado (13/09/2026):** repo `Nicosm1988/reinversi-n_profesional`, Vercel `reinvension-profesional` (`prj_3ixP5v3t475vhVQuPa4seBvZJCVm`), dominio `universosenda.com`. Rama local de pruebas: `sandbox/paypal-senda` (todavía sin publicar).
- Vercel contiene `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` y `PAYPAL_ENV` sólo en Preview. Son Secret: la CLI devuelve marcadores `[SENSITIVE]`, no valores; **OAuth y el valor sandbox aún no están verificados**. No compartirlos por chat.
- Faltan `PAYPAL_PRODUCTS_OR_PLANS`, `PAYPAL_WEBHOOK_ID`, `NEXT_PUBLIC_SITE_URL` y las tres variables Supabase de Preview. El JSON autorizado sigue documentado arriba.
- **Bloqueo de aislamiento:** el único proyecto Senda activo disponible es `reinvension-profesional-prod` (`yhpjbetvxdiawostlkon`), sin ramas. `red-senda` está inactivo y no se considera una base de pruebas de este producto. No se copiaron credenciales Production ni se aplicó la migración a producción.
- Para desbloquear: crear una rama/proyecto Supabase exclusivo para pruebas, habilitar el acceso existente del agente y configurar sus `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` únicamente en Vercel Preview, preferentemente para `sandbox/paypal-senda`. No reutilizar la base productiva.
- Antes de probar autenticación: configurar el origen Preview y `/auth/callback` en la base de pruebas, permitir la URL en el proveedor Google si se usa y mantener SMTP/notificaciones reales sin configurar. El acceso email/contraseña también está admitido por la autenticación actual.
- **Bloqueo GitHub comprobado:** `git push` devuelve 403 para la cuenta CLI `taniasardella-talentia`. El conector identifica `Nicosm1988`, pero crear el árbol Git devuelve 403 `Resource not accessible by integration`. No se publicaron commits ni se creó Preview. Para desbloquear, ejecutar `gh auth login --hostname github.com --git-protocol https --web` con una cuenta con escritura en `Nicosm1988/reinversi-n_profesional`, luego `gh auth setup-git`. El agente podrá publicar únicamente `sandbox/paypal-senda`.
- Se intentó configurar modo y catálogo específicos de la rama, pero Vercel respondió `branch_not_found`; no se guardaron esas variables. Primero debe publicarse la rama. No se inventó una URL de webhook.
- Verificaciones de esta continuación: 33 pruebas afectadas aprobadas, typecheck y lint correctos, build Webpack correcto; migración actualizada verificada localmente con rollback. No se repitió la suite completa ni se confundieron esas pruebas con una compra real.
- **E2E pendiente:** no se ejecutó compra ni cancelación; no se registró webhook. La migración continúa pendiente de aplicación persistente en una base aislada; una prueba con rollback no equivale a aplicación.
- El control del destinatario persiste el `merchant_id` devuelto por PayPal al crear la orden sin payee alternativo y exige coincidencia tanto en la orden consultada como en la captura. No utiliza emails.

## Checklist futuro para Live (no ejecutado)

- Cuenta Business verificada y aprobación explícita para publicar/cobrar.
- Credenciales REST Live separadas, importes USD confirmados, JSON con `environment: live`.
- Webhook Live de la app Live, dominio productivo y eventos anteriores; Webhook ID propio.
- Variables sólo en Vercel Production, `PAYPAL_ENV=live`, Supabase productivo validado y migración revisada.
- Ejecutar `npm run release:check`; sólo con autorización productiva usar `push-and-deploy.sh`.
- Una compra real controlada autorizada y verificación de webhook/estado/reingreso.
