import { z } from "zod";
import englishQuizData from "@/lib/data/anchors.en.json";
import spanishQuizData from "@/lib/data/anchors.json";

const questionIds = new Set(spanishQuizData.questions.map((question) => String(question.id)));
const anchorIds = new Set(spanishQuizData.anchors.map((anchor) => anchor.id));

export const CAREER_ANCHOR_INSTRUMENT_VERSION = "schein-career-anchors-40-v1";
export const CAREER_ANCHOR_ALGORITHM_VERSION = "senda-career-anchor-score-v1";

export const careerAnchorLocaleSchema = z.enum(["es", "en"]);
export const careerStageSchema = z.enum([
  "exploring_direction",
  "changing_employment",
  "independent_project",
  "leadership_company",
  "specific_challenge",
  "choosing_education",
  "other",
  "prefer_not_to_say",
]);

export const careerAnchorPartialStatementAnswersSchema = z
  .record(z.string(), z.number().int().min(1).max(6))
  .superRefine((answers, context) => {
    const answerIds = Object.keys(answers);
    if (answerIds.length > questionIds.size || answerIds.some((id) => !questionIds.has(id))) {
      context.addIssue({
        code: "custom",
        message: "Answers may only contain known diagnostic statements.",
      });
    }
  });

export const careerAnchorPartialFinalSelectionSchema = z
  .array(z.number().int().positive())
  .max(3)
  .superRefine((selection, context) => {
    const uniqueIds = new Set(selection.map(String));
    if (uniqueIds.size !== selection.length || [...uniqueIds].some((id) => !questionIds.has(id))) {
      context.addIssue({
        code: "custom",
        message: "Final selection may only contain unique diagnostic statements.",
      });
    }
  });

export const careerAnchorProgressRequestSchema = z
  .object({
    answers: careerAnchorPartialStatementAnswersSchema,
    bonus: careerAnchorPartialFinalSelectionSchema.optional().default([]),
    currentStatement: z.number().int().min(1).max(40),
    clientRevision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    locale: z.enum(["es", "en"]).optional().default("es"),
    careerStage: careerStageSchema.optional().default("prefer_not_to_say"),
  })
  .strict();

export const careerAnchorStoredScoreSchema = z
  .array(
    z
      .object({
        id: z.string().min(1),
        name: z.string().min(1),
        score: z.number().int().nonnegative(),
        mean: z.number().nonnegative(),
        rank: z.number().int().min(1).max(spanishQuizData.anchors.length),
      })
      .strict(),
  )
  .length(spanishQuizData.anchors.length)
  .superRefine((ranking, context) => {
    const storedAnchorIds = new Set(ranking.map((anchor) => anchor.id));
    const storedRanks = new Set(ranking.map((anchor) => anchor.rank));
    const hasEveryAnchor =
      storedAnchorIds.size === anchorIds.size &&
      [...anchorIds].every((anchorId) => storedAnchorIds.has(anchorId));
    const hasEveryRank =
      storedRanks.size === spanishQuizData.anchors.length &&
      ranking.every((anchor) => storedRanks.has(anchor.rank));

    if (!hasEveryAnchor || !hasEveryRank) {
      context.addIssue({
        code: "custom",
        message: "Stored score must contain every career anchor and rank exactly once.",
      });
    }
  });

export const careerAnchorRawAnswersSchema = z
  .object({
    answers: z.record(z.string(), z.number().int().min(1).max(6)),
    bonus: z.array(z.number().int().positive()).length(3),
  })
  .strict()
  .superRefine((value, context) => {
    const answerIds = Object.keys(value.answers);
    if (answerIds.length !== questionIds.size || answerIds.some((id) => !questionIds.has(id))) {
      context.addIssue({
        code: "custom",
        path: ["answers"],
        message: "Answers must contain every diagnostic statement exactly once.",
      });
    }

    const uniqueBonusIds = new Set(value.bonus.map(String));
    if (uniqueBonusIds.size !== 3 || [...uniqueBonusIds].some((id) => !questionIds.has(id))) {
      context.addIssue({
        code: "custom",
        path: ["bonus"],
        message: "Final selection must contain three unique diagnostic statements.",
      });
    }
  });

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
    rawAnswers: careerAnchorRawAnswersSchema,
    captchaToken: z.string().trim().min(1).max(4096).optional(),
    locale: careerAnchorLocaleSchema.optional().default("es"),
  })
  .strict();

