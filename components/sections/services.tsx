"use client";

import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import Link from "next/link";
import Image from "next/image";

export function ServicesSection() {
    return (
        <Section id="servicios" spacing="lg" background="default">
            <Container>
                <FadeIn className="bg-primary rounded-2xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
                    {/* Decorative circle */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Decorative illustration */}
                    <div className="absolute bottom-4 left-4 md:left-8 opacity-30 pointer-events-none hidden md:block">
                        <Image
                            src="/illustrations/services.png"
                            alt=""
                            width={240}
                            height={180}
                            className="object-contain"
                            aria-hidden="true"
                        />
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <Heading level="h2" className="text-primary-foreground mb-6">
                            Tu siguiente paso puede empezar hoy.
                        </Heading>
                        <Text className="text-primary-foreground/80 text-lg mb-10">
                            El primer diagnóstico es gratuito. Descubre tus anclas de carrera y recibe un informe
                            personalizado para empezar a construir tu próximo capítulo con claridad.
                        </Text>
                        <Button variant="secondary" size="lg" className="rounded-full px-10 h-14 text-base shadow-lg" asChild>
                            <Link href="/diagnostico/ancla-de-carrera">
                                Comenzar mi diagnóstico
                            </Link>
                        </Button>
                    </div>
                </FadeIn>
            </Container>
        </Section>
    )
}
