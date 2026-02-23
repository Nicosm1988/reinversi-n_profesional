"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";

const steps = [
    {
        step: "ETAPA 01",
        title: "Exploración y Autoconocimiento",
        desc: "Indagamos en tu historia, personalidad, aptitudes y valores \"no negociables\". Descubrimos qué te motiva genuinamente para asegurar que tu próximo paso esté en profunda sintonía con tu proyecto de vida.",
    },
    {
        step: "ETAPA 02",
        title: "Análisis de Mercado y Oportunidades",
        desc: "Cruzamos tu perfil con la realidad del entorno laboral actual. Identificamos juntos posibles roles, áreas de interés, y analizamos planes de estudio o vías de upskilling/reskilling con mayor proyección a futuro.",
    },
    {
        step: "ETAPA 03",
        title: "Síntesis y Hoja de Ruta",
        desc: "¡El momento de claridad! Te entregamos un informe integral que consolida tus fortalezas, perfil de intereses y áreas de desarrollo. Esta será tu brújula para tomar decisiones basadas en datos concretos sobre vos mismo.",
    },
    {
        step: "ETAPA 04",
        title: "Estrategia de Inserción",
        desc: "Pasamos a la acción. Con el plan definido, te orientamos y brindamos herramientas clave de posicionamiento (armado estratégico de CV, preparación para entrevistas) para salir al mercado con seguridad y eficacia.",
    }
];

export function MethodSection() {
    return (
        <Section id="metodo" spacing="lg">
            <Container size="sm">
                <FadeIn className="mb-16">
                    <span className="text-sm font-medium tracking-widest uppercase text-primary/60 mb-2 block">
                        Nuestro Enfoque
                    </span>
                    <Heading level="h2">
                        Tu Ruta de Transición
                    </Heading>
                </FadeIn>

                <StaggerContainer className="relative border-l border-border/60 ml-3 md:ml-0 space-y-12 pb-4">
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
