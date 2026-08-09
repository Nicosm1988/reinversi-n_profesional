"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch, type FieldPath, type UseFormRegister } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from "lucide-react";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";

type DiagnosticFormData = {
  situation: string;
  need: string;
  careerStage: string;
  urgency: string;
  fullName: string;
  email: string;
  phone: string;
  consentAccepted: boolean;
};

type Option = { value: string; label: string };

function OptionFieldset({
  legend,
  name,
  options,
  register,
  selected,
  error,
}: {
  legend: string;
  name: "situation" | "need" | "careerStage" | "urgency";
  options: Option[];
  register: UseFormRegister<DiagnosticFormData>;
  selected: string | undefined;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="font-heading text-3xl leading-tight text-[var(--senda-ink)] sm:text-4xl">
        {legend}
      </legend>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "group flex min-h-24 cursor-pointer items-start gap-4 rounded-[1.4rem] border p-5 text-left transition-[background-color,border-color,box-shadow,transform] focus-within:ring-2 focus-within:ring-[var(--senda-olive)] focus-within:ring-offset-2",
                checked
                  ? "border-[var(--senda-olive)] bg-[#edf0e7] shadow-[0_18px_38px_-30px_rgba(45,55,37,.65)]"
                  : "border-[var(--senda-border)] bg-[var(--senda-paper)] hover:-translate-y-0.5 hover:border-[var(--senda-olive)]/55",
              )}
            >
              <input
                type="radio"
                value={option.value}
                className="peer sr-only"
                {...register(name, { required: true })}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  checked
                    ? "border-[var(--senda-olive)] bg-[var(--senda-olive)] text-white"
                    : "border-[#bbb5a8] bg-white text-transparent",
                )}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-[15px] font-medium leading-6 text-[var(--senda-ink)]">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error ? <p id={`${name}-error`} className="mt-4 text-sm font-semibold text-[#9f422d]" role="alert">{error}</p> : null}
    </fieldset>
  );
}

const stepFields: FieldPath<DiagnosticFormData>[][] = [
  ["situation"],
  ["need"],
  ["careerStage"],
  ["urgency"],
  ["fullName", "email", "consentAccepted"],
];

