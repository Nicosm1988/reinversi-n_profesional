"use client"

import { Button } from "@/components/ui/button"
import { SectionContainer } from "@/components/ui/section-container"
import { motion } from "framer-motion"
import { ArrowRight, Brain } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
    return (
        <SectionContainer className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300"
                >
                    <Brain className="mr-2 h-4 w-4" />
                    Plataforma Humano + IA
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white"
                >
                    No estás perdido. <br />
                    <span className="text-gradient">Estás en transición.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-[600px] text-gray-400 text-lg md:text-xl leading-relaxed"
                >
                    Convertimos la incertidumbre en dirección estratégica. Un sistema integral de
                    reinvención profesional que combina inteligencia artificial con acompañamiento
                    humano experto.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Button size="lg" className="bg-[#16A34A] hover:bg-[#15803d] text-white h-12 px-8 text-base">
                        <Link href="#diagnostico" className="flex items-center">
                            Hacé tu diagnóstico gratuito
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="glass" size="lg" className="h-12 px-8 text-base">
                        <Link href="#metodo">Conocé el método</Link>
                    </Button>
                </motion.div>
            </div>

            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px]" />
            </div>
        </SectionContainer>
    )
}
