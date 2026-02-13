"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const paths = [
    {
        title: "Reempleo Acelerado",
        desc: "Optimización quirúrgica de tu perfil para volver al mercado en tiempo récord.",
        badge: "Fast Track",
    },
    {
        title: "Re-skilling Guiado",
        desc: "Identificación de brechas tecnológicas y plan de aprendizaje curado por expertos.",
        badge: "Update",
    },
    {
        title: "Reposicionamiento Senior",
        desc: "Para líderes que buscan roles de impacto (C-Level, Advisory) y necesitan nueva narrativa.",
        badge: "Executive",
    },
    {
        title: "Cambio Total (Pivot)",
        desc: "Diseño de una nueva carrera desde cero, aprovechando tus skills transferibles.",
        badge: "Transform",
    },
    {
        title: "Emprendimiento",
        desc: "Validación de ideas de negocio y transición de empleado a fundador con bajo riesgo.",
        badge: "Venture",
    },
];

export function PathsSection() {
    return (
        <Section id="caminos" spacing="lg" background="muted">
            <Container>
                <FadeIn className="mb-16 md:mb-24 max-w-2xl">
                    <Heading level="h2" className="mb-6">
                        5 Caminos Posibles. <br />
                        Una Sola Decisión.
                    </Heading>
                    <Text variant="lead">
                        No hay dos trayectorias iguales. Diseñamos la estrategia según tu punto de partida y tu ambición.
                    </Text>
                </FadeIn>

                <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paths.map((path, i) => (
                        <FadeIn key={i}>
                            <Card className="h-full bg-background border-none shadow-soft hover:shadow-subtle p-8 flex flex-col items-start transition-shadow duration-300">
                                <div className="mb-6">
                                    <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none font-medium">
                                        {path.badge}
                                    </Badge>
                                </div>

                                <h3 className="text-xl font-heading font-medium text-foreground mb-4">
                                    {path.title}
                                </h3>

                                <Text className="mb-8 flex-1">
                                    {path.desc}
                                </Text>

                                <Button variant="link" className="p-0 h-auto text-primary font-medium group" asChild>
                                    <Link href="#contacto">
                                        Ver detalles <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </Card>
                        </FadeIn>
                    ))}
                </StaggerContainer>
            </Container>
        </Section>
    );
}
