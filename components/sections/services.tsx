"use client";

import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import Link from "next/link";

export function ServicesSection() {
    return (
        <Section id="servicios" spacing="lg" background="default">
            <Container>
                <FadeIn className="bg-primary rounded-2xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
                    {/* Decorative circle */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <Heading level="h2" className="text-primary-foreground mb-6">
                            Tu transición puede empezar hoy.
                        </Heading>
                        <Text className="text-primary-foreground/80 text-lg mb-10">
                            Empieza a construir tu futuro con acompañamiento profesional en cada paso.
                        </Text>
                        <Button variant="secondary" size="lg" className="rounded-full px-10 h-14 text-base shadow-lg" asChild>
                            <Link href="/diagnostico/ancla-de-carrera">
                                Quiero mi diagnóstico
                            </Link>
                        </Button>
                    </div>
                </FadeIn>
            </Container>
        </Section>
    )
}
