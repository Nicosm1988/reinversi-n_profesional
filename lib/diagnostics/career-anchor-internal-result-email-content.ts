import { z } from "zod";
import {
  careerAnchorInterpretationSchema,
  careerAnchorLocaleSchema,
  careerAnchorStoredScoreSchema,
  careerStageSchema,
  hydrateCareerAnchorStoredRanking,
} from "@/lib/diagnostics/career-anchor";

const deterministicResultSchema = careerAnchorInterpretationSchema.refine(
  (result) => result.mode === "fallback",
  { message: "Internal result email requires the deterministic fallback." },
);

const contentInputSchema = z
  .object({
    locale: careerAnchorLocaleSchema,
    accountEmail: z.email().max(254).transform((value) => value.toLowerCase()),
    careerStage: careerStageSchema,
    scoreResult: careerAnchorStoredScoreSchema,
    resultBase: deterministicResultSchema,
  })
  .strict();

export type CareerAnchorInternalResultEmailContentInput = z.input<typeof contentInputSchema>;

export type CareerAnchorInternalResultEmailContent = {
  subject: string;
  text: string;
  html: string;
};

const careerStageLabels = {
  es: {
    exploring_direction: "Explorar una nueva dirección profesional",
    changing_employment: "Preparar un cambio de empleo",
    independent_project: "Construir o reordenar un proyecto propio",
    leadership_company: "Pensar el liderazgo o la continuidad de una empresa",
    specific_challenge: "Abordar un desafío profesional puntual",
    choosing_education: "Elegir una formación para el próximo paso",
    other: "Otra situación profesional",
    prefer_not_to_say: "Prefirió no indicarlo",
  },
  en: {
    exploring_direction: "Explore a new professional direction",
    changing_employment: "Prepare for a job change",
    independent_project: "Build or reorganize an independent project",
    leadership_company: "Think through leadership or company continuity",
    specific_challenge: "Address a specific professional challenge",
    choosing_education: "Choose training for the next step",
    other: "Another professional situation",
    prefer_not_to_say: "Preferred not to say",
  },
} as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlText(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function formatNumber(value: number, locale: "es" | "en") {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function textList(items: string[], emptyLabel: string) {
  return (items.length > 0 ? items : [emptyLabel]).map((item) => `- ${item}`);
}

function htmlList(items: string[], emptyLabel: string) {
  const values = items.length > 0 ? items : [emptyLabel];
  return `<ul style="margin:10px 0 0;padding-left:22px;color:#51465d;">${values
    .map((item) => `<li style="margin:0 0 8px;line-height:1.6;">${htmlText(item)}</li>`)
    .join("")}</ul>`;
}

export function buildCareerAnchorInternalResultEmailContent(
  input: CareerAnchorInternalResultEmailContentInput,
): CareerAnchorInternalResultEmailContent {
  const parsed = contentInputSchema.parse(input);
  const isEnglish = parsed.locale === "en";
  const ranking = hydrateCareerAnchorStoredRanking(parsed.scoreResult, parsed.locale);
  const stage = careerStageLabels[parsed.locale][parsed.careerStage];
  const result = parsed.resultBase;
  const subject = isEnglish
    ? "Internal Career Anchors result | Senda"
    : "Resultado interno de Anclas de Carrera | Senda";
  const heading = isEnglish
    ? "A person completed the Career Anchors journey"
    : "Una persona completó el recorrido de Anclas de Carrera";
  const deterministicLabel = isEnglish
    ? "Complete deterministic interpretation"
    : "Devolución determinística completa";
  const tensionsEmpty = isEnglish
    ? "No tensions were identified by the scoring protocol."
    : "El protocolo de puntuación no identificó tensiones.";
  const servicesEmpty = isEnglish
    ? "No services were suggested."
    : "No se sugirieron servicios.";
  const disclaimer = isEnglish
    ? "This result is for orientation only. It is not a clinical diagnosis, does not define the person, and does not replace professional support."
    : "Este resultado es orientativo. No constituye un diagnóstico clínico, no define a la persona ni reemplaza el acompañamiento profesional.";
  const privacy = isEnglish
    ? "This email contains the persisted ranking and deterministic interpretation, but never the 40 individual responses or the final statement selections."
    : "Este correo contiene el ranking persistido y la devolución determinística, pero nunca las 40 respuestas individuales ni las selecciones finales de enunciados.";

  const rankingLines = ranking.map((anchor) => (
    `${anchor.rank}. ${anchor.name} — ${isEnglish ? "Score" : "Puntaje"}: ${anchor.score} — ${isEnglish ? "Mean" : "Promedio"}: ${formatNumber(anchor.mean, parsed.locale)}`
  ));
  const tensionLines = textList(result.tensions, tensionsEmpty);
  const reflectionLines = textList(result.reflectionQuestions, "");
  const nextStepLines = textList(result.nextSteps, "");
  const serviceLines = result.relevantServices.map(
    (service) => `${service.label} (${service.slug}): ${service.reason}`,
  );

  const text = [
    "Senda — " + (isEnglish ? "internal result" : "resultado interno"),
    "",
    heading,
    "",
    `${isEnglish ? "Account" : "Cuenta"}: ${parsed.accountEmail}`,
    `${isEnglish ? "Professional stage" : "Momento profesional"}: ${stage}`,
    "",
    isEnglish ? "Complete ranking" : "Ranking completo",
    ...rankingLines,
    "",
    deterministicLabel,
    `${isEnglish ? "Title" : "Título"}: ${result.title}`,
    "",
    isEnglish ? "Summary:" : "Resumen:",
    result.summary,
    "",
    isEnglish ? "Connection with the professional stage:" : "Conexión con el momento profesional:",
    result.stageConnection,
    "",
    isEnglish ? "Tensions:" : "Tensiones:",
    ...tensionLines,
    "",
    isEnglish ? "Reflection questions:" : "Preguntas para reflexionar:",
    ...reflectionLines,
    "",
    isEnglish ? "Next steps:" : "Próximos pasos:",
    ...nextStepLines,
    "",
    isEnglish ? "Relevant services:" : "Servicios relevantes:",
    ...textList(serviceLines, servicesEmpty),
    "",
    disclaimer,
    privacy,
  ].join("\n");

  const rankingRows = ranking.map((anchor) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #ece5f0;text-align:center;">${anchor.rank}</td>
      <td style="padding:10px;border-bottom:1px solid #ece5f0;">${escapeHtml(anchor.name)}</td>
      <td style="padding:10px;border-bottom:1px solid #ece5f0;text-align:right;">${anchor.score}</td>
      <td style="padding:10px;border-bottom:1px solid #ece5f0;text-align:right;">${escapeHtml(formatNumber(anchor.mean, parsed.locale))}</td>
    </tr>`).join("");

  const html = `<!doctype html>
<html lang="${parsed.locale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f5f1f8;color:#281f36;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1f8;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;background:#ffffff;border:1px solid #e2d9ea;border-radius:24px;overflow:hidden;">
          <tr><td style="background:#281f36;padding:28px 36px;color:#ffffff;font-size:30px;font-weight:600;">Senda</td></tr>
          <tr><td style="padding:36px;">
            <h1 style="margin:0 0 18px;font-size:28px;line-height:1.25;">${escapeHtml(heading)}</h1>
            <div style="border:1px solid #dfd3e7;border-radius:16px;background:#fbf8fc;padding:18px;line-height:1.7;color:#51465d;">
              <strong>${isEnglish ? "Account" : "Cuenta"}:</strong> ${escapeHtml(parsed.accountEmail)}<br>
              <strong>${isEnglish ? "Professional stage" : "Momento profesional"}:</strong> ${escapeHtml(stage)}
            </div>

            <h2 style="margin:30px 0 12px;font-size:21px;">${isEnglish ? "Complete ranking" : "Ranking completo"}</h2>
            <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2d9ea;border-radius:12px;border-collapse:separate;border-spacing:0;overflow:hidden;color:#51465d;">
              <thead><tr style="background:#f2ebf5;">
                <th style="padding:10px;">#</th>
                <th style="padding:10px;text-align:left;">${isEnglish ? "Anchor" : "Ancla"}</th>
                <th style="padding:10px;text-align:right;">${isEnglish ? "Score" : "Puntaje"}</th>
                <th style="padding:10px;text-align:right;">${isEnglish ? "Mean" : "Promedio"}</th>
              </tr></thead>
              <tbody>${rankingRows}</tbody>
            </table>

            <h2 style="margin:32px 0 14px;font-size:21px;">${escapeHtml(deterministicLabel)}</h2>
            <h3 style="margin:18px 0 8px;font-size:18px;">${htmlText(result.title)}</h3>
            <p style="margin:0;color:#51465d;line-height:1.7;">${htmlText(result.summary)}</p>

            <h3 style="margin:24px 0 8px;font-size:17px;">${isEnglish ? "Connection with the professional stage" : "Conexión con el momento profesional"}</h3>
            <p style="margin:0;color:#51465d;line-height:1.7;">${htmlText(result.stageConnection)}</p>

            <h3 style="margin:24px 0 8px;font-size:17px;">${isEnglish ? "Tensions" : "Tensiones"}</h3>
            ${htmlList(result.tensions, tensionsEmpty)}

            <h3 style="margin:24px 0 8px;font-size:17px;">${isEnglish ? "Reflection questions" : "Preguntas para reflexionar"}</h3>
            ${htmlList(result.reflectionQuestions, "")}

            <h3 style="margin:24px 0 8px;font-size:17px;">${isEnglish ? "Next steps" : "Próximos pasos"}</h3>
            ${htmlList(result.nextSteps, "")}

            <h3 style="margin:24px 0 8px;font-size:17px;">${isEnglish ? "Relevant services" : "Servicios relevantes"}</h3>
            ${htmlList(serviceLines, servicesEmpty)}

            <div style="margin-top:30px;border-left:5px solid #cc148c;border-radius:14px;background:#fbf8fc;padding:18px;color:#5f536a;line-height:1.65;">
              <p style="margin:0 0 10px;">${escapeHtml(disclaimer)}</p>
              <p style="margin:0;">${escapeHtml(privacy)}</p>
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
