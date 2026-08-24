import type { CareerAnchorLocale } from "@/lib/diagnostics/career-anchor";

export type CareerAnchorReportEmailContentInput = {
  locale: CareerAnchorLocale;
  reportUrl: string;
};

export type CareerAnchorReportEmailContent = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * The email is deliberately only a notification. Answers, anchor names,
 * ranking, and interpretation stay behind the authenticated profile link.
 */
export function buildCareerAnchorReportEmailContent(
  input: CareerAnchorReportEmailContentInput,
): CareerAnchorReportEmailContent {
  const isEnglish = input.locale === "en";
  const subject = isEnglish
    ? "Your Career Anchors result is ready | Senda"
    : "Tu resultado de Anclas de Carrera está listo | Senda";
  const heading = isEnglish ? "Your result is saved" : "Tu resultado quedó guardado";
  const introduction = isEnglish
    ? "Thank you for completing the Career Anchors journey. You can return to your private result whenever you need."
    : "Gracias por completar el recorrido de Anclas de Carrera. Podés volver a tu resultado privado cuando lo necesites.";
  const privacy = isEnglish
    ? "For privacy, this email does not include your answers, ranking, or interpretation. Sign in with the same Google account to view them."
    : "Por privacidad, este correo no incluye tus respuestas, el ranking ni la interpretación. Ingresá con la misma cuenta de Google para verlos.";
  const cta = isEnglish ? "View my private result" : "Ver mi resultado privado";
  const disclaimer = isEnglish
    ? "This result is for orientation only. It is not a clinical diagnosis and does not determine which decision you should make."
    : "Este resultado es orientativo. No constituye un diagnóstico clínico ni determina qué decisión deberías tomar.";
  const footer = isEnglish
    ? "Senda · A place to explore your professional path with perspective and autonomy."
    : "Senda · Un espacio para explorar tu recorrido profesional con perspectiva y autonomía.";

  const text = [
    heading,
    "",
    introduction,
    "",
    privacy,
    "",
    `${cta}: ${input.reportUrl}`,
    "",
    disclaimer,
    "",
    footer,
  ].join("\n");

  const html = `<!doctype html>
<html lang="${isEnglish ? "en" : "es"}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f5f1f8;color:#281f36;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(introduction)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1f8;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e2d9ea;border-radius:24px;overflow:hidden;box-shadow:0 12px 32px rgba(53,35,72,0.08);">
            <tr>
              <td style="background:#281f36;padding:28px 36px;color:#ffffff;">
                <div style="font-size:30px;line-height:1;font-weight:600;letter-spacing:-1px;">Senda</div>
              </td>
            </tr>
            <tr>
              <td style="padding:38px 36px 18px;">
                <h1 style="margin:0 0 16px;font-size:30px;line-height:1.2;color:#281f36;">${escapeHtml(heading)}</h1>
                <p style="margin:0;font-size:16px;line-height:1.7;color:#665c70;">${escapeHtml(introduction)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 36px 18px;">
                <div style="border:1px solid #dfd3e7;border-left:5px solid #cc148c;border-radius:18px;padding:22px;background:#fbf8fc;">
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#5f536a;">${escapeHtml(privacy)}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:18px 36px 36px;">
                <a href="${escapeHtml(input.reportUrl)}" style="display:inline-block;border-radius:999px;background:#cc148c;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:15px 28px;">${escapeHtml(cta)}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #ece5f0;padding:24px 36px 30px;">
                <p style="margin:0 0 12px;font-size:12px;line-height:1.6;color:#7a7082;">${escapeHtml(disclaimer)}</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#7a7082;">${escapeHtml(footer)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
