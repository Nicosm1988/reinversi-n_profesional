"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import Link from "next/link";
import { TurnstileWidget } from "@/components/security/turnstile-widget";

interface TherapyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TherapyModal({ open, onOpenChange }: TherapyModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    accepted &&
    !submitting &&
    (!captchaEnabled || Boolean(captchaToken));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const locale = window.location.pathname.startsWith('/en') ? 'en' : 'es';
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'therapy',
          fullName: name,
          email,
          reason: 'therapy_modal',
          sourcePage: window.location.pathname,
          locale,
          consentAccepted: true,
          captchaToken,
          metadata: { channel: 'therapy-modal' },
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'No se pudo enviar tu solicitud');
      }

      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error inesperado al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setName("");
      setEmail("");
      setAccepted(false);
      setSubmitted(false);
      setErrorMessage(null);
      setCaptchaToken(undefined);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border border-border bg-white text-foreground p-0 overflow-hidden rounded-2xl shadow-soft">
        <div className="p-8 md:p-10">
          {!submitted ? (
            <FadeIn>
              <DialogHeader className="mb-8">
                <DialogTitle className="text-primary text-2xl font-heading font-semibold">
                  Introduce tu nombre y email para continuar
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base mt-2">
                  Te conectaremos con un profesional especializado en procesos de cambio personal.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-14 px-5 rounded-xl border border-input bg-white text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 px-5 rounded-xl border border-input bg-white text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
                    required
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-border text-secondary accent-secondary cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    Al continuar acepto los{" "}
                    <Link href="/terminos" className="underline text-primary hover:text-secondary transition-colors">
                      Terminos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" className="underline text-primary hover:text-secondary transition-colors">
                      Politica de Privacidad
                    </Link>{" "}
                    de este sitio.
                  </span>
                </label>

                {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                <TurnstileWidget onTokenChange={setCaptchaToken} action="lead_therapy" className="min-h-[65px]" />

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    variant="secondary"
                    className="rounded-xl h-12 px-8 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? "Enviando..." : "Continuar"}
                  </Button>
                </div>
              </form>
            </FadeIn>
          ) : (
            <FadeIn>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6 border border-primary/10">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <DialogHeader>
                  <DialogTitle className="text-primary text-2xl font-heading mb-3">Gracias</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base">
                    Recibimos tu consulta. Un profesional se pondra en contacto contigo a la brevedad.
                  </DialogDescription>
                </DialogHeader>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="mt-8 rounded-xl h-12 px-8 transition-colors"
                >
                  Cerrar
                </Button>
              </div>
            </FadeIn>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
