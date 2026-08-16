"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Link } from "@/navigation";
import { DiagnosticResultShareForm } from "@/components/forms/diagnostic-result-share-form";
import {
  calculateRouteFinderResult,
  diagnosticUrgencies,
  routeFinderNeeds,
  routeFinderSituations,
  routeFinderStages,
  toShareableDiagnosticResult,
  type RouteFinderAnswers,
  type RouteFinderDimension,
  type RouteFinderResult,
  type ShareableDiagnosticResult,
} from "@/lib/diagnostics/initial-diagnostic";
import { cn } from "@/lib/utils";

const ANSWERS_STORAGE_KEY = "senda_route_finder_answers_v1";

const situationOptions = routeFinderSituations.map((value) => ({
  value,
  messageKey: `options.situation.${value}` as const,
}));

const needOptions = routeFinderNeeds.map((value) => ({
  value,
  messageKey: `options.need.${value}` as const,
}));

const stageOptions = routeFinderStages.map((value) => ({
  value,
  messageKey: `options.stage.${value}` as const,
}));

const urgencyMessageKeys = {
  exploring: "options.urgency.exploring",
  "move-soon": "options.urgency.soon",
  "short-term-decision": "options.urgency.decision",
  urgent: "options.urgency.urgent",
} as const;

const urgencyOptions = diagnosticUrgencies.map((value) => ({
  value,
  messageKey: urgencyMessageKeys[value],
}));

const steps = [
  {
    field: "situation",
    questionKey: "questions.situation",
    options: situationOptions,
  },
  {
    field: "need",
    questionKey: "questions.need",
    options: needOptions,
  },
  {
    field: "careerStage",
    questionKey: "questions.stage",
    options: stageOptions,
  },
  {
    field: "urgency",
    questionKey: "questions.urgency",
    options: urgencyOptions,
  },
] as const;

type RouteFinderDraft = Partial<Record<RouteFinderDimension, string>>;

function toCompleteAnswers(draft: RouteFinderDraft): RouteFinderAnswers | null {
  const { situation, need, careerStage, urgency } = draft;
  if (
    !routeFinderSituations.includes(situation as RouteFinderAnswers["situation"])
    || !routeFinderNeeds.includes(need as RouteFinderAnswers["need"])
    || !routeFinderStages.includes(careerStage as RouteFinderAnswers["careerStage"])
    || !diagnosticUrgencies.includes(urgency as RouteFinderAnswers["urgency"])
  ) {
    return null;
  }

  return {
    situation: situation as RouteFinderAnswers["situation"],
    need: need as RouteFinderAnswers["need"],
    careerStage: careerStage as RouteFinderAnswers["careerStage"],
    urgency: urgency as RouteFinderAnswers["urgency"],
  };
}

function signalMessageKey(dimension: RouteFinderDimension, value: string) {
  const step = steps.find((candidate) => candidate.field === dimension);
  return step?.options.find((option) => option.value === value)?.messageKey;
}

export type InitialDiagnosticFormProps = {
  /** Optional integration point for a future consent-based result form. */
  renderResultShare?: (result: ShareableDiagnosticResult) => React.ReactNode;
};

