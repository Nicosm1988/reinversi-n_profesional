"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FAQSection() {
    const faqs = [
        { q: "¿Es terapia psicológica?", a: "No. Aunque usamos herramientas de psicología laboral y neurociencia, este es un proceso estratégico orientado a objetivos profesionales concretos (conseguir empleo, emprender, ascender). No tratamos patologías ni crisis de salud mental." },
        { q: "¿Cuánto dura el proceso?", a: "El diagnóstico es inmediato. El Pack Triage es una sesión única de 60 minutos. El programa de Reinvención Total dura típicamente entre 4 y 8 semanas, dependiendo de tu ritmo de implementación." },
        { q: "¿La IA toma decisiones por mí?", a: "Jamás. La IA es nuestro copiloto analítico: procesa datos de mercado, optimiza tu CV y simula escenarios. Pero las decisiones de carrera y la estrategia final siempre las defines tú con tu coach humano." },
        { q: "¿Qué pasa si no sé qué quiero hacer?", a: "Es el mejor momento para empezar. Nuestro módulo de 'Diagnóstico Híbrido' está diseñado específicamente para desenmarañar la confusión y encontrar patrones de interés y habilidad que quizás no estás viendo." }
    ];

    return (
        <section id="faq" className="py-24 bg-slate-50/50">
            <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold font-heading mb-4">Preguntas Frecuentes</h2>
                    <p className="text-muted-foreground">Todo lo que necesitas saber antes de dar el paso.</p>
                </motion.div>

                <Accordion type="single" collapsible className="w-full bg-background rounded-xl border border-border/50 shadow-sm px-6 py-2">
                    {faqs.map((item, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-b-border/50 last:border-0">
                            <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline">
                                {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-24 text-center bg-card p-12 rounded-3xl border border-border shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50 -z-10"></div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-heading">
                        Tu transición empieza hoy.
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Deja de adivinar. Empieza a construir tu futuro con datos, estrategia y soporte real.
                    </p>
                    <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl hover:scale-105 transition-transform" asChild>
                        <Link href="#diagnostico">
                            Hacé tu diagnóstico ahora <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
