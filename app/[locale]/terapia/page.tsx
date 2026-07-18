"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { TherapyModal } from "@/components/sections/therapy-modal";
import { ArrowRight, Check, Heart, Shield, Star, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Completas tus datos",
    desc: "Nos indicas por que quieres empezar terapia y tus datos de contacto.",
  },
  {
    number: "02",
    title: "Encontramos al terapeuta indicado para ti",
    desc: "Seleccionamos al profesional que mejor se ajusta a tus necesidades.",
  },
  {
    number: "03",
    title: "Agendas tu sesion",
    desc: "Coordinamos dia, horario y te enviamos los detalles para conectarte.",
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Te ayudamos a encontrar a tu terapeuta ideal",
    desc: "Seleccionamos cuidadosamente al profesional mas adecuado para ti.",
  },
  {
    icon: Users,
    title: "Acompanamiento constante",
    desc: "Nuestro equipo te acompana en cada etapa, resolviendo dudas y brindando recursos.",
  },
  {
    icon: Shield,
    title: "Psicologos especializados",
    desc: "Contamos con profesionales formados en distintas areas y amplia trayectoria.",
  },
];

const team = [
  { name: "Dra. Laura M.", specialty: "Terapia cognitivo-conductual" },
  { name: "Lic. Sofia P.", specialty: "Terapia de Aceptacion y Compromiso" },
  { name: "Lic. Gabriel R.", specialty: "Psicoanalisis" },
  { name: "Dra. Malen D.", specialty: "Psicoanalisis" },
  { name: "Lic. Cintia M.", specialty: "Terapia cognitivo-conductual" },
  { name: "Lic. Daniela P.", specialty: "Terapia integrativa" },
];

