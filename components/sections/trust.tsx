"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";

const testimonials = [
    {
        quote: "No necesitaba un coach que me dijera 'tú puedes'. Necesitaba una estrategia para traducir 15 años de banca a fintech. El método fue quirúrgico.",
        author: "Carlos M.",
        role: "VP de Operaciones",
    },
    {
        quote: "Estaba paralizada por el síndrome del impostor. El diagnóstico me mostró objetivamente mi valor en el mercado actual. En 6 semanas cerré mi transición.",
        author: "Sofia L.",
        role: "Product Owner",
    },
    {
        quote: "La inversión más inteligente que hice en mi carrera. Dejé la relación de dependencia y validé mi consultora en 3 meses con su framework.",
        author: "Javier R.",
        role: "Consultor Estratégico",
    }
];

export function TrustSection() {
    return (
        <Section spacing="lg" background="muted">
            <Container>
                <div className="text-center mb-16">
                    <Text variant="caption">Trust & Resultados</Text>
                    <Heading level="h2" className="mt-2">Historias Reales de Transformación</Heading>
                </div>

                <StaggerContainer className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <FadeIn key={i}>
                            <Card className="h-full bg-background border-none p-8 md:p-10 shadow-soft">
                                <blockquote className="flex flex-col h-full">
                                    <span className="text-6xl text-primary/20 font-serif leading-none -ml-4 -mt-4 mb-4">“</span>
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

                {/* Logos Placeholder - Monochrome */}
                <FadeIn className="mt-16 pt-8 border-t border-border/30 flex flex-wrap justify-center gap-12 opacity-40 grayscale mix-blend-multiply">
                    {["MercadoLibre", "Globant", "Nubank", "Google", "Amazon"].map((company) => (
                        <span key={company} className="text-lg font-bold font-heading">{company}</span>
                    ))}
                </FadeIn>
            </Container>
        </Section>
    );
}
