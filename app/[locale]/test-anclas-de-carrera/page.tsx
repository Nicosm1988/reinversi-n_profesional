import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import {
  CareerQuiz,
  type ExistingCareerDiagnostic,
} from "@/components/sections/career-quiz";
import {
  careerAnchorInterpretationSchema,
  careerAnchorPartialFinalSelectionSchema,
  careerAnchorPartialStatementAnswersSchema,
  careerAnchorStoredScoreSchema,
  careerStageSchema,
} from "@/lib/diagnostics/career-anchor";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

const CAREER_ANCHORS_PATH = "/test-anclas-de-carrera";

const storedDiagnosticSchema = z.object({
  status: z.enum(["in_progress", "processing", "completed"]),
  raw_answers: z.object({
    answers: careerAnchorPartialStatementAnswersSchema,
    bonus: careerAnchorPartialFinalSelectionSchema.optional().default([]),
  }),
  current_statement: z.number().int().min(1).max(40).nullable().optional(),
  progress_revision: z.number().int().nonnegative().nullable().optional(),
  user_data: z.unknown(),
  ai_feedback: z.unknown().nullable().optional(),
  result_ai: z.unknown().nullable().optional(),
  result_base: z.unknown().nullable().optional(),
  score_result: z.unknown().nullable().optional(),
  completed_at: z.string().nullable().optional(),
});

const storedContextSchema = z
  .object({ careerStage: careerStageSchema.optional().default("prefer_not_to_say") })
  .passthrough();

export async function generateMetadata(
  props: Readonly<{ params: Promise<{ locale: string }> }>,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "CareerQuiz" });
  const localizedPath = locale === "en" ? `/en${CAREER_ANCHORS_PATH}` : CAREER_ANCHORS_PATH;

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    alternates: {
      canonical: localizedPath,
      languages: {
        es: CAREER_ANCHORS_PATH,
        en: `/en${CAREER_ANCHORS_PATH}`,
        "x-default": CAREER_ANCHORS_PATH,
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function CareerAnchorsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ resultado?: string }> }>) {
  let auth: Awaited<ReturnType<typeof getAuthenticatedUser>>;
  try {
    auth = await getAuthenticatedUser();
  } catch {
    return (
      <CareerQuiz
        userEmail={null}
        existingDiagnostic={null}
        authState="unavailable"
      />
    );
  }

  if (!auth.ok) {
    return (
      <CareerQuiz
        userEmail={null}
        existingDiagnostic={null}
        authState={auth.reason === "auth-required" ? "anonymous" : "unavailable"}
      />
    );
  }

  const [{ data, error }, query] = await Promise.all([
    auth.supabase
    .from("user_diagnostics")
    .select(
      "status, raw_answers, current_statement, progress_revision, user_data, ai_feedback, result_ai, result_base, score_result, completed_at",
    )
    .eq("diagnostic_type", "career_anchor")
    .maybeSingle(),
    searchParams,
  ]);

  if (error) {
    return (
      <CareerQuiz
        userEmail={auth.user.email ?? null}
        existingDiagnostic={null}
        authState="unavailable"
      />
    );
  }

  const parsed = storedDiagnosticSchema.safeParse(data);
  if (data && !parsed.success) {
    return (
      <CareerQuiz
        userEmail={auth.user.email ?? null}
        existingDiagnostic={null}
        authState="unavailable"
      />
    );
  }
  const storedContext = parsed.success
    ? storedContextSchema.safeParse(parsed.data.user_data)
    : null;
  const storedInterpretation = parsed.success
    ? careerAnchorInterpretationSchema.safeParse(
        parsed.data.result_ai ?? parsed.data.ai_feedback,
      )
    : null;
  const storedScore = parsed.success
    ? careerAnchorStoredScoreSchema.safeParse(parsed.data.score_result)
    : null;
  const existingDiagnostic: ExistingCareerDiagnostic | null = parsed.success
    ? {
        status: parsed.data.status,
        rawAnswers: parsed.data.raw_answers,
        currentStatement: parsed.data.current_statement ?? 1,
        progressRevision: parsed.data.progress_revision ?? 0,
        careerStage:
          storedContext?.success
            ? storedContext.data.careerStage
            : "prefer_not_to_say",
        completedAt: parsed.data.completed_at,
        aiFeedback: storedInterpretation?.success ? storedInterpretation.data : null,
        scoreResult: storedScore?.success ? storedScore.data : null,
      }
    : null;

  return (
    <CareerQuiz
      userEmail={auth.user.email ?? null}
      existingDiagnostic={existingDiagnostic}
      authState="authenticated"
      showStoredResult={query.resultado === "1"}
    />
  );
}
