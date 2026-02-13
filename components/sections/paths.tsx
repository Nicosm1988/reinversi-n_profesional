"use client";

import { motion } from "framer-motion";
import { Rocket, Target, Briefcase, RefreshCw, LayoutGrid } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const paths = [
    {
        icon: Rocket,
        title: "Reempleo Acelerado",
        desc: "Optimización quirúrgica de tu perfil para volver al mercado en tiempo récord.",
        badge: "Fast Track",
        variant: "default" as const
    },
    {
        icon: RefreshCw,
        title: "Re-skilling Guiado",
        desc: "Identificación de brechas tecnológicas y plan de aprendizaje curado por expertos.",
        badge: "Update",
        variant: "secondary" as const
    },
    {
        icon: Target,
        title: "Reposicionamiento Senior",
        desc: "Para líderes que buscan roles de impacto (C-Level, Advisory) y necesitan nueva narrativa.",
        badge: "Executive",
        variant: "default" as const
    },
    {
        icon: LayoutGrid,
        title: "Cambio Total (Pivot)",
        desc: "Diseño de una nueva carrera desde cero, aprovechando tus skills transferibles.",
        badge: "Transform",
        variant: "outline" as const
    },
    {
        icon: Briefcase,
        title: "Emprendimiento",
        desc: "Validación de ideas de negocio y transición de empleado a fundador con bajo riesgo.",
        badge: "Venture",
        variant: "secondary" as const
    },
];

export function PathsSection() {
    return (
        <section id="caminos" className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="mb-12 text-center md:text-left">
                    <span className="text-secondary font-bold tracking-wide uppercase text-sm">Tu Futuro</span>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mt-2 font-heading"
                    >
                        5 Caminos Posibles. <br />
                        <span className="text-muted-foreground">Una Sola Decisión: Empezar.</span>
                    </motion.h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {paths.map((path, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="h-full group hover:shadow-xl transition-all duration-300 relative border-border/60">
                                <div className="absolute top-4 right-4">
                                    <Badge variant={path.variant}>{path.badge}</Badge>
                                </div>

                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                        <path.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">
                                        {path.title}
                                    </h3>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {path.desc}
                                    </p>
                                </CardContent>

                                <CardFooter className="mt-auto">
                                    <Button variant="link" className="px-0 group-hover:translate-x-1 transition-transform" asChild>
                                        <Link href="#contacto">Ver detalles &rarr;</Link>
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
