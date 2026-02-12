"use client"

import { SectionContainer } from "@/components/ui/section-container"
import { motion } from "framer-motion"

const steps = [
    {
        title: "Test Inteligente",
        duration: "10-15 min",
        type: "IA",
        desc: "Diagnóstico inicial para identificar patrones, riesgos y oportunidades de carrera.",
    },
    {
        title: "Pre-análisis con IA",
        duration: "Automático",
        type: "IA",
        desc: "Nuestros algoritmos procesan tu perfil y generan un informe preliminar de empleabilidad.",
    },
    {
        title: "Triage con Coach",
        duration: "45 min",
        type: "Humano",
        desc: "Un experto revisa los datos y decide contigo la mejor estrategia. Tecnología + Criterio humano.",
    },
    {
        title: "Psicología Laboral",
        duration: "Si aplica",
        type: "Humano",
        desc: "Intervención específica para desbloquear barreras emocionales o burnout si es detectado.",
    },
    {
        title: "Branding & Estrategia",
        duration: "2-4 semanas",
        type: "Híbrido",
        desc: "Construcción de narrativa, CV, LinkedIn y plan de acción para salir al mercado.",
    },
]

export function MethodSection() {
    return (
        <SectionContainer id="metodo" className="bg-[#0F172A]">
            <div className="text-center mb-16">
                <h2 className="text-sm font-semibold tracking-wide text-green-400 uppercase">
                    El Sistema
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold text-white mt-2">
                    Método ReINversión 5.0
                </h3>
                <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                    Un proceso estructurado donde la Inteligencia Artificial sugiere, pero el experto humano decide.
                </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
                {/* Vertical Line */}
                <div className="absolute left-6 md:left-1/2 md:-ml-px top-0 bottom-0 w-px bg-white/10" />

                <div className="space-y-12">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative flex items-center md:justify-between ${i % 2 === 0 ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            {/* Dot */}
                            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#16A34A] bg-[#0F172A] z-10" />

                            <div className="ml-16 md:ml-0 md:w-[45%]">
                                <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-mono text-gray-500 uppercase">
                                            {step.duration}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${step.type === "IA"
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : step.type === "Humano"
                                                        ? "bg-green-500/10 text-green-400"
                                                        : "bg-purple-500/10 text-purple-400"
                                                }`}
                                        >
                                            {step.type}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                                    <p className="text-sm text-gray-400">{step.desc}</p>
                                </div>
                            </div>

                            <div className="hidden md:block md:w-[45%]" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </SectionContainer>
    )
}
