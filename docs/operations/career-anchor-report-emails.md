# Correos de informes de Anclas de Carrera

## Garantías del flujo

- La finalización del informe y la creación de su entrega de correo ocurren en una única transacción de Postgres.
- Existe una sola entrega lógica por informe y versión de plantilla.
- El worker reclama cada entrega con `FOR UPDATE SKIP LOCKED` y una lease de 15 minutos, por lo que dos invocaciones no envían el mismo trabajo en paralelo.
- Cada intento queda auditado sin copiar la dirección de correo: se conserva el `user_id`, estado, número de intento, código operativo y `message-id` del proveedor.
- El SMTP ocurre fuera de la transacción. Una caída de correo nunca revierte ni oculta el informe ya guardado.
- El `Message-ID` es estable entre reintentos. SMTP no ofrece idempotencia estricta ante el caso extremo de que el servidor acepte el mensaje y corte la conexión antes de responder; el identificador estable reduce ese riesgo, pero no permite prometer entrega exactamente una vez.

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
2. Aplicar `20260823032739_career_anchor_report_email_outbox.sql` en Supabase.
3. Ejecutar el dry-run del histórico. No crea filas ni envía correos:

   ```bash
   npm run email:reports:backfill
   ```

4. Verificar que `candidates` coincide con la cantidad esperada de informes históricos y revisar la plantilla con los tests automatizados.
5. Publicar la aplicación. Las nuevas finalizaciones intentarán el envío inmediato y conservarán los fallos para reintento.
6. Encolar el histórico con confirmación explícita. Este comando sólo crea trabajos idempotentes; todavía no llama al SMTP:

   ```bash
   npm run email:reports:backfill -- --execute --confirm=BACKFILL_COMPLETED_REPORTS
   ```

7. Invocar una tanda desde el dominio productivo. Este paso sí puede enviar correos reales:

   ```bash
   npm run email:reports:deliver -- --execute --confirm=SEND_QUEUED_REPORT_EMAILS --base-url=https://universosenda.com
   ```

8. Confirmar aceptación SMTP y recepción real en al menos un buzón controlado antes de declarar el flujo operativo. El cron diario retomará entregas reintentables; Vercel no reintenta por sí solo una invocación fallida del cron.

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
