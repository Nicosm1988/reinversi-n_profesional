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
        desc: "Optimización estratégica para profesionales que buscan reinsertarse rápidamente en roles similares, mejorando su narrativa y posicionamiento para reducir el tiempo de búsqueda.",
        badge: "Fast Track",
    },
    {
        title: "Re-skilling Guiado",
        desc: "Cierre de brechas para quienes necesitan actualizar sus competencias en herramientas digitales e IA Generativa para recuperar su ventaja competitiva en el mercado actual.",
        badge: "Digital Update",
    },
    {
        title: "Reposicionamiento Senior",
        desc: "Elevación de perfil para gerentes y directores que apuntan a posiciones C-Level o consultoría estratégica, transformando su narrativa de ejecución a visión de negocio.",
        badge: "Executive",
    },
    {
        title: "Cambio Total (Pivot)",
        desc: "Planificación estructural para quienes desean dar un giro radical de industria o función, transfiriendo sus fortalezas hacia un sector completamente nuevo.",
        badge: "Pivot",
    },
    {
        title: "Emprendimiento",
        desc: "Transición segura de la relación de dependencia a la creación de un negocio propio o consultoría, validando el modelo de negocio con una estructura de riesgo controlado.",
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
                                    <Link href="/diagnostico">
                                        Hacer diagnóstico <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