export function InitialDiagnosticForm() {
  const t = useTranslations("InitialDiagnostic");
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [captchaError, setCaptchaError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const {
    register,
    control,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DiagnosticFormData>({
    mode: "onTouched",
    defaultValues: {
      situation: "",
      need: "",
      careerStage: "",
      urgency: "",
      fullName: "",
      email: "",
      phone: "",
      consentAccepted: false,
    },
  });

  const values = useWatch({ control });

  const optionSets: Record<"situation" | "need" | "careerStage" | "urgency", Option[]> = {
    situation: [
      { value: "choosing-direction", label: t("options.situation.choosing") },
      { value: "trajectory-no-longer-represents-me", label: t("options.situation.reinvention") },
      { value: "concrete-work-change", label: t("options.situation.transition") },
      { value: "need-clarity", label: t("options.situation.clarity") },
    ],
    need: [
      { value: "know-myself", label: t("options.need.selfKnowledge") },
      { value: "choose-alternatives", label: t("options.need.choose") },
      { value: "redefine-direction", label: t("options.need.redefine") },
      { value: "organize-transition", label: t("options.need.organize") },
      { value: "reposition-professionally", label: t("options.need.reposition") },
      { value: "move-again", label: t("options.need.move") },
    ],
    careerStage: [
      { value: "secondary-school", label: t("options.stage.secondary") },
      { value: "higher-education", label: t("options.stage.education") },
      { value: "early-career", label: t("options.stage.early") },
      { value: "experienced-professional", label: t("options.stage.experienced") },
      { value: "leadership", label: t("options.stage.leadership") },
      { value: "life-stage-change", label: t("options.stage.life") },
    ],
    urgency: [
      { value: "exploring", label: t("options.urgency.exploring") },
      { value: "move-soon", label: t("options.urgency.soon") },
      { value: "short-term-decision", label: t("options.urgency.decision") },
      { value: "urgent", label: t("options.urgency.urgent") },
    ],
  };

  async function goForward() {
    const valid = await trigger(stepFields[step], { shouldFocus: true });
    if (valid) setStep((current) => Math.min(current + 1, stepFields.length - 1));
  }

  async function submit(data: DiagnosticFormData) {
    if (captchaEnabled && !captchaToken) {
      setCaptchaError(true);
      return;
    }

    setSubmitError(null);
    try {
      const response = await fetch("/api/initial-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          phone: data.phone || undefined,
          consentAccepted: true,
          sourcePage: window.location.pathname,
          locale,
          captchaToken,
        }),
      });

      if (!response.ok) {
        setSubmitError(t("errors.submit"));
        return;
      }

      setCompleted(true);
    } catch {
      setSubmitError(t("errors.submit"));
    }
  }

  if (completed) {
    return (
      <div className="rounded-[2rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] p-8 shadow-[0_28px_70px_-52px_rgba(37,42,32,.55)] sm:p-12" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--senda-olive)] text-white">
          <Check className="h-6 w-6" />
        </span>
        <p className="mt-8 font-heading text-3xl leading-tight text-[var(--senda-ink)] sm:text-4xl">{t("success.title")}</p>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--senda-muted)]">{t("success.description")}</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--senda-ink)] px-6 font-semibold text-white hover:bg-[var(--senda-olive)]">
          {t("success.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const fieldError = t("errors.selection");

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div className="mb-8 flex items-center justify-between gap-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-muted)]">
          {t("progress", { current: step + 1, total: stepFields.length })}
        </p>
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {stepFields.map((_, index) => (
            <span key={index} className={cn("h-1 flex-1 rounded-full", index <= step ? "bg-[var(--senda-terracotta)]" : "bg-[#ded8ca]")} />
          ))}
        </div>
      </div>

      <div className="min-h-[23rem]">
        {step === 0 ? (
          <OptionFieldset legend={t("questions.situation")} name="situation" options={optionSets.situation} register={register} selected={values.situation} error={errors.situation ? fieldError : undefined} />
        ) : null}
        {step === 1 ? (
          <OptionFieldset legend={t("questions.need")} name="need" options={optionSets.need} register={register} selected={values.need} error={errors.need ? fieldError : undefined} />
        ) : null}
        {step === 2 ? (
          <OptionFieldset legend={t("questions.stage")} name="careerStage" options={optionSets.careerStage} register={register} selected={values.careerStage} error={errors.careerStage ? fieldError : undefined} />
        ) : null}
        {step === 3 ? (
          <OptionFieldset legend={t("questions.urgency")} name="urgency" options={optionSets.urgency} register={register} selected={values.urgency} error={errors.urgency ? fieldError : undefined} />
        ) : null}
        {step === 4 ? (
          <fieldset>
            <legend className="font-heading text-3xl leading-tight text-[var(--senda-ink)] sm:text-4xl">{t("questions.contact")}</legend>
            <p className="mt-3 text-sm leading-6 text-[var(--senda-muted)]">{t("contactNote")}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[var(--senda-ink)]">
                {t("fields.name")}
                <input
                  autoComplete="name"
                  className="h-12 rounded-xl border border-[var(--senda-border)] bg-white px-4 text-base outline-none transition-shadow focus:ring-2 focus:ring-[var(--senda-olive)]"
                  {...register("fullName", { required: t("errors.name"), minLength: { value: 2, message: t("errors.name") } })}
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName ? <span className="text-xs text-[#9f422d]" role="alert">{errors.fullName.message}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[var(--senda-ink)]">
                {t("fields.email")}
                <input
                  type="email"
                  autoComplete="email"
                  className="h-12 rounded-xl border border-[var(--senda-border)] bg-white px-4 text-base outline-none transition-shadow focus:ring-2 focus:ring-[var(--senda-olive)]"
                  {...register("email", { required: t("errors.email"), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("errors.email") } })}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <span className="text-xs text-[#9f422d]" role="alert">{errors.email.message}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[var(--senda-ink)] sm:col-span-2">
                {t("fields.phone")}
                <input
                  type="tel"
                  autoComplete="tel"
                  className="h-12 rounded-xl border border-[var(--senda-border)] bg-white px-4 text-base outline-none transition-shadow focus:ring-2 focus:ring-[var(--senda-olive)]"
                  {...register("phone")}
                />
              </label>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-[var(--senda-muted)]">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--senda-olive)]" {...register("consentAccepted", { required: t("errors.consent") })} />
              <span>{t.rich("consent", { privacy: (chunks) => <Link href="/privacidad" className="font-semibold underline underline-offset-2">{chunks}</Link> })}</span>
            </label>
            {errors.consentAccepted ? <p className="mt-2 text-xs text-[#9f422d]" role="alert">{errors.consentAccepted.message}</p> : null}

            <TurnstileWidget
              onTokenChange={setCaptchaToken}
              onErrorChange={setCaptchaError}
              action="initial_diagnostic"
              language={locale}
              className="mt-6 min-h-[65px]"
              retryLabel={t("errors.captchaRetry")}
            />
            {captchaError ? <p className="mt-2 text-sm text-[#9f422d]" role="alert">{t("errors.captcha")}</p> : null}
          </fieldset>
        ) : null}
      </div>

      {submitError ? <p className="mb-5 rounded-xl bg-[#f5e3dc] p-4 text-sm font-semibold text-[#8b3926]" role="alert">{submitError}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--senda-border)] pt-6">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0 || isSubmitting}
          className="inline-flex min-h-12 items-center gap-2 rounded-full px-3 font-semibold text-[var(--senda-muted)] hover:text-[var(--senda-ink)] disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("back")}
        </button>
        {step < stepFields.length - 1 ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              void goForward();
            }}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--senda-ink)] px-6 font-semibold text-white hover:bg-[var(--senda-olive)]"
          >
            {t("next")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" disabled={isSubmitting || (captchaEnabled && !captchaToken)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--senda-terracotta)] px-6 font-semibold text-white hover:bg-[#9e5038] disabled:cursor-not-allowed disabled:opacity-55">
            {isSubmitting ? t("sending") : t("submit")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-[var(--senda-muted)]">
        <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> {t("privacyNote")}
      </p>
    </form>
  );
}
