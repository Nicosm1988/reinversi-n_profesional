"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function TherapyFloat() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 40, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 40, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="fixed bottom-6 left-6 z-50"
                >
                    <Link
                        href="/terapia"
                        className="group flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground pl-4 pr-5 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                        style={{
                            boxShadow: "0 4px 20px rgba(45, 51, 64, 0.25), 0 2px 8px rgba(45, 51, 64, 0.15)",
                        }}
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
                            Iniciar terapia
                        </span>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
