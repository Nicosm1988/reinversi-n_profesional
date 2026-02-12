"use client"

import { SectionContainer } from "@/components/ui/section-container"
import { Star } from "lucide-react"

const testimonials = [
    {
        quote: "Tenía 15 años de experiencia en banca y sentía que el mercado me había soltado la mano. El diagnóstico me mostró que mis skills eran transferibles a Fintech. Hoy lidero un equipo de Ops.",
        author: "Roberto M.",
        role: "Ex-Gerente Bancario → Ops Lead Fintech",
        stars: 5,
    },
    {
        quote: "No es solo que te ayuden con el CV. Es que te estructuran la cabeza. Dejé de tirar currículums a ciegas y empecé a tener conversaciones estratégicas.",
        author: "Ana S.",
        role: "Marketing Manager en Transición",
        stars: 5,
    },
    {
        quote: "Emprender después de los 40 da pánico. Me ayudaron a validar mi idea y armar mi narrativa para vender servicios B2B. El retorno de inversión fue inmediato.",
        author: "Carlos D.",
        role: "Consultor Independiente",
        stars: 5,
    },
]

export function TestimonialsSection() {
    return (
        <SectionContainer className="bg-[#0B1221]">
            <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-sm">
                        <div className="flex gap-1 mb-4 text-yellow-500">
                            {[...Array(t.stars)].map((_, j) => (
                                <Star key={j} className="h-4 w-4 fill-current" />
                            ))}
                        </div>
                        <p className="text-gray-300 italic mb-6">"{t.quote}"</p>
                        <div>
                            <p className="text-white font-bold">{t.author}</p>
                            <p className="text-sm text-gray-500">{t.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </SectionContainer>
    )
}
