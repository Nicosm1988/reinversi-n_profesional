"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link, useRouter } from "@/navigation";
import englishQuizData from "@/lib/data/anchors.en.json";
import spanishQuizData from "@/lib/data/anchors.json";
import { PreQuizForm, type PreQuizData } from "@/components/forms/pre-quiz-form";
import { DiagnosticResultShareForm } from "@/components/forms/diagnostic-result-share-form";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { UniverseField } from "@/components/visual/universe-field";
import {
  buildCareerAnchorFallbackInterpretation,
  calculateCareerAnchorRanking,
  careerAnchorInterpretationSchema,
  getCareerAnchorResultGroups,
  type CareerAnchorInterpretation,
  type CareerAnchorRankingItem,
  type CareerStage,
} from "@/lib/diagnostics/career-anchor";

type Step = "intro" | "questions" | "transition" | "bonus" | "pre-quiz" | "results";

type AiDiagnosticResult = {
  title: string;
  summary: string;
  frictionAreas: string[];
  idealEcosystem: string;
  strategicQuestion: string;
};

export type ExistingCareerDiagnostic = {
  userData?: Omit<PreQuizData, "captchaToken">;
  rawAnswers: {
    answers: Record<string, number>;
    bonus: number[];
  };
  aiFeedback?: AiDiagnosticResult;
};

type QuizQuestion = {
  id: number;
  text: string;
};

const careerStageOptions: Array<{
  value: CareerStage;
  labelKey:
    | "contextOptionExploringDirection"
    | "contextOptionChangingEmployment"
    | "contextOptionIndependentProject"
    | "contextOptionLeadershipCompany"
    | "contextOptionSpecificChallenge"
    | "contextOptionChoosingEducation"
    | "contextOptionOther"
    | "contextOptionPreferNot";
}> = [
  { value: "exploring_direction", labelKey: "contextOptionExploringDirection" },
  { value: "changing_employment", labelKey: "contextOptionChangingEmployment" },
  { value: "independent_project", labelKey: "contextOptionIndependentProject" },
  { value: "leadership_company", labelKey: "contextOptionLeadershipCompany" },
  { value: "specific_challenge", labelKey: "contextOptionSpecificChallenge" },
  { value: "choosing_education", labelKey: "contextOptionChoosingEducation" },
  { value: "other", labelKey: "contextOptionOther" },
  { value: "prefer_not_to_say", labelKey: "contextOptionPreferNot" },
];

const warmCardClass =
  "overflow-hidden border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-raised)_95%,transparent)] shadow-[0_30px_82px_-54px_var(--quiz-shadow)] backdrop-blur-sm";
const longFormCardClass =
  "w-full max-w-full border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-raised)_95%,transparent)] shadow-[0_30px_82px_-54px_var(--quiz-shadow)] backdrop-blur-sm";
const warmPrimaryButtonClass =
  "rounded-full border-[var(--senda-action)] bg-[var(--senda-action)] text-white shadow-[0_18px_40px_-20px_var(--quiz-shadow)] hover:border-[var(--senda-action-hover)] hover:bg-[var(--senda-action-hover)]";
const warmSecondaryButtonClass =
  "rounded-full border-[var(--quiz-border)] bg-[var(--quiz-surface-raised)] text-[var(--quiz-ink)] shadow-[0_18px_36px_-28px_var(--quiz-shadow)] hover:bg-[var(--quiz-choice-hover)]";
const warmSectionEyebrowClass = "font-semibold uppercase tracking-[0.18em] text-[var(--quiz-accent)]";

type CareerQuizProps = {
  userEmail?: string | null;
  existingDiagnostic?: ExistingCareerDiagnostic | null;
  startAtQuestions?: boolean;
  /**
   * Public mode skips login, CAPTCHA, Supabase and the identifying pre-quiz.
   * The ranking is calculated locally; an optional server call may enrich it
   * without persisting answers or receiving personal data.
   */
  publicMode?: boolean;
  /**
   * Authenticated visitors use the same no-PII experience while the existing
   * server/Supabase one-attempt rule is recorded atomically.
   */
  persistAuthenticatedAttempt?: boolean;
};

const COMPLETED_STORAGE_KEY = "reinvencion_career_anchor_completed";

