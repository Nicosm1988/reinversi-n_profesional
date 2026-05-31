"use client";

import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, SlideUp } from "@/components/motion";
import { JourneyIllustration } from "@/components/illustrations/pastel-illustrations";

const highlights = [
  "Diagnostico inicial gratuito con devolucion inmediata",
  "Orientacion estrategica para transiciones laborales reales",
  "Espacio humano para ordenar decisiones en tiempos de cambio",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#31384a] pb-20 pt-[108px] lg:pb-28 lg:pt-[132px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(249,239,227,0.14),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(228,124,86,0.12),transparent_24%)]" />
      <div className="pointer-events-none absolute left-[-6rem] top-20 h-80 w-80 rounded-full bg-[#e6b591]/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-6rem] h-80 w-80 rounded-full bg-[#f3d4c1]/10 blur-3xl" />

      <div className="container relative z-10 mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div className="space-y-8 text-center lg:text-left">
          <SlideUp>
            <div className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-[#f6efe7]">
              <Compass className="mr-2 h-4 w-4 text-[#e47c56]" />
              Reinvencion profesional con criterio y contencion
            </div>
          </SlideUp>

          <SlideUp delay={0.08}>
            <Heading level="h1" className="max-w-3xl text-[#f6efe7]">
              Transforma la incertidumbre en <span className="italic text-[#e47c56]">tu motor de carrera</span>.
            </Heading>
          </SlideUp>

          <SlideUp delay={0.14}>
            <Text variant="lead" className="max-w-2xl text-[#efe1d2]/86">
              Entre el avance de la IA y la sobreoferta laboral, la incertidumbre es la norma. No se trata de esperar
              a que se aclare, sino de aprender a navegarla con una estrategia clara y un proceso cuidado.
            </Text>
          </SlideUp>

          <SlideUp delay={0.2}>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                variant="default"
                className="h-12 rounded-full border-[#d86f49] bg-[#e47c56] px-8 text-white hover:border-[#c85f3a] hover:bg-[#d86f49]"
                asChild
              >
                <Link href="/diagnostico/ancla-de-carrera">
                  Hacer diagnostico
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/18 bg-white/8 px-8 text-[#f6efe7] hover:bg-white/12 hover:text-[#f6efe7]"
                asChild
              >
                <Link href="#metodo">Conocer el metodo</Link>
              </Button>
            </div>
          </SlideUp>

          <FadeIn delay={0.28}>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-left shadow-[0_12px_30px_-24px_rgba(17,24,39,0.8)]"
                >
                  <Sparkles className="mb-3 h-4 w-4 text-[#f0b08d]" />
                  <p className="text-sm leading-relaxed text-[#efe1d2]/88">{item}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.18}>
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute inset-6 rounded-[38px] border border-white/10 bg-white/6" />
            <div className="relative overflow-hidden rounded-[36px] border border-[#d7c3ae] bg-[#f6efe7] p-4 shadow-[0_30px_80px_-40px_rgba(16,21,33,0.9)]">
              <JourneyIllustration className="rounded-[28px]" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