export const careerAnchorInterpretRequestSchema = z
  .object({
    rawAnswers: careerAnchorRawAnswersSchema,
    careerStage: careerStageSchema,
    locale: careerAnchorLocaleSchema.optional().default("es"),
  })
  .strict();

export const careerServiceSlugSchema = z.enum([
  "/transiciones-laborales/explorar-direccion",
  "/transiciones-laborales/cambiar-empleo",
  "/transiciones-laborales/proyecto-propio",
  "/transiciones-laborales/liderazgo-empresa",
  "/transiciones-laborales/desafio-puntual",
  "/transiciones-laborales/elegir-formacion",
]);

const interpretationCoreSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    summary: z.string().trim().min(1).max(2_400),
    tensions: z.array(z.string().trim().min(1).max(600)).max(5),
    reflectionQuestions: z.array(z.string().trim().min(1).max(600)).min(3).max(5),
    stageConnection: z.string().trim().min(1).max(1_400),
    relevantServices: z
      .array(
        z
          .object({
            slug: careerServiceSlugSchema,
            label: z.string().trim().min(1).max(160),
            reason: z.string().trim().min(1).max(600),
          })
          .strict(),
      )
      .max(2),
    nextSteps: z.array(z.string().trim().min(1).max(600)).min(3).max(5),
  })
  .strict();

export const generatedCareerAnchorInterpretationSchema = interpretationCoreSchema;
export const careerAnchorInterpretationSchema = interpretationCoreSchema.extend({
  mode: z.enum(["ai", "fallback"]),
});

export type CareerAnchorAnalyzeRequest = z.infer<typeof careerAnchorAnalyzeRequestSchema>;
export type CareerAnchorInterpretRequest = z.infer<typeof careerAnchorInterpretRequestSchema>;
export type CareerAnchorInterpretation = z.infer<typeof careerAnchorInterpretationSchema>;
export type CareerAnchorStoredScore = z.infer<typeof careerAnchorStoredScoreSchema>;
export type CareerAnchor = { name: string };
export type CareerAnchorLocale = z.infer<typeof careerAnchorLocaleSchema>;
export type CareerServiceSlug = z.infer<typeof careerServiceSlugSchema>;
export type CareerStage = z.infer<typeof careerStageSchema>;

export type CareerAnchorRankingItem = {
  id: string;
  name: string;
  article: string;
  description: string;
  longDescription: string;
  questions: number[];
  score: number;
  mean: number;
  rank: number;
};

export type CareerAnchorResultGroups = {
  primary: CareerAnchorRankingItem[];
  secondary: CareerAnchorRankingItem[];
};

export function calculateCareerAnchorRanking(
  rawAnswers: CareerAnchorAnalyzeRequest["rawAnswers"],
  locale: CareerAnchorLocale = "es",
): CareerAnchorRankingItem[] {
  const bonusIds = new Set(rawAnswers.bonus);
  const quizData = locale === "en" ? englishQuizData : spanishQuizData;
  const scored = quizData.anchors.map((anchor, catalogIndex) => ({
    ...anchor,
    catalogIndex,
    score: anchor.questions.reduce(
      (total, questionId) =>
        total + (rawAnswers.answers[String(questionId)] ?? 0) + (bonusIds.has(questionId) ? 4 : 0),
      0,
    ),
  }));

  // Ties are broken deterministically by canonical catalog order rather than
  // left in place, so no two anchors ever share a displayed position.
  scored.sort(
    (left, right) => right.score - left.score || left.catalogIndex - right.catalogIndex,
  );

  return scored.map((anchor, index) => {
    const rank = index + 1;

    return {
      id: anchor.id,
      name: anchor.name,
      article: anchor.article,
      description: anchor.description,
      longDescription: anchor.longDescription,
      questions: anchor.questions,
      score: anchor.score,
      mean: anchor.score / anchor.questions.length,
      rank,
    };
  });
}

