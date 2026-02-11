"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Esto es terapia psicológica?",
    answer:
      "No. Nuestro servicio de psicología laboral es una intervención focalizada en el ámbito profesional, no clínica. Trabajamos burnout, duelo laboral, ansiedad ante el cambio y reconstrucción de confianza desde una perspectiva estratégica. Si detectamos que necesitás atención clínica, te derivamos responsablemente.",
  },
  {
    question: "¿Cuánto dura el proceso completo?",
    answer:
      "Depende de tu situación y la ruta que se defina. El diagnóstico es inmediato (10-15 minutos + triage). Los procesos completos van desde 4 semanas (reempleo acelerado) hasta 12 semanas (cambio total de carrera). El seguimiento post intervención dura 90 días adicionales.",
  },
  {
    question: "¿Qué pasa si estoy en crisis emocional?",
    answer:
      "Nuestro sistema de triage tiene protocolos específicos para situaciones de crisis. Si el diagnóstico detecta señales de alerta, priorizamos la derivación a psicología laboral antes de cualquier intervención de carrera. Tu bienestar es la prioridad.",
  },
  {
    question: "¿Cuánto cuesta?",
    answer:
      "El diagnóstico inicial es gratuito. Los servicios individuales arrancan desde $35.000 por sesión. Los paquetes integrales tienen descuentos significativos y se pueden adaptar a tu presupuesto. Ofrecemos planes de pago flexibles.",
  },
  {
    question: "¿Es todo online?",
    answer:
      "Sí, todo el proceso es 100% online. Las sesiones de coaching y psicología se realizan por videollamada. El diagnóstico, el branding y el seguimiento son digitales. Esto nos permite atender profesionales de toda Argentina y Latinoamérica.",
  },
  {
    question: "¿La IA decide mi futuro profesional?",
    answer:
      "No, nunca. Nuestra regla ética central es: la IA sugiere, el humano decide. La inteligencia artificial analiza patrones y genera recomendaciones, pero cada decisión sobre tu carrera la tomás vos con el acompañamiento de profesionales humanos.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">
              Respuestas claras, sin letra chica
            </span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-heading text-base font-semibold text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
