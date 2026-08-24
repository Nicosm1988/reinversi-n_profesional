# Notificaciones internas de actividad

## Alcance

Senda genera un aviso interno cuando ocurre uno de estos eventos:

- un inicio de sesión explícito y exitoso;
- la finalización anónima del mismo test con un comprobante firmado por el servidor.

La finalización autenticada del Test de Anclas de Carrera ya no genera este aviso breve. Después del consentimiento específico, crea dos informes completos y separados mediante la outbox de Postgres documentada en `career-anchor-report-emails.md`; así se evita duplicar correos a las mismas casillas.

El mensaje sólo indica el tipo de actividad, si fue realizada con una cuenta o de forma anónima, y la fecha en hora de Argentina. No incluye correo de la persona, IP, respuestas, puntajes, ranking ni contenido del informe.

## Destinatarios y configuración

Las variables privadas requeridas son:

- `INTERNAL_NOTIFICATION_EMAILS`, que debe incluir `hola@universosenda.com` y `tanisardella@gmail.com`;
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASSWORD`;
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`;
- `CRON_SECRET`, usado también para firmar el comprobante anónimo y autorizar el worker;
- `INTERNAL_NOTIFICATION_STARTED_AT`, opcional y conservada sólo para tooling legado de reconciliación; ya no forma parte del cron, de la verificación estricta ni del health productivo;
- `INTERNAL_NOTIFICATION_BATCH_SIZE` (opcional, entre 1 y 25; por defecto `25`).

Nunca registrar ni versionar los valores secretos.

## Entrega e idempotencia

Cada entrega por destinatario se guarda en Redis antes de abrir SMTP. Las claves contienen huellas criptográficas, no identificadores crudos ni direcciones. Un lease breve evita que dos funciones envíen el mismo trabajo en paralelo y un marcador durable impide repetir entregas ya aceptadas.

Los fallos SMTP se reprograman con espera creciente. La entrega inmediata y el cron diario usan el mismo worker idempotente. El `Message-ID` permanece estable entre reintentos para reducir duplicados en el caso extremo de que SMTP acepte un correo y se corte la conexión antes de confirmar la respuesta.

El cron existente `/api/cron/career-anchor-report-emails` procesa los informes de Anclas pendientes y cualquier notificación interna que ya esté en Redis. No reconstruye nuevos avisos breves para finalizaciones autenticadas y su respuesta no expone destinatarios ni identificadores de entrega.

## Comprobante anónimo

El navegador solicita el comprobante recién al empezar a responder. El servidor lo firma, lo guarda en una cookie `HttpOnly`, `Secure` y `SameSite=Strict`, y lo consume después de que la outbox acepta la finalización. El endpoint de finalización no recibe las 40 respuestas ni acepta un identificador inventado por el navegador.
