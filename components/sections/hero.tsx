"use client";

import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { SlideUp } from "@/components/motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
    {
        title: <>Transformá la incertidumbre en <br className="hidden lg:block" /><span className="italic text-secondary">tu motor de cambio</span>.</>,
        description: "Entre el avance de la IA y la sobreoferta laboral, la incertidumbre es la norma. No se trata de esperar a que aclare, sino de aprender a navegar. Te acompañamos a recuperar la claridad sobre tu carrera y a definir tu próximo movimiento profesional con un método que integra tus objetivos con las demandas del mercado actual.",
        primaryAction: { label: "Comenzar mi diagnóstico", href: "/diagnostico/ancla-de-carrera" },
        secondaryAction: { label: "Conocer el Método", href: "#metodo" },
    },
    {
        title: <>Tu experiencia tiene valor. <br className="hidden lg:block" />Hagamos que el mundo <span className="italic text-secondary">lo vea</span>.</>,
        description: "No importa si llevas 5 o 20 años en tu carrera. Diseñamos juntos un plan concreto para que tu próximo paso sea estratégico, no improvisado. Sin juicios, a tu ritmo.",
        primaryAction: { label: "Agendar mi primera sesión", href: "/contacto" },
        secondaryAction: { label: "Ver Servicios", href: "#servicios" },
    }
];

export function HeroSection() {
    return (
        <section className="relative w-full pt-20">
            {/* Dark background container for the Carousel */}
            <div className="bg-primary text-primary-foreground py-16 lg:py-32 relative overflow-hidden">
                {/* Subtle warm texture overlay */}
                <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-overlay"></div>

                <div className="container mx-auto px-4 md:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        {/* Left Column: Carousel */}
                        <Carousel
                            opts={{
                                loop: true,
                                align: "start",
                            }}
                            className="w-full text-center lg:text-left"
                        >
                            <CarouselContent>
                                {slides.map((slide, index) => (
                                    <CarouselItem key={index}>
                                        <div className="flex flex-col items-center lg:items-start pt-8 pb-12 space-y-8">
                                            <SlideUp delay={0.1}>
                                                <Heading level="h1" className="text-primary-foreground text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] max-w-2xl mx-auto lg:mx-0">
                                                    {slide.title}
                                                </Heading>
                                            </SlideUp>

                                            <SlideUp delay={0.2}>
                                                <Text variant="lead" className="text-primary-foreground/80 max-w-xl mx-auto lg:mx-0">
                                                    {slide.description}
                                                </Text>
                                            </SlideUp>

                                            <SlideUp delay={0.3}>
                                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 w-full">
                                                    <Button
                                                        size="lg"
                                                        className="h-14 px-8 text-base w-full sm:w-auto rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors font-semibold shadow-neo hover:shadow-neo-hover"
                                                        asChild
                                                    >
                                                        <Link href={slide.primaryAction.href}>
                                                            {slide.primaryAction.label} <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        className="h-14 px-8 text-base w-full sm:w-auto rounded-full bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground transition-colors"
                                                        asChild
                                                    >
                                                        <Link href={slide.secondaryAction.href}>
                                                            {slide.secondaryAction.label}
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </SlideUp>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>

                            <div className="hidden lg:block">
                                <CarouselPrevious className="absolute -left-12 xl:-left-16 top-1/2 -translate-y-1/2 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground h-12 w-12" />
                            </div>
                        </Carousel>

                        {/* Right Column: Bubble Image and Floating Badges */}
                        <div className="relative flex justify-center items-center opacity-90 mt-8 lg:mt-0">
                            {/* Main Bubble Image Container */}
                            <div className="relative z-10 bg-primary-foreground/5 p-4 rounded-tl-[4rem] rounded-tr-[4rem] rounded-br-[4rem] rounded-bl-[1rem] border-2 border-primary-foreground/10 shadow-lg backdrop-blur-sm">
                                <Image
                                    src="/illustrations/hero.png"
                                    alt="Ilustración de reinvención profesional"
                                    width={460}
                                    height={345}
                                    className="object-contain drop-shadow-lg rounded-tl-[3rem] rounded-tr-[3rem] rounded-br-[3rem] rounded-bl-lg"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
