"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import {
  CONTACT_REQUEST_HEADER,
  CONTACT_REQUEST_HEADER_VALUE,
} from "@/lib/contact/request-security";
import {
  CONTACT_LIMITS,
  contactSubmissionSchema,
  getContactFieldNames,
  type ContactField,
} from "@/lib/contact/schema";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  explorationInterest: string;
  consent: boolean;
  companyWebsite: string;
};

type FieldName = Exclude<ContactField, "message">;

type ApiError =
  | "invalid"
  | "tooLarge"
  | "rateLimit"
  | "origin"
  | "config"
  | "send"
  | "unexpected";

const EMPTY_FORM: FormValues = {
  name: "",
  email: "",
  phone: "",
  explorationInterest: "",
  consent: false,
  companyWebsite: "",
};

const API_ERROR_CODES = new Set<ApiError>([
  "invalid",
  "tooLarge",
  "rateLimit",
  "origin",
  "config",
  "send",
  "unexpected",
]);

const FORM_ORIGIN = "laboratorio_nuevas_narrativas";
const FIELD_ERROR_KEYS: Record<FieldName, string> = {
  name: "errors.name",
  email: "errors.email",
  phone: "errors.phone",
  explorationInterest: "errors.explorationInterest",
  consent: "errors.consent",
};

function parseApiError(value: unknown): ApiError {
  if (!value || typeof value !== "object" || !("code" in value)) return "unexpected";
  const code = (value as { code?: unknown }).code;
  return typeof code === "string" && API_ERROR_CODES.has(code as ApiError)
    ? (code as ApiError)
    : "unexpected";
}

function controlClassName(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-[var(--senda-stone)] px-4 py-3 text-base text-[var(--senda-ink)] transition-[border-color,box-shadow,background-color]",
    "placeholder:text-[var(--senda-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)]/55",
    hasError ? "border-destructive" : "border-[var(--senda-border)]",
  ].join(" ");
}

