"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import { ArrowRight, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { TurnstileWidget } from "@/components/security/turnstile-widget";

export default function ContactoPage() {
  const t = useTranslations("Contact");

  const contactReasons = [
    t("reasonDiagnostic"),
    t("reasonVocational"),
    t("reasonGeneral"),
    t("reasonOther"),
  ];

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !acceptedTerms) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const locale = window.location.pathname.startsWith("/en") ? "en" : "es";
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          fullName: formData.name,
          email: formData.email,
          reason: formData.reason,
          message: formData.message,
          sourcePage: window.location.pathname,
          locale,
          consentAccepted: true,
          captchaToken,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se pudo enviar tu consulta");
      }

      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error inesperado al enviar la consulta");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="wati-page-shell flex flex-col">
      <section className="wati-page-hero py-20 lg:py-28">
        <Container>
          <FadeIn className="max-w-2xl mx-auto text-center relative z-10">
            <Heading level="h1" className="text-primary text-4xl sm:text-5xl lg:text-6xl mb-6">
              {t("heroTitle")} <span className="italic text-secondary">{t("heroTitleAccent")}</span>
            </Heading>
            <Text variant="lead" className="max-w-xl mx-auto">{t("heroDescription")}</Text>
          </FadeIn>
        </Container>
      </section>

      <Section spacing="lg">
        <Container>
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <FadeIn className="lg:col-span-3">
              {!submitted ? (
                <Card className="bg-background p-8 md:p-10">
                  <h2 className="text-2xl font-heading font-medium text-foreground mb-8">{t("formTitle")}</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">{t("labelName")}</label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                          placeholder={t("placeholderName")}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">{t("labelEmail")}</label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                          placeholder={t("placeholderEmail")}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-reason" className="block text-sm font-medium text-foreground mb-2">{t("labelReason")}</label>
                      <select
                        id="contact-reason"
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow appearance-none"
                      >
                        <option value="">{t("placeholderReason")}</option>
                        {contactReasons.map((reason) => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">{t("labelMessage")}</label>
                      <textarea
                        id="contact-message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow resize-none"
                        placeholder={t("placeholderMessage")}
                      />
                    </div>

                    <label className="flex items-start gap-3 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        required
                      />
                      <span>
                        Acepto los <Link href="/terminos" className="underline hover:text-primary">Terminos y Condiciones</Link> y la{" "}
                        <Link href="/privacidad" className="underline hover:text-primary">Politica de Privacidad</Link>.
                      </span>
                    </label>

                    {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                    <TurnstileWidget onTokenChange={setCaptchaToken} action="lead_contact" className="min-h-[65px]" />

                    <Button type="submit" size="lg" variant="secondary" disabled={isSubmitting || !acceptedTerms || (captchaEnabled && !captchaToken)} className="rounded-full px-10 h-14 text-base w-full md:w-auto">
                      {isSubmitting ? "Enviando..." : t("submitButton")} <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Card>
              ) : (
                <Card className="bg-background p-8 md:p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-2xl font-heading font-medium text-foreground mb-4">{t("successTitle")}</h2>
                  <Text variant="body-lg" className="mb-8 max-w-md mx-auto">{t("successDescription")}</Text>
                  <Button
                    variant="outline"
                    className="rounded-full px-8"
                    onClick={() => {
                      setSubmitted(false);
                      setAcceptedTerms(false);
                      setFormData({ name: "", email: "", reason: "", message: "" });
                    }}
                  >
                    {t("successAnother")}
                  </Button>
                </Card>
              )}
            </FadeIn>

            <FadeIn className="lg:col-span-2">
              <div className="space-y-8">
                <div>
                  <h3 className="font-heading font-medium text-foreground text-lg mb-4">{t("sidebarTitle")}</h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                        <Mail className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t("sidebarEmailLabel")}</p>
                        <a href="mailto:contacto@senda.com" className="text-sm text-muted-foreground hover:text-secondary transition-colors">contacto@senda.com</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                        <Clock className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t("sidebarHoursLabel")}</p>
                        <p className="text-sm text-muted-foreground">{t("sidebarHoursValue")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8">
                  <h3 className="font-heading font-medium text-foreground text-lg mb-4">{t("sidebarCtaTitle")}</h3>
                  <Text className="text-sm mb-6">{t("sidebarCtaDescription")}</Text>
                  <Button variant="default" size="lg" className="rounded-full px-8 h-12 w-full font-semibold" asChild>
                    <Link href="/diagnostico/ancla-de-carrera">
                      {t("sidebarCtaButton")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>
    </div>
  );
}
