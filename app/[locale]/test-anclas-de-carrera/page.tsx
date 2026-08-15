import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import {
  CareerQuiz,
  type ExistingCareerDiagnostic,
} from "@/components/sections/career-quiz";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

const CAREER_ANCHORS_PATH = "/test-anclas-de-carrera";

const storedDiagnosticSchema = z.object({
  raw_answers: z.object({
    answers: z.record(z.string(), z.number()),
    bonus: z.array(z.number()),
  }),
});

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

export default async function CareerAnchorsPage() {
  // The anonymous experience stays public and independent from Supabase.
  // Authenticated accounts retain their server-side single-attempt result.
  const auth = await getAuthenticatedUser().catch(() => null);

  if (!auth?.ok) {
    return <CareerQuiz userEmail={null} existingDiagnostic={null} startAtQuestions publicMode />;
  }

  const { data } = await auth.supabase
    .from("user_diagnostics")
    .select("raw_answers")
    .eq("diagnostic_type", "career_anchor")
    .eq("status", "completed")
    .maybeSingle();

  const parsed = storedDiagnosticSchema.safeParse(data);
  const existingDiagnostic: ExistingCareerDiagnostic | null = parsed.success
    ? {
        rawAnswers: parsed.data.raw_answers,
      }
    : null;

  return (
    <CareerQuiz
      userEmail={auth.user.email ?? null}
      existingDiagnostic={existingDiagnostic}
      startAtQuestions
      publicMode
      persistAuthenticatedAttempt={!existingDiagnostic}
    />
  );
}
