# Notificaciones internas de actividad

## Alcance

Senda genera un aviso interno cuando ocurre uno de estos eventos:

- un inicio de sesión explícito y exitoso;
- la finalización autenticada del test de Anclas de Carrera;
- la finalización anónima del mismo test con un comprobante firmado por el servidor.

El mensaje sólo indica el tipo de actividad, si fue realizada con una cuenta o de forma anónima, y la fecha en hora de Argentina. No incluye correo de la persona, IP, respuestas, puntajes, ranking ni contenido del informe.

## Destinatarios y configuración

Las variables privadas requeridas son:

- `INTERNAL_NOTIFICATION_EMAILS`, que debe incluir `hola@universosenda.com` y `tanisardella@gmail.com`;
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASSWORD`;
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`;
- `CRON_SECRET`, usado también para firmar el comprobante anónimo y autorizar el worker;
- `INTERNAL_NOTIFICATION_STARTED_AT`, fecha y hora ISO 8601 desde la que se habilitaron los avisos; evita notificar finalizaciones históricas al activar la reconciliación;
- `INTERNAL_NOTIFICATION_BATCH_SIZE` (opcional, entre 1 y 25; por defecto `25`).

Nunca registrar ni versionar los valores secretos.

## Entrega e idempotencia

Cada entrega por destinatario se guarda en Redis antes de abrir SMTP. Las claves contienen huellas criptográficas, no identificadores crudos ni direcciones. Un lease breve evita que dos funciones envíen el mismo trabajo en paralelo y un marcador durable impide repetir entregas ya aceptadas.

Los fallos SMTP se reprograman con espera creciente. La entrega inmediata y el cron diario usan el mismo worker idempotente. El `Message-ID` permanece estable entre reintentos para reducir duplicados en el caso extremo de que SMTP acepte un correo y se corte la conexión antes de confirmar la respuesta.

El cron existente `/api/cron/career-anchor-report-emails` procesa tanto los informes pendientes como estas notificaciones internas. Su respuesta no expone destinatarios ni identificadores de entrega.

Las finalizaciones autenticadas tienen además una fuente de recuperación en Supabase: la fila de `diagnostic_report_email_deliveries` se crea en la misma transacción que completa el test. En cada ejecución, el cron vuelve a construir de forma idempotente los eventos recientes desde esa tabla, leyendo únicamente el identificador del diagnóstico y su fecha. Así, una caída de Redis durante la solicitud original no pierde el aviso. La reconciliación se limita a 89 días para permanecer dentro de los 90 días de deduplicación de la outbox y no volver a enviar avisos antiguos.

## Comprobante anónimo

El navegador solicita el comprobante recién al empezar a responder. El servidor lo firma, lo guarda en una cookie `HttpOnly`, `Secure` y `SameSite=Strict`, y lo consume después de que la outbox acepta la finalización. El endpoint de finalización no recibe las 40 respuestas ni acepta un identificador inventado por el navegador.
