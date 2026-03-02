"use client";

import Link from 'next/link';
import { Youtube, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-muted border-t border-border py-16">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

                    {/* Column 1: Inicio */}
                    <div className="space-y-4">
                        <h4 className="font-heading font-bold text-foreground text-lg italic">Inicio</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/quienes-somos" className="hover:text-primary transition-colors">Quiénes somos</Link></li>
                            <li><a href="mailto:contacto@reinvencion.pro" className="hover:text-primary transition-colors">Contacto: contacto@reinvencion.pro</a></li>
                            <li><Link href="/privacidad" className="hover:text-primary transition-colors">Política de privacidad</Link></li>
                            <li><Link href="/terminos" className="hover:text-primary transition-colors">Términos y condiciones</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: Servicios */}
                    <div className="space-y-4">
                        <h4 className="font-heading font-bold text-foreground text-lg italic">Servicios</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/orientacion-vocacional" className="hover:text-primary transition-colors">Orientación Vocacional</Link></li>
                            <li><Link href="/servicios/ingles-profesional" className="hover:text-primary transition-colors">Inglés Profesional</Link></li>
                            <li><Link href="/terapia" className="hover:text-primary transition-colors">Terapia Online</Link></li>
                            <li><Link href="/diagnostico/ancla-de-carrera" className="hover:text-primary transition-colors">Diagnóstico Gratuito</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Newsletter */}
                    <div className="space-y-4">
                        <h4 className="font-heading font-bold text-foreground text-lg italic">Newsletter</h4>
                        <p className="text-sm text-muted-foreground">
                            Pequeños cambios, grandes transformaciones.<br />
                            Dejanos tu correo y recibí contenido estratégico.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                            />
                            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                                Al suscribirte acepto recibir correos electrónicos de Reinvención.Pro, los{" "}
                                <Link href="/terminos" className="underline hover:text-primary">Términos y Condiciones</Link>{" "}
                                y la{" "}
                                <Link href="/privacidad" className="underline hover:text-primary">Política de Privacidad</Link>.
                            </p>
                            <button
                                type="submit"
                                className="rounded-full bg-secondary text-secondary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-secondary/90 transition-colors"
                            >
                                Suscribirme
                            </button>
                        </form>
                    </div>
                </div>

                {/* Social + Copyright */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <a href="#" className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors">
                            <Youtube className="h-4 w-4" />
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors">
                            <Instagram className="h-4 w-4" />
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors">
                            <Linkedin className="h-4 w-4" />
                        </a>
                    </div>
                    <p className="text-xs text-muted-foreground/60">
                        &copy; {new Date().getFullYear()} Reinvención Profesional — All Rights Reserved
                    </p>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-muted/60 rounded-lg text-[10px] text-muted-foreground/70 text-center leading-relaxed max-w-3xl mx-auto">
                    <strong>Aviso Importante:</strong> Nuestro equipo es multidisciplinario e incluye profesionales de distintas especialidades, entre ellas psicología. Este servicio está enfocado en orientación vocacional-profesional y acompañamiento estratégico de carrera, por lo que no reemplaza procesos de psicoterapia clínica ni tratamiento psiquiátrico. Si estás atravesando una crisis de salud mental, te recomendamos contactar a un profesional matriculado o al servicio de emergencia de tu zona.
                </div>
            </div>
        </footer>
    );
}
