import { CareerQuiz, type ExistingCareerDiagnostic } from "@/components/sections/career-quiz";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { z } from "zod";
import { canRepeatCareerAnchorTest } from "@/lib/diagnostics/access";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const storedDiagnosticSchema = z.object({
  user_data: z.object({
    name: z.string(),
    age: z.union([z.string(), z.number()]).transform(String),
    occupation: z.string(),
    city: z.string(),
    country: z.string(),
  }),
  raw_answers: z.object({
    answers: z.record(z.string(), z.number()),
    bonus: z.array(z.number()),
  }),
  ai_feedback: z.object({
    title: z.string(),
    summary: z.string(),
    frictionAreas: z.array(z.string()),
    idealEcosystem: z.string(),
    strategicQuestion: z.string(),
  }),
});

export async function generateMetadata(
  props: Readonly<{ params: Promise<{ locale: string }> }>,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "CareerQuiz" });

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function AnclaDeCarreraTestPage() {
  // The test is public: an active Supabase session (e.g. someone arriving
  // from the Panel to view/repeat a saved result) unlocks the persisted,
  // AI-assisted flow, but its absence never blocks taking the test.
  const auth = await getAuthenticatedUser();

  if (!auth.ok) {
    return <CareerQuiz userEmail={null} existingDiagnostic={null} startAtQuestions publicMode />;
  }

  const canRepeat = canRepeatCareerAnchorTest(auth.user.email);
  const { data } = canRepeat
    ? { data: null }
    : await auth.supabase
        .from("user_diagnostics")
        .select("user_data, raw_answers, ai_feedback")
        .eq("diagnostic_type", "career_anchor")
        .eq("status", "completed")
        .maybeSingle();

  const parsed = storedDiagnosticSchema.safeParse(data);
  const existingDiagnostic: ExistingCareerDiagnostic | null = parsed.success
    ? {
        userData: parsed.data.user_data,
        rawAnswers: parsed.data.raw_answers,
        aiFeedback: parsed.data.ai_feedback,
      }
    : null;

  return (
    <CareerQuiz
      userEmail={auth.user.email ?? null}
      existingDiagnostic={existingDiagnostic}
      startAtQuestions
    />
  );
}
