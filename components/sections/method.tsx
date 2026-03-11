"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import Image from "next/image";

const steps = [
    {
        step: "ETAPA 01",
        title: "Descubrir quién eres hoy",
        desc: "Nos tomamos el tiempo de escucharte. Exploramos tu trayectoria, tus talentos, lo que te importa de verdad y lo que ya no te representa. El objetivo es que tu próximo movimiento nazca de un lugar auténtico.",
    },
    {
        step: "ETAPA 02",
        title: "Entender hacia dónde ir",
        desc: "Conectamos tu perfil con las oportunidades reales del mercado actual. Juntos mapeamos roles, sectores y caminos de formación que se alineen con lo que descubrimos en la primera etapa.",
    },
    {
        step: "ETAPA 03",
        title: "Tu mapa de claridad",
        desc: "Todo cobra sentido acá. Recibes un informe personalizado que integra tus fortalezas, intereses y áreas de crecimiento. Es la herramienta que necesitas para tomar decisiones con confianza y con datos reales sobre ti.",
    },
    {
        step: "ETAPA 04",
        title: "Salir al mundo preparado",
        desc: "Con el plan en mano, te equipamos con todo lo necesario para posicionarte: CV estratégico, preparación para entrevistas y las herramientas para dar tu próximo paso con seguridad.",
    }
];

export function MethodSection() {
    return (
        <Section id="metodo" spacing="lg">
            <Container size="sm">
                <FadeIn className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <span className="text-sm font-medium tracking-widest uppercase text-primary/60 mb-2 block">
                                Nuestro Enfoque
                            </span>
                            <Heading level="h2">
                                Tu Ruta de Transición
                            </Heading>
                        </div>
                        <Image
                            src="/illustrations/method.png"
                            alt="Camino de progreso profesional"
                            width={280}
                            height={210}
                            className="object-contain opacity-85 rounded-[2rem]"
                        />
                    </div>
                </FadeIn>

                <StaggerContainer className="relative border-l border-border/60 ml-3 md:ml-0 space-y-6 pb-4">
                    {steps.map((step, i) => (
                        <FadeIn key={i} className="relative pl-12 md:pl-16">
                            {/* Marker */}
                            <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-background border-2 border-primary ring-4 ring-background z-10 transition-colors hover:bg-primary"></div>

                            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 group">
                                <span className="text-sm font-bold text-primary/40 font-mono group-hover:text-primary transition-colors">
                                    {step.step}
                                </span>
                                <div>
                                    <h3 className="text-xl font-heading font-medium text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                                        {step.title}
                                    </h3>
                                    <Text>
                                        {step.desc}
                                    </Text>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </StaggerContainer>
            </Container>
        </Section>
    );
}