export function hydrateCareerAnchorStoredRanking(
  storedScore: CareerAnchorStoredScore,
  locale: CareerAnchorLocale = "es",
): CareerAnchorRankingItem[] {
  const parsedScore = careerAnchorStoredScoreSchema.parse(storedScore);
  const quizData = locale === "en" ? englishQuizData : spanishQuizData;
  const anchorsById = new Map(quizData.anchors.map((anchor) => [anchor.id, anchor]));

  return [...parsedScore]
    .sort((left, right) => left.rank - right.rank)
    .map((storedAnchor) => {
      const anchor = anchorsById.get(storedAnchor.id);
      if (!anchor) throw new Error("Stored career anchor is not present in the instrument catalog.");

      return {
        ...anchor,
        score: storedAnchor.score,
        mean: storedAnchor.mean,
        rank: storedAnchor.rank,
      };
    });
}

export function getCareerAnchorResultGroups(
  ranking: CareerAnchorRankingItem[],
): CareerAnchorResultGroups {
  const primary = ranking.filter((anchor) => anchor.rank === 1);
  const nextRank = ranking.find((anchor) => anchor.rank > 1)?.rank;
  const secondary = nextRank
    ? ranking.filter((anchor) => anchor.rank === nextRank)
    : [];

  return { primary, secondary };
}

export function calculateDominantCareerAnchor(
  rawAnswers: CareerAnchorAnalyzeRequest["rawAnswers"],
  locale: CareerAnchorLocale = "es",
): CareerAnchor {
  const dominant = calculateCareerAnchorRanking(rawAnswers, locale)[0];
  if (!dominant) {
    throw new Error("Career anchor catalog is empty.");
  }

  return { name: dominant.name };
}

const serviceCatalog = {
  es: {
    exploring_direction: {
      slug: "/transiciones-laborales/explorar-direccion",
      label: "Explorar una nueva dirección profesional",
    },
    changing_employment: {
      slug: "/transiciones-laborales/cambiar-empleo",
      label: "Preparar un cambio de empleo",
    },
    independent_project: {
      slug: "/transiciones-laborales/proyecto-propio",
      label: "Construir o reordenar un proyecto propio",
    },
    leadership_company: {
      slug: "/transiciones-laborales/liderazgo-empresa",
      label: "Pensar el liderazgo y la continuidad de una empresa",
    },
    specific_challenge: {
      slug: "/transiciones-laborales/desafio-puntual",
      label: "Abordar un desafío profesional puntual",
    },
    choosing_education: {
      slug: "/transiciones-laborales/elegir-formacion",
      label: "Elegir una formación para el próximo paso",
    },
    other: {
      slug: "/transiciones-laborales/desafio-puntual",
      label: "Abordar un desafío profesional puntual",
    },
  },
  en: {
    exploring_direction: {
      slug: "/transiciones-laborales/explorar-direccion",
      label: "Explore a new professional direction",
    },
    changing_employment: {
      slug: "/transiciones-laborales/cambiar-empleo",
      label: "Prepare for a job change",
    },
    independent_project: {
      slug: "/transiciones-laborales/proyecto-propio",
      label: "Build or reorganize an independent project",
    },
    leadership_company: {
      slug: "/transiciones-laborales/liderazgo-empresa",
      label: "Think through leadership and company continuity",
    },
    specific_challenge: {
      slug: "/transiciones-laborales/desafio-puntual",
      label: "Address a specific professional challenge",
    },
    choosing_education: {
      slug: "/transiciones-laborales/elegir-formacion",
      label: "Choose training for your next step",
    },
    other: {
      slug: "/transiciones-laborales/desafio-puntual",
      label: "Address a specific professional challenge",
    },
  },
} as const;

const stageLabels: Record<CareerAnchorLocale, Record<CareerStage, string>> = {
  es: {
    exploring_direction: "explorar una nueva dirección profesional",
    changing_employment: "preparar un cambio de empleo",
    independent_project: "construir o reordenar un proyecto propio",
    leadership_company: "pensar tu rol de liderazgo o la continuidad de una empresa",
    specific_challenge: "abordar un desafío profesional puntual",
    choosing_education: "elegir una formación para tu próximo paso",
    other: "ordenar otra situación profesional",
    prefer_not_to_say: "explorar tu momento profesional sin encasillarlo todavía",
  },
  en: {
    exploring_direction: "exploring a new professional direction",
    changing_employment: "preparing for a job change",
    independent_project: "building or reorganizing an independent project",
    leadership_company: "thinking through leadership or company continuity",
    specific_challenge: "addressing a specific professional challenge",
    choosing_education: "choosing training for your next step",
    other: "organizing another professional situation",
    prefer_not_to_say: "exploring your current professional moment without labeling it yet",
  },
};

