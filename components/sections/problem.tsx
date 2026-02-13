"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrainCircuit, BatteryWarning, History } from "lucide-react";

const problems = [
    {
        id: 1,
        icon: BrainCircuit,
        title: "Parálisis por Análisis",
        desc: "Sientes que hay tantas opciones (IA, remoto, emprender) que el miedo a equivocarte te inmoviliza.",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/10"
    },
    {
        id: 2,
        icon: BatteryWarning,
        title: "Burnout Corporativo",
        desc: "Tu rol actual te consume, pero no ves cómo tus habilidades se transfieren a otro sector sin empezar de cero.",
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/10"
    },
    {
        id: 3,
        icon: History,
        title: "Síndrome del Impostor",
        desc: "El mercado cambió radicalmente. Sientes que tu experiencia de 10+ años vale menos hoy que ayer.",
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/10"
    }
];

export function ProblemSection() {
    return (
        <section className="py-24 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="container px-4 md:px-6 mx-auto">

                <div className="max-w-2xl mx-auto text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-heading font-bold mb-4"
                    >
                        ¿Por qué se siente tan difícil cambiar?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg"
                    >
                        No es falta de capacidad. Es que las reglas del juego carrera cambiaron y nadie te avisó.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {problems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                        >
                            <Card className="h-full border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
