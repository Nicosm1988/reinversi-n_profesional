"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Send } from "lucide-react";
import {
  CONTACT_REQUEST_HEADER,
  CONTACT_REQUEST_HEADER_VALUE,
} from "@/lib/contact/request-security";
import {
  CONTACT_LIMITS,
  contactSubmissionSchema,
  type DiagnosticResult,
} from "@/lib/contact/schema";
import { Button } from "@/components/ui/button";

type PreferredContact = "email" | "whatsapp" | "either";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  preferredContact: PreferredContact;
  message: string;
  consent: boolean;
  companyWebsite: string;
};

type DiagnosticResultShareFormProps = {
  result: DiagnosticResult;
};

const EMPTY_FORM: FormValues = {
  name: "",
  email: "",
  phone: "",
  preferredContact: "email",
  message: "",
  consent: false,
  companyWebsite: "",
};

const controlClassName =
  "w-full rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3 text-base text-[var(--quiz-ink)] transition-[border-color,box-shadow,background-color] placeholder:text-[var(--quiz-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-accent)]/55 disabled:cursor-not-allowed disabled:opacity-70";

export function DiagnosticResultShareForm({ result }: DiagnosticResultShareFormProps) {
  const t = useTranslations("ResultShare");
  const locale = useLocale() === "en" ? "en" : "es";
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

  function updateField<Field extends keyof FormValues>(field: Field, value: FormValues[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setInvalidFields((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }

  function focusError() {
    window.requestAnimationFrame(() => errorRef.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const route =
      result.questionnaire === "career_anchors"
        ? "/test-anclas-de-carrera"
        : "/encontrar-mi-recorrido";
    const sourcePage = locale === "en" ? `/en${route}` : route;
    const parsed = contactSubmissionSchema.safeParse({
      ...form,
      formOrigin: "diagnostic_result",
      result,
      sourcePage,
      locale,
    });

    if (!parsed.success || parsed.data.formOrigin !== "diagnostic_result") {
      const fields = parsed.success
        ? []
        : parsed.error.issues
            .map((issue) => issue.path[0])
            .filter((field): field is string => typeof field === "string");
      setInvalidFields(new Set(fields));
      setError(t("error"));
      window.requestAnimationFrame(() => {
        const firstInvalid = fields[0];
        const control = firstInvalid
          ? formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
          : null;
        (control ?? errorRef.current)?.focus();
      });
      return;
    }

    setStatus("submitting");
    setError(null);

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
      const responseBody: unknown = await response.json().catch(() => null);
      const accepted =
        response.status === 200 &&
        responseBody !== null &&
        typeof responseBody === "object" &&
        "ok" in responseBody &&
        responseBody.ok === true;

      if (!accepted) {
        setStatus("idle");
        setError(t("error"));
        focusError();
        return;
      }

      setStatus("success");
      setForm(EMPTY_FORM);
      window.requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setStatus("idle");
      setError(t("error"));
      focusError();
    }
  }

  const fieldId = (field: string) => `${id}-${field}`;
  const disabled = status === "submitting" || status === "success";

  return (
    <div className="rounded-[1.5rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface-soft)] p-6 sm:p-8">
      <h3 className="font-heading text-2xl font-medium text-[var(--quiz-ink)]">{t("title")}</h3>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--quiz-muted)]">
        {t("description")}
      </p>

      {status === "success" ? (
        <p
          ref={successRef}
          className="mt-6 rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-surface-warm)] p-4 font-medium text-[var(--quiz-ink)]"
          role="status"
          tabIndex={-1}
        >
          {t("success")}
        </p>
      ) : null}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-7 space-y-5" aria-busy={status === "submitting"}>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {status === "submitting" ? t("submitting") : ""}
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={fieldId("name")} className="mb-2 block text-sm font-semibold text-[var(--quiz-ink)]">
              {t("nameLabel")}
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
              aria-invalid={invalidFields.has("name")}
              disabled={disabled}
              onChange={(event) => updateField("name", event.target.value)}
              className={controlClassName}
            />
          </div>

          <div>
            <label htmlFor={fieldId("email")} className="mb-2 block text-sm font-semibold text-[var(--quiz-ink)]">
              {t("emailLabel")}
            </label>
            <input
              id={fieldId("email")}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={CONTACT_LIMITS.email}
              value={form.email}
              aria-invalid={invalidFields.has("email")}
              disabled={disabled}
              onChange={(event) => updateField("email", event.target.value)}
              className={controlClassName}
            />
          </div>

          <div>
            <label htmlFor={fieldId("phone")} className="mb-2 block text-sm font-semibold text-[var(--quiz-ink)]">
              {t("phoneLabel")}
            </label>
            <input
              id={fieldId("phone")}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              maxLength={CONTACT_LIMITS.phone}
              value={form.phone}
              aria-invalid={invalidFields.has("phone")}
              disabled={disabled}
              onChange={(event) => updateField("phone", event.target.value)}
              className={controlClassName}
            />
          </div>

          <div>
            <label htmlFor={fieldId("preferred-contact")} className="mb-2 block text-sm font-semibold text-[var(--quiz-ink)]">
              {t("preferredContactLabel")}
            </label>
            <select
              id={fieldId("preferred-contact")}
              name="preferredContact"
              value={form.preferredContact}
              disabled={disabled}
              onChange={(event) => updateField("preferredContact", event.target.value as PreferredContact)}
              className={controlClassName}
            >
              <option value="email">{t("preferredEmail")}</option>
              <option value="whatsapp">{t("preferredWhatsapp")}</option>
              <option value="either">{t("preferredEither")}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={fieldId("message")} className="mb-2 block text-sm font-semibold text-[var(--quiz-ink)]">
            {t("messageLabel")} <span className="font-normal text-[var(--quiz-muted)]">({t("optional")})</span>
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={4}
            maxLength={CONTACT_LIMITS.message}
            value={form.message}
            aria-invalid={invalidFields.has("message")}
            disabled={disabled}
            onChange={(event) => updateField("message", event.target.value)}
            className={controlClassName}
          />
        </div>

        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor={fieldId("company-website")}>Company website</label>
          <input
            id={fieldId("company-website")}
            name="companyWebsite"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.companyWebsite}
            onChange={(event) => updateField("companyWebsite", event.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--quiz-muted)]">
          <input
            name="consent"
            type="checkbox"
            checked={form.consent}
            aria-invalid={invalidFields.has("consent")}
            disabled={disabled}
            required
            onChange={(event) => updateField("consent", event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--quiz-border)] accent-[var(--quiz-accent)]"
          />
          <span>{t("consentLabel")}</span>
        </label>

        {error ? (
          <p ref={errorRef} role="alert" tabIndex={-1} className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={disabled}
          className="rounded-full bg-[var(--senda-action)] px-8 text-white hover:bg-[var(--senda-action-hover)]"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
          <Send className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