export function buildCareerAnchorFallbackInterpretation(
  ranking: CareerAnchorRankingItem[],
  careerStage: CareerStage,
  locale: CareerAnchorLocale,
): CareerAnchorInterpretation {
  const { primary } = getCareerAnchorResultGroups(ranking);
  const primaryNames = primary.map((anchor) => anchor.name);
  const primaryText = primaryNames.join(locale === "en" ? " and " : " y ");
  const service =
    careerStage === "prefer_not_to_say" ? null : serviceCatalog[locale][careerStage];

  if (locale === "en") {
    return careerAnchorInterpretationSchema.parse({
      title:
        primaryNames.length > 1
          ? `A shared primary result: ${primaryText}`
          : `${primaryText} as a reference point`,
      summary: `Your responses place ${primaryText} at the top of your ranking. This suggests that these motivations and values may deserve particular attention when you evaluate work environments, roles, or decisions. The result is an orientation, not a fixed definition or a prescription.`,
      // The scoring protocol does not define a validated tension threshold.
      // Keep this empty rather than inventing a conflict from rank order alone.
      tensions: [],
      reflectionQuestions: [
        `Where in your current experience is ${primaryText} already present, and where is it missing?`,
        "What would you want to preserve even if your role, organization, or field changed?",
        "Which small experiment could give you better information before making a larger decision?",
      ],
      stageConnection: `You identified your current stage as ${stageLabels.en[careerStage]}. Your anchor ranking can help you compare alternatives within that situation, without assuming that one option is automatically right for you.`,
      relevantServices: service
        ? [
            {
              ...service,
              reason:
                "This path may provide a structured space to connect your current situation with your career history, criteria, and realistic alternatives.",
            },
          ]
        : [],
      nextSteps: [
        "Write down two recent work experiences: one that gave you energy and one that drained it.",
        "Compare one realistic alternative against your primary and secondary anchors.",
        "Treat this map as a starting point and revise it through reflection or a professional conversation if useful.",
      ],
      mode: "fallback",
    });
  }

  return careerAnchorInterpretationSchema.parse({
    title:
      primaryNames.length > 1
        ? `Un resultado principal compartido: ${primaryText}`
        : `${primaryText} como punto de referencia`,
    summary: `Tus respuestas ubican ${primaryText} en el primer lugar del ranking. Esto sugiere que esas motivaciones y valores merecen una atención especial cuando evaluás entornos, roles o decisiones laborales. El resultado es una orientación: no constituye una definición cerrada ni indica por sí solo qué deberías hacer.`,
    // El protocolo de puntuación no define un umbral validado de tensión.
    // Se deja vacío para no inferir conflictos solamente a partir del ranking.
    tensions: [],
    reflectionQuestions: [
      `¿Dónde aparece hoy ${primaryText} en tu experiencia y dónde sentís que falta?`,
      "¿Qué querrías preservar aunque cambien tu rol, la organización o el sector?",
      "¿Qué experiencia pequeña podría darte mejor información antes de tomar una decisión mayor?",
    ],
    stageConnection: `Identificaste tu momento actual como ${stageLabels.es[careerStage]}. El ranking de anclas puede ayudarte a comparar alternativas dentro de esa situación, sin suponer que existe una única opción correcta para vos.`,
    relevantServices: service
      ? [
          {
            ...service,
            reason:
              "Este recorrido puede ofrecer un espacio estructurado para relacionar tu situación con tu trayectoria, tus criterios y alternativas posibles.",
          },
        ]
      : [],
    nextSteps: [
      "Anotá dos experiencias laborales recientes: una que te haya dado energía y otra que te haya desgastado.",
      "Compará una alternativa concreta con tus anclas principales y secundarias.",
      "Usá este mapa como punto de partida y revisalo mediante reflexión o una conversación profesional si te resulta útil.",
    ],
    mode: "fallback",
  });
}
