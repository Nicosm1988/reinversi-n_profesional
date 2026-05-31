"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { PuzzleIllustration } from "@/components/illustrations/pastel-illustrations";

const situations = [
  {
    title: "La IA y el mercado te cambiaron el tablero",
    desc: "Herramientas nuevas, reglas nuevas y una sensacion de tener que reaccionar antes de entender bien hacia donde ir.",
  },
  {
    title: "Hay demasiadas opciones y poca claridad",
    desc: "Seguir igual, cambiar de rol, reconvertirte, emprender o actualizarte. Cuando todo parece posible, decidir cuesta mas.",
  },
  {
    title: "Tu experiencia vale, pero necesita traduccion",
    desc: "No se trata de empezar de cero, sino de reinterpretar lo que ya construiste para el contexto que viene.",
  },
];

export function ProblemSection() {
  return (
    <Section spacing="lg" background="muted" className="bg-[#f8efe6]">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <FadeIn>
            <div className="overflow-hidden rounded-[34px] border border-[#dcc8b5] bg-[#fffaf4] p-4 shadow-[0_24px_60px_-36px_rgba(47,54,71,0.45)]">
              <PuzzleIllustration className="rounded-[26px]" />
            </div>
          </FadeIn>

          <div className="space-y-8">
            <FadeIn>
              <Text variant="caption" className="text-[#cf724e]">
                El problema no eres tu
              </Text>
              <Heading level="h2" className="mt-3 text-[#2f3647]">
                Cuando todo cambia al mismo tiempo, pensar con claridad se vuelve dificil.
              </Heading>
              <Text variant="body-lg" className="mt-5 max-w-2xl text-[#5c6272]">
                Lo que hoy llamas confusion muchas veces es saturacion. Por eso el primer paso no es apurarte a
                decidir, sino ordenar tu panorama interno y externo.
              </Text>
            </FadeIn>

            <StaggerContainer className="space-y-4">
              {situations.map((item) => (
                <FadeIn key={item.title}>
                  <article className="rounded-[28px] border border-[#dcc8b5] bg-[#fffaf4] p-6 shadow-[0_18px_44px_-36px_rgba(47,54,71,0.4)]">
                    <h3 className="font-heading text-xl font-semibold text-[#2f3647]">{item.title}</h3>
                    <Text className="mt-3 text-[#5d6372]">{item.desc}</Text>
                  </article>
                </FadeIn>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </Container>
    </Section>
  );
}
