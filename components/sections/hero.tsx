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
        title: <>En un mundo que cambia, <br className="hidden lg:block" />te ayudamos a encontrar <span className="italic text-secondary">tu rumbo</span>.</>,
        description: "La inteligencia artificial transformó el mercado laboral. Es normal sentir incertidumbre. Te acompañamos a descubrir tu próximo paso profesional con claridad, contención y una metodología probada.",
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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

                            {/* Floating Badge 1: Terapia */}
                            <div className="absolute -top-6 -right-4 lg:-right-8 z-20 bg-background text-foreground px-4 py-3 rounded-2xl rounded-br-sm border-2 border-black shadow-neo-sm transform rotate-3 animate-pulse duration-[3000ms] flex items-center gap-2">
                                <span className="bg-green-100 text-green-700 p-1.5 rounded-full">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                </span>
                                <span className="font-semibold text-sm">Terapia</span>
                            </div>

                            {/* Floating Badge 2: Inglés */}
                            <div className="absolute top-1/2 -left-4 lg:-left-10 z-20 bg-background text-foreground px-4 py-3 rounded-2xl rounded-bl-sm border-2 border-black shadow-neo-sm transform -rotate-3 hover:scale-105 transition-transform flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-full">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                                </span>
                                <span className="font-semibold text-sm">Inglés para trabajar</span>
                            </div>

                            {/* Floating Badge 3: CV & LinkedIn */}
                            <div className="absolute -bottom-6 right-8 z-20 bg-background text-foreground px-4 py-3 rounded-2xl rounded-tl-sm border-2 border-black shadow-neo-sm transform rotate-2 hover:scale-105 transition-transform flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-700 p-1.5 rounded-full">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 18H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2h-1"/><circle cx="16" cy="18" r="4"/><path d="m22 22-2-2"/></svg>
                                </span>
                                <span className="font-semibold text-sm">Mejora de tu CV</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
