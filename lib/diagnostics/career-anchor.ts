import { z } from "zod";
import englishQuizData from "@/lib/data/anchors.en.json";
import spanishQuizData from "@/lib/data/anchors.json";

const questionIds = new Set(spanishQuizData.questions.map((question) => String(question.id)));
const careerAnchorLocaleSchema = z.enum(["es", "en"]);

export const careerAnchorAnalyzeRequestSchema = z
  .object({
    userData: z
      .object({
        name: z.string().trim().min(2).max(120),
        age: z.coerce.number().int().min(18).max(90),
        occupation: z.string().trim().min(2).max(120),
        city: z.string().trim().min(2).max(120),
        country: z.string().trim().min(2).max(120),
      })
      .strict(),
    rawAnswers: z
      .object({
        answers: z.record(z.string(), z.number().int().min(1).max(6)),
        bonus: z.array(z.number().int().positive()).length(3),
      })
      .strict(),
    captchaToken: z.string().trim().min(1).max(4096).optional(),
    locale: careerAnchorLocaleSchema.optional().default("es"),
  })
  .strict()
  .superRefine((value, context) => {
    const answerIds = Object.keys(value.rawAnswers.answers);
    if (answerIds.length !== questionIds.size || answerIds.some((id) => !questionIds.has(id))) {
      context.addIssue({
        code: "custom",
        path: ["rawAnswers", "answers"],
        message: "Answers must contain every diagnostic question exactly once.",
      });
    }

    const uniqueBonusIds = new Set(value.rawAnswers.bonus.map(String));
    if (uniqueBonusIds.size !== 3 || [...uniqueBonusIds].some((id) => !questionIds.has(id))) {
      context.addIssue({
        code: "custom",
        path: ["rawAnswers", "bonus"],
        message: "Bonus selection must contain three unique diagnostic questions.",
      });
    }
  });

export type CareerAnchorAnalyzeRequest = z.infer<typeof careerAnchorAnalyzeRequestSchema>;
export type CareerAnchor = { name: string };
export type CareerAnchorLocale = z.infer<typeof careerAnchorLocaleSchema>;

export function calculateDominantCareerAnchor(
  rawAnswers: CareerAnchorAnalyzeRequest["rawAnswers"],
  locale: CareerAnchorLocale = "es",
): CareerAnchor {
  const bonusIds = new Set(rawAnswers.bonus);
  const quizData = locale === "en" ? englishQuizData : spanishQuizData;
  const ranked = quizData.anchors.map((anchor) => ({
    name: anchor.name,
    score: anchor.questions.reduce(
      (total, questionId) =>
        total + (rawAnswers.answers[String(questionId)] ?? 0) + (bonusIds.has(questionId) ? 4 : 0),
      0,
    ),
  }));

  ranked.sort((left, right) => right.score - left.score);
  const dominant = ranked[0];
  if (!dominant) {
    throw new Error("Career anchor catalog is empty.");
  }

  return { name: dominant.name };
}
