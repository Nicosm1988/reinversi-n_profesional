"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "El Método", href: "/#metodo" },
    { name: "Caminos", href: "/#caminos" },
];

const serviceLinks = [
    { name: "Orientación Vocacional", href: "/orientacion-vocacional", desc: "Encontrá tu camino profesional" },
    { name: "Inglés Profesional", href: "/servicios/ingles-profesional", desc: "Potencia tu carrera global" },
    { name: "Terapia Online", href: "/terapia", desc: "Acompañamiento emocional experto" },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll awareness
    useEffect(() => {
        function handleScroll() {
            setScrolled(window.scrollY > 20);
        }
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setServicesOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Hover intent for dropdown (desktop)
    function handleMouseEnter() {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setServicesOpen(true);
    }
    function handleMouseLeave() {
        timeoutRef.current = setTimeout(() => setServicesOpen(false), 200);
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-[0_1px_20px_rgba(0,0,0,0.04)]"
                    : "bg-background/70 backdrop-blur-md border-b border-transparent"
            }`}
        >
            <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between relative">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 z-10 group">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm group-hover:shadow-md transition-shadow duration-300"
                    >
                        R
                    </motion.div>
                    <span className="font-heading font-bold text-lg hidden sm:block text-foreground group-hover:text-primary transition-colors duration-300">
                        Reinvención.Pro
                    </span>
                </Link>

                {/* Desktop Nav — centered pill */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <nav className="flex items-center gap-0.5 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm p-1.5 shadow-soft">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="relative px-4 py-2 text-sm font-medium text-foreground/65 hover:text-foreground transition-colors duration-300 rounded-full group"
                            >
                                <span className="relative z-10">{link.name}</span>
                                {/* Hover bg pill */}
                                <span className="absolute inset-0 rounded-full bg-muted/0 group-hover:bg-muted/80 transition-all duration-300 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100" />
                            </Link>
                        ))}

                        {/* Services Dropdown */}
                        <div
                            className="relative"
                            ref={dropdownRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setServicesOpen(!servicesOpen)}
                                className="relative flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/65 hover:text-foreground transition-colors duration-300 rounded-full group"
                            >
                                <span className="relative z-10 flex items-center gap-1">
                                    Servicios
                                    <motion.span
                                        animate={{ rotate: servicesOpen ? 180 : 0 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                    >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </motion.span>
                                </span>
                                <span className="absolute inset-0 rounded-full bg-muted/0 group-hover:bg-muted/80 transition-all duration-300 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100" />
                            </button>

                            <AnimatePresence>
                                {servicesOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-card rounded-2xl border border-border/60 shadow-xl overflow-hidden"
                                        style={{
                                            boxShadow: "0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
                                        }}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="p-2">
                                            {serviceLinks.map((link) => (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    className="flex flex-col gap-0.5 px-4 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all duration-200 group/item"
                                                    onClick={() => setServicesOpen(false)}
                                                >
                                                    <span className="text-sm font-medium group-hover/item:text-secondary transition-colors duration-200">
                                                        {link.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground group-hover/item:text-muted-foreground/80">
                                                        {link.desc}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="border-t border-border/40 p-2">
                                            <Link
                                                href="/contacto"
                                                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-secondary hover:bg-secondary/5 transition-all duration-200"
                                                onClick={() => setServicesOpen(false)}
                                            >
                                                Contactanos
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-5 bg-border/50 mx-1" />

                        {/* Diagnóstico CTA */}
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href="/diagnostico/ancla-de-carrera"
                                className="inline-flex h-9 items-center rounded-full bg-secondary/10 px-5 text-sm font-semibold text-secondary transition-all duration-300 hover:bg-secondary hover:text-secondary-foreground hover:shadow-md"
                            >
                                Hacer Diagnóstico
                            </Link>
                        </motion.div>
                    </nav>
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button size="sm" variant="ghost" className="text-sm rounded-full hover:bg-muted/60" asChild>
                            <Link href="/login">Ingresar</Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="lg:hidden p-2 text-foreground rounded-lg hover:bg-muted/60 transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Menú"
                >
                    <AnimatePresence mode="wait">
                        {mobileMenuOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Menu className="h-6 w-6" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:hidden bg-card border-t border-border overflow-hidden"
                    >
                        <div className="p-6 space-y-1">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05, duration: 0.3 }}
                                >
                                    <Link
                                        href={link.href}
                                        className="block text-foreground/70 hover:text-foreground py-3 px-3 font-medium rounded-xl hover:bg-muted/50 transition-all"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                className="border-t border-border pt-4 mt-3"
                            >
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 px-3">Servicios</p>
                                {serviceLinks.map((link, i) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                                    >
                                        <Link
                                            href={link.href}
                                            className="block py-3 px-3 rounded-xl hover:bg-muted/50 transition-all"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <span className="block text-foreground/70 hover:text-foreground font-medium">{link.name}</span>
                                            <span className="block text-xs text-muted-foreground mt-0.5">{link.desc}</span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                                className="border-t border-border pt-4 space-y-3"
                            >
                                <Button className="w-full rounded-full h-12 font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
                                    <Link href="/diagnostico/ancla-de-carrera" onClick={() => setMobileMenuOpen(false)}>
                                        Hacer Diagnóstico
                                    </Link>
                                </Button>
                                <Button variant="ghost" className="w-full rounded-full h-12" asChild>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Ingresar</Link>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
