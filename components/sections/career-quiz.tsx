"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, BookOpenText, Camera, CheckCircle2, Clock3, Compass, LockKeyhole, RefreshCw, Save, Sparkles, WifiOff } from "lucide-react";
import { Link } from "@/navigation";
import englishQuizData from "@/lib/data/anchors.en.json";
import spanishQuizData from "@/lib/data/anchors.json";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { UniverseField } from "@/components/visual/universe-field";
import { useCookies } from "@/lib/cookie-context";
import { trackCareerAnchorEvent } from "@/lib/analytics/career-anchor";
import {
  buildCareerAnchorFallbackInterpretation,
  calculateCareerAnchorRanking,
  careerAnchorInterpretationSchema,
  getCareerAnchorResultGroups,
  hydrateCareerAnchorStoredRanking,
  type CareerAnchorInterpretation,
  type CareerAnchorRankingItem,
  type CareerAnchorStoredScore,
  type CareerStage,
} from "@/lib/diagnostics/career-anchor";
import {
  getCareerAnchorInitialStep,
  type CareerAnchorJourneyStep,
} from "@/lib/diagnostics/career-anchor-journey-state";

type SaveStatus = "idle" | "saving" | "saved" | "offline" | "error" | "conflict";

export type ExistingCareerDiagnostic = {
  status: "in_progress" | "processing" | "completed";
  rawAnswers: {
    answers: Record<string, number>;
    bonus: number[];
  };
  currentStatement: number;
  progressRevision: number;
  careerStage: CareerStage;
  completedAt?: string | null;
  aiFeedback?: CareerAnchorInterpretation | null;
  scoreResult?: CareerAnchorStoredScore | null;
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

const warmCardClass = "overflow-hidden border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-raised)_95%,transparent)] shadow-[0_30px_82px_-54px_var(--quiz-shadow)] backdrop-blur-sm";
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
  authState: "authenticated" | "anonymous" | "unavailable";
  showStoredResult?: boolean;
};

const COMPLETED_STORAGE_KEY = "reinvencion_career_anchor_completed";
const INTERPRETATION_POLL_TIMEOUT_MS = 30_000;
const INTERPRETATION_DEFAULT_RETRY_MS = 2_000;
const INTERPRETATION_MIN_RETRY_MS = 250;
const INTERPRETATION_MAX_RETRY_MS = 5_000;
const INTERPRETATION_MAX_POLL_ATTEMPTS = 8;

const DiagnosticResultShareForm = dynamic(() => import("@/components/forms/diagnostic-result-share-form").then((module) => module.DiagnosticResultShareForm));

function getInterpretationRetryDelay(retryAfter: string | null) {
  if (!retryAfter) return INTERPRETATION_DEFAULT_RETRY_MS;

  const seconds = Number(retryAfter);
  const parsedDelay = Number.isFinite(seconds) ? seconds * 1_000 : Date.parse(retryAfter) - Date.now();

  if (!Number.isFinite(parsedDelay)) return INTERPRETATION_DEFAULT_RETRY_MS;

  return Math.min(INTERPRETATION_MAX_RETRY_MS, Math.max(INTERPRETATION_MIN_RETRY_MS, parsedDelay));
}

function waitForInterpretationRetry(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("Interpretation request aborted"));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, delay);
    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Interpretation request aborted"));
    };

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

