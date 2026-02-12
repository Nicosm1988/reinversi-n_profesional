"use client"

import { Button } from "@/components/ui/button"
import { SectionContainer } from "@/components/ui/section-container"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
    return (
        <SectionContainer className="py-20 md:py-32">
            <div className="relative rounded-3xl bg-blue-600 overflow-hidden px-6 py-16 sm:px-12 sm:py-24 md:px-16 lg:px-20 text-center">
                {/* Simplified Background */}
                <div className="absolute inset-0 bg-blue-700/50 mix-blend-overlay" />
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl opacity-50" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-400 blur-3xl opacity-50" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                        Tu transición empieza hoy.
                    </h2>
                    <p className="text-lg text-blue-100 max-w-xl mx-auto">
                        Dejá de adivinar cuál es el próximo paso. Tomá el control de tu carrera con una estrategia probada.
                    </p>
                    <div className="flex justify-center">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg font-semibold shadow-xl">
                            <Link href="#diagnostico" className="flex items-center">
                                Hacé tu diagnóstico gratuito
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                    <p className="text-sm text-blue-200 mt-4">
                        Sin tarjeta de crédito. Resultados en 15 minutos.
                    </p>
                </div>
            </div>
        </SectionContainer>
    )
}
