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
        desc: "Para quienes quieren reinsertarse rápidamente en un rol similar. Optimizamos tu narrativa profesional y posicionamiento para reducir el tiempo de búsqueda.",
        badge: "Fast Track",
    },
    {
        title: "Actualización Digital + IA",
        desc: "Si sientes que las nuevas herramientas te dejaron atrás, te ayudamos a cerrar la brecha y recuperar tu ventaja competitiva en el mercado de hoy.",
        badge: "Upskilling",
    },
    {
        title: "Reposicionamiento Senior",
        desc: "Para directivos y gerentes que apuntan a posiciones C-Level o consultoría estratégica. Transformamos tu narrativa de ejecución a visión de negocio.",
        badge: "Executive",
    },
    {
        title: "Cambio de Rumbo",
        desc: "Quieres dar un giro de industria o función, pero no sabes cómo. Diseñamos un plan para transferir tus fortalezas hacia un sector completamente nuevo.",
        badge: "Pivot",
    },
    {
        title: "Emprendimiento",
        desc: "De la relación de dependencia a tu propio proyecto. Validamos tu idea de negocio con una estructura de riesgo controlado y pasos claros.",
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
                        No hay dos trayectorias iguales. Diseñamos la estrategia según tu punto de partida y tu horizonte.
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

                                <Button variant="link" className="p-0 h-auto text-secondary font-medium group" asChild>
                                    <Link href="/diagnostico/ancla-de-carrera">
                                        Comenzar mi diagnóstico <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
