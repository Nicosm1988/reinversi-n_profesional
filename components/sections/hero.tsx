"use client";

import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { SlideUp } from "@/components/motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
    {
        title: <>¿Y si dejar de luchar <br className="hidden lg:block" />fuera el <span className="italic text-secondary">primer paso</span>?</>,
        description: "Entendemos tu burnout. Transformamos la incertidumbre laboral en un espacio seguro de exploración personal, acompañándote a dar el siguiente gran salto como un acto de evolución estratégica.",
        primaryAction: { label: "Quiero mi diagnóstico", href: "/diagnostico/ancla-de-carrera" },
        secondaryAction: { label: "Conocer Método", href: "#metodo" },
        // A simple abstract shape/gradient placeholder for the image to maintain the premium feel
        visual: (
            <div className="w-full h-full min-h-[300px] lg:min-h-[500px] rounded-2xl bg-gradient-to-br from-primary-foreground/10 to-transparent border border-primary-foreground/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-50 blur-2xl top-0 right-0" />
                <Text variant="body" className="text-primary-foreground/40 italic z-10">Exploración Profesional</Text>
            </div>
        )
    },
    {
        title: <>Diseñemos juntos tu <br className="hidden lg:block" /><span className="italic text-secondary">próximo capítulo</span>.</>,
        description: "Descomponemos el desafío de la reinvención en pasos claros y predecibles. Escuchamos, diseñamos y acompañamos tu transición de forma contenida y sin juicios.",
        primaryAction: { label: "Agendar mi primera sesión", href: "/contacto" },
        secondaryAction: { label: "Ver Servicios", href: "#servicios" },
        visual: (
            <div className="w-full h-full min-h-[300px] lg:min-h-[500px] rounded-2xl bg-gradient-to-bl from-primary-foreground/10 to-transparent border border-primary-foreground/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-[140%] h-[140%] bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#D7EA62]/10 via-transparent to-transparent opacity-50 blur-2xl bottom-0 left-0" />
                <Text variant="body" className="text-primary-foreground/40 italic z-10">Metodología Ágil</Text>
            </div>
        )
    }
];

const logos = ["MercadoLibre", "Globant", "Nubank", "Google", "Amazon"];

export function HeroSection() {
    return (
        <section className="relative w-full pt-20">
            {/* Dark background container for the Carousel */}
            <div className="bg-primary text-primary-foreground py-16 lg:py-32 relative overflow-hidden">
                {/* Subtle texture over primary bg */}
                <div className="absolute inset-0 z-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-overlay"></div>

                <div className="container mx-auto px-4 md:px-6 md:px-12 relative z-10 flex flex-col items-center">

                    <Carousel
                        opts={{
                            loop: true,
                            align: "start",
                        }}
                        className="w-full max-w-4xl text-center"
                    >
                        <CarouselContent>
                            {slides.map((slide, index) => (
                                <CarouselItem key={index}>
                                    <div className="flex flex-col items-center justify-center pt-8 pb-12">

                                        <div className="flex flex-col items-center space-y-8">
                                            <SlideUp delay={0.1}>
                                                <Heading level="h1" className="text-primary-foreground text-4xl sm:text-5xl lg:text-7xl leading-[1.1] max-w-3xl mx-auto">
                                                    {slide.title}
                                                </Heading>
                                            </SlideUp>

                                            <SlideUp delay={0.2}>
                                                <Text variant="lead" className="text-primary-foreground/80 max-w-2xl mx-auto">
                                                    {slide.description}
                                                </Text>
                                            </SlideUp>

                                            <SlideUp delay={0.3}>
                                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                                    <Button
                                                        size="lg"
                                                        className="h-14 px-8 text-base w-full sm:w-auto rounded-full bg-[#D7EA62] text-[#142B55] hover:bg-[#CADD58] transition-colors font-semibold"
                                                        asChild
                                                    >
                                                        <Link href={slide.primaryAction.href}>
                                                            {slide.primaryAction.label} <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        className="h-14 px-8 text-base w-full sm:w-auto rounded-full bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
                                                        asChild
                                                    >
                                                        <Link href={slide.secondaryAction.href}>
                                                            {slide.secondaryAction.label}
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </SlideUp>
                                        </div>

                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Custom position for arrows to match the wide feeling */}
                        <div className="hidden lg:block">
                            <CarouselPrevious className="absolute -left-12 xl:-left-32 top-1/2 -translate-y-1/2 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground h-12 w-12" />
                            <CarouselNext className="absolute -right-12 xl:-right-32 top-1/2 -translate-y-1/2 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground h-12 w-12" />
                        </div>
                    </Carousel>

                </div>
            </div>

            {/* Bottom Logo Strip */}
            <div className="bg-background border-b border-border py-8 lg:py-10">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-6">
                        <Text variant="caption" className="text-muted-foreground uppercase tracking-widest font-semibold text-xs">
                            Hablaron de nosotros en...
                        </Text>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale mix-blend-multiply">
                        {logos.map((company) => (
                            <span key={company} className="text-xl md:text-2xl font-bold font-heading text-foreground">{company}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
