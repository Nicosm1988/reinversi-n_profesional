import type { CareerAnchorLocale } from "@/lib/diagnostics/career-anchor";

export type CareerAnchorReportEmailContentInput = {
  locale: CareerAnchorLocale;
  dominantAnchor: string;
  ranking: Array<{ rank: number; name: string }>;
  title: string;
  summary: string;
  frictionAreas?: string[];
  idealEcosystem?: string | null;
  strategicQuestion?: string | null;
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

function htmlParagraph(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

export function buildCareerAnchorReportEmailContent(
  input: CareerAnchorReportEmailContentInput,
): CareerAnchorReportEmailContent {
  const isEnglish = input.locale === "en";
  const subject = isEnglish
    ? "Your Career Anchors report is ready | Senda"
    : "Tu informe de Anclas de Carrera está listo | Senda";
  const heading = isEnglish
    ? "Your report is ready"
    : "Tu informe está listo";
  const introduction = isEnglish
    ? "Thank you for completing the Career Anchors journey. We saved your report so you can return to it whenever you need."
    : "Gracias por completar el recorrido de Anclas de Carrera. Guardamos tu informe para que puedas volver a consultarlo cuando lo necesites.";
  const anchorLabel = isEnglish ? "Your primary anchor" : "Tu ancla principal";
  const topThreeLabel = isEnglish ? "Your three leading anchors" : "Tus tres anclas más presentes";
  const fullRankingLabel = isEnglish ? "Your complete ranking" : "Tu ranking completo";
  const frictionLabel = isEnglish ? "Points of tension to observe" : "Tensiones para observar";
  const ecosystemLabel = isEnglish ? "An environment worth exploring" : "Un entorno para explorar";
  const questionLabel = isEnglish ? "A question to keep exploring" : "Una pregunta para seguir explorando";
  const cta = isEnglish ? "View my report" : "Ver mi informe";
  const disclaimer = isEnglish
    ? "This result is for guidance only. It is not a clinical diagnosis and does not determine what decision you should make."
    : "Este resultado es orientativo. No constituye un diagnóstico clínico ni determina qué decisión deberías tomar.";
  const footer = isEnglish
    ? "Senda · A place to explore your professional path with perspective and autonomy."
    : "Senda · Un espacio para explorar tu recorrido profesional con perspectiva y autonomía.";

  const text = [
    heading,
    "",
    introduction,
    "",
    `${anchorLabel}: ${input.dominantAnchor}`,
    input.title,
    "",
    input.summary,
    "",
    `${topThreeLabel}:`,
    ...input.ranking.slice(0, 3).map((anchor) => `${anchor.rank}. ${anchor.name}`),
    "",
    `${fullRankingLabel}:`,
    ...input.ranking.map((anchor) => `${anchor.rank}. ${anchor.name}`),
    ...(input.frictionAreas?.length
      ? ["", `${frictionLabel}:`, ...input.frictionAreas.map((area) => `• ${area}`)]
      : []),
    ...(input.idealEcosystem ? ["", `${ecosystemLabel}:`, input.idealEcosystem] : []),
    ...(input.strategicQuestion
      ? ["", `${questionLabel}:`, input.strategicQuestion]
      : []),
    "",
    `${cta}: ${input.reportUrl}`,
    "",
    disclaimer,
    "",
    footer,
  ].join("\n");

  const escapedReportUrl = escapeHtml(input.reportUrl);
  const topThreeHtml = input.ranking
    .slice(0, 3)
    .map(
      (anchor, index) => `<div style="margin-top:${index === 0 ? "0" : "10px"};border:1px solid ${index === 0 ? "#e0a4cb" : "#ded4e5"};border-radius:14px;padding:14px 16px;background:${index === 0 ? "#fbeaf5" : "#ffffff"};">
                    <span style="display:inline-block;width:30px;height:30px;border-radius:999px;background:${index === 0 ? "#cc148c" : "#493b59"};color:#ffffff;text-align:center;line-height:30px;font-size:14px;font-weight:700;">${anchor.rank}</span>
                    <span style="margin-left:10px;font-size:16px;line-height:1.4;font-weight:700;color:#31263f;">${escapeHtml(anchor.name)}</span>
                  </div>`,
    )
    .join("");
  const completeRankingHtml = input.ranking
    .map(
      (anchor) => `<tr>
                    <td style="width:36px;border-bottom:1px solid #eee8f1;padding:10px 6px 10px 0;font-size:14px;font-weight:700;color:#9c176f;">${anchor.rank}</td>
                    <td style="border-bottom:1px solid #eee8f1;padding:10px 0;font-size:14px;line-height:1.45;color:#4f445a;">${escapeHtml(anchor.name)}</td>
                  </tr>`,
    )
    .join("");
  const frictionHtml = (input.frictionAreas ?? [])
    .map(
      (area) => `<li style="margin:0 0 8px;padding-left:4px;font-size:15px;line-height:1.6;color:#5f536a;">${htmlParagraph(area)}</li>`,
    )
    .join("");
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
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2d9ea;border-radius:24px;overflow:hidden;box-shadow:0 12px 32px rgba(53,35,72,0.08);">
            <tr>
              <td style="background:#281f36;padding:28px 36px;color:#ffffff;">
                <div style="font-size:30px;line-height:1;font-weight:600;letter-spacing:-1px;">Senda</div>
              </td>
            </tr>
            <tr>
              <td style="padding:38px 36px 16px;">
                <h1 style="margin:0 0 16px;font-size:30px;line-height:1.2;color:#281f36;">${escapeHtml(heading)}</h1>
                <p style="margin:0;font-size:16px;line-height:1.7;color:#665c70;">${escapeHtml(introduction)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 36px;">
                <div style="border:1px solid #dfd3e7;border-left:5px solid #cc148c;border-radius:18px;padding:24px;background:#fbf8fc;">
                  <div style="margin-bottom:8px;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#9c176f;">${escapeHtml(anchorLabel)}</div>
                  <div style="margin-bottom:14px;font-size:22px;line-height:1.35;font-weight:700;color:#281f36;">${escapeHtml(input.dominantAnchor)}</div>
                  <div style="margin-bottom:12px;font-size:18px;line-height:1.45;font-weight:700;color:#3c304d;">${escapeHtml(input.title)}</div>
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#665c70;">${htmlParagraph(input.summary)}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 16px;">
                <h2 style="margin:0 0 14px;font-size:19px;line-height:1.4;color:#31263f;">${escapeHtml(topThreeLabel)}</h2>
                ${topThreeHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 16px;">
                <div style="border:1px solid #e4dce9;border-radius:18px;padding:20px 22px;background:#ffffff;">
                  <h2 style="margin:0 0 8px;font-size:18px;line-height:1.4;color:#31263f;">${escapeHtml(fullRankingLabel)}</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${completeRankingHtml}</table>
                </div>
              </td>
            </tr>
            ${frictionHtml ? `<tr>
              <td style="padding:8px 36px 16px;">
                <div style="border-radius:18px;padding:22px;background:#fff5fa;">
                  <h2 style="margin:0 0 12px;font-size:18px;line-height:1.4;color:#31263f;">${escapeHtml(frictionLabel)}</h2>
                  <ul style="margin:0;padding-left:20px;">${frictionHtml}</ul>
                </div>
              </td>
            </tr>` : ""}
            ${input.idealEcosystem ? `<tr>
              <td style="padding:8px 36px 16px;">
                <div style="border-radius:18px;padding:22px;background:#f6f1f8;">
                  <h2 style="margin:0 0 10px;font-size:18px;line-height:1.4;color:#31263f;">${escapeHtml(ecosystemLabel)}</h2>
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#5f536a;">${htmlParagraph(input.idealEcosystem)}</p>
                </div>
              </td>
            </tr>` : ""}
            ${input.strategicQuestion ? `<tr>
              <td style="padding:8px 36px 16px;">
                <div style="border-radius:18px;padding:22px;background:#f0e8f5;">
                  <div style="margin-bottom:8px;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:#66507d;">${escapeHtml(questionLabel)}</div>
                  <p style="margin:0;font-size:16px;line-height:1.65;font-style:italic;color:#3c304d;">${htmlParagraph(input.strategicQuestion)}</p>
                </div>
              </td>
            </tr>` : ""}
            <tr>
              <td align="center" style="padding:20px 36px 36px;">
                <a href="${escapedReportUrl}" style="display:inline-block;border-radius:999px;background:#cc148c;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:15px 28px;">${escapeHtml(cta)}</a>
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
