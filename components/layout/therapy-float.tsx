"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const DISMISSED_KEY = "reinvencion_therapy_float_dismissed";

export function TherapyFloat() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const dismissed = sessionStorage.getItem(DISMISSED_KEY);
        if (!dismissed) {
            // Show after a short delay for better UX
            const timer = setTimeout(() => setVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setVisible(false);
        sessionStorage.setItem(DISMISSED_KEY, "true");
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 80, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 80, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    className="fixed bottom-6 left-6 z-50 max-w-sm"
                >
                    <div className="bg-background border border-border rounded-2xl shadow-2xl p-5 relative">
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                            <Heart className="w-5 h-5 text-primary" />
                        </div>

                        {/* Content */}
                        <h4 className="font-heading font-semibold text-foreground text-sm mb-2 pr-6">
                            ¿Buscas un proceso de cambio?
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            Si pensás que lo que necesitás es un espacio terapéutico, conecta con una psicóloga de ReinvenciónPro hoy y <strong className="text-foreground">comienza terapia</strong> desde donde estés. <strong className="text-foreground">100% online.</strong>
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                className="rounded-full px-5 h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                                asChild
                            >
                                <Link href="/terapia">Iniciar terapia</Link>
                            </Button>
                            <button
                                onClick={handleClose}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