export function CareerQuiz({ userEmail, existingDiagnostic = null, authState, showStoredResult = false }: CareerQuizProps) {
  const locale = useLocale();
  const t = useTranslations("CareerQuiz");
  const reduceMotion = useReducedMotion();
  const { preferences } = useCookies();
  const analyticsConsent = preferences.analytics;
  const analyticsLocale = locale === "en" ? "en" : "es";
  const quizData = locale === "en" ? englishQuizData : spanishQuizData;
  const storedAnswers = existingDiagnostic ? Object.fromEntries(Object.entries(existingDiagnostic.rawAnswers.answers).map(([questionId, value]) => [Number(questionId), value])) : {};
  const initialAnsweredCount = Object.keys(storedAnswers).length;
  const initialStep = getCareerAnchorInitialStep(
    existingDiagnostic?.status,
    showStoredResult,
  );
  const [step, setStep] = useState<CareerAnchorJourneyStep>(initialStep);
  const [answers, setAnswers] = useState<Record<number, number>>(storedAnswers);
  const [bonusQuestions, setBonusQuestions] = useState<number[]>(existingDiagnostic?.rawAnswers.bonus ?? []);
  const [careerStage, setCareerStage] = useState<CareerStage>(existingDiagnostic?.careerStage ?? "prefer_not_to_say");
  const [currentStatementIndex, setCurrentStatementIndex] = useState(Math.min(Math.max((existingDiagnostic?.currentStatement ?? 1) - 1, 0), 39));
  const [selectionPage, setSelectionPage] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(existingDiagnostic ? "saved" : "idle");
  const [interpretation, setInterpretation] = useState<CareerAnchorInterpretation | null>(existingDiagnostic?.aiFeedback ?? null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [isRecordingAttempt, setIsRecordingAttempt] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const finalDialogContentRef = useRef<HTMLDivElement>(null);
  const finalDialogTitleRef = useRef<HTMLHeadingElement>(null);
  const interpretationRequestRef = useRef<AbortController | null>(null);
  const serverRevisionRef = useRef(existingDiagnostic?.progressRevision ?? 0);
  const latestIssuedRevisionRef = useRef(existingDiagnostic?.progressRevision ?? 0);
  const progressConflictRef = useRef(false);
  const latestProgressRef = useRef({
    answers: storedAnswers,
    bonus: existingDiagnostic?.rawAnswers.bonus ?? [],
    currentStatement: existingDiagnostic?.currentStatement ?? 1,
    careerStage: existingDiagnostic?.careerStage ?? ("prefer_not_to_say" as CareerStage),
  });
  const milestonesTrackedRef = useRef(new Set([10, 20, 30].filter((milestone) => initialAnsweredCount >= milestone)));
  const introTrackedRef = useRef(false);
  const resultTrackedRef = useRef(false);
  const resumedTrackedRef = useRef(false);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: step === "questions" || reduceMotion ? "auto" : "smooth",
    });
  }, [currentStatementIndex, reduceMotion, step]);

  useEffect(() => {
    if (step !== "questions") return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("career-quiz-step-heading")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentStatementIndex, step]);

  useEffect(() => {
    if (step !== "transition" && step !== "bonus") return;

    const frame = window.requestAnimationFrame(() => {
      finalDialogContentRef.current?.scrollTo({ top: 0, behavior: "auto" });
      finalDialogTitleRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectionPage, step]);

  useEffect(() => () => interpretationRequestRef.current?.abort(), []);

  useEffect(() => {
    if (existingDiagnostic?.status === "completed" || step === "results") {
      window.localStorage.setItem(COMPLETED_STORAGE_KEY, "1");
    }
  }, [existingDiagnostic?.status, step]);

  useEffect(() => {
    if (step === "results") {
      resultsHeadingRef.current?.focus();
    }
  }, [step]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= quizData.questions.length;
  const completionPercentage = Math.round((answeredCount / quizData.questions.length) * 100);

  const calculateResults = useMemo<CareerAnchorRankingItem[] | null>(() => {
    if (!allAnswered || bonusQuestions.length !== 3) return null;

    if (existingDiagnostic?.status === "completed" && existingDiagnostic.scoreResult) {
      return hydrateCareerAnchorStoredRanking(existingDiagnostic.scoreResult, locale === "en" ? "en" : "es");
    }

    return calculateCareerAnchorRanking(
      {
        answers: Object.fromEntries(Object.entries(answers).map(([questionId, value]) => [String(questionId), value])),
        bonus: bonusQuestions,
      },
      locale === "en" ? "en" : "es",
    );
  }, [allAnswered, answers, bonusQuestions, existingDiagnostic, locale]);

  const resultGroups = useMemo(() => getCareerAnchorResultGroups(calculateResults ?? []), [calculateResults]);

  const profileResults = useMemo(() => {
    if (!calculateResults?.length) return [];
    const thirdVisibleRank = calculateResults[Math.min(2, calculateResults.length - 1)]?.rank;
    return calculateResults.filter((anchor) => anchor.rank <= thirdVisibleRank);
  }, [calculateResults]);

  const leadingResults = calculateResults?.slice(0, 3) ?? [];
  const remainingResults = calculateResults?.slice(3) ?? [];

  const fallbackInterpretation = useMemo(
    () => (calculateResults ? buildCareerAnchorFallbackInterpretation(calculateResults, careerStage, locale === "en" ? "en" : "es") : null),
    [calculateResults, careerStage, locale],
  );

  const persistProgress = useCallback(
    async (snapshot: { answers: Record<number, number>; bonus: number[]; currentStatement: number; careerStage: CareerStage }) => {
      latestProgressRef.current = snapshot;
      if (authState !== "authenticated") return false;
      if (progressConflictRef.current) return false;

      if (!navigator.onLine) {
        setSaveStatus("offline");
        return false;
      }

      const clientRevision = Math.max(serverRevisionRef.current, latestIssuedRevisionRef.current) + 1;
      latestIssuedRevisionRef.current = clientRevision;
      setSaveStatus("saving");

      try {
        const response = await fetch("/api/diagnostics/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: Object.fromEntries(Object.entries(snapshot.answers).map(([statementId, value]) => [String(statementId), value])),
            bonus: snapshot.bonus,
            currentStatement: snapshot.currentStatement,
            clientRevision,
            locale: analyticsLocale,
            careerStage: snapshot.careerStage,
          }),
          keepalive: true,
        });
        const responseBody = (await response.json().catch(() => null)) as {
          code?: string;
          revision?: number;
        } | null;
        const requestIsLatest = clientRevision === latestIssuedRevisionRef.current;

        if (response.status === 401) {
          if (requestIsLatest) setSaveStatus("error");
          return false;
        }

        if (response.status === 409 && responseBody?.code === "already_completed") {
          window.location.reload();
          return false;
        }

        if (response.status === 409 && responseBody?.code === "stale_revision") {
          serverRevisionRef.current = Math.max(serverRevisionRef.current, responseBody.revision ?? clientRevision);
          if (requestIsLatest) {
            progressConflictRef.current = true;
            setSaveStatus("conflict");
          }
          return false;
        }

        if (!response.ok) {
          if (requestIsLatest) {
            setSaveStatus(navigator.onLine ? "error" : "offline");
          }
          return false;
        }

        serverRevisionRef.current = Math.max(serverRevisionRef.current, responseBody?.revision ?? clientRevision);
        if (requestIsLatest) {
          setSaveStatus("saved");
          trackCareerAnchorEvent(
            "career_anchor_progress_saved",
            {
              locale: analyticsLocale,
              statement: snapshot.currentStatement,
              progress: Math.round((Object.keys(snapshot.answers).length / 40) * 100),
            },
            analyticsConsent,
          );
        }
        return true;
      } catch {
        if (clientRevision === latestIssuedRevisionRef.current) {
          setSaveStatus(navigator.onLine ? "error" : "offline");
        }
        return false;
      }
    },
    [analyticsConsent, analyticsLocale, authState],
  );

  useEffect(() => {
    if (step === "intro" && !introTrackedRef.current) {
      introTrackedRef.current = true;
      trackCareerAnchorEvent("career_anchor_intro_viewed", { locale: analyticsLocale, progress: 0 }, analyticsConsent);
    }
  }, [analyticsConsent, analyticsLocale, step]);

  useEffect(() => {
    if (existingDiagnostic?.status === "in_progress" && !resumedTrackedRef.current && initialAnsweredCount > 0) {
      resumedTrackedRef.current = true;
      trackCareerAnchorEvent(
        "career_anchor_resumed",
        {
          locale: analyticsLocale,
          statement: existingDiagnostic.currentStatement,
          progress: Math.round((initialAnsweredCount / 40) * 100),
        },
        analyticsConsent,
      );
    }
  }, [analyticsConsent, analyticsLocale, existingDiagnostic, initialAnsweredCount]);

  useEffect(() => {
    if (step === "results" && !resultTrackedRef.current) {
      resultTrackedRef.current = true;
      trackCareerAnchorEvent("career_anchor_result_viewed", { locale: analyticsLocale, progress: 100 }, analyticsConsent);
    }
  }, [analyticsConsent, analyticsLocale, step]);

  useEffect(() => {
    const retryWhenOnline = () => {
      if (saveStatus === "offline" || saveStatus === "error") {
        void persistProgress(latestProgressRef.current);
      }
    };
    window.addEventListener("online", retryWhenOnline);
    return () => window.removeEventListener("online", retryWhenOnline);
  }, [persistProgress, saveStatus]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!["saving", "offline", "error", "conflict"].includes(saveStatus) || step === "results") return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [saveStatus, step]);

  useEffect(() => {
    const reportAbandonment = () => {
      if (Object.keys(latestProgressRef.current.answers).length === 0 || step === "results" || step === "completed" || existingDiagnostic?.status === "completed") return;
      trackCareerAnchorEvent(
        "career_anchor_abandoned",
        {
          locale: analyticsLocale,
          statement: latestProgressRef.current.currentStatement,
          progress: Math.round((Object.keys(latestProgressRef.current.answers).length / 40) * 100),
        },
        analyticsConsent,
      );
    };
    window.addEventListener("pagehide", reportAbandonment);
    return () => window.removeEventListener("pagehide", reportAbandonment);
  }, [analyticsConsent, analyticsLocale, existingDiagnostic?.status, step]);

  const startTest = () => {
    if (existingDiagnostic?.status === "processing") {
      setStep("processing");
      return;
    }

    setStep("questions");
    trackCareerAnchorEvent(
      "career_anchor_started",
      {
        locale: analyticsLocale,
        statement: currentStatementIndex + 1,
        progress: completionPercentage,
      },
      analyticsConsent,
    );
    void persistProgress({
      answers,
      bonus: bonusQuestions,
      currentStatement: currentStatementIndex + 1,
      careerStage,
    });
  };

  const handleAnswer = (statementId: number, value: number) => {
    const nextAnswers = { ...answers, [statementId]: value };
    setAnswers(nextAnswers);
    const nextAnsweredCount = Object.keys(nextAnswers).length;
    const nextProgress = Math.round((nextAnsweredCount / 40) * 100);

    trackCareerAnchorEvent(
      "career_anchor_statement_answered",
      {
        locale: analyticsLocale,
        statement: statementId,
        progress: nextProgress,
      },
      analyticsConsent,
    );

    for (const [threshold, event] of [
      [10, "career_anchor_25_percent"],
      [20, "career_anchor_50_percent"],
      [30, "career_anchor_75_percent"],
    ] as const) {
      if (nextAnsweredCount >= threshold && !milestonesTrackedRef.current.has(threshold)) {
        milestonesTrackedRef.current.add(threshold);
        trackCareerAnchorEvent(
          event,
          {
            locale: analyticsLocale,
            statement: statementId,
            progress: threshold * 2.5,
          },
          analyticsConsent,
        );
      }
    }

    void persistProgress({
      answers: nextAnswers,
      bonus: bonusQuestions,
      currentStatement: currentStatementIndex + 1,
      careerStage,
    });
  };

  const changeStatement = (nextIndex: number) => {
    const boundedIndex = Math.min(Math.max(nextIndex, 0), 39);
    setCurrentStatementIndex(boundedIndex);
    void persistProgress({
      answers,
      bonus: bonusQuestions,
      currentStatement: boundedIndex + 1,
      careerStage,
    });
  };

  const continueFromStatement = () => {
    if (currentStatementIndex < 39) {
      changeStatement(currentStatementIndex + 1);
      return;
    }

    trackCareerAnchorEvent("career_anchor_statements_completed", { locale: analyticsLocale, statement: 40, progress: 100 }, analyticsConsent);
    void persistProgress({
      answers,
      bonus: bonusQuestions,
      currentStatement: 40,
      careerStage,
    });
    setStep("transition");
  };

  const handleBonusToggle = (statementId: number) => {
    setCompletionError(null);
    const nextSelection = bonusQuestions.includes(statementId) ? bonusQuestions.filter((id) => id !== statementId) : bonusQuestions.length < 3 ? [...bonusQuestions, statementId] : bonusQuestions;
    setBonusQuestions(nextSelection);
    void persistProgress({
      answers,
      bonus: nextSelection,
      currentStatement: 40,
      careerStage,
    });
  };

  const finishBonusSelection = async () => {
    if (isRecordingAttempt || bonusQuestions.length !== 3 || progressConflictRef.current) return;

    setIsRecordingAttempt(true);
    setCompletionError(null);

    try {
      const response = await fetch("/api/diagnostics/complete-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawAnswers: { answers, bonus: bonusQuestions },
          locale: analyticsLocale,
          careerStage,
        }),
      });
      const responseBody = (await response.json().catch(() => null)) as {
        code?: string;
      } | null;

      if (response.status === 409 && responseBody?.code === "already_completed") {
        window.location.reload();
        return;
      }

      if (response.status === 409 && responseBody?.code === "finalizing") {
        setCompletionError(t("completionStillProcessing"));
        return;
      }

      if (!response.ok) {
        setCompletionError(t("completionUnavailable"));
        return;
      }

      setSaveStatus("saved");
      trackCareerAnchorEvent("career_anchor_final_selection_completed", { locale: analyticsLocale, statement: 40, progress: 100 }, analyticsConsent);
      trackCareerAnchorEvent("career_anchor_result_generated", { locale: analyticsLocale, progress: 100 }, analyticsConsent);
      setStep("results");
    } catch {
      setCompletionError(t("completionUnavailable"));
    } finally {
      setIsRecordingAttempt(false);
    }
  };

  const requestPublicInterpretation = async () => {
    if (!calculateResults || !fallbackInterpretation || isInterpreting || interpretationRequestRef.current) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), INTERPRETATION_POLL_TIMEOUT_MS);
    interpretationRequestRef.current = controller;
    setInterpretation(null);
    setIsInterpreting(true);

    try {
      let attempts = 0;
      while (!controller.signal.aborted) {
        attempts += 1;
        const response = await fetch("/api/diagnostics/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          signal: controller.signal,
        });

        if (response.status === 202) {
          if (attempts >= INTERPRETATION_MAX_POLL_ATTEMPTS) {
            throw new Error("Interpretation request timed out");
          }

          await waitForInterpretationRetry(Math.max(getInterpretationRetryDelay(response.headers.get("Retry-After")), Math.min(INTERPRETATION_MAX_RETRY_MS, attempts * 1_000)), controller.signal);
          continue;
        }

        const responseBody: unknown = await response.json().catch(() => null);
        const parsed = careerAnchorInterpretationSchema.safeParse(responseBody);
        if (!response.ok || !parsed.success) {
          throw new Error("Interpretation response was not available");
        }

        setInterpretation(parsed.data);
        return;
      }

      throw new Error("Interpretation request timed out");
    } catch {
      setInterpretation(fallbackInterpretation);
    } finally {
      window.clearTimeout(timeoutId);
      if (interpretationRequestRef.current === controller) {
        interpretationRequestRef.current = null;
        setIsInterpreting(false);
      }
    }
  };

  useEffect(() => {
    if (step !== "results" || !calculateResults || interpretation || isInterpreting) return;
    void requestPublicInterpretation();
    // The request is intentionally keyed to the completed result state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, calculateResults, interpretation, isInterpreting]);

  const focusStepHeading = () => {
    document.getElementById("career-quiz-step-heading")?.focus({ preventScroll: true });
  };

  const currentStatement = quizData.questions[currentStatementIndex] as QuizQuestion;
  const selectionPageSize = 10;
  const selectionPageCount = Math.ceil(quizData.questions.length / selectionPageSize);
  const selectionStatements = quizData.questions.slice(selectionPage * selectionPageSize, (selectionPage + 1) * selectionPageSize) as QuizQuestion[];
  const milestoneKey =
    currentStatement.id >= 38
      ? "milestoneAlmostDone"
      : currentStatement.id >= 30
        ? "milestoneThirty"
        : currentStatement.id >= 20
          ? "milestoneTwenty"
          : currentStatement.id >= 10
            ? "milestoneTen"
            : null;

  return (
    <div className="career-quiz relative min-h-screen max-w-full overflow-x-clip bg-[var(--quiz-bg)] transition-colors">
      <div className="career-quiz__background pointer-events-none absolute inset-0" />
      <UniverseField className="left-[36%] text-[var(--senda-olive)] opacity-10 dark:opacity-15" />
      <div className="pointer-events-none absolute left-[-8%] top-16 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--quiz-accent)_12%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] top-24 h-[28rem] w-[28rem] rounded-full bg-[color-mix(in_srgb,var(--senda-gold)_10%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--quiz-surface)_8%,transparent)] blur-3xl" />

      {saveStatus === "conflict" && step !== "transition" && step !== "bonus" ? (
        <div
          className="fixed inset-x-3 top-[max(5rem,env(safe-area-inset-top))] z-[160] mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-[var(--quiz-danger)] bg-[var(--quiz-surface-raised)] p-4 text-center shadow-2xl sm:flex-row sm:justify-between sm:text-left"
          role="alert"
        >
          <Text variant="small" className="font-medium text-[var(--quiz-ink)]">
            {t("saveConflict")}
          </Text>
          <Button size="sm" variant="outline" className={`shrink-0 ${warmSecondaryButtonClass}`} onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("saveReload")}
          </Button>
        </div>
      ) : null}

      <Container className="relative z-10">
        <div className={`mx-auto min-w-0 max-w-5xl pt-28 md:pt-32 ${step === "results" ? "pb-28 md:pb-32" : "pb-12 md:pb-20"}`}>
          <MotionConfig reducedMotion="user">
            <AnimatePresence mode="wait">
              {step === "intro" && (
                <motion.div key="intro" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} onAnimationComplete={focusStepHeading} className="space-y-12">
                  <header className="mx-auto max-w-4xl space-y-6 text-center">
                    <div className="inline-flex items-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] px-4 py-2 text-sm font-semibold text-[var(--quiz-accent)]">
                      <Compass className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t("introBadge")}
                    </div>
                    <Heading
                      id="career-quiz-step-heading"
                      level="h1"
                      tabIndex={-1}
                      className="text-balance text-4xl text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)] md:text-6xl"
                    >
                      {t("introTitle")}
                    </Heading>
                    <Text variant="lead" className="mx-auto max-w-3xl text-pretty text-[var(--quiz-muted)]">
                      {t("introLead")}
                    </Text>
                  </header>

                  <Card className={warmCardClass}>
                    <CardContent className="grid gap-8 p-6 md:grid-cols-[1.08fr_0.92fr] md:p-10">
                      <div className="space-y-5">
                        <Heading level="h2" className="text-2xl text-[var(--quiz-ink)] md:text-3xl">
                          {t("introProblemTitle")}
                        </Heading>
                        <Text className="leading-relaxed">{t("introProblemParagraph1")}</Text>
                        <Text className="leading-relaxed">{t("introProblemParagraph2")}</Text>
                      </div>
                      <div className="rounded-[26px] border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] p-6">
                        <BookOpenText className="mb-4 h-8 w-8 text-[var(--quiz-accent)]" aria-hidden="true" />
                        <Heading level="h3" className="text-xl text-[var(--quiz-ink)]">
                          {t("introTheoryTitle")}
                        </Heading>
                        <Text className="mt-3 leading-relaxed text-[var(--quiz-muted)]">{t("introTheoryText")}</Text>
                        <Text className="mt-4 font-semibold text-[var(--quiz-ink)]">{t("introTheoryClosing")}</Text>
                      </div>
                    </CardContent>
                  </Card>

                  <section aria-labelledby="career-anchor-benefits" className="space-y-6">
                    <div className="mx-auto max-w-3xl text-center">
                      <Heading id="career-anchor-benefits" level="h2" className="text-3xl text-[var(--quiz-ink)]">
                        {t("introBenefitsTitle")}
                      </Heading>
                      <Text className="mt-3 text-[var(--quiz-muted)]">{t("introBenefitsLead")}</Text>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="rounded-[24px] border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-raised)] p-5 shadow-sm">
                          <CheckCircle2 className="mb-3 h-5 w-5 text-[var(--quiz-accent)]" aria-hidden="true" />
                          <Heading level="h3" className="text-lg text-[var(--quiz-ink)]">
                            {t(`introBenefit${item}Title`)}
                          </Heading>
                          <Text variant="small" className="mt-2 leading-relaxed text-[var(--quiz-muted)]">
                            {t(`introBenefit${item}Text`)}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Card className={warmCardClass}>
                    <CardContent className="grid gap-8 p-6 md:grid-cols-2 md:p-10">
                      <div>
                        <Camera className="mb-4 h-8 w-8 text-[var(--quiz-accent)]" aria-hidden="true" />
                        <Heading level="h2" className="text-2xl text-[var(--quiz-ink)]">
                          {t("introMomentTitle")}
                        </Heading>
                        <Text className="mt-4 leading-relaxed text-[var(--quiz-muted)]">{t("introMomentText")}</Text>
                      </div>
                      <div className="rounded-[24px] border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-accent)] p-6">
                        <Heading level="h2" className="text-2xl text-[var(--quiz-ink)]">
                          {t("introOutcomeTitle")}
                        </Heading>
                        <ul className="mt-4 space-y-3">
                          {[1, 2, 3, 4, 5].map((item) => (
                            <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--quiz-muted)]">
                              <span className="font-bold text-[var(--quiz-accent)]" aria-hidden="true">
                                •
                              </span>
                              <span>{t(`introOutcome${item}`)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <section className="space-y-5" aria-labelledby="career-anchor-expectations">
                    <Heading id="career-anchor-expectations" level="h2" className="text-center text-3xl text-[var(--quiz-ink)]">
                      {t("introExpectTitle")}
                    </Heading>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[
                        [BookOpenText, t("introFactStatements")],
                        [Clock3, t("introFactTime")],
                        [Sparkles, t("introFactReading")],
                        [LockKeyhole, t("introFactPrivate")],
                      ].map(([Icon, label]) => {
                        const FactIcon = Icon as typeof BookOpenText;
                        return (
                          <div key={String(label)} className="rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-raised)] p-4 text-center">
                            <FactIcon className="mx-auto mb-2 h-5 w-5 text-[var(--quiz-accent)]" aria-hidden="true" />
                            <Text variant="small" className="font-semibold text-[var(--quiz-ink)]">
                              {String(label)}
                            </Text>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[24px] border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] p-6">
                        <Heading level="h3" className="text-xl text-[var(--quiz-ink)]">
                          {t("introOneAttemptTitle")}
                        </Heading>
                        <Text className="mt-3 leading-relaxed text-[var(--quiz-muted)]">{t("introOneAttemptText")}</Text>
                      </div>
                      <div className="rounded-[24px] border border-[var(--quiz-border)] bg-[var(--quiz-surface-accent)] p-6">
                        <Heading level="h3" className="text-xl text-[var(--quiz-ink)]">
                          {t("introPrivacyTitle")}
                        </Heading>
                        <Text className="mt-3 leading-relaxed text-[var(--quiz-muted)]">
                          {t("introPrivacyText")}{" "}
                          <Link
                            href="/privacidad"
                            className="font-semibold text-[var(--quiz-ink)] underline decoration-[var(--quiz-accent)]/55 underline-offset-4 hover:text-[var(--quiz-accent-strong)]"
                          >
                            {t("privacyLink")}
                          </Link>
                        </Text>
                      </div>
                    </div>

                    <details className="group rounded-[24px] border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-raised)] p-5">
                      <summary className="cursor-pointer font-semibold text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)]">
                        {t("introScopeTitle")}
                      </summary>
                      <Text className="mt-4 leading-relaxed text-[var(--quiz-muted)]">{t("introScopeText")}</Text>
                    </details>
                  </section>

                  <div className="mx-auto max-w-3xl space-y-4 text-center">
                    {authState === "authenticated" ? (
                      <Button size="lg" className={`h-14 px-10 text-lg ${warmPrimaryButtonClass}`} onClick={() => setStep("ready")}>
                        {t("introCta")}
                        <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                      </Button>
                    ) : authState === "anonymous" ? (
                      <Button
                        asChild
                        size="lg"
                        className={`h-auto min-h-14 w-full max-w-full whitespace-normal px-5 py-3 text-center text-base sm:w-auto sm:px-10 sm:text-lg ${warmPrimaryButtonClass}`}
                      >
                        <Link href={`/login?next=${encodeURIComponent(locale === "en" ? "/en/test-anclas-de-carrera" : "/test-anclas-de-carrera")}`}>
                          {t("introLoginCta")}
                          <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className={`h-auto min-h-14 w-full max-w-full whitespace-normal px-5 py-3 text-center text-base sm:w-auto sm:px-10 sm:text-lg ${warmPrimaryButtonClass}`}
                        disabled
                      >
                        {t("introUnavailableCta")}
                      </Button>
                    )}
                    <Text variant="small" className="[overflow-wrap:anywhere] text-[var(--quiz-muted)]">
                      {authState === "authenticated" && userEmail ? t("introSignedIn", { email: userEmail }) : authState === "unavailable" ? t("introUnavailableNote") : t("introAccountNote")}
                    </Text>
                  </div>
                </motion.div>
              )}

              {step === "ready" && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onAnimationComplete={focusStepHeading}
                  className="mx-auto max-w-3xl space-y-7"
                >
                  <header className="space-y-4 text-center">
                    <Text variant="small" className={warmSectionEyebrowClass}>
                      {t("readyEyebrow")}
                    </Text>
                    <Heading
                      id="career-quiz-step-heading"
                      level="h1"
                      tabIndex={-1}
                      className="text-4xl text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)]"
                    >
                      {existingDiagnostic ? t("resumeTitle") : t("readyTitle")}
                    </Heading>
                    <Text variant="lead" className="text-[var(--quiz-muted)]">
                      {existingDiagnostic
                        ? t("resumeLead", {
                            statement: currentStatementIndex + 1,
                          })
                        : t("readyLead")}
                    </Text>
                  </header>

                  <Card className={warmCardClass}>
                    <CardContent className="space-y-6 p-6 md:p-8">
                      <ul className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                          <li key={item} className="flex gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--quiz-accent)]" aria-hidden="true" />
                            <Text className="leading-relaxed">{t(`readyInstruction${item}`)}</Text>
                          </li>
                        ))}
                      </ul>

                      <div className="rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-accent)] p-5">
                        <label htmlFor="career-stage" className="font-semibold text-[var(--quiz-ink)]">
                          {t("contextLabel")}
                        </label>
                        <Text variant="small" className="mt-1 text-[var(--quiz-muted)]">
                          {t("contextDescription")}
                        </Text>
                        <select
                          id="career-stage"
                          name="career-stage"
                          value={careerStage}
                          onChange={(event) => setCareerStage(event.target.value as CareerStage)}
                          className="mt-4 min-h-12 w-full rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-surface-raised)] px-4 py-3 text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)]"
                        >
                          {careerStageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {t(option.labelKey)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3 rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface)] p-5">
                        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[var(--quiz-accent)]" aria-hidden="true" />
                        <Text variant="small" className="leading-relaxed text-[var(--quiz-muted)]">
                          {t("readyPrivacy")}{" "}
                          <Link
                            href="/privacidad"
                            className="font-semibold text-[var(--quiz-ink)] underline decoration-[var(--quiz-accent)]/55 underline-offset-4 hover:text-[var(--quiz-accent-strong)]"
                          >
                            {t("privacyLink")}
                          </Link>
                        </Text>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 border-t border-[var(--quiz-border-soft)] p-6 sm:flex-row sm:justify-between">
                      <Button
                        variant="outline"
                        className={`h-auto min-h-11 w-full max-w-full whitespace-normal px-4 py-3 text-center sm:w-auto ${warmSecondaryButtonClass}`}
                        onClick={() => setStep("intro")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                        {t("readyBack")}
                      </Button>
                      <Button className={`h-auto min-h-11 w-full max-w-full whitespace-normal px-4 py-3 text-center sm:w-auto sm:px-8 ${warmPrimaryButtonClass}`} onClick={startTest}>
                        {existingDiagnostic
                          ? t("resumeCta", {
                              statement: currentStatementIndex + 1,
                            })
                          : t("readyCta")}
                        <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {step === "completed" && existingDiagnostic && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onAnimationComplete={focusStepHeading}
                  className="mx-auto max-w-3xl py-10 text-center"
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--quiz-surface-warm)] text-[var(--quiz-accent)]">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <Heading
                    id="career-quiz-step-heading"
                    level="h1"
                    tabIndex={-1}
                    className="text-4xl text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)]"
                  >
                    {t("completedTitle")}
                  </Heading>
                  <Text variant="lead" className="mx-auto mt-4 max-w-2xl text-[var(--quiz-muted)]">
                    {t("completedText")}
                  </Text>
                  {existingDiagnostic.completedAt ? (
                    <Text variant="small" className="mt-3 text-[var(--quiz-muted)]">
                      {t("completedDate", {
                        date: new Intl.DateTimeFormat(analyticsLocale === "en" ? "en-US" : "es-AR", { dateStyle: "long" }).format(new Date(existingDiagnostic.completedAt)),
                      })}
                    </Text>
                  ) : null}
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button size="lg" className={`px-8 ${warmPrimaryButtonClass}`} onClick={() => setStep("results")}>
                      {t("completedCta")}
                    </Button>
                    <Button asChild size="lg" variant="outline" className={warmSecondaryButtonClass}>
                      <Link href="/panel#resultado">{t("completedProfileCta")}</Link>
                    </Button>
                  </div>
                  <Text variant="small" className="mt-6 text-[var(--quiz-muted)]">
                    {t("completedPrivate")}
                  </Text>
                </motion.div>
              )}

              {step === "processing" && existingDiagnostic && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onAnimationComplete={focusStepHeading}
                  className="mx-auto max-w-3xl py-10 text-center"
                >
                  <div
                    className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[var(--quiz-accent-soft)] border-t-[var(--quiz-accent)] motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <Heading
                    id="career-quiz-step-heading"
                    level="h1"
                    tabIndex={-1}
                    className="text-4xl text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)]"
                  >
                    {t("processingTitle")}
                  </Heading>
                  <Text variant="lead" className="mx-auto mt-4 max-w-2xl text-[var(--quiz-muted)]">
                    {t("processingText")}
                  </Text>
                  {completionError ? (
                    <Text role="alert" className="mx-auto mt-5 max-w-xl text-[var(--quiz-danger)]">
                      {completionError}
                    </Text>
                  ) : null}
                  <Button
                    size="lg"
                    className={`mt-8 h-auto min-h-12 max-w-full whitespace-normal px-8 py-3 ${warmPrimaryButtonClass}`}
                    disabled={isRecordingAttempt || !calculateResults}
                    onClick={() => void finishBonusSelection()}
                  >
                    {isRecordingAttempt ? t("selectionPreparingShort") : t("processingRetryCta")}
                  </Button>
                  {!calculateResults ? (
                    <Text role="alert" variant="small" className="mt-4 text-[var(--quiz-danger)]">
                      {t("processingUnavailable")}{" "}
                      <Link href="/contacto" className="font-semibold underline decoration-current/45 underline-offset-4">
                        {t("processingContactCta")}
                      </Link>
                    </Text>
                  ) : null}
                </motion.div>
              )}

              {step === "questions" && (
                <motion.div
                  key={`statement-${currentStatement.id}`}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduceMotion ? 0 : -20 }}
                  onAnimationComplete={focusStepHeading}
                  className="mx-auto w-full max-w-3xl"
                >
                  <Card className={longFormCardClass}>
                    <CardHeader className="space-y-3 border-b border-[var(--quiz-border-soft)] bg-gradient-to-r from-[var(--quiz-surface-soft)] via-[var(--quiz-surface-raised)] to-[var(--quiz-surface-warm)] p-4 sm:space-y-5 sm:p-7">
                      <Text variant="small" className={warmSectionEyebrowClass}>
                        {t("statementProgress", {
                          current: currentStatement.id,
                          total: 40,
                        })}
                      </Text>
                      <div
                        role="progressbar"
                        aria-label={t("questionsGeneralProgress")}
                        aria-valuemin={1}
                        aria-valuemax={40}
                        aria-valuenow={currentStatement.id}
                        aria-valuetext={t("statementProgress", {
                          current: currentStatement.id,
                          total: 40,
                        })}
                        className="h-2.5 overflow-hidden rounded-full bg-[var(--quiz-accent-soft)]"
                        data-testid="career-anchor-progress"
                      >
                        <div
                          className="h-full origin-left rounded-full bg-[var(--quiz-accent)] transition-transform duration-300 motion-reduce:transition-none"
                          style={{
                            transform: `scaleX(${currentStatement.id / 40})`,
                          }}
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-5 p-4 sm:space-y-7 sm:p-7 md:p-9" data-testid="career-anchor-statement">
                      {milestoneKey && [10, 20, 30, 38].includes(currentStatement.id) ? (
                        <div className="rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-accent)] p-4 text-center">
                          <Text variant="small" className="font-medium text-[var(--quiz-ink)]">
                            {t(milestoneKey)}
                          </Text>
                        </div>
                      ) : null}

                      <fieldset className="m-0 min-w-0">
                        <legend
                          id="career-quiz-step-heading"
                          tabIndex={-1}
                          className="scroll-mt-28 text-pretty font-heading text-xl font-semibold leading-relaxed text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)] sm:text-3xl"
                        >
                          {currentStatement.text}
                        </legend>
                        <Text variant="small" className="mt-3 text-[var(--quiz-muted)]">
                          {t("statementPrompt")}
                        </Text>

                        <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-7 sm:grid-cols-6 sm:gap-3" role="radiogroup" aria-label={t("statementScaleLabel")}>
                          {[1, 2, 3, 4, 5, 6].map((value) => (
                            <label
                              key={value}
                              className={`flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-2xl border px-1 py-2 text-base font-bold transition-[color,background-color,border-color,box-shadow,transform] focus-within:ring-2 focus-within:ring-[var(--quiz-accent)] focus-within:ring-offset-2 sm:min-h-12 sm:flex-row sm:py-0 ${
                                answers[currentStatement.id] === value
                                  ? "scale-[1.03] border-[var(--quiz-accent)] bg-[var(--senda-dark)] text-[var(--senda-light)] shadow-md"
                                  : "border-[var(--quiz-border-soft)] bg-[var(--quiz-surface)] text-[var(--quiz-ink)] hover:border-[var(--quiz-accent)] hover:bg-[var(--quiz-choice-hover)]"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`statement-${currentStatement.id}`}
                                value={value}
                                checked={answers[currentStatement.id] === value}
                                disabled={saveStatus === "conflict"}
                                onChange={() => handleAnswer(currentStatement.id, value)}
                                aria-label={t("scaleOption", {
                                  value,
                                  label: t(`scaleResponse${value}`),
                                })}
                                className="sr-only"
                              />
                              <span aria-hidden="true">{value}</span>
                              <span className="mt-0.5 text-center text-[11px] font-semibold leading-tight opacity-80 sm:hidden" aria-hidden="true">
                                {t(`scaleResponse${value}`)}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 hidden justify-between gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--quiz-muted)] sm:flex">
                          <span>{t("scaleNever")}</span>
                          <span className="text-right">{t("scaleAlways")}</span>
                        </div>
                      </fieldset>

                      <div className="flex min-h-6 flex-col items-center justify-center gap-2 text-center text-sm text-[var(--quiz-muted)] sm:flex-row" role="status" aria-live="polite">
                        {saveStatus === "saving" ? (
                          <>
                            <Save className="h-4 w-4" aria-hidden="true" />
                            {t("saveSaving")}
                          </>
                        ) : null}
                        {saveStatus === "saved" ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            {t("saveSaved")}
                          </>
                        ) : null}
                        {saveStatus === "offline" ? (
                          <>
                            <WifiOff className="h-4 w-4" aria-hidden="true" />
                            {t("saveOffline")}
                          </>
                        ) : null}
                        {saveStatus === "error" ? (
                          <>
                            <span>{t("saveError")}</span>
                            <Button variant="ghost" size="sm" onClick={() => void persistProgress(latestProgressRef.current)}>
                              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                              {t("saveRetry")}
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </CardContent>

                    <CardFooter className="grid grid-cols-2 gap-2 border-t border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-muted)] p-4 sm:flex sm:p-5 sm:justify-between">
                      <Button
                        variant="outline"
                        className={warmSecondaryButtonClass}
                        disabled={saveStatus === "conflict"}
                        onClick={() => (currentStatementIndex === 0 ? setStep("ready") : changeStatement(currentStatementIndex - 1))}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        {t("statementBack")}
                      </Button>
                      <Button
                        className={`min-w-0 px-2 sm:px-8 ${warmPrimaryButtonClass}`}
                        disabled={answers[currentStatement.id] === undefined || saveStatus === "conflict"}
                        aria-label={currentStatement.id === 40 ? t("statementFinish") : undefined}
                        onClick={continueFromStatement}
                      >
                        {currentStatement.id === 40 ? (
                          <>
                            <span className="sm:hidden">{t("statementFinishShort")}</span>
                            <span className="hidden sm:inline">{t("statementFinish")}</span>
                          </>
                        ) : (
                          t("statementNext")
                        )}
                        <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {step === "results" && calculateResults && (
                <motion.div key="results" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} onAnimationComplete={() => resultsHeadingRef.current?.focus()} className="space-y-12">
                  <div className="space-y-4 text-center">
                    <div className="inline-flex items-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] px-4 py-1.5 text-sm font-bold text-[var(--quiz-accent)]">
                      {t("resultsBadge")}
                    </div>
                    <h1
                      ref={resultsHeadingRef}
                      tabIndex={-1}
                      className="scroll-m-20 font-heading text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--quiz-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)] focus-visible:ring-offset-2 md:text-4xl lg:text-h2"
                    >
                      {t("resultsTitle")}
                    </h1>
                    <Text className="mx-auto max-w-2xl italic text-[var(--quiz-muted)]">{t("resultsScheinQuote")}</Text>
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
                      <h2 className="font-heading text-2xl font-semibold leading-tight tracking-tight">{t("resultsRankingTitle")}</h2>
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
                          <h3 id="career-anchor-top-three-title" className="font-heading text-2xl font-semibold leading-tight text-[var(--quiz-ink)] [overflow-wrap:anywhere] sm:text-3xl">
                            {t("resultsTopThreeTitle")}
                          </h3>
                          <Text className="mt-2 max-w-3xl text-[var(--quiz-muted)] [overflow-wrap:anywhere]">{t("resultsTopThreeDescription")}</Text>
                        </div>

                        <div className="grid min-w-0 gap-4">
                          {leadingResults.map((result, index) => {
                            const positionLabel = index === 0 ? t("resultsDominant") : index === 1 ? t("resultsSecondary") : t("resultsThird");

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
                                  <div className="mb-2 min-w-0">
                                    <div className="min-w-0">
                                      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--quiz-accent)] [overflow-wrap:anywhere]">{positionLabel}</span>
                                      <span className="mt-0.5 block font-bold text-[var(--quiz-ink)] [overflow-wrap:anywhere] sm:text-lg">{result.name}</span>
                                    </div>
                                  </div>
                                  <div className="h-2.5 overflow-hidden rounded-full bg-[var(--quiz-accent-soft)]">
                                    <motion.div
                                      className={`h-full rounded-full ${index === 0 ? "bg-[var(--senda-dark)]" : index === 1 ? "bg-[var(--quiz-accent)]" : "bg-[var(--senda-gold)]"}`}
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${(result.score / (calculateResults[0]?.score || 1)) * 100}%`,
                                      }}
                                      transition={{
                                        duration: 0.8,
                                        delay: 0.1 + index * 0.08,
                                      }}
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
                          <h3 id="career-anchor-remaining-title" className="font-heading text-xl font-semibold text-[var(--quiz-ink)]">
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
                                <div className="mb-2 min-w-0">
                                  <span className="min-w-0 font-semibold text-[var(--quiz-ink)] [overflow-wrap:anywhere]">{result.name}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-[var(--quiz-accent-soft)]">
                                  <motion.div
                                    className="h-full rounded-full bg-[color-mix(in_srgb,var(--quiz-accent)_50%,var(--quiz-muted))]"
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${(result.score / (calculateResults[0]?.score || 1)) * 100}%`,
                                    }}
                                    transition={{
                                      duration: 0.7,
                                      delay: 0.25 + index * 0.06,
                                    }}
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
                    {isRecordingAttempt ? t("recordingAttempt") : completionError ? t("responsesNotSaved") : saveStatus === "saved" || existingDiagnostic ? t("responsesSaved") : t("responsesPrivate")}
                  </Text>

                  <div className="space-y-8">
                    <Heading level="h3" as="h2" className="text-[var(--quiz-ink)]">
                      {t("resultsProfileTitle")}
                    </Heading>

                    {profileResults.map((result, index) => (
                      <Card
                        key={result.id}
                        className={`overflow-hidden ${
                          index === 0 ? "border-[var(--quiz-border)] shadow-xl" : index === 1 ? "border-[var(--quiz-accent)] shadow-lg" : "border-[var(--quiz-border)] shadow-md"
                        }`}
                      >
                        <CardHeader className={index === 0 ? "bg-[var(--quiz-surface-warm)]" : index === 1 ? "bg-[var(--quiz-surface-accent)]" : "bg-[var(--quiz-surface-soft)]"}>
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-2xl font-bold text-[var(--quiz-ink)] shadow-sm">
                              #{result.rank}
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-2xl [overflow-wrap:anywhere]">{result.name}</CardTitle>
                              <CardDescription>
                                {result.rank === 1
                                  ? resultGroups.primary.length > 1
                                    ? t("resultsTiePrimary")
                                    : t("resultsDominant")
                                  : resultGroups.secondary.filter((anchor) => anchor.rank === result.rank).length > 1
                                    ? t("resultsTieSecondary")
                                    : index === 1
                                      ? t("resultsSecondary")
                                      : t("resultsThird")}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-8">
                          <Text className="leading-relaxed text-foreground/85">{t(`resultAnchorLens.${result.id}`)}</Text>

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
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {isInterpreting && (
                    <Card className="border-[var(--quiz-accent)] bg-[var(--quiz-surface-accent)] shadow-lg" role="status" aria-live="polite" aria-atomic="true">
                      <CardContent className="space-y-4 py-8 text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--quiz-accent-soft)] border-t-[var(--quiz-accent)] motion-reduce:animate-none" />
                        <Heading level="h4" className="text-[var(--quiz-ink)]">
                          {t("interpretationLoadingTitle")}
                        </Heading>
                        <Text className="text-[var(--quiz-muted)]">{t("interpretationLoadingText")}</Text>
                      </CardContent>
                    </Card>
                  )}

                  {interpretation && !isInterpreting && (
                    <div className="space-y-6">
                      <div>
                        <Heading level="h3" as="h2" className="text-[var(--quiz-ink)]">
                          {t("interpretationTitle")}
                        </Heading>
                      </div>

                      <Card className="overflow-hidden border-[var(--quiz-border)] bg-[var(--quiz-surface-soft)] shadow-xl">
                        <CardHeader className="bg-[var(--quiz-surface-warm)]">
                          <CardTitle className="text-2xl text-[var(--quiz-ink)]">{interpretation.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-8">
                          <Text className="leading-relaxed text-foreground/90">{interpretation.summary}</Text>

                          <div className={`grid gap-6 ${interpretation.tensions.length > 0 ? "md:grid-cols-2" : ""}`}>
                            {interpretation.tensions.length > 0 ? (
                              <div className="rounded-2xl border border-[var(--quiz-border)] bg-[var(--quiz-surface-accent)] p-6">
                                <Heading level="h4" className="mb-4 text-lg text-[var(--quiz-accent)]">
                                  {t("interpretationTensionsTitle")}
                                </Heading>
                                <ul className="space-y-3">
                                  {interpretation.tensions.map((tension) => (
                                    <li key={tension} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--quiz-muted)]">
                                      <span className="font-bold text-[var(--quiz-accent)]" aria-hidden="true">
                                        &bull;
                                      </span>
                                      <span>{tension}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

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
                            <Text className="leading-relaxed text-[var(--quiz-muted)]">{interpretation.stageConnection}</Text>
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
                                    <span className="mt-2 block text-sm leading-relaxed text-[var(--quiz-muted)]">{service.reason}</span>
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

                  {fallbackInterpretation ? (
                    <DiagnosticResultShareForm
                      mode="career_anchor_contact"
                      headingLevel="h2"
                      onAccepted={() => {
                        trackCareerAnchorEvent("career_anchor_contact_requested", { locale: analyticsLocale, progress: 100 }, analyticsConsent);
                      }}
                    />
                  ) : null}

                  <div className="space-y-8 py-6 text-center">
                    <div className="mx-auto max-w-2xl space-y-4">
                      <Heading level="h3" as="h2" className="text-2xl text-[var(--quiz-ink)] md:text-3xl">
                        {t("resultsClosingTitle")}
                      </Heading>
                      <Text className="text-lg leading-relaxed text-[var(--quiz-muted)]">{t("resultsClosingText")}</Text>
                    </div>

                    <Button
                      asChild
                      size="lg"
                      variant="default"
                      className={`h-auto min-h-14 w-full max-w-full whitespace-normal px-5 py-3 text-center text-base sm:w-auto sm:px-12 sm:text-lg ${warmPrimaryButtonClass}`}
                    >
                      <Link href="/contacto">{t("resultsClosingCta")}</Link>
                    </Button>

                    <Text className="text-sm text-[var(--quiz-muted)]">{t("resultsDisclaimer")}</Text>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogPrimitive.Root open={step === "transition" || step === "bonus"}>
              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[130] bg-[color-mix(in_srgb,var(--senda-dark)_78%,transparent)] backdrop-blur-md" />
                <DialogPrimitive.Content
                  ref={finalDialogContentRef}
                  aria-describedby="career-anchor-selection-description"
                  className="fixed inset-0 z-[131] overflow-y-auto overscroll-contain bg-[var(--quiz-bg)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] outline-none sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pt-[max(1rem,env(safe-area-inset-top))]"
                  onOpenAutoFocus={(event) => {
                    event.preventDefault();
                    finalDialogTitleRef.current?.focus({ preventScroll: true });
                  }}
                  onEscapeKeyDown={(event) => event.preventDefault()}
                  onPointerDownOutside={(event) => event.preventDefault()}
                  onInteractOutside={(event) => event.preventDefault()}
                  data-testid="career-anchor-final-dialog"
                >
                  {saveStatus === "conflict" ? (
                    <div
                      className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-[var(--quiz-danger)] bg-[var(--quiz-surface-raised)] p-4 text-center shadow-2xl sm:top-[max(1rem,env(safe-area-inset-top))] sm:flex-row sm:justify-between sm:text-left"
                      role="alert"
                    >
                      <Text variant="small" className="font-medium text-[var(--quiz-ink)]">
                        {t("saveConflict")}
                      </Text>
                      <Button size="sm" variant="outline" className={`shrink-0 ${warmSecondaryButtonClass}`} onClick={() => window.location.reload()}>
                        <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                        {t("saveReload")}
                      </Button>
                    </div>
                  ) : null}
                  {step === "transition" ? (
                    <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-3xl items-center justify-center py-3 sm:min-h-[calc(100dvh-2rem)] sm:py-8">
                      <div className="w-full space-y-4 rounded-[24px] border border-[var(--quiz-border)] bg-[var(--quiz-surface-raised)] p-4 text-center shadow-2xl sm:space-y-7 sm:rounded-[32px] sm:p-10">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--quiz-surface-warm)] text-[var(--quiz-accent)] sm:h-16 sm:w-16">
                          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <Text variant="small" className={warmSectionEyebrowClass}>
                            {t("transitionEyebrow")}
                          </Text>
                          <DialogPrimitive.Title
                            ref={finalDialogTitleRef}
                            tabIndex={-1}
                            className="text-balance font-heading text-2xl font-semibold leading-tight text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)] sm:text-4xl"
                          >
                            {t("transitionTitle")}
                          </DialogPrimitive.Title>
                          <DialogPrimitive.Description id="career-anchor-selection-description" className="mx-auto max-w-2xl text-pretty text-base leading-relaxed text-[var(--quiz-muted)] sm:text-lg">
                            {t("transitionText")}
                          </DialogPrimitive.Description>
                        </div>
                        <div className="mx-auto grid max-w-2xl gap-3 text-left sm:grid-cols-2">
                          <div className="rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-accent)] p-3 sm:p-5">
                            <Text className="font-semibold text-[var(--quiz-ink)]">{t("transitionInstructionTitle")}</Text>
                            <Text variant="small" className="mt-2 leading-relaxed text-[var(--quiz-muted)]">
                              {t("transitionInstructionText")}
                            </Text>
                          </div>
                          <div className="rounded-2xl border border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-warm)] p-3 sm:p-5">
                            <Text className="font-semibold text-[var(--quiz-ink)]">{t("transitionTimeTitle")}</Text>
                            <Text variant="small" className="mt-2 leading-relaxed text-[var(--quiz-muted)]">
                              {t("transitionTimeText")}
                            </Text>
                          </div>
                        </div>
                        {saveStatus === "saving" || saveStatus === "saved" ? (
                          <div className="flex min-h-6 items-center justify-center gap-2 text-sm text-[var(--quiz-muted)]" role="status" aria-live="polite">
                            {saveStatus === "saving" ? (
                              <>
                                <Save className="h-4 w-4" aria-hidden="true" />
                                {t("saveSaving")}
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                {t("saveSaved")}
                              </>
                            )}
                          </div>
                        ) : null}
                        {saveStatus === "offline" || saveStatus === "error" ? (
                          <div
                            className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-[var(--quiz-danger)] bg-[var(--quiz-danger-soft)] p-3 text-center sm:flex-row sm:justify-between sm:text-left"
                            role="alert"
                          >
                            <Text variant="small" className="text-[var(--quiz-ink)]">
                              {saveStatus === "offline" ? t("saveOffline") : t("saveError")}
                            </Text>
                            <Button size="sm" variant="outline" className={`min-h-11 shrink-0 ${warmSecondaryButtonClass}`} onClick={() => void persistProgress(latestProgressRef.current)}>
                              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                              {t("saveRetry")}
                            </Button>
                          </div>
                        ) : null}
                        <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row">
                          <Button
                            variant="outline"
                            className={warmSecondaryButtonClass}
                            disabled={saveStatus === "conflict"}
                            onClick={() => {
                              setCurrentStatementIndex(39);
                              setStep("questions");
                            }}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                            {t("transitionReview")}
                          </Button>
                          <Button
                            size="lg"
                            className={`px-8 ${warmPrimaryButtonClass}`}
                            disabled={saveStatus === "conflict"}
                            onClick={() => {
                              setSelectionPage(0);
                              setStep("bonus");
                              trackCareerAnchorEvent(
                                "career_anchor_final_selection_started",
                                {
                                  locale: analyticsLocale,
                                  statement: 40,
                                  progress: 100,
                                },
                                analyticsConsent,
                              );
                            }}
                          >
                            {t("transitionCta")}
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : step === "bonus" ? (
                    <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col py-1 sm:min-h-[calc(100dvh-2rem)] sm:py-6">
                      <header className="sticky top-0 z-10 -mx-0.5 mb-3 rounded-[20px] border border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-raised)_96%,transparent)] p-3 shadow-lg backdrop-blur-md sm:-mx-1 sm:mb-5 sm:rounded-[28px] sm:p-7">
                        <div className="flex items-start justify-between gap-2 sm:gap-5">
                          <div className="min-w-0 max-w-3xl space-y-1 sm:space-y-2">
                            <Text variant="small" className={warmSectionEyebrowClass}>
                              {t("selectionEyebrow")}
                            </Text>
                            <DialogPrimitive.Title
                              ref={finalDialogTitleRef}
                              tabIndex={-1}
                              className="font-heading text-xl font-semibold leading-tight text-[var(--quiz-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)] sm:text-3xl"
                            >
                              {t("selectionTitle")}
                            </DialogPrimitive.Title>
                          </div>
                          <div
                            className={`shrink-0 rounded-full border px-3 py-2 text-center text-xs font-bold tabular-nums sm:px-5 sm:py-3 sm:text-sm ${
                              bonusQuestions.length === 3
                                ? "border-[var(--quiz-accent)] bg-[var(--quiz-surface-accent)] text-[var(--quiz-ink)]"
                                : "border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] text-[var(--quiz-accent)]"
                            }`}
                            role="status"
                            aria-live="polite"
                            data-testid="career-anchor-selection-count"
                          >
                            <span className="sr-only">
                              {t("selectionCount", {
                                count: bonusQuestions.length,
                              })}
                            </span>
                            <span className="sm:hidden" aria-hidden="true">
                              {t("selectionCountShort", {
                                count: bonusQuestions.length,
                              })}
                            </span>
                            <span className="hidden sm:inline" aria-hidden="true">
                              {t("selectionCount", {
                                count: bonusQuestions.length,
                              })}
                            </span>
                          </div>
                        </div>
                        <DialogPrimitive.Description
                          id="career-anchor-selection-description"
                          className="mt-2 line-clamp-2 text-xs leading-snug text-[var(--quiz-muted)] sm:line-clamp-none sm:text-base sm:leading-relaxed"
                        >
                          {t("selectionDescription")}
                        </DialogPrimitive.Description>
                        <div className="mt-3 flex items-center gap-2 sm:mt-5 sm:gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--quiz-accent-soft)]">
                            <div
                              className="h-full origin-left rounded-full bg-[var(--quiz-accent)] transition-transform motion-reduce:transition-none"
                              style={{
                                transform: `scaleX(${(selectionPage + 1) / selectionPageCount})`,
                              }}
                            />
                          </div>
                          <Text variant="small" className="font-semibold tabular-nums text-[var(--quiz-muted)]" role="status" aria-live="polite">
                            {t("selectionPage", {
                              current: selectionPage + 1,
                              total: selectionPageCount,
                            })}
                          </Text>
                        </div>
                      </header>

                      <div className="grid flex-1 gap-2 sm:gap-3" data-testid="career-anchor-selection-list">
                        {selectionStatements.map((statement) => {
                          const selected = bonusQuestions.includes(statement.id);
                          const responseValue = answers[statement.id];
                          const selectionUnavailable = !selected && bonusQuestions.length >= 3;

                          return (
                            <label
                              key={statement.id}
                              className={`group flex cursor-pointer gap-3 rounded-[18px] border p-3 transition-[background-color,border-color,box-shadow,transform] focus-within:ring-2 focus-within:ring-[var(--quiz-accent)] focus-within:ring-offset-2 sm:min-h-24 sm:gap-4 sm:rounded-[22px] sm:p-5 ${
                                selected
                                  ? "border-[var(--quiz-accent)] bg-[var(--quiz-surface-accent)] shadow-md"
                                  : selectionUnavailable
                                    ? "cursor-not-allowed border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-muted)] opacity-65"
                                    : "border-[var(--quiz-border-soft)] bg-[var(--quiz-surface-raised)] hover:-translate-y-0.5 hover:border-[var(--quiz-accent)] hover:shadow-sm motion-reduce:hover:translate-y-0"
                              }`}
                              data-testid={`career-anchor-selection-${statement.id}`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={selected}
                                disabled={selectionUnavailable || isRecordingAttempt || saveStatus === "conflict"}
                                onChange={() => handleBonusToggle(statement.id)}
                                aria-describedby={`career-anchor-response-${statement.id}`}
                              />
                              <span
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                                  selected ? "border-[var(--quiz-accent)] bg-[var(--senda-dark)] text-[var(--senda-light)]" : "border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-transparent"
                                }`}
                                aria-hidden="true"
                              >
                                ✓
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[var(--quiz-accent)]">
                                  {t("selectionStatement", {
                                    number: statement.id,
                                  })}
                                </span>
                                <span className="mt-1 block text-pretty text-sm font-medium leading-snug text-[var(--quiz-ink)] sm:text-base sm:leading-relaxed">{statement.text}</span>
                                <span id={`career-anchor-response-${statement.id}`} className="mt-1 block text-xs text-[var(--quiz-muted)] sm:mt-2 sm:text-sm">
                                  {t("selectionOriginalResponse", {
                                    value: responseValue,
                                    label: t(`scaleResponse${responseValue}`),
                                  })}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <footer className="sticky bottom-0 z-10 -mx-0.5 mt-3 rounded-[20px] border border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-raised)_97%,transparent)] p-3 shadow-[0_-18px_48px_-36px_var(--quiz-shadow)] backdrop-blur-md sm:-mx-1 sm:mt-5 sm:rounded-[28px] sm:p-5">
                        {saveStatus === "saving" || saveStatus === "saved" ? (
                          <div className="mb-2 flex min-h-6 items-center justify-center gap-2 text-sm text-[var(--quiz-muted)]" role="status" aria-live="polite">
                            {saveStatus === "saving" ? (
                              <>
                                <Save className="h-4 w-4" aria-hidden="true" />
                                {t("saveSaving")}
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                {t("saveSaved")}
                              </>
                            )}
                          </div>
                        ) : null}
                        {saveStatus === "offline" || saveStatus === "error" ? (
                          <div
                            className="mb-3 flex flex-col items-center gap-2 rounded-xl border border-[var(--quiz-danger)] bg-[var(--quiz-danger-soft)] p-2 text-center sm:flex-row sm:justify-between sm:text-left"
                            role="alert"
                          >
                            <Text variant="small" className="text-[var(--quiz-ink)]">
                              {saveStatus === "offline" ? t("saveOffline") : t("saveError")}
                            </Text>
                            <Button size="sm" variant="outline" className={`min-h-11 shrink-0 ${warmSecondaryButtonClass}`} onClick={() => void persistProgress(latestProgressRef.current)}>
                              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                              {t("saveRetry")}
                            </Button>
                          </div>
                        ) : null}
                        {completionError ? (
                          <Text role="alert" className="mb-3 text-center text-sm text-[var(--quiz-danger)]">
                            {completionError}
                          </Text>
                        ) : null}
                        {isRecordingAttempt ? (
                          <div className="mb-3 flex items-center justify-center gap-3 text-sm text-[var(--quiz-muted)]" role="status" aria-live="polite">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--quiz-accent-soft)] border-t-[var(--quiz-accent)] motion-reduce:animate-none" aria-hidden="true" />
                            <span>{t("selectionPreparing")}</span>
                          </div>
                        ) : null}
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
                          <Button
                            variant="outline"
                            className={`min-w-0 px-2 ${warmSecondaryButtonClass}`}
                            disabled={isRecordingAttempt}
                            aria-label={selectionPage === 0 ? t("selectionBackToTransition") : t("selectionPrevious")}
                            onClick={() => {
                              if (selectionPage === 0) {
                                setStep("transition");
                              } else {
                                setSelectionPage((page) => page - 1);
                              }
                            }}
                          >
                            <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" aria-hidden="true" />
                            <span className="sm:hidden">{selectionPage === 0 ? t("selectionBackShort") : t("selectionPreviousShort")}</span>
                            <span className="hidden sm:inline">{selectionPage === 0 ? t("selectionBackToTransition") : t("selectionPrevious")}</span>
                          </Button>
                          {selectionPage < selectionPageCount - 1 ? (
                            <Button
                              className={`px-3 sm:px-8 ${warmPrimaryButtonClass}`}
                              disabled={isRecordingAttempt}
                              aria-label={t("selectionNext")}
                              onClick={() => setSelectionPage((page) => page + 1)}
                            >
                              <span className="sm:hidden">{t("selectionNextShort")}</span>
                              <span className="hidden sm:inline">{t("selectionNext")}</span>
                              <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
                            </Button>
                          ) : (
                            <Button
                              className={`px-3 sm:h-12 sm:px-8 sm:text-base ${warmPrimaryButtonClass}`}
                              disabled={bonusQuestions.length !== 3 || isRecordingAttempt || saveStatus === "conflict"}
                              aria-label={t("selectionFinish")}
                              onClick={() => void finishBonusSelection()}
                            >
                              {isRecordingAttempt ? (
                                t("selectionPreparingShort")
                              ) : (
                                <>
                                  <span className="sm:hidden">{t("selectionFinishShort")}</span>
                                  <span className="hidden sm:inline">{t("selectionFinish")}</span>
                                </>
                              )}
                              {!isRecordingAttempt ? <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                            </Button>
                          )}
                        </div>
                      </footer>
                    </div>
                  ) : null}
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          </MotionConfig>
        </div>
      </Container>
    </div>
  );
}
