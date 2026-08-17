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
  transitionServiceInterestSlugs,
} from "@/lib/contact/schema";

type ServiceSlug = (typeof transitionServiceInterestSlugs)[number];

type FieldName = "name" | "phone" | "email" | "consent";

type FormValues = {
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  companyWebsite: string;
};

type ApiError = "invalid" | "tooLarge" | "rateLimit" | "origin" | "config" | "send" | "unexpected";

const EMPTY_FORM: FormValues = {
  name: "",
  phone: "",
  email: "",
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

const FIELD_ERROR_KEYS: Record<FieldName, string> = {
  name: "errors.name",
  phone: "errors.phone",
  email: "errors.email",
  consent: "errors.consent",
};

function parseApiError(value: unknown): ApiError {
  if (!value || typeof value !== "object" || !("code" in value)) return "unexpected";
  const code = (value as { code?: unknown }).code;
  return typeof code === "string" && API_ERROR_CODES.has(code as ApiError) ? (code as ApiError) : "unexpected";
}

function controlClassName(hasError: boolean) {
  return [
    "h-11 w-full rounded-lg border bg-[var(--senda-stone)] px-3 text-sm text-[var(--senda-ink)] transition-[border-color,box-shadow,background-color]",
    "placeholder:text-[var(--senda-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)]/55",
    hasError ? "border-destructive" : "border-[var(--senda-border)]",
  ].join(" ");
}

export function ServiceInterestForm({ service }: { service: ServiceSlug }) {
  const t = useTranslations("TransitionsInterestForm");
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

    const sourcePage = locale === "en" ? "/en/transiciones-laborales" : "/transiciones-laborales";
    const parsed = contactSubmissionSchema.safeParse({
      ...form,
      formOrigin: "transiciones_laborales_interes",
      service,
      sourcePage,
      locale,
    });

    if (!parsed.success) {
      const errors: Partial<Record<FieldName, string>> = {};
      const invalidFields = getContactFieldNames(parsed.error).filter(
        (field): field is FieldName => field === "name" || field === "phone" || field === "email" || field === "consent",
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

  const fieldId = (name: string) => `${id}-${name}`;

  if (status === "success") {
    return (
      <p role="status" tabIndex={-1} ref={(node) => node?.focus()} className="text-sm font-semibold text-[var(--senda-ink)]">
        {t("success")}
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="w-full space-y-2.5" aria-busy={status === "submitting"}>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {status === "submitting" ? t("submitting") : ""}
      </p>
      <div>
        <label htmlFor={fieldId("name")} className="sr-only">{t("labels.name")}</label>
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
        {fieldErrors.name ? <p id={fieldId("name-error")} className="mt-1 text-xs text-destructive">{fieldErrors.name}</p> : null}
      </div>

      <div>
        <label htmlFor={fieldId("phone")} className="sr-only">{t("labels.phone")}</label>
        <input
          id={fieldId("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          maxLength={CONTACT_LIMITS.phone}
          value={form.phone}
          disabled={status === "submitting"}
          onChange={(event) => updateField("phone", event.target.value)}
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? fieldId("phone-error") : undefined}
          className={controlClassName(Boolean(fieldErrors.phone))}
          placeholder={t("placeholders.phone")}
        />
        {fieldErrors.phone ? <p id={fieldId("phone-error")} className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p> : null}
      </div>

      <div>
        <label htmlFor={fieldId("email")} className="sr-only">{t("labels.email")}</label>
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
        {fieldErrors.email ? <p id={fieldId("email-error")} className="mt-1 text-xs text-destructive">{fieldErrors.email}</p> : null}
      </div>

      <div hidden aria-hidden="true" inert>
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

      <label className="flex items-start gap-2 text-xs leading-5 text-[var(--senda-muted)]">
        <input
          type="checkbox"
          name="consent"
          required
          checked={form.consent}
          disabled={status === "submitting"}
          onChange={(event) => updateField("consent", event.target.checked)}
          aria-invalid={Boolean(fieldErrors.consent)}
          aria-describedby={fieldErrors.consent ? fieldId("consent-error") : undefined}
          className="mt-0.5 h-3.5 w-3.5 flex-none accent-[var(--senda-action)]"
        />
        <span>
          {t("consent")}{" "}
          <Link href="/privacidad" className="font-semibold underline decoration-[var(--senda-terracotta)]/55 underline-offset-2 hover:text-[var(--senda-ink)]">
            {t("privacyLink")}
          </Link>
        </span>
      </label>
      {fieldErrors.consent ? <p id={fieldId("consent-error")} className="text-xs text-destructive">{fieldErrors.consent}</p> : null}

      {formError ? (
        <p ref={formErrorRef} role="alert" tabIndex={-1} className="text-xs leading-5 text-destructive focus-visible:outline-none">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--senda-action)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--senda-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)] disabled:cursor-wait disabled:opacity-65"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
