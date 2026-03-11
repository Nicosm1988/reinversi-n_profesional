"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import Image from "next/image";

const situations = [
  {
    title: "La IA cambió las reglas del juego",
    desc: "Lo que funcionaba ayer ya no alcanza. Herramientas nuevas, roles que desaparecen, industrias que se transforman. Es lógico preguntarse: ¿cómo me adapto sin perder lo que construí?",
  },
  {
    title: "No sabes por dónde empezar",
    desc: "Hay demasiadas opciones y poco tiempo para detenerte a pensar. Remote, freelance, emprender, reconvertirte... La incertidumbre paraliza, pero quedarte quieto no es la solución.",
  },
  {
    title: "Tu experiencia sigue siendo valiosa",
    desc: "Tal vez sientes que tus años de trayectoria pesan menos en este nuevo contexto. La verdad es que tu experiencia es tu mayor activo — solo necesitas un puente hacia lo que viene.",
  },
];

export function ProblemSection() {
  return (
    <Section spacing="lg" background="muted">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <FadeIn>
            <div className="sticky top-32">
              <Heading level="h2" className="mb-6">
                ¿Te identificas?
              </Heading>
              <Text variant="body-lg" className="mb-8">
                No estás solo en esto. Miles de profesionales están navegando
                el mismo momento de incertidumbre. La diferencia está en
                elegir un espacio seguro para pensar tu próximo paso con
                claridad.
                <br />
                <br />
                Darle espacio al cambio es la mejor forma de construir algo
                real. Cada proceso es único, te acompañamos a transitar el
                tuyo.
              </Text>
              <div className="hidden lg:flex justify-start mt-4">
                <Image
                  src="/illustrations/problem.png"
                  alt="Persona reflexionando sobre su carrera"
                  width={280}
                  height={210}
                  className="object-contain opacity-85"
                />
              </div>
            </div>
          </FadeIn>

          <StaggerContainer className="space-y-8">
            {situations.map((item, i) => (
              <FadeIn key={i} className="group">
                <div className="pl-8 border-l-2 border-secondary/30 group-hover:border-secondary transition-colors duration-500">
                  <h3 className="text-xl font-heading font-medium text-foreground mb-3 group-hover:text-secondary transition-colors">
                    {item.title}
                  </h3>
                  <Text>{item.desc}</Text>
                </div>
              </FadeIn>
            ))}
          </StaggerContainer>
        </div>
      </Container>
    </Section>
  );
}
