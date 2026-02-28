"use client";

import { useState } from "react";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { TherapyModal } from "./therapy-modal";

export function TherapySection() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <Section id="terapia" spacing="lg" background="muted">
                <Container size="sm">
                    <FadeIn>
                        <div className="bg-background rounded-3xl p-8 md:p-14 shadow-soft relative overflow-hidden">
                            {/* Decorative gradient blob */}
                            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                {/* Icon */}
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-7 h-7 text-primary" />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <Heading level="h2" className="text-2xl md:text-3xl mb-4">
                                        ¿Buscas un proceso de cambio más profundo?
                                    </Heading>
                                    <Text variant="body-lg" className="mb-8 max-w-lg">
                                        A veces la reinvención va más allá de lo profesional. Conecta con un psicólogo especializado y comienza un proceso de terapia
                                        <strong> 100% en línea</strong>, desde donde estés.
                                    </Text>

                                    <div className="flex flex-wrap gap-4">
                                        <Button
                                            onClick={() => setModalOpen(true)}
                                            size="lg"
                                            className="rounded-full px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all"
                                        >
                                            Iniciar terapia
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

            {/* Modal */}
            <TherapyModal open={modalOpen} onOpenChange={setModalOpen} />
        </>
    );
}
