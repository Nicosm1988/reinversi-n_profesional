"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

const services = [
    {
        title: "Diagnóstico",
        price: "Gratuito",
        desc: "Punto de partida.",
        features: ["Test de 15 minutos", "Informe preliminar IA", "Identificación de brechas"],
        cta: "Comenzar Ahora",
        highlight: false,
        href: "#diagnostico"
    },
    {
        title: "Pack Triage",
        price: "$150 USD",
        desc: "Claridad inmediata.",
        features: ["Sesión 1:1 con Coach (60m)", "Análisis profundo de perfil", "Mapa de ruta personalizado"],
        cta: "Agendar Sesión",
        highlight: false,
        href: "#contacto"
    },
    {
        title: "Reinvención Total",
        price: "$850 USD",
        desc: "Transformación completa.",
        features: [
            "Todo lo del Pack Triage",
            "Branding (CV, LinkedIn, Pitch)",
            "4 Sesiones de Coaching",
            "Simulacros de entrevista",
            "Acceso a red de contactos"
        ],
        cta: "Aplicar al Programa",
        highlight: true,
        href: "#contacto"
    }
];

export function ServicesSection() {
    return (
        <section id="servicios" className="py-24 bg-background relative border-t border-border/50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold font-heading mb-4"
                    >
                        Inversión Transparente
                    </motion.h2>
                    <p className="text-lg text-muted-foreground">
                        Sin costos ocultos ni compromisos a largo plazo obligatorios. Pagas por el valor que necesitas en cada etapa.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {services.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex"
                        >
                            <Card
                                className={`flex flex-col w-full relative ${plan.highlight ? 'border-primary shadow-xl ring-2 ring-primary/10' : ''}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                        Más Elegido
                                    </div>
                                )}

                                <CardHeader>
                                    <h3 className="text-lg font-medium font-heading">{plan.title}</h3>
                                    <div className="mt-2 flex items-baseline gap-x-2">
                                        <span className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</span>
                                        <span className="text-sm font-semibold leading-6 text-muted-foreground">/ único</span>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.desc}</p>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <ul role="list" className="space-y-3 text-sm leading-6 text-muted-foreground">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex gap-x-3">
                                                <Check className="h-5 w-5 flex-none text-secondary" aria-hidden="true" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        variant={plan.highlight ? "default" : "outline"}
                                        asChild
                                    >
                                        <Link href={plan.href}>{plan.cta}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
