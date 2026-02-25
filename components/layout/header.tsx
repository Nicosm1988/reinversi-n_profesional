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
                    : 'bg-transparent py-4'
            )}
        >
            <div className="container relative px-4 md:px-6 mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 z-50">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                        R
                    </div>
                    <span className="font-heading font-bold text-lg tracking-tight">Reinvención<span className="text-secondary">.Pro</span></span>
                </Link>

                {/* Desktop Nav Capsule - Centered */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1.5 pl-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        <Link
                            href="/diagnostico/ancla-de-carrera"
                            className="inline-flex h-10 items-center rounded-full bg-transparent px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#D7EA62] hover:text-[#142B55]"
                        >
                            Hacer Diagnóstico
                        </Link>
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-5 z-50">
                    <Link
                        href="/login"
                        className="hidden lg:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Ingresar
                    </Link>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden p-2 text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center space-y-8 animate-fade-in-up lg:hidden">
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
                            <Button className="w-full h-12 text-lg shadow-md" onClick={() => setIsMobileMenuOpen(false)} asChild>
                                <Link href="/diagnostico/ancla-de-carrera">Hacer Diagnóstico</Link>
                            </Button>
                            <Button variant="outline" className="w-full h-12 text-lg" onClick={() => setIsMobileMenuOpen(false)} asChild>
                                <Link href="/login">Ingresar a mi cuenta</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
