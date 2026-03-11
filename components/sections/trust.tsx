"use client";

import { Card } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import Image from "next/image";

const testimonials = [
    {
        quote: "Llevaba meses sin saber para dónde ir. El diagnóstico me dio un mapa claro de mis fortalezas y un plan concreto. Hoy estoy en un rol que me apasiona.",
        author: "Martina V.",
        role: "Product Manager",
    },
    {
        quote: "La IA me hizo sentir que mis 15 años de experiencia ya no valían. Este proceso me ayudó a traducir toda esa trayectoria al lenguaje del mercado actual.",
        author: "Carlos M.",
        role: "Director de Operaciones",
    },
    {
        quote: "No sabía si emprender o buscar empleo. Necesitaba alguien que me ayudara a pensar con claridad, sin presión. Eso encontré acá.",
        author: "Sofía L.",
        role: "Consultora Independiente",
    }
];

export function TrustSection() {
    return (
        <Section spacing="lg" background="muted">
            <Container>
                <div className="text-center mb-16">
                    <Text variant="caption">Historias reales</Text>
                    <Heading level="h2" className="mt-2">Profesionales que encontraron su rumbo</Heading>
                    <div className="flex justify-center mt-6">
                        <Image
                            src="/illustrations/trust.png"
                            alt="Personas compartiendo experiencias"
                            width={260}
                            height={195}
                            className="object-contain opacity-90"
                        />
                    </div>
                </div>

                <StaggerContainer className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <FadeIn key={i}>
                            <Card className="h-full bg-background border-none p-8 md:p-10 shadow-soft">
                                <blockquote className="flex flex-col h-full">
                                    <span className="text-6xl text-secondary/30 font-serif leading-none -ml-4 -mt-4 mb-4">&ldquo;</span>
                                    <Text variant="body-lg" className="flex-1 mb-8 text-foreground font-medium italic">
                                        {t.quote}
                                    </Text>
                                    <footer className="mt-auto border-t border-border/50 pt-6">
                                        <cite className="not-italic">
                                            <div className="font-bold text-foreground font-heading">{t.author}</div>
                                            <div className="text-sm text-muted-foreground">{t.role}</div>
                                        </cite>
                                    </footer>
                                </blockquote>
                            </Card>
                        </FadeIn>
                    ))}
                </StaggerContainer>

            </Container>
        </Section>
    );
}
