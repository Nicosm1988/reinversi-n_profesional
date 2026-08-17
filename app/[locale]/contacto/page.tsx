"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Mail, MessageCircle, Send } from "lucide-react";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY_NUMBER, getWhatsAppHref } from "@/lib/contact-config";
import {
  getContactFieldNames,
  contactSubmissionSchema,
  CONTACT_LIMITS,
  type ContactField,
} from "@/lib/contact/schema";
import {
  CONTACT_REQUEST_HEADER,
  CONTACT_REQUEST_HEADER_VALUE,
} from "@/lib/contact/request-security";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import { UniverseField } from "@/components/visual/universe-field";

type ContactFormValues = {
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
  companyWebsite: string;
};

type ContactApiError =
  | "invalid"
  | "tooLarge"
  | "rateLimit"
  | "origin"
  | "config"
  | "send"
  | "unexpected";

const EMPTY_FORM: ContactFormValues = {
  name: "",
  phone: "",
  email: "",
  message: "",
  consent: false,
  companyWebsite: "",
};

const FIELD_ERROR_KEYS: Record<ContactField, string> = {
  name: "errors.name",
  phone: "errors.phone",
  email: "errors.email",
  message: "errors.message",
  explorationInterest: "errors.invalid",
  consent: "errors.consent",
};

const API_ERROR_CODES = new Set<ContactApiError>([
  "invalid",
  "tooLarge",
  "rateLimit",
  "origin",
  "config",
  "send",
  "unexpected",
]);

