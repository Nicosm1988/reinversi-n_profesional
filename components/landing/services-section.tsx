"use client"

import { Button } from "@/components/ui/button"
import { SectionContainer } from "@/components/ui/section-container"
import { Check } from "lucide-react"
import Link from "next/link"

const services = [
    {
        title: "Diagnóstico Express",
        price: "Gratis",
        desc: "El primer paso obligatorio. Entendé dónde estás parado.",
        features: [
            "Test de perfil (15 min)",
            "Informe base automatizado",
            "Puntaje de empleabilidad",
        ],
        cta: "Comenzar Ahora",
        href: "#diagnostico",
        variant: "ghost" as const,
    },
    {
        title: "Plan Estratégico",
        price: "$85.000",
        period: "/mes",
        desc: "Acompañamiento híbrido para definir y ejecutar tu cambio.",
        features: [
            "Todo lo de Diagnóstico",
            "2 sesiones con Coach (45 min)",
            "Optimización LinkedIn SEO",
            "Revisión de CV con ATS",
            "Acceso a portal de empleos",
        ],
        cta: "Agendar Entrevista",
        href: "#contacto",
        primary: true,
    },
    {
        title: "Transformación Total",
        price: "$150.000",
        period: "/mes",
        desc: "Programa intensivo con soporte psicológico y branding.",
        features: [
            "Todo lo de Plan Estratégico",
            "Sesiones de Psicología Laboral",
            "Simulacros de entrevista",
            "Branding Personal Completo",
            "Soporte directo por WhatsApp",
        ],
        cta: "Consultar Cupos",
        href: "#contacto",
        variant: "default" as const,
    },
]

export function ServicesSection() {
    return (
        <SectionContainer id="servicios" className="border-t border-white/10 bg-[#0B1221]">
            <div className="text-center mb-16">
                <h2 className="text-sm font-semibold tracking-wide text-blue-400 uppercase">
                    Inversión en vos
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold text-white mt-2">
                    Modelos de Acompañamiento
                </h3>
                <p className="mt-4 text-gray-400">
                    Precios transparentes y orientativos. Sin contratos ocultos.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                {services.map((service, i) => (
                    <div
                        key={i}
                        className={`relative flex flex-col rounded-2xl p-8 border ${service.primary
                                ? "bg-blue-600/10 border-blue-500/50 shadow-2xl shadow-blue-900/20"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }`}
                    >
                        {service.primary && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                MÁS ELEGIDO
                            </div>
                        )}

                        <div className="mb-8">
                            <h4 className="text-xl font-bold text-white mb-2">{service.title}</h4>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{service.price}</span>
                                {service.period && (
                                    <span className="text-sm text-gray-400">{service.period}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mt-4 leading-relaxed">{service.desc}</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {service.features.map((feature, j) => (
                                <li key={j} className="flex items-start text-sm text-gray-300">
                                    <Check className="h-4 w-4 text-green-400 mr-3 mt-0.5 shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button
                            className={`w-full ${service.primary ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                            variant={service.primary ? 'premium' : service.variant}
                        >
                            <Link href={service.href}>{service.cta}</Link>
                        </Button>
                    </div>
                ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-12">
                * Precios orientativos en ARS, sujetos a modificación. Consultar valores vigentes.
            </p>
        </SectionContainer>
    )
}
