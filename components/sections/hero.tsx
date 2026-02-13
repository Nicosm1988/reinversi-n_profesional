"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-32 pb-16 md:pt-48 md:pb-32 bg-background">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full z-0 pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-sm text-secondary-foreground mb-8 backdrop-blur-sm"
                >
                    <span className="flex h-2 w-2 rounded-full bg-secondary mr-2"></span>
                    <span className="font-medium text-xs md:text-sm tracking-wide">Nueva Arquitectura de Carrera &bull; 2025</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold tracking-tight text-foreground max-w-4xl mx-auto mb-6 leading-[1.1]"
                >
                    No estás perdido. <br className="hidden md:block" />
                    Estás en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">transición estratégica</span>.
                </motion.h1>

                {/* Subhead */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Transformamos la incertidumbre profesional en un plan de acción quirúrgico.
                    La primera plataforma híbrida que combina <strong>Inteligencia Artificial</strong> y <strong>Expertos Humanos</strong>.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto shadow-lg shadow-primary/20" asChild>
                        <Link href="#diagnostico">
                            Diagnóstico Gratuito <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto" asChild>
                        <Link href="#metodo">
                            Ver el Método
                        </Link>
                    </Button>
                </motion.div>

                {/* Trust Bar (Social Proof) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="pt-8 border-t border-border/40 max-w-3xl mx-auto"
                >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
                        Profesionales reinventados de empresas como
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos, using text for now to avoid broken images */}
                        {["MercadoLibre", "Globant", "Nubank", "Google", "Amazon"].map((company) => (
                            <span key={company} className="text-sm font-bold text-foreground font-heading">{company}</span>
                        ))}
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
