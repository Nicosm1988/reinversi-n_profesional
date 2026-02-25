"use client";

import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { StaggerContainer, SlideUp } from "@/components/motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
    return (
        <Section spacing="lg" className="pt-24 pb-14 md:pt-36 md:pb-20 relative">
            {/* Background Texture Subtle */}
            <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>

            <Container className="relative z-10 text-center">
                <StaggerContainer>
                    <SlideUp delay={0.1}>
                        <Heading level="h1" className="mb-6 max-w-4xl mx-auto">
                            No perdiste el rumbo. <br className="hidden md:block" />
                            Estás en <span className="italic font-serif text-secondary">transición</span>.
                        </Heading>
                    </SlideUp>

                    <SlideUp delay={0.2}>
                        <Text variant="lead" className="max-w-2xl mx-auto mb-10">
                            Transformamos la incertidumbre laboral en un espacio de exploración personal y profesional, trazando nuevos puentes desde el presente hacia el futuro y validando tu recorrido.
                        </Text>
                    </SlideUp>

                    <SlideUp delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="h-14 px-8 text-base w-full sm:w-auto rounded-full" asChild>
                                <Link href="/diagnostico/ancla-de-carrera">
                                    Comenzar Diagnóstico <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-8 text-base w-full sm:w-auto rounded-full bg-transparent border-foreground/20 hover:bg-foreground/5" asChild>
                                <Link href="#metodo">
                                    Conocer Método
                                </Link>
                            </Button>
                        </div>
                    </SlideUp>

                </StaggerContainer>
            </Container>
        </Section>
    );
}
