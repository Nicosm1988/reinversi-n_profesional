"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { StairIllustration } from "@/components/illustrations/pastel-illustrations";

const steps = [
  {
    step: "ETAPA 01",
    title: "Escuchar y ordenar",
    desc: "Abrimos un espacio para entender tu momento, lo que te pesa hoy y lo que ya no quieres seguir sosteniendo.",
  },
  {
    step: "ETAPA 02",
    title: "Detectar patrones y fortalezas",
    desc: "Traducimos tu recorrido a capacidades transferibles, motivaciones de fondo y condiciones laborales que te hacen bien.",
  },
  {
    step: "ETAPA 03",
    title: "Definir caminos viables",
    desc: "No trabajamos con fantasia vacia: conectamos tus opciones con escenarios reales, mercado y tiempos posibles.",
  },
  {
    step: "ETAPA 04",
    title: "Bajar claridad a accion",
    desc: "Convertimos el diagnostico en decisiones concretas, narrativa profesional y un plan de movimiento con sentido.",
  },
];

export function MethodSection() {
  return (
    <Section id="metodo" spacing="lg" className="bg-[#31384a] text-[#f6efe7]">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-8">
            <FadeIn>
              <Text variant="caption" className="text-[#f0b08d]">
                Nuestro metodo
              </Text>
              <Heading level="h2" className="mt-3 text-[#f6efe7]">
                Una escalera posible para atravesar la transicion.
              </Heading>
              <Text variant="body-lg" className="mt-5 max-w-2xl text-[#e9d8c8]/84">
                La claridad no aparece de golpe. Se construye paso a paso, con preguntas correctas, contexto y una
                estructura que te permita avanzar sin perderte.
              </Text>
            </FadeIn>

            <StaggerContainer className="space-y-4">
              {steps.map((step) => (
                <FadeIn key={step.step}>
                  <article className="rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.65)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0b08d]">{step.step}</p>
                    <h3 className="mt-3 font-heading text-2xl font-semibold text-[#f6efe7]">{step.title}</h3>
                    <Text className="mt-3 text-[#e7d7c8]/82">{step.desc}</Text>
                  </article>
                </FadeIn>
              ))}
            </StaggerContainer>
          </div>

          <FadeIn>
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#f6efe7] p-4 shadow-[0_28px_80px_-42px_rgba(16,21,33,0.9)]">
              <StairIllustration className="rounded-[26px]" />
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
