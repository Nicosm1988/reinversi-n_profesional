"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";

const steps = [
    {
        step: "ETAPA 01",
        title: "Autoconocimiento",
        desc: "Conocer tu personalidad, trayectoria, intereses y tus \"no negociables\" para que tu trabajo te motive y esté en profunda sintonía con tus necesidades personales.",
    },
    {
        step: "ETAPA 02",
        title: "Mercado y Oportunidades",
        desc: "Entender las oportunidades que ofrece el entorno laboral actual. Identificamos juntos posibles roles, formaciones o vías de upskilling/reskilling alineadas a un futuro con buena proyección.",
    },
    {
        step: "ETAPA 03",
        title: "Estrategia e Inserción",
        desc: "Definir un plan de acción concreto con sentido. Te orientamos en la búsqueda, posicionamiento (CV, herramientas) y salidas laborales para avanzar con eficiencia y confianza.",
    },
    {
        step: "CIERRE",
        title: "Informe y Hoja de Ruta",
        desc: "¡Tu brújula para el próximo paso! Entrega del informe final detallando fortalezas, perfil de intereses y recomendaciones estratégicas claras de inserción.",
    }
];

export function MethodSection() {
    return (
        <Section id="metodo" spacing="lg">
            <Container size="sm">
                <FadeIn className="mb-16">
                    <span className="text-sm font-medium tracking-widest uppercase text-primary/60 mb-2 block">
                        Nuestra Metodología
                    </span>
                    <Heading level="h2">
                        Ingeniería de Reinvención
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
