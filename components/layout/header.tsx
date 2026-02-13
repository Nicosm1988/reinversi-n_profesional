'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Header() {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Método', href: '#metodo' },
        { name: 'Servicios', href: '#servicios' },
        { name: 'Caminos', href: '#caminos' },
        { name: 'FAQ', href: '#faq' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent',
                isScrolled
                    ? 'bg-background/80 backdrop-blur-md border-border/40 py-3 shadow-sm'
                    : 'bg-transparent py-5'
            )}
        >
            <div className="container px-4 md:px-6 mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 z-50">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                        R
                    </div>
                    <span className="font-heading font-bold text-lg tracking-tight">Reinvención<span className="text-secondary">.Pro</span></span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop CTAs */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="#contacto">Agendar Llamada</Link>
                    </Button>
                    <Button size="sm" className="rounded-full px-6" asChild>
                        <Link href="#diagnostico">Hacer Diagnóstico</Link>
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden z-50 p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center space-y-8 animate-fade-in-up md:hidden">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-2xl font-heading font-medium text-foreground"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-4 w-full px-12 pt-8">
                            <Button className="w-full h-12 text-lg" onClick={() => setIsMobileMenuOpen(false)} asChild>
                                <Link href="#diagnostico">Hacer Diagnóstico</Link>
                            </Button>
                            <Button variant="outline" className="w-full h-12 text-lg" onClick={() => setIsMobileMenuOpen(false)} asChild>
                                <Link href="#contacto">Agendar Llamada</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
