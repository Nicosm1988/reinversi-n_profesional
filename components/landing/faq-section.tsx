"use client"

import { SectionContainer } from "@/components/ui/section-container"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        q: "¿Es terapia psicológica?",
        a: "No. Si bien tenemos psicólogos laborales en el equipo para abordar bloqueos específicos o burnout, el foco central es estratégico y de carrera, no clínico.",
    },
    {
        q: "¿Cuánto dura el proceso?",
        a: "Depende de la ruta. Un diagnóstico toma 15 minutos. El programa de 'Plan Estratégico' dura 1 mes. El de 'Transformación Total' es un acompañamiento de 3 meses.",
    },
    {
        q: "¿Qué pasa si estoy en crisis aguda?",
        a: "Si detectamos que estás atravesando una crisis emocional severa que impide la toma de decisiones, te derivaremos a nuestra red de psicólogos clínicos antes de comenzar el proceso de carrera.",
    },
    {
        q: "¿Es todo online?",
        a: "Sí. Todo el proceso es 100% remoto, diseñado para ejecutarse desde tu casa con máxima eficiencia de tiempo.",
    },
]

export function FAQSection() {
    return (
        <SectionContainer id="faq" className="bg-[#0F172A] border-t border-white/10">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white text-center mb-12">
                    Preguntas Frecuentes
                </h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                            <AccordionTrigger className="text-white hover:text-blue-400 hover:no-underline">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </SectionContainer>
    )
}
