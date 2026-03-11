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

                <div className="container mx-auto px-4 md:px-12 relative z-10 flex flex-col items-center">

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
                                                        className="h-14 px-8 text-base w-full sm:w-auto rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors font-semibold"
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

                {/* Decorative illustration */}
                <div className="flex justify-center mt-8 lg:mt-0 lg:absolute lg:bottom-0 lg:right-8 xl:right-16 z-0 opacity-80 pointer-events-none">
                    <Image
                        src="/illustrations/hero.png"
                        alt="Ilustración de reinvención profesional"
                        width={340}
                        height={255}
                        className="object-contain drop-shadow-lg"
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
