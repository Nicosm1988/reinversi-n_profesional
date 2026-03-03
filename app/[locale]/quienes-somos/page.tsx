"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Compass, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const values = [
    {
        icon: Heart,
        title: "Calidez humana",
        desc: "Cada persona que llega a nosotros trae una historia única. La escuchamos con empatía, sin juicios, y construimos desde ahí.",
    },
    {
        icon: Brain,
        title: "Rigor profesional",
        desc: "Usamos herramientas psicométricas validadas, metodología estructurada e inteligencia artificial como complemento — nunca como reemplazo del criterio humano.",
    },
    {
        icon: Compass,
        title: "Claridad ante todo",
        desc: "No vendemos ilusiones. Te ayudamos a ver tu situación con honestidad para que puedas tomar decisiones informadas y estratégicas.",
    },
    {
        icon: Users,
        title: "Acompañamiento real",
        desc: "No sos un número. Cada proceso es personal, a tu ritmo, con profesionales dedicados que caminan a tu lado durante toda la transición.",
    },
];

export default function QuienesSomosPage() {
    return (
        <div className="flex flex-col bg-background">

            {/* ═══ Hero ═══ */}
            <section className="relative bg-primary text-primary-foreground py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent pointer-events-none" />
                <Container>
                    <FadeIn className="max-w-2xl mx-auto text-center relative z-10">
                        <Heading level="h1" className="text-primary-foreground text-4xl sm:text-5xl lg:text-6xl mb-6">
                            Quiénes somos
                        </Heading>
                        <Text variant="lead" className="text-primary-foreground/80 max-w-xl mx-auto">
                            Un equipo multidisciplinario que cree en las personas y en su capacidad
                            de reinventarse — a cualquier edad y en cualquier momento.
                        </Text>
                    </FadeIn>
                </Container>
            </section>

            {/* ═══ Mission ═══ */}
            <Section spacing="lg">
                <Container size="sm">
                    <FadeIn className="text-center">
                        <Heading level="h2" className="mb-6">Nuestra misión</Heading>
                        <Text variant="body-lg" className="max-w-2xl mx-auto">
                            Reinvención.Pro nació para darle a las personas un espacio donde pensar
                            su futuro profesional con calma, claridad y acompañamiento experto. En
                            un mundo donde la inteligencia artificial transformó las reglas del
                            mercado laboral, creemos que el autoconocimiento y la estrategia son las
                            mejores herramientas para encontrar tu lugar.
                        </Text>
                    </FadeIn>
                </Container>
            </Section>

            {/* ═══ What we do ═══ */}
            <Section spacing="lg" background="muted">
                <Container size="sm">
                    <FadeIn className="text-center mb-12">
                        <Heading level="h2" className="mb-4">Qué hacemos</Heading>
                        <Text variant="lead" className="max-w-xl mx-auto">
                            Combinamos tres pilares para acompañar tu transición profesional.
                        </Text>
                    </FadeIn>

                    <StaggerContainer className="grid md:grid-cols-3 gap-8">
                        <FadeIn>
                            <Card className="h-full bg-background border-none shadow-soft p-8 text-center">
                                <h3 className="text-lg font-heading font-medium text-foreground mb-3">Ciencia psicométrica</h3>
                                <Text className="text-sm">
                                    Diagnósticos vocacionales basados en tests validados que miden personalidad,
                                    intereses, aptitudes y valores.
                                </Text>
                            </Card>
                        </FadeIn>
                        <FadeIn>
                            <Card className="h-full bg-background border-none shadow-soft p-8 text-center">
                                <h3 className="text-lg font-heading font-medium text-foreground mb-3">Acompañamiento humano</h3>
                                <Text className="text-sm">
                                    Profesionales de psicología, RRHH y estrategia de carrera que te escuchan,
                                    te guían y te ayudan a tomar decisiones informadas.
                                </Text>
                            </Card>
                        </FadeIn>
                        <FadeIn>
                            <Card className="h-full bg-background border-none shadow-soft p-8 text-center">
                                <h3 className="text-lg font-heading font-medium text-foreground mb-3">Inteligencia artificial</h3>
                                <Text className="text-sm">
                                    Usamos IA como herramienta de apoyo para analizar tendencias, personalizar
                                    recomendaciones y potenciar tu proceso — siempre con supervisión humana.
                                </Text>
                            </Card>
                        </FadeIn>
                    </StaggerContainer>
                </Container>
            </Section>

            {/* ═══ Values ═══ */}
            <Section spacing="lg">
                <Container>
                    <FadeIn className="text-center mb-16">
                        <Heading level="h2" className="mb-4">Nuestros valores</Heading>
                    </FadeIn>

                    <StaggerContainer className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {values.map((v, i) => (
                            <FadeIn key={i}>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                                        <v.icon className="h-6 w-6 text-secondary" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-medium text-foreground mb-2">
                                            {v.title}
                                        </h3>
                                        <Text className="text-sm">{v.desc}</Text>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </StaggerContainer>
                </Container>
            </Section>

            {/* ═══ CTA ═══ */}
            <Section spacing="lg" background="muted">
                <Container size="sm">
                    <FadeIn className="bg-primary rounded-2xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 max-w-xl mx-auto">
                            <Heading level="h2" className="text-primary-foreground mb-6">
                                ¿Listo para encontrar tu rumbo?
                            </Heading>
                            <Text className="text-primary-foreground/80 text-lg mb-10">
                                El primer paso es conocerte. Hacé tu diagnóstico gratuito y empezá
                                a construir tu próximo capítulo profesional.
                            </Text>
                            <Button variant="secondary" size="lg" className="rounded-full px-10 h-14 text-base shadow-lg" asChild>
                                <Link href="/diagnostico/ancla-de-carrera">
                                    Comenzar mi diagnóstico <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </FadeIn>
                </Container>
            </Section>
        </div>
    );
}
