"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function TherapySection() {
    return (
        <Section id="terapia" spacing="lg" background="muted">
            <Container size="sm">
                <FadeIn>
                    <div className="bg-background rounded-3xl p-8 md:p-14 shadow-soft relative overflow-hidden">
                        {/* Decorative gradient blob */}
                        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                            {/* Icon + illustration */}
                            <div className="flex flex-col items-center gap-4 flex-shrink-0">
                                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                    <Heart className="w-7 h-7 text-secondary" />
                                </div>
                                <Image
                                    src="/illustrations/therapy.png"
                                    alt="Bienestar emocional y autocuidado"
                                    width={180}
                                    height={135}
                                    className="object-contain opacity-85 hidden md:block"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <Heading level="h2" className="text-2xl md:text-3xl mb-4">
                                    A veces el cambio necesita un espacio más profundo.
                                </Heading>
                                <Text variant="body-lg" className="mb-8 max-w-lg">
                                    Si sientes que tu proceso de reinvención necesita un acompañamiento emocional,
                                    conecta con un psicólogo especializado. Sesiones
                                    <strong> 100% en línea</strong>, desde donde estés.
                                </Text>

                                <div className="flex flex-wrap gap-4">
                                    <Button
                                        size="lg"
                                        className="rounded-full px-8 h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold transition-all"
                                        asChild
                                    >
                                        <Link href="/terapia">
                                            Conocer terapia <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="rounded-full px-8 h-12 text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => {
                                            const section = document.getElementById("servicios");
                                            section?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                    >
                                        Seguir explorando
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </Container>
        </Section>
    );
}
