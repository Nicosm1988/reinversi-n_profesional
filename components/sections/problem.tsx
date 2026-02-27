"use client";

import { Card } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";

const problems = [
    {
        title: "Parálisis por Análisis",
        desc: "La sobreoferta de opciones (IA, remoto, emprender) genera un ruido ensordecedor. El miedo a equivocarte te mantiene inmóvil en un rol que ya no te representa.",
    },
    {
        title: "Burnout Corporativo",
        desc: "Tu rol actual consume tu energía vital, pero no ves un puente claro hacia otro sector sin sentir que empiezas de cero y pierdes tu seniority.",
    },
    {
        title: "Síndrome del Impostor",
        desc: "El mercado cambió radicalmente mientras trabajabas. Sientes que tu experiencia de 10 años vale menos hoy que ayer frente a las nuevas herramientas.",
    }
];

export function ProblemSection() {
    return (
        <Section spacing="lg" background="muted">
            <Container>
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    <FadeIn>
                        <div className="sticky top-32">
                            <Heading level="h2" className="mb-6">
                                Entendemos el peso de esta transición.
                            </Heading>
                            <Text variant="body-lg" className="mb-8">
                                No es falta de capacidad ni que el mercado te haya dejado atrás. Es que las reglas del juego cambiaron y necesitas un espacio seguro para rearmar tu estrategia.
                                <br /><br />
                                Déjate acompañar. La intuición ya no alcanza, construyamos un sistema.
                            </Text>
                        </div>
                    </FadeIn>

                    <StaggerContainer className="space-y-8">
                        {problems.map((item, i) => (
                            <FadeIn key={i} className="group">
                                <div className="pl-8 border-l-2 border-primary/20 group-hover:border-primary transition-colors duration-500">
                                    <h3 className="text-xl font-heading font-medium text-foreground mb-3 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <Text>
                                        {item.desc}
                                    </Text>
                                </div>
                            </FadeIn>
                        ))}
                    </StaggerContainer>

                </div>
            </Container>
        </Section>
    );
}
