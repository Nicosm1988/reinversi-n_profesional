"use client";

import { motion } from "framer-motion";
import { CheckCircle2, User, Bot } from "lucide-react";

export function MethodSection() {
    const steps = [
        {
            title: "1. Diagnóstico Híbrido",
            desc: "Evaluamos tu perfil con IA para hard skills y entrevista humana para motivaciones profundas.",
            icon: Bot
        },
        {
            title: "2. Mapa de Brechas",
            desc: "Identificamos exactamente qué skills te faltan para tu rol objetivo.",
            icon: User
        },
        {
            title: "3. Branding Estratégico",
            desc: "Reescribimos tu narrativa. No es mentir, es traducir tu valor al lenguaje actual.",
            icon: User
        },
        {
            title: "4. Go-to-Market",
            desc: "Estrategia de networking y aplicación. Dónde buscar y cómo contactar.",
            icon: User
        },
        {
            title: "5. Simulación de Pitch",
            desc: "Entrenamos tu entrevista hasta que te sientas invencible.",
            icon: User
        }
    ];

    return (
        <section id="metodo" className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <span className="text-secondary font-bold tracking-widest uppercase text-xs">Nuestra Metodología</span>
                    <h2 className="text-3xl md:text-5xl font-heading font-bold mt-3 mb-6">
                        Ingeniería de Reinvención
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Dejamos el "echale ganas" de lado. Esto es un proceso estructurado, medible y repetible.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2 h-full z-0" />

                    <div className="space-y-12 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`flex flex-col md:flex-row items-start ${i % 2 === 0 ? 'md:flex-row-reverse' : ''} gap-8`}
                            >
                                <div className="flex-1 md:text-right hidden md:block">
                                    {i % 2 === 0 && (
                                        <div className="pr-12">
                                            <h3 className="text-xl font-bold font-heading mb-2">{step.title}</h3>
                                            <p className="text-muted-foreground">{step.desc}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="relative flex-none">
                                    <div className="h-14 w-14 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg z-20 relative">
                                        <span className="font-heading font-bold text-primary text-lg">{i + 1}</span>
                                    </div>
                                </div>

                                <div className="flex-1 pl-4 md:pl-0">
                                    <div className={`md:px-12 ${i % 2 !== 0 ? '' : 'md:hidden'}`}>
                                        <h3 className="text-xl font-bold font-heading mb-2">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.desc}</p>
                                    </div>
                                    {/* Desktop Right Content */}
                                    {i % 2 !== 0 && (
                                        <div className="hidden md:block pl-12">
                                            <h3 className="text-xl font-bold font-heading mb-2">{step.title}</h3>
                                            <p className="text-muted-foreground">{step.desc}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
