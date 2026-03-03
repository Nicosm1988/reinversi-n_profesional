"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { ArrowRight, Globe, MessageSquare, FileText, Users, Headphones, Presentation } from "lucide-react";
import Link from "next/link";

const benefits = [
    {
        icon: MessageSquare,
        title: "Entrevistas en Inglés",
        desc: "Prepárate para entrevistas laborales en inglés con confianza. Practicamos situaciones reales que vas a encontrar en el mercado global.",
        badge: "Speaking",
    },
    {
        icon: Globe,
        title: "Networking Internacional",
        desc: "Aprende a construir relaciones profesionales en inglés: desde LinkedIn hasta conferencias y reuniones con equipos distribuidos.",
        badge: "Networking",
    },
    {
        icon: FileText,
        title: "Comunicación Ejecutiva",
        desc: "Emails, presentaciones y reportes con vocabulario profesional. Comunica tus ideas con la claridad que tu próximo rol exige.",
        badge: "Writing",
    },
    {
        icon: Users,
        title: "Reuniones y Negociación",
        desc: "Domina las reuniones en inglés: desde small talk hasta negociaciones con stakeholders de distintos países y culturas.",
        badge: "Business",
    },
    {
        icon: Headphones,
        title: "Comprensión Profesional",
        desc: "Entrena tu oído para entender acentos diversos, presentaciones técnicas y podcasts de tu industria sin subtítulos.",
        badge: "Listening",
    },
    {
        icon: Presentation,
        title: "Presentaciones de Alto Impacto",
        desc: "Aprende a estructurar y dar presentaciones en inglés que cautiven a tu audiencia — desde pitch decks hasta town halls.",
        badge: "Presenting",
    },
];

export default function InglesProfesionalPage() {
    return (
        <div className="flex flex-col bg-background">

            {/* ═══ Hero ═══ */}
            <section className="relative bg-primary text-primary-foreground py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
                <Container>
                    <FadeIn className="max-w-2xl mx-auto text-center relative z-10">
                        <span className="text-sm font-medium tracking-widest uppercase text-secondary/80 mb-4 block">
                            Servicio complementario
                        </span>
                        <Heading level="h1" className="text-primary-foreground text-4xl sm:text-5xl lg:text-6xl mb-6">
                            Potencia tu inglés <br className="hidden md:block" />
                            <span className="italic text-secondary">profesional</span>
                        </Heading>
                        <Text variant="lead" className="text-primary-foreground/80 mb-10 max-w-xl mx-auto">
                            En el mercado global de 2026, el inglés es una herramienta esencial para
                            acceder a mejores oportunidades. Te ayudamos a dominarlo con foco en tu
                            realidad profesional.
                        </Text>
                        <Button
                            size="lg"
                            className="rounded-full px-10 h-14 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
                            asChild
                        >
                            <Link href="/contacto">
                                Quiero mejorar mi inglés <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </FadeIn>
                </Container>
            </section>

            {/* ═══ Benefits ═══ */}
            <Section spacing="lg">
                <Container>
                    <FadeIn className="text-center mb-16">
                        <Heading level="h2" className="mb-4">¿Qué vas a aprender?</Heading>
                        <Text variant="lead" className="max-w-xl mx-auto">
                            Módulos diseñados para profesionales que necesitan resultados reales,
                            no gramática abstracta.
                        </Text>
                    </FadeIn>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((item, i) => (
                            <FadeIn key={i}>
                                <Card className="h-full bg-background border shadow-soft hover:shadow-subtle p-8 flex flex-col items-start transition-all duration-300 group hover:-translate-y-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                                            <item.icon className="h-5 w-5 text-secondary" />
                                        </div>
                                        <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 border-none font-medium">
                                            {item.badge}
                                        </Badge>
                                    </div>

                                    <h3 className="text-xl font-heading font-medium text-foreground mb-3 group-hover:text-secondary transition-colors">
                                        {item.title}
                                    </h3>

                                    <Text className="flex-1">
                                        {item.desc}
                                    </Text>
                                </Card>
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
                                Tu inglés profesional, al nivel que tu carrera necesita.
                            </Heading>
                            <Text className="text-primary-foreground/80 text-lg mb-10">
                                Clases individuales y personalizadas. Modalidad 100% online.
                                Enfocadas en tu industria y tus objetivos reales.
                            </Text>
                            <Button variant="secondary" size="lg" className="rounded-full px-10 h-14 text-base shadow-lg" asChild>
                                <Link href="/contacto">
                                    Reservar mi primera clase <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </FadeIn>
                </Container>
            </Section>
        </div>
    );
}
