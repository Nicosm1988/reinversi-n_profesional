"use client"

import { SectionContainer } from "@/components/ui/section-container"
import { motion } from "framer-motion"
import { Brain, LineChart, FlaskConical, Briefcase, Users, AlertTriangle } from "lucide-react"

const problems = [
    {
        icon: Brain,
        title: "Miedo a la IA",
        desc: "Sentís que la tecnología te dejó atrás. Tu industria cambió y nadie te preparó para la velocidad de la automatización.",
    },
    {
        icon: LineChart,
        title: "Desactualización",
        desc: "Tus habilidades ya no coinciden con lo que el mercado demanda hoy. El gap de skills crece cada día.",
    },
    {
        icon: FlaskConical,
        title: "Burnout",
        desc: "Estás fundido. No es solo cansancio: es una señal de que necesitás un cambio estructural en tu vida.",
    },
    {
        icon: Briefcase,
        title: "Pérdida Laboral",
        desc: "Te desvincularon o tu puesto desapareció. La incertidumbre financiera y emocional te paraliza.",
    },
    {
        icon: Users,
        title: "Confusión Vocacional",
        desc: "Sabés que querés un cambio, pero no tenés claro hacia dónde ni cómo dar el primer paso con seguridad.",
    },
    {
        icon: AlertTriangle,
        title: "Techo Profesional",
        desc: "Sentís que ya no tenés espacio para crecer en tu rol actual. Necesitás nuevos desafíos que te motiven.",
    },
]

export function ProblemSection() {
    return (
        <SectionContainer id="problema" className="bg-white/5 border-t border-white/10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h2 className="text-sm font-semibold tracking-wide text-blue-400 uppercase">
                    Empatía Profunda
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold text-white">
                    Si te sentís identificado, <span className="text-gray-400">no estás solo.</span>
                </h3>
                <p className="text-lg text-gray-400">
                    Millones de profesionales enfrentan estos desafíos hoy. El problema no sos vos.
                    El problema es no tener un sistema para resolverlo.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {problems.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-6 group-hover:bg-blue-500/20 transition-colors">
                            <item.icon className="h-6 w-6 text-blue-400" />
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-white">{item.title}</h4>
                        <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </SectionContainer>
    )
}
