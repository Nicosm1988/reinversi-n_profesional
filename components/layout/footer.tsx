"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Youtube, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/security/turnstile-widget";

export function Footer() {
  const t = useTranslations("Footer");

  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !acceptedTerms || !email.trim()) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const locale = window.location.pathname.startsWith("/en") ? "en" : "es";
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          email,
          sourcePage: window.location.pathname,
          locale,
          consentAccepted: true,
          captchaToken,
          metadata: { channel: "footer-newsletter" },
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se pudo procesar la suscripcion");
      }

      setEmail("");
      setAcceptedTerms(false);
      setCaptchaToken(undefined);
      setStatusMessage("Suscripcion registrada. Te contactaremos pronto.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Error inesperado al suscribirte.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-primary/20 bg-primary text-primary-foreground">
      <div className="absolute -right-32 -top-20 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr_1.3fr]">
          <div>
            <h2 className="font-heading text-lg font-semibold text-white">{t("colHome")}</h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              <li>
                <Link href="/quienes-somos" className="hover:text-secondary">
                  {t("linkAbout")}
                </Link>
              </li>
              <li>
                <a href="mailto:contacto@senda.com" className="hover:text-secondary">
                  {t("linkContactEmail")}
                </a>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-secondary">
                  {t("linkPrivacy")}
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-secondary">
                  {t("linkTerms")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-white">{t("colServices")}</h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              <li>
                <Link href="/orientacion-vocacional" className="hover:text-secondary">
                  {t("linkVocational")}
                </Link>
              </li>
              <li>
                <Link href="/diagnostico/ancla-de-carrera" className="hover:text-secondary">
                  {t("linkDiagnosticFree")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-white">{t("colNewsletter")}</h2>
            <p className="mt-4 whitespace-pre-line text-sm text-primary-foreground/75">{t("newsletterDesc")}</p>

            <form className="mt-5 space-y-3" onSubmit={handleNewsletterSubmit}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletterPlaceholder")}
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/95 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !acceptedTerms || (captchaEnabled && !captchaToken)}
                  variant="secondary"
                  className="h-12 min-w-[170px] rounded-xl"
                >
                  {isSubmitting ? "Enviando..." : t("newsletterSubmit")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <label className="flex items-start gap-2 text-[11px] leading-relaxed text-primary-foreground/70">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                />
                <span>
                  Al suscribirte acepto recibir correos electronicos de Senda, los{" "}
                  <Link href="/terminos" className="underline hover:text-secondary">
                    {t("linkTerms")}
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacidad" className="underline hover:text-secondary">
                    {t("linkPrivacy")}
                  </Link>
                  .
                </span>
              </label>

              {statusMessage && <p className="text-xs text-white">{statusMessage}</p>}
              {acceptedTerms && (
                <TurnstileWidget onTokenChange={setCaptchaToken} action="lead_newsletter" className="min-h-[65px]" />
              )}
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-secondary hover:text-primary"
              aria-label="Youtube"
            >
              <Youtube className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-secondary hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-secondary hover:text-primary"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

          <p className="text-xs text-primary-foreground/65">{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center text-[11px] leading-relaxed text-primary-foreground/65">
          <strong>{t("disclaimerTitle")}</strong> {t("disclaimerText")}
        </div>
      </div>
    </footer>
  );
}
