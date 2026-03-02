"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function TherapyFloat() {
    const [visible, setVisible] = useState(false);
    const [bubbleOpen, setBubbleOpen] = useState(false);
    const bubbleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Close bubble on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (bubbleRef.current && !bubbleRef.current.contains(event.target as Node)) {
                setBubbleOpen(false);
            }
        }
        if (bubbleOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [bubbleOpen]);

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed bottom-6 left-6 z-50" ref={bubbleRef}>

                    {/* ═══ Bubble popup ═══ */}
                    <AnimatePresence>
                        {bubbleOpen && (
                            <motion.div
                                initial={{ y: 16, opacity: 0, scale: 0.9 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: 16, opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                className="absolute bottom-16 left-0 w-72 sm:w-80 bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden"
                                style={{
                                    boxShadow: "0 12px 40px rgba(45, 51, 64, 0.18), 0 4px 16px rgba(45, 51, 64, 0.08)",
                                }}
                            >
                                {/* Header */}
                                <div className="bg-primary px-5 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-secondary fill-secondary" />
                                        <span className="text-sm font-semibold text-primary-foreground">Terapia Online</span>
                                    </div>
                                    <button
                                        onClick={() => setBubbleOpen(false)}
                                        className="text-primary-foreground/60 hover:text-primary-foreground transition-colors p-0.5"
                                        aria-label="Cerrar"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <p className="text-sm text-foreground font-medium leading-relaxed">
                                        A veces el cambio necesita un espacio más profundo.
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Conectá con un psicólogo especializado. Sesiones individuales,
                                        100% online, desde donde estés.
                                    </p>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
                                            Sesiones de 45 a 60 minutos
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
                                            Desde USD 39 por sesión
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
                                            Confidencialidad garantizada
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="px-5 pb-5">
                                    <Link
                                        href="/terapia"
                                        className="flex items-center justify-center gap-2 w-full rounded-full bg-secondary text-secondary-foreground py-2.5 text-sm font-semibold hover:bg-secondary/90 transition-colors"
                                        onClick={() => setBubbleOpen(false)}
                                    >
                                        Conocer más <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                {/* Bubble tail/arrow */}
                                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-card border-r border-b border-border/60 rotate-45"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ═══ Float button ═══ */}
                    <motion.div
                        initial={{ y: 40, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    >
                        <button
                            onClick={() => setBubbleOpen(!bubbleOpen)}
                            className="group flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground pl-4 pr-5 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                            style={{
                                boxShadow: "0 4px 20px rgba(45, 51, 64, 0.25), 0 2px 8px rgba(45, 51, 64, 0.15)",
                            }}
                            aria-label="Información sobre terapia"
                        >
                            {/* Animated heart icon */}
                            <motion.span
                                animate={{
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    ease: "easeInOut",
                                }}
                                className="flex items-center justify-center"
                            >
                                <Heart className="w-[18px] h-[18px] fill-current" />
                            </motion.span>

                            {/* Text */}
                            <span className="text-sm font-semibold whitespace-nowrap">
                                {bubbleOpen ? "Cerrar" : "Iniciar terapia"}
                            </span>
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
