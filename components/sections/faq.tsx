import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";

export function FAQSection() {
    const faqs = [
        { q: "¿Para quién es este servicio?", a: "Para cualquier persona que atraviese una transición o un momento de incertidumbre laboral. Puede ser porque perdió su empleo, porque la IA transformó su industria, porque quiere cambiar de rumbo o porque siente que llegó el momento de dar un nuevo paso." },
        { q: "¿Cuánto dura el proceso?", a: "El diagnóstico es inmediato y gratuito. El programa de acompañamiento completo dura típicamente entre 4 y 8 semanas, dependiendo de tu ritmo y tus objetivos." },
        { q: "¿Qué pasa si no sé qué quiero hacer?", a: "Ese puede ser un buen momento para empezar. El diagnóstico ayuda a descubrir patrones de interés, fortalezas y valores que quizá todavía no resultan evidentes. No hace falta llegar con respuestas, sino con disposición para explorar." },
        { q: "¿Es online o presencial?", a: "Es 100% online para que puedas acceder desde cualquier parte del mundo. Mantenemos la cercanía y calidez humana en cada sesión." }
    ];

    return (
        <Section id="faq" spacing="lg">
            <Container size="tight">
                <FadeIn className="text-center mb-8">
                    <Heading level="h2" className="mb-4">Preguntas Frecuentes</Heading>
                    <Text>Claridad ante todo.</Text>
                </FadeIn>

                <FadeIn>
                    <Accordion type="single" collapsible className="w-full rounded-2xl border border-border bg-white px-4 shadow-soft">
                        {faqs.map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border-b-border/50 px-2">
                                <AccordionTrigger className="text-lg md:text-xl font-heading text-left text-primary transition-colors py-6">
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
