"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Compass, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BridgeIllustration } from "@/components/illustrations";

const values = [
  {
    icon: Heart,
    title: "Calidez humana",
    desc: "Cada persona llega con una historia única. Escuchamos sin juicios y construimos desde ese punto de partida.",
  },
  {
    icon: Brain,
    title: "Rigor profesional",
    desc: "Trabajamos con herramientas psicométricas validadas y método estructurado, usando IA como apoyo.",
  },
  {
    icon: Compass,
    title: "Claridad ante todo",
    desc: "No vendemos promesas vacias. Te ayudamos a leer tu situación para decidir con criterio estrategico.",
  },
  {
    icon: Users,
    title: "Acompañamiento real",
    desc: "Cada proceso es personal y a tu ritmo, con especialistas que te acompañan de principio a fin.",
  },
];

export default function QuienesSomosPage() {
  return (
    <div className="wati-page-shell flex flex-col">
      <section className="wati-page-hero py-20 lg:py-32">
        <Container>
          <FadeIn className="relative z-10 mx-auto max-w-3xl text-center">
            <Heading level="h1" className="mb-6 text-primary text-4xl sm:text-5xl lg:text-6xl">
              Quiénes somos
            </Heading>
            <Text variant="lead" className="mx-auto max-w-xl">
              Un equipo multidisciplinario que acompaña a las personas a orientarse, reconocer su historia y construir su próximo paso profesional.
            </Text>
            <div className="mx-auto mt-10 max-w-md overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-soft">
              <BridgeIllustration className="rounded-[1.5rem]" />
            </div>
          </FadeIn>
        </Container>
      </section>

      <Section spacing="lg">
        <Container size="sm">
          <FadeIn className="text-center">
            <Heading level="h2" className="mb-6">
              Nuestra misión
            </Heading>
            <Text variant="body-lg" className="mx-auto max-w-2xl">
              Senda nació para ofrecer un espacio donde pensar el futuro laboral con calma, estrategia y orientación especializada en un mercado transformado por la IA.
            </Text>
          </FadeIn>
        </Container>
      </Section>

      <Section spacing="lg" background="muted">
        <Container size="sm">
          <FadeIn className="mb-12 text-center">
            <Heading level="h2" className="mb-4">
              Qué hacemos
            </Heading>
            <Text variant="lead" className="mx-auto max-w-xl">
              Combinamos tres pilares para acompañar tu transición profesional.
            </Text>
          </FadeIn>

          <StaggerContainer className="grid gap-8 md:grid-cols-3">
            <FadeIn>
              <Card className="h-full border-primary/10 p-8 text-center">
                <h3 className="mb-3 text-lg font-heading font-semibold text-primary">Ciencia psicometrica</h3>
                <Text className="text-sm">Diagnosticos vocacionales sustentados en evaluaciones validadas de personalidad, intereses y valores.</Text>
              </Card>
            </FadeIn>
            <FadeIn>
              <Card className="h-full border-primary/10 p-8 text-center">
                <h3 className="mb-3 text-lg font-heading font-semibold text-primary">Acompañamiento humano</h3>
                <Text className="text-sm">Talento, mercado laboral y estrategia de carrera en una misma mesa para decidir con más perspectiva.</Text>
              </Card>
            </FadeIn>
            <FadeIn>
              <Card className="h-full border-primary/10 p-8 text-center">
                <h3 className="mb-3 text-lg font-heading font-semibold text-primary">Inteligencia artificial</h3>
                <Text className="text-sm">Usamos IA para analizar tendencias y personalizar recomendaciones, siempre con supervisión profesional.</Text>
              </Card>
            </FadeIn>
          </StaggerContainer>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <FadeIn className="mb-16 text-center">
            <Heading level="h2" className="mb-4">
              Nuestros valores
            </Heading>
          </FadeIn>

          <StaggerContainer className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            {values.map((value) => (
              <FadeIn key={value.title}>
                <div className="group flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-secondary/20 transition-colors group-hover:bg-secondary/30">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-heading font-semibold text-primary">{value.title}</h3>
                    <Text className="text-sm">{value.desc}</Text>
                  </div>
                </div>
              </FadeIn>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section spacing="lg" background="muted">
        <Container size="sm">
          <FadeIn className="wati-dark-cta relative overflow-hidden p-8 text-center md:p-16">
            <div className="absolute -mr-20 -mt-20 right-0 top-0 h-80 w-80 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
            <div className="relative z-10 mx-auto max-w-xl">
              <Heading level="h2" className="mb-6 text-primary-foreground">
                ¿Querés empezar a encontrar tu rumbo?
              </Heading>
              <Text className="mb-10 text-lg text-primary-foreground/80">
                El primer paso es conocerte. Hacé tu diagnóstico gratuito y empezá a construir tu siguiente capitulo profesional.
              </Text>
              <Button variant="secondary" size="lg" className="h-14 rounded-full px-10 text-base" asChild>
                <Link href="/diagnóstico/ancla-de-carrera">
                  Comenzar mi diagnóstico <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </div>
  );
}
