import Link from 'next/link';
import { Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-muted border-t border-border py-12 lg:py-16">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand & Mission */}
                    <div className="md:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-sm">
                                R
                            </div>
                            <span className="font-heading font-bold text-lg">Reinvención.Pro</span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                            Plataforma de orientación vocacional-profesional. Combinamos ciencia psicométrica, acompañamiento humano experto e inteligencia artificial para guiarte en tu transición profesional.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="text-muted-foreground/60 hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
                            <a href="#" className="text-muted-foreground/60 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-muted-foreground/60 hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-heading font-semibold text-foreground mb-4">Plataforma</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#metodo" className="hover:text-primary">El Método</Link></li>
                            <li><Link href="#servicios" className="hover:text-primary">Servicios y Planes</Link></li>
                            <li><Link href="#faq" className="hover:text-primary">Preguntas Frecuentes</Link></li>
                            <li><Link href="/login" className="hover:text-primary">Área de Clientes</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-heading font-semibold text-foreground mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary">Privacidad</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Términos de Servicio</Link></li>
                            <li><Link href="/cookies" className="hover:text-primary">Política de Cookies</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/60">
                    <p>&copy; {new Date().getFullYear()} Reinvención Profesional. Todos los derechos reservados.</p>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-accent"></span>
                            <span>Sistemas Operativos</span>
                        </div>
                        <a href="mailto:hola@reinvencion.pro" className="hover:text-primary flex items-center gap-1">
                            <Mail className="h-3 w-3" /> contacto@reinvencion.pro
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-muted/60 rounded-lg text-[10px] text-muted-foreground/70 text-center leading-relaxed max-w-3xl mx-auto">
                    <strong>Aviso Importante:</strong> Nuestro equipo es multidisciplinario e incluye profesionales de distintas especialidades, entre ellas psicología. Este servicio está enfocado en orientación vocacional-profesional y acompañamiento estratégico de carrera, por lo que no reemplaza procesos de psicoterapia clínica ni tratamiento psiquiátrico. Si estás atravesando una crisis de salud mental, te recomendamos contactar a un profesional matriculado o al servicio de emergencia de tu zona.
                </div>
            </div>
        </footer>
    );
}

