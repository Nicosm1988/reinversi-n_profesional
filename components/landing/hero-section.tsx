import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-32 lg:pb-40">
            {/* Background Gradient */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.1),transparent)] opacity-40"
            />

            <div className="container px-4 md:px-6 mx-auto text-center relative z-10">

                {/* Badge / Pill */}
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                    Nueva Era de Reinvención Profesional
                </div>

                {/* Headline */}
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl mb-6 max-w-4xl mx-auto leading-[1.1]">
                    No estás perdido. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Estás en transición.
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
                    Transformamos la incertidumbre en dirección estratégica mediante un sistema híbrido que combina inteligencia artificial y expertos humanos.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <Button size="lg" className="h-12 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all hover:scale-105" asChild>
                        <Link href="#diagnostico">
                            Hacé tu diagnóstico gratuito <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-gray-200 hover:bg-gray-50 text-gray-700" asChild>
                        <Link href="#metodo">
                            Conocé el método
                        </Link>
                    </Button>
                </div>

                {/* Social Proof / Trust Indicators */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Método Híbrido (IA + Humano)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Privacidad Garantizada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Resultados Medibles</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
