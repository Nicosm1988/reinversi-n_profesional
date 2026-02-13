"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";

export function FAQSection() {
    const faqs = [
        { q: "¿Es terapia psicológica?", a: "No. Aunque usamos herramientas de psicología laboral y neurociencia, este es un proceso estratégico orientado a objetivos profesionales concretos (conseguir empleo, emprender, ascender). No tratamos patologías ni crisis de salud mental." },
        { q: "¿Cuánto dura el proceso?", a: "El diagnóstico es inmediato. El Pack Triage es una sesión única de 60 minutos. El programa de Reinvención Total dura típicamente entre 4 y 8 semanas, dependiendo de tu ritmo de implementación." },
        { q: "¿Qué pasa si no sé qué quiero hacer?", a: "Es el mejor momento para empezar. Nuestro módulo de 'Diagnóstico Híbrido' está diseñado específicamente para desenmarañar la confusión y encontrar patrones de interés y habilidad que quizás no estás viendo." },
        { q: "¿Es online o presencial?", a: "Es 100% online para maximizar flexibilidad, pero mantenemos la calidez de la interacción humana síncrona en todas las sesiones clave." }
    ];

    return (
        <Section id="faq" spacing="lg">
            <Container size="tight">
                <FadeIn className="text-center mb-16">
                    <Heading level="h2" className="mb-4">Preguntas Frecuentes</Heading>
                    <Text>Claridad ante todo.</Text>
                </FadeIn>

                <FadeIn>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border-b-border/40 px-2">
                                <AccordionTrigger className="text-lg md:text-xl font-heading text-left hover:text-primary transition-colors py-6">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </FadeIn>
            </Container>
        </Section>
    );
}
