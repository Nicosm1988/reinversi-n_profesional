"use client"

import { Button } from "@/components/ui/button"
import { SectionContainer } from "@/components/ui/section-container"
import { motion } from "framer-motion"
import { ArrowRight, Compass, Rocket, Briefcase, RefreshCcw, Landmark } from "lucide-react"
import Link from "next/link"

const paths = [
    {
        icon: Rocket,
        title: "Reempleo Acelerado",
        desc: "Para quienes perdieron su trabajo y necesitan volver al mercado YA. Foco en CV, LinkedIn y estrategia de búsqueda.",
    },
    {
        icon: RefreshCcw,
        title: "Re-skilling Guiado",
        desc: "Tu perfil quedó obsoleto. Diseñamos un plan de aprendizaje rápido para actualizarte y ser relevante de nuevo.",
    },
    {
        icon: Landmark,
        title: "Reposicionamiento Senior",
        desc: "Tenés mucha experiencia pero el mercado no te 'lee'. Traducimos tu trayectoria al lenguaje de hoy.",
    },
    {
        icon: Compass,
        title: "Cambio Total",
        desc: "Querés dejar tu industria y saltar a otra (ej. de Abogacía a Tech). Estrategia de pivote de carrera.",
    },
    {
        icon: Briefcase,
        title: "Emprendimiento",
        desc: "Estás listo para salir del mundo corporativo y lanzar tu propio proyecto. Te ayudamos a validar y arrancar.",
    },
]

export function PathsSection() {
    return (
        <SectionContainer id="caminos" className="bg-slate-900 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="max-w-2xl">
                    <h2 className="text-sm font-semibold tracking-wide text-blue-400 uppercase">
                        Tu Hoja de Ruta
                    </h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mt-2">
                        5 Caminos de Reinvención
                    </h3>
                    <p className="mt-4 text-gray-400 text-lg">
                        No hay una sola forma de reinventarse. Identificamos tu situación y activamos
                        el protocolo específico para tu objetivo.
                    </p>
                </div>
                <Button variant="outline" className="shrink-0 text-white border-white/20 hover:bg-white/10">
                    <Link href="#diagnostico">Descubrí tu camino ideal</Link>
                </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paths.map((path, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-default"
                    >
                        <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <path.icon className="h-5 w-5 text-blue-400" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{path.title}</h4>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{path.desc}</p>
                        <div className="flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Ver detalles <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </SectionContainer>
    )
}