export function InitialDiagnosticForm({ renderResultShare }: InitialDiagnosticFormProps = {}) {
  const t = useTranslations("InitialDiagnostic");
  const locale = useLocale() === "en" ? "en" : "es";
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<RouteFinderDraft>({});
  const [selectionError, setSelectionError] = useState(false);
  const [result, setResult] = useState<RouteFinderResult | null>(null);
  const [shareableResult, setShareableResult] = useState<ShareableDiagnosticResult | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const questionLegendRef = useRef<HTMLLegendElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (result) resultHeadingRef.current?.focus();
  }, [result]);

  useEffect(() => {
    if (result) return;
    let stored: unknown;
    try {
      const raw = window.localStorage.getItem(ANSWERS_STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      return;
    }
    const completeAnswers = toCompleteAnswers((stored ?? {}) as RouteFinderDraft);
    if (!completeAnswers) return;

    const previousResult = calculateRouteFinderResult(completeAnswers);
    setAnswers(completeAnswers);
    setResult(previousResult);
    setShareableResult(toShareableDiagnosticResult(previousResult, locale));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!result) questionLegendRef.current?.focus();
  }, [result, stepIndex]);

  if (result) {
    const primaryRouteKey = `results.routes.${result.primary.messageKey}` as const;
    const secondaryRouteKey = result.secondary
      ? (`results.routes.${result.secondary.messageKey}` as const)
      : null;
    const situationKey = signalMessageKey("situation", result.answers.situation);
    const resultForSharing = {
      questionnaire: "route_finder" as const,
      situation: situationKey ? t(situationKey) : undefined,
      recommendedService: t(`${primaryRouteKey}.title`),
      alternativeService: secondaryRouteKey ? t(`${secondaryRouteKey}.title`) : undefined,
      summary: `${t(`${primaryRouteKey}.description`)} ${t("results.disclaimer")}`,
    };

    return (
      <>
      <div className="space-y-8 pb-24" aria-live="polite">
        <div>
          <p className="senda-kicker">{t("results.eyebrow")}</p>
          <h2
            id="primary-route-title"
            ref={resultHeadingRef}
            tabIndex={-1}
            className="mt-5 max-w-[16ch] text-pretty font-heading text-4xl leading-[1.04] tracking-[-0.035em] text-[var(--senda-ink)] outline-none sm:text-5xl"
          >
            {t(`${primaryRouteKey}.title`)}
          </h2>
          {situationKey ? (
            <p className="mt-4 text-base leading-7 text-[var(--senda-muted)]">
              <span className="mr-2 font-bold text-[var(--senda-ink)]">{t("results.situationLabel")}:</span>
              {t(situationKey)}
            </p>
          ) : null}
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--senda-muted)]">
            {t(`${primaryRouteKey}.description`)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={result.primary.href}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[var(--senda-action)] px-8 text-base font-bold text-white transition-colors hover:bg-[var(--senda-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-paper)]"
          >
            {t("results.exploreService")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/contacto"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[var(--senda-border)] bg-[var(--senda-paper)] px-8 text-base font-bold text-[var(--senda-ink)] transition-colors hover:border-[var(--senda-olive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)]"
          >
            {t("results.contactCta")}
          </Link>
        </div>

        {secondaryRouteKey && result.secondary ? (
          <section className="rounded-[1.5rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] p-6 sm:p-7" aria-labelledby="secondary-route-title">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-muted)]">
              {t("results.secondaryLabel")}
            </p>
            <h3 id="secondary-route-title" className="mt-3 font-heading text-2xl leading-tight text-[var(--senda-ink)]">
              {t(`${secondaryRouteKey}.title`)}
            </h3>
            <p className="mt-3 text-base leading-7 text-[var(--senda-muted)]">
              {t(`${secondaryRouteKey}.description`)}
            </p>
            <Link href={result.secondary.href} className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-[var(--senda-action)] underline decoration-[var(--senda-terracotta)]/50 underline-offset-4">
              {t("results.exploreService")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] p-6 sm:p-7" aria-labelledby="signals-title">
            <h3 id="signals-title" className="font-heading text-2xl text-[var(--senda-ink)]">
              {t("results.signalsTitle")}
            </h3>
            <ul className="mt-5 space-y-4">
              {result.signals.map((signal) => {
                const messageKey = signalMessageKey(signal.dimension, signal.value);
                if (!messageKey) return null;
                return (
                  <li key={`${signal.dimension}-${signal.value}`} className="flex items-start gap-3 text-sm leading-6 text-[var(--senda-muted)]">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--senda-olive)] text-[var(--senda-on-olive)]" aria-hidden="true">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span>{t(messageKey)}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] p-6 sm:p-7" aria-labelledby="work-on-title">
            <h3 id="work-on-title" className="font-heading text-2xl text-[var(--senda-ink)]">
              {t("results.workOnTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {result.primary.workOnKeys.map((workOnKey) => (
                <li key={workOnKey} className="flex items-start gap-3 text-sm leading-6 text-[var(--senda-muted)]">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[var(--senda-terracotta)]" aria-hidden="true" />
                  <span>{t(`${primaryRouteKey}.workOn.${workOnKey}`)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {result.urgentHumanContact ? (
          <aside className="rounded-[1.5rem] border border-[var(--senda-terracotta)]/45 bg-[color-mix(in_srgb,var(--senda-terracotta)_10%,var(--senda-paper))] p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-[var(--senda-terracotta)]" aria-hidden="true" />
              <div>
                <h3 className="font-heading text-xl text-[var(--senda-ink)]">{t("results.urgentTitle")}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--senda-muted)]">{t("results.urgentDescription")}</p>
                <Link href="/contacto" className="mt-4 inline-flex min-h-11 items-center font-bold text-[var(--senda-action)] underline underline-offset-4">
                  {t("results.contactCta")}
                </Link>
              </div>
            </div>
          </aside>
        ) : null}

        <p className="border-l border-[var(--senda-terracotta)]/55 pl-4 text-sm leading-6 text-[var(--senda-muted)]">
          {t("results.disclaimer")}
        </p>

        {shareableResult
          ? renderResultShare
            ? renderResultShare(shareableResult)
            : <DiagnosticResultShareForm result={resultForSharing} />
          : null}

        <div className="flex flex-col gap-3 border-t border-[var(--senda-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setStepIndex(0);
              setSelectionError(false);
              setResult(null);
              setShareableResult(null);
              try {
                window.localStorage.removeItem(ANSWERS_STORAGE_KEY);
              } catch {
                // Storage is optional; the questionnaire remains fully usable.
              }
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--senda-border)] bg-[var(--senda-paper)] px-6 py-3 text-sm font-bold text-[var(--senda-ink)] hover:border-[var(--senda-olive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t("results.restart")}
          </button>
          {!result.urgentHumanContact ? (
            <Link href="/contacto" className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-[var(--senda-action)] underline underline-offset-4">
              {t("results.contactCta")}
            </Link>
          ) : null}
        </div>
      </div>

      {mounted
        ? createPortal(
            <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-[var(--senda-border)] bg-[color-mix(in_srgb,var(--senda-paper)_96%,transparent)] px-4 py-3 shadow-[0_-18px_40px_-28px_rgba(10,20,34,.35)] backdrop-blur-sm">
              <Link
                href={result.primary.href}
                className="inline-flex min-h-12 w-full max-w-md items-center justify-center gap-2 rounded-full bg-[var(--senda-action)] px-8 text-base font-bold text-white transition-colors hover:bg-[var(--senda-action-hover)]"
              >
                {t("results.exploreService")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>,
            document.body,
          )
        : null}
      </>
    );
  }

  const currentStep = steps[stepIndex];
  const selectedValue = answers[currentStep.field];

  function continueQuestionnaire() {
    if (!selectedValue) {
      setSelectionError(true);
      return;
    }

    if (stepIndex < steps.length - 1) {
      setSelectionError(false);
      setStepIndex((current) => current + 1);
      return;
    }

    const completeAnswers = toCompleteAnswers(answers);
    if (!completeAnswers) {
      setSelectionError(true);
      return;
    }

    const nextResult = calculateRouteFinderResult(completeAnswers);
    const nextShareableResult = toShareableDiagnosticResult(nextResult, locale);
    setSelectionError(false);
    setResult(nextResult);
    setShareableResult(nextShareableResult);

    try {
      window.localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(completeAnswers));
    } catch {
      // Storage is optional; calculation and rendering do not depend on it.
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        continueQuestionnaire();
      }}
      noValidate
    >
      <div className="mb-8 flex items-center justify-between gap-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-muted)]">
          {t("progress", { current: stepIndex + 1, total: steps.length })}
        </p>
        <div
          className="flex flex-1 gap-1.5"
          role="progressbar"
          aria-label={t("progress", { current: stepIndex + 1, total: steps.length })}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={stepIndex + 1}
        >
          {steps.map((step, index) => (
            <span
              key={step.field}
              className={cn(
                "h-1 flex-1 rounded-full",
                index <= stepIndex ? "bg-[var(--senda-terracotta)]" : "bg-[var(--senda-border)]",
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <fieldset aria-describedby={selectionError ? `${currentStep.field}-error` : undefined}>
        <legend
          ref={questionLegendRef}
          tabIndex={-1}
          className="max-w-[19ch] text-pretty font-heading text-3xl leading-tight text-[var(--senda-ink)] outline-none sm:text-4xl"
        >
          {t(currentStep.questionKey)}
        </legend>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {currentStep.options.map((option) => {
            const checked = selectedValue === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "group flex min-h-14 cursor-pointer items-center gap-4 rounded-[1.1rem] border p-4 text-left transition-[background-color,border-color,box-shadow,transform] focus-within:ring-2 focus-within:ring-[var(--senda-olive)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--senda-bg)] motion-reduce:transition-none",
                  checked
                    ? "border-[var(--senda-olive)] bg-[color-mix(in_srgb,var(--senda-olive)_14%,var(--senda-paper))] shadow-[0_18px_38px_-30px_rgba(10,20,34,.5)]"
                    : "border-[var(--senda-border)] bg-[var(--senda-paper)] hover:-translate-y-0.5 hover:border-[var(--senda-olive)]/55 motion-reduce:hover:transform-none",
                )}
              >
                <input
                  type="radio"
                  name={currentStep.field}
                  value={option.value}
                  checked={checked}
                  onChange={() => {
                    setAnswers((current) => ({ ...current, [currentStep.field]: option.value }));
                    setSelectionError(false);
                  }}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    checked
                      ? "border-[var(--senda-olive)] bg-[var(--senda-olive)] text-[var(--senda-on-olive)]"
                      : "border-[var(--senda-border)] bg-[var(--senda-card)] text-transparent",
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-base font-medium leading-6 text-[var(--senda-ink)]">
                  {t(option.messageKey)}
                </span>
              </label>
            );
          })}
        </div>
        {selectionError ? (
          <p id={`${currentStep.field}-error`} className="mt-4 text-sm font-semibold text-[var(--quiz-danger)]" role="alert">
            {t("errors.selection")}
          </p>
        ) : null}
      </fieldset>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--senda-border)] pt-6">
        <button
          type="button"
          onClick={() => {
            setSelectionError(false);
            setStepIndex((current) => Math.max(0, current - 1));
          }}
          disabled={stepIndex === 0}
          className="inline-flex min-h-12 items-center gap-2 rounded-full px-3 font-semibold text-[var(--senda-muted)] hover:text-[var(--senda-ink)] disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("back")}
        </button>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--senda-action)] px-6 py-3 font-semibold text-white hover:bg-[var(--senda-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-bg)]"
        >
          {stepIndex === steps.length - 1 ? t("submit") : t("next")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