export function LaboratoryInterestForm() {
  const t = useTranslations("NarrativesLab.form");
  const locale = useLocale() === "en" ? "en" : "es";
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function updateField<Field extends keyof FormValues>(field: Field, value: FormValues[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field !== "companyWebsite") {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    setFormError(null);
  }

  function focusFormError() {
    window.requestAnimationFrame(() => formErrorRef.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const sourcePage = locale === "en"
      ? "/en/laboratorio-nuevas-narrativas"
      : "/laboratorio-nuevas-narrativas";
    const parsed = contactSubmissionSchema.safeParse({
      ...form,
      formOrigin: FORM_ORIGIN,
      sourcePage,
      locale,
    });

    if (!parsed.success) {
      const errors: Partial<Record<FieldName, string>> = {};
      const invalidFields = getContactFieldNames(parsed.error).filter(
        (field): field is FieldName => field !== "message",
      );
      for (const field of invalidFields) {
        errors[field] = t(FIELD_ERROR_KEYS[field]);
      }
      setFieldErrors(errors);
      setFormError(t("errors.invalid"));
      window.requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          [CONTACT_REQUEST_HEADER]: CONTACT_REQUEST_HEADER_VALUE,
        },
        body: JSON.stringify(parsed.data),
      });
      const body: unknown = await response.json().catch(() => null);
      const accepted = response.status === 200
        && body !== null
        && typeof body === "object"
        && "ok" in body
        && body.ok === true;

      if (!accepted) {
        setFormError(t(`errors.${parseApiError(body)}`));
        setStatus("idle");
        focusFormError();
        return;
      }

      setStatus("success");
    } catch {
      setFormError(t("errors.unexpected"));
      setStatus("idle");
      focusFormError();
    }
  }

  if (status === "success") {
    return (
      <div
        className="senda-editorial-card rounded-[1.4rem] p-7 text-center sm:p-10"
        role="status"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--senda-border)] bg-[var(--senda-stone)] text-[var(--senda-accent)]">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 12.5 3.5 3.5L18 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="mt-6 font-heading text-2xl font-medium text-[var(--senda-ink)]">
          {t("successTitle")}
        </h3>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[var(--senda-muted)]">
          {t("successDescription")}
        </p>
      </div>
    );
  }

  const fieldId = (name: string) => `${id}-${name}`;

  return (
    <div className="senda-editorial-card rounded-[1.4rem] p-6 sm:p-8 lg:p-10">
      <h3 className="font-heading text-2xl font-medium text-[var(--senda-ink)] sm:text-3xl">
        {t("title")}
      </h3>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--senda-muted)]">
        {t("description")}
      </p>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="mt-7 space-y-5"
        aria-busy={status === "submitting"}
      >
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {status === "submitting" ? t("submitting") : ""}
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={fieldId("name")} className="mb-2 block text-sm font-semibold text-[var(--senda-ink)]">
              {t("labels.name")}
            </label>
            <input
              id={fieldId("name")}
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={CONTACT_LIMITS.name}
              value={form.name}
              disabled={status === "submitting"}
              onChange={(event) => updateField("name", event.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? fieldId("name-error") : undefined}
              className={controlClassName(Boolean(fieldErrors.name))}
              placeholder={t("placeholders.name")}
            />
            {fieldErrors.name ? (
              <p id={fieldId("name-error")} className="mt-2 text-sm text-destructive">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={fieldId("email")} className="mb-2 block text-sm font-semibold text-[var(--senda-ink)]">
              {t("labels.email")}
            </label>
            <input
              id={fieldId("email")}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              required
              maxLength={CONTACT_LIMITS.email}
              value={form.email}
              disabled={status === "submitting"}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? fieldId("email-error") : undefined}
              className={controlClassName(Boolean(fieldErrors.email))}
              placeholder={t("placeholders.email")}
            />
            {fieldErrors.email ? (
              <p id={fieldId("email-error")} className="mt-2 text-sm text-destructive">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor={fieldId("phone")} className="mb-2 block text-sm font-semibold text-[var(--senda-ink)]">
            {t("labels.phone")}
          </label>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={CONTACT_LIMITS.phone}
            value={form.phone}
            disabled={status === "submitting"}
            onChange={(event) => updateField("phone", event.target.value)}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? fieldId("phone-error") : undefined}
            className={controlClassName(Boolean(fieldErrors.phone))}
            placeholder={t("placeholders.phone")}
          />
          {fieldErrors.phone ? (
            <p id={fieldId("phone-error")} className="mt-2 text-sm text-destructive">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={fieldId("exploration-interest")} className="mb-2 block text-sm font-semibold text-[var(--senda-ink)]">
            {t("labels.explorationInterest")}
          </label>
          <textarea
            id={fieldId("exploration-interest")}
            name="explorationInterest"
            rows={5}
            maxLength={CONTACT_LIMITS.explorationInterest}
            value={form.explorationInterest}
            disabled={status === "submitting"}
            onChange={(event) => updateField("explorationInterest", event.target.value)}
            aria-invalid={Boolean(fieldErrors.explorationInterest)}
            aria-describedby={fieldErrors.explorationInterest ? fieldId("exploration-interest-error") : undefined}
            className={`${controlClassName(Boolean(fieldErrors.explorationInterest))} min-h-32 resize-y`}
            placeholder={t("placeholders.explorationInterest")}
          />
          {fieldErrors.explorationInterest ? (
            <p id={fieldId("exploration-interest-error")} className="mt-2 text-sm text-destructive">
              {fieldErrors.explorationInterest}
            </p>
          ) : null}
        </div>

        <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" inert>
          <label htmlFor={fieldId("company-website")}>Website</label>
          <input
            id={fieldId("company-website")}
            name="companyWebsite"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            disabled={status === "submitting"}
            maxLength={CONTACT_LIMITS.honeypot}
            value={form.companyWebsite}
            onChange={(event) => updateField("companyWebsite", event.target.value)}
          />
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm leading-6 text-[var(--senda-muted)]">
            <input
              type="checkbox"
              name="consent"
              required
              checked={form.consent}
              disabled={status === "submitting"}
              onChange={(event) => updateField("consent", event.target.checked)}
              aria-invalid={Boolean(fieldErrors.consent)}
              aria-describedby={fieldErrors.consent ? fieldId("consent-error") : undefined}
              className="mt-1 h-4 w-4 flex-none accent-[var(--senda-action)]"
            />
            <span>{t("consent")}</span>
          </label>
          <Link
            href="/privacidad"
            className="ml-7 mt-2 inline-flex text-sm font-semibold text-[var(--senda-accent-dark)] underline decoration-[var(--senda-terracotta)]/55 underline-offset-4 hover:text-[var(--senda-accent)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)]/55"
          >
            {t("privacyLink")}
          </Link>
          {fieldErrors.consent ? (
            <p id={fieldId("consent-error")} className="mt-2 text-sm text-destructive">
              {fieldErrors.consent}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p
            ref={formErrorRef}
            className="text-sm leading-6 text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)]/55"
            role="alert"
            tabIndex={-1}
          >
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--senda-action)] px-7 py-3 text-base font-bold text-white shadow-[0_18px_36px_-24px_rgba(10,20,34,0.7)] transition-colors hover:bg-[var(--senda-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-paper)] disabled:cursor-wait disabled:opacity-65 sm:w-auto"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
          <svg className="ml-2 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m2.5 3 11 5-11 5 2-5-2-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}
