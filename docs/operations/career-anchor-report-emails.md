# Correos de informes de Anclas de Carrera

## Contrato de datos y consentimiento

- Antes de iniciar el test, la persona debe aceptar de manera expresa y sin una casilla premarcada el envío interno del informe. La aceptación general de Términos y Privacidad no sustituye este consentimiento específico.
- El informe se procesa solamente después de completar el intento y se dirige exclusivamente a `hola@universosenda.com` y `tanisardella@gmail.com`.
- El contenido incluye la dirección de correo de la cuenta Google, el momento profesional opcional, el ranking completo de las ocho anclas, el puntaje de cada una y la devolución orientativa determinística persistida. No incorpora identificadores técnicos ni la fecha exacta de finalización.
- El contenido excluye las 40 respuestas individuales. Tampoco constituye un diagnóstico clínico ni autoriza comunicaciones comerciales.
- La finalización siempre conserva una devolución determinística y el informe interno utiliza esa versión congelada. La interpretación por IA permanece separada en la cuenta y no es contenido ni dependencia del correo interno.
- El formulario que aparece después del resultado es una solicitud de contacto opcional. No vuelve a autorizar el informe ni debe producir una segunda entrega.
- No se deben encolar ni enviar informes internos de resultados históricos que no tengan registrado este consentimiento específico.

## Garantías del flujo

- La finalización del informe, el registro de la versión de consentimiento y la creación de su entrega de correo deben quedar vinculados de forma atómica en Postgres.
- Existe una sola entrega lógica por informe, destinatario y versión de plantilla. Los reintentos no crean un segundo informe.
- El worker reclama cada entrega con `FOR UPDATE SKIP LOCKED` y una lease de 15 minutos, por lo que dos invocaciones no envían el mismo trabajo en paralelo.
- Cada intento queda auditado sin copiar la dirección de correo: se conserva el `user_id`, estado, número de intento, código operativo y `message-id` del proveedor.
- El SMTP ocurre fuera de la transacción. Una caída de correo nunca revierte ni oculta el informe ya guardado.
- El `Message-ID` es estable entre reintentos. SMTP no ofrece idempotencia estricta ante el caso extremo de que el servidor acepte el mensaje y corte la conexión antes de responder; el identificador estable reduce ese riesgo, pero no permite prometer entrega exactamente una vez.
- La dirección de la cuenta, los puntajes y la devolución no se registran en logs de aplicación ni en respuestas operativas del cron.

## Variables privadas requeridas

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER` (remitente visible; debe usar el dominio profesional de Senda)
- `SMTP_PASSWORD`
- `CRON_SECRET` (aleatorio, mínimo 16 caracteres)
- `REPORT_EMAIL_BATCH_SIZE` (opcional, entre 1 y 25; valor recomendado: `5`)
- `NEXT_PUBLIC_SITE_URL` (para el enlace de vuelta al informe)

Nunca registrar, imprimir ni versionar las credenciales. El worker diario de Vercel usa `CRON_SECRET` en el encabezado `Authorization` y la entrega inmediata usa exclusivamente código server-side.

## Orden seguro de puesta en producción

1. Configurar y validar todas las variables en Vercel Production, en especial `SMTP_PASSWORD` y `CRON_SECRET`.
2. Aplicar la migración que registra el consentimiento versionado y separa la entrega interna de cualquier aviso dirigido a la persona.
3. Publicar la aplicación con el checkbox obligatorio ES/EN y la validación server-side. Una finalización sin consentimiento persistido debe fallar cerrada y no crear una entrega interna.
4. Completar un intento nuevo en una cuenta controlada y verificar que el informe contiene exactamente la dirección de la cuenta, el momento profesional opcional, ocho posiciones con sus puntajes y la devolución orientativa determinística persistida, sin identificadores técnicos, fecha exacta ni las 40 respuestas individuales.
5. Confirmar que `hola@universosenda.com` y `tanisardella@gmail.com` reciben sus entregas y que ninguna otra casilla aparece como destinataria.
6. Invocar una tanda desde el dominio productivo si hace falta recuperar trabajos nuevos y consentidos. Este paso sí puede enviar correos reales:

   ```bash
   npm run email:reports:deliver -- --execute --confirm=SEND_QUEUED_REPORT_EMAILS --base-url=https://universosenda.com
   ```

7. Confirmar aceptación SMTP y recepción real en ambas casillas antes de declarar el flujo operativo. El cron diario retomará entregas reintentables; Vercel no reintenta por sí solo una invocación fallida del cron.

Los comandos `email:reports:backfill` existentes no autorizan el nuevo informe interno. No deben usarse para enviar resultados completados antes de que existiera el consentimiento versionado.

## Auditoría sin PII adicional

Consultar conteos por estado sin recuperar emails:

```sql
select status, count(*)
from public.diagnostic_report_email_deliveries
group by status
order by status;
```

Consultar el historial operativo:

```sql
select outcome, error_code, count(*)
from public.diagnostic_report_email_attempts
group by outcome, error_code
order by outcome, error_code;
```

Los estados `failed` se reintentan. `permanent_failure` requiere revisar datos faltantes o inválidos antes de decidir cualquier acción manual.

Las copias en las casillas del equipo se eliminan cuando dejan de ser necesarias para revisar el resultado, conservar contexto de una continuidad solicitada o cumplir obligaciones legales. Una solicitud de supresión recibida en `hola@universosenda.com` debe abarcar la fila persistida y las copias de correo, salvo una excepción legal aplicable.