export default function TherapyPage() {
  const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);

  return (
    <div className="wati-page-shell flex flex-col">
      <section className="wati-page-hero py-20 lg:py-32">
        <Container>
          <FadeIn className="max-w-2xl mx-auto text-center relative z-10">
            <Heading level="h1" className="text-primary text-4xl sm:text-5xl lg:text-6xl mb-6">
              Un espacio seguro para empezar terapia online
            </Heading>
            <Text variant="lead" className="mb-10 max-w-xl mx-auto">
              Sesiones individuales con psicologos clinicos para acompanarte en cambios de vida,
              vinculos, ansiedad y otros desafios.
            </Text>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-10 h-14 text-base font-semibold"
              onClick={() => setIsTherapyModalOpen(true)}
            >
              Quiero iniciar terapia <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FadeIn>
        </Container>
      </section>

      <Section spacing="lg">
        <Container size="sm">
          <FadeIn className="text-center mb-16">
            <Heading level="h2" className="mb-4">Como es el proceso?</Heading>
            <Text variant="lead" className="max-w-lg mx-auto">
              Tres pasos simples para comenzar tu camino hacia el bienestar.
            </Text>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <FadeIn key={i}>
                <div className="text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <span className="text-xl font-heading font-bold text-primary">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-heading font-medium text-foreground mb-3">{step.title}</h3>
                  <Text className="text-sm">{step.desc}</Text>
                </div>
              </FadeIn>
            ))}
          </StaggerContainer>

          <FadeIn className="text-center mt-12">
            <Button
              size="lg"
              className="rounded-full px-10 h-14 text-base"
              onClick={() => setIsTherapyModalOpen(true)}
            >
              Quiero iniciar terapia <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FadeIn>
        </Container>
      </Section>

      <Section spacing="lg" background="muted">
        <Container>
          <FadeIn className="text-center mb-16">
            <Heading level="h2" className="mb-4">Por que elegir Senda para iniciar terapia?</Heading>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <FadeIn key={i}>
                <Card className="h-full bg-background border-none shadow-soft p-8 text-center group hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-accent/20 transition-colors">
                    <benefit.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-heading font-medium text-foreground mb-3">{benefit.title}</h3>
                  <Text className="text-sm">{benefit.desc}</Text>
                </Card>
              </FadeIn>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container size="sm">
          <FadeIn className="text-center">
            <Heading level="h2" className="mb-6">Esto te pasa?</Heading>
            <Text variant="lead" className="max-w-lg mx-auto mb-8">
              No todos tenemos los mismos motivos, pero todos queremos lo mismo: sentirnos mejor.
              Empezar terapia puede ser el primer paso.
            </Text>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-10 h-14 text-base font-semibold"
              onClick={() => setIsTherapyModalOpen(true)}
            >
              Quiero sentirme mejor <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FadeIn>
        </Container>
      </Section>

      <Section id="precios" spacing="lg" background="muted">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <Heading level="h2" className="mb-8"><em>Comienza tu proceso de terapia.</em></Heading>
              <div className="space-y-4 text-foreground">
                <div className="flex items-center gap-3"><Check className="h-5 w-5 text-accent flex-shrink-0" /><span>Duracion de 45 a 60 minutos</span></div>
                <div className="flex items-center gap-3"><Check className="h-5 w-5 text-accent flex-shrink-0" /><span>Pago seguro con tarjeta de credito/debito</span></div>
                <div className="flex items-center gap-3"><Check className="h-5 w-5 text-accent flex-shrink-0" /><span>100% online, desde donde estes</span></div>
                <div className="flex items-center gap-3"><Check className="h-5 w-5 text-accent flex-shrink-0" /><span>Confidencialidad garantizada</span></div>
              </div>
            </FadeIn>

            <StaggerContainer className="space-y-6">
              <FadeIn>
                <Card className="bg-background border-none shadow-soft p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-secondary/10 rounded-bl-2xl px-4 py-2">
                    <Badge className="bg-secondary/20 text-secondary border-none font-medium"><Star className="h-3 w-3 mr-1" /> Mas elegido</Badge>
                  </div>

                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Pack de 4 sesiones</h3>
                  <p className="text-sm text-muted-foreground mb-4">Reserva 4 sesiones a traves de un unico pago con descuento.</p>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-sm text-muted-foreground line-through">USD 49</span>
                    <Badge className="bg-accent/10 text-accent border-none text-xs font-bold">20% OFF</Badge>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-heading font-bold text-foreground">USD 39</span>
                    <span className="text-sm text-muted-foreground">/ por sesion</span>
                  </div>

                  <Button
                    className="rounded-full px-8 h-12 font-semibold border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setIsTherapyModalOpen(true)}
                  >
                    Solicitar sesiones
                  </Button>
                </Card>
              </FadeIn>

              <FadeIn>
                <Card className="wati-dark-cta border-none p-6 md:p-8">
                  <h3 className="text-xl font-heading font-semibold mb-2">1 sesion</h3>
                  <p className="text-sm text-primary-foreground/70 mb-6">Paga antes de tomar cada sesion con tu terapeuta.</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-heading font-bold">USD 49</span>
                    <span className="text-sm text-primary-foreground/70">/ por sesion</span>
                  </div>

                  <Button
                    variant="secondary"
                    className="rounded-full px-8 h-12 font-semibold transition-colors"
                    onClick={() => setIsTherapyModalOpen(true)}
                  >
                    Solicitar una sesion
                  </Button>
                </Card>
              </FadeIn>
            </StaggerContainer>
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <FadeIn className="text-center mb-16">
            <Heading level="h2" className="mb-4">Nuestro equipo</Heading>
            <Text variant="lead" className="max-w-lg mx-auto">
              Trabajamos con un equipo de profesionales clinicos para que encuentres a alguien con quien te sientas a gusto.
            </Text>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <FadeIn key={i}>
                <div className="text-center group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                    <span className="text-2xl font-heading font-bold text-primary">{member.name.split(" ")[0][0]}{member.name.split(" ")[1]?.[0] || ""}</span>
                  </div>
                  <h4 className="font-heading font-medium text-foreground text-sm">{member.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{member.specialty}</p>
                </div>
              </FadeIn>
            ))}
          </StaggerContainer>

          <FadeIn className="text-center mt-12">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-10 h-14 text-base font-semibold"
              onClick={() => setIsTherapyModalOpen(true)}
            >
              Solicitar terapia
            </Button>
          </FadeIn>
        </Container>
      </Section>

      <Section spacing="lg" background="muted">
        <Container size="sm">
          <FadeIn className="text-center">
            <Heading level="h2" className="mb-4">Mas de +1.500 personas nos eligen para acompanarlas en su proceso.</Heading>
            <Text variant="lead" className="max-w-lg mx-auto mb-8">
              Invertir en tu bienestar emocional es la decision mas importante que puedes tomar hoy.
            </Text>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-10 h-14 text-base font-semibold"
              onClick={() => setIsTherapyModalOpen(true)}
            >
              Quiero sentirme mejor <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FadeIn>
        </Container>
      </Section>

      <TherapyModal open={isTherapyModalOpen} onOpenChange={setIsTherapyModalOpen} />
    </div>
  );
}
