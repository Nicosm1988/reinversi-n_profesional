"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";

export function FAQSection() {
    const faqs = [
        { q: "¿Es terapia psicológica?", a: "Nuestro equipo incluye profesionales de psicología, pero este servicio está orientado a orientación vocacional-profesional: ayudarte a encontrar tu próximo paso de carrera con claridad estratégica. No reemplaza procesos de psicoterapia clínica. Si necesitas ese espacio, también podemos conectarte con un terapeuta." },
        { q: "¿Para quién es este servicio?", a: "Para cualquier persona que esté en un momento de transición o incertidumbre profesional. Ya sea porque perdiste tu empleo, porque la IA transformó tu industria, porque quieres pivotar o simplemente porque sientes que llegó el momento de un cambio." },
        { q: "¿Cuánto dura el proceso?", a: "El diagnóstico es inmediato y gratuito. El programa de acompañamiento completo dura típicamente entre 4 y 8 semanas, dependiendo de tu ritmo y tus objetivos." },
        { q: "¿Qué pasa si no sé qué quiero hacer?", a: "Ese es exactamente el mejor momento para empezar. Nuestro diagnóstico está diseñado para ayudarte a descubrir patrones de interés, fortalezas y valores que tal vez no estás viendo. No necesitas llegar con respuestas, sino con la disposición de explorar." },
        { q: "¿Es online o presencial?", a: "Es 100% online para que puedas acceder desde cualquier parte del mundo. Mantenemos la cercanía y calidez humana en cada sesión." }
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
                                <AccordionTrigger className="text-lg md:text-xl font-heading text-left hover:text-secondary transition-colors py-6">
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