export function CareerQuiz({
  userEmail,
  existingDiagnostic = null,
  startAtQuestions = false,
  publicMode = false,
  persistAuthenticatedAttempt = false,
}: CareerQuizProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("CareerQuiz");
  const reduceMotion = useReducedMotion();
  const quizData = locale === "en" ? englishQuizData : spanishQuizData;
  const storedAnswers = existingDiagnostic
    ? Object.fromEntries(
        Object.entries(existingDiagnostic.rawAnswers.answers).map(([questionId, value]) => [Number(questionId), value]),
      )
    : {};
  const [step, setStep] = useState<Step>(
    existingDiagnostic ? "results" : startAtQuestions ? "questions" : "intro",
  );
  const [answers, setAnswers] = useState<Record<number, number>>(storedAnswers);
  const [bonusQuestions, setBonusQuestions] = useState<number[]>(existingDiagnostic?.rawAnswers.bonus ?? []);
  const [userData, setUserData] = useState<PreQuizData | null>(
    publicMode ? null : existingDiagnostic?.userData ?? null,
  );
  const [aiResult, setAiResult] = useState<AiDiagnosticResult | null>(
    publicMode ? null : existingDiagnostic?.aiFeedback ?? null,
  );
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">(
    existingDiagnostic ? "saved" : "idle",
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const careerStage: CareerStage = "prefer_not_to_say";
  const [interpretation, setInterpretation] = useState<CareerAnchorInterpretation | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [isRecordingAttempt, setIsRecordingAttempt] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [step, reduceMotion]);

  useEffect(() => {
    if (saveStatus === "saved") {
      window.localStorage.setItem(COMPLETED_STORAGE_KEY, "1");
    }
  }, [saveStatus]);

  useEffect(() => {
    if (step === "results") {
      resultsHeadingRef.current?.focus();
    }
  }, [step]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= quizData.questions.length;
  const unansweredCount = Math.max(quizData.questions.length - answeredCount, 0);
  const completionPercentage = Math.round((answeredCount / quizData.questions.length) * 100);

  const calculateResults = useMemo<CareerAnchorRankingItem[] | null>(() => {
    if (!allAnswered || bonusQuestions.length !== 3) return null;

    return calculateCareerAnchorRanking(
      {
        answers: Object.fromEntries(
          Object.entries(answers).map(([questionId, value]) => [String(questionId), value]),
        ),
        bonus: bonusQuestions,
      },
      locale === "en" ? "en" : "es",
    );
  }, [allAnswered, answers, bonusQuestions, locale]);

  const resultGroups = useMemo(
    () => getCareerAnchorResultGroups(calculateResults ?? []),
    [calculateResults],
  );

  const profileResults = useMemo(() => {
    if (!calculateResults?.length) return [];
    const thirdVisibleRank = calculateResults[Math.min(2, calculateResults.length - 1)]?.rank;
    return calculateResults.filter((anchor) => anchor.rank <= thirdVisibleRank);
  }, [calculateResults]);

  const leadingResults = calculateResults?.slice(0, 3) ?? [];
  const remainingResults = calculateResults?.slice(3) ?? [];

  const fallbackInterpretation = useMemo(
    () =>
      calculateResults
        ? buildCareerAnchorFallbackInterpretation(
            calculateResults,
            careerStage,
            locale === "en" ? "en" : "es",
          )
        : null,
    [calculateResults, careerStage, locale],
  );

  useEffect(() => {
    if (step !== "results" || !calculateResults || interpretation || isInterpreting) return;
    void requestPublicInterpretation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, calculateResults, interpretation, isInterpreting]);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  };

  const handleBonusToggle = (questionId: number) => {
    setCompletionError(null);
    setBonusQuestions((previous) => {
      if (previous.includes(questionId)) {
        return previous.filter((id) => id !== questionId);
      }

      if (previous.length < 3) {
        return [...previous, questionId];
      }

      return previous;
    });
  };

  const finishBonusSelection = async () => {
    if (!publicMode) {
      setStep("pre-quiz");
      return;
    }

    if (!persistAuthenticatedAttempt) {
      setStep("results");
      return;
    }

    setIsRecordingAttempt(true);
    setCompletionError(null);
    setStep("results");

    try {
      const response = await fetch("/api/diagnostics/complete-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawAnswers: { answers, bonus: bonusQuestions },
          locale: locale === "en" ? "en" : "es",
        }),
      });
      const responseBody: unknown = await response.json().catch(() => null);

      if (
        response.status === 409 &&
        responseBody &&
        typeof responseBody === "object" &&
        "code" in responseBody &&
        responseBody.code === "already_completed"
      ) {
        window.location.reload();
        return;
      }

      if (!response.ok) {
        setCompletionError(t("completionUnavailable"));
        return;
      }

      setSaveStatus("saved");
      setStep("results");
    } catch {
      setCompletionError(t("completionUnavailable"));
    } finally {
      setIsRecordingAttempt(false);
    }
  };

  const requestPublicInterpretation = async () => {
    if (!calculateResults || !fallbackInterpretation || isInterpreting) return;

    setInterpretation(null);
    setIsInterpreting(true);

    try {
      const response = await fetch("/api/diagnostics/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawAnswers: {
            answers: Object.fromEntries(
              Object.entries(answers).map(([questionId, value]) => [String(questionId), value]),
            ),
            bonus: bonusQuestions,
          },
          careerStage,
          locale: locale === "en" ? "en" : "es",
        }),
      });
      const responseBody: unknown = await response.json().catch(() => null);
      const parsed = careerAnchorInterpretationSchema.safeParse(responseBody);

      if (!response.ok || !parsed.success) {
        setInterpretation(fallbackInterpretation);
        return;
      }

      setInterpretation(parsed.data);
    } catch {
      setInterpretation(fallbackInterpretation);
    } finally {
      setIsInterpreting(false);
    }
  };

  const submitAndAnalyze = async (data: PreQuizData) => {
    const { captchaToken, ...safeUserData } = data;
    const dominantAnchor = calculateResults?.[0];

    setUserData(safeUserData);
    setAiResult(null);
    setAnalysisError(null);
    setSaveStatus("idle");
    setIsAnalyzing(true);
    setStep("results");

    if (!dominantAnchor) {
      setAnalysisError(t("calculateError"));
      setIsAnalyzing(false);
      return;
    }

    try {
      const analyzeResponse = await fetch("/api/diagnostics/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData: safeUserData,
          rawAnswers: {
            answers,
            bonus: bonusQuestions,
          },
          captchaToken,
          locale,
        }),
      });

      const aiData = await analyzeResponse.json();
      if (!analyzeResponse.ok) {
        if (analyzeResponse.status === 401) {
          const currentPath = window.location.pathname;
          const loginPath = currentPath.startsWith("/en") ? "/en/login" : "/login";
          window.location.assign(`${loginPath}?next=${encodeURIComponent(currentPath)}&reason=auth-required`);
          return;
        }

        if (analyzeResponse.status === 409 && aiData?.code === "DIAGNOSTIC_ALREADY_COMPLETED") {
          window.location.reload();
          return;
        }

        throw new Error(aiData?.error ?? t("analyzeRequestError"));
      }

      setAiResult(aiData);
      setSaveStatus("saved");
    } catch (error) {
      console.error(error);
      setAnalysisError(
        t("analysisUnavailable"),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const focusStepHeading = () => {
    document.getElementById("career-quiz-step-heading")?.focus({ preventScroll: true });
  };

  return (
    <div className="career-quiz relative min-h-screen max-w-full overflow-x-clip bg-[var(--quiz-bg)] transition-colors">
      <div className="career-quiz__background pointer-events-none absolute inset-0" />
      <UniverseField className="left-[36%] text-[var(--senda-olive)] opacity-10 dark:opacity-15" />
      <div className="pointer-events-none absolute left-[-8%] top-16 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--quiz-accent)_12%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] top-24 h-[28rem] w-[28rem] rounded-full bg-[color-mix(in_srgb,var(--senda-gold)_10%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--quiz-surface)_8%,transparent)] blur-3xl" />

      <Container className="relative z-10">
        <div className={`mx-auto min-w-0 max-w-5xl pt-28 md:pt-32 ${step === "results" ? "pb-28 md:pb-32" : "pb-12 md:pb-20"}`}>
          <h1 className="sr-only">{t("metadataTitle")}</h1>
          <MotionConfig reducedMotion="user">
            <AnimatePresence mode="wait">
              {step === "intro" && (
                <motion.div
                key="intro"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                onAnimationComplete={focusStepHeading}
                className="space-y-8"
              >
                <div className="space-y-6 text-center">
                  <div className="inline-flex items-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] px-4 py-2 text-sm font-medium text-[var(--quiz-accent)]">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t("introBadge")}
                  </div>

                  <Heading
                    id="career-quiz-step-heading"
                    level="h2"
                    tabIndex={-1}
                    className="text-4xl text-[var(--quiz-ink)] outline-none md:text-5xl"
                  >
                    {t("introTitle")}
                  </Heading>

                  <Text variant="lead" className="mx-auto max-w-3xl text-[var(--quiz-muted)]">
                    {t("introLead")}
                  </Text>
                </div>

                <Card className={warmCardClass}>
                  <CardContent className="grid gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
                    <div className="space-y-5 text-left">
                      <Text variant="lead" className="font-semibold text-[var(--quiz-ink)]">
                        {t("introSubtitle")}
                      </Text>
                      <Text>{t("introParagraph1")}</Text>
                      <Text>{t("introParagraph2")}</Text>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-raised)] p-4">
                          <Text variant="small" className="font-semibold text-[var(--quiz-ink)]">
                            {t("introBlocksTitle")}
                          </Text>
                          <Text variant="small" className="mt-1 text-[var(--quiz-muted)]">
                            {t("introBlocksText")}
                          </Text>
                        </div>
                        <div className="rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-accent)] p-4">
                          <Text variant="small" className="font-semibold text-[var(--quiz-accent)]">
                            {t("introSessionTitle")}
                          </Text>
                          <Text variant="small" className="mt-1 text-[var(--quiz-muted)]">
                            {t("introSessionText")}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-[28px] border border-[var(--quiz-border)] bg-gradient-to-br from-[var(--quiz-surface-raised)] via-[var(--quiz-surface-soft)] to-[var(--quiz-surface-warm)] p-6">
                      <Text variant="small" className={warmSectionEyebrowClass}>
                        {t("introTakeawaysTitle")}
                      </Text>
                      <div className="space-y-4">
                        {[
                          t("introTakeawayRanking"),
                          t("introTakeawayTopThree"),
                          t("introTakeawayPersonalized"),
                        ].map((item) => (
                          <div key={item} className="flex gap-3">
                            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--quiz-accent-soft)] text-[var(--quiz-accent)]">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <Text variant="small" className="text-[var(--quiz-muted)]">
                              {item}
                            </Text>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--quiz-accent)_42%,transparent)] bg-[var(--quiz-surface)] p-4">
                        <Text variant="small" className="font-semibold text-[var(--quiz-ink)]">
                          {t("introEstimatedTitle")}
                        </Text>
                        <Text variant="small" className="mt-1 text-[var(--quiz-muted)]">
                          {t("introEstimatedText")}
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-accent)] p-5 text-center">
                  <Text variant="small" className="text-[var(--quiz-ink)]">
                    {t("introPaceNote")}
                  </Text>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    variant="default"
                    className={`h-14 px-12 text-lg ${warmPrimaryButtonClass}`}
                    onClick={() => setStep("questions")}
                  >
                    {t("introCta")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "questions" && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                onAnimationComplete={focusStepHeading}
                className="w-full min-w-0 max-w-full"
              >
                <Card className={longFormCardClass}>
                  <CardHeader className="space-y-4 border-b border-[var(--quiz-border-soft)] bg-gradient-to-r from-[var(--quiz-surface-soft)] via-[var(--quiz-surface-raised)] to-[var(--quiz-surface-warm)] pb-6">
                    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 space-y-2">
                        <Text variant="small" className={warmSectionEyebrowClass}>
                          {t("questionsBlock")}
                        </Text>
                        <CardTitle
                          id="career-quiz-step-heading"
                          tabIndex={-1}
                          className="max-w-full text-2xl outline-none [overflow-wrap:anywhere] md:text-3xl"
                        >
                          {t("questionsRange")}
                        </CardTitle>
                        <CardDescription className="max-w-2xl text-base [overflow-wrap:anywhere]">
                          {t("questionsScaleDesc")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <div
                    className="sticky top-[88px] z-30 mx-3 mt-3 max-w-full rounded-2xl border border-[color-mix(in_srgb,var(--quiz-accent)_45%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--quiz-surface-raised)_94%,transparent)] p-4 shadow-[0_18px_42px_-28px_var(--quiz-shadow)] backdrop-blur-xl sm:mx-6 md:mx-8"
                    data-testid="career-anchor-progress"
                  >
                    <div className="mb-2 flex min-w-0 items-center justify-between gap-3 text-sm font-semibold text-[var(--quiz-ink)]">
                      <span className="min-w-0 [overflow-wrap:anywhere]">{t("questionsGeneralProgress")}</span>
                      <span className="shrink-0 tabular-nums" aria-live="polite">
                        {t("questionsProgress", {
                          answered: answeredCount,
                          total: quizData.questions.length,
                        })}
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={t("questionsGeneralProgress")}
                      aria-valuemin={0}
                      aria-valuemax={quizData.questions.length}
                      aria-valuenow={answeredCount}
                      aria-valuetext={`${completionPercentage}%`}
                      className="h-3 overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--quiz-accent)_18%,transparent)] bg-[var(--quiz-accent-soft)]"
                    >
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--quiz-accent-strong)] via-[var(--quiz-accent)] to-[var(--senda-accent-soft)] shadow-[0_0_18px_color-mix(in_srgb,var(--quiz-accent)_48%,transparent)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--quiz-muted)]">
                      <span aria-live="polite">
                        {allAnswered
                          ? t("questionsComplete")
                          : t("questionsRemaining", { count: unansweredCount })}
                      </span>
                      <span className="shrink-0 font-bold tabular-nums text-[var(--quiz-accent)]">
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>

                  <CardContent
                    className="space-y-5 p-4 pt-6 sm:p-6 sm:pt-6 md:p-8 md:pt-8"
                    data-testid="career-anchor-question-list"
                  >
                    {quizData.questions.map((question: QuizQuestion) => (
                      <fieldset
                        key={question.id}
                        className="m-0 min-w-0 max-w-full overflow-hidden rounded-[24px] border border-[var(--quiz-border-soft)] bg-gradient-to-br from-[var(--quiz-surface)] to-[var(--quiz-surface-soft)] p-4 shadow-sm sm:p-5"
                      >
                        <legend className="sr-only">
                          {question.id}. {question.text}
                        </legend>
                        <div className="mb-4 flex min-w-0 max-w-full items-start gap-3 sm:gap-4" aria-hidden="true">
                          <span
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                              answers[question.id] !== undefined
                                ? "bg-[var(--senda-dark)] text-[var(--senda-light)]"
                                : "bg-[var(--quiz-accent-soft)] text-[var(--quiz-ink)]"
                            }`}
                          >
                            {question.id}
                          </span>
                          <Text
                            as="span"
                            className="min-w-0 max-w-full flex-1 text-base font-medium leading-relaxed text-[var(--quiz-ink)] [overflow-wrap:anywhere] sm:text-lg"
                          >
                            {question.text}
                          </Text>
                        </div>

                        <div className="grid min-w-0 max-w-full grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
                          {[1, 2, 3, 4, 5, 6].map((value) => (
                            <label
                              key={value}
                              className={`flex h-12 min-w-0 cursor-pointer items-center justify-center rounded-2xl border text-sm font-bold transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--quiz-accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--quiz-surface)] ${
                                answers[question.id] === value
                                  ? "scale-[1.03] border-[var(--quiz-accent)] bg-[var(--senda-dark)] text-[var(--senda-light)] shadow-md"
                                  : "border-[var(--quiz-border-soft)] bg-[var(--quiz-surface)] text-[var(--quiz-ink)] hover:border-[var(--quiz-accent)] hover:bg-[var(--quiz-choice-hover)]"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={value}
                                checked={answers[question.id] === value}
                                onChange={() => handleAnswer(question.id, value)}
                                className="sr-only"
                              />
                              {value}
                            </label>
                          ))}
                        </div>

                        <div className="mt-3 flex min-w-0 justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.2em]">
                          <span className="min-w-0 [overflow-wrap:anywhere]">{t("scaleNever")}</span>
                          <span className="min-w-0 text-right [overflow-wrap:anywhere]">{t("scaleAlways")}</span>
                        </div>
                      </fieldset>
                    ))}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4 border-t border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-muted)] p-6">
                    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <Button
                        variant="outline"
                        className={warmSecondaryButtonClass}
                        onClick={() => {
                          if (startAtQuestions) {
                            router.push("/");
                            return;
                          }
                          setStep("intro");
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("questionsBackToStart")}
                      </Button>

                      <Button
                        variant="default"
                        className={`px-8 ${warmPrimaryButtonClass}`}
                        disabled={!allAnswered}
                        onClick={() => setStep("transition")}
                      >
                        {t("questionsContinue")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {!allAnswered && (
                      <Text variant="small" className="text-center text-muted-foreground">
                        {t("questionsIncomplete")}
                      </Text>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === "transition" && (
              <motion.div
                key="transition"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                onAnimationComplete={focusStepHeading}
                className="space-y-8 py-12 text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--quiz-surface-warm)] text-[var(--quiz-accent)] shadow-[0_18px_40px_-24px_var(--quiz-shadow)]">
                  <Sparkles className="h-10 w-10" />
                </div>

                <div className="space-y-4">
                  <Heading
                    id="career-quiz-step-heading"
                    level="h2"
                    tabIndex={-1}
                    className="text-3xl text-[var(--quiz-ink)] outline-none md:text-4xl"
                  >
                    {t("transitionTitle")}
                  </Heading>
                  <Text variant="lead" className="mx-auto max-w-3xl text-[var(--quiz-muted)]">
                    {t("transitionSubtitle")}
                  </Text>
                </div>

                <Card className="mx-auto max-w-3xl border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-soft)_95%,transparent)] shadow-[0_28px_80px_-42px_var(--quiz-shadow)]">
                  <CardContent className="space-y-5 p-8 text-left">
                    <Text>
                      {t.rich("transitionInstruction", {
                        strong: (chunks) => <strong>{chunks}</strong>,
                      })}
                    </Text>
                    <Text>{t("transitionNote")}</Text>
                    <Text variant="small" className="text-muted-foreground">
                      {t("transitionReminder")}
                    </Text>
                  </CardContent>
                </Card>

                <Button
                  size="lg"
                  variant="default"
                  className={`h-14 px-12 text-lg ${warmPrimaryButtonClass}`}
                  onClick={() => setStep("bonus")}
                >
                  {t("transitionCta")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === "bonus" && (
              <motion.div
                key="bonus"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                onAnimationComplete={focusStepHeading}
                className="w-full min-w-0 max-w-full"
              >
                <Card className={longFormCardClass}>
                  <CardHeader className="space-y-4 border-b border-[var(--quiz-border-soft)] bg-gradient-to-r from-[var(--quiz-surface-soft)] via-[var(--quiz-surface-raised)] to-[var(--quiz-surface-warm)] pb-6">
                    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 space-y-2">
                        <Text variant="small" className={warmSectionEyebrowClass}>
                          {t("bonusTitle")}
                        </Text>
                        <CardTitle
                          id="career-quiz-step-heading"
                          tabIndex={-1}
                          className="max-w-full text-2xl outline-none [overflow-wrap:anywhere] md:text-3xl"
                        >
                          {t("bonusRange")}
                        </CardTitle>
                        <CardDescription className="max-w-2xl text-base [overflow-wrap:anywhere]">
                          {t("bonusSubtitle")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <div
                    className="sticky top-[88px] z-30 mx-3 mt-3 flex min-w-0 max-w-full items-center justify-between gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--quiz-accent)_45%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--quiz-surface-raised)_94%,transparent)] p-4 shadow-[0_18px_42px_-28px_var(--quiz-shadow)] backdrop-blur-xl sm:mx-6 md:mx-8"
                    data-testid="career-anchor-priority-progress"
                  >
                    <div className="min-w-0">
                      <Text variant="small" className="font-semibold text-[var(--quiz-ink)]">
                        {t("bonusSelectedLabel")}
                      </Text>
                      <Text variant="small" className="mt-0.5 max-w-2xl text-[var(--quiz-muted)] [overflow-wrap:anywhere]" aria-live="polite">
                        {bonusQuestions.length === 3
                          ? t("bonusSelectionComplete")
                          : t("bonusRemaining", { count: 3 - bonusQuestions.length })}
                      </Text>
                    </div>
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold tabular-nums transition-colors ${
                        bonusQuestions.length === 3
                          ? "border-[var(--quiz-accent)] bg-[var(--quiz-accent)] text-white"
                          : "border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-[var(--quiz-ink)]"
                      }`}
                      aria-label={t("bonusSelectedDetail", { count: bonusQuestions.length })}
                    >
                      {bonusQuestions.length}/3
                    </div>
                  </div>

                  <CardContent
                    className="space-y-4 p-4 pt-6 sm:p-6 sm:pt-6 md:p-8 md:pt-8"
                    data-testid="career-anchor-priority-list"
                  >
                    {quizData.questions.map((question: QuizQuestion) => {
                      const selected = bonusQuestions.includes(question.id);
                      const disabled = !selected && bonusQuestions.length >= 3;

                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => handleBonusToggle(question.id)}
                          disabled={disabled}
                          aria-pressed={selected}
                          className={`flex min-w-0 max-w-full items-start gap-3 overflow-hidden rounded-[24px] border p-4 text-left transition-[color,background-color,border-color,box-shadow,transform] sm:gap-4 sm:p-5 ${
                            selected
                              ? "border-[var(--quiz-accent)] bg-[var(--quiz-surface-warm)] shadow-[0_16px_34px_-28px_var(--quiz-shadow)]"
                              : "border-[var(--quiz-border-soft)] bg-gradient-to-br from-[var(--quiz-surface)] to-[var(--quiz-surface-soft)] hover:border-[var(--quiz-accent)]"
                          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                          <div
                            className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-[var(--senda-dark)] bg-[var(--senda-dark)] text-[var(--senda-light)]"
                                : "border-[var(--quiz-border)] text-[var(--quiz-muted)]"
                            }`}
                          >
                            {selected ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{question.id}</span>}
                          </div>
                          <Text variant="small" className="min-w-0 max-w-full flex-1 leading-relaxed text-foreground/85 [overflow-wrap:anywhere]">
                            {question.text}
                          </Text>
                        </button>
                      );
                    })}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4 border-t border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-muted)] p-6">
                    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <Button
                        variant="outline"
                        className={warmSecondaryButtonClass}
                        onClick={() => setStep("transition")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("bonusBack")}
                      </Button>

                      <Button
                        variant="default"
                        className={`px-8 ${warmPrimaryButtonClass}`}
                        disabled={bonusQuestions.length !== 3 || isRecordingAttempt}
                        onClick={() => void finishBonusSelection()}
                      >
                        {isRecordingAttempt ? t("recordingAttempt") : t("bonusCta")}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    <Text variant="small" className="text-center text-muted-foreground">
                      {existingDiagnostic
                        ? t("responsesSaved")
                        : persistAuthenticatedAttempt
                          ? t("responsesWillBeSaved")
                          : t("responsesPrivate")}
                    </Text>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === "pre-quiz" && !publicMode && (
              <motion.div
                key="pre-quiz"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                onAnimationComplete={focusStepHeading}
                className="space-y-8"
              >
                <div className="space-y-3 text-center">
                  <Heading
                    id="career-quiz-step-heading"
                    level="h2"
                    tabIndex={-1}
                    className="text-[var(--quiz-ink)] outline-none"
                  >
                    {t("prequizTitle")}
                  </Heading>
                  <Text className="mx-auto max-w-2xl text-[var(--quiz-muted)]">
                    {t("prequizSubtitle")}
                  </Text>
                  <Text variant="small" className="text-[var(--quiz-muted)]">
                    {userEmail
                      ? t("prequizPrivacyWithEmail", { email: userEmail })
                      : t("prequizPrivacy")}
                  </Text>
                </div>

                <PreQuizForm onSubmit={submitAndAnalyze} />
              </motion.div>
            )}

            {step === "results" && calculateResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                onAnimationComplete={() => resultsHeadingRef.current?.focus()}
                className="space-y-12"
              >
                <div className="space-y-4 text-center">
                  <div className="inline-flex items-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] px-4 py-1.5 text-sm font-bold text-[var(--quiz-accent)]">
                    {t("resultsBadge")}
                  </div>
                  <h2
                    ref={resultsHeadingRef}
                    tabIndex={-1}
                    className="scroll-m-20 font-heading text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--quiz-ink)] outline-none md:text-4xl lg:text-h2"
                  >
                    {t("resultsTitle")}
                  </h2>
                  <Text className="mx-auto max-w-2xl italic text-[var(--quiz-muted)]">
                    {t("resultsScheinQuote")}
                  </Text>
                  <Button asChild size="lg" variant="default" className={`h-14 px-10 text-lg ${warmPrimaryButtonClass}`}>
                    <Link href="/contacto">{t("resultsCtaSession")}</Link>
                  </Button>
                </div>

                {completionError ? (
                  <Card className="border-[var(--quiz-border)] bg-[var(--quiz-danger-soft)] shadow-sm">
                    <CardContent className="py-5 text-center">
                      <Text role="status" className="text-[var(--quiz-danger)]">
                        {completionError}
                      </Text>
                    </CardContent>
                  </Card>
                ) : null}

                <Card
                  className="min-w-0 max-w-full border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-soft)_95%,transparent)] shadow-[0_28px_80px_-42px_var(--quiz-shadow)]"
                  data-testid="career-anchor-ranking"
                >
                  <CardHeader>
                    <CardTitle>{t("resultsRankingTitle")}</CardTitle>
                    <CardDescription>{t("resultsRankingDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent className="min-w-0 space-y-8 p-4 pt-0 sm:p-7 sm:pt-0">
                    <section
                      aria-labelledby="career-anchor-top-three-title"
                      className="min-w-0 max-w-full overflow-hidden rounded-[28px] border-2 border-[color-mix(in_srgb,var(--quiz-accent)_60%,var(--quiz-border))] bg-gradient-to-br from-[var(--quiz-surface-warm)] via-[var(--quiz-surface-accent)] to-[var(--quiz-surface-soft)] p-4 shadow-[0_24px_58px_-38px_var(--quiz-shadow)] sm:p-6"
                      data-testid="career-anchor-top-three"
                    >
                      <div className="mb-5 min-w-0 sm:mb-6">
                        <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--quiz-accent)] bg-[var(--quiz-surface-raised)] px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[var(--quiz-accent)]">
                          <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="min-w-0 [overflow-wrap:anywhere]">{t("resultsTopThreeBadge")}</span>
                        </div>
                        <h3
                          id="career-anchor-top-three-title"
                          className="font-heading text-2xl font-semibold leading-tight text-[var(--quiz-ink)] [overflow-wrap:anywhere] sm:text-3xl"
                        >
                          {t("resultsTopThreeTitle")}
                        </h3>
                        <Text className="mt-2 max-w-3xl text-[var(--quiz-muted)] [overflow-wrap:anywhere]">
                          {t("resultsTopThreeDescription")}
                        </Text>
                      </div>

                      <div className="grid min-w-0 gap-4">
                        {leadingResults.map((result, index) => {
                          const positionLabel =
                            index === 0
                              ? t("resultsDominant")
                              : index === 1
                                ? t("resultsSecondary")
                                : t("resultsThird");

                          return (
                            <div
                              key={result.id}
                              data-career-anchor-priority={result.rank}
                              className={`flex min-w-0 max-w-full items-start gap-3 overflow-hidden rounded-2xl border p-4 sm:items-center sm:gap-5 sm:p-5 ${
                                index === 0
                                  ? "border-[color-mix(in_srgb,var(--quiz-ink)_45%,transparent)] bg-[var(--quiz-surface-raised)] shadow-md"
                                  : index === 1
                                    ? "border-[var(--quiz-accent)] bg-[color-mix(in_srgb,var(--quiz-surface-accent)_82%,var(--quiz-surface-raised))] shadow-sm"
                                    : "border-[color-mix(in_srgb,var(--senda-gold)_72%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--senda-gold)_10%,var(--quiz-surface-raised))] shadow-sm"
                              }`}
                            >
                              <div
                                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-sm sm:h-14 sm:w-14 ${
                                  index === 0
                                    ? "bg-[var(--senda-dark)] text-[var(--senda-light)]"
                                    : index === 1
                                      ? "bg-[var(--senda-action)] text-white"
                                      : "bg-[var(--senda-gold)] text-[var(--senda-dark)]"
                                }`}
                                aria-hidden="true"
                              >
                                {result.rank}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                  <div className="min-w-0">
                                    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--quiz-accent)] [overflow-wrap:anywhere]">
                                      {positionLabel}
                                    </span>
                                    <span className="mt-0.5 block font-bold text-[var(--quiz-ink)] [overflow-wrap:anywhere] sm:text-lg">
                                      {result.name}
                                    </span>
                                  </div>
                                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--quiz-muted)]">
                                    {t("resultsScore", { score: result.score })}
                                  </span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--quiz-accent-soft)]">
                                  <motion.div
                                    className={`h-full rounded-full ${
                                      index === 0
                                        ? "bg-[var(--senda-dark)]"
                                        : index === 1
                                          ? "bg-[var(--quiz-accent)]"
                                          : "bg-[var(--senda-gold)]"
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(result.score / (calculateResults[0]?.score || 1)) * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.1 + index * 0.08 }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section aria-labelledby="career-anchor-remaining-title" className="min-w-0 max-w-full">
                      <div className="mb-4">
                        <h3
                          id="career-anchor-remaining-title"
                          className="font-heading text-xl font-semibold text-[var(--quiz-ink)]"
                        >
                          {t("resultsRemainingTitle")}
                        </h3>
                        <Text variant="small" className="mt-1 text-[var(--quiz-muted)]">
                          {t("resultsRemainingDescription")}
                        </Text>
                      </div>
                      <div className="grid min-w-0 gap-3">
                        {remainingResults.map((result, index) => (
                          <div
                            key={result.id}
                            className="flex min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface)] p-4 sm:gap-4"
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--quiz-accent-soft)] text-sm font-bold text-[var(--quiz-ink)]">
                              {result.rank}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                <span className="min-w-0 font-semibold text-[var(--quiz-ink)] [overflow-wrap:anywhere]">
                                  {result.name}
                                </span>
                                <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--quiz-muted)]">
                                  {t("resultsScore", { score: result.score })}
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-[var(--quiz-accent-soft)]">
                                <motion.div
                                  className="h-full rounded-full bg-[color-mix(in_srgb,var(--quiz-accent)_50%,var(--quiz-muted))]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(result.score / (calculateResults[0]?.score || 1)) * 100}%` }}
                                  transition={{ duration: 0.7, delay: 0.25 + index * 0.06 }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </CardContent>
                </Card>

                <Text variant="small" className="text-center text-[var(--quiz-muted)]">
                  {isRecordingAttempt
                    ? t("recordingAttempt")
                    : completionError
                      ? t("responsesNotSaved")
                      : saveStatus === "saved" || existingDiagnostic
                        ? t("responsesSaved")
                        : t("responsesPrivate")}
                </Text>

                <div className="space-y-8">
                  <Heading level="h3" className="text-[var(--quiz-ink)]">
                    {t("resultsProfileTitle")}
                  </Heading>

                  {profileResults.map((result, index) => (
                    <Card
                      key={result.id}
                      className={`overflow-hidden ${
                        index === 0
                          ? "border-[var(--quiz-border)] shadow-xl"
                          : index === 1
                            ? "border-[var(--quiz-accent)] shadow-lg"
                            : "border-[var(--quiz-border)] shadow-md"
                      }`}
                    >
                      <CardHeader className={index === 0 ? "bg-[var(--quiz-surface-warm)]" : index === 1 ? "bg-[var(--quiz-surface-accent)]" : "bg-[var(--quiz-surface-soft)]"}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-2xl font-bold text-[var(--quiz-ink)] shadow-sm">
                            #{result.rank}
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{result.name}</CardTitle>
                            <CardDescription>
                              {result.rank === 1
                                ? resultGroups.primary.length > 1
                                  ? t("resultsTiePrimary")
                                  : t("resultsDominant")
                                : resultGroups.secondary.filter(
                                      (anchor) => anchor.rank === result.rank,
                                    ).length > 1
                                  ? t("resultsTieSecondary")
                                  : index === 1
                                    ? t("resultsSecondary")
                                    : t("resultsThird")}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-8">
                        {(result.longDescription ?? "").split("\n\n").map((paragraph, paragraphIndex) => (
                          <Text key={`${result.id}-${paragraphIndex}`} className="leading-relaxed text-foreground/85">
                            {paragraph}
                          </Text>
                        ))}

                        {result.rank === 1 && (resultGroups.primary.length === 1 || index === 0) && (
                          <div className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] p-6">
                            <Text className="leading-relaxed">
                              {resultGroups.primary.length > 1
                                ? t("resultsTiePrimaryText", {
                                    names: resultGroups.primary.map((anchor) => anchor.name).join(" · "),
                                  })
                                : t.rich("resultsDominantText", {
                                    article: result.article,
                                    name: result.name,
                                    strong: (chunks) => <strong>{chunks}</strong>,
                                  })}
                            </Text>
                            <div className="mt-6">
                              <Button asChild size="lg" variant="default" className={`h-14 px-10 text-lg ${warmPrimaryButtonClass}`}>
                                <Link href="/contacto">{t("resultsCtaSession")}</Link>
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isInterpreting && (
                  <Card className="border-[var(--quiz-accent)] bg-[var(--quiz-surface-accent)] shadow-lg">
                    <CardContent className="space-y-4 py-8 text-center">
                      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--quiz-accent-soft)] border-t-[var(--quiz-accent)] motion-reduce:animate-none" />
                      <Heading level="h4" className="text-[var(--quiz-ink)]">
                        {t("interpretationLoadingTitle")}
                      </Heading>
                      <Text className="text-[var(--quiz-muted)]">
                        {t("interpretationLoadingText")}
                      </Text>
                    </CardContent>
                  </Card>
                )}

                {interpretation && !isInterpreting && (
                  <div className="space-y-6">
                    <div>
                      <Heading level="h3" className="text-[var(--quiz-ink)]">
                        {t("interpretationTitle")}
                      </Heading>
                    </div>

                    <Card className="overflow-hidden border-[var(--quiz-border)] bg-[var(--quiz-surface-soft)] shadow-xl">
                      <CardHeader className="bg-[var(--quiz-surface-warm)]">
                        <CardTitle className="text-2xl text-[var(--quiz-ink)]">
                          {interpretation.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-8 pt-8">
                        <Text className="leading-relaxed text-foreground/90">
                          {interpretation.summary}
                        </Text>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface-accent)] p-6">
                            <Heading level="h4" className="mb-4 text-lg text-[var(--quiz-accent)]">
                              {t("interpretationTensionsTitle")}
                            </Heading>
                            <ul className="space-y-3">
                              {interpretation.tensions.map((tension) => (
                                <li key={tension} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--quiz-muted)]">
                                  <span className="font-bold text-[var(--quiz-accent)]" aria-hidden="true">&bull;</span>
                                  <span>{tension}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-6">
                            <Heading level="h4" className="mb-4 text-lg text-[var(--quiz-ink)]">
                              {t("interpretationQuestionsTitle")}
                            </Heading>
                            <ul className="space-y-3">
                              {interpretation.reflectionQuestions.map((question) => (
                                <li key={question} className="text-sm leading-relaxed text-[var(--quiz-muted)]">
                                  {question}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-6">
                          <Heading level="h4" className="mb-3 text-lg text-[var(--quiz-ink)]">
                            {t("interpretationStageTitle")}
                          </Heading>
                          <Text className="leading-relaxed text-[var(--quiz-muted)]">
                            {interpretation.stageConnection}
                          </Text>
                        </div>

                        {interpretation.relevantServices.length > 0 ? (
                          <div>
                            <Heading level="h4" className="mb-4 text-lg text-[var(--quiz-ink)]">
                              {t("interpretationServicesTitle")}
                            </Heading>
                            <div className="grid gap-4 md:grid-cols-2">
                              {interpretation.relevantServices.map((service) => (
                                <Link
                                  key={service.slug}
                                  href={service.slug}
                                  className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] p-5 transition-colors hover:border-[var(--quiz-accent)]"
                                >
                                  <span className="font-semibold text-[var(--quiz-ink)]">{service.label}</span>
                                  <span className="mt-2 block text-sm leading-relaxed text-[var(--quiz-muted)]">
                                    {service.reason}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div>
                          <Heading level="h4" className="mb-4 text-lg text-[var(--quiz-ink)]">
                            {t("interpretationNextStepsTitle")}
                          </Heading>
                          <ol className="space-y-3">
                            {interpretation.nextSteps.map((nextStep, index) => (
                              <li key={nextStep} className="flex gap-3 text-sm leading-relaxed text-[var(--quiz-muted)]">
                                <span className="font-semibold text-[var(--quiz-accent)]">{index + 1}.</span>
                                <span>{nextStep}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {isAnalyzing && (
                  <Card className="border-[var(--quiz-accent)] bg-[var(--quiz-surface-accent)] shadow-lg">
                    <CardContent className="space-y-4 py-8 text-center">
                      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--quiz-accent-soft)] border-t-[var(--quiz-accent)] motion-reduce:animate-none" />
                      <Heading level="h4" className="text-[var(--quiz-ink)]">
                        {t("resultsAiLoadingTitle")}
                      </Heading>
                      <Text className="text-[var(--quiz-muted)]">
                        {t("resultsAiLoadingText", {
                          occupation: userData?.occupation ?? t("occupationUnknown"),
                        })}
                      </Text>
                    </CardContent>
                  </Card>
                )}

                {aiResult && !isAnalyzing && (
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <Heading level="h3" className="text-[var(--quiz-ink)]">
                        {t("resultsAiTitle")}
                      </Heading>
                      {saveStatus === "saved" && (
                        <div className="rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] px-4 py-2 text-sm font-semibold text-[var(--quiz-ink)]">
                          {t("resultsSaved")}
                        </div>
                      )}
                    </div>
                    <Card className="overflow-hidden border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-soft)_95%,transparent)] shadow-xl">
                      <CardHeader className="bg-[var(--quiz-surface-warm)]">
                        <CardTitle className="text-2xl text-[var(--quiz-ink)]">{aiResult.title}</CardTitle>
                        <CardDescription className="text-base text-foreground/80">
                          {t("resultsAiSubtitle", {
                            age: userData?.age ?? "",
                            occupation: userData?.occupation ?? t("occupationUnknown"),
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8 pt-8">
                        <Text className="leading-relaxed text-foreground/90">{aiResult.summary}</Text>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface-accent)] p-6">
                            <Heading level="h4" className="mb-4 text-lg text-[var(--quiz-accent)]">
                              {t("resultsFrictionTitle")}
                            </Heading>
                            <ul className="space-y-3">
                              {aiResult.frictionAreas.map((friction) => (
                                <li key={friction} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--quiz-muted)]">
                                  <span className="font-bold text-[var(--quiz-accent)]">&bull;</span>
                                  <span>{friction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface-soft)] p-6">
                            <Heading level="h4" className="mb-4 text-lg text-[var(--quiz-ink)]">
                              {t("resultsEcosystemTitle")}
                            </Heading>
                            <Text className="text-sm leading-relaxed text-[var(--quiz-muted)]">
                              {aiResult.idealEcosystem}
                            </Text>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-8 text-center">
                          <Text variant="lead" className="italic text-[var(--quiz-ink)] opacity-85">
                            &quot;{aiResult.strategicQuestion}&quot;
                          </Text>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {analysisError && !isAnalyzing && !aiResult && (
                  <Card className="border-[var(--quiz-border)] bg-[var(--quiz-danger-soft)] shadow-sm">
                    <CardContent className="py-6 text-center">
                      <Text className="text-[var(--quiz-danger)]">{analysisError}</Text>
                    </CardContent>
                  </Card>
                )}

                {fallbackInterpretation ? (
                  <DiagnosticResultShareForm
                    result={{
                      questionnaire: "career_anchors",
                      situation: t(
                        careerStageOptions.find((option) => option.value === careerStage)?.labelKey ??
                          "contextOptionPreferNot",
                      ),
                      recommendedService: (interpretation ?? fallbackInterpretation).relevantServices[0]?.label,
                      alternativeService: (interpretation ?? fallbackInterpretation).relevantServices[1]?.label,
                      primaryAnchors: resultGroups.primary.map((anchor) => anchor.name),
                      secondaryAnchors: resultGroups.secondary.map((anchor) => anchor.name),
                      summary: (interpretation ?? fallbackInterpretation).summary,
                    }}
                  />
                ) : null}

                <div className="space-y-8 py-6 text-center">
                  <div className="mx-auto max-w-2xl space-y-4">
                    <Heading level="h3" className="text-2xl text-[var(--quiz-ink)] md:text-3xl">
                      {t("resultsClosingTitle")}
                    </Heading>
                    <Text className="text-lg leading-relaxed text-[var(--quiz-muted)]">
                      {t("resultsClosingText")}
                    </Text>
                  </div>

                  <Button asChild size="lg" variant="default" className={`h-14 px-12 text-lg ${warmPrimaryButtonClass}`}>
                    <Link href="/contacto">{t("resultsClosingCta")}</Link>
                  </Button>

                  <Text className="text-sm text-[var(--quiz-muted)]">
                    {t("resultsDisclaimer")}
                  </Text>
                </div>
              </motion.div>
              )}
            </AnimatePresence>
          </MotionConfig>
        </div>
      </Container>

      {mounted && step === "results"
        ? createPortal(
            <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-raised)_96%,transparent)] px-4 py-3 shadow-[0_-18px_40px_-28px_var(--quiz-shadow)] backdrop-blur-sm">
              <Button asChild size="lg" variant="default" className={`h-12 w-full max-w-md px-8 ${warmPrimaryButtonClass}`}>
                <Link href="/contacto">{t("resultsCtaSession")}</Link>
              </Button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
