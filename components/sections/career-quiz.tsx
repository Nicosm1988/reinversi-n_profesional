"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "@/navigation";
import englishQuizData from "@/lib/data/anchors.en.json";
import spanishQuizData from "@/lib/data/anchors.json";
import { PreQuizForm, type PreQuizData } from "@/components/forms/pre-quiz-form";
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

type Step = "intro" | "questions" | "transition" | "bonus" | "pre-quiz" | "results";

type AiDiagnosticResult = {
  title: string;
  summary: string;
  frictionAreas: string[];
  idealEcosystem: string;
  strategicQuestion: string;
};

export type ExistingCareerDiagnostic = {
  userData: Omit<PreQuizData, "captchaToken">;
  rawAnswers: {
    answers: Record<string, number>;
    bonus: number[];
  };
  aiFeedback: AiDiagnosticResult;
};

type QuizQuestion = {
  id: number;
  text: string;
};

type QuizResult = {
  id: string;
  name: string;
  article: string;
  description: string;
  longDescription: string;
  questions: number[];
  score: number;
  mean: number;
};

const QUESTIONS_PER_PAGE = 10;

function chunkQuestions<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

const warmCardClass =
  "overflow-hidden border-[#d7c3ae] bg-[#f6efe7]/95 shadow-[0_28px_80px_-42px_rgba(17,24,39,0.55)] backdrop-blur-sm";
const warmPrimaryButtonClass =
  "rounded-full border-[#a84729] bg-[#bd5734] text-white shadow-[0_18px_40px_-18px_rgba(189,87,52,0.85)] hover:border-[#963f25] hover:bg-[#a84729]";
const warmSecondaryButtonClass =
  "rounded-full border-[#d4c0ad] bg-[#fbf5ee] text-[#2f3647] shadow-[0_18px_36px_-26px_rgba(47,54,71,0.45)] hover:bg-[#efe3d5]";
const warmSectionEyebrowClass = "font-semibold uppercase tracking-[0.18em] text-[#cf724e]";

type CareerQuizProps = {
  userEmail?: string | null;
  existingDiagnostic?: ExistingCareerDiagnostic | null;
};

