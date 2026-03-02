"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
    { name: "El Método", href: "#metodo" },
    { name: "Caminos", href: "#caminos" },
];

const serviceLinks = [
    { name: "Orientación Vocacional", href: "/orientacion-vocacional" },
    { name: "Inglés Profesional", href: "/servicios/ingles-profesional" },
    { name: "Terapia", href: "/terapia" },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setServicesOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
            <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between relative">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 z-10">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-base">
                        R
                    </div>
                    <span className="font-heading font-bold text-lg hidden sm:block">Reinvención.Pro</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1.5 pl-3 shadow-soft">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-3.5 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Services Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setServicesOpen(!servicesOpen)}
                                className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                            >
                                Servicios <ChevronDown className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                            </button>

                            {servicesOpen && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-lg py-2 z-50">
                                    {serviceLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="block px-4 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-muted transition-colors"
                                            onClick={() => setServicesOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/diagnostico/ancla-de-carrera"
                            className="inline-flex h-10 items-center rounded-full bg-transparent px-6 text-sm font-semibold text-foreground/70 transition-colors hover:bg-secondary hover:text-secondary-foreground"
                        >
                            Hacer Diagnóstico
                        </Link>
                    </nav>
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:flex items-center gap-3">
                    <Button size="sm" variant="ghost" className="text-sm" asChild>
                        <Link href="/login">Ingresar</Link>
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-card border-t border-border p-6 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="block text-foreground/70 hover:text-primary py-2 font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="border-t border-border pt-4 mt-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Servicios</p>
                        {serviceLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block text-foreground/70 hover:text-primary py-2 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                        <Button className="w-full rounded-full" asChild>
                            <Link href="/diagnostico/ancla-de-carrera">Hacer Diagnóstico</Link>
                        </Button>
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/login">Ingresar</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
