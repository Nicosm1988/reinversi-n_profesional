"use client";

import React from "react"

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function CtaSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section
      id="diagnostico"
      className="relative overflow-hidden bg-primary py-24 lg:py-32"
    >
      {/* Subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-heading text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
          <span className="text-balance">Tu transición empieza hoy.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/70">
          Completá tu diagnóstico gratuito en 10 minutos y recibí un análisis
          preliminar de tu situación profesional con recomendaciones
          personalizadas.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="Tu email profesional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-3.5 text-base text-primary-foreground placeholder:text-primary-foreground/40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-3.5 text-base font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
            >
              Empezar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        ) : (
          <div className="mx-auto mt-10 max-w-md rounded-xl border border-secondary/30 bg-secondary/10 p-6">
            <p className="font-heading text-lg font-semibold text-primary-foreground">
              Excelente. Tu primer paso está dado.
            </p>
            <p className="mt-2 text-sm text-primary-foreground/60">
              Te enviamos el acceso al diagnóstico a tu email. Revisá tu bandeja
              de entrada.
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-primary-foreground/40">
          Sin compromiso. Sin spam. Solo el primer paso hacia tu reinvención.
        </p>
      </div>
    </section>
  );
}