export function CareerQuiz({ userEmail, existingDiagnostic = null }: CareerQuizProps) {
  const locale = useLocale();
  const t = useTranslations("CareerQuiz");
  const quizData = locale === "en" ? englishQuizData : spanishQuizData;
  const questionPages = useMemo(
    () => chunkQuestions(quizData.questions, QUESTIONS_PER_PAGE),
    [quizData.questions],
  );
  const storedAnswers = existingDiagnostic
    ? Object.fromEntries(
        Object.entries(existingDiagnostic.rawAnswers.answers).map(([questionId, value]) => [Number(questionId), value]),
      )
    : {};
  const [step, setStep] = useState<Step>(existingDiagnostic ? "results" : "intro");
  const [answers, setAnswers] = useState<Record<number, number>>(storedAnswers);
  const [bonusQuestions, setBonusQuestions] = useState<number[]>(existingDiagnostic?.rawAnswers.bonus ?? []);
  const [userData, setUserData] = useState<PreQuizData | null>(existingDiagnostic?.userData ?? null);
  const [aiResult, setAiResult] = useState<AiDiagnosticResult | null>(existingDiagnostic?.aiFeedback ?? null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">(
    existingDiagnostic ? "saved" : "idle",
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questionPageIndex, setQuestionPageIndex] = useState(0);
  const [bonusPageIndex, setBonusPageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, questionPageIndex, bonusPageIndex]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= quizData.questions.length;
  const currentQuestionPage = questionPages[questionPageIndex] ?? [];
  const currentBonusPage = questionPages[bonusPageIndex] ?? [];
  const isLastQuestionPage = questionPageIndex === questionPages.length - 1;
  const isLastBonusPage = bonusPageIndex === questionPages.length - 1;

  const currentQuestionPageComplete = currentQuestionPage.every(
    (question) => answers[question.id] !== undefined,
  );

  const calculateResults = useMemo<QuizResult[] | null>(() => {
    if (!allAnswered) return null;

    const results = quizData.anchors.map((anchor) => {
      let total = 0;

      anchor.questions.forEach((questionId) => {
        total += answers[questionId] || 0;
        if (bonusQuestions.includes(questionId)) {
          total += 4;
        }
      });

      return {
        ...anchor,
        score: total,
        mean: total / 5,
      };
    });

    return results.sort((a, b) => b.score - a.score);
  }, [allAnswered, answers, bonusQuestions, quizData.anchors]);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  };

  const handleBonusToggle = (questionId: number) => {
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

  const questionBlockStart = questionPageIndex * QUESTIONS_PER_PAGE + 1;
  const questionBlockEnd = Math.min(questionBlockStart + QUESTIONS_PER_PAGE - 1, quizData.questions.length);
  const bonusBlockStart = bonusPageIndex * QUESTIONS_PER_PAGE + 1;
  const bonusBlockEnd = Math.min(bonusBlockStart + QUESTIONS_PER_PAGE - 1, quizData.questions.length);

  return (
    <div className="career-quiz relative min-h-screen overflow-hidden bg-[#f7eee4] transition-colors dark:bg-[#31384a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(228,124,86,0.14),transparent_38%),linear-gradient(180deg,#fffaf4_0%,#f7eee4_42%,#efe1d2_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(253,241,229,0.18),transparent_34%),linear-gradient(180deg,#31384a_0%,#374055_34%,#2a3243_100%)]" />
      <div className="pointer-events-none absolute left-[-8%] top-16 h-80 w-80 rounded-full bg-[#f2c8a7]/16 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] top-24 h-[28rem] w-[28rem] rounded-full bg-[#df8d67]/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-[#f5efe7]/8 blur-3xl" />

      <Container className="relative z-10">
        <div className="mx-auto max-w-5xl pb-12 pt-28 md:pb-20 md:pt-32">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                className="space-y-8"
              >
                <div className="space-y-6 text-center">
                  <div className="inline-flex items-center rounded-full border border-[#d7c3ae] bg-[#f2e5d7] px-4 py-2 text-sm font-medium text-[#cf724e]">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t("introBadge")}
                  </div>

                  <Heading level="h2" className="text-4xl text-[#2f3647] dark:text-[#f6efe7] md:text-5xl">
                    {t("introTitle")}
                  </Heading>

                  <Text variant="lead" className="mx-auto max-w-3xl text-[#596173] dark:text-[#f6efe7]">
                    {t("introLead")}
                  </Text>
                </div>

                <Card className={warmCardClass}>
                  <CardContent className="grid gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
                    <div className="space-y-5 text-left">
                      <Text variant="lead" className="font-semibold text-[#2f3647]">
                        {t("introSubtitle")}
                      </Text>
                      <Text>{t("introParagraph1")}</Text>
                      <Text>{t("introParagraph2")}</Text>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#e0cbb6] bg-[#fbf5ee] p-4">
                          <Text variant="small" className="font-semibold text-[#2f3647]">
                            {t("introBlocksTitle")}
                          </Text>
                          <Text variant="small" className="mt-1 text-[#5a6275]">
                            {t("introBlocksText")}
                          </Text>
                        </div>
                        <div className="rounded-2xl border border-[#e6c9be] bg-[#f7e5dc] p-4">
                          <Text variant="small" className="font-semibold text-[#cf724e]">
                            {t("introSessionTitle")}
                          </Text>
                          <Text variant="small" className="mt-1 text-[#6b6170]">
                            {t("introSessionText")}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-[28px] border border-[#d8c5b3] bg-gradient-to-br from-[#f9f2ea] via-[#f6ede4] to-[#eeded0] p-6">
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
                            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#f0d7c5] text-[#cf724e]">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <Text variant="small" className="text-[#4f5566]">
                              {item}
                            </Text>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-dashed border-[#cf724e]/35 bg-[#fffaf4] p-4">
                        <Text variant="small" className="font-semibold text-[#2f3647]">
                          {t("introEstimatedTitle")}
                        </Text>
                        <Text variant="small" className="mt-1 text-[#5d6372]">
                          {t("introEstimatedText")}
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button
                    size="lg"
                    variant="default"
                    className={`h-14 px-12 text-lg ${warmPrimaryButtonClass}`}
                    onClick={() => {
                      setQuestionPageIndex(0);
                      setStep("questions");
                    }}
                  >
                    {t("introCta")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "questions" && (
              <motion.div
                key={`questions-${questionPageIndex}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
              >
                <Card className={warmCardClass}>
                  <CardHeader className="space-y-4 border-b border-[#dbc8b5] bg-gradient-to-r from-[#f5ebdf] via-[#f8f1e9] to-[#f3e0d3] pb-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <Text variant="small" className={warmSectionEyebrowClass}>
                          {t("questionsBlock", {
                            current: questionPageIndex + 1,
                            total: questionPages.length,
                          })}
                        </Text>
                        <CardTitle className="text-2xl md:text-3xl">
                          {t("questionsRange", {
                            start: questionBlockStart,
                            end: questionBlockEnd,
                          })}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {t("questionsScaleDesc")}
                        </CardDescription>
                      </div>

                      <div className="min-w-[220px] rounded-2xl border border-[#dac5b2] bg-[#fffaf4] p-4">
                        <div className="mb-2 flex items-center justify-between text-sm font-medium text-foreground/70">
                          <span>{t("questionsGeneralProgress")}</span>
                          <span>
                            {answeredCount}/{quizData.questions.length}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#e9d7c6]">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#e47c56] to-[#f0b08d]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(answeredCount / quizData.questions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 p-6 md:p-8">
                    {currentQuestionPage.map((question: QuizQuestion) => (
                      <div
                        key={question.id}
                        className="rounded-[24px] border border-[#dcc8b5] bg-gradient-to-br from-[#fffaf4] to-[#f3e6d9] p-5 shadow-sm"
                      >
                        <div className="mb-4 flex gap-4">
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                              answers[question.id] !== undefined
                                ? "bg-[#2f3647] text-[#f6efe7]"
                                : "bg-[#eadacc] text-[#2f3647]"
                            }`}
                          >
                            {question.id}
                          </div>
                          <Text className="text-lg font-medium leading-relaxed">{question.text}</Text>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
                          {[1, 2, 3, 4, 5, 6].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleAnswer(question.id, value)}
                              className={`h-12 rounded-2xl border text-sm font-bold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ${
                                answers[question.id] === value
                                  ? "scale-[1.03] border-[#e47c56] bg-[#2f3647] text-[#f6efe7] shadow-md"
                                  : "border-[#dbc7b3] bg-[#fffaf4] text-[#2f3647] hover:border-[#e47c56]/60 hover:bg-[#f4e5d8]"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>

                        <div className="mt-3 flex justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          <span>{t("scaleNever")}</span>
                          <span>{t("scaleAlways")}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4 border-t border-[#dbc7b3] bg-[#f4e9de] p-6">
                    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <Button
                        variant="outline"
                        className={warmSecondaryButtonClass}
                        onClick={() => {
                          if (questionPageIndex === 0) {
                            setStep("intro");
                            return;
                          }

                          setQuestionPageIndex((previous) => previous - 1);
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {questionPageIndex === 0
                          ? t("questionsBackToStart")
                          : t("questionsBackBlock")}
                      </Button>

                      <Button
                        variant="default"
                        className={`px-8 ${warmPrimaryButtonClass}`}
                        disabled={!currentQuestionPageComplete}
                        onClick={() => {
                          if (isLastQuestionPage) {
                            setBonusPageIndex(0);
                            setStep("transition");
                            return;
                          }

                          setQuestionPageIndex((previous) => previous + 1);
                        }}
                      >
                        {isLastQuestionPage ? t("questionsContinue") : t("questionsNextBlock")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {!currentQuestionPageComplete && (
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
                className="space-y-8 py-12 text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f3dfd0] text-[#cf724e] shadow-[0_18px_40px_-24px_rgba(228,124,86,0.85)]">
                  <Sparkles className="h-10 w-10" />
                </div>

                <div className="space-y-4">
                  <Heading level="h2" className="text-3xl text-[#2f3647] dark:text-[#f6efe7] md:text-4xl">
                    {t("transitionTitle")}
                  </Heading>
                  <Text variant="lead" className="mx-auto max-w-3xl text-[#596173] dark:text-[#f6efe7]">
                    {t("transitionSubtitle")}
                  </Text>
                </div>

                <Card className="mx-auto max-w-3xl border-[#d7c3ae] bg-[#f6efe7]/95 shadow-[0_28px_80px_-42px_rgba(17,24,39,0.45)]">
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
                  onClick={() => {
                    setBonusPageIndex(0);
                    setStep("bonus");
                  }}
                >
                  {t("transitionCta")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === "bonus" && (
              <motion.div
                key={`bonus-${bonusPageIndex}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
              >
                <Card className={warmCardClass}>
                  <CardHeader className="space-y-4 border-b border-[#dbc7b3] bg-gradient-to-r from-[#f5ebdf] via-[#f8f1e9] to-[#f0dfd0] pb-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <Text variant="small" className={warmSectionEyebrowClass}>
                          {t("bonusTitle")}
                        </Text>
                        <CardTitle className="text-2xl md:text-3xl">
                          {t("bonusRange", {
                            start: bonusBlockStart,
                            end: bonusBlockEnd,
                          })}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {t("bonusSubtitle")}
                        </CardDescription>
                      </div>

                      <div className="rounded-2xl border border-[#dbc7b3] bg-[#fffaf4] p-4 text-left">
                        <Text variant="small" className="font-semibold text-[#2f3647]">
                          {t("bonusSelectedLabel")}
                        </Text>
                        <Text className="mt-1 text-2xl font-bold text-foreground">{bonusQuestions.length} / 3</Text>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-6 md:p-8">
                    {currentBonusPage.map((question: QuizQuestion) => {
                      const selected = bonusQuestions.includes(question.id);
                      const disabled = !selected && bonusQuestions.length >= 3;

                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => handleBonusToggle(question.id)}
                          disabled={disabled}
                          className={`flex w-full items-start gap-4 rounded-[24px] border p-5 text-left transition-[color,background-color,border-color,box-shadow,transform] ${
                            selected
                              ? "border-[#e47c56]/55 bg-[#f0dfd0] shadow-sm"
                              : "border-[#dcc8b5] bg-gradient-to-br from-[#fffaf4] to-[#f2e4d7] hover:border-[#e47c56]/45"
                          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                          <div
                            className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-[#2f3647] bg-[#2f3647] text-[#f6efe7]"
                                : "border-[#c7b6a7] text-[#7a7280]"
                            }`}
                          >
                            {selected ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{question.id}</span>}
                          </div>
                          <Text variant="small" className="leading-relaxed text-foreground/85">
                            {question.text}
                          </Text>
                        </button>
                      );
                    })}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4 border-t border-[#dbc7b3] bg-[#f4e9de] p-6">
                    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <Button
                        variant="outline"
                        className={warmSecondaryButtonClass}
                        onClick={() => {
                          if (bonusPageIndex === 0) {
                            setStep("transition");
                            return;
                          }

                          setBonusPageIndex((previous) => previous - 1);
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {bonusPageIndex === 0 ? t("bonusBack") : t("bonusPreviousBlock")}
                      </Button>

                      {isLastBonusPage ? (
                        <Button
                          variant="default"
                          className={`px-8 ${warmPrimaryButtonClass}`}
                          disabled={bonusQuestions.length !== 3}
                          onClick={() => setStep("pre-quiz")}
                        >
                          {t("bonusCta")}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className={`px-8 ${warmPrimaryButtonClass}`}
                          onClick={() => setBonusPageIndex((previous) => previous + 1)}
                        >
                          {t("bonusNextBlock")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Text variant="small" className="text-center text-muted-foreground">
                      {t("responsesSaved")}
                    </Text>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === "pre-quiz" && (
              <motion.div
                key="pre-quiz"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                className="space-y-8"
              >
                <div className="space-y-3 text-center">
                  <Heading level="h2" className="text-[#2f3647] dark:text-[#f6efe7]">
                    {t("prequizTitle")}
                  </Heading>
                  <Text className="mx-auto max-w-2xl text-[#596173] dark:text-[#f6efe7]">
                    {t("prequizSubtitle")}
                  </Text>
                  <Text variant="small" className="text-[#687080] dark:text-[#eadfd4]">
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
                className="space-y-12"
              >
                <div className="space-y-4 text-center">
                  <div className="inline-flex items-center rounded-full border border-[#d8c2af] bg-[#f0dfd1] px-4 py-1.5 text-sm font-bold text-[#cf724e]">
                    {t("resultsBadge")}
                  </div>
                  <Heading level="h2" className="text-[#2f3647] dark:text-[#fff7ef]">
                    {t("resultsTitle")}
                  </Heading>
                  <Text className="mx-auto max-w-2xl italic text-[#596173] dark:text-[#f6efe7]">
                    {t("resultsScheinQuote")}
                  </Text>
                </div>

                <Card className="border-[#d7c3ae] bg-[#f6efe7]/95 shadow-[0_28px_80px_-42px_rgba(17,24,39,0.55)]">
                  <CardHeader>
                    <CardTitle>{t("resultsRankingTitle")}</CardTitle>
                    <CardDescription>{t("resultsRankingDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {calculateResults.map((result, index) => (
                      <div
                        key={result.id}
                        className={`flex items-center gap-4 rounded-2xl border p-5 ${
                          index === 0
                            ? "border-[#2f3647]/30 bg-[#efe1d3] shadow-sm"
                            : index === 1
                              ? "border-[#e2b79d] bg-[#f7e4d8]"
                              : "border-[#dcc8b5] bg-[#fffaf4]"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                            index === 0
                              ? "bg-[#2f3647] text-[#f6efe7]"
                              : index === 1
                                ? "bg-[#bd5734] text-white"
                                : "bg-[#eadacd] text-[#2f3647]"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="font-bold text-foreground">{result.name}</span>
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("resultsScore", { score: result.score })}
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              className={`h-full rounded-full ${
                                index === 0
                                  ? "bg-[#2f3647]"
                                  : index === 1
                                    ? "bg-[#e47c56]"
                                    : "bg-[#d6b59c]"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(result.score / (calculateResults[0]?.score || 1)) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.1 + index * 0.08 }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-8">
                  <Heading level="h3" className="text-[#2f3647] dark:text-[#f6efe7]">
                    {t("resultsProfileTitle")}
                  </Heading>

                  {calculateResults.slice(0, 3).map((result, index) => (
                    <Card
                      key={result.id}
                      className={`overflow-hidden ${
                        index === 0
                          ? "border-[#d7c3ae] shadow-xl"
                          : index === 1
                            ? "border-[#dfbaa1] shadow-lg"
                            : "border-[#d7c3ae] shadow-md"
                      }`}
                    >
                      <CardHeader className={index === 0 ? "bg-[#efe1d3]" : index === 1 ? "bg-[#f4dfd3]" : "bg-[#f7efe6]"}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7c3ae] bg-[#fffaf4] text-2xl font-bold text-[#2f3647] shadow-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{result.name}</CardTitle>
                            <CardDescription>
                              {index === 0
                                ? t("resultsDominant")
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

                        {index === 0 && (
                          <div className="rounded-2xl border border-[#e0c1ab] bg-[#f3e0d3] p-6">
                            <Text className="leading-relaxed">
                              {t.rich("resultsDominantText", {
                                article: result.article,
                                name: result.name,
                                strong: (chunks) => <strong>{chunks}</strong>,
                              })}
                            </Text>
                            <div className="mt-6">
                              <Button asChild variant="default" className={`px-8 ${warmPrimaryButtonClass}`}>
                                <Link href="/contacto">{t("resultsCtaSession")}</Link>
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isAnalyzing && (
                  <Card className="border-[#dfbaa1] bg-[#f4dfd3] shadow-lg">
                    <CardContent className="space-y-4 py-8 text-center">
                      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#e8c8b6] border-t-[#e47c56]" />
                      <Heading level="h4" className="text-[#2f3647]">
                        {t("resultsAiLoadingTitle")}
                      </Heading>
                      <Text className="text-[#5f6573]">
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
                      <Heading level="h3" className="text-[#2f3647] dark:text-[#f6efe7]">
                        {t("resultsAiTitle")}
                      </Heading>
                      {saveStatus === "saved" && (
                        <div className="rounded-full border border-[#d8c2af] bg-[#f0dfd1] px-4 py-2 text-sm font-semibold text-[#2f3647]">
                          {t("resultsSaved")}
                        </div>
                      )}
                    </div>
                    <Card className="overflow-hidden border-[#d7c3ae] bg-[#f6efe7]/95 shadow-xl">
                      <CardHeader className="bg-[#f0dfd1]">
                        <CardTitle className="text-2xl text-[#2f3647]">{aiResult.title}</CardTitle>
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
                          <div className="rounded-2xl border border-[#ebc5b5] bg-[#faece3] p-6">
                            <Heading level="h4" className="mb-4 text-lg text-[#c56543]">
                              {t("resultsFrictionTitle")}
                            </Heading>
                            <ul className="space-y-3">
                              {aiResult.frictionAreas.map((friction) => (
                                <li key={friction} className="flex items-start gap-2 text-sm leading-relaxed text-[#6c5560]">
                                  <span className="font-bold text-[#cf724e]">&bull;</span>
                                  <span>{friction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-2xl border border-[#dcc5b2] bg-[#f8efe6] p-6">
                            <Heading level="h4" className="mb-4 text-lg text-[#2f3647]">
                              {t("resultsEcosystemTitle")}
                            </Heading>
                            <Text className="text-sm leading-relaxed text-[#5b6272]">
                              {aiResult.idealEcosystem}
                            </Text>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#dcc6b3] bg-[#fff8f0] p-8 text-center">
                          <Text variant="lead" className="italic text-[#2f3647]/82">
                            &quot;{aiResult.strategicQuestion}&quot;
                          </Text>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {analysisError && !isAnalyzing && !aiResult && (
                  <Card className="border-[#e2c5ac] bg-[#faede3] shadow-sm">
                    <CardContent className="py-6 text-center">
                      <Text className="text-[#9a5f45]">{analysisError}</Text>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-8 py-6 text-center">
                  <div className="mx-auto max-w-2xl space-y-4">
                    <Heading level="h3" className="text-2xl text-[#2f3647] dark:text-[#f6efe7] md:text-3xl">
                      {t("resultsClosingTitle")}
                    </Heading>
                    <Text className="text-lg leading-relaxed text-[#596173] dark:text-[#f6efe7]">
                      {t("resultsClosingText")}
                    </Text>
                  </div>

                  <Button asChild size="lg" variant="default" className={`h-14 px-12 text-lg ${warmPrimaryButtonClass}`}>
                    <Link href="/contacto">{t("resultsClosingCta")}</Link>
                  </Button>

                  <Text className="text-sm text-[#687080] dark:text-[#ddd5cc]">
                    {t("resultsDisclaimer")}
                  </Text>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
}