const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`;

function parseApiError(value: unknown): ContactApiError {
  if (!value || typeof value !== "object" || !("code" in value)) return "unexpected";
  const code = (value as { code?: unknown }).code;
  return typeof code === "string" && API_ERROR_CODES.has(code as ContactApiError)
    ? (code as ContactApiError)
    : "unexpected";
}

function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-lg border bg-muted px-4 py-3 text-sm text-foreground transition-shadow",
    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50",
    hasError ? "border-destructive" : "border-border",
  ].join(" ");
}

export default function ContactoPage() {
  const t = useTranslations("Contact");
  const locale = useLocale() === "en" ? "en" : "es";
  const [form, setForm] = useState<ContactFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function focusFormError() {
    window.requestAnimationFrame(() => formErrorRef.current?.focus());
  }

  function updateField<Field extends keyof ContactFormValues>(field: Field, value: ContactFormValues[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field !== "companyWebsite") {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const submission = {
      ...form,
      locale,
      sourcePage: locale === "en" ? "/en/contacto" : "/contacto",
    };
    const parsed = contactSubmissionSchema.safeParse(submission);

    if (!parsed.success) {
      const nextErrors: Partial<Record<ContactField, string>> = {};
      const invalidFields = getContactFieldNames(parsed.error);
      for (const field of invalidFields) {
        nextErrors[field] = t(FIELD_ERROR_KEYS[field]);
      }
      setFieldErrors(nextErrors);
      setFormError(t("errors.invalid"));
      window.requestAnimationFrame(() => {
        const firstInvalidField = invalidFields[0];
        document.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
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

      if (!response.ok) {
        setFormError(t(`errors.${parseApiError(body)}`));
        setStatus("idle");
        focusFormError();
        return;
      }

      if (!body || typeof body !== "object" || !("ok" in body) || body.ok !== true) {
        setFormError(t("errors.unexpected"));
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

  return (
    <div className="wati-page-shell flex flex-col">
      <section className="wati-page-hero pb-20 pt-32 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-44">
        <UniverseField className="left-[35%] text-[var(--senda-atmosphere-sky)] opacity-20" />
        <Container>
          <FadeIn className="relative z-10 mx-auto max-w-2xl text-center">
            <Heading level="h1" className="mb-6 text-4xl text-[var(--senda-atmosphere-ink)] sm:text-5xl lg:text-6xl">
              {t("heroTitle")} <span className="italic text-[var(--senda-atmosphere-accent)]">{t("heroTitleAccent")}</span>
            </Heading>
            <Text variant="lead" className="mx-auto max-w-xl text-[var(--senda-atmosphere-muted)]">{t("heroDescription")}</Text>
          </FadeIn>
        </Container>
      </section>

      <Section spacing="lg">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
            <FadeIn className="min-w-0">
              {status !== "success" ? (
                <Card data-contact-panel="form" className="bg-background p-6 sm:p-8 lg:p-9">
                  <h2 className="mb-6 font-heading text-2xl font-medium text-foreground">{t("formTitle")}</h2>
                  <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-busy={status === "submitting"}>
                    <div className="grid gap-5 md:grid-cols-3 md:gap-6">
                      <div>
                        <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-foreground">{t("labelName")}</label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          minLength={2}
                          maxLength={CONTACT_LIMITS.name}
                          value={form.name}
                          onChange={(event) => updateField("name", event.target.value)}
                          aria-invalid={Boolean(fieldErrors.name)}
                          aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                          className={inputClassName(Boolean(fieldErrors.name))}
                          placeholder={t("placeholderName")}
                        />
                        {fieldErrors.name ? <p id="contact-name-error" className="mt-2 text-sm text-destructive">{fieldErrors.name}</p> : null}
                      </div>
                      <div>
                        <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-foreground">{t("labelPhone")}</label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          required
                          maxLength={CONTACT_LIMITS.phone}
                          value={form.phone}
                          onChange={(event) => updateField("phone", event.target.value)}
                          aria-invalid={Boolean(fieldErrors.phone)}
                          aria-describedby={fieldErrors.phone ? "contact-phone-error" : undefined}
                          className={inputClassName(Boolean(fieldErrors.phone))}
                          placeholder={t("placeholderPhone")}
                        />
                        {fieldErrors.phone ? <p id="contact-phone-error" className="mt-2 text-sm text-destructive">{fieldErrors.phone}</p> : null}
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-foreground">{t("labelEmail")}</label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          spellCheck={false}
                          required
                          maxLength={CONTACT_LIMITS.email}
                          value={form.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          aria-invalid={Boolean(fieldErrors.email)}
                          aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
                          className={inputClassName(Boolean(fieldErrors.email))}
                          placeholder={t("placeholderEmail")}
                        />
                        {fieldErrors.email ? <p id="contact-email-error" className="mt-2 text-sm text-destructive">{fieldErrors.email}</p> : null}
                      </div>

                      <div className="md:col-span-3">
                        <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-foreground">{t("labelMessage")}</label>
                        <textarea
                          id="contact-message"
                          name="message"
                          autoComplete="off"
                          rows={6}
                          required
                          minLength={10}
                          maxLength={CONTACT_LIMITS.message}
                          value={form.message}
                          onChange={(event) => updateField("message", event.target.value)}
                          aria-invalid={Boolean(fieldErrors.message)}
                          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
                          className={`${inputClassName(Boolean(fieldErrors.message))} resize-y md:h-32`}
                          placeholder={t("placeholderMessage")}
                        />
                        {fieldErrors.message ? <p id="contact-message-error" className="mt-2 text-sm text-destructive">{fieldErrors.message}</p> : null}
                      </div>
                    </div>

                    <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                      <label htmlFor="contact-company-website">Website</label>
                      <input
                        id="contact-company-website"
                        name="companyWebsite"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        maxLength={CONTACT_LIMITS.honeypot}
                        value={form.companyWebsite}
                        onChange={(event) => updateField("companyWebsite", event.target.value)}
                      />
                    </div>

                    {formError ? (
                      <p
                        ref={formErrorRef}
                        className="text-sm text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                        role="alert"
                        tabIndex={-1}
                      >
                        {formError}
                      </p>
                    ) : null}

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <label className="flex items-start gap-3 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            name="consent"
                            required
                            checked={form.consent}
                            onChange={(event) => updateField("consent", event.target.checked)}
                            aria-invalid={Boolean(fieldErrors.consent)}
                            aria-describedby={fieldErrors.consent ? "contact-consent-error" : undefined}
                            className="mt-1 h-4 w-4 flex-none accent-secondary"
                          />
                          <span>{t("consent")}</span>
                        </label>
                        {fieldErrors.consent ? <p id="contact-consent-error" className="mt-2 text-sm text-destructive">{fieldErrors.consent}</p> : null}
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        variant="secondary"
                        disabled={status === "submitting"}
                        className="h-14 w-full flex-none rounded-full px-10 text-base md:w-auto"
                      >
                        {status === "submitting" ? t("submitting") : t("submitButton")}
                        <Send aria-hidden="true" className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card
                  ref={successRef}
                  className="bg-background p-8 text-center outline-none md:p-12"
                  role="status"
                  tabIndex={-1}
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <CheckCircle2 aria-hidden="true" className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="mb-4 font-heading text-2xl font-medium text-foreground">{t("successTitle")}</h2>
                  <Text variant="body-lg" className="mx-auto mb-8 max-w-md">{t("successDescription")}</Text>
                  <Button
                    variant="outline"
                    className="rounded-full px-8"
                    onClick={() => {
                      setForm(EMPTY_FORM);
                      setFieldErrors({});
                      setFormError(null);
                      setStatus("idle");
                    }}
                  >
                    {t("successAnother")}
                  </Button>
                </Card>
              )}
            </FadeIn>

            <FadeIn className="min-w-0">
              <div>
                <h2 className="mb-4 font-heading text-lg font-medium text-foreground">{t("sidebarTitle")}</h2>
                <div className="space-y-5">
                  <a
                    href={GMAIL_COMPOSE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="group flex items-start gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                    aria-label={`${t("directGmail")}: ${CONTACT_EMAIL}`}
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/10 transition-colors group-hover:bg-secondary/20">
                      <Mail aria-hidden="true" className="h-5 w-5 text-secondary" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">{t("sidebarEmailLabel")}</span>
                      <span className="break-all text-sm text-muted-foreground transition-colors group-hover:text-secondary">{CONTACT_EMAIL}</span>
                    </span>
                  </a>
                  <a
                    href={getWhatsAppHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                    aria-label={`${t("directWhatsapp")}: ${WHATSAPP_DISPLAY_NUMBER}`}
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/10 transition-colors group-hover:bg-secondary/20">
                      <MessageCircle aria-hidden="true" className="h-5 w-5 text-secondary" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">{t("sidebarWhatsappLabel")}</span>
                      <span className="text-sm text-muted-foreground transition-colors group-hover:text-secondary">{WHATSAPP_DISPLAY_NUMBER}</span>
                    </span>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>
    </div>
  );
}
