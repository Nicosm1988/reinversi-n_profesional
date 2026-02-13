"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, TrendingUp, Briefcase } from "lucide-react";

const stats = [
    { label: "Profesionales Ayudados", value: "500+", icon: User },
    { label: "Aumento Salarial Promedio", value: "35%", icon: TrendingUp },
    { label: "Empresas Target Alcanzadas", value: "92%", icon: Briefcase },
];

const testimonials = [
    {
        quote: "Creí que mi edad era un limitante. El diagnóstico me mostró que mi experiencia es mi mayor activo si sé venderla. Hoy lidero un equipo en una Fintech.",
        author: "Carlos M.",
        role: "Ex-Banca Tradicional -> VP de Operaciones",
    },
    {
        quote: "Estaba quemada y sin rumbo. El método híbrido me dio la claridad que 3 años de terapia no lograron. En 6 semanas tenía 3 ofertas sobre la mesa.",
        author: "Sofia L.",
        role: "Marketing Manager -> Product Owner",
    },
    {
        quote: "La inversión se pagó sola con mi bono de firma. Lo que más valoro es que no me dieron frases motivacionales, sino una estrategia militar.",
        author: "Javier R.",
        role: "Ingeniero -> Consultor Estratégico",
    }
];

export function TrustSection() {
    return (
        <section className="py-24 bg-slate-50 border-y border-slate-200">
            <div className="container px-4 md:px-6 mx-auto">

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-6 bg-background rounded-2xl shadow-sm border border-border/50"
                        >
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="text-4xl font-bold font-heading text-foreground mb-2">{stat.value}</div>
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-heading">Historias Reales</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 + 0.3 }}
                        >
                            <Card className="h-full bg-background border-border shadow-sm hover:shadow-md transition-all">
                                <CardContent className="pt-6 flex flex-col h-full">
                                    <div className="mb-4 text-primary">
                                        <svg className="h-8 w-8 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14.017 21L14.017 18C14.017 16.896 14.321 16.062 14.929 15.5C15.537 14.938 16.5 14.605 17.821 14.5C18.064 13.568 18.261 12.657 18.393 11.83C18.525 11.004 18.525 10.158 18.25 9.17C17.974 8.182 17.382 7.276 16.476 6.5C15.57 5.724 14.428 5.334 13.05 5.334C11.672 5.334 10.53 5.724 9.624 6.5C8.718 7.276 8.126 8.182 7.85 9.17C7.574 10.158 7.574 11.004 7.706 11.83C7.838 12.657 8.035 13.568 8.278 14.5C9.599 14.605 10.562 14.938 11.17 15.5C11.778 16.062 12.082 16.896 12.082 18L12.082 21L7.082 21C7.082 19 7 17 7.5 15C8 13 9 11 11 10C10 9 9.5 8 9.5 7C9.5 6 10 5 11 5C12 5 12.5 6 12.5 7C12.5 8 13.5 9 14.5 9C15.5 9.5 16 11 15.5 13C15 15 14.5 17 14.017 19.5L14.017 21Z" />
                                        </svg>
                                    </div>
                                    <p className="text-muted-foreground italic mb-6 flex-1 text-lg leading-relaxed">
                                        "{t.quote}"
                                    </p>
                                    <div>
                                        <div className="font-bold text-foreground font-heading">{t.author}</div>
                                        <div className="text-xs text-primary font-medium">{t.role}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
