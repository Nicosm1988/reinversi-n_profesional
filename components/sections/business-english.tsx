"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { ArrowRight, Globe, MessageSquare, FileText, Users } from "lucide-react";
import Link from "next/link";

const benefits = [
    {
        icon: MessageSquare,
        title: "Entrevistas en Inglés",
        desc: "Prepárate para entrevistas laborales en inglés con confianza. Practicamos situaciones reales del mundo corporativo global.",
        badge: "Speaking",
    },
    {
        icon: Globe,
        title: "Networking Internacional",
        desc: "Aprende a construir relaciones profesionales en inglés: desde LinkedIn hasta conferencias internacionales.",
        badge: "Networking",
    },
    {
        icon: FileText,
        title: "Comunicación Ejecutiva",
        desc: "Emails, presentaciones y reportes con vocabulario profesional. Comunica tus ideas con la claridad que tu rol exige.",
        badge: "Writing",
    },
    {
        icon: Users,
        title: "Reuniones y Negociación",
        desc: "Domina las reuniones en inglés: desde small talk hasta negociaciones complejas con stakeholders globales.",
        badge: "Business",
    },
];

export function BusinessEnglishSection() {
    return (
        <Section id="ingles-negocios" spacing="lg" background="default">
            <Container>
                <FadeIn className="mb-16 md:mb-20 max-w-2xl">
                    <span className="text-sm font-medium tracking-widest uppercase text-secondary mb-2 block">
                        Servicio complementario
                    </span>
                    <Heading level="h2" className="mb-6">
                        Potencia tu inglés profesional.
                    </Heading>
                    <Text variant="lead">
                        En el mercado global de 2026, el inglés dejó de ser un plus para convertirse en una herramienta esencial. Te ayudamos a dominarlo con foco en tu realidad profesional.
                    </Text>
                </FadeIn>

                <StaggerContainer className="grid md:grid-cols-2 gap-8">
                    {benefits.map((item, i) => (
                        <FadeIn key={i}>
                            <Card className="h-full bg-background border-none shadow-soft hover:shadow-subtle p-8 flex flex-col items-start transition-all duration-300 group hover:-translate-y-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                                        <item.icon className="h-5 w-5 text-secondary" />
                                    </div>
                                    <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 border-none font-medium">
                                        {item.badge}
                                    </Badge>
                                </div>

                                <h3 className="text-xl font-heading font-medium text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>

                                <Text className="mb-6 flex-1">
                                    {item.desc}
                                </Text>
                            </Card>
                        </FadeIn>
                    ))}
                </StaggerContainer>

                <FadeIn className="mt-12 text-center">
                    <Button variant="default" size="lg" className="rounded-full px-10 h-14 text-base" asChild>
                        <Link href="/contacto">
                            Quiero mejorar mi inglés <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </FadeIn>
            </Container>
        </Section>
    );
}
